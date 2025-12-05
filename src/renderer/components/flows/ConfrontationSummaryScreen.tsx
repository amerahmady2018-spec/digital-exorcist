import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { countEntities, formatFileSize } from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * ConfrontationSummaryScreen - Dramatic summary for Confrontation flow
 * 
 * Shows confrontation results with dramatic language
 */

export const ConfrontationSummaryScreen: React.FC = () => {
  const { context, transition, resetFlow, getSpaceRecovered } = useAppStore();

  const flowContext = context.flowContext;
  const purgedEntities = flowContext?.purgedEntities || [];
  const sparedEntities = flowContext?.sparedEntities || [];

  const purgedCounts = countEntities(purgedEntities);
  const sparedCounts = countEntities(sparedEntities);
  const spaceRecovered = getSpaceRecovered();

  const totalPurged = purgedEntities.length;
  const totalSpared = sparedEntities.length;
  const totalConfronted = totalPurged + totalSpared;
  
  // Check if this was an early exit (entities remaining)
  const totalEntities = flowContext?.entities?.length || totalConfronted;
  const wasEarlyExit = totalConfronted < totalEntities;
  const remainingEntities = totalEntities - totalConfronted;

  const handleReturnToHQ = () => {
    resetFlow();
    transition(AppState.EXORCISM_STYLE);
  };

  const handleViewGraveyard = () => {
    alert('Graveyard location: ./graveyard_trash/');
  };

  // Determine dramatic message based on results
  const getDramaticMessage = () => {
    if (wasEarlyExit) {
      return `You retreated with ${remainingEntities} entities left unconfronted.`;
    } else if (totalPurged === 0) {
      return "Mercy was shown. All entities remain bound to their files.";
    } else if (totalSpared === 0) {
      return "No mercy. Every entity has been banished to the graveyard.";
    } else if (totalPurged > totalSpared) {
      return "The purge was decisive. Most entities have fallen.";
    } else {
      return "A balanced judgment. Some were spared, others were not.";
    }
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

      {/* Victory/completion glow */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '100%', height: '100%' }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full" style={{
          background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.2) 0%, rgba(239,68,68,0.1) 30%, transparent 50%)',
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
        className="relative z-10 w-full max-w-xl mx-auto"
      >
        {/* Main Card */}
        <div 
          className="bg-black/85 border-2 border-purple-500/50 rounded-xl p-8 backdrop-blur-sm shadow-2xl shadow-purple-500/20"
          style={{
            clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              ⚔️
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold tracking-widest uppercase mb-2"
            >
              <span className="text-red-400">Confrontation</span>{' '}
              <span className="text-purple-400">Complete</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 font-mono text-sm italic"
            >
              "{getDramaticMessage()}"
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            {/* Confronted Total */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Entities Confronted</p>
              <p className="text-purple-400 font-bold text-3xl">{totalConfronted}</p>
            </div>

            {/* Purged vs Spared */}
            <div className="grid grid-cols-2 gap-4">
              {/* Purged */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-red-400 font-bold uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-2">
                  <span>💀</span> Banished
                </h3>
                <p className="text-red-400 font-bold text-2xl text-center mb-2">{totalPurged}</p>
                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                  <div>
                    <span>👻</span>
                    <p className="text-red-400">{purgedCounts.ghosts}</p>
                  </div>
                  <div>
                    <span>🧟</span>
                    <p className="text-red-400">{purgedCounts.zombies}</p>
                  </div>
                  <div>
                    <span>👹</span>
                    <p className="text-red-400">{purgedCounts.demons}</p>
                  </div>
                </div>
              </div>

              {/* Spared */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-green-400 font-bold uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-2">
                  <span>💚</span> Spared
                </h3>
                <p className="text-green-400 font-bold text-2xl text-center mb-2">{totalSpared}</p>
                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                  <div>
                    <span>👻</span>
                    <p className="text-green-400">{sparedCounts.ghosts}</p>
                  </div>
                  <div>
                    <span>🧟</span>
                    <p className="text-green-400">{sparedCounts.zombies}</p>
                  </div>
                  <div>
                    <span>👹</span>
                    <p className="text-green-400">{sparedCounts.demons}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Space Recovered */}
            <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Space Reclaimed</p>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400 font-bold text-3xl">
                {formatFileSize(spaceRecovered)}
              </p>
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
              className="w-full py-4 bg-gradient-to-r from-red-500/20 to-purple-500/20 border-2 border-purple-500/50 text-purple-400 font-bold uppercase tracking-widest rounded-lg hover:from-red-500/30 hover:to-purple-500/30 transition-all"
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

export default ConfrontationSummaryScreen;
