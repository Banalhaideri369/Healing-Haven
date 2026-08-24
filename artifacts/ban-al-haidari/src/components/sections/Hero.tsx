import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroBanner } from "./HeroBanner";

export function Hero() {
  const { scrollY } = useScroll();
  const y       = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500],  [1, 0]);
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── Parallax background ── */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ y, opacity }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </motion.div>

      {/* ── Banner slot — sits just below the fixed header ── */}
      <div className="relative z-10 w-full pt-20 sm:pt-24">
        <HeroBanner />
      </div>

      {/* ── Main hero content — centered in the remaining viewport space ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 max-w-4xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-primary tracking-[0.3em] uppercase text-sm md:text-base font-semibold mb-6"
        >
          {t.hero.tagline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-foreground mb-8 leading-tight"
        >
          Ban <span className="gold-gradient-text italic">Al-Haidari</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-muted-foreground text-lg md:text-xl font-light mb-12 max-w-2xl"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <a
            href="#online-sessions"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-transparent text-primary uppercase tracking-widest font-semibold text-sm overflow-hidden transition-all hover:text-primary-foreground"
            data-testid="link-hero-book"
          >
            <span className="absolute inset-0 w-full h-full bg-primary/10 border border-primary/50 group-hover:bg-primary transition-all duration-500 ease-out" />
            <span className="relative z-10">{t.hero.cta}</span>
          </a>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-xs text-muted-foreground tracking-widest uppercase">{t.hero.scroll}</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary/50 to-transparent" />
      </motion.div>
    </section>
  );
}
