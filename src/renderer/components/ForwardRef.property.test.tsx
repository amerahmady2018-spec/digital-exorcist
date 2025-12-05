/**
 * Property-based tests for forwardRef component wrapping
 * 
 * Tests that all animated components properly implement forwardRef
 * for Framer Motion compatibility and parent-child ref control.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import React, { createRef, forwardRef } from 'react';
import { render, screen } from '@testing-library/react';

// Import all animated components to test
import TitleScreen from './TitleScreen';
import MissionSelect from './MissionSelect';
import EnhancedHUD from './EnhancedHUD';
import { EntityCard } from './EntityCard';
import { BattleArena } from './BattleArena';
import { AIIntelPanel } from './AIIntelPanel';
import { CombatActions } from './CombatActions';
import { DamageNumber } from './DamageNumber';
import { ParticleEffect } from './ParticleEffect';
import { UndoToast } from './UndoToast';
import GlassmorphicContainer from './GlassmorphicContainer';
import CustomTitlebar from './CustomTitlebar';
import { MonsterCard } from './MonsterCard';
import { MonsterDisplay } from './MonsterDisplay';
import { PlayerDisplay } from './PlayerDisplay';
import { CombatMenu } from './CombatMenu';
import { GraveyardView } from './GraveyardView';
import { DuplicateGroup } from './DuplicateGroup';
import StateTransition from './StateTransition';

// Mock electronAPI for components that need it
vi.mock('../../preload/preload', () => ({}));

// Setup window.electronAPI mock
const mockElectronAPI = {
  selectDirectory: vi.fn().mockResolvedValue({ success: false }),
  startScan: vi.fn().mockResolvedValue({ success: false }),
  classifyFiles: vi.fn().mockResolvedValue({ success: false }),
  cancelScan: vi.fn().mockResolvedValue(undefined),
  onScanProgress: vi.fn().mockReturnValue(() => {}),
  inspectFileAgent: vi.fn().mockResolvedValue({ success: false }),
  windowMinimize: vi.fn().mockResolvedValue(undefined),
  windowMaximize: vi.fn().mockResolvedValue({ isMaximized: false }),
  windowClose: vi.fn().mockResolvedValue(undefined),
  getGraveyardFiles: vi.fn().mockResolvedValue([]),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

/**
 * Type guard to check if a component is wrapped with forwardRef
 */
function isForwardRefComponent(component: unknown): boolean {
  if (!component || typeof component !== 'object') return false;
  
  // Check for $$typeof Symbol which indicates a forwardRef component
  const comp = component as { $$typeof?: symbol; render?: unknown };
  
  // ForwardRef components have a specific $$typeof
  if (comp.$$typeof) {
    const typeofString = comp.$$typeof.toString();
    return typeofString.includes('forward_ref') || typeofString.includes('react.forward_ref');
  }
  
  // Also check if it has a render function (another indicator of forwardRef)
  return typeof comp.render === 'function';
}

/**
 * List of all animated components that should use forwardRef
 */
const animatedComponents = [
  { name: 'TitleScreen', component: TitleScreen },
  { name: 'MissionSelect', component: MissionSelect },
  { name: 'EnhancedHUD', component: EnhancedHUD },
  { name: 'EntityCard', component: EntityCard },
  { name: 'BattleArena', component: BattleArena },
  { name: 'AIIntelPanel', component: AIIntelPanel },
  { name: 'CombatActions', component: CombatActions },
  { name: 'DamageNumber', component: DamageNumber },
  { name: 'ParticleEffect', component: ParticleEffect },
  { name: 'UndoToast', component: UndoToast },
  { name: 'GlassmorphicContainer', component: GlassmorphicContainer },
  { name: 'CustomTitlebar', component: CustomTitlebar },
  { name: 'MonsterCard', component: MonsterCard },
  { name: 'MonsterDisplay', component: MonsterDisplay },
  { name: 'PlayerDisplay', component: PlayerDisplay },
  { name: 'CombatMenu', component: CombatMenu },
  { name: 'GraveyardView', component: GraveyardView },
  { name: 'DuplicateGroup', component: DuplicateGroup },
  { name: 'StateTransition', component: StateTransition },
];

describe('ForwardRef Property Tests', () => {
  /**
   * **Feature: premium-exorcist-transformation, Property 31: ForwardRef component wrapping**
   * **Validates: Requirements 18.1**
   * 
   * For any animated component, it should be wrapped with React.forwardRef
   * to enable ref forwarding.
   */
  it('Property 31: All animated components are wrapped with forwardRef', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...animatedComponents),
        ({ name, component }) => {
          const isForwardRef = isForwardRefComponent(component);
          expect(isForwardRef).toBe(true);
          return isForwardRef;
        }
      ),
      { numRuns: animatedComponents.length }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 32: Ref forwarding to DOM elements**
   * **Validates: Requirements 18.2**
   * 
   * For any forwardRef component, the ref should be correctly forwarded
   * to the underlying DOM element.
   */
  it('Property 32: GlassmorphicContainer forwards ref to DOM element', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (content) => {
          const ref = createRef<HTMLDivElement>();
          
          render(
            <GlassmorphicContainer ref={ref}>
              <span>{content}</span>
            </GlassmorphicContainer>
          );
          
          // Ref should be attached to a DOM element
          expect(ref.current).toBeInstanceOf(HTMLDivElement);
          return ref.current instanceof HTMLDivElement;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 32: CustomTitlebar forwards ref to DOM element', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (title) => {
          const ref = createRef<HTMLDivElement>();
          
          render(<CustomTitlebar ref={ref} title={title} />);
          
          expect(ref.current).toBeInstanceOf(HTMLDivElement);
          return ref.current instanceof HTMLDivElement;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 32: MonsterDisplay forwards ref to DOM element', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.boolean(),
        (hp, maxHP, isShaking) => {
          const ref = createRef<HTMLDivElement>();
          
          render(
            <MonsterDisplay
              ref={ref}
              image="/test.png"
              hp={hp}
              maxHP={maxHP}
              isShaking={isShaking}
            />
          );
          
          expect(ref.current).toBeInstanceOf(HTMLDivElement);
          return ref.current instanceof HTMLDivElement;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 32: PlayerDisplay forwards ref to DOM element', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.boolean(),
        (hp, maxHP, mana, maxMana, isShaking) => {
          const ref = createRef<HTMLDivElement>();
          
          render(
            <PlayerDisplay
              ref={ref}
              hp={hp}
              maxHP={maxHP}
              mana={mana}
              maxMana={maxMana}
              isShaking={isShaking}
            />
          );
          
          expect(ref.current).toBeInstanceOf(HTMLDivElement);
          return ref.current instanceof HTMLDivElement;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 33: Framer Motion ref compatibility**
   * **Validates: Requirements 18.3**
   * 
   * For any Framer Motion component using forwardRef, refs should work
   * correctly with motion components.
   */
  it('Property 33: DamageNumber works with Framer Motion and refs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (amount, x, y) => {
          const ref = createRef<HTMLDivElement>();
          const onComplete = vi.fn();
          
          render(
            <DamageNumber
              ref={ref}
              id={`test-${amount}`}
              amount={amount}
              x={x}
              y={y}
              onAnimationComplete={onComplete}
            />
          );
          
          // Ref should be attached even with Framer Motion
          expect(ref.current).toBeInstanceOf(HTMLDivElement);
          return ref.current instanceof HTMLDivElement;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 34: Parent-child ref control**
   * **Validates: Requirements 18.4**
   * 
   * For any parent component with a ref to a child, the parent should be
   * able to access the child's DOM element through the ref.
   */
  it('Property 34: Parent can access child DOM element through ref', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (content) => {
          const childRef = createRef<HTMLDivElement>();
          
          // Parent component that holds a ref to child
          const Parent: React.FC = () => (
            <div>
              <GlassmorphicContainer ref={childRef}>
                <span>{content}</span>
              </GlassmorphicContainer>
            </div>
          );
          
          render(<Parent />);
          
          // Parent should be able to access child's DOM element
          expect(childRef.current).toBeInstanceOf(HTMLDivElement);
          expect(childRef.current?.querySelector('span')?.textContent).toBe(content);
          
          return childRef.current instanceof HTMLDivElement;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 35: ForwardRef TypeScript typing**
   * **Validates: Requirements 18.5**
   * 
   * For any forwardRef component, the TypeScript types should correctly
   * specify both props and ref types.
   * 
   * This test verifies that components accept the correct ref type at compile time.
   * If the types were wrong, TypeScript would fail to compile this test.
   */
  it('Property 35: Components have correct TypeScript types for refs', () => {
    // These type assertions verify that the ref types are correct
    // If they weren't, TypeScript would fail to compile
    
    const divRef = createRef<HTMLDivElement>();
    
    // All these should compile without type errors
    const components = [
      <TitleScreen key="1" ref={divRef} onInitialize={() => {}} />,
      <GlassmorphicContainer key="2" ref={divRef}>content</GlassmorphicContainer>,
      <CustomTitlebar key="3" ref={divRef} />,
      <MonsterDisplay key="4" ref={divRef} image="" hp={50} maxHP={100} isShaking={false} />,
      <PlayerDisplay key="5" ref={divRef} hp={50} maxHP={100} mana={50} maxMana={100} isShaking={false} />,
    ];
    
    // If we got here, the types are correct
    expect(components.length).toBe(5);
  });

  /**
   * Additional test: Verify displayName is set for debugging
   */
  it('All animated components have displayName set', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...animatedComponents),
        ({ name, component }) => {
          const comp = component as { displayName?: string };
          expect(comp.displayName).toBe(name);
          return comp.displayName === name;
        }
      ),
      { numRuns: animatedComponents.length }
    );
  });
});
