import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import StoryMode from './StoryMode';
import { STORY_ENTITIES } from '../data/storyEntities';

/**
 * Integration tests for StoryMode component
 * 
 * Tests the full flow: intro → scanning → overview → entity → victory → overview/summary
 * Requirements: 1.1, 3.1, 3.2, 6.4
 */

// Helper to advance through scanning phase (auto-completes after timeout)
const waitForScanningToComplete = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('story-overview')).toBeTruthy();
  }, { timeout: 6000 });
};

describe('StoryMode Integration Tests', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders story intro on initial mount', () => {
    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={() => {}}
      />
    );

    expect(screen.getByTestId('story-mode')).toBeTruthy();
    expect(screen.getByTestId('story-intro')).toBeTruthy();
    expect(screen.getByTestId('story-intro-title').textContent).toBe('The Ritual Begins');
  });

  it('transitions from intro to scanning when Begin button clicked', async () => {
    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={() => {}}
      />
    );

    const beginButton = screen.getByTestId('story-intro-button');
    fireEvent.click(beginButton);

    await waitFor(() => {
      expect(screen.getByTestId('story-scanning')).toBeTruthy();
    });
  });

  it('transitions from scanning to overview automatically', async () => {
    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();
    
    expect(screen.getByTestId('story-overview')).toBeTruthy();
  }, 10000);

  it('overview shows all 3 entities', async () => {
    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // All entity names should be visible
    for (const entity of STORY_ENTITIES) {
      expect(screen.getByText(entity.name)).toBeTruthy();
    }
  }, 10000);

  it('clicking entity in overview shows entity detail', async () => {
    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // Click on first entity (by its name)
    const entityCard = screen.getByText(STORY_ENTITIES[0].name);
    fireEvent.click(entityCard);

    await waitFor(() => {
      expect(screen.getByTestId('entity-presentation')).toBeTruthy();
    });

    expect(screen.getByTestId('entity-name').textContent).toBe(STORY_ENTITIES[0].name);
  }, 10000);

  it('FIGHT button triggers onStartBattle callback with current entity', async () => {
    const mockOnStartBattle = vi.fn();

    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={mockOnStartBattle}
      />
    );

    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // Select first entity
    fireEvent.click(screen.getByText(STORY_ENTITIES[0].name));

    await waitFor(() => {
      expect(screen.getByTestId('entity-presentation')).toBeTruthy();
    });

    // Click FIGHT
    fireEvent.click(screen.getByTestId('fight-button'));

    expect(mockOnStartBattle).toHaveBeenCalledTimes(1);
    expect(mockOnStartBattle).toHaveBeenCalledWith(STORY_ENTITIES[0]);
  }, 10000);

  it('Skip button shows victory screen with skipped outcome', async () => {
    const mockOnStartBattle = vi.fn();

    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={mockOnStartBattle}
      />
    );

    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // Select first entity
    fireEvent.click(screen.getByText(STORY_ENTITIES[0].name));

    await waitFor(() => {
      expect(screen.getByTestId('entity-presentation')).toBeTruthy();
    });

    // Click Skip
    fireEvent.click(screen.getByTestId('skip-button'));

    await waitFor(() => {
      expect(screen.getByTestId('story-victory')).toBeTruthy();
    });

    // Should show SPARED text
    expect(screen.getByText('SPARED')).toBeTruthy();

    // Battle should not have been triggered
    expect(mockOnStartBattle).not.toHaveBeenCalled();
  }, 10000);

  it('back button returns to overview from entity detail', async () => {
    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // Select first entity
    fireEvent.click(screen.getByText(STORY_ENTITIES[0].name));

    await waitFor(() => {
      expect(screen.getByTestId('entity-presentation')).toBeTruthy();
    });

    // Click back
    fireEvent.click(screen.getByTestId('back-button'));

    await waitFor(() => {
      expect(screen.getByTestId('story-overview')).toBeTruthy();
    });
  }, 10000);

  it('applies custom className', () => {
    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={() => {}}
        className="custom-test-class"
      />
    );

    const container = screen.getByTestId('story-mode');
    expect(container.className).toContain('custom-test-class');
  });
});
