import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { isForbiddenPath } from '../../utils/folderValidation';
import bgTexture from '../../../assets/images/bg_texture.png';

import type { ClassifiedFile } from '../../../shared/types';

/**
 * SwiftLocationScreen - Location selection for Swift Purge flow
 */

async function scanLocation(): Promise<ClassifiedFile[]> {
  const result = await window.electronAPI.selectDirectory();
  if (!result?.success || !result.path) return [];
  
  const targetPath = result.path;
  if (isForbiddenPath(targetPath)) {
    throw new Error('Cannot scan system folders');
  }

  const scanResult = await window.electronAPI.startScan(targetPath);
  if (!scanResult?.success || !scanResult.files || scanResult.files.length === 0) return [];

  const classified = await window.electronAPI.classifyFiles(scanResult.files);
  return classified?.files || [];
}

export const SwiftLocationScreen: React.FC = () => {
  const { transition, initializeFlow, updateFlowContext } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleChooseFolder = useCallback(() => {
    setShowWarning(true);
  }, []);

  const confirmAndScan = useCallback(async () => {
    setShowWarning(false);
    setError(null);
    setIsScanning(true);

    try {
      const entities = await scanLocation();
      if (entities.length === 0) {
        setError('No entities found. Try another folder.');
        setIsScanning(false);
        return;
      }
      initializeFlow('swift', entities);
      updateFlowContext({ selectedLocation: 'custom' });
      transition(AppState.SWIFT_RESULTS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed.');
      setIsScanning(false);
    }
  }, [transition, initializeFlow, updateFlowContext]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 relative bg-black">
      <img
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-40 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.95) 100%)',
        }}
      />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-creepster text-green-400 tracking-widest uppercase mb-2">Swift Purge</h1>
          <p className="text-gray-500 font-mono text-sm">Select a folder to scan for entities</p>
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded px-4 py-3 mb-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <motion.button
          onClick={handleChooseFolder}
          disabled={isScanning}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full p-6 rounded-lg border-2 border-orange-500/50 bg-black/60 
                     hover:bg-orange-500/10 hover:border-orange-400 text-center 
                     transition-all duration-200 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >

          <p className="text-orange-400 font-creepster text-xl tracking-wide">Choose Your Folder</p>
          <p className="text-gray-500 font-mono text-xs mt-2">System folders are protected</p>
        </motion.button>
        {isScanning && (
          <div className="text-center mt-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"
            />
            <p className="text-green-400 font-mono text-sm">Scanning for entities...</p>
          </div>
        )}
        <p className="text-center text-gray-600 font-mono text-xs mt-8">[ ESC to return ]</p>
      </div>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border-2 border-orange-500/50 rounded-xl p-6 max-w-sm mx-4"
          >
            <div className="text-center mb-4">

              <h3 className="text-orange-400 font-creepster text-2xl">Warning</h3>
            </div>
            <p className="text-gray-300 text-sm mb-6 text-center leading-relaxed">
              The Digital Exorcist will scan the selected folder recursively. 
              System-critical folders are blocked for your safety.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 py-3 bg-gray-800 border border-gray-600 text-gray-400 rounded-lg 
                           hover:bg-gray-700 hover:text-gray-300 transition-colors font-mono text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndScan}
                className="flex-1 py-3 bg-orange-600/20 border border-orange-500 text-orange-400 rounded-lg 
                           hover:bg-orange-500 hover:text-black transition-colors font-mono text-sm font-bold"
              >
                Proceed
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SwiftLocationScreen;
