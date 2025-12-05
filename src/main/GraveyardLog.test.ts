import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { GraveyardLog } from './GraveyardLog';
import { LogEntry, ActionType, MonsterType } from '../shared/types';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('GraveyardLog', () => {
  const testBaseDir = '.test-graveyard-log';
  let graveyardLog: GraveyardLog;

  beforeEach(async () => {
    graveyardLog = new GraveyardLog(testBaseDir);
    await graveyardLog.ensureLogFile();
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
   * **Feature: digital-exorcist, Property 14: File operation logging completeness**
   * **Validates: Requirements 5.3, 6.2, 7.1, 7.2, 8.4**
   * 
   * For any file operation (banish, resurrect, restore), a log entry should be created
   * containing timestamp, action type, file path, and all relevant metadata.
   */
  it('logs all file operations with complete metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: fc.constantFrom(ActionType.Banish, ActionType.Resurrect, ActionType.Restore),
          filePath: fc.string({ minLength: 1 }),
          originalPath: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          graveyardPath: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          classifications: fc.option(
            fc.array(fc.constantFrom(MonsterType.Ghost, MonsterType.Demon, MonsterType.Zombie), { minLength: 1, maxLength: 3 }),
            { nil: undefined }
          ),
          fileSize: fc.option(fc.nat(), { nil: undefined })
        }),
        async (entryData) => {
          // Create a log entry with timestamp
          const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            action: entryData.action,
            filePath: entryData.filePath,
            originalPath: entryData.originalPath,
            graveyardPath: entryData.graveyardPath,
            classifications: entryData.classifications,
            fileSize: entryData.fileSize
          };

          // Append the entry
          await graveyardLog.appendEntry(entry);

          // Retrieve all entries
          const entries = await graveyardLog.getEntries();

          // Find the entry we just added
          const foundEntry = entries.find(e => 
            e.timestamp === entry.timestamp &&
            e.action === entry.action &&
            e.filePath === entry.filePath
          );

          // Verify the entry exists and has all required fields
          expect(foundEntry).toBeDefined();
          expect(foundEntry!.timestamp).toBe(entry.timestamp);
          expect(foundEntry!.action).toBe(entry.action);
          expect(foundEntry!.filePath).toBe(entry.filePath);
          
          // Verify optional fields match
          if (entry.originalPath !== undefined) {
            expect(foundEntry!.originalPath).toBe(entry.originalPath);
          }
          if (entry.graveyardPath !== undefined) {
            expect(foundEntry!.graveyardPath).toBe(entry.graveyardPath);
          }
          if (entry.classifications !== undefined) {
            expect(foundEntry!.classifications).toEqual(entry.classifications);
          }
          if (entry.fileSize !== undefined) {
            expect(foundEntry!.fileSize).toBe(entry.fileSize);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-exorcist, Property 21: Log recovery from corruption**
   * **Validates: Requirements 7.5**
   * 
   * For any corrupted or missing log file, the system should create a new valid
   * empty log file that can accept new entries.
   */
  it('recovers from corrupted log files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // Random corrupted content
        async (corruptedContent) => {
          // Write corrupted content to log file
          const logFilePath = join(testBaseDir, '.digital-exorcist', 'graveyard-log.json');
          await fs.writeFile(logFilePath, corruptedContent, 'utf-8');

          // Create a new GraveyardLog instance
          const newLog = new GraveyardLog(testBaseDir);
          
          // Ensure log file (should recover from corruption)
          await newLog.ensureLogFile();

          // Verify we can append a new entry
          const testEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            action: ActionType.Banish,
            filePath: '/test/file.txt'
          };

          await newLog.appendEntry(testEntry);

          // Verify we can read entries
          const entries = await newLog.getEntries();
          
          // Should have at least our test entry
          expect(entries.length).toBeGreaterThanOrEqual(1);
          
          // Find our entry
          const foundEntry = entries.find(e => e.filePath === testEntry.filePath);
          expect(foundEntry).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
