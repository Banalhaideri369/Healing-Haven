/**
 * One-time seed: insert 4 real Arabic client testimonials into PostgreSQL.
 * Clears any existing testimonials first, then inserts the real ones.
 * Run with: node lib/db/seed-testimonials.mjs
 */
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const testimonials = [
  {
    clientName: "",
    content: `بان والله الكلمات تعجز عن تعبير مدى امتناني لجلساتك اللي عملتهم معك. من افضل الاستثمارات اللي بعملها بحياتي . لما بلشت اعمل جلسات مع بان كانت حياتي مأساة ومعاناة وكنت جالسة ببيت بلا عفش وكان في كتير ظلم بحياتي.
بان سمعتني بكل هدول واعطتني الحل فورا ولولا الله ثم بان أنا ماصار عندي شقة بالمنطقة اللي كنت احلم فيها أنا وبناتي وحياتي في تحسن للأفضل.
شكرا من كل القلب بان جلساتك فعلا احترافيه وحدسك جدا عالي. وكل شي اشتغلنا عليه تحقق الحمدلله رب العالمين.
من قلبي بنصح الكل ما يتردد ولا ثانية بالاشتراك مع بان لانه حقيقة شفت تغيرات ملحوظة في حياتي من بعد جلساتها 💗`,
    rating: 5,
  },
  {
    clientName: "",
    content: `حبيت اشارك رأي و تجربتي مع العزيزة حبيبتي بان جلسة تفوق التوقعات كان عندي الم بعد الجلسة اختفى تماما الحمدالله جدا جدا ممتنة لطاقتك الحلوة و لابداعك جدا رائعة مبدعة مشاء الله تبارك الله انوي لك البركة في علمك فعلا انصحكم تحجزون جلسات معها رح تلاقون نتائج مبهرة و انا اتحدث عن تجربة 😍🌷💟🙏💞`,
    rating: 5,
  },
  {
    clientName: "",
    content: `ممتنة جدا يا بان على جلساتك الرائعة لان نتيجتها بتكون فورية بقالي سنين بعاني من مشاكل مع الام من الطفولة بجلسة واحدة تشافيت من جرح الام وامي اتحسنت معايا جدا واتغيرت تماما وبعد ما تشافيت من جرح الام علاقاتي تشافت واتحسنت جدا ممتنة ليكي جدا انتي ملاك ربنا ارسلك للارض لتكوني قناة للشفاء`,
    rating: 5,
  },
  {
    clientName: "",
    content: `شكررراً من القلب ماستر بان 🌷 ممتنة جداً للجلسة العميييقة البارحة، كانت شيئاً يفوق الخيال وأجمل من كل التوقعات. شكراً لعطائك، وعلمك، وروحكِ الجميلة، وفعلاً تستحقين لقب ماستر بجدارة. 💕🫶🏻 الجلسة ساعدتني على تحرير معتقدااات عميقة جداً كانت مخزنة منذ فترة طويلة، وشعرت بتحول جميل وخفة كبيرة بعدها. 🫶🏻🌹 بكل صدق، الجلسة تستحق كل ما يُدفع فيها وأكثر، وأكيد سأستمر معكِ بأفضل وأجمل الاحتمالات. 🥰😍💞❤️ ممتنة من القلب 🥰`,
    rating: 5,
  },
];

async function main() {
  const client = await pool.connect();
  try {
    // Clear existing testimonials
    await client.query("DELETE FROM client_testimonials");
    console.log("🗑️  Cleared existing testimonials");

    // Insert the 4 real reviews
    for (const t of testimonials) {
      await client.query(
        `INSERT INTO client_testimonials (client_name, content, rating)
         VALUES ($1, $2, $3)`,
        [t.clientName, t.content, t.rating]
      );
    }
    console.log(`✅  Inserted ${testimonials.length} testimonials`);

    // Verify
    const { rows } = await client.query("SELECT COUNT(*) FROM client_testimonials");
    console.log(`📊  Total testimonials in DB: ${rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
