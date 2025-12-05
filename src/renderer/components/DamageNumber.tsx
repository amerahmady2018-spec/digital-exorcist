import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * DamageNumber - Floating damage number component for combat feedback
 * 
 * Displays file size reduction in gold text format "-{amount} MB"
 * Animates upward with fade-out effect
 * Auto-removes from DOM after animation completes
 * Supports staggered animations for multiple damage numbers
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

export interface DamageNumberProps {
  /** Unique identifier for the damage number */
  id: string;
  /** Amount of damage/size reduction in bytes (or raw damage if isRawDamage=true) */
  amount: number;
  /** X position for the damage number */
  x: number;
  /** Y position for the damage number */
  y: number;
  /** Stagger index for multiple damage numbers (delays animation start) */
  staggerIndex?: number;
  /** Callback when animation completes (for DOM cleanup) */
  onAnimationComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** If true, display raw damage number instead of file size format */
  isRawDamage?: boolean;
}

/**
 * Format bytes to human-readable size with MB suffix
 * Returns the value formatted as "-{amount} MB" for damage display
 */
export function formatDamageAmount(bytes: number): string {
  if (bytes === 0) return '-0 MB';
  
  // Convert to MB
  const mb = bytes / (1024 * 1024);
  
  // Format based on size
  if (mb >= 1) {
    return `-${mb.toFixed(1)} MB`;
  } else if (mb >= 0.01) {
    return `-${mb.toFixed(2)} MB`;
  } else {
    // For very small files, show in KB
    const kb = bytes / 1024;
    return `-${kb.toFixed(1)} KB`;
  }
}

/**
 * Calculate stagger delay based on index
 * Each subsequent damage number is delayed by 100ms
 */
export function calculateStaggerDelay(index: number): number {
  return index * 0.1; // 100ms per index
}

const DamageNumber = forwardRef<HTMLDivElement, DamageNumberProps>(
  ({ id, amount, x, y, staggerIndex = 0, onAnimationComplete, className = '', isRawDamage = false }, ref) => {
    const formattedAmount = isRawDamage ? `-${amount}` : formatDamageAmount(amount);
    const staggerDelay = calculateStaggerDelay(staggerIndex);

    return (
      <motion.div
        ref={ref}
        key={id}
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: -80, scale: 1.3 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 1.2,
          delay: staggerDelay,
          ease: "easeOut"
        }}
        onAnimationComplete={onAnimationComplete}
        className={`absolute pointer-events-none z-50 ${className}`}
        style={{ left: x, top: y, transform: 'translateX(-50%)' }}
        data-testid="damage-number"
        data-damage-id={id}
        data-damage-amount={amount}
        data-stagger-index={staggerIndex}
      >
        <span
          className="font-creepster font-bold text-5xl"
          style={{
            color: '#ef4444', // Red color for damage
            textShadow: '0 0 15px rgba(239, 68, 68, 0.9), 0 0 30px rgba(239, 68, 68, 0.6), 0 2px 4px rgba(0, 0, 0, 0.9)'
          }}
          data-testid="damage-text"
        >
          {formattedAmount}
        </span>
      </motion.div>
    );
  }
);

DamageNumber.displayName = 'DamageNumber';

export { DamageNumber };
