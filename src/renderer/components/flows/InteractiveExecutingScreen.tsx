import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { formatFileSize } from '../../utils/entityUtils';
import type { SwiftPurgeFileEntry, MonsterType } from '../../../shared/types';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * InteractiveExecutingScreen - File movement execution
 * 
 * Styled like ExorcismStyleScreen but more subtle.
 */

interface ExecutionProgress {
  current: number;
  total: number;
  currentFile: string;
  status: 'pending' | 'success' | 'error';
}

export const InteractiveExecutingScreen: React.FC = () => {
  const { transition, addXP } = useAppStore();
  
  const [progress, setProgress] = useState<ExecutionProgress>({
    current: 0,
    total: 0,
    currentFile: '',
    status: 'pending'
  });
  const [results, setResults] = useState<{
    purgedCount: number;
    bytesFreed: number;
    errors: Array<{ path: string; error: string }>;
  }>({ purgedCount: 0, bytesFreed: 0, errors: [] });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('interactiveFilesToPurge');
    if (!stored) {
      // No files to purge - go directly to summary
      transition(AppState.INTERACTIVE_SUMMARY);
      return;
    }

    const files: SwiftPurgeFileEntry[] = JSON.parse(stored);
    if (files.length === 0) {
      transition(AppState.INTERACTIVE_SUMMARY);
      return;
    }

    setProgress(prev => ({ ...prev, total: files.length }));

    // Execute purge operations
    const executePurge = async () => {
      let purgedCount = 0;
      let bytesFreed = 0;
      const errors: Array<{ path: string; error: string }> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({
          current: i + 1,
          total: files.length,
          currentFile: file.fileName || file.path.split(/[/\\]/).pop() || file.path,
          status: 'pending'
        });

        try {
          // Use banishFile API to move to graveyard
          const result = await window.electronAPI.banishFile(
            file.path,
            [file.classification as MonsterType],
            file.size
          );

          if (result.success) {
            purgedCount++;
            bytesFreed += file.size;
            
            // Award XP
            if (file.size > 0) {
              addXP(file.size);
            }
          } else {
            errors.push({ path: file.path, error: result.error || 'Unknown error' });
          }
        } catch (err) {
          errors.push({ 
            path: file.path, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }

        // Small delay for visual feedback
        await new Promise(r => setTimeout(r, 100));
      }

      setResults({ purgedCount, bytesFreed, errors });
      
      // Store results for summary
      sessionStorage.setItem('interactiveResults', JSON.stringify({
        purgedCount,
        bytesFreed,
        errors,
        totalFiles: files.length
      }));

      setIsComplete(true);
    };

    executePurge();
  }, [transition, addXP]);

  const handleContinue = useCallback(() => {
    transition(AppState.INTERACTIVE_SUMMARY);
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

      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10"
        >
          <h1 className="text-xl font-tech font-light text-red-400 tracking-[0.4em] uppercase mb-3">
            {isComplete ? 'CLEANSE COMPLETE' : 'EXECUTING'}
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto" />
        </motion.div>

        {!isComplete ? (
          <>
            {/* Progress spinner */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 border border-red-500/30 rounded"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-3 border border-red-500/50 rotate-45 rounded"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-red-400 font-tech text-sm font-mono">
                  {progress.current}/{progress.total}
                </span>
              </div>
            </div>

            {/* Current file */}
            <p className="text-gray-400 font-tech text-xs mb-2 truncate px-4">
              {progress.currentFile}
            </p>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-800 mb-4 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-500/70"
                initial={{ width: 0 }}
                animate={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-gray-600 font-tech text-xs">
              Moving files to Graveyard...
            </p>
          </>
        ) : (
          <>
            {/* Completion summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="border border-gray-800 bg-black/60 backdrop-blur-sm p-6 mb-6 rounded-lg">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-gray-500 font-tech text-xs tracking-wider uppercase mb-1">Files Moved</p>
                    <p className="text-gray-300 font-tech text-2xl font-light">{results.purgedCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-tech text-xs tracking-wider uppercase mb-1">Space Freed</p>
                    <p className="text-red-400 font-tech text-2xl font-light">{formatFileSize(results.bytesFreed)}</p>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div className="border-t border-gray-800/50 pt-4">
                    <p className="text-amber-500/80 font-tech text-xs">
                      {results.errors.length} file(s) could not be moved
                    </p>
                  </div>
                )}
              </div>

              <motion.button
                onClick={handleContinue}
                whileHover={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 border border-red-500/50 bg-red-500/10 
                           text-red-300 font-tech text-sm tracking-[0.3em] uppercase
                           hover:border-red-400 transition-all rounded"
              >
                VIEW SUMMARY
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default InteractiveExecutingScreen;
