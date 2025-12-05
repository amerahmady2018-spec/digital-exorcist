import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import iconWarning from '../../assets/images/icon_warning.png';
import graveyardIcon from '../../assets/images/graveyard.png';
import iconUndo from '../../assets/images/icon_undo.png';
import { GameIcon } from './ui/GameIcon';

/**
 * GraveyardView - Displays banished files in the graveyard
 * 
 * Shows a list of banished files with restore functionality.
 * Uses forwardRef for Framer Motion compatibility and parent-child ref control.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

export interface GraveyardFile {
  path: string;
  originalPath: string;
}

export interface GraveyardViewProps {
  /** Callback when a file is restored */
  onRestore: (graveyardPath: string, originalPath: string) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

const GraveyardView = forwardRef<HTMLDivElement, GraveyardViewProps>(
  ({ onRestore, className = '' }, ref) => {
  const [files, setFiles] = useState<GraveyardFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<GraveyardFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load graveyard files on mount
  useEffect(() => {
    loadGraveyardFiles();
  }, []);

  // Filter files when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFiles(files);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = files.filter(file => 
        file.originalPath.toLowerCase().includes(query) ||
        file.path.toLowerCase().includes(query)
      );
      setFilteredFiles(filtered);
    }
  }, [searchQuery, files]);

  const loadGraveyardFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const graveyardFiles = await window.electronAPI.getGraveyardFiles();
      setFiles(graveyardFiles);
      setFilteredFiles(graveyardFiles);
    } catch (err) {
      console.error('Failed to load graveyard files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load graveyard files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (file: GraveyardFile) => {
    const confirmed = window.confirm(
      `Restore this file to its original location?\n\n${file.originalPath}`
    );
    
    if (!confirmed) return;

    try {
      await onRestore(file.path, file.originalPath);
      // Reload graveyard files after successful restore
      await loadGraveyardFiles();
    } catch (err) {
      console.error('Failed to restore file:', err);
      // Error handling is done in parent component
    }
  };

  if (isLoading) {
    return (
      <div className="bg-graveyard-900 rounded-lg border border-graveyard-700 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spectral-purple"></div>
          <p className="text-graveyard-400 font-tech">Loading graveyard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-graveyard-900 rounded-lg border border-red-900 p-6">
        <div className="flex items-center gap-3 text-red-400">
          <GameIcon src={iconWarning} size="md" glow glowColor="rgba(239,68,68,0.6)" />
          <div>
            <p className="font-tech font-semibold">Error loading graveyard</p>
            <p className="text-sm text-red-300 font-tech">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`bg-graveyard-900 rounded-lg border border-graveyard-700 p-6 ${className}`} data-testid="graveyard-view">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-creepster text-spectral-purple mb-2 flex items-center gap-2">
          <GameIcon src={graveyardIcon} size="md" glow />
          Graveyard
        </h2>
        <p className="text-graveyard-400 font-tech text-sm">
          {files.length} banished {files.length === 1 ? 'file' : 'files'}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by file path..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-graveyard-800 border border-graveyard-600 rounded-lg 
                   text-gray-100 font-tech placeholder-graveyard-500
                   hover:border-graveyard-500
                   focus:outline-none focus:ring-2 focus:ring-spectral-purple focus:border-transparent
                   transition-all"
        />
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-graveyard-500 font-tech">
          {searchQuery ? (
            <>
              <p className="text-lg mb-2">No files match your search</p>
              <p className="text-sm">Try a different search term</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">The graveyard is empty</p>
              <p className="text-sm">Banished files will appear here</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.path}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.03,
                  ease: "easeOut"
                }}
                layout
                className="bg-graveyard-800 border border-graveyard-600 rounded-lg p-4
                         hover:border-spectral-purple hover:shadow-lg hover:shadow-spectral-purple/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <GameIcon src={graveyardIcon} size="sm" className="opacity-70" />
                      <p className="text-sm text-graveyard-400 font-tech font-mono">
                        Original Location
                      </p>
                    </div>
                    <p className="text-gray-100 font-tech font-mono text-sm break-all mb-3">
                      {file.originalPath}
                    </p>
                    <p className="text-xs text-graveyard-500 font-tech font-mono break-all">
                      Graveyard: {file.path}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleRestore(file)}
                    className="weapon-trigger-btn-save flex-shrink-0 px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600
                             text-white font-tech font-bold text-sm uppercase tracking-wider border border-purple-500 transition-all duration-200
                             focus:outline-none focus:ring-2 focus:ring-spectral-purple focus:ring-offset-2 
                             focus:ring-offset-graveyard-900 flex items-center gap-2"
                    style={{
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(168, 85, 247, 0.6)',
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <GameIcon src={iconUndo} size="sm" glow glowColor="rgba(168,85,247,0.8)" />
                    RESTORE SOUL
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
  }
);

GraveyardView.displayName = 'GraveyardView';

export { GraveyardView };
