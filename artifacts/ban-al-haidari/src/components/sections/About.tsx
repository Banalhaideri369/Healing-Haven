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
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
              <div className="absolute inset-0 border border-primary/30 translate-x-4 translate-y-4" />
              <div
                className="absolute inset-0 bg-cover bg-center grayscale-[20%] sepia-[10%] brightness-90 contrast-125"
                style={{ backgroundImage: "url('/about-bg.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-2xl"
          >
            <h2 className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4">
              {t.about.label}
            </h2>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              {t.about.heading1}{" "}
              <span className="italic text-muted">{t.about.heading2}</span>{" "}
              {t.about.heading3}
            </h3>

            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </div>

            <div className="mt-12 pt-12 border-t border-primary/20 flex gap-12">
              <div>
                <p className="font-serif text-4xl text-primary mb-2">{t.about.stat1Value}</p>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">{t.about.stat1Label}</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-primary mb-2">{t.about.stat2Value}</p>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">{t.about.stat2Label}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
