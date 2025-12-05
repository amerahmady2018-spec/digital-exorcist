import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SafetyInfoPanel - Modal explaining safe purge and undo functionality
 * 
 * Displays information about:
 * - Non-destructive purge (files moved to graveyard)
 * - Undo functionality
 * - Graveyard location
 */

interface SafetyInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyInfoPanel: React.FC<SafetyInfoPanelProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div 
              className="bg-black/95 border-2 border-green-500/50 rounded-lg p-6 shadow-2xl shadow-green-500/20"
              style={{
                clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400 tracking-wider uppercase flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  Safety Information
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Safe Purge */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                    <span>✓</span> Safe Purge
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Files are <span className="text-green-400 font-semibold">never permanently deleted</span>. 
                    When you purge an entity, the file is safely moved to the <span className="text-purple-400">Graveyard</span> folder.
                  </p>
                </div>

                {/* Undo Available */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                    <span>↩️</span> Undo Available
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    After each purge, you have <span className="text-purple-400 font-semibold">5 seconds</span> to undo the action. 
                    You can also restore files anytime from the Graveyard.
                  </p>
                </div>

                {/* Graveyard Location */}
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
                  <h3 className="text-gray-300 font-bold mb-2 flex items-center gap-2">
                    <span>📁</span> Graveyard Location
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Purged files are stored in:
                  </p>
                  <code className="block mt-2 text-xs bg-black/50 text-green-400 p-2 rounded font-mono">
                    ./graveyard_trash/
                  </code>
                </div>

                {/* Warning */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <h3 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
                    <span>⚠️</span> Important Note
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    While files can be restored, always review before purging. 
                    The Digital Exorcist helps you clean, but <span className="text-orange-400">you make the final decision</span>.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full mt-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 font-bold tracking-wider uppercase rounded-lg hover:bg-green-500/30 transition-colors"
              >
                I Understand
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SafetyInfoPanel;
