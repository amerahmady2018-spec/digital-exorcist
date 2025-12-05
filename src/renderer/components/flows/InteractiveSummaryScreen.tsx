import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { formatFileSize } from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * InteractiveSummaryScreen - Session completion summary
 * 
 * Styled like ExorcismStyleScreen but more subtle.
 */

interface SessionResults {
  purgedCount: number;
  bytesFreed: number;
  errors: Array<{ path: string; error: string }>;
  totalFiles: number;
}

export const InteractiveSummaryScreen: React.FC = () => {
  const { transition } = useAppStore();
  
  const [results, setResults] = useState<SessionResults | null>(null);
  const [showGraveyardPath, setShowGraveyardPath] = useState(false);
  const [battleLost, setBattleLost] = useState(false);

  useEffect(() => {
    // Check if battle was lost (single file mode)
    const lost = sessionStorage.getItem('interactiveBattleLost');
    if (lost === 'true') {
      setBattleLost(true);
      sessionStorage.removeItem('interactiveBattleLost');
    }

    // Load results
    const stored = sessionStorage.getItem('interactiveResults');
    if (stored) {
      setResults(JSON.parse(stored));
    }

    // Cleanup session storage
    return () => {
      sessionStorage.removeItem('interactiveResults');
      sessionStorage.removeItem('interactiveScanResult');
      sessionStorage.removeItem('interactiveFilesToPurge');
      sessionStorage.removeItem('interactiveSingleFile');
    };
  }, []);

  const handleViewLog = useCallback(() => {
    // Navigate back to HQ where user can access History Log tab
    alert('Session logged. View full history in the Exorcism Dashboard > History tab.');
  }, []);

  const handleReturn = useCallback(() => {
    transition(AppState.EXORCISM_STYLE);
  }, [transition]);

  const handlePurgeMore = useCallback(() => {
    transition(AppState.INTERACTIVE_TARGET);
  }, [transition]);

  // Graveyard path (simplified - in production, get from config)
  const graveyardPath = './graveyard_trash';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black relative">
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

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 
            className="text-4xl text-red-500 mb-4 drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]"
            style={{ fontFamily: "'Dark Horse', serif" }}
          >
            {battleLost ? 'Battle Resolved' : 'Session Complete'}
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto" />
        </motion.div>

        {/* Battle lost message */}
        {battleLost && !results?.purgedCount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-800 bg-black/60 backdrop-blur-sm p-6 mb-6 text-center rounded-lg"
          >
            <p className="text-gray-400 font-tech text-sm mb-2">Battle resolved. Action applied.</p>
            <p className="text-gray-600 font-tech text-xs">The file remains untouched.</p>
          </motion.div>
        )}

        {/* Results summary */}
        {results && results.purgedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-800 bg-black/60 backdrop-blur-sm mb-6 rounded-lg"
          >
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-gray-500 font-tech text-xs tracking-wider uppercase mb-2">Files Moved</p>
                  <p className="text-gray-300 font-tech text-3xl font-light">{results.purgedCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 font-tech text-xs tracking-wider uppercase mb-2">Space Affected</p>
                  <p className="text-red-400 font-tech text-3xl font-light">{formatFileSize(results.bytesFreed)}</p>
                </div>
              </div>

              {/* Graveyard location (collapsible) */}
              <div className="border-t border-gray-800/50 pt-4">
                <button
                  onClick={() => setShowGraveyardPath(!showGraveyardPath)}
                  className="w-full flex items-center justify-between text-gray-500 font-tech text-xs hover:text-gray-400 transition-colors"
                >
                  <span className="tracking-wider uppercase">Graveyard Location</span>
                  <span>{showGraveyardPath ? '−' : '+'}</span>
                </button>
                
                {showGraveyardPath && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3"
                  >
                    <p className="text-gray-600 font-tech text-xs font-mono break-all">
                      {graveyardPath}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Errors */}
              {results.errors.length > 0 && (
                <div className="border-t border-gray-800/50 pt-4 mt-4">
                  <p className="text-amber-500/80 font-tech text-xs mb-2">
                    {results.errors.length} file(s) could not be processed
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* No files purged (from group resolution) */}
        {results && results.purgedCount === 0 && !battleLost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-800 bg-black/60 backdrop-blur-sm p-6 mb-6 text-center rounded-lg"
          >
            <p className="text-gray-400 font-tech text-sm mb-2">No files were moved.</p>
            <p className="text-gray-600 font-tech text-xs">All entities were ignored or battles were lost.</p>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <motion.button
            onClick={handlePurgeMore}
            whileHover={{ backgroundColor: 'rgba(147,51,234,0.1)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 border border-purple-500/50 bg-purple-500/10 
                       text-purple-300 font-tech text-sm tracking-[0.3em] uppercase
                       hover:border-purple-400 transition-all rounded"
          >
            PURGE MORE
          </motion.button>

          <motion.button
            onClick={handleReturn}
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 border border-red-500/30 
                       text-red-400/70 font-tech text-xs tracking-[0.2em] uppercase
                       hover:border-red-400/50 hover:text-red-300 transition-all rounded"
          >
            RETURN TO COMMAND CENTER
          </motion.button>
        </motion.div>

        {/* Safety reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-700 font-tech text-xs">
            Files are never deleted. All actions occur locally on your device.
          </p>
        </motion.div>

        {/* Keyboard hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex justify-center"
        >
          <span className="flex items-center gap-1.5 text-gray-500 font-tech text-[10px] tracking-wider">
            <span className="border border-gray-700 px-2 py-1 rounded text-xs text-gray-400">ESC</span>
            <span className="ml-1">return</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveSummaryScreen;
