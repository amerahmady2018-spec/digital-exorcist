import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScanProgress as ScanProgressType } from '../../shared/types';

// Import custom icons
import dashboardIcon from '../../assets/images/dashboard.png';
import { GameIcon } from './ui/GameIcon';

interface ScanProgressProps {
  isScanning: boolean;
  onCancel: () => void;
}

export function ScanProgress({ isScanning, onCancel }: ScanProgressProps) {
  const [progress, setProgress] = useState<ScanProgressType>({
    filesScanned: 0,
    currentPath: ''
  });

  useEffect(() => {
    if (!isScanning) {
      // Reset progress when not scanning
      setProgress({
        filesScanned: 0,
        currentPath: ''
      });
      return;
    }

    // Listen for progress updates
    const cleanup = window.electronAPI.onScanProgress((progressData) => {
      setProgress(progressData);
    });

    // Return cleanup function to remove listener when component unmounts or isScanning changes
    return cleanup;
  }, [isScanning]);

  const handleCancel = async () => {
    try {
      await window.electronAPI.cancelScan();
      onCancel();
    } catch (error) {
      console.error('Failed to cancel scan:', error);
    }
  };

  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-graveyard-900 rounded-lg p-6 shadow-2xl border border-graveyard-700 mt-6"
        >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-creepster text-spectral-green flex items-center gap-2">
          <GameIcon src={dashboardIcon} size="sm" glow glowColor="rgba(34,197,94,0.6)" className="animate-pulse" />
          Scanning in Progress...
        </h3>
        <button
          onClick={handleCancel}
          className="bg-spectral-red hover:bg-red-600 active:bg-red-700 text-white font-tech font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95"
        >
          Cancel Scan
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-graveyard-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-spectral-purple h-full transition-all duration-300 ease-out animate-pulse"
            style={{ width: '100%' }}
          >
            <div className="h-full w-full bg-gradient-to-r from-spectral-purple via-purple-400 to-spectral-purple bg-[length:200%_100%] animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* File Count */}
      <div className="mb-3">
        <p className="text-graveyard-300 font-tech text-sm mb-1">Files Scanned:</p>
        <motion.p 
          key={progress.filesScanned}
          initial={{ scale: 1.2, color: '#10b981' }}
          animate={{ scale: 1, color: '#10b981' }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-tech font-bold text-spectral-green"
        >
          {progress.filesScanned.toLocaleString()}
        </motion.p>
      </div>

      {/* Current Path */}
      <AnimatePresence mode="wait">
        {progress.currentPath && (
          <motion.div
            key={progress.currentPath}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-graveyard-300 font-tech text-sm mb-1">Current Path:</p>
            <p className="text-graveyard-400 font-tech font-mono text-xs break-all bg-graveyard-800 p-2 rounded border border-graveyard-600">
              {progress.currentPath}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
