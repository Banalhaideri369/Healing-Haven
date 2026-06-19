import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 6500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex overflow-hidden"
      initial={{ opacity: 0, y: '5vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: '-10vw' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[45%] h-full relative">
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/healing-hands.png`}
          className="absolute inset-0 w-full h-full object-contain object-right"
          initial={{ x: '-10vw', opacity: 0 }}
          animate={phase >= 1 ? { x: 0, opacity: 1 } : { x: '-10vw', opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
      </div>

      <div className="w-[55%] h-full flex flex-col justify-center pl-[5vw] pr-[10vw]">
        <motion.div
          className="w-12 h-[1px] bg-gold mb-8"
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1 }}
          style={{ originX: 0 }}
        />
        
        <motion.p
          className="text-cream/70 uppercase tracking-[0.3em] text-[1vw] mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 1 }}
        >
          The Philosophy
        </motion.p>
        
        <motion.h3
          className="text-cream font-display text-[4.5vw] font-light leading-tight mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Step into a sanctuary of <span className="text-gold italic">deep restoration</span>.
        </motion.h3>

        <motion.p
          className="text-cream/80 text-[1.5vw] font-light leading-relaxed max-w-[80%]"
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          "Because when an aware woman transforms from within, her entire world changes."
        </motion.p>
      </div>
    </motion.div>
  );
}