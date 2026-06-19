import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.5 }}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        src={`${import.meta.env.BASE_URL}videos/crystal-light.mp4`}
        autoPlay
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-[#0B0710]/40" />

      <div className="text-center relative z-10">
        <motion.div 
          className="text-gold font-display text-[12vw] leading-none mb-4 tracking-widest font-light"
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={phase >= 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(10px)' }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        >
          BAH
        </motion.div>
        
        <motion.div
          className="w-[1px] h-[10vh] bg-gold mx-auto"
          initial={{ scaleY: 0 }}
          animate={phase >= 2 ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
      </div>
    </motion.div>
  );
}