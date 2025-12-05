import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

// Import custom monster images
import ghostImage from '../../assets/images/ghost.png';
import demonImage from '../../assets/images/demon.png';
import zombieImage from '../../assets/images/zombie.png';

/**
 * EntityCard - Premium entity card component for the Enhanced HUD
 * 
 * Displays a classified file as a tactical entity card with:
 * - Large 3D monster image breaking frame boundaries
 * - Glowing health bar representing file size
 * - File metadata styled as tactical intel
 * - Hover effects with scale and glow
 * - Click to transition to BATTLE_ARENA
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 6.1
 */

export interface EntityCardProps {
  /** The classified file to display */
  file: ClassifiedFile;
  /** Maximum file size in the set (for health bar scaling) */
  maxFileSize: number;
  /** Callback when card is clicked */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Map monster types to images
const monsterImages: Record<MonsterType, string> = {
  ghost: ghostImage,
  demon: demonImage,
  zombie: zombieImage
};

// Map monster types to colors and glow effects
const monsterColors: Record<MonsterType, { bg: string; border: string; text: string; glow: string; shadow: string }> = {
  ghost: {
    bg: 'bg-green-900/30',
    border: 'border-spectral-green',
    text: 'text-spectral-green',
    glow: 'shadow-spectral-green/50',
    shadow: 'rgba(16, 185, 129, 0.8)'
  },
  demon: {
    bg: 'bg-red-900/30',
    border: 'border-spectral-red',
    text: 'text-spectral-red',
    glow: 'shadow-spectral-red/50',
    shadow: 'rgba(239, 68, 68, 0.8)'
  },
  zombie: {
    bg: 'bg-purple-900/30',
    border: 'border-purple-400',
    text: 'text-purple-400',
    glow: 'shadow-purple-400/50',
    shadow: 'rgba(192, 132, 252, 0.8)'
  }
};

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate health bar percentage based on file size relative to max
 */
export function calculateHealthPercentage(fileSize: number, maxFileSize: number): number {
  if (maxFileSize === 0) return 0;
  return Math.min((fileSize / maxFileSize) * 100, 100);
}

/**
 * Extract filename from full path
 */
export function extractFileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

const EntityCard = forwardRef<HTMLDivElement, EntityCardProps>(
  ({ file, maxFileSize, onClick, className = '' }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    // Get primary monster type for styling
    const primaryMonster = file.classifications[0];
    const primaryColors = monsterColors[primaryMonster];
    
    // Calculate health percentage
    const healthPercentage = calculateHealthPercentage(file.size, maxFileSize);
    
    // Extract filename
    const fileName = extractFileName(file.path);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ 
          opacity: 0, 
          scale: 0.6,
          rotateY: 90,
          transition: { duration: 0.4, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        layout
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        className={`entity-card relative h-[420px] w-full cursor-pointer ${className}`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)'
        }}
        data-testid="entity-card"
        data-file-path={file.path}
        data-file-size={file.size}
        data-classifications={file.classifications.join(',')}
      >
        {/* Card Background with Glow */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-graveyard-800/70 to-graveyard-900/90 backdrop-blur-xl border-2 transition-all duration-300"
          style={{
            borderColor: isHovered ? primaryColors.shadow : 'rgba(139, 92, 246, 0.5)',
            boxShadow: isHovered 
              ? `0 0 40px ${primaryColors.shadow}, inset 0 0 30px ${primaryColors.shadow.replace('0.8', '0.2')}`
              : '0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)'
          }}
        />
        
        {/* Health Bar at TOP - Glowing */}
        <div 
          className="absolute top-0 left-0 right-0 z-20 p-3 bg-graveyard-900/90 backdrop-blur-sm border-b-2"
          style={{ borderColor: `${primaryColors.shadow.replace('0.8', '0.5')}` }}
          data-testid="health-bar-container"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-tech font-bold text-spectral-purple uppercase tracking-widest">
              THREAT LEVEL
            </span>
            <span 
              className="text-xs font-tech font-bold text-white tabular-nums"
              data-testid="file-size-display"
            >
              {formatFileSize(file.size)}
            </span>
          </div>
          <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-spectral-purple/30 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(to right, ${primaryColors.shadow.replace('0.8', '1')}, ${primaryColors.shadow.replace('0.8', '0.7')})`,
                boxShadow: `0 0 15px ${primaryColors.shadow}, inset 0 0 10px rgba(255, 255, 255, 0.3)`
              }}
              data-testid="health-bar"
              data-health-percentage={healthPercentage}
            />
          </div>
        </div>

        {/* Monster Image - Large and Breaking Frame */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{
              y: isHovered ? [-3, 3, -3] : [0, 6, 0],
              rotate: isHovered ? [-1, 1, -1] : 0,
              scale: isHovered ? 1.15 : 1
            }}
            transition={{
              y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.3 }
            }}
            className="relative"
          >
            <motion.img
              src={monsterImages[primaryMonster]}
              alt={`${primaryMonster} entity`}
              className="w-40 h-40 object-contain"
              style={{
                filter: `drop-shadow(0 0 25px ${primaryColors.shadow}) drop-shadow(0 0 50px ${primaryColors.shadow.replace('0.8', '0.4')})`
              }}
              data-testid="monster-image"
            />
            {/* Glow ring behind monster */}
            <div 
              className="absolute inset-0 -z-10 blur-2xl scale-150"
              style={{
                background: `radial-gradient(circle, ${primaryColors.shadow.replace('0.8', '0.4')} 0%, transparent 70%)`
              }}
            />
          </motion.div>
        </div>

        {/* File Information - Middle Section */}
        <div className="absolute top-[220px] left-0 right-0 px-4 z-10">
          {/* File Name */}
          <h3 
            className="text-xl font-creepster text-center text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] truncate"
            title={fileName}
            data-testid="file-name"
          >
            {fileName}
          </h3>

          {/* Classification Badges */}
          <div className="flex justify-center flex-wrap gap-2 mb-3" data-testid="classification-badges">
            {file.classifications.map((classification) => {
              const colors = monsterColors[classification];
              return (
                <motion.span
                  key={classification}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className={`px-2 py-0.5 text-[10px] font-tech font-bold ${colors.bg} ${colors.border} ${colors.text} border uppercase tracking-wider`}
                  style={{
                    clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                  }}
                  data-testid={`classification-${classification}`}
                >
                  {classification}
                </motion.span>
              );
            })}
          </div>

          {/* File Metadata - Tactical Intel */}
          <div 
            className="text-center text-[10px] text-gray-400 font-tech font-medium uppercase tracking-wider space-y-1"
            data-testid="file-metadata"
          >
            <div>
              <span className="text-gray-500">Modified:</span>{' '}
              <span className="text-gray-300" data-testid="last-modified">
                {formatDate(file.lastModified)}
              </span>
            </div>
            {file.duplicateGroup && (
              <div>
                <span className="text-purple-400">Duplicate:</span>{' '}
                <span className="font-mono text-gray-300">
                  {file.duplicateGroup.substring(0, 8)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Engage Button - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-4 font-tech font-bold text-sm uppercase tracking-widest text-center transition-all duration-200"
            style={{
              background: `linear-gradient(to right, ${primaryColors.shadow.replace('0.8', '0.9')}, ${primaryColors.shadow.replace('0.8', '0.7')})`,
              borderTop: `2px solid ${primaryColors.shadow}`,
              boxShadow: isHovered ? `0 0 20px ${primaryColors.shadow}` : 'none'
            }}
            data-testid="engage-button"
          >
            [ ENGAGE TARGET ]
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

EntityCard.displayName = 'EntityCard';

export { EntityCard };
