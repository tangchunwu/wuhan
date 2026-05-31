import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildLatticeMeshOverlay, BRIDGE_MESH_SEGMENT_COUNT } from '../src/landmarks.js';

// Feature: landmark-visual-upgrade, Property 3: Mesh overlay forms enough closed polygons
//
// Validates: Requirements 1.3
//
// For any random silhouette mask over the bridge bounds, the bridge-mesh-overlay
// produced by buildLatticeMeshOverlay SHALL:
//   (a) report userData.segmentCount >= 200 (the requirement floor; the
//       implementation actually guarantees >= BRIDGE_MESH_SEGMENT_COUNT = 280),
//   (b) emit every TRIANGLE as a closed 3-cycle — its three undirected edges
//       connect exactly three distinct vertices with each vertex appearing in
//       exactly two edges and no dangling/degenerate endpoint, and
//   (c) contain only finite vertex coordinates.
//
// Geometry layout (from the implementation): segments are stored as flat vertex
// pairs. For triangle t, segment k (k=0,1,2) has endpoints at vertex indices
// [t*6 + k*2] and [t*6 + k*2 + 1]; each vertex is 3 floats. There are 6 segments
// per kept quad (2 triangles x 3 edges) so segmentCount is always a multiple of
// 6, and total triangles = segmentCount / 3.

const REQUIREMENT_FLOOR = 200;

// --- Generators constrained to the valid input space. --------------------

// Random, non-degenerate bridge bounds. We generate a min plus a strictly
// positive width/height so maxX > minX and maxY > minY (a real plane rectangle),
// matching how the bridge's bounding plane is described in the design.
const boundsArb = fc
  .record({
    minX: fc.double({ min: -50, max: 50, noNaN: true }),
    width: fc.double({ min: 0.5, max: 80, noNaN: true }),
    minY: fc.double({ min: -50, max: 50, noNaN: true }),
    height: fc.double({ min: 0.5, max: 80, noNaN: true }),
    z: fc.double({ min: -10, max: 10, noNaN: true }),
  })
  .map(({ minX, width, minY, height, z }) => ({
    minX,
    maxX: minX + width,
    minY,
    maxY: minY + height,
    z,
  }));

// Random silhouette predicate parameters. `axis` selects the shape of the
// silhouette; `thr` is a threshold over normalized centroid coordinates in
// [0,1]. Edge thresholds (~0 / ~1) exercise the reject-almost-everything and
// pass-everything paths, where the implementation must grow the lattice or fall
// back to a full-pass mask to still clear the floor.
const maskParamsArb = fc.record({
  axis: fc.integer({ min: 0, max: 4 }),
  thr: fc.double({ min: 0, max: 1, noNaN: true }),
});

// Optional explicit lattice resolution; `undefined` lets the helper pick its
// defaults. Small values exercise the floor-growing branch.
const resArb = fc.option(fc.integer({ min: 2, max: 40 }), { nil: undefined });

const colorArb = fc.integer({ min: 0x000000, max: 0xffffff });
const opacityArb = fc.double({ min: 0, max: 1, noNaN: true });

// Build a silhouette mask closure over the (already-resolved) bounds so the
// predicate is expressed in normalized centroid coordinates.
function makeMask(bounds, { axis, thr }) {
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  return (cx, cy) => {
    const nx = (cx - bounds.minX) / spanX;
    const ny = (cy - bounds.minY) / spanY;
    switch (axis) {
      case 0:
        return nx < thr;
      case 1:
        return ny < thr;
      case 2:
        return (nx + ny) * 0.5 < thr;
      case 3:
        return Math.hypot(nx - 0.5, ny - 0.5) < thr;
      default:
        // A band silhouette down the middle of the plane.
        return Math.abs(nx - 0.5) < thr * 0.5;
    }
  };
}

// Quantize a coordinate so vertices that are meant to be identical (they are
// computed from the same lattice coordinate, so they round-trip bit-for-bit)
// group together robustly under a small tolerance.
function quantize(value) {
  return Math.round(value * 1e5) / 1e5;
}

function vertexKey(positions, vertexIndex) {
  const base = vertexIndex * 3;
  return `${quantize(positions[base])},${quantize(positions[base + 1])},${quantize(positions[base + 2])}`;
}

describe('Property 3: Mesh overlay forms enough closed polygons', () => {
  it('BRIDGE_MESH_SEGMENT_COUNT is at least the requirement floor of 200', () => {
    expect(BRIDGE_MESH_SEGMENT_COUNT).toBeGreaterThanOrEqual(REQUIREMENT_FLOOR);
  });

  it('(a) emits at least 200 segments for any silhouette mask and bounds', () => {
    fc.assert(
      fc.property(boundsArb, maskParamsArb, resArb, resArb, colorArb, opacityArb, (bounds, maskParams, cols, rows, color, opacity) => {
        const mask = makeMask(bounds, maskParams);
        const overlay = buildLatticeMeshOverlay(mask, bounds, cols, rows, color, opacity);

        const segmentCount = overlay.userData.segmentCount;
        expect(segmentCount).toBeGreaterThanOrEqual(REQUIREMENT_FLOOR);
        // 6 segments per kept quad => always a whole number of triangles.
        expect(segmentCount % 3).toBe(0);
      }),
      { numRuns: 100 },
    );
  });

  it('(b) every emitted triangle is a closed 3-cycle (3 distinct vertices, each in exactly 2 edges)', () => {
    fc.assert(
      fc.property(boundsArb, maskParamsArb, resArb, resArb, colorArb, opacityArb, (bounds, maskParams, cols, rows, color, opacity) => {
        const mask = makeMask(bounds, maskParams);
        const overlay = buildLatticeMeshOverlay(mask, bounds, cols, rows, color, opacity);

        const positions = overlay.geometry.getAttribute('position').array;
        const segmentCount = overlay.userData.segmentCount;
        const triangleCount = segmentCount / 3;

        // The position buffer must hold exactly 2 vertices per segment.
        expect(positions.length).toBe(segmentCount * 2 * 3);

        for (let t = 0; t < triangleCount; t++) {
          const edges = [];
          for (let k = 0; k < 3; k++) {
            const a = t * 6 + k * 2;
            const b = t * 6 + k * 2 + 1;
            const ka = vertexKey(positions, a);
            const kb = vertexKey(positions, b);
            // No degenerate / dangling (zero-length) edge.
            expect(ka).not.toBe(kb);
            edges.push([ka, kb]);
          }

          // Exactly three distinct vertices across the three edges.
          const distinct = new Set();
          for (const [ka, kb] of edges) {
            distinct.add(ka);
            distinct.add(kb);
          }
          expect(distinct.size).toBe(3);

          // Each vertex appears in exactly two edges -> a single closed cycle,
          // i.e. no dangling endpoint.
          const degree = new Map();
          for (const [ka, kb] of edges) {
            degree.set(ka, (degree.get(ka) ?? 0) + 1);
            degree.set(kb, (degree.get(kb) ?? 0) + 1);
          }
          for (const key of distinct) {
            expect(degree.get(key)).toBe(2);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('(c) all vertex coordinates are finite', () => {
    fc.assert(
      fc.property(boundsArb, maskParamsArb, resArb, resArb, colorArb, opacityArb, (bounds, maskParams, cols, rows, color, opacity) => {
        const mask = makeMask(bounds, maskParams);
        const overlay = buildLatticeMeshOverlay(mask, bounds, cols, rows, color, opacity);

        const positions = overlay.geometry.getAttribute('position').array;
        for (let i = 0; i < positions.length; i++) {
          expect(Number.isFinite(positions[i])).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
