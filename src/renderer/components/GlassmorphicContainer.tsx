import React, { forwardRef } from 'react';

/**
 * GlassmorphicContainer - A premium glassmorphism container component
 * 
 * Creates a frosted glass effect using backdrop-filter blur, allowing
 * the user's desktop wallpaper to bleed through faintly for a premium feel.
 * 
 * Includes fallbacks for browsers that don't support backdrop-filter.
 */

export interface GlassmorphicContainerProps {
  children: React.ReactNode;
  /** Blur intensity in pixels (default: 20) */
  blurIntensity?: number;
  /** Background opacity 0-1 (default: 0.85) */
  opacity?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to apply border glow effect */
  glowBorder?: boolean;
  /** Custom style overrides */
  style?: React.CSSProperties;
}

/**
 * Default opacity value that allows wallpaper bleed-through while maintaining readability
 * Range: 0.7-0.95 as per design requirements
 */
export const DEFAULT_OPACITY = 0.85;
export const MIN_OPACITY = 0.7;
export const MAX_OPACITY = 0.95;

/**
 * Clamps opacity value to valid range for glassmorphism effect
 */
export function clampOpacity(opacity: number): number {
  return Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, opacity));
}

const GlassmorphicContainer = forwardRef<HTMLDivElement, GlassmorphicContainerProps>(
  ({ 
    children, 
    blurIntensity = 20, 
    opacity = DEFAULT_OPACITY, 
    className = '',
    glowBorder = false,
    style = {}
  }, ref) => {
    // Clamp opacity to valid range
    const clampedOpacity = clampOpacity(opacity);
    
    // Build the glassmorphism styles
    const glassmorphismStyles: React.CSSProperties = {
      // Semi-transparent dark background
      backgroundColor: `rgba(13, 15, 16, ${clampedOpacity})`,
      // Backdrop blur for glassmorphism effect
      backdropFilter: `blur(${blurIntensity}px)`,
      WebkitBackdropFilter: `blur(${blurIntensity}px)`,
      // Subtle border for depth
      borderColor: glowBorder 
        ? 'rgba(139, 92, 246, 0.3)' 
        : 'rgba(255, 255, 255, 0.1)',
      borderWidth: '1px',
      borderStyle: 'solid',
      // Box shadow for depth and optional glow
      boxShadow: glowBorder
        ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      // Merge with custom styles
      ...style
    };

    return (
      <div
        ref={ref}
        className={`
          relative
          rounded-xl
          overflow-hidden
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={glassmorphismStyles}
      >
        {/* Fallback gradient overlay for browsers without backdrop-filter support */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
          }}
          aria-hidden="true"
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

GlassmorphicContainer.displayName = 'GlassmorphicContainer';

export default GlassmorphicContainer;
