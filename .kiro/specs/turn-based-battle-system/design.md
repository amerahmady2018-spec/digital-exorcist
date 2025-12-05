# Design Document

## Overview

The Turn-Based Battle System transforms The Digital Exorcist from a simple file management application into an interactive RPG combat experience. When users click on a monster card, instead of immediately deleting the file, they enter a full-screen Battle Arena where they engage in Pokemon-style turn-based combat. The system implements a state machine to manage combat flow, visual feedback through animations and damage numbers, and strategic gameplay through multiple attack options and resource management. Victory results in file deletion (banishment), while defeat preserves the file and returns the user to the dashboard.

## Architecture

### Component Hierarchy

**App.tsx (Root Level)**
- Manages `battleMode` state (boolean) to switch between dashboard and battle views
- Manages `selectedMonster` state to pass file data to BattleArena
- Conditionally renders ExorcismDashboard or BattleArena based on battleMode
- Provides callbacks for battle completion (victory/defeat)

**MonsterCard.tsx (Card Level)**
- Modified to trigger battle mode instead of immediate deletion
- onClick handler calls parent callback to set battleMode=true and pass file data
- Removes direct banishFile IPC call from card component

**BattleArena.tsx (New Component)**
- Full-screen overlay component (fixed positioning, z-index above all content)
- Manages internal combat state machine
- Renders player avatar, monster image, HP bars, mana bar, and combat menu
- Handles turn-based combat logic
- Triggers victory/defeat callbacks to parent

### State Management

**App.tsx State**
```typescript
const [battleMode, setBattleMode] = useState(false);
const [selectedMonster, setSelectedMonster] = useState<ClassifiedFile | null>(null);
```

**BattleArena.tsx State**
```typescript
type CombatState = 'PlayerTurn' | 'AttackAnimation' | 'EnemyTurn' | 'Victory' | 'Defeat';

const [combatState, setCombatState] = useState<CombatState>('PlayerTurn');
const [playerHP, setPlayerHP] = useState(100);
const [playerMana, setPlayerMana] = useState(100);
const [monsterHP, setMonsterHP] = useState(0); // Calculated from file size
const [firewallActive, setFirewallActive] = useState(false);
const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
```

### Technology Stack

- **React**: Component framework (existing)
- **TypeScript**: Type safety for state machine and combat logic
- **Framer Motion**: Animations for shake effects, damage numbers, victory/defeat
- **Tailwind CSS**: Styling for battle arena layout
- **Electron IPC**: File deletion on victory (existing banishFile API)

## Components and Interfaces

### BattleArena Component

**Props Interface**
```typescript
interface BattleArenaProps {
  monster: ClassifiedFile;
  onVictory: (filePath: string, classifications?: MonsterType[], fileSize?: number) => void;
  onDefeat: () => void;
  onFlee: () => void;
}
```

**Layout Structure**
```tsx
<motion.div className="fixed inset-0 z-[100] bg-graveyard-950/95 backdrop-blur-lg">
  {/* Monster Section - Top Right */}
  <div className="absolute top-20 right-20">
    <MonsterDisplay 
      image={monsterImage}
      hp={monsterHP}
      maxHP={maxMonsterHP}
      isShaking={monsterIsShaking}
    />
  </div>

  {/* Player Section - Bottom Left */}
  <div className="absolute bottom-20 left-20">
    <PlayerDisplay 
      hp={playerHP}
      maxHP={100}
      mana={playerMana}
      maxMana={100}
      isShaking={playerIsShaking}
    />
  </div>

  {/* Combat Menu - Bottom Center */}
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
    <CombatMenu 
      onAction={handlePlayerAction}
      disabled={combatState !== 'PlayerTurn'}
      mana={playerMana}
    />
  </div>

  {/* Damage Numbers Overlay */}
  <AnimatePresence>
    {damageNumbers.map(dn => (
      <DamageNumber key={dn.id} {...dn} />
    ))}
  </AnimatePresence>
</motion.div>
```

### MonsterDisplay Component

**Props Interface**
```typescript
interface MonsterDisplayProps {
  image: string;
  hp: number;
  maxHP: number;
  isShaking: boolean;
}
```

**Visual Structure**
```tsx
<motion.div
  animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
  transition={{ duration: 0.4 }}
  className="relative"
>
  <img 
    src={image} 
    alt="Monster" 
    className="w-64 h-64 object-contain drop-shadow-2xl"
  />
  
  {/* HP Bar */}
  <div className="mt-4 w-64">
    <div className="flex justify-between mb-1">
      <span className="font-tech font-bold text-red-400">MONSTER HP</span>
      <span className="font-tech font-bold text-white">{hp} / {maxHP}</span>
    </div>
    <div className="h-4 bg-black/60 rounded-full border-2 border-red-600">
      <motion.div
        animate={{ width: `${(hp / maxHP) * 100}%` }}
        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
      />
    </div>
  </div>
</motion.div>
```

### PlayerDisplay Component

**Props Interface**
```typescript
interface PlayerDisplayProps {
  hp: number;
  maxHP: number;
  mana: number;
  maxMana: number;
  isShaking: boolean;
}
```

**Visual Structure**
```tsx
<motion.div
  animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
  transition={{ duration: 0.4 }}
  className="relative"
>
  <div className="text-8xl">🧙‍♂️</div>
  
  {/* HP Bar */}
  <div className="mt-4 w-64">
    <div className="flex justify-between mb-1">
      <span className="font-tech font-bold text-green-400">PLAYER HP</span>
      <span className="font-tech font-bold text-white">{hp} / {maxHP}</span>
    </div>
    <div className="h-4 bg-black/60 rounded-full border-2 border-green-600">
      <motion.div
        animate={{ width: `${(hp / maxHP) * 100}%` }}
        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
      />
    </div>
  </div>

  {/* Mana Bar */}
  <div className="mt-2 w-64">
    <div className="flex justify-between mb-1">
      <span className="font-tech font-bold text-blue-400">MANA</span>
      <span className="font-tech font-bold text-white">{mana} / {maxMana}</span>
    </div>
    <div className="h-3 bg-black/60 rounded-full border-2 border-blue-600">
      <motion.div
        animate={{ width: `${(mana / maxMana) * 100}%` }}
        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
      />
    </div>
  </div>
</motion.div>
```

### CombatMenu Component

**Props Interface**
```typescript
interface CombatMenuProps {
  onAction: (action: CombatAction) => void;
  disabled: boolean;
  mana: number;
}

type CombatAction = 'DATA_SMASH' | 'PURGE_RITUAL' | 'FIREWALL' | 'FLEE';
```

**Visual Structure**
```tsx
<div className="grid grid-cols-2 gap-4 w-[600px]">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onAction('DATA_SMASH')}
    disabled={disabled}
    className="weapon-trigger-btn px-8 py-6 bg-gradient-to-r from-red-700 to-red-600 text-white font-tech font-bold text-lg"
  >
    [ DATA SMASH ]
    <span className="block text-xs text-gray-300 mt-1">Basic Attack - 20 DMG</span>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onAction('PURGE_RITUAL')}
    disabled={disabled || mana < 30}
    className="weapon-trigger-btn px-8 py-6 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-tech font-bold text-lg"
  >
    [ PURGE RITUAL ]
    <span className="block text-xs text-gray-300 mt-1">Heavy Attack - 50 DMG (30 Mana)</span>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onAction('FIREWALL')}
    disabled={disabled}
    className="weapon-trigger-btn px-8 py-6 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-tech font-bold text-lg"
  >
    [ FIREWALL ]
    <span className="block text-xs text-gray-300 mt-1">Block Next Attack</span>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onAction('FLEE')}
    disabled={disabled}
    className="weapon-trigger-btn px-8 py-6 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-tech font-bold text-lg"
  >
    [ FLEE ]
    <span className="block text-xs text-gray-300 mt-1">Escape Battle</span>
  </motion.button>
</div>
```

### DamageNumber Component

**Props Interface**
```typescript
interface DamageNumberProps {
  id: string;
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal';
}
```

**Visual Structure**
```tsx
<motion.div
  initial={{ opacity: 1, y: 0, scale: 1 }}
  animate={{ opacity: 0, y: -100, scale: 1.5 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 1.5 }}
  className="absolute pointer-events-none"
  style={{ left: x, top: y }}
>
  <span className={`font-tech font-bold text-4xl ${
    type === 'damage' ? 'text-red-500' : 'text-green-500'
  }`}>
    {type === 'damage' ? '-' : '+'}{value} HP
  </span>
</motion.div>
```

## Data Models

### Combat State Machine

```typescript
type CombatState = 
  | 'PlayerTurn'      // Waiting for player action
  | 'AttackAnimation' // Playing attack animation
  | 'EnemyTurn'       // Monster attacking
  | 'Victory'         // Monster defeated
  | 'Defeat';         // Player defeated

interface CombatStateData {
  state: CombatState;
  playerHP: number;
  playerMana: number;
  monsterHP: number;
  maxMonsterHP: number;
  firewallActive: boolean;
  isGhostType: boolean;
}
```

### Damage Number

```typescript
interface DamageNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal';
  timestamp: number;
}
```

### Combat Action

```typescript
type CombatAction = 'DATA_SMASH' | 'PURGE_RITUAL' | 'FIREWALL' | 'FLEE';

interface ActionResult {
  damage: number;
  manaCost: number;
  effect?: 'firewall';
}

const COMBAT_ACTIONS: Record<CombatAction, ActionResult> = {
  DATA_SMASH: { damage: 20, manaCost: 0 },
  PURGE_RITUAL: { damage: 50, manaCost: 30 },
  FIREWALL: { damage: 0, manaCost: 0, effect: 'firewall' },
  FLEE: { damage: 0, manaCost: 0 }
};
```

### Monster HP Calculation

```typescript
function calculateMonsterHP(fileSizeBytes: number): number {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  return Math.ceil(fileSizeMB * 10);
}

// Examples:
// 10MB file = 100 HP
// 50MB file = 500 HP
// 1MB file = 10 HP
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Battle arena opens on monster card click
*For any* monster card, clicking it should set battleMode to true and open the Battle Arena overlay.
**Validates: Requirements 1.1, 15.4**

### Property 2: File deletion prevented on arena open
*For any* monster card click that opens the Battle Arena, the banishFile IPC function should not be called immediately.
**Validates: Requirements 1.2**

### Property 3: Combat initialization
*For any* battle that begins, the combat state should be initialized to PlayerTurn with player HP at 100, mana at 100, and monster HP calculated from file size.
**Validates: Requirements 1.3, 4.1, 7.1, 8.1**

### Property 4: Arena closes and returns to dashboard
*For any* battle that ends (victory, defeat, or flee), battleMode should be set to false and the dashboard should be displayed.
**Validates: Requirements 1.5, 15.5**

### Property 5: HP bars display current and maximum values
*For any* HP value change (player or monster), the HP bar should display both the current and maximum HP values numerically.
**Validates: Requirements 2.3, 2.4, 3.4, 4.2**

### Property 6: HP bar visual proportionality
*For any* HP value change, the HP bar width should be proportional to the ratio of current HP to maximum HP.
**Validates: Requirements 3.5, 4.3**

### Property 7: Monster HP calculation from file size
*For any* file size in bytes, monster HP should equal (file size in MB) × 10, rounded up to the nearest integer.
**Validates: Requirements 3.1**

### Property 8: Player HP resets between battles
*For any* two consecutive battles, the player HP should start at 100 in both battles regardless of the ending HP of the previous battle.
**Validates: Requirements 4.5**

### Property 9: Defeat triggers when player HP reaches zero
*For any* battle where player HP is reduced to 0 or below, the combat state should transition to Defeat.
**Validates: Requirements 4.4, 8.8, 13.1**

### Property 10: Ghost monsters apply rot damage
*For any* Ghost-type monster, the player should take 10 rot damage at the end of each turn.
**Validates: Requirements 5.1, 5.2**

### Property 11: Rot damage displays visual indicator
*For any* turn where rot damage is applied, a damage number should appear on the player avatar showing "-10 HP".
**Validates: Requirements 5.3**

### Property 12: Non-Ghost monsters don't apply rot damage
*For any* non-Ghost monster (Demon or Zombie), the player should not take rot damage at the end of turns.
**Validates: Requirements 5.4**

### Property 13: Rot damage can cause defeat
*For any* battle where rot damage reduces player HP to 0, the combat state should transition to Defeat.
**Validates: Requirements 5.5**

### Property 14: DATA SMASH deals fixed damage
*For any* monster, using DATA SMASH should reduce monster HP by exactly 20.
**Validates: Requirements 6.2**

### Property 15: PURGE RITUAL requires mana
*For any* battle state, PURGE RITUAL should only execute if player mana is >= 30, and should reduce mana by 30 when executed.
**Validates: Requirements 6.3, 7.2, 7.3**

### Property 16: PURGE RITUAL deals heavy damage
*For any* monster, using PURGE RITUAL (when mana is sufficient) should reduce monster HP by exactly 50.
**Validates: Requirements 6.3**

### Property 17: FIREWALL blocks next attack
*For any* battle where FIREWALL is used, the next monster attack should deal 0 damage and the firewall effect should be consumed.
**Validates: Requirements 6.4, 11.3**

### Property 18: FLEE cancels battle without deletion
*For any* battle where FLEE is used, battleMode should become false and banishFile should not be called.
**Validates: Requirements 6.5**

### Property 19: Insufficient mana prevents PURGE RITUAL
*For any* battle state where player mana < 30, the PURGE RITUAL button should be disabled and clicking it should have no effect.
**Validates: Requirements 7.4**

### Property 20: Mana display updates
*For any* mana value change, the mana bar should update to reflect the new value both visually and numerically.
**Validates: Requirements 7.5**

### Property 21: Combat menu enabled during PlayerTurn
*For any* battle in PlayerTurn state, all combat action buttons should be enabled (except PURGE RITUAL if mana < 30).
**Validates: Requirements 8.2**

### Property 22: State transitions follow sequence
*For any* player action (except FLEE), the combat state should transition: PlayerTurn → AttackAnimation → EnemyTurn → PlayerTurn.
**Validates: Requirements 8.3, 8.4, 8.5, 8.6, 11.5**

### Property 23: Victory triggers when monster HP reaches zero
*For any* battle where monster HP is reduced to 0 or below, the combat state should transition to Victory.
**Validates: Requirements 8.7, 12.1**

### Property 24: Shake animation on damage
*For any* damage dealt to an entity (player or monster), a shake animation should be applied to that entity's visual representation.
**Validates: Requirements 9.1, 9.2**

### Property 25: Shake animation returns to original position
*For any* shake animation, the entity should return to its original position after the animation completes.
**Validates: Requirements 9.4**

### Property 26: Floating damage numbers appear on damage
*For any* damage dealt to an entity, a floating damage number should appear at the entity's position showing the damage amount.
**Validates: Requirements 10.1, 10.2**

### Property 27: Damage numbers animate upward and fade
*For any* damage number created, it should animate upward and fade out over time.
**Validates: Requirements 10.3**

### Property 28: Damage numbers are removed after animation
*For any* damage number that completes its animation, it should be removed from the DOM.
**Validates: Requirements 10.4**

### Property 29: Damage number color coding
*For any* damage number, it should be red for damage and green for healing.
**Validates: Requirements 10.5**

### Property 30: Monster attacks during EnemyTurn
*For any* battle in EnemyTurn state, the monster should calculate and apply attack damage to the player.
**Validates: Requirements 11.1, 11.2**

### Property 31: Monster base damage is fixed
*For any* monster attack (when firewall is not active), the damage dealt should be exactly 15 HP.
**Validates: Requirements 11.2**

### Property 32: Monster attack applies without firewall
*For any* monster attack when firewall is not active, player HP should decrease by the attack damage amount.
**Validates: Requirements 11.4**

### Property 33: Victory triggers file deletion
*For any* battle that reaches Victory state, the banishFile IPC function should be called with the monster's file path.
**Validates: Requirements 12.3**

### Property 34: Victory closes arena after deletion
*For any* successful file deletion after victory, battleMode should be set to false.
**Validates: Requirements 12.4**

### Property 35: Victory removes file from dashboard
*For any* battle that ends in victory, the file should be removed from the classifiedFiles list.
**Validates: Requirements 12.5**

### Property 36: Defeat closes arena
*For any* battle that reaches Defeat state, battleMode should be set to false after the defeat animation.
**Validates: Requirements 13.3**

### Property 37: Defeat preserves file
*For any* battle that ends in defeat, the file should remain in the classifiedFiles list.
**Validates: Requirements 13.4**

### Property 38: Defeat prevents file deletion
*For any* battle that reaches Defeat state, the banishFile IPC function should not be called.
**Validates: Requirements 13.5**

### Property 39: BattleArena manages internal state
*For any* combat state change within BattleArena, the component should update its own state without directly modifying parent component state.
**Validates: Requirements 14.4, 14.5**

### Property 40: App.tsx conditional rendering
*For any* App.tsx render, if battleMode is true then BattleArena should render, otherwise ExorcismDashboard should render.
**Validates: Requirements 15.2, 15.3**

## Error Handling

### Invalid File Size

**Scenario**: File size is 0 bytes or negative

**Handling**:
- Set minimum monster HP to 10 (1MB equivalent)
- Log warning about invalid file size
- Continue with minimum HP value

### Mana Underflow

**Scenario**: Mana calculation results in negative value

**Handling**:
- Clamp mana to minimum of 0
- Disable PURGE RITUAL button when mana < 30
- Display "Insufficient Mana" message on button hover

### HP Overflow/Underflow

**Scenario**: Damage calculation results in HP > maxHP or HP < 0

**Handling**:
- Clamp HP to range [0, maxHP]
- Trigger victory/defeat conditions when HP reaches boundaries
- Ensure HP bars never exceed 100% width

### State Machine Invalid Transitions

**Scenario**: Attempt to transition to invalid state

**Handling**:
- Log error with current state and attempted transition
- Remain in current state
- Disable combat menu to prevent further invalid actions
- Provide "Reset Battle" button to user

### IPC Call Failures

**Scenario**: banishFile IPC call fails during victory

**Handling**:
- Display error message to user
- Keep Battle Arena open
- Provide "Retry" and "Cancel" buttons
- On cancel, return to dashboard without deleting file

### Animation Interruption

**Scenario**: User clicks action during animation

**Handling**:
- Disable combat menu during AttackAnimation and EnemyTurn states
- Queue actions if clicked during animation (optional enhancement)
- Ignore clicks on disabled buttons

### Ghost Type Detection Failure

**Scenario**: Monster classifications array is empty or undefined

**Handling**:
- Default to non-Ghost behavior (no rot damage)
- Log warning about missing classifications
- Continue with normal combat flow

## Testing Strategy

### Unit Testing

Unit tests will focus on:

- **HP Calculation**: Test calculateMonsterHP function with various file sizes
- **Damage Application**: Test damage calculation and HP reduction logic
- **Mana Management**: Test mana consumption and validation
- **State Transitions**: Test state machine transitions for all actions
- **Firewall Logic**: Test firewall activation and consumption
- **Victory/Defeat Conditions**: Test HP boundary conditions
- **Component Rendering**: Test conditional rendering based on battleMode

### Property-Based Testing

The application will use **fast-check** for property-based testing with minimum 100 iterations per property:

**Example Property Test**:
```typescript
// **Feature: turn-based-battle-system, Property 7: Monster HP calculation from file size**
it('monster HP is calculated correctly from file size', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000 * 1024 * 1024 }), // file size in bytes
      (fileSize) => {
        const expectedHP = Math.ceil((fileSize / (1024 * 1024)) * 10);
        const actualHP = calculateMonsterHP(fileSize);
        expect(actualHP).toBe(expectedHP);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Example Property Test**:
```typescript
// **Feature: turn-based-battle-system, Property 22: State transitions follow sequence**
it('combat state transitions follow correct sequence', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('DATA_SMASH', 'PURGE_RITUAL', 'FIREWALL'),
      (action) => {
        const initialState = 'PlayerTurn';
        const states = simulateCombatTurn(initialState, action);
        
        expect(states).toEqual([
          'PlayerTurn',
          'AttackAnimation',
          'EnemyTurn',
          'PlayerTurn'
        ]);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

- **Full Combat Flow**: Test complete battle from start to victory
- **Full Combat Flow to Defeat**: Test battle ending in player defeat
- **FLEE Action**: Test fleeing from battle at various points
- **Ghost Monster Combat**: Test rot damage application throughout battle
- **Mana Depletion**: Test multiple PURGE RITUAL uses until mana runs out
- **Firewall Usage**: Test firewall blocking and consumption
- **File Deletion on Victory**: Test IPC call integration

### Visual Testing

- **Animation Smoothness**: Verify shake animations and damage numbers animate smoothly
- **Layout Positioning**: Verify player (bottom-left) and monster (top-right) positioning
- **HP Bar Updates**: Verify HP bars update smoothly and proportionally
- **Button States**: Verify button disabled states (PURGE RITUAL when low mana)
- **Victory/Defeat Animations**: Verify end-of-battle animations play correctly

## Implementation Notes

### Performance Optimization

**State Updates**
- Batch state updates during combat turn to minimize re-renders
- Use React.memo for MonsterDisplay and PlayerDisplay components
- Debounce damage number creation if multiple damage sources occur simultaneously

**Animations**
- Use Framer Motion's `useReducedMotion` hook to respect user preferences
- Limit concurrent damage numbers to 5 maximum
- Clean up damage number elements immediately after animation completes

**Combat State Machine**
- Use useReducer instead of multiple useState calls for combat state
- Implement state machine as a reducer for predictable state transitions
- Log state transitions in development mode for debugging

### Accessibility Considerations

**Keyboard Navigation**
- Support keyboard shortcuts for combat actions (1-4 keys)
- Ensure focus management when Battle Arena opens/closes
- Provide "Skip Animation" option for users who prefer faster gameplay

**Screen Readers**
- Add ARIA labels to HP bars with current/max values
- Announce combat state changes ("Your turn", "Enemy turn", "Victory!")
- Provide text alternatives for damage numbers

**Motion Sensitivity**
- Respect `prefers-reduced-motion` media query
- Provide option to disable shake animations
- Reduce animation duration for users with motion sensitivity

### Browser Compatibility

**Minimum Supported Versions**
- Chrome 90+ (Electron uses Chromium)
- No browser compatibility concerns since this is an Electron app

### Development Workflow

1. **Create BattleArena Component**: Implement basic layout and structure
2. **Implement Combat State Machine**: Create reducer for state management
3. **Add HP/Mana Bars**: Implement PlayerDisplay and MonsterDisplay components
4. **Implement Combat Menu**: Create CombatMenu component with action buttons
5. **Add Damage Calculation**: Implement damage logic for all actions
6. **Implement Animations**: Add shake effects and damage numbers
7. **Add Victory/Defeat Logic**: Implement end-of-battle conditions and animations
8. **Integrate with App.tsx**: Add battleMode state and conditional rendering
9. **Update MonsterCard**: Modify click handler to trigger battle mode
10. **Test and Polish**: Verify all combat flows and edge cases

### File Modifications Required

- `src/renderer/App.tsx`: Add battleMode state and conditional rendering
- `src/renderer/components/MonsterCard.tsx`: Update click handler to trigger battle
- `src/renderer/components/BattleArena.tsx`: New component (main battle interface)
- `src/renderer/components/MonsterDisplay.tsx`: New component (monster HP display)
- `src/renderer/components/PlayerDisplay.tsx`: New component (player HP/mana display)
- `src/renderer/components/CombatMenu.tsx`: New component (action buttons)
- `src/renderer/components/DamageNumber.tsx`: New component (floating damage text)
- `src/renderer/index.css`: Add battle arena specific styles (if needed beyond Tailwind)

### Combat Balance Considerations

**Current Balance**:
- Player HP: 100
- Player Mana: 100
- Monster HP: File size (MB) × 10
- DATA SMASH: 20 damage, 0 mana
- PURGE RITUAL: 50 damage, 30 mana
- Monster Attack: 15 damage
- Rot Damage: 10 per turn (Ghost only)

**Example Battle Scenarios**:

*10MB File (100 HP Monster)*:
- 5 DATA SMASH attacks = Victory
- 2 PURGE RITUAL attacks = Victory
- Player can survive ~6 monster attacks (90 damage)
- Ghost monster: Player can survive ~4 turns with rot damage

*50MB File (500 HP Monster)*:
- 25 DATA SMASH attacks = Victory (not viable)
- 10 PURGE RITUAL attacks = Victory (requires 300 mana - not possible)
- Mixed strategy: 3 PURGE RITUAL (150 dmg) + 18 DATA SMASH (360 dmg) = Victory
- Player takes ~25 monster attacks during this time (375 damage) = Defeat
- **Balance Issue**: Large files may be unbeatable without healing or mana regeneration

**Potential Enhancements** (Future):
- Add mana regeneration (10 mana per turn)
- Add healing action (restore 30 HP, costs 20 mana)
- Scale monster attack damage with file size
- Add critical hit chance for player attacks
- Add monster special abilities based on type
