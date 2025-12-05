import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonsterCard } from './MonsterCard';
import { DuplicateGroup } from './DuplicateGroup';
import type { ClassifiedFile, MonsterType } from '../../shared/types';
import graveyardImage from '../../assets/images/graveyard.png';
import iconVictory from '../../assets/images/icon_victory.png';
import ghostIcon from '../../assets/images/ghost.png';
import demonIcon from '../../assets/images/demon.png';
import zombieIcon from '../../assets/images/zombie.png';
import { GameIcon } from './ui/GameIcon';

interface ExorcismDashboardProps {
  files: ClassifiedFile[];
  onBanish: (monster: ClassifiedFile) => void;
  onResurrect: (filePath: string) => void;
}

type TabType = 'all' | MonsterType;

export function ExorcismDashboard({ files, onBanish, onResurrect }: ExorcismDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('size');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Group and filter files by classification
  const { ghosts, demons, zombies, allMonsters } = useMemo(() => {
    const ghosts = files.filter(f => f.classifications.includes('ghost' as MonsterType));
    const demons = files.filter(f => f.classifications.includes('demon' as MonsterType));
    const zombies = files.filter(f => f.classifications.includes('zombie' as MonsterType));
    
    return { ghosts, demons, zombies, allMonsters: files };
  }, [files]);

  // Get files for active tab
  const displayFiles = useMemo(() => {
    let filtered: ClassifiedFile[];
    
    switch (activeTab) {
      case 'ghost':
        filtered = ghosts;
        break;
      case 'demon':
        filtered = demons;
        break;
      case 'zombie':
        filtered = zombies;
        break;
      default:
        filtered = allMonsters;
    }

    // Sort files
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.path.localeCompare(b.path);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [activeTab, ghosts, demons, zombies, allMonsters, sortBy, sortOrder]);

  // Group files by duplicate sets
  const { duplicateGroups, standaloneFiles } = useMemo(() => {
    const groups = new Map<string, ClassifiedFile[]>();
    const standalone: ClassifiedFile[] = [];

    for (const file of displayFiles) {
      if (file.duplicateGroup) {
        const group = groups.get(file.duplicateGroup) || [];
        group.push(file);
        groups.set(file.duplicateGroup, group);
      } else {
        standalone.push(file);
      }
    }

    return {
      duplicateGroups: Array.from(groups.entries()),
      standaloneFiles: standalone
    };
  }, [displayFiles]);

  // Calculate statistics
  const stats = useMemo(() => {
    const calculateStats = (fileList: ClassifiedFile[]) => ({
      count: fileList.length,
      totalSize: fileList.reduce((sum, f) => sum + f.size, 0)
    });

    return {
      all: calculateStats(allMonsters),
      ghosts: calculateStats(ghosts),
      demons: calculateStats(demons),
      zombies: calculateStats(zombies)
    };
  }, [allMonsters, ghosts, demons, zombies]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (files.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-graveyard-900/20 backdrop-blur-xl rounded-lg p-16 shadow-2xl border border-white/10 text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="flex justify-center mb-6"
        >
          <GameIcon 
            src={graveyardImage} 
            size="xl"
            glow
            glowColor="rgba(34,197,94,0.6)"
            alt="Victory - Clean house"
          />
        </motion.div>
        <h3 className="text-4xl font-creepster text-spectral-green mb-3 drop-shadow-lg flex items-center justify-center gap-3">
          <GameIcon src={iconVictory} size="lg" glow glowColor="rgba(34,197,94,0.8)" />
          The House is Clean
        </h3>
        <p className="text-xl text-gray-300 font-tech">
          No spirits detected. Your files are safe and organized!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Digital Counter Header - TOP CENTER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h2 className="text-5xl font-creepster text-white mb-6 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)] flex items-center justify-center gap-3">
          <GameIcon src={ghostIcon} size="lg" glow />
          EXORCISM COCKPIT
        </h2>
        
        {/* Digital Counter Stats */}
        <div className="inline-flex gap-8 bg-black/80 backdrop-blur-xl border-2 border-spectral-purple/50 px-12 py-6 shadow-[0_0_40px_rgba(139,92,246,0.6)]"
          style={{
            clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
          }}
        >
          <div className="text-center">
            <div className="text-xs font-tech font-bold text-spectral-purple uppercase tracking-widest mb-2">TARGETS</div>
            <div className="text-5xl font-tech font-bold text-red-500 tabular-nums drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              {String(activeTab === 'all' ? stats.all.count : 
                activeTab === 'ghost' ? stats.ghosts.count :
                activeTab === 'demon' ? stats.demons.count :
                stats.zombies.count).padStart(3, '0')}
            </div>
          </div>
          <div className="w-px bg-spectral-purple/30" />
          <div className="text-center">
            <div className="text-xs font-tech font-bold text-spectral-purple uppercase tracking-widest mb-2">TOTAL SIZE</div>
            <div className="text-5xl font-tech font-bold text-green-500 tabular-nums drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
              {formatSize(
                activeTab === 'all' ? stats.all.totalSize : 
                activeTab === 'ghost' ? stats.ghosts.totalSize :
                activeTab === 'demon' ? stats.demons.totalSize :
                stats.zombies.totalSize
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs - Aggressive Style */}
      <div className="flex justify-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('all')}
          className={`px-8 py-4 font-tech font-bold text-sm uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'all'
              ? 'bg-spectral-purple text-white shadow-[0_0_30px_rgba(139,92,246,0.8)] border-2 border-spectral-purple'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-2 border-white/10'
          }`}
          style={{
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}
        >
          ALL ({stats.all.count})
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('ghost')}
          className={`px-8 py-4 font-tech font-bold text-sm uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'ghost'
              ? 'bg-spectral-green text-white shadow-[0_0_30px_rgba(16,185,129,0.8)] border-2 border-spectral-green'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-2 border-white/10'
          }`}
          style={{
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}
        >
          <span className="flex items-center gap-2">
            <GameIcon src={ghostIcon} size="sm" glow={activeTab === 'ghost'} glowColor="rgba(16,185,129,0.8)" />
            ({stats.ghosts.count})
          </span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('demon')}
          className={`px-8 py-4 font-tech font-bold text-sm uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'demon'
              ? 'bg-spectral-red text-white shadow-[0_0_30px_rgba(239,68,68,0.8)] border-2 border-spectral-red'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-2 border-white/10'
          }`}
          style={{
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}
        >
          <span className="flex items-center gap-2">
            <GameIcon src={demonIcon} size="sm" glow={activeTab === 'demon'} glowColor="rgba(239,68,68,0.8)" />
            ({stats.demons.count})
          </span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('zombie')}
          className={`px-8 py-4 font-tech font-bold text-sm uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'zombie'
              ? 'bg-purple-400 text-white shadow-[0_0_30px_rgba(192,132,252,0.8)] border-2 border-purple-400'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-2 border-white/10'
          }`}
          style={{
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}
        >
          <span className="flex items-center gap-2">
            <GameIcon src={zombieIcon} size="sm" glow={activeTab === 'zombie'} glowColor="rgba(192,132,252,0.8)" />
            ({stats.zombies.count})
          </span>
        </motion.button>
      </div>

      {/* Sort Controls - Compact */}
      <div className="flex justify-center items-center gap-3 mb-8">
        <span className="text-xs text-gray-400 font-tech font-bold uppercase tracking-wider">SORT:</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy('name')}
          className={`px-4 py-2 text-xs font-tech font-bold uppercase tracking-wider transition-all ${
            sortBy === 'name'
              ? 'bg-spectral-purple text-white shadow-lg shadow-purple-500/40 border border-spectral-purple'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          NAME
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy('size')}
          className={`px-4 py-2 text-xs font-tech font-bold uppercase tracking-wider transition-all ${
            sortBy === 'size'
              ? 'bg-spectral-purple text-white shadow-lg shadow-purple-500/40 border border-spectral-purple'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          SIZE
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy('date')}
          className={`px-4 py-2 text-xs font-tech font-bold uppercase tracking-wider transition-all ${
            sortBy === 'date'
              ? 'bg-spectral-purple text-white shadow-lg shadow-purple-500/40 border border-spectral-purple'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          DATE
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSortOrder}
          className="px-4 py-2 text-xs font-tech font-bold uppercase tracking-wider bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </motion.button>
      </div>

      {/* Grid Layout - MASSIVE GAPS */}
      {displayFiles.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24"
        >
          <p className="text-gray-300 text-2xl font-tech font-bold uppercase tracking-wider">
            NO {activeTab === 'all' ? 'TARGETS' : `${activeTab.toUpperCase()}S`} DETECTED
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          <AnimatePresence mode="popLayout">
            {/* Render duplicate groups first */}
            {duplicateGroups.map(([groupHash, groupFiles]) => (
              <motion.div
                key={groupHash}
                layout
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <DuplicateGroup
                  files={groupFiles}
                  duplicateGroup={groupHash}
                  onBanish={onBanish}
                  onResurrect={onResurrect}
                />
              </motion.div>
            ))}
            
            {/* Render standalone files */}
            {standaloneFiles.map((file, index) => (
              <MonsterCard
                key={`${file.path}-${index}`}
                file={file}
                onBanish={onBanish}
                onResurrect={onResurrect}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
