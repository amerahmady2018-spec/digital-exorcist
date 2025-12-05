import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import type { SwiftPurgeScanResult, SwiftPurgeExecuteResult } from '../../../shared/types';

/**
 * SwiftPurgeExecutingScreen - Execution Progress
 * 
 * Professional horror-tech aesthetic: dark, surgical, high-trust.
 * Shows progress while files are being moved to graveyard.
 * No user interaction until complete.
 */

export const SwiftPurgeExecutingScreen: React.FC = () => {
  const { transition } = useAppStore();
  
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState('Initializing containment protocol...');

  useEffect(() => {
    const storedResult = sessionStorage.getItem('swiftPurgeScanResult');
    if (!storedResult) {
      transition(AppState.SWIFT_PURGE_TARGET);
      return;
    }

    const scanResult: SwiftPurgeScanResult = JSON.parse(storedResult);
    setProgress({ current: 0, total: scanResult.files.length });

    let cleanupProgress: (() => void) | null = null;

    const executeSwiftPurge = async () => {
      try {
        cleanupProgress = window.electronAPI.onSwiftPurgeProgress((prog) => {
          if (prog.phase === 'executing') {
            const match = prog.currentPath.match(/(\d+)\/(\d+)/);
            if (match) {
              setProgress({ current: parseInt(match[1]), total: parseInt(match[2]) });
            }
          }
          setStatus(prog.currentPath);
        });

        setStatus('Relocating files to Graveyard...');
        
        const result: SwiftPurgeExecuteResult = await window.electronAPI.swiftPurgeExecute(scanResult);
        
        sessionStorage.setItem('swiftPurgeExecuteResult', JSON.stringify(result));
        sessionStorage.removeItem('swiftPurgeScanResult');
        
        transition(AppState.SWIFT_PURGE_RESULT);
      } catch (err) {
        console.error('Swift Purge execution failed:', err);
        sessionStorage.setItem('swiftPurgeExecuteResult', JSON.stringify({
          success: false,
          sessionId: scanResult.sessionId,
          purgedCount: 0,
          bytesFreed: 0,
          errors: [{ path: 'execution', error: err instanceof Error ? err.message : 'Unknown error' }]
        }));
        transition(AppState.SWIFT_PURGE_RESULT);
      }
    };

    executeSwiftPurge();

    return () => {
      if (cleanupProgress) cleanupProgress();
    };
  }, [transition]);

  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black">
      {/* Subtle top-center gradient light */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147,51,234,0.08) 0%, transparent 50%)'
        }}
      />
      
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-2xl font-light text-purple-400 tracking-[0.4em] uppercase mb-3">
            EXECUTING
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mx-auto" />
        </motion.div>

        {/* Progress visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          {/* Geometric progress indicator */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer rotating frame */}
            <motion.div
              className="absolute inset-0 border border-gray-800"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(75,75,75,0.3)"
                strokeWidth="1"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(147,51,234,0.6)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="square"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - percentage / 100) }}
                transition={{ duration: 0.3 }}
              />
            </svg>

            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-300 text-2xl font-light">{percentage}</span>
              <span className="text-gray-500 text-sm ml-0.5">%</span>
            </div>
          </div>

          {/* File count */}
          <p className="text-gray-400 text-sm mb-2">
            <span className="text-gray-300">{progress.current}</span>
            <span className="text-gray-600 mx-2">/</span>
            <span className="text-gray-500">{progress.total}</span>
            <span className="text-gray-600 ml-2">files</span>
          </p>

          {/* Status */}
          <p className="text-gray-600 text-xs font-mono truncate px-4">
            {status}
          </p>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border border-gray-800 p-4"
        >
          <p className="text-gray-500 text-xs tracking-wider">
            Operation in progress. Do not close the application.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SwiftPurgeExecutingScreen;
