import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StorySummary, { calculateStats, EntityResult } from './StorySummary';
import type { StoryEntity } from '../data/storyEntities';

/**
 * Unit tests for StorySummary component
 * 
 * Tests verify:
 * - Statistics are calculated correctly from results
 * - Replay button calls onReplay
 * - Exit button calls onExit
 * 
 * Requirements: 6.4, 7.2, 7.3
 */

// Mock entities for testing
const mockEntities: StoryEntity[] = [
  {
    id: 'test-ghost-1',
    name: 'Test Ghost',
    type: 'ghost',
    image: '/test/ghost.png',
    hp: 50,
    threatLevel: 'Low',
    lore: 'A test ghost entity',
    fakeFilePath: '/fake/test1.log',
    fakeFileSize: 5 * 1024 * 1024,
  },
  {
    id: 'test-demon-1',
    name: 'Test Demon',
    type: 'demon',
    image: '/test/demon.png',
    hp: 150,
    threatLevel: 'High',
    lore: 'A test demon entity',
    fakeFilePath: '/fake/test2.zip',
    fakeFileSize: 15 * 1024 * 1024,
  },
  {
    id: 'test-zombie-1',
    name: 'Test Zombie',
    type: 'zombie',
    image: '/test/zombie.png',
    hp: 80,
    threatLevel: 'Medium',
    lore: 'A test zombie entity',
    fakeFilePath: '/fake/test3.pdf',
    fakeFileSize: 8 * 1024 * 1024,
  },
];

describe('StorySummary', () => {
  describe('calculateStats', () => {
    it('calculates correct counts for all banished', () => {
      const results: EntityResult[] = [
        { entityId: 'test-1', outcome: 'banished' },
        { entityId: 'test-2', outcome: 'banished' },
        { entityId: 'test-3', outcome: 'banished' },
      ];

      const stats = calculateStats(results);

      expect(stats.banished).toBe(3);
      expect(stats.skipped).toBe(0);
      expect(stats.survived).toBe(0);
    });

    it('calculates correct counts for all skipped', () => {
      const results: EntityResult[] = [
        { entityId: 'test-1', outcome: 'skipped' },
        { entityId: 'test-2', outcome: 'skipped' },
        { entityId: 'test-3', outcome: 'skipped' },
      ];

      const stats = calculateStats(results);

      expect(stats.banished).toBe(0);
      expect(stats.skipped).toBe(3);
      expect(stats.survived).toBe(0);
    });

    it('calculates correct counts for all survived', () => {
      const results: EntityResult[] = [
        { entityId: 'test-1', outcome: 'survived' },
        { entityId: 'test-2', outcome: 'survived' },
        { entityId: 'test-3', outcome: 'survived' },
      ];

      const stats = calculateStats(results);

      expect(stats.banished).toBe(0);
      expect(stats.skipped).toBe(0);
      expect(stats.survived).toBe(3);
    });

    it('calculates correct counts for mixed outcomes', () => {
      const results: EntityResult[] = [
        { entityId: 'test-1', outcome: 'banished' },
        { entityId: 'test-2', outcome: 'skipped' },
        { entityId: 'test-3', outcome: 'survived' },
      ];

      const stats = calculateStats(results);

      expect(stats.banished).toBe(1);
      expect(stats.skipped).toBe(1);
      expect(stats.survived).toBe(1);
    });

    it('returns zeros for empty results', () => {
      const results: EntityResult[] = [];

      const stats = calculateStats(results);

      expect(stats.banished).toBe(0);
      expect(stats.skipped).toBe(0);
      expect(stats.survived).toBe(0);
    });
  });

  describe('Rendering', () => {
    it('renders the story summary container', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      const container = screen.getByTestId('story-summary');
      expect(container).toBeTruthy();
    });

    it('renders "The Ritual Complete" title', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      const title = screen.getByTestId('story-summary-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('The Ritual Complete');
    });

    it('renders narrative text', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      const narrative = screen.getByTestId('story-summary-narrative');
      expect(narrative).toBeTruthy();
      expect(narrative.textContent).toContain('training is complete');
    });

    it('renders statistics section', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      expect(screen.getByTestId('story-summary-stats')).toBeTruthy();
      expect(screen.getByTestId('stat-banished')).toBeTruthy();
      expect(screen.getByTestId('stat-skipped')).toBeTruthy();
      expect(screen.getByTestId('stat-survived')).toBeTruthy();
    });

    it('displays correct statistics from results', () => {
      const results: EntityResult[] = [
        { entityId: 'test-ghost-1', outcome: 'banished' },
        { entityId: 'test-demon-1', outcome: 'skipped' },
        { entityId: 'test-zombie-1', outcome: 'survived' },
      ];

      render(
        <StorySummary
          results={results}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      const banishedStat = screen.getByTestId('stat-banished');
      const skippedStat = screen.getByTestId('stat-skipped');
      const survivedStat = screen.getByTestId('stat-survived');

      expect(banishedStat.textContent).toContain('1');
      expect(skippedStat.textContent).toContain('1');
      expect(survivedStat.textContent).toContain('1');
    });

    it('displays total entities count', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      const total = screen.getByTestId('story-summary-total');
      expect(total.textContent).toContain('3 entities');
    });

    it('renders replay button', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      const replayButton = screen.getByTestId('story-summary-replay-button');
      expect(replayButton).toBeTruthy();
      expect(replayButton.textContent).toBe('Replay Ritual');
    });

    it('renders exit button', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
        />
      );

      const exitButton = screen.getByTestId('story-summary-exit-button');
      expect(exitButton).toBeTruthy();
      expect(exitButton.textContent).toBe('Exit to Menu');
    });

    it('applies custom className when provided', () => {
      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={() => {}}
          className="custom-class"
        />
      );

      const container = screen.getByTestId('story-summary');
      expect(container.className).toContain('custom-class');
    });
  });

  describe('Interactions', () => {
    it('calls onReplay when replay button is clicked', () => {
      const mockOnReplay = vi.fn();

      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={mockOnReplay}
          onExit={() => {}}
        />
      );

      const replayButton = screen.getByTestId('story-summary-replay-button');
      fireEvent.click(replayButton);

      expect(mockOnReplay).toHaveBeenCalledTimes(1);
    });

    it('calls onExit when exit button is clicked', () => {
      const mockOnExit = vi.fn();

      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={mockOnExit}
        />
      );

      const exitButton = screen.getByTestId('story-summary-exit-button');
      fireEvent.click(exitButton);

      expect(mockOnExit).toHaveBeenCalledTimes(1);
    });

    it('calls onReplay each time replay button is clicked', () => {
      const mockOnReplay = vi.fn();

      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={mockOnReplay}
          onExit={() => {}}
        />
      );

      const replayButton = screen.getByTestId('story-summary-replay-button');
      fireEvent.click(replayButton);
      fireEvent.click(replayButton);
      fireEvent.click(replayButton);

      expect(mockOnReplay).toHaveBeenCalledTimes(3);
    });

    it('calls onExit each time exit button is clicked', () => {
      const mockOnExit = vi.fn();

      render(
        <StorySummary
          results={[]}
          entities={mockEntities}
          onReplay={() => {}}
          onExit={mockOnExit}
        />
      );

      const exitButton = screen.getByTestId('story-summary-exit-button');
      fireEvent.click(exitButton);
      fireEvent.click(exitButton);

      expect(mockOnExit).toHaveBeenCalledTimes(2);
    });
  });
});
