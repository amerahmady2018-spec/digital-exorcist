import type { ClassifiedFile, MonsterType } from '../../shared/types';

/**
 * Entity utility functions for counting, space calculation, and formatting
 */

/**
 * Entity counts by type
 */
export interface EntityCounts {
  ghosts: number;
  zombies: number;
  demons: number;
  unknown: number;
}

/**
 * Count entities by their classification type
 * @param entities Array of classified files
 * @returns Object with counts for each entity type
 */
export function countEntities(entities: ClassifiedFile[]): EntityCounts {
  if (!Array.isArray(entities)) {
    return { ghosts: 0, zombies: 0, demons: 0, unknown: 0 };
  }
  return entities.reduce(
    (counts, entity) => {
      const types = entity.classifications || [];
      if (types.includes('ghost')) counts.ghosts++;
      else if (types.includes('zombie')) counts.zombies++;
      else if (types.includes('demon')) counts.demons++;
      else counts.unknown++;
      return counts;
    },
    { ghosts: 0, zombies: 0, demons: 0, unknown: 0 }
  );
}

/**
 * Calculate total space that could be recovered from entities
 * @param entities Array of classified files
 * @returns Total size in bytes
 */
export function calculateSpaceRecovered(entities: ClassifiedFile[]): number {
  if (!Array.isArray(entities)) return 0;
  return entities.reduce((total, entity) => total + (entity.size || 0), 0);
}

/**
 * Format file size to human-readable string
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.5 GB", "256 MB", "12 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  
  // Use 2 decimal places for GB and above, 1 for MB, 0 for KB and below
  const decimals = i >= 3 ? 2 : i >= 2 ? 1 : 0;
  
  return `${size.toFixed(decimals)} ${units[i]}`;
}

/**
 * Get the primary classification type for an entity
 * @param entity Classified file
 * @returns Primary monster type or 'unknown'
 */
export function getPrimaryType(entity: ClassifiedFile): MonsterType | 'unknown' {
  const types = entity.classifications || [];
  if (types.includes('ghost')) return 'ghost';
  if (types.includes('zombie')) return 'zombie';
  if (types.includes('demon')) return 'demon';
  return 'unknown';
}

/**
 * Get flavor text for an entity based on its type
 * @param type Monster type
 * @returns Flavor text string
 */
export function getEntityFlavorText(type: MonsterType | 'unknown'): string {
  const flavorTexts: Record<MonsterType | 'unknown', string[]> = {
    ghost: [
      'A forgotten relic from the past...',
      'Lingering in the shadows of time...',
      'Untouched for ages, gathering dust...',
      'A spectral remnant of days gone by...'
    ],
    zombie: [
      'A duplicate shambling through your system...',
      'An undead copy, consuming precious space...',
      'Multiple instances detected...',
      'A clone that refuses to die...'
    ],
    demon: [
      'A massive entity devouring your storage...',
      'A behemoth lurking in the depths...',
      'Consuming resources with insatiable hunger...',
      'A colossal presence demanding attention...'
    ],
    unknown: [
      'An unidentified anomaly...',
      'Something lurks here...',
      'Classification pending...',
      'A mysterious presence...'
    ]
  };

  const texts = flavorTexts[type];
  return texts[Math.floor(Math.random() * texts.length)];
}

/**
 * Get icon for entity type
 * @param type Monster type
 * @returns Emoji icon
 */
export function getEntityIcon(type: MonsterType | 'unknown'): string {
  const icons: Record<MonsterType | 'unknown', string> = {
    ghost: '👻',
    zombie: '🧟',
    demon: '👹',
    unknown: '❓'
  };
  return icons[type];
}

/**
 * Calculate file age in days
 * @param lastModified Last modified date
 * @returns Age in days
 */
export function calculateFileAge(lastModified: Date | string | number): number {
  const modifiedDate = new Date(lastModified);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - modifiedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format file age to human-readable string
 * @param lastModified Last modified date
 * @returns Formatted string (e.g., "3 days ago", "2 months ago", "1 year ago")
 */
export function formatFileAge(lastModified: Date | string | number): string {
  const days = calculateFileAge(lastModified);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Filter entities by type
 * @param entities Array of classified files
 * @param type Monster type to filter by
 * @returns Filtered array
 */
export function filterByType(entities: ClassifiedFile[], type: MonsterType): ClassifiedFile[] {
  if (!Array.isArray(entities)) return [];
  return entities.filter(entity => entity.classifications?.includes(type));
}

/**
 * Check if there's unknown risk in the entity set
 * @param entities Array of classified files
 * @returns True if any entity has no classification
 */
export function hasUnknownRisk(entities: ClassifiedFile[]): boolean {
  if (!Array.isArray(entities)) return false;
  return entities.some(entity => !entity.classifications || entity.classifications.length === 0);
}
