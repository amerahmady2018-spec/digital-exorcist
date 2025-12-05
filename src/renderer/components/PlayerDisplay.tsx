import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import guideImage from '../../assets/images/guide.png';

/**
 * PlayerDisplay - Displays the player (The Exorcist) in the Battle Arena
 * 
 * Shows the player avatar with HP/Mana bars and shake animation.
 * Uses forwardRef for Framer Motion compatibility and parent-child ref control.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

// Player name for Story Mode
const PLAYER_NAME = 'THE EXORCIST';

export interface PlayerDisplayProps {
  /** Current HP */
  hp: number;
  /** Maximum HP */
  maxHP: number;
  /** Current Mana */
  mana: number;
  /** Maximum Mana */
  maxMana: number;
  /** Whether the player is shaking (damage feedback) */
  isShaking: boolean;
  /** Additional CSS classes */
  className?: string;
}

const PlayerDisplay = forwardRef<HTMLDivElement, PlayerDisplayProps>(
  ({ hp, maxHP, mana, maxMana, isShaking, className = '' }, ref) => {
    return (
      <motion.div
        ref={ref}
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative ${className}`}
        data-testid="player-display"
      >
      {/* Player Avatar - The Exorcist character from mode selection */}
      <div className="relative w-40 h-48 flex items-end justify-center">
        {/* Glow effect behind character */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(168,85,247,0.4) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <motion.img 
          src={guideImage} 
          alt={PLAYER_NAME}
          className="h-full w-auto object-contain"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))',
          }}
          animate={isShaking ? {} : { y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          draggable={false}
        />
      </div>

      {/* HP Bar */}
      <div className="mt-4 w-64">
        <div className="flex justify-between mb-1">
          <span className="font-tech font-bold text-purple-400">{PLAYER_NAME}</span>
          <span className="font-tech font-bold text-white">
            {hp} / {maxHP}
          </span>
        </div>
        <div className="h-4 bg-black/60 rounded-full border-2 border-purple-600">
          <motion.div
            animate={{ width: `${Math.max(0, Math.min(100, (hp / maxHP) * 100))}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
          />
        </div>
      </div>

      {/* Mana Bar */}
      <div className="mt-2 w-64">
        <div className="flex justify-between mb-1">
          <span className="font-tech font-bold text-blue-400">MANA</span>
          <span className="font-tech font-bold text-white">
            {mana} / {maxMana}
          </span>
        </div>
        <div className="h-3 bg-black/60 rounded-full border-2 border-blue-600">
          <motion.div
            animate={{ width: `${Math.max(0, Math.min(100, (mana / maxMana) * 100))}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
  }
);

PlayerDisplay.displayName = 'PlayerDisplay';

export { PlayerDisplay };
