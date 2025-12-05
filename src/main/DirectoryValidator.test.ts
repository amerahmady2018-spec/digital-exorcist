import { describe, it, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { validateDirectory } from './DirectoryValidator';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * **Feature: digital-exorcist, Property 1: Directory validation correctness**
 * 
 * For any directory path, the validation function should return true if and only if 
 * the directory exists and is accessible on the file system.
 * 
 * **Validates: Requirements 1.2**
 */

describe('DirectoryValidator Property Tests', () => {
  let testBaseDir: string;

  beforeAll(async () => {
    // Create a temporary base directory for testing
    testBaseDir = join(tmpdir(), `digital-exorcist-test-${Date.now()}`);
    await mkdir(testBaseDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await rm(testBaseDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should return true for existing accessible directories', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/), // Valid directory name
        async (dirName) => {
          const dirPath = join(testBaseDir, dirName);
          
          // Create the directory
          await mkdir(dirPath, { recursive: true });
          
          // Validate should return true
          const result = await validateDirectory(dirPath);
          
          // Clean up
          await rm(dirPath, { recursive: true, force: true });
          
          return result === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return false for non-existent paths', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/), // Valid path component
        fc.nat(1000000), // Random number to ensure uniqueness
        async (pathComponent, randomNum) => {
          // Create a path that definitely doesn't exist
          const nonExistentPath = join(testBaseDir, `nonexistent-${pathComponent}-${randomNum}`);
          
          // Validate should return false
          const result = await validateDirectory(nonExistentPath);
          
          return result === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return false for files (not directories)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/), // Valid file name
        fc.string({ minLength: 1, maxLength: 100 }), // File content
        async (fileName, content) => {
          const filePath = join(testBaseDir, fileName);
          
          // Create a file (not a directory)
          await writeFile(filePath, content);
          
          // Validate should return false for files
          const result = await validateDirectory(filePath);
          
          // Clean up
          await rm(filePath, { force: true });
          
          return result === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle nested directory structures correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), { minLength: 1, maxLength: 5 }),
        async (pathComponents) => {
          const nestedPath = join(testBaseDir, ...pathComponents);
          
          // Create nested directory structure
          await mkdir(nestedPath, { recursive: true });
          
          // Validate should return true
          const result = await validateDirectory(nestedPath);
          
          // Clean up - remove the top-level directory we created
          await rm(join(testBaseDir, pathComponents[0]), { recursive: true, force: true });
          
          return result === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
