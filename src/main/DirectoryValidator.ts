import { access, stat } from 'fs/promises';
import { constants } from 'fs';

/**
 * Validates that a directory path exists and is accessible
 * @param dirPath - The directory path to validate
 * @returns true if the directory exists and is accessible, false otherwise
 */
export async function validateDirectory(dirPath: string): Promise<boolean> {
  try {
    // Check if path is accessible
    await access(dirPath, constants.R_OK);
    
    // Check if path is a directory
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch {
    // Path doesn't exist or is not accessible
    return false;
  }
}
