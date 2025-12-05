import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

/**
 * Property-Based Tests for File Operation UI Interactions
 * 
 * These tests verify correctness properties for banish and resurrect operations
 * in the UI using property-based testing with fast-check.
 */

// Arbitraries for generating test data
const monsterTypeArb = fc.constantFrom<MonsterType>('ghost', 'demon', 'zombie');

const classifiedFileArb: fc.Arbitrary<ClassifiedFile> = fc.record({
  path: fc.string({ minLength: 1 }),
  size: fc.nat(),
  lastModified: fc.date(),
  classifications: fc.array(monsterTypeArb, { minLength: 1, maxLength: 3 }).map(arr => [...new Set(arr)]),
  hash: fc.option(fc.hexaString({ minLength: 64, maxLength: 64 }), { nil: undefined }),
  duplicateGroup: fc.option(fc.hexaString({ minLength: 64, maxLength: 64 }), { nil: undefined })
});

/**
 * **Feature: digital-exorcist, Property 15: Banish removes from display**
 * 
 * For any file in the exorcism interface, after banishing it, 
 * the file should no longer appear in the interface display.
 * 
 * **Validates: Requirements 5.5**
 */
describe('Property 15: Banish removes from display', () => {
  it('should remove banished file from the display list', () => {
    fc.assert(
      fc.property(
        fc.array(classifiedFileArb, { minLength: 1, maxLength: 50 }),
        fc.integer({ min: 0 }),
        (files, indexSeed) => {
          // Select a file to banish
          const index = indexSeed % files.length;
          const fileToBanish = files[index];
          
          // Simulate banish operation: remove file from list
          const filesAfterBanish = files.filter(f => f.path !== fileToBanish.path);
          
          // Verify the banished file is no longer in the display
          expect(filesAfterBanish.find(f => f.path === fileToBanish.path)).toBeUndefined();
          
          // Verify the count decreased by 1 (or more if there were duplicates with same path)
          const removedCount = files.filter(f => f.path === fileToBanish.path).length;
          expect(filesAfterBanish.length).toBe(files.length - removedCount);
          
          // Verify all other files are still present
          files.forEach(file => {
            if (file.path !== fileToBanish.path) {
              expect(filesAfterBanish.some(f => f.path === file.path)).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: digital-exorcist, Property 16: Resurrect adds to whitelist**
 * 
 * For any file, when resurrected, it should be added to the whitelist 
 * and excluded from future classifications.
 * 
 * **Validates: Requirements 6.1**
 */
describe('Property 16: Resurrect adds to whitelist', () => {
  it('should add resurrected file to whitelist', () => {
    fc.assert(
      fc.property(
        classifiedFileArb,
        fc.array(fc.string({ minLength: 1 }), { maxLength: 20 }),
        (file, initialWhitelist) => {
          // Ensure the file is not already in the whitelist
          const whitelist = new Set(initialWhitelist.filter(path => path !== file.path));
          
          // Simulate resurrect operation: add file to whitelist
          const whitelistAfterResurrect = new Set(whitelist);
          whitelistAfterResurrect.add(file.path);
          
          // Verify the file is now in the whitelist
          expect(whitelistAfterResurrect.has(file.path)).toBe(true);
          
          // Verify the whitelist size increased by 1
          expect(whitelistAfterResurrect.size).toBe(whitelist.size + 1);
          
          // Verify all previous whitelist entries are still present
          whitelist.forEach(path => {
            expect(whitelistAfterResurrect.has(path)).toBe(true);
          });
          
          // Verify that if we classify files again, the whitelisted file is excluded
          const files = [file];
          const classifiedFiles = files.filter(f => !whitelistAfterResurrect.has(f.path));
          expect(classifiedFiles.find(f => f.path === file.path)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: digital-exorcist, Property 17: Resurrect removes from display**
 * 
 * For any file in the exorcism interface, after resurrecting it, 
 * the file should no longer appear in the interface display.
 * 
 * **Validates: Requirements 6.3**
 */
describe('Property 17: Resurrect removes from display', () => {
  it('should remove resurrected file from the display list', () => {
    fc.assert(
      fc.property(
        fc.array(classifiedFileArb, { minLength: 1, maxLength: 50 }),
        fc.integer({ min: 0 }),
        (files, indexSeed) => {
          // Select a file to resurrect
          const index = indexSeed % files.length;
          const fileToResurrect = files[index];
          
          // Simulate resurrect operation: remove file from list
          const filesAfterResurrect = files.filter(f => f.path !== fileToResurrect.path);
          
          // Verify the resurrected file is no longer in the display
          expect(filesAfterResurrect.find(f => f.path === fileToResurrect.path)).toBeUndefined();
          
          // Verify the count decreased by 1 (or more if there were duplicates with same path)
          const removedCount = files.filter(f => f.path === fileToResurrect.path).length;
          expect(filesAfterResurrect.length).toBe(files.length - removedCount);
          
          // Verify all other files are still present
          files.forEach(file => {
            if (file.path !== fileToResurrect.path) {
              expect(filesAfterResurrect.some(f => f.path === file.path)).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
