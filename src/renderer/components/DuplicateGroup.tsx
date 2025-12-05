import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonsterCard } from './MonsterCard';
import type { ClassifiedFile } from '../../shared/types';

// Import custom icons
import zombieIcon from '../../assets/images/zombie.png';
import { GameIcon } from './ui/GameIcon';

/**
 * DuplicateGroup - Displays a group of duplicate files
 * 
 * Shows duplicate files in an expandable group with banish/resurrect actions.
 * Uses forwardRef for Framer Motion compatibility and parent-child ref control.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

export interface DuplicateGroupProps {
  /** Array of duplicate files */
  files: ClassifiedFile[];
  /** Hash identifier for the duplicate group */
  duplicateGroup: string;
  /** Callback when a file is banished */
  onBanish: (monster: ClassifiedFile) => void;
  /** Callback when a file is resurrected */
  onResurrect: (filePath: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const DuplicateGroup = forwardRef<HTMLDivElement, DuplicateGroupProps>(
  ({ files, duplicateGroup, onBanish, onResurrect, className = '' }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Calculate total wasted space (all duplicates except one)
  const wastedSpace = files.slice(1).reduce((sum, f) => sum + f.size, 0);

  return (
    <div ref={ref} className={`bg-graveyard-850 rounded-lg border-2 border-purple-500/50 overflow-hidden ${className}`} data-testid="duplicate-group">
      {/* Group Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-graveyard-800 active:bg-graveyard-750 transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <GameIcon src={zombieIcon} size="lg" glow glowColor="rgba(168,85,247,0.6)" />
          <div className="text-left">
            <h3 className="text-lg font-creepster text-purple-400 mb-1">
              Duplicate Set ({files.length} instances)
            </h3>
            <div className="flex gap-4 text-sm text-graveyard-400 font-tech">
              <div>
                <span className="font-semibold">File Size:</span> {formatSize(files[0].size)}
              </div>
              <div>
                <span className="font-semibold text-spectral-red">Wasted Space:</span>{' '}
                <span className="text-spectral-red font-bold">{formatSize(wastedSpace)}</span>
              </div>
              <div>
                <span className="font-semibold">Hash:</span>{' '}
                <span className="font-mono">{duplicateGroup.substring(0, 12)}...</span>
              </div>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl text-purple-400"
        >
          ▼
        </motion.div>
      </motion.button>

      {/* Expanded File List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-purple-500/30 overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-graveyard-900/50">
              <p className="text-sm text-graveyard-400 font-tech mb-2">
                All instances of this duplicate file. Each can be banished or resurrected independently.
              </p>
              {files.map((file, index) => (
                <div key={`${file.path}-${index}`} className="relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-purple-500/50 rounded"></div>
                  <MonsterCard
                    file={file}
                    onBanish={onBanish}
                    onResurrect={onResurrect}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  }
);

DuplicateGroup.displayName = 'DuplicateGroup';

export { DuplicateGroup };
