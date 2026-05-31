import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { mirrorAcrossWaterline, REFLECTION_COMPRESS } from '../src/landmarks.js';

// Feature: landmark-visual-upgrade, Property 4: Reflection mirrors geometry across the waterline
//
// Validates: Requirements 1.4, 3.3
//
// For any set of source positions (Float32Array of finite x,y,z triples), any
// finite waterline Y, and any factor in (0, 1], mirrorAcrossWaterline SHALL:
//   (a) preserve each point's x and z exactly,
//   (b) map y to Y - (y - Y) * factor (float-close), and
//   (c) place every reflection of an above-water point (y > Y) at or below Y.

// Generators constrained to the valid input space.
//
// Coordinates and the waterline are kept within a moderate range so that the
// single float32 store performed by mirrorAcrossWaterline stays well inside the
// toBeCloseTo tolerance below (geometry in this scene lives within single/low
// double-digit units, so this range is representative).
const coordArb = fc.double({ min: -100, max: 100, noNaN: true });
const waterYArb = fc.double({ min: -100, max: 100, noNaN: true });
// factor in (0, 1] per the design (e.g. REFLECTION_COMPRESS = 0.82).
const factorArb = fc.double({ min: 0.01, max: 1, noNaN: true });

// Build a source Float32Array from an array of [x,y,z] triples. Reading values
// back out of this array yields the exact float32 representation the
// implementation operates on, keeping expected-value math consistent.
function toPositions(triples) {
  const arr = new Float32Array(triples.length * 3);
  for (let i = 0; i < triples.length; i++) {
    arr[i * 3] = triples[i][0];
    arr[i * 3 + 1] = triples[i][1];
    arr[i * 3 + 2] = triples[i][2];
  }
  return arr;
}

const triplesArb = fc.array(fc.tuple(coordArb, coordArb, coordArb), {
  minLength: 0,
  maxLength: 64,
});

// Sanity: REFLECTION_COMPRESS is a valid compression factor in (0, 1].
describe('Property 4: Reflection mirrors geometry across the waterline', () => {
  it('REFLECTION_COMPRESS is a factor in (0, 1]', () => {
    expect(REFLECTION_COMPRESS).toBeGreaterThan(0);
    expect(REFLECTION_COMPRESS).toBeLessThanOrEqual(1);
  });

  it('(a) preserves x and z of every point exactly', () => {
    fc.assert(
      fc.property(triplesArb, waterYArb, factorArb, (triples, waterY, factor) => {
        const positions = toPositions(triples);
        const reflected = mirrorAcrossWaterline(positions, waterY, factor);
        expect(reflected.length).toBe(positions.length);
        for (let i = 0; i + 2 < positions.length; i += 3) {
          // Both arrays hold float32 values, so x/z round-trip bit-for-bit.
          expect(reflected[i]).toBe(positions[i]);
          expect(reflected[i + 2]).toBe(positions[i + 2]);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('(b) maps y to Y - (y - Y) * factor', () => {
    fc.assert(
      fc.property(triplesArb, waterYArb, factorArb, (triples, waterY, factor) => {
        const positions = toPositions(triples);
        const reflected = mirrorAcrossWaterline(positions, waterY, factor);
        for (let i = 0; i + 2 < positions.length; i += 3) {
          const y = positions[i + 1];
          const expected = waterY - (y - waterY) * factor;
          expect(reflected[i + 1]).toBeCloseTo(expected, 3);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('(c) reflects every above-water point to at or below the waterline', () => {
    const epsilon = 1e-3;
    fc.assert(
      fc.property(triplesArb, waterYArb, factorArb, (triples, waterY, factor) => {
        const positions = toPositions(triples);
        const reflected = mirrorAcrossWaterline(positions, waterY, factor);
        for (let i = 0; i + 2 < positions.length; i += 3) {
          const y = positions[i + 1];
          if (y > waterY) {
            expect(reflected[i + 1]).toBeLessThanOrEqual(waterY + epsilon);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
