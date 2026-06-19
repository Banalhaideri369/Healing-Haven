import { Router, type IRouter } from "express";
import webPush from "web-push";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

const VAPID_PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"] ?? "";
const VAPID_PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"] ?? "";
const VAPID_EMAIL = process.env["VAPID_EMAIL"] ?? "mailto:admin@ban-al-haidari.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/** GET /api/push/vapid-public-key — return public VAPID key to frontend */
router.get("/push/vapid-public-key", (_req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    res.status(503).json({ error: "Push not configured" });
    return;
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

/** POST /api/admin/push/subscribe — save push subscription */
router.post("/admin/push/subscribe", requireAdmin, async (req, res) => {
  const { endpoint, keys } = req.body as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "endpoint, keys.p256dh, keys.auth required" });
    return;
  }

  try {
    await db
      .insert(pushSubscriptionsTable)
      .values({ endpoint, p256dh: keys.p256dh, auth: keys.auth })
      .onConflictDoUpdate({
        target: pushSubscriptionsTable.endpoint,
        set: { p256dh: keys.p256dh, auth: keys.auth },
      });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "POST /admin/push/subscribe");
    res.status(500).json({ error: "Internal error" });
  }
});

/** POST /api/admin/push/unsubscribe — remove a subscription */
router.post("/admin/push/unsubscribe", requireAdmin, async (req, res) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) { res.status(400).json({ error: "endpoint required" }); return; }
  try {
    await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, endpoint));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "POST /admin/push/unsubscribe");
    res.status(500).json({ error: "Internal error" });
  }
});

/** Utility — send push to all stored subscriptions */
export async function sendPushToAll(payload: {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  let subs: { endpoint: string; p256dh: string; auth: string }[];
  try {
    subs = await db.select().from(pushSubscriptionsTable);
  } catch {
    return;
  }

  const msg = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          msg,
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await db
            .delete(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
        }
      }
    }),
  );
}

export default router;
