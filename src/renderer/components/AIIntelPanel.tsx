import { forwardRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FileInspectionResponse } from '../../shared/types';

// Import custom icons
import iconWarning from '../../assets/images/icon_warning.png';
import { GameIcon } from './ui/GameIcon';

/**
 * AIIntelPanel - AI-powered file intelligence display
 * 
 * Displays tactical analysis from Google Gemini with:
 * - "DECIPHERING SOUL SIGNATURE..." loading animation
 * - Typewriter effect for AI analysis
 * - Fallback message on error
 * - Styled as hacking terminal
 * 
 * Requirements: 7.3, 7.4, 7.5
 */

export interface AIIntelPanelProps {
  /** Whether the AI is currently analyzing */
  isLoading: boolean;
  /** The AI analysis response */
  intel: FileInspectionResponse | null;
  /** Error message if analysis failed */
  error: string | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Custom hook for typewriter effect
 */
function useTypewriter(text: string, speed: number = 30, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
}


/**
 * Loading animation component
 */
function LoadingAnimation() {
  return (
    <div className="space-y-3">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-spectral-green font-tech text-sm uppercase tracking-widest"
      >
        DECIPHERING SOUL SIGNATURE...
      </motion.div>
      
      {/* Scanning lines animation */}
      <div className="space-y-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: ['0%', '100%', '60%', '80%', '100%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="h-1 bg-gradient-to-r from-spectral-green/80 to-spectral-green/20 rounded"
          />
        ))}
      </div>
      
      {/* Binary/hex decoration */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="font-mono text-[10px] text-spectral-green/50 overflow-hidden"
      >
        0x4558 0x4F52 0x4349 0x5354 0x2E2E 0x2E00
      </motion.div>
    </div>
  );
}

/**
 * Threat level badge component
 */
function ThreatLevelBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: 'bg-green-900/50 border-green-500 text-green-400',
    medium: 'bg-yellow-900/50 border-yellow-500 text-yellow-400',
    high: 'bg-red-900/50 border-red-500 text-red-400'
  };

  const labels = {
    low: 'LOW THREAT',
    medium: 'MEDIUM THREAT',
    high: 'HIGH THREAT'
  };

  return (
    <span 
      className={`px-2 py-0.5 text-[10px] font-tech font-bold border uppercase tracking-wider ${colors[level]}`}
      data-testid="threat-level-badge"
      data-threat-level={level}
    >
      {labels[level]}
    </span>
  );
}

const AIIntelPanel = forwardRef<HTMLDivElement, AIIntelPanelProps>(
  ({ isLoading, intel, error, className = '' }, ref) => {
    // Typewriter effect for the analysis text
    const { displayedText, isComplete } = useTypewriter(
      intel?.analysis || '',
      25,
      !isLoading && !!intel?.analysis
    );

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`relative ${className}`}
        data-testid="ai-intel-panel"
      >
        {/* Terminal frame */}
        <div 
          className="bg-graveyard-900/90 backdrop-blur-xl border-2 border-spectral-green/50 rounded-lg overflow-hidden"
          style={{
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 30px rgba(16, 185, 129, 0.05)'
          }}
        >
          {/* Terminal header */}
          <div className="bg-graveyard-800/80 px-4 py-2 border-b border-spectral-green/30 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[10px] font-tech text-spectral-green/70 uppercase tracking-widest ml-2">
              SOUL SCANNER v2.0
            </span>
          </div>

          {/* Terminal content */}
          <div className="p-4 min-h-[200px]">
            {isLoading ? (
              <LoadingAnimation />
            ) : error ? (
              <div className="space-y-3" data-testid="intel-error">
                <div className="text-red-400 font-tech text-sm uppercase tracking-wider flex items-center gap-2">
                  <GameIcon src={iconWarning} size="sm" glow glowColor="rgba(239,68,68,0.6)" />
                  SIGNAL INTERFERENCE DETECTED
                </div>
                <p className="text-gray-400 font-tech text-sm">
                  SOUL SIGNATURE OBSCURED - Unable to decipher this entity's true nature. 
                  The spirits are silent on this matter. Proceed with caution, Exorcist.
                </p>
                <div className="text-[10px] text-red-400/60 font-mono">
                  ERR: {error}
                </div>
              </div>
            ) : intel ? (
              <div className="space-y-3" data-testid="intel-content">
                {/* Threat level */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-tech text-gray-500 uppercase tracking-wider">
                    THREAT ASSESSMENT
                  </span>
                  <ThreatLevelBadge level={intel.threat_level} />
                </div>

                {/* Analysis text with typewriter effect */}
                <div className="relative">
                  <p 
                    className="text-spectral-green font-tech text-sm leading-relaxed"
                    data-testid="intel-analysis"
                  >
                    {displayedText}
                    {!isComplete && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-spectral-green ml-0.5 align-middle"
                      />
                    )}
                  </p>
                </div>

                {/* Recommendations */}
                {isComplete && intel.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-3 border-t border-spectral-green/20"
                    data-testid="intel-recommendations"
                  >
                    <div className="text-[10px] font-tech text-gray-500 uppercase tracking-wider mb-2">
                      TACTICAL RECOMMENDATIONS
                    </div>
                    <ul className="space-y-1">
                      {intel.recommendations.map((rec, index) => (
                        <li 
                          key={index}
                          className="text-xs font-tech text-gray-400 flex items-start gap-2"
                        >
                          <span className="text-spectral-green">▸</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ) : null}
          </div>

          {/* Scanline effect */}
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(transparent 0%, rgba(16, 185, 129, 0.03) 50%, transparent 100%)',
              height: '50%'
            }}
          />
        </div>
      </motion.div>
    );
  }
);

AIIntelPanel.displayName = 'AIIntelPanel';

export { AIIntelPanel };
