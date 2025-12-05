import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { StoryEntity } from '../data/storyEntities';
import type { EntityResult } from '../hooks/useStoryMode';
import bgTexture from '../../assets/images/bg_texture.png';

/**
 * Glitch Title Component - Text with periodic glitch effect
 */
const GlitchTitle: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Periodic glitches
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        setGlitchActive(true);
        setOffset({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 3 });
        setTimeout(() => setGlitchActive(false), 100 + Math.random() * 100);
      }
    }, 2000 + Math.random() * 2000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Chromatic aberration layers - subtle */}
      <span 
        className="absolute inset-0 text-red-500/20" 
        style={{ transform: glitchActive ? `translate(${-2 + offset.x}px, ${offset.y}px)` : 'translate(-1px, 0)' }}
      >
        {text}
      </span>
      <span 
        className="absolute inset-0 text-cyan-500/20" 
        style={{ transform: glitchActive ? `translate(${2 + offset.x}px, ${-offset.y}px)` : 'translate(1px, 0)' }}
      >
        {text}
      </span>
      
      {/* Main text */}
      <span className="relative z-10">{text}</span>
      
      {/* Glitch slice */}
      {glitchActive && (
        <span 
          className="absolute inset-0 text-green-300" 
          style={{ 
            transform: `translate(${offset.x * 2}px, ${offset.y}px)`, 
            clipPath: 'polygon(0 40%, 100% 40%, 100% 60%, 0 60%)' 
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

/**
 * StoryOverview - Mission Hub for story entities
 * 
 * Features:
 * - File paths displayed under monster names
 * - Status indicators (PURGED, IGNORED stamps)
 * - HP bar shows file size instead of HP
 * - Hover effects with glitch and sound
 * - Terminal-style subtitle
 */

export interface StoryOverviewProps {
  entities: StoryEntity[];
  results: EntityResult[];
  onSelectEntity: (entityId: string) => void;
  onFinish: () => void;
  className?: string;
}

const typeColors = {
  ghost: {
    border: 'border-cyan-500/50',
    glow: 'rgba(6,182,212,0.4)',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    hoverGlow: '0 0 40px rgba(6,182,212,0.6), 0 0 80px rgba(6,182,212,0.3)',
  },
  demon: {
    border: 'border-red-500/50',
    glow: 'rgba(239,68,68,0.4)',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    hoverGlow: '0 0 40px rgba(239,68,68,0.6), 0 0 80px rgba(239,68,68,0.3)',
  },
  zombie: {
    border: 'border-green-500/50',
    glow: 'rgba(34,197,94,0.4)',
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    hoverGlow: '0 0 40px rgba(34,197,94,0.6), 0 0 80px rgba(34,197,94,0.3)',
  },
};

const outcomeStyles = {
  banished: {
    overlay: 'bg-black/90',
    stamp: '[PURGED]',
    stampColor: 'text-purple-400 border-purple-500',
    showStatic: true,
  },
  skipped: {
    overlay: 'bg-black/70',
    stamp: '[IGNORED]',
    stampColor: 'text-yellow-400 border-yellow-500',
    showStatic: false,
  },
  survived: {
    overlay: 'bg-black/80',
    stamp: '[SURVIVED]',
    stampColor: 'text-red-400 border-red-500',
    showStatic: false,
  },
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
 * Create hover sound for each monster type
 */
const createHoverSound = (type: 'ghost' | 'demon' | 'zombie'): (() => void) => {
  let audioContext: AudioContext | null = null;
  
  return () => {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      if (type === 'ghost') {
        // Whisper - high frequency, quiet
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      } else if (type === 'demon') {
        // Heavy rumble - low frequency
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(60, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
      } else {
        // Zombie groan - mid frequency wobble
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
      // Silently fail
    }
  };
};

/**
 * Entity Card Component with all the juice
 */
const EntityCard: React.FC<{
  entity: StoryEntity;
  result: EntityResult | undefined;
  colors: typeof typeColors.ghost;
  onSelect: () => void;
  index: number;
  isLocked: boolean;
  level: number;
}> = ({ entity, result, colors, onSelect, index, isLocked, level }) => {
  const isDealtWith = !!result;
  const outcome = result ? outcomeStyles[result.outcome] : null;
  const hoverSoundRef = useRef<(() => void) | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [glitchActive, setGlitchActive] = React.useState(false);

  // Can interact only if not dealt with and not locked
  const canInteract = !isDealtWith && !isLocked;

  // Initialize hover sound
  useEffect(() => {
    hoverSoundRef.current = createHoverSound(entity.type);
  }, [entity.type]);

  const handleMouseEnter = useCallback(() => {
    if (!canInteract) return;
    setIsHovered(true);
    // Trigger glitch
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 200);
    // Play sound
    if (hoverSoundRef.current) {
      hoverSoundRef.current();
    }
  }, [canInteract]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const fileSize = formatFileSize(entity.fakeFileSize);

  // Get lock message based on level
  const getLockMessage = () => {
    if (level === 2) return 'CONFRONT THE GHOST FIRST';
    if (level === 3) return 'ADVANCED JUDGMENT LOCKED';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
      whileHover={canInteract ? { y: -5 } : {}}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => canInteract && onSelect()}
      className={`
        relative rounded-lg
        border-2 ${isLocked ? 'border-gray-600' : colors.border} ${isLocked ? 'bg-gray-900/50' : colors.bg}
        transition-all duration-300
        ${isDealtWith ? 'grayscale opacity-60 overflow-hidden cursor-not-allowed' : ''}
        ${isLocked ? 'cursor-not-allowed overflow-hidden' : 'cursor-pointer overflow-visible'}
      `}
      style={{
        boxShadow: isHovered && canInteract ? colors.hoverGlow : 
                   canInteract ? `0 0 30px ${colors.glow}` : 'none',
      }}
    >
      {/* Level badge - inside card, top left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute top-2 left-2 z-20"
      >
        <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase ${
          isLocked ? 'bg-gray-800/80 text-gray-500' :
          level === 1 ? 'bg-cyan-500/30 text-cyan-400' :
          level === 2 ? 'bg-green-500/30 text-green-400' :
          'bg-red-500/30 text-red-400'
        }`}>
          LVL {level}
        </span>
      </motion.div>
      {/* Entity Image - monsters come alive on hover */}
      <div className="relative h-48 flex items-center justify-center overflow-visible bg-black/30">
        {/* Wrapper for hover scale effect */}
        <motion.div
          className="relative z-10"
          animate={{
            scale: isHovered && canInteract ? 1.25 : 1,
            y: isHovered && canInteract ? -25 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ transformOrigin: 'center bottom' }}
        >
          {/* Image with idle float animation */}
          <motion.img
            src={entity.image}
            alt={entity.name}
            className="h-40 w-auto object-contain"
            animate={
              isDealtWith 
                ? {}
                : isLocked
                  ? {} // No animation for locked
                  : glitchActive
                    ? { filter: ['brightness(1)', 'brightness(2) contrast(1.5)', 'brightness(1)'] }
                    : isHovered
                      ? { filter: 'brightness(1.3) drop-shadow(0 10px 20px rgba(0,0,0,0.8))' }
                      : { y: [0, -3, 0] }
            }
            transition={
              glitchActive
                ? { duration: 0.1, repeat: 2 }
                : isHovered
                  ? { duration: 0.2 }
                  : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }
            draggable={false}
            style={{
              filter: isLocked ? 'grayscale(100%) brightness(0.4) blur(2px)' : undefined,
            }}
          />
        </motion.div>
        
        {/* Glow effect behind image - hidden when locked */}
        {!isLocked && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center bottom, ${colors.glow}, transparent 70%)`,
            }}
          />
        )}

        {/* Lock overlay with runic sigil */}
        {isLocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            {/* Runic sigil - mystical seal */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative w-24 h-24"
            >
              {/* Outer ring */}
              <div 
                className="absolute inset-0 rounded-full border-2 border-purple-500/40"
                style={{ boxShadow: '0 0 15px rgba(168,85,247,0.3)' }}
              />
              {/* Inner ring */}
              <div className="absolute inset-3 rounded-full border border-purple-400/30" />
              {/* Runic symbol in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="text-3xl text-purple-400/60 font-serif"
                  style={{ 
                    textShadow: '0 0 10px rgba(168,85,247,0.5)',
                    fontFamily: 'serif',
                  }}
                >
                  ᛟ
                </span>
              </div>
              {/* Cross lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-purple-500/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px bg-purple-500/20" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Static noise overlay for banished */}
        {outcome?.showStatic && (
          <div 
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </div>

      {/* Entity Info */}
      <div className="p-4 bg-black/50">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-mono uppercase tracking-wider ${
            isLocked ? 'text-gray-600' : colors.text
          }`}>
            {entity.type}
          </span>
          <span className={`text-xs font-mono ${
            isLocked ? 'text-gray-600' :
            entity.threatLevel === 'High' ? 'text-red-400' :
            entity.threatLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {entity.threatLevel} Threat
          </span>
        </div>
        
        {/* Monster Name */}
        <h3 className={`font-creepster text-xl mb-1 tracking-wide ${
          isLocked ? 'text-gray-500' : 'text-white'
        }`}>
          {entity.name}
        </h3>
        
        {/* Fake File Path - subtle background element */}
        <p className={`text-[9px] font-mono mb-3 truncate ${
          isLocked ? 'text-gray-700 opacity-40' : 'text-gray-600 opacity-60'
        }`} title={entity.fakeFilePath}>
          {entity.fakeFilePath}
        </p>

        {/* File Size Bar (HP = File Size) */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-mono w-8 ${isLocked ? 'text-gray-700' : 'text-gray-500'}`}>SIZE</span>
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${isLocked ? 'bg-gray-700' : colors.border.replace('border-', 'bg-').replace('/50', '')}`}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5 + index * 0.15, duration: 0.8 }}
            />
          </div>
          <span className={`text-xs font-mono w-16 text-right ${isLocked ? 'text-gray-600' : colors.text}`}>{fileSize}</span>
        </div>

        {/* Action button for remaining entities - inside card */}
        {!isDealtWith && !isLocked && (
          <motion.div
            className="text-center"
            animate={{ 
              scale: isHovered ? [1, 1.05, 1] : 1,
              opacity: isHovered ? 1 : 0.6,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className={`${colors.text} text-xs font-mono font-bold tracking-wider`}>
              [ CONFRONT ENTITY ]
            </span>
          </motion.div>
        )}

        {/* Locked state - shows which entity to purge first */}
        {!isDealtWith && isLocked && (
          <div className="text-center">
            <span className="text-red-500/70 text-[10px] font-mono tracking-wide font-bold">
              {getLockMessage()}
            </span>
          </div>
        )}
      </div>

      {/* Dealt with overlay with STAMP */}
      {isDealtWith && outcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 z-30 ${outcome.overlay} flex items-center justify-center`}
        >
          {/* Stamp effect */}
          <motion.div
            initial={{ scale: 2, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: -12, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`
              px-6 py-3 border-4 ${outcome.stampColor} 
              font-mono text-2xl font-bold tracking-widest
              transform bg-black/60
            `}
            style={{
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
            }}
          >
            {outcome.stamp}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

const StoryOverview: React.FC<StoryOverviewProps> = ({
  entities,
  results,
  onSelectEntity,
  onFinish,
  className = '',
}) => {
  const getEntityResult = (entityId: string) => 
    results.find(r => r.entityId === entityId);

  const remainingCount = entities.filter(
    e => !results.some(r => r.entityId === e.id)
  ).length;

  const allDealtWith = remainingCount === 0;

  return (
    <motion.div
      data-testid="story-overview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden ${className}`}
    >
      {/* Background texture - subtle like StoryIntro */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-20 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Purple mist - subtle */}
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

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1
            className={`text-3xl md:text-4xl font-creepster mb-3 tracking-wider ${
              allDealtWith ? 'text-purple-400' : 'text-green-400'
            }`}
            style={{
              textShadow: allDealtWith 
                ? '0 0 20px rgba(168,85,247,0.6)' 
                : '0 0 10px rgba(74,222,128,0.3)',
            }}
          >
            {allDealtWith ? 'Ritual Complete' : <GlitchTitle text="ENTITIES DETECTED" />}
          </h1>
          
          {/* Terminal-style subtitle */}
          <p className="text-green-500 font-mono text-sm tracking-wide">
            {allDealtWith 
              ? '> ALL ANOMALIES PROCESSED. AWAITING FINAL REPORT...'
              : `> SCAN RESULTS: ${entities.length} ANOMALIES ISOLATED IN SECTOR 0`
            }
          </p>
        </motion.div>

        {/* Entity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {entities.map((entity, index) => {
            const result = getEntityResult(entity.id);
            const colors = typeColors[entity.type] || typeColors.ghost;
            
            // Lock logic: entity is locked if any previous entity hasn't been dealt with
            const previousEntitiesDealtWith = entities
              .slice(0, index)
              .every(e => results.some(r => r.entityId === e.id));
            const isLocked = !result && !previousEntitiesDealtWith;
            
            // Level is 1-indexed
            const level = index + 1;

            return (
              <EntityCard
                key={entity.id}
                entity={entity}
                result={result}
                colors={colors}
                onSelect={() => onSelectEntity(entity.id)}
                index={index}
                isLocked={isLocked}
                level={level}
              />
            );
          })}
        </div>

        {/* Finish button (only when all dealt with) */}
        {allDealtWith && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              onClick={onFinish}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-purple-600/20 border-2 border-purple-500 text-purple-300 
                         font-creepster text-xl tracking-widest uppercase
                         hover:bg-purple-500 hover:text-black transition-all duration-300"
              style={{
                boxShadow: '0 0 20px rgba(168,85,247,0.4)',
              }}
            >
              View Results
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StoryOverview;
