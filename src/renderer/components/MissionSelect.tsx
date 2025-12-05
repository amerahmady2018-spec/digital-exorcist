import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassifiedFile } from '../../shared/types';

import iconWarning from '../../assets/images/icon_warning.png';
import { GameIcon } from './ui/GameIcon';

/**
 * MissionSelect - Horror-tech directory selection with enhanced HUD styling
 */

export interface MissionSelectProps {
  onDirectorySelected: (path: string) => void;
  onScanComplete: (files: ClassifiedFile[]) => void;
  className?: string;
}

/**
 * Tech panel with corner brackets and glow
 */
const TechPanel: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  glowColor?: string;
  borderColor?: string;
}> = ({ children, className = '', glowColor = 'rgba(168,85,247,0.3)', borderColor = 'border-purple-500/50' }) => (
  <div className={`relative ${className}`}>
    {/* Glow effect */}
    <div 
      className="absolute inset-0 -z-10 rounded-lg"
      style={{ boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px ${glowColor.replace('0.3', '0.1')}` }}
    />
    
    {/* Main panel */}
    <div className={`relative bg-black/80 border-2 ${borderColor} rounded-lg overflow-hidden backdrop-blur-md`}>
      {/* Scanline texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168,85,247,0.2) 2px, rgba(168,85,247,0.2) 3px)'
      }} />
      
      {/* Corner brackets */}
      <div className="absolute top-1 left-1 w-4 h-4 border-l-2 border-t-2 border-purple-400/60" />
      <div className="absolute top-1 right-1 w-4 h-4 border-r-2 border-t-2 border-purple-400/60" />
      <div className="absolute bottom-1 left-1 w-4 h-4 border-l-2 border-b-2 border-purple-400/60" />
      <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-purple-400/60" />
      
      {/* Corner dots */}
      <motion.div className="absolute top-0 left-0 w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.div className="absolute top-0 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      <motion.div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
      <motion.div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />
      
      {children}
    </div>
  </div>
);

/**
 * Enhanced tech corner for screen frame
 */
const TechCorner: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  const pos = { tl: 'top-3 left-3', tr: 'top-3 right-3', bl: 'bottom-3 left-3', br: 'bottom-3 right-3' };
  const border = { tl: 'border-l-2 border-t-2', tr: 'border-r-2 border-t-2', bl: 'border-l-2 border-b-2', br: 'border-r-2 border-b-2' };
  const dotPos = { tl: { top: '-2px', left: '-2px' }, tr: { top: '-2px', right: '-2px' }, bl: { bottom: '-2px', left: '-2px' }, br: { bottom: '-2px', right: '-2px' } };

  return (
    <div className={`absolute ${pos[position]} w-20 h-20 md:w-24 md:h-24`}>
      <motion.div 
        className={`absolute inset-0 ${border[position]} border-purple-400/60`}
        animate={{ borderColor: ['rgba(192,132,252,0.6)', 'rgba(192,132,252,0.3)', 'rgba(192,132,252,0.6)'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className={`absolute ${border[position]} border-green-500/30`} style={{ top: '4px', left: '4px', right: '4px', bottom: '4px', width: 'calc(100% - 8px)', height: 'calc(100% - 8px)' }} />
      <motion.div className="absolute w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.8)]" style={dotPos[position]} animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
    </div>
  );
};

const GlitchSubtitle: React.FC<{ text: string }> = ({ text }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 100); }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block">
      <span className={glitch ? 'opacity-0' : 'opacity-100'}>{text}</span>
      {glitch && (
        <>
          <span className="absolute inset-0 text-red-500/70" style={{ transform: 'translate(-2px, 0)' }}>{text}</span>
          <span className="absolute inset-0 text-cyan-500/70" style={{ transform: 'translate(2px, 0)' }}>{text}</span>
        </>
      )}
    </div>
  );
};

const PreliminaryReadings: React.FC = () => {
  const readings = [
    { label: 'Dormant files detected', value: '...', color: 'text-green-400' },
    { label: 'Duplicate entities', value: '...', color: 'text-purple-400' },
    { label: 'Oldest entity', value: '...', color: 'text-yellow-400' },
    { label: 'Emotional burden', value: 'UNKNOWN', color: 'text-red-400' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-5">
      <div className="flex items-center gap-2 mb-3 px-1">
        <motion.div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
        <span className="text-purple-400/80 font-mono text-[10px] tracking-[0.2em] uppercase">Preliminary Readings</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {readings.map((r, i) => (
          <TechPanel key={r.label} glowColor="rgba(168,85,247,0.15)" borderColor="border-purple-500/30">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.1 }} className="p-3">
              <p className="text-purple-500/50 font-mono text-[9px] uppercase mb-1">{r.label}</p>
              <p className={`font-mono text-sm font-bold ${r.color}`}>{r.value}</p>
            </motion.div>
          </TechPanel>
        ))}
      </div>
      <p className="text-purple-500/30 font-mono text-[9px] mt-3 text-center italic">Select a location to begin deep analysis...</p>
    </motion.div>
  );
};

const ScanProgress: React.FC<{ filesScanned: number; currentPath: string; isScanning: boolean }> = ({ filesScanned, currentPath, isScanning }) => {
  if (!isScanning) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-5">
      <TechPanel glowColor="rgba(239,68,68,0.3)" borderColor="border-red-500/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
              <span className="text-red-400 font-mono text-xs tracking-wider uppercase">Probing Infested Zone</span>
            </div>
            <motion.span className="text-red-500/80 font-mono text-[10px]" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>⚠ DANGER</motion.span>
          </div>
          <div className="relative h-2 bg-black/60 rounded-full overflow-hidden mb-4 border border-red-500/30">
            <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-purple-500 to-red-600" animate={{ width: ['0%', '100%'], x: ['-100%', '0%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-black/40 rounded border border-red-500/20">
              <p className="text-red-500/60 font-mono text-[9px] uppercase mb-1">Entities Found</p>
              <motion.p key={filesScanned} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-xl font-mono font-bold text-red-400">{filesScanned.toLocaleString()}</motion.p>
            </div>
            <div className="p-2 bg-black/40 rounded border border-purple-500/20">
              <p className="text-purple-500/60 font-mono text-[9px] uppercase mb-1">Corruption</p>
              <motion.p animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-xl font-mono font-bold text-purple-400">RISING</motion.p>
            </div>
          </div>
          {currentPath && (
            <div className="mt-3 p-2 bg-black/40 rounded border border-red-500/10">
              <p className="text-red-500/40 font-mono text-[8px] uppercase mb-1">Current Sector</p>
              <p className="text-red-400/60 font-mono text-[10px] truncate">{currentPath}</p>
            </div>
          )}
        </div>
      </TechPanel>
    </motion.div>
  );
};

const MissionSelect = forwardRef<HTMLDivElement, MissionSelectProps>(
  ({ onDirectorySelected, onScanComplete, className = '' }, ref) => {
    const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanProgress, setScanProgress] = useState({ filesScanned: 0, currentPath: '' });
    const [buttonFlicker, setButtonFlicker] = useState(false);

    useEffect(() => {
      if (!isScanning) return;
      const cleanup = window.electronAPI.onScanProgress((progress) => setScanProgress(progress));
      return cleanup;
    }, [isScanning]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (Math.random() > 0.85) { setButtonFlicker(true); setTimeout(() => setButtonFlicker(false), 50); }
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    const handleSelectDirectory = useCallback(async () => {
      setError(null);
      setIsValidating(true);
      try {
        const result = await window.electronAPI.selectDirectory();
        if (result.success && result.path) {
          setSelectedDirectory(result.path);
          onDirectorySelected(result.path);
          setIsScanning(true);
          setScanProgress({ filesScanned: 0, currentPath: '' });
          const scanResult = await window.electronAPI.startScan(result.path);
          if (scanResult.success && scanResult.files) {
            const classifyResult = await window.electronAPI.classifyFiles(scanResult.files);
            if (classifyResult.success && classifyResult.files) onScanComplete(classifyResult.files);
            else setError(classifyResult.error || 'Ritual interrupted');
          } else setError(scanResult.error || 'The spirits resist');
        } else if (result.error) setError(result.error);
      } catch (err) { setError(err instanceof Error ? err.message : 'Unknown disturbance'); }
      finally { setIsValidating(false); setIsScanning(false); }
    }, [onDirectorySelected, onScanComplete]);

    const handleCancelScan = useCallback(async () => {
      try { await window.electronAPI.cancelScan(); setIsScanning(false); setScanProgress({ filesScanned: 0, currentPath: '' }); }
      catch (err) { console.error('Failed to abort:', err); }
    }, []);

    return (
      <div ref={ref} className={`flex flex-col items-center justify-center h-screen w-screen bg-black relative overflow-hidden ${className}`}>
        {/* === BACKGROUND LAYERS === */}
        
        {/* Hex grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 15v30l-30 15L0 45V15z' fill='none' stroke='%23a855f7' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Grid overlay */}
        <motion.div className="absolute inset-0 opacity-[0.05] pointer-events-none z-[1]" animate={{ opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 5, repeat: Infinity }} style={{
          backgroundImage: 'linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)',
          backgroundSize: '35px 35px'
        }} />

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-[2]" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168,85,247,0.15) 2px, rgba(168,85,247,0.15) 3px)'
        }} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-[3]" style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%)'
        }} />

        {/* Tech diagram decorations */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-[1]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="0.1" strokeDasharray="2 2" />
          <line x1="20" y1="50" x2="80" y2="50" stroke="rgba(168,85,247,0.2)" strokeWidth="0.1" />
          <line x1="50" y1="20" x2="50" y2="80" stroke="rgba(168,85,247,0.2)" strokeWidth="0.1" />
        </svg>

        {/* === TECH FRAME === */}
        <TechCorner position="tl" />
        <TechCorner position="tr" />
        <TechCorner position="bl" />
        <TechCorner position="br" />

        {/* Top/Bottom tech lines */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[40%] max-w-xs">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <motion.p className="text-center text-[8px] font-mono text-purple-500/40 mt-1 tracking-widest" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }}>
            // TACTICAL INTERFACE //
          </motion.p>
        </div>

        {/* === MAIN CONTENT === */}
        <div className="relative z-10 w-full max-w-xl px-4">
          {/* Status bar */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <TechPanel glowColor="rgba(239,68,68,0.2)" borderColor="border-red-500/40">
              <div className="px-4 py-2 flex items-center justify-between">
                <motion.div className="flex items-center gap-2" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]" />
                  <span className="text-red-400/90 font-mono text-[10px] tracking-wider uppercase">Entity Activity Detected</span>
                </motion.div>
                <motion.span className="text-purple-400/70 font-mono text-[10px]" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity }}>SYS.UNSTABLE</motion.span>
              </div>
            </TechPanel>
          </motion.div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-6">
            <TechPanel glowColor="rgba(168,85,247,0.25)" borderColor="border-purple-500/50">
              <div className="py-5 px-6">
                <motion.h1 
                  className="text-4xl md:text-5xl font-creepster text-white tracking-wider mb-2"
                  animate={{ textShadow: ['0 0 20px rgba(168,85,247,0.5)', '0 0 40px rgba(168,85,247,0.8)', '0 0 20px rgba(168,85,247,0.5)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  MISSION SELECT
                </motion.h1>
                <div className="text-red-400/80 font-mono text-xs tracking-[0.15em] uppercase">
                  <GlitchSubtitle text="⚠ HOST SYSTEM SHOWING SIGNS OF CORRUPTION ⚠" />
                </div>
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4 }} className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-3 mx-auto w-64" />
              </div>
            </TechPanel>
          </motion.div>

          {/* Main panel */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <TechPanel glowColor="rgba(168,85,247,0.2)" borderColor="border-purple-500/40">
              <div className="p-5">
                <p className="text-purple-300/60 font-mono text-xs mb-4 text-center">Select a haunted location for analysis:</p>

                {/* Main button */}
                <motion.button
                  onClick={handleSelectDirectory}
                  disabled={isScanning || isValidating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full py-4 px-6 border-2 border-green-500 text-green-400 font-creepster text-xl md:text-2xl tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  style={{
                    opacity: buttonFlicker ? 0.7 : 1,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
                    clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)',
                    boxShadow: '0 0 30px rgba(34,197,94,0.4), inset 0 0 20px rgba(34,197,94,0.1)'
                  }}
                >
                  {/* Button texture */}
                  <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.3) 2px, rgba(34,197,94,0.3) 3px)' }} />
                  <div className="absolute top-1 left-1 w-3 h-3 border-l border-t border-green-400/50" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-green-400/50" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-green-400/50" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-green-400/50" />
                  
                  {isValidating ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                      Establishing Connection...
                    </span>
                  ) : isScanning ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      Probing Infestation...
                    </span>
                  ) : (
                    <motion.span animate={{ textShadow: ['0 0 8px rgba(34,197,94,0.6)', '0 0 15px rgba(34,197,94,1)', '0 0 8px rgba(34,197,94,0.6)'] }} transition={{ duration: 2, repeat: Infinity }}>
                      [ ENTER INFESTED ZONE ]
                    </motion.span>
                  )}
                </motion.button>

                {/* Selected directory */}
                <AnimatePresence>
                  {selectedDirectory && !error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                      <TechPanel glowColor="rgba(168,85,247,0.15)" borderColor="border-purple-500/30">
                        <div className="p-3">
                          <p className="text-purple-500/60 font-mono text-[9px] uppercase mb-1">Location Locked</p>
                          <p className="text-purple-300 font-mono text-xs break-all">{selectedDirectory}</p>
                        </div>
                      </TechPanel>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4">
                      <TechPanel glowColor="rgba(239,68,68,0.3)" borderColor="border-red-500/50">
                        <div className="p-3 flex items-start gap-3">
                          <GameIcon src={iconWarning} size="sm" glow glowColor="rgba(239,68,68,0.8)" />
                          <div>
                            <p className="text-red-400 font-mono text-xs font-bold">Ritual Disrupted</p>
                            <p className="text-red-300/70 font-mono text-[10px] mt-1">{error}</p>
                          </div>
                        </div>
                      </TechPanel>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cancel */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCancelScan}
                      className="w-full mt-4 py-2 px-4 bg-red-900/30 border border-red-500/50 text-red-400 font-mono text-xs uppercase rounded hover:bg-red-900/50 transition-colors">
                      [ ABORT RITUAL ]
                    </motion.button>
                  )}
                </AnimatePresence>

                {!isScanning && !selectedDirectory && <PreliminaryReadings />}
              </div>
            </TechPanel>
          </motion.div>

          <ScanProgress filesScanned={scanProgress.filesScanned} currentPath={scanProgress.currentPath} isScanning={isScanning} />

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ delay: 1, duration: 3, repeat: Infinity }} className="text-center text-purple-500/40 font-mono text-[10px] mt-6">
            Cancel exorcism [ESC]
          </motion.p>
        </div>
      </div>
    );
  }
);

MissionSelect.displayName = 'MissionSelect';

export default MissionSelect;
