import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import custom icons
import iconWarning from '../../assets/images/icon_warning.png';

interface DirectorySelectorProps {
  onScanStart: (dirPath: string) => void;
  isScanning?: boolean;
}

export function DirectorySelector({ onScanStart, isScanning = false }: DirectorySelectorProps) {
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectDirectory = async () => {
    setValidationError(null);
    setIsValidating(true);

    try {
      const result = await window.electronAPI.selectDirectory();
      
      if (result.success && result.path) {
        setSelectedDirectory(result.path);
        setValidationError(null);
        
        // Trigger scan on successful selection
        onScanStart(result.path);
      } else if (result.error) {
        setValidationError(result.error);
        setSelectedDirectory(null);
      } else {
        // User cancelled selection
        setValidationError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select directory';
      setValidationError(errorMessage);
      setSelectedDirectory(null);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-graveyard-900 rounded-lg p-8 shadow-2xl border border-graveyard-700">
      <h2 className="text-2xl font-creepster mb-4 text-spectral-green">
        Select a Directory to Exorcise
      </h2>
      
      <button
        onClick={handleSelectDirectory}
        disabled={isScanning || isValidating}
        className="w-full bg-spectral-purple hover:bg-purple-600 active:bg-purple-700 text-white font-tech font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-spectral-purple disabled:hover:shadow-none disabled:hover:scale-100"
      >
        {isValidating ? 'Validating...' : isScanning ? 'Scanning...' : 'Choose Directory'}
      </button>

      {/* Validation Error Display */}
      <AnimatePresence>
        {validationError && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-red-900/30 border border-spectral-red rounded-lg"
          >
            <div className="flex items-start">
              <motion.img 
                src={iconWarning}
                alt=""
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-6 h-6 mr-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              />
              <div>
                <p className="text-spectral-red font-tech font-semibold text-sm">Validation Error</p>
                <p className="text-red-300 font-tech text-sm mt-1">{validationError}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Directory Display */}
      <AnimatePresence>
        {selectedDirectory && !validationError && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 bg-graveyard-800 rounded border border-graveyard-600"
          >
            <p className="text-sm text-graveyard-400 font-tech mb-1">Selected Directory:</p>
            <p className="text-spectral-green font-tech font-mono text-sm break-all">
              {selectedDirectory}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isValidating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex items-center justify-center text-graveyard-400"
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-spectral-purple mr-2"></div>
            <span className="text-sm font-tech">Validating directory...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
