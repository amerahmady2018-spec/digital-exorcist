import React, { forwardRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TransitionAnimation } from '../store/appStore';

/**
 * StateTransition - Animated wrapper for state transitions
 * 
 * Provides fade, zoom, and slide animations for transitioning between
 * application states in the cinematic flow.
 */

export interface StateTransitionProps {
  children: React.ReactNode;
  /** Unique key for AnimatePresence to track state changes */
  stateKey: string;
  /** Type of animation to use */
  animation: TransitionAnimation | null;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animation variants for different transition types
 */
const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const zoomVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.2 }
};

const slideVariants: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

/**
 * Get the appropriate variants for the animation type
 */
export function getAnimationVariants(animation: TransitionAnimation | null): Variants {
  switch (animation) {
    case 'fade':
      return fadeVariants;
    case 'zoom':
      return zoomVariants;
    case 'slide':
      return slideVariants;
    default:
      return fadeVariants;
  }
}

/**
 * Get transition configuration for the animation
 */
export function getTransitionConfig(duration: number) {
  return {
    duration,
    ease: [0.4, 0, 0.2, 1] // Custom easing for snappy feel
  };
}

const StateTransition = forwardRef<HTMLDivElement, StateTransitionProps>(
  ({ 
    children, 
    stateKey, 
    animation, 
    duration = 0.4,
    onAnimationComplete,
    className = ''
  }, ref) => {
    const variants = getAnimationVariants(animation);
    const transition = getTransitionConfig(duration);

    return (
      <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
        <motion.div
          ref={ref}
          key={stateKey}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className={`w-full h-full ${className}`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }
);

StateTransition.displayName = 'StateTransition';

export default StateTransition;

/**
 * Hook to create animation props for a component
 */
export function useStateTransitionProps(
  animation: TransitionAnimation | null,
  duration: number = 0.4
) {
  const variants = getAnimationVariants(animation);
  const transition = getTransitionConfig(duration);

  return {
    variants,
    initial: 'initial' as const,
    animate: 'animate' as const,
    exit: 'exit' as const,
    transition
  };
}
