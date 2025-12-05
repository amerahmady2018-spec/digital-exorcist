import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { FileScanResult, ClassifiedFile, MonsterType } from '../shared/types';

export class FileClassifier {
  private readonly GHOST_AGE_MONTHS = 6;
  private readonly DEMON_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

  /**
   * Computes SHA-256 hash of a file using streaming for large files
   * @param filePath - Path to the file to hash
   * @returns Promise resolving to the hex-encoded hash string
   */
  async computeHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('data', (chunk) => {
        hash.update(chunk);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Classifies files as Ghosts, Demons, or Zombies based on criteria
   * @param files - Array of scanned files to classify
   * @param whitelist - Set of file paths to exclude from classification
   * @param computeHashesForDuplicates - Whether to compute hashes (default true, set false for testing)
   * @returns Array of classified files with their monster types
   */
  async classifyFiles(
    files: FileScanResult[],
    whitelist: Set<string>,
    computeHashesForDuplicates: boolean = true
  ): Promise<ClassifiedFile[]> {
    // First, compute hashes for all files to detect duplicates (if enabled)
    let filesWithHashes: FileScanResult[];
    if (computeHashesForDuplicates) {
      filesWithHashes = await this.computeHashes(files);
    } else {
      // Use existing hashes from files (for testing)
      filesWithHashes = files;
    }

    // Group files by hash to identify duplicates
    const hashGroups = this.groupByHash(filesWithHashes);

    // Classify each file
    const classified: ClassifiedFile[] = [];

    for (const file of filesWithHashes) {
      // Skip whitelisted files
      if (whitelist.has(file.path)) {
        continue;
      }

      const classifications: MonsterType[] = [];

      // Ghost classification: files older than 6 months
      if (this.isGhost(file)) {
        classifications.push(MonsterType.Ghost);
      }

      // Demon classification: files larger than 500MB
      if (this.isDemon(file)) {
        classifications.push(MonsterType.Demon);
      }

      // Zombie classification: duplicate files
      const duplicateGroup = file.hash && hashGroups.get(file.hash);
      if (duplicateGroup && duplicateGroup.length > 1) {
        classifications.push(MonsterType.Zombie);
      }

      // Only include files that have at least one classification
      if (classifications.length > 0) {
        classified.push({
          ...file,
          classifications,
          duplicateGroup: duplicateGroup && duplicateGroup.length > 1 ? file.hash : undefined
        });
      }
    }

    return classified;
  }

  /**
   * Computes hashes for all files in the array
   */
  private async computeHashes(files: FileScanResult[]): Promise<FileScanResult[]> {
    const filesWithHashes: FileScanResult[] = [];

    for (const file of files) {
      try {
        const hash = await this.computeHash(file.path);
        filesWithHashes.push({
          ...file,
          hash
        });
      } catch (error) {
        // If hashing fails, include file without hash
        console.error(`Failed to hash ${file.path}:`, error);
        filesWithHashes.push(file);
      }
    }

    return filesWithHashes;
  }

  /**
   * Groups files by their content hash
   */
  private groupByHash(files: FileScanResult[]): Map<string, FileScanResult[]> {
    const groups = new Map<string, FileScanResult[]>();

    for (const file of files) {
      if (file.hash) {
        const group = groups.get(file.hash) || [];
        group.push(file);
        groups.set(file.hash, group);
      }
    }

    return groups;
  }

  /**
   * Determines if a file is a Ghost (older than 6 months)
   */
  private isGhost(file: FileScanResult): boolean {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - this.GHOST_AGE_MONTHS);
    return file.lastModified < sixMonthsAgo;
  }

  /**
   * Determines if a file is a Demon (larger than 500MB)
   */
  private isDemon(file: FileScanResult): boolean {
    return file.size > this.DEMON_SIZE_BYTES;
  }
}
