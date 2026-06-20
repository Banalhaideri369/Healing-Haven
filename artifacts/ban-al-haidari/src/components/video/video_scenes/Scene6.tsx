import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0B0710]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 2 }}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        src={`${import.meta.env.BASE_URL}videos/crystal-light.mp4`}
        autoPlay
        muted
        playsInline
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.div 
          className="w-[120px] h-[2px] bg-gold mb-[80px]"
          initial={{ scaleX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        <motion.h1
          className="text-gold font-display text-[72px] tracking-[0.2em] uppercase font-light text-center mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          Ban Al-Haidari
        </motion.h1>

        <motion.div
          className="text-[36px] tracking-[0.3em] text-cream font-light mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          Energy Healing
        </motion.div>

        <motion.p
          className="text-cream/50 text-[28px] tracking-[0.2em] font-light mb-[80px]"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 2 }}
        >
          الشفاء الروحي المقدس
        </motion.p>

        <motion.div
          className="text-gold/70 text-[24px] tracking-widest font-light mt-[40px]"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1.5 }}
        >
          @ban.alhaidari
        </motion.div>
      </div>
    </motion.div>
  );
}