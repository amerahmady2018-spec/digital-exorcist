import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { formatFileSize, calculateSpaceRecovered, countEntities } from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * SwiftSummaryScreen - Summary screen for Swift Purge flow
 * 
 * Shows purge completion with space recovered and stats by category
 */

export const SwiftSummaryScreen: React.FC = () => {
  const { context, transition, resetFlow } = useAppStore();

  const flowContext = context.flowContext;
  const purgedEntities = flowContext?.purgedEntities || [];
  const sparedEntities = flowContext?.sparedEntities || [];
  const spaceRecovered = calculateSpaceRecovered(purgedEntities);
  const purgedCounts = countEntities(purgedEntities);
  // sparedEntities tracked for potential future use
  void sparedEntities;

  const handleReturnToHQ = () => {
    resetFlow();
    transition(AppState.EXORCISM_STYLE);
  };

  const handleViewGraveyard = () => {
    // Navigate to graveyard view or show location
    alert('Graveyard location: ./graveyard_trash/\nFiles can be restored from the Graveyard view.');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-6 relative bg-black">
      {/* Background texture */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-40 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Success glow */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '100%', height: '100%' }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full" style={{
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.25) 0%, transparent 50%)',
          filter: 'blur(60px)'
        }} />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)'
      }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        {/* Main Card */}
        <div 
          className="bg-black/80 border-2 border-green-500/50 rounded-xl p-8 backdrop-blur-sm shadow-2xl shadow-green-500/20"
          style={{
            clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              ⚡
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-green-400 tracking-widest uppercase mb-2"
            >
              Swift Purge Complete
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 font-mono text-sm"
            >
              No rituals. Just results.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-6"
          >
            {/* Space Recovered */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Space Recovered</p>
              <p className="text-green-400 font-bold text-3xl">{formatFileSize(spaceRecovered)}</p>
            </div>

            {/* Purged by Category */}
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-3 text-center">Purged by Category</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-xl">👻</span>
                  <p className="text-blue-400 font-bold">{purgedCounts.ghosts}</p>
                  <p className="text-gray-500 text-xs">Ghosts</p>
                </div>
                <div>
                  <span className="text-xl">🧟</span>
                  <p className="text-green-400 font-bold">{purgedCounts.zombies}</p>
                  <p className="text-gray-500 text-xs">Zombies</p>
                </div>
                <div>
                  <span className="text-xl">👹</span>
                  <p className="text-red-400 font-bold">{purgedCounts.demons}</p>
                  <p className="text-gray-500 text-xs">Demons</p>
                </div>
              </div>
            </div>

            {/* Files Summary */}
            <div className="flex gap-3">
              <div className="flex-1 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold text-xl">{purgedEntities.length}</p>
                <p className="text-gray-500 text-xs">Purged</p>
              </div>
              <div className="flex-1 bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
                <p className="text-gray-400 font-bold text-xl">{sparedEntities.length}</p>
                <p className="text-gray-500 text-xs">Skipped</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReturnToHQ}
              className="w-full py-4 bg-green-500/20 border-2 border-green-500/50 text-green-400 font-bold uppercase tracking-widest rounded-lg hover:bg-green-500/30 transition-colors"
            >
              [ Return to HQ ]
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewGraveyard}
              className="w-full py-3 bg-gray-500/10 border border-gray-500/30 text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gray-500/20 transition-colors"
            >
              [ View Graveyard ]
            </motion.button>
          </motion.div>
        </div>

        {/* ESC hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 font-mono text-xs mt-6"
        >
          [ Press ESC to return to HQ ]
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SwiftSummaryScreen;
