import { promises as fs } from 'fs';
import { dirname } from 'path';

/**
 * Undo Entry - Represents a banish operation that can be undone
 */
export interface UndoEntry {
  /** Unique identifier for the undo entry */
  id: string;
  /** Timestamp when the operation was performed */
  timestamp: Date;
  /** Type of operation (currently only 'banish' is supported) */
  operation: 'banish';
  /** Original file path before banishment */
  filePath: string;
  /** Path where the file was moved in the graveyard */
  graveyardPath: string;
  /** When this undo entry expires */
  expiresAt: Date;
  /** File size in bytes (for display purposes) */
  fileSize?: number;
  /** File name (for display purposes) */
  fileName?: string;
}

/**
 * Result of an undo operation
 */
export interface UndoResult {
  success: boolean;
  restoredPath?: string;
  error?: string;
}

/**
 * UndoManager - Manages time-limited undo operations for file banishments
 * 
 * Implements a queue of undo entries with automatic expiration.
 * Each entry expires after 5 seconds (configurable).
 * 
 * Requirements: 13.1, 13.2
 */
export class UndoManager {
  private queue: Map<string, UndoEntry> = new Map();
  private readonly maxAge: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Creates a new UndoManager
   * @param maxAgeMs Maximum age of undo entries in milliseconds (default: 5000ms = 5 seconds)
   */
  constructor(maxAgeMs: number = 5000) {
    this.maxAge = maxAgeMs;
    // Start cleanup interval - runs every second
    this.startCleanupInterval();
  }

  /**
   * Starts the cleanup interval that removes expired entries every second
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanExpired();
    }, 1000);
  }

  /**
   * Stops the cleanup interval (for cleanup/testing)
   */
  public stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Generates a unique ID for undo entries
   */
  private generateId(): string {
    return `undo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Adds a new undo entry to the queue
   * @param entry The undo entry data (without id and expiresAt)
   * @returns The generated ID for the undo entry
   */
  addEntry(entry: Omit<UndoEntry, 'id' | 'expiresAt'>): string {
    const id = this.generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.maxAge);

    const fullEntry: UndoEntry = {
      ...entry,
      id,
      expiresAt
    };

    this.queue.set(id, fullEntry);
    console.log(`[UndoManager] Added entry ${id}, expires at ${expiresAt.toISOString()}`);
    
    return id;
  }

  /**
   * Executes an undo operation, restoring the file to its original location
   * @param id The ID of the undo entry
   * @returns Result of the undo operation
   */
  async executeUndo(id: string): Promise<UndoResult> {
    const entry = this.queue.get(id);

    if (!entry) {
      return {
        success: false,
        error: 'Undo entry not found or already expired'
      };
    }

    // Check if entry has expired
    if (new Date() > entry.expiresAt) {
      this.queue.delete(id);
      return {
        success: false,
        error: 'Undo window has expired'
      };
    }

    try {
      // Validate graveyard file exists
      try {
        await fs.access(entry.graveyardPath);
      } catch {
        this.queue.delete(id);
        return {
          success: false,
          error: `File no longer exists in graveyard: ${entry.graveyardPath}`
        };
      }

      // Check for conflicts at original location
      try {
        await fs.access(entry.filePath);
        // File exists at original location - conflict detected
        this.queue.delete(id);
        return {
          success: false,
          error: `Conflict: File already exists at original location: ${entry.filePath}`
        };
      } catch {
        // File doesn't exist at original location - safe to restore
      }

      // Ensure original directory exists
      const originalDir = dirname(entry.filePath);
      await fs.mkdir(originalDir, { recursive: true });

      // Move file from graveyard back to original location
      await fs.rename(entry.graveyardPath, entry.filePath);

      // Remove entry from queue
      this.queue.delete(id);

      console.log(`[UndoManager] Successfully restored ${entry.filePath}`);

      return {
        success: true,
        restoredPath: entry.filePath
      };
    } catch (error) {
      console.error(`[UndoManager] Error during undo:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during undo'
      };
    }
  }

  /**
   * Removes all expired entries from the queue
   */
  cleanExpired(): void {
    const now = new Date();
    let expiredCount = 0;

    for (const [id, entry] of this.queue.entries()) {
      if (now > entry.expiresAt) {
        this.queue.delete(id);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`[UndoManager] Cleaned ${expiredCount} expired entries`);
    }
  }

  /**
   * Gets all active (non-expired) undo entries
   * @returns Array of active undo entries
   */
  getActiveEntries(): UndoEntry[] {
    const now = new Date();
    const activeEntries: UndoEntry[] = [];

    for (const entry of this.queue.values()) {
      if (now <= entry.expiresAt) {
        activeEntries.push(entry);
      }
    }

    return activeEntries;
  }

  /**
   * Gets a specific undo entry by ID
   * @param id The ID of the undo entry
   * @returns The undo entry or undefined if not found/expired
   */
  getEntry(id: string): UndoEntry | undefined {
    const entry = this.queue.get(id);
    if (entry && new Date() <= entry.expiresAt) {
      return entry;
    }
    return undefined;
  }

  /**
   * Gets the remaining time for an undo entry in milliseconds
   * @param id The ID of the undo entry
   * @returns Remaining time in milliseconds, or 0 if expired/not found
   */
  getRemainingTime(id: string): number {
    const entry = this.queue.get(id);
    if (!entry) return 0;

    const remaining = entry.expiresAt.getTime() - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Clears all entries (for testing/cleanup)
   */
  clear(): void {
    this.queue.clear();
  }

  /**
   * Gets the number of active entries
   */
  get size(): number {
    return this.queue.size;
  }
}

// Singleton instance for use across the application
let undoManagerInstance: UndoManager | null = null;

/**
 * Gets the singleton UndoManager instance
 */
export function getUndoManager(): UndoManager {
  if (!undoManagerInstance) {
    undoManagerInstance = new UndoManager();
  }
  return undoManagerInstance;
}

/**
 * Creates a new UndoManager instance (for testing)
 */
export function createUndoManager(maxAgeMs?: number): UndoManager {
  return new UndoManager(maxAgeMs);
}
