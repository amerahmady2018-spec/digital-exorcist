# Requirements Document

## Introduction

The Premium Exorcist Transformation elevates The Digital Exorcist from a functional file management tool into a premium, AAA-game-quality desktop experience. This transformation introduces a frameless window with glassmorphism effects, a cinematic state-driven user flow, AI-powered file intelligence using Google Gemini, a full-screen turn-based battle system with rich visual feedback, and comprehensive keyboard controls. The goal is to create an immersive, visually explosive experience that feels like a high-end game while maintaining the core file management functionality, all without relying on audio feedback.

## Glossary

- **Premium Exorcist**: The enhanced version of The Digital Exorcist with AAA-game aesthetics
- **Frameless Window**: An Electron window without the default OS title bar and frame
- **Glassmorphism**: A design style using transparency and backdrop blur effects
- **Custom Titlebar**: A React-based window control bar with drag region and traffic light buttons
- **State Machine**: A controlled flow system managing application states (INTRO, MISSION_SELECT, HUD, BATTLE_ARENA)
- **Title Screen**: The initial animated intro screen with glitch effects
- **Mission Select**: The directory selection interface styled as a tactical targeting map
- **HUD**: The main dashboard displaying entity cards with 3D monster visuals
- **Battle Arena**: A full-screen 1v1 combat interface for file operations
- **Entity Card**: A vertical card displaying a classified file with monster visualization
- **AI Intel**: Google Gemini-powered analysis providing tactical information about files
- **Combat Actions**: Turn-based actions (DATA SMASH, PURGE RITUAL, FLEE) for file operations
- **Screen Shake**: CSS-based visual feedback simulating impact without audio
- **Damage Numbers**: Animated floating text showing file size changes
- **Particle Effects**: Visual dissolution effects using Framer Motion
- **Keyboard Bindings**: Hotkey controls for all major actions
- **Undo Spell**: A time-limited restoration feature for recently deleted files
- **Spirit Guide**: An MCP server providing chat-based statistics and insights

## Requirements

### Requirement 1

**User Story:** As a user, I want a frameless window with glassmorphism effects, so that the application feels premium and integrated with my desktop environment.

#### Acceptance Criteria

1. WHEN the Premium Exorcist launches THEN the Premium Exorcist SHALL create a frameless Electron window with transparency enabled
2. WHEN the window is displayed THEN the Premium Exorcist SHALL apply backdrop blur effects to create glassmorphism appearance
3. WHEN the user's desktop wallpaper is visible THEN the Premium Exorcist SHALL allow it to bleed through faintly behind the interface
4. WHEN the window is rendered THEN the Premium Exorcist SHALL maintain sharp text readability despite transparency effects
5. WHEN the application runs on different operating systems THEN the Premium Exorcist SHALL adapt the glassmorphism implementation to platform capabilities

### Requirement 2

**User Story:** As a user, I want a custom titlebar with window controls, so that I can manage the frameless window without OS chrome.

#### Acceptance Criteria

1. WHEN the frameless window is displayed THEN the Premium Exorcist SHALL render a custom titlebar component at the top
2. WHEN the custom titlebar is rendered THEN the Premium Exorcist SHALL include traffic light buttons (Close, Minimize, Maximize)
3. WHEN a user clicks the Close button THEN the Premium Exorcist SHALL close the application window
4. WHEN a user clicks the Minimize button THEN the Premium Exorcist SHALL minimize the application window
5. WHEN a user clicks the Maximize button THEN the Premium Exorcist SHALL toggle between maximized and restored window states
6. WHEN a user drags the titlebar THEN the Premium Exorcist SHALL move the window following the cursor
7. WHEN the titlebar is styled THEN the Premium Exorcist SHALL blend it seamlessly into the HUD aesthetic

### Requirement 3

**User Story:** As a user, I want a cinematic title screen with animated logo, so that the application launch feels like starting a premium game.

#### Acceptance Criteria

1. WHEN the Premium Exorcist launches THEN the Premium Exorcist SHALL display the title screen as the initial state
2. WHEN the title screen is displayed THEN the Premium Exorcist SHALL show an animated glitch effect on the "DIGITAL EXORCIST" logo
3. WHEN the title screen is displayed THEN the Premium Exorcist SHALL show an "INITIALIZE SYSTEM" button
4. WHEN a user clicks "INITIALIZE SYSTEM" THEN the Premium Exorcist SHALL transition to the Mission Select state
5. WHEN the title screen animates THEN the Premium Exorcist SHALL use Framer Motion for smooth, cinematic transitions

### Requirement 4

**User Story:** As a user, I want a mission select interface styled as a targeting map, so that directory selection feels like choosing a tactical objective.

#### Acceptance Criteria

1. WHEN the Mission Select state is active THEN the Premium Exorcist SHALL display a high-tech targeting map interface
2. WHEN the targeting map is displayed THEN the Premium Exorcist SHALL show a directory selection control styled as a tactical objective picker
3. WHEN a user selects a directory THEN the Premium Exorcist SHALL trigger a radar sweep animation
4. WHEN the scan begins THEN the Premium Exorcist SHALL display scanning progress with tactical HUD elements
5. WHEN scanning completes THEN the Premium Exorcist SHALL transition to the HUD state

### Requirement 5

**User Story:** As a user, I want the HUD to display vertical entity cards with 3D monster visuals, so that files feel like tangible threats with visual presence.

#### Acceptance Criteria

1. WHEN the HUD state is active THEN the Premium Exorcist SHALL display classified files as vertical entity cards
2. WHEN an entity card is rendered THEN the Premium Exorcist SHALL show a large 3D monster image that breaks the card frame boundaries
3. WHEN an entity card is rendered THEN the Premium Exorcist SHALL display a glowing health bar representing file size
4. WHEN an entity card is rendered THEN the Premium Exorcist SHALL show file metadata styled as tactical information
5. WHEN multiple entity cards are displayed THEN the Premium Exorcist SHALL arrange them in a scrollable vertical layout

### Requirement 6

**User Story:** As a user, I want to click an entity card to enter a full-screen battle arena, so that file operations feel like engaging in combat.

#### Acceptance Criteria

1. WHEN a user clicks an entity card THEN the Premium Exorcist SHALL transition to the Battle Arena state
2. WHEN transitioning to Battle Arena THEN the Premium Exorcist SHALL use a zoom animation effect
3. WHEN the Battle Arena is displayed THEN the Premium Exorcist SHALL show a full-screen 1v1 combat interface
4. WHEN the Battle Arena is displayed THEN the Premium Exorcist SHALL show the monster prominently with combat UI elements
5. WHEN the Battle Arena is displayed THEN the Premium Exorcist SHALL display available combat actions

### Requirement 7

**User Story:** As a user, I want AI-powered file intelligence using Google Gemini, so that I receive tactical analysis of files before taking action.

#### Acceptance Criteria

1. WHEN the Battle Arena mounts THEN the Premium Exorcist SHALL automatically call the file inspection IPC handler
2. WHEN the file inspection is triggered THEN the Premium Exorcist SHALL send the file metadata to Google Gemini API
3. WHEN waiting for AI analysis THEN the Premium Exorcist SHALL display a "DECIPHERING SOUL SIGNATURE..." hacking animation
4. WHEN the AI analysis returns THEN the Premium Exorcist SHALL display the tactical analysis using a typewriter effect
5. WHEN the AI analysis fails THEN the Premium Exorcist SHALL display a fallback message and allow combat to proceed

### Requirement 8

**User Story:** As a user, I want turn-based combat actions for file operations, so that managing files feels like strategic gameplay.

#### Acceptance Criteria

1. WHEN the Battle Arena is active THEN the Premium Exorcist SHALL display combat action buttons (DATA SMASH, PURGE RITUAL, FLEE)
2. WHEN a user selects DATA SMASH THEN the Premium Exorcist SHALL execute the banish file operation
3. WHEN a user selects PURGE RITUAL THEN the Premium Exorcist SHALL execute the banish file operation with enhanced visual effects
4. WHEN a user selects FLEE THEN the Premium Exorcist SHALL return to the HUD state without performing file operations
5. WHEN a combat action is selected THEN the Premium Exorcist SHALL disable action buttons until the action completes

### Requirement 9

**User Story:** As a user, I want heavy screen shake on damage, so that combat actions feel impactful without audio.

#### Acceptance Criteria

1. WHEN a combat action deals damage THEN the Premium Exorcist SHALL apply CSS transform offsets to create screen shake effect
2. WHEN screen shake is triggered THEN the Premium Exorcist SHALL use randomized directional offsets for realistic motion
3. WHEN screen shake completes THEN the Premium Exorcist SHALL smoothly return the screen to its original position
4. WHEN screen shake intensity is calculated THEN the Premium Exorcist SHALL scale it based on the damage amount
5. WHEN multiple screen shakes occur rapidly THEN the Premium Exorcist SHALL queue them to prevent jarring overlaps

### Requirement 10

**User Story:** As a user, I want floating damage numbers showing file size changes, so that I receive clear visual feedback on combat actions.

#### Acceptance Criteria

1. WHEN a combat action deals damage THEN the Premium Exorcist SHALL spawn floating damage number text
2. WHEN damage numbers are displayed THEN the Premium Exorcist SHALL show the file size reduction in gold text (e.g., "-50 MB")
3. WHEN damage numbers animate THEN the Premium Exorcist SHALL move them upward with a fade-out effect
4. WHEN damage numbers complete their animation THEN the Premium Exorcist SHALL remove them from the DOM
5. WHEN multiple damage instances occur THEN the Premium Exorcist SHALL stagger the damage number animations

### Requirement 11

**User Story:** As a user, I want monsters to dissolve into particles on victory, so that successful file operations feel satisfying and complete.

#### Acceptance Criteria

1. WHEN a file is successfully banished THEN the Premium Exorcist SHALL trigger a particle dissolution effect on the monster
2. WHEN the dissolution effect plays THEN the Premium Exorcist SHALL use Framer Motion layoutId transitions for smooth animation
3. WHEN the dissolution completes THEN the Premium Exorcist SHALL return to the HUD state
4. WHEN returning to the HUD THEN the Premium Exorcist SHALL remove the banished file from the entity card list
5. WHEN the dissolution effect plays THEN the Premium Exorcist SHALL use digital particle aesthetics consistent with the theme

### Requirement 12

**User Story:** As a user, I want comprehensive keyboard controls, so that I can navigate and act efficiently without relying on mouse input.

#### Acceptance Criteria

1. WHEN the Battle Arena is active and a user presses SPACE THEN the Premium Exorcist SHALL trigger the primary attack action
2. WHEN any confirmation dialog is displayed and a user presses ENTER THEN the Premium Exorcist SHALL confirm the action
3. WHEN any screen is active and a user presses ESC THEN the Premium Exorcist SHALL trigger the flee or cancel action
4. WHEN action buttons are displayed THEN the Premium Exorcist SHALL show keyboard hint labels (e.g., "[SPACE] SMASH")
5. WHEN keyboard shortcuts are active THEN the Premium Exorcist SHALL prevent default browser behaviors that conflict with game controls

### Requirement 13

**User Story:** As a user, I want an undo spell toast after deletion, so that I can quickly restore files if I make a mistake.

#### Acceptance Criteria

1. WHEN a file is banished THEN the Premium Exorcist SHALL display a prominent "UNDO SPELL" toast notification
2. WHEN the undo toast is displayed THEN the Premium Exorcist SHALL show it for 5 seconds before auto-dismissing
3. WHEN a user clicks the "UNDO SPELL" button THEN the Premium Exorcist SHALL restore the file to its original location
4. WHEN the undo action completes THEN the Premium Exorcist SHALL dismiss the toast and update the HUD
5. WHEN the toast auto-dismisses THEN the Premium Exorcist SHALL fade it out smoothly

### Requirement 14

**User Story:** As a user, I want a state machine managing application flow, so that transitions between screens are predictable and smooth.

#### Acceptance Criteria

1. WHEN the Premium Exorcist initializes THEN the Premium Exorcist SHALL set the initial state to INTRO
2. WHEN state transitions occur THEN the Premium Exorcist SHALL follow the defined flow: INTRO → MISSION_SELECT → HUD → BATTLE_ARENA
3. WHEN in BATTLE_ARENA state THEN the Premium Exorcist SHALL allow transition back to HUD state
4. WHEN in HUD state THEN the Premium Exorcist SHALL allow transition to BATTLE_ARENA state for any entity card
5. WHEN state changes occur THEN the Premium Exorcist SHALL trigger appropriate transition animations

### Requirement 15

**User Story:** As a developer, I want to integrate Google Generative AI, so that the application can provide intelligent file analysis.

#### Acceptance Criteria

1. WHEN the Premium Exorcist initializes THEN the Premium Exorcist SHALL load the @google/generative-ai package
2. WHEN file inspection is requested THEN the Premium Exorcist SHALL construct a prompt with file metadata
3. WHEN calling the Gemini API THEN the Premium Exorcist SHALL use the configured API key from environment variables
4. WHEN the API returns a response THEN the Premium Exorcist SHALL parse and format the analysis text
5. WHEN API rate limits are hit THEN the Premium Exorcist SHALL handle errors gracefully and provide fallback content

### Requirement 16

**User Story:** As a developer, I want to build a local MCP server called "Spirit Guide", so that users can query file statistics through chat.

#### Acceptance Criteria

1. WHEN the Spirit Guide MCP server is installed THEN the Premium Exorcist SHALL register it in the MCP configuration
2. WHEN a user queries the Spirit Guide THEN the Spirit Guide SHALL provide statistics about scanned files
3. WHEN the Spirit Guide responds THEN the Spirit Guide SHALL format data in a conversational, thematic manner
4. WHEN the Spirit Guide is queried for file counts THEN the Spirit Guide SHALL return accurate counts by classification type
5. WHEN the Spirit Guide is queried for size totals THEN the Spirit Guide SHALL return accurate size aggregations

### Requirement 17

**User Story:** As a developer, I want agent hooks for linting on save, so that code quality is maintained automatically during development.

#### Acceptance Criteria

1. WHEN a developer saves a code file THEN the Premium Exorcist development environment SHALL trigger the lint agent hook
2. WHEN the lint hook runs THEN the Premium Exorcist development environment SHALL execute ESLint on the saved file
3. WHEN linting errors are found THEN the Premium Exorcist development environment SHALL display them in the problems panel
4. WHEN linting succeeds THEN the Premium Exorcist development environment SHALL clear previous errors for that file
5. WHEN the lint hook is configured THEN the Premium Exorcist development environment SHALL use the project's ESLint configuration

### Requirement 18

**User Story:** As a developer, I want all animated components to use forwardRef, so that animations can be properly controlled and composed.

#### Acceptance Criteria

1. WHEN creating animated components THEN the Premium Exorcist SHALL wrap them with React.forwardRef
2. WHEN animated components receive refs THEN the Premium Exorcist SHALL forward them to the underlying DOM elements
3. WHEN Framer Motion components are used THEN the Premium Exorcist SHALL ensure ref forwarding is compatible
4. WHEN components are composed THEN the Premium Exorcist SHALL allow parent components to control child animations via refs
5. WHEN TypeScript is used THEN the Premium Exorcist SHALL properly type forwardRef components with correct prop and ref types

### Requirement 19

**User Story:** As a user, I want all visual feedback to be juicy and satisfying, so that the lack of audio is not noticeable.

#### Acceptance Criteria

1. WHEN any user action occurs THEN the Premium Exorcist SHALL provide immediate visual feedback
2. WHEN visual effects are applied THEN the Premium Exorcist SHALL use multiple layered effects (shake, particles, lighting, color shifts)
3. WHEN animations play THEN the Premium Exorcist SHALL use easing functions that feel snappy and responsive
4. WHEN transitions occur THEN the Premium Exorcist SHALL maintain 60fps performance for smooth motion
5. WHEN effects are combined THEN the Premium Exorcist SHALL synchronize timing for cohesive visual impact

### Requirement 20

**User Story:** As a user, I want the application to feel like a premium desktop utility, so that it stands out from typical web-based tools.

#### Acceptance Criteria

1. WHEN the Premium Exorcist is running THEN the Premium Exorcist SHALL feel native to the operating system through frameless design
2. WHEN UI elements are rendered THEN the Premium Exorcist SHALL use high-quality graphics and smooth animations
3. WHEN the user interacts with the application THEN the Premium Exorcist SHALL respond instantly without perceptible lag
4. WHEN the application is compared to web tools THEN the Premium Exorcist SHALL demonstrate superior visual polish and performance
5. WHEN the glassmorphism effect is active THEN the Premium Exorcist SHALL create a sense of depth and integration with the desktop
