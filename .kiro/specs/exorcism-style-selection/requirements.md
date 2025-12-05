# Requirements Document

## Introduction

This document specifies the requirements for the Exorcism Style Selection feature in The Digital Exorcist application. This feature introduces a new screen flow that appears after the existing Title Screen, allowing users to choose between three distinct exorcism experiences: Guided Ritual (cinematic guided encounter), Swift Purge (fast practical cleanup), and Confrontation (one-by-one entity decisions). Each style provides a complete flow with preview, active, and summary screens while maintaining the existing cyber-horror visual language with toxic green, neon purple, CRT scanlines, and mist/fog effects.

## Glossary

- **Exorcism Style**: One of three user-selectable approaches to file cleanup (Guided Ritual, Swift Purge, Confrontation)
- **Entity**: A classified file represented as a supernatural creature (Ghost, Zombie, or Demon)
- **Ghost**: An old/stale file that hasn't been accessed in a long time
- **Zombie**: A duplicate file that exists in multiple locations
- **Demon**: A large file consuming significant disk space
- **Purge**: The action of moving a file to the graveyard folder (non-destructive deletion)
- **Spare/Keep**: The action of leaving a file unchanged
- **Graveyard**: The safe storage location where purged files are moved (./graveyard_trash)
- **HQ**: The Exorcism Style Selection screen (headquarters/home base)
- **Infested Zone**: A narrative representation of a scanned directory containing entities
- **CRT Overlay**: Visual effect simulating old cathode ray tube monitor scanlines
- **Mist/Fog Layer**: Animated atmospheric background effect using purple and green gradients

## Requirements

### Requirement 1: Exorcism Style Selection Screen

**User Story:** As a user, I want to choose my preferred exorcism style after the title screen, so that I can experience file cleanup in a way that matches my preference for guidance, speed, or control.

#### Acceptance Criteria

1. WHEN the user clicks "BEGIN EXORCISM" or presses ENTER on the Title Screen THEN the System SHALL display the Exorcism Style Selection screen
2. WHEN the Exorcism Style Selection screen loads THEN the System SHALL display three selectable style cards: "Guided Ritual", "Swift Purge", and "Confrontation"
3. WHEN the user hovers over a style card THEN the System SHALL display a visual hover state with green/purple accent changes
4. WHEN the user clicks a style card THEN the System SHALL display a selected state and navigate to the corresponding flow
5. WHEN displaying the Exorcism Style Selection screen THEN the System SHALL maintain the existing cyber-horror visual language including CRT overlay, mist/fog layers, and green/purple color palette

### Requirement 2: Guided Ritual Flow - Preview Screen

**User Story:** As a user who selects Guided Ritual, I want to see a narrative preview of the infested zone, so that I can understand what entities await without seeing technical file paths.

#### Acceptance Criteria

1. WHEN the user selects "Guided Ritual" THEN the System SHALL display the Guided Encounter Preview screen
2. WHEN displaying the preview THEN the System SHALL show an "Infested Zone" card with narrative lore text instead of file paths
3. WHEN displaying the preview THEN the System SHALL show entity counts for Ghosts, Zombies, Demons, and Unknown Risk status
4. WHEN the user clicks "ENTER INFESTED ZONE" THEN the System SHALL transition to the Guided Encounter Active screen
5. WHEN the user clicks "VIEW SAFETY INFO" THEN the System SHALL display a panel explaining safe purge and undo functionality

### Requirement 3: Guided Ritual Flow - Active Screen

**User Story:** As a user in a Guided Ritual encounter, I want to see entities as cards and decide to purge or spare each one, so that I can make informed decisions about my files.

#### Acceptance Criteria

1. WHEN the Guided Encounter Active screen loads THEN the System SHALL display entities as cards in a grid or list layout
2. WHEN displaying an entity card THEN the System SHALL show the entity type icon, a flavor line, and an "INSPECT" action
3. WHEN the user clicks "INSPECT" on an entity THEN the System SHALL reveal the real filename, size, age, and graveyard destination
4. WHEN the user clicks "PURGE" on an entity THEN the System SHALL move the file to the graveyard folder
5. WHEN the user clicks "SPARE" or "KEEP" on an entity THEN the System SHALL leave the file unchanged
6. WHEN displaying the active screen THEN the System SHALL show a visible "Safe Purge / Undo available" indicator
7. WHEN the user clicks "EXIT ENCOUNTER" THEN the System SHALL return to the Exorcism Style Selection screen without modifying remaining files

### Requirement 4: Guided Ritual Flow - Summary Screen

**User Story:** As a user who completed a Guided Ritual, I want to see a summary of my actions, so that I can understand what was purged and what was spared.

#### Acceptance Criteria

1. WHEN all entities have been processed or the encounter ends THEN the System SHALL display the Guided Encounter Summary screen
2. WHEN displaying the summary THEN the System SHALL show counts of ghosts, zombies, and demons purged and spared
3. WHEN displaying the summary THEN the System SHALL show approximate space recovered
4. WHEN the user clicks "RETURN TO HQ" THEN the System SHALL navigate back to the Exorcism Style Selection screen
5. WHEN the user clicks "OPEN GRAVEYARD" THEN the System SHALL display the graveyard location where files were moved

### Requirement 5: Swift Purge Flow - Location Screen

**User Story:** As a user who selects Swift Purge, I want to quickly choose a location to clean, so that I can perform fast file cleanup without extensive navigation.

#### Acceptance Criteria

1. WHEN the user selects "Swift Purge" THEN the System SHALL display the Swift Purge Location screen
2. WHEN displaying the location screen THEN the System SHALL show predefined quick target buttons for Downloads, Desktop, and Temp/Cache
3. WHEN displaying the location screen THEN the System SHALL show a "Custom Folder" option for manual selection
4. WHEN the user selects a location THEN the System SHALL scan the location and transition to the Swift Purge Results screen

### Requirement 6: Swift Purge Flow - Results Screen

**User Story:** As a user viewing Swift Purge results, I want to see a breakdown by entity type and select what to purge, so that I can make bulk cleanup decisions efficiently.

#### Acceptance Criteria

1. WHEN the Swift Purge Results screen loads THEN the System SHALL display entity counts grouped by type (Ghosts, Zombies, Demons)
2. WHEN displaying results THEN the System SHALL provide bulk selection options: "Purge all ghosts", "Purge all zombies", "Purge all demons"
3. WHEN displaying results THEN the System SHALL show an estimate of space to be recovered
4. WHEN the user clicks "EXECUTE SWIFT PURGE" THEN the System SHALL move all selected files to the graveyard
5. WHEN the user clicks "CANCEL" THEN the System SHALL return to the Exorcism Style Selection screen without modifying files

### Requirement 7: Swift Purge Flow - Summary Screen

**User Story:** As a user who completed a Swift Purge, I want to see confirmation of what was cleaned, so that I can verify the operation completed successfully.

#### Acceptance Criteria

1. WHEN the swift purge operation completes THEN the System SHALL display the Swift Purge Summary screen
2. WHEN displaying the summary THEN the System SHALL show space recovered and number of files moved to graveyard
3. WHEN the user clicks "RETURN TO HQ" THEN the System SHALL navigate back to the Exorcism Style Selection screen
4. WHEN the user clicks "VIEW GRAVEYARD" THEN the System SHALL display the graveyard view

### Requirement 8: Confrontation Flow - Preview Screen

**User Story:** As a user who selects Confrontation, I want to see a dramatic preview before facing entities one by one, so that I understand the intense nature of this mode.

#### Acceptance Criteria

1. WHEN the user selects "Confrontation" THEN the System SHALL display the Confrontation Preview screen with intense narrative tone
2. WHEN displaying the preview THEN the System SHALL show entity counts for Ghosts, Zombies, Demons, and Unknown
3. WHEN the user clicks "BEGIN CONFRONTATION" THEN the System SHALL transition to the Confrontation Loop screen
4. WHEN the user clicks "VIEW SAFETY INFO" THEN the System SHALL display a panel explaining safe purge and undo functionality

### Requirement 9: Confrontation Flow - Loop Screen

**User Story:** As a user in Confrontation mode, I want to face each entity one at a time and decide its fate, so that I have maximum control over each file decision.

#### Acceptance Criteria

1. WHEN the Confrontation Loop screen loads THEN the System SHALL display one entity at a time in a central card
2. WHEN displaying an entity THEN the System SHALL show the entity type and a "Reveal bound file" action
3. WHEN the user reveals the file THEN the System SHALL show the real filename, size, age, and location
4. WHEN the user clicks "PURGE THIS ENTITY" THEN the System SHALL move the file to graveyard and show the next entity
5. WHEN the user clicks "SPARE THIS ENTITY" THEN the System SHALL keep the file and show the next entity
6. WHEN displaying the loop screen THEN the System SHALL show a sidebar/HUD with remaining entity counts and potential space recovery
7. WHEN the user clicks "EXIT CONFRONTATION" THEN the System SHALL end the loop and show the summary screen

### Requirement 10: Confrontation Flow - Summary Screen

**User Story:** As a user who completed a Confrontation, I want to see a dramatic summary of my decisions, so that I feel the weight of my choices.

#### Acceptance Criteria

1. WHEN all entities have been confronted or the user exits THEN the System SHALL display the Confrontation Summary screen
2. WHEN displaying the summary THEN the System SHALL show counts of entities purged and spared with dramatic language
3. WHEN displaying the summary THEN the System SHALL show space recovered
4. WHEN the user clicks "RETURN TO HQ" THEN the System SHALL navigate back to the Exorcism Style Selection screen
5. WHEN the user clicks "VIEW GRAVEYARD" THEN the System SHALL display the graveyard view

### Requirement 11: Visual Consistency

**User Story:** As a user, I want all new screens to match the existing cyber-horror aesthetic, so that the application feels cohesive and immersive.

#### Acceptance Criteria

1. WHEN displaying any new screen THEN the System SHALL use the same background gradient and fog texture as the Title Screen
2. WHEN displaying any new screen THEN the System SHALL apply the CRT overlay effect
3. WHEN displaying any new screen THEN the System SHALL use the mist/fog layer animations with purple and green gradients
4. WHEN displaying any new screen THEN the System SHALL use green (#22c55e) and purple (#a855f7) as primary accent colors
5. WHEN displaying text THEN the System SHALL use the existing font families (Dark Horse for titles, monospace for UI text)

### Requirement 12: State Management and Navigation

**User Story:** As a user, I want smooth transitions between all screens, so that the application flow feels polished and responsive.

#### Acceptance Criteria

1. WHEN transitioning between screens THEN the System SHALL use animated transitions consistent with existing app behavior
2. WHEN the user presses ESC on any flow screen THEN the System SHALL return to the previous screen or Exorcism Style Selection
3. WHEN navigating from any summary screen to HQ THEN the System SHALL reset the flow state for the next session
4. WHEN the application state changes THEN the System SHALL update the Zustand store with the new state
