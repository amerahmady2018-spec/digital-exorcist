import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import StoryMode from './StoryMode';
import { STORY_ENTITIES } from '../data/storyEntities';
import { isStoryModePath } from '../utils/storyBattleAdapter';

/**
 * Property-Based Tests for StoryMode Component
 * 
 * Tests story mode isolation and battle triggering properties.
 * Flow: intro → scanning → overview → entity → victory → overview/summary
 */

// Helper to advance through scanning phase
const waitForScanningToComplete = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('story-overview')).toBeTruthy();
  }, { timeout: 6000 });
};

describe('StoryMode Property Tests', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 2: Story mode isolation from real filesystem
   * Validates: Requirements 1.3, 1.4, 6.2
   */
  it('Property 2: Story mode uses only fake file paths', async () => {
    const capturedEntities: { path: string }[] = [];
    const mockOnStartBattle = vi.fn((entity) => {
      capturedEntities.push({ path: entity.fakeFilePath });
    });

    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={mockOnStartBattle}
      />
    );

    // Start story and wait for overview
    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // Select first entity and fight
    fireEvent.click(screen.getByText(STORY_ENTITIES[0].name));
    await waitFor(() => expect(screen.getByTestId('entity-presentation')).toBeTruthy());
    fireEvent.click(screen.getByTestId('fight-button'));

    // All captured entities should have fake paths
    for (const entity of capturedEntities) {
      expect(isStoryModePath(entity.path)).toBe(true);
    }
  }, 10000);

  /**
   * Property 4: FIGHT button triggers battle mode
   * Validates: Requirements 3.1
   */
  it('Property 4: FIGHT button triggers onStartBattle with correct entity', async () => {
    const mockOnStartBattle = vi.fn();

    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={mockOnStartBattle}
      />
    );

    // Start story and wait for overview
    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // Select second entity (to test different entity)
    const targetEntity = STORY_ENTITIES[1];
    fireEvent.click(screen.getByText(targetEntity.name));
    await waitFor(() => expect(screen.getByTestId('entity-presentation')).toBeTruthy());

    // Click FIGHT
    fireEvent.click(screen.getByTestId('fight-button'));

    // Verify correct entity was passed
    expect(mockOnStartBattle).toHaveBeenCalledTimes(1);
    expect(mockOnStartBattle).toHaveBeenCalledWith(targetEntity);
  }, 10000);

  /**
   * Property: All story entities have valid fake paths
   */
  it('Property: All predefined story entities have fake file paths', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        for (const entity of STORY_ENTITIES) {
          expect(isStoryModePath(entity.fakeFilePath)).toBe(true);
          expect(entity.fakeFilePath).not.toBe('');
          expect(entity.fakeFileSize).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Story mode never passes real file paths to battle
   */
  it('Property: onStartBattle receives entity with fake path prefix', async () => {
    const mockOnStartBattle = vi.fn();

    render(
      <StoryMode
        onExit={() => {}}
        onStartBattle={mockOnStartBattle}
      />
    );

    // Start story and wait for overview
    fireEvent.click(screen.getByTestId('story-intro-button'));
    await waitForScanningToComplete();

    // Select first entity
    fireEvent.click(screen.getByText(STORY_ENTITIES[0].name));
    await waitFor(() => expect(screen.getByTestId('entity-presentation')).toBeTruthy());

    // Click FIGHT
    fireEvent.click(screen.getByTestId('fight-button'));

    expect(mockOnStartBattle).toHaveBeenCalledTimes(1);
    
    const passedEntity = mockOnStartBattle.mock.calls[0][0];
    expect(passedEntity.fakeFilePath.startsWith('/fake/')).toBe(true);
  }, 10000);
});
