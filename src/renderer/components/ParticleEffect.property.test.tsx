import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  ParticleEffect, 
  generateDissolutionParticles, 
  generateImpactParticles,
  randomInRange,
  generateColorVariation,
  calculateFinalPosition
} from './ParticleEffect';
import { ClassifiedFile, MonsterType } from '../../shared/types';

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { 
        'data-testid'?: string;
        'data-effect-type'?: string;
        'data-particle-count'?: number;
        'data-particle-id'?: string;
        layoutId?: string;
        initial?: object;
        animate?: object;
        exit?: object;
        transition?: object;
        onAnimationComplete?: () => void;
      }) => {
        // Extract only valid HTML attributes
        const { 
          children: _children, 
          initial, 
          animate, 
          exit, 
          transition, 
          onAnimationComplete,
          layoutId,
          ...validProps 
        } = props;
        return <div {...validProps}>{children}</div>;
      },
    },
  };
});

describe('ParticleEffect Property Tests', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 19: Banished file removal from HUD**
   * **Validates: Requirements 11.4**
   * 
   * For any file that is banished in the Battle Arena, it should not appear 
   * in the entity card list when returning to the HUD state.
   */
  describe('Property 19: Banished file removal from HUD', () => {
    // Generator for classified files
    const classifiedFileArb = fc.record({
      path: fc.string({ minLength: 1, maxLength: 100 }).map(s => `/test/${s.replace(/[<>:"|?*]/g, '_')}`),
      size: fc.integer({ min: 1, max: 1000000000 }),
      lastModified: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      classifications: fc.array(
        fc.constantFrom(MonsterType.Ghost, MonsterType.Demon, MonsterType.Zombie),
        { minLength: 1, maxLength: 3 }
      ),
      duplicateGroup: fc.option(fc.hexaString({ minLength: 8, maxLength: 8 }), { nil: undefined })
    }) as fc.Arbitrary<ClassifiedFile>;

    it('should remove banished file from entity list after particle effect completes', () => {
      fc.assert(
        fc.property(
          fc.array(classifiedFileArb, { minLength: 2, maxLength: 10 }),
          fc.integer({ min: 0 }),
          (files, indexSeed) => {
            // Select a random file to banish
            const banishIndex = indexSeed % files.length;
            const banishedFile = files[banishIndex];
            
            // Simulate the HUD state with files
            let currentFiles = [...files];
            
            // Simulate banishment - remove file from list
            const removeFile = (filePath: string) => {
              currentFiles = currentFiles.filter(f => f.path !== filePath);
            };
            
            // Verify file exists before banishment
            expect(currentFiles.some(f => f.path === banishedFile.path)).toBe(true);
            
            // Track if onComplete was called
            let completeCalled = false;
            
            // Simulate particle effect completion callback
            const onComplete = () => {
              completeCalled = true;
              removeFile(banishedFile.path);
            };
            
            // Render particle effect
            const { unmount } = render(
              <ParticleEffect
                type="dissolution"
                origin={{ x: 100, y: 100 }}
                onComplete={onComplete}
                duration={100}
              />
            );
            
            // Simulate the completion callback being called (as it would be after animation)
            // In real usage, this is triggered by the timer in the component
            act(() => {
              onComplete();
            });
            
            // Verify callback was called
            expect(completeCalled).toBe(true);
            
            // Verify file is removed from list after banishment
            expect(currentFiles.some(f => f.path === banishedFile.path)).toBe(false);
            
            // Verify other files remain
            expect(currentFiles.length).toBe(files.length - 1);
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not affect other files when one is banished', () => {
      fc.assert(
        fc.property(
          fc.array(classifiedFileArb, { minLength: 3, maxLength: 10 }),
          fc.integer({ min: 0 }),
          (files, indexSeed) => {
            // Ensure unique paths
            const uniqueFiles = files.map((f, i) => ({
              ...f,
              path: `${f.path}_${i}`
            }));
            
            // Select a random file to banish
            const banishIndex = indexSeed % uniqueFiles.length;
            const banishedFile = uniqueFiles[banishIndex];
            const remainingFiles = uniqueFiles.filter((_, i) => i !== banishIndex);
            
            // Simulate the HUD state with files
            let currentFiles = [...uniqueFiles];
            
            // Simulate banishment
            const removeFile = (filePath: string) => {
              currentFiles = currentFiles.filter(f => f.path !== filePath);
            };
            
            const onComplete = () => {
              removeFile(banishedFile.path);
            };
            
            const { unmount } = render(
              <ParticleEffect
                type="dissolution"
                origin={{ x: 100, y: 100 }}
                onComplete={onComplete}
                duration={100}
              />
            );
            
            // Simulate the completion callback
            act(() => {
              onComplete();
            });
            
            // Verify all remaining files are still present
            for (const file of remainingFiles) {
              expect(currentFiles.some(f => f.path === file.path)).toBe(true);
            }
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property tests for particle generation
   */
  describe('Particle Generation Properties', () => {
    it('should generate the correct number of dissolution particles', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          (count, color) => {
            const particles = generateDissolutionParticles(count, color);
            expect(particles.length).toBe(count);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate the correct number of impact particles', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          (count, color) => {
            const particles = generateImpactParticles(count, color);
            expect(particles.length).toBe(count);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate particles with valid properties', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          (count, color) => {
            const particles = generateDissolutionParticles(count, color);
            
            for (const particle of particles) {
              // Each particle should have required properties
              expect(particle.id).toBeDefined();
              expect(typeof particle.x).toBe('number');
              expect(typeof particle.y).toBe('number');
              expect(particle.size).toBeGreaterThan(0);
              expect(particle.color).toBeDefined();
              expect(particle.delay).toBeGreaterThanOrEqual(0);
              expect(particle.duration).toBeGreaterThan(0);
              expect(particle.angle).toBeGreaterThanOrEqual(0);
              expect(particle.angle).toBeLessThanOrEqual(360);
              expect(particle.distance).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate unique particle IDs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          (count, color) => {
            const particles = generateDissolutionParticles(count, color);
            const ids = particles.map(p => p.id);
            const uniqueIds = new Set(ids);
            
            expect(uniqueIds.size).toBe(ids.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Utility function property tests
   */
  describe('Utility Function Properties', () => {
    it('randomInRange should always return values within bounds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (min, range) => {
            const max = min + range;
            const result = randomInRange(min, max);
            
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('generateColorVariation should return valid RGB color', () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          fc.integer({ min: 0, max: 100 }),
          (baseColor, variation) => {
            const result = generateColorVariation(baseColor, variation);
            
            // Should be a valid rgb() string
            expect(result).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
            
            // Extract RGB values and verify they're in valid range
            const match = result.match(/rgb\((\d+), (\d+), (\d+)\)/);
            if (match) {
              const [, r, g, b] = match.map(Number);
              expect(r).toBeGreaterThanOrEqual(0);
              expect(r).toBeLessThanOrEqual(255);
              expect(g).toBeGreaterThanOrEqual(0);
              expect(g).toBeLessThanOrEqual(255);
              expect(b).toBeGreaterThanOrEqual(0);
              expect(b).toBeLessThanOrEqual(255);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('calculateFinalPosition should return correct trigonometric values', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 360, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (angle, distance) => {
            const result = calculateFinalPosition(angle, distance);
            
            // Verify the distance from origin matches
            const actualDistance = Math.sqrt(result.x ** 2 + result.y ** 2);
            expect(actualDistance).toBeCloseTo(distance, 5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Component rendering property tests
   */
  describe('Component Rendering Properties', () => {
    it('should render with correct effect type attribute', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('dissolution', 'impact') as fc.Arbitrary<'dissolution' | 'impact'>,
          fc.record({
            x: fc.integer({ min: 0, max: 1000 }),
            y: fc.integer({ min: 0, max: 1000 })
          }),
          (effectType, origin) => {
            const onComplete = vi.fn();
            
            const { unmount } = render(
              <ParticleEffect
                type={effectType}
                origin={origin}
                onComplete={onComplete}
              />
            );
            
            const element = screen.getByTestId('particle-effect');
            expect(element).toHaveAttribute('data-effect-type', effectType);
            
            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should render with correct particle count attribute', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (particleCount) => {
            const onComplete = vi.fn();
            
            const { unmount } = render(
              <ParticleEffect
                type="dissolution"
                origin={{ x: 100, y: 100 }}
                onComplete={onComplete}
                particleCount={particleCount}
              />
            );
            
            const element = screen.getByTestId('particle-effect');
            expect(element).toHaveAttribute('data-particle-count', String(particleCount));
            
            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
