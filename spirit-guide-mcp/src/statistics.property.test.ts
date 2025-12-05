/**
 * Property-based tests for Spirit Guide statistics
 *
 * **Feature: premium-exorcist-transformation, Property 29: Spirit Guide statistics accuracy**
 * **Feature: premium-exorcist-transformation, Property 30: Spirit Guide size aggregation accuracy**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateStatistics, MonsterType, ActionType, LogEntry } from './statistics.js';

// Arbitrary for generating valid MonsterType values
const monsterTypeArb = fc.constantFrom(
  MonsterType.Ghost,
  MonsterType.Demon,
  MonsterType.Zombie
);

// Arbitrary for generating valid ActionType values
const actionTypeArb = fc.constantFrom(
  ActionType.Banish,
  ActionType.Restore,
  ActionType.Resurrect
);

// Arbitrary for generating valid log entries
const logEntryArb: fc.Arbitrary<LogEntry> = fc.record({
  timestamp: fc.date().map(d => d.toISOString()),
  action: actionTypeArb,
  filePath: fc.string({ minLength: 1, maxLength: 100 }),
  originalPath: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  graveyardPath: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  classifications: fc.array(monsterTypeArb, { minLength: 0, maxLength: 3 }),
  fileSize: fc.nat({ max: 1000000000 }), // Up to 1GB
});

describe('Spirit Guide Statistics', () => {
  /**
   * **Feature: premium-exorcist-transformation, Property 29: Spirit Guide statistics accuracy**
   * **Validates: Requirements 16.4**
   *
   * For any Spirit Guide query requesting file counts, the returned counts
   * should match the actual number of files in each classification.
   */
  describe('Property 29: Spirit Guide statistics accuracy', () => {
    it('ghost count matches actual number of banished ghost files', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually count ghosts from banish actions
            let expectedGhostCount = 0;
            for (const entry of entries) {
              if (entry.action === ActionType.Banish && entry.classifications) {
                expectedGhostCount += entry.classifications.filter(
                  c => c === MonsterType.Ghost
                ).length;
              }
            }

            expect(stats.ghostCount).toBe(expectedGhostCount);
          }
        ),
        { numRuns: 100 }
      );
    });


    it('demon count matches actual number of banished demon files', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually count demons from banish actions
            let expectedDemonCount = 0;
            for (const entry of entries) {
              if (entry.action === ActionType.Banish && entry.classifications) {
                expectedDemonCount += entry.classifications.filter(
                  c => c === MonsterType.Demon
                ).length;
              }
            }

            expect(stats.demonCount).toBe(expectedDemonCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('zombie count matches actual number of banished zombie files', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually count zombies from banish actions
            let expectedZombieCount = 0;
            for (const entry of entries) {
              if (entry.action === ActionType.Banish && entry.classifications) {
                expectedZombieCount += entry.classifications.filter(
                  c => c === MonsterType.Zombie
                ).length;
              }
            }

            expect(stats.zombieCount).toBe(expectedZombieCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('banished count matches actual number of banish actions', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually count banish actions
            const expectedBanishedCount = entries.filter(
              e => e.action === ActionType.Banish
            ).length;

            expect(stats.banishedCount).toBe(expectedBanishedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('restored count matches actual number of restore/resurrect actions', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually count restore/resurrect actions
            const expectedRestoredCount = entries.filter(
              e => e.action === ActionType.Restore || e.action === ActionType.Resurrect
            ).length;

            expect(stats.restoredCount).toBe(expectedRestoredCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: premium-exorcist-transformation, Property 30: Spirit Guide size aggregation accuracy**
   * **Validates: Requirements 16.5**
   *
   * For any Spirit Guide query requesting size totals, the returned totals
   * should equal the sum of file sizes in each classification.
   */
  describe('Property 30: Spirit Guide size aggregation accuracy', () => {
    it('ghost size equals sum of banished ghost file sizes', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually sum ghost sizes from banish actions
            let expectedGhostSize = 0;
            for (const entry of entries) {
              if (entry.action === ActionType.Banish && entry.classifications) {
                const ghostCount = entry.classifications.filter(
                  c => c === MonsterType.Ghost
                ).length;
                if (ghostCount > 0) {
                  expectedGhostSize += (entry.fileSize || 0);
                }
              }
            }

            expect(stats.ghostSize).toBe(expectedGhostSize);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('demon size equals sum of banished demon file sizes', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually sum demon sizes from banish actions
            let expectedDemonSize = 0;
            for (const entry of entries) {
              if (entry.action === ActionType.Banish && entry.classifications) {
                const demonCount = entry.classifications.filter(
                  c => c === MonsterType.Demon
                ).length;
                if (demonCount > 0) {
                  expectedDemonSize += (entry.fileSize || 0);
                }
              }
            }

            expect(stats.demonSize).toBe(expectedDemonSize);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('zombie size equals sum of banished zombie file sizes', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually sum zombie sizes from banish actions
            let expectedZombieSize = 0;
            for (const entry of entries) {
              if (entry.action === ActionType.Banish && entry.classifications) {
                const zombieCount = entry.classifications.filter(
                  c => c === MonsterType.Zombie
                ).length;
                if (zombieCount > 0) {
                  expectedZombieSize += (entry.fileSize || 0);
                }
              }
            }

            expect(stats.zombieSize).toBe(expectedZombieSize);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('total size equals sum of all file sizes', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Manually sum all file sizes
            const expectedTotalSize = entries.reduce(
              (sum, entry) => sum + (entry.fileSize || 0),
              0
            );

            expect(stats.totalSize).toBe(expectedTotalSize);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('graveyard size is non-negative', () => {
      fc.assert(
        fc.property(
          fc.array(logEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const stats = calculateStatistics(entries);

            // Graveyard size should never be negative
            expect(stats.graveyardSize).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
