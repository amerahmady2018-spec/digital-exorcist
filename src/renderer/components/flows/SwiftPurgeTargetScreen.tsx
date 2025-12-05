import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { isForbiddenPath } from '../../utils/folderValidation';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * SwiftPurgeTargetScreen - Target Selection for Tool Mode
 * 
 * Professional horror-tech aesthetic: dark, surgical, high-trust.
 * Central command panel with primary/secondary actions.
 * Background texture from title screen (subtle).
 */

interface SelectedFile {
  path: string;
  name: string;
  size: number;
}

export const SwiftPurgeTargetScreen: React.FC = () => {
  const { transition, updateFlowContext } = useAppStore();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChooseFolder = useCallback(async () => {
    setError(null);
    setSelectedFile(null);
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

  const handleChooseFile = useCallback(async () => {
    setError(null);
    setSelectedPath(null);
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
    } catch (err) {
      setError('Failed to open file picker.');
    }
  }, []);

  const handleScanAndPreview = useCallback(() => {
    if (!selectedPath) return;
    updateFlowContext({ selectedLocation: selectedPath });
    transition(AppState.SWIFT_PURGE_PREVIEW);
  }, [selectedPath, updateFlowContext, transition]);

  const handlePurgeSingleFile = useCallback(async () => {
    if (!selectedFile) return;
    try {
      const result = await window.electronAPI.banishFile(
        selectedFile.path,
        ['ghost'], // Default classification for single file
        selectedFile.size
      );
      if (result.success) {
        // Store result for the result screen
        sessionStorage.setItem(
          'swiftPurgeSingleFileResult',
          JSON.stringify({
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            success: true
          })
        );
        transition(AppState.SWIFT_PURGE_RESULT);
      } else {
        setError(result.error || 'Failed to purge file');
      }
    } catch (err) {
      setError('Failed to purge file.');
    }
  }, [selectedFile, transition]);

  const handleBack = useCallback(() => {
    transition(AppState.EXORCISM_STYLE);
  }, [transition]);

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black">
      {/* Background texture - subtle */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-30 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Subtle mist layer */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '80%', height: '60%', left: '-20%', bottom: '-10%' }}
        animate={{ x: ['0%', '25%', '0%'], y: ['0%', '-15%', '0%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-full h-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 40% 70%, rgba(147,51,234,0.4) 0%, transparent 60%)',
            filter: 'blur(40px)'
          }}
        />
      </motion.div>

      {/* Top gradient light */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147,51,234,0.12) 0%, transparent 50%)'
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl font-light text-purple-300 tracking-[0.4em] uppercase mb-3">
            SWIFT PURGE
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent mx-auto mb-4" />
          <p className="text-gray-300 text-sm tracking-[0.2em] uppercase">
            File containment and removal system
          </p>
        </motion.div>

        {/* Two Option Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 gap-6 mb-8"
        >
          {/* Primary: Scan a Folder */}
          <div className="relative border border-gray-800 bg-black/80 backdrop-blur-sm p-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            
            <div className="text-center mb-6">
              <p className="text-purple-400/80 text-xs tracking-[0.2em] uppercase mb-2">PRIMARY</p>
              <h3 className="text-gray-200 text-lg font-light">Scan a Folder</h3>
              <p className="text-gray-400 text-xs mt-2">
                Bulk analysis and purge by category.
              </p>
            </div>

            <motion.button
              onClick={handleChooseFolder}
              whileHover={{ backgroundColor: 'rgba(147,51,234,0.12)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 border border-purple-400/40 bg-purple-500/5 
                         hover:border-purple-400/70 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-2 border-purple-400/50 rotate-45 mb-3 
                                group-hover:border-purple-300/80 transition-colors flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-400/40 group-hover:bg-purple-300/60 transition-colors" />
                </div>
                <span className="text-purple-300 text-xs tracking-[0.2em] uppercase">
                  CHOOSE FOLDER
                </span>
              </div>
            </motion.button>

            {selectedPath && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-800"
              >
                <p className="text-gray-500 text-xs mb-1">Selected:</p>
                <p className="text-gray-300 text-xs font-mono break-all">{selectedPath}</p>
                
                <motion.button
                  onClick={handleScanAndPreview}
                  whileHover={{ backgroundColor: 'rgba(147,51,234,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-3 border border-purple-500/50 bg-purple-500/10 
                             text-purple-300 text-xs tracking-[0.2em] uppercase
                             hover:border-purple-400 transition-all"
                >
                  SCAN & PREVIEW
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Secondary: Single File Purge */}
          <div className="relative border border-gray-800 bg-black/80 backdrop-blur-sm p-6">
            <div className="text-center mb-6">
              <p className="text-gray-500 text-xs tracking-[0.2em] uppercase mb-2">SECONDARY</p>
              <h3 className="text-gray-200 text-lg font-light">Single File Purge</h3>
              <p className="text-gray-400 text-xs mt-2">
                Quick removal of one specific file.
              </p>
            </div>

            <motion.button
              onClick={handleChooseFile}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 border border-gray-700 bg-transparent 
                         hover:border-gray-500 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-2 border-gray-600 mb-3 
                                group-hover:border-gray-400 transition-colors flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-600 group-hover:bg-gray-400 transition-colors" />
                </div>
                <span className="text-gray-300 text-xs tracking-[0.2em] uppercase">
                  SELECT FILE
                </span>
              </div>
            </motion.button>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-800"
              >
                <p className="text-gray-500 text-xs mb-1">Selected:</p>
                <p className="text-gray-300 text-sm font-medium">{selectedFile.name}</p>
                <p className="text-gray-500 text-xs mt-1">{formatFileSize(selectedFile.size)}</p>
                
                <motion.button
                  onClick={handlePurgeSingleFile}
                  whileHover={{ backgroundColor: 'rgba(147,51,234,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-3 border border-purple-500/50 bg-purple-500/10 
                             text-purple-300 text-xs tracking-[0.2em] uppercase
                             hover:border-purple-400 transition-all"
                >
                  PURGE FILE
                </motion.button>
              </motion.div>
            )}
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


        {/* Information Panels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-3 gap-px bg-gray-700/30"
        >
          {/* Scope Panel */}
          <div className="bg-black/80 backdrop-blur-sm p-5">
            <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase mb-3">
              SCAN SCOPE
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400/60" />
                <span className="text-gray-300 text-xs">All files in directory</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400/60" />
                <span className="text-gray-300 text-xs">Recursive subdirectories</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400/60" />
                <span className="text-gray-300 text-xs">Metadata and signatures</span>
              </li>
            </ul>
          </div>

          {/* Classification Panel */}
          <div className="bg-black/80 backdrop-blur-sm p-5">
            <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase mb-3">
              ENTITY CLASSIFICATION
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400" />
                <span className="text-gray-200 text-xs">GHOST — Inactive 6+ months</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400" />
                <span className="text-gray-200 text-xs">ZOMBIE — Duplicate content</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400" />
                <span className="text-gray-200 text-xs">DEMON — Storage excess</span>
              </li>
            </ul>
          </div>

          {/* Safety Panel */}
          <div className="bg-black/80 backdrop-blur-sm p-5">
            <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase mb-3">
              FILE HANDLING
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400/60" />
                <span className="text-gray-300 text-xs">Moved to local Graveyard</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400/60" />
                <span className="text-gray-300 text-xs">Never permanently deleted</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400/60" />
                <span className="text-gray-300 text-xs">Full operation logging</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Safety Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400 text-xs tracking-wider">
            Files are relocated to the Graveyard during purge operations.
            <span className="text-purple-300 ml-1">Restoration available at any time.</span>
          </p>
        </motion.div>

        {/* Navigation hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={handleBack}
            className="text-gray-500 text-xs tracking-[0.15em] uppercase hover:text-gray-300 transition-colors"
          >
            ESC — Return to command center
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SwiftPurgeTargetScreen;
