import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { useStoryMode, createInitialStoryState } from './useStoryMode';
import { STORY_ENTITIES } from '../data/storyEntities';

/**
 * Property-Based Tests for useStoryMode Hook
 * 
 * Tests the story mode state management following the new flow:
 * intro → scanning → overview → entity → victory → overview/summary
 */

describe('useStoryMode Property Tests', () => {
  /**
   * Property 1: Story mode initialization creates valid state
   * Validates: Requirements 1.1
   */
  it('Property 1: Story mode initialization creates valid state', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const state = createInitialStoryState();
        
        expect(state.entities).toEqual(STORY_ENTITIES);
        expect(state.currentEntityIndex).toBe(0);
        expect(state.phase).toBe('intro');
        expect(state.results).toEqual([]);
        expect(state.selectedEntityId).toBeNull();
        expect(state.lastCompletedEntityId).toBeNull();
        expect(state.lastOutcome).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Start story transitions to scanning phase
   */
  it('Property 2: Start story transitions to scanning phase', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { result } = renderHook(() => useStoryMode());
        
        expect(result.current.state.phase).toBe('intro');
        
        act(() => {
          result.current.handleStartStory();
        });
        
        expect(result.current.state.phase).toBe('scanning');
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Scan complete transitions to overview phase
   */
  it('Property 3: Scan complete transitions to overview phase', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { result } = renderHook(() => useStoryMode());
        
        act(() => {
          result.current.handleStartStory();
          result.current.handleScanComplete();
        });
        
        expect(result.current.state.phase).toBe('overview');
        expect(result.current.remainingEntities.length).toBe(STORY_ENTITIES.length);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4: Select entity transitions to entity phase
   */
  it('Property 4: Select entity transitions to entity phase', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STORY_ENTITIES.length - 1 }),
        (entityIndex) => {
          const { result } = renderHook(() => useStoryMode());
          const targetEntity = STORY_ENTITIES[entityIndex];
          
          act(() => {
            result.current.handleStartStory();
            result.current.handleScanComplete();
            result.current.handleSelectEntity(targetEntity.id);
          });
          
          expect(result.current.state.phase).toBe('entity');
          expect(result.current.state.selectedEntityId).toBe(targetEntity.id);
          expect(result.current.selectedEntity?.id).toBe(targetEntity.id);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 5: Skip advances to victory phase with skipped outcome
   * Validates: Requirements 3.2, 6.3
   */
  it('Property 5: Skip advances to victory phase with skipped outcome', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STORY_ENTITIES.length - 1 }),
        (entityIndex) => {
          const { result } = renderHook(() => useStoryMode());
          const targetEntity = STORY_ENTITIES[entityIndex];
          
          act(() => {
            result.current.handleStartStory();
            result.current.handleScanComplete();
            result.current.handleSelectEntity(targetEntity.id);
          });
          
          const resultsBefore = result.current.state.results.length;
          
          act(() => {
            result.current.handleSkip();
          });
          
          expect(result.current.state.phase).toBe('victory');
          expect(result.current.state.results.length).toBe(resultsBefore + 1);
          expect(result.current.state.lastOutcome).toBe('skipped');
          expect(result.current.state.lastCompletedEntityId).toBe(targetEntity.id);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: No automatic battles or progression without user action
   * Validates: Requirements 3.3, 3.4
   */
  it('Property 6: No automatic battles or progression without user action', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { result } = renderHook(() => useStoryMode());
        const targetEntity = STORY_ENTITIES[0];
        
        act(() => {
          result.current.handleStartStory();
          result.current.handleScanComplete();
          result.current.handleSelectEntity(targetEntity.id);
        });
        
        const initialPhase = result.current.state.phase;
        const initialResults = result.current.state.results.length;
        
        // Without any action, state should remain unchanged
        expect(result.current.state.phase).toBe(initialPhase);
        expect(result.current.state.results.length).toBe(initialResults);
        expect(result.current.state.phase).toBe('entity');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Victory marks entity as banished
   * Validates: Requirements 5.2
   */
  it('Property 7: Victory marks entity as banished', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STORY_ENTITIES.length - 1 }),
        (entityIndex) => {
          const { result } = renderHook(() => useStoryMode());
          const targetEntity = STORY_ENTITIES[entityIndex];
          
          act(() => {
            result.current.handleStartStory();
            result.current.handleScanComplete();
            result.current.handleSelectEntity(targetEntity.id);
          });
          
          act(() => {
            result.current.handleBattleResult('banished');
          });
          
          expect(result.current.state.phase).toBe('victory');
          expect(result.current.state.lastOutcome).toBe('banished');
          
          const lastResult = result.current.state.results[result.current.state.results.length - 1];
          expect(lastResult.entityId).toBe(targetEntity.id);
          expect(lastResult.outcome).toBe('banished');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 8: Story progression - continue returns to overview or summary
   * Validates: Requirements 5.3, 6.4, 7.2
   */
  it('Property 8: Continue from victory returns to overview or summary', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('skip', 'banish', 'survive'), { minLength: 1, maxLength: STORY_ENTITIES.length }),
        (actions) => {
          const { result } = renderHook(() => useStoryMode());
          
          act(() => {
            result.current.handleStartStory();
            result.current.handleScanComplete();
          });
          
          let processedCount = 0;
          
          for (const action of actions) {
            const remaining = result.current.remainingEntities;
            if (remaining.length === 0) break;
            
            // Select first remaining entity
            act(() => {
              result.current.handleSelectEntity(remaining[0].id);
            });
            
            // Perform action
            act(() => {
              if (action === 'skip') {
                result.current.handleSkip();
              } else if (action === 'banish') {
                result.current.handleBattleResult('banished');
              } else {
                result.current.handleBattleResult('survived');
              }
            });
            
            expect(result.current.state.phase).toBe('victory');
            processedCount++;
            
            // Continue to next
            act(() => {
              result.current.handleContinue();
            });
            
            // After processing all entities, should be in summary
            if (processedCount >= STORY_ENTITIES.length) {
              expect(result.current.state.phase).toBe('summary');
            } else {
              expect(result.current.state.phase).toBe('overview');
            }
          }
          
          expect(result.current.state.results.length).toBe(Math.min(processedCount, STORY_ENTITIES.length));
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 9: Defeat allows continuation without penalty
   * Validates: Requirements 6.1
   */
  it('Property 9: Defeat allows continuation without penalty', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STORY_ENTITIES.length - 1 }),
        (entityIndex) => {
          const { result } = renderHook(() => useStoryMode());
          const targetEntity = STORY_ENTITIES[entityIndex];
          
          act(() => {
            result.current.handleStartStory();
            result.current.handleScanComplete();
            result.current.handleSelectEntity(targetEntity.id);
          });
          
          // Simulate defeat
          act(() => {
            result.current.handleBattleResult('survived');
          });
          
          expect(result.current.state.phase).toBe('victory');
          expect(result.current.state.lastOutcome).toBe('survived');
          
          // Result should be recorded as survived
          const lastResult = result.current.state.results[result.current.state.results.length - 1];
          expect(lastResult.outcome).toBe('survived');
          
          // Can continue
          act(() => {
            result.current.handleContinue();
          });
          
          // Should go back to overview (or summary if last)
          expect(['overview', 'summary']).toContain(result.current.state.phase);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 10: Exit resets story state
   * Validates: Requirements 7.4
   */
  it('Property 10: Exit resets story state', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('skip', 'banish'), { minLength: 0, maxLength: 2 }),
        (actions) => {
          const { result } = renderHook(() => useStoryMode());
          
          act(() => {
            result.current.handleStartStory();
            result.current.handleScanComplete();
          });
          
          // Perform some actions
          for (const action of actions) {
            const remaining = result.current.remainingEntities;
            if (remaining.length === 0) break;
            
            act(() => {
              result.current.handleSelectEntity(remaining[0].id);
            });
            
            act(() => {
              if (action === 'skip') {
                result.current.handleSkip();
              } else {
                result.current.handleBattleResult('banished');
              }
            });
            
            act(() => {
              result.current.handleContinue();
            });
          }
          
          // Exit story mode
          act(() => {
            result.current.handleExit();
          });
          
          // State should be reset to initial
          expect(result.current.state.phase).toBe('intro');
          expect(result.current.state.currentEntityIndex).toBe(0);
          expect(result.current.state.results).toEqual([]);
          expect(result.current.state.entities).toEqual(STORY_ENTITIES);
          expect(result.current.state.selectedEntityId).toBeNull();
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 11: Replay resets to intro phase
   */
  it('Property 11: Replay resets to intro phase with fresh state', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { result } = renderHook(() => useStoryMode());
        
        // Complete the story
        act(() => {
          result.current.handleStartStory();
          result.current.handleScanComplete();
        });
        
        // Process all entities one by one
        for (let i = 0; i < STORY_ENTITIES.length; i++) {
          // Get remaining entities fresh each iteration
          const remainingBefore = result.current.remainingEntities;
          if (remainingBefore.length === 0) break;
          
          const entityToProcess = remainingBefore[0];
          
          act(() => {
            result.current.handleSelectEntity(entityToProcess.id);
          });
          
          act(() => {
            result.current.handleSkip();
          });
          
          act(() => {
            result.current.handleContinue();
          });
        }
        
        expect(result.current.state.phase).toBe('summary');
        
        // Replay
        act(() => {
          result.current.handleReplay();
        });
        
        expect(result.current.state.phase).toBe('intro');
        expect(result.current.state.currentEntityIndex).toBe(0);
        expect(result.current.state.results).toEqual([]);
        expect(result.current.state.selectedEntityId).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 12: Back to overview from entity phase
   */
  it('Property 12: Back to overview returns to overview phase', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: STORY_ENTITIES.length - 1 }),
        (entityIndex) => {
          const { result } = renderHook(() => useStoryMode());
          const targetEntity = STORY_ENTITIES[entityIndex];
          
          act(() => {
            result.current.handleStartStory();
            result.current.handleScanComplete();
            result.current.handleSelectEntity(targetEntity.id);
          });
          
          expect(result.current.state.phase).toBe('entity');
          
          act(() => {
            result.current.handleBackToOverview();
          });
          
          expect(result.current.state.phase).toBe('overview');
          expect(result.current.state.selectedEntityId).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });
});
