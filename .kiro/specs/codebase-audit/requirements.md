# Requirements Document - Digital Exorcist Final Audit

## Introduction

This spec defines a comprehensive audit to finalize THE DIGITAL EXORCIST for Kiroween demonstration. The audit verifies that all three modes work completely from start to end with no missing logic or undefined behavior. The start screen is LOCKED and will not be modified.

## Glossary

- **Guided Ritual**: Demo mode using SIMULATED files only - safe, cinematic, no real file access
- **Swift Purge**: Real file mode - fast, bulk category-based purging
- **Confrontation**: Real file mode - intense, one-by-one entity decisions
- **Entity**: A classified file (Ghost=old, Zombie=duplicate, Demon=large)
- **Graveyard**: Safe storage for purged files (simulated in Mode 1, real in Modes 2/3)
- **HQ**: The mode selection screen (ExorcismStyleScreen)

## Requirements

### Requirement 1: Mode Structure Verification

**User Story:** As a Kiroween judge, I want exactly three distinct modes that each feel mechanically different, so that I understand the app in under 10 seconds.

#### Acceptance Criteria

1. WHEN the user passes the start screen THEN the System SHALL display exactly three mode options: Guided Ritual, Swift Purge, Confrontation
2. WHEN Guided Ritual is selected THEN the System SHALL use ONLY simulated/fake files with NO real file system access
3. WHEN Swift Purge is selected THEN the System SHALL access REAL files with bulk category-based purging
4. WHEN Confrontation is selected THEN the System SHALL access REAL files with one-by-one entity decisions
5. IF any mode is missing or broken THEN the System SHALL flag it as critical

### Requirement 2: Guided Ritual Mode (Demo) Verification

**User Story:** As a first-time user or jury member, I want a safe demo experience with simulated files, so that I can understand the app without risk.

#### Acceptance Criteria

1. WHEN Guided Ritual starts THEN the System SHALL NOT prompt for folder selection
2. WHEN Guided Ritual runs THEN the System SHALL use pre-defined simulated file data (JSON or in-memory)
3. WHEN simulated files are displayed THEN the System SHALL include: filename, extension, size, lastModified, type, entityType
4. WHEN a curated encounter loads THEN the System SHALL present a LIMITED set (e.g., 3 ghosts, 2 zombies, 2 demons)
5. WHEN the user interacts with an entity THEN the System SHALL offer: Inspect, Purge, Spare
6. WHEN a file is purged in Guided Ritual THEN the System SHALL mark it in memory ONLY with NO real file operations
7. WHEN Guided Ritual completes THEN the System SHALL show a summary and return to HQ option

### Requirement 3: Swift Purge Mode Verification

**User Story:** As a power user, I want fast bulk file cleanup, so that I can efficiently manage my storage.

#### Acceptance Criteria

1. WHEN Swift Purge starts THEN the System SHALL display allowed locations: Downloads, Desktop, Documents, Pictures, Custom
2. WHEN a location is selected THEN the System SHALL scan REAL files and classify them
3. WHEN scan completes THEN the System SHALL group files by category: Ghosts, Zombies, Demons
4. WHEN categories are displayed THEN the System SHALL allow bulk actions: Purge All Ghosts, Purge All Zombies, Purge All Demons, Skip
5. WHEN files are purged THEN the System SHALL MOVE them to graveyard (NEVER delete)
6. WHEN purge completes THEN the System SHALL display space saved and summary
7. IF system folders are selected THEN the System SHALL block access and show warning

### Requirement 4: Confrontation Mode Verification

**User Story:** As a gamer, I want an intense one-by-one file confrontation, so that I feel the tension of each decision.

#### Acceptance Criteria

1. WHEN Confrontation starts THEN the System SHALL use same folder rules as Swift Purge
2. WHEN scan completes THEN the System SHALL build a QUEUE of entities
3. WHEN entities are presented THEN the System SHALL show ONE entity at a time
4. WHEN viewing an entity THEN the System SHALL offer: Inspect, Purge, Spare (NO bulk actions)
5. WHEN the user makes a decision THEN the System SHALL advance to next entity
6. WHEN the user wants to exit early THEN the System SHALL show confirmation dialog
7. WHEN all entities are processed THEN the System SHALL show summary and return to HQ option

### Requirement 5: Graveyard System Verification

**User Story:** As a user, I want purged files to be safely recoverable, so that I never lose data permanently.

#### Acceptance Criteria

1. WHEN a real file is purged THEN the System SHALL MOVE it to graveyard folder structure
2. WHEN a file is moved THEN the System SHALL log: original path, new path, mode, timestamp
3. WHEN viewing graveyard THEN the System SHALL display all purged files with restore option
4. WHEN undo is requested THEN the System SHALL restore file to original location
5. WHEN Guided Ritual purges THEN the System SHALL simulate graveyard ONLY (no real file operations)

### Requirement 6: Navigation and Input Verification

**User Story:** As a user, I want consistent navigation with no dead ends, so that I can always go back or exit safely.

#### Acceptance Criteria

1. WHEN ESC is pressed THEN the System SHALL go back ONE logical step
2. WHEN ESC is pressed during purge/combat THEN the System SHALL show confirmation dialog
3. WHEN ESC is pressed on mode selection THEN the System SHALL confirm exit to start screen
4. WHEN any screen is displayed THEN the System SHALL have a visible back button or ESC hint
5. IF a dead-end state exists THEN the System SHALL flag it as critical

### Requirement 7: Layout and Frame Verification

**User Story:** As a user, I want a polished fixed-frame UI, so that the app feels premium and complete.

#### Acceptance Criteria

1. WHEN any screen is displayed THEN the System SHALL fit entirely within the window with NO scrollbars
2. WHEN content exceeds space THEN the System SHALL split into steps or paginate
3. WHEN the window is resized THEN the System SHALL scale responsively
4. IF overflow scrolling exists THEN the System SHALL flag it as critical

### Requirement 8: Character and Asset Verification

**User Story:** As a user, I want each mode to have a distinct character/visual identity, so that modes feel unique.

#### Acceptance Criteria

1. WHEN mode selection is displayed THEN the System SHALL show three distinct character images
2. WHEN a character image is missing THEN the System SHALL use a placeholder and report it
3. WHEN hover animation exists THEN the System SHALL start and end on the static pose
4. IF any asset is missing THEN the System SHALL clearly report: PLACEHOLDER USED

### Requirement 9: File Entity Model Verification

**User Story:** As a developer, I want a consistent file entity model, so that all modes handle files uniformly.

#### Acceptance Criteria

1. WHEN a file entity is created THEN the System SHALL include: id, path, filename, extension, size, lastModified, type, entityType
2. WHEN entityType is assigned THEN the System SHALL use: Ghost (old), Zombie (duplicate), Demon (large)
3. WHEN simulated files are used THEN the System SHALL follow the same model structure

### Requirement 10: Kiroween Jury Readiness

**User Story:** As a Kiroween judge, I want the app to feel complete and professional, so that it makes a strong impression.

#### Acceptance Criteria

1. WHEN the app is launched THEN the System SHALL be understandable in under 10 seconds
2. WHEN each mode is played THEN the System SHALL feel mechanically distinct
3. WHEN real files are handled THEN the System SHALL feel safe and trustworthy
4. WHEN the experience ends THEN the System SHALL feel complete with no loose ends
5. IF anything feels gimmicky or unfinished THEN the System SHALL flag it for removal or simplification

