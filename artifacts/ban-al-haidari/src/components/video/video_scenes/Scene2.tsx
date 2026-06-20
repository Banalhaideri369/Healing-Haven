import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', y: '-100px' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
        src={`${import.meta.env.BASE_URL}images/nebula-bg.png`}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: 'easeOut' }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[80px]">
        <motion.div 
          className="text-gold font-display text-[28px] tracking-[0.3em] mb-[80px] uppercase text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          Sacred Energy Healing
        </motion.div>
        
        <div className="text-center flex flex-col gap-6">
          <motion.h2 
            className="text-cream font-display text-[90px] font-light leading-[1.1]"
            initial={{ opacity: 0, y: 50 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            Transformative healing
          </motion.h2>
          <motion.h2 
            className="text-cream font-display text-[90px] font-light italic leading-[1.1]"
            initial={{ opacity: 0, y: 50 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            for mind, body & soul.
          </motion.h2>
        </div>
      </div>
    </motion.div>
  );
}