import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { sendPushToAll } from "./push";

const router: IRouter = Router();

interface BookingNotifyBody {
  userName?: string;
  userEmail?: string;
  userWhatsapp?: string;
  issueDescription?: string;
  courseName?: string;
  courseType?: string;
  selectedDate?: string;
  selectedTime?: string;
  totalPrice?: string;
}

async function sendWhatsAppNotification(message: string): Promise<void> {
  const phone = process.env["CALLMEBOT_PHONE"];
  const apikey = process.env["CALLMEBOT_APIKEY"];
  if (!phone || !apikey) {
    logger.info("WhatsApp not configured — skipping (set CALLMEBOT_PHONE + CALLMEBOT_APIKEY to enable)");
    return;
  }
  const encoded = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&apikey=${apikey}&text=${encoded}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CallMeBot responded with HTTP ${res.status}`);
  }
}

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "ban.alhaideri369@gmail.com";

/** POST /api/notify/booking — email + push notification for a new booking */
router.post("/notify/booking", async (req, res) => {
  const body = req.body as BookingNotifyBody;

  const {
    userName = "—",
    userEmail = "—",
    userWhatsapp = "—",
    issueDescription = "—",
    courseName = "—",
    courseType = "—",
    selectedDate = "—",
    selectedTime = "—",
    totalPrice = "—",
  } = body;

  logger.info(
    { userName, userEmail, userWhatsapp, courseName, courseType, selectedDate, selectedTime },
    "New booking received",
  );

  // ── Email via Nodemailer (Gmail) ──────────────────────────────────────────────
  const gmailUser = process.env["GMAIL_SENDER_EMAIL"];
  const gmailPass = process.env["GMAIL_APP_PASSWORD"];

  if (gmailUser && gmailPass) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;background:#0f0a12;color:#e5e0d8;border:1px solid rgba(212,175,55,0.3)">
          <h2 style="color:#d4af37;margin-bottom:4px;">🌟 New Booking — Ban Al-Haidari</h2>
          <p style="color:#888;font-size:13px;margin-top:0">${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
          <hr style="border-color:rgba(212,175,55,0.15);margin:16px 0"/>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            ${[
              ["Name", userName],
              ["Email", userEmail],
              ["WhatsApp", userWhatsapp],
              ["Course", `${courseName} (${courseType})`],
              ["Date", selectedDate],
              ["Time", selectedTime],
              ["Situation", issueDescription],
            ]
              .map(
                ([k, v]) =>
                  `<tr>
                    <td style="padding:8px 0;color:#d4af37;width:120px;vertical-align:top;font-weight:600;">${k}</td>
                    <td style="padding:8px 0;color:#e5e0d8;">${v}</td>
                  </tr>`,
              )
              .join("")}
          </table>
          <hr style="border-color:rgba(212,175,55,0.15);margin:16px 0"/>
          <p style="font-size:12px;color:#555;margin:0;">Ban Al-Haidari Platform — Automated Alert</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"Ban Al-Haidari Platform" <${gmailUser}>`,
        to: ADMIN_EMAIL,
        subject: `📅 New Booking: ${courseName} — ${userName}`,
        html,
      });

      logger.info({ to: ADMIN_EMAIL }, "Booking email sent");
    } catch (err) {
      logger.warn({ err }, "Failed to send booking email — check GMAIL_SENDER_EMAIL / GMAIL_APP_PASSWORD");
    }
  } else {
    logger.info("Email not configured — skipping (set GMAIL_SENDER_EMAIL + GMAIL_APP_PASSWORD to enable)");
  }

  // ── Web Push Notification ─────────────────────────────────────────────────────
  const adminUrl = process.env["FRONTEND_URL"]
    ? `${process.env["FRONTEND_URL"].replace(/\/$/, "")}/admin`
    : "/admin";

  try {
    await sendPushToAll({
      title: "📅 New Booking!",
      body: `${userName} — ${courseName}`,
      tag: "new-booking",
      url: adminUrl,
    });
    logger.info("Push notifications sent");
  } catch (err) {
    logger.warn({ err }, "Failed to send push notifications");
  }

  // ── WhatsApp via CallMeBot ────────────────────────────────────────────────────
  try {
    const message =
      `🔔 حجز جديد عبر الموقع! الاسم: ${userName}, الإيميل: ${userEmail}, واتساب العميل: ${userWhatsapp}, الكورس: ${courseName}, التاريخ: ${selectedDate}, الوقت: ${selectedTime}, الإجمالي: ${totalPrice}`;
    await sendWhatsAppNotification(message);
    logger.info("WhatsApp notification sent via CallMeBot");
  } catch (err) {
    logger.warn({ err }, "Failed to send WhatsApp notification");
  }

  res.json({ success: true });
});

export default router;
