import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 6000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', y: '-5vh' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
        src={`${import.meta.env.BASE_URL}images/nebula-bg.png`}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: 'easeOut' }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[10vw]">
        <motion.div 
          className="text-gold font-display text-[4vw] tracking-[0.2em] mb-8 uppercase text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          Sacred Energy Healing
        </motion.div>
        
        <div className="text-center">
          <motion.h2 
            className="text-cream font-display text-[6vw] font-light leading-[1.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            Transformative healing
          </motion.h2>
          <motion.h2 
            className="text-cream font-display text-[6vw] font-light italic leading-[1.1] mt-2"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            for mind, body, and soul.
          </motion.h2>
        </div>
      </div>
    </motion.div>
  );
}