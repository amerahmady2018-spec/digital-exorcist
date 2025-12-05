import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore, AppState } from '../../store/appStore';
import { CockpitArena } from '../CockpitArena';
import type { ClassifiedFile, MonsterType } from '../../../shared/types';

/**
 * InteractiveSingleBattleScreen - Battle for single file purge
 * 
 * Battle mechanics identical to Story Mode.
 * Uses fixed simulated stats - real file size has no influence.
 * Win = file purged, Loss = file remains untouched.
 */

// Fixed simulated stats for single file battles
const SIMULATED_BATTLE_SIZE = 3 * 1024 * 1024; // 3MB - moderate difficulty

interface FileInfo {
  path: string;
  name: string;
  size: number;
}

export const InteractiveSingleBattleScreen: React.FC = () => {
  const { transition } = useAppStore();
  const [battleEntity, setBattleEntity] = useState<ClassifiedFile | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  // Create simulated battle entity on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('interactiveSingleFile');
    if (!stored) return;

    const file: FileInfo = JSON.parse(stored);
    setFileInfo(file);

    // Determine entity type based on file characteristics (simplified)
    // In production, this would use actual file classification
    let entityType: MonsterType = 'ghost';
    if (file.size > 50 * 1024 * 1024) entityType = 'demon';
    else if (file.name.includes('copy') || file.name.includes('backup')) entityType = 'zombie';

    // Create simulated entity for battle (fixed stats)
    const simulatedEntity: ClassifiedFile = {
      path: file.path,
      size: SIMULATED_BATTLE_SIZE, // Use simulated size, not real
      lastModified: new Date(),
      classifications: [entityType]
    };

    setBattleEntity(simulatedEntity);
  }, []);

  const handleVictory = useCallback(async () => {
    if (!fileInfo) return;

    // Store file to purge and transition to executing
    sessionStorage.setItem('interactiveFilesToPurge', JSON.stringify([{
      path: fileInfo.path,
      fileName: fileInfo.name,
      size: fileInfo.size, // Use real size for actual operation
      lastModified: new Date(),
      classification: 'ghost' // Simplified
    }]));
    
    transition(AppState.INTERACTIVE_EXECUTING);
  }, [fileInfo, transition]);

  const handleDefeat = useCallback(() => {
    // File remains untouched - go to summary with no files purged
    sessionStorage.setItem('interactiveFilesToPurge', JSON.stringify([]));
    sessionStorage.setItem('interactiveBattleLost', 'true');
    transition(AppState.INTERACTIVE_SUMMARY);
  }, [transition]);

  const handleFlee = useCallback(() => {
    // Flee = file remains untouched
    sessionStorage.setItem('interactiveFilesToPurge', JSON.stringify([]));
    transition(AppState.INTERACTIVE_SINGLE_FILE);
  }, [transition]);

  if (!battleEntity) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <p className="text-gray-500 text-sm">Preparing confrontation...</p>
      </div>
    );
  }

  return (
    <CockpitArena
      monster={battleEntity}
      onVictory={handleVictory}
      onDefeat={handleDefeat}
      onFlee={handleFlee}
      mode="interactive"
    />
  );
};

export default InteractiveSingleBattleScreen;
