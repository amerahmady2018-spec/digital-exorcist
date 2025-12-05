# Design Document: Exorcism Style Selection

## Overview

The Exorcism Style Selection feature extends The Digital Exorcist application with a new screen flow that appears after the Title Screen. Users choose between three distinct exorcism experiences, each providing a complete flow with preview, active, and summary screens. The feature maintains the existing cyber-horror visual language while introducing new state management for the three parallel flows.

## Architecture

The feature follows the existing Electron + React architecture with Zustand state management:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Renderer Process                          │
├─────────────────────────────────────────────────────────────────┤
│  App.tsx (State Router)                                          │
│    ├── TitleScreen (existing)                                    │
│    ├── ExorcismStyleScreen (NEW - HQ)                           │
│    │     ├── StyleCard (Guided Ritual)                          │
│    │     ├── StyleCard (Swift Purge)                            │
│    │     └── StyleCard (Confrontation)                          │
│    ├── GuidedRitualFlow (NEW)                                   │
│    │     ├── GuidedPreviewScreen                                │
│    │     ├── GuidedActiveScreen                                 │
│    │     └── GuidedSummaryScreen                                │
│    ├── SwiftPurgeFlow (NEW)                                     │
│    │     ├── SwiftLocationScreen                                │
│    │     ├── SwiftResultsScreen                                 │
│    │     └── SwiftSummaryScreen                                 │
│    └── ConfrontationFlow (NEW)                                  │
│          ├── ConfrontationPreviewScreen                         │
│          ├── ConfrontationLoopScreen                            │
│          └── ConfrontationSummaryScreen                         │
├─────────────────────────────────────────────────────────────────┤
│  Zustand Store (appStore.ts - Extended)                          │
│    ├── AppState enum (extended with new states)                  │
│    ├── FlowContext (entities, progress, results)                │
│    └── allowedTransitions (extended)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### State Management Extensions

```typescript
// Extended AppState enum
export enum AppState {
  INTRO = 'INTRO',
  EXORCISM_STYLE = 'EXORCISM_STYLE',  // NEW: HQ screen
  // Guided Ritual Flow
  GUIDED_PREVIEW = 'GUIDED_PREVIEW',
  GUIDED_ACTIVE = 'GUIDED_ACTIVE',
  GUIDED_SUMMARY = 'GUIDED_SUMMARY',
  // Swift Purge Flow
  SWIFT_LOCATION = 'SWIFT_LOCATION',
  SWIFT_RESULTS = 'SWIFT_RESULTS',
  SWIFT_SUMMARY = 'SWIFT_SUMMARY',
  // Confrontation Flow
  CONFRONTATION_PREVIEW = 'CONFRONTATION_PREVIEW',
  CONFRONTATION_LOOP = 'CONFRONTATION_LOOP',
  CONFRONTATION_SUMMARY = 'CONFRONTATION_SUMMARY',
  // Existing states
  MISSION_SELECT = 'MISSION_SELECT',
  HUD = 'HUD',
  BATTLE_ARENA = 'BATTLE_ARENA'
}

// Flow context for tracking encounter state
interface FlowContext {
  entities: ClassifiedFile[];
  currentEntityIndex: number;
  purgedEntities: ClassifiedFile[];
  sparedEntities: ClassifiedFile[];
  selectedLocation?: string;
  selectedCategories?: MonsterType[];
}
```

### Component Interfaces

```typescript
// ExorcismStyleScreen
interface ExorcismStyleScreenProps {
  onSelectStyle: (style: 'guided' | 'swift' | 'confrontation') => void;
}

// StyleCard
interface StyleCardProps {
  title: string;
  subtitle: string;
  style: 'guided' | 'swift' | 'confrontation';
  isSelected: boolean;
  onSelect: () => void;
}

// GuidedPreviewScreen
interface GuidedPreviewScreenProps {
  entities: ClassifiedFile[];
  onEnter: () => void;
  onBack: () => void;
}

// GuidedActiveScreen
interface GuidedActiveScreenProps {
  entities: ClassifiedFile[];
  onPurge: (file: ClassifiedFile) => void;
  onSpare: (file: ClassifiedFile) => void;
  onExit: () => void;
}

// SummaryScreen (shared interface)
interface SummaryScreenProps {
  purgedCount: { ghosts: number; zombies: number; demons: number };
  sparedCount: { ghosts: number; zombies: number; demons: number };
  spaceRecovered: number;
  onReturnToHQ: () => void;
  onViewGraveyard: () => void;
}

// ConfrontationLoopScreen
interface ConfrontationLoopScreenProps {
  currentEntity: ClassifiedFile;
  remainingCounts: { ghosts: number; zombies: number; demons: number };
  potentialSpaceRecovery: number;
  onPurge: () => void;
  onSpare: () => void;
  onExit: () => void;
}
```

### Shared UI Components

```typescript
// SafetyInfoPanel - Reusable modal/panel for safety information
interface SafetyInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// EntityCard - Reusable entity display card
interface EntityCardProps {
  entity: ClassifiedFile;
  isRevealed: boolean;
  onInspect: () => void;
  onPurge: () => void;
  onSpare: () => void;
  variant: 'grid' | 'central';
}
```

## Data Models

### Entity Classification (existing, reused)

```typescript
interface ClassifiedFile {
  path: string;
  name: string;
  size: number;
  lastModified: Date;
  classifications: MonsterType[];
}

type MonsterType = 'ghost' | 'zombie' | 'demon';
```

### Flow State

```typescript
interface ExorcismFlowState {
  // Current flow type
  flowType: 'guided' | 'swift' | 'confrontation' | null;
  
  // Entities in current encounter
  entities: ClassifiedFile[];
  
  // Current position in entity list (for confrontation)
  currentIndex: number;
  
  // Tracking decisions
  purged: ClassifiedFile[];
  spared: ClassifiedFile[];
  
  // Swift purge specific
  selectedLocation: string | null;
  selectedCategories: Set<MonsterType>;
}
```

### Entity Count Helper

```typescript
interface EntityCounts {
  ghosts: number;
  zombies: number;
  demons: number;
  unknown: number;
}

function countEntities(entities: ClassifiedFile[]): EntityCounts {
  return entities.reduce((counts, entity) => {
    if (entity.classifications.includes('ghost')) counts.ghosts++;
    else if (entity.classifications.includes('zombie')) counts.zombies++;
    else if (entity.classifications.includes('demon')) counts.demons++;
    else counts.unknown++;
    return counts;
  }, { ghosts: 0, zombies: 0, demons: 0, unknown: 0 });
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Style Selection Navigation
*For any* exorcism style selection (guided, swift, or confrontation), clicking the style card SHALL transition the application to the correct preview/location screen for that style.
**Validates: Requirements 1.4, 2.1, 5.1, 8.1**

### Property 2: Entity Count Accuracy
*For any* set of classified entities, the preview screens SHALL display counts that exactly match the number of entities with each classification type (ghost, zombie, demon).
**Validates: Requirements 2.3, 8.2**

### Property 3: Purge Operation Integrity
*For any* entity purge action across all flows, the file SHALL be moved to the graveyard folder and removed from the active entity list.
**Validates: Requirements 3.4, 6.4, 9.4**

### Property 4: Spare Operation Preservation
*For any* spare/keep action or cancel operation, the associated files SHALL remain unchanged in their original locations.
**Validates: Requirements 3.5, 6.5, 9.5**

### Property 5: Summary Count Consistency
*For any* completed flow, the summary screen SHALL display purge and spare counts that equal the total number of entities that were in the encounter.
**Validates: Requirements 4.2, 7.2, 10.2**

### Property 6: Space Recovery Calculation
*For any* set of purged files, the space recovered value SHALL equal the sum of the file sizes of all purged files.
**Validates: Requirements 4.3, 6.3, 10.3**

### Property 7: Entity Card Content Completeness
*For any* entity displayed in a card, the card SHALL contain the entity type icon, and when inspected/revealed, SHALL show filename, size, age, and graveyard destination.
**Validates: Requirements 3.2, 3.3, 9.2, 9.3**

### Property 8: Confrontation Single Entity Display
*For any* state in the Confrontation Loop, exactly one entity SHALL be displayed at a time, and the remaining counts SHALL accurately reflect unprocessed entities.
**Validates: Requirements 9.1, 9.6**

### Property 9: Entity Progression
*For any* purge or spare action in Confrontation mode, the system SHALL advance to the next entity in the queue, or to the summary screen if no entities remain.
**Validates: Requirements 9.4, 9.5**

### Property 10: State Management Consistency
*For any* state transition in the application, the Zustand store SHALL reflect the new state, and ESC key SHALL navigate to the appropriate previous screen.
**Validates: Requirements 12.2, 12.3, 12.4**

## Error Handling

### File Operation Errors
- If a purge operation fails, display an error toast and keep the entity in the active list
- If file access is denied, show a permission error with guidance
- If graveyard folder is inaccessible, attempt to create it or show error

### State Recovery
- If the app crashes during a flow, restore to EXORCISM_STYLE state on restart
- Persist flow progress to localStorage for recovery (optional enhancement)

### Edge Cases
- Empty entity list: Show "No entities found" message and return to HQ
- All entities already purged: Skip to summary with zero counts
- Scan timeout: Show timeout error and allow retry or cancel

## Testing Strategy

### Property-Based Testing Framework
The project uses **Vitest** with **fast-check** for property-based testing, consistent with existing test files in the codebase.

### Unit Tests
Unit tests will cover:
- Component rendering with various props
- State transitions in the Zustand store
- Entity count calculations
- Space recovery calculations

### Property-Based Tests
Each correctness property will be implemented as a property-based test:
- Tests will run a minimum of 100 iterations
- Each test will be tagged with the format: `**Feature: exorcism-style-selection, Property {number}: {property_text}**`
- Generators will create random entity sets with varying classifications and sizes

### Test Structure
```
src/renderer/components/
├── ExorcismStyleScreen.tsx
├── ExorcismStyleScreen.property.test.tsx
├── flows/
│   ├── GuidedPreviewScreen.tsx
│   ├── GuidedActiveScreen.tsx
│   ├── GuidedSummaryScreen.tsx
│   ├── SwiftLocationScreen.tsx
│   ├── SwiftResultsScreen.tsx
│   ├── SwiftSummaryScreen.tsx
│   ├── ConfrontationPreviewScreen.tsx
│   ├── ConfrontationLoopScreen.tsx
│   ├── ConfrontationSummaryScreen.tsx
│   └── flows.property.test.tsx
```

### Integration Tests
- Full flow navigation from Title Screen through each flow to summary
- File operations with mock file system
- Keyboard navigation (ESC key handling)
