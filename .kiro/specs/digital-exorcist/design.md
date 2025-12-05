# Design Document

## Overview

The Digital Exorcist is an Electron-based desktop application that combines file management functionality with a supernatural-themed user experience. The application follows a clear separation between the Electron main process (file operations, system access) and the React renderer process (UI, user interactions), communicating through IPC bridges.

The core workflow consists of: directory selection → recursive scanning → file classification → user review and action → safe file operations with logging. All file deletions are non-destructive, moving files to a local graveyard folder with full restoration capabilities.

## Architecture

### Process Architecture

**Main Process (Electron/Node.js)**
- File system operations (scanning, moving, hashing)
- Directory traversal and metadata collection
- File operation safety checks
- Graveyard log management
- Whitelist persistence

**Renderer Process (React)**
- User interface components
- State management for scanned files and classifications
- Animation and visual feedback
- User interaction handling

**IPC Communication Layer**
- Bidirectional communication between main and renderer
- Event-based updates for scan progress
- Request/response pattern for file operations
- Error propagation and handling

### Technology Stack

- **Electron**: Desktop application framework
- **React**: UI library with hooks for state management
- **TypeScript**: Type-safe development
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first styling for dark theme
- **Framer Motion**: Animation library for file operations
- **Node.js crypto**: For file hashing (duplicate detection)
- **Node.js fs/promises**: Async file system operations

## Components and Interfaces

### Main Process Components

**FileScanner**
```typescript
interface FileScanResult {
  path: string;
  size: number;
  lastModified: Date;
  hash?: string; // Computed lazily for duplicate detection
}

interface ScanProgress {
  filesScanned: number;
  currentPath: string;
}

class FileScanner {
  async scanDirectory(dirPath: string): Promise<FileScanResult[]>
  async computeHash(filePath: string): Promise<string>
}
```

**FileClassifier**
```typescript
enum MonsterType {
  Ghost = 'ghost',
  Demon = 'demon',
  Zombie = 'zombie'
}

interface ClassifiedFile extends FileScanResult {
  classifications: MonsterType[];
  duplicateGroup?: string; // Hash for grouping duplicates
}

class FileClassifier {
  classifyFiles(files: FileScanResult[], whitelist: Set<string>): ClassifiedFile[]
}
```

**FileOperations**
```typescript
interface BanishResult {
  success: boolean;
  graveyardPath: string;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  restoredPath: string;
  error?: string;
}

class FileOperations {
  async banishFile(filePath: string): Promise<BanishResult>
  async restoreFile(graveyardPath: string, originalPath: string): Promise<RestoreResult>
  async addToWhitelist(filePath: string): Promise<void>
  async removeFromWhitelist(filePath: string): Promise<void>
}
```

**GraveyardLog**
```typescript
enum ActionType {
  Banish = 'banish',
  Resurrect = 'resurrect',
  Restore = 'restore'
}

interface LogEntry {
  timestamp: string;
  action: ActionType;
  filePath: string;
  originalPath?: string;
  graveyardPath?: string;
  classifications?: MonsterType[];
  fileSize?: number;
}

class GraveyardLog {
  async appendEntry(entry: LogEntry): Promise<void>
  async getEntries(filter?: LogFilter): Promise<LogEntry[]>
  async ensureLogFile(): Promise<void>
}
```

### Renderer Process Components

**DirectorySelector**
- Displays button to open directory picker
- Shows selected directory path
- Triggers scan initiation

**ScanProgress**
- Real-time progress bar
- Current file count
- Current path being scanned
- Cancel scan option

**ExorcismDashboard**
- Main interface after classification
- Tabbed or sectioned view for Ghosts, Demons, Zombies
- Summary statistics (count, total size per type)
- Filter and sort controls

**MonsterCard**
- Individual file display component
- Shows file path, size, last modified, classifications
- Banish and Resurrect action buttons
- Visual indicators for monster type

**GraveyardView**
- List of banished files
- Restore functionality
- Search and filter capabilities

**HistoryLog**
- Chronological list of all operations
- Filter by action type and date
- Export functionality

**WhitelistManager**
- List of resurrected files
- Remove from whitelist option

## Data Models

### File System Structure

```
project-root/
├── graveyard_trash/          # Banished files (preserves directory structure)
│   └── [original-path]/      # Mirrors original directory structure
├── .digital-exorcist/        # Application data
│   ├── graveyard-log.json   # Operation history
│   └── whitelist.json       # Resurrected files
```

### Persistent Data Formats

**graveyard-log.json**
```json
{
  "entries": [
    {
      "timestamp": "2025-12-01T10:30:00.000Z",
      "action": "banish",
      "filePath": "/original/path/to/file.txt",
      "graveyardPath": "./graveyard_trash/original/path/to/file.txt",
      "classifications": ["ghost"],
      "fileSize": 1024
    }
  ]
}
```

**whitelist.json**
```json
{
  "files": [
    "/path/to/important/file.txt",
    "/path/to/another/file.pdf"
  ]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Directory validation correctness
*For any* directory path, the validation function should return true if and only if the directory exists and is accessible on the file system.
**Validates: Requirements 1.2**

### Property 2: Recursive traversal completeness
*For any* directory structure, the scanner should discover all files in all subdirectories, with the count of discovered files equal to the actual number of files present.
**Validates: Requirements 2.1, 2.4**

### Property 3: Metadata collection completeness
*For any* scanned file, the result should include path, size, and last modified date with all fields populated with valid values.
**Validates: Requirements 2.2**

### Property 4: Error resilience during scanning
*For any* directory containing inaccessible files, the scanner should continue scanning and return results for all accessible files.
**Validates: Requirements 2.3**

### Property 5: Ghost classification by age
*For any* file with last modified date more than 6 months ago, if not whitelisted, it should be classified as a Ghost.
**Validates: Requirements 3.1**

### Property 6: Demon classification by size
*For any* file with size exceeding 500MB, if not whitelisted, it should be classified as a Demon.
**Validates: Requirements 3.2**

### Property 7: Zombie classification by content
*For any* two files with identical content hashes, if not whitelisted, both should be classified as Zombies and grouped together.
**Validates: Requirements 3.3, 11.1, 11.2**

### Property 8: Multiple classification accumulation
*For any* file meeting multiple classification criteria (e.g., old AND large), all applicable classifications should be assigned to that file.
**Validates: Requirements 3.4**

### Property 9: Whitelist exclusion
*For any* file on the whitelist, it should be excluded from all classifications regardless of its age, size, or content.
**Validates: Requirements 3.5, 6.4**

### Property 10: Display information completeness
*For any* classified file displayed in the interface, the display should include file path, size, last modified date, and all classification types.
**Validates: Requirements 4.2**

### Property 11: Classification grouping correctness
*For any* set of classified files, when grouped by classification type, each file should appear in the group corresponding to each of its classifications.
**Validates: Requirements 4.3**

### Property 12: Aggregation accuracy
*For any* classification type, the displayed count and total size should equal the sum of individual file counts and sizes in that classification.
**Validates: Requirements 4.4**

### Property 13: Banish preserves directory structure
*For any* file path, when banished, the file should be moved to graveyard_trash with its original directory structure preserved relative to the scan root.
**Validates: Requirements 5.2**

### Property 14: File operation logging completeness
*For any* file operation (banish, resurrect, restore), a log entry should be created containing timestamp, action type, file path, and all relevant metadata.
**Validates: Requirements 5.3, 6.2, 7.1, 7.2, 8.4**

### Property 15: Banish removes from display
*For any* file in the exorcism interface, after banishing it, the file should no longer appear in the interface display.
**Validates: Requirements 5.5**

### Property 16: Resurrect adds to whitelist
*For any* file, when resurrected, it should be added to the whitelist and excluded from future classifications.
**Validates: Requirements 6.1**

### Property 17: Resurrect removes from display
*For any* file in the exorcism interface, after resurrecting it, the file should no longer appear in the interface display.
**Validates: Requirements 6.3**

### Property 18: Whitelist display completeness
*For any* file on the whitelist, it should appear in the whitelist view with its full path.
**Validates: Requirements 6.5**

### Property 19: Log chronological ordering
*For any* set of log entries, when displayed, they should be ordered by timestamp in reverse chronological order (newest first).
**Validates: Requirements 7.3**

### Property 20: Log filtering correctness
*For any* filter criteria (action type or date range), the filtered log should include all and only entries matching the criteria.
**Validates: Requirements 7.4**

### Property 21: Log recovery from corruption
*For any* corrupted or missing log file, the system should create a new valid empty log file that can accept new entries.
**Validates: Requirements 7.5**

### Property 22: Graveyard display completeness
*For any* banished file, it should appear in the graveyard view with its original path information.
**Validates: Requirements 8.1**

### Property 23: Banish-restore round trip
*For any* file, banishing it and then restoring it should return the file to its exact original location with identical content.
**Validates: Requirements 8.2**

### Property 24: Restore conflict detection
*For any* file restoration, if the original location is occupied, the system should detect the conflict and not overwrite the existing file.
**Validates: Requirements 8.3, 8.5**

### Property 25: IPC error propagation
*For any* IPC communication error, the error should be propagated to the renderer with a meaningful error message.
**Validates: Requirements 10.5**

### Property 26: Duplicate grouping consistency
*For any* set of files with identical content, they should all be grouped together in the same duplicate set.
**Validates: Requirements 11.3**

### Property 27: Independent duplicate handling
*For any* duplicate set, banishing one file should not affect the display or classification of other files in the set.
**Validates: Requirements 11.4**

## Error Handling

### File System Errors

**Inaccessible Files/Directories**
- Log error with file path and reason
- Continue scanning remaining files
- Display summary of inaccessible items after scan

**Permission Errors**
- Detect permission issues before operations
- Display clear error messages to user
- Suggest running with appropriate permissions

**Disk Space Issues**
- Check available space before banishing files
- Warn user if graveyard is consuming significant space
- Provide cleanup options

### Data Integrity Errors

**Corrupted Log File**
- Attempt to parse and recover valid entries
- Create new log file if recovery fails
- Backup corrupted file for user inspection

**Missing Whitelist**
- Create new empty whitelist
- Continue operation normally

**Hash Collision (extremely rare)**
- Log warning about potential collision
- Allow user to manually verify duplicates

### IPC Communication Errors

**Main Process Errors**
- Catch all errors in main process handlers
- Return structured error responses to renderer
- Log errors for debugging

**Renderer Process Errors**
- Display user-friendly error messages
- Provide retry options where appropriate
- Log errors to console for debugging

### User Operation Errors

**Restore Conflicts**
- Detect file already exists at original location
- Offer options: rename, choose new location, cancel
- Never overwrite without explicit confirmation

**Invalid Directory Selection**
- Validate directory exists and is accessible
- Display specific error (not found, no permission, etc.)
- Allow user to select different directory

## Testing Strategy

### Unit Testing

The application will use a standard unit testing framework (Vitest) for testing individual components and functions. Unit tests will focus on:

- **Specific examples**: Testing known scenarios with predictable outcomes
- **Edge cases**: Empty directories, single files, deeply nested structures
- **Error conditions**: Invalid paths, permission errors, corrupted data
- **Integration points**: IPC communication, file system operations

Unit tests provide concrete examples of correct behavior and catch specific bugs in implementation.

### Property-Based Testing

The application will use **fast-check** (TypeScript property-based testing library) for verifying universal properties. Property-based tests will:

- **Run minimum 100 iterations** per property to ensure thorough coverage
- **Generate random test data**: file paths, sizes, dates, directory structures
- **Verify properties hold across all inputs**: classification rules, file operations, data integrity
- **Tag each test with design property**: Using format `**Feature: digital-exorcist, Property {number}: {property_text}**`

Property-based tests verify general correctness and discover edge cases that manual test writing might miss.

**Example Property Test Structure:**
```typescript
// **Feature: digital-exorcist, Property 5: Ghost classification by age**
it('classifies files older than 6 months as ghosts', () => {
  fc.assert(
    fc.property(
      fc.record({
        path: fc.string(),
        size: fc.nat(),
        lastModified: fc.date({ max: sixMonthsAgo })
      }),
      (file) => {
        const classified = classifier.classifyFiles([file], new Set());
        expect(classified[0].classifications).toContain(MonsterType.Ghost);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Testing Approach

1. **Implementation First**: Implement features before writing tests
2. **Unit Tests**: Write unit tests for specific examples and edge cases
3. **Property Tests**: Write property-based tests for universal correctness properties
4. **Integration Tests**: Test IPC communication and end-to-end workflows
5. **Manual Testing**: UI/UX validation, animation smoothness, theme consistency

Each correctness property from this design document will be implemented as a single property-based test, explicitly tagged with the property number and text.

## Implementation Notes

### Performance Considerations

**File Hashing**
- Hash files lazily only when duplicate detection is needed
- Use streaming hash computation for large files
- Cache hashes to avoid recomputation

**Directory Scanning**
- Use async/await for non-blocking operations
- Emit progress events every N files (e.g., every 100)
- Allow scan cancellation

**UI Responsiveness**
- Virtualize large file lists (render only visible items)
- Debounce filter and sort operations
- Use React.memo for expensive components

### Security Considerations

**Path Traversal Prevention**
- Validate all file paths before operations
- Ensure graveyard paths stay within graveyard_trash
- Sanitize user input for file operations

**Safe File Operations**
- Never permanently delete files in development
- Always use graveyard_trash for "deletion"
- Verify file operations complete successfully

### Development vs Production

**Development Mode**
- All deletions go to graveyard_trash
- Verbose logging enabled
- Mock dangerous operations

**Production Mode**
- Still use graveyard_trash (never permanent deletion)
- User-friendly error messages
- Performance optimizations enabled
