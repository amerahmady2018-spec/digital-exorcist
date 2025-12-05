import React, { useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStoryMode } from '../hooks/useStoryMode';
import StoryIntro from './StoryIntro';
import StoryScanning from './StoryScanning';
import StoryOverview from './StoryOverview';
import EntityPresentation from './EntityPresentation';
import StoryVictory from './StoryVictory';
import StorySummary from './StorySummary';
import type { StoryEntity } from '../data/storyEntities';

/**
 * StoryMode - Main container component for Story Mode
 * 
 * Manages the story progression through phases:
 * intro → scanning → overview → entity (selected) → victory → overview/summary
 * 
 * Requirements: 1.1, 1.2, 2.1, 3.1, 3.2, 6.4, 7.1, 7.2
 */

export interface StoryModeProps {
  /** Callback when user exits story mode */
  onExit: () => void;
  /** Callback when user clicks FIGHT - passes entity for battle */
  onStartBattle: (entity: StoryEntity) => void;
  /** Additional CSS classes */
  className?: string;
}

/** Ref handle for external control of story mode */
export interface StoryModeHandle {
  /** Record battle result from external battle system */
  handleBattleResult: (outcome: 'banished' | 'survived' | 'skipped', entityId?: string) => void;
}

const StoryModeInner: React.ForwardRefRenderFunction<StoryModeHandle, StoryModeProps> = (
  { onExit, onStartBattle, className = '' },
  ref
) => {
  const {
    state,
    selectedEntity,
    lastCompletedEntity,
    remainingEntities,
    handleStartStory,
    handleScanComplete,
    handleSelectEntity,
    handleBackToOverview,
    handleFight,
    handleBattleResult,
    handleContinue,
    handleReplay,
    handleExit,
  } = useStoryMode();

  // Expose handleBattleResult to parent via ref
  useImperativeHandle(ref, () => ({
    handleBattleResult,
  }), [handleBattleResult]);

  const handleFightClick = () => {
    const entity = handleFight();
    if (entity) {
      onStartBattle(entity);
    }
  };

  const handleExitClick = useCallback(() => {
    handleExit();
    onExit();
  }, [handleExit, onExit]);

  const handleFinishOverview = () => {
    // When all entities dealt with and user clicks "View Results"
    handleContinue();
  };

  // ESC key handler for navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      
      // Navigate based on current phase
      if (state.phase === 'entity') {
        // From entity detail -> back to overview
        handleBackToOverview();
      } else if (state.phase === 'intro') {
        // From intro -> exit story mode
        handleExitClick();
      } else if (state.phase === 'overview') {
        // From overview -> exit story mode
        handleExitClick();
      } else if (state.phase === 'summary') {
        // From summary -> exit story mode
        handleExitClick();
      }
      // Don't handle ESC during scanning or victory - let those complete naturally
    }
  }, [state.phase, handleBackToOverview, handleExitClick]);

  // Register ESC key listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Dispatch custom event for MusicToggle theme based on phase and entity
  useEffect(() => {
    let theme: string = 'purple'; // default for intro, summary
    
    if (state.phase === 'scanning' || state.phase === 'overview') {
      theme = 'green'; // Green for scanning and overview (entities detected)
    } else if (state.phase === 'entity' && selectedEntity) {
      // Entity-specific colors
      if (selectedEntity.type === 'ghost') theme = 'cyan';
      else if (selectedEntity.type === 'zombie') theme = 'green';
      else if (selectedEntity.type === 'demon') theme = 'red';
    } else if (state.phase === 'victory' && lastCompletedEntity) {
      // Victory screen matches entity color
      if (lastCompletedEntity.type === 'ghost') theme = 'cyan';
      else if (lastCompletedEntity.type === 'zombie') theme = 'green';
      else if (lastCompletedEntity.type === 'demon') theme = 'red';
    }
    
    window.dispatchEvent(new CustomEvent('story-mode-theme', { detail: { theme } }));
  }, [state.phase, selectedEntity, lastCompletedEntity]);

  return (
    <div 
      data-testid="story-mode"
      className={`fixed inset-0 z-50 bg-black ${className}`}
    >
      <AnimatePresence mode="wait">
        {state.phase === 'intro' && (
          <StoryIntro
            key="intro"
            onStart={handleStartStory}
          />
        )}

        {state.phase === 'scanning' && (
          <StoryScanning
            key="scanning"
            onComplete={handleScanComplete}
          />
        )}

        {state.phase === 'overview' && (
          <StoryOverview
            key="overview"
            entities={state.entities}
            results={state.results}
            onSelectEntity={handleSelectEntity}
            onFinish={handleFinishOverview}
          />
        )}

        {state.phase === 'entity' && selectedEntity && (
          <EntityPresentation
            key={`entity-${selectedEntity.id}`}
            entity={selectedEntity}
            onFight={handleFightClick}
            onBack={handleBackToOverview}
          />
        )}

        {state.phase === 'victory' && lastCompletedEntity && state.lastOutcome && (
          <StoryVictory
            key={`victory-${lastCompletedEntity.id}`}
            entity={lastCompletedEntity}
            outcome={state.lastOutcome}
            onContinue={handleContinue}
            remainingCount={remainingEntities.length}
          />
        )}

        {state.phase === 'summary' && (
          <StorySummary
            key="summary"
            results={state.results}
            entities={state.entities}
            onReplay={handleReplay}
            onExit={handleExitClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StoryMode = forwardRef(StoryModeInner);

export default StoryMode;
