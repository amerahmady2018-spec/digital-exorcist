import { useState, useCallback } from 'react';
import { STORY_ENTITIES, StoryEntity } from '../data/storyEntities';

/**
 * Story Mode State Management Hook
 * 
 * Manages the story progression state machine for the guided onboarding experience.
 * Flow: intro → scanning → overview → entity (selected) → victory/skipped → overview → summary
 * 
 * Requirements: 1.1, 3.1, 3.2, 5.2, 5.3, 6.1, 6.3, 6.4, 7.4
 */

export type StoryPhase = 'intro' | 'scanning' | 'overview' | 'entity' | 'victory' | 'summary';

export type EntityOutcome = 'banished' | 'skipped' | 'survived';

export interface EntityResult {
  entityId: string;
  outcome: EntityOutcome;
}

export interface StoryState {
  phase: StoryPhase;
  currentEntityIndex: number;
  entities: StoryEntity[];
  results: EntityResult[];
  /** Currently selected entity for viewing/fighting */
  selectedEntityId: string | null;
  /** Entity ID that is currently in battle - persists during external battle */
  battleEntityId: string | null;
  /** Last completed entity for victory/skipped screen */
  lastCompletedEntityId: string | null;
  /** Last outcome for victory/skipped screen */
  lastOutcome: EntityOutcome | null;
}

export interface UseStoryModeReturn {
  /** Current story state */
  state: StoryState;
  /** Current entity being presented (null if not in entity phase) */
  currentEntity: StoryEntity | null;
  /** Selected entity for detail view */
  selectedEntity: StoryEntity | null;
  /** Last completed entity */
  lastCompletedEntity: StoryEntity | null;
  /** Remaining entities (not yet dealt with) */
  remainingEntities: StoryEntity[];
  /** Initialize/reset story mode to starting state */
  initializeStoryMode: () => void;
  /** Transition from intro to scanning */
  handleStartStory: () => void;
  /** Transition from scanning to overview (called after scan animation) */
  handleScanComplete: () => void;
  /** Select an entity from overview to view details */
  handleSelectEntity: (entityId: string) => void;
  /** Go back to overview from entity detail */
  handleBackToOverview: () => void;
  /** Handle FIGHT button - returns current entity for battle */
  handleFight: () => StoryEntity | null;
  /** Handle Skip button - marks as skipped and shows feedback */
  handleSkip: () => void;
  /** Record battle result and show victory/defeat screen */
  handleBattleResult: (outcome: 'banished' | 'survived' | 'skipped') => void;
  /** Continue from victory/skipped screen to overview or summary */
  handleContinue: () => void;
  /** Reset to intro for replay */
  handleReplay: () => void;
  /** Clear state for exit */
  handleExit: () => void;
  /** Check if story is complete (in summary phase) */
  isComplete: boolean;
  /** Check if all entities are dealt with */
  allEntitiesDealtWith: boolean;
}

/**
 * Create initial story state
 */
export function createInitialStoryState(): StoryState {
  return {
    phase: 'intro',
    currentEntityIndex: 0,
    entities: [...STORY_ENTITIES],
    results: [],
    selectedEntityId: null,
    battleEntityId: null,
    lastCompletedEntityId: null,
    lastOutcome: null,
  };
}

/**
 * Hook for managing Story Mode state
 */
export function useStoryMode(): UseStoryModeReturn {
  const [state, setState] = useState<StoryState>(createInitialStoryState);

  // Get entities that haven't been dealt with yet
  const remainingEntities = state.entities.filter(
    entity => !state.results.some(r => r.entityId === entity.id)
  );

  const allEntitiesDealtWith = remainingEntities.length === 0;

  const currentEntity = state.phase === 'entity' && state.selectedEntityId
    ? state.entities.find(e => e.id === state.selectedEntityId) || null
    : null;

  const selectedEntity = state.selectedEntityId
    ? state.entities.find(e => e.id === state.selectedEntityId) || null
    : null;

  const lastCompletedEntity = state.lastCompletedEntityId
    ? state.entities.find(e => e.id === state.lastCompletedEntityId) || null
    : null;

  const initializeStoryMode = useCallback(() => {
    setState(createInitialStoryState());
  }, []);

  const handleStartStory = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'scanning',
    }));
  }, []);

  const handleScanComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'overview',
    }));
  }, []);

  const handleSelectEntity = useCallback((entityId: string) => {
    setState(prev => ({
      ...prev,
      phase: 'entity',
      selectedEntityId: entityId,
    }));
  }, []);

  const handleBackToOverview = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'overview',
      selectedEntityId: null,
    }));
  }, []);

  const handleFight = useCallback((): StoryEntity | null => {
    if (state.phase !== 'entity' || !currentEntity) {
      return null;
    }
    // Store the entity ID for battle - this persists during external battle
    setState(prev => ({
      ...prev,
      battleEntityId: currentEntity.id,
    }));
    return currentEntity;
  }, [state.phase, currentEntity]);

  const handleSkip = useCallback(() => {
    if (state.phase !== 'entity' || !currentEntity) {
      return;
    }

    const newResult: EntityResult = {
      entityId: currentEntity.id,
      outcome: 'skipped',
    };

    setState(prev => ({
      ...prev,
      phase: 'victory', // Using victory phase for skip feedback too
      results: [...prev.results, newResult],
      lastCompletedEntityId: currentEntity.id,
      lastOutcome: 'skipped',
    }));
  }, [state.phase, currentEntity]);

  const handleBattleResult = useCallback((outcome: 'banished' | 'survived' | 'skipped', passedEntityId?: string) => {
    console.log('[useStoryMode] handleBattleResult called:', { outcome, passedEntityId });
    // Use setState callback to access current state directly
    // Use passed entityId first, then battleEntityId, then selectedEntityId
    setState(prev => {
      console.log('[useStoryMode] Previous state:', { 
        phase: prev.phase, 
        battleEntityId: prev.battleEntityId, 
        selectedEntityId: prev.selectedEntityId,
        resultsCount: prev.results.length 
      });
      
      const entityId = passedEntityId || prev.battleEntityId || prev.selectedEntityId;
      if (!entityId) {
        console.warn('[useStoryMode] handleBattleResult called but no entityId available');
        return prev;
      }

      // Check if this entity was already processed
      if (prev.results.some(r => r.entityId === entityId)) {
        console.warn('[useStoryMode] Entity already processed:', entityId);
        return {
          ...prev,
          phase: 'overview',
          battleEntityId: null,
        };
      }

      const newResult: EntityResult = {
        entityId: entityId,
        outcome: outcome,
      };

      console.log('[useStoryMode] Recording result:', newResult);

      return {
        ...prev,
        phase: 'victory',
        results: [...prev.results, newResult],
        lastCompletedEntityId: entityId,
        lastOutcome: outcome,
        battleEntityId: null, // Clear after use
      };
    });
  }, []);

  const handleContinue = useCallback(() => {
    setState(prev => {
      const remaining = prev.entities.filter(
        entity => !prev.results.some(r => r.entityId === entity.id)
      );
      
      // If all entities dealt with, go to summary
      if (remaining.length === 0) {
        return {
          ...prev,
          phase: 'summary',
          selectedEntityId: null,
          lastCompletedEntityId: null,
          lastOutcome: null,
        };
      }
      
      // Otherwise back to overview
      return {
        ...prev,
        phase: 'overview',
        selectedEntityId: null,
        lastCompletedEntityId: null,
        lastOutcome: null,
      };
    });
  }, []);

  const handleReplay = useCallback(() => {
    setState({
      phase: 'intro',
      currentEntityIndex: 0,
      entities: [...STORY_ENTITIES],
      results: [],
      selectedEntityId: null,
      battleEntityId: null,
      lastCompletedEntityId: null,
      lastOutcome: null,
    });
  }, []);

  const handleExit = useCallback(() => {
    setState(createInitialStoryState());
  }, []);

  const isComplete = state.phase === 'summary';

  return {
    state,
    currentEntity,
    selectedEntity,
    lastCompletedEntity,
    remainingEntities,
    initializeStoryMode,
    handleStartStory,
    handleScanComplete,
    handleSelectEntity,
    handleBackToOverview,
    handleFight,
    handleSkip,
    handleBattleResult,
    handleContinue,
    handleReplay,
    handleExit,
    isComplete,
    allEntitiesDealtWith,
  };
}

export default useStoryMode;
