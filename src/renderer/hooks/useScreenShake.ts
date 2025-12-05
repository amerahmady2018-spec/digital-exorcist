import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Screen shake configuration
 */
export interface ScreenShakeConfig {
  /** Base intensity of the shake (pixels) */
  intensity: number;
  /** Duration of the shake in milliseconds */
  duration: number;
  /** Number of shake iterations */
  iterations?: number;
}

/**
 * Screen shake transform state
 */
export interface ShakeTransform {
  x: number;
  y: number;
}

/**
 * Queued shake entry
 */
interface QueuedShake {
  id: string;
  config: ScreenShakeConfig;
}

/**
 * Return type for useScreenShake hook
 */
export interface UseScreenShakeReturn {
  /** Current transform offset */
  transform: ShakeTransform;
  /** Whether a shake is currently active */
  isShaking: boolean;
  /** Trigger a screen shake with given config */
  trigger: (config: ScreenShakeConfig) => void;
  /** CSS transform string for applying to elements */
  transformStyle: string;
  /** Number of shakes in queue */
  queueLength: number;
}

/**
 * Calculate shake intensity based on damage amount
 * Larger damage values produce larger shake magnitudes
 * 
 * @param damage - The damage amount
 * @param baseIntensity - Base intensity multiplier (default 1)
 * @returns Calculated intensity in pixels
 */
export function calculateShakeIntensity(damage: number, baseIntensity: number = 1): number {
  // Scale intensity logarithmically to prevent extreme values
  // Min intensity: 2px, Max intensity: 30px
  const minIntensity = 2;
  const maxIntensity = 30;
  
  // Use logarithmic scaling for more natural feel
  const scaledIntensity = Math.log10(damage + 1) * 10 * baseIntensity;
  
  return Math.max(minIntensity, Math.min(maxIntensity, scaledIntensity));
}

/**
 * Generate randomized directional offsets for shake effect
 * Each call produces different values for varied motion
 * 
 * @param intensity - Maximum offset magnitude in pixels
 * @returns Random x and y offsets
 */
export function generateRandomOffset(intensity: number): ShakeTransform {
  // Generate random angle for direction
  const angle = Math.random() * Math.PI * 2;
  // Generate random magnitude (0.5 to 1.0 of intensity for variation)
  const magnitude = intensity * (0.5 + Math.random() * 0.5);
  
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude
  };
}

/**
 * useScreenShake - Hook for creating screen shake visual feedback
 * 
 * Features:
 * - Applies CSS transform offsets for shake effect
 * - Implements randomized directional offsets
 * - Resets transform to identity after completion
 * - Scales intensity based on damage amount
 * - Queues multiple shakes to prevent overlaps
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export function useScreenShake(): UseScreenShakeReturn {
  const [transform, setTransform] = useState<ShakeTransform>({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState(false);
  const [queue, setQueue] = useState<QueuedShake[]>([]);
  
  const animationFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const currentShakeRef = useRef<{ startTime: number; config: ScreenShakeConfig } | null>(null);

  /**
   * Process a single shake animation
   */
  const processShake = useCallback((config: ScreenShakeConfig) => {
    const { intensity, duration, iterations = 8 } = config;
    const startTime = performance.now();
    const iterationDuration = duration / iterations;
    
    currentShakeRef.current = { startTime, config };
    setIsShaking(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed >= duration) {
        // Reset transform to identity (Requirement 9.3)
        setTransform({ x: 0, y: 0 });
        setIsShaking(false);
        currentShakeRef.current = null;
        isProcessingRef.current = false;
        
        // Process next in queue if any
        setQueue(prevQueue => {
          if (prevQueue.length > 0) {
            const [next, ...rest] = prevQueue;
            // Schedule next shake processing
            setTimeout(() => {
              isProcessingRef.current = true;
              processShake(next.config);
            }, 0);
            return rest;
          }
          return prevQueue;
        });
        return;
      }

      // Calculate iteration progress
      const iterationProgress = (elapsed % iterationDuration) / iterationDuration;
      
      // Generate randomized offset (Requirement 9.2)
      // Apply easing to reduce intensity over time
      const easedIntensity = intensity * (1 - elapsed / duration);
      const offset = generateRandomOffset(easedIntensity);
      
      // Apply smooth interpolation within iteration
      const smoothFactor = Math.sin(iterationProgress * Math.PI);
      setTransform({
        x: offset.x * smoothFactor,
        y: offset.y * smoothFactor
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  /**
   * Trigger a screen shake
   * If a shake is already in progress, queue this one (Requirement 9.5)
   */
  const trigger = useCallback((config: ScreenShakeConfig) => {
    const shakeId = `shake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (isProcessingRef.current) {
      // Queue the shake to prevent overlaps (Requirement 9.5)
      setQueue(prevQueue => [...prevQueue, { id: shakeId, config }]);
    } else {
      // Start shake immediately
      isProcessingRef.current = true;
      processShake(config);
    }
  }, [processShake]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Generate CSS transform string
  const transformStyle = `translate(${transform.x}px, ${transform.y}px)`;

  return {
    transform,
    isShaking,
    trigger,
    transformStyle,
    queueLength: queue.length
  };
}

export default useScreenShake;
