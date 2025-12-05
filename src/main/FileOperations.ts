import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';
import { BanishResult, RestoreResult, ActionType, MonsterType } from '../shared/types';
import { GraveyardLog } from './GraveyardLog';
import { WhitelistManager } from './WhitelistManager';

export class FileOperations {
  private readonly graveyardPath: string;
  private readonly scanRoot: string;
  private readonly graveyardLog: GraveyardLog;
  private readonly whitelistManager: WhitelistManager;

  constructor(
    scanRoot: string, 
    baseDir: string = '.', 
    graveyardLog?: GraveyardLog,
    whitelistManager?: WhitelistManager
  ) {
    this.scanRoot = scanRoot;
    this.graveyardPath = join(baseDir, 'graveyard_trash');
    this.graveyardLog = graveyardLog || new GraveyardLog(baseDir);
    this.whitelistManager = whitelistManager || new WhitelistManager(baseDir);
  }

  /**
   * Banishes a file by moving it to the graveyard while preserving directory structure
   * @param filePath - The absolute path of the file to banish
   * @param classifications - Optional classifications for logging
   * @param fileSize - Optional file size for logging
   * @returns BanishResult with success status and graveyard path
   */
  async banishFile(
    filePath: string, 
    classifications?: MonsterType[],
    fileSize?: number
  ): Promise<BanishResult> {
    try {
      // Validate file exists and get file size if not provided
      let actualFileSize = fileSize;
      try {
        const stats = await fs.stat(filePath);
        if (!actualFileSize) {
          actualFileSize = stats.size;
        }
      } catch (error) {
        return {
          success: false,
          graveyardPath: '',
          error: `File does not exist: ${filePath}`
        };
      }

      // Calculate relative path from scan root
      const relativePath = relative(this.scanRoot, filePath);
      
      // Construct graveyard destination path
      const graveyardFilePath = join(this.graveyardPath, relativePath);
      const graveyardDir = dirname(graveyardFilePath);

      // Ensure graveyard directory structure exists
      await fs.mkdir(graveyardDir, { recursive: true });

      // Move file to graveyard
      await fs.rename(filePath, graveyardFilePath);

      // Log the banish operation
      await this.graveyardLog.appendEntry({
        timestamp: new Date().toISOString(),
        action: ActionType.Banish,
        filePath: filePath,
        originalPath: filePath,
        graveyardPath: graveyardFilePath,
        classifications: classifications,
        fileSize: actualFileSize
      });

      return {
        success: true,
        graveyardPath: graveyardFilePath
      };
    } catch (error) {
      return {
        success: false,
        graveyardPath: '',
        error: error instanceof Error ? error.message : 'Unknown error during banish'
      };
    }
  }

  /**
   * Restores a file from the graveyard back to its original location
   * @param graveyardFilePath - The path of the file in the graveyard
   * @param originalPath - The original path where the file should be restored
   * @returns RestoreResult with success status and restored path
   */
  async restoreFile(graveyardFilePath: string, originalPath: string): Promise<RestoreResult> {
    try {
      // Validate graveyard file exists and get file size
      let fileSize: number;
      try {
        const stats = await fs.stat(graveyardFilePath);
        fileSize = stats.size;
      } catch (error) {
        return {
          success: false,
          restoredPath: '',
          error: `File does not exist in graveyard: ${graveyardFilePath}`
        };
      }

      // Check for conflicts at original location
      try {
        await fs.access(originalPath);
        // File exists at original location - conflict detected
        return {
          success: false,
          restoredPath: '',
          error: `Conflict: File already exists at original location: ${originalPath}`
        };
      } catch (error) {
        // File doesn't exist at original location - safe to restore
      }

      // Ensure original directory exists
      const originalDir = dirname(originalPath);
      await fs.mkdir(originalDir, { recursive: true });

      // Move file from graveyard back to original location
      await fs.rename(graveyardFilePath, originalPath);

      // Log the restore operation
      await this.graveyardLog.appendEntry({
        timestamp: new Date().toISOString(),
        action: ActionType.Restore,
        filePath: originalPath,
        originalPath: originalPath,
        graveyardPath: graveyardFilePath,
        fileSize: fileSize
      });

      return {
        success: true,
        restoredPath: originalPath
      };
    } catch (error) {
      return {
        success: false,
        restoredPath: '',
        error: error instanceof Error ? error.message : 'Unknown error during restore'
      };
    }
  }

  /**
   * Gets the graveyard path for a given original file path
   * @param originalPath - The original file path
   * @returns The corresponding graveyard path
   */
  getGraveyardPath(originalPath: string): string {
    const relativePath = relative(this.scanRoot, originalPath);
    return join(this.graveyardPath, relativePath);
  }

  /**
   * Gets the original path for a given graveyard file path
   * @param graveyardFilePath - The graveyard file path
   * @returns The corresponding original path
   */
  getOriginalPath(graveyardFilePath: string): string {
    const relativePath = relative(this.graveyardPath, graveyardFilePath);
    return join(this.scanRoot, relativePath);
  }

  /**
   * Resurrects a file by adding it to the whitelist
   * @param filePath - The path of the file to resurrect
   * @returns Promise that resolves when the file is whitelisted and logged
   */
  async resurrectFile(filePath: string): Promise<void> {
    // Get file size for logging
    let fileSize: number | undefined;
    try {
      const stats = await fs.stat(filePath);
      fileSize = stats.size;
    } catch (error) {
      // File might not exist, but we still want to whitelist it
      fileSize = undefined;
    }

    // Add to whitelist
    await this.whitelistManager.add(filePath);

    // Log the resurrect operation
    await this.graveyardLog.appendEntry({
      timestamp: new Date().toISOString(),
      action: ActionType.Resurrect,
      filePath: filePath,
      fileSize: fileSize
    });
  }
}
