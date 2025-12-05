# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Initialize Electron + React + Vite project with TypeScript
  - Install dependencies: Tailwind CSS, Framer Motion, fast-check for property testing
  - Configure Tailwind for dark mode theme
  - Set up basic Electron main and renderer process structure
  - Configure IPC communication layer
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 2. Implement core data models and types





  - Create shared TypeScript interfaces for FileScanResult, ClassifiedFile, MonsterType enum
  - Define LogEntry, ActionType, and GraveyardLog interfaces
  - Create types for IPC communication messages
  - _Requirements: 10.4_

- [x] 3. Implement file scanning functionality






- [x] 3.1 Create FileScanner class in main process


  - Implement recursive directory traversal
  - Collect file metadata (path, size, lastModified)
  - Handle inaccessible files gracefully with error logging
  - Emit progress events during scanning
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 3.2 Write property test for recursive traversal completeness


  - **Property 2: Recursive traversal completeness**
  - **Validates: Requirements 2.1, 2.4**

- [x] 3.3 Write property test for metadata collection


  - **Property 3: Metadata collection completeness**
  - **Validates: Requirements 2.2**

- [x] 3.4 Write property test for error resilience




  - **Property 4: Error resilience during scanning**
  - **Validates: Requirements 2.3**

- [x] 4. Implement file classification system





- [x] 4.1 Create FileClassifier class


  - Implement Ghost classification (files older than 6 months)
  - Implement Demon classification (files larger than 500MB)
  - Implement Zombie classification with content-based hashing
  - Support multiple classifications per file
  - Integrate whitelist filtering
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.2 Implement file hashing for duplicate detection





  - Create hash computation function using Node.js crypto (SHA-256)
  - Implement streaming hash for large files
  - Group files by hash for duplicate detection
  - _Requirements: 11.1, 11.2_

- [x] 4.3 Write property test for Ghost classification


  - **Property 5: Ghost classification by age**
  - **Validates: Requirements 3.1**

- [x] 4.4 Write property test for Demon classification

  - **Property 6: Demon classification by size**
  - **Validates: Requirements 3.2**

- [x] 4.5 Write property test for Zombie classification

  - **Property 7: Zombie classification by content**
  - **Validates: Requirements 3.3, 11.1, 11.2**

- [x] 4.6 Write property test for multiple classifications

  - **Property 8: Multiple classification accumulation**
  - **Validates: Requirements 3.4**

- [x] 4.7 Write property test for whitelist exclusion

  - **Property 9: Whitelist exclusion**
  - **Validates: Requirements 3.5, 6.4**

- [x] 5. Implement persistent storage system




- [x] 5.1 Create GraveyardLog class


  - Implement log file creation and initialization
  - Implement append entry functionality with JSON serialization
  - Implement log reading and parsing
  - Handle corrupted log file recovery
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 5.2 Create Whitelist manager


  - Implement whitelist file persistence (JSON)
  - Implement add/remove operations
  - Implement whitelist loading on startup
  - _Requirements: 6.1, 6.4_

- [x] 5.3 Write property test for log entry completeness


  - **Property 14: File operation logging completeness**
  - **Validates: Requirements 5.3, 6.2, 7.1, 7.2, 8.4**

- [x] 5.4 Write property test for log recovery

  - **Property 21: Log recovery from corruption**
  - **Validates: Requirements 7.5**

- [x] 6. Implement file operations












- [x] 6.1 Create FileOperations class


  - Implement banishFile: move file to graveyard_trash preserving directory structure
  - Implement restoreFile: move file from graveyard back to original location
  - Implement conflict detection for restore operations
  - Add safety checks and validation
  - _Requirements: 5.2, 8.2, 8.3, 8.5_

- [x] 6.2 Integrate file operations with logging




  - Log all banish operations
  - Log all resurrect operations
  - Log all restore operations
  - _Requirements: 5.3, 6.2, 8.4_

- [x] 6.3 Write property test for directory structure preservation


  - **Property 13: Banish preserves directory structure**
  - **Validates: Requirements 5.2**

- [x] 6.4 Write property test for banish-restore round trip







  - **Property 23: Banish-restore round trip**
  - **Validates: Requirements 8.2**

- [x] 6.5 Write property test for restore conflict detection




  - **Property 24: Restore conflict detection**
  - **Validates: Requirements 8.3, 8.5**

-

- [x] 7. Implement IPC communication layer










- [x] 7.1 Create IPC handlers in main process




  - Handler for directory selection
  - Handler for scan initiation
  - Handler for file classification
  - Handler for banish/resurrect/restore operations
  - Handler for log and whitelist queries
  - _Requirements: 10.2_


-

- [x] 7.2 Create IPC bridge in preload script





  - Expose safe IPC methods to renderer
  - Type-safe communication interfaces
  - Error handling and propagation
  - _Requirements: 10.2, 10.5_


- [x] 7.3 Write property test for IPC error propagation

  - **Property 25: IPC error propagation**
  - **Validates: Requirements 10.5**




-

- [x] 8. Checkpoint - Ensure all tests pass












  - Ensure all tests pass, ask the user if questions arise.
-

- [x] 9. Build directory selector UI component








- [x] 9.1 Create DirectorySelector React component

  - Button to trigger directory picker dialog
  - Display selected directory path
  - Trigger scan on selection
  - Apply dark theme styling with Tailwind
  - _Requirements: 1.1, 1.4, 9.1_


- [x] 9.2 Implement directory validation UI

  - Display validation errors for invalid directories
  - Show loading state during validation
  - _Requirements: 1.2, 1.3_

- [x] 9.3 Write property test for directory validation

  - **Property 1: Directory validation correctness**
  - **Validates: Requirements 1.2**

-

-

- [x] 10. Build scan progress UI component






- [x] 10.1 Create ScanProgress React component


  - Progress bar with percentage
  - Display current file count
  - Display current path being scanned
  - Cancel scan button
  - Apply dark theme styling
  - _Requirements: 2.4, 2.5, 9.1_

- [x] 11. Build exorcism dashboard UI



- [x] 11.1 Create ExorcismDashboard React component


  - Tabbed interface for Ghosts, Demons, Zombies
  - Summary statistics (count, total size per type)
  - Filter and sort controls
  - Apply dark theme with spooky aesthetic
  - _Requirements: 4.1, 4.3, 4.4, 4.5, 9.1, 9.2_

- [x] 11.2 Create MonsterCard component


  - Display file path, size, last modified date
  - Display classification badges
  - Banish button with confirmation dialog
  - Resurrect button
  - Integrate Framer Motion for animations
  - _Requirements: 4.2, 5.1, 5.4, 9.1, 9.3_

- [x] 11.3 Write property test for display information completeness


  - **Property 10: Display information completeness**
  - **Validates: Requirements 4.2**

- [x] 11.4 Write property test for classification grouping

  - **Property 11: Classification grouping correctness**
  - **Validates: Requirements 4.3**

- [x] 11.5 Write property test for aggregation accuracy

  - **Property 12: Aggregation accuracy**
  - **Validates: Requirements 4.4**
- [x] 12. Implement file operation UI interactions








- [ ] 12. Implement file operation UI interactions

- [x] 12.1 Implement banish functionality in UI

  - Connect banish button to IPC handler
  - Show confirmation dialog
  - Trigger Framer Motion animation on banish
  - Remove file from display after banish
  - Handle errors and display messages
  - _Requirements: 5.1, 5.4, 5.5_


- [x] 12.2 Implement resurrect functionality in UI

  - Connect resurrect button to IPC handler
  - Remove file from display after resurrect
  - Update whitelist display
  - Handle errors and display messages
  - _Requirements: 6.1, 6.3_


- [x] 12.3 Write property test for banish removes from display

  - **Property 15: Banish removes from display**
  - **Validates: Requirements 5.5**


- [x] 12.4 Write property test for resurrect adds to whitelist

  - **Property 16: Resurrect adds to whitelist**
  - **Validates: Requirements 6.1**


- [x] 12.5 Write property test for resurrect removes from display

  - **Property 17: Resurrect removes from display**
  - **Validates: Requirements 6.3**
-

- [x] 13. Build graveyard view UI






- [x] 13.1 Create GraveyardView React component


  - List all banished files with original paths
  - Restore button for each file
  - Search and filter functionality
  - Apply dark theme styling
  - _Requirements: 8.1, 9.1_

- [x] 13.2 Implement restore functionality


  - Connect restore button to IPC handler
  - Handle restore conflicts with user prompts
  - Show success/error messages
  - Update graveyard display after restore
  - _Requirements: 8.2, 8.3, 8.5_

- [x] 13.3 Write property test for graveyard display completeness


  - **Property 22: Graveyard display completeness**
  - **Validates: Requirements 8.1**

- [x] 14. Build history log UI






-
- [x] 14.1 Create HistoryLog React component


- [x] 14.1 Create HistoryLog React component



  - Display log entries in reverse chronological order
  - Show timestamp, action, file path for each entry
  - Filter by action type and date range
  - Apply dark theme styling
  - _Requirements: 7.3, 7.4, 9.1_

- [x] 14.2 Write property test for log chronological ordering


  - **Property 19: Log chronological ordering**
  - **Validates: Requirements 7.3**

- [x] 14.3 Write property test for log filtering


  - **Property 20: Log filtering correctness**
  - **Validates: Requirements 7.4**
-
-

- [x] 15. Build whitelist manager UI





- [x] 15.1 Create WhitelistManager React component


  - Display all whitelisted files
  - Remove from whitelist button
  - Apply dark theme styling
  - _Requirements: 6.5, 9.1_

- [x] 15.2 Write property test for whitelist display


  - **Property 18: Whitelist display completeness**
  - **Validates: Requirements 6.5**
-

- [x] 16. Implement duplicate file grouping UI






- [x] 16.1 Enhance MonsterCard for duplicate sets


  - Group duplicate files together visually
  - Show all instances of duplicates
  - Allow independent actions on each duplicate
  - _Requirements: 11.3, 11.4_

- [x] 16.2 Write property test for duplicate grouping


  - **Property 26: Duplicate grouping consistency**
  - **Validates: Requirements 11.3**

- [x] 16.3 Write property test for independent duplicate handling


  - **Property 27: Independent duplicate handling**
  - **Validates: Requirements 11.4**
-
- [x] 17. Polish UI theme and animations




- [ ] 17. Polish UI theme and animations



- [x] 17.1 Refine dark theme styling


  - Ensure consistent spooky color palette across all components
  - Add hover, active, and disabled states
  - Verify readability and usability
  - _Requirements: 9.1, 9.2, 9.4, 9.5_


- [x] 17.2 Add Framer Motion animations

  - Animate file banishment with fade/slide effects
  - Add smooth transitions between views
  - Animate list updates
  - _Requirements: 5.4, 9.3_
-

- [x] 18. Final checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.
