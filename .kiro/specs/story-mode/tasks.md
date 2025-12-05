# Implementation Plan

- [x] 1. Set up Story Mode data and types

- [x] 1.1 Create story entity data file with predefined fake entities
  - Create `src/renderer/data/storyEntities.ts`
  - Define StoryEntity interface with id, name, type, image, hp, threatLevel, lore, fakeFilePath, fakeFileSize
  - Create STORY_ENTITIES array with 3 predefined entities (Ghost, Demon, Zombie)
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 1.2 Create story state types and interfaces
  - Define StoryPhase type ('intro' | 'entity' | 'summary')
  - Define StoryState interface with phase, currentEntityIndex, entities, results
  - Define EntityResult interface with entityId and outcome
  - Add to shared types or create `src/renderer/types/storyTypes.ts`
  - _Requirements: 1.1_

- [x] 1.3 Write property test for story initialization
  - **Property 1: Story mode initialization creates valid state**
  - **Validates: Requirements 1.1**

- [x] 2. Create StoryIntro component

- [x] 2.1 Implement StoryIntro component with narrative introduction
  - Create `src/renderer/components/StoryIntro.tsx`
  - Display "The Ritual Begins" title with creepy font styling
  - Show welcome text and instructions
  - Add "Begin the Ritual" button that calls onStart prop
  - Use Framer Motion for entrance animations
  - _Requirements: 1.2, 7.1_

- [x] 2.2 Write unit tests for StoryIntro component
  - Test component renders title and narrative text
  - Test onStart callback is called when button clicked
  - _Requirements: 1.2, 7.1_

- [x] 3. Create EntityPresentation component

- [x] 3.1 Implement EntityPresentation component
  - Create `src/renderer/components/EntityPresentation.tsx`
  - Display entity image, name, type badge, HP, threat level, and lore
  - Show progress indicator (Entity X of Y)
  - Add FIGHT button (red, prominent) and Skip button (gray, secondary)
  - Use Framer Motion for entity entrance animation
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.2 Write property test for entity presentation completeness
  - **Property 3: Entity presentation completeness**
  - **Validates: Requirements 2.1, 2.2**

- [x] 3.3 Write unit tests for EntityPresentation
  - Test all entity fields are displayed
  - Test FIGHT button calls onFight
  - Test Skip button calls onSkip
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Create StorySummary component

- [x] 4.1 Implement StorySummary component
  - Create `src/renderer/components/StorySummary.tsx`
  - Display completion title and summary statistics
  - Show counts: entities banished, skipped, survived
  - Add "Replay" button and "Exit to Menu" button
  - _Requirements: 6.4, 7.2, 7.3_

- [x] 4.2 Write unit tests for StorySummary
  - Test statistics are calculated correctly from results
  - Test replay button calls onReplay
  - Test exit button calls onExit
  - _Requirements: 6.4, 7.2, 7.3_

- [x] 5. Create useStoryMode hook for state management

- [x] 5.1 Implement useStoryMode custom hook
  - Create `src/renderer/hooks/useStoryMode.ts`
  - Implement initializeStoryMode function
  - Implement handleStartStory (intro → entity transition)
  - Implement handleFight (triggers battle callback)
  - Implement handleSkip (advances to next entity or summary)
  - Implement handleBattleResult (records victory/defeat, advances)
  - Implement handleReplay (resets to intro)
  - Implement handleExit (clears state)
  - _Requirements: 1.1, 3.1, 3.2, 5.2, 5.3, 6.1, 6.3, 6.4, 7.4_

- [x] 5.2 Write property test for skip advances without battle
  - **Property 5: Skip advances without battle**
  - **Validates: Requirements 3.2, 6.3**

- [x] 5.3 Write property test for no automatic battles
  - **Property 6: No automatic battles or progression**
  - **Validates: Requirements 3.3, 3.4**

- [x] 5.4 Write property test for victory marks entity as banished
  - **Property 7: Victory marks entity as banished**
  - **Validates: Requirements 5.2**

- [x] 5.5 Write property test for story progression after action
  - **Property 8: Story progression after action**
  - **Validates: Requirements 5.3, 6.4, 7.2**

- [x] 5.6 Write property test for defeat allows continuation
  - **Property 9: Defeat allows continuation without penalty**
  - **Validates: Requirements 6.1**

- [x] 5.7 Write property test for exit resets state
  - **Property 10: Exit resets story state**
  - **Validates: Requirements 7.4**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create main StoryMode component

- [x] 7.1 Implement StoryMode container component
  - Create `src/renderer/components/StoryMode.tsx`
  - Use useStoryMode hook for state management
  - Conditionally render StoryIntro, EntityPresentation, or StorySummary based on phase
  - Pass appropriate callbacks to child components
  - Handle FIGHT by calling onStartBattle prop with current entity
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.2, 6.4, 7.1, 7.2_

- [x] 7.2 Write integration tests for StoryMode
  - Test full flow from intro through entities to summary
  - Test FIGHT triggers onStartBattle callback
  - Test Skip advances through entities
  - _Requirements: 1.1, 3.1, 3.2, 6.4_

- [x] 8. Integrate Story Mode into App.tsx

- [x] 8.1 Add story mode state and routing to App.tsx
  - Add AppMode type ('dashboard' | 'story' | 'battle')
  - Add appMode state variable
  - Add storyState and currentBattleEntity state
  - Conditionally render StoryMode when appMode is 'story'
  - _Requirements: 1.1, 1.4_

- [x] 8.2 Create story entity to battle adapter
  - Implement storyEntityToClassifiedFile function
  - Convert StoryEntity to ClassifiedFile format for BattleArena
  - Ensure fake file paths are used (not real paths)
  - _Requirements: 1.3, 4.1_

- [x] 8.3 Handle battle start from Story Mode
  - When StoryMode calls onStartBattle, set appMode to 'battle'
  - Pass converted entity data to BattleArena
  - Ensure no real file deletion occurs (override onVictory)
  - _Requirements: 3.1, 4.1, 1.3_

- [x] 8.4 Handle battle end and return to Story Mode
  - On victory: call story mode's handleBattleResult with 'banished'
  - On defeat: call story mode's handleBattleResult with 'survived'
  - On flee: treat as skip, call handleBattleResult with 'skipped'
  - Return appMode to 'story'
  - _Requirements: 5.2, 5.3, 6.1, 6.2_

- [x] 8.5 Write property test for story mode isolation
  - **Property 2: Story mode isolation from real filesystem**
  - **Validates: Requirements 1.3, 1.4, 6.2**

- [x] 8.6 Write property test for FIGHT triggers battle
  - **Property 4: FIGHT button triggers battle mode**
  - **Validates: Requirements 3.1**

- [x] 9. Add Story Mode entry point to main menu

- [x] 9.1 Add Story Mode button to dashboard or main menu
  - Add "Story Mode" or "Begin Ritual" button to appropriate location
  - Style with spooky theme (purple gradient, ritual iconography)
  - On click, set appMode to 'story' and initialize story state
  - _Requirements: 1.1_

- [x] 9.2 Write integration test for story mode entry
  - Test clicking Story Mode button initializes story and shows intro
  - _Requirements: 1.1, 1.2_

- [x] 10. Final Checkpoint - Ensure all tests pass
  - All story mode tests pass (58 tests across 6 test files)
  - Pre-existing test failures in unrelated components remain
