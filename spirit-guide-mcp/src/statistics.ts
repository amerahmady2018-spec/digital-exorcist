/**
 * Statistics module for Spirit Guide MCP Server
 *
 * Reads and aggregates data from The Digital Exorcist's graveyard log
 * and provides thematic responses about file management statistics.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Monster types matching the main application
export enum MonsterType {
  Ghost = 'ghost',
  Demon = 'demon',
  Zombie = 'zombie',
}

// Action types from the main application
export enum ActionType {
  Banish = 'banish',
  Resurrect = 'resurrect',
  Restore = 'restore',
}

// Log entry structure
export interface LogEntry {
  timestamp: string;
  action: ActionType;
  filePath: string;
  originalPath?: string;
  graveyardPath?: string;
  classifications: MonsterType[];
  fileSize: number;
}

// Statistics structure
export interface MCPStatistics {
  totalFiles: number;
  ghostCount: number;
  demonCount: number;
  zombieCount: number;
  totalSize: number;
  graveyardSize: number;
  banishedCount: number;
  restoredCount: number;
  ghostSize: number;
  demonSize: number;
  zombieSize: number;
}


/**
 * Finds the graveyard log file path
 * Searches in common locations for The Digital Exorcist data
 */
async function findLogFilePath(): Promise<string | null> {
  const possiblePaths = [
    // Current working directory
    join(process.cwd(), '.digital-exorcist', 'graveyard-log.json'),
    // Home directory
    join(homedir(), '.digital-exorcist', 'graveyard-log.json'),
    // Parent directory (for when running from spirit-guide-mcp folder)
    join(process.cwd(), '..', '.digital-exorcist', 'graveyard-log.json'),
  ];

  for (const logPath of possiblePaths) {
    try {
      await fs.access(logPath);
      return logPath;
    } catch {
      // Path doesn't exist, try next
    }
  }

  return null;
}

/**
 * Reads log entries from the graveyard log file
 */
async function readLogEntries(): Promise<LogEntry[]> {
  const logPath = await findLogFilePath();

  if (!logPath) {
    return [];
  }

  try {
    const content = await fs.readFile(logPath, 'utf-8');
    const log = JSON.parse(content);
    return log.entries || [];
  } catch {
    return [];
  }
}

/**
 * Calculates statistics from log entries
 */
export function calculateStatistics(entries: LogEntry[]): MCPStatistics {
  const stats: MCPStatistics = {
    totalFiles: 0,
    ghostCount: 0,
    demonCount: 0,
    zombieCount: 0,
    totalSize: 0,
    graveyardSize: 0,
    banishedCount: 0,
    restoredCount: 0,
    ghostSize: 0,
    demonSize: 0,
    zombieSize: 0,
  };

  for (const entry of entries) {
    const fileSize = entry.fileSize || 0;
    const classifications = entry.classifications || [];

    if (entry.action === ActionType.Banish) {
      stats.banishedCount++;
      stats.graveyardSize += fileSize;

      // Count by classification type (each classification counted once per occurrence)
      // Size is counted once per file that has that classification (not per occurrence)
      const hasGhost = classifications.includes(MonsterType.Ghost);
      const hasDemon = classifications.includes(MonsterType.Demon);
      const hasZombie = classifications.includes(MonsterType.Zombie);

      // Count occurrences of each classification type
      for (const classification of classifications) {
        switch (classification) {
          case MonsterType.Ghost:
            stats.ghostCount++;
            break;
          case MonsterType.Demon:
            stats.demonCount++;
            break;
          case MonsterType.Zombie:
            stats.zombieCount++;
            break;
        }
      }

      // Add file size once per classification type present (not per occurrence)
      if (hasGhost) {
        stats.ghostSize += fileSize;
      }
      if (hasDemon) {
        stats.demonSize += fileSize;
      }
      if (hasZombie) {
        stats.zombieSize += fileSize;
      }
    } else if (entry.action === ActionType.Restore || entry.action === ActionType.Resurrect) {
      stats.restoredCount++;
      // Subtract from graveyard size when restored
      stats.graveyardSize = Math.max(0, stats.graveyardSize - fileSize);
    }

    stats.totalFiles++;
    stats.totalSize += fileSize;
  }

  return stats;
}

/**
 * Gets current statistics from the graveyard log
 */
export async function getStatistics(): Promise<MCPStatistics> {
  const entries = await readLogEntries();
  return calculateStatistics(entries);
}


/**
 * Formats a byte size into a human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats statistics into a thematic Spirit Guide response
 */
export function formatSpiritGuideResponse(stats: MCPStatistics, query: string): string {
  const lowerQuery = query.toLowerCase();

  // Check for specific queries about monster types
  if (lowerQuery.includes('ghost')) {
    return formatGhostResponse(stats);
  }
  if (lowerQuery.includes('demon')) {
    return formatDemonResponse(stats);
  }
  if (lowerQuery.includes('zombie') || lowerQuery.includes('duplicate')) {
    return formatZombieResponse(stats);
  }
  if (lowerQuery.includes('banish') || lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
    return formatBanishmentResponse(stats);
  }
  if (lowerQuery.includes('restore') || lowerQuery.includes('undo') || lowerQuery.includes('resurrect')) {
    return formatRestorationResponse(stats);
  }
  if (lowerQuery.includes('size') || lowerQuery.includes('space') || lowerQuery.includes('storage')) {
    return formatSizeResponse(stats);
  }

  // Default: provide full overview
  return formatOverviewResponse(stats);
}

function formatGhostResponse(stats: MCPStatistics): string {
  return `👻 *The Spectral Archives Report*

The ethereal records reveal ${stats.ghostCount} ghost${stats.ghostCount !== 1 ? 's' : ''} have been encountered in your realm.

These ancient spirits (files untouched for ages) have consumed ${formatBytes(stats.ghostSize)} of your mortal storage.

${stats.ghostCount > 0
    ? 'The spirits of forgotten files linger... Perhaps it is time to release them to the void?'
    : 'Your realm is free of ghostly presences. The ancient files have been laid to rest.'}`;
}

function formatDemonResponse(stats: MCPStatistics): string {
  return `😈 *The Demonic Registry*

The infernal ledger shows ${stats.demonCount} demon${stats.demonCount !== 1 ? 's' : ''} lurking in your storage depths.

These massive entities have claimed ${formatBytes(stats.demonSize)} of your precious disk space.

${stats.demonCount > 0
    ? 'Beware! These bloated beasts grow ever hungrier. Consider an exorcism to reclaim your territory.'
    : 'No demons detected. Your storage remains uncorrupted by oversized entities.'}`;
}

function formatZombieResponse(stats: MCPStatistics): string {
  return `🧟 *The Undead Duplicate Census*

The necromantic scrolls count ${stats.zombieCount} zombie${stats.zombieCount !== 1 ? 's' : ''} shambling through your directories.

These duplicate abominations waste ${formatBytes(stats.zombieSize)} with their redundant existence.

${stats.zombieCount > 0
    ? 'The undead multiply! Each duplicate drains your resources. Time to thin the horde?'
    : 'No zombies detected. Your files exist in singular, uncorrupted forms.'}`;
}

function formatBanishmentResponse(stats: MCPStatistics): string {
  return `⚔️ *The Banishment Chronicle*

Your exorcism efforts have been ${stats.banishedCount > 10 ? 'legendary' : stats.banishedCount > 0 ? 'valiant' : 'dormant'}!

Total entities banished to the graveyard: ${stats.banishedCount}
Space reclaimed from the mortal realm: ${formatBytes(stats.graveyardSize)}

${stats.banishedCount > 0
    ? 'The graveyard grows with each victory. Your digital realm becomes cleaner.'
    : 'No banishments recorded yet. The hunt awaits, brave exorcist!'}`;
}

function formatRestorationResponse(stats: MCPStatistics): string {
  return `✨ *The Resurrection Records*

${stats.restoredCount} soul${stats.restoredCount !== 1 ? 's' : ''} ${stats.restoredCount !== 1 ? 'have' : 'has'} been granted a second chance at digital life.

${stats.restoredCount > 0
    ? 'Mercy has been shown to the banished. Some spirits return to serve once more.'
    : 'No resurrections performed. Once banished, they remain in the void.'}`;
}

function formatSizeResponse(stats: MCPStatistics): string {
  return `📊 *The Storage Grimoire*

Total space consumed by supernatural entities:
- 👻 Ghosts (old files): ${formatBytes(stats.ghostSize)}
- 😈 Demons (large files): ${formatBytes(stats.demonSize)}
- 🧟 Zombies (duplicates): ${formatBytes(stats.zombieSize)}

Current graveyard occupancy: ${formatBytes(stats.graveyardSize)}

${stats.totalSize > 0
    ? `The spirits have touched ${formatBytes(stats.totalSize)} of your realm in total.`
    : 'Your storage remains untouched by supernatural forces.'}`;
}

function formatOverviewResponse(stats: MCPStatistics): string {
  return `🔮 *Spirit Guide's Complete Vision*

Greetings, Digital Exorcist! Here is the state of your supernatural realm:

**Entity Census:**
- 👻 Ghosts (ancient files): ${stats.ghostCount}
- 😈 Demons (massive files): ${stats.demonCount}
- 🧟 Zombies (duplicates): ${stats.zombieCount}

**Exorcism Statistics:**
- Total banishments: ${stats.banishedCount}
- Resurrections granted: ${stats.restoredCount}
- Graveyard size: ${formatBytes(stats.graveyardSize)}

**Storage Impact:**
- Ghost realm: ${formatBytes(stats.ghostSize)}
- Demon domain: ${formatBytes(stats.demonSize)}
- Zombie wasteland: ${formatBytes(stats.zombieSize)}

${getWisdom(stats)}`;
}

function getWisdom(stats: MCPStatistics): string {
  const totalMonsters = stats.ghostCount + stats.demonCount + stats.zombieCount;

  if (totalMonsters === 0) {
    return '*The spirits whisper: Your realm is at peace. No supernatural threats detected.*';
  }
  if (stats.demonCount > stats.ghostCount && stats.demonCount > stats.zombieCount) {
    return '*The spirits warn: Demons dominate your storage! Large files threaten to consume all.*';
  }
  if (stats.zombieCount > stats.ghostCount && stats.zombieCount > stats.demonCount) {
    return '*The spirits advise: The undead multiply! Duplicate files spread like a plague.*';
  }
  if (stats.ghostCount > 0) {
    return '*The spirits murmur: Ancient files haunt your directories. Consider releasing them.*';
  }
  return '*The spirits observe: Balance exists in your realm. Continue your vigilant watch.*';
}
