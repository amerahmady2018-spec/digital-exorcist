import { useReducer, useEffect, useState, forwardRef, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClassifiedFile } from '../../shared/types';
import { MonsterType } from '../../shared/types';
import { DamageNumber } from './DamageNumber';
import { useKeyboardControls, KeyBinding } from '../hooks/useKeyboardControls';
import { AppState, useAppStore } from '../store/appStore';
import { playAttackSound, playVictorySound, playDefeatSound, playClickSound } from '../utils/soundEffects';

import iconFirewall from '../../assets/images/icon_firewall.png';
import iconTactical from '../../assets/images/icon_tactical.png';
import ghostIcon from '../../assets/images/ghost.png';
import demonIcon from '../../assets/images/demon.png';
import zombieIcon from '../../assets/images/zombie.png';
import { GameIcon } from './ui/GameIcon';

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const monsterIcons: Record<string, string> = { ghost: ghostIcon, demon: demonIcon, zombie: zombieIcon };

function getMonsterIcon(c: MonsterType[]): string {
  if (c.includes('demon')) return monsterIcons.demon;
  if (c.includes('ghost')) return monsterIcons.ghost;
  if (c.includes('zombie')) return monsterIcons.zombie;
  return ghostIcon;
}

function getMonsterGlow(c: MonsterType[]): string {
  if (c.includes('demon')) return 'rgba(220, 38, 38, 0.6)';
  if (c.includes('ghost')) return 'rgba(59, 130, 246, 0.6)';
  if (c.includes('zombie')) return 'rgba(34, 197, 94, 0.6)';
  return 'rgba(139, 92, 246, 0.6)';
}

function getEntityColor(c: MonsterType[]): string {
  if (c.includes('demon')) return '#dc2626';
  if (c.includes('ghost')) return '#3b82f6';
  if (c.includes('zombie')) return '#22c55e';
  return '#8b5cf6';
}

function getEntityColorDim(c: MonsterType[]): string {
  if (c.includes('demon')) return '#7f1d1d';
  if (c.includes('ghost')) return '#1e3a8a';
  if (c.includes('zombie')) return '#166534';
  return '#581c87';
}

function isZombie(c: MonsterType[]): boolean {
  return c.includes('zombie');
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function calcHP(bytes: number): number {
  return Math.max(10, Math.ceil((bytes / (1024 * 1024)) * 10));
}

// ═══════════════════════════════════════════════════════════════════
// COMBAT STATE - SIMPLE, RELIABLE
// ═══════════════════════════════════════════════════════════════════

type CombatState = 'PlayerTurn' | 'EnemyTurn' | 'Victory' | 'Defeat';

interface State {
  phase: CombatState;
  playerHP: number;
  playerEssence: number;
  monsterHP: number;
  maxMonsterHP: number;
  sealActive: boolean;
  isGhost: boolean;
}

type Action =
  | { type: 'DAMAGE_MONSTER'; amount: number }
  | { type: 'DAMAGE_PLAYER'; amount: number }
  | { type: 'USE_ESSENCE'; amount: number }
  | { type: 'ACTIVATE_SEAL' }
  | { type: 'DEACTIVATE_SEAL' }
  | { type: 'SET_PHASE'; phase: CombatState }
  | { type: 'RESET'; maxHP: number; isGhost: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'DAMAGE_MONSTER': {
      const hp = Math.max(0, state.monsterHP - action.amount);
      return { ...state, monsterHP: hp, phase: hp <= 0 ? 'Victory' : state.phase };
    }
    case 'DAMAGE_PLAYER': {
      const hp = Math.max(0, state.playerHP - action.amount);
      return { ...state, playerHP: hp, phase: hp <= 0 ? 'Defeat' : state.phase };
    }
    case 'USE_ESSENCE':
      return { ...state, playerEssence: Math.max(0, state.playerEssence - action.amount) };
    case 'ACTIVATE_SEAL':
      return { ...state, sealActive: true };
    case 'DEACTIVATE_SEAL':
      return { ...state, sealActive: false };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'RESET':
      return {
        phase: 'PlayerTurn',
        playerHP: 100,
        playerEssence: 100,
        monsterHP: action.maxHP,
        maxMonsterHP: action.maxHP,
        sealActive: false,
        isGhost: action.isGhost
      };
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════

export interface CockpitArenaProps {
  monster: ClassifiedFile;
  onVictory: (path: string, classifications?: MonsterType[], size?: number) => void;
  onDefeat: () => void;
  onFlee: () => void;
  /** Mode determines defeat button text: 'interactive' shows RETRY, others show RETREAT */
  mode?: 'story' | 'interactive' | 'battle';
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

const CockpitArena = forwardRef<HTMLDivElement, CockpitArenaProps>(
  ({ monster, onVictory, onDefeat, onFlee, mode = 'battle' }, ref) => {
    
    // Get player level for damage scaling
    const playerLevel = useAppStore(state => state.context.level) || 1;
    
    // Level-based damage scaling: +10% damage per level
    const damageMultiplier = 1 + (playerLevel - 1) * 0.15; // 15% per level
    const baseDamage = Math.floor(20 * damageMultiplier);
    const severDamage = Math.floor(50 * damageMultiplier);
    
    const maxHP = calcHP(monster.size);
    const isGhost = monster.classifications.includes('ghost');
    
    const [state, dispatch] = useReducer(reducer, {
      phase: 'PlayerTurn',
      playerHP: 100,
      playerEssence: 100,
      monsterHP: maxHP,
      maxMonsterHP: maxHP,
      sealActive: false,
      isGhost
    });

    const [damages, setDamages] = useState<{ id: string; amount: number; x: number; y: number }[]>([]);
    const [isActing, setIsActing] = useState(false);
    const [shake, setShake] = useState<'none' | 'player' | 'monster'>('none');
    
    // Ref to prevent double-firing victory
    const victoryFiredRef = useRef(false);
    
    // Ref to store callbacks to avoid stale closures
    const onVictoryRef = useRef(onVictory);
    onVictoryRef.current = onVictory;

    const monsterGlow = getMonsterGlow(monster.classifications);
    const entityColor = getEntityColor(monster.classifications);
    const entityColorDim = getEntityColorDim(monster.classifications);
    const isZombieType = isZombie(monster.classifications);

    // ═══════════════════════════════════════════════════════════════════
    // HARD VICTORY GUARANTEE - NEVER BLOCK
    // ═══════════════════════════════════════════════════════════════════
    useEffect(() => {
      if (state.phase === 'Victory' && !victoryFiredRef.current) {
        victoryFiredRef.current = true;
        playVictorySound();
        console.log('[CockpitArena] Victory detected, firing onVictory in 1200ms');
        const timer = setTimeout(() => {
          console.log('[CockpitArena] Calling onVictory NOW');
          onVictoryRef.current(monster.path, monster.classifications, monster.size);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }, [state.phase, monster.path, monster.classifications, monster.size]);

    // DEFEAT - Play sound when player loses
    const defeatSoundPlayedRef = useRef(false);
    useEffect(() => {
      if (state.phase === 'Defeat' && !defeatSoundPlayedRef.current) {
        defeatSoundPlayedRef.current = true;
        playDefeatSound();
      }
    }, [state.phase]);

    // DEFEAT - User must click button to continue (no auto-fire)

    // ═══════════════════════════════════════════════════════════════════
    // DAMAGE NUMBERS
    // ═══════════════════════════════════════════════════════════════════
    const addDamage = (target: 'player' | 'monster', amount: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      const x = target === 'monster' ? window.innerWidth / 2 : 150;
      const y = target === 'monster' ? window.innerHeight * 0.35 : 60;
      setDamages(d => [...d, { id, amount, x, y }]);
    };

    const removeDamage = (id: string) => setDamages(d => d.filter(x => x.id !== id));

    // ═══════════════════════════════════════════════════════════════════
    // ACTIONS - SIMPLE, NO RNG
    // ═══════════════════════════════════════════════════════════════════
    const doShake = (target: 'player' | 'monster') => {
      setShake(target);
      setTimeout(() => setShake('none'), 300);
    };

    const handleSeal = useCallback(() => {
      if (state.phase !== 'PlayerTurn' || isActing || state.sealActive) return;
      setIsActing(true);
      playClickSound();
      dispatch({ type: 'ACTIVATE_SEAL' });
      setTimeout(() => {
        dispatch({ type: 'SET_PHASE', phase: 'EnemyTurn' });
        setIsActing(false);
      }, 400);
    }, [state.phase, state.sealActive, isActing]);

    const handleBreak = useCallback(() => {
      if (state.phase !== 'PlayerTurn' || isActing) return;
      setIsActing(true);
      playAttackSound();
      const dmg = baseDamage;
      dispatch({ type: 'DAMAGE_MONSTER', amount: dmg });
      addDamage('monster', dmg);
      doShake('monster');
      setTimeout(() => {
        if (state.monsterHP - dmg > 0) {
          dispatch({ type: 'SET_PHASE', phase: 'EnemyTurn' });
        }
        setIsActing(false);
      }, 500);
    }, [state.phase, state.monsterHP, isActing, baseDamage]);

    const handleSever = useCallback(() => {
      if (state.phase !== 'PlayerTurn' || isActing || state.playerEssence < 30) return;
      setIsActing(true);
      playAttackSound();
      dispatch({ type: 'USE_ESSENCE', amount: 30 });
      const dmg = severDamage;
      dispatch({ type: 'DAMAGE_MONSTER', amount: dmg });
      addDamage('monster', dmg);
      doShake('monster');
      setTimeout(() => {
        if (state.monsterHP - dmg > 0) {
          dispatch({ type: 'SET_PHASE', phase: 'EnemyTurn' });
        }
        setIsActing(false);
      }, 600);
    }, [state.phase, state.monsterHP, state.playerEssence, isActing, severDamage]);

    const handleFlee = useCallback(() => {
      if (state.phase !== 'PlayerTurn') return;
      onFlee();
    }, [state.phase, onFlee]);

    // ═══════════════════════════════════════════════════════════════════
    // ENEMY TURN - Track HP locally to handle defeat correctly
    // ═══════════════════════════════════════════════════════════════════
    useEffect(() => {
      if (state.phase !== 'EnemyTurn') return;
      
      const runEnemy = async () => {
        await new Promise(r => setTimeout(r, 600));
        
        let currentHP = state.playerHP;
        
        // Attack (blocked by seal)
        if (state.sealActive) {
          dispatch({ type: 'DEACTIVATE_SEAL' });
        } else {
          const dmg = 15;
          currentHP = Math.max(0, currentHP - dmg);
          dispatch({ type: 'DAMAGE_PLAYER', amount: dmg });
          addDamage('player', dmg);
          doShake('player');
        }

        // If player died from attack, don't continue
        if (currentHP <= 0) return;

        // Ghost rot
        if (isGhost) {
          await new Promise(r => setTimeout(r, 400));
          const rotDmg = 10;
          currentHP = Math.max(0, currentHP - rotDmg);
          dispatch({ type: 'DAMAGE_PLAYER', amount: rotDmg });
          addDamage('player', rotDmg);
        }

        // If player died from rot, don't continue
        if (currentHP <= 0) return;

        await new Promise(r => setTimeout(r, 500));
        dispatch({ type: 'SET_PHASE', phase: 'PlayerTurn' });
      };
      
      runEnemy();
    }, [state.phase, state.sealActive, state.playerHP, isGhost]);

    // ═══════════════════════════════════════════════════════════════════
    // KEYBOARD
    // ═══════════════════════════════════════════════════════════════════
    const bindings: KeyBinding[] = useMemo(() => [
      { key: 'f', action: handleSeal, context: [AppState.BATTLE_ARENA, AppState.STORY_BATTLE], preventDefault: true, description: 'SEAL' },
      { key: 'Space', action: handleBreak, context: [AppState.BATTLE_ARENA, AppState.STORY_BATTLE], preventDefault: true, description: 'BREAK' },
      { key: 'r', action: handleSever, context: [AppState.BATTLE_ARENA, AppState.STORY_BATTLE], preventDefault: true, description: 'SEVER' },
      { key: 'Escape', action: handleFlee, context: [AppState.BATTLE_ARENA, AppState.STORY_BATTLE], preventDefault: true, description: 'FLEE' }
    ], [handleSeal, handleBreak, handleSever, handleFlee]);

    useKeyboardControls(bindings);

    const canAct = state.phase === 'PlayerTurn' && !isActing;
    const canSever = state.playerEssence >= 30;


    // ═══════════════════════════════════════════════════════════════════
    // RENDER - CLEAN, READABLE, HORROR
    // ═══════════════════════════════════════════════════════════════════
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 top-10 z-[100]"
        data-testid="cockpit-arena"
        style={{ background: '#000000' }}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            TOP: STATUS BARS - Readable, dark
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute top-0 left-0 right-0 z-30 px-6 py-4">
          <div className="flex justify-between items-start max-w-4xl mx-auto">
            
            {/* PLAYER STATUS */}
            <motion.div 
              className="w-64"
              animate={shake === 'player' ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="text-gray-500 text-xs tracking-widest mb-2">EXORCIST</div>
              {/* HP */}
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">VITALITY</span>
                  <span className="text-gray-300">{state.playerHP}/100</span>
                </div>
                <div className="h-3 bg-gray-900 rounded-sm overflow-hidden">
                  <motion.div
                    animate={{ width: `${state.playerHP}%` }}
                    className="h-full bg-amber-700"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              {/* ESSENCE */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">ESSENCE</span>
                  <span className="text-gray-400">{state.playerEssence}/100</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-sm overflow-hidden">
                  <motion.div
                    animate={{ width: `${state.playerEssence}%` }}
                    className="h-full bg-purple-800"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              {/* SEAL INDICATOR */}
              {state.sealActive && (
                <div className="mt-2 text-blue-500 text-xs tracking-wider">◆ SEAL ACTIVE</div>
              )}
            </motion.div>

            {/* MONSTER STATUS */}
            <motion.div 
              className="w-64 text-right"
              animate={shake === 'monster' ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="text-gray-500 text-xs tracking-widest mb-2">MANIFESTATION</div>
              {/* HP */}
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">STABILITY</span>
                  <span className="text-red-400">{state.monsterHP}/{state.maxMonsterHP}</span>
                </div>
                <div className="h-3 bg-gray-900 rounded-sm overflow-hidden">
                  <motion.div
                    animate={{ width: `${(state.monsterHP / state.maxMonsterHP) * 100}%` }}
                    className="h-full bg-red-800"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              {/* FILE INFO */}
              <div className="text-gray-600 text-xs">
                BOUND: {formatSize(monster.size)}
              </div>
              {/* GHOST ROT */}
              {isGhost && (
                <div className="mt-2 text-cyan-600 text-xs tracking-wider">☠ ROT: -10/turn</div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            CENTER: RITUAL CIRCLE + MONSTER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 flex items-center justify-center">
          
          {/* OUTER RITUAL CIRCLE - Slow rotation, entity colored */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[600px] h-[600px]"
          >
            <svg viewBox="0 0 600 600" className="w-full h-full">
              {/* Outer ring - dashed, entity color */}
              <circle cx="300" cy="300" r="290" fill="none" stroke={entityColorDim} strokeWidth="1.5" strokeDasharray="30 15 10 15" opacity="0.5" />
              {/* Symbols on outer ring */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <text
                  key={i}
                  x="300"
                  y="25"
                  fill={entityColor}
                  fontSize="18"
                  textAnchor="middle"
                  transform={`rotate(${deg} 300 300)`}
                  opacity="0.4"
                  className="font-creepster"
                >
                  {['⛧', '⛤', '☠', '⚶', '⛧', '⛤', '☠', '⚶'][i]}
                </text>
              ))}
            </svg>
          </motion.div>

          {/* MIDDLE RITUAL CIRCLE - Medium rotation, opposite direction */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[480px] h-[480px]"
          >
            <svg viewBox="0 0 480 480" className="w-full h-full">
              <circle cx="240" cy="240" r="230" fill="none" stroke={entityColorDim} strokeWidth="2" strokeDasharray="50 20 30 20" opacity="0.4" />
              <circle cx="240" cy="240" r="210" fill="none" stroke={entityColor} strokeWidth="1" strokeDasharray="10 30" opacity="0.25" />
              {/* Inner symbols */}
              {[30, 90, 150, 210, 270, 330].map((deg, i) => (
                <text
                  key={i}
                  x="240"
                  y="20"
                  fill={entityColor}
                  fontSize="14"
                  textAnchor="middle"
                  transform={`rotate(${deg} 240 240)`}
                  opacity="0.35"
                >
                  {['◆', '◇', '◆', '◇', '◆', '◇'][i]}
                </text>
              ))}
            </svg>
          </motion.div>

          {/* INNER RITUAL CIRCLE - Fastest, seal indicator */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[360px] h-[360px]"
          >
            <svg viewBox="0 0 360 360" className="w-full h-full">
              <circle 
                cx="180" cy="180" r="170" fill="none" 
                stroke={state.sealActive ? '#3b82f6' : entityColor} 
                strokeWidth={state.sealActive ? 3 : 1.5} 
                strokeDasharray={state.sealActive ? '60 10' : '20 15 40 15'}
                opacity={state.sealActive ? 0.7 : 0.3}
              />
            </svg>
          </motion.div>

          {/* MONSTER - Static PNG with entity-colored glow, ZOMBIE IS BIGGER */}
          {state.phase !== 'Victory' && (
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: shake === 'monster' ? [1, 1.08, 0.95, 1] : 1
              }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 0.3 }
              }}
              className="relative z-10"
            >
              <img
                src={getMonsterIcon(monster.classifications)}
                alt="Entity"
                className={`object-contain ${isZombieType ? 'w-[450px] h-[450px]' : 'w-80 h-80'}`}
                style={{
                  filter: `drop-shadow(0 0 80px ${monsterGlow}) drop-shadow(0 0 40px ${monsterGlow}) drop-shadow(0 0 20px ${monsterGlow})`
                }}
              />
            </motion.div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            BOTTOM: ACTION BUTTONS - BIG, BOLD, READABLE
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-8">
          <div className="flex justify-center items-end gap-6">
            
            {/* SEAL - Defense */}
            <motion.button
              whileHover={canAct && !state.sealActive ? { scale: 1.05 } : {}}
              whileTap={canAct && !state.sealActive ? { scale: 0.95 } : {}}
              onClick={handleSeal}
              disabled={!canAct || state.sealActive}
              className="flex flex-col items-center"
            >
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all
                  ${canAct && !state.sealActive 
                    ? 'bg-blue-950 border-blue-700 cursor-pointer' 
                    : 'bg-gray-950 border-gray-800 opacity-40 cursor-not-allowed'}`}
                style={{ boxShadow: canAct && !state.sealActive ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none' }}
              >
                <GameIcon src={iconFirewall} size="lg" glow={canAct && !state.sealActive} glowColor="rgba(59,130,246,0.5)" />
              </div>
              <span className="text-gray-400 text-sm mt-2 tracking-wider">SEAL</span>
              <span className="text-gray-600 text-xs">[F]</span>
            </motion.button>

            {/* BREAK - Main Attack (LARGEST) */}
            <motion.button
              whileHover={canAct ? { scale: 1.05 } : {}}
              whileTap={canAct ? { scale: 0.95 } : {}}
              onClick={handleBreak}
              disabled={!canAct}
              className="flex flex-col items-center"
            >
              <div 
                className={`w-32 h-32 rounded-full flex items-center justify-center border-3 transition-all
                  ${canAct 
                    ? 'bg-red-950 border-red-700 cursor-pointer' 
                    : 'bg-gray-950 border-gray-800 opacity-40 cursor-not-allowed'}`}
                style={{ 
                  boxShadow: canAct ? '0 0 30px rgba(220, 38, 38, 0.4)' : 'none',
                  borderWidth: '3px'
                }}
              >
                <GameIcon src={iconTactical} size="xl" glow={canAct} glowColor="rgba(220,38,38,0.6)" />
              </div>
              <span className="text-gray-300 text-base mt-2 tracking-wider font-bold">BREAK</span>
              <span className="text-gray-500 text-xs">[SPACE]</span>
            </motion.button>

            {/* SEVER - Ultimate */}
            <motion.button
              whileHover={canAct && canSever ? { scale: 1.05 } : {}}
              whileTap={canAct && canSever ? { scale: 0.95 } : {}}
              onClick={handleSever}
              disabled={!canAct || !canSever}
              className="flex flex-col items-center"
            >
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all
                  ${canAct && canSever 
                    ? 'bg-purple-950 border-purple-700 cursor-pointer' 
                    : 'bg-gray-950 border-gray-800 opacity-40 cursor-not-allowed'}`}
                style={{ boxShadow: canAct && canSever ? '0 0 20px rgba(147, 51, 234, 0.3)' : 'none' }}
              >
                <GameIcon src={iconFirewall} size="lg" glow={canAct && canSever} glowColor="rgba(147,51,234,0.5)" />
              </div>
              <span className="text-gray-400 text-sm mt-2 tracking-wider">SEVER</span>
              <span className="text-gray-600 text-xs">[R] 30 ESS</span>
            </motion.button>
          </div>

          {/* FLEE */}
          <div className="text-center mt-6">
            <button
              onClick={handleFlee}
              disabled={!canAct}
              className={`text-gray-700 text-xs tracking-wider hover:text-gray-500 transition-colors
                ${canAct ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
            >
              [ESC] ABANDON RITUAL
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            DAMAGE NUMBERS
        ═══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {damages.map(d => (
            <DamageNumber
              key={d.id}
              id={d.id}
              amount={d.amount}
              x={d.x}
              y={d.y}
              isRawDamage={true}
              onAnimationComplete={() => removeDamage(d.id)}
            />
          ))}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════════
            VICTORY - Simple, then EXIT
        ═══════════════════════════════════════════════════════════════════ */}
        {state.phase === 'Victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/90"
          >
            <div className="text-center">
              <div className="text-green-600 text-2xl tracking-[0.3em] mb-4">BINDING SEVERED</div>
              <div className="text-gray-600 text-sm">{formatSize(monster.size)} released</div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            DEFEAT - With Continue/Retry button
        ═══════════════════════════════════════════════════════════════════ */}
        {state.phase === 'Defeat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/95"
          >
            <div className="text-center">
              <div className="text-red-700 text-3xl font-creepster tracking-[0.2em] mb-4">CONTAINMENT FAILED</div>
              <div className="text-gray-500 text-sm mb-8">the entity remains unbound</div>
              {mode === 'interactive' ? (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  onClick={() => dispatch({ type: 'RESET', maxHP, isGhost })}
                  className="px-8 py-3 bg-purple-950/50 border border-purple-800/50 text-purple-400 
                             font-creepster text-lg tracking-wider uppercase
                             hover:bg-purple-900/50 hover:border-purple-600 hover:text-purple-300
                             transition-all duration-300"
                >
                  Retry
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  onClick={onDefeat}
                  className="px-8 py-3 bg-red-950/50 border border-red-800/50 text-red-400 
                             font-creepster text-lg tracking-wider uppercase
                             hover:bg-red-900/50 hover:border-red-600 hover:text-red-300
                             transition-all duration-300"
                >
                  Retreat
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

CockpitArena.displayName = 'CockpitArena';

export { CockpitArena };
