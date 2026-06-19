import { Router } from "express";
import { db, heroBannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

// Public: list all banners ordered by sortOrder
router.get("/banners", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(heroBannersTable)
      .orderBy(asc(heroBannersTable.sortOrder), asc(heroBannersTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /banners");
    res.status(500).json({ error: "Internal error" });
  }
});

// Admin: create banner
router.post("/admin/banners", requireAdmin, async (req, res) => {
  const b = req.body as { image?: string; title?: string; status?: string; linkedCourseId?: string | null; sortOrder?: number };
  if (!b.title?.trim()) {
    res.status(400).json({ error: "title required" });
    return;
  }
  try {
    const rows = await db
      .insert(heroBannersTable)
      .values({
        image: b.image ?? "",
        title: b.title.trim(),
        status: b.status === "available" ? "available" : "coming_soon",
        linkedCourseId: b.linkedCourseId ?? null,
        sortOrder: b.sortOrder ?? 0,
      })
      .returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "POST /admin/banners");
    res.status(500).json({ error: "Internal error" });
  }
});

// Admin: update banner
router.patch("/admin/banners/:id", requireAdmin, async (req, res) => {
  const b = req.body as { image?: string; title?: string; status?: string; linkedCourseId?: string | null; sortOrder?: number };
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (b.image !== undefined) update.image = b.image;
  if (b.title !== undefined) update.title = b.title;
  if (b.status !== undefined) update.status = b.status;
  if ("linkedCourseId" in b) update.linkedCourseId = b.linkedCourseId ?? null;
  if (b.sortOrder !== undefined) update.sortOrder = b.sortOrder;

  try {
    const rows = await db
      .update(heroBannersTable)
      .set(update)
      .where(eq(heroBannersTable.id, String(req.params.id)))
      .returning();
    if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "PATCH /admin/banners/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

// Admin: delete banner
router.delete("/admin/banners/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(heroBannersTable).where(eq(heroBannersTable.id, String(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /admin/banners/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
