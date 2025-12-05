import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';
import { 
  SwiftPurgeScanResult, 
  SwiftPurgeExecuteResult,
  ActionType 
} from '../shared/types';
import { GraveyardLog } from './GraveyardLog';
import { getUndoManager } from './UndoManager';

/**
 * SwiftPurgeExecutor - Handles bulk file operations for Tool Mode
 * 
 * Moves files to the graveyard, logs operations, and supports undo.
 * NEVER performs permanent deletion - all files go to graveyard_trash.
 */
export class SwiftPurgeExecutor {
  private readonly graveyardPath: string;
  private readonly graveyardLog: GraveyardLog;

  constructor(graveyardLog: GraveyardLog) {
    this.graveyardPath = join(process.cwd(), 'graveyard_trash');
    this.graveyardLog = graveyardLog;
  }

  /**
   * Move a file, using copy+delete as fallback for cross-device moves
   */
  private async moveFile(source: string, destination: string): Promise<void> {
    try {
      // Try rename first (fast, same-device move)
      await fs.rename(source, destination);
    } catch (err: unknown) {
      // If rename fails with EXDEV (cross-device), use copy+delete
      if (err && typeof err === 'object' && 'code' in err && err.code === 'EXDEV') {
        await fs.copyFile(source, destination);
        await fs.unlink(source);
      } else {
        throw err;
      }
    }
  }

  /**
   * Execute Swift Purge - move all classified files to graveyard
   */
  async execute(
    scanResult: SwiftPurgeScanResult,
    onProgress?: (current: number, total: number) => void
  ): Promise<SwiftPurgeExecuteResult> {
    const errors: Array<{ path: string; error: string }> = [];
    let purgedCount = 0;
    let bytesFreed = 0;
    const movedFiles: Array<{ original: string; graveyard: string; size: number }> = [];

    const total = scanResult.files.length;

    // Ensure base graveyard directory exists
    await fs.mkdir(this.graveyardPath, { recursive: true });

    for (let i = 0; i < scanResult.files.length; i++) {
      const file = scanResult.files[i];
      
      try {
        // Check if source file still exists
        try {
          await fs.access(file.path);
        } catch {
          errors.push({ path: file.path, error: 'File no longer exists' });
          continue;
        }

        // Calculate graveyard path preserving directory structure
        const relativePath = relative(scanResult.targetPath, file.path);
        const graveyardFilePath = join(this.graveyardPath, relativePath);
        const graveyardDir = dirname(graveyardFilePath);

        // Ensure graveyard directory exists
        await fs.mkdir(graveyardDir, { recursive: true });

        // Move file to graveyard (with cross-device fallback)
        await this.moveFile(file.path, graveyardFilePath);

        // Log the operation
        await this.graveyardLog.appendEntry({
          timestamp: new Date().toISOString(),
          action: ActionType.Banish,
          filePath: file.path,
          originalPath: file.path,
          graveyardPath: graveyardFilePath,
          classifications: [file.classification],
          fileSize: file.size
        });

        movedFiles.push({
          original: file.path,
          graveyard: graveyardFilePath,
          size: file.size
        });

        purgedCount++;
        bytesFreed += file.size;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ path: file.path, error: errorMsg });
        console.error(`Failed to purge ${file.path}:`, err);
      }

      // Report progress
      if (onProgress) {
        onProgress(i + 1, total);
      }
    }

    // Register undo entry for the entire session
    let undoSessionId: string | undefined;
    let undoExpiresAt: string | undefined;

    if (movedFiles.length > 0) {
      const undoManager = getUndoManager();
      // Create a batch undo entry - we'll use the first file's info but track all
      undoSessionId = undoManager.addEntry({
        timestamp: new Date(),
        operation: 'banish',
        filePath: scanResult.targetPath, // Use target path as identifier
        graveyardPath: this.graveyardPath,
        fileSize: bytesFreed,
        fileName: `Swift Purge: ${purgedCount} files`
      });

      const entry = undoManager.getEntry(undoSessionId);
      if (entry) {
        undoExpiresAt = entry.expiresAt.toISOString();
      }

      // Store the batch info for potential undo
      this.storeBatchUndoInfo(scanResult.sessionId, movedFiles);
    }

    return {
      success: errors.length === 0,
      sessionId: scanResult.sessionId,
      purgedCount,
      bytesFreed,
      errors,
      undoSessionId,
      undoExpiresAt
    };
  }


  /**
   * Store batch undo information for session-level undo
   */
  private batchUndoStore = new Map<string, Array<{ original: string; graveyard: string; size: number }>>();

  private storeBatchUndoInfo(
    sessionId: string, 
    files: Array<{ original: string; graveyard: string; size: number }>
  ): void {
    this.batchUndoStore.set(sessionId, files);
    
    // Auto-cleanup after 30 seconds (longer than undo window)
    setTimeout(() => {
      this.batchUndoStore.delete(sessionId);
    }, 30000);
  }

  /**
   * Undo an entire Swift Purge session
   */
  async undoSession(sessionId: string): Promise<{
    success: boolean;
    restoredCount: number;
    errors: Array<{ path: string; error: string }>;
  }> {
    const files = this.batchUndoStore.get(sessionId);
    
    if (!files) {
      return {
        success: false,
        restoredCount: 0,
        errors: [{ path: sessionId, error: 'Session not found or expired' }]
      };
    }

    const errors: Array<{ path: string; error: string }> = [];
    let restoredCount = 0;

    for (const file of files) {
      try {
        // Check if graveyard file still exists
        await fs.access(file.graveyard);

        // Check for conflicts at original location
        try {
          await fs.access(file.original);
          // File exists at original - skip with error
          errors.push({ 
            path: file.original, 
            error: 'File already exists at original location' 
          });
          continue;
        } catch {
          // Good - original location is free
        }

        // Ensure original directory exists
        await fs.mkdir(dirname(file.original), { recursive: true });

        // Move back
        await fs.rename(file.graveyard, file.original);

        // Log the restore
        await this.graveyardLog.appendEntry({
          timestamp: new Date().toISOString(),
          action: ActionType.Restore,
          filePath: file.original,
          originalPath: file.original,
          graveyardPath: file.graveyard,
          fileSize: file.size
        });

        restoredCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ path: file.original, error: errorMsg });
      }
    }

    // Clear the batch info
    this.batchUndoStore.delete(sessionId);

    return {
      success: errors.length === 0,
      restoredCount,
      errors
    };
  }
}

// Singleton instance
let executorInstance: SwiftPurgeExecutor | null = null;

export function getSwiftPurgeExecutor(graveyardLog: GraveyardLog): SwiftPurgeExecutor {
  if (!executorInstance) {
    executorInstance = new SwiftPurgeExecutor(graveyardLog);
  }
  return executorInstance;
}
