import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../lib/adminAuth";

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

// ── User: get my bookings (requires any valid Firebase auth) ──────────────────
router.get("/bookings/mine", requireAuth as any, async (req: any, res) => {
  const email = (req.userEmail as string) ?? "";
  try {
    const rows = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.userEmail, email))
      .orderBy(desc(bookingsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /bookings/mine");
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

// ── Admin: delete a booking ───────────────────────────────────────────────────
router.delete("/admin/bookings/:id", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  try {
    await db.delete(bookingsTable).where(eq(bookingsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /admin/bookings/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: update booking payment status ──────────────────────────────────────
router.patch("/admin/bookings/:id/status", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const { paymentStatus } = req.body as { paymentStatus?: string };
  const allowed = ["pending", "paid", "demo_paid"];
  if (!paymentStatus || !allowed.includes(paymentStatus)) {
    res.status(400).json({ error: "paymentStatus must be one of: pending, paid, demo_paid" });
    return;
  }
  try {
    const rows = await db
      .update(bookingsTable)
      .set({ paymentStatus })
      .where(eq(bookingsTable.id, id))
      .returning();
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "PATCH /admin/bookings/:id/status");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
