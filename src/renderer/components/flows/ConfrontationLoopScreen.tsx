import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { EntityCard } from './EntityCard';
import { formatFileSize, calculateSpaceRecovered } from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';
import type { MonsterType } from '../../../shared/types';

/**
 * ConfrontationLoopScreen - One-by-one entity confrontation
 * 
 * Queue-based system: face each entity individually, decide its fate
 * Shows progress indicator "Entity X of Y"
 * Early exit with confirmation dialog
 */

export const ConfrontationLoopScreen: React.FC = () => {
  const { 
    context, 
    transition, 
    purgeEntity, 
    spareEntity,
    advanceToNextEntity,
    getSpaceRecovered,
    getRemainingCounts
  } = useAppStore();

  const flowContext = context.flowContext;
  const entities = flowContext?.entities || [];
  const currentIndex = flowContext?.currentIndex || 0;
  const purgedEntities = flowContext?.purgedEntities || [];
  const sparedEntities = flowContext?.sparedEntities || [];

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentEntity = entities[currentIndex];
  const remainingCounts = getRemainingCounts();
  const spaceRecovered = getSpaceRecovered();
  const potentialSpace = calculateSpaceRecovered(entities.slice(currentIndex));

  const isLastEntity = currentIndex >= entities.length - 1;
  const allProcessed = currentIndex >= entities.length;

  const handlePurge = useCallback(async () => {
    if (!currentEntity) return;

    try {
      await window.electronAPI.banishFile(
        currentEntity.path,
        currentEntity.classifications as MonsterType[],
        currentEntity.size
      );
      purgeEntity(currentEntity);
    } catch (error) {
      console.error('Purge failed:', error);
      purgeEntity(currentEntity);
    }

    if (isLastEntity) {
      transition(AppState.CONFRONTATION_SUMMARY);
    } else {
      advanceToNextEntity();
    }
  }, [currentEntity, isLastEntity, purgeEntity, advanceToNextEntity, transition]);

  const handleSpare = useCallback(() => {
    if (!currentEntity) return;

    spareEntity(currentEntity);

    if (isLastEntity) {
      transition(AppState.CONFRONTATION_SUMMARY);
    } else {
      advanceToNextEntity();
    }
  }, [currentEntity, isLastEntity, spareEntity, advanceToNextEntity, transition]);

  const handleExitRequest = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    transition(AppState.CONFRONTATION_SUMMARY);
  }, [transition]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // If all processed, go to summary
  if (allProcessed) {
    transition(AppState.CONFRONTATION_SUMMARY);
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-6 relative bg-black">
      {/* Background texture */}
      <img 
        src={bgTexture}
        alt=""
        className="fixed inset-0 z-0 w-full h-full object-cover opacity-30 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Intense atmosphere */}
      <motion.div
        className="fixed z-[1] pointer-events-none"
        style={{ width: '100%', height: '100%' }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full" style={{
          background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, rgba(239,68,68,0.1) 30%, transparent 60%)',
          filter: 'blur(80px)'
        }} />
      </motion.div>

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[2]" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full max-w-6xl mx-auto w-full pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-xl font-bold tracking-wider uppercase">
              <span className="text-red-400">CONFRON</span>
              <span className="text-purple-400">TATION</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              Entity {currentIndex + 1} of {entities.length}
            </p>
          </div>

          {/* Exit button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExitRequest}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-red-500/30 transition-colors"
          >
            Exit Confrontation
          </motion.button>
        </motion.div>

        {/* Exit Confirmation Dialog */}
        <AnimatePresence>
          {showExitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-black border-2 border-red-500/50 rounded-xl p-6 max-w-md mx-4"
              >
                <div className="text-center mb-4">
                  <span className="text-4xl">⚠️</span>
                  <h3 className="text-red-400 font-bold text-xl mt-2">Exit Confrontation?</h3>
                </div>
                <p className="text-gray-300 text-sm mb-2 text-center">
                  You have {entities.length - currentIndex} entities remaining.
                </p>
                <p className="text-gray-400 text-xs mb-4 text-center">
                  Your progress will be saved. Purged files remain in the graveyard.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelExit}
                    className="flex-1 py-2 bg-gray-500/20 border border-gray-500/50 text-gray-400 rounded-lg hover:bg-gray-500/30"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleConfirmExit}
                    className="flex-1 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-6">
          {/* Sidebar HUD */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-64 space-y-4"
          >
            {/* Remaining Counts */}
            <div className="bg-black/60 border border-white/10 rounded-lg p-4">
              <h3 className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-3">Remaining</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>👻</span>
                    <span className="text-gray-400 text-sm">Ghosts</span>
                  </span>
                  <span className="text-blue-400 font-bold">{remainingCounts.ghosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>🧟</span>
                    <span className="text-gray-400 text-sm">Zombies</span>
                  </span>
                  <span className="text-green-400 font-bold">{remainingCounts.zombies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>👹</span>
                    <span className="text-gray-400 text-sm">Demons</span>
                  </span>
                  <span className="text-red-400 font-bold">{remainingCounts.demons}</span>
                </div>
              </div>
            </div>

            {/* Space Stats */}
            <div className="bg-black/60 border border-white/10 rounded-lg p-4">
              <h3 className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-3">Space</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-xs">Recovered</p>
                  <p className="text-green-400 font-bold text-lg">{formatFileSize(spaceRecovered)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Potential</p>
                  <p className="text-purple-400 font-bold text-lg">{formatFileSize(potentialSpace)}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-black/60 border border-white/10 rounded-lg p-4">
              <h3 className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-3">Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">💀 Purged</span>
                  <span className="text-red-400 font-bold">{purgedEntities.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">💚 Spared</span>
                  <span className="text-green-400 font-bold">{sparedEntities.length}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex) / entities.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-red-500 to-purple-500"
                />
              </div>
            </div>

            {/* Safety Indicator */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-green-400">🛡️</span>
                <span className="text-green-400 font-mono text-xs">Undo Available</span>
              </div>
            </div>
          </motion.div>

          {/* Central Entity Card */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentEntity && (
                <motion.div
                  key={currentEntity.path}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ duration: 0.4 }}
                >
                  <EntityCard
                    entity={currentEntity}
                    variant="central"
                    onPurge={handlePurge}
                    onSpare={handleSpare}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ESC hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 font-mono text-xs mt-4"
        >
          [ Press ESC to exit confrontation ]
        </motion.p>
      </div>
    </div>
  );
};

export default ConfrontationLoopScreen;
