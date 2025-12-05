import { promises as fs } from 'fs';
import { join, basename, extname } from 'path';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { EventEmitter } from 'events';
import { 
  SwiftPurgeFileEntry, 
  SwiftPurgeScanResult, 
  SwiftPurgeScanProgress 
} from '../shared/types';

/**
 * SwiftPurgeScanner - Specialized scanner for Tool Mode
 * 
 * Scans up to 1000 files, computes hashes for duplicate detection,
 * and classifies files as Ghost, Zombie, or Demon.
 * 
 * Classification priority: DEMON > ZOMBIE > GHOST
 */
export class SwiftPurgeScanner extends EventEmitter {
  private readonly MAX_FILES = 1000;
  private readonly GHOST_AGE_MONTHS = 6;
  private readonly DEMON_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
  private readonly DEMON_EXTENSIONS = ['.iso', '.zip', '.rar', '.7z', '.mp4', '.mkv', '.avi', '.mov', '.dmg', '.tar', '.gz'];
  private readonly DEMON_EXT_AGE_MONTHS = 3;
  
  private cancelled = false;
  private whitelist: Set<string>;

  constructor(whitelist: Set<string> = new Set()) {
    super();
    this.whitelist = whitelist;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `swift-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Compute SHA-256 hash using streaming
   */
  private async computeHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Check if file is a Ghost (older than 6 months)
   */
  private isGhost(lastModified: Date): boolean {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - this.GHOST_AGE_MONTHS);
    return lastModified < sixMonthsAgo;
  }

  /**
   * Check if file is a Demon (large file or large extension + old)
   */
  private isDemon(size: number, ext: string, lastModified: Date): boolean {
    // Size-based demon: > 500MB
    if (size > this.DEMON_SIZE_BYTES) return true;
    
    // Extension-based demon: large file type + older than 3 months
    if (this.DEMON_EXTENSIONS.includes(ext.toLowerCase())) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - this.DEMON_EXT_AGE_MONTHS);
      return lastModified < threeMonthsAgo;
    }
    
    return false;
  }

  /**
   * Cancel the current scan
   */
  cancelScan(): void {
    this.cancelled = true;
  }


  /**
   * Scan a directory for Swift Purge
   * Collects up to MAX_FILES files, computes hashes, and classifies them
   */
  async scan(targetPath: string): Promise<SwiftPurgeScanResult> {
    this.cancelled = false;
    const sessionId = this.generateSessionId();
    
    // Phase 1: Collect files (up to limit)
    const collectedFiles: Array<{
      path: string;
      fileName: string;
      size: number;
      lastModified: Date;
      ext: string;
    }> = [];
    
    let totalScanned = 0;
    let limitReached = false;

    const collectFiles = async (dirPath: string): Promise<void> => {
      if (this.cancelled || collectedFiles.length >= this.MAX_FILES) {
        if (collectedFiles.length >= this.MAX_FILES) limitReached = true;
        return;
      }

      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (this.cancelled || collectedFiles.length >= this.MAX_FILES) {
            if (collectedFiles.length >= this.MAX_FILES) limitReached = true;
            break;
          }

          const fullPath = join(dirPath, entry.name);

          try {
            if (entry.isDirectory()) {
              await collectFiles(fullPath);
            } else if (entry.isFile()) {
              // Skip whitelisted files
              if (this.whitelist.has(fullPath)) continue;

              const stats = await fs.stat(fullPath);
              totalScanned++;

              collectedFiles.push({
                path: fullPath,
                fileName: basename(fullPath),
                size: stats.size,
                lastModified: stats.mtime,
                ext: extname(fullPath)
              });

              // Emit progress every 50 files
              if (totalScanned % 50 === 0) {
                const progress: SwiftPurgeScanProgress = {
                  filesScanned: totalScanned,
                  currentPath: fullPath,
                  phase: 'scanning'
                };
                this.emit('progress', progress);
              }
            }
          } catch (err) {
            // Skip inaccessible files
            console.warn(`Cannot access ${fullPath}:`, err);
          }
        }
      } catch (err) {
        console.warn(`Cannot read directory ${dirPath}:`, err);
      }
    };

    await collectFiles(targetPath);

    // Phase 2: Compute hashes for duplicate detection
    const filesWithHashes: Array<typeof collectedFiles[0] & { hash?: string }> = [];
    
    for (let i = 0; i < collectedFiles.length; i++) {
      if (this.cancelled) break;
      
      const file = collectedFiles[i];
      let hash: string | undefined;
      
      try {
        hash = await this.computeHash(file.path);
      } catch (err) {
        console.warn(`Cannot hash ${file.path}:`, err);
      }
      
      filesWithHashes.push({ ...file, hash });

      // Emit progress every 20 files during hashing
      if ((i + 1) % 20 === 0) {
        const progress: SwiftPurgeScanProgress = {
          filesScanned: i + 1,
          currentPath: file.path,
          phase: 'hashing'
        };
        this.emit('progress', progress);
      }
    }

    // Phase 3: Classify files
    // Group by hash for zombie detection
    const hashGroups = new Map<string, typeof filesWithHashes>();
    for (const file of filesWithHashes) {
      if (file.hash) {
        const group = hashGroups.get(file.hash) || [];
        group.push(file);
        hashGroups.set(file.hash, group);
      }
    }

    // Determine primary file for each duplicate group (newest or shortest path)
    const primaryFiles = new Map<string, string>();
    for (const [hash, group] of hashGroups.entries()) {
      if (group.length > 1) {
        // Sort by lastModified desc, then by path length asc
        const sorted = [...group].sort((a, b) => {
          const timeDiff = b.lastModified.getTime() - a.lastModified.getTime();
          if (timeDiff !== 0) return timeDiff;
          return a.path.length - b.path.length;
        });
        primaryFiles.set(hash, sorted[0].path);
      }
    }

    // Classify each file with priority: DEMON > ZOMBIE > GHOST
    const classifiedFiles: SwiftPurgeFileEntry[] = [];
    const counts = { ghosts: 0, zombies: 0, demons: 0 };
    let totalBytes = 0;

    for (const file of filesWithHashes) {
      const isDemon = this.isDemon(file.size, file.ext, file.lastModified);
      const isZombie = file.hash && hashGroups.get(file.hash)!.length > 1 && 
                       primaryFiles.get(file.hash) !== file.path;
      const isGhost = this.isGhost(file.lastModified);

      let classification: 'ghost' | 'zombie' | 'demon' | null = null;
      let duplicateOf: string | undefined;

      // Priority: DEMON > ZOMBIE > GHOST
      if (isDemon) {
        classification = 'demon';
        counts.demons++;
      } else if (isZombie) {
        classification = 'zombie';
        counts.zombies++;
        duplicateOf = primaryFiles.get(file.hash!);
      } else if (isGhost) {
        classification = 'ghost';
        counts.ghosts++;
      }

      if (classification) {
        totalBytes += file.size;
        classifiedFiles.push({
          path: file.path,
          fileName: file.fileName,
          size: file.size,
          lastModified: file.lastModified,
          hash: file.hash,
          classification,
          duplicateOf
        });
      }
    }

    // Emit final progress
    this.emit('progress', {
      filesScanned: totalScanned,
      currentPath: targetPath,
      phase: 'classifying'
    });

    return {
      sessionId,
      targetPath,
      files: classifiedFiles,
      totalFilesScanned: totalScanned,
      totalBytes,
      limitReached,
      counts
    };
  }
}
