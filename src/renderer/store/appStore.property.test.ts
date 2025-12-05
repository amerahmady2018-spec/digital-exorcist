import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  useAppStore, 
  AppState, 
  allowedTransitions,
  StateContext
} from './appStore';

/**
 * Property-Based Tests for Application State Machine
 * 
 * These tests verify universal properties for the state machine
 * using the fast-check library for property-based testing.
 */

describe('AppStore Property Tests', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAppStore.getState().reset();
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 26: State machine transition validity**
   * 
   * For any state transition request, only transitions defined in the allowed
   * transitions list should be executed.
   * 
   * **Validates: Requirements 14.2**
   */
  describe('Property 26: State machine transition validity', () => {
    it('should only allow transitions defined in allowedTransitions', () => {
      fc.assert(
        fc.property(
          // Generate source state
          fc.constantFrom(...Object.values(AppState)),
          // Generate target state
          fc.constantFrom(...Object.values(AppState)),
          (fromState, toState) => {
            // Reset and set initial state
            useAppStore.getState().reset();
            
            // Manually set the state to fromState for testing
            // We need to do this by transitioning through valid paths
            const store = useAppStore.getState();
            
            // Check if transition is in allowed list
            const isAllowed = allowedTransitions.some(
              t => t.from === fromState && t.to === toState
            );
            
            // Check using the store's validation method
            const storeValidation = store.isValidTransition(fromState, toState);
            
            // Both should agree
            expect(storeValidation).toBe(isAllowed);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid transitions', () => {
      // Define invalid transitions (not in allowedTransitions)
      const invalidTransitions = [
        { from: AppState.INTRO, to: AppState.HUD },
        { from: AppState.INTRO, to: AppState.BATTLE_ARENA },
        { from: AppState.MISSION_SELECT, to: AppState.INTRO },
        { from: AppState.MISSION_SELECT, to: AppState.BATTLE_ARENA },
        { from: AppState.HUD, to: AppState.INTRO },
        { from: AppState.HUD, to: AppState.MISSION_SELECT },
        { from: AppState.BATTLE_ARENA, to: AppState.INTRO },
        { from: AppState.BATTLE_ARENA, to: AppState.MISSION_SELECT }
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...invalidTransitions),
          (invalidTransition) => {
            const store = useAppStore.getState();
            
            // Should not be valid
            expect(store.isValidTransition(
              invalidTransition.from, 
              invalidTransition.to
            )).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept all valid transitions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allowedTransitions),
          (validTransition) => {
            const store = useAppStore.getState();
            
            // Should be valid
            expect(store.isValidTransition(
              validTransition.from, 
              validTransition.to
            )).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should follow the defined flow: INTRO → MISSION_SELECT → HUD → BATTLE_ARENA', () => {
      const store = useAppStore.getState();
      
      // Start at INTRO
      expect(store.state).toBe(AppState.INTRO);
      
      // Transition to MISSION_SELECT
      const result1 = store.transition(AppState.MISSION_SELECT);
      expect(result1).toBe(true);
      store.completeTransition();
      expect(useAppStore.getState().state).toBe(AppState.MISSION_SELECT);
      
      // Transition to HUD
      const result2 = useAppStore.getState().transition(AppState.HUD);
      expect(result2).toBe(true);
      useAppStore.getState().completeTransition();
      expect(useAppStore.getState().state).toBe(AppState.HUD);
      
      // Transition to BATTLE_ARENA
      const result3 = useAppStore.getState().transition(AppState.BATTLE_ARENA);
      expect(result3).toBe(true);
      useAppStore.getState().completeTransition();
      expect(useAppStore.getState().state).toBe(AppState.BATTLE_ARENA);
    });

    it('should allow transition back from BATTLE_ARENA to HUD', () => {
      const store = useAppStore.getState();
      
      // Navigate to BATTLE_ARENA
      store.transition(AppState.MISSION_SELECT);
      store.completeTransition();
      useAppStore.getState().transition(AppState.HUD);
      useAppStore.getState().completeTransition();
      useAppStore.getState().transition(AppState.BATTLE_ARENA);
      useAppStore.getState().completeTransition();
      
      expect(useAppStore.getState().state).toBe(AppState.BATTLE_ARENA);
      
      // Should be able to go back to HUD
      const result = useAppStore.getState().transition(AppState.HUD);
      expect(result).toBe(true);
      useAppStore.getState().completeTransition();
      expect(useAppStore.getState().state).toBe(AppState.HUD);
    });

    it('should not allow skipping states in the flow', () => {
      const store = useAppStore.getState();
      
      // Start at INTRO
      expect(store.state).toBe(AppState.INTRO);
      
      // Try to skip to HUD (should fail)
      const result1 = store.transition(AppState.HUD);
      expect(result1).toBe(false);
      expect(useAppStore.getState().state).toBe(AppState.INTRO);
      
      // Try to skip to BATTLE_ARENA (should fail)
      const result2 = useAppStore.getState().transition(AppState.BATTLE_ARENA);
      expect(result2).toBe(false);
      expect(useAppStore.getState().state).toBe(AppState.INTRO);
    });

    it('should preserve context across valid transitions', () => {
      fc.assert(
        fc.property(
          fc.record({
            selectedDirectory: fc.option(fc.string(), { nil: undefined }),
            isScanning: fc.option(fc.boolean(), { nil: undefined })
          }),
          (contextData) => {
            useAppStore.getState().reset();
            const store = useAppStore.getState();
            
            // Set initial context
            store.updateContext(contextData as Partial<StateContext>);
            
            // Transition with additional context
            store.transition(AppState.MISSION_SELECT, { selectedDirectory: '/test/path' });
            store.completeTransition();
            
            // Context should be preserved and merged
            const newContext = useAppStore.getState().context;
            expect(newContext.selectedDirectory).toBe('/test/path');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 27: State transition animation triggering**
   * 
   * For any state change, the appropriate transition animation should be triggered
   * based on the transition type.
   * 
   * **Validates: Requirements 14.5**
   */
  describe('Property 27: State transition animation triggering', () => {
    it('should set correct animation for each valid transition', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allowedTransitions),
          (transition) => {
            useAppStore.getState().reset();
            const store = useAppStore.getState();
            
            // Get expected animation
            const expectedAnimation = store.getTransitionAnimation(
              transition.from, 
              transition.to
            );
            
            // Should match the defined animation
            expect(expectedAnimation).toBe(transition.animation);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null animation for invalid transitions', () => {
      const invalidTransitions = [
        { from: AppState.INTRO, to: AppState.HUD },
        { from: AppState.INTRO, to: AppState.BATTLE_ARENA },
        { from: AppState.HUD, to: AppState.INTRO }
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...invalidTransitions),
          (transition) => {
            const store = useAppStore.getState();
            
            const animation = store.getTransitionAnimation(
              transition.from, 
              transition.to
            );
            
            expect(animation).toBeNull();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set isTransitioning to true during transition', () => {
      useAppStore.getState().reset();
      const store = useAppStore.getState();
      
      expect(store.isTransitioning).toBe(false);
      
      // Start transition
      store.transition(AppState.MISSION_SELECT);
      
      expect(useAppStore.getState().isTransitioning).toBe(true);
      expect(useAppStore.getState().currentAnimation).toBe('fade');
      
      // Complete transition
      useAppStore.getState().completeTransition();
      
      expect(useAppStore.getState().isTransitioning).toBe(false);
      expect(useAppStore.getState().currentAnimation).toBeNull();
    });

    it('should block transitions while one is in progress', () => {
      useAppStore.getState().reset();
      const store = useAppStore.getState();
      
      // Start first transition
      const result1 = store.transition(AppState.MISSION_SELECT);
      expect(result1).toBe(true);
      
      // Try to start another transition while first is in progress
      const result2 = useAppStore.getState().transition(AppState.HUD);
      expect(result2).toBe(false);
      
      // State should still be MISSION_SELECT (first transition)
      expect(useAppStore.getState().state).toBe(AppState.MISSION_SELECT);
    });
  });
});
