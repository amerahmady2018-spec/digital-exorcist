# Implementation Plan

- [x] 1. Create core combat state management




  - Implement combat state machine using useReducer
  - Define CombatState type and all possible states
  - Create reducer function for state transitions
  - Add initial state calculation (monster HP from file size)
  - _Requirements: 1.3, 3.1, 4.1, 7.1, 8.1_




- [x] 1.1 Write property test for combat initialization












  - **Property 3: Combat initialization**
  - **Validates: Requirements 1.3, 4.1, 7.1, 8.1**



- [x] 1.2 Write property test for monster HP calculation







  - **Property 7: Monster HP calculation from file size**
  - **Validates: Requirements 3.1**
-

- [x] 2. Create DamageNumber component





  - Implement floating damage number component with Framer Motion
  - Add upward animation and fade out effect
  - Implement color coding (red for damage, green for healing)
  - Add automatic cleanup after animation completes
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
- [x] 2.1 Write property test for damage number appearance


- [x] 2.1 Write property test for damage number appearance






  - **Property 26: Floating damage numbers appear on damage**
  - **Validates: Requirements 10.1, 10.2**

- [x] 2.2 Write property test for damage number animation







  - **Property 27: Damage numbers animate upward and fade**
  - **Validates: Requirements 10.3**



-

- [x] 2.3 Write property test for damage number cleanup









  - **Property 28: Damage numbers are removed after animation**
  - **Validates: Requirements 10.4**
-

- [x] 2.4 Write property test for damage number color coding





  - **Property 29: Damage number color coding**
  - **Validates: Requirements 10.5**
-

- [x] 3. Create MonsterDisplay component





  - Implement monster image display with positioning
  - Add HP bar with current/max values
  - Implement shake animation on damage using Framer Motion
  - Add damage number positioning for monster

  - _Requirements: 2.2, 2.4, 3.4, 3.5, 9.1, 9.4_

- [ ] 3.1 Write property test for HP bar display

  - **Property 5: HP bars display current and maximum values**
  - **Validates: Requirements 2.4, 3.4**

- [ ]* 3.2 Write property test for HP bar visual proportionality
  - **Property 6: HP bar visual proportionality**
  - **Validates: Requirements 3.5**

- [ ]* 3.3 Write property test for shake animation
  - **Property 24: Shake animation on damage**
  - **Validates: Requirements 9.1**

- [ ]* 3.4 Write property test for shake animation return
  - **Property 25: Shake animation returns to original position**
  - **Validates: Requirements 9.4**
-

- [x] 4. Create PlayerDisplay component





  - Implement player avatar display (🧙‍♂️) with positioning
  - Add HP bar with current/max values
  - Add mana bar with current/max values
  - Implement shake animation on damage using Framer Motion
  - Add damage number positioning for player
  - _Requirements: 2.1, 2.3, 4.2, 4.3, 7.5, 9.2, 9.4_

- [ ]* 4.1 Write property test for player HP bar display
  - **Property 5: HP bars display current and maximum values**
  - **Validates: Requirements 2.3, 4.2**

- [ ]* 4.2 Write property test for mana display updates
  - **Property 20: Mana display updates**
  - **Validates: Requirements 7.5**

- [x] 5. Create CombatMenu component

  - Implement 4 action buttons: DATA SMASH, PURGE RITUAL, FIREWALL, FLEE
  - Add button descriptions (damage, mana cost)
  - Implement disabled state for PURGE RITUAL when mana < 30
  - Add weapon trigger button styling
  - Disable all buttons when not in PlayerTurn state
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.4, 8.2_

- [ ]* 5.1 Write property test for combat menu enabled state
  - **Property 21: Combat menu enabled during PlayerTurn**
  - **Validates: Requirements 8.2**

- [ ]* 5.2 Write property test for PURGE RITUAL mana requirement
  - **Property 19: Insufficient mana prevents PURGE RITUAL**
  - **Validates: Requirements 7.4**

- [x] 6. Implement combat action logic

  - Create action handler for DATA SMASH (20 damage, 0 mana)
  - Create action handler for PURGE RITUAL (50 damage, 30 mana)
  - Create action handler for FIREWALL (set firewall active)
  - Create action handler for FLEE (close arena)
  - Add mana validation and consumption
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 7.2, 7.3_

- [ ]* 6.1 Write property test for DATA SMASH damage
  - **Property 14: DATA SMASH deals fixed damage**
  - **Validates: Requirements 6.2**

- [ ]* 6.2 Write property test for PURGE RITUAL mana requirement
  - **Property 15: PURGE RITUAL requires mana**
  - **Validates: Requirements 6.3, 7.2, 7.3**

- [ ]* 6.3 Write property test for PURGE RITUAL damage
  - **Property 16: PURGE RITUAL deals heavy damage**
  - **Validates: Requirements 6.3**

- [ ]* 6.4 Write property test for FIREWALL blocking
  - **Property 17: FIREWALL blocks next attack**
  - **Validates: Requirements 6.4, 11.3**

- [ ]* 6.5 Write property test for FLEE action
  - **Property 18: FLEE cancels battle without deletion**
  - **Validates: Requirements 6.5**

- [x] 7. Implement enemy turn logic

  - Create monster attack handler (15 base damage)
  - Implement firewall check and consumption
  - Apply damage to player HP when firewall not active
  - Add state transition back to PlayerTurn
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 7.1 Write property test for monster attack damage
  - **Property 31: Monster base damage is fixed**
  - **Validates: Requirements 11.2**

- [ ]* 7.2 Write property test for monster attack application
  - **Property 32: Monster attack applies without firewall**
  - **Validates: Requirements 11.4**

- [x] 8. Implement Ghost-type rot damage

  - Check if monster is Ghost type (classifications includes 'ghost')
  - Apply 10 rot damage to player at end of each turn
  - Display damage number for rot damage
  - Skip rot damage for non-Ghost monsters
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 8.1 Write property test for Ghost rot damage
  - **Property 10: Ghost monsters apply rot damage**
  - **Validates: Requirements 5.1, 5.2**

- [ ]* 8.2 Write property test for rot damage visual indicator
  - **Property 11: Rot damage displays visual indicator**
  - **Validates: Requirements 5.3**

- [ ]* 8.3 Write property test for non-Ghost monsters
  - **Property 12: Non-Ghost monsters don't apply rot damage**
  - **Validates: Requirements 5.4**

- [ ]* 8.4 Write property test for rot damage defeat
  - **Property 13: Rot damage can cause defeat**
  - **Validates: Requirements 5.5**

- [x] 9. Implement victory and defeat conditions

  - Check monster HP <= 0 and transition to Victory state
  - Check player HP <= 0 and transition to Defeat state
  - Implement victory animation
  - Implement defeat animation
  - Call onVictory callback with file data on victory
  - Call onDefeat callback on defeat
  - _Requirements: 4.4, 8.7, 8.8, 12.1, 12.2, 13.1, 13.2_

- [ ]* 9.1 Write property test for victory condition
  - **Property 23: Victory triggers when monster HP reaches zero**
  - **Validates: Requirements 8.7, 12.1**

- [ ]* 9.2 Write property test for defeat condition
  - **Property 9: Defeat triggers when player HP reaches zero**
  - **Validates: Requirements 4.4, 8.8, 13.1**

- [x] 10. Create BattleArena component

  - Implement full-screen overlay with fixed positioning
  - Add background styling (dark with backdrop blur)
  - Position MonsterDisplay in top-right
  - Position PlayerDisplay in bottom-left
  - Position CombatMenu at bottom-center
  - Add damage numbers overlay with AnimatePresence
  - Wire up all sub-components with combat state
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.5, 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]* 10.1 Write property test for BattleArena state management
  - **Property 39: BattleArena manages internal state**
  - **Validates: Requirements 14.4, 14.5**

- [x] 11. Implement state machine transitions

  - Add transition from PlayerTurn to AttackAnimation on action
  - Add transition from AttackAnimation to EnemyTurn after animation
  - Add transition from EnemyTurn to PlayerTurn after monster attack
  - Add transition to Victory when monster HP <= 0
  - Add transition to Defeat when player HP <= 0
  - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [ ]* 11.1 Write property test for state transitions
  - **Property 22: State transitions follow sequence**
  - **Validates: Requirements 8.3, 8.4, 8.5, 8.6, 11.5**

- [ ] 12. Integrate BattleArena with App.tsx

  - Add battleMode state (boolean) to App.tsx
  - Add selectedMonster state (ClassifiedFile | null) to App.tsx
  - Implement conditional rendering: battleMode ? BattleArena : ExorcismDashboard
  - Create handleBattleStart callback to set battleMode and selectedMonster
  - Create handleVictory callback to call banishFile and close arena
  - Create handleDefeat callback to close arena without deletion
  - Create handleFlee callback to close arena without deletion
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 12.1 Write property test for App.tsx conditional rendering
  - **Property 40: App.tsx conditional rendering**
  - **Validates: Requirements 15.2, 15.3**

- [ ]* 12.2 Write property test for battle mode state transitions
  - **Property 4: Arena closes and returns to dashboard**
  - **Validates: Requirements 1.5, 15.5**

- [ ] 13. Update MonsterCard component

  - Modify onClick handler to call handleBattleStart instead of handleBanish
  - Pass file data to battle start callback
  - Remove direct banishFile IPC call from card
  - Keep SAVE SOUL button functionality unchanged
  - _Requirements: 1.1, 1.2_

- [ ]* 13.1 Write property test for monster card click behavior
  - **Property 1: Battle arena opens on monster card click**
  - **Validates: Requirements 1.1, 15.4**

- [ ]* 13.2 Write property test for file deletion prevention
  - **Property 2: File deletion prevented on arena open**
  - **Validates: Requirements 1.2**

- [ ] 14. Implement victory flow

  - Call banishFile IPC with monster file path on victory
  - Remove file from classifiedFiles list
  - Close Battle Arena after successful deletion
  - Display error message if deletion fails
  - _Requirements: 12.3, 12.4, 12.5_

- [ ]* 14.1 Write property test for victory file deletion
  - **Property 33: Victory triggers file deletion**
  - **Validates: Requirements 12.3**

- [ ]* 14.2 Write property test for victory arena closure
  - **Property 34: Victory closes arena after deletion**
  - **Validates: Requirements 12.4**

- [ ]* 14.3 Write property test for victory file removal
  - **Property 35: Victory removes file from dashboard**
  - **Validates: Requirements 12.5**

- [ ] 15. Implement defeat flow

  - Close Battle Arena after defeat animation
  - Keep file in classifiedFiles list
  - Do not call banishFile IPC
  - Return to dashboard with file intact
  - _Requirements: 13.3, 13.4, 13.5_

- [ ]* 15.1 Write property test for defeat arena closure
  - **Property 36: Defeat closes arena**
  - **Validates: Requirements 13.3**

- [ ]* 15.2 Write property test for defeat file preservation
  - **Property 37: Defeat preserves file**
  - **Validates: Requirements 13.4**

- [ ]* 15.3 Write property test for defeat no deletion
  - **Property 38: Defeat prevents file deletion**
  - **Validates: Requirements 13.5**

- [ ] 16. Implement HP reset between battles

  - Reset player HP to 100 when new battle starts
  - Reset player mana to 100 when new battle starts
  - Calculate fresh monster HP from new file size
  - Reset firewall state to false
  - _Requirements: 4.5_

- [ ]* 16.1 Write property test for HP reset
  - **Property 8: Player HP resets between battles**
  - **Validates: Requirements 4.5**

- [ ] 17. Add combat animations and polish

  - Ensure shake animations use Framer Motion
  - Add smooth transitions between combat states
  - Add visual feedback for button clicks
  - Add sound effects (optional)
  - Optimize animation performance
  - _Requirements: 9.3, 9.5_

- [ ]* 17.1 Write property test for animation queuing
  - **Property 25: Shake animation returns to original position**
  - **Validates: Requirements 9.4**

- [ ] 18. Checkpoint - Verify core combat functionality

  - Ensure all tests pass, ask the user if questions arise
  - Test full combat flow from start to victory
  - Test full combat flow from start to defeat
  - Test FLEE action at various points
  - Test Ghost monster rot damage
  - Test mana consumption and PURGE RITUAL blocking

- [ ] 19. Add error handling and edge cases

  - Handle invalid file sizes (0 bytes, negative)
  - Handle mana underflow (clamp to 0)
  - Handle HP overflow/underflow (clamp to [0, maxHP])
  - Handle IPC call failures during victory
  - Handle missing monster classifications
  - Add error messages and retry options
  - _Requirements: Error Handling section_

- [ ] 20. Final checkpoint - Complete testing and polish

  - Ensure all tests pass, ask the user if questions arise
  - Verify all requirements are met
  - Test cross-browser compatibility (Electron)
  - Verify animations are smooth and performant
  - Confirm battle system is fully functional and polished
