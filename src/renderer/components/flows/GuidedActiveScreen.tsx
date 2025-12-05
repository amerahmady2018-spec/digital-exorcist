import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { EntityCard } from './EntityCard';
import { formatFileSize, calculateSpaceRecovered } from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';
import type { ClassifiedFile } from '../../../shared/types';

/**
 * GuidedActiveScreen - Active encounter screen for Guided Ritual flow
 * 
 * SIMULATED MODE: All operations are memory-only, NO real file system access
 * Displays entities as cards in a paginated grid (max 6 visible)
 * NO SCROLLBARS - content fits within viewport
 */

const ENTITIES_PER_PAGE = 6;

export const GuidedActiveScreen: React.FC = () => {
  const { 
    context, 
    transition, 
    purgeEntity, 
    spareEntity,
    getSpaceRecovered 
  } = useAppStore();

  const flowContext = context.flowContext;
  const entities = flowContext?.entities || [];
  const purgedEntities = flowContext?.purgedEntities || [];
  const sparedEntities = flowContext?.sparedEntities || [];

  const [currentPage, setCurrentPage] = useState(0);

  const spaceRecovered = getSpaceRecovered();
  const potentialSpace = calculateSpaceRecovered(entities);

  // Pagination
  const totalPages = Math.ceil(entities.length / ENTITIES_PER_PAGE);
  const paginatedEntities = entities.slice(
    currentPage * ENTITIES_PER_PAGE,
    (currentPage + 1) * ENTITIES_PER_PAGE
  );

  // GUIDED RITUAL: Memory-only purge - NO real file operations
  const handlePurge = useCallback((entity: ClassifiedFile) => {
    // Simulated purge - only updates UI state, no file system access
    console.log('[Guided Ritual] Simulated purge:', entity.path);
    purgeEntity(entity);
  }, [purgeEntity]);

  const handleSpare = useCallback((entity: ClassifiedFile) => {
    spareEntity(entity);
  }, [spareEntity]);

  const handleExit = useCallback(() => {
    transition(AppState.EXORCISM_STYLE);
  }, [transition]);

  const handleComplete = useCallback(() => {
    transition(AppState.GUIDED_SUMMARY);
  }, [transition]);

  // Check if all entities have been processed
  const allProcessed = entities.length === 0;

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

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[1]" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.9) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-purple-400 tracking-wider uppercase">
              Guided Ritual
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              Inspect and decide the fate of each entity
            </p>
          </div>

          {/* Stats HUD */}
          <div className="flex items-center gap-4">
            <div className="bg-black/60 border border-purple-500/30 rounded-lg px-4 py-2 text-center">
              <p className="text-gray-400 text-xs">Remaining</p>
              <p className="text-purple-400 font-bold">{entities.length}</p>
            </div>
            <div className="bg-black/60 border border-green-500/30 rounded-lg px-4 py-2 text-center">
              <p className="text-gray-400 text-xs">Recovered</p>
              <p className="text-green-400 font-bold">{formatFileSize(spaceRecovered)}</p>
            </div>
          </div>
        </motion.div>

        {/* Safety Indicator - DEMO MODE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-2 mb-6 flex items-center gap-2"
        >
          <span className="text-cyan-400">🎮</span>
          <span className="text-cyan-400 font-mono text-sm">DEMO MODE • Simulated Files • No Real Data Affected</span>
        </motion.div>

        {/* Entity Grid - Paginated, max 6 visible */}
        {!allProcessed ? (
          <div className="flex-1 flex flex-col">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4"
            >
              <AnimatePresence mode="popLayout">
                {paginatedEntities.map((entity, index) => (
                  <motion.div
                    key={entity.path}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <EntityCard
                      entity={entity}
                      variant="grid"
                      onPurge={() => handlePurge(entity)}
                      onSpare={() => handleSpare(entity)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="text-gray-400 font-mono text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* All Processed State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              ✨
            </motion.div>
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              All Entities Processed
            </h2>
            <p className="text-gray-400 mb-8">
              You have confronted all entities in this zone.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="px-8 py-4 bg-purple-500/20 border-2 border-purple-500/50 text-purple-400 font-bold uppercase tracking-widest rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              View Summary
            </motion.button>
          </motion.div>
        )}

        {/* Summary Stats */}
        {(purgedEntities.length > 0 || sparedEntities.length > 0) && !allProcessed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 border border-white/10 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">💀</span>
                  <span className="text-gray-400">Purged:</span>
                  <span className="text-red-400 font-bold">{purgedEntities.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">💚</span>
                  <span className="text-gray-400">Spared:</span>
                  <span className="text-green-400 font-bold">{sparedEntities.length}</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                Potential: <span className="text-purple-400">{formatFileSize(potentialSpace)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExit}
            className="px-6 py-3 bg-gray-500/20 border border-gray-500/30 text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gray-500/30 transition-colors"
          >
            [ Exit Encounter ]
          </motion.button>

          {!allProcessed && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="px-6 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              [ Complete Ritual ]
            </motion.button>
          )}
        </motion.div>

        {/* ESC hint */}
        <p className="text-center text-gray-500 font-mono text-xs mt-8">
          [ Press ESC to exit ]
        </p>
      </div>
    </div>
  );
};

export default GuidedActiveScreen;
