import { forwardRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ParticleEffect - Particle dissolution effect component
 * 
 * Implements dissolution effect using Framer Motion for smooth animation.
 * Uses digital particle aesthetics consistent with the theme.
 * Triggers on successful banishment and transitions to HUD state on completion.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

export type ParticleEffectType = 'dissolution' | 'impact';

export interface ParticleData {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle: number;
  distance: number;
  rotation: number;
}

export interface ParticleEffectProps {
  /** Type of particle effect */
  type: ParticleEffectType;
  /** Origin point for the effect */
  origin: { x: number; y: number };
  /** Callback when effect completes */
  onComplete: () => void;
  /** Number of particles to generate */
  particleCount?: number;
  /** Base color for particles (hex format) */
  baseColor?: string;
  /** Duration of the effect in milliseconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Layout ID for Framer Motion transitions */
  layoutId?: string;
}

/**
 * Generate a random number within a range
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random hex color variation from a base color
 */
export function generateColorVariation(baseColor: string, variation: number = 30): string {
  // Parse hex color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Add random variation
  const newR = Math.min(255, Math.max(0, r + Math.floor(randomInRange(-variation, variation))));
  const newG = Math.min(255, Math.max(0, g + Math.floor(randomInRange(-variation, variation))));
  const newB = Math.min(255, Math.max(0, b + Math.floor(randomInRange(-variation, variation))));
  
  return `rgb(${newR}, ${newG}, ${newB})`;
}

/**
 * Digital particle colors for the dissolution effect
 */
const DIGITAL_COLORS = [
  '#00ff88', // Spectral green
  '#ff4444', // Demon red
  '#8b5cf6', // Purple
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
];

/**
 * Generate particles for the dissolution effect
 */
export function generateDissolutionParticles(
  count: number,
  baseColor: string
): ParticleData[] {
  const particles: ParticleData[] = [];
  
  for (let i = 0; i < count; i++) {
    // Use digital colors with some base color influence
    const useDigitalColor = Math.random() > 0.3;
    const color = useDigitalColor 
      ? DIGITAL_COLORS[Math.floor(Math.random() * DIGITAL_COLORS.length)]
      : generateColorVariation(baseColor, 50);
    
    particles.push({
      id: `particle-${i}-${Date.now()}`,
      x: randomInRange(-20, 20), // Initial offset from origin
      y: randomInRange(-20, 20),
      size: randomInRange(2, 8),
      color,
      delay: randomInRange(0, 0.3), // Stagger start times
      duration: randomInRange(0.8, 1.5),
      angle: randomInRange(0, 360), // Direction of travel
      distance: randomInRange(100, 300), // How far to travel
      rotation: randomInRange(-720, 720), // Spin amount
    });
  }
  
  return particles;
}

/**
 * Generate particles for the impact effect
 */
export function generateImpactParticles(
  count: number,
  baseColor: string
): ParticleData[] {
  const particles: ParticleData[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360; // Evenly distributed angles
    const color = generateColorVariation(baseColor, 40);
    
    particles.push({
      id: `impact-${i}-${Date.now()}`,
      x: 0,
      y: 0,
      size: randomInRange(3, 6),
      color,
      delay: 0, // All start at once for impact
      duration: randomInRange(0.3, 0.6),
      angle,
      distance: randomInRange(50, 150),
      rotation: randomInRange(-360, 360),
    });
  }
  
  return particles;
}

/**
 * Calculate final position based on angle and distance
 */
export function calculateFinalPosition(
  angle: number,
  distance: number
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance,
  };
}

/**
 * Single particle component
 */
const Particle = forwardRef<HTMLDivElement, { particle: ParticleData }>(
  ({ particle }, ref) => {
    const finalPos = calculateFinalPosition(particle.angle, particle.distance);
    
    return (
      <motion.div
        ref={ref}
        initial={{
          x: particle.x,
          y: particle.y,
          scale: 1,
          opacity: 1,
          rotate: 0,
        }}
        animate={{
          x: particle.x + finalPos.x,
          y: particle.y + finalPos.y,
          scale: 0,
          opacity: 0,
          rotate: particle.rotation,
        }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for digital feel
        }}
        className="absolute pointer-events-none"
        style={{
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 4}px ${particle.color}`,
          borderRadius: Math.random() > 0.5 ? '50%' : '0%', // Mix of squares and circles
        }}
        data-testid="particle"
        data-particle-id={particle.id}
      />
    );
  }
);

Particle.displayName = 'Particle';

const ParticleEffect = forwardRef<HTMLDivElement, ParticleEffectProps>(
  (
    {
      type,
      origin,
      onComplete,
      particleCount = 50,
      baseColor = '#8b5cf6',
      duration = 1500,
      className = '',
      layoutId,
    },
    ref
  ) => {
    const [isActive, setIsActive] = useState(true);
    const [hasCompleted, setHasCompleted] = useState(false);

    // Generate particles based on effect type
    const particles = useMemo(() => {
      if (type === 'dissolution') {
        return generateDissolutionParticles(particleCount, baseColor);
      } else {
        return generateImpactParticles(particleCount, baseColor);
      }
    }, [type, particleCount, baseColor]);

    // Handle effect completion
    const handleComplete = useCallback(() => {
      if (!hasCompleted) {
        setHasCompleted(true);
        setIsActive(false);
        onComplete();
      }
    }, [hasCompleted, onComplete]);

    // Set up completion timer based on longest particle animation
    useEffect(() => {
      if (!isActive) return;

      // Calculate the longest animation time (duration + delay)
      const maxAnimationTime = Math.max(
        ...particles.map(p => (p.duration + p.delay) * 1000)
      );

      // Add a small buffer to ensure all animations complete
      const completionTime = Math.max(maxAnimationTime + 100, duration);

      const timer = setTimeout(() => {
        handleComplete();
      }, completionTime);

      return () => clearTimeout(timer);
    }, [isActive, particles, duration, handleComplete]);

    return (
      <AnimatePresence>
        {isActive && (
          <motion.div
            ref={ref}
            layoutId={layoutId}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed pointer-events-none z-[200] ${className}`}
            style={{
              left: origin.x,
              top: origin.y,
              transform: 'translate(-50%, -50%)',
            }}
            data-testid="particle-effect"
            data-effect-type={type}
            data-particle-count={particleCount}
          >
            {/* Central glow effect for dissolution */}
            {type === 'dissolution' && (
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute rounded-full"
                style={{
                  width: 100,
                  height: 100,
                  left: -50,
                  top: -50,
                  background: `radial-gradient(circle, ${baseColor}80 0%, transparent 70%)`,
                }}
                data-testid="central-glow"
              />
            )}

            {/* Render all particles */}
            {particles.map(particle => (
              <Particle key={particle.id} particle={particle} />
            ))}

            {/* Digital glitch lines for dissolution effect */}
            {type === 'dissolution' && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`glitch-${i}`}
                    initial={{
                      scaleX: 1,
                      opacity: 0.8,
                      x: randomInRange(-50, 50),
                    }}
                    animate={{
                      scaleX: 0,
                      opacity: 0,
                      x: randomInRange(-100, 100),
                    }}
                    transition={{
                      duration: randomInRange(0.3, 0.6),
                      delay: randomInRange(0, 0.2),
                      ease: 'easeOut',
                    }}
                    className="absolute"
                    style={{
                      width: randomInRange(50, 150),
                      height: 2,
                      top: randomInRange(-30, 30),
                      backgroundColor: DIGITAL_COLORS[i % DIGITAL_COLORS.length],
                      boxShadow: `0 0 10px ${DIGITAL_COLORS[i % DIGITAL_COLORS.length]}`,
                    }}
                    data-testid="glitch-line"
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

ParticleEffect.displayName = 'ParticleEffect';

export { ParticleEffect, Particle };
