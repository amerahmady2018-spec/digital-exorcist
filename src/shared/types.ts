// Shared types between main and renderer processes

// Using string literal union for easier comparison with string values
export type MonsterType = 'ghost' | 'demon' | 'zombie';

// Constants for use as values (backwards compatible with enum usage)
export const MonsterType = {
  Ghost: 'ghost' as const,
  Demon: 'demon' as const,
  Zombie: 'zombie' as const
};

export interface FileScanResult {
  path: string;
  size: number;
  lastModified: Date;
  hash?: string;
}

export interface ClassifiedFile extends FileScanResult {
  classifications: MonsterType[];
  duplicateGroup?: string;
}

export enum ActionType {
  Banish = 'banish',
  Resurrect = 'resurrect',
  Restore = 'restore'
}

export interface LogEntry {
  timestamp: string;
  action: ActionType;
  filePath: string;
  originalPath?: string;
  graveyardPath?: string;
  classifications?: MonsterType[];
  fileSize?: number;
}

export interface ScanProgress {
  filesScanned: number;
  currentPath: string;
}

export interface BanishResult {
  success: boolean;
  graveyardPath: string;
  error?: string;
  /** Undo entry ID for the undo spell toast */
  undoId?: string;
  /** When the undo entry expires (ISO string) */
  undoExpiresAt?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredPath: string;
  error?: string;
}

// File inspection types for Gemini AI integration
export interface FileInspectionRequest {
  path: string;
  size: number;
  lastModified: Date | string;
  classifications: MonsterType[];
}

export interface FileInspectionResponse {
  analysis: string;
  threat_level: 'low' | 'medium' | 'high';
  recommendations: string[];
  error?: string;
}

// Undo entry for the undo spell toast system
export interface UndoEntryInfo {
  /** Unique identifier for the undo entry */
  id: string;
  /** Original file path before banishment */
  filePath: string;
  /** Path where the file was moved in the graveyard */
  graveyardPath: string;
  /** When this undo entry expires (ISO string) */
  expiresAt: string;
  /** File size in bytes (for display purposes) */
  fileSize?: number;
  /** File name (for display purposes) */
  fileName?: string;
}

// Result of an undo operation
export interface UndoResult {
  success: boolean;
  restoredPath?: string;
  error?: string;
}

// Swift Purge Types - Tool Mode
export interface SwiftPurgeFileEntry {
  path: string;
  fileName: string;
  size: number;
  lastModified: Date;
  hash?: string;
  classification: 'ghost' | 'zombie' | 'demon';
  duplicateOf?: string; // For zombies, the path of the "primary" file
}

export interface SwiftPurgeScanResult {
  sessionId: string;
  targetPath: string;
  files: SwiftPurgeFileEntry[];
  totalFilesScanned: number;
  totalBytes: number;
  limitReached: boolean;
  counts: {
    ghosts: number;
    zombies: number;
    demons: number;
  };
}

export interface SwiftPurgeExecuteResult {
  success: boolean;
  sessionId: string;
  purgedCount: number;
  bytesFreed: number;
  errors: Array<{ path: string; error: string }>;
  undoSessionId?: string;
  undoExpiresAt?: string;
}

export interface SwiftPurgeScanProgress {
  filesScanned: number;
  currentPath: string;
  phase: 'scanning' | 'hashing' | 'classifying' | 'executing';
}

// IPC Channel names
export const IPC_CHANNELS = {
  SELECT_DIRECTORY: 'select-directory',
  START_SCAN: 'start-scan',
  CANCEL_SCAN: 'cancel-scan',
  SCAN_PROGRESS: 'scan-progress',
  SCAN_COMPLETE: 'scan-complete',
  CLASSIFY_FILES: 'classify-files',
  BANISH_FILE: 'banish-file',
  RESURRECT_FILE: 'resurrect-file',
  RESTORE_FILE: 'restore-file',
  GET_LOG_ENTRIES: 'get-log-entries',
  GET_WHITELIST: 'get-whitelist',
  REMOVE_FROM_WHITELIST: 'remove-from-whitelist',
  GET_GRAVEYARD_FILES: 'get-graveyard-files',
  INSPECT_FILE_AGENT: 'inspect-file-agent',
  UNDO_BANISH: 'undo-banish',
  // Swift Purge Tool Mode channels
  SWIFT_PURGE_SCAN: 'swift-purge-scan',
  SWIFT_PURGE_EXECUTE: 'swift-purge-execute',
  SWIFT_PURGE_PROGRESS: 'swift-purge-progress',
  SWIFT_PURGE_UNDO: 'swift-purge-undo',
  ERROR: 'error'
} as const;
