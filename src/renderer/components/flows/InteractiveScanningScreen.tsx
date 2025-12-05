import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import type { SwiftPurgeScanProgress } from '../../../shared/types';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * InteractiveScanningScreen - Controlled folder scan for Interactive Mode
 * 
 * Recursive scan with max 1000 files. Shows calm progress indicator.
 * Styled like ExorcismStyleScreen but more subtle.
 */

export const InteractiveScanningScreen: React.FC = () => {
  const { context, transition, updateFlowContext } = useAppStore();
  const targetPath = context.flowContext?.selectedLocation || '';
  
  const [scanProgress, setScanProgress] = useState<SwiftPurgeScanProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetPath) {
      setError('No target path selected');
      return;
    }

    let cleanupProgress: (() => void) | null = null;
    let isCancelled = false;

    const runScan = async () => {
      try {
        cleanupProgress = window.electronAPI.onSwiftPurgeProgress((progress) => {
          if (!isCancelled) {
            setScanProgress(progress);
          }
        });

        const response = await window.electronAPI.swiftPurgeScan(targetPath);
        
        if (isCancelled) return;
        
        if (response.success && response.result) {
          // Store scan result for group resolution
          sessionStorage.setItem('interactiveScanResult', JSON.stringify(response.result));
          updateFlowContext({ selectedLocation: targetPath });
          transition(AppState.INTERACTIVE_GROUP_RESOLUTION);
        } else {
          setError(response.error || 'Scan failed');
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Scan failed');
        }
      }
    };

    runScan();

    return () => {
      isCancelled = true;
      if (cleanupProgress) cleanupProgress();
    };
  }, [targetPath, transition, updateFlowContext]);

  const handleCancel = useCallback(() => {
    transition(AppState.INTERACTIVE_TARGET);
  }, [transition]);

  const getPhaseLabel = (phase?: string) => {
    switch (phase) {
      case 'scanning': return 'SCANNING FILESYSTEM';
      case 'hashing': return 'COMPUTING SIGNATURES';
      case 'classifying': return 'CLASSIFYING ENTITIES';
      default: return 'INITIALIZING';
    }
  };

  // Shared background component
  const BackgroundEffects = () => (
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

  if (error) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black relative">
        <BackgroundEffects />
        <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
          <div className="border border-gray-800 bg-black/60 backdrop-blur-sm p-8 mb-8 rounded-lg">
            <div className="flex items-start gap-4 text-left">
              <div className="w-2 h-2 bg-red-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-400 font-tech text-sm mb-2">{error}</p>
                <p className="text-gray-600 font-tech text-xs">Unable to complete filesystem analysis.</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCancel}
            className="text-gray-500 font-tech text-xs tracking-[0.2em] uppercase hover:text-gray-400 transition-colors"
          >
            SELECT DIFFERENT TARGET
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black relative">
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <h1 className="text-2xl font-tech font-light text-red-400 tracking-[0.4em] uppercase">
            ANALYZING
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto" />
        </motion.div>

        {/* Minimal geometric spinner */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          <motion.div
            className="absolute inset-0 border border-red-500/30 rounded"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-3 border border-red-500/50 rotate-45 rounded"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500/70 rounded-sm" />
          </div>
        </div>

        {/* Progress info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-red-400/80 font-tech text-xs tracking-[0.3em] uppercase mb-2">
            {getPhaseLabel(scanProgress?.phase)}
          </p>
          <p className="text-gray-600 font-tech text-xs font-mono mb-1">
            {scanProgress?.filesScanned || 0} files processed
          </p>
          <p className="text-gray-700 font-tech text-xs">
            Maximum 1,000 files
          </p>
        </motion.div>

        {/* Status text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 pt-6 border-t border-gray-800/50"
        >
          <p className="text-gray-500 font-tech text-xs">
            Analyzing file structure and signatures.
          </p>
        </motion.div>

        {/* Target path */}
        <div className="mt-8">
          <p className="text-gray-700 font-tech text-xs font-mono truncate px-4">
            {targetPath}
          </p>
        </div>

        {/* Keyboard hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <span className="flex items-center gap-1.5 text-gray-500 font-tech text-[10px] tracking-wider">
            <span className="border border-gray-700 px-2 py-1 rounded text-xs text-gray-400">ESC</span>
            <span className="ml-1">cancel</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveScanningScreen;
