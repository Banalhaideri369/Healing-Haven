import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

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
}

const ADMIN_EMAIL = "ban.alhaideri369@gmail.com";

/** POST /api/notify/booking — send email notification for a new booking */
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
  } = body;

  // Log booking details server-side regardless
  logger.info(
    { userName, userEmail, userWhatsapp, courseName, courseType, selectedDate, selectedTime },
    "New booking received",
  );

  // ── Optional: send email via nodemailer ──────────────────────────────────────
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
          <h2 style="color:#d4af37;margin-bottom:4px;">New Booking — Ban Al-Haidari</h2>
          <p style="color:#888;font-size:13px;margin-top:0">${new Date().toLocaleString()}</p>
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
                    <td style="padding:8px 0;color:#d4af37;width:120px;vertical-align:top;">${k}</td>
                    <td style="padding:8px 0;color:#e5e0d8;">${v}</td>
                  </tr>`,
              )
              .join("")}
          </table>
        </div>
      `;

      await transporter.sendMail({
        from: `"Ban Al-Haidari Platform" <${gmailUser}>`,
        to: ADMIN_EMAIL,
        subject: `📅 New Booking: ${courseName} — ${userName}`,
        html,
      });

      logger.info({ to: ADMIN_EMAIL }, "Booking notification email sent");
    } catch (err) {
      logger.warn({ err }, "Failed to send booking email — check GMAIL_SENDER_EMAIL / GMAIL_APP_PASSWORD");
    }
  } else {
    logger.info("Email not configured (GMAIL_SENDER_EMAIL / GMAIL_APP_PASSWORD not set) — skipping email");
  }

  // Always return success to not block the user's booking flow
  res.json({ success: true });
});

export default router;
