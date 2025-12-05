import React from 'react';
import { motion } from 'framer-motion';
import type { StoryEntity } from '../data/storyEntities';
import bgTexture from '../../assets/images/bg_texture.png';

/**
 * StorySummary - Completion screen for Story Mode
 * 
 * Displays the ritual completion title, summary statistics showing
 * entities banished/skipped/survived, and action buttons for replay or exit.
 * 
 * Requirements: 6.4, 7.2, 7.3
 */

/**
 * Result of a single entity encounter in Story Mode
 */
export interface EntityResult {
  entityId: string;
  outcome: 'banished' | 'skipped' | 'survived';
}

export interface StorySummaryProps {
  results: EntityResult[];
  entities: StoryEntity[];
  onReplay: () => void;
  onExit: () => void;
  className?: string;
}

/**
 * Calculate summary statistics from entity results
 */
export function calculateStats(results: EntityResult[]): {
  banished: number;
  skipped: number;
  survived: number;
} {
  return results.reduce(
    (acc, result) => {
      acc[result.outcome]++;
      return acc;
    },
    { banished: 0, skipped: 0, survived: 0 }
  );
}

const StorySummary: React.FC<StorySummaryProps> = ({
  results,
  entities,
  onReplay,
  onExit,
  className = '',
}) => {
  const stats = calculateStats(results);
  const totalEntities = entities.length;

  return (
    <motion.div
      data-testid="story-summary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
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

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Content container */}
      <div className="relative max-w-2xl text-center" style={{ zIndex: 10 }}>
        {/* Completion Title */}
        <motion.h1
          data-testid="story-summary-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-creepster text-green-400 mb-8 tracking-wider"
          style={{
            textShadow: '0 0 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.3)',
          }}
        >
          The Ritual Complete
        </motion.h1>

        {/* Summary narrative */}
        <motion.p
          data-testid="story-summary-narrative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-gray-300 text-lg md:text-xl leading-relaxed font-mono mb-10"
        >
          Your training is complete, Exorcist. The spirits have been confronted,
          and your skills have been tested. Review your performance below.
        </motion.p>

        {/* Statistics */}
        <motion.div
          data-testid="story-summary-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="grid grid-cols-3 gap-6 mb-12"
        >
          {/* Banished */}
          <div
            data-testid="stat-banished"
            className="bg-green-900/30 border border-green-500/50 rounded-lg p-4"
          >
            <div className="text-4xl font-creepster text-green-400 mb-2">
              {stats.banished}
            </div>
            <div className="text-sm font-mono text-green-300 uppercase tracking-wider">
              Banished
            </div>
          </div>

          {/* Skipped */}
          <div
            data-testid="stat-skipped"
            className="bg-gray-900/30 border border-gray-500/50 rounded-lg p-4"
          >
            <div className="text-4xl font-creepster text-gray-400 mb-2">
              {stats.skipped}
            </div>
            <div className="text-sm font-mono text-gray-300 uppercase tracking-wider">
              Skipped
            </div>
          </div>

          {/* Survived */}
          <div
            data-testid="stat-survived"
            className="bg-red-900/30 border border-red-500/50 rounded-lg p-4"
          >
            <div className="text-4xl font-creepster text-red-400 mb-2">
              {stats.survived}
            </div>
            <div className="text-sm font-mono text-red-300 uppercase tracking-wider">
              Survived
            </div>
          </div>
        </motion.div>

        {/* Total encounters */}
        <motion.p
          data-testid="story-summary-total"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-gray-400 text-sm font-mono mb-10"
        >
          {totalEntities} entities encountered during the ritual
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="flex gap-6 justify-center"
        >
          {/* Replay button */}
          <motion.button
            data-testid="story-summary-replay-button"
            onClick={onReplay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-purple-600/20 border-2 border-purple-500 text-purple-300 
                       font-creepster text-xl tracking-widest uppercase
                       hover:bg-purple-500 hover:text-black transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.1)',
              clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
            }}
          >
            Replay Ritual
          </motion.button>

          {/* Exit button */}
          <motion.button
            data-testid="story-summary-exit-button"
            onClick={onExit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gray-600/20 border-2 border-gray-500 text-gray-300 
                       font-creepster text-xl tracking-widest uppercase
                       hover:bg-gray-500 hover:text-black transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(107,114,128,0.4), inset 0 0 20px rgba(107,114,128,0.1)',
              clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
            }}
          >
            Exit to Menu
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StorySummary;
