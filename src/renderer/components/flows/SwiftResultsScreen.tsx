import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { countEntities, formatFileSize, calculateSpaceRecovered, filterByType } from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';
import { MonsterType } from '../../../shared/types';
import type { ClassifiedFile } from '../../../shared/types';

/**
 * SwiftResultsScreen - Bulk category actions for Swift Purge flow
 * 
 * Groups files by entity type with bulk purge buttons per category
 * No individual file cards - category-based bulk actions only
 */

interface CategoryCardProps {
  type: MonsterType;
  icon: string;
  label: string;
  count: number;
  size: number;
  onPurge: () => void;
  onSkip: () => void;
  isPurging: boolean;
  isSkipped: boolean;
  isPurged: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  type,
  icon,
  label,
  count,
  size,
  onPurge,
  onSkip,
  isPurging,
  isSkipped,
  isPurged
}) => {
  const getTypeColors = () => {
    switch (type) {
      case MonsterType.Ghost: return { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-400' };
      case MonsterType.Zombie: return { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-400' };
      case MonsterType.Demon: return { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-400' };
      default: return { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-400' };
    }
  };

  const colors = getTypeColors();

  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-lg border-2 p-4 transition-all
        ${isPurged ? 'border-green-500/50 bg-green-500/10' : 
          isSkipped ? 'border-gray-500/30 bg-gray-500/10 opacity-50' : 
          `${colors.border}/50 ${colors.bg}/10`}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className={`font-bold uppercase tracking-wider ${isPurged ? 'text-green-400' : isSkipped ? 'text-gray-500' : colors.text}`}>
              {label}
            </h3>
            <p className="text-gray-500 text-sm">
              {count} {count === 1 ? 'file' : 'files'} • {formatFileSize(size)}
            </p>
          </div>
        </div>
        
        {isPurged && (
          <span className="text-green-400 text-2xl">✓</span>
        )}
        {isSkipped && (
          <span className="text-gray-500 text-sm">SKIPPED</span>
        )}
      </div>

      {!isPurged && !isSkipped && (
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPurge}
            disabled={isPurging}
            className={`
              flex-1 py-2 rounded-lg font-bold uppercase text-sm tracking-wider
              ${colors.border}/50 ${colors.bg}/20 ${colors.text}
              hover:${colors.bg}/30 transition-colors
              disabled:opacity-50 disabled:cursor-wait
            `}
          >
            {isPurging ? '⟳ Purging...' : `Purge All ${label}`}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSkip}
            disabled={isPurging}
            className="px-4 py-2 rounded-lg border border-gray-500/30 text-gray-400 text-sm hover:bg-gray-500/20 transition-colors disabled:opacity-50"
          >
            Skip
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export const SwiftResultsScreen: React.FC = () => {
  const { context, transition, updateFlowContext, resetFlow } = useAppStore();
  
  const flowContext = context.flowContext;
  const entities = flowContext?.entities || [];
  
  const [purgedTypes, setPurgedTypes] = useState<Set<MonsterType>>(new Set());
  const [skippedTypes, setSkippedTypes] = useState<Set<MonsterType>>(new Set());
  const [purgingType, setPurgingType] = useState<MonsterType | null>(null);
  const [totalPurged, setTotalPurged] = useState<ClassifiedFile[]>([]);

  const counts = countEntities(entities);
  
  const ghostEntities = filterByType(entities, MonsterType.Ghost);
  const zombieEntities = filterByType(entities, MonsterType.Zombie);
  const demonEntities = filterByType(entities, MonsterType.Demon);
  
  const ghostSize = calculateSpaceRecovered(ghostEntities);
  const zombieSize = calculateSpaceRecovered(zombieEntities);
  const demonSize = calculateSpaceRecovered(demonEntities);

  // Calculate remaining categories
  const remainingCategories = [MonsterType.Ghost, MonsterType.Zombie, MonsterType.Demon].filter(
    type => !purgedTypes.has(type) && !skippedTypes.has(type) && 
    ((type === MonsterType.Ghost && counts.ghosts > 0) ||
     (type === MonsterType.Zombie && counts.zombies > 0) ||
     (type === MonsterType.Demon && counts.demons > 0))
  );

  const handlePurgeCategory = useCallback(async (type: MonsterType) => {
    setPurgingType(type);
    
    const entitiesToPurge = type === MonsterType.Ghost ? ghostEntities :
                           type === MonsterType.Zombie ? zombieEntities : demonEntities;

    // Purge each entity in the category
    for (const entity of entitiesToPurge) {
      try {
        await window.electronAPI.banishFile(
          entity.path,
          entity.classifications,
          entity.size
        );
      } catch (error) {
        console.error('Purge failed for:', entity.path, error);
      }
    }

    setPurgedTypes(prev => new Set([...prev, type]));
    setTotalPurged(prev => [...prev, ...entitiesToPurge]);
    setPurgingType(null);
  }, [ghostEntities, zombieEntities, demonEntities]);

  const handleSkipCategory = useCallback((type: MonsterType) => {
    setSkippedTypes(prev => new Set([...prev, type]));
  }, []);

  const handleComplete = useCallback(() => {
    const sparedEntities = entities.filter(e => !totalPurged.includes(e));
    
    updateFlowContext({ 
      purgedEntities: totalPurged,
      sparedEntities: sparedEntities
    });
    
    transition(AppState.SWIFT_SUMMARY);
  }, [totalPurged, entities, updateFlowContext, transition]);

  const handleCancel = () => {
    resetFlow();
    transition(AppState.EXORCISM_STYLE);
  };

  const handleBack = () => {
    transition(AppState.SWIFT_LOCATION);
  };

  // Auto-complete when all categories are handled
  const allHandled = remainingCategories.length === 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-6 relative bg-black">
      {/* Background texture */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-35 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Green mist */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '60%', height: '50%', left: '-10%', bottom: '10%' }}
        animate={{ x: ['0%', '15%', '0%'], y: ['0%', '-10%', '0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full opacity-35" style={{
          background: 'radial-gradient(ellipse 60% 50% at 40% 50%, rgba(34,197,94,0.4) 0%, transparent 55%)',
          filter: 'blur(40px)'
        }} />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{
        background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.95) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          disabled={purgingType !== null}
          className="absolute -top-16 left-0 text-gray-400 hover:text-white font-mono text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>←</span> Change Location
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-green-400 tracking-widest uppercase mb-2">
            Entities Detected
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            {entities.length} total • Purge by category
          </p>
        </motion.div>

        {/* Category Cards */}
        <div className="space-y-3 mb-6">
          {counts.ghosts > 0 && (
            <CategoryCard
              type={MonsterType.Ghost}
              icon="👻"
              label="Ghosts"
              count={counts.ghosts}
              size={ghostSize}
              onPurge={() => handlePurgeCategory(MonsterType.Ghost)}
              onSkip={() => handleSkipCategory(MonsterType.Ghost)}
              isPurging={purgingType === MonsterType.Ghost}
              isSkipped={skippedTypes.has(MonsterType.Ghost)}
              isPurged={purgedTypes.has(MonsterType.Ghost)}
            />
          )}
          {counts.zombies > 0 && (
            <CategoryCard
              type={MonsterType.Zombie}
              icon="🧟"
              label="Zombies"
              count={counts.zombies}
              size={zombieSize}
              onPurge={() => handlePurgeCategory(MonsterType.Zombie)}
              onSkip={() => handleSkipCategory(MonsterType.Zombie)}
              isPurging={purgingType === MonsterType.Zombie}
              isSkipped={skippedTypes.has(MonsterType.Zombie)}
              isPurged={purgedTypes.has(MonsterType.Zombie)}
            />
          )}
          {counts.demons > 0 && (
            <CategoryCard
              type={MonsterType.Demon}
              icon="👹"
              label="Demons"
              count={counts.demons}
              size={demonSize}
              onPurge={() => handlePurgeCategory(MonsterType.Demon)}
              onSkip={() => handleSkipCategory(MonsterType.Demon)}
              isPurging={purgingType === MonsterType.Demon}
              isSkipped={skippedTypes.has(MonsterType.Demon)}
              isPurged={purgedTypes.has(MonsterType.Demon)}
            />
          )}
        </div>

        {/* Progress Summary */}
        {totalPurged.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-center"
          >
            <p className="text-green-400 text-sm">
              {totalPurged.length} files purged • {formatFileSize(calculateSpaceRecovered(totalPurged))} recovered
            </p>
          </motion.div>
        )}

        {/* Safety Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/40 border border-green-500/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-2"
        >
          <span className="text-green-400 text-sm">🛡️</span>
          <span className="text-green-400/80 font-mono text-xs">Files moved to Graveyard • Undo available</span>
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          {allHandled ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full py-4 bg-green-500/20 border-2 border-green-500/50 text-green-400 font-bold uppercase tracking-widest rounded-lg hover:bg-green-500/30 transition-colors"
            >
              [ View Summary ]
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              disabled={purgingType !== null}
              className="w-full py-3 bg-gray-500/10 border border-gray-500/30 text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gray-500/20 transition-colors disabled:opacity-50"
            >
              [ Cancel & Return to HQ ]
            </motion.button>
          )}
        </div>

        {/* ESC hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 font-mono text-xs mt-6"
        >
          [ Press ESC to go back ]
        </motion.p>
      </div>
    </div>
  );
};

export default SwiftResultsScreen;
