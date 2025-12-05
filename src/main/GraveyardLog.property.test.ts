import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { GraveyardLog } from './GraveyardLog';
import { ActionType, LogEntry } from '../shared/types';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Property-Based Tests for GraveyardLog
 * 
 * These tests verify universal properties that should hold across all inputs
 * using the fast-check library for property-based testing.
 */

describe('GraveyardLog Property Tests', () => {
  const testDir = join(__dirname, '../../test-graveyard-log');
  let graveyardLog: GraveyardLog;

  beforeEach(async () => {
    // Create a fresh test directory for each test
    await fs.mkdir(testDir, { recursive: true });
    graveyardLog = new GraveyardLog(testDir);
    await graveyardLog.ensureLogFile();
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
   * **Feature: digital-exorcist, Property 19: Log chronological ordering**
   * 
   * For any set of log entries, when displayed, they should be ordered by 
   * timestamp in reverse chronological order (newest first).
   * 
   * **Validates: Requirements 7.3**
   */
  it('Property 19: Log entries should be returned in reverse chronological order', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of log entries with random timestamps
        fc.array(
          fc.record({
            timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            action: fc.constantFrom(ActionType.Banish, ActionType.Resurrect, ActionType.Restore),
            filePath: fc.string({ minLength: 1, maxLength: 100 }),
            originalPath: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            graveyardPath: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            fileSize: fc.option(fc.nat(), { nil: undefined })
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (entries) => {
          // Convert Date objects to ISO strings for LogEntry
          const logEntries: LogEntry[] = entries.map(entry => ({
            ...entry,
            timestamp: entry.timestamp.toISOString()
          }));

          // Append all entries to the log
          for (const entry of logEntries) {
            await graveyardLog.appendEntry(entry);
          }

          // Retrieve entries (should be in reverse chronological order)
          const retrievedEntries = await graveyardLog.getEntries();

          // Verify that entries are sorted in reverse chronological order
          for (let i = 0; i < retrievedEntries.length - 1; i++) {
            const currentDate = new Date(retrievedEntries[i].timestamp);
            const nextDate = new Date(retrievedEntries[i + 1].timestamp);
            
            // Current entry should be newer than or equal to the next entry
            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 20: Log filtering correctness**
   * 
   * For any filter criteria (action type or date range), the filtered log 
   * should include all and only entries matching the criteria.
   * 
   * **Validates: Requirements 7.4**
   */
  it('Property 20: Filtered log entries should match filter criteria exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of log entries with various properties
        fc.array(
          fc.record({
            timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            action: fc.constantFrom(ActionType.Banish, ActionType.Resurrect, ActionType.Restore),
            filePath: fc.string({ minLength: 1, maxLength: 100 }),
            originalPath: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            graveyardPath: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            fileSize: fc.option(fc.nat(), { nil: undefined })
          }),
          { minLength: 5, maxLength: 30 }
        ),
        // Generate a filter to apply
        fc.record({
          actionType: fc.option(fc.constantFrom(ActionType.Banish, ActionType.Resurrect, ActionType.Restore), { nil: undefined }),
          startDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), { nil: undefined }),
          endDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), { nil: undefined })
        }),
        async (entries, filter) => {
          // Create a fresh log instance for this iteration to avoid accumulation
          const iterationTestDir = join(testDir, `iteration-${Date.now()}-${Math.random()}`);
          await fs.mkdir(iterationTestDir, { recursive: true });
          const iterationLog = new GraveyardLog(iterationTestDir);
          await iterationLog.ensureLogFile();

          try {
            // Convert Date objects to ISO strings for LogEntry
            const logEntries: LogEntry[] = entries.map(entry => ({
              ...entry,
              timestamp: entry.timestamp.toISOString()
            }));

            // Append all entries to the log
            for (const entry of logEntries) {
              await iterationLog.appendEntry(entry);
            }

            // Retrieve filtered entries
            const filteredEntries = await iterationLog.getEntries(filter);

            // Verify that all filtered entries match the criteria
            for (const entry of filteredEntries) {
              // Check action type filter
              if (filter.actionType !== undefined) {
                expect(entry.action).toBe(filter.actionType);
              }

              // Check start date filter
              if (filter.startDate !== undefined) {
                const entryDate = new Date(entry.timestamp);
                expect(entryDate.getTime()).toBeGreaterThanOrEqual(filter.startDate.getTime());
              }

              // Check end date filter
              if (filter.endDate !== undefined) {
                const entryDate = new Date(entry.timestamp);
                expect(entryDate.getTime()).toBeLessThanOrEqual(filter.endDate.getTime());
              }
            }

            // Verify that no matching entries were excluded
            // Count how many entries from the original set should match the filter
            const expectedMatches = logEntries.filter(entry => {
              // Check action type
              if (filter.actionType !== undefined && entry.action !== filter.actionType) {
                return false;
              }

              // Check start date
              if (filter.startDate !== undefined) {
                const entryDate = new Date(entry.timestamp);
                if (entryDate.getTime() < filter.startDate.getTime()) {
                  return false;
                }
              }

              // Check end date
              if (filter.endDate !== undefined) {
                const entryDate = new Date(entry.timestamp);
                if (entryDate.getTime() > filter.endDate.getTime()) {
                  return false;
                }
              }

              return true;
            });

            // The number of filtered entries should match the expected count
            expect(filteredEntries.length).toBe(expectedMatches.length);

            return true;
          } finally {
            // Clean up iteration directory
            await fs.rm(iterationTestDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
