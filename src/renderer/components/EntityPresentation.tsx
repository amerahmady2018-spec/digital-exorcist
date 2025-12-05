import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { StoryEntity, ThreatLevel } from '../data/storyEntities';
import type { MonsterType } from '../../shared/types';
import { playExorcismSound, playHoverSound } from '../utils/soundEffects';

// Import monster images
import ghostImage from '../../assets/images/ghost.png';
import demonImage from '../../assets/images/demon.png';
import zombieImage from '../../assets/images/zombie.png';
import bgTexture from '../../assets/images/bg_texture.png';

/**
 * EntityPresentation - Displays a story entity with full details
 * 
 * Shows entity image, name, type badge, HP, threat level, and lore.
 * Includes progress indicator and action buttons (FIGHT/Skip).
 * Uses Framer Motion for dramatic entrance animations.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

export interface EntityPresentationProps {
  /** The entity to display */
  entity: StoryEntity;
  /** Current entity index (0-based) - optional for backward compat */
  currentIndex?: number;
  /** Total number of entities - optional for backward compat */
  totalEntities?: number;
  /** Callback when INITIATE EXORCISM button is clicked */
  onFight: () => void;
  /** Callback when Skip button is clicked (deprecated - no longer used) */
  onSkip?: () => void;
  /** Callback when Back button is clicked (optional) */
  onBack?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Map monster types to images
const monsterImages: Record<MonsterType, string> = {
  ghost: ghostImage,
  demon: demonImage,
  zombie: zombieImage,
};

// Map monster types to colors - consistent with StoryOverview
const monsterColors: Record<MonsterType, { bg: string; border: string; text: string; glow: string; textColor: string }> = {
  ghost: {
    bg: 'bg-cyan-900/30',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
    glow: 'rgba(6, 182, 212, 0.8)',
    textColor: '#22d3ee', // cyan-400
  },
  demon: {
    bg: 'bg-red-900/30',
    border: 'border-red-500',
    text: 'text-red-400',
    glow: 'rgba(239, 68, 68, 0.8)',
    textColor: '#f87171', // red-400
  },
  zombie: {
    bg: 'bg-green-900/30',
    border: 'border-green-500',
    text: 'text-green-400',
    glow: 'rgba(34, 197, 94, 0.8)',
    textColor: '#4ade80', // green-400
  },
};

// Map threat levels to colors
const threatColors: Record<ThreatLevel, string> = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-red-400',
};

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  } else if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

/**
 * Decrypt/Scramble text effect component
 * Text appears scrambled and "decrypts" to reveal the real text
 * Shows "DECRYPTING..." status while decoding
 */
const DecryptText: React.FC<{
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  color?: string;
}> = ({ text, delay = 0, duration = 800, className = '', color = '#22d3ee' }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [progress, setProgress] = useState(0);
  const chars = '█▓▒░@#$%&*!?<>[]{}0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  useEffect(() => {
    // Generate initial scrambled text
    const scrambled = text.split('').map(c => 
      c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    setDisplayText(scrambled);
    setIsDecrypting(true);
    setProgress(0);
    
    const startTime = Date.now() + delay;
    const textLength = text.length;
    let animationId: number;
    
    const getScrambledChar = (index: number, prog: number): string => {
      // Keep spaces and punctuation
      if (text[index] === ' ' || text[index] === '.' || text[index] === ',' || text[index] === "'") {
        return text[index];
      }
      
      // Wave-like reveal from left to right
      const charThreshold = (index / textLength) * 0.6;
      if (prog > charThreshold + 0.4) {
        return text[index];
      }
      
      // Random character with occasional flicker to correct char
      if (Math.random() > 0.6 && prog > charThreshold) {
        return text[index];
      }
      
      return chars[Math.floor(Math.random() * chars.length)];
    };
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed < 0) {
        // Still in delay - show scrambled
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const prog = Math.min(elapsed / duration, 1);
      setProgress(prog);
      
      // Build the display text
      let result = '';
      for (let i = 0; i < textLength; i++) {
        result += getScrambledChar(i, prog);
      }
      
      setDisplayText(result);
      
      if (prog < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setIsDecrypting(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, Math.max(0, delay));
    
    return () => {
      clearTimeout(timeoutId);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [text, delay, duration, chars]);
  
  return (
    <div className="relative">
      {/* Decrypting status label */}
      {isDecrypting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center mb-2"
        >
          <span 
            className="font-mono text-[10px] tracking-widest uppercase"
            style={{ color }}
          >
            {'>'} DECRYPTING FILE SIGNATURE... [{Math.floor(progress * 100)}%]
          </span>
        </motion.div>
      )}
      
      {/* Decrypted label when done */}
      {!isDecrypting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-2"
        >
          <span 
            className="font-mono text-[10px] tracking-widest uppercase"
            style={{ color }}
          >
            {'>'} FILE ANALYSIS COMPLETE
          </span>
        </motion.div>
      )}
      
      <motion.p
        data-testid="entity-lore"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay / 1000, duration: 0.3 }}
        className={className}
      >
        {displayText}
      </motion.p>
    </div>
  );
};

const EntityPresentation: React.FC<EntityPresentationProps> = ({
  entity,
  currentIndex,
  totalEntities,
  onFight,
  onBack,
  className = '',
}) => {
  const colors = monsterColors[entity.type];
  const image = monsterImages[entity.type];
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Dispatch custom events when button hover state changes (for MusicToggle)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('exorcism-button-hover', { detail: { isHovered: isButtonHovered } }));
    
    // Also dispatch story-mode-theme to override entity color with red on hover
    if (isButtonHovered) {
      window.dispatchEvent(new CustomEvent('story-mode-theme', { detail: { theme: 'red' } }));
    } else {
      // Return to entity-specific color
      const theme = entity.type === 'ghost' ? 'cyan' : entity.type === 'zombie' ? 'green' : 'red';
      window.dispatchEvent(new CustomEvent('story-mode-theme', { detail: { theme } }));
    }
  }, [isButtonHovered, entity.type]);

  return (
    <motion.div
      data-testid="entity-presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden ${className}`}
    >
      {/* Background texture - same as StoryOverview */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-20 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Purple mist - subtle, same as StoryOverview */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '80%', height: '60%', left: '-20%', bottom: '-10%' }}
        animate={{ x: ['0%', '25%', '0%'], y: ['0%', '-15%', '0%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-full h-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 40% 70%, rgba(168,85,247,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 65%)',
            filter: 'blur(40px)'
          }}
        />
      </motion.div>

      {/* Atmospheric background glow - entity color */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[2]"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow.replace('0.8', '0.15')} 0%, transparent 60%)`,
        }}
      />

      {/* Vignette overlay - turns red when button hovered (RED SHIFT effect) */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[3]"
        animate={{ 
          opacity: isButtonHovered ? 1 : 1,
        }}
        transition={{ duration: 0.2 }}
        style={{
          background: isButtonHovered 
            ? 'radial-gradient(ellipse at center, transparent 20%, rgba(60,0,0,0.6) 60%, rgba(80,0,0,0.85) 85%, rgba(40,0,0,0.95) 100%)'
            : 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.95) 100%)',
        }}
      />
      
      {/* Red alarm glow overlay - only visible on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[3]"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isButtonHovered ? [0.3, 0.5, 0.3] : 0,
        }}
        transition={{ 
          duration: isButtonHovered ? 0.5 : 0.2, 
          repeat: isButtonHovered ? Infinity : 0,
          ease: 'easeInOut'
        }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(239, 68, 68, 0.15) 70%, rgba(180, 30, 30, 0.3) 100%)',
        }}
      />

      {/* Corner frames - entity color normally, red + VIBRATING when button hovered (high voltage effect) */}
      <div className="absolute inset-0 pointer-events-none z-[4]">
        {/* Top left */}
        <motion.div 
          className="absolute top-12 left-8"
          style={{ width: 48, height: 48 }}
          animate={isButtonHovered ? { 
            x: [0, -1, 2, -2, 1, -1, 2, 0],
            y: [0, 1, -1, 2, -2, 1, -1, 0],
          } : {}}
          transition={{ duration: 0.15, repeat: isButtonHovered ? Infinity : 0 }}
        >
          <div 
            className="absolute inset-0 border-l-2 border-t-2 transition-colors duration-200" 
            style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 1)' : colors.glow.replace('0.8', '0.5') }}
          />
          <div 
            className="absolute border-l-2 border-t-2 transition-colors duration-200" 
            style={{ top: '3px', left: '3px', right: '3px', bottom: '3px', borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.6)' : colors.glow.replace('0.8', '0.35') }}
          />
        </motion.div>
        {/* Top right */}
        <motion.div 
          className="absolute top-12 right-8"
          style={{ width: 48, height: 48 }}
          animate={isButtonHovered ? { 
            x: [0, 2, -1, 1, -2, 2, -1, 0],
            y: [0, -1, 2, -1, 1, -2, 1, 0],
          } : {}}
          transition={{ duration: 0.12, repeat: isButtonHovered ? Infinity : 0 }}
        >
          <div 
            className="absolute inset-0 border-r-2 border-t-2 transition-colors duration-200" 
            style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 1)' : colors.glow.replace('0.8', '0.5') }}
          />
          <div 
            className="absolute border-r-2 border-t-2 transition-colors duration-200" 
            style={{ top: '3px', left: '3px', right: '3px', bottom: '3px', borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.6)' : colors.glow.replace('0.8', '0.35') }}
          />
        </motion.div>
        {/* Bottom left */}
        <motion.div 
          className="absolute bottom-8 left-8"
          style={{ width: 48, height: 48 }}
          animate={isButtonHovered ? { 
            x: [0, 1, -2, 1, -1, 2, -2, 0],
            y: [0, 2, -1, -2, 1, -1, 2, 0],
          } : {}}
          transition={{ duration: 0.13, repeat: isButtonHovered ? Infinity : 0 }}
        >
          <div 
            className="absolute inset-0 border-l-2 border-b-2 transition-colors duration-200" 
            style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 1)' : colors.glow.replace('0.8', '0.5') }}
          />
          <div 
            className="absolute border-l-2 border-b-2 transition-colors duration-200" 
            style={{ top: '3px', left: '3px', right: '3px', bottom: '3px', borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.6)' : colors.glow.replace('0.8', '0.35') }}
          />
        </motion.div>
        {/* Bottom right */}
        <motion.div 
          className="absolute bottom-8 right-8"
          style={{ width: 48, height: 48 }}
          animate={isButtonHovered ? { 
            x: [0, -2, 1, -1, 2, -1, 1, 0],
            y: [0, 1, -2, 2, -1, 1, -2, 0],
          } : {}}
          transition={{ duration: 0.14, repeat: isButtonHovered ? Infinity : 0 }}
        >
          <div 
            className="absolute inset-0 border-r-2 border-b-2 transition-colors duration-200" 
            style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 1)' : colors.glow.replace('0.8', '0.5') }}
          />
          <div 
            className="absolute border-r-2 border-b-2 transition-colors duration-200" 
            style={{ top: '3px', left: '3px', right: '3px', bottom: '3px', borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.6)' : colors.glow.replace('0.8', '0.35') }}
          />
        </motion.div>

      </div>

      {/* Back button removed - use ESC key instead */}

      {/* Progress indicator (optional, for backward compat) */}
      {typeof currentIndex === 'number' && typeof totalEntities === 'number' && (
        <motion.div
          data-testid="progress-indicator"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
        >
          <span className="text-gray-400 font-tech text-sm tracking-widest uppercase">
            Entity <span className="text-purple-400" data-testid="current-index">{currentIndex + 1}</span> of{' '}
            <span className="text-purple-400" data-testid="total-entities">{totalEntities}</span>
          </span>
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-3xl w-full">
        {/* Entity image with targeting frame - frame stays still, monster floats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 100 }}
          className="flex justify-center mb-6"
        >
          <div className="relative w-72 h-72 md:w-80 md:h-80">
            {/* Monster image - unique idle and panic animation per type (z-10) */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              animate={isButtonHovered ? (
                entity.type === 'ghost' ? {
                  // Ghost panic: flickering fade, trying to escape
                  y: [0, -30, -10, -40, -5, -25, 0],
                  x: [0, 15, -20, 10, -15, 20, 0],
                  rotate: [0, 10, -15, 8, -12, 5, 0],
                  scale: [1, 0.9, 1.1, 0.85, 1.05, 0.95, 1],
                  opacity: [1, 0.4, 0.9, 0.3, 0.8, 0.5, 1],
                } : entity.type === 'demon' ? {
                  // Demon panic: glitch effect - stays mostly still with sudden micro-jumps
                  y: 0,
                  x: [0, 0, 0, -3, 0, 0, 4, 0, 0, -2, 0],
                  rotate: 0,
                  scale: [1, 1, 1.02, 1, 1, 0.98, 1, 1.03, 1, 1, 1],
                  opacity: [1, 1, 0.7, 1, 1, 0.5, 1, 1, 0.8, 1, 1],
                } : {
                  // Zombie panic: convulsing, twitching like reanimated corpse
                  y: [0, -5, 2, -3, 0],
                  x: [0, -15, 18, -12, 15, -10, 0],
                  rotate: [0, 8, -10, 12, -8, 6, 0],
                  scale: [1, 1.02, 0.98, 1.03, 0.97, 1],
                }
              ) : entity.type === 'ghost' ? {
                // Ghost idle: ethereal floating with slight fade
                y: [0, -15, 0],
                x: [0, 3, 0, -3, 0],
                rotate: [0, 2, 0, -2, 0],
                scale: 1,
                opacity: [0.9, 1, 0.9],
              } : entity.type === 'zombie' ? {
                // Zombie idle: shambling side-to-side with head tilt
                y: [0, -3, 0, -2, 0],
                x: [0, 8, 0, -8, 0],
                rotate: [0, -3, 0, 3, 0],
                scale: 1,
              } : {
                // Demon idle: aggressive pulsing with menacing presence
                y: [0, -5, 0],
                x: 0,
                rotate: [0, -1, 0, 1, 0],
                scale: [1, 1.05, 1, 1.03, 1],
              }}
              transition={isButtonHovered ? (
                entity.type === 'ghost' ? {
                  duration: 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                } : entity.type === 'demon' ? {
                  // Demon: fast glitch with random timing feel
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'linear',
                } : {
                  // Zombie: slower, more deliberate twitching
                  duration: 0.5,
                  repeat: Infinity,
                  ease: 'linear',
                }
              ) : entity.type === 'ghost' ? {
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                x: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              } : entity.type === 'zombie' ? {
                y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                x: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              } : {
                // Demon
                y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              {/* Chromatic aberration layers - only visible on hover */}
              {isButtonHovered && (
                <>
                  {/* Red channel - offset left */}
                  <motion.img
                    src={image}
                    alt=""
                    className={`absolute object-contain pointer-events-none ${entity.type === 'zombie' ? 'w-64 h-64 md:w-80 md:h-80' : 'w-48 h-48 md:w-56 md:h-56'}`}
                    style={{
                      filter: 'brightness(1) saturate(0) brightness(0.8)',
                      mixBlendMode: 'multiply',
                      opacity: 0.7,
                    }}
                    animate={{ x: [-3, -5, -2, -4, -3], y: [1, -1, 2, -2, 1] }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                  />
                  {/* Cyan channel - offset right */}
                  <motion.img
                    src={image}
                    alt=""
                    className={`absolute object-contain pointer-events-none ${entity.type === 'zombie' ? 'w-64 h-64 md:w-80 md:h-80' : 'w-48 h-48 md:w-56 md:h-56'}`}
                    style={{
                      filter: 'brightness(1) saturate(0) brightness(0.8)',
                      mixBlendMode: 'screen',
                      opacity: 0.5,
                    }}
                    animate={{ x: [3, 5, 2, 4, 3], y: [-1, 1, -2, 2, -1] }}
                    transition={{ duration: 0.08, repeat: Infinity }}
                  />
                </>
              )}
              <img
                data-testid="entity-image"
                src={image}
                alt={entity.name}
                className={`object-contain ${entity.type === 'zombie' ? 'w-64 h-64 md:w-80 md:h-80' : 'w-48 h-48 md:w-56 md:h-56'}`}
                style={{
                  filter: isButtonHovered 
                    ? `drop-shadow(0 0 40px rgba(239, 68, 68, 0.8)) drop-shadow(0 0 80px rgba(239, 68, 68, 0.4)) brightness(1.1)`
                    : `drop-shadow(0 0 30px ${colors.glow}) drop-shadow(0 0 60px ${colors.glow.replace('0.8', '0.4')})`,
                }}
              />
            </motion.div>

            {/* Scanning line - separate from targeting frame, full width (z-25 = above frame) */}
            <motion.div
              className="absolute left-0 right-0 pointer-events-none transition-all duration-200"
              style={{ 
                zIndex: 25,
                height: isButtonHovered ? '2px' : '1px',
                backgroundColor: isButtonHovered ? 'rgba(255, 255, 255, 0.95)' : colors.glow.replace('0.8', '0.6'),
                boxShadow: isButtonHovered 
                  ? '0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 0.8), 0 0 45px rgba(239, 68, 68, 0.6)' 
                  : `0 0 8px ${colors.glow}`,
              }}
              animate={{ y: [0, 286, 0] }}
              transition={{ duration: isButtonHovered ? 0.4 : 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Animated Targeting Frame - pulses/scales subtly, turns red when button hovered (z-20 = above monster) */}
            <motion.div 
              className="absolute inset-0 pointer-events-none z-20"
              animate={isButtonHovered ? {
                scale: [1, 1.05, 1],
                opacity: [0.9, 1, 0.9],
              } : {
                scale: [1, 1.02, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: isButtonHovered ? 0.5 : 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Corner brackets - cyan normally, red when hovered */}
              <div 
                className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 transition-colors duration-300" 
                style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.8)' : colors.glow }} 
              />
              <div 
                className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 transition-colors duration-300" 
                style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.8)' : colors.glow }} 
              />
              <div 
                className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 transition-colors duration-300" 
                style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.8)' : colors.glow }} 
              />
              <div 
                className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 transition-colors duration-300" 
                style={{ borderColor: isButtonHovered ? 'rgba(239, 68, 68, 0.8)' : colors.glow }} 
              />
              
              {/* Target label - positioned at bottom between corners, cyan normally, red when hovered */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: isButtonHovered ? 0.3 : 2, repeat: Infinity }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest uppercase transition-colors duration-300 whitespace-nowrap"
                style={{ 
                  color: isButtonHovered ? 'rgba(239, 68, 68, 1)' : colors.glow,
                  textShadow: isButtonHovered 
                    ? '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.4)' 
                    : `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow.replace('0.8', '0.4')}`,
                }}
              >
                {isButtonHovered ? '[ INITIATING... ]' : '[ TARGET LOCKED ]'}
              </motion.div>
            </motion.div>
            
            {/* Glow ring */}
            <div
              className="absolute inset-0 -z-10 blur-3xl"
              style={{
                background: `radial-gradient(circle, ${colors.glow.replace('0.8', '0.4')} 0%, transparent 70%)`,
              }}
            />
          </div>
        </motion.div>

        {/* Entity name */}
        <motion.h2
          data-testid="entity-name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-3xl md:text-4xl font-creepster text-center text-white mb-4 tracking-wider"
          style={{
            textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow.replace('0.8', '0.3')}`,
          }}
        >
          {entity.name}
        </motion.h2>

        {/* Type badge, HP, and Threat Level */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex justify-center items-center gap-6 mb-6 flex-wrap"
        >
          {/* Type badge */}
          <span
            data-testid="entity-type-badge"
            className={`px-4 py-1 text-sm font-tech font-bold ${colors.bg} ${colors.border} ${colors.text} border-2 uppercase tracking-wider`}
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            {entity.type}
          </span>

          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-tech text-xs uppercase">Size:</span>
            <span data-testid="entity-size" className="text-white font-tech font-bold text-lg">
              {formatFileSize(entity.fakeFileSize)}
            </span>
          </div>

          {/* Threat Level */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-tech text-xs uppercase">Threat:</span>
            <span
              data-testid="entity-threat-level"
              className={`font-tech font-bold text-lg ${threatColors[entity.threatLevel]}`}
            >
              {entity.threatLevel}
            </span>
          </div>
        </motion.div>

        {/* Lore with decrypt effect - slower for dramatic effect */}
        <DecryptText 
          text={entity.lore} 
          delay={900} 
          duration={2500}
          color={colors.textColor}
          className="text-gray-300 text-base md:text-lg leading-relaxed font-mono text-center mb-10 px-4"
        />

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex justify-center"
        >
          {/* INITIATE EXORCISM button */}
          <motion.button
            data-testid="fight-button"
            onClick={() => {
              playExorcismSound();
              onFight();
            }}
            onMouseEnter={() => {
              setIsButtonHovered(true);
              playHoverSound();
            }}
            onMouseLeave={() => setIsButtonHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-red-600/20 border-2 border-red-500 text-red-300 
                       font-mono text-lg md:text-xl tracking-widest uppercase
                       hover:bg-red-500 hover:text-white transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(239,68,68,0.4), inset 0 0 20px rgba(239,68,68,0.1)',
              clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
            }}
          >
            [ INITIATE EXORCISM ]
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EntityPresentation;
