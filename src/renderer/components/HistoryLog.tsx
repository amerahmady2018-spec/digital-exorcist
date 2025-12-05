import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogEntry, ActionType } from '../../shared/types';

// Import custom icons
import iconWarning from '../../assets/images/icon_warning.png';
import historyIcon from '../../assets/images/history.png';
import iconUndo from '../../assets/images/icon_undo.png';
import graveyardIcon from '../../assets/images/graveyard.png';
import whitelistIcon from '../../assets/images/whitelist.png';
import { GameIcon } from './ui/GameIcon';

export function HistoryLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState<ActionType | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Load log entries on mount
  useEffect(() => {
    loadLogEntries();
  }, []);

  // Apply filters when entries or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [entries, actionFilter, startDate, endDate]);

  const loadLogEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const logEntries = await window.electronAPI.getLogEntries();
      setEntries(logEntries);
      setFilteredEntries(logEntries);
    } catch (err) {
      console.error('Failed to load log entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history log');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    // Filter by action type
    if (actionFilter !== 'all') {
      filtered = filtered.filter(entry => entry.action === actionFilter);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= end);
    }

    setFilteredEntries(filtered);
  };

  const clearFilters = () => {
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const getActionIcon = (action: ActionType): JSX.Element => {
    switch (action) {
      case ActionType.Banish:
        return <GameIcon src={graveyardIcon} size="sm" glow glowColor="rgba(239,68,68,0.6)" />;
      case ActionType.Resurrect:
        return <GameIcon src={whitelistIcon} size="sm" glow glowColor="rgba(34,197,94,0.6)" />;
      case ActionType.Restore:
        return <GameIcon src={iconUndo} size="sm" glow glowColor="rgba(59,130,246,0.6)" />;
      default:
        return <GameIcon src={historyIcon} size="sm" />;
    }
  };

  const getActionColor = (action: ActionType): string => {
    switch (action) {
      case ActionType.Banish:
        return 'text-red-400';
      case ActionType.Resurrect:
        return 'text-spectral-green';
      case ActionType.Restore:
        return 'text-spectral-blue';
      default:
        return 'text-graveyard-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-graveyard-900 rounded-lg border border-graveyard-700 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spectral-purple"></div>
          <p className="text-graveyard-400 font-tech">Loading history...</p>
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
            <p className="font-tech font-semibold">Error loading history</p>
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
          <GameIcon src={historyIcon} size="md" glow />
          History Log
        </h2>
        <p className="text-graveyard-400 font-tech text-sm">
          {entries.length} total {entries.length === 1 ? 'entry' : 'entries'}
          {filteredEntries.length !== entries.length && (
            <span className="text-spectral-purple">
              {' '}• {filteredEntries.length} filtered
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Type Filter */}
          <div>
            <label className="block text-sm font-tech font-medium text-graveyard-300 mb-2">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionType | 'all')}
              className="w-full px-4 py-2 bg-graveyard-800 border border-graveyard-600 rounded-lg 
                       text-gray-100 font-tech hover:border-graveyard-500
                       focus:outline-none focus:ring-2 focus:ring-spectral-purple 
                       focus:border-transparent transition-all cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value={ActionType.Banish}>Banish</option>
              <option value={ActionType.Resurrect}>Resurrect</option>
              <option value={ActionType.Restore}>Restore</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-tech font-medium text-graveyard-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-graveyard-800 border border-graveyard-600 rounded-lg 
                       text-gray-100 font-tech hover:border-graveyard-500
                       focus:outline-none focus:ring-2 focus:ring-spectral-purple 
                       focus:border-transparent transition-all"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-tech font-medium text-graveyard-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-graveyard-800 border border-graveyard-600 rounded-lg 
                       text-gray-100 font-tech hover:border-graveyard-500
                       focus:outline-none focus:ring-2 focus:ring-spectral-purple 
                       focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(actionFilter !== 'all' || startDate || endDate) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-graveyard-800 hover:bg-graveyard-700 active:bg-graveyard-600 text-graveyard-300 hover:text-white
                     rounded-lg transition-all text-sm font-tech font-medium shadow-md hover:shadow-lg"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Log Entries */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 text-graveyard-500 font-tech">
          {entries.length === 0 ? (
            <>
              <p className="text-lg mb-2">No history yet</p>
              <p className="text-sm">File operations will appear here</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">No entries match your filters</p>
              <p className="text-sm">Try adjusting your filter criteria</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={`${entry.timestamp}-${index}`}
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
                <div className="flex items-start gap-4">
                  {/* Action Icon */}
                  <div className="flex-shrink-0">
                    {getActionIcon(entry.action)}
                  </div>

                  {/* Entry Details */}
                  <div className="flex-1 min-w-0">
                    {/* Header: Action and Timestamp */}
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className={`font-tech font-semibold capitalize ${getActionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                      <span className="text-xs text-graveyard-500 font-tech font-mono">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>

                    {/* File Path */}
                    <div className="mb-2">
                      <p className="text-sm text-graveyard-400 font-tech mb-1">File Path:</p>
                      <p className="text-gray-100 font-tech font-mono text-sm break-all">
                        {entry.filePath}
                      </p>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-tech">
                      {entry.originalPath && (
                        <div>
                          <span className="text-graveyard-500">Original: </span>
                          <span className="text-graveyard-300 font-mono">{entry.originalPath}</span>
                        </div>
                      )}
                      {entry.graveyardPath && (
                        <div>
                          <span className="text-graveyard-500">Graveyard: </span>
                          <span className="text-graveyard-300 font-mono">{entry.graveyardPath}</span>
                        </div>
                      )}
                      {entry.fileSize && (
                        <div>
                          <span className="text-graveyard-500">Size: </span>
                          <span className="text-graveyard-300">{formatFileSize(entry.fileSize)}</span>
                        </div>
                      )}
                      {entry.classifications && entry.classifications.length > 0 && (
                        <div>
                          <span className="text-graveyard-500">Classifications: </span>
                          <span className="text-graveyard-300 capitalize">
                            {entry.classifications.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
