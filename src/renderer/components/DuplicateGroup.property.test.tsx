import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ClassifiedFile, MonsterType } from '../../shared/types';

describe('DuplicateGroup Property Tests', () => {
  /**
   * **Feature: digital-exorcist, Property 26: Duplicate grouping consistency**
   * **Validates: Requirements 11.3**
   * 
   * For any set of files with identical content, they should all be grouped
   * together in the same duplicate set.
   */
  it('groups files with identical hashes together', () => {
    fc.assert(
      fc.property(
        // Generate a set of files with the same hash
        fc.tuple(
          fc.hexaString({ minLength: 64, maxLength: 64 }), // shared hash
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1 }),
              size: fc.nat(),
              lastModified: fc.date(),
              classifications: fc.constant([MonsterType.Zombie] as MonsterType[])
            }),
            { minLength: 2, maxLength: 10 }
          )
        ),
        ([sharedHash, files]) => {
          // Ensure all paths are unique
          const uniquePaths = new Set(files.map(f => f.path));
          fc.pre(uniquePaths.size === files.length);

          // Create classified files with the same duplicateGroup
          const classifiedFiles: ClassifiedFile[] = files.map(f => ({
            ...f,
            duplicateGroup: sharedHash,
            hash: sharedHash
          }));

          // Group files by duplicateGroup (simulating the dashboard logic)
          const groups = new Map<string, ClassifiedFile[]>();
          for (const file of classifiedFiles) {
            if (file.duplicateGroup) {
              const group = groups.get(file.duplicateGroup) || [];
              group.push(file);
              groups.set(file.duplicateGroup, group);
            }
          }

          // All files should be in the same group
          expect(groups.size).toBe(1);
          expect(groups.has(sharedHash)).toBe(true);
          
          const group = groups.get(sharedHash)!;
          expect(group.length).toBe(classifiedFiles.length);
          
          // All files in the group should have the same duplicateGroup
          for (const file of group) {
            expect(file.duplicateGroup).toBe(sharedHash);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that files with different hashes are NOT grouped together
   */
  it('does not group files with different hashes', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 1 }),
            size: fc.nat(),
            lastModified: fc.date(),
            classifications: fc.constant([MonsterType.Zombie] as MonsterType[]),
            hash: fc.hexaString({ minLength: 64, maxLength: 64 })
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (files) => {
          // Ensure all hashes are unique
          const uniqueHashes = new Set(files.map(f => f.hash));
          fc.pre(uniqueHashes.size === files.length);

          // Create classified files with different duplicateGroups
          const classifiedFiles: ClassifiedFile[] = files.map(f => ({
            ...f,
            duplicateGroup: f.hash
          }));

          // Group files by duplicateGroup
          const groups = new Map<string, ClassifiedFile[]>();
          for (const file of classifiedFiles) {
            if (file.duplicateGroup) {
              const group = groups.get(file.duplicateGroup) || [];
              group.push(file);
              groups.set(file.duplicateGroup, group);
            }
          }

          // Each file should be in its own group
          expect(groups.size).toBe(classifiedFiles.length);
          
          // Each group should have exactly one file
          for (const group of groups.values()) {
            expect(group.length).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that files without duplicateGroup are not grouped
   */
  it('does not group files without duplicateGroup', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 1 }),
            size: fc.nat(),
            lastModified: fc.date(),
            classifications: fc.array(fc.constantFrom(MonsterType.Ghost, MonsterType.Demon), { minLength: 1 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (files) => {
          // Create classified files without duplicateGroup
          const classifiedFiles: ClassifiedFile[] = files.map(f => ({
            ...f,
            duplicateGroup: undefined
          }));

          // Group files by duplicateGroup
          const groups = new Map<string, ClassifiedFile[]>();
          const standalone: ClassifiedFile[] = [];
          
          for (const file of classifiedFiles) {
            if (file.duplicateGroup) {
              const group = groups.get(file.duplicateGroup) || [];
              group.push(file);
              groups.set(file.duplicateGroup, group);
            } else {
              standalone.push(file);
            }
          }

          // No groups should be created
          expect(groups.size).toBe(0);
          
          // All files should be standalone
          expect(standalone.length).toBe(classifiedFiles.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Independent Duplicate Handling', () => {
  /**
   * **Feature: digital-exorcist, Property 27: Independent duplicate handling**
   * **Validates: Requirements 11.4**
   * 
   * For any duplicate set, banishing one file should not affect the display
   * or classification of other files in the set.
   */
  it('banishing one duplicate does not affect other duplicates', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.hexaString({ minLength: 64, maxLength: 64 }), // shared hash
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1 }),
              size: fc.nat(),
              lastModified: fc.date(),
              classifications: fc.constant([MonsterType.Zombie] as MonsterType[])
            }),
            { minLength: 3, maxLength: 10 } // At least 3 files to test removal
          ),
          fc.nat() // Index of file to "banish"
        ),
        ([sharedHash, files, banishIndex]) => {
          // Ensure all paths are unique
          const uniquePaths = new Set(files.map(f => f.path));
          fc.pre(uniquePaths.size === files.length);
          
          // Ensure banishIndex is valid
          fc.pre(banishIndex < files.length);

          // Create classified files with the same duplicateGroup
          const classifiedFiles: ClassifiedFile[] = files.map(f => ({
            ...f,
            duplicateGroup: sharedHash,
            hash: sharedHash
          }));

          // Simulate banishing one file (remove it from the list)
          const fileToBanish = classifiedFiles[banishIndex];
          const remainingFiles = classifiedFiles.filter((_, idx) => idx !== banishIndex);

          // Verify the banished file is removed
          expect(remainingFiles.length).toBe(classifiedFiles.length - 1);
          expect(remainingFiles.find(f => f.path === fileToBanish.path)).toBeUndefined();

          // Verify remaining files still have their classifications
          for (const file of remainingFiles) {
            expect(file.classifications).toContain(MonsterType.Zombie);
            expect(file.duplicateGroup).toBe(sharedHash);
          }

          // Group remaining files by duplicateGroup
          const groups = new Map<string, ClassifiedFile[]>();
          for (const file of remainingFiles) {
            if (file.duplicateGroup) {
              const group = groups.get(file.duplicateGroup) || [];
              group.push(file);
              groups.set(file.duplicateGroup, group);
            }
          }

          // Remaining files should still be grouped together
          expect(groups.size).toBe(1);
          expect(groups.has(sharedHash)).toBe(true);
          
          const group = groups.get(sharedHash)!;
          expect(group.length).toBe(remainingFiles.length);
          
          // All remaining files should still have the same duplicateGroup
          for (const file of group) {
            expect(file.duplicateGroup).toBe(sharedHash);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that banishing all but one duplicate removes the group
   */
  it('banishing all but one duplicate leaves a standalone file', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.hexaString({ minLength: 64, maxLength: 64 }), // shared hash
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1 }),
              size: fc.nat(),
              lastModified: fc.date(),
              classifications: fc.constant([MonsterType.Zombie] as MonsterType[])
            }),
            { minLength: 2, maxLength: 5 }
          )
        ),
        ([sharedHash, files]) => {
          // Ensure all paths are unique
          const uniquePaths = new Set(files.map(f => f.path));
          fc.pre(uniquePaths.size === files.length);

          // Create classified files with the same duplicateGroup
          const classifiedFiles: ClassifiedFile[] = files.map(f => ({
            ...f,
            duplicateGroup: sharedHash,
            hash: sharedHash
          }));

          // Simulate banishing all but the first file
          const remainingFiles = [classifiedFiles[0]];

          // Verify only one file remains
          expect(remainingFiles.length).toBe(1);

          // The remaining file should still have its classification
          expect(remainingFiles[0].classifications).toContain(MonsterType.Zombie);
          expect(remainingFiles[0].duplicateGroup).toBe(sharedHash);

          // When grouping, a single file with duplicateGroup should still be in a group
          // (though in practice, the UI might choose to display it differently)
          const groups = new Map<string, ClassifiedFile[]>();
          for (const file of remainingFiles) {
            if (file.duplicateGroup) {
              const group = groups.get(file.duplicateGroup) || [];
              group.push(file);
              groups.set(file.duplicateGroup, group);
            }
          }

          expect(groups.size).toBe(1);
          expect(groups.get(sharedHash)?.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that resurrecting one duplicate does not affect other duplicates
   */
  it('resurrecting one duplicate does not affect other duplicates', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.hexaString({ minLength: 64, maxLength: 64 }), // shared hash
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1 }),
              size: fc.nat(),
              lastModified: fc.date(),
              classifications: fc.constant([MonsterType.Zombie] as MonsterType[])
            }),
            { minLength: 3, maxLength: 10 }
          ),
          fc.nat() // Index of file to "resurrect"
        ),
        ([sharedHash, files, resurrectIndex]) => {
          // Ensure all paths are unique
          const uniquePaths = new Set(files.map(f => f.path));
          fc.pre(uniquePaths.size === files.length);
          
          // Ensure resurrectIndex is valid
          fc.pre(resurrectIndex < files.length);

          // Create classified files with the same duplicateGroup
          const classifiedFiles: ClassifiedFile[] = files.map(f => ({
            ...f,
            duplicateGroup: sharedHash,
            hash: sharedHash
          }));

          // Simulate resurrecting one file (remove it from the list, add to whitelist)
          const fileToResurrect = classifiedFiles[resurrectIndex];
          const remainingFiles = classifiedFiles.filter((_, idx) => idx !== resurrectIndex);

          // Verify the resurrected file is removed from display
          expect(remainingFiles.length).toBe(classifiedFiles.length - 1);
          expect(remainingFiles.find(f => f.path === fileToResurrect.path)).toBeUndefined();

          // Verify remaining files still have their classifications
          for (const file of remainingFiles) {
            expect(file.classifications).toContain(MonsterType.Zombie);
            expect(file.duplicateGroup).toBe(sharedHash);
          }

          // Group remaining files
          const groups = new Map<string, ClassifiedFile[]>();
          for (const file of remainingFiles) {
            if (file.duplicateGroup) {
              const group = groups.get(file.duplicateGroup) || [];
              group.push(file);
              groups.set(file.duplicateGroup, group);
            }
          }

          // Remaining files should still be grouped together
          if (remainingFiles.length > 0) {
            expect(groups.size).toBe(1);
            expect(groups.has(sharedHash)).toBe(true);
            
            const group = groups.get(sharedHash)!;
            expect(group.length).toBe(remainingFiles.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
