import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import appIcon from '../../assets/images/appicon2.webm';
import bgTexture from '../../assets/images/bg_texture.png';

/**
 * TitleScreen - Atmospheric cyber-horror interface
 * 
 * Features: Subtle breathing glow, hover SFX, readable version text
 * Optimized for fullscreen without glitches
 */

export interface TitleScreenProps {
  onInitialize: () => void;
  className?: string;
}

/**
 * Typewriter effect component
 */
const TypewriterLine: React.FC<{ 
  text: string; 
  delay?: number; 
  className?: string;
  onComplete?: () => void;
}> = ({ text, delay = 0, className = '', onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 20 + Math.random() * 15); // Fast typewriter - 20ms base

    return () => clearInterval(interval);
  }, [started, text, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {started && displayedText.length < text.length && (
        <span className="animate-pulse">▌</span>
      )}
    </span>
  );
};

// Hover sound effect hook
const useHoverSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create oscillator-based hover sound
    const playHoverSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } catch (e) {
        // Audio not supported
      }
    };
    
    audioRef.current = { play: playHoverSound } as any;
  }, []);
  
  return () => audioRef.current?.play?.();
};

/**
 * Color-switching glitch text (purple/green) - no disappear
 */
const ColorGlitchText: React.FC<{ text: string; className?: string; style?: React.CSSProperties }> = ({ text, className = '', style = {} }) => {
  const [isGreen, setIsGreen] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const colorInterval = setInterval(() => {
      // Trigger glitch effect during color switch
      setGlitchActive(true);
      setOffset({ x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 5 });
      
      setTimeout(() => {
        setIsGreen(prev => !prev);
        setTimeout(() => setGlitchActive(false), 80);
      }, 60);
    }, 2500 + Math.random() * 2000);
    
    return () => clearInterval(colorInterval);
  }, []);

  const baseColor = isGreen ? 'text-green-400' : 'text-purple-500';

  return (
    <div className={`relative ${className} ${baseColor} transition-colors duration-150`} style={style}>
      <span className="absolute inset-0 text-purple-500/30" style={{ transform: 'translate(-2px, 0)' }}>{text}</span>
      <span className="absolute inset-0 text-green-400/30" style={{ transform: 'translate(2px, 0)' }}>{text}</span>
      <span className="relative z-10">{text}</span>
      {glitchActive && (
        <>
          <span className="absolute inset-0 text-green-400/90" style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}>{text}</span>
          <span className="absolute inset-0 text-purple-500/90" style={{ transform: `translate(${-offset.x}px, ${-offset.y}px)`, clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}>{text}</span>
        </>
      )}
    </div>
  );
};

/**
 * Glitch text with chromatic aberration
 */
const GlitchText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setOffset({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 3 });
      setTimeout(() => setGlitchActive(false), 80 + Math.random() * 100);
    }, 2000 + Math.random() * 2000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-0 text-red-500/20" style={{ transform: 'translate(-3px, 0)' }}>{text}</span>
      <span className="absolute inset-0 text-cyan-500/20" style={{ transform: 'translate(3px, 0)' }}>{text}</span>
      <span className="relative z-10">{text}</span>
      {glitchActive && (
        <>
          <span className="absolute inset-0 text-green-400/80" style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)' }}>{text}</span>
          <span className="absolute inset-0 text-purple-400/80" style={{ transform: `translate(${-offset.x}px, ${-offset.y}px)`, clipPath: 'polygon(0 66%, 100% 66%, 100% 100%, 0 100%)' }}>{text}</span>
        </>
      )}
    </div>
  );
};

const TitleScreen = forwardRef<HTMLDivElement, TitleScreenProps>(
  ({ onInitialize, className = '' }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const playHoverSound = useHoverSound();

    const handleMouseEnter = () => {
      setIsHovered(true);
      playHoverSound();
    };

    return (
      <div
        ref={ref}
        className={`h-screen w-screen overflow-hidden flex flex-col items-center justify-evenly p-6 relative bg-black ${className}`}
      >
        {/* === STATIC BACKGROUND - No animations === */}
        <img 
          src={bgTexture}
          alt=""
          className="absolute inset-0 z-0 w-full h-full object-cover opacity-60 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
          draggable={false}
        />
        
        {/* === MOVING MIST - Purple and Green - MORE VISIBLE === */}
        {/* Purple mist - bottom left, drifting diagonally */}
        <motion.div
          className="absolute z-[3] pointer-events-none"
          style={{ width: '90%', height: '70%', left: '-25%', bottom: '-15%' }}
          animate={{
            x: ['0%', '35%', '0%'],
            y: ['0%', '-25%', '0%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div 
            className="w-full h-full opacity-70"
            style={{
              background: 'radial-gradient(ellipse 80% 70% at 40% 70%, rgba(168,85,247,0.6) 0%, rgba(139,92,246,0.25) 40%, transparent 65%)',
              filter: 'blur(30px)'
            }}
          />
        </motion.div>

        {/* Green mist - top right, drifting diagonally opposite */}
        <motion.div
          className="absolute z-[3] pointer-events-none"
          style={{ width: '80%', height: '60%', right: '-20%', top: '-10%' }}
          animate={{
            x: ['0%', '-30%', '0%'],
            y: ['0%', '20%', '0%'],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <div 
            className="w-full h-full opacity-60"
            style={{
              background: 'radial-gradient(ellipse 75% 65% at 60% 40%, rgba(34,197,94,0.55) 0%, rgba(34,197,94,0.2) 45%, transparent 65%)',
              filter: 'blur(28px)'
            }}
          />
        </motion.div>

        {/* Purple mist - center, slow swirl */}
        <motion.div
          className="absolute z-[3] pointer-events-none"
          style={{ width: '60%', height: '50%', left: '20%', top: '25%' }}
          animate={{
            x: ['-10%', '10%', '-10%'],
            y: ['-5%', '10%', '-5%'],
            rotate: [0, 3, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        >
          <div 
            className="w-full h-full opacity-50"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.4) 0%, transparent 55%)',
              filter: 'blur(35px)'
            }}
          />
        </motion.div>

        {/* Green mist - bottom right, slow drift */}
        <motion.div
          className="absolute z-[3] pointer-events-none"
          style={{ width: '70%', height: '55%', right: '-15%', bottom: '0%' }}
          animate={{
            x: ['0%', '-20%', '0%'],
            y: ['0%', '-15%', '0%'],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        >
          <div 
            className="w-full h-full opacity-55"
            style={{
              background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(34,197,94,0.5) 0%, transparent 55%)',
              filter: 'blur(25px)'
            }}
          />
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-[2]" style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.95) 100%)'
        }} />

        {/* Corner frames are now rendered globally in App.tsx */}

        {/* === WARNING TEXT - Top Right with connector line from top === */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute top-0 right-12 z-[40] flex flex-col items-center"
        >
          {/* Connector line from top */}
          <div className="w-[1px] h-10 bg-gradient-to-b from-red-500/10 to-red-500/40" />
          {/* Warning box */}
          <div className="border border-orange-500/50 bg-black/80 px-4 py-3 rounded max-w-[320px]">
            <div className="flex items-start gap-2">
              <span className="text-orange-400 text-base">⚠</span>
              <p className="font-mono text-[11px] md:text-xs text-orange-400 leading-tight">
                WARNING: DIRECT INTERFACE WITH DEMONIC FILES MAY CAUSE DATA LOSS OR PSYCHOLOGICAL DAMAGE.
              </p>
            </div>
          </div>
        </motion.div>

        {/* === TERMINAL TEXT - Top Left with Typewriter Effect === */}
        <div className="absolute top-14 left-12 z-[40] font-mono text-xs md:text-sm leading-relaxed max-w-[500px] opacity-60">
          <p className="mb-1 text-green-500/80">
            <TypewriterLine text="> MOUNTING DRIVE C:/... " delay={500} />
            <TypewriterLine text="SUCCESS" delay={1800} className="text-green-400" />
          </p>
          <p className="mb-1 text-green-500/80 whitespace-nowrap">
            <TypewriterLine text="> SCANNING SECTOR 7G... " delay={2200} />
            <motion.span
              className="text-orange-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 4.5, duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
            >
              <TypewriterLine text="[WARNING: ANOMALY DETECTED]" delay={3500} className="text-orange-400" />
            </motion.span>
          </p>
          <p className="mb-1 text-green-500/80">
            <TypewriterLine text="> LOADING EXORCISM PROTOCOLS..." delay={4200} />
          </p>
          <p className="mb-1 text-green-500/80">
            <TypewriterLine text="> HOLY_WATER.EXE... " delay={5500} />
            <TypewriterLine text="LOADED" delay={6500} className="text-green-400" />
          </p>
          <p className="text-green-500/80">
            <TypewriterLine text="> CONNECTING TO SPIRIT REALM..." delay={7000} />
            <motion.span 
              className="text-green-400 ml-1"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 8 }}
            >
              ▌
            </motion.span>
          </p>
        </div>

        {/* === LOGO SECTION with subtle breathing === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10"
        >
          {/* Subtle breathing glow behind logo */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none -z-10"
            animate={{ opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 60%)',
              filter: 'blur(50px)'
            }}
          />

          {/* Logo video with tethers */}
          <motion.div 
            className="relative"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <video
              src={appIcon}
              autoPlay
              loop
              muted
              playsInline
              className="max-h-[30vh] w-auto object-contain mx-auto mb-4 relative z-10"
              style={{ filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.3))' }}
            />
          </motion.div>

          {/* === TETHERS - Entity monitoring lines (absolute positioned) === */}
          {/* Left tethers - green */}
          <motion.div
            className="absolute left-[5%] top-[35%] w-[40%] h-[1px]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0.2, 0.5, 0.2] }}
            transition={{ scaleX: { duration: 2, delay: 1.5 }, opacity: { duration: 5, repeat: Infinity } }}
            style={{ 
              transformOrigin: 'right',
              background: 'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.1) 30%, rgba(34,197,94,0.4) 100%)',
              boxShadow: '0 0 8px rgba(34,197,94,0.3)'
            }}
          />
          <motion.div
            className="absolute left-[8%] top-[42%] w-[35%] h-[1px]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0.15, 0.4, 0.15] }}
            transition={{ scaleX: { duration: 2.5, delay: 2 }, opacity: { duration: 6, repeat: Infinity, delay: 0.5 } }}
            style={{ 
              transformOrigin: 'right',
              background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.1) 40%, rgba(74,222,128,0.35) 100%)',
              boxShadow: '0 0 6px rgba(34,197,94,0.2)'
            }}
          />
          <motion.div
            className="absolute left-[12%] top-[48%] w-[30%] h-[1px]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0.1, 0.3, 0.1] }}
            transition={{ scaleX: { duration: 3, delay: 2.5 }, opacity: { duration: 7, repeat: Infinity, delay: 1 } }}
            style={{ 
              transformOrigin: 'right',
              background: 'linear-gradient(90deg, transparent 0%, rgba(134,239,172,0.1) 50%, rgba(134,239,172,0.25) 100%)',
              boxShadow: '0 0 4px rgba(34,197,94,0.15)'
            }}
          />

          {/* Right tethers - purple */}
          <motion.div
            className="absolute right-[5%] top-[35%] w-[40%] h-[1px]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0.25, 0.55, 0.25] }}
            transition={{ scaleX: { duration: 2, delay: 1.7 }, opacity: { duration: 5.5, repeat: Infinity, delay: 0.3 } }}
            style={{ 
              transformOrigin: 'left',
              background: 'linear-gradient(270deg, transparent 0%, rgba(168,85,247,0.1) 30%, rgba(168,85,247,0.45) 100%)',
              boxShadow: '0 0 8px rgba(168,85,247,0.3)'
            }}
          />
          <motion.div
            className="absolute right-[8%] top-[42%] w-[35%] h-[1px]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0.2, 0.45, 0.2] }}
            transition={{ scaleX: { duration: 2.5, delay: 2.2 }, opacity: { duration: 6.5, repeat: Infinity, delay: 0.8 } }}
            style={{ 
              transformOrigin: 'left',
              background: 'linear-gradient(270deg, transparent 0%, rgba(192,132,252,0.1) 40%, rgba(192,132,252,0.4) 100%)',
              boxShadow: '0 0 6px rgba(168,85,247,0.25)'
            }}
          />
          <motion.div
            className="absolute right-[12%] top-[48%] w-[30%] h-[1px]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0.15, 0.35, 0.15] }}
            transition={{ scaleX: { duration: 3, delay: 2.8 }, opacity: { duration: 7.5, repeat: Infinity, delay: 1.2 } }}
            style={{ 
              transformOrigin: 'left',
              background: 'linear-gradient(270deg, transparent 0%, rgba(216,180,254,0.1) 50%, rgba(216,180,254,0.3) 100%)',
              boxShadow: '0 0 4px rgba(168,85,247,0.2)'
            }}
          />

          {/* Title */}
          <div className="flex flex-col items-center">
            <ColorGlitchText text="THE" className="text-2xl md:text-3xl lg:text-4xl font-darkhorse4 tracking-[0.5em] mb-2" />
            <div className="flex items-baseline justify-center gap-4">
              <GlitchText text="DIGITAL" className="text-5xl md:text-6xl lg:text-7xl font-darkhorse text-green-400 tracking-wider" />
              <GlitchText text="EXORCIST" className="text-5xl md:text-6xl lg:text-7xl font-darkhorse text-purple-500 tracking-wider" />
            </div>
          </div>

          {/* Subtitle - below title */}
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-[#D8B4FE] text-sm tracking-[0.3em] uppercase mt-4 font-mono"
            style={{ textShadow: '0 0 10px rgba(216,180,254,0.6), 0 0 20px rgba(168,85,247,0.3)' }}
          >
            [ FILE MANAGEMENT SYSTEM ]
          </motion.p>
        </motion.div>

        {/* === BUTTON with hover SFX and breathing === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative z-10 -mt-20"
        >
          {/* Button glow */}
          <motion.div
            className="absolute inset-0 -z-10"
            animate={{
              opacity: isHovered ? [0.5, 0.8, 0.5] : [0.2, 0.35, 0.2],
              scale: isHovered ? 1.3 : 1.1
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }}
          />
          
          <motion.button
            onClick={onInitialize}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: isHovered 
                ? '0 0 50px rgba(34,197,94,0.8), inset 0 0 30px rgba(34,197,94,0.3)'
                : ['0 0 15px rgba(34,197,94,0.4)', '0 0 30px rgba(34,197,94,0.6)', '0 0 15px rgba(34,197,94,0.4)'],
              borderColor: isHovered ? '#22c55e' : ['#22c55e', '#4ade80', '#22c55e']
            }}
            transition={{ duration: 1.5, repeat: isHovered ? 0 : Infinity }}
            className={`relative px-10 py-4 md:px-12 md:py-5 border-2 font-creepster text-xl md:text-2xl tracking-widest uppercase transition-all duration-200 ${
              isHovered 
                ? 'bg-green-500 text-black border-green-400' 
                : 'bg-black/80 text-green-400 border-green-500'
            }`}
            style={{
              clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)'
            }}
          >
            <motion.span 
              className="relative font-bold"
              animate={isHovered ? {} : { 
                textShadow: ['0 0 5px rgba(34,197,94,0.5)', '0 0 15px rgba(34,197,94,1)', '0 0 5px rgba(34,197,94,0.5)']
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              BEGIN EXORCISM
            </motion.span>
          </motion.button>
          
          <motion.p 
            className="text-center text-green-400 font-mono text-sm mt-4 tracking-widest"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            [ Press ENTER ]
          </motion.p>
        </motion.div>

        {/* Version - bottom left corner */}
        <div className="fixed bottom-10 left-12 z-[9999]">
          <p 
            className="text-base font-mono text-green-400 font-bold tracking-wider"
            style={{ textShadow: '0 0 10px rgba(34,197,94,1), 0 0 20px rgba(34,197,94,0.6)' }}
          >
            V0.1.0
          </p>
        </div>
      </div>
    );
  }
);

TitleScreen.displayName = 'TitleScreen';

export default TitleScreen;
