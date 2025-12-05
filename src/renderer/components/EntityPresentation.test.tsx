import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EntityPresentation from './EntityPresentation';
import type { StoryEntity } from '../data/storyEntities';

/**
 * Unit Tests for EntityPresentation component
 * 
 * Tests:
 * - All entity fields are displayed
 * - FIGHT button calls onFight
 * - Skip button calls onSkip
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

const mockEntity: StoryEntity = {
  id: 'test-ghost-1',
  name: 'The Forgotten Log',
  type: 'ghost',
  image: '/assets/monsters/ghost.png',
  hp: 50,
  threatLevel: 'Low',
  lore: 'An ancient log file from 2019, abandoned and forgotten.',
  fakeFilePath: '/fake/story/old_debug.log',
  fakeFileSize: 5 * 1024 * 1024,
};

const mockDemonEntity: StoryEntity = {
  id: 'test-demon-1',
  name: 'The Bloated Archive',
  type: 'demon',
  image: '/assets/monsters/demon.png',
  hp: 150,
  threatLevel: 'High',
  lore: 'A massive archive that grew beyond control.',
  fakeFilePath: '/fake/story/massive_backup.zip',
  fakeFileSize: 15 * 1024 * 1024,
};

const mockZombieEntity: StoryEntity = {
  id: 'test-zombie-1',
  name: 'The Duplicate Shade',
  type: 'zombie',
  image: '/assets/monsters/zombie.png',
  hp: 80,
  threatLevel: 'Medium',
  lore: 'A copy of a copy of a copy.',
  fakeFilePath: '/fake/story/document_copy.pdf',
  fakeFileSize: 8 * 1024 * 1024,
};

describe('EntityPresentation', () => {
  describe('Entity field display', () => {
    it('displays entity name', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const nameElement = container.querySelector('[data-testid="entity-name"]');
      expect(nameElement).toBeTruthy();
      expect(nameElement?.textContent).toBe('The Forgotten Log');
    });

    it('displays entity type badge', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const badge = container.querySelector('[data-testid="entity-type-badge"]');
      expect(badge).toBeTruthy();
      expect(badge?.textContent?.toLowerCase()).toContain('ghost');
    });

    it('displays entity HP', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const hpElement = container.querySelector('[data-testid="entity-hp"]');
      expect(hpElement).toBeTruthy();
      expect(hpElement?.textContent).toBe('50');
    });

    it('displays entity threat level', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const threatElement = container.querySelector('[data-testid="entity-threat-level"]');
      expect(threatElement).toBeTruthy();
      expect(threatElement?.textContent).toBe('Low');
    });

    it('displays entity lore', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const loreElement = container.querySelector('[data-testid="entity-lore"]');
      expect(loreElement).toBeTruthy();
      expect(loreElement?.textContent).toBe('An ancient log file from 2019, abandoned and forgotten.');
    });

    it('displays entity image with correct alt text', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const image = container.querySelector('[data-testid="entity-image"]') as HTMLImageElement;
      expect(image).toBeTruthy();
      expect(image?.getAttribute('alt')).toBe('The Forgotten Log');
    });

    it('displays progress indicator correctly', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={1}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const currentIndex = container.querySelector('[data-testid="current-index"]');
      const totalEntities = container.querySelector('[data-testid="total-entities"]');
      expect(currentIndex?.textContent).toBe('2');
      expect(totalEntities?.textContent).toBe('3');
    });
  });

  describe('Different entity types', () => {
    it('displays demon entity correctly', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockDemonEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      expect(container.querySelector('[data-testid="entity-name"]')?.textContent).toBe('The Bloated Archive');
      expect(container.querySelector('[data-testid="entity-type-badge"]')?.textContent?.toLowerCase()).toContain('demon');
      expect(container.querySelector('[data-testid="entity-hp"]')?.textContent).toBe('150');
      expect(container.querySelector('[data-testid="entity-threat-level"]')?.textContent).toBe('High');
    });

    it('displays zombie entity correctly', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockZombieEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      expect(container.querySelector('[data-testid="entity-name"]')?.textContent).toBe('The Duplicate Shade');
      expect(container.querySelector('[data-testid="entity-type-badge"]')?.textContent?.toLowerCase()).toContain('zombie');
      expect(container.querySelector('[data-testid="entity-hp"]')?.textContent).toBe('80');
      expect(container.querySelector('[data-testid="entity-threat-level"]')?.textContent).toBe('Medium');
    });
  });

  describe('Button interactions', () => {
    it('calls onFight when FIGHT button is clicked', () => {
      const onFight = vi.fn();
      render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={onFight}
          onSkip={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('fight-button'));
      expect(onFight).toHaveBeenCalledTimes(1);
    });

    it('calls onSkip when Skip button is clicked', () => {
      const onSkip = vi.fn();
      render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={onSkip}
        />
      );

      fireEvent.click(screen.getByTestId('skip-button'));
      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it('FIGHT button has correct text', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const fightButton = container.querySelector('[data-testid="fight-button"]');
      expect(fightButton?.textContent).toBe('FIGHT');
    });

    it('Skip button has correct text', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={3}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      const skipButton = container.querySelector('[data-testid="skip-button"]');
      expect(skipButton?.textContent).toBe('Skip');
    });
  });

  describe('Progress indicator edge cases', () => {
    it('displays first entity correctly (index 0)', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={5}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      expect(container.querySelector('[data-testid="current-index"]')?.textContent).toBe('1');
      expect(container.querySelector('[data-testid="total-entities"]')?.textContent).toBe('5');
    });

    it('displays last entity correctly', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={4}
          totalEntities={5}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      expect(container.querySelector('[data-testid="current-index"]')?.textContent).toBe('5');
      expect(container.querySelector('[data-testid="total-entities"]')?.textContent).toBe('5');
    });

    it('displays single entity correctly', () => {
      const { container } = render(
        <EntityPresentation
          entity={mockEntity}
          currentIndex={0}
          totalEntities={1}
          onFight={() => {}}
          onSkip={() => {}}
        />
      );

      expect(container.querySelector('[data-testid="current-index"]')?.textContent).toBe('1');
      expect(container.querySelector('[data-testid="total-entities"]')?.textContent).toBe('1');
    });
  });
});
