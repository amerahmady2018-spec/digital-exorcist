import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { formatFileSize } from '../../utils/entityUtils';
import type { SwiftPurgeExecuteResult } from '../../../shared/types';

/**
 * SwiftPurgeResultScreen - Result Summary
 * 
 * Professional horror-tech aesthetic: dark, surgical, high-trust.
 * Shows completion summary with undo option.
 */

export const SwiftPurgeResultScreen: React.FC = () => {
  const { transition } = useAppStore();
  
  const [result, setResult] = useState<SwiftPurgeExecuteResult | null>(null);
  const [singleFileResult, setSingleFileResult] = useState<{ fileName: string; fileSize: number; success: boolean } | null>(null);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [undoTimeLeft, setUndoTimeLeft] = useState(0);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoComplete, setUndoComplete] = useState(false);

  useEffect(() => {
    // Check for single file result first
    const singleFileData = sessionStorage.getItem('swiftPurgeSingleFileResult');
    if (singleFileData) {
      setSingleFileResult(JSON.parse(singleFileData));
      sessionStorage.removeItem('swiftPurgeSingleFileResult');
      return;
    }

    // Check for bulk purge result
    const storedResult = sessionStorage.getItem('swiftPurgeExecuteResult');
    if (storedResult) {
      const parsed: SwiftPurgeExecuteResult = JSON.parse(storedResult);
      setResult(parsed);
      
      if (parsed.undoExpiresAt) {
        const expiresAt = new Date(parsed.undoExpiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, expiresAt - now);
        
        if (remaining > 0) {
          setUndoAvailable(true);
          setUndoTimeLeft(Math.ceil(remaining / 1000));
        }
      }
      
      sessionStorage.removeItem('swiftPurgeExecuteResult');
    }
  }, []);

  useEffect(() => {
    if (!undoAvailable || undoTimeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setUndoTimeLeft(prev => {
        if (prev <= 1) {
          setUndoAvailable(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [undoAvailable, undoTimeLeft]);

  const handleUndo = useCallback(async () => {
    if (!result?.sessionId || isUndoing) return;
    
    setIsUndoing(true);
    try {
      const undoResult = await window.electronAPI.swiftPurgeUndo(result.sessionId);
      
      if (undoResult.success) {
        setUndoComplete(true);
        setUndoAvailable(false);
      } else {
        alert(`Undo failed: ${undoResult.errors.map(e => e.error).join(', ')}`);
      }
    } catch (err) {
      alert(`Undo failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUndoing(false);
    }
  }, [result, isUndoing]);

  const handleReturnToHQ = useCallback(() => {
    transition(AppState.EXORCISM_STYLE);
  }, [transition]);

  const handlePurgeMore = useCallback(() => {
    transition(AppState.SWIFT_PURGE_TARGET);
  }, [transition]);

  // Handle single file result display
  if (singleFileResult) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147,51,234,0.08) 0%, transparent 50%)'
          }}
        />
        
        <div className="relative z-10 w-full max-w-lg mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-2xl font-light text-purple-300 tracking-[0.4em] uppercase mb-3">
              FILE PURGED
            </h1>
            <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-800 bg-black/80 backdrop-blur-sm p-8 mb-8 text-center"
          >
            <div className="w-4 h-4 bg-purple-500/50 mx-auto mb-4 rotate-45" />
            <p className="text-gray-200 text-lg mb-2">{singleFileResult.fileName}</p>
            <p className="text-purple-400 text-2xl font-light mb-4">
              {formatFileSize(singleFileResult.fileSize)}
            </p>
            <p className="text-gray-500 text-xs">
              Moved to Graveyard. Restoration available at any time.
            </p>
          </motion.div>

          <motion.button
            onClick={handlePurgeMore}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ backgroundColor: 'rgba(147,51,234,0.1)' }}
            whileTap={{ scale: 0.995 }}
            className="w-full py-5 border border-purple-500/40 text-purple-300 text-xs tracking-[0.3em] uppercase
                       hover:border-purple-500/60 transition-all"
          >
            PURGE MORE
          </motion.button>

          <motion.button
            onClick={handleReturnToHQ}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            whileHover={{ backgroundColor: 'rgba(107,114,128,0.1)' }}
            whileTap={{ scale: 0.995 }}
            className="w-full py-3 border border-gray-700/40 text-gray-500 text-xs tracking-[0.2em] uppercase
                       hover:border-gray-600/60 hover:text-gray-400 transition-all mt-3"
          >
            RETURN TO COMMAND CENTER
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <span className="text-gray-600 text-xs tracking-[0.15em] uppercase">
              ESC — Return
            </span>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <p className="text-gray-600 text-xs tracking-wider">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black">
      {/* Subtle top-center gradient light */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: undoComplete 
            ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 50%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147,51,234,0.08) 0%, transparent 50%)'
        }}
      />
      
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={`text-2xl font-light tracking-[0.4em] uppercase mb-3 ${
            undoComplete ? 'text-green-400' : 'text-purple-300'
          }`}>
            {undoComplete ? 'OPERATION REVERSED' : 'PURGE COMPLETE'}
          </h1>
          <div className={`w-24 h-px mx-auto bg-gradient-to-r from-transparent to-transparent ${
            undoComplete ? 'via-green-500/50' : 'via-purple-400/50'
          }`} />
        </motion.div>

        {/* Results Panel */}
        {!undoComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-800 bg-black mb-8"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            
            {/* Main stat */}
            <div className="p-8 text-center border-b border-gray-800">
              <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase mb-2">
                SPACE RECOVERED
              </p>
              <p className="text-3xl font-light text-purple-400">
                {formatFileSize(result.bytesFreed)}
              </p>
            </div>

            {/* Secondary stat - only files purged */}
            <div className="p-6 text-center">
              <p className="text-gray-400 text-[10px] tracking-[0.15em] uppercase mb-1">
                FILES PURGED
              </p>
              <p className="text-xl font-light text-gray-200">{result.purgedCount}</p>
            </div>
          </motion.div>
        )}

        {/* Skipped files note - only show if there were errors but keep it subtle */}
        {!undoComplete && result.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-start gap-2 mb-6 px-1"
          >
            <div className="w-1 h-1 bg-gray-600 mt-1.5 flex-shrink-0" />
            <p className="text-gray-600 text-xs">
              {result.errors.length} file(s) were skipped (already moved or inaccessible)
            </p>
          </motion.div>
        )}


        {/* Undo complete message */}
        {undoComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-gray-800 bg-black p-8 mb-8 text-center"
          >
            <div className="w-3 h-3 bg-green-500/50 mx-auto mb-4" />
            <p className="text-gray-400 text-sm mb-2">
              All files have been restored to their original locations.
            </p>
            <p className="text-gray-600 text-xs">
              Operation log has been updated.
            </p>
          </motion.div>
        )}

        {/* Graveyard note */}
        {!undoComplete && result.purgedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 mb-8 px-1"
          >
            <div className="w-1 h-1 bg-gray-600 mt-1.5 flex-shrink-0" />
            <p className="text-gray-600 text-xs">
              Files remain in the Graveyard until manually removed. Restoration available at any time.
            </p>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.button
          onClick={handlePurgeMore}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ backgroundColor: 'rgba(147,51,234,0.1)' }}
          whileTap={{ scale: 0.995 }}
          className="w-full py-5 border border-purple-500/40 text-purple-400 text-xs tracking-[0.3em] uppercase
                     hover:border-purple-500/60 transition-all"
        >
          PURGE MORE
        </motion.button>

        <motion.button
          onClick={handleReturnToHQ}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          whileHover={{ backgroundColor: 'rgba(107,114,128,0.1)' }}
          whileTap={{ scale: 0.995 }}
          className="w-full py-3 border border-gray-700/40 text-gray-500 text-xs tracking-[0.2em] uppercase
                     hover:border-gray-600/60 hover:text-gray-400 transition-all mt-3"
        >
          RETURN TO COMMAND CENTER
        </motion.button>

        {/* Navigation hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <span className="text-gray-700 text-xs tracking-[0.15em] uppercase">
            ESC — Return
          </span>
        </motion.div>
      </div>

      {/* Undo Toast */}
      <AnimatePresence>
        {undoAvailable && !undoComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50"
          >
            <div className="border border-gray-800 bg-black">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs tracking-wider">
                      Purge executed
                    </p>
                    <p className="text-gray-600 text-[10px] tracking-wider mt-0.5">
                      Undo available for {undoTimeLeft}s
                    </p>
                  </div>
                  <button
                    onClick={handleUndo}
                    disabled={isUndoing}
                    className="px-4 py-2 border border-purple-500/40 text-purple-400 text-xs tracking-wider
                               hover:bg-purple-500/10 hover:border-purple-500/60 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUndoing ? 'UNDOING...' : 'UNDO'}
                  </button>
                </div>
                
                {/* Progress bar */}
                <div className="h-px bg-gray-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500/50"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: undoTimeLeft, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwiftPurgeResultScreen;
