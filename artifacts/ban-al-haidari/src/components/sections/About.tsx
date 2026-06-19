import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function About() {
  const { t, isRTL } = useLanguage();

  return (
    <section id="about" className="py-24 md:py-32 relative bg-background overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="w-full lg:w-2/5 relative flex-shrink-0"
          >
            <div className="relative w-full max-w-sm lg:max-w-none mx-auto">
              {/* Decorative border offset */}
              <div className="absolute inset-0 border border-primary/30 translate-x-4 translate-y-4 rounded-sm" />
              {/* Glow behind photo */}
              <div className="absolute inset-0 bg-primary/10 blur-2xl scale-90 rounded-full pointer-events-none" />
              {/* Square crop container */}
              <div className="relative w-full aspect-square overflow-hidden rounded-sm drop-shadow-[0_8px_40px_rgba(212,175,55,0.25)]">
                <img
                  src="/ban-photo.png"
                  alt="Ban Al-Haidari"
                  className="w-full h-full object-cover object-top"
                />
                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-background to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-3/5"
          >
            <h2 className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4">
              {t.about.label}
            </h2>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-2 leading-tight">
              {t.about.heading1}{" "}
              <span className="gold-gradient-text">{t.about.heading2}</span>
            </h3>
            <p className="text-muted uppercase tracking-widest text-sm mb-8 font-light">
              {t.about.subtitle}
            </p>

            <div className="space-y-5 text-muted-foreground text-base md:text-lg leading-relaxed font-light">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
              <p>{t.about.p4}</p>
            </div>

            {/* Quote */}
            <blockquote className="mt-8 border-s-2 border-primary ps-5 italic text-muted text-lg font-serif">
              {t.about.quote}
            </blockquote>

            {/* Stats */}
            <div className="mt-10 pt-10 border-t border-primary/20 flex gap-12">
              <div>
                <p className="font-serif text-4xl text-primary mb-2">{t.about.stat1Value}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{t.about.stat1Label}</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-primary mb-2">{t.about.stat2Value}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{t.about.stat2Label}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
