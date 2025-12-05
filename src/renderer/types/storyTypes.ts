/**
 * Story Mode Types and Interfaces
 * 
 * Type definitions for Story Mode state management.
 */

import type { StoryEntity } from '../data/storyEntities';

/**
 * Story Mode phases
 * - intro: Opening narrative sequence
 * - entity: Viewing/interacting with an entity
 * - summary: Completion screen with results
 */
export type StoryPhase = 'intro' | 'entity' | 'summary';

/**
 * Outcome of an entity encounter
 * - banished: Player won the battle
 * - skipped: Player chose to skip
 * - survived: Player lost the battle (entity survives)
 */
export type EntityOutcome = 'banished' | 'skipped' | 'survived';

/**
 * Result of a single entity encounter
 */
export interface EntityResult {
  /** ID of the entity that was encountered */
  entityId: string;
  /** Outcome of the encounter */
  outcome: EntityOutcome;
}

/**
 * Complete Story Mode state
 */
export interface StoryState {
  /** Current phase of the story */
  phase: StoryPhase;
  /** Index of the current entity being viewed (0-based) */
  currentEntityIndex: number;
  /** Array of entities in this story session */
  entities: StoryEntity[];
  /** Results of entity encounters (grows as story progresses) */
  results: EntityResult[];
}

/**
 * Initialize a new Story Mode state
 */
export function createInitialStoryState(entities: StoryEntity[]): StoryState {
  return {
    phase: 'intro',
    currentEntityIndex: 0,
    entities: [...entities],
    results: [],
  };
}

/**
 * Summary statistics for the story completion screen
 */
export interface StorySummaryStats {
  /** Total number of entities encountered */
  totalEntities: number;
  /** Number of entities banished (battle won) */
  banished: number;
  /** Number of entities skipped */
  skipped: number;
  /** Number of entities that survived (battle lost) */
  survived: number;
}

/**
 * Calculate summary statistics from story results
 */
export function calculateSummaryStats(results: EntityResult[]): StorySummaryStats {
  return {
    totalEntities: results.length,
    banished: results.filter(r => r.outcome === 'banished').length,
    skipped: results.filter(r => r.outcome === 'skipped').length,
    survived: results.filter(r => r.outcome === 'survived').length,
  };
}
