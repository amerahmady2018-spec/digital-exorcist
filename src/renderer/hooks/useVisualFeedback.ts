/**
 * useVisualFeedback - Visual feedback coordinator hook
 * 
 * Coordinates multiple visual effects (shake, particles, lighting, color)
 * to provide immediate, juicy feedback on user actions.
 * 
 * Requirements: 19.1, 19.2, 19.4, 19.5
 */

import { useCallback, useRef, useState } from 'react';

/**
 * Types of visual effects that can be triggered
 */
export type EffectType = 'shake' | 'particles' | 'flash' | 'glow' | 'pulse';

/**
 * Configuration for a visual effect
 */
export interface EffectConfig {
  type: EffectType;
  intensity: number; // 0-1 scale
  duration: number; // milliseconds
  delay?: number; // milliseconds
}

/**
 * Combined effect preset for common actions
 */
export interface EffectPreset {
  name: string;
  effects: EffectConfig[];
}

/**
 * Feedback event that was triggered
 */
export interface FeedbackEvent {
  id: string;
  timestamp: number;
  effects: EffectConfig[];
  completed: boolean;
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  lastFrameTime: number;
  averageFps: number;
  droppedFrames: number;
  activeEffects: number;
}

/**
 * Maximum time allowed for feedback to start (in ms)
 * Feedback should be immediate - within one frame at 60fps
 */
export const MAX_FEEDBACK_DELAY = 16; // ~1 frame at 60fps

/**
 * Maximum time difference for effects to be considered synchronized
 */
export const SYNC_THRESHOLD = 50; // milliseconds

/**
 * Target frame rate for smooth animations
 */
export const TARGET_FPS = 60;

/**
 * Minimum acceptable frame rate
 */
export const MIN_ACCEPTABLE_FPS = 55;

/**
 * Effect presets for common actions
 */
export const EFFECT_PRESETS: Record<string, EffectPreset> = {
  attack: {
    name: 'attack',
    effects: [
      { type: 'shake', intensity: 0.7, duration: 400 },
      { type: 'flash', intensity: 0.5, duration: 100 },
      { type: 'particles', intensity: 0.8, duration: 800 },
    ],
  },
  heavyAttack: {
    name: 'heavyAttack',
    effects: [
      { type: 'shake', intensity: 1.0, duration: 600 },
      { type: 'flash', intensity: 0.8, duration: 150 },
      { type: 'particles', intensity: 1.0, duration: 1200 },
      { type: 'glow', intensity: 0.9, duration: 500 },
    ],
  },
  victory: {
    name: 'victory',
    effects: [
      { type: 'particles', intensity: 1.0, duration: 1500 },
      { type: 'glow', intensity: 1.0, duration: 1000 },
      { type: 'pulse', intensity: 0.8, duration: 800 },
    ],
  },
  damage: {
    name: 'damage',
    effects: [
      { type: 'shake', intensity: 0.5, duration: 300 },
      { type: 'flash', intensity: 0.6, duration: 80, delay: 0 },
    ],
  },
  hover: {
    name: 'hover',
    effects: [
      { type: 'glow', intensity: 0.3, duration: 200 },
      { type: 'pulse', intensity: 0.2, duration: 300 },
    ],
  },
  click: {
    name: 'click',
    effects: [
      { type: 'pulse', intensity: 0.5, duration: 150 },
      { type: 'flash', intensity: 0.3, duration: 50 },
    ],
  },
};

/**
 * Calculate if effects are synchronized within threshold
 */
export function areEffectsSynchronized(timestamps: number[]): boolean {
  if (timestamps.length < 2) return true;
  
  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);
  
  return (max - min) <= SYNC_THRESHOLD;
}

/**
 * Calculate FPS from frame times
 */
export function calculateFps(frameTimes: number[]): number {
  if (frameTimes.length < 2) return TARGET_FPS;
  
  const deltas: number[] = [];
  for (let i = 1; i < frameTimes.length; i++) {
    deltas.push(frameTimes[i] - frameTimes[i - 1]);
  }
  
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  return avgDelta > 0 ? 1000 / avgDelta : TARGET_FPS;
}

/**
 * Check if feedback was immediate (within one frame)
 */
export function isFeedbackImmediate(triggerTime: number, feedbackTime: number): boolean {
  return (feedbackTime - triggerTime) <= MAX_FEEDBACK_DELAY;
}

/**
 * Count the number of effect types in a preset
 */
export function countEffectTypes(effects: EffectConfig[]): number {
  const types = new Set(effects.map(e => e.type));
  return types.size;
}

/**
 * Check if effects are layered (multiple types)
 */
export function hasLayeredEffects(effects: EffectConfig[]): boolean {
  return countEffectTypes(effects) >= 2;
}

/**
 * Throttle function for rapid effect triggers
 */
export function createThrottle(minInterval: number): (fn: () => void) => void {
  let lastCall = 0;
  
  return (fn: () => void) => {
    const now = performance.now();
    if (now - lastCall >= minInterval) {
      lastCall = now;
      fn();
    }
  };
}

/**
 * Visual feedback coordinator hook
 */
export function useVisualFeedback() {
  const [activeEffects, setActiveEffects] = useState<FeedbackEvent[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lastFrameTime: 0,
    averageFps: TARGET_FPS,
    droppedFrames: 0,
    activeEffects: 0,
  });
  
  const frameTimesRef = useRef<number[]>([]);
  const effectIdCounter = useRef(0);
  const throttleRef = useRef(createThrottle(16)); // Throttle to 60fps
  
  /**
   * Trigger a preset effect combination
   */
  const triggerPreset = useCallback((presetName: keyof typeof EFFECT_PRESETS) => {
    const preset = EFFECT_PRESETS[presetName];
    if (!preset) return null;
    
    const triggerTime = performance.now();
    const eventId = `effect-${effectIdCounter.current++}`;
    
    const event: FeedbackEvent = {
      id: eventId,
      timestamp: triggerTime,
      effects: preset.effects,
      completed: false,
    };
    
    setActiveEffects(prev => [...prev, event]);
    
    // Schedule cleanup after longest effect duration
    const maxDuration = Math.max(...preset.effects.map(e => e.duration + (e.delay || 0)));
    setTimeout(() => {
      setActiveEffects(prev => 
        prev.map(e => e.id === eventId ? { ...e, completed: true } : e)
      );
      
      // Remove completed effects after a short delay
      setTimeout(() => {
        setActiveEffects(prev => prev.filter(e => e.id !== eventId));
      }, 100);
    }, maxDuration);
    
    return event;
  }, []);
  
  /**
   * Trigger custom effects
   */
  const triggerEffects = useCallback((effects: EffectConfig[]) => {
    const triggerTime = performance.now();
    const eventId = `effect-${effectIdCounter.current++}`;
    
    const event: FeedbackEvent = {
      id: eventId,
      timestamp: triggerTime,
      effects,
      completed: false,
    };
    
    setActiveEffects(prev => [...prev, event]);
    
    const maxDuration = Math.max(...effects.map(e => e.duration + (e.delay || 0)));
    setTimeout(() => {
      setActiveEffects(prev => 
        prev.map(e => e.id === eventId ? { ...e, completed: true } : e)
      );
      
      setTimeout(() => {
        setActiveEffects(prev => prev.filter(e => e.id !== eventId));
      }, 100);
    }, maxDuration);
    
    return event;
  }, []);
  
  /**
   * Record frame time for FPS monitoring
   */
  const recordFrameTime = useCallback(() => {
    const now = performance.now();
    frameTimesRef.current.push(now);
    
    // Keep only last 60 frame times
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    const fps = calculateFps(frameTimesRef.current);
    
    setMetrics(prev => ({
      ...prev,
      lastFrameTime: now,
      averageFps: fps,
      droppedFrames: fps < MIN_ACCEPTABLE_FPS ? prev.droppedFrames + 1 : prev.droppedFrames,
      activeEffects: activeEffects.filter(e => !e.completed).length,
    }));
  }, [activeEffects]);
  
  /**
   * Throttled effect trigger for rapid actions
   */
  const triggerThrottled = useCallback((presetName: keyof typeof EFFECT_PRESETS) => {
    throttleRef.current(() => triggerPreset(presetName));
  }, [triggerPreset]);
  
  /**
   * Clear all active effects
   */
  const clearEffects = useCallback(() => {
    setActiveEffects([]);
  }, []);
  
  return {
    activeEffects,
    metrics,
    triggerPreset,
    triggerEffects,
    triggerThrottled,
    recordFrameTime,
    clearEffects,
  };
}

export default useVisualFeedback;
