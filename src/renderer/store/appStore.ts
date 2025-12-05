import { create } from 'zustand';
import { ClassifiedFile, MonsterType } from '../../shared/types';

/**
 * Application State Machine
 * 
 * Manages the cinematic flow: INTRO → EXORCISM_STYLE → [Flow Screens] → Summary
 * Each state represents a distinct screen/phase of the application.
 */

export enum AppState {
  INTRO = 'INTRO',
  // Exorcism Style Selection (HQ)
  EXORCISM_STYLE = 'EXORCISM_STYLE',
  // Guided Ritual Flow
  GUIDED_PREVIEW = 'GUIDED_PREVIEW',
  GUIDED_ACTIVE = 'GUIDED_ACTIVE',
  GUIDED_SUMMARY = 'GUIDED_SUMMARY',
  // Swift Purge Flow (Tool Mode - Redesigned)
  SWIFT_PURGE_TARGET = 'SWIFT_PURGE_TARGET',
  SWIFT_PURGE_PREVIEW = 'SWIFT_PURGE_PREVIEW',
  SWIFT_PURGE_EXECUTING = 'SWIFT_PURGE_EXECUTING',
  SWIFT_PURGE_RESULT = 'SWIFT_PURGE_RESULT',
  // Legacy Swift Purge (keeping for backwards compatibility)
  SWIFT_LOCATION = 'SWIFT_LOCATION',
  SWIFT_RESULTS = 'SWIFT_RESULTS',
  SWIFT_SUMMARY = 'SWIFT_SUMMARY',
  // Confrontation Flow
  CONFRONTATION_PREVIEW = 'CONFRONTATION_PREVIEW',
  CONFRONTATION_LOOP = 'CONFRONTATION_LOOP',
  CONFRONTATION_SUMMARY = 'CONFRONTATION_SUMMARY',
  // Story Mode (onboarding with fake files)
  STORY_MODE = 'STORY_MODE',
  STORY_BATTLE = 'STORY_BATTLE',
  // Interactive Mode (real files + controlled battles)
  INTERACTIVE_INTRO = 'INTERACTIVE_INTRO',
  INTERACTIVE_TARGET = 'INTERACTIVE_TARGET',
  INTERACTIVE_SCANNING = 'INTERACTIVE_SCANNING',
  INTERACTIVE_GROUP_RESOLUTION = 'INTERACTIVE_GROUP_RESOLUTION',
  INTERACTIVE_GROUP_BATTLE = 'INTERACTIVE_GROUP_BATTLE',
  INTERACTIVE_SINGLE_FILE = 'INTERACTIVE_SINGLE_FILE',
  INTERACTIVE_SINGLE_BATTLE = 'INTERACTIVE_SINGLE_BATTLE',
  INTERACTIVE_EXECUTING = 'INTERACTIVE_EXECUTING',
  INTERACTIVE_SUMMARY = 'INTERACTIVE_SUMMARY',
  // Legacy states (existing functionality)
  MISSION_SELECT = 'MISSION_SELECT',
  HUD = 'HUD',
  BATTLE_ARENA = 'BATTLE_ARENA'
}

/**
 * Exorcism style types
 */
export type ExorcismStyle = 'guided' | 'swift' | 'confrontation';

/**
 * Entity counts by type
 */
export interface EntityCounts {
  ghosts: number;
  zombies: number;
  demons: number;
  unknown: number;
}

/**
 * Flow context for tracking encounter state across exorcism flows
 */
export interface FlowContext {
  /** Current flow type */
  flowType: ExorcismStyle | null;
  /** Entities in current encounter */
  entities: ClassifiedFile[];
  /** Current position in entity list (for confrontation) */
  currentIndex: number;
  /** Entities that have been purged */
  purgedEntities: ClassifiedFile[];
  /** Entities that have been spared */
  sparedEntities: ClassifiedFile[];
  /** Selected location for swift purge */
  selectedLocation: string | null;
  /** Selected categories for swift purge bulk selection */
  selectedCategories: Set<MonsterType>;
}

export type TransitionAnimation = 'fade' | 'zoom' | 'slide';

export interface StateTransition {
  from: AppState;
  to: AppState;
  animation: TransitionAnimation;
}

/**
 * Allowed state transitions define the valid flow through the application
 */
export const allowedTransitions: StateTransition[] = [
  // Title Screen ↔ Exorcism Style Selection
  { from: AppState.INTRO, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.EXORCISM_STYLE, to: AppState.INTRO, animation: 'fade' },
  
  // Exorcism Style Selection → Flow Previews
  { from: AppState.EXORCISM_STYLE, to: AppState.GUIDED_PREVIEW, animation: 'slide' },
  { from: AppState.EXORCISM_STYLE, to: AppState.SWIFT_LOCATION, animation: 'slide' },
  { from: AppState.EXORCISM_STYLE, to: AppState.CONFRONTATION_PREVIEW, animation: 'slide' },
  
  // Guided Ritual Flow
  { from: AppState.GUIDED_PREVIEW, to: AppState.GUIDED_ACTIVE, animation: 'zoom' },
  { from: AppState.GUIDED_PREVIEW, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.GUIDED_ACTIVE, to: AppState.GUIDED_SUMMARY, animation: 'fade' },
  { from: AppState.GUIDED_ACTIVE, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.GUIDED_SUMMARY, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  
  // Swift Purge Flow (Legacy)
  { from: AppState.SWIFT_LOCATION, to: AppState.SWIFT_RESULTS, animation: 'slide' },
  { from: AppState.SWIFT_LOCATION, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.SWIFT_RESULTS, to: AppState.SWIFT_SUMMARY, animation: 'fade' },
  { from: AppState.SWIFT_RESULTS, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.SWIFT_SUMMARY, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  
  // Swift Purge Tool Mode (Redesigned)
  { from: AppState.EXORCISM_STYLE, to: AppState.SWIFT_PURGE_TARGET, animation: 'slide' },
  { from: AppState.SWIFT_PURGE_TARGET, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.SWIFT_PURGE_TARGET, to: AppState.SWIFT_PURGE_PREVIEW, animation: 'slide' },
  { from: AppState.SWIFT_PURGE_TARGET, to: AppState.SWIFT_PURGE_RESULT, animation: 'fade' }, // Single file purge
  { from: AppState.SWIFT_PURGE_PREVIEW, to: AppState.SWIFT_PURGE_TARGET, animation: 'fade' },
  { from: AppState.SWIFT_PURGE_PREVIEW, to: AppState.SWIFT_PURGE_EXECUTING, animation: 'fade' },
  { from: AppState.SWIFT_PURGE_PREVIEW, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.SWIFT_PURGE_EXECUTING, to: AppState.SWIFT_PURGE_RESULT, animation: 'fade' },
  { from: AppState.SWIFT_PURGE_RESULT, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.SWIFT_PURGE_RESULT, to: AppState.SWIFT_PURGE_TARGET, animation: 'fade' }, // Purge more
  
  // Confrontation Flow
  { from: AppState.CONFRONTATION_PREVIEW, to: AppState.CONFRONTATION_LOOP, animation: 'zoom' },
  { from: AppState.CONFRONTATION_PREVIEW, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.CONFRONTATION_LOOP, to: AppState.CONFRONTATION_SUMMARY, animation: 'fade' },
  { from: AppState.CONFRONTATION_LOOP, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.CONFRONTATION_SUMMARY, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  
  // Story Mode Flow (onboarding with fake files)
  { from: AppState.EXORCISM_STYLE, to: AppState.STORY_MODE, animation: 'fade' },
  { from: AppState.STORY_MODE, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.STORY_MODE, to: AppState.STORY_BATTLE, animation: 'zoom' },
  { from: AppState.STORY_BATTLE, to: AppState.STORY_MODE, animation: 'zoom' },
  
  // Interactive Mode Flow (real files + controlled battles)
  { from: AppState.EXORCISM_STYLE, to: AppState.INTERACTIVE_INTRO, animation: 'fade' },
  { from: AppState.INTERACTIVE_INTRO, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.INTERACTIVE_INTRO, to: AppState.INTERACTIVE_TARGET, animation: 'slide' },
  { from: AppState.INTERACTIVE_TARGET, to: AppState.INTERACTIVE_INTRO, animation: 'fade' },
  { from: AppState.INTERACTIVE_TARGET, to: AppState.INTERACTIVE_SCANNING, animation: 'fade' },
  { from: AppState.INTERACTIVE_TARGET, to: AppState.INTERACTIVE_SINGLE_FILE, animation: 'slide' },
  { from: AppState.INTERACTIVE_SCANNING, to: AppState.INTERACTIVE_TARGET, animation: 'fade' },
  { from: AppState.INTERACTIVE_SCANNING, to: AppState.INTERACTIVE_GROUP_RESOLUTION, animation: 'slide' },
  { from: AppState.INTERACTIVE_GROUP_RESOLUTION, to: AppState.INTERACTIVE_TARGET, animation: 'fade' },
  { from: AppState.INTERACTIVE_GROUP_RESOLUTION, to: AppState.INTERACTIVE_GROUP_BATTLE, animation: 'zoom' },
  { from: AppState.INTERACTIVE_GROUP_RESOLUTION, to: AppState.INTERACTIVE_EXECUTING, animation: 'fade' },
  { from: AppState.INTERACTIVE_GROUP_RESOLUTION, to: AppState.INTERACTIVE_SUMMARY, animation: 'fade' },
  { from: AppState.INTERACTIVE_GROUP_BATTLE, to: AppState.INTERACTIVE_GROUP_RESOLUTION, animation: 'zoom' },
  { from: AppState.INTERACTIVE_SINGLE_FILE, to: AppState.INTERACTIVE_TARGET, animation: 'fade' },
  { from: AppState.INTERACTIVE_SINGLE_FILE, to: AppState.INTERACTIVE_SINGLE_BATTLE, animation: 'zoom' },
  { from: AppState.INTERACTIVE_SINGLE_BATTLE, to: AppState.INTERACTIVE_SINGLE_FILE, animation: 'zoom' },
  { from: AppState.INTERACTIVE_SINGLE_BATTLE, to: AppState.INTERACTIVE_EXECUTING, animation: 'fade' },
  { from: AppState.INTERACTIVE_SINGLE_BATTLE, to: AppState.INTERACTIVE_SUMMARY, animation: 'fade' },
  { from: AppState.INTERACTIVE_EXECUTING, to: AppState.INTERACTIVE_SUMMARY, animation: 'fade' },
  { from: AppState.INTERACTIVE_SUMMARY, to: AppState.EXORCISM_STYLE, animation: 'fade' },
  { from: AppState.INTERACTIVE_SUMMARY, to: AppState.INTERACTIVE_TARGET, animation: 'fade' }, // Purge more
  
  // Legacy transitions (existing functionality)
  { from: AppState.INTRO, to: AppState.MISSION_SELECT, animation: 'fade' },
  { from: AppState.MISSION_SELECT, to: AppState.HUD, animation: 'slide' },
  { from: AppState.HUD, to: AppState.BATTLE_ARENA, animation: 'zoom' },
  { from: AppState.BATTLE_ARENA, to: AppState.HUD, animation: 'zoom' }
];

/**
 * XP and Leveling System Constants
 */
export const XP_PER_MB = 10; // 10 XP per MB purged
export const BASE_XP_PER_LEVEL = 1000; // Base XP needed for level up
export const LEVEL_SCALING = 1.2; // XP requirement scales by 20% per level

/**
 * Calculate XP required for a specific level
 */
export function getXPForLevel(level: number): number {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(LEVEL_SCALING, level - 1));
}

/**
 * Calculate XP earned from file size in bytes
 */
export function calculateXPFromBytes(bytes: number): number {
  const mb = bytes / (1024 * 1024);
  return Math.max(1, Math.floor(mb * XP_PER_MB)); // Minimum 1 XP
}

/**
 * Context data that persists across state transitions
 */
export interface StateContext {
  /** Currently selected directory for scanning */
  selectedDirectory?: string;
  /** Files that have been classified */
  classifiedFiles?: ClassifiedFile[];
  /** The file currently being battled in the arena */
  currentBattleFile?: ClassifiedFile;
  /** Whether a scan is in progress */
  isScanning?: boolean;
  /** Current scan progress */
  scanProgress?: {
    filesScanned: number;
    currentPath: string;
  };
  /** Player XP */
  xp: number;
  /** Player level */
  level: number;
  /** XP gained in last action (for floating text) */
  lastXPGain?: number;
  /** Whether player just leveled up */
  justLeveledUp?: boolean;
  /** Flow context for exorcism style flows */
  flowContext?: FlowContext;
}

/**
 * Initial flow context state
 */
export const initialFlowContext: FlowContext = {
  flowType: null,
  entities: [],
  currentIndex: 0,
  purgedEntities: [],
  sparedEntities: [],
  selectedLocation: null,
  selectedCategories: new Set()
};

export interface AppStore {
  /** Current application state */
  state: AppState;
  /** Context data shared across states */
  context: StateContext;
  /** Animation to use for the current transition */
  currentAnimation: TransitionAnimation | null;
  /** Whether a transition is in progress */
  isTransitioning: boolean;
  
  /**
   * Transition to a new state
   * @param to Target state
   * @param contextUpdate Optional context updates
   * @returns true if transition was successful, false if invalid
   */
  transition: (to: AppState, contextUpdate?: Partial<StateContext>) => boolean;
  
  /**
   * Update context without changing state
   * @param contextUpdate Context updates to apply
   */
  updateContext: (contextUpdate: Partial<StateContext>) => void;
  
  /**
   * Mark transition as complete (called after animation finishes)
   */
  completeTransition: () => void;
  
  /**
   * Reset to initial state
   */
  reset: () => void;
  
  /**
   * Check if a transition is valid
   * @param from Source state
   * @param to Target state
   */
  isValidTransition: (from: AppState, to: AppState) => boolean;
  
  /**
   * Get the animation type for a transition
   * @param from Source state
   * @param to Target state
   */
  getTransitionAnimation: (from: AppState, to: AppState) => TransitionAnimation | null;
  
  /**
   * Add XP and handle level ups
   * @param fileSize Size of purged file in bytes
   * @returns Object with xpGained and leveledUp status
   */
  addXP: (fileSize: number) => { xpGained: number; leveledUp: boolean };
  
  /**
   * Clear the level up flag after animation completes
   */
  clearLevelUp: () => void;
  
  /**
   * Initialize a new exorcism flow
   * @param style The exorcism style to start
   * @param entities The entities for this flow
   */
  initializeFlow: (style: ExorcismStyle, entities: ClassifiedFile[]) => void;
  
  /**
   * Purge an entity in the current flow
   * @param entity The entity to purge
   */
  purgeEntity: (entity: ClassifiedFile) => void;
  
  /**
   * Spare an entity in the current flow
   * @param entity The entity to spare
   */
  spareEntity: (entity: ClassifiedFile) => void;
  
  /**
   * Advance to the next entity in confrontation mode
   */
  advanceToNextEntity: () => void;
  
  /**
   * Reset the flow context
   */
  resetFlow: () => void;
  
  /**
   * Update flow context
   * @param updates Partial flow context updates
   */
  updateFlowContext: (updates: Partial<FlowContext>) => void;
  
  /**
   * Get current entity counts from flow context
   */
  getEntityCounts: () => EntityCounts;
  
  /**
   * Get remaining entity counts (not yet processed)
   */
  getRemainingCounts: () => EntityCounts;
  
  /**
   * Calculate total space that could be recovered from remaining entities
   */
  getPotentialSpaceRecovery: () => number;
  
  /**
   * Calculate space recovered from purged entities
   */
  getSpaceRecovered: () => number;
}

/**
 * LocalStorage key for save data persistence
 */
const SAVE_DATA_KEY = 'digital-exorcist-save';

/**
 * Load saved XP and Level from localStorage
 */
function loadSaveData(): { xp: number; level: number } {
  try {
    const saved = localStorage.getItem(SAVE_DATA_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        xp: typeof data.xp === 'number' ? data.xp : 0,
        level: typeof data.level === 'number' ? data.level : 1
      };
    }
  } catch (error) {
    console.warn('Failed to load save data:', error);
  }
  return { xp: 0, level: 1 };
}

/**
 * Save XP and Level to localStorage
 */
function saveSaveData(xp: number, level: number): void {
  try {
    localStorage.setItem(SAVE_DATA_KEY, JSON.stringify({ xp, level }));
  } catch (error) {
    console.warn('Failed to save data:', error);
  }
}

// Load persisted save data on initialization
const savedData = loadSaveData();

const initialContext: StateContext = {
  xp: savedData.xp,
  level: savedData.level
};

export const useAppStore = create<AppStore>((set, get) => ({
  state: AppState.INTRO,
  context: initialContext,
  currentAnimation: null,
  isTransitioning: false,

  transition: (to: AppState, contextUpdate?: Partial<StateContext>) => {
    const { state: from, isTransitioning, completeTransition } = get();
    
    // Auto-complete stuck transitions after a short delay
    if (isTransitioning) {
      // Force complete the stuck transition and proceed
      completeTransition();
    }
    
    // Check if transition is valid
    const transition = allowedTransitions.find(t => t.from === from && t.to === to);
    
    if (!transition) {
      console.warn(`Invalid transition from ${from} to ${to}`);
      return false;
    }
    
    // Perform the transition
    set({
      state: to,
      context: contextUpdate 
        ? { ...get().context, ...contextUpdate }
        : get().context,
      currentAnimation: transition.animation,
      isTransitioning: true
    });
    
    // Auto-complete transition after animation duration (fallback)
    setTimeout(() => {
      const current = get();
      if (current.isTransitioning && current.state === to) {
        current.completeTransition();
      }
    }, 500);
    
    return true;
  },

  updateContext: (contextUpdate: Partial<StateContext>) => {
    set({
      context: { ...get().context, ...contextUpdate }
    });
  },

  completeTransition: () => {
    set({
      currentAnimation: null,
      isTransitioning: false
    });
  },

  reset: () => {
    set({
      state: AppState.INTRO,
      context: initialContext,
      currentAnimation: null,
      isTransitioning: false
    });
  },

  isValidTransition: (from: AppState, to: AppState) => {
    return allowedTransitions.some(t => t.from === from && t.to === to);
  },

  getTransitionAnimation: (from: AppState, to: AppState) => {
    const transition = allowedTransitions.find(t => t.from === from && t.to === to);
    return transition?.animation ?? null;
  },

  addXP: (fileSize: number) => {
    const xpGained = calculateXPFromBytes(fileSize);
    const { context } = get();
    const currentXP = context.xp || 0;
    const currentLevel = context.level || 1;
    
    const newXP = currentXP + xpGained;
    
    let newLevel = currentLevel;
    let leveledUp = false;
    let remainingXP = newXP;
    
    // Check for level up (can level up multiple times)
    while (remainingXP >= getXPForLevel(newLevel)) {
      remainingXP -= getXPForLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }
    
    // Persist to localStorage
    saveSaveData(remainingXP, newLevel);
    
    set({
      context: {
        ...get().context,
        xp: remainingXP,
        level: newLevel,
        lastXPGain: xpGained,
        justLeveledUp: leveledUp
      }
    });
    
    return { xpGained, leveledUp };
  },

  clearLevelUp: () => {
    set({
      context: {
        ...get().context,
        justLeveledUp: false,
        lastXPGain: undefined
      }
    });
  },

  initializeFlow: (style: ExorcismStyle, entities: ClassifiedFile[]) => {
    set({
      context: {
        ...get().context,
        flowContext: {
          flowType: style,
          entities,
          currentIndex: 0,
          purgedEntities: [],
          sparedEntities: [],
          selectedLocation: null,
          selectedCategories: new Set()
        }
      }
    });
  },

  purgeEntity: (entity: ClassifiedFile) => {
    const { context } = get();
    const flowContext = context.flowContext;
    if (!flowContext) return;

    const updatedEntities = flowContext.entities.filter(e => e.path !== entity.path);
    const updatedPurged = [...flowContext.purgedEntities, entity];

    set({
      context: {
        ...context,
        flowContext: {
          ...flowContext,
          entities: updatedEntities,
          purgedEntities: updatedPurged
        }
      }
    });
  },

  spareEntity: (entity: ClassifiedFile) => {
    const { context } = get();
    const flowContext = context.flowContext;
    if (!flowContext) return;

    const updatedEntities = flowContext.entities.filter(e => e.path !== entity.path);
    const updatedSpared = [...flowContext.sparedEntities, entity];

    set({
      context: {
        ...context,
        flowContext: {
          ...flowContext,
          entities: updatedEntities,
          sparedEntities: updatedSpared
        }
      }
    });
  },

  advanceToNextEntity: () => {
    const { context } = get();
    const flowContext = context.flowContext;
    if (!flowContext) return;

    set({
      context: {
        ...context,
        flowContext: {
          ...flowContext,
          currentIndex: flowContext.currentIndex + 1
        }
      }
    });
  },

  resetFlow: () => {
    set({
      context: {
        ...get().context,
        flowContext: { ...initialFlowContext, selectedCategories: new Set() }
      }
    });
  },

  updateFlowContext: (updates: Partial<FlowContext>) => {
    const { context } = get();
    const flowContext = context.flowContext || { ...initialFlowContext, selectedCategories: new Set() };

    set({
      context: {
        ...context,
        flowContext: {
          ...flowContext,
          ...updates
        }
      }
    });
  },

  getEntityCounts: () => {
    const { context } = get();
    const entities = context.flowContext?.entities || [];
    return countEntitiesByType(entities);
  },

  getRemainingCounts: () => {
    const { context } = get();
    const flowContext = context.flowContext;
    if (!flowContext) return { ghosts: 0, zombies: 0, demons: 0, unknown: 0 };

    // For confrontation mode, remaining = entities from currentIndex onwards
    if (flowContext.flowType === 'confrontation') {
      const remaining = flowContext.entities.slice(flowContext.currentIndex);
      return countEntitiesByType(remaining);
    }

    // For other modes, remaining = all entities not yet processed
    return countEntitiesByType(flowContext.entities);
  },

  getPotentialSpaceRecovery: () => {
    const { context } = get();
    const entities = context.flowContext?.entities || [];
    return entities.reduce((total, entity) => total + entity.size, 0);
  },

  getSpaceRecovered: () => {
    const { context } = get();
    const purged = context.flowContext?.purgedEntities || [];
    return purged.reduce((total, entity) => total + entity.size, 0);
  }
}));

/**
 * Helper function to count entities by type
 */
function countEntitiesByType(entities: ClassifiedFile[]): EntityCounts {
  return entities.reduce(
    (counts, entity) => {
      const types = entity.classifications || [];
      if (types.includes('ghost')) counts.ghosts++;
      else if (types.includes('zombie')) counts.zombies++;
      else if (types.includes('demon')) counts.demons++;
      else counts.unknown++;
      return counts;
    },
    { ghosts: 0, zombies: 0, demons: 0, unknown: 0 }
  );
}

/**
 * Helper hook to get just the current state
 */
export const useAppState = () => useAppStore(state => state.state);

/**
 * Helper hook to get just the context
 */
export const useAppContext = () => useAppStore(state => state.context);

/**
 * Helper hook to get transition function
 */
export const useTransition = () => useAppStore(state => state.transition);
