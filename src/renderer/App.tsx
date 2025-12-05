import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore, AppState } from './store/appStore';
import StateTransition from './components/StateTransition';
import TitleScreen from './components/TitleScreen';
import ExorcismStyleScreen from './components/ExorcismStyleScreen';
import MissionSelect from './components/MissionSelect';
import EnhancedHUD from './components/EnhancedHUD';
import { CockpitArena } from './components/CockpitArena';
import { UndoToast } from './components/UndoToast';
import { GraveyardView } from './components/GraveyardView';
import { HistoryLog } from './components/HistoryLog';
import { WhitelistManager } from './components/WhitelistManager';
import CustomTitlebar from './components/CustomTitlebar';
import TutorialOverlay from './components/TutorialOverlay';
import LevelUpOverlay from './components/LevelUpOverlay';
import XPFloatingText from './components/XPFloatingText';
import MusicToggle, { type MusicToggleTheme } from './components/MusicToggle';
import StoryMode, { StoryModeHandle } from './components/StoryMode';
import { useKeyboardControls, KeyBinding } from './hooks/useKeyboardControls';
import { useVisualFeedback } from './hooks/useVisualFeedback';
import { storyEntityToClassifiedFile } from './utils/storyBattleAdapter';
import type { ClassifiedFile, MonsterType } from '../shared/types';
import type { StoryEntity } from './data/storyEntities';

// Exorcism Style Flow Screens
import { GuidedPreviewScreen } from './components/flows/GuidedPreviewScreen';
import { GuidedActiveScreen } from './components/flows/GuidedActiveScreen';
import { GuidedSummaryScreen } from './components/flows/GuidedSummaryScreen';
import { SwiftLocationScreen } from './components/flows/SwiftLocationScreen';
import { SwiftResultsScreen } from './components/flows/SwiftResultsScreen';
import { SwiftSummaryScreen } from './components/flows/SwiftSummaryScreen';
import { ConfrontationPreviewScreen } from './components/flows/ConfrontationPreviewScreen';
import { ConfrontationLoopScreen } from './components/flows/ConfrontationLoopScreen';
import { ConfrontationSummaryScreen } from './components/flows/ConfrontationSummaryScreen';
// Swift Purge Tool Mode (Redesigned)
import { SwiftPurgeTargetScreen } from './components/flows/SwiftPurgeTargetScreen';
import { SwiftPurgePreviewScreen } from './components/flows/SwiftPurgePreviewScreen';
import { SwiftPurgeExecutingScreen } from './components/flows/SwiftPurgeExecutingScreen';
import { SwiftPurgeResultScreen } from './components/flows/SwiftPurgeResultScreen';
// Interactive Mode Flow
import { InteractiveIntroScreen } from './components/flows/InteractiveIntroScreen';
import { InteractiveTargetScreen } from './components/flows/InteractiveTargetScreen';
import { InteractiveScanningScreen } from './components/flows/InteractiveScanningScreen';
import { InteractiveGroupResolutionScreen } from './components/flows/InteractiveGroupResolutionScreen';
import { InteractiveGroupBattleScreen } from './components/flows/InteractiveGroupBattleScreen';
import { InteractiveSingleFileScreen } from './components/flows/InteractiveSingleFileScreen';
import { InteractiveSingleBattleScreen } from './components/flows/InteractiveSingleBattleScreen';
import { InteractiveExecutingScreen } from './components/flows/InteractiveExecutingScreen';
import { InteractiveSummaryScreen } from './components/flows/InteractiveSummaryScreen';

// Import custom navigation icons
import dashboardIcon from '../assets/images/dashboard.png';
import graveyardIcon from '../assets/images/graveyard.png';
import whitelistIcon from '../assets/images/whitelist.png';
import historyIcon from '../assets/images/history.png';
import bgTexture from '../assets/images/bg_texture.png';

// Import GameIcon component
import { GameIcon } from './components/ui/GameIcon';

/**
 * GlobalScreenFrame - Renders corner frame decorations consistently across all screens
 * Positioned at fixed viewport corners, above backgrounds but below interactive content
 */
const GlobalScreenFrame: React.FC = () => {
  // Inset values matching the original TitleScreen design
  // Top corners sit below the titlebar area, bottom corners have matching margin
  const corners = [
    { pos: 'top-12 left-8', border: 'border-l-2 border-t-2' },
    { pos: 'top-12 right-8', border: 'border-r-2 border-t-2' },
    { pos: 'bottom-8 left-8', border: 'border-l-2 border-b-2' },
    { pos: 'bottom-8 right-8', border: 'border-r-2 border-b-2' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[45]">
      {corners.map((corner, i) => (
        <div key={i} className={`absolute ${corner.pos} w-12 h-12 md:w-16 md:h-16`}>
          <div className={`absolute inset-0 ${corner.border} border-green-400/50`} />
          <div 
            className={`absolute ${corner.border} border-purple-500/35`} 
            style={{ top: '3px', left: '3px', right: '3px', bottom: '3px' }} 
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Premium Exorcist App - State Machine Driven Application
 * 
 * Implements the cinematic flow: INTRO → MISSION_SELECT → HUD → BATTLE_ARENA
 * with integrated visual effects, keyboard controls, and undo system.
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 19.1, 19.2
 */

// Undo toast state interface
interface UndoToastState {
  undoId: string;
  fileName: string;
  filePath: string;
}

// HUD sub-view modes
type HUDViewMode = 'exorcism' | 'graveyard' | 'history' | 'whitelist';

function App() {
  // State machine from Zustand store
  const { state, context, transition, updateContext, currentAnimation, completeTransition, addXP } = useAppStore();
  
  // Visual feedback coordinator (Requirements: 19.1, 19.2)
  const { triggerPreset } = useVisualFeedback();
  
  // Undo toast state (Requirements: 13.1, 13.2, 13.3, 13.4, 13.5)
  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);
  
  // HUD sub-view mode
  const [hudViewMode, setHudViewMode] = useState<HUDViewMode>('exorcism');
  
  // Tutorial completion state (used for conditional rendering)
  const [, setTutorialComplete] = useState(false);

  // Story Mode state - tracks current battle entity from story mode
  const [storyBattleEntity, setStoryBattleEntity] = useState<ClassifiedFile | null>(null);
  const [storyBattleEntityId, setStoryBattleEntityId] = useState<string | null>(null);
  const storyModeRef = useRef<StoryModeHandle>(null);

  // Apply body class for title screen to prevent scrolling
  useEffect(() => {
    if (state === AppState.INTRO) {
      document.body.classList.add('title-screen');
    } else {
      document.body.classList.remove('title-screen');
    }
    return () => {
      document.body.classList.remove('title-screen');
    };
  }, [state]);

  // Handle title screen initialization - transition to EXORCISM_STYLE (Requirements: 3.4, 14.2)
  const handleInitialize = useCallback(() => {
    triggerPreset('click');
    transition(AppState.EXORCISM_STYLE);
  }, [transition, triggerPreset]);

  // Handle directory selection in MISSION_SELECT
  const handleDirectorySelected = useCallback((path: string) => {
    updateContext({ selectedDirectory: path, isScanning: true });
  }, [updateContext]);

  // Handle scan completion - transition to HUD (Requirements: 4.5, 14.2)
  const handleScanComplete = useCallback((files: ClassifiedFile[]) => {
    updateContext({ classifiedFiles: files, isScanning: false });
    transition(AppState.HUD, { classifiedFiles: files });
  }, [transition, updateContext]);

  // Handle entity card click - transition to BATTLE_ARENA (Requirements: 6.1, 14.4)
  const handleEntityClick = useCallback((file: ClassifiedFile) => {
    triggerPreset('click');
    transition(AppState.BATTLE_ARENA, { currentBattleFile: file });
  }, [transition, triggerPreset]);


  // Handle banish operation with undo support and XP gain
  const handleBanish = useCallback(async (filePath: string, classifications?: MonsterType[], fileSize?: number) => {
    try {
      const result = await window.electronAPI.banishFile(filePath, classifications, fileSize);
      
      if (result.success) {
        console.log(`File banished: ${filePath}`);
        
        // Remove from classified files in context
        const updatedFiles = context.classifiedFiles?.filter(f => f.path !== filePath) || [];
        updateContext({ classifiedFiles: updatedFiles });
        
        // Award XP based on file size (10 XP per MB)
        if (fileSize && fileSize > 0) {
          const { xpGained, leveledUp } = addXP(fileSize);
          console.log(`XP gained: ${xpGained}, Level up: ${leveledUp}`);
        }
        
        // Show undo toast if undo ID is available (Requirements: 13.1)
        if (result.undoId) {
          const fileName = filePath.split(/[/\\]/).pop() || filePath;
          setUndoToast({
            undoId: result.undoId,
            fileName,
            filePath
          });
        }
        
        // Trigger victory visual effects (Requirements: 19.1, 19.2)
        triggerPreset('victory');
      } else {
        console.error('Banish failed:', result.error);
        alert(`Failed to banish file: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to banish file:', error);
      alert(`Failed to banish file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [context.classifiedFiles, updateContext, triggerPreset, addXP]);

  // Handle victory in battle - banish file and return to HUD (Requirements: 11.3, 11.4, 14.3)
  const handleVictory = useCallback(async (filePath: string, classifications?: MonsterType[], fileSize?: number) => {
    await handleBanish(filePath, classifications, fileSize);
    transition(AppState.HUD);
  }, [handleBanish, transition]);

  // Handle defeat in battle - return to HUD without banishing
  const handleDefeat = useCallback(() => {
    transition(AppState.HUD);
  }, [transition]);

  // Handle flee from battle - return to HUD (Requirements: 8.4, 14.3)
  const handleFlee = useCallback(() => {
    transition(AppState.HUD);
  }, [transition]);

  // Story Mode handlers
  const handleStoryModeExit = useCallback(() => {
    setStoryBattleEntity(null);
    transition(AppState.EXORCISM_STYLE);
  }, [transition]);

  const handleStoryStartBattle = useCallback((entity: StoryEntity) => {
    // Convert story entity to ClassifiedFile for BattleArena
    const classifiedFile = storyEntityToClassifiedFile(entity);
    setStoryBattleEntity(classifiedFile);
    // Store the entity ID for battle result tracking
    setStoryBattleEntityId(entity.id);
    transition(AppState.STORY_BATTLE);
  }, [transition]);

  // Story battle victory - no real file deletion, just record result
  const handleStoryVictory = useCallback(() => {
    triggerPreset('victory');
    const entityId = storyBattleEntityId;
    console.log('[StoryBattle] Victory - entityId:', entityId);
    
    // Clear battle state first
    setStoryBattleEntity(null);
    setStoryBattleEntityId(null);
    
    // Transition back to story mode immediately
    transition(AppState.STORY_MODE);
    
    // Then record the battle result (after transition so StoryMode is visible)
    setTimeout(() => {
      if (entityId && storyModeRef.current) {
        console.log('[StoryBattle] Recording victory result for:', entityId);
        storyModeRef.current.handleBattleResult('banished', entityId);
      }
    }, 100);
  }, [transition, triggerPreset, storyBattleEntityId]);

  // Story battle defeat - record result and continue
  const handleStoryDefeat = useCallback(() => {
    const entityId = storyBattleEntityId;
    console.log('[StoryBattle] Defeat - entityId:', entityId);
    
    // Clear battle state first
    setStoryBattleEntity(null);
    setStoryBattleEntityId(null);
    
    // Transition back to story mode immediately
    transition(AppState.STORY_MODE);
    
    // Then record the battle result
    setTimeout(() => {
      if (entityId && storyModeRef.current) {
        console.log('[StoryBattle] Recording defeat result for:', entityId);
        storyModeRef.current.handleBattleResult('survived', entityId);
      }
    }, 100);
  }, [transition, storyBattleEntityId]);

  // Story battle flee - treat as skip, go back to overview
  const handleStoryFlee = useCallback(() => {
    const entityId = storyBattleEntityId;
    console.log('[StoryBattle] Flee - entityId:', entityId);
    
    // Clear battle state first
    setStoryBattleEntity(null);
    setStoryBattleEntityId(null);
    
    // Transition back to story mode immediately
    transition(AppState.STORY_MODE);
    
    // Then record the battle result
    setTimeout(() => {
      if (entityId && storyModeRef.current) {
        console.log('[StoryBattle] Recording flee result for:', entityId);
        storyModeRef.current.handleBattleResult('skipped', entityId);
      }
    }, 100);
  }, [transition, storyBattleEntityId]);

  // Handle undo from the undo toast (Requirements: 13.3)
  const handleUndo = useCallback(async (undoId: string) => {
    try {
      const result = await window.electronAPI.undoBanish(undoId);
      
      if (result.success && result.restoredPath) {
        console.log(`File restored: ${result.restoredPath}`);
        // Note: User would need to re-scan to see the restored file
      } else {
        console.error('Undo failed:', result.error);
        alert(`Failed to undo: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to undo banish:', error);
      alert(`Failed to undo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Handle undo toast dismiss (Requirements: 13.5)
  const handleUndoToastDismiss = useCallback(() => {
    setUndoToast(null);
  }, []);

  // Handle file restore from graveyard
  const handleRestore = useCallback(async (graveyardPath: string, originalPath: string) => {
    try {
      const result = await window.electronAPI.restoreFile(graveyardPath, originalPath);
      
      if (result.success) {
        console.log(`File restored: ${originalPath}`);
        alert(`File successfully restored to:\n${result.restoredPath}`);
      } else {
        console.error('Restore failed:', result.error);
        
        if (result.error?.includes('Conflict')) {
          const userChoice = window.confirm(
            `${result.error}\n\nWould you like to choose a different location or rename the file?`
          );
          
          if (userChoice) {
            alert('Please manually move the file or rename it in the graveyard, then try again.');
          }
        } else {
          alert(`Failed to restore file: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to restore file:', error);
      alert(`Failed to restore file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Keyboard bindings for global navigation (Requirements: 12.2, 12.3, 12.5)
  const globalKeyBindings: KeyBinding[] = [
    {
      key: 'Enter',
      action: () => {
        if (state === AppState.INTRO) {
          handleInitialize();
        }
      },
      context: AppState.INTRO,
      preventDefault: true,
      description: 'Initialize system'
    },
    {
      key: 'Escape',
      action: () => {
        // Exorcism Style flows - return to HQ
        if (state === AppState.EXORCISM_STYLE) {
          transition(AppState.INTRO);
        } else if (
          state === AppState.GUIDED_PREVIEW ||
          state === AppState.SWIFT_LOCATION ||
          state === AppState.CONFRONTATION_PREVIEW ||
          state === AppState.GUIDED_SUMMARY ||
          state === AppState.SWIFT_SUMMARY ||
          state === AppState.CONFRONTATION_SUMMARY ||
          state === AppState.SWIFT_PURGE_TARGET ||
          state === AppState.SWIFT_PURGE_RESULT
        ) {
          transition(AppState.EXORCISM_STYLE);
        } else if (state === AppState.GUIDED_ACTIVE) {
          transition(AppState.GUIDED_PREVIEW);
        } else if (state === AppState.SWIFT_RESULTS) {
          transition(AppState.SWIFT_LOCATION);
        } else if (state === AppState.CONFRONTATION_LOOP) {
          transition(AppState.CONFRONTATION_PREVIEW);
        }
        // Swift Purge Tool Mode navigation
        else if (state === AppState.SWIFT_PURGE_PREVIEW) {
          transition(AppState.SWIFT_PURGE_TARGET);
        }
        // Note: SWIFT_PURGE_EXECUTING should not allow ESC - operation in progress
        // Interactive Mode navigation
        else if (state === AppState.INTERACTIVE_INTRO || state === AppState.INTERACTIVE_SUMMARY) {
          transition(AppState.EXORCISM_STYLE);
        } else if (state === AppState.INTERACTIVE_TARGET) {
          transition(AppState.INTERACTIVE_INTRO);
        } else if (state === AppState.INTERACTIVE_SCANNING || state === AppState.INTERACTIVE_GROUP_RESOLUTION) {
          transition(AppState.INTERACTIVE_TARGET);
        } else if (state === AppState.INTERACTIVE_SINGLE_FILE) {
          transition(AppState.INTERACTIVE_TARGET);
        } else if (state === AppState.INTERACTIVE_GROUP_BATTLE) {
          transition(AppState.INTERACTIVE_GROUP_RESOLUTION);
        } else if (state === AppState.INTERACTIVE_SINGLE_BATTLE) {
          transition(AppState.INTERACTIVE_SINGLE_FILE);
        }
        // Note: INTERACTIVE_EXECUTING should not allow ESC - operation in progress
        // Legacy navigation
        else if (state === AppState.MISSION_SELECT) {
          transition(AppState.INTRO);
        } else if (state === AppState.HUD) {
          transition(AppState.MISSION_SELECT);
        }
        // BATTLE_ARENA ESC is handled in BattleArena component
      },
      context: 'global',
      preventDefault: true,
      description: 'Go back / Cancel'
    }
  ];

  useKeyboardControls(globalKeyBindings);

  // Complete transition animation callback
  const handleAnimationComplete = useCallback(() => {
    completeTransition();
  }, [completeTransition]);

  // Handle tutorial completion
  const handleTutorialComplete = useCallback(() => {
    setTutorialComplete(true);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-gray-100 overflow-hidden">
      {/* Custom Titlebar - Frameless window controls */}
      <CustomTitlebar 
        className="fixed top-0 left-0 right-0 z-[60]" 
        showTitle={state !== AppState.INTRO}
      />
      
      {/* ATMOSPHERIC FOG TEXTURE - Static to prevent fullscreen glitches */}
      <img 
        src={bgTexture}
        alt=""
        className="fixed inset-0 z-0 w-full h-full object-cover opacity-60 pointer-events-none"
        style={{ 
          mixBlendMode: 'overlay'
        }}
        draggable={false}
      />
      
      {/* Secondary fog layer for depth - static */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none opacity-15"
        style={{
          backgroundImage: `url(${bgTexture})`,
          backgroundSize: '150%',
          backgroundPosition: 'center',
          mixBlendMode: 'soft-light'
        }}
      />
      
      {/* CRT Overlay removed - caused fullscreen glitches */}
      
      {/* Tutorial Overlay - First launch only */}
      <TutorialOverlay onComplete={handleTutorialComplete} />
      
      {/* Level Up Overlay - Full screen celebration */}
      <LevelUpOverlay />
      
      {/* XP Floating Text - Shows +XP on banish */}
      <XPFloatingText />
      
      {/* Music Toggle - Global background music control
          - Green: title screens, scanning, mission select, story mode
          - Red: battles + all interactive mode screens
          - Purple: default/HQ screens
          - Entity colors handled via story-mode-theme event from detail screens */}
      <MusicToggle 
        theme={
          // All Interactive Mode = red
          state === AppState.INTERACTIVE_INTRO ? 'red' :
          state === AppState.INTERACTIVE_TARGET ? 'red' :
          state === AppState.INTERACTIVE_SCANNING ? 'red' :
          state === AppState.INTERACTIVE_GROUP_RESOLUTION ? 'red' :
          state === AppState.INTERACTIVE_GROUP_BATTLE ? 'red' :
          state === AppState.INTERACTIVE_SINGLE_FILE ? 'red' :
          state === AppState.INTERACTIVE_SINGLE_BATTLE ? 'red' :
          state === AppState.INTERACTIVE_EXECUTING ? 'red' :
          state === AppState.INTERACTIVE_SUMMARY ? 'red' :
          // Other battles = red
          state === AppState.BATTLE_ARENA ? 'red' :
          state === AppState.STORY_BATTLE ? 'red' :
          // Green title/scanning states
          state === AppState.INTRO ? 'green' :
          state === AppState.MISSION_SELECT ? 'green' :
          state === AppState.STORY_MODE ? 'green' :
          state === AppState.SWIFT_PURGE_PREVIEW ? 'green' :
          state === AppState.SWIFT_PURGE_EXECUTING ? 'green' :
          // Default purple for HQ/menu screens
          'purple'
        }
      />

      {/* Global Screen Frame - Corner decorations visible on all screens */}
      <GlobalScreenFrame />

      {/* State Machine Driven Content - with top padding for titlebar, transparent bg, above fog */}
      <StateTransition
        stateKey={state}
        animation={currentAnimation}
        onAnimationComplete={handleAnimationComplete}
        className="pt-8 relative z-10 bg-transparent"
      >
        {/* INTRO State - Title Screen (Requirements: 3.1, 3.2, 3.3, 14.1) */}
        {state === AppState.INTRO && (
          <TitleScreen onInitialize={handleInitialize} />
        )}

        {/* EXORCISM_STYLE State - Style Selection HQ */}
        {state === AppState.EXORCISM_STYLE && (
          <ExorcismStyleScreen />
        )}

        {/* GUIDED_PREVIEW State - Guided Ritual Preview */}
        {state === AppState.GUIDED_PREVIEW && (
          <GuidedPreviewScreen />
        )}

        {/* GUIDED_ACTIVE State - Guided Ritual Active Encounter */}
        {state === AppState.GUIDED_ACTIVE && (
          <GuidedActiveScreen />
        )}

        {/* GUIDED_SUMMARY State - Guided Ritual Summary */}
        {state === AppState.GUIDED_SUMMARY && (
          <GuidedSummaryScreen />
        )}

        {/* SWIFT_LOCATION State - Swift Purge Location Selection */}
        {state === AppState.SWIFT_LOCATION && (
          <SwiftLocationScreen />
        )}

        {/* SWIFT_RESULTS State - Swift Purge Results */}
        {state === AppState.SWIFT_RESULTS && (
          <SwiftResultsScreen />
        )}

        {/* SWIFT_SUMMARY State - Swift Purge Summary */}
        {state === AppState.SWIFT_SUMMARY && (
          <SwiftSummaryScreen />
        )}

        {/* SWIFT_PURGE_TARGET State - Tool Mode Target Selection */}
        {state === AppState.SWIFT_PURGE_TARGET && (
          <SwiftPurgeTargetScreen />
        )}

        {/* SWIFT_PURGE_PREVIEW State - Tool Mode Scan & Preview */}
        {state === AppState.SWIFT_PURGE_PREVIEW && (
          <SwiftPurgePreviewScreen />
        )}

        {/* SWIFT_PURGE_EXECUTING State - Tool Mode Execution */}
        {state === AppState.SWIFT_PURGE_EXECUTING && (
          <SwiftPurgeExecutingScreen />
        )}

        {/* SWIFT_PURGE_RESULT State - Tool Mode Result */}
        {state === AppState.SWIFT_PURGE_RESULT && (
          <SwiftPurgeResultScreen />
        )}

        {/* CONFRONTATION_PREVIEW State - Confrontation Preview */}
        {state === AppState.CONFRONTATION_PREVIEW && (
          <ConfrontationPreviewScreen />
        )}

        {/* CONFRONTATION_LOOP State - Confrontation Loop */}
        {state === AppState.CONFRONTATION_LOOP && (
          <ConfrontationLoopScreen />
        )}

        {/* CONFRONTATION_SUMMARY State - Confrontation Summary */}
        {state === AppState.CONFRONTATION_SUMMARY && (
          <ConfrontationSummaryScreen />
        )}

        {/* INTERACTIVE_INTRO State - Interactive Mode Intro */}
        {state === AppState.INTERACTIVE_INTRO && (
          <InteractiveIntroScreen />
        )}

        {/* INTERACTIVE_TARGET State - Target Selection */}
        {state === AppState.INTERACTIVE_TARGET && (
          <InteractiveTargetScreen />
        )}

        {/* INTERACTIVE_SCANNING State - Folder Scan */}
        {state === AppState.INTERACTIVE_SCANNING && (
          <InteractiveScanningScreen />
        )}

        {/* INTERACTIVE_GROUP_RESOLUTION State - Group Resolution */}
        {state === AppState.INTERACTIVE_GROUP_RESOLUTION && (
          <InteractiveGroupResolutionScreen />
        )}

        {/* INTERACTIVE_GROUP_BATTLE State - Group Battle */}
        {state === AppState.INTERACTIVE_GROUP_BATTLE && (
          <InteractiveGroupBattleScreen />
        )}

        {/* INTERACTIVE_SINGLE_FILE State - Single File Selection */}
        {state === AppState.INTERACTIVE_SINGLE_FILE && (
          <InteractiveSingleFileScreen />
        )}

        {/* INTERACTIVE_SINGLE_BATTLE State - Single File Battle */}
        {state === AppState.INTERACTIVE_SINGLE_BATTLE && (
          <InteractiveSingleBattleScreen />
        )}

        {/* INTERACTIVE_EXECUTING State - File Movement */}
        {state === AppState.INTERACTIVE_EXECUTING && (
          <InteractiveExecutingScreen />
        )}

        {/* INTERACTIVE_SUMMARY State - Session Summary */}
        {state === AppState.INTERACTIVE_SUMMARY && (
          <InteractiveSummaryScreen />
        )}

        {/* STORY_MODE placeholder - actual component rendered outside StateTransition */}
        {state === AppState.STORY_MODE && (
          <div className="fixed inset-0 z-50" />
        )}

        {/* STORY_BATTLE placeholder - actual component rendered outside StateTransition */}
        {state === AppState.STORY_BATTLE && (
          <div className="fixed inset-0 z-50" />
        )}

        {/* MISSION_SELECT State - Directory Selection (Requirements: 4.1, 4.2, 4.3, 4.4, 4.5) */}
        {state === AppState.MISSION_SELECT && (
          <MissionSelect
            onDirectorySelected={handleDirectorySelected}
            onScanComplete={handleScanComplete}
          />
        )}

        {/* HUD State - Enhanced Dashboard (Requirements: 5.1, 5.2, 5.3, 5.4, 5.5) */}
        {state === AppState.HUD && (
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Header */}
            <motion.header 
              className="text-center mb-8 bg-graveyard-900/20 backdrop-blur-xl rounded-lg p-6 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1 
                className="text-5xl font-creepster bg-gradient-to-r from-spectral-purple via-purple-400 to-spectral-purple bg-clip-text text-transparent mb-2 drop-shadow-2xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              >
                Digital Exorcist
              </motion.h1>
              <p className="text-gray-300 text-lg font-tech font-medium">
                Banish the ghosts, demons, and zombies from your file system
              </p>
            </motion.header>

            {/* View Mode Tabs - AAA Polish: Proper icon alignment */}
            <div className="flex gap-2 border-b border-white/10 bg-black/80 backdrop-blur-xl rounded-t-lg overflow-hidden mb-6">
              {(['exorcism', 'graveyard', 'whitelist', 'history'] as HUDViewMode[]).map((mode) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setHudViewMode(mode)}
                  className={`px-6 py-3 font-tech font-bold transition-all relative ${
                    hudViewMode === mode
                      ? 'text-white bg-spectral-purple/30 shadow-lg shadow-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {mode === 'exorcism' && (
                      <>
                        <GameIcon 
                          src={dashboardIcon} 
                          size="sm"
                          glow={hudViewMode === mode}
                          className={hudViewMode !== mode ? 'opacity-70' : ''}
                        />
                        <span>Exorcism Dashboard</span>
                      </>
                    )}
                    {mode === 'graveyard' && (
                      <>
                        <GameIcon 
                          src={graveyardIcon} 
                          size="sm"
                          glow={hudViewMode === mode}
                          className={hudViewMode !== mode ? 'opacity-70' : ''}
                        />
                        <span>Graveyard</span>
                      </>
                    )}
                    {mode === 'whitelist' && (
                      <>
                        <GameIcon 
                          src={whitelistIcon} 
                          size="sm"
                          glow={hudViewMode === mode}
                          className={hudViewMode !== mode ? 'opacity-70' : ''}
                        />
                        <span>Whitelist</span>
                      </>
                    )}
                    {mode === 'history' && (
                      <>
                        <GameIcon 
                          src={historyIcon} 
                          size="sm"
                          glow={hudViewMode === mode}
                          className={hudViewMode !== mode ? 'opacity-70' : ''}
                        />
                        <span>History</span>
                      </>
                    )}
                  </span>
                  {hudViewMode === mode && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-spectral-purple to-purple-400 shadow-lg shadow-purple-500/50"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* HUD Content */}
            <AnimatePresence mode="wait">
              {hudViewMode === 'exorcism' && context.classifiedFiles && (
                <motion.div
                  key="exorcism"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EnhancedHUD
                    files={context.classifiedFiles}
                    onEntityClick={handleEntityClick}
                  />
                </motion.div>
              )}

              {hudViewMode === 'graveyard' && (
                <motion.div
                  key="graveyard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GraveyardView onRestore={handleRestore} />
                </motion.div>
              )}

              {hudViewMode === 'whitelist' && (
                <motion.div
                  key="whitelist"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WhitelistManager />
                </motion.div>
              )}

              {hudViewMode === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HistoryLog />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* BATTLE_ARENA State - Full-screen Cockpit Combat (Requirements: 6.3, 6.4, 6.5, 7.1) */}
        {state === AppState.BATTLE_ARENA && context.currentBattleFile && (
          <CockpitArena
            monster={context.currentBattleFile}
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            onFlee={handleFlee}
            mode="interactive"
          />
        )}
      </StateTransition>

      {/* STORY_MODE - Rendered outside StateTransition to preserve state during battle */}
      {(state === AppState.STORY_MODE || state === AppState.STORY_BATTLE) && (
        <div 
          className={`fixed inset-0 z-50 ${state === AppState.STORY_BATTLE ? 'pointer-events-none opacity-0' : ''}`}
          style={{ visibility: state === AppState.STORY_BATTLE ? 'hidden' : 'visible' }}
        >
          <StoryMode
            ref={storyModeRef}
            onExit={handleStoryModeExit}
            onStartBattle={handleStoryStartBattle}
          />
        </div>
      )}

      {/* STORY_BATTLE - Battle with story entity (no real file deletion) */}
      {state === AppState.STORY_BATTLE && storyBattleEntity && (
        <div className="fixed inset-0 z-50">
          <CockpitArena
            monster={storyBattleEntity}
            onVictory={() => handleStoryVictory()}
            onDefeat={handleStoryDefeat}
            onFlee={handleStoryFlee}
            mode="story"
          />
        </div>
      )}

      {/* Undo Toast - Shows after file banishment (Requirements: 13.1, 13.2, 13.3, 13.4, 13.5) */}
      <AnimatePresence>
        {undoToast && (
          <UndoToast
            undoId={undoToast.undoId}
            fileName={undoToast.fileName}
            onUndo={handleUndo}
            onDismiss={handleUndoToastDismiss}
            duration={5000}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
