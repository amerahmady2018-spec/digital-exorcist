# Implementation Plan

- [x] 1. Configure frameless window with glassmorphism


- [x] 1.1 Update Electron main window configuration


  - Set frame: false and transparent: true in BrowserWindow options
  - Add platform-specific vibrancy/backgroundMaterial settings
  - Implement platform detection for macOS, Windows, Linux
  - _Requirements: 1.1, 1.5_

- [x] 1.2 Write property test for platform-specific configuration


  - **Property 3: Platform-specific window configuration**
  - **Validates: Requirements 1.5**

- [x] 1.3 Create GlassmorphicContainer component


  - Implement backdrop-filter blur with CSS
  - Add fallback for unsupported browsers
  - Configure opacity for desktop wallpaper bleed-through
  - Apply Tailwind utilities for glassmorphism
  - _Requirements: 1.2, 1.3_

- [x] 1.4 Write property test for glassmorphism styling


  - **Property 1: Glassmorphism styling consistency**
  - **Validates: Requirements 1.2**

- [x] 1.5 Write property test for transparency opacity

  - **Property 2: Transparency opacity bounds**
  - **Validates: Requirements 1.3**

- [x] 2. Build custom titlebar with window controls



- [x] 2.1 Create CustomTitlebar component with forwardRef

  - Implement draggable region with -webkit-app-region: drag
  - Add traffic light buttons (Close, Minimize, Maximize)
  - Style to blend with HUD aesthetic
  - _Requirements: 2.1, 2.2, 2.7_

- [x] 2.2 Implement window control IPC handlers

  - Create IPC handlers for minimize, maximize, close
  - Add maximize state toggle logic
  - Handle window control errors gracefully
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 2.3 Write property test for maximize toggle


  - **Property 4: Maximize button state toggling**
  - **Validates: Requirements 2.5**

- [x] 3. Implement application state machine



- [x] 3.1 Set up state management with Zustand

  - Define AppState enum (INTRO, MISSION_SELECT, HUD, BATTLE_ARENA)
  - Create StateContext interface
  - Implement transition function with validation
  - Define allowed transitions array
  - _Requirements: 14.1, 14.2_

- [x] 3.2 Write property test for state transition validity


  - **Property 26: State machine transition validity**
  - **Validates: Requirements 14.2**

- [x] 3.3 Add transition animations


  - Implement fade, zoom, and slide animations
  - Trigger animations on state changes
  - Use Framer Motion for smooth transitions
  - _Requirements: 14.5_

- [x] 3.4 Write property test for animation triggering

  - **Property 27: State transition animation triggering**
  - **Validates: Requirements 14.5**

- [x] 4. Build title screen (INTRO state)



- [x] 4.1 Create TitleScreen component with forwardRef


  - Implement animated glitch logo effect
  - Add "INITIALIZE SYSTEM" button
  - Create cinematic entrance animation with Framer Motion
  - Wire button to transition to MISSION_SELECT
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Build mission select interface (MISSION_SELECT state)







- [x] 5.1 Create MissionSelect component with forwardRef










  - Design high-tech targeting map interface
  - Style directory picker as tactical objective selector
  - Implement radar sweep animation on scan start
  - Display scanning progress with HUD elements
  - Transition to HUD state on scan complete
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
-

- [x] 6. Build enhanced HUD with entity cards (HUD state)




- [x] 6.1 Create EnhancedHUD component with forwardRef


  - Implement vertical scrollable layout for entity cards
  - Add summary statistics with tactical styling
  - Handle smooth transitions when files are removed
  - _Requirements: 5.5_


- [x] 6.2 Create EntityCard component with forwardRef

  - Display large 3D monster image breaking frame boundaries
  - Implement glowing health bar representing file size
  - Show file metadata as tactical intel
  - Add hover effects with scale and glow
  - Wire click to transition to BATTLE_ARENA
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1_

- [x] 6.3 Write property test for entity card rendering


  - **Property 5: Entity card rendering completeness**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 6.4 Write property test for health bar correlation


  - **Property 6: Health bar file size correlation**
  - **Validates: Requirements 5.3**

- [x] 6.5 Write property test for battle arena transition


  - **Property 7: Battle Arena state transition**
  - **Validates: Requirements 6.1**

- [x] 7. Integrate Google Gemini AI for file intelligence


- [x] 7.1 Set up Gemini API client in main process


  - Install @google/generative-ai package
  - Initialize API client with environment variable key
  - Implement error handling for API failures
  - _Requirements: 15.1, 15.3_


- [x] 7.2 Create GeminiInspector class
  - Implement buildPrompt function with file metadata
  - Create inspectFile function calling Gemini API
  - Parse and format API responses
  - Handle rate limiting with retry logic
  - Implement fallback content for errors
  - _Requirements: 7.2, 15.2, 15.4, 15.5_

- [x] 7.3 Write property test for prompt completeness


  - **Property 8: Gemini API prompt completeness**
  - **Validates: Requirements 7.2, 15.2**

- [x] 7.4 Write property test for response parsing


  - **Property 28: Gemini response parsing**
  - **Validates: Requirements 15.4**


- [x] 7.5 Create inspectFileAgent IPC handler
  - Wire IPC handler to GeminiInspector
  - Return analysis to renderer process
  - Handle errors and propagate to renderer
  - _Requirements: 7.1_
-


- [x] 8. Build battle arena interface (BATTLE_ARENA state)





- [x] 8.1 Create BattleArena component with forwardRef


  - Implement full-screen 1v1 combat layout
  - Display monster prominently with health bar
  - Add combat UI elements
  - Auto-trigger file inspection on mount
  - _Requirements: 6.3, 6.4, 6.5, 7.1_


- [x] 8.2 Create AIIntelPanel component with forwardRef




  - Display "DECIPHERING SOUL SIGNATURE..." loading animation
  - Implement typewriter effect for AI analysis
  - Show fallback message on error
  - Style as hacking terminal
  - _Requirements: 7.3, 7.4, 7.5_






- [x] 8.3 Create CombatActions component with forwardRef







  - Add three action buttons: DATA SMASH, PURGE RITUAL, FLEE
  - Show keyboard hints on buttons
  - Disable buttons during action execution
  - Wire DATA SMASH and PURGE RITUAL to banish operation
  - Wire FLEE to return to HUD state
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8.4 Write property test for button disabling


  - **Property 9: Combat action button disabling**
  - **Validates: Requirements 8.5**
-







- [x] 9. Implement screen shake visual feedback





- [x] 9.1 Create useScreenShake hook


  - Apply CSS transform offsets for shake effect
  - Implement randomized directional offsets
  - Reset transform to identity after completion
  - Scale intensity based on damage amount
  - Queue multiple shakes to prevent overlaps
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 9.2 Write property test for transform application

  - **Property 10: Screen shake transform application**
  - **Validates: Requirements 9.1**


- [x] 9.3 Write property test for shake randomization
  - **Property 11: Screen shake randomization**
  - **Validates: Requirements 9.2**


- [x] 9.4 Write property test for shake reset
  - **Property 12: Screen shake reset**
  - **Validates: Requirements 9.3**


- [x] 9.5 Write property test for intensity scaling

  - **Property 13: Screen shake intensity scaling**
  - **Validates: Requirements 9.4**


- [x] 9.6 Write property test for shake queueing
  - **Property 14: Screen shake queueing**
  - **Validates: Requirements 9.5**
-

- [x] 10. Implement floating damage numbers




-

- [x] 10.1 Create DamageNumber component with forwardRef



  - Display file size reduction in gold text format "-{amount} MB"
  - Animate upward movement with fade-out
  - Auto-remove from DOM after animation
  - Stagger multiple damage numbers
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [x] 10.2 Write property test for damage number spawning






  - **Property 15: Damage number spawning**
  - **Validates: Requirements 10.1**



- [x] 10.3 Write property test for damage number formatting





  - **Property 16: Damage number formatting**
  - **Validates: Requirements 10.2**

-

- [x] 10.4 Write property test for damage number cleanup





  - **Property 17: Damage number cleanup**
  - **Validates: Requirements 10.4**
-



- [x] 10.5 Write property test for damage number staggering






  - **Property 18: Damage number staggering**
  - **Validates: Requirements 10.5**
-

- [x] 11. Implement particle dissolution effects







-

- [x] 11.1 Create ParticleEffect component with forwardRef






  - Implement dissolution effect using Framer Motion layoutId
  - Use digital particle aesthetics
  - Trigger on successful banishment
  - Transition to HUD state on completion
  - Remove banished file from entity list
  - _Requirements: 11.1, 11.2, 11.3, 11.4_
-

-

- [x] 11.2 Write property test for file removal from HUD









  - **Property 19: Banished file removal from HUD**
  - **Validates: Requirements 11.4**
- [x] 12. Implement comprehensive keyboard controls




- [ ] 12. Implement comprehensive keyboard controls


- [x] 12.1 Create useKeyboardControls hook




  - Register SPACE for primary attack in Battle Arena
  - Register ENTER for confirmation in dialogs
  - Register ESC for flee/cancel in all states
  - Prevent default browser behaviors
  - Filter shortcuts by current app state
  - _Requirements: 12.1, 12.2, 12.3, 12.5_


- [x] 12.2 Add keyboard hints to UI elements



  - Display "[SPACE] SMASH" on attack button
  - Show keyboard hints on all action buttons
  - Style hints to be visible but not distracting
  - _Requirements: 12.4_


- [x] 12.3 Write property test for ENTER confirmation



  - **Property 20: ENTER key confirmation**

  - **Validates: Requirements 12.2**


- [ ] 12.4 Write property test for ESC cancellation



  - **Property 21: ESC key cancellation**
  - **Validates: Requirements 12.3**


- [ ] 12.5 Write property test for keyboard hints



  - **Property 22: Keyboard hint dis
play**
  - **Validates: Requirements 12.4**



- [ ] 12.6 Write property test for default prevention



  - **Property 23: Keyboard event default prevention**
  - **Validates: Requirements 12.5**
-

- [x] 13. Implement undo spell toast system






- [x] 13.1 Create UndoManager class in main process

  - Implement undo entry queue with expiration
  - Add addEntry function with 5-second expiration
  - Create executeUndo function for restoration
  - Implement cleanExpired function running every second
  - _Requirements: 13.1, 13.2_












- [x] 13.2 Create undoBanish IPC handler


  - Wire handler to UndoManager.executeUndo
  - Handle expired entries gracefully
  - Return restoration result to renderer












  - _Requirements: 13.3_


- [x] 13.3 Create UndoToast component with forwardRef




  - Display prominent "UNDO SPELL" button
  - Show countdown timer visualization
  - Auto-dismiss after 5 seconds with fade-out
  - Wire button to undoBanish IPC call
  - Update HUD on successful undo
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_


- [x] 13.4 Write property test for toast display


  - **Property 24: Undo toast display**



  - **Validates: Requirements 13.1**


- [x] 13.5 Write property test for toast timing






  - **Property 25: Undo toast auto-dismiss timing**
  - **Validates: Requirements 13.2**
-

- [x] 14. Build Spirit Guide MCP server












- [x] 14.1 Create MCP server project structure




  - Initialize spirit-guide-mcp package
  - Install @modelcontextprotocol/sdk
  - Set up server with stdio transport
  - _Requirements: 16.1_



- [x] 14.2 Implement get_exorcist_stats tool


  - Define tool schema for statistics queries
  - Create getStatistics function reading app data
  - Implement formatSpiritGuideResponse with thematic language
  - Calculate accurate counts by classification type

  - Calculate accurate size aggregations
  - _Requirements: 16.2, 16.3, 16.4, 16.5_


- [x] 14.3 Write property test for statistics accuracy


  - **Property 29: Spirit Guide statistics accuracy**
  - **Validates: Requirements 16.4**



- [x] 14.4 Write property test for size aggregation



  - **Property 30: Spirit Guide size aggregation accuracy**
  - **Validates: Requirements 16.5**

- [x] 14.5 Configure MCP server in Kiro

  - Add spirit-guide to .kiro/settings/mcp.json
  - Configure server command and args
  - Test server connection and tool calls




  - _Requirements: 16.1_


- [x] 15. Ensure all animated components use forwardRef


- [x] 15.1 Audit and update animated components
  - Wrap all animated components with React.forwardRef
  - Forward refs to underlying DOM elements
  - Ensure Framer Motion compatibility
  - Enable parent-child ref control
  - Add proper TypeScript types for props and refs
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 15.2 Write property test for forwardRef wrapping
  - **Property 31: ForwardRef component wrapping**
  - **Validates: Requirements 18.1**

- [x] 15.3 Write property test for ref forwarding
  - **Property 32: Ref forwarding to DOM elements**
  - **Validates: Requirements 18.2**

- [x] 15.4 Write property test for Framer Motion compatibility
  - **Property 33: Framer Motion ref compatibility**
  - **Validates: Requirements 18.3**

- [x] 15.5 Write property test for parent-child control
  - **Property 34: Parent-child ref control**
  - **Validates: Requirements 18.4**

- [x] 15.6 Write property test for TypeScript typing
  - **Property 35: ForwardRef TypeScript typing**
  - **Validates: Requirements 18.5**


- [x] 16. Implement juicy visual feedback system


- [x] 16.1 Create visual feedback coordinator
  - Trigger immediate feedback on all user actions
  - Combine multiple effect types (shake, particles, lighting, color)
  - Synchronize effect timing within 50ms
  - Monitor and maintain 60fps performance
  - _Requirements: 19.1, 19.2, 19.4, 19.5_

- [x] 16.2 Write property test for immediate feedback
  - **Property 36: User action visual feedback**
  - **Validates: Requirements 19.1**

- [x] 16.3 Write property test for layered effects
  - **Property 37: Layered visual effects**
  - **Validates: Requirements 19.2**

- [x] 16.4 Write property test for frame rate
  - **Property 38: Animation frame rate**
  - **Validates: Requirements 19.4**

- [x] 16.5 Write property test for effect synchronization
  - **Property 39: Effect timing synchronization**
  - **Validates: Requirements 19.5**

- [x] 16.6 Optimize performance for smooth animations
  - Implement virtual scrolling for entity card lists
  - Add effect throttling for rapid triggers
  - Lazy load heavy components (BattleArena, ParticleEffect)
  - Monitor memory usage and prevent leaks
  - _Requirements: 19.4_

- [x] 16.7 Write property test for interaction response time
  - **Property 40: Interaction response time**
  - **Validates: Requirements 20.3**



- [x] 17. Configure agent hooks for development

  - [x] 17.1 Create lint-on-save agent hook
    - Configure hook to trigger on file save events
    - Set up ESLint execution command
    - Display linting errors in problems panel
    - Use project's ESLint configuration
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_


- [x] 18. Polish and integrate all features

  - [x] 18.1 Wire all components into state machine flow
    - Connect TitleScreen to INTRO state
    - Connect MissionSelect to MISSION_SELECT state
    - Connect EnhancedHUD to HUD state
    - Connect BattleArena to BATTLE_ARENA state
    - Verify all transitions work smoothly
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 18.2 Integrate visual effects into combat flow
    - Trigger screen shake on combat actions
    - Spawn damage numbers on file size changes
    - Play particle dissolution on victory
    - Coordinate all effects for maximum impact
    - _Requirements: 19.1, 19.2_

  - [x] 18.3 Test complete user journey
    - Verify INTRO -> MISSION_SELECT -> HUD -> BATTLE_ARENA flow
    - Test file banishment with all visual effects
    - Verify undo toast appears and works correctly
    - Test keyboard controls in all states
    - Ensure AI intel displays correctly
    - _Requirements: All_


- [x] 19. Final checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
