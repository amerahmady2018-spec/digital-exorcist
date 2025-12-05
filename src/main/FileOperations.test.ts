import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join, dirname, relative, sep } from 'path';
import * as fc from 'fast-check';
import { FileOperations } from './FileOperations';

describe('FileOperations', () => {
  const testBaseDir = join(process.cwd(), 'test-file-operations');
  const testScanRoot = join(testBaseDir, 'scan-root');
  const testGraveyardPath = join(testBaseDir, 'graveyard_trash');

  beforeEach(async () => {
    // Clean up and create test directories
    await fs.rm(testBaseDir, { recursive: true, force: true });
    await fs.mkdir(testScanRoot, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directories
    await fs.rm(testBaseDir, { recursive: true, force: true });
  });

  /**
   * **Feature: digital-exorcist, Property 13: Banish preserves directory structure**
   * **Validates: Requirements 5.2**
   */
  describe('Property 13: Banish preserves directory structure', () => {
    it('should preserve directory structure when banishing files', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a random nested path structure
          fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), { minLength: 1, maxLength: 5 }),
          fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|pdf|jpg)$/),
          fc.string({ minLength: 0, maxLength: 100 }),
          async (pathSegments, filename, content) => {
            // Create the nested directory structure
            const relativeDirPath = pathSegments.join(sep);
            const fullDirPath = join(testScanRoot, relativeDirPath);
            await fs.mkdir(fullDirPath, { recursive: true });

            // Create the test file
            const filePath = join(fullDirPath, filename);
            await fs.writeFile(filePath, content, 'utf-8');

            // Create FileOperations instance
            const fileOps = new FileOperations(testScanRoot, testBaseDir);

            // Banish the file
            const result = await fileOps.banishFile(filePath);

            // Verify banish was successful
            expect(result.success).toBe(true);

            // Calculate expected graveyard path
            const relativeFilePath = relative(testScanRoot, filePath);
            const expectedGraveyardPath = join(testGraveyardPath, relativeFilePath);

            // Verify the graveyard path matches expected structure
            expect(result.graveyardPath).toBe(expectedGraveyardPath);

            // Verify the file exists at the graveyard location
            const graveyardFileExists = await fs.access(result.graveyardPath)
              .then(() => true)
              .catch(() => false);
            expect(graveyardFileExists).toBe(true);

            // Verify the directory structure is preserved
            const graveyardDirPath = dirname(result.graveyardPath);
            const expectedGraveyardDirPath = join(testGraveyardPath, relativeDirPath);
            expect(graveyardDirPath).toBe(expectedGraveyardDirPath);

            // Verify the file content is preserved
            const graveyardContent = await fs.readFile(result.graveyardPath, 'utf-8');
            expect(graveyardContent).toBe(content);

            // Verify the original file no longer exists
            const originalFileExists = await fs.access(filePath)
              .then(() => true)
              .catch(() => false);
            expect(originalFileExists).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: digital-exorcist, Property 23: Banish-restore round trip**
   * **Validates: Requirements 8.2**
   */
  describe('Property 23: Banish-restore round trip', () => {
    it('should restore files to exact original location with identical content', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a random nested path structure
          fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), { minLength: 1, maxLength: 5 }),
          fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|pdf|jpg)$/),
          fc.string({ minLength: 0, maxLength: 100 }),
          async (pathSegments, filename, content) => {
            // Create the nested directory structure
            const relativeDirPath = pathSegments.join(sep);
            const fullDirPath = join(testScanRoot, relativeDirPath);
            await fs.mkdir(fullDirPath, { recursive: true });

            // Create the test file
            const originalFilePath = join(fullDirPath, filename);
            await fs.writeFile(originalFilePath, content, 'utf-8');

            // Get original file stats
            const originalStats = await fs.stat(originalFilePath);

            // Create FileOperations instance
            const fileOps = new FileOperations(testScanRoot, testBaseDir);

            // Banish the file
            const banishResult = await fileOps.banishFile(originalFilePath);
            expect(banishResult.success).toBe(true);

            // Verify original file is gone
            const fileExistsAfterBanish = await fs.access(originalFilePath)
              .then(() => true)
              .catch(() => false);
            expect(fileExistsAfterBanish).toBe(false);

            // Restore the file
            const restoreResult = await fileOps.restoreFile(
              banishResult.graveyardPath,
              originalFilePath
            );

            // Verify restore was successful
            expect(restoreResult.success).toBe(true);
            expect(restoreResult.restoredPath).toBe(originalFilePath);

            // Verify file exists at original location
            const fileExistsAfterRestore = await fs.access(originalFilePath)
              .then(() => true)
              .catch(() => false);
            expect(fileExistsAfterRestore).toBe(true);

            // Verify content is identical
            const restoredContent = await fs.readFile(originalFilePath, 'utf-8');
            expect(restoredContent).toBe(content);

            // Verify file size is identical
            const restoredStats = await fs.stat(originalFilePath);
            expect(restoredStats.size).toBe(originalStats.size);

            // Verify graveyard file is gone
            const graveyardFileExists = await fs.access(banishResult.graveyardPath)
              .then(() => true)
              .catch(() => false);
            expect(graveyardFileExists).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: digital-exorcist, Property 24: Restore conflict detection**
   * **Validates: Requirements 8.3, 8.5**
   */
  describe('Property 24: Restore conflict detection', () => {
    it('should detect conflicts when original location is occupied and not overwrite', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a random nested path structure
          fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), { minLength: 1, maxLength: 5 }),
          fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|pdf|jpg)$/),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          async (pathSegments, filename, originalContent, conflictingContent) => {
            // Ensure the two contents are different to make the test meaningful
            fc.pre(originalContent !== conflictingContent);

            // Create the nested directory structure
            const relativeDirPath = pathSegments.join(sep);
            const fullDirPath = join(testScanRoot, relativeDirPath);
            await fs.mkdir(fullDirPath, { recursive: true });

            // Create the original test file
            const originalFilePath = join(fullDirPath, filename);
            await fs.writeFile(originalFilePath, originalContent, 'utf-8');

            // Create FileOperations instance
            const fileOps = new FileOperations(testScanRoot, testBaseDir);

            // Banish the file
            const banishResult = await fileOps.banishFile(originalFilePath);
            expect(banishResult.success).toBe(true);

            // Verify original file is gone
            const fileExistsAfterBanish = await fs.access(originalFilePath)
              .then(() => true)
              .catch(() => false);
            expect(fileExistsAfterBanish).toBe(false);

            // Create a conflicting file at the original location
            await fs.writeFile(originalFilePath, conflictingContent, 'utf-8');

            // Attempt to restore the file
            const restoreResult = await fileOps.restoreFile(
              banishResult.graveyardPath,
              originalFilePath
            );

            // Verify restore failed due to conflict
            expect(restoreResult.success).toBe(false);
            expect(restoreResult.error).toBeDefined();
            expect(restoreResult.error).toContain('Conflict');
            expect(restoreResult.error).toContain(originalFilePath);

            // Verify the conflicting file still exists with its original content
            const currentContent = await fs.readFile(originalFilePath, 'utf-8');
            expect(currentContent).toBe(conflictingContent);

            // Verify the graveyard file still exists (wasn't moved)
            const graveyardFileExists = await fs.access(banishResult.graveyardPath)
              .then(() => true)
              .catch(() => false);
            expect(graveyardFileExists).toBe(true);

            // Verify the graveyard file has the original content
            const graveyardContent = await fs.readFile(banishResult.graveyardPath, 'utf-8');
            expect(graveyardContent).toBe(originalContent);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
