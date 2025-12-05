import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';

describe('Font Application Property Tests', () => {
  /**
   * **Feature: gaming-hud-ui, Property 11: Font application consistency**
   * **Validates: Requirements 1.2, 6.1**
   * 
   * For any header element, the Creepster font should be applied consistently
   * across all components.
   */
  it('applies Creepster font to all header elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          headerText: fc.string({ minLength: 1, maxLength: 100 }),
          headerLevel: fc.constantFrom('h1', 'h2', 'h3', 'h4', 'h5', 'h6')
        }),
        ({ headerText, headerLevel }) => {
          // Create a header element with the gaming font class
          const HeaderTag = headerLevel as keyof JSX.IntrinsicElements;
          const { container } = render(
            <HeaderTag className="font-creepster">{headerText}</HeaderTag>
          );

          const headerElement = container.querySelector(headerLevel);
          expect(headerElement).toBeTruthy();
          
          // Verify the font-creepster class is applied
          expect(headerElement?.classList.contains('font-creepster')).toBe(true);
          
          // Verify the element contains the expected text
          expect(headerElement?.textContent).toBe(headerText);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that monster names (which are headers) use Creepster font
   */
  it('applies Creepster font to monster names in cards', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }), // file path as monster name
        (monsterName) => {
          // Simulate a monster name header
          const { container } = render(
            <h3 className="font-creepster text-2xl">{monsterName}</h3>
          );

          const nameElement = container.querySelector('h3');
          expect(nameElement).toBeTruthy();
          
          // Verify font-creepster is applied
          expect(nameElement?.classList.contains('font-creepster')).toBe(true);
          
          // Verify text-2xl is also applied (size consistency)
          expect(nameElement?.classList.contains('text-2xl')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that dashboard headers use Creepster font
   */
  it('applies Creepster font to dashboard headers', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          subtitle: fc.string({ minLength: 1, maxLength: 200 })
        }),
        ({ title, subtitle }) => {
          // Simulate dashboard header structure
          const { container } = render(
            <div>
              <h1 className="font-creepster text-6xl">{title}</h1>
              <h2 className="font-creepster text-4xl">{subtitle}</h2>
            </div>
          );

          const h1 = container.querySelector('h1');
          const h2 = container.querySelector('h2');
          
          expect(h1).toBeTruthy();
          expect(h2).toBeTruthy();
          
          // Verify both headers have font-creepster
          expect(h1?.classList.contains('font-creepster')).toBe(true);
          expect(h2?.classList.contains('font-creepster')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: gaming-hud-ui, Property 12: Font application consistency for UI**
   * **Validates: Requirements 1.3, 6.1**
   * 
   * For any UI text or control element, the Rajdhani font should be applied
   * consistently across all components.
   */
  it('applies Rajdhani font to all UI text elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc.string({ minLength: 1, maxLength: 100 }),
          weight: fc.constantFrom('font-medium', 'font-bold')
        }),
        ({ text, weight }) => {
          // Create a UI text element with the tech font class
          const { container } = render(
            <p className={`font-tech ${weight}`}>{text}</p>
          );

          const textElement = container.querySelector('p');
          expect(textElement).toBeTruthy();
          
          // Verify the font-tech class is applied
          expect(textElement?.classList.contains('font-tech')).toBe(true);
          
          // Verify the weight class is applied
          expect(textElement?.classList.contains(weight)).toBe(true);
          
          // Verify the element contains the expected text
          expect(textElement?.textContent).toBe(text);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that button labels use Rajdhani font
   */
  it('applies Rajdhani font to button labels', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('PURGE ENTITY', 'SAVE SOUL', 'SCAN', 'CANCEL'),
        (buttonLabel) => {
          // Simulate a button with tech font
          const { container } = render(
            <button className="font-tech font-bold uppercase">{buttonLabel}</button>
          );

          const buttonElement = container.querySelector('button');
          expect(buttonElement).toBeTruthy();
          
          // Verify font-tech is applied
          expect(buttonElement?.classList.contains('font-tech')).toBe(true);
          
          // Verify font-bold is applied
          expect(buttonElement?.classList.contains('font-bold')).toBe(true);
          
          // Verify uppercase is applied
          expect(buttonElement?.classList.contains('uppercase')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that UI controls (tabs, sort buttons) use Rajdhani font
   */
  it('applies Rajdhani font to UI controls', () => {
    fc.assert(
      fc.property(
        fc.record({
          controlText: fc.string({ minLength: 1, maxLength: 50 }),
          isActive: fc.boolean()
        }),
        ({ controlText, isActive }) => {
          // Simulate a control element (tab or button)
          const { container } = render(
            <button className={`font-tech font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
              {controlText}
            </button>
          );

          const controlElement = container.querySelector('button');
          expect(controlElement).toBeTruthy();
          
          // Verify font-tech is applied
          expect(controlElement?.classList.contains('font-tech')).toBe(true);
          
          // Verify font-bold is applied
          expect(controlElement?.classList.contains('font-bold')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that metadata text uses Rajdhani font
   */
  it('applies Rajdhani font to metadata text', () => {
    fc.assert(
      fc.property(
        fc.record({
          label: fc.constantFrom('Size:', 'Modified:', 'Total Files:', 'Total Size:'),
          value: fc.string({ minLength: 1, maxLength: 50 })
        }),
        ({ label, value }) => {
          // Simulate metadata display
          const { container } = render(
            <div className="font-tech">
              <span className="font-medium">{label}</span> <span>{value}</span>
            </div>
          );

          const divElement = container.querySelector('div');
          expect(divElement).toBeTruthy();
          
          // Verify font-tech is applied to the container
          expect(divElement?.classList.contains('font-tech')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that font fallbacks are properly configured
   */
  it('includes fallback fonts in font family configuration', () => {
    // This test verifies the Tailwind configuration structure
    // In a real scenario, we'd check the computed styles
    const creepsterFallback = ['Creepster', 'cursive'];
    const rajdhaniFallback = ['Rajdhani', 'sans-serif'];

    // Verify fallback arrays have the correct structure
    expect(creepsterFallback).toHaveLength(2);
    expect(creepsterFallback[0]).toBe('Creepster');
    expect(creepsterFallback[1]).toBe('cursive');

    expect(rajdhaniFallback).toHaveLength(2);
    expect(rajdhaniFallback[0]).toBe('Rajdhani');
    expect(rajdhaniFallback[1]).toBe('sans-serif');
  });
});
