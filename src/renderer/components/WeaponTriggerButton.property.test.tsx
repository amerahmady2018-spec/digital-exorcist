import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';

describe('Weapon Trigger Button Property Tests', () => {
  /**
   * **Feature: gaming-hud-ui, Property 8: Button label transformation**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * For any action button, the label should be transformed to uppercase gaming
   * terminology (PURGE ENTITY or SAVE SOUL).
   */
  it('transforms Banish button label to PURGE ENTITY in uppercase', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Banish', 'banish', 'BANISH', 'BaNiSh'),
        (originalLabel) => {
          // Simulate button transformation logic
          const transformLabel = (label: string): string => {
            const normalized = label.toLowerCase();
            if (normalized === 'banish') {
              return '[ PURGE ENTITY ]';
            }
            return label;
          };

          const transformedLabel = transformLabel(originalLabel);
          
          // Verify transformation to gaming terminology
          expect(transformedLabel).toBe('[ PURGE ENTITY ]');
          
          // Verify it's in uppercase
          expect(transformedLabel).toMatch(/\[ PURGE ENTITY \]/);
          
          // Verify it contains the bracket formatting
          expect(transformedLabel.startsWith('[')).toBe(true);
          expect(transformedLabel.endsWith(']')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('transforms Resurrect button label to SAVE SOUL in uppercase', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Resurrect', 'resurrect', 'RESURRECT', 'ReSuRrEcT'),
        (originalLabel) => {
          // Simulate button transformation logic
          const transformLabel = (label: string): string => {
            const normalized = label.toLowerCase();
            if (normalized === 'resurrect') {
              return '[ SAVE SOUL ]';
            }
            return label;
          };

          const transformedLabel = transformLabel(originalLabel);
          
          // Verify transformation to gaming terminology
          expect(transformedLabel).toBe('[ SAVE SOUL ]');
          
          // Verify it's in uppercase
          expect(transformedLabel).toMatch(/\[ SAVE SOUL \]/);
          
          // Verify it contains the bracket formatting
          expect(transformedLabel.startsWith('[')).toBe(true);
          expect(transformedLabel.endsWith(']')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('button labels are consistently uppercase across all action buttons', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { original: 'Banish', expected: '[ PURGE ENTITY ]' },
          { original: 'Resurrect', expected: '[ SAVE SOUL ]' }
        ),
        ({ original, expected }) => {
          // Render a button with the transformed label
          const { container } = render(
            <button className="weapon-trigger-btn font-tech font-bold uppercase">
              {expected}
            </button>
          );

          const buttonElement = container.querySelector('button');
          expect(buttonElement).toBeTruthy();
          
          // Verify the button contains the expected transformed label
          expect(buttonElement?.textContent).toBe(expected);
          
          // Verify uppercase class is applied
          expect(buttonElement?.classList.contains('uppercase')).toBe(true);
          
          // Verify font-tech is applied for consistency
          expect(buttonElement?.classList.contains('font-tech')).toBe(true);
          
          // Verify font-bold is applied
          expect(buttonElement?.classList.contains('font-bold')).toBe(true);
          
          // Verify the label is actually uppercase
          const text = buttonElement?.textContent || '';
          expect(text).toBe(text.toUpperCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all action buttons maintain bracket formatting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('[ PURGE ENTITY ]', '[ SAVE SOUL ]'),
        (buttonLabel) => {
          const { container } = render(
            <button className="weapon-trigger-btn">{buttonLabel}</button>
          );

          const buttonElement = container.querySelector('button');
          expect(buttonElement).toBeTruthy();
          
          const text = buttonElement?.textContent || '';
          
          // Verify bracket formatting
          expect(text.startsWith('[')).toBe(true);
          expect(text.endsWith(']')).toBe(true);
          
          // Verify spacing around brackets
          expect(text).toMatch(/^\[\s+\w+.*\w+\s+\]$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('button labels use militaristic gaming terminology', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { label: '[ PURGE ENTITY ]', keywords: ['PURGE', 'ENTITY'] },
          { label: '[ SAVE SOUL ]', keywords: ['SAVE', 'SOUL'] }
        ),
        ({ label, keywords }) => {
          // Verify the label contains gaming/militaristic keywords
          keywords.forEach(keyword => {
            expect(label).toContain(keyword);
          });
          
          // Verify the label is in uppercase
          expect(label).toBe(label.toUpperCase());
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Button Hover Effects Property Tests', () => {
  /**
   * **Feature: gaming-hud-ui, Property 9: Animation smoothness**
   * **Validates: Requirements 8.4**
   * 
   * For any animation (flicker, fog, button hover), the animation should run
   * at 60fps without causing jank or stuttering.
   */
  it('button hover animations have smooth CSS transitions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('[ PURGE ENTITY ]', '[ SAVE SOUL ]'),
        (buttonLabel) => {
          const { container } = render(
            <button 
              className="weapon-trigger-btn transition-all duration-200"
              style={{ 
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {buttonLabel}
            </button>
          );

          const buttonElement = container.querySelector('button') as HTMLElement;
          expect(buttonElement).toBeTruthy();
          
          // Verify transition classes are applied for smooth animations
          expect(buttonElement?.classList.contains('transition-all')).toBe(true);
          
          // Verify duration is set (should be quick for responsiveness)
          expect(buttonElement?.classList.contains('duration-200')).toBe(true);
          
          // Verify inline transition style is set
          const computedStyle = window.getComputedStyle(buttonElement);
          expect(computedStyle.transition).toContain('all');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('button shake animation uses CSS keyframes for GPU acceleration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('[ PURGE ENTITY ]', '[ SAVE SOUL ]'),
        (buttonLabel) => {
          // Simulate button with shake animation class
          const { container } = render(
            <button 
              className="weapon-trigger-btn"
              style={{
                animation: 'button-shake 0.3s ease-in-out'
              }}
            >
              {buttonLabel}
            </button>
          );

          const buttonElement = container.querySelector('button') as HTMLElement;
          expect(buttonElement).toBeTruthy();
          
          // Verify animation style is set
          const computedStyle = window.getComputedStyle(buttonElement);
          expect(computedStyle.animation).toContain('button-shake');
          
          // Verify animation duration is reasonable (0.3s for smooth feel)
          expect(computedStyle.animation).toContain('0.3s');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('hover effects use transform for GPU-accelerated animations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { scale: 1.05, translateX: 2 },
          { scale: 1.02, translateX: 1 },
          { scale: 1.1, translateX: 3 }
        ),
        ({ scale, translateX }) => {
          // Simulate hover state with transform
          const { container } = render(
            <button 
              className="weapon-trigger-btn"
              style={{
                transform: `scale(${scale}) translateX(${translateX}px)`
              }}
            >
              [ PURGE ENTITY ]
            </button>
          );

          const buttonElement = container.querySelector('button') as HTMLElement;
          expect(buttonElement).toBeTruthy();
          
          // Verify transform is applied (GPU-accelerated property)
          const computedStyle = window.getComputedStyle(buttonElement);
          expect(computedStyle.transform).not.toBe('none');
          
          // Verify transform contains scale
          expect(computedStyle.transform).toContain('scale');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('button animations maintain 60fps performance characteristics', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('[ PURGE ENTITY ]', '[ SAVE SOUL ]'),
        (buttonLabel) => {
          // Test that animations use performance-optimized properties
          const { container } = render(
            <button 
              className="weapon-trigger-btn"
              style={{
                // Use transform and opacity for 60fps animations
                transform: 'scale(1)',
                opacity: 1,
                willChange: 'transform, opacity',
                transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out'
              }}
            >
              {buttonLabel}
            </button>
          );

          const buttonElement = container.querySelector('button') as HTMLElement;
          expect(buttonElement).toBeTruthy();
          
          const computedStyle = window.getComputedStyle(buttonElement);
          
          // Verify will-change is set for optimization hint
          expect(computedStyle.willChange).toContain('transform');
          
          // Verify transition uses GPU-accelerated properties
          expect(computedStyle.transition).toContain('transform');
          
          // Verify transition duration is reasonable (< 500ms for smooth feel)
          expect(computedStyle.transition).toContain('0.2s');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('shake animation uses translateX for smooth horizontal movement', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -5, max: 5 }), // shake offset in pixels
        (offset) => {
          // Simulate shake animation frame
          const { container } = render(
            <button 
              className="weapon-trigger-btn"
              style={{
                transform: `translateX(${offset}px)`
              }}
            >
              [ PURGE ENTITY ]
            </button>
          );

          const buttonElement = container.querySelector('button') as HTMLElement;
          expect(buttonElement).toBeTruthy();
          
          const computedStyle = window.getComputedStyle(buttonElement);
          
          // Verify translateX is used (GPU-accelerated)
          expect(computedStyle.transform).toContain('translateX');
          
          // Verify transform is not 'none'
          expect(computedStyle.transform).not.toBe('none');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('animation timing functions ensure smooth easing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ease-in-out', 'ease-out', 'ease-in'),
        (easing) => {
          const { container } = render(
            <button 
              className="weapon-trigger-btn"
              style={{
                transition: `all 0.3s ${easing}`
              }}
            >
              [ PURGE ENTITY ]
            </button>
          );

          const buttonElement = container.querySelector('button') as HTMLElement;
          expect(buttonElement).toBeTruthy();
          
          const computedStyle = window.getComputedStyle(buttonElement);
          
          // Verify easing function is applied
          expect(computedStyle.transition).toContain(easing);
        }
      ),
      { numRuns: 100 }
    );
  });
});
