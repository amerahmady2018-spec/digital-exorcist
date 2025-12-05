import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { isForbiddenPath } from '../../utils/folderValidation';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * InteractiveTargetScreen - Target Selection for Interactive Mode
 * 
 * Two options: Scan a folder (group resolution) or Single-file purge.
 * Styled like ExorcismStyleScreen but more subtle.
 */

export const InteractiveTargetScreen: React.FC = () => {
  const { transition, updateFlowContext } = useAppStore();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChooseFolder = useCallback(async () => {
    setError(null);
    try {
      const result = await window.electronAPI.selectDirectory();
      if (result?.success && result.path) {
        if (isForbiddenPath(result.path)) {
          setError('System folders cannot be scanned for safety reasons.');
          return;
        }
        setSelectedPath(result.path);
      }
    } catch (err) {
      setError('Failed to open folder picker.');
    }
  }, []);

  const handleScanFolder = useCallback(() => {
    if (!selectedPath) return;
    updateFlowContext({ selectedLocation: selectedPath });
    transition(AppState.INTERACTIVE_SCANNING);
  }, [selectedPath, updateFlowContext, transition]);

  const handleSingleFile = useCallback(() => {
    transition(AppState.INTERACTIVE_SINGLE_FILE);
  }, [transition]);

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

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl font-tech font-light text-red-400 tracking-[0.4em] uppercase mb-3">
            CHOOSE TARGET
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto" />
        </motion.div>

        {/* Two Option Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-6 mb-8"
        >
          {/* Primary: Scan a Folder */}
          <div className="border border-gray-800 bg-black/60 backdrop-blur-sm p-6 rounded-lg relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            
            <div className="text-center mb-6">
              <p className="text-red-400/80 font-tech text-xs tracking-[0.2em] uppercase mb-2">PRIMARY</p>
              <h3 className="text-gray-300 font-tech text-lg font-light">Scan a Folder</h3>
              <p className="text-gray-500 font-tech text-xs mt-2">
                Identify entities and resolve them by category.
              </p>
            </div>

            <motion.button
              onClick={handleChooseFolder}
              whileHover={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 border border-red-500/30 bg-transparent 
                         hover:border-red-500/60 transition-all duration-300"
            >
              <span className="text-red-400 text-xs tracking-[0.2em] uppercase">
                CHOOSE FOLDER
              </span>
            </motion.button>

            {selectedPath && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-800"
              >
                <p className="text-gray-500 text-xs mb-1">Selected:</p>
                <p className="text-gray-400 text-xs font-mono break-all">{selectedPath}</p>
                
                <motion.button
                  onClick={handleScanFolder}
                  whileHover={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-3 border border-red-500/50 bg-red-500/10 
                             text-red-300 text-xs tracking-[0.2em] uppercase
                             hover:border-red-400 transition-all"
                >
                  START SCAN
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Secondary: Single-file Purge */}
          <div className="border border-gray-800 bg-black/60 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-center mb-6">
              <p className="text-gray-500 font-tech text-xs tracking-[0.2em] uppercase mb-2">SECONDARY</p>
              <h3 className="text-gray-300 font-tech text-lg font-light">Single-file Purge</h3>
              <p className="text-gray-500 font-tech text-xs mt-2">
                Resolve one file through direct confrontation.
              </p>
            </div>

            <motion.button
              onClick={handleSingleFile}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 border border-gray-700 bg-transparent 
                         hover:border-gray-600 transition-all duration-300"
            >
              <span className="text-gray-400 text-xs tracking-[0.2em] uppercase">
                SELECT FILE
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-start gap-3 px-1"
          >
            <div className="w-2 h-2 bg-red-500 mt-1 flex-shrink-0" />
            <p className="text-red-400/80 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Safety Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-gray-600 font-tech text-xs">
            Files are relocated to the Graveyard. Never permanently deleted.
          </p>
        </motion.div>

        {/* Keyboard hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex justify-center"
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

export default InteractiveTargetScreen;
