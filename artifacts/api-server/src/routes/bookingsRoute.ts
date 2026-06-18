import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

// ── Public: create booking (called after successful payment) ──────────────────
router.post("/bookings", async (req, res) => {
  const b = req.body as {
    courseId?: string; courseTitle?: string; courseType?: string;
    userName?: string; userEmail?: string; userWhatsapp?: string;
    issueDescription?: string; selectedDate?: string; selectedTime?: string;
    paymentStatus?: string; paymentSessionId?: string;
  };
  if (!b.courseId || !b.userName || !b.userEmail) {
    res.status(400).json({ error: "courseId, userName, userEmail required" });
    return;
  }
  try {
    const rows = await db
      .insert(bookingsTable)
      .values({
        courseId: b.courseId,
        courseTitle: b.courseTitle ?? "",
        courseType: b.courseType ?? "online",
        userName: b.userName,
        userEmail: b.userEmail,
        userWhatsapp: b.userWhatsapp ?? "",
        issueDescription: b.issueDescription ?? "",
        selectedDate: b.selectedDate ?? null,
        selectedTime: b.selectedTime ?? null,
        paymentStatus: b.paymentStatus ?? "pending",
        paymentSessionId: b.paymentSessionId ?? null,
      })
      .returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "POST /bookings");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: list all bookings ──────────────────────────────────────────────────
router.get("/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /admin/bookings");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
