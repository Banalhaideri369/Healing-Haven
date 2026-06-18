import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { getStripeClient } from "../lib/stripeClient";

const router: IRouter = Router();

/** Telegram channel URL — only returned to paying customers, never sent to frontend in code */
const TELEGRAM_URL =
  process.env["TELEGRAM_WORKSHOP_URL"] ?? "https://t.me/+Luy1BC1WsokxNGVl";

/** POST /api/checkout/session — create a Stripe Checkout session and return the redirect URL */
router.post("/checkout/session", async (req, res) => {
  try {
    const stripe = await getStripeClient();

    const domains = process.env["REPLIT_DOMAINS"]?.split(",") ?? [];
    const host = domains[0] ?? req.get("host") ?? "localhost";
    const baseUrl = `https://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 15000,
            product_data: {
              name: "ورشة الاستقبال والوفرة — Abundance Reception Workshop",
              description:
                "Recorded workshop: break free from receiving resistance, elevate worthiness, open abundance pathways.",
              images: [`${baseUrl}/workshop-cover.jpg`],
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#products`,
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Checkout session creation failed");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/** GET /api/checkout/verify?session_id=... — verify payment and return Telegram URL */
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
        productName: "ورشة الاستقبال والوفرة",
      });
    } else {
      res
        .status(402)
        .json({ success: false, error: "Payment not completed", status: session.payment_status });
    }
  } catch (err) {
    logger.error({ err }, "Checkout session verification failed");
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

export default router;
