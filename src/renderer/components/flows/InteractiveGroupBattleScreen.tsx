import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore, AppState } from '../../store/appStore';
import { CockpitArena } from '../CockpitArena';
import type { ClassifiedFile, MonsterType } from '../../../shared/types';

/**
 * InteractiveGroupBattleScreen - Symbolic battle for entity group
 * 
 * Battle mechanics identical to Story Mode.
 * Uses simulated/fixed values - does NOT scale with real file count/size.
 * Win = entire group marked for purge, Loss = group ignored.
 */

// Fixed simulated stats for group battles (same as Story Mode)
const SIMULATED_BATTLE_SIZE = 5 * 1024 * 1024; // 5MB - gives reasonable HP

export const InteractiveGroupBattleScreen: React.FC = () => {
  const { transition } = useAppStore();
  const [battleEntity, setBattleEntity] = useState<ClassifiedFile | null>(null);

  // Create simulated battle entity on mount
  useEffect(() => {
    const group = sessionStorage.getItem('interactiveBattleGroup') as MonsterType | null;
    if (!group) return;

    // Create a simulated entity for battle (fixed stats, not based on real files)
    const simulatedEntity: ClassifiedFile = {
      path: `simulated-${group}-group`,
      size: SIMULATED_BATTLE_SIZE,
      lastModified: new Date(),
      classifications: [group]
    };

    setBattleEntity(simulatedEntity);
  }, []);

  const handleVictory = useCallback(() => {
    // Store battle result and return to group resolution
    sessionStorage.setItem('interactiveBattleResult', 'win');
    transition(AppState.INTERACTIVE_GROUP_RESOLUTION);
  }, [transition]);

  const handleDefeat = useCallback(() => {
    sessionStorage.setItem('interactiveBattleResult', 'loss');
    transition(AppState.INTERACTIVE_GROUP_RESOLUTION);
  }, [transition]);

  const handleFlee = useCallback(() => {
    // Flee counts as loss for group battles
    sessionStorage.setItem('interactiveBattleResult', 'loss');
    transition(AppState.INTERACTIVE_GROUP_RESOLUTION);
  }, [transition]);

  if (!battleEntity) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <p className="text-gray-500 text-sm">Preparing battle...</p>
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

export default InteractiveGroupBattleScreen;
