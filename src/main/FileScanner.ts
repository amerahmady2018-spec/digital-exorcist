import { promises as fs } from 'fs';
import { join } from 'path';
import { FileScanResult, ScanProgress } from '../shared/types';
import { EventEmitter } from 'events';

export class FileScanner extends EventEmitter {
  private cancelled = false;

  /**
   * Recursively scans a directory and returns all files with metadata
   * @param dirPath - The directory path to scan
   * @returns Array of FileScanResult objects
   */
  async scanDirectory(dirPath: string): Promise<FileScanResult[]> {
    this.cancelled = false;
    const results: FileScanResult[] = [];
    let filesScanned = 0;

    await this.scanRecursive(dirPath, results, filesScanned);
    
    return results;
  }

  /**
   * Cancels the current scan operation
   */
  cancelScan(): void {
    this.cancelled = true;
  }

  /**
   * Recursively traverses directories and collects file metadata
   */
  private async scanRecursive(
    currentPath: string,
    results: FileScanResult[],
    filesScanned: number
  ): Promise<number> {
    if (this.cancelled) {
      return filesScanned;
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (this.cancelled) {
          break;
        }

        const fullPath = join(currentPath, entry.name);

        try {
          if (entry.isDirectory()) {
            // Recursively scan subdirectories
            filesScanned = await this.scanRecursive(fullPath, results, filesScanned);
          } else if (entry.isFile()) {
            // Collect file metadata
            const stats = await fs.stat(fullPath);
            
            results.push({
              path: fullPath,
              size: stats.size,
              lastModified: stats.mtime
            });

            filesScanned++;

            // Emit progress event every 100 files
            if (filesScanned % 100 === 0) {
              const progress: ScanProgress = {
                filesScanned,
                currentPath: fullPath
              };
              this.emit('progress', progress);
            }
          }
        } catch (error) {
          // Handle inaccessible files gracefully
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error accessing ${fullPath}: ${errorMessage}`);
          this.emit('error', {
            path: fullPath,
            error: errorMessage
          });
          // Continue scanning despite errors
        }
      }
    } catch (error) {
      // Handle inaccessible directories gracefully
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error reading directory ${currentPath}: ${errorMessage}`);
      this.emit('error', {
        path: currentPath,
        error: errorMessage
      });
      // Continue scanning despite errors
    }

    return filesScanned;
  }
}
