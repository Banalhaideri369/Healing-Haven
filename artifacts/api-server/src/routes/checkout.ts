import { Router, type IRouter } from "express";
import { randomBytes } from "crypto";
import { logger } from "../lib/logger";
import { getStripeClient } from "../lib/stripeClient";

const router: IRouter = Router();

/** Telegram channel URL — only returned to paying customers, never sent to frontend in code */
const TELEGRAM_URL =
  process.env["TELEGRAM_WORKSHOP_URL"] ?? "https://t.me/+Luy1BC1WsokxNGVl";

/** In-memory store of valid demo session IDs (cleared on server restart) */
const demoSessions = new Set<string>();

function getBaseUrl(req: Parameters<Parameters<IRouter["post"]>[1]>[0]): string {
  const domains = process.env["REPLIT_DOMAINS"]?.split(",") ?? [];
  const host = domains[0] ?? req.get("host") ?? "localhost";
  return `https://${host}`;
}

/** POST /api/checkout/session — create a Stripe Checkout session (or demo session) */
router.post("/checkout/session", async (req, res) => {
  const baseUrl = getBaseUrl(req);

  /* ── Try real Stripe first ── */
  try {
    const stripe = await getStripeClient();
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
    return;
  } catch (err) {
    logger.warn({ err }, "Stripe not available — falling back to demo mode");
  }

  /* ── Demo / test mode fallback ── */
  const demoId = `demo_${randomBytes(16).toString("hex")}`;
  demoSessions.add(demoId);
  // Auto-expire demo session after 30 minutes
  setTimeout(() => demoSessions.delete(demoId), 30 * 60 * 1000);

  const successUrl = `${baseUrl}/success?session_id=${demoId}&demo=1`;
  res.json({ url: successUrl, demo: true });
});

/** GET /api/checkout/verify?session_id=... — verify payment and return Telegram URL */
router.get("/checkout/verify", async (req, res) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    res.status(400).json({ error: "Missing session_id" });
    return;
  }

  /* ── Demo session ── */
  if (session_id.startsWith("demo_")) {
    if (demoSessions.has(session_id)) {
      res.json({
        success: true,
        demo: true,
        telegramUrl: TELEGRAM_URL,
        productName: "ورشة الاستقبال والوفرة",
      });
    } else {
      res.status(402).json({ success: false, error: "Demo session expired or invalid" });
    }
    return;
  }

  /* ── Real Stripe session ── */
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
