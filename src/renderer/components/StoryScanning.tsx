import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import monster icons for shadow silhouettes
import ghostIcon from '../../assets/images/ghost.png';
import demonIcon from '../../assets/images/demon.png';
import zombieIcon from '../../assets/images/zombie.png';
import bgTexture from '../../assets/images/bg_texture.png';

/**
 * StoryScanning - Cinematic radar scanning animation for Story Mode
 * 
 * Features:
 * - Rotating radar sweep with sonar ping sound
 * - Monster shadow silhouettes that light up when swept
 * - Pulsing core that speeds up as scan progresses
 * - Terminal data stream instead of progress bar
 * - Tech noise in corners for atmosphere
 */

export interface StoryScanningProps {
  onComplete: () => void;
  className?: string;
}

// Terminal messages that stream during scan
const terminalMessages = [
  { text: '> INITIALIZING SPECTRAL SCAN...', delay: 0 },
  { text: '> CALIBRATING ECTOPLASMIC SENSORS...', delay: 400 },
  { text: '> SECTOR 7G: CLEAR', delay: 800 },
  { text: '> SECTOR 8A: ANOMALY DETECTED [TYPE: GHOST]', delay: 1400, type: 'ghost' },
  { text: '> SECTOR 9B: MASSIVE SIGNATURE [TYPE: DEMON]', delay: 2200, type: 'demon' },
  { text: '> SECTOR 12C: DUAL SIGNATURE [TYPE: ZOMBIE_TWIN]', delay: 3000, type: 'zombie' },
  { text: '> SCAN COMPLETE. ANALYZING THREATS...', delay: 3800 },
];

// Radar blip positions (angle in degrees, distance from center 0-1)
const radarBlips = [
  { id: 'ghost', angle: 45, distance: 0.6, icon: ghostIcon, color: 'cyan', size: 36 },
  { id: 'demon', angle: 180, distance: 0.75, icon: demonIcon, color: 'red', size: 48 },
  { id: 'zombie1', angle: 280, distance: 0.5, icon: zombieIcon, color: 'green', size: 32 },
  { id: 'zombie2', angle: 295, distance: 0.55, icon: zombieIcon, color: 'green', size: 32 },
];

/**
 * Create sonar ping sound using Web Audio API
 */
const createSonarSound = (): (() => void) => {
  let audioContext: AudioContext | null = null;
  
  return () => {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Silently fail
    }
  };
};

/**
 * Create digital ping sound for blip detection
 */
const createPingSound = (): (() => void) => {
  let audioContext: AudioContext | null = null;
  
  return () => {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1800, audioContext.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      // Silently fail
    }
  };
};

/**
 * Tech Noise Corner Component - Random changing data for atmosphere
 */
const TechNoiseCorner: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  const [data, setData] = useState({ coords: '0.000, 0.000', threat: 'LOW', temp: '45' });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        coords: `${(Math.random() * 90).toFixed(3)}, ${(Math.random() * 180 - 90).toFixed(3)}`,
        threat: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
        temp: (70 + Math.random() * 30).toFixed(0),
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const positionClasses = {
    tl: 'top-14 left-10',
    tr: 'top-14 right-10 text-right',
    bl: 'bottom-10 left-10',
    br: 'bottom-10 right-10 text-right',
  };
  
  const threatColor = data.threat === 'CRITICAL' ? 'text-red-500' : 
                      data.threat === 'HIGH' ? 'text-orange-500' : 
                      data.threat === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500';
  
  return (
    <div className={`absolute ${positionClasses[position]} font-mono text-[10px] text-green-500/60 leading-tight z-30`}>
      <div>COORDS: {data.coords}</div>
      <div className={threatColor}>THREAT_LVL: {data.threat}</div>
      <div>SYS_TEMP: {data.temp}°C</div>
    </div>
  );
};

/**
 * Radar Blip Component - Monster shadow silhouette that lights up when swept
 */
const RadarBlip: React.FC<{
  blip: typeof radarBlips[0];
  sweepAngle: number;
  radarRadius: number;
  onPing: () => void;
}> = ({ blip, sweepAngle, radarRadius, onPing }) => {
  const [isLit, setIsLit] = useState(false);
  const lastPingRef = useRef(0);
  
  // Calculate position
  const angleRad = (blip.angle * Math.PI) / 180;
  const x = Math.cos(angleRad) * blip.distance * radarRadius;
  const y = Math.sin(angleRad) * blip.distance * radarRadius;
  
  // Check if sweep is passing over this blip
  useEffect(() => {
    const normalizedSweep = ((sweepAngle % 360) + 360) % 360;
    const diff = Math.abs(normalizedSweep - blip.angle);
    const isNear = diff < 15 || diff > 345;
    
    if (isNear && Date.now() - lastPingRef.current > 1000) {
      setIsLit(true);
      onPing();
      lastPingRef.current = Date.now();
      setTimeout(() => setIsLit(false), 400);
    }
  }, [sweepAngle, blip.angle, onPing]);
  
  // Shadow/silhouette style based on color
  const shadowColor = blip.color === 'cyan' ? '0 0 20px cyan, 0 0 40px cyan' :
                      blip.color === 'red' ? '0 0 25px red, 0 0 50px red' : 
                      '0 0 20px lime, 0 0 40px lime';
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: isLit ? 1.3 : 1,
        opacity: isLit ? 1 : 0.4,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Shadow silhouette of the monster */}
      <div 
        className="relative"
        style={{
          width: blip.size,
          height: blip.size,
          boxShadow: isLit ? shadowColor : 'none',
          borderRadius: '50%',
        }}
      >
        <img 
          src={blip.icon} 
          alt=""
          className="w-full h-full object-contain"
          style={{ 
            filter: isLit 
              ? `brightness(0) drop-shadow(0 0 8px ${blip.color === 'cyan' ? 'cyan' : blip.color === 'red' ? 'red' : 'lime'})`
              : 'brightness(0) opacity(0.6)',
          }}
          draggable={false}
        />
      </div>
    </motion.div>
  );
};


const StoryScanning: React.FC<StoryScanningProps> = ({ onComplete, className = '' }) => {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const sonarSoundRef = useRef<(() => void) | null>(null);
  const pingSoundRef = useRef<(() => void) | null>(null);
  const lastSonarRef = useRef(0);
  const radarRadius = 140;

  // Initialize sounds
  useEffect(() => {
    sonarSoundRef.current = createSonarSound();
    pingSoundRef.current = createPingSound();
  }, []);

  // Radar sweep rotation - stops when scan complete
  useEffect(() => {
    if (scanComplete) return; // Stop rotating when complete
    const interval = setInterval(() => {
      setSweepAngle(prev => prev + 3);
    }, 30);
    return () => clearInterval(interval);
  }, [scanComplete]);

  // Sonar sound every rotation
  useEffect(() => {
    const rotation = Math.floor(sweepAngle / 360);
    if (rotation > lastSonarRef.current && sonarSoundRef.current) {
      sonarSoundRef.current();
      lastSonarRef.current = rotation;
    }
  }, [sweepAngle]);

  // Terminal messages stream
  useEffect(() => {
    // Reset state on mount
    setTerminalLines([]);
    setScanComplete(false);
    
    const timeouts: NodeJS.Timeout[] = [];
    
    terminalMessages.forEach(msg => {
      const timeout = setTimeout(() => {
        setTerminalLines(prev => {
          // Prevent duplicates by checking if message already exists
          if (prev.includes(msg.text)) return prev;
          return [...prev, msg.text];
        });
      }, msg.delay);
      timeouts.push(timeout);
    });

    // Complete scan - longer delay so user can see the result
    const completeTimeout = setTimeout(() => {
      setScanComplete(true);
      setTimeout(onComplete, 4500); // 4.5 seconds to see "SCAN COMPLETE"
    }, 4500);
    timeouts.push(completeTimeout);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  const handleBlipPing = useCallback(() => {
    if (pingSoundRef.current) {
      pingSoundRef.current();
    }
  }, []);

  return (
    <motion.div
      data-testid="story-scanning"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden ${className}`}
    >
      {/* Background texture - subtle */}
      <img 
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-20 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Blue/Cyan mist - bottom left (Ghost) */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '70%', height: '50%', left: '-15%', bottom: '-10%' }}
        animate={{ x: ['0%', '20%', '0%'], y: ['0%', '-10%', '0%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-full h-full opacity-25"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 40% 70%, rgba(6,182,212,0.3) 0%, rgba(59,130,246,0.1) 45%, transparent 65%)',
            filter: 'blur(45px)'
          }}
        />
      </motion.div>

      {/* Red mist - top right (Demon) */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '60%', height: '45%', right: '-10%', top: '-5%' }}
        animate={{ x: ['0%', '-15%', '0%'], y: ['0%', '12%', '0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <div 
          className="w-full h-full opacity-20"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 60% 35%, rgba(239,68,68,0.25) 0%, rgba(220,38,38,0.08) 45%, transparent 65%)',
            filter: 'blur(40px)'
          }}
        />
      </motion.div>

      {/* Green mist - center bottom (Zombie) */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        style={{ width: '50%', height: '40%', left: '25%', bottom: '-5%' }}
        animate={{ x: ['-5%', '10%', '-5%'], y: ['0%', '-8%', '0%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <div 
          className="w-full h-full opacity-20"
          style={{
            background: 'radial-gradient(ellipse 55% 50% at 50% 70%, rgba(34,197,94,0.25) 0%, rgba(22,163,74,0.08) 45%, transparent 65%)',
            filter: 'blur(40px)'
          }}
        />
      </motion.div>

      {/* Tech noise corners - skip bottom right where audio toggle is */}
      <TechNoiseCorner position="tl" />
      <TechNoiseCorner position="tr" />
      <TechNoiseCorner position="bl" />

      {/* Vignette - keeps mist contained */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0.98) 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center">
        {/* RADAR */}
        <div 
          className="relative mb-8"
          style={{ width: radarRadius * 2 + 40, height: radarRadius * 2 + 40 }}
        >
          {/* Outer rings */}
          {[1, 0.75, 0.5, 0.25].map((scale, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-green-500/30"
              style={{
                width: radarRadius * 2 * scale,
                height: radarRadius * 2 * scale,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Cross lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-500/20" style={{ transform: 'translateX(-50%)' }} />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-green-500/20" style={{ transform: 'translateY(-50%)' }} />

          {/* Sweep line */}
          <div
            className="absolute"
            style={{
              width: radarRadius,
              height: 3,
              left: '50%',
              top: '50%',
              transformOrigin: 'left center',
              transform: `rotate(${sweepAngle}deg)`,
              background: 'linear-gradient(90deg, rgba(0,255,100,0.9) 0%, rgba(0,255,100,0) 100%)',
              boxShadow: '0 0 20px rgba(0,255,100,0.6), 0 0 40px rgba(0,255,100,0.3)',
            }}
          />

          {/* Sweep trail/fade */}
          <div
            className="absolute rounded-full overflow-hidden pointer-events-none"
            style={{
              width: radarRadius * 2,
              height: radarRadius * 2,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: `conic-gradient(from ${sweepAngle - 30}deg, transparent 0deg, rgba(0,255,100,0.12) 25deg, transparent 30deg)`,
            }}
          />

          {/* Monster shadow blips */}
          {radarBlips.map(blip => (
            <RadarBlip
              key={blip.id}
              blip={blip}
              sweepAngle={sweepAngle}
              radarRadius={radarRadius}
              onPing={handleBlipPing}
            />
          ))}

          {/* Center point - small static dot */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500/60"
          />
        </div>

        {/* Terminal data stream */}
        <div className="w-[500px] h-[180px] bg-black/80 border border-green-500/40 rounded p-3 font-mono text-xs overflow-hidden">
          <div className="flex flex-col gap-1">
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  ${line.includes('GHOST') ? 'text-cyan-400' : ''}
                  ${line.includes('DEMON') ? 'text-red-400' : ''}
                  ${line.includes('ZOMBIE') ? 'text-green-400' : ''}
                  ${!line.includes('GHOST') && !line.includes('DEMON') && !line.includes('ZOMBIE') ? 'text-green-500/80' : ''}
                `}
              >
                {line}
              </motion.div>
            ))}
            {!scanComplete && (
              <motion.span
                className="text-green-500"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                _
              </motion.span>
            )}
          </div>
        </div>

        {/* Final reveal - mystical font */}
        <AnimatePresence>
          {scanComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-8 text-center"
            >
              <div className="text-3xl font-creepster tracking-[0.15em] mb-4 text-purple-400">
                Scan Complete
              </div>
              <div className="text-lg font-creepster tracking-wider mb-2 text-gray-300">
                Threats Identified:
              </div>
              <div className="text-xl font-creepster flex items-center justify-center gap-4">
                <span className="text-cyan-400">1 Ghost</span>
                <span className="text-gray-600">◆</span>
                <span className="text-red-400">1 Demon</span>
                <span className="text-gray-600">◆</span>
                <span className="text-green-400">1 Zombie</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanlines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
        }}
      />
    </motion.div>
  );
};

export default StoryScanning;
