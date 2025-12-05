import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';

/**
 * XPFloatingText - Floating +XP animation when XP is gained
 * 
 * Shows a floating text that rises and fades when the player earns XP.
 */

export function XPFloatingText() {
  const { context } = useAppStore();
  const { lastXPGain } = context;
  const [displayedXP, setDisplayedXP] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (lastXPGain && lastXPGain > 0) {
      setDisplayedXP(lastXPGain);
      setKey(prev => prev + 1);
    }
  }, [lastXPGain]);

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[150] pointer-events-none">
      <AnimatePresence>
        {displayedXP && (
          <motion.div
            key={key}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ 
              y: -100, 
              opacity: [1, 1, 0],
              scale: [0.5, 1.2, 1]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            onAnimationComplete={() => setDisplayedXP(null)}
            className="text-center"
          >
            <span 
              className="text-4xl font-tech font-bold text-yellow-400"
              style={{
                textShadow: '0 0 20px rgba(234,179,8,0.8), 0 0 40px rgba(234,179,8,0.4)'
              }}
            >
              +{displayedXP} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default XPFloatingText;
