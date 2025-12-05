# Implementation Plan

- [x] 1. Create simulated file data module

  - Create `src/renderer/data/simulatedFiles.ts`
  - Define 3 Ghost files (old dates, various sizes)
  - Define 2 Zombie files (duplicate content simulation)
  - Define 2 Demon files (large sizes 500MB+)
  - Include: id, fakePath, filename, extension, size, lastModified, type, entityType, zone
  - Add narrative flavor text for each entity
  - _Requirements: 2.2, 2.3, 9.1_

- [x] 1.1 Create curated encounter generator

  - Create function to build encounter from simulated data
  - Ensure LIMITED set (exactly 7 entities for demo)
  - Randomize order for variety
  - _Requirements: 2.4_

- [x] 2. Update GuidedPreviewScreen

  - Remove any real file scanning logic
  - Load simulated encounter on mount
  - Display entity counts from simulated data
  - Remove folder selection UI
  - _Requirements: 2.1, 2.4_

- [x] 2.1 Update GuidedActiveScreen

  - Remove `window.electronAPI.banishFile()` calls
  - Track purge state in memory only (useState or flowContext)
  - Update entity list in memory when purged
  - Simulate graveyard addition (memory only)
  - _Requirements: 2.5, 2.6_

- [x] 2.2 Update GuidedSummaryScreen

  - Display stats from memory-tracked purges
  - Show simulated space recovered
  - Ensure return to HQ works
  - _Requirements: 2.7_

- [x] 3. Checkpoint - Verify Guided Ritual isolation

  - Test that NO real file operations occur
  - Verify simulated data displays correctly
  - Confirm full flow works: Preview → Active → Summary → HQ

- [x] 4. Update SwiftLocationScreen with predefined locations

  - Add buttons for: Downloads, Desktop, Documents, Pictures
  - Add "Custom Folder" option with warning
  - Remove free folder picker
  - Implement system folder blocking
  - _Requirements: 3.1, 3.7_

- [x] 4.1 Create folder validation utility

  - Create `src/renderer/utils/folderValidation.ts`
  - Implement `isAllowedFolder()` function
  - Implement `isForbiddenPath()` function
  - Block: Windows, Program Files, System, usr, bin, etc.
  - _Requirements: 3.7_

- [x] 5. Update SwiftResultsScreen with category grouping

  - Group scanned files by entityType (Ghost, Zombie, Demon)
  - Display count and total size per category
  - Remove individual file cards
  - _Requirements: 3.3_

- [x] 5.1 Add bulk purge buttons

  - Add "PURGE ALL GHOSTS" button
  - Add "PURGE ALL ZOMBIES" button
  - Add "PURGE ALL DEMONS" button
  - Add "SKIP" option per category
  - Show space to be recovered per category
  - _Requirements: 3.4_

- [x] 5.2 Implement bulk purge logic

  - Purge all files in selected categories
  - Move files to graveyard (real file operations)
  - Track progress and show completion
  - _Requirements: 3.5_

- [x] 6. Update SwiftSummaryScreen

  - Display total files purged by category
  - Show total space recovered
  - Ensure return to HQ works
  - _Requirements: 3.6_

- [x] 7. Checkpoint - Verify Swift Purge flow

  - Test allowed folder restrictions work
  - Verify bulk actions purge correct files
  - Confirm files are MOVED to graveyard (not deleted)
  - Test full flow: Location → Results → Summary → HQ

- [x] 8. Update ConfrontationLoopScreen to queue-based

  - Replace grid layout with single-entity display
  - Implement entity queue in flowContext
  - Show current entity prominently (full card)
  - Add progress indicator "Entity X of Y"
  - _Requirements: 4.2, 4.3_

- [x] 8.1 Implement one-by-one actions

  - Show only: Inspect, Purge, Spare buttons
  - Remove any bulk action options
  - Advance to next entity after decision
  - _Requirements: 4.4, 4.5_

- [x] 8.2 Implement early exit with confirmation

  - Add "EXIT CONFRONTATION" button
  - Show confirmation dialog on exit attempt
  - Track partial progress for summary
  - _Requirements: 4.6_

- [x] 9. Update ConfrontationSummaryScreen

  - Display entities purged vs spared
  - Show space recovered
  - Handle partial completion (early exit)
  - Ensure return to HQ works
  - _Requirements: 4.7_

- [x] 10. Checkpoint - Verify Confrontation flow

  - Test one-by-one entity presentation
  - Verify queue advances correctly
  - Test early exit with confirmation
  - Confirm full flow: Preview → Loop → Summary → HQ

- [x] 11. Fix GuidedActiveScreen layout

  - Implement pagination for entity grid (max 6 visible)
  - Add page navigation if more than 6 entities
  - Remove overflow-y-auto
  - _Requirements: 7.1, 7.2_

- [x] 11.1 Fix SwiftResultsScreen layout

  - Ensure category cards fit in viewport
  - Use compact layout for stats
  - Remove any scrolling
  - _Requirements: 7.1_

- [x] 11.2 Fix ConfrontationLoopScreen layout

  - Single entity should fit perfectly
  - Sidebar stats should be compact
  - No scrolling needed
  - _Requirements: 7.1_

- [x] 11.3 Audit all other screens

  - Check ExorcismStyleScreen
  - Check all Preview screens
  - Check all Summary screens
  - Remove any overflow: auto/scroll
  - _Requirements: 7.1_

- [x] 12. Checkpoint - Verify no scrollbars

  - Test all screens at 1024x768 minimum
  - Verify content fits without scrolling
  - Test responsive scaling

- [x] 13. Update useKeyboardControls for all states

  - HQ → Start (with confirmation)
  - Guided Preview → HQ
  - Guided Active → Preview (with confirmation if in progress)
  - Guided Summary → HQ
  - Swift Location → HQ
  - Swift Results → Location (with confirmation if selections)
  - Swift Summary → HQ
  - Confrontation Preview → HQ
  - Confrontation Loop → Preview (with confirmation always)
  - Confrontation Summary → HQ
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 13.1 Add confirmation dialogs

  - Create reusable ConfirmDialog component
  - Use for: exit during active encounter, exit with selections
  - Style with cyber-horror theme
  - _Requirements: 6.2_

- [x] 13.2 Add visible back buttons/hints

  - Ensure every screen has ESC hint or back button
  - Consistent positioning (bottom or top-left)
  - _Requirements: 6.4_

- [x] 14. Checkpoint - Verify navigation

  - Test ESC in every state
  - Verify no dead ends exist
  - Test confirmation dialogs appear correctly

- [x] 15. Check mode selection character images

  - Verify Guided Ritual character exists
  - Verify Swift Purge character exists
  - Verify Confrontation character exists
  - Add placeholders if missing with "PLACEHOLDER USED" log
  - _Requirements: 8.1, 8.2_

- [x] 15.1 Check hover animations

  - Verify animation starts and ends on static pose
  - If missing, use static image only
  - _Requirements: 8.3_

- [x] 16. Ensure consistent styling

  - Verify cyber-horror theme across all new screens
  - Check button styling matches weapon-trigger style
  - Verify font usage (Creepster headers, tech body)
  - _Requirements: 10.2_

- [x] 16.1 Remove any unfinished elements

  - Remove placeholder text
  - Remove TODO comments in UI
  - Simplify anything that feels gimmicky
  - _Requirements: 10.5_

- [x] 17. Test Swift Purge graveyard

  - Verify files are MOVED not deleted
  - Check graveyard folder structure
  - Verify log entries are created
  - _Requirements: 5.1, 5.2_

- [x] 17.1 Test Confrontation graveyard

  - Verify files are MOVED not deleted
  - Check log entries include mode
  - _Requirements: 5.1, 5.2_

- [x] 17.2 Test undo functionality

  - Verify undo restores file to original location
  - Check graveyard view shows purged files
  - _Requirements: 5.3, 5.4_

- [x] 17.3 Verify Guided Ritual graveyard is simulated

  - Confirm NO real files are moved
  - Verify simulated graveyard state in memory
  - _Requirements: 5.5_

- [x] 18. Test Guided Ritual complete flow

  - Start → HQ → Guided Preview → Active → Summary → HQ
  - Verify NO real file operations
  - Verify all 7 entities can be processed
  - _Requirements: 2.1-2.7_

- [x] 18.1 Test Swift Purge complete flow

  - Start → HQ → Location → Results → Summary → HQ
  - Test with real files in allowed folder
  - Verify bulk purge works
  - Verify files in graveyard
  - _Requirements: 3.1-3.7_

- [x] 18.2 Test Confrontation complete flow

  - Start → HQ → Preview → Loop → Summary → HQ
  - Test one-by-one entity processing
  - Test early exit
  - Verify files in graveyard
  - _Requirements: 4.1-4.7_

- [x] 18.3 Test navigation edge cases

  - ESC from every screen
  - Back button from every screen
  - Rapid state changes
  - _Requirements: 6.1-6.5_

- [x] 19. Verify 10-second understanding

  - App purpose is clear immediately
  - Mode differences are obvious
  - _Requirements: 10.1_

- [x] 19.1 Verify modes feel distinct

  - Guided Ritual: slow, cinematic, safe
  - Swift Purge: fast, bulk, efficient
  - Confrontation: intense, one-by-one, risky feel
  - _Requirements: 10.2_

- [x] 19.2 Verify safety perception

  - Real file modes feel safe
  - Graveyard is clearly explained
  - Undo is available
  - _Requirements: 10.3_

- [x] 19.3 Verify completeness

  - No loose ends
  - No placeholder text visible
  - No broken features
  - _Requirements: 10.4_

- [x] 20. Final Checkpoint - Kiroween Ready

  - Ensure all tests pass, ask the user if questions arise.
  - Present final status report
  - Confirm application is DONE
