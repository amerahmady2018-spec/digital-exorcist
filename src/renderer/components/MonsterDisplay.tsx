import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * MonsterDisplay - Displays the monster in the Battle Arena
 * 
 * Shows the monster image with health bar and shake animation.
 * Uses forwardRef for Framer Motion compatibility and parent-child ref control.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

export interface MonsterDisplayProps {
  /** Monster image URL */
  image: string;
  /** Current HP */
  hp: number;
  /** Maximum HP */
  maxHP: number;
  /** Whether the monster is shaking (damage feedback) */
  isShaking: boolean;
  /** Additional CSS classes */
  className?: string;
}

const MonsterDisplay = forwardRef<HTMLDivElement, MonsterDisplayProps>(
  ({ image, hp, maxHP, isShaking, className = '' }, ref) => {
    return (
      <motion.div
        ref={ref}
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative ${className}`}
        data-testid="monster-display"
      >
      {/* Monster Image */}
      <img
        src={image}
        alt="Monster"
        className="w-64 h-64 object-contain drop-shadow-2xl"
        style={{
          filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 60px rgba(139, 92, 246, 0.4))'
        }}
      />

      {/* HP Bar */}
      <div className="mt-4 w-64">
        <div className="flex justify-between mb-1">
          <span className="font-tech font-bold text-red-400">MONSTER HP</span>
          <span className="font-tech font-bold text-white">
            {hp} / {maxHP}
          </span>
        </div>
        <div className="h-4 bg-black/60 rounded-full border-2 border-red-600">
          <motion.div
            animate={{ width: `${Math.max(0, Math.min(100, (hp / maxHP) * 100))}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
  }
);

MonsterDisplay.displayName = 'MonsterDisplay';

export { MonsterDisplay };
