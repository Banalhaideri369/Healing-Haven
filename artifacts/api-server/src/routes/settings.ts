import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

// Public: get all settings as a key → value map
router.get("/settings", async (req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const result: Record<string, string> = {};
    for (const row of rows) result[row.key] = row.value;
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "GET /settings");
    res.status(500).json({ error: "Internal error" });
  }
});

// Admin: upsert a setting by key
router.put("/admin/settings/:key", requireAdmin, async (req, res) => {
  const key = String(req.params.key);
  const { value } = req.body as { value?: string };
  if (typeof value !== "string") {
    res.status(400).json({ error: "value (string) required" });
    return;
  }
  try {
    await db
      .insert(siteSettingsTable)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { value, updatedAt: new Date() },
      });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "PUT /admin/settings/:key");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
