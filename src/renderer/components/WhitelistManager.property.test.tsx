import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { WhitelistManager } from '../../main/WhitelistManager';
import { promises as fs } from 'fs';

describe('WhitelistManager Property Tests', () => {
  const testBaseDir = '.test-whitelist-manager';
  let whitelistManager: WhitelistManager;

  beforeEach(async () => {
    whitelistManager = new WhitelistManager(testBaseDir);
    await whitelistManager.load();
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testBaseDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * **Feature: digital-exorcist, Property 18: Whitelist display completeness**
   * **Validates: Requirements 6.5**
   * 
   * For any file on the whitelist, it should appear in the whitelist view with its full path.
   */
  it('displays all whitelisted files with their full paths', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 200 }),
          { minLength: 1, maxLength: 50 }
        ).map(paths => Array.from(new Set(paths))), // Ensure unique paths
        async (filePaths) => {
          // Create a fresh whitelist for this test iteration
          const iterationDir = `${testBaseDir}-${Date.now()}-${Math.random()}`;
          const iterationWhitelist = new WhitelistManager(iterationDir);
          await iterationWhitelist.load();

          try {
            // Add all files to whitelist
            for (const filePath of filePaths) {
              await iterationWhitelist.add(filePath);
            }

            // Get all whitelisted files (simulating what the UI would display)
            const whitelistedFiles = iterationWhitelist.getAll();

            // Verify all files appear in the whitelist
            expect(whitelistedFiles.length).toBe(filePaths.length);

            // Verify each file has its full path
            for (const filePath of filePaths) {
              expect(whitelistedFiles).toContain(filePath);
            }

            // Verify no extra files appear
            for (const displayedPath of whitelistedFiles) {
              expect(filePaths).toContain(displayedPath);
            }
          } finally {
            // Clean up iteration directory
            try {
              await fs.rm(iterationDir, { recursive: true, force: true });
            } catch (error) {
              // Ignore cleanup errors
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Whitelist persists across loads
   */
  it('persists whitelisted files across manager instances', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 200 }),
          { minLength: 1, maxLength: 20 }
        ).map(paths => Array.from(new Set(paths))), // Ensure unique paths
        async (filePaths) => {
          const iterationDir = `${testBaseDir}-persist-${Date.now()}-${Math.random()}`;

          try {
            // Create first instance and add files
            const firstManager = new WhitelistManager(iterationDir);
            await firstManager.load();

            for (const filePath of filePaths) {
              await firstManager.add(filePath);
            }

            // Create second instance and load
            const secondManager = new WhitelistManager(iterationDir);
            await secondManager.load();

            // Verify all files are still present
            const loadedFiles = secondManager.getAll();
            expect(loadedFiles.length).toBe(filePaths.length);

            for (const filePath of filePaths) {
              expect(loadedFiles).toContain(filePath);
            }
          } finally {
            // Clean up iteration directory
            try {
              await fs.rm(iterationDir, { recursive: true, force: true });
            } catch (error) {
              // Ignore cleanup errors
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Removed files don't appear in whitelist
   */
  it('does not display files that have been removed from whitelist', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          toKeep: fc.array(
            fc.string({ minLength: 1, maxLength: 200 }),
            { minLength: 1, maxLength: 20 }
          ).map(paths => Array.from(new Set(paths))),
          toRemove: fc.array(
            fc.string({ minLength: 1, maxLength: 200 }),
            { minLength: 1, maxLength: 10 }
          ).map(paths => Array.from(new Set(paths)))
        }).filter(({ toKeep, toRemove }) => {
          // Ensure toKeep and toRemove are disjoint sets
          const keepSet = new Set(toKeep);
          return !toRemove.some(path => keepSet.has(path));
        }),
        async ({ toKeep, toRemove }) => {
          const iterationDir = `${testBaseDir}-remove-${Date.now()}-${Math.random()}`;
          const manager = new WhitelistManager(iterationDir);
          await manager.load();

          try {
            // Add all files
            const allFiles = [...toKeep, ...toRemove];
            for (const filePath of allFiles) {
              await manager.add(filePath);
            }

            // Remove specified files
            for (const filePath of toRemove) {
              await manager.remove(filePath);
            }

            // Get displayed files
            const displayedFiles = manager.getAll();

            // Verify only kept files appear
            expect(displayedFiles.length).toBe(toKeep.length);

            for (const filePath of toKeep) {
              expect(displayedFiles).toContain(filePath);
            }

            // Verify removed files don't appear
            for (const filePath of toRemove) {
              expect(displayedFiles).not.toContain(filePath);
            }
          } finally {
            // Clean up iteration directory
            try {
              await fs.rm(iterationDir, { recursive: true, force: true });
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
