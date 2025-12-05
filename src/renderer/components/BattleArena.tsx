import { useReducer, useEffect, useState, forwardRef, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClassifiedFile, FileInspectionResponse } from '../../shared/types';
import { MonsterType } from '../../shared/types';
import { MonsterDisplay } from './MonsterDisplay';
import { PlayerDisplay } from './PlayerDisplay';
import { CombatMenu } from './CombatMenu';
import { DamageNumber } from './DamageNumber';
import { AIIntelPanel } from './AIIntelPanel';
import { CombatActions } from './CombatActions';
import { ParticleEffect } from './ParticleEffect';
import { useKeyboardControls, KeyBinding } from '../hooks/useKeyboardControls';
import { AppState } from '../store/appStore';

// Import custom icons - HARD-MAPPED ASSETS
import iconFirewall from '../../assets/images/icon_firewall.png';
import ghostIcon from '../../assets/images/ghost.png';
import demonIcon from '../../assets/images/demon.png';
import zombieIcon from '../../assets/images/zombie.png';
import { GameIcon } from './ui/GameIcon';

// Monster type to icon mapping
const monsterIconMap: Record<string, string> = {
  ghost: ghostIcon,
  demon: demonIcon,
  zombie: zombieIcon
};

// Get monster icon based on classification
function getMonsterIcon(classifications: MonsterType[]): string {
  if (classifications.includes('ghost')) return monsterIconMap.ghost;
  if (classifications.includes('demon')) return monsterIconMap.demon;
  if (classifications.includes('zombie')) return monsterIconMap.zombie;
  return ghostIcon; // Default fallback
}

// Combat State Types
type CombatState = 'PlayerTurn' | 'AttackAnimation' | 'EnemyTurn' | 'Victory' | 'Defeat';

type CombatAction = 'DATA_SMASH' | 'PURGE_RITUAL' | 'FIREWALL' | 'FLEE';

interface DamageNumberData {
  id: string;
  amount: number;
  x: number;
  y: number;
}

interface CombatStateData {
  state: CombatState;
  playerHP: number;
  playerMana: number;
  monsterHP: number;
  maxMonsterHP: number;
  firewallActive: boolean;
  isGhostType: boolean;
  playerIsShaking: boolean;
  monsterIsShaking: boolean;
}

// Combat Reducer Actions
type CombatReducerAction =
  | { type: 'APPLY_DAMAGE'; target: 'player' | 'monster'; damage: number }
  | { type: 'CONSUME_MANA'; amount: number }
  | { type: 'ACTIVATE_FIREWALL' }
  | { type: 'TRANSITION_STATE'; newState: CombatState }
  | { type: 'SET_SHAKE'; target: 'player' | 'monster'; isShaking: boolean }
  | { type: 'ENEMY_ATTACK' }
  | { type: 'APPLY_ROT_DAMAGE' };

// Calculate monster HP from file size
function calculateMonsterHP(fileSizeBytes: number): number {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  return Math.ceil(fileSizeMB * 10);
}

// Check if monster is Ghost type
function isGhostMonster(classifications: MonsterType[]): boolean {
  return classifications.includes('ghost');
}

// Combat Reducer
function combatReducer(state: CombatStateData, action: CombatReducerAction): CombatStateData {
  switch (action.type) {
    case 'APPLY_DAMAGE': {
      if (action.target === 'player') {
        const newHP = Math.max(0, state.playerHP - action.damage);
        return {
          ...state,
          playerHP: newHP,
          state: newHP <= 0 ? 'Defeat' : state.state
        };
      } else {
        const newHP = Math.max(0, state.monsterHP - action.damage);
        return {
          ...state,
          monsterHP: newHP,
          state: newHP <= 0 ? 'Victory' : state.state
        };
      }
    }

    case 'CONSUME_MANA': {
      return {
        ...state,
        playerMana: Math.max(0, state.playerMana - action.amount)
      };
    }

    case 'ACTIVATE_FIREWALL': {
      return {
        ...state,
        firewallActive: true
      };
    }

    case 'TRANSITION_STATE': {
      return {
        ...state,
        state: action.newState
      };
    }

    case 'SET_SHAKE': {
      if (action.target === 'player') {
        return { ...state, playerIsShaking: action.isShaking };
      } else {
        return { ...state, monsterIsShaking: action.isShaking };
      }
    }

    case 'ENEMY_ATTACK': {
      // Monster attacks with base damage of 15
      const baseDamage = 15;
      
      if (state.firewallActive) {
        // Firewall blocks the attack
        return {
          ...state,
          firewallActive: false
        };
      } else {
        // Apply damage to player
        const newHP = Math.max(0, state.playerHP - baseDamage);
        return {
          ...state,
          playerHP: newHP,
          state: newHP <= 0 ? 'Defeat' : state.state
        };
      }
    }

    case 'APPLY_ROT_DAMAGE': {
      if (state.isGhostType) {
        const rotDamage = 10;
        const newHP = Math.max(0, state.playerHP - rotDamage);
        return {
          ...state,
          playerHP: newHP,
          state: newHP <= 0 ? 'Defeat' : state.state
        };
      }
      return state;
    }

    default:
      return state;
  }
}

/**
 * BattleArena - Full-screen 1v1 combat interface
 * 
 * Displays a full-screen battle arena with:
 * - Monster prominently displayed with health bar
 * - Combat UI elements
 * - AI Intel panel with file analysis
 * - Combat action buttons
 * - Auto-triggers file inspection on mount
 * 
 * Requirements: 6.3, 6.4, 6.5, 7.1
 */

// Component Props
export interface BattleArenaProps {
  /** The classified file/monster to battle */
  monster: ClassifiedFile;
  /** Callback when battle is won */
  onVictory: (filePath: string, classifications?: MonsterType[], fileSize?: number) => void;
  /** Callback when battle is lost */
  onDefeat: () => void;
  /** Callback when player flees */
  onFlee: () => void;
}

const BattleArena = forwardRef<HTMLDivElement, BattleArenaProps>(
  ({ monster, onVictory, onDefeat, onFlee }, ref) => {
  // Initialize combat state
  const initialState: CombatStateData = {
    state: 'PlayerTurn',
    playerHP: 100,
    playerMana: 100,
    monsterHP: calculateMonsterHP(monster.size),
    maxMonsterHP: calculateMonsterHP(monster.size),
    firewallActive: false,
    isGhostType: isGhostMonster(monster.classifications),
    playerIsShaking: false,
    monsterIsShaking: false
  };

  const [combatState, dispatch] = useReducer(combatReducer, initialState);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);
  
  // AI Intel state
  const [aiIntel, setAiIntel] = useState<FileInspectionResponse | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(true);
  const [intelError, setIntelError] = useState<string | null>(null);
  
  // Track if combat action is executing (for button disabling)
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  
  // Particle dissolution effect state (Requirements: 11.1, 11.2, 11.3, 11.4)
  const [showDissolution, setShowDissolution] = useState(false);
  const [dissolutionComplete, setDissolutionComplete] = useState(false);
  const monsterRef = useRef<HTMLDivElement>(null);

  // Auto-trigger file inspection on mount (Requirement 7.1)
  useEffect(() => {
    const fetchIntel = async () => {
      setIsLoadingIntel(true);
      setIntelError(null);
      
      try {
        const response = await window.electronAPI.inspectFileAgent({
          path: monster.path,
          size: monster.size,
          lastModified: monster.lastModified,
          classifications: monster.classifications
        });
        
        if (response.success) {
          setAiIntel(response);
        } else {
          setIntelError(response.error || 'Failed to analyze file');
        }
      } catch (error) {
        setIntelError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoadingIntel(false);
      }
    };
    
    fetchIntel();
  }, [monster.path, monster.size, monster.lastModified, monster.classifications]);

  // Add damage number helper
  const addDamageNumber = (target: 'player' | 'monster', amount: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = target === 'monster' ? window.innerWidth * 0.75 : window.innerWidth * 0.25;
    const y = target === 'monster' ? window.innerHeight * 0.3 : window.innerHeight * 0.6;
    
    setDamageNumbers(prev => [...prev, { id, amount, x, y }]);
  };

  // Remove damage number helper
  const removeDamageNumber = (id: string) => {
    setDamageNumbers(prev => prev.filter(dn => dn.id !== id));
  };

  // Internal handler for player actions (used by both buttons and keyboard)
  const handlePlayerActionInternal = useCallback(async (action: CombatAction) => {
    if (combatState.state !== 'PlayerTurn' || isExecutingAction) return;

    if (action === 'FLEE') {
      onFlee();
      return;
    }

    // Set executing state to disable buttons (Requirement 8.5)
    setIsExecutingAction(true);

    // Transition to attack animation
    dispatch({ type: 'TRANSITION_STATE', newState: 'AttackAnimation' });

    // Execute action
    let damage = 0;
    switch (action) {
      case 'DATA_SMASH':
        damage = 20;
        dispatch({ type: 'APPLY_DAMAGE', target: 'monster', damage });
        dispatch({ type: 'SET_SHAKE', target: 'monster', isShaking: true });
        addDamageNumber('monster', damage);
        setTimeout(() => dispatch({ type: 'SET_SHAKE', target: 'monster', isShaking: false }), 400);
        break;

      case 'PURGE_RITUAL':
        if (combatState.playerMana >= 30) {
          damage = 50;
          dispatch({ type: 'CONSUME_MANA', amount: 30 });
          dispatch({ type: 'APPLY_DAMAGE', target: 'monster', damage });
          dispatch({ type: 'SET_SHAKE', target: 'monster', isShaking: true });
          addDamageNumber('monster', damage);
          setTimeout(() => dispatch({ type: 'SET_SHAKE', target: 'monster', isShaking: false }), 400);
        }
        break;

      case 'FIREWALL':
        dispatch({ type: 'ACTIVATE_FIREWALL' });
        break;
    }

    // Wait for animation, then transition to enemy turn
    setTimeout(() => {
      // Check if monster is defeated
      if (combatState.monsterHP - damage <= 0) {
        setIsExecutingAction(false);
        return; // Victory state will be handled by reducer
      }
      
      dispatch({ type: 'TRANSITION_STATE', newState: 'EnemyTurn' });
      setIsExecutingAction(false);
    }, 800);
  }, [combatState.state, combatState.playerMana, combatState.monsterHP, isExecutingAction, onFlee]);

  // Public handler for CombatActions component
  const handlePlayerAction = useCallback((action: CombatAction) => {
    handlePlayerActionInternal(action);
  }, [handlePlayerActionInternal]);

  // Memoized action handlers for keyboard controls (Requirements: 12.1, 12.2, 12.3)
  const handleDataSmash = useCallback(() => {
    handlePlayerActionInternal('DATA_SMASH');
  }, [handlePlayerActionInternal]);

  const handlePurgeRitual = useCallback(() => {
    if (combatState.playerMana >= 30) {
      handlePlayerActionInternal('PURGE_RITUAL');
    }
  }, [handlePlayerActionInternal, combatState.playerMana]);

  const handleFleeAction = useCallback(() => {
    handlePlayerActionInternal('FLEE');
  }, [handlePlayerActionInternal]);

  // Keyboard bindings for Battle Arena (Requirements: 12.1, 12.2, 12.3, 12.5)
  const keyboardBindings: KeyBinding[] = useMemo(() => [
    {
      key: 'Space',
      action: handleDataSmash,
      context: AppState.BATTLE_ARENA,
      preventDefault: true,
      description: 'Primary attack - DATA SMASH'
    },
    {
      key: 'r',
      action: handlePurgeRitual,
      context: AppState.BATTLE_ARENA,
      preventDefault: true,
      description: 'Special attack - PURGE RITUAL'
    },
    {
      key: 'Escape',
      action: handleFleeAction,
      context: AppState.BATTLE_ARENA,
      preventDefault: true,
      description: 'Flee from battle'
    }
  ], [handleDataSmash, handlePurgeRitual, handleFleeAction]);

  // Register keyboard controls
  useKeyboardControls(keyboardBindings);

  // Handle enemy turn
  useEffect(() => {
    if (combatState.state === 'EnemyTurn') {
      const executeEnemyTurn = async () => {
        // Wait a moment before enemy attacks
        await new Promise(resolve => setTimeout(resolve, 500));

        // Enemy attack
        const baseDamage = 15;
        if (combatState.firewallActive) {
          // Firewall blocks
          dispatch({ type: 'ENEMY_ATTACK' });
        } else {
          // Apply damage
          dispatch({ type: 'ENEMY_ATTACK' });
          dispatch({ type: 'SET_SHAKE', target: 'player', isShaking: true });
          addDamageNumber('player', baseDamage);
          setTimeout(() => dispatch({ type: 'SET_SHAKE', target: 'player', isShaking: false }), 400);
        }

        // Apply rot damage if Ghost type
        if (combatState.isGhostType) {
          await new Promise(resolve => setTimeout(resolve, 600));
          dispatch({ type: 'APPLY_ROT_DAMAGE' });
          addDamageNumber('player', 10);
        }

        // Return to player turn
        await new Promise(resolve => setTimeout(resolve, 800));
        dispatch({ type: 'TRANSITION_STATE', newState: 'PlayerTurn' });
      };

      executeEnemyTurn();
    }
  }, [combatState.state, combatState.firewallActive, combatState.isGhostType]);

  // Handle victory condition - trigger particle dissolution effect (Requirements: 11.1, 11.2, 11.3)
  useEffect(() => {
    if (combatState.state === 'Victory' && !showDissolution && !dissolutionComplete) {
      // Trigger dissolution effect after a brief delay for the victory message
      const timer = setTimeout(() => {
        setShowDissolution(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [combatState.state, showDissolution, dissolutionComplete]);

  // Handle dissolution completion - transition to HUD and remove file (Requirements: 11.3, 11.4)
  const handleDissolutionComplete = () => {
    setDissolutionComplete(true);
    setShowDissolution(false);
    // Call onVictory to remove the banished file from entity list and return to HUD
    onVictory(monster.path, monster.classifications, monster.size);
  };

  // Handle defeat condition
  useEffect(() => {
    if (combatState.state === 'Defeat') {
      const timer = setTimeout(() => {
        onDefeat();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [combatState.state, onDefeat]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-graveyard-950/95 backdrop-blur-lg"
      data-testid="battle-arena"
    >
      <div className="relative w-full h-full">
        {/* Monster Display - Top Right (hidden during dissolution) */}
        <AnimatePresence>
          {!showDissolution && (
            <motion.div 
              ref={monsterRef}
              className="absolute top-20 right-32"
              layoutId={`monster-${monster.path}`}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <MonsterDisplay
                image={getMonsterIcon(monster.classifications)}
                hp={combatState.monsterHP}
                maxHP={combatState.maxMonsterHP}
                isShaking={combatState.monsterIsShaking}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player Display - Bottom Left */}
        <div className="absolute bottom-32 left-32">
          <PlayerDisplay
            hp={combatState.playerHP}
            maxHP={100}
            mana={combatState.playerMana}
            maxMana={100}
            isShaking={combatState.playerIsShaking}
          />
        </div>

        {/* AI Intel Panel - Left Side */}
        <div className="absolute top-20 left-8 w-80">
          <AIIntelPanel
            isLoading={isLoadingIntel}
            intel={aiIntel}
            error={intelError}
          />
        </div>

        {/* Combat Actions - Bottom Center */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <CombatActions
            onDataSmash={() => handlePlayerAction('DATA_SMASH')}
            onPurgeRitual={() => handlePlayerAction('PURGE_RITUAL')}
            onFlee={() => handlePlayerAction('FLEE')}
            disabled={combatState.state !== 'PlayerTurn' || isExecutingAction}
            playerMana={combatState.playerMana}
          />
        </div>

        {/* Legacy Combat Menu (hidden, kept for compatibility) */}
        <div className="hidden">
          <CombatMenu
            onAction={handlePlayerAction}
            isPlayerTurn={combatState.state === 'PlayerTurn'}
            playerMana={combatState.playerMana}
          />
        </div>

        {/* Damage Numbers Overlay */}
        <AnimatePresence>
          {damageNumbers.map(dn => (
            <DamageNumber
              key={dn.id}
              id={dn.id}
              amount={dn.amount}
              x={dn.x}
              y={dn.y}
              onAnimationComplete={() => removeDamageNumber(dn.id)}
            />
          ))}
        </AnimatePresence>

        {/* Victory/Defeat Messages */}
        {combatState.state === 'Victory' && !showDissolution && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <h2 className="text-6xl font-creepster text-green-400 drop-shadow-2xl">
              VICTORY!
            </h2>
            <p className="text-2xl font-tech text-white mt-4">
              Monster Banished!
            </p>
          </motion.div>
        )}

        {/* Particle Dissolution Effect - Triggers on successful banishment (Requirements: 11.1, 11.2, 11.3, 11.4) */}
        <AnimatePresence>
          {showDissolution && (
            <ParticleEffect
              type="dissolution"
              origin={{
                x: window.innerWidth * 0.75, // Monster position (top right)
                y: window.innerHeight * 0.3
              }}
              onComplete={handleDissolutionComplete}
              particleCount={80}
              baseColor="#8b5cf6"
              duration={1500}
              layoutId={`monster-${monster.path}`}
            />
          )}
        </AnimatePresence>

        {combatState.state === 'Defeat' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <h2 className="text-6xl font-creepster text-red-400 drop-shadow-2xl">
              DEFEATED!
            </h2>
            <p className="text-2xl font-tech text-white mt-4">
              You must retreat...
            </p>
          </motion.div>
        )}

        {/* Firewall Indicator */}
        {combatState.firewallActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-blue-600/80 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-blue-400"
          >
            <p className="text-white font-tech font-bold text-lg flex items-center gap-2">
              <GameIcon src={iconFirewall} size="sm" glow glowColor="rgba(59,130,246,0.8)" />
              FIREWALL ACTIVE
            </p>
          </motion.div>
        )}

        {/* Ghost Type Indicator */}
        {combatState.isGhostType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-8 right-8 bg-purple-600/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-purple-400"
          >
            <p className="text-white font-tech font-bold flex items-center gap-2">
              <GameIcon src={ghostIcon} size="sm" glow glowColor="rgba(168,85,247,0.8)" />
              ROT DAMAGE: -10 HP/TURN
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

BattleArena.displayName = 'BattleArena';

export { BattleArena };
