import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: '50px' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: '-100px' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full h-[45%] relative">
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/healing-hands.png`}
          className="absolute inset-0 w-full h-full object-cover object-center"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 1.1, opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0710] via-transparent to-transparent" />
      </div>

      <div className="w-full h-[55%] flex flex-col justify-center px-[60px]">
        <motion.div
          className="w-[120px] h-[2px] bg-gold mb-12"
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1 }}
          style={{ originX: 0 }}
        />
        
        <motion.p
          className="text-cream/70 uppercase tracking-[0.3em] text-[28px] mb-[40px]"
          initial={{ opacity: 0, x: 30 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 1 }}
        >
          The Philosophy
        </motion.p>
        
        <motion.h3
          className="text-cream font-display text-[80px] font-light leading-tight mb-[60px]"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Step into a sanctuary of <span className="text-gold italic block mt-2">deep restoration.</span>
        </motion.h3>

        <motion.p
          className="text-cream/80 text-[36px] font-light leading-relaxed pr-[40px]"
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