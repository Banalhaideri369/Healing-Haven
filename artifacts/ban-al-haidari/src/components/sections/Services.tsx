import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Waves, Orbit, Wind } from "lucide-react";

const services = [
  {
    icon: Waves,
    title: "Reiki Healing",
    description: "A gentle yet profoundly powerful laying-on of hands technique that channels universal life force energy to clear blockages and restore systemic harmony.",
  },
  {
    icon: Sparkles,
    title: "Chakra Balancing",
    description: "Precise energetic attunement of your seven major energy centers, realigning your physical, emotional, and spiritual bodies for optimal flow.",
  },
  {
    icon: Orbit,
    title: "Quantum Energy Work",
    description: "Advanced multi-dimensional healing that operates outside of space and time to rewrite limiting patterns at the cellular and soul level.",
  },
  {
    icon: Wind,
    title: "Distance Healing",
    description: "Experience the profound effects of Ban's healing from anywhere in the world. Energy knows no bounds, delivering the exact medicine you need.",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export function Services() {
  return (
    <section id="services" className="py-24 md:py-32 relative bg-[#130d17] border-y border-primary/10">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4"
          >
            Offerings
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            Sacred <span className="italic text-muted">Modalities</span>
          </motion.h3>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="group relative p-8 md:p-10 bg-card hover:bg-card/80 transition-colors duration-500 overflow-hidden gold-gradient-border"
                data-testid={`service-card-${index}`}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="mb-6 inline-flex p-4 rounded-full bg-background border border-primary/20 text-primary group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-2xl md:text-3xl text-foreground mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  );
}
