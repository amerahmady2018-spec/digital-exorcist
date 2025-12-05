import { useEffect, useCallback, useRef } from 'react';
import { AppState, useAppStore } from '../store/appStore';

/**
 * Key binding configuration
 */
export interface KeyBinding {
  /** The key to listen for (e.g., 'Space', 'Enter', 'Escape') */
  key: string;
  /** The action to execute when key is pressed */
  action: () => void;
  /** The app state(s) where this binding is active, or 'global' for all states */
  context: AppState | AppState[] | 'global';
  /** Whether to prevent default browser behavior (default: true) */
  preventDefault?: boolean;
  /** Description for UI hints */
  description?: string;
}

/**
 * Return type for useKeyboardControls hook
 */
export interface UseKeyboardControlsReturn {
  /** Currently active bindings for the current state */
  activeBindings: KeyBinding[];
  /** Check if a specific key has a binding in current state */
  hasBinding: (key: string) => boolean;
  /** Get the binding for a specific key in current state */
  getBinding: (key: string) => KeyBinding | undefined;
}

/**
 * Normalize key names for consistent comparison
 * Handles browser inconsistencies in key naming
 */
export function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'Spacebar': 'Space',
    'Esc': 'Escape',
    'Return': 'Enter',
  };
  return keyMap[key] || key;
}

/**
 * Check if a binding is active for a given app state
 */
export function isBindingActiveForState(binding: KeyBinding, currentState: AppState): boolean {
  if (binding.context === 'global') {
    return true;
  }
  if (Array.isArray(binding.context)) {
    return binding.context.includes(currentState);
  }
  return binding.context === currentState;
}

/**
 * Check if the event target is an input element that should receive keyboard input
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

/**
 * useKeyboardControls - Hook for comprehensive keyboard control management
 * 
 * Features:
 * - Register SPACE for primary attack in Battle Arena
 * - Register ENTER for confirmation in dialogs
 * - Register ESC for flee/cancel in all states
 * - Prevent default browser behaviors
 * - Filter shortcuts by current app state
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.5
 * 
 * @param bindings - Array of key bindings to register
 * @returns Object with active bindings and helper functions
 */
export function useKeyboardControls(bindings: KeyBinding[]): UseKeyboardControlsReturn {
  const currentState = useAppStore(state => state.state);
  const bindingsRef = useRef(bindings);
  
  // Update ref when bindings change
  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  /**
   * Get bindings that are active for the current state
   */
  const getActiveBindings = useCallback((): KeyBinding[] => {
    return bindingsRef.current.filter(binding => 
      isBindingActiveForState(binding, currentState)
    );
  }, [currentState]);

  /**
   * Handle keydown events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle events when typing in input fields
    if (isInputElement(event.target)) {
      return;
    }

    const normalizedKey = normalizeKey(event.key);
    const activeBindings = bindingsRef.current.filter(binding => 
      isBindingActiveForState(binding, currentState)
    );

    const matchingBinding = activeBindings.find(
      binding => normalizeKey(binding.key) === normalizedKey
    );

    if (matchingBinding) {
      // Prevent default browser behavior (Requirement 12.5)
      if (matchingBinding.preventDefault !== false) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      // Execute the action
      matchingBinding.action();
    }
  }, [currentState]);

  // Register keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Check if a specific key has a binding in current state
   */
  const hasBinding = useCallback((key: string): boolean => {
    const normalizedKey = normalizeKey(key);
    return getActiveBindings().some(
      binding => normalizeKey(binding.key) === normalizedKey
    );
  }, [getActiveBindings]);

  /**
   * Get the binding for a specific key in current state
   */
  const getBinding = useCallback((key: string): KeyBinding | undefined => {
    const normalizedKey = normalizeKey(key);
    return getActiveBindings().find(
      binding => normalizeKey(binding.key) === normalizedKey
    );
  }, [getActiveBindings]);

  return {
    activeBindings: getActiveBindings(),
    hasBinding,
    getBinding,
  };
}

/**
 * Default keyboard bindings for the Premium Exorcist
 * These can be customized or extended by components
 */
export const DEFAULT_KEYBOARD_BINDINGS = {
  SPACE: 'Space',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  R: 'r',
} as const;

/**
 * Get keyboard hint text for display on UI elements
 */
export function getKeyboardHint(key: string): string {
  const hintMap: Record<string, string> = {
    'Space': '[SPACE]',
    'Enter': '[ENTER]',
    'Escape': '[ESC]',
    'r': '[R]',
    'R': '[R]',
  };
  return hintMap[key] || `[${key.toUpperCase()}]`;
}

export default useKeyboardControls;
