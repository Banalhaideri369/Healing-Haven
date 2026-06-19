import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetBanners, apiGetSettings, type ApiBanner } from "@/lib/api";

export function HeroBanner() {
  const { isRTL } = useLanguage();
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    Promise.all([apiGetBanners(), apiGetSettings()])
      .then(([bans, settings]) => {
        setBanners(bans);
        setEnabled(settings.banner_enabled === "true");
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance every 5 s when multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (loading || !enabled || banners.length === 0) return null;

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goPrev = () => setActive((i) => (i - 1 + banners.length) % banners.length);
  const goNext = () => setActive((i) => (i + 1) % banners.length);
  // RTL reverses visual left/right mapping
  const goVisualLeft  = () => (isRTL ? goNext : goPrev)();
  const goVisualRight = () => (isRTL ? goPrev : goNext)();

  // ── Touch swipe ─────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx > 0 ? goVisualLeft() : goVisualRight();
    }
    touchStartX.current = null;
  };

  // ── Click: scroll to exact course card ──────────────────────────────────────
  const handleBannerClick = (banner: ApiBanner) => {
    if (banner.status !== "available") return;

    // Always scroll products section into view first
    const productsSection = document.getElementById("products");
    if (productsSection) productsSection.scrollIntoView({ behavior: "smooth" });

    if (banner.linkedCourseId) {
      // After the products section scrolls into view, hone in on the exact card
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-course-id="${banner.linkedCourseId}"]`
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Gold highlight pulse
          el.style.transition = "box-shadow 0.35s ease, outline 0.35s ease";
          el.style.boxShadow =
            "0 0 0 2px rgba(212,175,55,0.85), 0 0 36px rgba(212,175,55,0.25)";
          el.style.outline = "1.5px solid rgba(212,175,55,0.5)";
          setTimeout(() => {
            el.style.boxShadow = "";
            el.style.outline = "";
          }, 2600);
        }
      }, 700);
    }
  };

  const banner = banners[active];

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 mt-3 mb-1">
      <div className="relative overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(212,175,55,0.13)] bg-black/35 backdrop-blur-md group max-w-5xl mx-auto">
        {/* Top / bottom gold lines */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/35 to-transparent z-20 pointer-events-none" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, x: isRTL ? -18 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 18 : -18 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`relative w-full h-44 sm:h-52 md:h-60 select-none ${
              banner.status === "available" ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={() => handleBannerClick(banner)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image — object-fit: cover, object-position: center */}
            {banner.image ? (
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
                draggable={false}
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-[#1a0a2e] to-secondary/10" />
            )}

            {/* Gradient overlays for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/45" />

            {/* Content */}
            <div
              className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-5 md:p-6"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {/* Status badge */}
              <div className="mb-2">
                {banner.status === "available" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isRTL ? "متاح الآن" : "Available"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {isRTL ? "قريباً" : "Coming Soon"}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-[1.7rem] text-white leading-snug drop-shadow-xl max-w-2xl">
                {banner.title}
              </h3>

              {/* CTA hint — only for available banners */}
              {banner.status === "available" && (
                <p className="mt-1.5 text-[11px] text-white/50 flex items-center gap-1">
                  {isRTL ? (
                    <>
                      <ChevronLeft size={11} className="opacity-70" />
                      اضغط للانتقال للكورس
                    </>
                  ) : (
                    <>
                      Tap to view course
                      <ChevronRight size={11} className="opacity-70" />
                    </>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Multi-banner navigation ── */}
        {banners.length > 1 && (
          <>
            {/* Left arrow */}
            <button
              type="button"
              aria-label="previous slide"
              onClick={(e) => { e.stopPropagation(); goVisualLeft(); }}
              className="absolute top-1/2 -translate-y-1/2 start-2 z-30 w-8 h-8 bg-black/55 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/35 hover:border-primary/60 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              {isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Right arrow */}
            <button
              type="button"
              aria-label="next slide"
              onClick={(e) => { e.stopPropagation(); goVisualRight(); }}
              className="absolute top-1/2 -translate-y-1/2 end-2 z-30 w-8 h-8 bg-black/55 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/35 hover:border-primary/60 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Indicator dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`go to slide ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-5 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
