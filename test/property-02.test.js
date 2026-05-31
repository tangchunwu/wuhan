import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  landmarkDrawCount,
  LANDMARK_PROFILE_RATIO,
  BRIDGE_OUTLINE_COUNT,
} from '../src/landmarks.js';

// Feature: landmark-visual-upgrade, Property 2: Draw-count scaling is monotonic and bounded
//
// Validates: Requirements 1.2, 6.1, 6.2
//
// For any base count, Performance_Profile, and densityScale in [0.34, 1],
// landmarkDrawCount SHALL return a value that
//   (a) never exceeds the base count,
//   (b) is non-decreasing as densityScale increases (profile + baseCount fixed),
//   (c) is non-decreasing across the profile order low <= medium <= high <= extreme
//       (baseCount + densityScale fixed),
//   (d) satisfies landmarkDrawCount(BRIDGE_OUTLINE_COUNT, 'medium', 1) >= 2000,
//   (e) yields count('low', 0.72) < count('medium', 1) for a sufficiently large
//       base count, so a Mobile_Device renders fewer points.

const PROFILE_ORDER = ['low', 'medium', 'high', 'extreme'];

// Generators constrained to the valid input space.
const baseCountArb = fc.integer({ min: 1, max: 10000 });
const largeBaseCountArb = fc.integer({ min: 100, max: 100000 });
const profileArb = fc.constantFrom(...PROFILE_ORDER);
const densityScaleArb = fc.double({ min: 0.34, max: 1, noNaN: true });

describe('Property 2: Draw-count scaling is monotonic and bounded', () => {
  it('(a) never exceeds the base count', () => {
    fc.assert(
      fc.property(baseCountArb, profileArb, densityScaleArb, (base, profile, density) => {
        const result = landmarkDrawCount(base, profile, density);
        expect(result).toBeLessThanOrEqual(base);
      }),
      { numRuns: 100 },
    );
  });

  it('(b) is non-decreasing as densityScale increases (profile + baseCount fixed)', () => {
    fc.assert(
      fc.property(
        baseCountArb,
        profileArb,
        densityScaleArb,
        densityScaleArb,
        (base, profile, d1, d2) => {
          const lo = Math.min(d1, d2);
          const hi = Math.max(d1, d2);
          expect(landmarkDrawCount(base, profile, lo)).toBeLessThanOrEqual(
            landmarkDrawCount(base, profile, hi),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('(c) is non-decreasing across profile order low <= medium <= high <= extreme', () => {
    fc.assert(
      fc.property(baseCountArb, densityScaleArb, (base, density) => {
        for (let i = 0; i < PROFILE_ORDER.length - 1; i++) {
          const lower = landmarkDrawCount(base, PROFILE_ORDER[i], density);
          const upper = landmarkDrawCount(base, PROFILE_ORDER[i + 1], density);
          expect(lower).toBeLessThanOrEqual(upper);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('(d) landmarkDrawCount(BRIDGE_OUTLINE_COUNT, medium, 1) >= 2000', () => {
    // This is a fixed assertion, but exercise it inside fc.assert for >= 100 runs
    // alongside the profile-ratio invariant that backs it.
    fc.assert(
      fc.property(fc.constant(null), () => {
        expect(landmarkDrawCount(BRIDGE_OUTLINE_COUNT, 'medium', 1)).toBeGreaterThanOrEqual(2000);
        // Sanity: the medium ratio is what makes this hold.
        expect(LANDMARK_PROFILE_RATIO.medium).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('(e) count(low, 0.72) < count(medium, 1) for a sufficiently large base count', () => {
    fc.assert(
      fc.property(largeBaseCountArb, (base) => {
        const mobile = landmarkDrawCount(base, 'low', 0.72);
        const desktop = landmarkDrawCount(base, 'medium', 1);
        expect(mobile).toBeLessThan(desktop);
      }),
      { numRuns: 100 },
    );
    // Also assert against the concrete bridge budget called out in the design.
    expect(landmarkDrawCount(BRIDGE_OUTLINE_COUNT, 'low', 0.72)).toBeLessThan(
      landmarkDrawCount(BRIDGE_OUTLINE_COUNT, 'medium', 1),
    );
  });
});
