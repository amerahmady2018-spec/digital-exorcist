import { forwardRef } from 'react';

/**
 * GameIcon - Quality-controlled icon component for consistent asset rendering
 * 
 * Ensures 100% correct asset usage with ZERO distortion through:
 * - object-fit: contain - Never stretch, keep original proportions
 * - flex-shrink: 0 - Prevent squashing by nearby elements
 * - filter: drop-shadow - Add depth for visual appeal
 * - image-rendering: high-quality - Ensure crisp edges
 */

export type GameIconSize = 'sm' | 'md' | 'lg' | 'xl';

export interface GameIconProps {
  /** Image source path */
  src: string;
  /** Icon size preset */
  size?: GameIconSize;
  /** Enable glow effect */
  glow?: boolean;
  /** Glow color (CSS color value) */
  glowColor?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
}

// Strict pixel square sizes
const sizeMap: Record<GameIconSize, string> = {
  sm: 'w-5 h-5',   // 20px - for tabs
  md: 'w-8 h-8',   // 32px - for headers
  lg: 'w-12 h-12', // 48px - for featured stats
  xl: 'w-24 h-24', // 96px - for big displays
};

const GameIcon = forwardRef<HTMLImageElement, GameIconProps>(
  ({ src, size = 'md', glow = false, glowColor = 'rgba(139,92,246,0.8)', alt = '', className = '' }, ref) => {
    const sizeClass = sizeMap[size];
    // AAA Polish: Always add subtle drop-shadow for depth, enhanced when glow is active
    const glowStyle = glow 
      ? { filter: `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 2px rgba(255,255,255,0.3))` } 
      : { filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' };

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`
          ${sizeClass}
          flex-shrink-0
          object-contain
          drop-shadow-md
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={{
          imageRendering: 'auto', // 'high-quality' not widely supported, 'auto' is best cross-browser
          ...glowStyle,
        }}
        draggable={false}
      />
    );
  }
);

GameIcon.displayName = 'GameIcon';

export { GameIcon };
