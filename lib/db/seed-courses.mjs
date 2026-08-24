/**
 * Idempotent starter content for the public course catalog.
 *
 * Run with:
 *   pnpm db:seed
 *
 * Existing rows are preserved. A starter recorded course and one starter
 * one-on-one course are inserted only when their respective tables are empty.
 */
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const workshopLink = process.env.TELEGRAM_WORKSHOP_URL ?? "";

const recordedCourse = {
  title: "ورشة البيع والوفرة",
  description:
    "ورشة متكاملة تأخذك في رحلة عميقة للتحرر من الأنماط المحدودة حول المال والبيع، والعيش في تدفق الوفرة الحقيقية. تعلّمي كيف تفتحين طاقة الاستقبال وتحولين علاقتك بالبيع من خوف إلى قوة.",
  image: "/workshop-cover.jpg",
  telegramLink: workshopLink,
  price: 150,
};

const onlineCourse = {
  title: "جلسة شفاء فردية",
  description:
    "جلسة خاصة ومساحة آمنة للعودة إلى ذاتك، فهم ما يعيق تدفقك، والتحرك نحو وضوح وراحة واتصال أعمق.",
  image: "/ban-photo.png",
  telegramLink: "",
  price: 120,
  status: "available",
  availability: JSON.stringify({}),
};

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const recordedCount = await client.query(
      "SELECT COUNT(*)::int AS count FROM recorded_courses",
    );
    if (recordedCount.rows[0].count === 0) {
      await client.query(
        `INSERT INTO recorded_courses
          (title, description, image, telegram_link, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          recordedCourse.title,
          recordedCourse.description,
          recordedCourse.image,
          recordedCourse.telegramLink,
          recordedCourse.price,
        ],
      );
      console.log(`Inserted starter recorded course: ${recordedCourse.title}`);
    } else {
      console.log(`Preserved ${recordedCount.rows[0].count} recorded course(s)`);
    }

    const onlineCount = await client.query(
      "SELECT COUNT(*)::int AS count FROM online_courses",
    );
    if (onlineCount.rows[0].count === 0) {
      await client.query(
        `INSERT INTO online_courses
          (title, description, image, telegram_link, price, status, availability)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
        [
          onlineCourse.title,
          onlineCourse.description,
          onlineCourse.image,
          onlineCourse.telegramLink,
          onlineCourse.price,
          onlineCourse.status,
          onlineCourse.availability,
        ],
      );
      console.log(`Inserted starter online course: ${onlineCourse.title}`);
    } else {
      console.log(`Preserved ${onlineCount.rows[0].count} online course(s)`);
    }

    await client.query("COMMIT");

    const totals = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM recorded_courses) AS recorded_courses,
        (SELECT COUNT(*)::int FROM online_courses) AS online_courses
    `);
    console.log("Course totals:", totals.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Course seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});