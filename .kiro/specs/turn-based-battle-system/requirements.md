# Requirements Document

## Introduction

The Turn-Based Battle System transforms The Digital Exorcist from a simple file management application into an interactive RPG combat experience. When users encounter monster files (duplicates, large files, old files), instead of immediately deleting them, they enter a full-screen battle arena where they must defeat the monster through turn-based combat. Victory results in file deletion (banishment), while defeat returns the user to the dashboard with the file intact. This feature adds engaging gameplay mechanics while maintaining the core file management functionality.

## Glossary

- **Battle Arena**: A full-screen overlay component where turn-based combat occurs
- **Player**: The user's avatar in combat, represented by a hero icon (🧙‍♂️)
- **Monster**: The file being targeted for deletion, visualized with its existing 3D PNG image
- **HP (Hit Points)**: Health value for both player and monster; when reduced to 0, the entity is defeated
- **Monster HP**: Calculated from file size (e.g., 10MB = 100 HP)
- **Player HP**: Fixed starting value (100 HP)
- **Combat Menu**: The action selection interface with 4 available moves
- **Turn**: A single round of combat where the player selects an action and the monster responds
- **State Machine**: The combat flow controller managing turn phases
- **Rot Damage**: Passive damage dealt to the player each turn when fighting Ghost-type monsters (old files)
- **Mana**: Resource consumed by powerful attacks like PURGE RITUAL
- **Battle Mode**: Application state when the Battle Arena is active

## Requirements

### Requirement 1

**User Story:** As a user, I want to enter a battle arena when I click on a monster card, so that I can engage in combat instead of immediately deleting the file.

#### Acceptance Criteria

1. WHEN a user clicks on a Monster Card THEN the system SHALL open a full-screen Battle Arena overlay
2. WHEN the Battle Arena opens THEN the system SHALL NOT immediately delete the file
3. WHEN the Battle Arena opens THEN the system SHALL initialize combat with the selected monster
4. WHEN the Battle Arena is active THEN the system SHALL prevent interaction with the dashboard behind it
5. WHEN the Battle Arena closes THEN the system SHALL return the user to the dashboard view

### Requirement 2

**User Story:** As a user, I want to see a Pokemon-style battle interface, so that I have a clear and familiar combat experience.

#### Acceptance Criteria

1. WHEN the Battle Arena displays THEN the system SHALL show the player avatar (🧙‍♂️) in the bottom-left position
2. WHEN the Battle Arena displays THEN the system SHALL show the monster image (3D PNG) in the top-right position
3. WHEN the Battle Arena displays THEN the system SHALL show the player HP bar with current and maximum values
4. WHEN the Battle Arena displays THEN the system SHALL show the monster HP bar with current and maximum values
5. WHEN the Battle Arena displays THEN the system SHALL show the combat menu at the bottom of the screen

### Requirement 3

**User Story:** As a user, I want monster HP to be based on file size, so that larger files present greater challenges.

#### Acceptance Criteria

1. WHEN a monster is initialized THEN the system SHALL calculate monster HP from file size using the formula: file size in MB × 10 = HP
2. WHEN a file is 10MB THEN the system SHALL set monster HP to 100
3. WHEN a file is 50MB THEN the system SHALL set monster HP to 500
4. WHEN monster HP is calculated THEN the system SHALL display the value in the monster HP bar
5. WHEN monster HP changes during combat THEN the system SHALL update the HP bar visual representation proportionally

### Requirement 4

**User Story:** As a user, I want a fixed player HP of 100, so that I have consistent health across all battles.

#### Acceptance Criteria

1. WHEN a battle begins THEN the system SHALL initialize player HP to 100
2. WHEN player HP is initialized THEN the system SHALL display the value in the player HP bar
3. WHEN player HP changes during combat THEN the system SHALL update the HP bar visual representation proportionally
4. WHEN player HP reaches 0 THEN the system SHALL trigger the defeat condition
5. WHEN a new battle begins THEN the system SHALL reset player HP to 100

### Requirement 5

**User Story:** As a user, I want Ghost-type monsters to deal rot damage each turn, so that old files present unique combat challenges.

#### Acceptance Criteria

1. WHEN a monster is classified as Ghost type (old file) THEN the system SHALL apply rot damage to the player each turn
2. WHEN rot damage is applied THEN the system SHALL reduce player HP by a fixed amount (10 HP per turn)
3. WHEN rot damage is applied THEN the system SHALL display a visual indicator showing the damage
4. WHEN a monster is not Ghost type THEN the system SHALL NOT apply rot damage
5. WHEN rot damage reduces player HP to 0 THEN the system SHALL trigger the defeat condition

### Requirement 6

**User Story:** As a user, I want to choose from 4 combat moves, so that I have strategic options during battle.

#### Acceptance Criteria

1. WHEN the combat menu displays THEN the system SHALL show 4 action buttons: DATA SMASH, PURGE RITUAL, FIREWALL, and FLEE
2. WHEN a user clicks DATA SMASH THEN the system SHALL execute a basic attack dealing 20 damage to the monster
3. WHEN a user clicks PURGE RITUAL THEN the system SHALL execute a heavy attack dealing 50 damage to the monster if sufficient mana is available
4. WHEN a user clicks FIREWALL THEN the system SHALL block the next incoming attack from the monster
5. WHEN a user clicks FLEE THEN the system SHALL cancel the battle and return to the dashboard without deleting the file

### Requirement 7

**User Story:** As a user, I want PURGE RITUAL to consume mana, so that powerful attacks have a resource cost.

#### Acceptance Criteria

1. WHEN a battle begins THEN the system SHALL initialize player mana to a fixed amount (100 mana)
2. WHEN a user clicks PURGE RITUAL THEN the system SHALL check if player has sufficient mana (30 mana required)
3. WHEN player has sufficient mana THEN the system SHALL execute PURGE RITUAL and reduce mana by 30
4. WHEN player has insufficient mana THEN the system SHALL prevent PURGE RITUAL execution and display a message
5. WHEN mana changes THEN the system SHALL update the mana display in the UI

### Requirement 8

**User Story:** As a user, I want combat to follow a turn-based state machine, so that actions occur in a predictable sequence.

#### Acceptance Criteria

1. WHEN a battle begins THEN the system SHALL initialize the state machine to PlayerTurn state
2. WHEN the state is PlayerTurn THEN the system SHALL enable the combat menu and wait for player input
3. WHEN the player selects an action THEN the system SHALL transition to AttackAnimation state
4. WHEN the state is AttackAnimation THEN the system SHALL play the attack animation and apply damage
5. WHEN the attack animation completes THEN the system SHALL transition to EnemyTurn state
6. WHEN the state is EnemyTurn THEN the system SHALL execute the monster's attack and transition to PlayerTurn state
7. WHEN monster HP reaches 0 THEN the system SHALL transition to Victory state
8. WHEN player HP reaches 0 THEN the system SHALL transition to Defeat state

### Requirement 9

**User Story:** As a user, I want to see shake animations when damage is taken, so that combat feels impactful and responsive.

#### Acceptance Criteria

1. WHEN the monster takes damage THEN the system SHALL apply a shake animation to the monster image
2. WHEN the player takes damage THEN the system SHALL apply a shake animation to the player avatar
3. WHEN a shake animation plays THEN the system SHALL use Framer Motion for smooth animation
4. WHEN a shake animation completes THEN the system SHALL return the entity to its original position
5. WHEN multiple damage instances occur THEN the system SHALL queue shake animations appropriately

### Requirement 10

**User Story:** As a user, I want to see floating damage numbers when entities are hit, so that I can clearly see the impact of attacks.

#### Acceptance Criteria

1. WHEN the monster takes damage THEN the system SHALL display a floating damage number (e.g., "-45 HP") on the monster image
2. WHEN the player takes damage THEN the system SHALL display a floating damage number on the player avatar
3. WHEN a damage number appears THEN the system SHALL animate it upward and fade it out
4. WHEN a damage number animation completes THEN the system SHALL remove the element from the DOM
5. WHEN damage numbers are displayed THEN the system SHALL use contrasting colors for visibility (red for damage, green for healing)

### Requirement 11

**User Story:** As a user, I want the monster to attack during its turn, so that combat is challenging and interactive.

#### Acceptance Criteria

1. WHEN the state machine enters EnemyTurn THEN the system SHALL calculate monster attack damage
2. WHEN monster attack damage is calculated THEN the system SHALL use a base damage value (15 HP)
3. WHEN FIREWALL is active THEN the system SHALL block the monster attack and consume the FIREWALL effect
4. WHEN FIREWALL is not active THEN the system SHALL apply monster attack damage to player HP
5. WHEN monster attack completes THEN the system SHALL transition back to PlayerTurn state

### Requirement 12

**User Story:** As a user, I want to see a victory animation when I defeat a monster, so that success feels rewarding.

#### Acceptance Criteria

1. WHEN monster HP reaches 0 THEN the system SHALL trigger the victory condition
2. WHEN the victory condition triggers THEN the system SHALL play a victory animation
3. WHEN the victory animation plays THEN the system SHALL call the IPC banishFile function to delete the file
4. WHEN the file deletion completes THEN the system SHALL close the Battle Arena
5. WHEN the Battle Arena closes after victory THEN the system SHALL return to the dashboard with the file removed

### Requirement 13

**User Story:** As a user, I want to see a defeat animation when my HP reaches 0, so that failure is clearly communicated.

#### Acceptance Criteria

1. WHEN player HP reaches 0 THEN the system SHALL trigger the defeat condition
2. WHEN the defeat condition triggers THEN the system SHALL play a defeat animation
3. WHEN the defeat animation completes THEN the system SHALL close the Battle Arena
4. WHEN the Battle Arena closes after defeat THEN the system SHALL return to the dashboard with the file intact
5. WHEN the defeat condition triggers THEN the system SHALL NOT call the banishFile IPC function

### Requirement 14

**User Story:** As a system architect, I want the Battle Arena to be a separate component, so that the code is modular and maintainable.

#### Acceptance Criteria

1. WHEN the application is structured THEN the system SHALL implement BattleArena as a standalone React component
2. WHEN BattleArena is implemented THEN the system SHALL accept monster file data as props
3. WHEN BattleArena is implemented THEN the system SHALL accept callback functions for victory and defeat
4. WHEN BattleArena is implemented THEN the system SHALL manage its own internal combat state
5. WHEN BattleArena is implemented THEN the system SHALL not directly modify parent component state

### Requirement 15

**User Story:** As a user, I want App.tsx to manage battle mode state, so that the application can switch between dashboard and battle views.

#### Acceptance Criteria

1. WHEN App.tsx is implemented THEN the system SHALL maintain a battleMode state variable
2. WHEN battleMode is false THEN the system SHALL display the ExorcismDashboard component
3. WHEN battleMode is true THEN the system SHALL display the BattleArena component
4. WHEN a monster card is clicked THEN the system SHALL set battleMode to true and pass monster data to BattleArena
5. WHEN battle ends (victory or defeat) THEN the system SHALL set battleMode to false and return to dashboard
