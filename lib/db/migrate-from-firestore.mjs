/**
 * One-time migration: Firebase Firestore → Neon PostgreSQL
 * Reads recorded_courses and online_courses from Firestore REST API,
 * then upserts them into the PostgreSQL tables via direct SQL.
 *
 * Run with: node lib/db/migrate-from-firestore.mjs
 */

import pg from "pg";

const { Pool } = pg;

const FIREBASE_PROJECT = "ban-alhaidari-energy";
const FIREBASE_API_KEY = "AIzaSyD_Pdi5xvzp1JTjj9eGxBZDWiThlB2Gge4";

// ─── Firestore REST helpers ────────────────────────────────────────────────────

function firestoreUrl(collection) {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${collection}?key=${FIREBASE_API_KEY}&pageSize=100`;
}

/** Convert a Firestore typed value object to a plain JS value */
function parseField(fieldValue) {
  if (fieldValue === null || fieldValue === undefined) return null;
  if ("stringValue"    in fieldValue) return fieldValue.stringValue;
  if ("integerValue"   in fieldValue) return Number(fieldValue.integerValue);
  if ("doubleValue"    in fieldValue) return Number(fieldValue.doubleValue);
  if ("booleanValue"   in fieldValue) return Boolean(fieldValue.booleanValue);
  if ("timestampValue" in fieldValue) return new Date(fieldValue.timestampValue);
  if ("nullValue"      in fieldValue) return null;
  if ("mapValue"       in fieldValue) {
    const obj = {};
    const fields = fieldValue.mapValue.fields ?? {};
    for (const [k, v] of Object.entries(fields)) obj[k] = parseField(v);
    return obj;
  }
  if ("arrayValue" in fieldValue) {
    return (fieldValue.arrayValue.values ?? []).map(parseField);
  }
  return null;
}

/** Fetch all documents from a Firestore collection */
async function fetchCollection(collection) {
  const res = await fetch(firestoreUrl(collection));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore fetch failed for "${collection}": ${res.status} ${text}`);
  }
  const body = await res.json();
  if (!body.documents) return [];

  return body.documents.map((doc) => {
    const id = doc.name.split("/").pop();
    const fields = doc.fields ?? {};
    const parsed = { id };
    for (const [k, v] of Object.entries(fields)) parsed[k] = parseField(v);
    return parsed;
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("\n📥  Fetching recorded_courses from Firestore …");
    const recorded = await fetchCollection("recorded_courses");
    console.log(`   Found ${recorded.length} recorded course(s)`);

    console.log("📥  Fetching online_courses from Firestore …");
    const online = await fetchCollection("online_courses");
    console.log(`   Found ${online.length} online course(s)`);

    // ── Insert recorded courses ──────────────────────────────────────────────
    if (recorded.length > 0) {
      console.log("\n📝  Inserting recorded courses into PostgreSQL …");
      for (const c of recorded) {
        const title          = c.title          ?? "";
        const description    = c.description    ?? "";
        const image          = c.image          ?? "";
        const telegramLink   = c.telegramLink   ?? "";
        const price          = Number(c.price)  || 0;
        const discountEnabled  = Boolean(c.discountEnabled);
        const discountPercent  = Number(c.discountPercent) || 0;

        await pool.query(
          `INSERT INTO recorded_courses
             (title, description, image, telegram_link, price, discount_enabled, discount_percent)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT DO NOTHING`,
          [title, description, image, telegramLink, price, discountEnabled, discountPercent]
        );
        console.log(`   ✓ "${title}"`);
      }
    }

    // ── Insert online courses ────────────────────────────────────────────────
    if (online.length > 0) {
      console.log("\n📝  Inserting online courses into PostgreSQL …");
      for (const c of online) {
        const title       = c.title       ?? "";
        const description = c.description ?? "";
        const image       = c.image       ?? "";
        const price       = Number(c.price) || 0;
        const status      = c.status      ?? "available";
        const availability = c.availability ? JSON.stringify(c.availability) : "{}";

        await pool.query(
          `INSERT INTO online_courses
             (title, description, image, price, status, availability)
           VALUES ($1,$2,$3,$4,$5,$6::jsonb)
           ON CONFLICT DO NOTHING`,
          [title, description, image, price, status, availability]
        );
        console.log(`   ✓ "${title}"`);
      }
    }

    // ── Verify final counts ──────────────────────────────────────────────────
    console.log("\n✅  Migration complete. Final row counts:");
    const rc = await pool.query("SELECT COUNT(*) FROM recorded_courses");
    const oc = await pool.query("SELECT COUNT(*) FROM online_courses");
    console.log(`   recorded_courses : ${rc.rows[0].count} row(s)`);
    console.log(`   online_courses   : ${oc.rows[0].count} row(s)`);

  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\n❌  Migration failed:", err.message);
  process.exit(1);
});
