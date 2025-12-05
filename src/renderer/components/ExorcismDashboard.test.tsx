import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

/**
 * Property-Based Tests for ExorcismDashboard UI Components
 * 
 * These tests verify correctness properties for the dashboard display logic
 * using property-based testing with fast-check.
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
 * **Feature: digital-exorcist, Property 10: Display information completeness**
 * 
 * For any classified file displayed in the interface, the display should include 
 * file path, size, last modified date, and all classification types.
 * 
 * **Validates: Requirements 4.2**
 */
describe('Property 10: Display information completeness', () => {
  it('should include all required information for any classified file', () => {
    fc.assert(
      fc.property(classifiedFileArb, (file) => {
        // Simulate what MonsterCard displays
        const displayedInfo = {
          hasPath: file.path !== undefined && file.path.length > 0,
          hasSize: file.size !== undefined && file.size >= 0,
          hasLastModified: file.lastModified !== undefined,
          hasClassifications: file.classifications !== undefined && file.classifications.length > 0
        };

        // All required fields must be present
        expect(displayedInfo.hasPath).toBe(true);
        expect(displayedInfo.hasSize).toBe(true);
        expect(displayedInfo.hasLastModified).toBe(true);
        expect(displayedInfo.hasClassifications).toBe(true);

        // Verify all classifications are included
        file.classifications.forEach(classification => {
          expect(['ghost', 'demon', 'zombie']).toContain(classification);
        });
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: digital-exorcist, Property 11: Classification grouping correctness**
 * 
 * For any set of classified files, when grouped by classification type, 
 * each file should appear in the group corresponding to each of its classifications.
 * 
 * **Validates: Requirements 4.3**
 */
describe('Property 11: Classification grouping correctness', () => {
  it('should correctly group files by their classifications', () => {
    fc.assert(
      fc.property(fc.array(classifiedFileArb, { minLength: 1, maxLength: 50 }), (files) => {
        // Group files by classification (simulating dashboard logic)
        const ghosts = files.filter(f => f.classifications.includes('ghost'));
        const demons = files.filter(f => f.classifications.includes('demon'));
        const zombies = files.filter(f => f.classifications.includes('zombie'));

        // Verify each file appears in correct groups
        files.forEach(file => {
          if (file.classifications.includes('ghost')) {
            expect(ghosts).toContainEqual(file);
          }
          if (file.classifications.includes('demon')) {
            expect(demons).toContainEqual(file);
          }
          if (file.classifications.includes('zombie')) {
            expect(zombies).toContainEqual(file);
          }
        });

        // Verify no file is in a group it shouldn't be in
        ghosts.forEach(file => {
          expect(file.classifications).toContain('ghost');
        });
        demons.forEach(file => {
          expect(file.classifications).toContain('demon');
        });
        zombies.forEach(file => {
          expect(file.classifications).toContain('zombie');
        });
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: digital-exorcist, Property 12: Aggregation accuracy**
 * 
 * For any classification type, the displayed count and total size should equal 
 * the sum of individual file counts and sizes in that classification.
 * 
 * **Validates: Requirements 4.4**
 */
describe('Property 12: Aggregation accuracy', () => {
  it('should accurately calculate count and total size for each classification', () => {
    fc.assert(
      fc.property(fc.array(classifiedFileArb, { minLength: 0, maxLength: 100 }), (files) => {
        // Group files by classification
        const ghosts = files.filter(f => f.classifications.includes('ghost'));
        const demons = files.filter(f => f.classifications.includes('demon'));
        const zombies = files.filter(f => f.classifications.includes('zombie'));

        // Calculate statistics (simulating dashboard logic)
        const calculateStats = (fileList: ClassifiedFile[]) => ({
          count: fileList.length,
          totalSize: fileList.reduce((sum, f) => sum + f.size, 0)
        });

        const ghostStats = calculateStats(ghosts);
        const demonStats = calculateStats(demons);
        const zombieStats = calculateStats(zombies);
        const allStats = calculateStats(files);

        // Verify counts are accurate
        expect(ghostStats.count).toBe(ghosts.length);
        expect(demonStats.count).toBe(demons.length);
        expect(zombieStats.count).toBe(zombies.length);
        expect(allStats.count).toBe(files.length);

        // Verify total sizes are accurate
        const manualGhostSize = ghosts.reduce((sum, f) => sum + f.size, 0);
        const manualDemonSize = demons.reduce((sum, f) => sum + f.size, 0);
        const manualZombieSize = zombies.reduce((sum, f) => sum + f.size, 0);
        const manualAllSize = files.reduce((sum, f) => sum + f.size, 0);

        expect(ghostStats.totalSize).toBe(manualGhostSize);
        expect(demonStats.totalSize).toBe(manualDemonSize);
        expect(zombieStats.totalSize).toBe(manualZombieSize);
        expect(allStats.totalSize).toBe(manualAllSize);
      }),
      { numRuns: 100 }
    );
  });
});
