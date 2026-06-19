import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';

const SCENE_DURATIONS = { 
  intro: 8000, 
  reveal: 9000, 
  about: 11000, 
  services1: 9500, 
  services2: 8500, 
  testimonial: 10000, 
  workshop: 8000, 
  outro: 10500 
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0B0710] font-sans" style={{ fontFamily: '"Jost", sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .text-gold { color: #C9A84C; }
        .bg-gold { background-color: #C9A84C; }
        .border-gold { border-color: #C9A84C; }
        .text-cream { color: #F0EAD6; }
      `}} />

      {/* Persistent background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[80vw] h-[80vw] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #3D1A6E, transparent)' }}
          animate={{ x: ['-20%', '10%', '-10%'], y: ['-10%', '20%', '-20%'], scale: [1, 1.2, 0.9] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[60vw] h-[60vw] rounded-full opacity-20 blur-[100px] right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
          animate={{ x: ['10%', '-20%', '10%'], y: ['10%', '-30%', '20%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <AnimatePresence mode="sync">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="reveal" />}
        {currentScene === 2 && <Scene3 key="about" />}
        {currentScene === 3 && <Scene4 key="services1" />}
        {currentScene === 4 && <Scene5 key="services2" />}
        {currentScene === 5 && <Scene6 key="testimonial" />}
        {currentScene === 6 && <Scene7 key="workshop" />}
        {currentScene === 7 && <Scene8 key="outro" />}
      </AnimatePresence>
    </div>
  );
}