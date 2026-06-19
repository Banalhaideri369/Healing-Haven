import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: '-10vw' }}
      transition={{ duration: 1.5 }}
    >
      <div className="absolute inset-0 w-full h-full flex flex-col justify-center px-[10vw]">
        
        <motion.div
          className="w-full flex items-center gap-6 mb-12"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <div className="h-[1px] w-24 bg-gold/50" />
          <span className="text-gold uppercase tracking-[0.3em] text-[1.2vw]">Signature Workshop</span>
        </motion.div>

        <motion.h2
          className="text-cream font-display text-[7vw] font-light leading-none mb-6 max-w-[80%]"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          Open your heart<br/>
          <span className="italic text-gold">to receive goodness.</span>
        </motion.h2>

      </div>
    </motion.div>
  );
}