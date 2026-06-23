import app from "./app";
import { logger } from "./lib/logger";
import { db, onlineCoursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const port = Number(process.env["PORT"]) || 5000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

// Strip legacy default slots injected before the fix (09:00, 10:00, 11:00, 14:00, 15:00)
async function clearLegacyDefaultSlots() {
  const LEGACY = new Set(["09:00", "10:00", "11:00", "14:00", "15:00"]);
  try {
    const courses = await db
      .select({ id: onlineCoursesTable.id, availability: onlineCoursesTable.availability })
      .from(onlineCoursesTable);

    for (const course of courses) {
      const avail = course.availability as Record<string, { enabled: boolean; slots: string[] }>;
      let dirty = false;
      for (const day of Object.keys(avail)) {
        const original = avail[day]?.slots ?? [];
        const cleaned = original.filter((s) => !LEGACY.has(s));
        if (cleaned.length !== original.length) {
          avail[day].slots = cleaned;
          dirty = true;
        }
      }
      if (dirty) {
        await db.update(onlineCoursesTable)
          .set({ availability: avail })
          .where(eq(onlineCoursesTable.id, course.id));
      }
    }
    if (courses.length > 0) {
      logger.info(`clearLegacyDefaultSlots: checked ${courses.length} course(s)`);
    }
  } catch (err) {
    logger.warn({ err }, "clearLegacyDefaultSlots: skipped (non-fatal)");
  }
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  void clearLegacyDefaultSlots();
});
