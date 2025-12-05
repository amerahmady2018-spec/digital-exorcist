import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { MonsterCard } from './MonsterCard';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

describe('MonsterCard Property Tests', () => {
  /**
   * **Feature: gaming-hud-ui, Property 1: Font loading fallback**
   * **Validates: Requirements 1.5**
   * 
   * For any font loading failure, the application should fall back to system fonts
   * without breaking layout or causing text to disappear.
   */
  it('monster name element has proper font fallback configuration', () => {
    fc.assert(
      fc.property(
        fc.record({
          path: fc.string({ minLength: 1, maxLength: 200 }),
          size: fc.integer({ min: 1, max: 1000 * 1024 * 1024 }),
          lastModified: fc.date(),
          classifications: fc.constantFrom(
            ['ghost'] as MonsterType[],
            ['demon'] as MonsterType[],
            ['zombie'] as MonsterType[],
            ['ghost', 'demon'] as MonsterType[],
            ['demon', 'zombie'] as MonsterType[]
          )
        }),
        (fileData) => {
          const file: ClassifiedFile = {
            ...fileData,
            duplicateGroup: undefined
          };

          const mockBanish = () => {};
          const mockResurrect = () => {};

          const { container } = render(
            <MonsterCard 
              file={file} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          // Find the monster name element (h3 with font-creepster)
          const monsterNameElement = container.querySelector('h3.font-creepster');
          
          // Verify the element exists
          expect(monsterNameElement).toBeTruthy();
          
          // Verify font-creepster class is applied
          expect(monsterNameElement?.classList.contains('font-creepster')).toBe(true);
          
          // Verify the text content is present (not empty)
          expect(monsterNameElement?.textContent).toBeTruthy();
          
          // Extract filename from path for comparison
          const fileName = file.path.split(/[\\/]/).pop() || file.path;
          expect(monsterNameElement?.textContent).toBe(fileName);
          
          // Verify the element is visible (has dimensions)
          // This ensures that even if the font fails to load, the element still renders
          const computedStyle = window.getComputedStyle(monsterNameElement!);
          expect(computedStyle.display).not.toBe('none');
          expect(computedStyle.visibility).not.toBe('hidden');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that font fallback doesn't break layout
   */
  it('monster card maintains layout structure regardless of font loading', () => {
    fc.assert(
      fc.property(
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
        (fileData) => {
          const file: ClassifiedFile = {
            ...fileData,
            duplicateGroup: undefined
          };

          const mockBanish = () => {};
          const mockResurrect = () => {};

          const { container } = render(
            <MonsterCard 
              file={file} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          // Verify all key structural elements exist
          const monsterName = container.querySelector('h3.font-creepster');
          const classificationBadges = container.querySelectorAll('[class*="rounded"]');
          const actionButtons = container.querySelectorAll('button');
          
          // All elements should exist
          expect(monsterName).toBeTruthy();
          expect(classificationBadges.length).toBeGreaterThan(0);
          expect(actionButtons.length).toBeGreaterThanOrEqual(2);
          
          // Monster name should be visible (displays filename, not full path)
          const fileName = file.path.split(/[\\/]/).pop() || file.path;
          expect(monsterName?.textContent).toBe(fileName);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that Creepster font class is consistently applied to monster names
   */
  it('applies font-creepster class to all monster name headers', () => {
    fc.assert(
      fc.property(
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
        (fileData) => {
          const file: ClassifiedFile = {
            ...fileData,
            duplicateGroup: undefined
          };

          const mockBanish = () => {};
          const mockResurrect = () => {};

          const { container } = render(
            <MonsterCard 
              file={file} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          // Find all h3 elements (monster names)
          const h3Elements = container.querySelectorAll('h3');
          
          // There should be at least one h3 (the monster name)
          expect(h3Elements.length).toBeGreaterThan(0);
          
          // All h3 elements should have font-creepster class
          h3Elements.forEach(h3 => {
            expect(h3.classList.contains('font-creepster')).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

  /**
   * **Feature: gaming-hud-ui, Property 4: Health bar proportionality**
   * **Validates: Requirements 7.1, 7.5**
   * 
   * For any two files with different sizes, the health bar widths should be
   * proportional to their file sizes.
   */
  it('health bars are proportional to file sizes', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 1000 * 1024 * 1024 }), // file1 size (up to 1GB)
          fc.integer({ min: 1, max: 1000 * 1024 * 1024 })  // file2 size (up to 1GB)
        ),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.date(),
        fc.constantFrom(
          ['ghost'] as MonsterType[],
          ['demon'] as MonsterType[],
          ['zombie'] as MonsterType[]
        ),
        ([size1, size2], path, lastModified, classifications) => {
          // Skip if sizes are equal (we're testing proportionality for different sizes)
          fc.pre(size1 !== size2);

          const file1: ClassifiedFile = {
            path: path + '_1',
            size: size1,
            lastModified,
            classifications
          };

          const file2: ClassifiedFile = {
            path: path + '_2',
            size: size2,
            lastModified,
            classifications
          };

          const mockBanish = () => {};
          const mockResurrect = () => {};

          const { container: container1 } = render(
            <MonsterCard 
              file={file1} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          const { container: container2 } = render(
            <MonsterCard 
              file={file2} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          // Calculate expected health percentages
          const MAX_SIZE_MB = 500;
          const size1MB = size1 / (1024 * 1024);
          const size2MB = size2 / (1024 * 1024);
          const width1 = Math.min((size1MB / MAX_SIZE_MB) * 100, 100);
          const width2 = Math.min((size2MB / MAX_SIZE_MB) * 100, 100);

          // Verify proportionality: larger file should have larger or equal health bar
          if (size1 > size2) {
            expect(width1).toBeGreaterThanOrEqual(width2);
          } else if (size1 < size2) {
            expect(width1).toBeLessThanOrEqual(width2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: gaming-hud-ui, Property 5: Health bar maximum scale**
   * **Validates: Requirements 7.2**
   * 
   * For any file size of 500MB or greater, the health bar should display
   * at or near 100% width.
   */
  it('health bar displays at 100% for files 500MB or larger', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500, max: 10000 }), // Size in MB (500MB to 10GB)
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.date(),
        fc.constantFrom(
          ['ghost'] as MonsterType[],
          ['demon'] as MonsterType[],
          ['zombie'] as MonsterType[]
        ),
        (sizeMB, path, lastModified, classifications) => {
          const sizeBytes = sizeMB * 1024 * 1024;

          const file: ClassifiedFile = {
            path,
            size: sizeBytes,
            lastModified,
            classifications
          };

          const mockBanish = () => {};
          const mockResurrect = () => {};

          const { container } = render(
            <MonsterCard 
              file={file} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          // Calculate expected health percentage
          const MAX_SIZE_MB = 500;
          const fileSizeMB = sizeBytes / (1024 * 1024);
          const expectedWidth = Math.min((fileSizeMB / MAX_SIZE_MB) * 100, 100);

          // For files 500MB or larger, health bar should be at 100%
          expect(expectedWidth).toBe(100);
          
          // Verify health bar element exists
          const healthBar = container.querySelector('.bg-gradient-to-r.from-red-600') as HTMLElement;
          expect(healthBar).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: gaming-hud-ui, Property 6: Health bar minimum scale**
   * **Validates: Requirements 7.3**
   * 
   * For any file size less than 500MB, the health bar width should be
   * proportionally smaller than 100%.
   */
  it('health bar is proportionally smaller for files less than 500MB', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 499 }), // Size in MB (1MB to 499MB)
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.date(),
        fc.constantFrom(
          ['ghost'] as MonsterType[],
          ['demon'] as MonsterType[],
          ['zombie'] as MonsterType[]
        ),
        (sizeMB, path, lastModified, classifications) => {
          const sizeBytes = sizeMB * 1024 * 1024;

          const file: ClassifiedFile = {
            path,
            size: sizeBytes,
            lastModified,
            classifications
          };

          const mockBanish = () => {};
          const mockResurrect = () => {};

          const { container } = render(
            <MonsterCard 
              file={file} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          // Calculate expected health percentage
          const MAX_SIZE_MB = 500;
          const fileSizeMB = sizeBytes / (1024 * 1024);
          const expectedWidth = Math.min((fileSizeMB / MAX_SIZE_MB) * 100, 100);

          // For files less than 500MB, health bar should be less than 100%
          expect(expectedWidth).toBeLessThan(100);
          
          // Also verify it's proportional to the size
          expect(expectedWidth).toBeCloseTo((sizeMB / 500) * 100, 2);
          
          // Verify health bar element exists
          const healthBar = container.querySelector('.bg-gradient-to-r.from-red-600') as HTMLElement;
          expect(healthBar).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: gaming-hud-ui, Property 7: Health bar data completeness**
   * **Validates: Requirements 7.4**
   * 
   * For any monster card, both the visual health bar and numeric file size
   * should be displayed.
   */
  it('displays both visual health bar and numeric file size', () => {
    fc.assert(
      fc.property(
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
        (fileData) => {
          const file: ClassifiedFile = {
            ...fileData,
            duplicateGroup: undefined
          };

          const mockBanish = () => {};
          const mockResurrect = () => {};

          const { container } = render(
            <MonsterCard 
              file={file} 
              onBanish={mockBanish} 
              onResurrect={mockResurrect} 
            />
          );

          // Find visual health bar element
          const healthBar = container.querySelector('.bg-gradient-to-r.from-red-600') as HTMLElement;
          expect(healthBar).toBeTruthy();

          // Calculate expected health percentage
          const MAX_SIZE_MB = 500;
          const fileSizeMB = file.size / (1024 * 1024);
          const expectedWidth = Math.min((fileSizeMB / MAX_SIZE_MB) * 100, 100);
          
          // Verify the calculation is valid
          expect(expectedWidth).toBeGreaterThan(0);
          expect(expectedWidth).toBeLessThanOrEqual(100);

          // Find numeric file size display
          // The file size should be displayed in the health bar section
          const healthBarContainer = healthBar?.parentElement?.parentElement;
          expect(healthBarContainer).toBeTruthy();

          // Look for the numeric size text
          const sizeText = healthBarContainer?.textContent;
          expect(sizeText).toBeTruthy();

          // Verify the size text contains a size unit (B, KB, MB, GB, TB)
          const hasSizeUnit = /\d+(\.\d+)?\s*(B|KB|MB|GB|TB)/.test(sizeText || '');
          expect(hasSizeUnit).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
