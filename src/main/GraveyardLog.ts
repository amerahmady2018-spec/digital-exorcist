import { promises as fs } from 'fs';
import { join } from 'path';
import { LogEntry, ActionType } from '../shared/types';

export interface LogFilter {
  actionType?: ActionType;
  startDate?: Date;
  endDate?: Date;
}

export class GraveyardLog {
  private readonly logFilePath: string;
  private readonly logDir: string;

  constructor(baseDir: string = '.') {
    this.logDir = join(baseDir, '.digital-exorcist');
    this.logFilePath = join(this.logDir, 'graveyard-log.json');
  }

  /**
   * Ensures the log file exists and is valid
   * Creates a new log file if missing or corrupted
   */
  async ensureLogFile(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.logDir, { recursive: true });

      // Check if log file exists
      try {
        await fs.access(this.logFilePath);
        
        // Try to read and parse the file to verify it's valid
        const content = await fs.readFile(this.logFilePath, 'utf-8');
        JSON.parse(content);
      } catch (error) {
        // File doesn't exist or is corrupted, create new one
        await this.createNewLogFile();
      }
    } catch (error) {
      console.error('Error ensuring log file:', error);
      throw error;
    }
  }

  /**
   * Creates a new empty log file
   */
  private async createNewLogFile(): Promise<void> {
    const emptyLog = {
      entries: []
    };
    await fs.writeFile(this.logFilePath, JSON.stringify(emptyLog, null, 2), 'utf-8');
  }

  /**
   * Appends a new entry to the log file
   * @param entry - The log entry to append
   */
  async appendEntry(entry: LogEntry): Promise<void> {
    await this.ensureLogFile();

    try {
      // Read current log
      const content = await fs.readFile(this.logFilePath, 'utf-8');
      let log = JSON.parse(content);

      // Ensure log is an object with entries array
      if (typeof log !== 'object' || log === null || !Array.isArray(log.entries)) {
        log = { entries: [] };
      }

      // Append new entry
      log.entries.push(entry);

      // Write back to file
      await fs.writeFile(this.logFilePath, JSON.stringify(log, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error appending log entry:', error);
      throw error;
    }
  }

  /**
   * Retrieves log entries, optionally filtered
   * @param filter - Optional filter criteria
   * @returns Array of log entries in reverse chronological order
   */
  async getEntries(filter?: LogFilter): Promise<LogEntry[]> {
    await this.ensureLogFile();

    try {
      const content = await fs.readFile(this.logFilePath, 'utf-8');
      const log = JSON.parse(content);
      let entries: LogEntry[] = log.entries || [];

      // Apply filters if provided
      if (filter) {
        entries = this.applyFilter(entries, filter);
      }

      // Sort in reverse chronological order (newest first)
      entries.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });

      return entries;
    } catch (error) {
      console.error('Error reading log entries:', error);
      throw error;
    }
  }

  /**
   * Applies filter criteria to log entries
   */
  private applyFilter(entries: LogEntry[], filter: LogFilter): LogEntry[] {
    return entries.filter(entry => {
      // Filter by action type
      if (filter.actionType && entry.action !== filter.actionType) {
        return false;
      }

      // Filter by date range
      const entryDate = new Date(entry.timestamp);
      
      if (filter.startDate && entryDate < filter.startDate) {
        return false;
      }

      if (filter.endDate && entryDate > filter.endDate) {
        return false;
      }

      return true;
    });
  }
}
