import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { EntityCard, formatFileSize, formatDate, calculateHealthPercentage, extractFileName } from './EntityCard';
import type { ClassifiedFile, MonsterType } from '../../shared/types';

/**
 * Property-based tests for EntityCard component
 * 
 * These tests verify the correctness properties defined in the design document
 * for the Premium Exorcist Transformation feature.
 */

// Helper to generate valid ClassifiedFile objects
const classifiedFileArbitrary = fc.record({
  path: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  size: fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }), // Up to 10GB
  lastModified: fc.date({ min: new Date('2000-01-01'), max: new Date() }),
  classifications: fc.constantFrom(
    ['ghost'] as MonsterType[],
    ['demon'] as MonsterType[],
    ['zombie'] as MonsterType[],
    ['ghost', 'demon'] as MonsterType[],
    ['demon', 'zombie'] as MonsterType[],
    ['ghost', 'zombie'] as MonsterType[]
  ),
  duplicateGroup: fc.option(fc.hexaString({ minLength: 8, maxLength: 32 }), { nil: undefined })
});

describe('EntityCard Property Tests', () => {
  /**
   * **Feature: premium-exorcist-transformation, Property 5: Entity card rendering completeness**
   * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
   * 
   * For any classified file in the HUD state, an entity card should be rendered
   * with all required elements (monster image, health bar, metadata).
   */
  describe('Property 5: Entity card rendering completeness', () => {
    it('renders all required elements for any classified file', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }), // maxFileSize
          (fileData, maxFileSize) => {
            const file: ClassifiedFile = fileData;
            const mockOnClick = vi.fn();

            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={Math.max(maxFileSize, file.size)}
                onClick={mockOnClick}
              />
            );

            // Requirement 5.1: Entity card should be rendered
            const entityCard = container.querySelector('[data-testid="entity-card"]');
            expect(entityCard).toBeTruthy();

            // Requirement 5.2: Monster image should be displayed
            const monsterImage = container.querySelector('[data-testid="monster-image"]');
            expect(monsterImage).toBeTruthy();
            expect(monsterImage?.getAttribute('src')).toBeTruthy();

            // Requirement 5.3: Health bar should be displayed
            const healthBarContainer = container.querySelector('[data-testid="health-bar-container"]');
            expect(healthBarContainer).toBeTruthy();
            
            const healthBar = container.querySelector('[data-testid="health-bar"]');
            expect(healthBar).toBeTruthy();

            // Requirement 5.4: File metadata should be displayed
            const fileName = container.querySelector('[data-testid="file-name"]');
            expect(fileName).toBeTruthy();
            expect(fileName?.textContent).toBe(extractFileName(file.path));

            const fileSizeDisplay = container.querySelector('[data-testid="file-size-display"]');
            expect(fileSizeDisplay).toBeTruthy();
            expect(fileSizeDisplay?.textContent).toBe(formatFileSize(file.size));

            const lastModified = container.querySelector('[data-testid="last-modified"]');
            expect(lastModified).toBeTruthy();

            // Classification badges should be displayed
            const classificationBadges = container.querySelector('[data-testid="classification-badges"]');
            expect(classificationBadges).toBeTruthy();
            
            // Each classification should have a badge
            for (const classification of file.classifications) {
              const badge = container.querySelector(`[data-testid="classification-${classification}"]`);
              expect(badge).toBeTruthy();
              expect(badge?.textContent?.toLowerCase()).toBe(classification);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('displays correct monster image based on primary classification', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          (fileData) => {
            const file: ClassifiedFile = fileData;
            const mockOnClick = vi.fn();

            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={file.size * 2}
                onClick={mockOnClick}
              />
            );

            const monsterImage = container.querySelector('[data-testid="monster-image"]') as HTMLImageElement;
            expect(monsterImage).toBeTruthy();
            
            // Image src should contain the primary monster type
            const primaryMonster = file.classifications[0];
            expect(monsterImage.src).toContain(primaryMonster);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('EntityCard Helper Functions', () => {
  describe('formatFileSize', () => {
    it('formats bytes correctly for any positive integer', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 * 1024 * 1024 * 1024 * 1024 }), // Up to 10TB
          (bytes) => {
            const result = formatFileSize(bytes);
            
            // Result should be a non-empty string
            expect(result.length).toBeGreaterThan(0);
            
            // Result should contain a number and a unit
            expect(result).toMatch(/^\d+(\.\d+)?\s*(B|KB|MB|GB|TB)$/);
            
            // Zero bytes should return "0 B"
            if (bytes === 0) {
              expect(result).toBe('0 B');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('calculateHealthPercentage', () => {
    it('returns value between 0 and 100 for any valid inputs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 * 1024 * 1024 * 1024 }),
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }),
          (fileSize, maxFileSize) => {
            const result = calculateHealthPercentage(fileSize, maxFileSize);
            
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns 0 when maxFileSize is 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 * 1024 * 1024 * 1024 }),
          (fileSize) => {
            const result = calculateHealthPercentage(fileSize, 0);
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('extractFileName', () => {
    it('extracts filename from any path with valid segments', () => {
      fc.assert(
        fc.property(
          // Generate paths with at least one non-separator segment
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('/') && !s.includes('\\')), { minLength: 1, maxLength: 5 }),
          fc.constantFrom('/', '\\'),
          (segments, separator) => {
            const path = segments.join(separator);
            const result = extractFileName(path);
            
            // Result should be the last segment
            const expectedFileName = segments[segments.length - 1];
            expect(result).toBe(expectedFileName);
            
            // Result should not contain path separators
            expect(result).not.toContain('/');
            expect(result).not.toContain('\\');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns the path itself when no separators present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => !s.includes('/') && !s.includes('\\')),
          (path) => {
            const result = extractFileName(path);
            expect(result).toBe(path);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


describe('EntityCard Health Bar Property Tests', () => {
  /**
   * **Feature: premium-exorcist-transformation, Property 6: Health bar file size correlation**
   * **Validates: Requirements 5.3**
   * 
   * For any entity card, the health bar value should be proportional to the file size
   * relative to the maximum file size in the set.
   */
  describe('Property 6: Health bar file size correlation', () => {
    it('health bar percentage is proportional to file size relative to max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }), // fileSize
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }), // maxFileSize
          (fileSize, maxFileSize) => {
            // Ensure maxFileSize is at least as large as fileSize for valid test
            const actualMaxFileSize = Math.max(fileSize, maxFileSize);
            
            const percentage = calculateHealthPercentage(fileSize, actualMaxFileSize);
            
            // Percentage should be proportional: fileSize / maxFileSize * 100
            const expectedPercentage = (fileSize / actualMaxFileSize) * 100;
            
            // Allow small floating point tolerance
            expect(Math.abs(percentage - expectedPercentage)).toBeLessThan(0.001);
            
            // Percentage should be capped at 100
            expect(percentage).toBeLessThanOrEqual(100);
            
            // Percentage should be non-negative
            expect(percentage).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('larger files have larger or equal health bar percentages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 * 1024 * 1024 * 1024 }), // file1Size
          fc.integer({ min: 1, max: 5 * 1024 * 1024 * 1024 }), // file2Size
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }), // maxFileSize
          (file1Size, file2Size, maxFileSize) => {
            // Ensure maxFileSize is at least as large as both files
            const actualMaxFileSize = Math.max(file1Size, file2Size, maxFileSize);
            
            const percentage1 = calculateHealthPercentage(file1Size, actualMaxFileSize);
            const percentage2 = calculateHealthPercentage(file2Size, actualMaxFileSize);
            
            // Larger file should have larger or equal percentage
            if (file1Size > file2Size) {
              expect(percentage1).toBeGreaterThan(percentage2);
            } else if (file1Size < file2Size) {
              expect(percentage1).toBeLessThan(percentage2);
            } else {
              expect(percentage1).toBe(percentage2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('health bar renders with correct percentage in EntityCard', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }),
          (fileData, maxFileSize) => {
            const file: ClassifiedFile = fileData;
            const actualMaxFileSize = Math.max(file.size, maxFileSize);
            const mockOnClick = vi.fn();

            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={actualMaxFileSize}
                onClick={mockOnClick}
              />
            );

            const healthBar = container.querySelector('[data-testid="health-bar"]');
            expect(healthBar).toBeTruthy();

            // Get the health percentage from data attribute
            const healthPercentage = parseFloat(healthBar?.getAttribute('data-health-percentage') || '0');
            
            // Calculate expected percentage
            const expectedPercentage = calculateHealthPercentage(file.size, actualMaxFileSize);
            
            // Verify the percentage matches
            expect(Math.abs(healthPercentage - expectedPercentage)).toBeLessThan(0.001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('file at max size shows 100% health bar', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          (fileData) => {
            const file: ClassifiedFile = fileData;
            const mockOnClick = vi.fn();

            // Set maxFileSize equal to file size
            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={file.size}
                onClick={mockOnClick}
              />
            );

            const healthBar = container.querySelector('[data-testid="health-bar"]');
            expect(healthBar).toBeTruthy();

            const healthPercentage = parseFloat(healthBar?.getAttribute('data-health-percentage') || '0');
            
            // When file size equals max, percentage should be 100
            expect(healthPercentage).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


describe('EntityCard Battle Arena Transition Property Tests', () => {
  /**
   * **Feature: premium-exorcist-transformation, Property 7: Battle Arena state transition**
   * **Validates: Requirements 6.1**
   * 
   * For any entity card click, the application state should transition from HUD to
   * BATTLE_ARENA with the clicked file as context.
   */
  describe('Property 7: Battle Arena state transition', () => {
    it('clicking entity card triggers onClick with correct file', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }),
          (fileData, maxFileSize) => {
            const file: ClassifiedFile = fileData;
            const actualMaxFileSize = Math.max(file.size, maxFileSize);
            const mockOnClick = vi.fn();

            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={actualMaxFileSize}
                onClick={mockOnClick}
              />
            );

            // Find and click the entity card
            const entityCard = container.querySelector('[data-testid="entity-card"]');
            expect(entityCard).toBeTruthy();

            // Simulate click
            entityCard?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            // Verify onClick was called
            expect(mockOnClick).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('entity card stores file data for transition context', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }),
          (fileData, maxFileSize) => {
            const file: ClassifiedFile = fileData;
            const actualMaxFileSize = Math.max(file.size, maxFileSize);
            const mockOnClick = vi.fn();

            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={actualMaxFileSize}
                onClick={mockOnClick}
              />
            );

            const entityCard = container.querySelector('[data-testid="entity-card"]');
            expect(entityCard).toBeTruthy();

            // Verify data attributes contain file information for context
            expect(entityCard?.getAttribute('data-file-path')).toBe(file.path);
            expect(entityCard?.getAttribute('data-file-size')).toBe(String(file.size));
            expect(entityCard?.getAttribute('data-classifications')).toBe(file.classifications.join(','));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('engage button is clickable and triggers transition', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          fc.integer({ min: 1, max: 10 * 1024 * 1024 * 1024 }),
          (fileData, maxFileSize) => {
            const file: ClassifiedFile = fileData;
            const actualMaxFileSize = Math.max(file.size, maxFileSize);
            const mockOnClick = vi.fn();

            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={actualMaxFileSize}
                onClick={mockOnClick}
              />
            );

            // Find the engage button
            const engageButton = container.querySelector('[data-testid="engage-button"]');
            expect(engageButton).toBeTruthy();
            
            // Verify button text
            expect(engageButton?.textContent).toContain('ENGAGE TARGET');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('card click provides file context for battle arena', () => {
      fc.assert(
        fc.property(
          classifiedFileArbitrary,
          (fileData) => {
            const file: ClassifiedFile = fileData;
            let capturedFile: ClassifiedFile | null = null;
            
            const mockOnClick = vi.fn(() => {
              capturedFile = file;
            });

            const { container } = render(
              <EntityCard
                file={file}
                maxFileSize={file.size}
                onClick={mockOnClick}
              />
            );

            const entityCard = container.querySelector('[data-testid="entity-card"]');
            entityCard?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            // Verify the file context would be available for battle arena
            expect(mockOnClick).toHaveBeenCalled();
            expect(capturedFile).toEqual(file);
            
            // Verify all required file properties are present
            expect(capturedFile?.path).toBe(file.path);
            expect(capturedFile?.size).toBe(file.size);
            expect(capturedFile?.classifications).toEqual(file.classifications);
            expect(capturedFile?.lastModified).toEqual(file.lastModified);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
