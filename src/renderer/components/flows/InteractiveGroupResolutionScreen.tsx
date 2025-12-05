import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { formatFileSize } from '../../utils/entityUtils';
import type { SwiftPurgeScanResult, SwiftPurgeFileEntry } from '../../../shared/types';
import bgTexture from '../../../assets/images/bg_texture.png';
import demonImg from '../../../assets/images/demon.png';
import zombieImg from '../../../assets/images/zombie.png';
import ghostImg from '../../../assets/images/ghost.png';

/**
 * InteractiveGroupResolutionScreen - Group-based entity resolution
 * 
 * Files grouped into Demons, Zombies, Ghosts (priority order).
 * Styled like ExorcismStyleScreen but more subtle.
 */

type EntityGroup = 'demon' | 'zombie' | 'ghost';
type ResolutionChoice = 'purge' | 'ignore' | 'battle' | null;

interface GroupState {
  choice: ResolutionChoice;
  battleResult?: 'win' | 'loss';
}

// Shared background component
const BackgroundEffects: React.FC = () => (
  <>
    {/* Background texture */}
    <img 
      src={bgTexture}
      alt=""
      className="absolute inset-0 z-0 w-full h-full object-cover opacity-40 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
      draggable={false}
    />

    {/* Subtle mist layers */}
    <motion.div
      className="absolute z-[3] pointer-events-none"
      style={{ width: '80%', height: '60%', left: '-20%', bottom: '-10%' }}
      animate={{ x: ['0%', '25%', '0%'], y: ['0%', '-15%', '0%'] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div 
        className="w-full h-full opacity-40"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 40% 70%, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.15) 40%, transparent 65%)',
          filter: 'blur(35px)'
        }}
      />
    </motion.div>

    <motion.div
      className="absolute z-[3] pointer-events-none"
      style={{ width: '70%', height: '50%', right: '-15%', top: '-5%' }}
      animate={{ x: ['0%', '-20%', '0%'], y: ['0%', '15%', '0%'] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
    >
      <div 
        className="w-full h-full opacity-30"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 60% 40%, rgba(239,68,68,0.35) 0%, rgba(185,28,28,0.12) 45%, transparent 65%)',
          filter: 'blur(30px)'
        }}
      />
    </motion.div>

    {/* Subtle ground glow */}
    <div className="absolute bottom-0 left-0 right-0 h-[25%] z-[2] pointer-events-none">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(10,8,12,0.7) 0%, rgba(15,10,15,0.3) 50%, transparent 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-1/4 right-1/4 h-12 opacity-20" 
        style={{ 
          background: 'radial-gradient(ellipse at bottom, rgba(239,68,68,0.5), transparent 70%)', 
          filter: 'blur(20px)' 
        }} 
      />
    </div>

    {/* Vignette */}
    <div className="absolute inset-0 pointer-events-none z-[2]" style={{
      background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.9) 100%)'
    }} />
  </>
);

export const InteractiveGroupResolutionScreen: React.FC = () => {
  const { transition } = useAppStore();
  
  const [scanResult, setScanResult] = useState<SwiftPurgeScanResult | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [groupStates, setGroupStates] = useState<Record<EntityGroup, GroupState>>({
    demon: { choice: null },
    zombie: { choice: null },
    ghost: { choice: null }
  });

  // Load scan result from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('interactiveScanResult');
    if (stored) {
      setScanResult(JSON.parse(stored));
    }
  }, []);

  // Group files by classification
  const groupedFiles = useMemo(() => {
    if (!scanResult) return { demon: [], zombie: [], ghost: [] };
    
    const groups: Record<EntityGroup, SwiftPurgeFileEntry[]> = {
      demon: [],
      zombie: [],
      ghost: []
    };
    
    scanResult.files.forEach(file => {
      if (file.classification === 'demon') groups.demon.push(file);
      else if (file.classification === 'zombie') groups.zombie.push(file);
      else if (file.classification === 'ghost') groups.ghost.push(file);
    });
    
    return groups;
  }, [scanResult]);

  // Active groups (non-empty, in priority order)
  const activeGroups = useMemo(() => {
    const order: EntityGroup[] = ['demon', 'zombie', 'ghost'];
    return order.filter(g => groupedFiles[g].length > 0);
  }, [groupedFiles]);

  const currentGroup = activeGroups[currentGroupIndex] || null;
  const currentFiles = currentGroup ? groupedFiles[currentGroup] : [];
  const currentGroupSize = currentFiles.reduce((sum, f) => sum + f.size, 0);

  // Check if all groups are resolved
  const allResolved = activeGroups.every(g => groupStates[g].choice !== null);

  const handleChoice = useCallback((choice: ResolutionChoice) => {
    if (!currentGroup) return;
    
    if (choice === 'battle') {
      // Store battle group and transition to battle screen
      sessionStorage.setItem('interactiveBattleGroup', currentGroup);
      transition(AppState.INTERACTIVE_GROUP_BATTLE);
    } else {
      setGroupStates(prev => ({
        ...prev,
        [currentGroup]: { choice }
      }));
      
      // Move to next group or stay if last
      if (currentGroupIndex < activeGroups.length - 1) {
        setCurrentGroupIndex(prev => prev + 1);
      }
    }
  }, [currentGroup, currentGroupIndex, activeGroups.length, transition]);

  // Handle battle result (called when returning from battle)
  useEffect(() => {
    const battleResult = sessionStorage.getItem('interactiveBattleResult');
    const battleGroup = sessionStorage.getItem('interactiveBattleGroup') as EntityGroup | null;
    
    if (battleResult && battleGroup) {
      const won = battleResult === 'win';
      setGroupStates(prev => ({
        ...prev,
        [battleGroup]: { 
          choice: 'battle',
          battleResult: won ? 'win' : 'loss'
        }
      }));
      
      // Clear session storage
      sessionStorage.removeItem('interactiveBattleResult');
      sessionStorage.removeItem('interactiveBattleGroup');
      
      // Move to next group
      const groupIdx = activeGroups.indexOf(battleGroup);
      if (groupIdx < activeGroups.length - 1) {
        setCurrentGroupIndex(groupIdx + 1);
      }
    }
  }, [activeGroups]);

  const handleExecute = useCallback(() => {
    // Collect files to purge based on choices
    const filesToPurge: SwiftPurgeFileEntry[] = [];
    
    activeGroups.forEach(group => {
      const state = groupStates[group];
      if (state.choice === 'purge' || (state.choice === 'battle' && state.battleResult === 'win')) {
        filesToPurge.push(...groupedFiles[group]);
      }
    });
    
    // Store files to purge
    sessionStorage.setItem('interactiveFilesToPurge', JSON.stringify(filesToPurge));
    transition(AppState.INTERACTIVE_EXECUTING);
  }, [activeGroups, groupStates, groupedFiles, transition]);

  const handleBack = useCallback(() => {
    transition(AppState.INTERACTIVE_TARGET);
  }, [transition]);

  const getGroupColor = (group: EntityGroup) => {
    switch (group) {
      case 'demon': return { text: 'text-red-400', bg: 'bg-red-500/70', border: 'border-red-500/50', img: demonImg };
      case 'zombie': return { text: 'text-green-400', bg: 'bg-green-500/70', border: 'border-green-500/50', img: zombieImg };
      case 'ghost': return { text: 'text-blue-400', bg: 'bg-blue-500/70', border: 'border-blue-500/50', img: ghostImg };
    }
  };

  const getGroupLabel = (group: EntityGroup) => {
    switch (group) {
      case 'demon': return 'DEMONS';
      case 'zombie': return 'ZOMBIES';
      case 'ghost': return 'GHOSTS';
    }
  };

  const getGroupDescription = (group: EntityGroup) => {
    switch (group) {
      case 'demon': return 'Large storage impact';
      case 'zombie': return 'Duplicate files';
      case 'ghost': return 'Old or abandoned files';
    }
  };

  if (!scanResult || activeGroups.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black relative">
        <BackgroundEffects />
        <div className="relative z-10 text-center">
          <p className="text-gray-400 font-tech text-sm mb-4">No entities detected</p>
          <p className="text-gray-600 font-tech text-xs mb-8">All files appear to be recent and unique.</p>
          <button
            onClick={handleBack}
            className="text-gray-500 font-tech text-xs tracking-[0.2em] uppercase hover:text-gray-400"
          >
            SELECT DIFFERENT TARGET
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-black relative">
      <BackgroundEffects />

      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-xl font-tech font-light text-red-400 tracking-[0.4em] uppercase mb-2">
            GROUP RESOLUTION
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto" />
        </motion.div>

        {/* All 3 group cards displayed as rows */}
        {!allResolved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-3 overflow-y-auto"
          >
            {(['demon', 'zombie', 'ghost'] as EntityGroup[]).map((group) => {
              const colors = getGroupColor(group);
              const files = groupedFiles[group];
              const groupSize = files.reduce((sum, f) => sum + f.size, 0);
              const state = groupStates[group];
              const isResolved = state.choice !== null;
              const isEmpty = files.length === 0;

              return (
                <div 
                  key={group}
                  className={`border ${colors.border} bg-black/60 backdrop-blur-sm p-4 rounded-lg flex items-center gap-4
                              ${isResolved ? 'opacity-50' : ''} ${isEmpty ? 'opacity-30' : ''}`}
                >
                  {/* Left: Icon + Label */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <img src={colors.img} alt={group} className="w-8 h-8 object-contain flex-shrink-0" />
                    <span className={`${colors.text} font-tech text-sm tracking-[0.15em] uppercase`}>
                      {getGroupLabel(group)}
                    </span>
                  </div>

                  {/* Center: Stats */}
                  <div className="flex items-center gap-6 flex-1">
                    <div className="text-center">
                      <p className="text-gray-300 font-tech text-xl">{files.length}</p>
                      <p className="text-gray-600 font-tech text-[10px]">files</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 font-tech text-lg">{formatFileSize(groupSize)}</p>
                      <p className="text-gray-600 font-tech text-[10px]">size</p>
                    </div>
                    <p className="text-gray-600 font-tech text-xs hidden md:block">{getGroupDescription(group)}</p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {isResolved ? (
                      <div className={`px-4 py-2 font-tech text-xs tracking-wider ${
                        state.choice === 'purge' || (state.choice === 'battle' && state.battleResult === 'win') 
                          ? 'text-red-400' : 'text-gray-500'
                      }`}>
                        {state.choice === 'purge' && '✓ PURGE'}
                        {state.choice === 'ignore' && '— IGNORED'}
                        {state.choice === 'battle' && state.battleResult === 'win' && '⚔ WON'}
                        {state.choice === 'battle' && state.battleResult === 'loss' && '✗ LOST'}
                      </div>
                    ) : isEmpty ? (
                      <div className="px-4 py-2 text-gray-600 font-tech text-xs">
                        No files
                      </div>
                    ) : (
                      <>
                        <motion.button
                          onClick={() => {
                            setGroupStates(prev => ({ ...prev, [group]: { choice: 'purge' } }));
                          }}
                          whileHover={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 border border-red-500/40 text-red-400 font-tech text-[10px] tracking-[0.1em] uppercase
                                     hover:border-red-400 transition-all rounded"
                        >
                          PURGE
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            setGroupStates(prev => ({ ...prev, [group]: { choice: 'ignore' } }));
                          }}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 border border-gray-700 text-gray-500 font-tech text-[10px] tracking-[0.1em] uppercase
                                     hover:border-gray-600 transition-all rounded"
                        >
                          IGNORE
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            sessionStorage.setItem('interactiveBattleGroup', group);
                            transition(AppState.INTERACTIVE_GROUP_BATTLE);
                          }}
                          whileHover={{ backgroundColor: 'rgba(147,51,234,0.15)' }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 border border-purple-500/40 text-purple-400 font-tech text-[10px] tracking-[0.1em] uppercase
                                     hover:border-purple-400 transition-all rounded"
                        >
                          BATTLE
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Summary when all resolved */}
        {allResolved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1"
          >
            <div className="border border-gray-800 bg-black/60 backdrop-blur-sm p-6 mb-6 rounded-lg">
              <h3 className="text-gray-400 font-tech text-sm tracking-[0.2em] uppercase mb-6 text-center">
                RESOLUTION SUMMARY
              </h3>
              
              <div className="space-y-4">
                {activeGroups.map(group => {
                  const state = groupStates[group];
                  const colors = getGroupColor(group);
                  const files = groupedFiles[group];
                  const willPurge = state.choice === 'purge' || 
                    (state.choice === 'battle' && state.battleResult === 'win');
                  
                  return (
                    <div key={group} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={colors.img} alt={group} className="w-6 h-6 object-contain" />
                        <span className={`${colors.text} font-tech text-sm`}>{getGroupLabel(group)}</span>
                        <span className="text-gray-600 font-tech text-xs">({files.length} files)</span>
                      </div>
                      <span className={`font-tech text-xs tracking-wider ${willPurge ? 'text-red-400' : 'text-gray-600'}`}>
                        {state.choice === 'purge' && 'PURGE'}
                        {state.choice === 'ignore' && 'IGNORED'}
                        {state.choice === 'battle' && state.battleResult === 'win' && 'PURGE (BATTLE WON)'}
                        {state.choice === 'battle' && state.battleResult === 'loss' && 'IGNORED (BATTLE LOST)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <motion.button
              onClick={handleExecute}
              whileHover={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 border border-red-500/50 bg-red-500/10 
                         text-red-300 font-tech text-sm tracking-[0.3em] uppercase
                         hover:border-red-400 transition-all rounded"
            >
              EXECUTE CLEANSE
            </motion.button>
          </motion.div>
        )}

        {/* Keyboard hint */}
        <div className="mt-auto pt-6 flex justify-center">
          <span className="flex items-center gap-1.5 text-gray-500 font-tech text-[10px] tracking-wider">
            <span className="border border-gray-700 px-2 py-1 rounded text-xs text-gray-400">ESC</span>
            <span className="ml-1">cancel</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveGroupResolutionScreen;
