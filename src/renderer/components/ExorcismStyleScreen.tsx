import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState, ExorcismStyle } from '../store/appStore';
import bgTexture from '../../assets/images/bg_texture.png';
import guideImg from '../../assets/images/guide.png';
import cleanerImg from '../../assets/images/cleaner.png';
import enforcerImg from '../../assets/images/enforcer.png';

/**
 * ExorcismStyleScreen - Mode selection
 * Layout matches TitleScreen: centered content, same mist/vignette/corners
 */

interface ModeConfig {
  style: ExorcismStyle;
  modeLabel: string;
  coreLine: string;
  subLine: string;
  characterImg: string;
  accentColor: 'purple' | 'green' | 'red';
}

interface ModeCardProps extends ModeConfig {
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({
  modeLabel,
  coreLine,
  subLine,
  characterImg,
  isSelected,
  isFocused,
  onSelect,
  accentColor
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isHighlighted = isHovered || isFocused;

  const colors = {
    purple: {
      border: isSelected ? 'border-purple-400/60' : isHighlighted ? 'border-purple-400/40' : 'border-purple-900/20',
      text: 'text-purple-400',
      labelBg: 'bg-purple-900/50',
      glow: 'rgba(168,85,247,0.35)'
    },
    green: {
      border: isSelected ? 'border-green-400/60' : isHighlighted ? 'border-green-400/40' : 'border-green-900/20',
      text: 'text-green-400',
      labelBg: 'bg-green-900/50',
      glow: 'rgba(34,197,94,0.35)'
    },
    red: {
      border: isSelected ? 'border-red-400/60' : isHighlighted ? 'border-red-400/40' : 'border-red-900/20',
      text: 'text-red-400',
      labelBg: 'bg-red-900/50',
      glow: 'rgba(239,68,68,0.35)'
    }
  };

  const c = colors[accentColor];

  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative w-full h-full
        border ${c.border}
        bg-black/60 backdrop-blur-sm
        flex flex-col items-center
        rounded-lg
        transition-all duration-300
        px-4 pt-4 pb-5
      `}
    >
      {/* Mode label */}
      <div className={`px-4 py-1 rounded text-xs font-tech font-bold uppercase tracking-[0.15em] ${c.labelBg} ${c.text}`}>
        {modeLabel}
      </div>

      {/* CHARACTER - Large, dominant, POPS OUT on hover */}
      <div className="flex-1 w-full flex items-center justify-center relative my-3 overflow-visible">
        {/* Very subtle glow behind character on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={isHighlighted ? { opacity: 0.15 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(ellipse at center 70%, ${c.glow} 0%, transparent 60%)`,
            filter: 'blur(30px)'
          }}
        />
        <motion.img 
          src={characterImg} 
          alt={modeLabel}
          className="relative z-10 max-h-full max-w-full object-contain"
          style={{ 
            height: '100%',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
          }}
          animate={isHighlighted 
            ? { scale: 1.25, y: -20 } 
            : { scale: 1.05, y: 0 }
          }
          transition={{ duration: 0.35, ease: 'easeOut' }}
          draggable={false}
        />
      </div>

      {/* Text - tight to character */}
      <div className="text-center w-full px-3">
        <p className="text-white font-tech text-base font-bold leading-snug">
          {coreLine}
        </p>
        <p className="text-gray-300 font-tech text-sm mt-2 leading-relaxed">
          {subLine}
        </p>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${c.labelBg}`}
        >
          <span className={`text-[9px] font-bold ${c.text}`}>✓</span>
        </motion.div>
      )}
    </motion.button>
  );
};

export const ExorcismStyleScreen: React.FC = () => {
  const { transition } = useAppStore();
  const [selectedStyle, setSelectedStyle] = useState<ExorcismStyle | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null); // null = no keyboard focus yet

  const modes: ModeConfig[] = [
    {
      style: 'guided',
      modeLabel: 'Story',
      coreLine: 'Guided Ritual',
      subLine: 'Experience the exorcism as a story. Simulated files. Nothing real is touched.',
      characterImg: guideImg,
      accentColor: 'purple'
    },
    {
      style: 'swift',
      modeLabel: 'Tool',
      coreLine: 'Swift Purge',
      subLine: 'Clean up your real files fast. Bulk actions with undo support.',
      characterImg: cleanerImg,
      accentColor: 'green'
    },
    {
      style: 'confrontation',
      modeLabel: 'Interactive',
      coreLine: 'Interactive Mode',
      subLine: 'Real files with optional battles. Resolve by group or one at a time.',
      characterImg: enforcerImg,
      accentColor: 'red'
    }
  ];

  const handleSelectStyle = useCallback((style: ExorcismStyle) => {
    setSelectedStyle(style);
    setTimeout(() => {
      switch (style) {
        case 'guided': transition(AppState.STORY_MODE); break;
        case 'swift': transition(AppState.SWIFT_PURGE_TARGET); break;
        case 'confrontation': transition(AppState.INTERACTIVE_INTRO); break; // Interactive Mode
      }
    }, 200);
  }, [transition]);

  // Arrow key navigation and Enter selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // First arrow press starts at index 0, then wraps
        setFocusedIndex(prev => prev === null ? 0 : (prev - 1 + modes.length) % modes.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // First arrow press starts at index 0, then increments
        setFocusedIndex(prev => prev === null ? 0 : (prev + 1) % modes.length);
      } else if (e.key === 'Enter' && focusedIndex !== null) {
        e.preventDefault();
        handleSelectStyle(modes[focusedIndex].style);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, modes, handleSelectStyle]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 relative bg-black">
      {/* Background texture - same as TitleScreen */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-60 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Mist layers - matching TitleScreen */}
      <motion.div
        className="absolute z-[3] pointer-events-none"
        style={{ width: '90%', height: '70%', left: '-25%', bottom: '-15%' }}
        animate={{ x: ['0%', '35%', '0%'], y: ['0%', '-25%', '0%'] }}
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

      <motion.div
        className="absolute z-[3] pointer-events-none"
        style={{ width: '80%', height: '60%', right: '-20%', top: '-10%' }}
        animate={{ x: ['0%', '-30%', '0%'], y: ['0%', '20%', '0%'] }}
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

      <motion.div
        className="absolute z-[3] pointer-events-none"
        style={{ width: '60%', height: '50%', left: '20%', top: '25%' }}
        animate={{ x: ['-10%', '10%', '-10%'], y: ['-5%', '10%', '-5%'], rotate: [0, 3, 0] }}
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

      {/* Shared ritual ground - subtle floor under all three */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] z-[2] pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,8,18,0.85) 0%, rgba(10,12,10,0.4) 50%, transparent 100%)'
          }}
        />
        {/* Color accents at ground level */}
        <div className="absolute bottom-0 left-0 w-1/3 h-16 opacity-25" style={{ background: 'radial-gradient(ellipse at bottom, rgba(168,85,247,0.6), transparent 70%)', filter: 'blur(20px)' }} />
        <div className="absolute bottom-0 left-1/3 w-1/3 h-16 opacity-25" style={{ background: 'radial-gradient(ellipse at bottom, rgba(34,197,94,0.6), transparent 70%)', filter: 'blur(20px)' }} />
        <div className="absolute bottom-0 right-0 w-1/3 h-16 opacity-25" style={{ background: 'radial-gradient(ellipse at bottom, rgba(239,68,68,0.6), transparent 70%)', filter: 'blur(20px)' }} />
        {/* Ritual line */}
        <div 
          className="absolute bottom-8 left-[12%] right-[12%] h-px opacity-15"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.8) 20%, rgba(34,197,94,0.8) 50%, rgba(239,68,68,0.8) 80%, transparent)' }}
        />
      </div>

      {/* Vignette - same as TitleScreen */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.95) 100%)'
      }} />

      {/* Corner frames are now rendered globally in App.tsx */}

      {/* CONTENT - Centered cluster like TitleScreen */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[85vw] lg:max-w-5xl px-2 sm:px-4 justify-center">
        {/* Title - subtle, stepped back */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 font-tech text-sm tracking-[0.2em] uppercase mb-4 lg:mb-8"
        >
          Choose Your Path
        </motion.p>

        {/* MODE PANELS - Fixed height that leaves room for hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full grid grid-cols-3 gap-2 md:gap-4 lg:gap-8"
          style={{ height: 'calc(100vh - 220px)', maxHeight: '500px' }}
        >
          {modes.map((mode, i) => (
            <motion.div
              key={mode.style}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="h-full"
            >
              <ModeCard
                {...mode}
                isSelected={selectedStyle === mode.style}
                isFocused={focusedIndex !== null && focusedIndex === i}
                onSelect={() => handleSelectStyle(mode.style)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Keyboard hints - inside content flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center text-gray-400 font-tech text-[10px] md:text-xs tracking-wider gap-3 md:gap-6 mt-8 lg:mt-12 flex-shrink-0 pb-4"
        >
          <span className="flex items-center gap-1.5">
            <span className="border border-gray-600 px-2 py-1 rounded text-xs text-gray-300">←</span>
            <span className="border border-gray-600 px-2 py-1 rounded text-xs text-gray-300">→</span>
            <span className="ml-1">navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="border border-gray-600 px-2 py-1 rounded text-xs text-gray-300">ENTER</span>
            <span className="ml-1">select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="border border-gray-600 px-2 py-1 rounded text-xs text-gray-300">ESC</span>
            <span className="ml-1">return</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default ExorcismStyleScreen;
