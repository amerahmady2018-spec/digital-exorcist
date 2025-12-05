import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * CombatMenu - Legacy combat menu component
 * 
 * Provides combat action buttons for the Battle Arena.
 * Uses forwardRef for Framer Motion compatibility and parent-child ref control.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

export interface CombatMenuProps {
  /** Callback when an action is selected */
  onAction: (action: 'DATA_SMASH' | 'PURGE_RITUAL' | 'FIREWALL' | 'FLEE') => void;
  /** Whether it's the player's turn */
  isPlayerTurn: boolean;
  /** Current player mana */
  playerMana: number;
  /** Additional CSS classes */
  className?: string;
}

const CombatMenu = forwardRef<HTMLDivElement, CombatMenuProps>(
  ({ onAction, isPlayerTurn, playerMana, className = '' }, ref) => {
    const canUsePurgeRitual = playerMana >= 30;

    return (
      <div ref={ref} className={`flex gap-4 justify-center ${className}`} data-testid="combat-menu">
      <motion.button
        whileHover={isPlayerTurn ? { scale: 1.05, x: 2 } : {}}
        whileTap={isPlayerTurn ? { scale: 0.95 } : {}}
        onClick={() => onAction('DATA_SMASH')}
        disabled={!isPlayerTurn}
        className="weapon-trigger-btn bg-gradient-to-r from-red-700 to-red-600 border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-center">
          <div className="text-lg">[ DATA SMASH ]</div>
          <div className="text-xs text-gray-300 mt-1">20 DMG • 0 MANA</div>
        </div>
      </motion.button>

      <motion.button
        whileHover={isPlayerTurn && canUsePurgeRitual ? { scale: 1.05, x: 2 } : {}}
        whileTap={isPlayerTurn && canUsePurgeRitual ? { scale: 0.95 } : {}}
        onClick={() => onAction('PURGE_RITUAL')}
        disabled={!isPlayerTurn || !canUsePurgeRitual}
        className="weapon-trigger-btn bg-gradient-to-r from-purple-700 to-purple-600 border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-center">
          <div className="text-lg">[ PURGE RITUAL ]</div>
          <div className="text-xs text-gray-300 mt-1">50 DMG • 30 MANA</div>
        </div>
      </motion.button>

      <motion.button
        whileHover={isPlayerTurn ? { scale: 1.05, x: 2 } : {}}
        whileTap={isPlayerTurn ? { scale: 0.95 } : {}}
        onClick={() => onAction('FIREWALL')}
        disabled={!isPlayerTurn}
        className="weapon-trigger-btn bg-gradient-to-r from-blue-700 to-blue-600 border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-center">
          <div className="text-lg">[ FIREWALL ]</div>
          <div className="text-xs text-gray-300 mt-1">BLOCK NEXT ATTACK</div>
        </div>
      </motion.button>

      <motion.button
        whileHover={isPlayerTurn ? { scale: 1.05, x: 2 } : {}}
        whileTap={isPlayerTurn ? { scale: 0.95 } : {}}
        onClick={() => onAction('FLEE')}
        disabled={!isPlayerTurn}
        className="weapon-trigger-btn bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-center">
          <div className="text-lg">[ FLEE ]</div>
          <div className="text-xs text-gray-300 mt-1">ESCAPE BATTLE</div>
        </div>
      </motion.button>
    </div>
  );
  }
);

CombatMenu.displayName = 'CombatMenu';

export { CombatMenu };
