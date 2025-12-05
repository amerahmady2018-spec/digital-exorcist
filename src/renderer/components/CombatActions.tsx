import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { GameIcon } from './ui/GameIcon';

// Import HARD-MAPPED icons
import iconTactical from '../../assets/images/icon_tactical.png';
import iconFirewall from '../../assets/images/icon_firewall.png';

/**
 * CombatActions - Combat action buttons for the Battle Arena
 * 
 * Displays three action buttons with:
 * - DATA SMASH: Primary attack (20 DMG)
 * - PURGE RITUAL: Heavy attack (50 DMG, 30 MANA)
 * - FLEE: Escape battle
 * - Keyboard hints on buttons
 * - Disabled state during action execution
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

export interface CombatActionsProps {
  /** Callback for DATA SMASH action */
  onDataSmash: () => void;
  /** Callback for PURGE RITUAL action */
  onPurgeRitual: () => void;
  /** Callback for FLEE action */
  onFlee: () => void;
  /** Whether buttons should be disabled */
  disabled: boolean;
  /** Current player mana (for PURGE RITUAL availability) */
  playerMana: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Action button component with keyboard hint
 */
interface ActionButtonProps {
  label: string;
  subLabel: string;
  keyHint: string;
  onClick: () => void;
  disabled: boolean;
  variant: 'attack' | 'special' | 'flee';
  icon?: string;
}

function ActionButton({ label, subLabel, keyHint, onClick, disabled, variant, icon }: ActionButtonProps) {
  const variantStyles = {
    attack: {
      bg: 'from-red-700 to-red-600',
      border: 'border-red-500',
      glow: 'rgba(239, 68, 68, 0.5)',
      hoverGlow: 'rgba(239, 68, 68, 0.8)'
    },
    special: {
      bg: 'from-purple-700 to-purple-600',
      border: 'border-purple-500',
      glow: 'rgba(168, 85, 247, 0.5)',
      hoverGlow: 'rgba(168, 85, 247, 0.8)'
    },
    flee: {
      bg: 'from-gray-700 to-gray-600',
      border: 'border-gray-500',
      glow: 'rgba(107, 114, 128, 0.5)',
      hoverGlow: 'rgba(107, 114, 128, 0.8)'
    }
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-4 min-w-[180px]
        bg-gradient-to-r ${style.bg}
        border-2 ${style.border}
        rounded-lg
        font-tech font-bold text-white
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        group
      `}
      style={{
        boxShadow: disabled ? 'none' : `0 0 15px ${style.glow}`
      }}
      data-testid={`combat-action-${variant}`}
      data-disabled={disabled}
    >
      {/* Keyboard hint badge */}
      <span 
        className="absolute -top-2 -right-2 px-2 py-0.5 bg-graveyard-900 border border-gray-600 rounded text-[10px] text-gray-400 font-mono"
        data-testid={`key-hint-${variant}`}
      >
        {keyHint}
      </span>

      <div className="text-center flex flex-col items-center">
        {icon && (
          <GameIcon 
            src={icon} 
            size="md" 
            glow={!disabled}
            glowColor={variant === 'attack' ? 'rgba(239,68,68,0.6)' : variant === 'special' ? 'rgba(168,85,247,0.6)' : 'rgba(107,114,128,0.6)'}
            className="mb-1"
          />
        )}
        <div className="text-lg tracking-wider">[ {label} ]</div>
        <div className="text-xs text-gray-300 mt-1 opacity-80">{subLabel}</div>
      </div>

      {/* Hover glow effect */}
      {!disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: `0 0 30px ${style.hoverGlow}, inset 0 0 20px ${style.glow}`
          }}
        />
      )}
    </motion.button>
  );
}


const CombatActions = forwardRef<HTMLDivElement, CombatActionsProps>(
  ({ onDataSmash, onPurgeRitual, onFlee, disabled, playerMana, className = '' }, ref) => {
    const canUsePurgeRitual = playerMana >= 30;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={`flex gap-4 justify-center items-end ${className}`}
        data-testid="combat-actions"
        data-disabled={disabled}
      >
        {/* DATA SMASH - Primary Attack with icon_tactical.png */}
        <ActionButton
          label="DATA SMASH"
          subLabel="20 DMG • 0 MANA"
          keyHint="SPACE"
          onClick={onDataSmash}
          disabled={disabled}
          variant="attack"
          icon={iconTactical}
        />

        {/* PURGE RITUAL - Heavy Attack with icon_firewall.png */}
        <ActionButton
          label="PURGE RITUAL"
          subLabel="50 DMG • 30 MANA"
          keyHint="R"
          onClick={onPurgeRitual}
          disabled={disabled || !canUsePurgeRitual}
          variant="special"
          icon={iconFirewall}
        />

        {/* FLEE - Escape */}
        <ActionButton
          label="FLEE"
          subLabel="ESCAPE BATTLE"
          keyHint="ESC"
          onClick={onFlee}
          disabled={disabled}
          variant="flee"
        />
      </motion.div>
    );
  }
);

CombatActions.displayName = 'CombatActions';

export { CombatActions };
