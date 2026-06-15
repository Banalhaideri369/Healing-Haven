import React from "react";
import { motion } from "framer-motion";

export function About() {
  return (
    <section id="about" className="py-24 md:py-32 relative bg-background overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
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
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-2xl"
          >
            <h2 className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4">The Healer</h2>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              Bridging <span className="italic text-muted">Ancient Wisdom</span> & Modern Science
            </h3>
            
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light">
              <p>
                Ban Al-Haidari is an internationally certified energy healer with over 15 years of dedicated practice in the esoteric arts. Her journey began with a profound awakening that led her to study under master healers across the globe.
              </p>
              <p>
                She creates a sacred, luxurious space where profound transformation can occur. By accessing the subtle energy fields of the body, she facilitates deep clearing, realignment, and cellular healing.
              </p>
              <p>
                Every session is a bespoke experience, tailored entirely to the unique resonance of your soul. Whether you seek relief from chronic blockages, spiritual expansion, or simple profound rest—you are in masterful hands.
              </p>
            </div>
            
            <div className="mt-12 pt-12 border-t border-primary/20 flex gap-12">
              <div>
                <p className="font-serif text-4xl text-primary mb-2">15+</p>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Years Experience</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-primary mb-2">10k+</p>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Lives Touched</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
