import { describe, it } from 'vitest';
import * as fc from 'fast-check';

describe('Property-Based Testing Setup', () => {
  it('should verify fast-check is working with a simple property', () => {
    // Simple property: reversing a string twice returns the original
    fc.assert(
      fc.property(fc.string(), (str) => {
        const reversed = str.split('').reverse().join('');
        const doubleReversed = reversed.split('').reverse().join('');
        return doubleReversed === str;
      }),
      { numRuns: 100 }
    );
  });

  it('should verify fast-check works with numbers', () => {
    // Property: adding zero to any number returns the same number
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });
});
