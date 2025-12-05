import { forwardRef, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClassifiedFile, MonsterType } from '../../shared/types';
import { useAppStore, getXPForLevel } from '../store/appStore';

// Import custom icons
import ghostIcon from '../../assets/images/ghost.png';
import demonIcon from '../../assets/images/demon.png';
import zombieIcon from '../../assets/images/zombie.png';
import playerAvatar from '../../assets/images/Playeravatar.png';
import { GameIcon } from './ui/GameIcon';

/**
 * EnhancedHUD - Corrupted Terminal File Browser
 * 
 * Horror-tech aesthetic with glitching filenames, threat indicators,
 * entity manifestation visualization, and tactical purge controls.
 * 
 * Theme: Dark corrupted terminal + CRT effects + occult data visualization
 */

export interface EnhancedHUDProps {
  files: ClassifiedFile[];
  onEntityClick: (file: ClassifiedFile) => void;
  className?: string;
}

export interface HUDStatistics {
  totalFiles: number;
  totalSize: number;
  ghostCount: number;
  demonCount: number;
  zombieCount: number;
  ghostSize: number;
  demonSize: number;
  zombieSize: number;
}

// Horror name mappings for glitch effect
const horrorNames: Record<string, string> = {
  'documents': 'FORGOTTEN_MEMORIES',
  'downloads': 'DIGITAL_REMAINS',
  'pictures': 'CAPTURED_SOULS',
  'photos': 'TRAUMA_CACHE',
  'videos': 'RECORDED_NIGHTMARES',
  'music': 'ECHOES_OF_PAST',
  'desktop': 'SURFACE_CORRUPTION',
  'temp': 'LIMBO_DATA',
  'cache': 'RESIDUAL_HAUNTING',
  'backup': 'RESURRECTION_ARCHIVE',
  'old': 'ANCIENT_BINDINGS',
  'archive': 'SEALED_ENTITIES',
  '.pdf': '.SOUL_CONTRACT',
  '.doc': '.BINDING_SCROLL',
  '.jpg': '.CAPTURED_MOMENT',
  '.png': '.FROZEN_SCREAM',
  '.mp3': '.WHISPER_RECORDING',
  '.mp4': '.NIGHTMARE_FOOTAGE',
  '.exe': '.POSSESSED_BINARY',
  '.dll': '.DEMON_LIBRARY',
  '.zip': '.COMPRESSED_SPIRITS',
  '.rar': '.TRAPPED_ENTITIES',
};

/**
 * Generate horror version of filename
 */
function getHorrorName(filename: string): string {
  let horror = filename.toUpperCase();
  for (const [normal, creepy] of Object.entries(horrorNames)) {
    horror = horror.replace(normal.toUpperCase(), creepy);
  }
  // Add random corruption
  if (Math.random() > 0.7) {
    horror = horror.replace(/[AEIOU]/g, (m) => Math.random() > 0.5 ? '█' : m);
  }
  return horror;
}

/**
 * Glitching filename component
 */
const GlitchFileName: React.FC<{ name: string; horrorName: string }> = ({ name, horrorName }) => {
  const [showHorror, setShowHorror] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setShowHorror(true);
        setTimeout(() => setShowHorror(false), 150 + Math.random() * 200);
      }
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative font-mono">
      <span className={showHorror ? 'opacity-0' : 'opacity-100'}>{name}</span>
      {showHorror && (
        <span className="absolute inset-0 text-red-500/90 animate-pulse">{horrorName}</span>
      )}
    </span>
  );
};

/**
 * Entity type badge with occult styling
 */
const EntityTypeBadge: React.FC<{ type: MonsterType }> = ({ type }) => {
  const config = {
    ghost: { label: 'POLTERGEIST', color: 'text-green-400', bg: 'bg-green-900/40', border: 'border-green-500/50' },
    demon: { label: 'DEMON', color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/50' },
    zombie: { label: 'REVENANT', color: 'text-purple-400', bg: 'bg-purple-900/40', border: 'border-purple-500/50' },
  };
  const c = config[type];
  return (
    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold ${c.color} ${c.bg} ${c.border} border uppercase tracking-wider`}>
      {c.label}
    </span>
  );
};

/**
 * Corruption level bar
 */
const CorruptionBar: React.FC<{ level: number }> = ({ level }) => {
  const color = level > 70 ? 'bg-red-500' : level > 40 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-16 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${level}%` }}
        transition={{ duration: 0.8 }}
        className={`h-full ${color} shadow-[0_0_6px_currentColor]`}
      />
    </div>
  );
};

/**
 * Emotional burden indicator
 */
const EmotionalBurden: React.FC<{ size: number; age: Date }> = ({ size, age }) => {
  const ageMonths = Math.floor((Date.now() - new Date(age).getTime()) / (1000 * 60 * 60 * 24 * 30));
  const burden = size > 500 * 1024 * 1024 ? 'EXTREME' : ageMonths > 12 ? 'HIGH' : ageMonths > 6 ? 'MODERATE' : 'LOW';
  const color = burden === 'EXTREME' ? 'text-red-400' : burden === 'HIGH' ? 'text-orange-400' : burden === 'MODERATE' ? 'text-yellow-400' : 'text-green-400';
  return <span className={`text-[9px] font-mono font-bold ${color}`}>{burden}</span>;
};

export function calculateStatistics(files: ClassifiedFile[]): HUDStatistics {
  const stats: HUDStatistics = {
    totalFiles: files.length,
    totalSize: 0,
    ghostCount: 0,
    demonCount: 0,
    zombieCount: 0,
    ghostSize: 0,
    demonSize: 0,
    zombieSize: 0
  };

  for (const file of files) {
    stats.totalSize += file.size;
    if (file.classifications.includes('ghost' as MonsterType)) {
      stats.ghostCount++;
      stats.ghostSize += file.size;
    }
    if (file.classifications.includes('demon' as MonsterType)) {
      stats.demonCount++;
      stats.demonSize += file.size;
    }
    if (file.classifications.includes('zombie' as MonsterType)) {
      stats.zombieCount++;
      stats.zombieSize += file.size;
    }
  }
  return stats;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function extractFileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

/**
 * Entity Manifestation Skull Visualization
 */
const EntityManifestation: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Pulsing background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-purple-900/30 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Network tendrils */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 200">
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1="100" y1="100"
            x2={100 + Math.cos(i * Math.PI / 4) * 80}
            y2={100 + Math.sin(i * Math.PI / 4) * 80}
            stroke="rgba(168, 85, 247, 0.5)"
            strokeWidth="1"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </svg>
      
      {/* Skull icon (using emoji as placeholder - could be replaced with actual icon) */}
      <motion.div
        className="text-6xl filter drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        💀
      </motion.div>
      
      {/* Percentage text */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <p className="text-[10px] font-mono text-purple-400/60 uppercase tracking-wider">Entity Manifestation</p>
        <motion.p
          className="text-2xl font-mono font-bold text-purple-400"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {percentage}%
        </motion.p>
      </div>
    </div>
  );
};


const EnhancedHUD = forwardRef<HTMLDivElement, EnhancedHUDProps>(
  ({ files, onEntityClick, className = '' }, ref) => {
    const { xp, level, selectedDirectory } = useAppStore(state => state.context);
    const xpForNextLevel = getXPForLevel(level);
    const xpProgress = (xp / xpForNextLevel) * 100;
    
    const stats = useMemo(() => calculateStatistics(files), [files]);
    const manifestationPercent = useMemo(() => {
      if (files.length === 0) return 0;
      return Math.min(Math.round((stats.totalFiles / 100) * 100), 99);
    }, [files.length, stats.totalFiles]);

    return (
      <div ref={ref} className={`enhanced-hud ${className}`}>
        {/* Terminal Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-black/80 border border-green-500/30 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-creepster text-green-400 tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                DIGITAL EXORCIST - ACTIVE SCAN
              </h1>
              <p className="text-green-500/60 font-mono text-xs mt-1">
                TARGET DIRECTORY: {selectedDirectory || 'UNKNOWN'} // STATUS: <span className="text-red-400">INFESTED</span>
              </p>
            </div>
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-red-400/80 font-mono text-xs">CORRUPTION ACTIVE</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Layout: File Browser + Entity Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left: Corrupted File Browser (3 cols) */}
          <div className="lg:col-span-3">
            {/* Stats Bar */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 p-3 bg-black/70 border border-purple-500/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <GameIcon src={ghostIcon} size="sm" glow glowColor="rgba(34,197,94,0.6)" />
                  <span className="text-[10px] font-mono text-green-400/80 uppercase">Ghosts</span>
                </div>
                <p className="text-xl font-mono font-bold text-green-400">{stats.ghostCount}</p>
              </div>
              <div className="flex-1 p-3 bg-black/70 border border-red-500/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <GameIcon src={demonIcon} size="sm" glow glowColor="rgba(239,68,68,0.6)" />
                  <span className="text-[10px] font-mono text-red-400/80 uppercase">Demons</span>
                </div>
                <p className="text-xl font-mono font-bold text-red-400">{stats.demonCount}</p>
              </div>
              <div className="flex-1 p-3 bg-black/70 border border-purple-500/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <GameIcon src={zombieIcon} size="sm" glow glowColor="rgba(168,85,247,0.6)" />
                  <span className="text-[10px] font-mono text-purple-400/80 uppercase">Zombies</span>
                </div>
                <p className="text-xl font-mono font-bold text-purple-400">{stats.zombieCount}</p>
              </div>
              <div className="flex-1 p-3 bg-black/70 border border-yellow-500/30 rounded">
                <span className="text-[10px] font-mono text-yellow-400/80 uppercase block mb-1">Total Corruption</span>
                <p className="text-xl font-mono font-bold text-yellow-400">{formatSize(stats.totalSize)}</p>
              </div>
            </div>

            {/* File List Panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/80 border border-green-500/20 rounded-lg overflow-hidden"
            >
              {/* Panel Header */}
              <div className="px-4 py-2 bg-green-900/20 border-b border-green-500/30 flex items-center justify-between">
                <span className="text-green-400/80 font-mono text-xs uppercase tracking-wider">
                  Infested Files ({files.length} entities detected)
                </span>
                <span className="text-red-400/60 font-mono text-[10px]">⚠ QUARANTINE RECOMMENDED</span>
              </div>

              {/* File List */}
              <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-black/50">
                {files.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-green-500/40 font-mono text-sm">NO ENTITIES DETECTED IN THIS SECTOR</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {files.map((file, index) => {
                      const fileName = extractFileName(file.path);
                      const horrorName = getHorrorName(fileName);
                      const corruptionLevel = Math.min(100, Math.round((file.size / (500 * 1024 * 1024)) * 100));
                      
                      return (
                        <motion.div
                          key={file.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => onEntityClick(file)}
                          className="px-4 py-3 border-b border-green-500/10 hover:bg-green-900/20 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            {/* Occult Sigil Icon */}
                            <motion.div
                              className="w-8 h-8 flex items-center justify-center text-lg"
                              animate={{ rotate: [0, 5, -5, 0], opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              {file.classifications.includes('demon' as MonsterType) ? '🔥' :
                               file.classifications.includes('zombie' as MonsterType) ? '☠️' : '👻'}
                            </motion.div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-green-300 truncate group-hover:text-green-200">
                                <GlitchFileName name={fileName} horrorName={horrorName} />
                              </div>
                              <div className="text-[10px] text-green-500/40 font-mono truncate">
                                {file.path}
                              </div>
                            </div>

                            {/* Threat Indicators */}
                            <div className="flex items-center gap-4 text-right">
                              {/* Corruption Level */}
                              <div>
                                <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">Corruption</p>
                                <CorruptionBar level={corruptionLevel} />
                              </div>

                              {/* Entity Type */}
                              <div>
                                <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">Entity</p>
                                <div className="flex gap-1">
                                  {file.classifications.map(c => (
                                    <EntityTypeBadge key={c} type={c} />
                                  ))}
                                </div>
                              </div>

                              {/* Emotional Burden */}
                              <div className="w-16">
                                <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">Burden</p>
                                <EmotionalBurden size={file.size} age={file.lastModified} />
                              </div>

                              {/* Size */}
                              <div className="w-20 text-right">
                                <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">Size</p>
                                <p className="text-xs font-mono text-green-400">{formatSize(file.size)}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>

            {/* Purge Button */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <p className="text-red-400/60 font-mono text-xs mb-2">
                  Click on any entity to begin individual exorcism
                </p>
              </motion.div>
            )}
          </div>

          {/* Right: Entity Manifestation Panel (1 col) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-64 bg-black/80 border border-purple-500/30 rounded-lg overflow-hidden"
            >
              <EntityManifestation percentage={manifestationPercent} />
            </motion.div>

            {/* Player Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 p-4 bg-black/80 border border-yellow-500/30 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <GameIcon src={playerAvatar} size="lg" glow glowColor="rgba(234,179,8,0.6)" />
                <div>
                  <p className="text-yellow-400 font-creepster text-lg">EXORCIST</p>
                  <p className="text-yellow-500/60 font-mono text-xs">Level {level}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono text-yellow-400/60 mb-1">
                  <span>XP Progress</span>
                  <span>{xp} / {xpForNextLevel}</span>
                </div>
                <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-yellow-500/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-4 bg-black/80 border border-green-500/30 rounded-lg"
            >
              <p className="text-green-400/60 font-mono text-[10px] uppercase tracking-wider mb-2">System Status</p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Entities:</span>
                  <span className="text-red-400">{stats.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Corruption:</span>
                  <span className="text-yellow-400">{formatSize(stats.totalSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Threat Level:</span>
                  <span className={stats.totalFiles > 50 ? 'text-red-400' : stats.totalFiles > 20 ? 'text-yellow-400' : 'text-green-400'}>
                    {stats.totalFiles > 50 ? 'CRITICAL' : stats.totalFiles > 20 ? 'HIGH' : 'MODERATE'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
);

EnhancedHUD.displayName = 'EnhancedHUD';

export default EnhancedHUD;
