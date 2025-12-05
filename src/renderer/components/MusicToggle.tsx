import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import musicFile from '../../assets/images/music.wav';

/**
 * MusicToggle - Audio Frequency Radar Style
 * 
 * A radar-style audio control with animated frequency waves.
 * Color changes based on the current screen/page.
 */

// Color themes for different screens
export type MusicToggleTheme = 'purple' | 'cyan' | 'red' | 'green' | 'default';

interface MusicToggleProps {
  /** Color theme based on current screen */
  theme?: MusicToggleTheme;
}

// Color configurations for each theme
const themeColors: Record<MusicToggleTheme, {
  border: string;
  borderActive: string;
  circles: string[];
  bar: string;
  barActive: string;
  dot: string;
  dotActive: string;
  sweepGradient: string;
  sweepShadow: string;
  glowColor: string;
  pulseClass: string;
}> = {
  purple: {
    border: 'border-gray-600',
    borderActive: 'border-purple-500',
    circles: ['border-purple-500/30', 'border-purple-500/40', 'border-purple-500/50'],
    bar: 'bg-gray-600',
    barActive: 'bg-purple-400',
    dot: 'bg-gray-500',
    dotActive: 'bg-purple-400',
    sweepGradient: 'linear-gradient(90deg, rgba(168,85,247,0.8) 0%, transparent 100%)',
    sweepShadow: '0 0 10px rgba(168,85,247,0.5)',
    glowColor: '168,85,247',
    pulseClass: 'border-purple-500/50',
  },
  cyan: {
    border: 'border-gray-600',
    borderActive: 'border-cyan-500',
    circles: ['border-cyan-500/30', 'border-cyan-500/40', 'border-cyan-500/50'],
    bar: 'bg-gray-600',
    barActive: 'bg-cyan-400',
    dot: 'bg-gray-500',
    dotActive: 'bg-cyan-400',
    sweepGradient: 'linear-gradient(90deg, rgba(6,182,212,0.8) 0%, transparent 100%)',
    sweepShadow: '0 0 10px rgba(6,182,212,0.5)',
    glowColor: '6,182,212',
    pulseClass: 'border-cyan-500/50',
  },
  red: {
    border: 'border-gray-600',
    borderActive: 'border-red-500',
    circles: ['border-red-500/30', 'border-red-500/40', 'border-red-500/50'],
    bar: 'bg-gray-600',
    barActive: 'bg-red-400',
    dot: 'bg-gray-500',
    dotActive: 'bg-red-400',
    sweepGradient: 'linear-gradient(90deg, rgba(239,68,68,0.8) 0%, transparent 100%)',
    sweepShadow: '0 0 10px rgba(239,68,68,0.5)',
    glowColor: '239,68,68',
    pulseClass: 'border-red-500/50',
  },
  green: {
    border: 'border-gray-600',
    borderActive: 'border-green-500',
    circles: ['border-green-500/30', 'border-green-500/40', 'border-green-500/50'],
    bar: 'bg-gray-600',
    barActive: 'bg-green-400',
    dot: 'bg-gray-500',
    dotActive: 'bg-green-400',
    sweepGradient: 'linear-gradient(90deg, rgba(34,197,94,0.8) 0%, transparent 100%)',
    sweepShadow: '0 0 10px rgba(34,197,94,0.5)',
    glowColor: '34,197,94',
    pulseClass: 'border-green-500/50',
  },
  default: {
    border: 'border-gray-600',
    borderActive: 'border-purple-500',
    circles: ['border-purple-500/30', 'border-purple-500/40', 'border-purple-500/50'],
    bar: 'bg-gray-600',
    barActive: 'bg-purple-400',
    dot: 'bg-gray-500',
    dotActive: 'bg-purple-400',
    sweepGradient: 'linear-gradient(90deg, rgba(168,85,247,0.8) 0%, transparent 100%)',
    sweepShadow: '0 0 10px rgba(168,85,247,0.5)',
    glowColor: '168,85,247',
    pulseClass: 'border-purple-500/50',
  },
};

export const MusicToggle: React.FC<MusicToggleProps> = ({ theme = 'purple' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExorcismHovered, setIsExorcismHovered] = useState(false);
  const [storyModeTheme, setStoryModeTheme] = useState<MusicToggleTheme | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(musicFile);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const savedState = localStorage.getItem('musicEnabled');
    if (savedState === 'true') {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    setIsLoaded(true);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Listen for exorcism button hover events
  useEffect(() => {
    const handleExorcismHover = (e: CustomEvent<{ isHovered: boolean }>) => {
      setIsExorcismHovered(e.detail.isHovered);
    };
    
    window.addEventListener('exorcism-button-hover', handleExorcismHover as EventListener);
    return () => window.removeEventListener('exorcism-button-hover', handleExorcismHover as EventListener);
  }, []);

  // Listen for story mode theme changes (phase/entity specific)
  useEffect(() => {
    const handleStoryTheme = (e: CustomEvent<{ theme: string }>) => {
      setStoryModeTheme(e.detail.theme as MusicToggleTheme);
    };
    
    window.addEventListener('story-mode-theme', handleStoryTheme as EventListener);
    return () => {
      window.removeEventListener('story-mode-theme', handleStoryTheme as EventListener);
      setStoryModeTheme(null); // Reset when unmounting
    };
  }, []);

  // Reset storyModeTheme when the theme prop changes (screen transition)
  useEffect(() => {
    setStoryModeTheme(null);
  }, [theme]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('musicEnabled', 'false');
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem('musicEnabled', 'true');
      }).catch(console.error);
    }
  };

  if (!isLoaded) return null;

  // Get colors: storyModeTheme overrides theme prop, exorcism hover overrides everything
  const effectiveTheme = storyModeTheme || theme;
  const colors = isExorcismHovered ? themeColors.red : themeColors[effectiveTheme];
  
  const borderClass = isPlaying ? colors.borderActive : colors.border;
  const circleClasses = colors.circles;
  const barClass = isPlaying ? colors.barActive : colors.bar;
  const dotClass = isPlaying ? colors.dotActive : colors.dot;
  const sweepGradient = colors.sweepGradient;
  const sweepShadow = colors.sweepShadow;
  const glowColor = colors.glowColor;
  const pulseClass = colors.pulseClass;

  return (
    <motion.button
      onClick={toggleMusic}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1, 
        y: [0, -4, 0],
        scale: isExorcismHovered ? [1, 1.15, 1] : 1,
      }}
      transition={{ 
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: 0.5, repeat: isExorcismHovered ? Infinity : 0 },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-10 right-10 z-[60] w-16 h-16 flex items-center justify-center"
      title={isPlaying ? 'Mute Audio' : 'Play Audio'}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Radar container */}
      <div className={`relative w-16 h-16 rounded-full border-2 ${borderClass} bg-black/70 backdrop-blur-sm overflow-hidden transition-colors duration-300`}>
        
        {/* Radar circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`absolute w-12 h-12 rounded-full border transition-colors duration-300 ${isPlaying ? circleClasses[0] : 'border-gray-700/30'}`} />
          <div className={`absolute w-8 h-8 rounded-full border transition-colors duration-300 ${isPlaying ? circleClasses[1] : 'border-gray-700/40'}`} />
          <div className={`absolute w-4 h-4 rounded-full border transition-colors duration-300 ${isPlaying ? circleClasses[2] : 'border-gray-700/50'}`} />
        </div>

        {/* Radar sweep - only when playing */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div 
              className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left transition-all duration-300"
              style={{
                background: sweepGradient,
                boxShadow: sweepShadow
              }}
            />
          </motion.div>
        )}

        {/* Frequency bars - animated when playing */}
        <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-[3px] rounded-full transition-colors duration-300 ${barClass}`}
              animate={isPlaying ? {
                height: [8, 16 + Math.random() * 12, 8],
              } : { height: 8 }}
              transition={{
                duration: 0.4 + Math.random() * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1
              }}
            />
          ))}
        </div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${dotClass}`}
            animate={isPlaying ? { 
              boxShadow: [`0 0 5px rgba(${glowColor},0.5)`, `0 0 15px rgba(${glowColor},0.8)`, `0 0 5px rgba(${glowColor},0.5)`]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Glow effect when playing */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ 
              boxShadow: [`inset 0 0 15px rgba(${glowColor},0.2)`, `inset 0 0 25px rgba(${glowColor},0.4)`, `inset 0 0 15px rgba(${glowColor},0.2)`]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Outer pulse ring when playing */}
      {isPlaying && (
        <motion.div
          className={`absolute w-16 h-16 rounded-full border transition-colors duration-300 ${pulseClass}`}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default MusicToggle;
