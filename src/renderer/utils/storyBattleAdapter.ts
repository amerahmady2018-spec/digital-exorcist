import type { StoryEntity } from '../data/storyEntities';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

/**
 * Story Battle Adapter
 * 
 * Converts StoryEntity to ClassifiedFile format for BattleArena compatibility.
 * Uses fake file paths to ensure no real filesystem operations occur.
 * 
 * Requirements: 1.3, 4.1
 */

/**
 * Convert a StoryEntity to ClassifiedFile format for battle system
 * 
 * @param entity - The story entity to convert
 * @returns ClassifiedFile compatible with BattleArena
 */
export function storyEntityToClassifiedFile(entity: StoryEntity): ClassifiedFile {
  return {
    path: entity.fakeFilePath,
    name: entity.name,
    size: entity.fakeFileSize,
    lastModified: new Date(),
    classifications: [entity.type as MonsterType],
  };
}

/**
 * Check if a file path is a fake story mode path
 * Used to prevent real filesystem operations during story mode
 * 
 * @param path - File path to check
 * @returns true if path is a fake story mode path
 */
export function isStoryModePath(path: string): boolean {
  return path.startsWith('/fake/story/') || path.startsWith('/fake/');
}
