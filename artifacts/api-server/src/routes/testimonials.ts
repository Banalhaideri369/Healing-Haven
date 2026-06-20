import { Router, type IRouter } from "express";
import { db, clientTestimonialsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

/** GET /api/testimonials — public, only enabled */
router.get("/testimonials", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(clientTestimonialsTable)
      .where(eq(clientTestimonialsTable.enabled, true))
      .orderBy(desc(clientTestimonialsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /testimonials");
    res.status(500).json({ error: "Internal error" });
  }
});

/** GET /api/admin/testimonials — admin, all including disabled */
router.get("/admin/testimonials", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(clientTestimonialsTable)
      .orderBy(desc(clientTestimonialsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /admin/testimonials");
    res.status(500).json({ error: "Internal error" });
  }
});

/** POST /api/admin/testimonials — create */
router.post("/admin/testimonials", requireAdmin, async (req, res) => {
  const { clientName, content, rating } = req.body as {
    clientName?: string;
    content?: string;
    rating?: number;
  };
  if (!content?.trim()) {
    res.status(400).json({ error: "content is required" });
    return;
  }
  try {
    const rows = await db
      .insert(clientTestimonialsTable)
      .values({
        clientName: clientName?.trim() ?? "",
        content: content.trim(),
        rating: typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : 5,
        enabled: true,
      })
      .returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "POST /admin/testimonials");
    res.status(500).json({ error: "Internal error" });
  }
});

/** PATCH /api/admin/testimonials/:id — update content/name/rating/enabled */
router.patch("/admin/testimonials/:id", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const { clientName, content, rating, enabled } = req.body as {
    clientName?: string;
    content?: string;
    rating?: number;
    enabled?: boolean;
  };
  try {
    const rows = await db
      .update(clientTestimonialsTable)
      .set({
        ...(clientName !== undefined ? { clientName: clientName.trim() } : {}),
        ...(content !== undefined ? { content: content.trim() } : {}),
        ...(rating !== undefined ? { rating: Math.min(5, Math.max(1, rating)) } : {}),
        ...(enabled !== undefined ? { enabled } : {}),
      })
      .where(eq(clientTestimonialsTable.id, id))
      .returning();
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "PATCH /admin/testimonials/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

/** DELETE /api/admin/testimonials/:id — remove */
router.delete("/admin/testimonials/:id", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  try {
    await db.delete(clientTestimonialsTable).where(eq(clientTestimonialsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /admin/testimonials/:id");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
