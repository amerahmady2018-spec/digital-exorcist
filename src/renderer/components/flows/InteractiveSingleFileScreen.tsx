import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { formatFileSize } from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * InteractiveSingleFileScreen - Single file selection for battle-first purge
 * 
 * Styled like ExorcismStyleScreen but more subtle.
 */

interface FileInfo {
  path: string;
  name: string;
  size: number;
}

export const InteractiveSingleFileScreen: React.FC = () => {
  const { transition } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = useCallback(async () => {
    setError(null);
    try {
      const result = await window.electronAPI.selectFile();
      if (result?.success && result.path && result.fileName && result.size !== undefined) {
        setSelectedFile({
          path: result.path,
          name: result.fileName,
          size: result.size
        });
      } else if (!result?.success && result?.error) {
        setError(result.error);
      }
      // If canceled, do nothing
    } catch (err) {
      setError('Failed to open file picker.');
    }
  }, []);

  const handleEnterBattle = useCallback(() => {
    if (!selectedFile) return;
    
    // Store file info for battle
    sessionStorage.setItem('interactiveSingleFile', JSON.stringify(selectedFile));
    transition(AppState.INTERACTIVE_SINGLE_BATTLE);
  }, [selectedFile, transition]);

  const handleCancel = useCallback(() => {
    transition(AppState.INTERACTIVE_TARGET);
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

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl font-tech font-light text-red-400 tracking-[0.3em] uppercase mb-3">
            SINGLE-FILE PURGE
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto mb-4" />
          <p className="text-gray-500 font-tech text-xs">
            Resolve one file through direct confrontation.
          </p>
        </motion.div>

        {/* File Selection Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="border border-gray-800 bg-black/60 backdrop-blur-sm p-6 mb-6 rounded-lg"
        >
          {!selectedFile ? (
            <>
              <motion.button
                onClick={handleSelectFile}
                whileHover={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-6 border border-red-500/30 bg-transparent 
                           hover:border-red-500/60 transition-all duration-300 rounded"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border border-red-500/40 mb-3 flex items-center justify-center rounded">
                    <div className="w-2 h-2 bg-red-500/50 rounded-sm" />
                  </div>
                  <span className="text-red-400 font-tech text-xs tracking-[0.2em] uppercase">
                    SELECT FILE
                  </span>
                </div>
              </motion.button>
            </>
          ) : (
            <div>
              {/* File Preview */}
              <div className="mb-6">
                <p className="text-gray-500 font-tech text-xs tracking-[0.15em] uppercase mb-3">
                  SELECTED FILE
                </p>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 mt-1.5 flex-shrink-0 rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 font-tech text-sm font-medium mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-600 font-tech text-xs font-mono break-all mb-2">
                      {selectedFile.path}
                    </p>
                    <p className="text-gray-500 font-tech text-xs">
                      Size: {formatFileSize(selectedFile.size)} (display only)
                    </p>
                  </div>
                </div>
              </div>

              {/* Battle note */}
              <div className="border-t border-gray-800/50 pt-4 mb-6">
                <p className="text-gray-600 font-tech text-xs text-center">
                  Battle uses fixed simulated stats. Real file size has no influence.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="py-3 border border-gray-700 text-gray-500 font-tech text-xs tracking-[0.15em] uppercase
                             hover:border-gray-600 hover:text-gray-400 transition-colors rounded"
                >
                  CANCEL
                </button>
                <motion.button
                  onClick={handleEnterBattle}
                  whileHover={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 border border-red-500/50 bg-red-500/10 
                             text-red-300 font-tech text-xs tracking-[0.15em] uppercase
                             hover:border-red-400 transition-all rounded"
                >
                  ENTER BATTLE
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-start gap-3"
          >
            <div className="w-2 h-2 bg-red-500 mt-1 flex-shrink-0 rounded-sm" />
            <p className="text-red-400/80 font-tech text-sm">{error}</p>
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <p className="text-gray-600 font-tech text-xs">
            Win the battle to purge the file. Lose and it remains untouched.
          </p>
        </motion.div>

        {/* Keyboard hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
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

export default InteractiveSingleFileScreen;
