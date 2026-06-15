import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Ban possesses a rare, profound gift. One session with her cleared years of emotional weight I didn't even realize I was carrying. The experience felt incredibly luxurious yet deeply grounding.",
    author: "Elena R.",
    role: "Creative Director"
  },
  {
    quote: "I've visited healers all over the world, but stepping into Ban's sanctuary was unlike anything else. Her quantum energy work rewired my entire approach to my business and life.",
    author: "Marcus T.",
    role: "Entrepreneur"
  },
  {
    quote: "The chakra balancing session was transcendent. I literally felt the exact moment my energy shifted. Ban is a master of her craft, and her space feels like absolute magic.",
    author: "Sarah J.",
    role: "Author"
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 relative bg-background overflow-hidden">
      {/* Abstract blurred shapes */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4"
          >
            Words of Reverence
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            Client <span className="italic text-muted">Experiences</span>
          </motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="flex flex-col items-center text-center p-8 border border-primary/10 bg-card/30 relative"
            >
              <span className="text-6xl font-serif text-primary/40 absolute top-4 left-4 leading-none">&ldquo;</span>
              <p className="text-muted-foreground italic font-serif text-lg leading-relaxed relative z-10 mb-8 pt-6">
                "{t.quote}"
              </p>
              <div className="mt-auto">
                <div className="w-8 h-[1px] bg-primary mx-auto mb-4" />
                <p className="font-semibold text-foreground uppercase tracking-wider text-sm">{t.author}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
