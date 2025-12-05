import { contextBridge, ipcRenderer } from 'electron';
import { 
  IPC_CHANNELS, 
  type LogEntry, 
  type ClassifiedFile, 
  type FileScanResult,
  type BanishResult,
  type RestoreResult,
  type MonsterType,
  type FileInspectionRequest,
  type FileInspectionResponse,
  type UndoResult,
  type SwiftPurgeScanResult,
  type SwiftPurgeExecuteResult,
  type SwiftPurgeScanProgress
} from '../shared/types';

/**
 * IPC Bridge - Preload Script
 * 
 * This module creates a secure bridge between the Electron main process and the renderer process.
 * It exposes safe IPC methods to the renderer while maintaining security through contextIsolation.
 * 
 * All methods include proper error handling and type safety to ensure reliable communication.
 */

// Helper function to wrap IPC calls with error handling
async function safeInvoke<T>(channel: string, ...args: any[]): Promise<T> {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    // Propagate errors with meaningful messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown IPC error';
    throw new Error(`IPC Error [${channel}]: ${errorMessage}`);
  }
}

// Log to confirm preload script is running
console.log('Preload script loaded!');
console.log('contextBridge available:', !!contextBridge);
console.log('ipcRenderer available:', !!ipcRenderer);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls for custom titlebar
  windowMinimize: () => safeInvoke<{ success: boolean; error?: string }>('window:minimize'),
  windowMaximize: () => safeInvoke<{ success: boolean; isMaximized?: boolean; error?: string }>('window:maximize'),
  windowClose: () => safeInvoke<{ success: boolean; error?: string }>('window:close'),
  windowIsMaximized: () => safeInvoke<{ isMaximized: boolean }>('window:isMaximized'),

  // Directory selection
  selectDirectory: () => 
    safeInvoke<{ success: boolean; path: string | null; error?: string }>(IPC_CHANNELS.SELECT_DIRECTORY),
  
  // File selection (for single file purge)
  selectFile: () =>
    safeInvoke<{ success: boolean; path: string | null; fileName?: string; size?: number; error?: string }>('select-file'),
  
  // Get user folder path (downloads, desktop, documents, pictures)
  getUserFolder: (folderName: string) =>
    safeInvoke<{ success: boolean; path: string | null; error?: string }>('get-user-folder', folderName),

  // Scanning
  startScan: (dirPath: string) => 
    safeInvoke<{ success: boolean; files: FileScanResult[]; count: number; error?: string }>(
      IPC_CHANNELS.START_SCAN, 
      dirPath
    ),
  cancelScan: () => 
    safeInvoke<{ success: boolean }>(IPC_CHANNELS.CANCEL_SCAN),
  onScanProgress: (callback: (progress: { filesScanned: number; currentPath: string }) => void) => {
    const listener = (_event: any, progress: { filesScanned: number; currentPath: string }) => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in scan progress callback:', error);
      }
    };
    ipcRenderer.on(IPC_CHANNELS.SCAN_PROGRESS, listener);
    // Return cleanup function
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SCAN_PROGRESS, listener);
  },
  onScanComplete: (callback: (files: FileScanResult[]) => void) => {
    const listener = (_event: any, files: FileScanResult[]) => {
      try {
        callback(files);
      } catch (error) {
        console.error('Error in scan complete callback:', error);
      }
    };
    ipcRenderer.on(IPC_CHANNELS.SCAN_COMPLETE, listener);
    // Return cleanup function
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SCAN_COMPLETE, listener);
  },

  // Classification
  classifyFiles: (files: FileScanResult[]) => 
    safeInvoke<{ success: boolean; files: ClassifiedFile[]; count: number; error?: string }>(
      IPC_CHANNELS.CLASSIFY_FILES, 
      files
    ),

  // File operations
  banishFile: (filePath: string, classifications?: MonsterType[], fileSize?: number) => 
    safeInvoke<BanishResult>(IPC_CHANNELS.BANISH_FILE, filePath, classifications, fileSize),
  resurrectFile: (filePath: string) => 
    safeInvoke<{ success: boolean; message?: string; error?: string }>(
      IPC_CHANNELS.RESURRECT_FILE, 
      filePath
    ),
  restoreFile: (graveyardPath: string, originalPath: string) => 
    safeInvoke<RestoreResult>(IPC_CHANNELS.RESTORE_FILE, graveyardPath, originalPath),

  // Data queries
  getLogEntries: (filter?: { actionType?: string; startDate?: string; endDate?: string }) => 
    safeInvoke<LogEntry[]>(IPC_CHANNELS.GET_LOG_ENTRIES, filter),
  getWhitelist: () => 
    safeInvoke<string[]>(IPC_CHANNELS.GET_WHITELIST),
  removeFromWhitelist: (filePath: string) => 
    safeInvoke<{ success: boolean; message?: string; error?: string }>(
      IPC_CHANNELS.REMOVE_FROM_WHITELIST, 
      filePath
    ),
  getGraveyardFiles: () => 
    safeInvoke<Array<{ path: string; originalPath: string }>>(IPC_CHANNELS.GET_GRAVEYARD_FILES),

  // AI file inspection
  inspectFileAgent: (request: FileInspectionRequest) =>
    safeInvoke<FileInspectionResponse & { success: boolean }>(IPC_CHANNELS.INSPECT_FILE_AGENT, request),

  // Undo banish operation (Requirements: 13.3)
  undoBanish: (undoId: string) =>
    safeInvoke<UndoResult>(IPC_CHANNELS.UNDO_BANISH, undoId),

  // ═══════════════════════════════════════════════════════════════════════════
  // SWIFT PURGE TOOL MODE APIs
  // ═══════════════════════════════════════════════════════════════════════════

  // Swift Purge scan - scans up to 1000 files
  swiftPurgeScan: (targetPath: string) =>
    safeInvoke<{ success: boolean; result?: SwiftPurgeScanResult; error?: string }>(
      IPC_CHANNELS.SWIFT_PURGE_SCAN,
      targetPath
    ),

  // Swift Purge execute - moves files to graveyard
  swiftPurgeExecute: (scanResult: SwiftPurgeScanResult) =>
    safeInvoke<SwiftPurgeExecuteResult>(IPC_CHANNELS.SWIFT_PURGE_EXECUTE, scanResult),

  // Swift Purge undo - restores files from a session
  swiftPurgeUndo: (sessionId: string) =>
    safeInvoke<{ success: boolean; restoredCount: number; errors: Array<{ path: string; error: string }> }>(
      IPC_CHANNELS.SWIFT_PURGE_UNDO,
      sessionId
    ),

  // Swift Purge progress listener
  onSwiftPurgeProgress: (callback: (progress: SwiftPurgeScanProgress) => void) => {
    const listener = (_event: any, progress: SwiftPurgeScanProgress) => {
      try {
        callback(progress);
      } catch (err) {
        console.error('Error in swift purge progress callback:', err);
      }
    };
    ipcRenderer.on(IPC_CHANNELS.SWIFT_PURGE_PROGRESS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SWIFT_PURGE_PROGRESS, listener);
  },

  // Error handling
  onError: (callback: (error: string) => void) => {
    const listener = (_event: any, error: string) => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error callback:', err);
      }
    };
    ipcRenderer.on(IPC_CHANNELS.ERROR, listener);
    // Return cleanup function
    return () => ipcRenderer.removeListener(IPC_CHANNELS.ERROR, listener);
  }
});

/**
 * Type definitions for the exposed Electron API
 * 
 * This interface provides full type safety for all IPC communication between
 * the renderer and main processes. All methods include proper error handling
 * and return structured responses.
 */
export interface ElectronAPI {
  // Window controls for custom titlebar
  windowMinimize: () => Promise<{ success: boolean; error?: string }>;
  windowMaximize: () => Promise<{ success: boolean; isMaximized?: boolean; error?: string }>;
  windowClose: () => Promise<{ success: boolean; error?: string }>;
  windowIsMaximized: () => Promise<{ isMaximized: boolean }>;

  // Directory operations
  selectDirectory: () => Promise<{ success: boolean; path: string | null; error?: string }>;
  selectFile: () => Promise<{ success: boolean; path: string | null; fileName?: string; size?: number; error?: string }>;
  getUserFolder: (folderName: string) => Promise<{ success: boolean; path: string | null; error?: string }>;
  
  // Scanning operations
  startScan: (dirPath: string) => Promise<{ success: boolean; files: FileScanResult[]; count: number; error?: string }>;
  cancelScan: () => Promise<{ success: boolean }>;
  onScanProgress: (callback: (progress: { filesScanned: number; currentPath: string }) => void) => () => void;
  onScanComplete: (callback: (files: FileScanResult[]) => void) => () => void;
  
  // Classification operations
  classifyFiles: (files: FileScanResult[]) => Promise<{ success: boolean; files: ClassifiedFile[]; count: number; error?: string }>;
  
  // File operations
  banishFile: (filePath: string, classifications?: MonsterType[], fileSize?: number) => Promise<BanishResult>;
  resurrectFile: (filePath: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  restoreFile: (graveyardPath: string, originalPath: string) => Promise<RestoreResult>;
  
  // Data query operations
  getLogEntries: (filter?: { actionType?: string; startDate?: string; endDate?: string }) => Promise<LogEntry[]>;
  getWhitelist: () => Promise<string[]>;
  removeFromWhitelist: (filePath: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  getGraveyardFiles: () => Promise<Array<{ path: string; originalPath: string }>>;
  
  // AI file inspection
  inspectFileAgent: (request: FileInspectionRequest) => Promise<FileInspectionResponse & { success: boolean }>;
  
  // Undo banish operation (Requirements: 13.3)
  undoBanish: (undoId: string) => Promise<UndoResult>;
  
  // Swift Purge Tool Mode APIs
  swiftPurgeScan: (targetPath: string) => Promise<{ success: boolean; result?: SwiftPurgeScanResult; error?: string }>;
  swiftPurgeExecute: (scanResult: SwiftPurgeScanResult) => Promise<SwiftPurgeExecuteResult>;
  swiftPurgeUndo: (sessionId: string) => Promise<{ success: boolean; restoredCount: number; errors: Array<{ path: string; error: string }> }>;
  onSwiftPurgeProgress: (callback: (progress: SwiftPurgeScanProgress) => void) => () => void;
  
  // Error handling
  onError: (callback: (error: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
