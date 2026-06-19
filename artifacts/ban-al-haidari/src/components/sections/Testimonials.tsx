import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetTestimonials, type ApiTestimonial } from "@/lib/api";

export function Testimonials() {
  const { t, isRTL } = useLanguage();
  const [items, setItems] = useState<ApiTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    apiGetTestimonials()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const displayItems = items.length > 0
    ? items
    : t.testimonials.items.map((it, i) => ({
        id: String(i),
        clientName: it.author,
        content: it.quote,
        rating: 5,
        createdAt: "",
      }));

  const total = displayItems.length;

  const goTo = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setActiveIndex((next + total) % total);
    },
    [total]
  );

  const prev = () => goTo(activeIndex - 1, -1);
  const next = () => goTo(activeIndex + 1, 1);

  useEffect(() => {
    if (total === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((i) => (i + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const getSlots = () => {
    if (total === 0) return { left: null, center: null, right: null };
    return {
      left: displayItems[(activeIndex - 1 + total) % total],
      center: displayItems[activeIndex],
      right: displayItems[(activeIndex + 1) % total],
    };
  };

  const { left, center, right } = getSlots();

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 relative bg-background overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[600px] h-[300px] bg-[#C9A84C]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Heading */}
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
        <>
          {/* Carousel viewport */}
          <div className="relative z-10 flex items-center justify-center gap-4 px-4 md:px-8" style={{ direction: "ltr" }}>
            {/* Prev button */}
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="hidden md:flex flex-shrink-0 w-10 h-10 items-center justify-center rounded-full border border-[#C9A84C]/30 text-[#C9A84C]/60 hover:border-[#C9A84C]/70 hover:text-[#C9A84C] transition-all duration-300 bg-card/20 backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Three-card stage */}
            <div className="relative flex items-center justify-center w-full max-w-5xl overflow-hidden">
              {/* Left fade overlay */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-32 md:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
              {/* Right fade overlay */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-32 md:w-48 bg-gradient-to-l from-background via-background/80 to-transparent z-20" />

              <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
                {/* Left ghost card */}
                {left && (
                  <div className="hidden md:block flex-shrink-0 opacity-25 scale-90 transition-all duration-700 w-[340px] pointer-events-none select-none">
                    <TestimonialCard item={left} isRTL={isRTL} />
                  </div>
                )}

                {/* Active card */}
                <div className="flex-shrink-0 relative z-10 w-[320px] md:w-[400px]">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={activeIndex}
                      custom={direction}
                      variants={{
                        enter: (d: number) => ({
                          x: d > 0 ? 80 : -80,
                          opacity: 0,
                          scale: 0.95,
                        }),
                        center: { x: 0, opacity: 1, scale: 1 },
                        exit: (d: number) => ({
                          x: d > 0 ? -80 : 80,
                          opacity: 0,
                          scale: 0.95,
                        }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {center && <TestimonialCard item={center} isRTL={isRTL} active />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right ghost card */}
                {right && (
                  <div className="hidden md:block flex-shrink-0 opacity-25 scale-90 transition-all duration-700 w-[340px] pointer-events-none select-none">
                    <TestimonialCard item={right} isRTL={isRTL} />
                  </div>
                )}
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="hidden md:flex flex-shrink-0 w-10 h-10 items-center justify-center rounded-full border border-[#C9A84C]/30 text-[#C9A84C]/60 hover:border-[#C9A84C]/70 hover:text-[#C9A84C] transition-all duration-300 bg-card/20 backdrop-blur-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Mobile nav buttons */}
          <div className="flex md:hidden items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              aria-label="Previous"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C9A84C]/30 text-[#C9A84C]/60 hover:border-[#C9A84C]/70 hover:text-[#C9A84C] transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C9A84C]/30 text-[#C9A84C]/60 hover:border-[#C9A84C]/70 hover:text-[#C9A84C] transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {displayItems.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > activeIndex ? 1 : -1)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === activeIndex ? "24px" : "6px",
                  height: "6px",
                  background: i === activeIndex ? "#C9A84C" : "rgba(201,168,76,0.25)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function TestimonialCard({
  item,
  isRTL,
  active = false,
}: {
  item: { clientName: string; content: string; rating: number };
  isRTL: boolean;
  active?: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center text-center p-10 md:p-12 border rounded-sm transition-all duration-500"
      style={{
        direction: isRTL ? "rtl" : "ltr",
        background: active
          ? "linear-gradient(145deg, rgba(201,168,76,0.06) 0%, rgba(255,255,255,0.02) 100%)"
          : "rgba(255,255,255,0.02)",
        borderColor: active ? "rgba(201,168,76,0.22)" : "rgba(201,168,76,0.08)",
        boxShadow: active
          ? "0 0 40px rgba(201,168,76,0.07), inset 0 1px 0 rgba(201,168,76,0.1)"
          : "none",
      }}
    >
      {/* Golden quote mark */}
      <span
        className="font-serif leading-none select-none mb-4 block"
        style={{
          fontSize: "64px",
          lineHeight: "1",
          color: "#C9A84C",
          opacity: active ? 0.45 : 0.2,
          fontFamily: "Georgia, serif",
        }}
      >
        &ldquo;
      </span>

      {/* Stars */}
      <div className="flex gap-1 justify-center mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            style={{
              fill: i < item.rating ? "#C9A84C" : "rgba(201,168,76,0.12)",
              color: i < item.rating ? "#C9A84C" : "rgba(201,168,76,0.12)",
              filter: i < item.rating && active ? "drop-shadow(0 0 4px rgba(201,168,76,0.5))" : "none",
            }}
          />
        ))}
      </div>

      {/* Testimonial text */}
      <p
        className="font-serif italic leading-[1.85] flex-1"
        style={{
          fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
          color: active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.45)",
          letterSpacing: "0.01em",
        }}
      >
        {item.content}
      </p>

      {/* Bottom divider */}
      {active && (
        <div
          className="mt-8 w-8 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
        />
      )}
    </div>
  );
}
