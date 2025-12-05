# Design Document

## Overview

Story Mode is a guided onboarding experience that introduces users to The Digital Exorcist through a narrative-driven ritual using simulated (fake) files. Users progress through a sequence of supernatural entity encounters, each presented with lore and explanation, before choosing to FIGHT or Skip. Battles use the existing turn-based battle system. This mode operates entirely with fake data—no real files are accessed or modified—making it a safe, consequence-free learning experience.

## Architecture

### Component Hierarchy

**App.tsx (Root Level)**
- Manages `appMode` state: 'dashboard' | 'story' | 'battle'
- Manages `storyState` for Story Mode progression
- Conditionally renders StoryMode, BattleArena, or ExorcismDashboard

**StoryMode.tsx (New Component)**
- Manages story progression state machine
- Renders narrative sequences, entity presentations, and summary screens
- Triggers battle mode when user clicks FIGHT
- Handles Skip action to advance without battle

**EntityPresentation.tsx (New Component)**
- Displays a single fake file entity with lore, stats, and visuals
- Shows FIGHT and Skip action buttons
- Emits user choice to parent

**StoryIntro.tsx (New Component)**
- Displays opening narrative sequence
- Animates text and imagery for atmosphere
- Triggers story start on user action

**StorySummary.tsx (New Component)**
- Displays completion screen with statistics
- Shows entities banished vs skipped
- Offers replay or exit options

### State Management

**App.tsx State**
```typescript
type AppMode = 'dashboard' | 'story' | 'battle';

const [appMode, setAppMode] = useState<AppMode>('dashboard');
const [storyState, setStoryState] = useState<StoryState | null>(null);
const [currentBattleEntity, setCurrentBattleEntity] = useState<StoryEntity | null>(null);
```

**StoryMode State**
```typescript
type StoryPhase = 'intro' | 'entity' | 'summary';

interface StoryState {
  phase: StoryPhase;
  currentEntityIndex: number;
  entities: StoryEntity[];
  results: EntityResult[];
}

interface EntityResult {
  entityId: string;
  outcome: 'banished' | 'skipped' | 'survived';
}
```

### Integration with Existing Battle System

Story Mode reuses the existing `BattleArena` component with minor adaptations:
- Pass fake entity data instead of real file data
- On victory: mark entity as banished, return to story (no real file deletion)
- On defeat: mark entity as survived, return to story (no penalty)
- On flee: treat as skip, return to story

## Components and Interfaces

### StoryMode Component

**Props Interface**
```typescript
interface StoryModeProps {
  onExit: () => void;
  onStartBattle: (entity: StoryEntity) => void;
}
```

**Layout Structure**
```tsx
<div className="fixed inset-0 z-50 bg-graveyard-950">
  {phase === 'intro' && (
    <StoryIntro onStart={handleStartStory} />
  )}
  
  {phase === 'entity' && currentEntity && (
    <EntityPresentation
      entity={currentEntity}
      entityNumber={currentEntityIndex + 1}
      totalEntities={entities.length}
      onFight={handleFight}
      onSkip={handleSkip}
    />
  )}
  
  {phase === 'summary' && (
    <StorySummary
      results={results}
      entities={entities}
      onReplay={handleReplay}
      onExit={onExit}
    />
  )}
</div>
```

### EntityPresentation Component

**Props Interface**
```typescript
interface EntityPresentationProps {
  entity: StoryEntity;
  entityNumber: number;
  totalEntities: number;
  onFight: () => void;
  onSkip: () => void;
}
```

**Layout Structure**
```tsx
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="flex flex-col items-center justify-center min-h-screen p-8"
>
  {/* Progress indicator */}
  <div className="absolute top-4 right-4 font-tech text-gray-400">
    Entity {entityNumber} of {totalEntities}
  </div>

  {/* Entity visual */}
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="relative mb-8"
  >
    <img 
      src={entity.image} 
      alt={entity.name}
      className="w-64 h-64 object-contain drop-shadow-2xl"
    />
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 
                    px-4 py-1 bg-black/80 rounded-full">
      <span className="font-tech text-sm text-purple-400">
        {entity.type}
      </span>
    </div>
  </motion.div>

  {/* Entity name */}
  <h2 className="font-creepy text-4xl text-red-500 mb-4">
    {entity.name}
  </h2>

  {/* Entity stats */}
  <div className="flex gap-8 mb-6">
    <div className="text-center">
      <span className="font-tech text-gray-400 text-sm">HP</span>
      <div className="font-tech text-2xl text-red-400">{entity.hp}</div>
    </div>
    <div className="text-center">
      <span className="font-tech text-gray-400 text-sm">THREAT</span>
      <div className="font-tech text-2xl text-orange-400">{entity.threatLevel}</div>
    </div>
  </div>

  {/* Lore description */}
  <div className="max-w-xl text-center mb-8">
    <p className="font-tech text-gray-300 leading-relaxed">
      {entity.lore}
    </p>
  </div>

  {/* Action buttons */}
  <div className="flex gap-6">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onFight}
      className="px-12 py-4 bg-gradient-to-r from-red-700 to-red-600 
                 text-white font-tech font-bold text-xl rounded-lg
                 border-2 border-red-500 shadow-lg shadow-red-900/50"
    >
      ⚔️ FIGHT
    </motion.button>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSkip}
      className="px-12 py-4 bg-gradient-to-r from-gray-700 to-gray-600 
                 text-white font-tech font-bold text-xl rounded-lg
                 border-2 border-gray-500"
    >
      Skip →
    </motion.button>
  </div>
</motion.div>
```

### StoryIntro Component

**Props Interface**
```typescript
interface StoryIntroProps {
  onStart: () => void;
}
```

**Layout Structure**
```tsx
<motion.div 
  className="flex flex-col items-center justify-center min-h-screen p-8"
>
  <motion.h1
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="font-creepy text-6xl text-red-500 mb-8"
  >
    The Ritual Begins
  </motion.h1>
  
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="max-w-2xl text-center mb-12"
  >
    <p className="font-tech text-xl text-gray-300 leading-relaxed mb-6">
      Welcome, Exorcist. Your training begins now.
    </p>
    <p className="font-tech text-gray-400 leading-relaxed">
      You will encounter supernatural entities that haunt digital realms.
      Each entity carries its own dark history. Study them carefully,
      then choose: engage in battle to banish them, or pass them by.
    </p>
  </motion.div>
  
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onStart}
    className="px-16 py-6 bg-gradient-to-r from-purple-700 to-purple-600 
               text-white font-tech font-bold text-2xl rounded-lg
               border-2 border-purple-500 shadow-lg shadow-purple-900/50"
  >
    Begin the Ritual
  </motion.button>
</motion.div>
```

### StorySummary Component

**Props Interface**
```typescript
interface StorySummaryProps {
  results: EntityResult[];
  entities: StoryEntity[];
  onReplay: () => void;
  onExit: () => void;
}
```

## Data Models

### StoryEntity

```typescript
interface StoryEntity {
  id: string;
  name: string;
  type: 'Ghost' | 'Demon' | 'Zombie';
  image: string;
  hp: number;
  threatLevel: 'Low' | 'Medium' | 'High';
  lore: string;
  // For battle system compatibility
  fakeFilePath: string;
  fakeFileSize: number;
}
```

### Predefined Story Entities

```typescript
const STORY_ENTITIES: StoryEntity[] = [
  {
    id: 'ghost-1',
    name: 'The Forgotten Log',
    type: 'Ghost',
    image: '/assets/monsters/ghost.png',
    hp: 50,
    threatLevel: 'Low',
    lore: 'An ancient log file from 2019, abandoned and forgotten. It whispers of errors long past, clinging to existence despite serving no purpose.',
    fakeFilePath: '/fake/old_debug.log',
    fakeFileSize: 5 * 1024 * 1024, // 5MB
  },
  {
    id: 'demon-1',
    name: 'The Bloated Archive',
    type: 'Demon',
    image: '/assets/monsters/demon.png',
    hp: 150,
    threatLevel: 'High',
    lore: 'A massive archive that grew beyond control, consuming disk space with insatiable hunger. Its bulk slows all who approach.',
    fakeFilePath: '/fake/massive_backup.zip',
    fakeFileSize: 15 * 1024 * 1024, // 15MB
  },
  {
    id: 'zombie-1',
    name: 'The Duplicate Shade',
    type: 'Zombie',
    image: '/assets/monsters/zombie.png',
    hp: 80,
    threatLevel: 'Medium',
    lore: 'A copy of a copy of a copy. This file exists in multiple places, each instance unaware of the others, mindlessly duplicating.',
    fakeFilePath: '/fake/document_copy(3).pdf',
    fakeFileSize: 8 * 1024 * 1024, // 8MB
  },
];
```

### StoryState

```typescript
interface StoryState {
  phase: 'intro' | 'entity' | 'summary';
  currentEntityIndex: number;
  entities: StoryEntity[];
  results: EntityResult[];
}

interface EntityResult {
  entityId: string;
  outcome: 'banished' | 'skipped' | 'survived';
}
```

### Story State Machine

```typescript
type StoryPhase = 'intro' | 'entity' | 'summary';

// State transitions:
// intro -> entity (user clicks "Begin the Ritual")
// entity -> battle (user clicks FIGHT) -> entity (battle ends)
// entity -> entity (user clicks Skip, more entities remain)
// entity -> summary (user clicks Skip or battle ends, no more entities)
// summary -> intro (user clicks Replay)
// summary -> dashboard (user clicks Exit)
```

### Battle Integration Adapter

```typescript
// Convert StoryEntity to ClassifiedFile for BattleArena compatibility
function storyEntityToClassifiedFile(entity: StoryEntity): ClassifiedFile {
  return {
    path: entity.fakeFilePath,
    name: entity.name,
    size: entity.fakeFileSize,
    classifications: [entity.type],
    // Additional fields as needed by BattleArena
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Story mode initialization creates valid state
*For any* story mode initialization, the resulting state SHALL contain the predefined entities array, have currentEntityIndex set to 0, have phase set to 'intro', and have an empty results array.
**Validates: Requirements 1.1**

### Property 2: Story mode isolation from real filesystem
*For any* operation performed during Story Mode (FIGHT, Skip, victory, defeat, exit), the system SHALL NOT invoke any real filesystem IPC calls (banishFile, scanDirectory, etc.) and SHALL NOT modify any persistent application state.
**Validates: Requirements 1.3, 1.4, 6.2**

### Property 3: Entity presentation completeness
*For any* StoryEntity displayed in the entity phase, the rendered output SHALL contain the entity's name, type, hp, threatLevel, lore, and image.
**Validates: Requirements 2.1, 2.2**

### Property 4: FIGHT button triggers battle mode
*For any* entity in the entity phase, clicking the FIGHT button SHALL transition appMode to 'battle' and set currentBattleEntity to the current entity's data.
**Validates: Requirements 3.1**

### Property 5: Skip advances without battle
*For any* entity in the entity phase, clicking Skip SHALL increment currentEntityIndex, add a result with outcome 'skipped', and SHALL NOT change appMode to 'battle'.
**Validates: Requirements 3.2, 6.3**

### Property 6: No automatic battles or progression
*For any* state transition into the entity phase, the system SHALL remain in entity phase with battle mode inactive until the user explicitly clicks FIGHT or Skip.
**Validates: Requirements 3.3, 3.4**

### Property 7: Victory marks entity as banished
*For any* battle that ends in victory, the system SHALL add a result with outcome 'banished' for the current entity and return to story mode.
**Validates: Requirements 5.2**

### Property 8: Story progression after action
*For any* action (FIGHT with victory/defeat, or Skip), if currentEntityIndex < entities.length - 1, the system SHALL increment currentEntityIndex and remain in entity phase. If currentEntityIndex >= entities.length - 1, the system SHALL transition to summary phase.
**Validates: Requirements 5.3, 6.4, 7.2**

### Property 9: Defeat allows continuation without penalty
*For any* battle that ends in defeat, the system SHALL add a result with outcome 'survived', return to story mode, and allow progression to the next entity or summary.
**Validates: Requirements 6.1**

### Property 10: Exit resets story state
*For any* exit action from Story Mode (at any phase), the system SHALL set appMode to 'dashboard', clear storyState, and not persist any story progress.
**Validates: Requirements 7.4**

## Error Handling

### Invalid Entity Data

**Scenario**: A story entity has missing or invalid fields

**Handling**:
- Validate all entities at initialization
- Skip invalid entities with console warning
- If all entities invalid, show error and return to dashboard

### Battle System Integration Failure

**Scenario**: BattleArena component fails to render or crashes

**Handling**:
- Wrap battle in error boundary
- On error, treat as defeat (entity survives)
- Log error and continue story
- Display user-friendly message

### State Corruption

**Scenario**: Story state becomes invalid (negative index, missing results)

**Handling**:
- Validate state on each transition
- Reset to valid state if corruption detected
- Log warning for debugging

### Image Loading Failure

**Scenario**: Entity image fails to load

**Handling**:
- Display placeholder monster image
- Continue with entity presentation
- Log warning about missing asset

## Testing Strategy

### Unit Testing

Unit tests will focus on:

- **State Initialization**: Test initializeStoryMode creates valid initial state
- **State Transitions**: Test phase transitions (intro → entity → summary)
- **Result Recording**: Test victory/defeat/skip correctly record outcomes
- **Entity Adapter**: Test storyEntityToClassifiedFile conversion
- **Summary Calculations**: Test banished/skipped/survived counts

### Property-Based Testing

The application will use **fast-check** for property-based testing with minimum 100 iterations per property:

**Example Property Test**:
```typescript
// **Feature: story-mode, Property 1: Story mode initialization creates valid state**
it('story mode initialization creates valid state', () => {
  fc.assert(
    fc.property(
      fc.constant(null), // No input variation needed
      () => {
        const state = initializeStoryMode();
        expect(state.entities).toEqual(STORY_ENTITIES);
        expect(state.currentEntityIndex).toBe(0);
        expect(state.phase).toBe('intro');
        expect(state.results).toEqual([]);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Example Property Test**:
```typescript
// **Feature: story-mode, Property 5: Skip advances without battle**
it('skip advances without triggering battle', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: STORY_ENTITIES.length - 2 }), // valid entity indices
      (entityIndex) => {
        const state = createStoryState({ currentEntityIndex: entityIndex, phase: 'entity' });
        const { newState, battleTriggered } = handleSkip(state);
        
        expect(newState.currentEntityIndex).toBe(entityIndex + 1);
        expect(newState.results[newState.results.length - 1].outcome).toBe('skipped');
        expect(battleTriggered).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Example Property Test**:
```typescript
// **Feature: story-mode, Property 2: Story mode isolation from real filesystem**
it('story mode never calls real filesystem operations', () => {
  fc.assert(
    fc.property(
      fc.array(fc.constantFrom('fight', 'skip', 'victory', 'defeat', 'exit'), { minLength: 1, maxLength: 20 }),
      (actions) => {
        const mockBanishFile = jest.fn();
        const state = initializeStoryMode();
        
        simulateStoryActions(state, actions, { banishFile: mockBanishFile });
        
        expect(mockBanishFile).not.toHaveBeenCalled();
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

- **Full Story Flow**: Test complete story from intro through all entities to summary
- **Battle Integration**: Test FIGHT correctly passes entity data to BattleArena
- **Victory Return**: Test victory in battle correctly returns to story and records result
- **Defeat Return**: Test defeat in battle correctly returns to story and records result
- **Exit at Various Points**: Test exit from intro, entity, and summary phases

## Implementation Notes

### Performance Considerations

- Preload entity images during intro phase
- Use React.memo for EntityPresentation to prevent unnecessary re-renders
- Lazy load StorySummary component

### Accessibility

- Ensure FIGHT and Skip buttons are keyboard accessible
- Add ARIA labels for screen readers
- Support reduced motion preferences for animations
- Provide text alternatives for entity images

### File Modifications Required

- `src/renderer/App.tsx`: Add appMode state, story mode routing
- `src/renderer/components/StoryMode.tsx`: New component (main story container)
- `src/renderer/components/EntityPresentation.tsx`: New component (entity display)
- `src/renderer/components/StoryIntro.tsx`: New component (intro screen)
- `src/renderer/components/StorySummary.tsx`: New component (completion screen)
- `src/renderer/data/storyEntities.ts`: New file (predefined entity data)
- `src/renderer/hooks/useStoryMode.ts`: New hook (story state management)
