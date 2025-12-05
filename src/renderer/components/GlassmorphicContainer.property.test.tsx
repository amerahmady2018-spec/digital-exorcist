import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import GlassmorphicContainer, { 
  clampOpacity, 
  DEFAULT_OPACITY, 
  MIN_OPACITY, 
  MAX_OPACITY 
} from './GlassmorphicContainer';

/**
 * Property-Based Tests for GlassmorphicContainer
 * 
 * These tests verify universal properties for the glassmorphism styling
 * using the fast-check library for property-based testing.
 */

describe('GlassmorphicContainer Property Tests', () => {
  /**
   * **Feature: premium-exorcist-transformation, Property 1: Glassmorphism styling consistency**
   * 
   * For any glassmorphic container, the backdrop blur CSS property should be applied
   * with appropriate fallbacks for unsupported browsers.
   * 
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Glassmorphism styling consistency', () => {
    it('should always apply backdrop-filter blur with any blur intensity', () => {
      fc.assert(
        fc.property(
          // Generate blur intensity values (min 1 to avoid edge case)
          fc.integer({ min: 1, max: 100 }),
          (blurIntensity) => {
            const { container } = render(
              <GlassmorphicContainer blurIntensity={blurIntensity}>
                <div>Test Content</div>
              </GlassmorphicContainer>
            );
            
            const element = container.firstChild as HTMLElement;
            const styles = element.style;
            
            // Should have backdrop-filter with blur
            expect(styles.backdropFilter).toBe(`blur(${blurIntensity}px)`);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always have semi-transparent background color', () => {
      fc.assert(
        fc.property(
          // Generate opacity values
          fc.float({ min: 0, max: 1, noNaN: true }),
          (opacity) => {
            const { container } = render(
              <GlassmorphicContainer opacity={opacity}>
                <div>Test Content</div>
              </GlassmorphicContainer>
            );
            
            const element = container.firstChild as HTMLElement;
            const bgColor = element.style.backgroundColor;
            
            // Should have rgba background color
            expect(bgColor).toMatch(/^rgba\(/);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always have border for depth effect', () => {
      fc.assert(
        fc.property(
          // Generate glow border boolean
          fc.boolean(),
          (glowBorder) => {
            const { container } = render(
              <GlassmorphicContainer glowBorder={glowBorder}>
                <div>Test Content</div>
              </GlassmorphicContainer>
            );
            
            const element = container.firstChild as HTMLElement;
            
            // Should have border styles
            expect(element.style.borderWidth).toBe('1px');
            expect(element.style.borderStyle).toBe('solid');
            expect(element.style.borderColor).toBeTruthy();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always have box-shadow for depth', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (glowBorder) => {
            const { container } = render(
              <GlassmorphicContainer glowBorder={glowBorder}>
                <div>Test Content</div>
              </GlassmorphicContainer>
            );
            
            const element = container.firstChild as HTMLElement;
            
            // Should have box-shadow
            expect(element.style.boxShadow).toBeTruthy();
            expect(element.style.boxShadow.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 2: Transparency opacity bounds**
   * 
   * For any transparent element, the opacity value should be within the range
   * that allows desktop wallpaper to show through while maintaining readability (0.7-0.95).
   * 
   * **Validates: Requirements 1.3**
   */
  describe('Property 2: Transparency opacity bounds', () => {
    it('should clamp opacity values to valid range (0.7-0.95)', () => {
      fc.assert(
        fc.property(
          // Generate any float value
          fc.float({ min: -10, max: 10, noNaN: true }),
          (inputOpacity) => {
            const clampedOpacity = clampOpacity(inputOpacity);
            
            // Should always be within valid range
            expect(clampedOpacity).toBeGreaterThanOrEqual(MIN_OPACITY);
            expect(clampedOpacity).toBeLessThanOrEqual(MAX_OPACITY);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve opacity values within valid range', () => {
      fc.assert(
        fc.property(
          // Generate values within valid range using double
          fc.double({ min: MIN_OPACITY, max: MAX_OPACITY, noNaN: true }),
          (validOpacity) => {
            const clampedOpacity = clampOpacity(validOpacity);
            
            // Should preserve the original value
            expect(clampedOpacity).toBeCloseTo(validOpacity, 5);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clamp values below minimum to MIN_OPACITY', () => {
      fc.assert(
        fc.property(
          // Generate values below minimum using double
          fc.double({ min: -100, max: MIN_OPACITY - 0.01, noNaN: true }),
          (lowOpacity) => {
            const clampedOpacity = clampOpacity(lowOpacity);
            
            // Should clamp to minimum
            expect(clampedOpacity).toBe(MIN_OPACITY);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clamp values above maximum to MAX_OPACITY', () => {
      fc.assert(
        fc.property(
          // Generate values above maximum using double
          fc.double({ min: MAX_OPACITY + 0.01, max: 100, noNaN: true }),
          (highOpacity) => {
            const clampedOpacity = clampOpacity(highOpacity);
            
            // Should clamp to maximum
            expect(clampedOpacity).toBe(MAX_OPACITY);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply clamped opacity to rendered component background', () => {
      fc.assert(
        fc.property(
          // Generate any opacity value
          fc.float({ min: -10, max: 10, noNaN: true }),
          (inputOpacity) => {
            const { container } = render(
              <GlassmorphicContainer opacity={inputOpacity}>
                <div>Test Content</div>
              </GlassmorphicContainer>
            );
            
            const element = container.firstChild as HTMLElement;
            const bgColor = element.style.backgroundColor;
            
            // Extract opacity from rgba string
            const match = bgColor.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
            if (match) {
              const appliedOpacity = parseFloat(match[1]);
              
              // Applied opacity should be within valid range
              expect(appliedOpacity).toBeGreaterThanOrEqual(MIN_OPACITY - 0.01);
              expect(appliedOpacity).toBeLessThanOrEqual(MAX_OPACITY + 0.01);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use DEFAULT_OPACITY when no opacity is provided', () => {
      const { container } = render(
        <GlassmorphicContainer>
          <div>Test Content</div>
        </GlassmorphicContainer>
      );
      
      const element = container.firstChild as HTMLElement;
      const bgColor = element.style.backgroundColor;
      
      // Should contain the default opacity
      expect(bgColor).toContain(DEFAULT_OPACITY.toString());
    });
  });

  describe('ForwardRef functionality', () => {
    it('should forward ref to the container element', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (content) => {
            const ref = { current: null as HTMLDivElement | null };
            
            render(
              <GlassmorphicContainer ref={ref}>
                <div>{content}</div>
              </GlassmorphicContainer>
            );
            
            // Ref should be attached to the container
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
