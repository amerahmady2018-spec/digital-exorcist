/**
 * Story Mode Entity Data
 * 
 * Predefined fake file entities for the Story Mode guided ritual experience.
 * These entities have rich lore, stats, and visual presentation for the narrative.
 * NO real file system access occurs - all data is simulated.
 */

import type { MonsterType } from '../../shared/types';

/**
 * Threat level for display purposes in Story Mode
 */
export type ThreatLevel = 'Low' | 'Medium' | 'High';

/**
 * Story Entity - A fake file represented as a supernatural creature
 * with lore, stats, and visual presentation for Story Mode
 */
export interface StoryEntity {
  /** Unique identifier for the entity */
  id: string;
  /** Display name of the entity */
  name: string;
  /** Monster type classification (Ghost, Demon, Zombie) */
  type: MonsterType;
  /** Path to the entity's image asset */
  image: string;
  /** Health points for battle */
  hp: number;
  /** Display threat level */
  threatLevel: ThreatLevel;
  /** Narrative lore description */
  lore: string;
  /** Fake file path (for display, not real) */
  fakeFilePath: string;
  /** Fake file size in bytes (for battle HP calculation compatibility) */
  fakeFileSize: number;
}

/**
 * Predefined Story Mode entities
 * 3 entities representing Ghost, Demon, and Zombie types
 * Ordered by increasing difficulty for tutorial progression
 */
// Import monster images
import ghostImg from '../../assets/images/ghost.png';
import demonImg from '../../assets/images/demon.png';
import zombieImg from '../../assets/images/zombie.png';

export const STORY_ENTITIES: StoryEntity[] = [
  // Level 1 - Ghost (easiest)
  {
    id: 'story-ghost-1',
    name: 'The Forgotten Log',
    type: 'ghost',
    image: ghostImg,
    hp: 75,
    threatLevel: 'Low',
    lore: 'An ancient log file from 2019, abandoned and forgotten in the depths of your system. It whispers of errors long past, clinging to existence despite serving no purpose. Its spectral presence drains your storage slowly, a reminder of debugging sessions that have faded from memory.',
    fakeFilePath: 'C:/System/Logs/old_error_2019.log',
    fakeFileSize: 2.5 * 1024 * 1024, // 2.5MB - bigger so it survives a few hits
  },
  // Level 2 - Zombie (medium)
  {
    id: 'story-zombie-1',
    name: 'The Duplicate Shade',
    type: 'zombie',
    image: zombieImg,
    hp: 80,
    threatLevel: 'Medium',
    lore: 'A copy of a copy of a copy. This file exists in multiple places across your system, each instance unaware of the others, mindlessly duplicating whenever you reorganize. It shambles through your folders, leaving identical corpses in its wake.',
    fakeFilePath: 'C:/Photos/Copy of IMG_2024(1).jpg',
    fakeFileSize: 8.5 * 1024 * 1024, // 8.5MB - medium zombie
  },
  // Level 3 - Demon (hardest)
  {
    id: 'story-demon-1',
    name: 'The Bloated Archive',
    type: 'demon',
    image: demonImg,
    hp: 150,
    threatLevel: 'High',
    lore: 'A massive archive that grew beyond control, consuming disk space with insatiable hunger. Once a simple backup, it has evolved into a monstrous entity that devours gigabytes without remorse. Its bulk slows all who approach, and its presence weighs heavy on your system.',
    fakeFilePath: 'D:/Downloads/installer_v2_backup.zip',
    fakeFileSize: 12 * 1024 * 1024, // 12MB - challenging but beatable (~120 HP)
  },
];

/**
 * Get a story entity by ID
 */
export function getStoryEntityById(id: string): StoryEntity | undefined {
  return STORY_ENTITIES.find(entity => entity.id === id);
}

/**
 * Get all story entities (returns a copy to prevent mutation)
 */
export function getAllStoryEntities(): StoryEntity[] {
  return [...STORY_ENTITIES];
}
