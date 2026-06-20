import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetTestimonials, type ApiTestimonial } from "@/lib/api";

export function Testimonials() {
  const { t, isRTL } = useLanguage();
  const [items, setItems] = useState<ApiTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetTestimonials()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const displayItems =
    items.length > 0
      ? items
      : t.testimonials.items.map((it, i) => ({
          id: String(i),
          clientName: it.author,
          content: it.quote,
          rating: 5,
          createdAt: "",
        }));

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 relative bg-background overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[700px] h-[400px] bg-[#C9A84C]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[150px] pointer-events-none" />

      {/* Heading */}
      <div className="container mx-auto px-6 max-w-6xl relative z-10 mb-16">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4"
          >
            {t.testimonials.label}
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            {t.testimonials.heading1}{" "}
            <span className="italic text-muted">{t.testimonials.heading2}</span>
          </motion.h3>
          {/* Decorative rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mx-auto mt-8 w-24 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {displayItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <TestimonialCard item={item} isRTL={isRTL} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({
  item,
  isRTL,
}: {
  item: { clientName: string; content: string; rating: number };
  isRTL: boolean;
}) {
  return (
    <div
      className="relative flex flex-col p-8 border border-[#C9A84C]/15 bg-white/[0.02] hover:border-[#C9A84C]/30 hover:bg-white/[0.035] transition-all duration-500 group h-full"
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        boxShadow: "0 0 0 0 transparent",
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      {/* Quote mark */}
      <span
        className="font-serif leading-none select-none mb-5 block text-[#C9A84C] opacity-30 group-hover:opacity-45 transition-opacity duration-500"
        style={{ fontSize: "56px", lineHeight: "1", fontFamily: "Georgia, serif" }}
      >
        &ldquo;
      </span>

      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            style={{
              fill: i < item.rating ? "#C9A84C" : "rgba(201,168,76,0.12)",
              color: i < item.rating ? "#C9A84C" : "rgba(201,168,76,0.12)",
            }}
          />
        ))}
      </div>

      {/* Review text */}
      <p
        className="font-serif italic leading-[1.9] flex-1 text-foreground/70 group-hover:text-foreground/85 transition-colors duration-500"
        style={{ fontSize: "clamp(0.88rem, 1.6vw, 1rem)" }}
      >
        {item.content}
      </p>

      {/* Bottom divider */}
      <div className="mt-6 w-8 h-[1px] bg-gradient-to-r from-[#C9A84C]/50 to-transparent" />
    </div>
  );
}
