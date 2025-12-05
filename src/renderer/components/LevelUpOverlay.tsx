import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';

/**
 * LevelUpOverlay - Full-screen celebration when player levels up
 * 
 * Displays a dramatic "LEVEL UP!" animation with particle effects.
 */

export function LevelUpOverlay() {
  const { context, clearLevelUp } = useAppStore();
  const { justLeveledUp, level } = context;

  useEffect(() => {
    if (justLeveledUp) {
      const timer = setTimeout(() => {
        clearLevelUp();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [justLeveledUp, clearLevelUp]);

  return (
    <AnimatePresence>
      {justLeveledUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />

          {/* Particle burst effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50vw', 
                  y: '50vh',
                  scale: 0,
                  opacity: 1
                }}
                animate={{ 
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.3,
                  ease: 'easeOut'
                }}
                className="absolute w-4 h-4"
                style={{
                  background: `radial-gradient(circle, ${
                    ['#fbbf24', '#a855f7', '#22c55e', '#ef4444'][Math.floor(Math.random() * 4)]
                  } 0%, transparent 70%)`,
                  boxShadow: `0 0 20px ${
                    ['#fbbf24', '#a855f7', '#22c55e', '#ef4444'][Math.floor(Math.random() * 4)]
                  }`
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 5, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.6,
              type: 'spring',
              damping: 10
            }}
            className="relative text-center"
          >
            {/* Glow ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.8, 0.3, 0.8]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-yellow-500/30 via-purple-500/30 to-yellow-500/30 blur-3xl"
            />

            {/* Level Up Text */}
            <motion.h1
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(234,179,8,0.8)',
                  '0 0 60px rgba(234,179,8,1)',
                  '0 0 20px rgba(234,179,8,0.8)'
                ]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-7xl font-creepster text-yellow-400 mb-4 drop-shadow-2xl"
            >
              LEVEL UP!
            </motion.h1>

            {/* Level Number */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-tech font-bold text-white"
            >
              <span className="text-gray-400">RANK</span>{' '}
              <span className="text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]">
                {level}
              </span>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-lg font-tech text-purple-300 uppercase tracking-widest"
            >
              Your exorcist powers grow stronger
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LevelUpOverlay;
