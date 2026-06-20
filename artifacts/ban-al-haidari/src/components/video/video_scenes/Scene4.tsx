import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, x: '100px' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen"
        src={`${import.meta.env.BASE_URL}images/sacred-geometry.png`}
        initial={{ rotate: -15, scale: 1.5 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 15, ease: 'easeOut' }}
      />
      
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-10 px-[60px] py-[120px]">
        {/* Horizontal divider */}
        <motion.div 
          className="absolute top-1/2 left-[60px] right-[60px] h-[1px] bg-gold/30 -translate-y-1/2"
          initial={{ scaleX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        {/* Vertical divider */}
        <motion.div 
          className="absolute left-1/2 top-[120px] bottom-[120px] w-[1px] bg-gold/30 -translate-x-1/2"
          initial={{ scaleY: 0 }}
          animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Service 1 */}
        <div className="flex flex-col items-center justify-center text-center p-[40px]">
          <motion.div
            className="text-gold font-display italic text-[36px] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1 }}
          >
            I.
          </motion.div>
          <motion.h3
            className="text-cream font-display text-[64px] font-light leading-none mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Reiki Healing
          </motion.h3>
          <motion.p
            className="text-cream/60 text-[26px] font-light"
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            Channels universal life force energy to clear blockages
          </motion.p>
        </div>

        {/* Service 2 */}
        <div className="flex flex-col items-center justify-center text-center p-[40px]">
          <motion.div
            className="text-gold font-display italic text-[36px] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1 }}
          >
            II.
          </motion.div>
          <motion.h3
            className="text-cream font-display text-[64px] font-light leading-none mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Chakra Balancing
          </motion.h3>
          <motion.p
            className="text-cream/60 text-[26px] font-light"
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            Aligns your seven energy centers
          </motion.p>
        </div>

        {/* Service 3 */}
        <div className="flex flex-col items-center justify-center text-center p-[40px]">
          <motion.div
            className="text-gold font-display italic text-[36px] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1 }}
          >
            III.
          </motion.div>
          <motion.h3
            className="text-cream font-display text-[64px] font-light leading-none mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Quantum Work
          </motion.h3>
          <motion.p
            className="text-cream/60 text-[26px] font-light"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            Rewrites limiting patterns at the soul level
          </motion.p>
        </div>

        {/* Service 4 */}
        <div className="flex flex-col items-center justify-center text-center p-[40px]">
          <motion.div
            className="text-gold font-display italic text-[36px] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1 }}
          >
            IV.
          </motion.div>
          <motion.h3
            className="text-cream font-display text-[64px] font-light leading-none mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Distance Healing
          </motion.h3>
          <motion.p
            className="text-cream/60 text-[26px] font-light"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            Energy delivered regardless of location
          </motion.p>
        </div>

      </div>
    </motion.div>
  );
}