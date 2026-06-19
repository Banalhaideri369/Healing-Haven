import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetTestimonials, type ApiTestimonial } from "@/lib/api";

export function Testimonials() {
  const { t, isRTL } = useLanguage();
  const [items, setItems] = useState<ApiTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);

  useEffect(() => {
    apiGetTestimonials()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const SPEED = 0.5;
    let paused = false;

    const tick = () => {
      if (!paused && track) {
        posRef.current += SPEED;
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animRef.current);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, [items]);

  const displayItems = items.length > 0 ? items : t.testimonials.items.map((it, i) => ({
    id: String(i),
    clientName: it.author,
    content: it.quote,
    rating: 5,
    createdAt: "",
  }));

  const doubled = [...displayItems, ...displayItems];

  return (
    <section id="testimonials" className="py-24 md:py-32 relative bg-background overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10 mb-16">
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
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            {t.testimonials.heading1}{" "}
            <span className="italic text-muted">{t.testimonials.heading2}</span>
          </motion.h3>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative overflow-hidden" style={{ direction: "ltr" }}>
          <div
            ref={trackRef}
            className="flex gap-6 will-change-transform"
            style={{ width: "max-content" }}
          >
            {doubled.map((item, idx) => (
              <TestimonialCard key={`${item.id}-${idx}`} item={item} isRTL={isRTL} />
            ))}
          </div>

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
      )}
    </section>
  );
}

function TestimonialCard({ item, isRTL }: { item: { clientName: string; content: string; rating: number }; isRTL: boolean }) {
  return (
    <div
      className="flex-shrink-0 w-[320px] md:w-[380px] flex flex-col p-8 border border-primary/10 bg-card/30 relative hover:border-primary/25 transition-colors"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      <span className="text-5xl font-serif text-primary/25 absolute top-3 start-5 leading-none select-none">&ldquo;</span>

      <div className="flex gap-0.5 mb-4 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            className={i < item.rating ? "fill-primary text-primary" : "fill-white/10 text-white/10"}
          />
        ))}
      </div>

      <p className="text-muted-foreground italic font-serif text-base leading-relaxed flex-1 mb-6">
        &ldquo;{item.content}&rdquo;
      </p>

      <div>
        <div className="w-6 h-[1px] bg-primary mb-3" />
        <p className="font-semibold text-foreground uppercase tracking-wider text-xs">
          {item.clientName || (isRTL ? "عميل كريم" : "Valued Client")}
        </p>
      </div>
    </div>
  );
}
