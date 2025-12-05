/**
 * Simulated File Data for Guided Ritual Mode
 * 
 * This module provides fake file data for the demo/tutorial mode.
 * NO real file system access occurs when using this data.
 */

export interface SimulatedFile {
  id: string;
  fakePath: string;
  filename: string;
  extension: string;
  size: number;
  lastModified: Date;
  type: 'image' | 'video' | 'document' | 'archive' | 'executable' | 'other';
  entityType: 'ghost' | 'zombie' | 'demon';
  zone: string;
  flavorText: string;
}

/**
 * Curated set of simulated entities for the Guided Ritual demo
 * 3 Ghosts (old files), 2 Zombies (duplicates), 2 Demons (large files)
 */
export const SIMULATED_ENTITIES: SimulatedFile[] = [
  // === GHOSTS (Old Files) ===
  {
    id: 'ghost-1',
    fakePath: 'C:/Users/Exorcist/Downloads/setup_wizard_2019.exe',
    filename: 'setup_wizard_2019',
    extension: '.exe',
    size: 45 * 1024 * 1024, // 45 MB
    lastModified: new Date('2019-03-15'),
    type: 'executable',
    entityType: 'ghost',
    zone: 'Downloads Crypt',
    flavorText: 'A forgotten installer from a bygone era. Its purpose long fulfilled, yet it lingers...'
  },
  {
    id: 'ghost-2',
    fakePath: 'C:/Users/Exorcist/Documents/quarterly_report_Q2_2020.docx',
    filename: 'quarterly_report_Q2_2020',
    extension: '.docx',
    size: 2.5 * 1024 * 1024, // 2.5 MB
    lastModified: new Date('2020-07-22'),
    type: 'document',
    entityType: 'ghost',
    zone: 'Document Dungeon',
    flavorText: 'Ancient spreadsheets whisper of meetings past. The data within has lost all meaning...'
  },
  {
    id: 'ghost-3',
    fakePath: 'C:/Users/Exorcist/Desktop/vacation_notes_2018.txt',
    filename: 'vacation_notes_2018',
    extension: '.txt',
    size: 12 * 1024, // 12 KB
    lastModified: new Date('2018-08-10'),
    type: 'document',
    entityType: 'ghost',
    zone: 'Desktop Wasteland',
    flavorText: 'Memories of sun and sand, now just bytes gathering digital dust...'
  },

  // === ZOMBIES (Duplicates) ===
  {
    id: 'zombie-1',
    fakePath: 'C:/Users/Exorcist/Pictures/photo_backup_copy(2).jpg',
    filename: 'photo_backup_copy(2)',
    extension: '.jpg',
    size: 8 * 1024 * 1024, // 8 MB
    lastModified: new Date('2023-01-15'),
    type: 'image',
    entityType: 'zombie',
    zone: 'Picture Purgatory',
    flavorText: 'A clone of a clone. This undead copy shambles alongside its identical siblings...'
  },
  {
    id: 'zombie-2',
    fakePath: 'C:/Users/Exorcist/Downloads/project_final_FINAL_v3.zip',
    filename: 'project_final_FINAL_v3',
    extension: '.zip',
    size: 156 * 1024 * 1024, // 156 MB
    lastModified: new Date('2023-06-20'),
    type: 'archive',
    entityType: 'zombie',
    zone: 'Downloads Crypt',
    flavorText: 'How many "finals" must exist? This duplicate archive refuses to stay buried...'
  },

  // === DEMONS (Large Files) ===
  {
    id: 'demon-1',
    fakePath: 'C:/Users/Exorcist/Videos/screen_recording_unedited.mp4',
    filename: 'screen_recording_unedited',
    extension: '.mp4',
    size: 2.8 * 1024 * 1024 * 1024, // 2.8 GB
    lastModified: new Date('2024-02-10'),
    type: 'video',
    entityType: 'demon',
    zone: 'Video Void',
    flavorText: 'A massive beast consuming precious storage. Hours of unedited footage lurk within...'
  },
  {
    id: 'demon-2',
    fakePath: 'C:/Users/Exorcist/Downloads/game_installer_deluxe.iso',
    filename: 'game_installer_deluxe',
    extension: '.iso',
    size: 45 * 1024 * 1024 * 1024, // 45 GB
    lastModified: new Date('2023-11-05'),
    type: 'other',
    entityType: 'demon',
    zone: 'Downloads Crypt',
    flavorText: 'The mightiest of demons. This colossal ISO devours nearly 50GB of your realm...'
  }
];

import type { ClassifiedFile } from '../../shared/types';
import { MonsterType } from '../../shared/types';

/**
 * Convert SimulatedFile to ClassifiedFile format for compatibility with existing components
 */
export function simulatedToClassified(simulated: SimulatedFile): ClassifiedFile {
  const classificationMap: Record<string, MonsterType> = {
    ghost: MonsterType.Ghost,
    zombie: MonsterType.Zombie, 
    demon: MonsterType.Demon
  };
  
  return {
    path: simulated.fakePath,
    size: simulated.size,
    lastModified: simulated.lastModified,
    classifications: [classificationMap[simulated.entityType]]
  };
}

/**
 * Generate a curated encounter for Guided Ritual demo
 * Returns exactly 7 entities (3 ghosts, 2 zombies, 2 demons) in randomized order
 */
export function generateGuidedEncounter(): ClassifiedFile[] {
  // Shuffle the array for variety
  const shuffled = [...SIMULATED_ENTITIES].sort(() => Math.random() - 0.5);
  
  // Convert to ClassifiedFile format
  return shuffled.map(simulatedToClassified);
}

/**
 * Get simulated entity by ID (for detailed inspection)
 */
export function getSimulatedEntityById(id: string): SimulatedFile | undefined {
  return SIMULATED_ENTITIES.find(entity => entity.id === id);
}

/**
 * Get flavor text for a file path (used in Guided Ritual for narrative)
 */
export function getFlavorTextForPath(path: string): string {
  const entity = SIMULATED_ENTITIES.find(e => e.fakePath === path);
  return entity?.flavorText || 'A mysterious digital entity...';
}
