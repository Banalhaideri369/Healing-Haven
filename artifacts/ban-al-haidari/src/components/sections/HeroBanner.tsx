import { useState, useEffect } from "react";
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

  useEffect(() => {
    Promise.all([apiGetBanners(), apiGetSettings()])
      .then(([bans, settings]) => {
        setBanners(bans);
        setEnabled(settings.banner_enabled === "true");
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance slides every 5s when multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (loading || !enabled || banners.length === 0) return null;

  const handleBannerClick = (banner: ApiBanner) => {
    if (banner.status !== "available") return;
    // Scroll to products section
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const prev = () => setActive((i) => (i - 1 + banners.length) % banners.length);
  const next = () => setActive((i) => (i + 1) % banners.length);
  const banner = banners[active];

  return (
    <section className="w-full py-6 px-4 md:px-8 lg:px-16 bg-[#0a060f]">
      <div className="max-w-5xl mx-auto">
        <div className="relative group overflow-hidden border border-primary/25 shadow-[0_0_60px_rgba(212,175,55,0.10)]">
          {/* Top gold line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-20 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 24 : -24 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className={`relative w-full h-56 sm:h-72 md:h-80 lg:h-[340px] flex ${banner.status === "available" ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => handleBannerClick(banner)}
            >
              {/* Background image */}
              {banner.image ? (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-end p-5 sm:p-7 w-full" dir={isRTL ? "rtl" : "ltr"}>
                {/* Status badge */}
                <div className="mb-3">
                  {banner.status === "available" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isRTL ? "متاح الآن" : "Available"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {isRTL ? "قريباً" : "Coming Soon"}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-white leading-snug drop-shadow-lg max-w-lg">
                  {banner.title}
                </h3>

                {/* CTA hint for available banners */}
                {banner.status === "available" && (
                  <p className="mt-2 text-xs text-white/60 flex items-center gap-1.5">
                    {isRTL ? (
                      <>اضغط لعرض التفاصيل <ChevronLeft size={12} /></>
                    ) : (
                      <>Tap to view details <ChevronRight size={12} /></>
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows (only for multiple banners) */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); isRTL ? next() : prev(); }}
                className="absolute top-1/2 -translate-y-1/2 start-3 z-30 w-8 h-8 bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/30 hover:border-primary/50 transition-all opacity-0 group-hover:opacity-100"
              >
                {isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); isRTL ? prev() : next(); }}
                className="absolute top-1/2 -translate-y-1/2 end-3 z-30 w-8 h-8 bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/30 hover:border-primary/50 transition-all opacity-0 group-hover:opacity-100"
              >
                {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActive(i); }}
                    className={`rounded-full transition-all ${i === active ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
