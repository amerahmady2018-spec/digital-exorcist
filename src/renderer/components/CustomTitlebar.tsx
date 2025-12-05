import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * CustomTitlebar - Horror-themed frameless window titlebar
 * 
 * Custom styled window controls with cyber-horror aesthetic.
 */

export interface CustomTitlebarProps {
  title?: string;
  className?: string;
  showTitle?: boolean;
}

/**
 * Horror-styled window control button
 */
interface WindowControlProps {
  type: 'close' | 'minimize' | 'maximize';
  onClick: () => void;
  isMaximized?: boolean;
}

const WindowControl: React.FC<WindowControlProps> = ({ type, onClick, isMaximized }) => {
  const configs = {
    close: {
      icon: '✕',
      color: 'text-red-400',
      hoverColor: 'text-red-300',
      hoverShadow: '0 0 10px rgba(248,113,113,0.6)',
      label: 'Close'
    },
    minimize: {
      icon: '─',
      color: 'text-green-400',
      hoverColor: 'text-green-300',
      hoverShadow: '0 0 10px rgba(74,222,128,0.6)',
      label: 'Minimize'
    },
    maximize: {
      icon: isMaximized ? '◱' : '◰',
      color: 'text-green-400',
      hoverColor: 'text-green-300',
      hoverShadow: '0 0 10px rgba(74,222,128,0.6)',
      label: isMaximized ? 'Restore' : 'Maximize'
    }
  };

  const config = configs[type];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.2, textShadow: config.hoverShadow }}
      whileTap={{ scale: 0.9 }}
      className={`
        w-8 h-8 
        flex items-center justify-center
        bg-transparent
        border border-transparent
        hover:border-current
        transition-all duration-200
        font-mono text-lg
        ${config.color}
        hover:${config.hoverColor}
      `}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      aria-label={config.label}
      title={config.label}
    >
      {config.icon}
    </motion.button>
  );
};

const CustomTitlebar = forwardRef<HTMLDivElement, CustomTitlebarProps>(
  ({ title = 'DIGITAL EXORCIST', className = '', showTitle = true }, ref) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isBarHovered, setIsBarHovered] = useState(false);

    // Sync isMaximized state with actual window state
    useEffect(() => {
      const checkMaximized = async () => {
        try {
          const result = await window.electronAPI.windowIsMaximized();
          if (result.isMaximized !== undefined) {
            setIsMaximized(result.isMaximized);
          }
        } catch (error) {
          console.error('Failed to check maximized state:', error);
        }
      };

      // Check on mount
      checkMaximized();

      // Check on window resize
      const handleResize = () => {
        checkMaximized();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMinimize = useCallback(async () => {
      try {
        await window.electronAPI.windowMinimize();
      } catch (error) {
        console.error('Failed to minimize window:', error);
      }
    }, []);

    const handleMaximize = useCallback(async () => {
      console.log('Maximize button clicked, current state:', isMaximized);
      try {
        const result = await window.electronAPI.windowMaximize();
        console.log('Maximize result:', result);
        if (result.isMaximized !== undefined) {
          setIsMaximized(result.isMaximized);
        }
      } catch (error) {
        console.error('Failed to maximize window:', error);
      }
    }, [isMaximized]);

    const handleClose = useCallback(async () => {
      try {
        await window.electronAPI.windowClose();
      } catch (error) {
        console.error('Failed to close window:', error);
      }
    }, []);

    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsBarHovered(true)}
        onMouseLeave={() => setIsBarHovered(false)}
        className={`
          h-10 w-full
          flex items-center justify-between
          px-3
          select-none
          bg-black/40
          backdrop-blur-md
          border-b border-white/10
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Left side - Title (always visible, brighter on hover) */}
        <motion.div 
          className="flex items-center gap-2"
          animate={{ opacity: isBarHovered ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {showTitle && (
            <span className="text-xs font-mono text-purple-400 tracking-[0.3em] uppercase">
              ⟨ {title} ⟩
            </span>
          )}
        </motion.div>

        {/* Right side - Window Controls (only on hover) */}
        <motion.div 
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isBarHovered ? 1 : 0, x: isBarHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <WindowControl type="minimize" onClick={handleMinimize} />
          <WindowControl type="maximize" onClick={handleMaximize} isMaximized={isMaximized} />
          <WindowControl type="close" onClick={handleClose} />
        </motion.div>
      </div>
    );
  }
);

CustomTitlebar.displayName = 'CustomTitlebar';

export default CustomTitlebar;
