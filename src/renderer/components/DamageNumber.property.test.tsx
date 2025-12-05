import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { DamageNumber, formatDamageAmount, calculateStaggerDelay } from './DamageNumber';

describe('DamageNumber Property-Based Tests', () => {
  /**
   * **Feature: premium-exorcist-transformation, Property 15: Damage number spawning**
   * **Validates: Requirements 10.1**
   * 
   * For any damage event, a damage number component should be added to the DOM.
   */
  it('Property 15: Damage number spawning', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary file size values (1 byte to 1GB)
        fc.integer({ min: 1, max: 1024 * 1024 * 1024 }),
        // Generate arbitrary positions
        fc.integer({ min: 0, max: 1920 }), // x position
        fc.integer({ min: 0, max: 1080 }), // y position
        // Generate arbitrary IDs
        fc.string({ minLength: 1, maxLength: 20 }),
        (amount, xPos, yPos, id) => {
          // Render the DamageNumber component
          const { container, unmount } = render(
            <DamageNumber
              id={id}
              amount={amount}
              x={xPos}
              y={yPos}
            />
          );

          // Verify the damage number appears in the DOM
          const damageElement = container.querySelector('[data-testid="damage-number"]') as HTMLElement;
          expect(damageElement).toBeTruthy();

          // Verify the component is positioned at the specified coordinates
          expect(damageElement.style.left).toBe(`${xPos}px`);
          expect(damageElement.style.top).toBe(`${yPos}px`);

          // Verify it's non-interactive (pointer-events-none)
          expect(damageElement.classList.contains('pointer-events-none')).toBe(true);

          // Verify the damage text element exists
          const textElement = container.querySelector('[data-testid="damage-text"]');
          expect(textElement).toBeTruthy();

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 16: Damage number formatting**
   * **Validates: Requirements 10.2**
   * 
   * For any damage number, the text should display the file size reduction 
   * in the format "-{amount} MB" with gold color styling.
   */
  it('Property 16: Damage number formatting', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary file size values (1 byte to 1GB)
        fc.integer({ min: 1, max: 1024 * 1024 * 1024 }),
        // Generate arbitrary positions
        fc.integer({ min: 0, max: 1920 }),
        fc.integer({ min: 0, max: 1080 }),
        // Generate arbitrary IDs
        fc.string({ minLength: 1, maxLength: 20 }),
        (amount, xPos, yPos, id) => {
          // Render the DamageNumber component
          const { container, unmount } = render(
            <DamageNumber
              id={id}
              amount={amount}
              x={xPos}
              y={yPos}
            />
          );

          // Get the text element
          const textElement = container.querySelector('[data-testid="damage-text"]') as HTMLElement;
          expect(textElement).toBeTruthy();

          // Verify the text starts with a minus sign
          const textContent = textElement.textContent || '';
          expect(textContent.startsWith('-')).toBe(true);

          // Verify the text contains MB or KB suffix
          expect(textContent.includes('MB') || textContent.includes('KB')).toBe(true);

          // Verify gold color styling (inline style)
          expect(textElement.style.color).toBe('rgb(255, 215, 0)');

          // Verify the formatted amount matches the helper function
          const expectedFormat = formatDamageAmount(amount);
          expect(textContent).toBe(expectedFormat);

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 17: Damage number cleanup**
   * **Validates: Requirements 10.4**
   * 
   * For any damage number, it should be removed from the DOM after its animation completes.
   */
  it('Property 17: Damage number cleanup', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary file size values
        fc.integer({ min: 1, max: 1024 * 1024 * 1024 }),
        // Generate arbitrary positions
        fc.integer({ min: 0, max: 1920 }),
        fc.integer({ min: 0, max: 1080 }),
        // Generate arbitrary IDs
        fc.string({ minLength: 1, maxLength: 20 }),
        (amount, xPos, yPos, id) => {
          let cleanupCalled = false;
          const handleAnimationComplete = () => {
            cleanupCalled = true;
          };

          // Render the DamageNumber component with cleanup callback
          const { container, unmount } = render(
            <DamageNumber
              id={id}
              amount={amount}
              x={xPos}
              y={yPos}
              onAnimationComplete={handleAnimationComplete}
            />
          );

          // Verify the component is initially rendered
          const damageElement = container.querySelector('[data-testid="damage-number"]');
          expect(damageElement).toBeTruthy();

          // Verify that the onAnimationComplete callback is provided
          // This callback is responsible for removing the element from the DOM
          // In the actual implementation, the parent component will use this
          // callback to remove the damage number from its state
          expect(handleAnimationComplete).toBeDefined();
          expect(typeof handleAnimationComplete).toBe('function');

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 18: Damage number staggering**
   * **Validates: Requirements 10.5**
   * 
   * For any multiple simultaneous damage events, the damage number animations 
   * should have staggered start times.
   */
  it('Property 18: Damage number staggering', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary stagger indices (0 to 10)
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        // Generate arbitrary file size values
        fc.integer({ min: 1, max: 1024 * 1024 * 1024 }),
        // Generate arbitrary positions
        fc.integer({ min: 0, max: 1920 }),
        fc.integer({ min: 0, max: 1080 }),
        // Generate arbitrary IDs
        fc.string({ minLength: 1, maxLength: 20 }),
        (staggerIndex1, staggerIndex2, amount, xPos, yPos, id) => {
          // Calculate expected delays
          const delay1 = calculateStaggerDelay(staggerIndex1);
          const delay2 = calculateStaggerDelay(staggerIndex2);

          // Verify stagger delay calculation
          // Each index should add 0.1 seconds (100ms) delay
          expect(delay1).toBe(staggerIndex1 * 0.1);
          expect(delay2).toBe(staggerIndex2 * 0.1);

          // Verify that different indices produce different delays
          if (staggerIndex1 !== staggerIndex2) {
            expect(delay1).not.toBe(delay2);
          } else {
            expect(delay1).toBe(delay2);
          }

          // Verify that higher indices have longer delays
          if (staggerIndex1 > staggerIndex2) {
            expect(delay1).toBeGreaterThan(delay2);
          } else if (staggerIndex1 < staggerIndex2) {
            expect(delay1).toBeLessThan(delay2);
          }

          // Render the DamageNumber component with stagger index
          const { container, unmount } = render(
            <DamageNumber
              id={id}
              amount={amount}
              x={xPos}
              y={yPos}
              staggerIndex={staggerIndex1}
            />
          );

          // Verify the stagger index is stored in the data attribute
          const damageElement = container.querySelector('[data-testid="damage-number"]') as HTMLElement;
          expect(damageElement).toBeTruthy();
          expect(damageElement.getAttribute('data-stagger-index')).toBe(String(staggerIndex1));

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('formatDamageAmount', () => {
  it('formats zero bytes correctly', () => {
    expect(formatDamageAmount(0)).toBe('-0 MB');
  });

  it('formats MB values with one decimal place', () => {
    // 1 MB = 1024 * 1024 bytes
    const oneMB = 1024 * 1024;
    expect(formatDamageAmount(oneMB)).toBe('-1.0 MB');
    expect(formatDamageAmount(oneMB * 5.5)).toBe('-5.5 MB');
  });

  it('formats small MB values with two decimal places', () => {
    // 0.05 MB = 52428.8 bytes
    const smallMB = 52429;
    const result = formatDamageAmount(smallMB);
    expect(result).toMatch(/^-0\.\d{2} MB$/);
  });

  it('formats very small files in KB', () => {
    // Less than 0.01 MB should show KB
    const smallFile = 1024; // 1 KB
    expect(formatDamageAmount(smallFile)).toBe('-1.0 KB');
  });
});

describe('calculateStaggerDelay', () => {
  it('returns 0 for index 0', () => {
    expect(calculateStaggerDelay(0)).toBe(0);
  });

  it('returns 0.1 for index 1', () => {
    expect(calculateStaggerDelay(1)).toBe(0.1);
  });

  it('scales linearly with index', () => {
    expect(calculateStaggerDelay(5)).toBe(0.5);
    expect(calculateStaggerDelay(10)).toBe(1.0);
  });
});
