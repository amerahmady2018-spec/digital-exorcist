import { forwardRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import iconUndo from '../../assets/images/icon_undo.png';
import { GameIcon } from './ui/GameIcon';

/**
 * Props for the UndoToast component
 */
export interface UndoToastProps {
  /** Unique identifier for the undo entry */
  undoId: string;
  /** Name of the file that was banished */
  fileName: string;
  /** Callback when undo is clicked */
  onUndo: (undoId: string) => Promise<void>;
  /** Callback when toast is dismissed (either by timeout or after undo) */
  onDismiss: () => void;
  /** Duration in milliseconds before auto-dismiss (default: 5000ms) */
  duration?: number;
}

/**
 * UndoToast - Displays a prominent "UNDO SPELL" toast notification after file banishment
 * 
 * Features:
 * - Prominent "UNDO SPELL" button
 * - Countdown timer visualization
 * - Auto-dismiss after 5 seconds with fade-out
 * - Wires button to undoBanish IPC call
 * - Updates HUD on successful undo
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */
const UndoToast = forwardRef<HTMLDivElement, UndoToastProps>(
  ({ undoId, fileName, onUndo, onDismiss, duration = 5000 }, ref) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isUndoing, setIsUndoing] = useState(false);
    const [remainingTime, setRemainingTime] = useState(duration);
    const [startTime] = useState(Date.now());

    // Update remaining time every 100ms for smooth countdown
    useEffect(() => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        setRemainingTime(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          setIsVisible(false);
        }
      }, 100);

      return () => clearInterval(interval);
    }, [duration, startTime]);

    // Handle dismiss after fade-out animation
    useEffect(() => {
      if (!isVisible) {
        const timer = setTimeout(() => {
          onDismiss();
        }, 300); // Wait for fade-out animation
        return () => clearTimeout(timer);
      }
    }, [isVisible, onDismiss]);

    // Handle undo button click
    const handleUndo = useCallback(async () => {
      if (isUndoing) return;
      
      setIsUndoing(true);
      try {
        await onUndo(undoId);
        setIsVisible(false);
      } catch (error) {
        console.error('Failed to undo:', error);
        setIsUndoing(false);
      }
    }, [undoId, onUndo, isUndoing]);

    // Calculate progress percentage for countdown bar
    const progressPercent = (remainingTime / duration) * 100;
    const remainingSeconds = Math.ceil(remainingTime / 1000);

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
            data-testid="undo-toast"
          >
            <div className="bg-graveyard-900/95 backdrop-blur-xl rounded-lg border-2 border-spectral-purple/50 shadow-2xl shadow-purple-500/30 overflow-hidden min-w-[320px]">
              {/* Countdown progress bar */}
              <div className="h-1 bg-graveyard-800 relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-spectral-purple to-purple-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>

              <div className="p-4">
                {/* Header with file name */}
                <div className="flex items-center gap-3 mb-3">
                  <GameIcon src={iconUndo} size="md" glow glowColor="rgba(168,85,247,0.8)" />
                  <div className="flex-1">
                    <p className="text-white font-tech font-bold text-sm">
                      FILE BANISHED
                    </p>
                    <p className="text-gray-400 font-tech text-xs truncate max-w-[200px]" title={fileName}>
                      {fileName}
                    </p>
                  </div>
                  <span className="text-spectral-purple font-tech font-bold text-lg">
                    {remainingSeconds}s
                  </span>
                </div>

                {/* Undo button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className={`
                    w-full py-3 px-4 rounded-lg font-tech font-bold text-lg
                    transition-all duration-200
                    ${isUndoing
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-spectral-purple to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 shadow-lg shadow-purple-500/30'
                    }
                  `}
                >
                  {isUndoing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⟳</span>
                      REVERSING SPELL...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <GameIcon src={iconUndo} size="sm" glow glowColor="rgba(168,85,247,0.8)" />
                      UNDO SPELL
                      <span className="text-sm opacity-75">[CTRL+Z]</span>
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

UndoToast.displayName = 'UndoToast';

export { UndoToast };
