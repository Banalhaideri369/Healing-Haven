import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { getStripeClient } from "../lib/stripeClient";
import { db, bookingsTable, onlineCoursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();


function getBaseUrl(req: Parameters<Parameters<IRouter["post"]>[1]>[0]): string {
  if (process.env["FRONTEND_URL"]) {
    return process.env["FRONTEND_URL"].replace(/\/$/, "");
  }
  const host = req.get("host") ?? "localhost";
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  return `${proto}://${host}`;
}

interface CheckoutItem {
  title: string;
  price: number;
  image?: string;
  description?: string;
}

router.post("/checkout/session", async (req, res) => {
  const body = req.body as {
    items?: CheckoutItem[];
    title?: string;
    price?: number;
    image?: string;
    description?: string;
  };

  // Resolve items array — either multi-item cart or single product
  // Coerce price to number — DB/frontend may send it as a string
  let items: CheckoutItem[];
  if (Array.isArray(body.items) && body.items.length > 0) {
    items = body.items.map((i) => ({ ...i, price: Number(i.price) }));
  } else if (body.title && Number(body.price) > 0) {
    items = [{ title: body.title, price: Number(body.price), image: body.image, description: body.description }];
  } else {
    res.status(400).json({ error: "Product information required: title and price must be provided." });
    return;
  }

  const baseUrl = getBaseUrl(req);

  try {
    const stripe = await getStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => {
        const unitAmount = Math.round(Number(item.price) * 100);

        // Never pass images to Stripe — stored images may be base64 or exceed the 2048-char URL limit
        return {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: item.title,
              ...(item.description ? { description: item.description } : {}),
            },
          },
          quantity: 1,
        };
      }),
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#products`,
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    logger.error({ err }, "Stripe checkout session creation failed");
    res.status(500).json({ error: "Payment service unavailable. Please try again later." });
  }
});

router.get("/checkout/verify", async (req, res) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    res.status(400).json({ error: "Missing session_id" });
    return;
  }

  try {
    const stripe = await getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Try to resolve the Telegram link from the matching online-course booking.
      // Returns empty string when no course-specific link is set so the frontend
      // can show a "your instructor will contact you" message instead.
      let telegramUrl = "";
      try {
        const bookings = await db
          .select()
          .from(bookingsTable)
          .where(eq(bookingsTable.paymentSessionId, session_id))
          .limit(1);
        const booking = bookings[0];
        if (booking?.courseType === "online" && booking.courseId) {
          const courses = await db
            .select({ telegramLink: onlineCoursesTable.telegramLink })
            .from(onlineCoursesTable)
            .where(eq(onlineCoursesTable.id, booking.courseId))
            .limit(1);
          const link = courses[0]?.telegramLink;
          if (link) telegramUrl = link;
        }
      } catch (lookupErr) {
        logger.warn({ lookupErr }, "Could not resolve course telegram link");
      }

      res.json({
        success: true,
        telegramUrl,
        productName: session.metadata?.["productName"] ?? "",
      });
    } else {
      res.status(402).json({
        success: false,
        error: "Payment not completed",
        status: session.payment_status,
      });
    }
  } catch (err) {
    logger.error({ err }, "Checkout session verification failed");
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

export default router;
