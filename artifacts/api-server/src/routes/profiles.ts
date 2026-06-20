import { Router } from "express";
import { db, userProfilesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/adminAuth";

const router = Router();

// ── GET /profile — fetch authenticated user's own profile ────────────────────
router.get("/profile", requireAuth, async (req, res) => {
  const uid = req.userId!;
  try {
    const rows = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.uid, uid));
    if (rows.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "GET /profile");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── PUT /profile — upsert authenticated user's own profile ───────────────────
router.put("/profile", requireAuth, async (req, res) => {
  const uid = req.userId!;
  const email = req.userEmail!;
  const b = req.body as {
    displayName?: string;
    bio?: string;
    intention?: string;
    phone?: string;
    recentActivity?: unknown[];
  };

  try {
    const rows = await db
      .insert(userProfilesTable)
      .values({
        uid,
        email,
        displayName: b.displayName ?? "",
        bio: b.bio ?? "",
        intention: b.intention ?? "",
        phone: b.phone ?? "",
        recentActivity: (b.recentActivity ?? []) as unknown[],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfilesTable.uid,
        set: {
          email,
          displayName: b.displayName ?? "",
          bio: b.bio ?? "",
          intention: b.intention ?? "",
          phone: b.phone ?? "",
          ...(b.recentActivity !== undefined
            ? { recentActivity: b.recentActivity as unknown[] }
            : {}),
          updatedAt: new Date(),
        },
      })
      .returning();
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "PUT /profile");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── POST /profile/activity — prepend an activity item ────────────────────────
router.post("/profile/activity", requireAuth, async (req, res) => {
  const uid = req.userId!;
  const email = req.userEmail!;
  const item = req.body as { id?: string; label?: string; date?: string };

  if (!item.label) {
    res.status(400).json({ error: "label required" });
    return;
  }

  try {
    const existing = await db
      .select({ recentActivity: userProfilesTable.recentActivity })
      .from(userProfilesTable)
      .where(eq(userProfilesTable.uid, uid));

    const prev = (existing[0]?.recentActivity as unknown[]) ?? [];
    const updated = [item, ...prev].slice(0, 10);

    const rows = await db
      .insert(userProfilesTable)
      .values({
        uid,
        email,
        recentActivity: updated,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfilesTable.uid,
        set: { recentActivity: updated, updatedAt: new Date() },
      })
      .returning();

    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "POST /profile/activity");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── GET /admin/users — list all user profiles (admin only) ───────────────────
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(userProfilesTable)
      .orderBy(desc(userProfilesTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "GET /admin/users");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── DELETE /admin/users/:uid — delete a user profile (admin only) ─────────────
router.delete("/admin/users/:uid", requireAdmin, async (req, res) => {
  const uid = String(req.params.uid);
  try {
    await db.delete(userProfilesTable).where(eq(userProfilesTable.uid, uid));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "DELETE /admin/users/:uid");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
