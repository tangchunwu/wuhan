import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  reflectionOpacity,
  BRIDGE_REFLECTION_OPACITY_RATIO,
  PAVILION_REFLECTION_OPACITY_RATIO,
} from '../src/landmarks.js';

// Feature: landmark-visual-upgrade, Property 5: Reflection opacity stays in the attenuated band
//
// Validates: Requirements 1.5, 3.4
//
// For any source landmark opacity in (0, 1], the corresponding Water_Reflection
// opacity SHALL equal `ratio * source` with `ratio` in [0.2, 0.5], and SHALL
// therefore be strictly less than the source opacity (since ratio <= 0.5 < 1).

// Generators constrained to the valid input space.
// Source opacity in (0, 1] (avoid 0 so the strict-less-than check is meaningful).
const sourceOpacityArb = fc.double({ min: 0.0001, max: 1, noNaN: true });
// Ratio drawn from the allowed band [0.2, 0.5].
const ratioArb = fc.double({ min: 0.2, max: 0.5, noNaN: true });

// The two real ratio constants used by the bridge and pavilion reflections.
const REAL_RATIOS = [BRIDGE_REFLECTION_OPACITY_RATIO, PAVILION_REFLECTION_OPACITY_RATIO];

describe('Property 5: Reflection opacity stays in the attenuated band', () => {
  it('equals ratio * source for any source in (0,1] and any band ratio in [0.2, 0.5]', () => {
    fc.assert(
      fc.property(sourceOpacityArb, ratioArb, (source, ratio) => {
        expect(reflectionOpacity(source, ratio)).toBeCloseTo(ratio * source);
      }),
      { numRuns: 100 },
    );
  });

  it('is strictly less than the source opacity (ratio <= 0.5 < 1)', () => {
    fc.assert(
      fc.property(sourceOpacityArb, ratioArb, (source, ratio) => {
        expect(reflectionOpacity(source, ratio)).toBeLessThan(source);
      }),
      { numRuns: 100 },
    );
  });

  it('holds for the two real ratio constants (bridge=0.35, pavilion=0.4)', () => {
    fc.assert(
      fc.property(sourceOpacityArb, fc.constantFrom(...REAL_RATIOS), (source, ratio) => {
        expect(reflectionOpacity(source, ratio)).toBeCloseTo(ratio * source);
        expect(reflectionOpacity(source, ratio)).toBeLessThan(source);
      }),
      { numRuns: 100 },
    );
  });

  it('places both real ratio constants within the allowed band [0.2, 0.5]', () => {
    for (const ratio of REAL_RATIOS) {
      expect(ratio).toBeGreaterThanOrEqual(0.2);
      expect(ratio).toBeLessThanOrEqual(0.5);
    }
    // Concrete values called out in the design.
    expect(BRIDGE_REFLECTION_OPACITY_RATIO).toBe(0.35);
    expect(PAVILION_REFLECTION_OPACITY_RATIO).toBe(0.4);
  });
});
