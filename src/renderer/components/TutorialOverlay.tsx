import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameIcon } from './ui/GameIcon';
import { useAppStore, AppState } from '../store/appStore';

import iconTactical from '../../assets/images/icon_tactical.png';
import ghostIcon from '../../assets/images/ghost.png';
import demonIcon from '../../assets/images/demon.png';
import zombieIcon from '../../assets/images/zombie.png';

/**
 * TutorialOverlay - First-launch mission briefing modal
 * 
 * Displays only on first launch (tracked via localStorage).
 * Only shows when user enters HUD state (after scanning) - not during Title Screen.
 * Guides new exorcists through the system basics.
 */

const TUTORIAL_STORAGE_KEY = 'digital-exorcist-tutorial-complete';

export interface TutorialOverlayProps {
  /** Callback when tutorial is completed */
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: iconTactical,
    title: 'INITIALIZE SYSTEM',
    description: 'Boot up the Digital Exorcist and prepare for battle.'
  },
  {
    icon: ghostIcon,
    title: 'SCAN DIRECTORY',
    description: 'Select a folder to scan for digital anomalies lurking in your files.'
  },
  {
    icon: demonIcon,
    title: 'BATTLE ANOMALIES',
    description: 'Engage ghosts, demons, and zombies in tactical combat.'
  },
  {
    icon: zombieIcon,
    title: 'PURGE FOR XP',
    description: 'Banish files to earn XP and level up your exorcist rank.'
  }
];

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Get current app state - tutorial only shows in HUD state
  const appState = useAppStore(state => state.state);

  useEffect(() => {
    // Only show tutorial when user enters HUD state (after scanning)
    // This ensures the cinematic Title Screen intro is not interrupted
    if (appState === AppState.HUD) {
      const tutorialComplete = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!tutorialComplete) {
        setIsVisible(true);
      }
    }
  }, [appState]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  const handleNextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
      >
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(139,92,246,0.1)_2px,rgba(139,92,246,0.1)_4px)]" />
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative max-w-2xl w-full mx-4"
        >
          {/* Main Panel */}
          <div 
            className="bg-graveyard-900/95 backdrop-blur-xl border-2 border-spectral-purple/60 p-8 shadow-[0_0_60px_rgba(139,92,246,0.4)]"
            style={{
              clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-creepster text-white mb-2 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]">
                WELCOME, EXORCIST
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-spectral-purple to-transparent" />
            </motion.div>

            {/* Tutorial Steps */}
            <div className="space-y-4 mb-8">
              {tutorialSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: index <= currentStep ? 1 : 0.4, 
                    x: 0,
                    scale: index === currentStep ? 1.02 : 1
                  }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    index === currentStep 
                      ? 'bg-spectral-purple/20 border-spectral-purple/60 shadow-lg shadow-purple-500/20' 
                      : index < currentStep
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-black/30 border-white/10'
                  }`}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-tech font-bold ${
                      index < currentStep 
                        ? 'bg-green-500 text-black' 
                        : index === currentStep
                          ? 'bg-spectral-purple text-white'
                          : 'bg-gray-700 text-gray-400'
                    }`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                  </div>
                  <GameIcon 
                    src={step.icon} 
                    size="md" 
                    glow={index === currentStep}
                    glowColor={index === currentStep ? 'rgba(139,92,246,0.6)' : undefined}
                  />
                  <div className="flex-1">
                    <h3 className="font-tech font-bold text-white uppercase tracking-wider">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-tech">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {currentStep < tutorialSteps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.6)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-spectral-purple/80 hover:bg-spectral-purple text-white font-tech font-bold uppercase tracking-wider border-2 border-spectral-purple shadow-lg shadow-purple-500/30 transition-all"
                  style={{
                    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                  }}
                >
                  NEXT STEP
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,197,94,0.6)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  className="px-8 py-3 bg-green-600/80 hover:bg-green-500 text-white font-tech font-bold uppercase tracking-wider border-2 border-green-500 shadow-lg shadow-green-500/30 transition-all"
                  style={{
                    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                  }}
                >
                  START TRAINING MISSION
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="px-6 py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-tech uppercase tracking-wider border border-white/20 transition-all"
              >
                SKIP
              </motion.button>
            </div>
          </div>

          {/* Corner Decorations */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-spectral-purple" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-spectral-purple" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-spectral-purple" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-spectral-purple" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TutorialOverlay;
