import { Router } from "express";
import { db, recordedCoursesTable, onlineCoursesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

// ── Public: list all recorded courses ────────────────────────────────────────
router.get("/courses/recorded", async (req, res) => {
  try {
    const rows = await db.select().from(recordedCoursesTable).orderBy(desc(recordedCoursesTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /courses/recorded");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Public: list all online courses ──────────────────────────────────────────
router.get("/courses/online", async (req, res) => {
  try {
    const rows = await db.select().from(onlineCoursesTable).orderBy(desc(onlineCoursesTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /courses/online");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Public: get single online course (for booking page) ───────────────────────
router.get("/courses/online/:id", async (req, res) => {
  try {
    const rows = await db.select().from(onlineCoursesTable).where(eq(onlineCoursesTable.id, String(req.params.id)));
    if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "GET /courses/online/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: create recorded course ─────────────────────────────────────────────
router.post("/admin/courses/recorded", requireAdmin, async (req, res) => {
  const b = req.body as {
    title?: string; description?: string; image?: string; telegramLink?: string;
    price?: number; discountEnabled?: boolean; discountPercent?: number;
  };
  if (!b.title?.trim()) { res.status(400).json({ error: "title required" }); return; }
  try {
    const rows = await db
      .insert(recordedCoursesTable)
      .values({
        title: b.title.trim(),
        description: b.description ?? "",
        image: b.image ?? "",
        telegramLink: b.telegramLink ?? "",
        price: b.price ?? 0,
        discountEnabled: b.discountEnabled ?? false,
        discountPercent: b.discountPercent ?? 0,
      })
      .returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "POST /admin/courses/recorded");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: update recorded course ─────────────────────────────────────────────
router.patch("/admin/courses/recorded/:id", requireAdmin, async (req, res) => {
  const b = req.body as {
    title?: string; description?: string; image?: string;
    telegramLink?: string; price?: number;
    discountEnabled?: boolean; discountPercent?: number;
  };
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (b.title !== undefined) updateData.title = b.title;
  if (b.description !== undefined) updateData.description = b.description;
  if (b.image !== undefined) updateData.image = b.image;
  if (b.telegramLink !== undefined) updateData.telegramLink = b.telegramLink;
  if (b.price !== undefined) updateData.price = b.price;
  if (b.discountEnabled !== undefined) updateData.discountEnabled = b.discountEnabled;
  if (b.discountPercent !== undefined) updateData.discountPercent = b.discountPercent;

  try {
    const rows = await db
      .update(recordedCoursesTable)
      .set(updateData)
      .where(eq(recordedCoursesTable.id, String(req.params.id)))
      .returning();
    if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "PATCH /admin/courses/recorded/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: delete recorded course ─────────────────────────────────────────────
router.delete("/admin/courses/recorded/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(recordedCoursesTable).where(eq(recordedCoursesTable.id, String(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /admin/courses/recorded/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: seed default workshop (if collection is empty) ─────────────────────
router.post("/admin/courses/seed", requireAdmin, async (req, res) => {
  try {
    const existing = await db.select({ id: recordedCoursesTable.id }).from(recordedCoursesTable).limit(1);
    if (existing.length > 0) { res.json({ seeded: false }); return; }
    await db.insert(recordedCoursesTable).values({
      title: "ورشة البيع والوفرة",
      description:
        "ورشة متكاملة تأخذك في رحلة عميقة للتحرر من الأنماط المحدودة حول المال والبيع، وتعيشين في تدفق الوفرة الحقيقية. تعلمي كيف تفتحين طاقة الاستقبال وتحولين علاقتك بالبيع من خوف إلى قوة.",
      image: "/workshop-cover.jpg",
      telegramLink: "https://t.me/+Luy1BC1WsokxNGVl",
      price: 150,
      discountEnabled: false,
      discountPercent: 0,
    });
    res.status(201).json({ seeded: true });
  } catch (err) {
    req.log.error({ err }, "POST /admin/courses/seed");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: create online course ───────────────────────────────────────────────
router.post("/admin/courses/online", requireAdmin, async (req, res) => {
  const b = req.body as {
    title?: string; description?: string; image?: string;
    price?: number; status?: string; availability?: unknown;
  };
  if (!b.title?.trim()) { res.status(400).json({ error: "title required" }); return; }
  try {
    const rows = await db
      .insert(onlineCoursesTable)
      .values({
        title: b.title.trim(),
        description: b.description ?? "",
        image: b.image ?? "",
        price: b.price ?? 0,
        status: b.status ?? "available",
        availability: (b.availability ?? {}) as Record<string, unknown>,
      })
      .returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "POST /admin/courses/online");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: update online course (status, availability, price, etc.) ───────────
router.patch("/admin/courses/online/:id", requireAdmin, async (req, res) => {
  const b = req.body as {
    status?: string; availability?: unknown; price?: number;
    title?: string; description?: string; image?: string;
  };
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (b.status !== undefined) updateData.status = b.status;
  if (b.availability !== undefined) updateData.availability = b.availability;
  if (b.price !== undefined) updateData.price = b.price;
  if (b.title !== undefined) updateData.title = b.title;
  if (b.description !== undefined) updateData.description = b.description;
  if (b.image !== undefined) updateData.image = b.image;

  try {
    const rows = await db
      .update(onlineCoursesTable)
      .set(updateData)
      .where(eq(onlineCoursesTable.id, String(req.params.id)))
      .returning();
    if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "PATCH /admin/courses/online/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── Admin: delete online course ───────────────────────────────────────────────
router.delete("/admin/courses/online/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(onlineCoursesTable).where(eq(onlineCoursesTable.id, String(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /admin/courses/online/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
