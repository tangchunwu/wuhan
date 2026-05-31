// Feature: landmark-visual-upgrade
//
// Shared, headless-testable module for the upgraded Wuhan landmarks
// (Bridge, Spire, Pavilion, Skyline). This module hosts the pure geometry /
// color / draw-count helpers and the four landmark factories so they can be
// unit/property tested in isolation without WebGL, then imported by
// `src/main.jsx`.
//
// Task 1.2 scaffolds the module: it exports the new particle-count and styling
// constants from the design's Data Models section and provides
// non-throwing stub exports for the helpers filled in by later tasks. The
// module must stay importable with no side effects and no throws on import.

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Particle-count constants
// Base (extreme-profile) point budgets; scaled per profile + densityScale at
// runtime via landmarkDrawCount().
// ---------------------------------------------------------------------------
export const BRIDGE_OUTLINE_COUNT = 4200; // medium ratio 0.5 => 2100 >= 2000 (Req 1.2)
export const BRIDGE_MESH_SEGMENT_COUNT = 280; // closed-triangle edges, always >= 200 (Req 1.3)
export const SPIRE_CORE_COUNT = 900;
export const SPIRE_RIBBON_COUNT = 2400; // total across strands
export const SPIRE_ACCENT_COUNT = 700;
export const PAVILION_OUTLINE_COUNT = 1800;
export const PAVILION_TREE_COUNT = 2; // tree forms (Req 3.1)
export const PAVILION_TOWER_COUNT = 520;
export const PAVILION_RIPPLE_COUNT = 3; // ripple rings (Req 3.3)
export const SKYLINE_LANDMARK_COUNT = 1600;
export const SPIRE_STRAND_COUNT = 3; // helical ribbons (Req 2.3)
export const SPIRE_RING_COUNT = 2; // base orbit rings (Req 2.4)

// Per-profile multiplier for landmark point clouds (mirrors PARTICLE_PROFILES intent).
export const LANDMARK_PROFILE_RATIO = { low: 0.34, medium: 0.5, high: 0.78, extreme: 1 };

// ---------------------------------------------------------------------------
// Geometry / styling constants
// ---------------------------------------------------------------------------
export const SKYLINE_PLANE_Z = -2.82; // legacy skyline depth; deepest plane
export const SKYLINE_CONSTANT_OPACITY = 0.06; // >= 0.05, < foreground (Req 4.3)
export const BRIDGE_REFLECTION_OPACITY_RATIO = 0.35; // in [0.2, 0.5] (Req 1.5)
export const PAVILION_REFLECTION_OPACITY_RATIO = 0.4;
export const REFLECTION_COMPRESS = 0.82; // vertical squash of reflections
export const SPIRE_HEIGHT = 2.6;
export const SPIRE_BASE_RADIUS = 0.42; // base width 0.84; height 2.6 >= 2*0.84 (Req 2.1)
export const SPIRE_TAPER = 0.62;
export const BRIDGE_GOLD_FRACTION = 0.62; // > 0.5 gold (Req 1.6)

// ---------------------------------------------------------------------------
// Pure geometry helpers (stubs — implemented in tasks 2.x)
// ---------------------------------------------------------------------------

// Distribute `count` particle positions along a polyline (arc-length
// interpolation) with bounded random jitter.
//
// - `points`: array of THREE.Vector3 or {x,y,z} defining the polyline path.
// - `count`: number of particle positions to distribute along the polyline
//   (clamped to >= 1).
// - `jitter`: max bounded random offset applied to each axis of each point.
// - `rand`: function returning a float in [0,1) (seeded RNG); defaults to
//   Math.random when not provided.
//
// Returns a Float32Array of length count*3 (x,y,z per point). Positions are
// sampled at even arc-length fractions along the polyline (cumulative segment
// lengths) and linearly interpolated between the two bounding vertices, then
// offset by a bounded jitter in [-jitter, +jitter] per axis.
//
// Degenerate input is guarded: empty/null `points` returns Float32Array(0);
// a zero-length polyline (single point or all coincident vertices) places
// every sample at that single point (no division by zero); the output never
// contains NaN.
export function densifyPolyline(points, count, jitter, rand) {
  if (!points || points.length === 0) {
    return new Float32Array(0);
  }

  const rng = typeof rand === 'function' ? rand : Math.random;
  // Clamp count to >= 1 and coerce to an integer.
  const safeCount = Math.max(1, Math.floor(Number.isFinite(count) ? count : 1));
  // Sanitize jitter to a finite, non-negative magnitude.
  const jitterMag = Number.isFinite(jitter) && jitter > 0 ? jitter : 0;

  // Normalize vertices to finite {x,y,z} triples.
  const verts = points.map((p) => ({
    x: Number.isFinite(p?.x) ? p.x : 0,
    y: Number.isFinite(p?.y) ? p.y : 0,
    z: Number.isFinite(p?.z) ? p.z : 0,
  }));

  const out = new Float32Array(safeCount * 3);

  const applyJitter = (i, x, y, z) => {
    const jx = jitterMag > 0 ? (rng() * 2 - 1) * jitterMag : 0;
    const jy = jitterMag > 0 ? (rng() * 2 - 1) * jitterMag : 0;
    const jz = jitterMag > 0 ? (rng() * 2 - 1) * jitterMag : 0;
    out[i * 3] = x + jx;
    out[i * 3 + 1] = y + jy;
    out[i * 3 + 2] = z + jz;
  };

  // Single point: place every sample at that point (+ jitter).
  if (verts.length === 1) {
    const v = verts[0];
    for (let i = 0; i < safeCount; i++) {
      applyJitter(i, v.x, v.y, v.z);
    }
    return out;
  }

  // Compute cumulative arc lengths along the polyline.
  const cumulative = new Array(verts.length);
  cumulative[0] = 0;
  for (let i = 1; i < verts.length; i++) {
    const a = verts[i - 1];
    const b = verts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const segLen = Math.sqrt(dx * dx + dy * dy + dz * dz);
    cumulative[i] = cumulative[i - 1] + segLen;
  }
  const totalLength = cumulative[verts.length - 1];

  // Zero-length polyline (all coincident): place all samples at first vertex.
  if (totalLength <= 0) {
    const v = verts[0];
    for (let i = 0; i < safeCount; i++) {
      applyJitter(i, v.x, v.y, v.z);
    }
    return out;
  }

  let seg = 1; // index of the segment end vertex we are walking toward.
  for (let i = 0; i < safeCount; i++) {
    // Even arc-length fraction in [0,1]; single-sample case sits at the start.
    const frac = safeCount === 1 ? 0 : i / (safeCount - 1);
    const target = frac * totalLength;

    // Advance to the segment whose cumulative range contains `target`.
    while (seg < verts.length - 1 && cumulative[seg] < target) {
      seg++;
    }

    const a = verts[seg - 1];
    const b = verts[seg];
    const segStart = cumulative[seg - 1];
    const segLen = cumulative[seg] - segStart;
    // Local interpolation parameter within this segment.
    const t = segLen > 0 ? (target - segStart) / segLen : 0;

    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const z = a.z + (b.z - a.z) * t;
    applyJitter(i, x, y, z);
  }

  return out;
}

// Produce a vertically mirrored copy across a waterline:
// y' = waterY - (y - waterY) * factor; x/z unchanged. Implemented in task 2.5.
export function mirrorAcrossWaterline(positions, waterY, factor) {
  return new Float32Array(0);
}

// Return the attenuated reflection opacity (ratio * sourceOpacity).
// Implemented in task 2.5.
export function reflectionOpacity(sourceOpacity, ratio) {
  return undefined;
}

// Build a triangulated polygon web as a THREE.LineSegments with
// userData.segmentCount. Implemented in task 2.8.
export function buildLatticeMeshOverlay(maskFn, bounds, cols, rows, color, opacity) {
  return undefined;
}

// Build `ringCount` horizontal ellipse line loops centered on a waterline for
// ripple effects. Implemented in task 2.10.
export function buildRippleRings(center, ringCount, baseRadius, step, color) {
  return [];
}

// Wrap a ShaderMaterial point cloud (depth-attenuated gl_PointSize, uOpacity,
// uPixelRatio), additive, depthWrite:false. Implemented in task 7.3.
export function makePointCloud(positions, colors, sizes, baseOpacity, name) {
  return undefined;
}

// ---------------------------------------------------------------------------
// Draw-count scaling (stub — implemented in task 2.1)
// ---------------------------------------------------------------------------

// floor(baseCount * profileRatio * clamp(densityScale, 0.34, 1)).
export function landmarkDrawCount(baseCount, profileId, densityScale) {
  const ratio = LANDMARK_PROFILE_RATIO[profileId] ?? LANDMARK_PROFILE_RATIO.medium;
  return Math.floor(baseCount * ratio * THREE.MathUtils.clamp(densityScale, 0.34, 1));
}

// ---------------------------------------------------------------------------
// Opacity / mode integration (stub — implemented in task 4.1)
// ---------------------------------------------------------------------------

// Return { bridge, spire, pavilion, skyline } target opacities in [0,1].
export function computeLandmarkOpacityTargets(ctx) {
  return { bridge: 0, spire: 0, pavilion: 0, skyline: 0 };
}

// ---------------------------------------------------------------------------
// Legacy-motif removal (stub — implemented in task 5.1)
// ---------------------------------------------------------------------------

// Traverse `root`, detaching and disposing any object whose name is in `names`.
// Implemented in task 5.1.
export function removeMotifsByName(root, names) {
  return undefined;
}

// ---------------------------------------------------------------------------
// Color-assignment helpers + allowed color sets (stubs — implemented in task 3.1)
// ---------------------------------------------------------------------------

// Per-landmark allowed-color sets exported for testing; populated in task 3.1.
export const BRIDGE_ALLOWED_COLORS = [];
export const SPIRE_CORE_ALLOWED_COLORS = [];
export const SPIRE_RIBBON_ALLOWED_COLORS = [];
export const SPIRE_ACCENT_ALLOWED_COLORS = [];
export const PAVILION_ALLOWED_COLORS = [];
export const SKYLINE_ALLOWED_COLORS = [];

// Assign per-point colors for each landmark. Implemented in task 3.1.
export function assignBridgeColors(count, rand) {
  return new Float32Array(0);
}

export function assignSpireCoreColors(count, rand) {
  return new Float32Array(0);
}

export function assignSpireRibbonColors(count, rand) {
  return new Float32Array(0);
}

export function assignSpireAccentColors(count, rand) {
  return new Float32Array(0);
}

export function assignPavilionColors(count, rand) {
  return new Float32Array(0);
}

export function assignSkylineColors(count, rand) {
  return new Float32Array(0);
}

// ---------------------------------------------------------------------------
// Landmark factories (stubs — implemented in tasks 7.x, 8.x, 9.x, 10.x)
// Each returns a named THREE.Group with userData.opacity = 0 and visible=false
// once implemented. Stubs return undefined to keep the module importable.
// ---------------------------------------------------------------------------

export function createBridgeLandmark() {
  return undefined;
}

export function createSpireLandmark() {
  return undefined;
}

export function createPavilionLandmark() {
  return undefined;
}

export function createSkylineLandmark() {
  return undefined;
}
