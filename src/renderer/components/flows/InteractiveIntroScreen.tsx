import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import bgTexture from '../../../assets/images/bg_texture.png';

/**
 * InteractiveIntroScreen - Entry point for Interactive Mode
 * 
 * Styled like ExorcismStyleScreen but more subtle.
 * ESC key works for navigation (handled in App.tsx), no back button.
 */

export const InteractiveIntroScreen: React.FC = () => {
  const { transition } = useAppStore();

  const handleBegin = useCallback(() => {
    transition(AppState.INTERACTIVE_TARGET);
  }, [transition]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black relative">
      {/* Background texture - same as ExorcismStyleScreen but more subtle */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-40 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Subtle mist layer - red themed for Interactive Mode */}
      <motion.div
        className="absolute z-[3] pointer-events-none"
        style={{ width: '80%', height: '60%', left: '-20%', bottom: '-10%' }}
        animate={{ x: ['0%', '25%', '0%'], y: ['0%', '-15%', '0%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-full h-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 40% 70%, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.15) 40%, transparent 65%)',
            filter: 'blur(35px)'
          }}
        />
      </motion.div>

      <motion.div
        className="absolute z-[3] pointer-events-none"
        style={{ width: '70%', height: '50%', right: '-15%', top: '-5%' }}
        animate={{ x: ['0%', '-20%', '0%'], y: ['0%', '15%', '0%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <div 
          className="w-full h-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 60% 40%, rgba(239,68,68,0.35) 0%, rgba(185,28,28,0.12) 45%, transparent 65%)',
            filter: 'blur(30px)'
          }}
        />
      </motion.div>

      {/* Subtle ground glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[25%] z-[2] pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,8,12,0.7) 0%, rgba(15,10,15,0.3) 50%, transparent 100%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-1/4 right-1/4 h-12 opacity-20" 
          style={{ 
            background: 'radial-gradient(ellipse at bottom, rgba(239,68,68,0.5), transparent 70%)', 
            filter: 'blur(20px)' 
          }} 
        />
      </div>

      {/* Vignette - same as ExorcismStyleScreen */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{
        background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.9) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-8 text-center">
        {/* Header with Dark Horse font */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 
            className="text-5xl md:text-6xl text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
            style={{ fontFamily: "'Dark Horse', serif" }}
          >
            Interactive Mode
          </h1>
          <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto" />
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          <div className="bg-black/40 border border-red-500/20 rounded-lg p-4">
            <div className="text-2xl mb-2">📁</div>
            <p className="text-red-400 font-tech text-xs uppercase tracking-wider mb-1">Scan</p>
            <p className="text-gray-500 text-[11px]">Real files from your system</p>
          </div>
          <div className="bg-black/40 border border-red-500/20 rounded-lg p-4">
            <div className="text-2xl mb-2">⚔️</div>
            <p className="text-red-400 font-tech text-xs uppercase tracking-wider mb-1">Battle</p>
            <p className="text-gray-500 text-[11px]">Symbolic confrontations</p>
          </div>
          <div className="bg-black/40 border border-red-500/20 rounded-lg p-4">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-red-400 font-tech text-xs uppercase tracking-wider mb-1">Safe</p>
            <p className="text-gray-500 text-[11px]">Files moved, never deleted</p>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-gray-300 text-base leading-relaxed mb-3">
            Guided cleansing with optional confrontation.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Resolve entities by category or one at a time.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button
            onClick={handleBegin}
            whileHover={{ 
              backgroundColor: 'rgba(239,68,68,0.25)', 
              borderColor: 'rgba(248,113,113,0.8)',
              boxShadow: '0 0 30px rgba(239,68,68,0.3)'
            }}
            whileTap={{ scale: 0.98 }}
            className="px-12 py-4 border-2 border-red-500/60 bg-red-500/15 
                       text-red-300 text-lg tracking-[0.4em] uppercase
                       transition-all duration-300 rounded-lg"
            style={{ fontFamily: "'Dark Horse', serif" }}
          >
            Begin Hunt
          </motion.button>
        </motion.div>

        {/* Safety Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-12 pt-6 border-t border-gray-800/30"
        >
          <p className="text-gray-600 text-xs">
            All actions occur locally. Battle stats are simulated.
          </p>
        </motion.div>

        {/* Keyboard hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-6 flex justify-center"
        >
          <span className="flex items-center gap-2 text-gray-600 text-[11px]">
            <span className="border border-gray-700 px-2 py-1 rounded text-gray-500">ESC</span>
            <span>return to HQ</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveIntroScreen;
