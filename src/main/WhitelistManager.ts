import { promises as fs } from 'fs';
import { join } from 'path';

export class WhitelistManager {
  private readonly whitelistFilePath: string;
  private readonly whitelistDir: string;
  private whitelist: Set<string>;

  constructor(baseDir: string = '.') {
    this.whitelistDir = join(baseDir, '.digital-exorcist');
    this.whitelistFilePath = join(this.whitelistDir, 'whitelist.json');
    this.whitelist = new Set<string>();
  }

  /**
   * Loads the whitelist from disk on startup
   * Creates a new whitelist file if it doesn't exist
   */
  async load(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.whitelistDir, { recursive: true });

      // Try to read the whitelist file
      try {
        const content = await fs.readFile(this.whitelistFilePath, 'utf-8');
        const data = JSON.parse(content);
        this.whitelist = new Set(data.files || []);
      } catch (error) {
        // File doesn't exist or is corrupted, create new one
        await this.save();
      }
    } catch (error) {
      console.error('Error loading whitelist:', error);
      throw error;
    }
  }

  /**
   * Saves the current whitelist to disk
   */
  private async save(): Promise<void> {
    try {
      const data = {
        files: Array.from(this.whitelist)
      };
      await fs.writeFile(this.whitelistFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving whitelist:', error);
      throw error;
    }
  }

  /**
   * Adds a file path to the whitelist
   * @param filePath - The file path to add
   */
  async add(filePath: string): Promise<void> {
    this.whitelist.add(filePath);
    await this.save();
  }

  /**
   * Removes a file path from the whitelist
   * @param filePath - The file path to remove
   */
  async remove(filePath: string): Promise<void> {
    this.whitelist.delete(filePath);
    await this.save();
  }

  /**
   * Checks if a file path is in the whitelist
   * @param filePath - The file path to check
   * @returns True if the file is whitelisted
   */
  has(filePath: string): boolean {
    return this.whitelist.has(filePath);
  }

  /**
   * Gets all whitelisted file paths
   * @returns Array of whitelisted file paths
   */
  getAll(): string[] {
    return Array.from(this.whitelist);
  }

  /**
   * Gets the whitelist as a Set for efficient lookups
   * @returns Set of whitelisted file paths
   */
  getSet(): Set<string> {
    return new Set(this.whitelist);
  }
}
