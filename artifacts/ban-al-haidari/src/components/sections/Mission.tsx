import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function Mission() {
  const { t } = useLanguage();

  return (
    <section id="mission" className="py-24 md:py-32 relative bg-[#130d17] border-y border-primary/10 overflow-hidden">
      {/* Background decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">

        {/* Section header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4"
          >
            {t.mission.label}
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            {t.mission.heading1}{" "}
            <span className="italic text-muted">{t.mission.heading2}</span>
          </motion.h3>
        </div>

        {/* Body text */}
        <div className="max-w-3xl mx-auto space-y-6 text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed font-light"
          >
            {t.mission.p1}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed font-light"
          >
            {t.mission.p2}
          </motion.p>
        </div>

        {/* Pillars grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {t.mission.pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="group flex flex-col items-center text-center p-6 border border-primary/10 bg-card/40 hover:border-primary/40 hover:bg-card/70 transition-all duration-500"
            >
              {/* Number */}
              <span className="font-serif text-3xl text-primary/40 group-hover:text-primary/70 transition-colors duration-300 mb-3">
                0{i + 1}
              </span>
              <h4 className="font-serif text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {pillar.title}
              </h4>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative text-center px-8 py-10 border border-primary/20 bg-card/20"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <span className="text-5xl font-serif text-primary/30 leading-none block mb-4">&ldquo;</span>
          <p className="font-serif text-xl md:text-2xl text-foreground italic leading-relaxed max-w-2xl mx-auto">
            {t.mission.quote}
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </motion.div>

      </div>
    </section>
  );
}
