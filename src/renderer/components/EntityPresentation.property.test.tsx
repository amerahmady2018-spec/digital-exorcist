import { describe, it, expect, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import EntityPresentation from './EntityPresentation';
import type { StoryEntity, ThreatLevel } from '../data/storyEntities';
import type { MonsterType } from '../../shared/types';

/**
 * Property Test: Entity presentation completeness
 * 
 * Property 3: All entity fields must be displayed correctly
 * Validates: Requirements 2.1, 2.2
 * 
 * For any valid StoryEntity, the EntityPresentation component must:
 * - Display the entity name
 * - Display the entity type badge
 * - Display the entity HP
 * - Display the entity threat level
 * - Display the entity lore
 * - Display the entity image
 */

// Arbitrary for MonsterType
const monsterTypeArb = fc.constantFrom<MonsterType>('ghost', 'demon', 'zombie');

// Arbitrary for ThreatLevel
const threatLevelArb = fc.constantFrom<ThreatLevel>('Low', 'Medium', 'High');

// Arbitrary for StoryEntity with valid non-empty strings
const storyEntityArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  type: monsterTypeArb,
  image: fc.string({ minLength: 1 }),
  hp: fc.integer({ min: 1, max: 1000 }),
  threatLevel: threatLevelArb,
  lore: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  fakeFilePath: fc.string({ minLength: 1 }),
  fakeFileSize: fc.integer({ min: 1, max: 1000000000 }),
}) as fc.Arbitrary<StoryEntity>;

describe('EntityPresentation Property Tests', () => {
  it('Property 3: All entity fields are displayed for any valid entity', () => {
    fc.assert(
      fc.property(
        storyEntityArb,
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 1, max: 100 }),
        (entity, currentIndex, totalEntities) => {
          // Cleanup before each render to avoid multiple elements
          cleanup();
          
          // Ensure currentIndex is valid
          const validIndex = Math.min(currentIndex, totalEntities - 1);
          
          const { container } = render(
            <EntityPresentation
              entity={entity}
              currentIndex={validIndex}
              totalEntities={totalEntities}
              onFight={() => {}}
              onSkip={() => {}}
            />
          );

          // Entity name must be displayed
          const nameElement = container.querySelector('[data-testid="entity-name"]');
          expect(nameElement).toBeTruthy();
          expect(nameElement?.textContent).toBe(entity.name);

          // Entity type badge must be displayed
          const typeBadge = container.querySelector('[data-testid="entity-type-badge"]');
          expect(typeBadge).toBeTruthy();
          expect(typeBadge?.textContent?.toLowerCase()).toBe(entity.type.toLowerCase());

          // Entity HP must be displayed
          const hpElement = container.querySelector('[data-testid="entity-hp"]');
          expect(hpElement).toBeTruthy();
          expect(hpElement?.textContent).toBe(String(entity.hp));

          // Entity threat level must be displayed
          const threatElement = container.querySelector('[data-testid="entity-threat-level"]');
          expect(threatElement).toBeTruthy();
          expect(threatElement?.textContent).toBe(entity.threatLevel);

          // Entity lore must be displayed
          const loreElement = container.querySelector('[data-testid="entity-lore"]');
          expect(loreElement).toBeTruthy();
          expect(loreElement?.textContent).toBe(entity.lore);

          // Entity image must be present
          const imageElement = container.querySelector('[data-testid="entity-image"]');
          expect(imageElement).toBeTruthy();
          expect(imageElement?.getAttribute('alt')).toBe(entity.name);

          // Progress indicator must show correct values
          const currentIndexElement = container.querySelector('[data-testid="current-index"]');
          expect(currentIndexElement?.textContent).toBe(String(validIndex + 1));
          
          const totalElement = container.querySelector('[data-testid="total-entities"]');
          expect(totalElement?.textContent).toBe(String(totalEntities));
        }
      ),
      { numRuns: 20 } // Limit runs for performance
    );
  });

  it('Property: FIGHT and Skip buttons are always present and accessible', () => {
    fc.assert(
      fc.property(storyEntityArb, (entity) => {
        // Cleanup before each render
        cleanup();
        
        const mockOnFight = vi.fn();
        const mockOnSkip = vi.fn();
        
        const { container } = render(
          <EntityPresentation
            entity={entity}
            currentIndex={0}
            totalEntities={3}
            onFight={mockOnFight}
            onSkip={mockOnSkip}
          />
        );

        const fightButton = container.querySelector('[data-testid="fight-button"]') as HTMLButtonElement;
        const skipButton = container.querySelector('[data-testid="skip-button"]') as HTMLButtonElement;

        expect(fightButton).toBeTruthy();
        expect(skipButton).toBeTruthy();
        expect(fightButton?.disabled).toBeFalsy();
        expect(skipButton?.disabled).toBeFalsy();
        
        // Verify buttons have correct text
        expect(fightButton?.textContent).toBe('FIGHT');
        expect(skipButton?.textContent).toBe('Skip');
      }),
      { numRuns: 10 }
    );
  });

  it('Property: Clicking FIGHT button triggers onFight callback', () => {
    fc.assert(
      fc.property(storyEntityArb, (entity) => {
        cleanup();
        
        const mockOnFight = vi.fn();
        
        const { container } = render(
          <EntityPresentation
            entity={entity}
            currentIndex={0}
            totalEntities={3}
            onFight={mockOnFight}
            onSkip={() => {}}
          />
        );

        const fightButton = container.querySelector('[data-testid="fight-button"]');
        fightButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        expect(mockOnFight).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 10 }
    );
  });

  it('Property: Clicking Skip button triggers onSkip callback', () => {
    fc.assert(
      fc.property(storyEntityArb, (entity) => {
        cleanup();
        
        const mockOnSkip = vi.fn();
        
        const { container } = render(
          <EntityPresentation
            entity={entity}
            currentIndex={0}
            totalEntities={3}
            onFight={() => {}}
            onSkip={mockOnSkip}
          />
        );

        const skipButton = container.querySelector('[data-testid="skip-button"]');
        skipButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        expect(mockOnSkip).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 10 }
    );
  });
});
