import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, AppState } from '../../store/appStore';
import { SafetyInfoPanel } from './SafetyInfoPanel';
import { ALLOWED_LOCATIONS, isForbiddenPath } from '../../utils/folderValidation';
import {
  countEntities,
  formatFileSize,
  calculateSpaceRecovered,
  hasUnknownRisk,
} from '../../utils/entityUtils';
import bgTexture from '../../../assets/images/bg_texture.png';
import type { ClassifiedFile } from '../../../shared/types';

/**
 * ConfrontationPreviewScreen - Preview screen for Confrontation flow
 * Compact layout - NO SCROLLBARS
 */

export const ConfrontationPreviewScreen: React.FC = () => {
  const { transition, initializeFlow, updateFlowContext } = useAppStore();
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);
  const [entities, setEntities] = useState<ClassifiedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectLocation = async (locationId: string) => {
    setError(null);
    setSelectedLocation(locationId);
    setIsLoading(true);

    try {
      let targetPath: string;

      if (locationId === 'custom') {
        const result = await window.electronAPI.selectDirectory();
        if (!result?.success || !result.path) {
          setIsLoading(false);
          setSelectedLocation(null);
          return;
        }
        targetPath = result.path;

        if (isForbiddenPath(targetPath)) {
          throw new Error('Cannot scan system folders');
        }
      } else {
        targetPath = locationId;
      }

      const scanResult = await window.electronAPI.startScan(targetPath);

      if (!scanResult?.success || !scanResult.files || scanResult.files.length === 0) {
        setError('No files found in this location.');
        setIsLoading(false);
        setSelectedLocation(null);
        return;
      }

      const classified = await window.electronAPI.classifyFiles(scanResult.files);
      setEntities(classified?.files || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Scan failed:', err);
      setError(err instanceof Error ? err.message : 'Scan failed');
      setIsLoading(false);
      setSelectedLocation(null);
    }
  };

  const counts = countEntities(entities);
  const totalSpace = calculateSpaceRecovered(entities);
  const unknownRisk = hasUnknownRisk(entities);
  const locations = Object.values(ALLOWED_LOCATIONS);

  const handleBeginConfrontation = () => {
    initializeFlow('confrontation', entities);
    updateFlowContext({ selectedLocation });
    transition(AppState.CONFRONTATION_LOOP);
  };

  const handleBack = () => {
    transition(AppState.EXORCISM_STYLE);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 relative bg-black">
      {/* Background */}
      <img
        src={bgTexture}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-40 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.98) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleBack}
          className="absolute -top-10 left-0 text-gray-400 hover:text-white font-mono text-xs flex items-center gap-1"
        >
          ← Back
        </motion.button>

        {/* Main Card */}
        <div className="bg-black/85 border-2 border-red-500/40 rounded-xl p-5 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-3">
            <span className="text-3xl">⚔️</span>
            <h1 className="text-xl font-bold tracking-widest uppercase">
              <span className="text-red-400">CONFRON</span>
              <span className="text-purple-400">TATION</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs">Face them. One by one.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded px-3 py-2 mb-3 text-center">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-3xl mb-2"
              >
                🔮
              </motion.div>
              <p className="text-red-400 font-mono text-sm">Scanning...</p>
            </div>
          ) : entities.length === 0 ? (
            /* Location Selection - Compact Grid */
            <div>
              <p className="text-gray-400 text-xs text-center mb-2">Select location:</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc.id)}
                    className="p-2 rounded border border-red-500/30 bg-black/40 hover:bg-red-500/10 text-center"
                  >
                    <span className="text-lg">{loc.icon}</span>
                    <p className="text-red-400 font-bold text-xs">{loc.label}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleSelectLocation('custom')}
                className="w-full p-2 rounded border border-orange-500/30 bg-black/40 hover:bg-orange-500/10 text-center"
              >
                <span>📁</span>
                <span className="text-orange-400 font-bold text-xs ml-1">Custom</span>
              </button>
            </div>
          ) : (
            <>
              {/* Entity Stats - Compact */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-1 text-center">
                  <span className="text-sm">👻</span>
                  <p className="text-blue-400 font-bold text-sm">{counts.ghosts}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-1 text-center">
                  <span className="text-sm">🧟</span>
                  <p className="text-green-400 font-bold text-sm">{counts.zombies}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded p-1 text-center">
                  <span className="text-sm">👹</span>
                  <p className="text-red-400 font-bold text-sm">{counts.demons}</p>
                </div>
                <div className="bg-gray-500/10 border border-gray-500/30 rounded p-1 text-center">
                  <span className="text-sm">{unknownRisk ? '⚠️' : '❓'}</span>
                  <p className="text-gray-400 font-bold text-sm">{counts.unknown}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-black/50 rounded p-2 text-center">
                  <p className="text-gray-500 text-xs">Total</p>
                  <p className="text-white font-bold">{entities.length}</p>
                </div>
                <div className="flex-1 bg-black/50 rounded p-2 text-center">
                  <p className="text-gray-500 text-xs">Space</p>
                  <p className="text-purple-400 font-bold">{formatFileSize(totalSpace)}</p>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handleBeginConfrontation}
                className="w-full py-2 bg-red-500/20 border-2 border-red-500/50 text-red-400 font-bold uppercase text-sm rounded hover:bg-red-500/30 mb-2"
              >
                Begin Confrontation
              </button>
              <button
                onClick={() => setShowSafetyInfo(true)}
                className="w-full py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded hover:bg-green-500/20"
              >
                Safety Info
              </button>
            </>
          )}
        </div>

        {/* ESC hint */}
        <p className="text-center text-gray-600 font-mono text-xs mt-3">[ ESC to return ]</p>
      </div>

      <SafetyInfoPanel isOpen={showSafetyInfo} onClose={() => setShowSafetyInfo(false)} />
    </div>
  );
};

export default ConfrontationPreviewScreen;
