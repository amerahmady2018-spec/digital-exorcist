# Design Document - Digital Exorcist Final Audit

## Overview

This audit finalizes THE DIGITAL EXORCIST for Kiroween demonstration. The application has exactly THREE modes with distinct mechanics. The start screen is LOCKED and perfect. All work applies ONLY to what comes after the start screen.

## Current State Analysis

### Mode Implementation Status

| Mode | Component | Status | Issues |
|------|-----------|--------|--------|
| Guided Ritual | GuidedPreviewScreen | ⚠️ Exists | Uses real file scanning, should use simulated data |
| Guided Ritual | GuidedActiveScreen | ⚠️ Exists | Uses real file operations, should be memory-only |
| Guided Ritual | GuidedSummaryScreen | ✅ Exists | Needs verification |
| Swift Purge | SwiftLocationScreen | ⚠️ Exists | Needs allowed folder restrictions |
| Swift Purge | SwiftResultsScreen | ⚠️ Exists | Needs bulk category actions |
| Swift Purge | SwiftSummaryScreen | ✅ Exists | Needs verification |
| Confrontation | ConfrontationPreviewScreen | ✅ Exists | Needs verification |
| Confrontation | ConfrontationLoopScreen | ⚠️ Exists | Needs one-by-one queue logic |
| Confrontation | ConfrontationSummaryScreen | ✅ Exists | Needs verification |

### Critical Issues Identified

#### Issue 1: Guided Ritual Uses Real Files
**Current:** GuidedActiveScreen calls `window.electronAPI.banishFile()` with real file paths
**Required:** Should use SIMULATED data only with NO real file operations
**Fix:** Create simulated file data and memory-only purge tracking

#### Issue 2: No Simulated File Data
**Current:** No JSON or in-memory simulated file dataset exists
**Required:** Pre-defined curated encounters (e.g., 3 ghosts, 2 zombies, 2 demons)
**Fix:** Create `simulatedFiles.ts` with fake file data

#### Issue 3: Swift Purge Missing Folder Restrictions
**Current:** SwiftLocationScreen allows any folder selection
**Required:** Only Downloads, Desktop, Documents, Pictures, Custom (with warning)
**Fix:** Add predefined location buttons and system folder blocking

#### Issue 4: Swift Purge Missing Bulk Actions
**Current:** SwiftResultsScreen shows individual files
**Required:** Category-based bulk actions (Purge All Ghosts, etc.)
**Fix:** Add category toggles and bulk purge buttons

#### Issue 5: Confrontation Not Queue-Based
**Current:** Shows grid of entities
**Required:** One-by-one queue presentation
**Fix:** Implement entity queue with single-entity display

#### Issue 6: Scrollbars Present
**Current:** Some screens have overflow scrolling
**Required:** NO scrollbars on ANY screen
**Fix:** Implement pagination or step-based content splitting

## Architecture

### Mode Flow Diagram

```
START SCREEN (LOCKED - DO NOT TOUCH)
        │
        ▼
   HQ / MODE SELECT
   (ExorcismStyleScreen)
        │
   ┌────┼────┐
   ▼    ▼    ▼
MODE 1  MODE 2  MODE 3
Guided  Swift   Confrontation
Ritual  Purge
   │      │       │
   ▼      ▼       ▼
Preview  Location  Preview
   │      │       │
   ▼      ▼       ▼
Active   Results   Loop
(Grid)   (Bulk)   (Queue)
   │      │       │
   ▼      ▼       ▼
Summary  Summary  Summary
   │      │       │
   └──────┼───────┘
          ▼
    RETURN TO HQ
```

### Data Architecture

#### Simulated File Model (Guided Ritual)
```typescript
interface SimulatedFile {
  id: string;
  fakePath: string;
  filename: string;
  extension: string;
  size: number;
  lastModified: Date;
  type: 'image' | 'video' | 'document' | 'other';
  entityType: 'ghost' | 'zombie' | 'demon';
  zone: string;
}
```

#### Real File Model (Swift Purge / Confrontation)
```typescript
interface RealFile {
  id: string;
  filePath: string;
  filename: string;
  extension: string;
  size: number;
  lastModified: Date;
  type: string;
  entityType: 'ghost' | 'zombie' | 'demon';
}
```

#### Graveyard Log Entry
```typescript
interface GraveyardEntry {
  originalPath: string;
  graveyardPath: string;
  mode: 'swift' | 'confrontation';
  timestamp: string;
  fileSize: number;
}
```

### Allowed Folder Locations (Modes 2 & 3)
```typescript
const ALLOWED_LOCATIONS = {
  downloads: { path: '~/Downloads', label: 'Downloads', icon: '📥' },
  desktop: { path: '~/Desktop', label: 'Desktop', icon: '🖥️' },
  documents: { path: '~/Documents', label: 'Documents', icon: '📄' },
  pictures: { path: '~/Pictures', label: 'Pictures', icon: '🖼️' },
  custom: { path: null, label: 'Custom Folder', icon: '📁', warning: true }
};

const FORBIDDEN_PATHS = [
  'C:\\Windows',
  'C:\\Program Files',
  '/System',
  '/usr',
  '/bin',
  '/etc'
];
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Guided Ritual File Isolation
*For any* file operation in Guided Ritual mode, the System SHALL NOT access the real file system.
**Validates: Requirements 2.1, 2.2, 2.6**

### Property 2: Real File Safety
*For any* purge operation in Swift Purge or Confrontation, the file SHALL be MOVED to graveyard, never deleted.
**Validates: Requirements 3.5, 5.1**

### Property 3: Navigation Completeness
*For any* screen in the application, there SHALL exist a valid exit path via ESC or UI button.
**Validates: Requirements 6.1, 6.4**

### Property 4: No Scrollbar Guarantee
*For any* screen in the application, the content SHALL fit within the viewport without scrollbars.
**Validates: Requirements 7.1, 7.2**

### Property 5: Mode Distinction
*For any* two different modes, the interaction pattern SHALL be mechanically distinct.
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 6: Folder Restriction
*For any* folder selection in Swift Purge or Confrontation, system folders SHALL be blocked.
**Validates: Requirements 3.7**

### Property 7: Queue Integrity (Confrontation)
*For any* entity in Confrontation mode, it SHALL be presented exactly once in sequence.
**Validates: Requirements 4.3, 4.4**

### Property 8: Bulk Action Availability (Swift Purge)
*For any* category in Swift Purge results, a bulk purge action SHALL be available.
**Validates: Requirements 3.4**

## Component Specifications

### Simulated Data Module
**File:** `src/renderer/data/simulatedFiles.ts`
**Purpose:** Provide fake file data for Guided Ritual mode
**Contents:**
- 3 Ghost files (old dates)
- 2 Zombie files (duplicates)
- 2 Demon files (large sizes)
- Zone/folder assignments
- Narrative flavor text

### Guided Ritual Flow (Updated)
**Changes Required:**
1. Remove real file scanning
2. Load simulated data on preview
3. Track purge state in memory only
4. Simulate graveyard (no real file moves)

### Swift Purge Flow (Updated)
**Changes Required:**
1. Add predefined location buttons
2. Add system folder blocking
3. Implement category grouping
4. Add bulk purge buttons per category
5. Remove individual file actions

### Confrontation Flow (Updated)
**Changes Required:**
1. Implement entity queue
2. Show single entity at a time
3. Add progress indicator (X of Y)
4. Add early exit with confirmation

## ESC Key Behavior Map

| Current State | ESC Action | Confirmation? |
|---------------|------------|---------------|
| HQ (Mode Select) | Return to Start | Yes |
| Guided Preview | Return to HQ | No |
| Guided Active | Return to Preview | Yes (if in progress) |
| Guided Summary | Return to HQ | No |
| Swift Location | Return to HQ | No |
| Swift Results | Return to Location | Yes (if selections made) |
| Swift Summary | Return to HQ | No |
| Confrontation Preview | Return to HQ | No |
| Confrontation Loop | Return to Preview | Yes (always) |
| Confrontation Summary | Return to HQ | No |

## Layout Constraints

### No-Scroll Rule Implementation
1. **Entity Lists:** Max 6 items visible, paginate if more
2. **Summary Stats:** Compact single-screen layout
3. **Buttons:** Fixed position at bottom
4. **Content:** Vertically centered with max-height constraints

### Responsive Scaling
- Min window: 1024x768
- Max content width: 1200px
- Font scaling: clamp() for responsive text
- Image scaling: object-fit: contain

## Testing Strategy

### Manual Testing Checklist
1. [ ] Start screen → HQ transition works
2. [ ] All three mode cards are visible and clickable
3. [ ] Guided Ritual uses NO real files
4. [ ] Swift Purge shows allowed locations only
5. [ ] Confrontation shows one entity at a time
6. [ ] ESC works correctly in all states
7. [ ] No scrollbars appear on any screen
8. [ ] Graveyard receives moved files (Modes 2/3)
9. [ ] Summary screens show accurate stats
10. [ ] Return to HQ works from all summaries

### Property-Based Tests
- Test simulated data isolation
- Test folder restriction enforcement
- Test queue integrity
- Test navigation completeness

## Error Handling

### File Operation Errors
- Show user-friendly message
- Offer retry or skip option
- Never leave app in broken state

### Missing Assets
- Use placeholder image
- Log: "PLACEHOLDER USED: [asset name]"
- Continue operation

### Invalid Folder Selection
- Block with clear message
- Suggest allowed alternatives
- Return to location selection

