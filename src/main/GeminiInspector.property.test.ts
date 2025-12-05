import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  GeminiInspector, 
  formatBytes, 
  FileInspectionRequest 
} from './GeminiInspector';
import { MonsterType } from '../shared/types';

/**
 * Property-Based Tests for GeminiInspector
 * 
 * These tests verify universal properties that should hold across all inputs
 * using the fast-check library for property-based testing.
 */

describe('GeminiInspector Property Tests', () => {
  // Create an inspector instance without API key for testing prompt building
  const inspector = new GeminiInspector('');

  /**
   * **Feature: premium-exorcist-transformation, Property 8: Gemini API prompt completeness**
   * 
   * For any file inspection request, the constructed prompt should include 
   * all file metadata fields (path, size, lastModified, classifications).
   * 
   * **Validates: Requirements 7.2, 15.2**
   */
  it('Property 8: Prompt should contain all required file metadata fields', () => {
    fc.assert(
      fc.property(
        // Generate random file inspection requests
        fc.record({
          path: fc.string({ minLength: 1, maxLength: 200 }),
          size: fc.nat({ max: 10_000_000_000 }), // Up to 10GB
          lastModified: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
          classifications: fc.array(
            fc.constantFrom(MonsterType.Ghost, MonsterType.Demon, MonsterType.Zombie),
            { minLength: 0, maxLength: 3 }
          )
        }),
        (request: FileInspectionRequest) => {
          const prompt = inspector.buildPrompt(request);
          
          // Verify path is included
          expect(prompt).toContain(request.path);
          
          // Verify size in bytes is included
          expect(prompt).toContain(`${request.size} bytes`);
          
          // Verify human-readable size is included
          const humanReadableSize = formatBytes(request.size);
          expect(prompt).toContain(humanReadableSize);
          
          // Verify lastModified is included (as ISO string)
          const lastModifiedStr = request.lastModified instanceof Date 
            ? request.lastModified.toISOString() 
            : new Date(request.lastModified).toISOString();
          expect(prompt).toContain(lastModifiedStr);
          
          // Verify classifications are included
          if (request.classifications.length > 0) {
            for (const classification of request.classifications) {
              expect(prompt).toContain(classification);
            }
          } else {
            // When no classifications, should show 'none'
            expect(prompt).toContain('none');
          }
          
          // Verify prompt structure contains required sections
          expect(prompt).toContain('File Details:');
          expect(prompt).toContain('- Path:');
          expect(prompt).toContain('- Size:');
          expect(prompt).toContain('- Last Modified:');
          expect(prompt).toContain('- Classifications:');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * **Feature: premium-exorcist-transformation, Property 28: Gemini response parsing**
   * 
   * For any valid Gemini API response, the analysis text should be correctly 
   * extracted and formatted for display.
   * 
   * **Validates: Requirements 15.4**
   */
  it('Property 28: Response parsing should extract analysis and determine threat level', () => {
    fc.assert(
      fc.property(
        // Generate random response texts
        fc.string({ minLength: 1, maxLength: 1000 }),
        (responseText: string) => {
          const result = inspector.parseResponse(responseText);
          
          // Verify analysis is extracted (trimmed version of input)
          expect(result.analysis).toBe(responseText.trim());
          
          // Verify threat_level is one of the valid values
          expect(['low', 'medium', 'high']).toContain(result.threat_level);
          
          // Verify recommendations is an array with at least one item
          expect(Array.isArray(result.recommendations)).toBe(true);
          expect(result.recommendations.length).toBeGreaterThan(0);
          
          // Verify all recommendations are strings
          for (const rec of result.recommendations) {
            expect(typeof rec).toBe('string');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test for threat level determination based on keywords
   */
  it('Property 28b: Threat level should be determined by response keywords', () => {
    fc.assert(
      fc.property(
        // Generate responses with specific keywords
        fc.oneof(
          // Low threat keywords
          fc.constant('This file is safe and harmless to delete.'),
          fc.constant('Low risk file, can be safely removed.'),
          // High threat keywords
          fc.constant('This is a dangerous file, proceed with caution!'),
          fc.constant('Critical system file, high risk if deleted.'),
          // Medium threat (no specific keywords)
          fc.constant('This file may or may not be important.')
        ),
        (responseText: string) => {
          const result = inspector.parseResponse(responseText);
          const lowerText = responseText.toLowerCase();
          
          // Verify threat level matches keywords
          if (lowerText.includes('safe') || lowerText.includes('harmless') || lowerText.includes('low risk')) {
            expect(result.threat_level).toBe('low');
          } else if (lowerText.includes('dangerous') || lowerText.includes('critical') || lowerText.includes('high risk') || lowerText.includes('caution')) {
            expect(result.threat_level).toBe('high');
          } else {
            expect(result.threat_level).toBe('medium');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test for fallback response structure
   */
  it('Fallback response should have valid structure', () => {
    fc.assert(
      fc.property(
        // Generate optional error messages
        fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
        (errorMessage: string | undefined) => {
          const result = inspector.getFallbackResponse(errorMessage);
          
          // Verify fallback has all required fields
          expect(typeof result.analysis).toBe('string');
          expect(result.analysis.length).toBeGreaterThan(0);
          expect(['low', 'medium', 'high']).toContain(result.threat_level);
          expect(Array.isArray(result.recommendations)).toBe(true);
          expect(result.recommendations.length).toBeGreaterThan(0);
          
          // Verify error is set when provided
          if (errorMessage !== undefined) {
            expect(result.error).toBe(errorMessage);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test for formatBytes utility function
   */
  it('formatBytes should produce valid human-readable sizes', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10_000_000_000_000 }), // Up to 10TB
        (bytes: number) => {
          const result = formatBytes(bytes);
          
          // Result should be a non-empty string
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
          
          // Result should contain a unit
          const validUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const hasValidUnit = validUnits.some(unit => result.includes(unit));
          expect(hasValidUnit).toBe(true);
          
          // Special case: 0 bytes
          if (bytes === 0) {
            expect(result).toBe('0 Bytes');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test for empty response handling
   */
  it('Empty or whitespace responses should return fallback', () => {
    fc.assert(
      fc.property(
        // Generate empty or whitespace-only strings
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\n\t  \n')
        ),
        (emptyResponse: string) => {
          const result = inspector.parseResponse(emptyResponse);
          
          // Should return fallback response
          expect(result.error).toBeDefined();
          expect(result.analysis).toContain('SOUL SIGNATURE OBSCURED');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
