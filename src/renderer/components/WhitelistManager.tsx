import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import custom icons
import iconWarning from '../../assets/images/icon_warning.png';
import whitelistIcon from '../../assets/images/whitelist.png';
import { GameIcon } from './ui/GameIcon';

export function WhitelistManager() {
  const [whitelistedFiles, setWhitelistedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load whitelist on mount
  useEffect(() => {
    loadWhitelist();
  }, []);

  const loadWhitelist = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await window.electronAPI.getWhitelist();
      setWhitelistedFiles(files);
    } catch (err) {
      console.error('Failed to load whitelist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load whitelist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWhitelist = async (filePath: string) => {
    // Confirm removal
    const confirmed = window.confirm(
      `Remove this file from the whitelist?\n\n${filePath}\n\nIt will be classified again in future scans.`
    );

    if (!confirmed) return;

    try {
      const result = await window.electronAPI.removeFromWhitelist(filePath);
      
      if (result.success) {
        console.log(`File removed from whitelist: ${filePath}`);
        // Remove from local state
        setWhitelistedFiles(prev => prev.filter(f => f !== filePath));
      } else {
        console.error('Remove from whitelist failed:', result.error);
        alert(`Failed to remove file from whitelist: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to remove from whitelist:', err);
      alert(`Failed to remove file from whitelist: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Filter files based on search query
  const filteredFiles = whitelistedFiles.filter(file =>
    file.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-graveyard-900 rounded-lg border border-graveyard-700 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spectral-purple"></div>
          <p className="text-graveyard-400 font-tech">Loading whitelist...</p>
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
            <p className="font-tech font-semibold">Error loading whitelist</p>
            <p className="text-sm text-red-300 font-tech">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-graveyard-900 rounded-lg border border-graveyard-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-creepster text-spectral-purple mb-2 flex items-center gap-2">
          <GameIcon src={whitelistIcon} size="md" glow />
          Resurrected Files
        </h2>
        <p className="text-graveyard-400 font-tech text-sm">
          {whitelistedFiles.length} {whitelistedFiles.length === 1 ? 'file' : 'files'} protected from future scans
          {filteredFiles.length !== whitelistedFiles.length && (
            <span className="text-spectral-purple">
              {' '}• {filteredFiles.length} filtered
            </span>
          )}
        </p>
      </div>

      {/* Search Bar */}
      {whitelistedFiles.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search whitelisted files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-graveyard-800 border border-graveyard-600 rounded-lg 
                     text-gray-100 placeholder-graveyard-500 hover:border-graveyard-500
                     focus:outline-none focus:ring-2 
                     focus:ring-spectral-purple focus:border-transparent transition-all"
          />
        </div>
      )}

      {/* Whitelist Display */}
      {whitelistedFiles.length === 0 ? (
        <div className="text-center py-12 text-graveyard-500 font-tech">
          <p className="text-lg mb-2">No resurrected files yet</p>
          <p className="text-sm">Files you resurrect will be protected from future classifications</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-graveyard-500 font-tech">
          <p className="text-lg mb-2">No files match your search</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredFiles.map((filePath, index) => (
              <motion.div
                key={filePath}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.02,
                  ease: "easeOut"
                }}
                layout
                className="bg-graveyard-800 border border-graveyard-600 rounded-lg p-4
                         hover:border-spectral-purple hover:shadow-lg hover:shadow-spectral-purple/10 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <GameIcon src={whitelistIcon} size="sm" glow glowColor="rgba(34,197,94,0.6)" />
                      <span className="text-xs text-graveyard-500 font-tech font-semibold uppercase tracking-wide">
                        Protected
                      </span>
                    </div>
                    <p className="text-gray-100 font-tech font-mono text-sm break-all">
                      {filePath}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWhitelist(filePath)}
                    className="flex-shrink-0 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 active:bg-red-900/70
                             text-red-400 hover:text-red-300 rounded-lg transition-all text-sm font-medium
                             border border-red-900/50 hover:border-red-700 shadow-md hover:shadow-red-500/20"
                    title="Remove from whitelist"
                  >
                    Remove
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
