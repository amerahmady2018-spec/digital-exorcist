import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ClassifiedFile } from '../../../shared/types';
import { 
  getPrimaryType, 
  getEntityIcon, 
  getEntityFlavorText, 
  formatFileSize, 
  formatFileAge 
} from '../../utils/entityUtils';

/** Extract filename from a file path */
function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || filePath;
}

/**
 * EntityCard - Reusable entity display card for flow screens
 * 
 * Supports two variants:
 * - grid: Compact card for grid layouts (Guided Active)
 * - central: Large central card (Confrontation Loop)
 */

interface EntityCardProps {
  entity: ClassifiedFile;
  variant: 'grid' | 'central';
  onPurge: () => void;
  onSpare: () => void;
  showActions?: boolean;
  className?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  variant,
  onPurge,
  onSpare,
  showActions = true,
  className = ''
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const type = getPrimaryType(entity);
  const icon = getEntityIcon(type);
  const flavorText = getEntityFlavorText(type);

  const getTypeColor = () => {
    switch (type) {
      case 'ghost': return { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/30' };
      case 'zombie': return { border: 'border-green-500/50', text: 'text-green-400', bg: 'bg-green-500/10', glow: 'shadow-green-500/30' };
      case 'demon': return { border: 'border-red-500/50', text: 'text-red-400', bg: 'bg-red-500/10', glow: 'shadow-red-500/30' };
      default: return { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/30' };
    }
  };

  const colors = getTypeColor();

  // Grid variant - compact card
  if (variant === 'grid') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-4 rounded-lg border-2 ${colors.border} ${colors.bg}
          backdrop-blur-sm transition-all duration-300
          ${isHovered ? `shadow-lg ${colors.glow}` : ''}
          ${className}
        `}
      >
        {/* Entity Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{icon}</span>
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
            {type}
          </span>
        </div>

        {/* Content */}
        {!isRevealed ? (
          <>
            <p className="text-gray-400 text-sm italic mb-4 line-clamp-2">
              {flavorText}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRevealed(true)}
              className={`w-full py-2 ${colors.bg} border ${colors.border} ${colors.text} text-sm font-bold uppercase tracking-wider rounded hover:bg-opacity-30 transition-colors`}
            >
              Inspect
            </motion.button>
          </>
        ) : (
          <>
            {/* Revealed File Info */}
            <div className="space-y-2 mb-4">
              <p className="text-white font-mono text-sm truncate" title={getFileName(entity.path)}>
                {getFileName(entity.path)}
              </p>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatFileSize(entity.size)}</span>
                <span>{formatFileAge(entity.lastModified)}</span>
              </div>
              <p className="text-gray-500 text-xs truncate font-mono" title={entity.path}>
                → graveyard_trash/
              </p>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onPurge}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wider rounded hover:bg-red-500/30 transition-colors"
                >
                  Purge
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSpare}
                  className="flex-1 py-2 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold uppercase tracking-wider rounded hover:bg-green-500/30 transition-colors"
                >
                  Spare
                </motion.button>
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  }

  // Central variant - large card for confrontation
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        relative p-8 rounded-xl border-2 ${colors.border} ${colors.bg}
        backdrop-blur-sm shadow-2xl ${colors.glow}
        max-w-md w-full mx-auto
        ${className}
      `}
      style={{
        clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)'
      }}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 ${colors.border}`} />
      <div className={`absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 ${colors.border}`} />
      <div className={`absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 ${colors.border}`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 ${colors.border}`} />

      {/* Entity Icon */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-center mb-6"
      >
        <span className="text-7xl">{icon}</span>
      </motion.div>

      {/* Entity Type */}
      <h3 className={`text-center text-2xl font-bold uppercase tracking-widest mb-4 ${colors.text}`}>
        {type === 'unknown' ? 'Unknown Entity' : type}
      </h3>

      {/* Content */}
      {!isRevealed ? (
        <>
          <p className="text-gray-400 text-center italic mb-6">
            {flavorText}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRevealed(true)}
            className={`w-full py-4 ${colors.bg} border-2 ${colors.border} ${colors.text} font-bold uppercase tracking-widest rounded-lg hover:bg-opacity-30 transition-colors`}
          >
            Reveal Bound File
          </motion.button>
        </>
      ) : (
        <>
          {/* Revealed File Info */}
          <div className="space-y-3 mb-6 bg-black/30 rounded-lg p-4">
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wider">Filename</span>
              <p className="text-white font-mono text-lg truncate" title={getFileName(entity.path)}>
                {getFileName(entity.path)}
              </p>
            </div>
            <div className="flex justify-between">
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wider">Size</span>
                <p className={`${colors.text} font-bold`}>{formatFileSize(entity.size)}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Age</span>
                <p className="text-gray-300">{formatFileAge(entity.lastModified)}</p>
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wider">Location</span>
              <p className="text-gray-400 font-mono text-sm truncate" title={entity.path}>
                {entity.path}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wider">Destination</span>
              <p className="text-purple-400 font-mono text-sm">
                → graveyard_trash/
              </p>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPurge}
                className="flex-1 py-4 bg-red-500/20 border-2 border-red-500/50 text-red-400 font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Purge
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSpare}
                className="flex-1 py-4 bg-green-500/20 border-2 border-green-500/50 text-green-400 font-bold uppercase tracking-widest rounded-lg hover:bg-green-500/30 transition-colors"
              >
                Spare
              </motion.button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default EntityCard;
