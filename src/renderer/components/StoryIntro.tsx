import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bgTexture from '../../assets/images/bg_texture.png';

/**
 * StoryIntro - Narrative introduction component for Story Mode
 * 
 * Features:
 * - Title with glitch effect (appears instantly)
 * - Typewriter effect for body text with soft digital tick sounds
 * - Button appears only after text completes with subtle breathing animation
 * - Subtle version of TitleScreen background
 */

export interface StoryIntroProps {
  onStart: () => void;
  className?: string;
}

// The narrative text lines - with type markers for styling
interface NarrativeLine {
  text: string;
  type: 'normal' | 'technical' | 'question';
}

const NARRATIVE_LINES: NarrativeLine[] = [
  { text: 'Your system is haunted.', type: 'normal' },
  { text: 'Forgotten remnants linger. Bloated entities consume space. Duplicates multiply in silence.', type: 'normal' },
  { text: 'As the Digital Exorcist, you will confront these manifestations. Not with deletion, but with judgment.', type: 'normal' },
  { text: 'Are you ready to face what haunts your hard drive?', type: 'question' }
];

/**
 * Glitch Title Component - Title with chromatic aberration glitch effect (no glow)
 */
const GlitchTitle: React.FC<{ text: string; visible: boolean }> = ({ text, visible }) => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!visible) return;
    
    // Initial glitch burst when appearing
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300);
    
    // Periodic glitches - more frequent
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        setGlitchActive(true);
        setOffset({ x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 5 });
        setTimeout(() => setGlitchActive(false), 80 + Math.random() * 120);
      }
    }, 1500 + Math.random() * 1500);
    
    return () => clearInterval(glitchInterval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="relative inline-block">
      {/* Chromatic aberration layers - always visible */}
      <span className="absolute inset-0 text-red-500/25" style={{ transform: 'translate(-2px, 0)' }}>
        {text}
      </span>
      <span className="absolute inset-0 text-cyan-500/25" style={{ transform: 'translate(2px, 0)' }}>
        {text}
      </span>
      
      {/* Main text */}
      <span className="relative z-10">{text}</span>
      
      {/* Glitch slices - more dramatic */}
      {glitchActive && (
        <>
          <span 
            className="absolute inset-0 text-purple-300" 
            style={{ 
              transform: `translate(${offset.x}px, ${offset.y}px)`, 
              clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)' 
            }}
          >
            {text}
          </span>
          <span 
            className="absolute inset-0 text-green-400" 
            style={{ 
              transform: `translate(${-offset.x}px, ${-offset.y}px)`, 
              clipPath: 'polygon(0 66%, 100% 66%, 100% 100%, 0 100%)' 
            }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  );
};

/**
 * Blinking Cursor Component
 */
const BlinkingCursor: React.FC = () => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className={`text-purple-400 ml-0.5 ${visible ? 'opacity-100' : 'opacity-0'}`}>_</span>
  );
};

/**
 * Create a subtle typewriter tick sound using Web Audio API
 */
const createTypeSound = (): (() => void) => {
  let audioContext: AudioContext | null = null;
  
  return () => {
    try {
      // Lazy init audio context (required for browser autoplay policies)
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Very soft, subtle tick - almost like a soft keyboard click
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800 + Math.random() * 200, audioContext.currentTime);
      
      // Very quiet and short
      gainNode.gain.setValueAtTime(0.015, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.03);
    } catch (e) {
      // Silently fail if audio not available
    }
  };
};

/**
 * Single Typewriter Component - Types out all lines sequentially
 */
const SequentialTypewriter: React.FC<{
  lines: NarrativeLine[];
  startDelay: number;
  onComplete: () => void;
}> = ({ lines, startDelay, onComplete }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const typeSoundRef = useRef<(() => void) | null>(null);

  // Initialize sound on mount
  useEffect(() => {
    typeSoundRef.current = createTypeSound();
  }, []);

  // Start after delay
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  // Typewriter effect
  useEffect(() => {
    if (!started || isComplete) return;

    const currentLine = lines[currentLineIndex].text;
    
    if (currentCharIndex < currentLine.length) {
      // Type next character
      const timer = setTimeout(() => {
        // Play subtle tick sound (skip for spaces to reduce noise)
        if (currentLine[currentCharIndex] !== ' ' && typeSoundRef.current) {
          typeSoundRef.current();
        }
        
        setDisplayedLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          return newLines;
        });
        
        setCurrentCharIndex(prev => prev + 1);
      }, 30 + Math.random() * 20); // 30-50ms per character
      
      return () => clearTimeout(timer);
    } else {
      // Line complete, move to next line or finish
      if (currentLineIndex < lines.length - 1) {
        const timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
          setDisplayedLines(prev => [...prev, '']);
        }, 400); // Pause between lines
        
        return () => clearTimeout(timer);
      } else {
        // All lines complete
        setIsComplete(true);
        onComplete();
      }
    }
  }, [started, currentLineIndex, currentCharIndex, lines, isComplete, onComplete]);

  // Initialize first line
  useEffect(() => {
    if (started && displayedLines.length === 0) {
      setDisplayedLines(['']);
    }
  }, [started, displayedLines.length]);

  if (!started) return null;

  return (
    <div className="space-y-4">
      {displayedLines.map((line, index) => {
        const lineData = lines[index];
        const isCurrentLine = index === currentLineIndex;
        const showCursor = isCurrentLine && !isComplete;
        
        // Style based on line type - text-left for natural reading (no green, all gray/purple)
        let lineClass = 'font-mono leading-relaxed text-gray-300 text-base md:text-lg text-left';
        if (lineData.type === 'technical') {
          lineClass = 'font-mono leading-relaxed text-gray-400 text-sm md:text-base tracking-wide text-left';
        } else if (lineData.type === 'question') {
          lineClass = 'font-mono leading-relaxed text-purple-300 text-base md:text-lg italic mt-4 text-left';
        }
        
        return (
          <p key={index} className={lineClass}>
            {line}
            {showCursor && <BlinkingCursor />}
          </p>
        );
      })}
    </div>
  );
};

const StoryIntro: React.FC<StoryIntroProps> = ({ onStart, className = '' }) => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [skipped, setSkipped] = useState(false);

  // Show title after fade-in
  useEffect(() => {
    const titleTimer = setTimeout(() => setTitleVisible(true), 600);
    return () => clearTimeout(titleTimer);
  }, []);

  // Show button after text completes
  useEffect(() => {
    if (textComplete) {
      const buttonTimer = setTimeout(() => setShowButton(true), 600);
      return () => clearTimeout(buttonTimer);
    }
  }, [textComplete]);

  const handleTextComplete = useCallback(() => {
    setTextComplete(true);
  }, []);

  const handleSkip = useCallback(() => {
    setSkipped(true);
    setTextComplete(true);
    setShowButton(true);
  }, []);

  return (
    <motion.div
      data-testid="story-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden ${className}`}
    >
      {/* Background texture - subtle version of TitleScreen */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-30 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Purple mist - bottom left, subtle */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '80%', height: '60%', left: '-20%', bottom: '-10%' }}
        animate={{ x: ['0%', '25%', '0%'], y: ['0%', '-15%', '0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-full h-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 40% 70%, rgba(168,85,247,0.35) 0%, rgba(139,92,246,0.15) 40%, transparent 65%)',
            filter: 'blur(40px)'
          }}
        />
      </motion.div>

      {/* Green mist - top right, subtle */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '70%', height: '50%', right: '-15%', top: '-5%' }}
        animate={{ x: ['0%', '-20%', '0%'], y: ['0%', '15%', '0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <div 
          className="w-full h-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 60% 40%, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.1) 45%, transparent 65%)',
            filter: 'blur(35px)'
          }}
        />
      </motion.div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Skip Intro button - bottom left corner */}
      <AnimatePresence>
        {titleVisible && !textComplete && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={handleSkip}
            className="absolute bottom-16 left-6 z-30 px-4 py-2 text-sm font-mono text-gray-400 
                       border border-gray-600/50 bg-black/30 hover:text-purple-300 hover:border-purple-500/50
                       transition-colors duration-200"
          >
            Skip Intro »
          </motion.button>
        )}
      </AnimatePresence>

      {/* Content container - w-full max-w-2xl prevents text shifting when longer lines appear */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* Title with glitch effect - no glow */}
        <motion.h1
          data-testid="story-intro-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: titleVisible ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-creepster text-purple-400 mb-12 tracking-wider"
        >
          <GlitchTitle text="THE RITUAL BEGINS" visible={titleVisible} />
        </motion.h1>

        {/* Narrative text with typewriter effect - w-full prevents shifting when longer lines appear */}
        <div data-testid="story-intro-narrative" className="mb-12 min-h-[220px] w-full text-left">
          {titleVisible && !skipped && (
            <SequentialTypewriter
              lines={NARRATIVE_LINES}
              startDelay={1200}
              onComplete={handleTextComplete}
            />
          )}
          {/* Show all text instantly when skipped */}
          {skipped && (
            <div className="space-y-4">
              {NARRATIVE_LINES.map((line, index) => {
                let lineClass = 'font-mono leading-relaxed text-gray-300 text-base md:text-lg text-left';
                if (line.type === 'technical') {
                  lineClass = 'font-mono leading-relaxed text-gray-400 text-sm md:text-base tracking-wide text-left';
                } else if (line.type === 'question') {
                  lineClass = 'font-mono leading-relaxed text-purple-300 text-base md:text-lg italic mt-4 text-left';
                }
                return <p key={index} className={lineClass}>{line.text}</p>;
              })}
            </div>
          )}
        </div>

        {/* Begin button - appears after text with noticeable pulse animation */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              data-testid="story-intro-button"
              onClick={onStart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: [1, 1, 1],
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 20px rgba(168,85,247,0.3), inset 0 0 15px rgba(168,85,247,0.1)',
                  '0 0 35px rgba(168,85,247,0.5), inset 0 0 20px rgba(168,85,247,0.15)',
                  '0 0 20px rgba(168,85,247,0.3), inset 0 0 15px rgba(168,85,247,0.1)'
                ]
              }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  repeatType: 'loop'
                },
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatType: 'loop'
                }
              }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-purple-900/40 border-2 border-purple-500/80 text-purple-200 
                         font-creepster text-xl md:text-2xl tracking-widest uppercase
                         hover:bg-purple-600/50 hover:border-purple-400 hover:text-purple-100
                         transition-colors duration-300 focus:outline-none focus:ring-2 
                         focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
              style={{
                clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
              }}
            >
              Begin the Ritual
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StoryIntro;
