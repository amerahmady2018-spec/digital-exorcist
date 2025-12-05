import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { FileClassifier } from './FileClassifier';
import { FileScanResult, MonsterType } from '../shared/types';

describe('FileClassifier', () => {
  const classifier = new FileClassifier();

  /**
   * **Feature: digital-exorcist, Property 5: Ghost classification by age**
   * **Validates: Requirements 3.1**
   * 
   * For any file with last modified date more than 6 months ago,
   * if not whitelisted, it should be classified as a Ghost.
   */
  it('classifies files older than 6 months as ghosts', async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 1 }),
          size: fc.nat(),
          lastModified: fc.date({ max: new Date(sixMonthsAgo.getTime() - 1) })
        }),
        async (file: FileScanResult) => {
          // Provide unique hash to avoid duplicate detection
          const fileWithHash = { ...file, hash: 'unique-hash-' + file.path };
          
          const classified = await classifier.classifyFiles([fileWithHash], new Set(), false);
          
          // File should be classified as Ghost
          expect(classified.length).toBe(1);
          expect(classified[0].classifications).toContain(MonsterType.Ghost);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 6: Demon classification by size**
   * **Validates: Requirements 3.2**
   * 
   * For any file with size exceeding 500MB, if not whitelisted,
   * it should be classified as a Demon.
   */
  it('classifies files larger than 500MB as demons', async () => {
    const DEMON_SIZE = 500 * 1024 * 1024; // 500MB

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 1 }),
          size: fc.integer({ min: DEMON_SIZE + 1, max: DEMON_SIZE * 10 }),
          lastModified: fc.date()
        }),
        async (file: FileScanResult) => {
          // Provide unique hash to avoid duplicate detection
          const fileWithHash = { ...file, hash: 'unique-hash-' + file.path };
          
          const classified = await classifier.classifyFiles([fileWithHash], new Set(), false);
          
          // File should be classified as Demon
          expect(classified.length).toBe(1);
          expect(classified[0].classifications).toContain(MonsterType.Demon);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 7: Zombie classification by content**
   * **Validates: Requirements 3.3, 11.1, 11.2**
   * 
   * For any two files with identical content hashes, if not whitelisted,
   * both should be classified as Zombies and grouped together.
   */
  it('classifies files with identical hashes as zombies', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.record({
            path: fc.string({ minLength: 1 }),
            size: fc.nat(),
            lastModified: fc.date()
          }),
          fc.record({
            path: fc.string({ minLength: 1 }),
            size: fc.nat(),
            lastModified: fc.date()
          }),
          fc.hexaString({ minLength: 64, maxLength: 64 })
        ),
        async ([file1, file2, sharedHash]) => {
          // Ensure paths are different
          fc.pre(file1.path !== file2.path);
          
          // Both files have the same hash (duplicate content)
          const filesWithHash = [
            { ...file1, hash: sharedHash },
            { ...file2, hash: sharedHash }
          ];
          
          const classified = await classifier.classifyFiles(filesWithHash, new Set(), false);
          
          // Both files should be classified as Zombies
          const zombies = classified.filter(f => f.classifications.includes(MonsterType.Zombie));
          expect(zombies.length).toBe(2);
          
          // Both should have the same duplicateGroup
          expect(zombies[0].duplicateGroup).toBe(sharedHash);
          expect(zombies[1].duplicateGroup).toBe(sharedHash);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 8: Multiple classification accumulation**
   * **Validates: Requirements 3.4**
   * 
   * For any file meeting multiple classification criteria (e.g., old AND large),
   * all applicable classifications should be assigned to that file.
   */
  it('assigns multiple classifications to files meeting multiple criteria', async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const DEMON_SIZE = 500 * 1024 * 1024; // 500MB

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 1 }),
          size: fc.integer({ min: DEMON_SIZE + 1, max: DEMON_SIZE * 10 }),
          lastModified: fc.date({ max: new Date(sixMonthsAgo.getTime() - 1) })
        }),
        async (file: FileScanResult) => {
          // File is both old (Ghost) and large (Demon)
          const fileWithHash = { ...file, hash: 'unique-hash-' + file.path };
          
          const classified = await classifier.classifyFiles([fileWithHash], new Set(), false);
          
          // File should have both classifications
          expect(classified.length).toBe(1);
          expect(classified[0].classifications).toContain(MonsterType.Ghost);
          expect(classified[0].classifications).toContain(MonsterType.Demon);
          expect(classified[0].classifications.length).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 9: Whitelist exclusion**
   * **Validates: Requirements 3.5, 6.4**
   * 
   * For any file on the whitelist, it should be excluded from all classifications
   * regardless of its age, size, or content.
   */
  it('excludes whitelisted files from classification', async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const DEMON_SIZE = 500 * 1024 * 1024; // 500MB

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 1 }),
          size: fc.integer({ min: DEMON_SIZE + 1, max: DEMON_SIZE * 10 }),
          lastModified: fc.date({ max: new Date(sixMonthsAgo.getTime() - 1) })
        }),
        async (file: FileScanResult) => {
          // File meets multiple criteria but is whitelisted
          const fileWithHash = { ...file, hash: 'unique-hash-' + file.path };
          const whitelist = new Set([file.path]);
          
          const classified = await classifier.classifyFiles([fileWithHash], whitelist, false);
          
          // File should not be classified at all
          expect(classified.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
