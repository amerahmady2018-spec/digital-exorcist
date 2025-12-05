import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { formatFileSize } from '../../utils/entityUtils';
import type { SwiftPurgeScanResult, SwiftPurgeScanProgress } from '../../../shared/types';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * SwiftPurgePreviewScreen - Scan & Classification Preview
 * 
 * Professional horror-tech aesthetic: dark, surgical, high-trust.
 * Shows scan progress and classification summary before execution.
 * Background texture from title screen (subtle).
 */

export const SwiftPurgePreviewScreen: React.FC = () => {
  const { context, transition, updateFlowContext } = useAppStore();
  const targetPath = context.flowContext?.selectedLocation || '';
  
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState<SwiftPurgeScanProgress | null>(null);
  const [scanResult, setScanResult] = useState<SwiftPurgeScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!targetPath) {
      setError('No target path selected');
      setIsScanning(false);
      return;
    }

    let cleanupProgress: (() => void) | null = null;

    const runScan = async () => {
      try {
        cleanupProgress = window.electronAPI.onSwiftPurgeProgress((progress) => {
          setScanProgress(progress);
        });

        const response = await window.electronAPI.swiftPurgeScan(targetPath);
        
        if (response.success && response.result) {
          setScanResult(response.result);
        } else {
          setError(response.error || 'Scan failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Scan failed');
      } finally {
        setIsScanning(false);
      }
    };

    runScan();

    return () => {
      if (cleanupProgress) cleanupProgress();
    };
  }, [targetPath]);

  const handleExecute = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const handleConfirmExecute = useCallback(() => {
    if (!scanResult) return;
    updateFlowContext({ 
      entities: [],
      selectedLocation: targetPath
    });
    sessionStorage.setItem('swiftPurgeScanResult', JSON.stringify(scanResult));
    transition(AppState.SWIFT_PURGE_EXECUTING);
  }, [scanResult, targetPath, updateFlowContext, transition]);

  const handleBack = useCallback(() => {
    transition(AppState.SWIFT_PURGE_TARGET);
  }, [transition]);

  const handleCancel = useCallback(() => {
    transition(AppState.EXORCISM_STYLE);
  }, [transition]);

  const getPhaseLabel = (phase?: string) => {
    switch (phase) {
      case 'scanning': return 'SCANNING FILESYSTEM';
      case 'hashing': return 'COMPUTING SIGNATURES';
      case 'classifying': return 'CLASSIFYING ENTITIES';
      default: return 'INITIALIZING';
    }
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
        style={{ width: '70%', height: '50%', right: '-15%', top: '20%' }}
        animate={{ x: ['0%', '-20%', '0%'], y: ['0%', '10%', '0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-full h-full opacity-35"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 60% 50%, rgba(147,51,234,0.35) 0%, transparent 60%)',
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

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl font-light text-purple-300 tracking-[0.4em] uppercase mb-3">
            {isScanning ? 'ANALYZING' : error ? 'SCAN FAILED' : 'ANALYSIS COMPLETE'}
          </h1>
          <div className="w-28 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent mx-auto" />
        </motion.div>

        {/* Scanning State */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            {/* Minimal geometric spinner */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 border border-purple-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 border border-purple-500/50 rotate-45"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-500/70" />
              </div>
            </div>

            <p className="text-purple-400/80 text-xs tracking-[0.3em] uppercase mb-2">
              {getPhaseLabel(scanProgress?.phase)}
            </p>
            <p className="text-gray-600 text-xs font-mono">
              {scanProgress?.filesScanned || 0} files processed
            </p>
            
            {/* Target path */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-600 text-xs font-mono truncate px-8">
                {targetPath}
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="border border-gray-800 bg-black p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm mb-2">{error}</p>
                  <p className="text-gray-600 text-xs">Unable to complete filesystem analysis.</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleBack}
              className="w-full py-4 border border-gray-800 text-gray-500 text-xs tracking-[0.2em] uppercase
                         hover:border-gray-700 hover:text-gray-400 transition-colors"
            >
              SELECT DIFFERENT TARGET
            </button>
          </motion.div>
        )}


        {/* Results State */}
        {scanResult && !isScanning && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Classification Summary */}
            <div className="border border-gray-800 bg-black mb-6">
              <div className="grid grid-cols-3 divide-x divide-gray-800">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500/70" />
                    <span className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">GHOSTS</span>
                  </div>
                  <p className="text-2xl font-light text-gray-300">{scanResult.counts.ghosts}</p>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500/70" />
                    <span className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">ZOMBIES</span>
                  </div>
                  <p className="text-2xl font-light text-gray-300">{scanResult.counts.zombies}</p>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500/70" />
                    <span className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">DEMONS</span>
                  </div>
                  <p className="text-2xl font-light text-gray-300">{scanResult.counts.demons}</p>
                </div>
              </div>
              
              {/* Space recovery */}
              <div className="border-t border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs tracking-[0.15em] uppercase">
                    Potential space recovery
                  </span>
                  <span className="text-purple-400 text-lg font-light">
                    {formatFileSize(scanResult.totalBytes)}
                  </span>
                </div>
              </div>
            </div>

            {/* Limit warning */}
            {scanResult.limitReached && (
              <div className="flex items-start gap-3 mb-6 px-1">
                <div className="w-1.5 h-1.5 bg-amber-500/70 mt-1.5 flex-shrink-0" />
                <p className="text-gray-500 text-xs">
                  File limit reached. Only the first 1,000 files were analyzed in this scan.
                </p>
              </div>
            )}

            {/* No entities */}
            {scanResult.files.length === 0 && (
              <div className="border border-gray-800 bg-black p-8 mb-6 text-center">
                <p className="text-gray-400 text-sm mb-2">No entities detected</p>
                <p className="text-gray-600 text-xs">All files appear to be recent and unique.</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {scanResult.files.length > 0 && (
                <motion.button
                  onClick={handleExecute}
                  whileHover={{ backgroundColor: 'rgba(147,51,234,0.15)' }}
                  whileTap={{ scale: 0.995 }}
                  className="w-full py-5 border border-purple-500/50 bg-purple-500/10 
                             text-purple-300 text-xs tracking-[0.3em] uppercase
                             hover:border-purple-400 transition-all"
                >
                  EXECUTE SWIFT PURGE
                </motion.button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBack}
                  className="py-4 border border-gray-800 text-gray-600 text-xs tracking-[0.15em] uppercase
                             hover:border-gray-700 hover:text-gray-500 transition-colors"
                >
                  CHANGE TARGET
                </button>
                <button
                  onClick={handleCancel}
                  className="py-4 border border-gray-800 text-gray-600 text-xs tracking-[0.15em] uppercase
                             hover:border-gray-700 hover:text-gray-500 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>

            {/* Target path */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-600 text-xs font-mono truncate text-center">
                {targetPath}
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <span className="text-gray-700 text-xs tracking-[0.15em] uppercase">
            ESC — Go back
          </span>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && scanResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="fixed inset-0 bg-black/90 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-6"
            >
              <div className="border border-gray-800 bg-black">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                
                <div className="p-8">
                  <h3 className="text-purple-400 text-sm tracking-[0.3em] uppercase text-center mb-6">
                    CONFIRM EXECUTION
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Entities to purge</span>
                      <span className="text-gray-300">{scanResult.files.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Space to recover</span>
                      <span className="text-gray-300">{formatFileSize(scanResult.totalBytes)}</span>
                    </div>
                    <div className="border-t border-gray-800 pt-4">
                      <p className="text-gray-600 text-xs text-center">
                        Files will be moved to the local Graveyard.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="py-3 border border-gray-800 text-gray-500 text-xs tracking-[0.15em] uppercase
                                 hover:border-gray-700 hover:text-gray-400 transition-colors"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirmExecute}
                      className="py-3 border border-purple-500/50 bg-purple-500/10 text-purple-300 
                                 text-xs tracking-[0.15em] uppercase hover:bg-purple-500/20 transition-colors"
                    >
                      EXECUTE
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwiftPurgePreviewScreen;
