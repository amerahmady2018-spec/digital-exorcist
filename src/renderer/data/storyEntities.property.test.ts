import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  STORY_ENTITIES, 
  StoryEntity, 
  getAllStoryEntities,
  getStoryEntityById 
} from './storyEntities';
import { 
  createInitialStoryState, 
  calculateSummaryStats,
  StoryState,
  EntityResult,
  EntityOutcome
} from '../types/storyTypes';

/**
 * Property-Based Tests for Story Mode Initialization
 * 
 * These tests verify universal properties for Story Mode state
 * using the fast-check library for property-based testing.
 */

describe('Story Mode Property Tests', () => {
  /**
   * **Feature: story-mode, Property 1: Story mode initialization creates valid state**
   * 
   * For any story mode initialization, the resulting state SHALL contain
   * the predefined entities array, have currentEntityIndex set to 0,
   * have phase set to 'intro', and have an empty results array.
   * 
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Story mode initialization creates valid state', () => {
    it('should initialize with correct default values using predefined entities', () => {
      fc.assert(
        fc.property(
          fc.constant(STORY_ENTITIES),
          (entities) => {
            const state = createInitialStoryState(entities);
            
            // Phase should be 'intro'
            expect(state.phase).toBe('intro');
            
            // Current entity index should be 0
            expect(state.currentEntityIndex).toBe(0);
            
            // Results should be empty
            expect(state.results).toEqual([]);
            
            // Entities should match input
            expect(state.entities).toHaveLength(entities.length);
            expect(state.entities).toEqual(entities);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create independent copy of entities array', () => {
      fc.assert(
        fc.property(
          fc.constant(STORY_ENTITIES),
          (entities) => {
            const state = createInitialStoryState(entities);
            
            // Modifying state.entities should not affect original
            const originalLength = STORY_ENTITIES.length;
            
            // State entities should be a copy, not the same reference
            expect(state.entities).not.toBe(STORY_ENTITIES);
            expect(STORY_ENTITIES).toHaveLength(originalLength);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should work with any valid array of story entities', () => {
      // Generate arbitrary story entities
      const storyEntityArb = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        type: fc.constantFrom('ghost', 'demon', 'zombie') as fc.Arbitrary<'ghost' | 'demon' | 'zombie'>,
        image: fc.string(),
        hp: fc.integer({ min: 1, max: 1000 }),
        threatLevel: fc.constantFrom('Low', 'Medium', 'High') as fc.Arbitrary<'Low' | 'Medium' | 'High'>,
        lore: fc.string(),
        fakeFilePath: fc.string(),
        fakeFileSize: fc.integer({ min: 1, max: 1000000000 }),
      });

      fc.assert(
        fc.property(
          fc.array(storyEntityArb, { minLength: 0, maxLength: 10 }),
          (entities) => {
            const state = createInitialStoryState(entities as StoryEntity[]);
            
            // Should always initialize correctly regardless of entity count
            expect(state.phase).toBe('intro');
            expect(state.currentEntityIndex).toBe(0);
            expect(state.results).toEqual([]);
            expect(state.entities).toHaveLength(entities.length);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property tests for story entities data integrity
   */
  describe('Story Entities Data Integrity', () => {
    it('should have unique IDs for all predefined entities', () => {
      const ids = STORY_ENTITIES.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid monster types for all entities', () => {
      const validTypes = ['ghost', 'demon', 'zombie'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...STORY_ENTITIES),
          (entity) => {
            expect(validTypes).toContain(entity.type);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have positive HP for all entities', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...STORY_ENTITIES),
          (entity) => {
            expect(entity.hp).toBeGreaterThan(0);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have valid threat levels for all entities', () => {
      const validThreatLevels = ['Low', 'Medium', 'High'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...STORY_ENTITIES),
          (entity) => {
            expect(validThreatLevels).toContain(entity.threatLevel);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getStoryEntityById should return correct entity or undefined', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom(...STORY_ENTITIES.map(e => e.id)),
            fc.string() // Random strings that may not match
          ),
          (id) => {
            const result = getStoryEntityById(id);
            const expected = STORY_ENTITIES.find(e => e.id === id);
            
            expect(result).toEqual(expected);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getAllStoryEntities should return a copy of all entities', () => {
      const entities = getAllStoryEntities();
      
      expect(entities).toHaveLength(STORY_ENTITIES.length);
      expect(entities).not.toBe(STORY_ENTITIES); // Should be a copy
      expect(entities).toEqual(STORY_ENTITIES);
    });
  });

  /**
   * Summary statistics calculation tests
   */
  describe('Summary Statistics Calculation', () => {
    it('should correctly count outcomes', () => {
      const outcomeArb = fc.constantFrom('banished', 'skipped', 'survived') as fc.Arbitrary<EntityOutcome>;
      const resultArb = fc.record({
        entityId: fc.string({ minLength: 1 }),
        outcome: outcomeArb,
      });

      fc.assert(
        fc.property(
          fc.array(resultArb, { minLength: 0, maxLength: 20 }),
          (results) => {
            const stats = calculateSummaryStats(results as EntityResult[]);
            
            // Total should equal array length
            expect(stats.totalEntities).toBe(results.length);
            
            // Individual counts should sum to total
            expect(stats.banished + stats.skipped + stats.survived).toBe(stats.totalEntities);
            
            // Each count should match filtered length
            expect(stats.banished).toBe(results.filter(r => r.outcome === 'banished').length);
            expect(stats.skipped).toBe(results.filter(r => r.outcome === 'skipped').length);
            expect(stats.survived).toBe(results.filter(r => r.outcome === 'survived').length);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zeros for empty results', () => {
      const stats = calculateSummaryStats([]);
      
      expect(stats.totalEntities).toBe(0);
      expect(stats.banished).toBe(0);
      expect(stats.skipped).toBe(0);
      expect(stats.survived).toBe(0);
    });
  });
});
