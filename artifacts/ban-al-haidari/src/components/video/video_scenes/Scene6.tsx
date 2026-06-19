import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 7000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 2 }}
    >
      <div className="absolute inset-0 bg-[#0B0710]" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[15vw] text-center z-10">
        <motion.div
          className="text-gold text-[8vw] font-display italic leading-none opacity-40 mb-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={phase >= 1 ? { opacity: 0.4, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          "
        </motion.div>

        <motion.p
          className="text-cream font-display text-[4vw] font-light leading-[1.2] mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          Ban possesses a rare, profound gift. One session cleared years of emotional weight I didn't even realize I was carrying.
        </motion.p>

        <motion.div
          className="text-gold tracking-[0.2em] uppercase text-[1vw]"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          — Elena R.
        </motion.div>
      </div>
    </motion.div>
  );
}