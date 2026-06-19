import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: '-10vh', filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
        src={`${import.meta.env.BASE_URL}images/sacred-geometry.png`}
        initial={{ rotate: 15, scale: 1.5 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 15, ease: 'easeOut' }}
      />
      
      <div className="w-full flex flex-row items-stretch justify-center gap-[5vw] px-[10vw] z-10">
        
        {/* Service 3 */}
        <div className="flex-1 flex flex-col items-center text-center">
          <motion.div
            className="text-gold font-display italic text-[2vw] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1 }}
          >
            III.
          </motion.div>
          <motion.h3
            className="text-cream font-display text-[4vw] font-light leading-none mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Quantum Work
          </motion.h3>
          <motion.p
            className="text-cream/60 text-[1.2vw] font-light w-[80%]"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            Rewrites limiting patterns at the soul level
          </motion.p>
        </div>

        <div className="w-[1px] bg-gold/30 h-[20vh] self-center" />

        {/* Service 4 */}
        <div className="flex-1 flex flex-col items-center text-center">
          <motion.div
            className="text-gold font-display italic text-[2vw] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1 }}
          >
            IV.
          </motion.div>
          <motion.h3
            className="text-cream font-display text-[4vw] font-light leading-none mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Distance Healing
          </motion.h3>
          <motion.p
            className="text-cream/60 text-[1.2vw] font-light w-[80%]"
            initial={{ opacity: 0 }}
            animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            Energy delivered regardless of location
          </motion.p>
        </div>

      </div>
    </motion.div>
  );
}