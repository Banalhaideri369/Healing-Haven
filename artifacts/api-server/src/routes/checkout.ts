import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { getStripeClient } from "../lib/stripeClient";

const router: IRouter = Router();

const TELEGRAM_URL =
  process.env["TELEGRAM_WORKSHOP_URL"] ?? "https://t.me/+Luy1BC1WsokxNGVl";

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
  let items: CheckoutItem[];
  if (Array.isArray(body.items) && body.items.length > 0) {
    items = body.items;
  } else if (body.title && typeof body.price === "number" && body.price > 0) {
    items = [{ title: body.title, price: body.price, image: body.image, description: body.description }];
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
        const unitAmount = Math.round(item.price * 100);
        const imageUrl =
          item.image
            ? item.image.startsWith("http")
              ? item.image
              : `${baseUrl}${item.image}`
            : undefined;

        return {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: item.title,
              ...(item.description ? { description: item.description } : {}),
              ...(imageUrl ? { images: [imageUrl] } : {}),
            },
          },
          quantity: 1,
        };
      }),
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#products`,
    });
    res.json({ url: session.url });
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
      res.json({
        success: true,
        telegramUrl: TELEGRAM_URL,
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
