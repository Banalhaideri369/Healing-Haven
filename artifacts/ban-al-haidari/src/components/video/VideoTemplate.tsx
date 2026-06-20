import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { useState, useEffect } from 'react';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';

const SCENE_DURATIONS = {
  intro: 6000,
  reveal: 8000,
  philosophy: 8000,
  services: 10000,
  testimonial: 8000,
  outro: 7000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setScale(Math.min(window.innerHeight / 1920, window.innerWidth / 1080));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black overflow-hidden font-sans" style={{ fontFamily: '"Jost", sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .text-gold { color: #C9A84C; }
        .bg-gold { background-color: #C9A84C; }
        .border-gold { border-color: #C9A84C; }
        .text-cream { color: #F0EAD6; }
      `}} />

      <div style={{ width: 1080 * scale, height: 1920 * scale, position: 'relative', flexShrink: 0 }}>
        <div 
          className="relative bg-[#0B0710] overflow-hidden" 
          style={{ 
            width: 1080, 
            height: 1920, 
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
        {/* Persistent background layers */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
            style={{ background: 'radial-gradient(circle, #3D1A6E, transparent)' }}
            animate={{ x: ['-20%', '10%', '-10%'], y: ['-10%', '20%', '-20%'], scale: [1, 1.2, 0.9] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] right-0 bottom-0"
            style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
            animate={{ x: ['10%', '-20%', '10%'], y: ['10%', '-30%', '20%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <AnimatePresence mode="sync">
          {currentScene === 0 && <Scene1 key="intro" />}
          {currentScene === 1 && <Scene2 key="reveal" />}
          {currentScene === 2 && <Scene3 key="philosophy" />}
          {currentScene === 3 && <Scene4 key="services" />}
          {currentScene === 4 && <Scene5 key="testimonial" />}
          {currentScene === 5 && <Scene6 key="outro" />}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}