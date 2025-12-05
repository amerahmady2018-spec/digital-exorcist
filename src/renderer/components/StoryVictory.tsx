import React from 'react';
import { motion } from 'framer-motion';
import type { StoryEntity } from '../data/storyEntities';
import type { EntityOutcome } from '../hooks/useStoryMode';
import bgTexture from '../../assets/images/bg_texture.png';

/**
 * StoryVictory - Feedback screen after dealing with an entity
 * 
 * Shows dramatic result (banished, skipped, or survived) with the entity.
 */

export interface StoryVictoryProps {
  entity: StoryEntity;
  outcome: EntityOutcome;
  onContinue: () => void;
  remainingCount: number;
  className?: string;
}

const outcomeConfig = {
  banished: {
    title: 'BANISHED',
    subtitle: 'The spirit has been exorcised',
    color: 'text-purple-400',
    bgGlow: 'rgba(168,85,247,0.3)',
    borderColor: 'border-purple-500',
    particles: 'bg-purple-400',
  },
  skipped: {
    title: 'SPARED',
    subtitle: 'The spirit lingers on...',
    color: 'text-gray-400',
    bgGlow: 'rgba(156,163,175,0.2)',
    borderColor: 'border-gray-500',
    particles: 'bg-gray-400',
  },
  survived: {
    title: 'SURVIVED',
    subtitle: 'The spirit proved too strong',
    color: 'text-red-400',
    bgGlow: 'rgba(239,68,68,0.3)',
    borderColor: 'border-red-500',
    particles: 'bg-red-400',
  },
};

const StoryVictory: React.FC<StoryVictoryProps> = ({
  entity,
  outcome,
  onContinue,
  remainingCount,
  className = '',
}) => {
  const config = outcomeConfig[outcome];

  return (
    <motion.div
      data-testid="story-victory"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden ${className}`}
    >
      {/* Background texture - same as TitleScreen */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-30 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Purple mist - bottom left */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '80%', height: '60%', left: '-20%', bottom: '-10%' }}
        animate={{ x: ['0%', '25%', '0%'], y: ['0%', '-15%', '0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-full h-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 40% 70%, rgba(168,85,247,0.35) 0%, rgba(139,92,246,0.15) 40%, transparent 65%)',
            filter: 'blur(40px)'
          }}
        />
      </motion.div>

      {/* Green mist - top right */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '70%', height: '50%', right: '-15%', top: '-5%' }}
        animate={{ x: ['0%', '-20%', '0%'], y: ['0%', '15%', '0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <div 
          className="w-full h-full opacity-35"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 60% 40%, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0.12) 45%, transparent 65%)',
            filter: 'blur(35px)'
          }}
        />
      </motion.div>

      {/* Dramatic background glow - outcome specific */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[2]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(ellipse at center, ${config.bgGlow} 0%, transparent 60%)`,
        }}
      />

      {/* Burst effect on banish */}
      {outcome === 'banished' && (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-20 bg-gradient-to-t from-purple-500 to-transparent"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom center',
                rotate: `${i * 30}deg`,
              }}
              initial={{ scaleY: 0, opacity: 1 }}
              animate={{ scaleY: [0, 1, 0], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          ))}
        </>
      )}

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 ${config.particles} rounded-full`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: outcome === 'banished' ? [0, -100] : [0, -20, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: outcome === 'banished' ? 2 : 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center" style={{ zIndex: 10 }}>
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-5xl md:text-6xl font-creepster ${config.color} mb-4 tracking-widest`}
          style={{
            textShadow: `0 0 30px ${config.bgGlow}`,
          }}
        >
          {config.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 font-mono text-lg mb-8"
        >
          {config.subtitle}
        </motion.p>

        {/* Entity card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`
            relative p-6 rounded-lg border-2 ${config.borderColor}
            bg-black/60 backdrop-blur-sm mb-10
            ${outcome === 'banished' ? 'grayscale' : ''}
          `}
        >
          <motion.img
            src={entity.image}
            alt={entity.name}
            className="h-32 w-auto mx-auto mb-4"
            animate={outcome === 'banished' ? { opacity: [1, 0.5] } : {}}
            transition={{ duration: 1 }}
            draggable={false}
          />
          <h3 className="text-white font-creepster text-2xl tracking-wide">
            {entity.name}
          </h3>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-wider mt-1">
            {entity.type}
          </p>
        </motion.div>

        {/* Remaining count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-500 font-mono text-sm mb-6"
        >
          {remainingCount > 0 
            ? `${remainingCount} spirit${remainingCount !== 1 ? 's' : ''} remaining`
            : 'All spirits confronted'
          }
        </motion.p>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onContinue}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-10 py-4 bg-black/50 border-2 ${config.borderColor}
            ${config.color} font-creepster text-xl tracking-widest uppercase
            hover:bg-white/10 transition-all duration-300
          `}
          style={{
            boxShadow: `0 0 20px ${config.bgGlow}`,
          }}
        >
          {remainingCount > 0 ? 'Continue' : 'View Results'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StoryVictory;
