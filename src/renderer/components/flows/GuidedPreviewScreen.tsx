import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { SafetyInfoPanel } from './SafetyInfoPanel';
import { countEntities, formatFileSize, calculateSpaceRecovered, hasUnknownRisk } from '../../utils/entityUtils';
import { generateGuidedEncounter } from '../../data/simulatedFiles';
import bgTexture from '../../../assets/images/bg_texture.png';
import type { ClassifiedFile } from '../../../shared/types';

/**
 * GuidedPreviewScreen - Preview screen for Guided Ritual flow
 * 
 * Shows "Infested Zone" card with narrative text and entity counts
 * Uses SIMULATED data only - NO real file system access
 */

export const GuidedPreviewScreen: React.FC = () => {
  const { transition, initializeFlow } = useAppStore();
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);
  const [entities, setEntities] = useState<ClassifiedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load simulated encounter on mount - NO real file scanning
  useEffect(() => {
    const timer = setTimeout(() => {
      const simulatedEntities = generateGuidedEncounter();
      setEntities(simulatedEntities);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const counts = countEntities(entities);
  const totalSpace = calculateSpaceRecovered(entities);
  const unknownRisk = hasUnknownRisk(entities);

  const handleEnterZone = () => {
    initializeFlow('guided', entities);
    transition(AppState.GUIDED_ACTIVE);
  };

  const handleBack = () => {
    transition(AppState.EXORCISM_STYLE);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-6 relative bg-black">
      {/* Background texture */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-40 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Purple mist */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '80%', height: '70%', left: '-20%', bottom: '-10%' }}
        animate={{ x: ['0%', '20%', '0%'], y: ['0%', '-15%', '0%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full opacity-40" style={{
          background: 'radial-gradient(ellipse 70% 60% at 40% 60%, rgba(168,85,247,0.5) 0%, transparent 60%)',
          filter: 'blur(50px)'
        }} />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="absolute -top-16 left-0 text-gray-400 hover:text-white font-mono text-sm flex items-center gap-2 transition-colors"
        >
          <span>←</span> Back to HQ
        </motion.button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/80 border-2 border-purple-500/50 rounded-xl p-8 backdrop-blur-sm shadow-2xl shadow-purple-500/20"
          style={{
            clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🏚️
            </motion.div>
            <h1 className="text-3xl font-bold text-purple-400 tracking-widest uppercase mb-2">
              Infested Zone
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              Residual activity detected.
            </p>
          </div>

          {/* Lore Text */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-center italic">
              "Entities feeding on forgotten artifacts. The digital realm trembles with their presence..."
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-4xl mb-4"
              >
                🔮
              </motion.div>
              <p className="text-purple-400 font-mono">Scanning for entities...</p>
            </div>
          ) : (
            <>
              {/* Entity Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">👻</span>
                  <p className="text-blue-400 font-bold text-2xl">{counts.ghosts}</p>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Ghosts</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">🧟</span>
                  <p className="text-green-400 font-bold text-2xl">{counts.zombies}</p>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Zombies</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">👹</span>
                  <p className="text-red-400 font-bold text-2xl">{counts.demons}</p>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Demons</p>
                </div>
                <div className={`${unknownRisk ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-500/10 border-gray-500/30'} border rounded-lg p-4 text-center`}>
                  <span className="text-2xl">{unknownRisk ? '⚠️' : '✓'}</span>
                  <p className={`${unknownRisk ? 'text-orange-400' : 'text-gray-400'} font-bold text-lg`}>
                    {unknownRisk ? 'YES' : 'NO'}
                  </p>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Unknown Risk</p>
                </div>
              </div>

              {/* Potential Recovery */}
              <div className="text-center mb-6 py-3 bg-black/50 rounded-lg">
                <p className="text-gray-400 text-sm">Potential space recovery</p>
                <p className="text-purple-400 font-bold text-xl">{formatFileSize(totalSpace)}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnterZone}
                  className="w-full py-4 bg-purple-500/20 border-2 border-purple-500/50 text-purple-400 font-bold uppercase tracking-widest rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  [ Enter Infested Zone ]
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSafetyInfo(true)}
                  className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  [ View Safety Info ]
                </motion.button>
              </div>
            </>
          )}
        </motion.div>

        {/* ESC hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 font-mono text-xs mt-6"
        >
          [ Press ESC to return ]
        </motion.p>
      </div>

      {/* Safety Info Panel */}
      <SafetyInfoPanel isOpen={showSafetyInfo} onClose={() => setShowSafetyInfo(false)} />
    </div>
  );
};

export default GuidedPreviewScreen;
