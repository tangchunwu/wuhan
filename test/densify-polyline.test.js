import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { densifyPolyline } from '../src/landmarks.js';

// Task 2.4: example-based unit tests for densifyPolyline edge cases.
// _Requirements: 1.1_

// Small deterministic PRNG (mulberry32) so jitter behavior is reproducible.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('densifyPolyline edge cases', () => {
  it('returns a length-0 Float32Array for an empty points array', () => {
    const out = densifyPolyline([], 10, 0);
    expect(out).toBeInstanceOf(Float32Array);
    expect(out.length).toBe(0);
  });

  it('returns a length-0 Float32Array for null/undefined points', () => {
    const outNull = densifyPolyline(null, 10, 0);
    const outUndef = densifyPolyline(undefined, 10, 0);
    expect(outNull).toBeInstanceOf(Float32Array);
    expect(outNull.length).toBe(0);
    expect(outUndef).toBeInstanceOf(Float32Array);
    expect(outUndef.length).toBe(0);
  });

  it('places all samples at the single point when given one vertex (jitter=0)', () => {
    const p = new THREE.Vector3(1.5, -2.25, 3.75);
    const count = 8;
    const out = densifyPolyline([p], count, 0);
    expect(out.length).toBe(count * 3);
    for (let i = 0; i < count; i++) {
      expect(out[i * 3]).toBeCloseTo(p.x, 10);
      expect(out[i * 3 + 1]).toBeCloseTo(p.y, 10);
      expect(out[i * 3 + 2]).toBeCloseTo(p.z, 10);
    }
  });

  it('clamps count < 1 to at least one point (count = 0)', () => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 0, 0)];
    const out = densifyPolyline(points, 0, 0);
    expect(out.length).toBe(3);
    // The single clamped sample sits at the start of the polyline.
    expect(out[0]).toBeCloseTo(0, 10);
    expect(out[1]).toBeCloseTo(0, 10);
    expect(out[2]).toBeCloseTo(0, 10);
  });

  it('clamps a negative count to at least one point', () => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 0, 0)];
    const out = densifyPolyline(points, -5, 0);
    expect(out.length).toBe(3);
    expect(Number.isFinite(out[0])).toBe(true);
    expect(Number.isFinite(out[1])).toBe(true);
    expect(Number.isFinite(out[2])).toBe(true);
  });

  it('produces only finite values (no NaN/Infinity) for a normal multi-point polyline', () => {
    const points = [
      new THREE.Vector3(-5.2, -1.06, -1.66),
      new THREE.Vector3(-2.0, 0.96, -1.66),
      new THREE.Vector3(1.74, 0.96, -1.66),
      new THREE.Vector3(4.6, -0.54, -1.66),
    ];
    const out = densifyPolyline(points, 200, 0.05, mulberry32(12345));
    expect(out.length).toBe(200 * 3);
    for (let k = 0; k < out.length; k++) {
      expect(Number.isFinite(out[k])).toBe(true);
    }
  });

  it('spans a simple 2-point line with monotonic non-decreasing x (jitter=0)', () => {
    const start = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(10, 0, 0);
    const count = 11;
    const out = densifyPolyline([start, end], count, 0);
    expect(out.length).toBe(count * 3);

    // First sample at the start, last sample at the end.
    expect(out[0]).toBeCloseTo(0, 6);
    expect(out[1]).toBeCloseTo(0, 6);
    expect(out[2]).toBeCloseTo(0, 6);
    const lastX = out[(count - 1) * 3];
    const lastY = out[(count - 1) * 3 + 1];
    const lastZ = out[(count - 1) * 3 + 2];
    expect(lastX).toBeCloseTo(10, 6);
    expect(lastY).toBeCloseTo(0, 6);
    expect(lastZ).toBeCloseTo(0, 6);

    // x is monotonically non-decreasing across the samples.
    for (let i = 1; i < count; i++) {
      const prevX = out[(i - 1) * 3];
      const curX = out[i * 3];
      expect(curX).toBeGreaterThanOrEqual(prevX - 1e-6);
    }
  });

  it('keeps jitter offsets within [-jitter, +jitter] per axis for a seeded rand', () => {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(3, 1, -2),
      new THREE.Vector3(6, -1, 1),
    ];
    const count = 64;
    const jitter = 0.25;

    // Baseline positions (no jitter) follow the same arc-length sampling, so the
    // difference between jittered and baseline is exactly the per-axis offset.
    const base = densifyPolyline(points, count, 0);
    const jittered = densifyPolyline(points, count, jitter, mulberry32(98765));
    expect(jittered.length).toBe(base.length);

    const eps = 1e-6;
    for (let k = 0; k < jittered.length; k++) {
      const offset = jittered[k] - base[k];
      expect(offset).toBeGreaterThanOrEqual(-jitter - eps);
      expect(offset).toBeLessThanOrEqual(jitter + eps);
    }
  });
});
