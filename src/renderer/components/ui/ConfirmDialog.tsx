import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmDialog - Reusable confirmation dialog with cyber-horror theme
 * 
 * Used for: exit during active encounter, exit with selections, etc.
 */

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  subMessage,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          border: 'border-red-500/50',
          titleColor: 'text-red-400',
          confirmBg: 'bg-red-500/20',
          confirmBorder: 'border-red-500/50',
          confirmText: 'text-red-400',
          confirmHover: 'hover:bg-red-500/30',
          icon: '⚠️'
        };
      case 'warning':
        return {
          border: 'border-orange-500/50',
          titleColor: 'text-orange-400',
          confirmBg: 'bg-orange-500/20',
          confirmBorder: 'border-orange-500/50',
          confirmText: 'text-orange-400',
          confirmHover: 'hover:bg-orange-500/30',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          border: 'border-purple-500/50',
          titleColor: 'text-purple-400',
          confirmBg: 'bg-purple-500/20',
          confirmBorder: 'border-purple-500/50',
          confirmText: 'text-purple-400',
          confirmHover: 'hover:bg-purple-500/30',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className={`bg-black border-2 ${styles.border} rounded-xl p-6 max-w-md mx-4 shadow-2xl`}
          >
            <div className="text-center mb-4">
              <span className="text-4xl">{styles.icon}</span>
              <h3 className={`${styles.titleColor} font-bold text-xl mt-2`}>{title}</h3>
            </div>
            
            <p className="text-gray-300 text-sm mb-2 text-center">
              {message}
            </p>
            
            {subMessage && (
              <p className="text-gray-500 text-xs mb-4 text-center">
                {subMessage}
              </p>
            )}
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={onCancel}
                className="flex-1 py-2 bg-gray-500/20 border border-gray-500/50 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2 ${styles.confirmBg} border ${styles.confirmBorder} ${styles.confirmText} rounded-lg ${styles.confirmHover} transition-colors`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
