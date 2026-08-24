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
  requiresScheduling?: boolean;
}

router.post("/checkout/session", async (req, res) => {
  const body = req.body as {
    items?: CheckoutItem[];
    courseId?: string;
    courseType?: "online" | "recorded";
    title?: string;
    price?: number;
    image?: string;
    description?: string;
    requiresScheduling?: boolean;
  };

  try {
    // A session booking supplies its course ID so the server can use the
    // current database price rather than trusting a client-modified amount.
    let items: CheckoutItem[];
    let requiresScheduling = body.requiresScheduling === true;
    if (body.courseId && body.courseType === "online") {
      const courses = await db
        .select()
        .from(onlineCoursesTable)
        .where(eq(onlineCoursesTable.id, body.courseId))
        .limit(1);
      const course = courses[0];
      if (!course) {
        res.status(404).json({ error: "Session not found." });
        return;
      }
      if (course.status === "unavailable") {
        res.status(409).json({ error: "Session is currently unavailable." });
        return;
      }
      items = [{
        title: course.title,
        price: Number(course.price),
        image: course.image,
        description: course.description,
        requiresScheduling: true,
      }];
      requiresScheduling = true;
    } else if (Array.isArray(body.items) && body.items.length > 0) {
      items = body.items.map((i) => ({ ...i, price: Number(i.price) }));
      requiresScheduling = requiresScheduling || items.some((item) => item.requiresScheduling === true);
    } else if (body.title && Number(body.price) > 0) {
      items = [{ title: body.title, price: Number(body.price), image: body.image, description: body.description }];
    } else {
      res.status(400).json({ error: "Product information required: title and price must be provided." });
      return;
    }

    const baseUrl = getBaseUrl(req);
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
      metadata: {
        requiresScheduling: requiresScheduling ? "true" : "false",
        productName: items.length === 1 ? items[0].title : "Ban Al-Haidari purchase",
      },
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
        requiresScheduling: session.metadata?.["requiresScheduling"] === "true",
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
