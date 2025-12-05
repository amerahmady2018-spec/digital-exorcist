import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { FileScanner } from './FileScanner';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('FileScanner Property Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a unique temporary directory for each test
    testDir = join(tmpdir(), `digital-exorcist-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up test directory:', error);
    }
  });

  /**
   * **Feature: digital-exorcist, Property 2: Recursive traversal completeness**
   * **Validates: Requirements 2.1, 2.4**
   * 
   * For any directory structure, the scanner should discover all files in all subdirectories,
   * with the count of discovered files equal to the actual number of files present.
   */
  it('should discover all files in all subdirectories', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a random directory structure
        fc.array(
          fc.record({
            path: fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), { minLength: 1, maxLength: 3 }),
            fileName: fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|json|md)$/),
            content: fc.string({ maxLength: 100 })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (fileSpecs) => {
          // Create a unique test directory for this iteration
          const iterationTestDir = join(tmpdir(), `digital-exorcist-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
          await fs.mkdir(iterationTestDir, { recursive: true });

          try {
            // Create the directory structure
            const createdFiles: string[] = [];
            
            for (const spec of fileSpecs) {
              const dirPath = join(iterationTestDir, ...spec.path);
              await fs.mkdir(dirPath, { recursive: true });
              
              const filePath = join(dirPath, spec.fileName);
              await fs.writeFile(filePath, spec.content);
              createdFiles.push(filePath);
            }

            // Scan the directory
            const scanner = new FileScanner();
            const results = await scanner.scanDirectory(iterationTestDir);

            // Verify all files were discovered
            expect(results.length).toBe(createdFiles.length);
            
            // Verify each created file is in the results
            const resultPaths = new Set(results.map(r => r.path));
            for (const createdFile of createdFiles) {
              expect(resultPaths.has(createdFile)).toBe(true);
            }
          } finally {
            // Clean up this iteration's test directory
            await fs.rm(iterationTestDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 3: Metadata collection completeness**
   * **Validates: Requirements 2.2**
   * 
   * For any scanned file, the result should include path, size, and last modified date
   * with all fields populated with valid values.
   */
  it('should collect complete metadata for all files', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random files with known properties
        fc.array(
          fc.record({
            fileName: fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|json|md)$/),
            content: fc.string({ maxLength: 1000 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (fileSpecs) => {
          // Create a unique test directory for this iteration
          const iterationTestDir = join(tmpdir(), `digital-exorcist-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
          await fs.mkdir(iterationTestDir, { recursive: true });

          try {
            // Create files
            for (const spec of fileSpecs) {
              const filePath = join(iterationTestDir, spec.fileName);
              await fs.writeFile(filePath, spec.content);
            }

            // Scan the directory
            const scanner = new FileScanner();
            const results = await scanner.scanDirectory(iterationTestDir);

            // Verify all files have complete metadata
            for (const result of results) {
              // Path should be a non-empty string
              expect(result.path).toBeTruthy();
              expect(typeof result.path).toBe('string');
              
              // Size should be a non-negative number
              expect(typeof result.size).toBe('number');
              expect(result.size).toBeGreaterThanOrEqual(0);
              
              // lastModified should be a valid Date
              expect(result.lastModified).toBeInstanceOf(Date);
              expect(result.lastModified.getTime()).not.toBeNaN();
              
              // Verify size matches actual file size
              const stats = await fs.stat(result.path);
              expect(result.size).toBe(stats.size);
            }
          } finally {
            // Clean up
            await fs.rm(iterationTestDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 4: Error resilience during scanning**
   * **Validates: Requirements 2.3**
   * 
   * For any directory containing inaccessible files, the scanner should continue scanning
   * and return results for all accessible files.
   */
  it('should continue scanning despite inaccessible files', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a mix of accessible and inaccessible file scenarios
        fc.record({
          accessibleFileCount: fc.integer({ min: 1, max: 10 }),
          inaccessibleDirCount: fc.integer({ min: 0, max: 3 })
        }),
        async ({ accessibleFileCount, inaccessibleDirCount }) => {
          // Create a unique test directory for this iteration
          const iterationTestDir = join(tmpdir(), `digital-exorcist-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
          await fs.mkdir(iterationTestDir, { recursive: true });

          try {
            // Create accessible files with unique names
            const createdAccessibleFiles: string[] = [];
            for (let i = 0; i < accessibleFileCount; i++) {
              const fileName = `accessible-file-${i}.txt`;
              const filePath = join(iterationTestDir, fileName);
              await fs.writeFile(filePath, `content-${i}`);
              createdAccessibleFiles.push(filePath);
            }

            // Create inaccessible directories (simulate by creating directories with no read permissions)
            // Note: On Windows, permission manipulation is limited, so we'll create directories
            // and then try to make them inaccessible
            const errorEvents: Array<{ path: string; error: string }> = [];
            const inaccessibleDirs: string[] = [];
            
            for (let i = 0; i < inaccessibleDirCount; i++) {
              const dirName = `inaccessible-dir-${i}`;
              const dirPath = join(iterationTestDir, dirName);
              await fs.mkdir(dirPath, { recursive: true });
              inaccessibleDirs.push(dirName);
              
              // Create a file inside the directory
              const filePath = join(dirPath, 'file.txt');
              await fs.writeFile(filePath, 'content');
              
              // Try to make the directory inaccessible (this may not work on all platforms)
              try {
                await fs.chmod(dirPath, 0o000);
              } catch (error) {
                // If we can't change permissions, skip this part
                // The test will still verify that accessible files are found
              }
            }

            // Scan the directory
            const scanner = new FileScanner();
            
            // Listen for error events
            scanner.on('error', (errorInfo) => {
              errorEvents.push(errorInfo);
            });

            const results = await scanner.scanDirectory(iterationTestDir);

            // Verify all accessible files were discovered
            // The scanner should find at least the accessible files we created
            expect(results.length).toBeGreaterThanOrEqual(createdAccessibleFiles.length);
            
            // Verify each accessible file is in the results
            const resultPaths = new Set(results.map(r => r.path));
            for (const accessibleFile of createdAccessibleFiles) {
              expect(resultPaths.has(accessibleFile)).toBe(true);
            }

            // The scanner should have completed without throwing an error
            // (errors should be logged/emitted, not thrown)
            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);

            // Clean up: restore permissions before deletion
            for (let i = 0; i < inaccessibleDirCount; i++) {
              const dirName = `inaccessible-dir-${i}`;
              const dirPath = join(iterationTestDir, dirName);
              try {
                await fs.chmod(dirPath, 0o755);
              } catch (error) {
                // Ignore errors during cleanup
              }
            }
          } finally {
            // Clean up
            try {
              await fs.rm(iterationTestDir, { recursive: true, force: true });
            } catch (error) {
              // Ignore cleanup errors
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
