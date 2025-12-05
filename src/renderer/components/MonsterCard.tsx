import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

// Import custom monster images
import ghostImage from '../../assets/images/ghost.png';
import demonImage from '../../assets/images/demon.png';
import zombieImage from '../../assets/images/zombie.png';

interface MonsterCardProps {
  file: ClassifiedFile;
  onBanish: (monster: ClassifiedFile) => void;
  onResurrect: (filePath: string) => void;
}

// Map monster types to images
const monsterImages: Record<MonsterType, string> = {
  ghost: ghostImage,
  demon: demonImage,
  zombie: zombieImage
};

// Map monster types to colors and glow effects
const monsterColors: Record<MonsterType, { bg: string; border: string; text: string; glow: string }> = {
  ghost: {
    bg: 'bg-green-900/30',
    border: 'border-spectral-green',
    text: 'text-spectral-green',
    glow: 'shadow-spectral-green/50'
  },
  demon: {
    bg: 'bg-red-900/30',
    border: 'border-spectral-red',
    text: 'text-spectral-red',
    glow: 'shadow-spectral-red/50'
  },
  zombie: {
    bg: 'bg-purple-900/30',
    border: 'border-purple-400',
    text: 'text-purple-400',
    glow: 'shadow-purple-400/50'
  }
};

export const MonsterCard = forwardRef<HTMLDivElement, MonsterCardProps>(({ file, onBanish, onResurrect }, ref) => {
  const [showConfirmBanish, setShowConfirmBanish] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate health percentage based on file size (500MB = 100%)
  const calculateHealthPercentage = (bytes: number): number => {
    const MAX_SIZE_MB = 500;
    const fileSizeMB = bytes / (1024 * 1024);
    return Math.min((fileSizeMB / MAX_SIZE_MB) * 100, 100);
  };

  const healthPercentage = calculateHealthPercentage(file.size);

  const handleBanish = () => {
    onBanish(file);
    setShowConfirmBanish(false);
  };

  const handleResurrect = () => {
    onResurrect(file.path);
  };

  // Get primary monster type for image display
  const primaryMonster = file.classifications[0];

  // Extract filename from path
  const fileName = file.path.split(/[\\/]/).pop() || file.path;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 1.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 0.8,
        rotateY: 90,
        transition: { duration: 0.5, ease: "easeInOut" }
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
      className="relative h-[500px] w-full"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)'
      }}
    >
      {/* Card Background with Hexagonal Clip */}
      <div className="absolute inset-0 bg-gradient-to-b from-graveyard-800/60 to-graveyard-900/80 backdrop-blur-xl border-2 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.8),inset_0_0_30px_rgba(239,68,68,0.2)]" />
      
      {/* Health Bar at TOP - Thin and Glowing */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-graveyard-900/90 backdrop-blur-sm border-b-2 border-red-600/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-tech font-bold text-red-400 tracking-widest uppercase">THREAT LEVEL</span>
          <span className="text-xs font-tech font-bold text-white tabular-nums">{formatSize(file.size)}</span>
        </div>
        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-red-900/80 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.9)]"
            style={{
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.9), inset 0 0 10px rgba(255, 255, 255, 0.3)'
            }}
          />
        </div>
      </div>

      {/* HUGE Monster Image - Centered and Popping Out */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{
            y: isHovered ? [-4, 4, -4] : [0, 8, 0],
            rotate: isHovered ? [-2, 2, -2] : 0,
            scale: isHovered ? 1.15 : 1
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            scale: {
              duration: 0.3
            }
          }}
          className="relative"
        >
          <motion.img
            src={monsterImages[primaryMonster]}
            alt={`${primaryMonster} icon`}
            className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 60px rgba(139, 92, 246, 0.4))'
            }}
          />
          {/* Glow ring behind monster */}
          <div className="absolute inset-0 -z-10 bg-gradient-radial from-spectral-purple/40 via-spectral-purple/20 to-transparent blur-2xl scale-150" />
        </motion.div>
      </div>

      {/* File Information - Middle Section */}
      <div className="absolute top-[280px] left-0 right-0 px-4 z-10">
        {/* Monster Name */}
        <h3 className="text-3xl font-creepster text-center text-white mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] truncate" title={fileName}>
          {fileName}
        </h3>

        {/* Classification Badges */}
        <div className="flex justify-center flex-wrap gap-2 mb-3">
          {file.classifications.map((classification) => {
            const colors = monsterColors[classification];
            return (
              <motion.span
                key={classification}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className={`px-3 py-1 text-xs font-tech font-bold ${colors.bg} ${colors.border} ${colors.text} border-2 uppercase tracking-wider shadow-lg`}
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}
              >
                {classification}
              </motion.span>
            );
          })}
        </div>

        {/* File Metadata - Compact */}
        <div className="flex justify-center gap-4 text-[10px] text-gray-400 font-tech font-medium uppercase tracking-wider">
          <div>
            <span className="text-gray-500">Modified:</span> <span className="text-gray-300">{formatDate(file.lastModified)}</span>
          </div>
          {file.duplicateGroup && (
            <div>
              <span className="text-purple-400">Dupe:</span>{' '}
              <span className="font-mono text-gray-300">{file.duplicateGroup.substring(0, 6)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Bottom, Full Width, Stacked */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <AnimatePresence>
          {showConfirmBanish && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-graveyard-900/95 backdrop-blur-lg border-t-2 border-red-600/50 overflow-hidden"
            >
              <div className="p-3">
                <p className="text-xs text-center text-gray-300 mb-2 font-tech font-medium">
                  CONFIRM PURGE?
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBanish}
                    className="weapon-trigger-btn flex-1 px-3 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white text-xs font-tech font-bold uppercase tracking-wider border border-red-500"
                  >
                    YES
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmBanish(false)}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-gray-200 text-xs font-tech font-bold uppercase tracking-wider border border-white/30"
                  >
                    NO
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col">
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowConfirmBanish(true)}
            title="Delete this file (move to graveyard)"
            className="weapon-trigger-btn w-full px-6 py-4 font-tech font-bold text-sm uppercase tracking-widest bg-gradient-to-r from-red-700 to-red-600 text-white border-t-2 border-red-500 transition-all duration-200"
          >
            [ PURGE ENTITY ]
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResurrect}
            title="Keep this file (add to whitelist)"
            className="weapon-trigger-btn-save w-full px-6 py-4 font-tech font-bold text-sm uppercase tracking-widest bg-gradient-to-r from-green-700 to-green-600 text-white border-t-2 border-green-500 transition-all duration-200"
          >
            [ SAVE SOUL ]
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

MonsterCard.displayName = 'MonsterCard';
