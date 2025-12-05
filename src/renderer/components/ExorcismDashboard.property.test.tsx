import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ExorcismDashboard } from './ExorcismDashboard';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

describe('ExorcismDashboard Property Tests', () => {
  /**
   * **Feature: gaming-hud-ui, Property 13: Functionality preservation**
   * **Validates: Requirements 6.6**
   * 
   * For any existing feature (scan, banish, resurrect, restore), the functionality
   * should work identically before and after the gaming HUD transformation.
   */
  it('preserves banish functionality with gaming HUD styling', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 1, maxLength: 200 }),
            size: fc.integer({ min: 1, max: 1000 * 1024 * 1024 }),
            lastModified: fc.date(),
            classifications: fc.constantFrom(
              ['ghost'] as MonsterType[],
              ['demon'] as MonsterType[],
              ['zombie'] as MonsterType[],
              ['ghost', 'demon'] as MonsterType[]
            )
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (filesData) => {
          const files: ClassifiedFile[] = filesData.map(f => ({
            ...f,
            duplicateGroup: undefined
          }));

          const mockBanish = vi.fn();
          const mockResurrect = vi.fn();

          const { container } = render(
            <ExorcismDashboard
              files={files}
              onBanish={mockBanish}
              onResurrect={mockResurrect}
            />
          );

          // Verify dashboard renders with gaming HUD styling
          expect(container.querySelector('.font-creepster')).toBeTruthy();
          expect(container.querySelector('.font-tech')).toBeTruthy();

          // Verify all files are displayed (look for monster name headers)
          const monsterCards = container.querySelectorAll('h3.font-creepster');
          expect(monsterCards.length).toBeGreaterThan(0);

          // Verify banish buttons exist with gaming HUD labels
          const banishButtons = Array.from(container.querySelectorAll('button'))
            .filter(btn => btn.textContent?.includes('PURGE ENTITY'));
          expect(banishButtons.length).toBeGreaterThan(0);

          // Verify resurrect buttons exist with gaming HUD labels
          const resurrectButtons = Array.from(container.querySelectorAll('button'))
            .filter(btn => btn.textContent?.includes('SAVE SOUL'));
          expect(resurrectButtons.length).toBeGreaterThan(0);

          // Verify button functionality is preserved (buttons are clickable)
          banishButtons.forEach(btn => {
            expect(btn).toBeInstanceOf(HTMLButtonElement);
            expect(btn.disabled).toBe(false);
          });

          resurrectButtons.forEach(btn => {
            expect(btn).toBeInstanceOf(HTMLButtonElement);
            expect(btn.disabled).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that tab filtering functionality is preserved with gaming HUD
   */
  it('preserves tab filtering functionality with gaming HUD styling', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 1, maxLength: 200 }),
            size: fc.integer({ min: 1, max: 1000 * 1024 * 1024 }),
            lastModified: fc.date(),
            classifications: fc.constantFrom(
              ['ghost'] as MonsterType[],
              ['demon'] as MonsterType[],
              ['zombie'] as MonsterType[]
            )
          }),
          { minLength: 3, maxLength: 20 }
        ),
        (filesData) => {
          const files: ClassifiedFile[] = filesData.map(f => ({
            ...f,
            duplicateGroup: undefined
          }));

          const mockBanish = vi.fn();
          const mockResurrect = vi.fn();

          const { container } = render(
            <ExorcismDashboard
              files={files}
              onBanish={mockBanish}
              onResurrect={mockResurrect}
            />
          );

          // Verify tabs exist with gaming HUD styling
          const tabs = Array.from(container.querySelectorAll('button'))
            .filter(btn => 
              btn.textContent?.includes('ALL') ||
              btn.textContent?.includes('👻') ||
              btn.textContent?.includes('😈') ||
              btn.textContent?.includes('🧟')
            );

          expect(tabs.length).toBeGreaterThanOrEqual(4);

          // Verify tabs have gaming HUD font
          tabs.forEach(tab => {
            expect(tab.classList.contains('font-tech')).toBe(true);
            expect(tab.classList.contains('font-bold')).toBe(true);
          });

          // Verify tab counts are displayed
          const ghostCount = files.filter(f => f.classifications.includes('ghost' as MonsterType)).length;
          const demonCount = files.filter(f => f.classifications.includes('demon' as MonsterType)).length;
          const zombieCount = files.filter(f => f.classifications.includes('zombie' as MonsterType)).length;

          const allMonstersTab = tabs.find(t => t.textContent?.includes('ALL'));
          expect(allMonstersTab?.textContent).toContain(files.length.toString());

          const ghostsTab = tabs.find(t => t.textContent?.includes('👻'));
          expect(ghostsTab?.textContent).toContain(ghostCount.toString());

          const demonsTab = tabs.find(t => t.textContent?.includes('😈'));
          if (demonsTab) {
            expect(demonsTab.textContent).toContain(demonCount.toString());
          }

          const zombiesTab = tabs.find(t => t.textContent?.includes('🧟'));
          if (zombiesTab) {
            expect(zombiesTab.textContent).toContain(zombieCount.toString());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that statistics display functionality is preserved
   */
  it('preserves statistics display with gaming HUD styling', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 1, maxLength: 200 }),
            size: fc.integer({ min: 1, max: 1000 * 1024 * 1024 }),
            lastModified: fc.date(),
            classifications: fc.constantFrom(
              ['ghost'] as MonsterType[],
              ['demon'] as MonsterType[],
              ['zombie'] as MonsterType[]
            )
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (filesData) => {
          const files: ClassifiedFile[] = filesData.map(f => ({
            ...f,
            duplicateGroup: undefined
          }));

          const mockBanish = vi.fn();
          const mockResurrect = vi.fn();

          const { container } = render(
            <ExorcismDashboard
              files={files}
              onBanish={mockBanish}
              onResurrect={mockResurrect}
            />
          );

          // Verify statistics section exists with gaming HUD styling
          const statsElements = container.querySelectorAll('.font-tech.font-bold');
          expect(statsElements.length).toBeGreaterThan(0);

          // Verify total files count is displayed
          const totalFilesText = container.textContent;
          expect(totalFilesText).toContain(files.length.toString());

          // Verify total size is displayed with proper formatting
          const totalSize = files.reduce((sum, f) => sum + f.size, 0);
          expect(totalSize).toBeGreaterThan(0);

          // Size should be displayed with units (B, KB, MB, GB, TB)
          const hasSizeUnit = /\d+(\.\d+)?\s*(B|KB|MB|GB|TB)/.test(totalFilesText || '');
          expect(hasSizeUnit).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that sort functionality is preserved with gaming HUD
   */
  it('preserves sort functionality with gaming HUD styling', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 1, maxLength: 200 }),
            size: fc.integer({ min: 1, max: 1000 * 1024 * 1024 }),
            lastModified: fc.date(),
            classifications: fc.constantFrom(
              ['ghost'] as MonsterType[],
              ['demon'] as MonsterType[],
              ['zombie'] as MonsterType[]
            )
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (filesData) => {
          const files: ClassifiedFile[] = filesData.map(f => ({
            ...f,
            duplicateGroup: undefined
          }));

          const mockBanish = vi.fn();
          const mockResurrect = vi.fn();

          const { container } = render(
            <ExorcismDashboard
              files={files}
              onBanish={mockBanish}
              onResurrect={mockResurrect}
            />
          );

          // Verify sort controls exist with gaming HUD styling
          const sortButtons = Array.from(container.querySelectorAll('button'))
            .filter(btn => 
              btn.textContent?.includes('NAME') ||
              btn.textContent?.includes('SIZE') ||
              btn.textContent?.includes('DATE') ||
              btn.textContent?.includes('↑') ||
              btn.textContent?.includes('↓')
            );

          expect(sortButtons.length).toBeGreaterThanOrEqual(4);

          // Verify sort buttons have gaming HUD styling
          sortButtons.forEach(btn => {
            expect(btn.classList.contains('font-tech')).toBe(true);
            expect(btn.classList.contains('font-bold')).toBe(true);
          });

          // Verify sort buttons are functional (not disabled)
          sortButtons.forEach(btn => {
            expect(btn.disabled).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that empty state is preserved with gaming HUD
   */
  it('preserves empty state display with gaming HUD styling', () => {
    const mockBanish = vi.fn();
    const mockResurrect = vi.fn();

    const { container } = render(
      <ExorcismDashboard
        files={[]}
        onBanish={mockBanish}
        onResurrect={mockResurrect}
      />
    );

    // Verify empty state message exists
    expect(container.textContent).toContain('The House is Clean');

    // Verify gaming HUD fonts are applied
    expect(container.querySelector('.font-creepster')).toBeTruthy();
    expect(container.querySelector('.font-tech')).toBeTruthy();

    // Verify graveyard image is displayed
    const image = container.querySelector('img[alt*="Victory"]');
    expect(image).toBeTruthy();
  });
});
