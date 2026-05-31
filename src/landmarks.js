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
export const RIPPLE_RING_SEGMENTS = 64; // segments per ripple line loop

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

// Produce a vertically mirrored copy across a waterline.
//
// - `positions`: a Float32Array of length N*3 (x,y,z per point).
// - `waterY`: the waterline height the geometry is mirrored across.
// - `factor`: vertical compression of the reflection; defaults to
//   REFLECTION_COMPRESS when undefined.
//
// Returns a NEW Float32Array of the same length where each point's x and z are
// preserved and y is mapped to: y' = waterY - (y - waterY) * factor. Because
// factor is in (0, 1], every reflection of an above-water point (y > waterY)
// lands at or below the waterline, producing a vertical mirror below it.
//
// Degenerate input is guarded: empty/null `positions` returns Float32Array(0);
// non-finite inputs (positions, waterY, factor) are sanitized to safe finite
// values so the output never contains NaN.
export function mirrorAcrossWaterline(positions, waterY, factor) {
  if (!positions || positions.length === 0) {
    return new Float32Array(0);
  }

  const safeWaterY = Number.isFinite(waterY) ? waterY : 0;
  // factor defaults to REFLECTION_COMPRESS when undefined; any non-finite value
  // also falls back to the default so we never emit NaN.
  const safeFactor = Number.isFinite(factor) ? factor : REFLECTION_COMPRESS;

  const out = new Float32Array(positions.length);
  for (let i = 0; i + 2 < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    out[i] = Number.isFinite(x) ? x : 0;
    const safeY = Number.isFinite(y) ? y : safeWaterY;
    out[i + 1] = safeWaterY - (safeY - safeWaterY) * safeFactor;
    out[i + 2] = Number.isFinite(z) ? z : 0;
  }
  return out;
}

// Return the attenuated reflection opacity (ratio * sourceOpacity).
//
// The `ratio` is expected to be in [0.2, 0.5] (callers pass the fixed
// BRIDGE_REFLECTION_OPACITY_RATIO / PAVILION_REFLECTION_OPACITY_RATIO
// constants). The ratio itself is not clamped here — it is simply multiplied —
// but non-finite inputs are guarded by returning 0 so the result is never NaN.
export function reflectionOpacity(sourceOpacity, ratio) {
  if (!Number.isFinite(sourceOpacity) || !Number.isFinite(ratio)) {
    return 0;
  }
  return ratio * sourceOpacity;
}

// Build a triangulated polygon web as a THREE.LineSegments with
// userData.segmentCount.
//
// - `maskFn(cx, cy)`: returns true when the lattice cell whose centroid is at
//   (cx, cy) should be kept. Defaults to a permissive full-pass mask when not a
//   function. Exceptions thrown by the mask are treated as "reject".
// - `bounds`: `{ minX, maxX, minY, maxY }` describing the 2D plane the lattice
//   covers. Points are placed at z = `bounds.z` (or 0 when absent), i.e. a
//   constant plane. Non-finite / degenerate bounds are sanitized to a
//   non-degenerate rectangle so every emitted triangle has three distinct
//   vertices.
// - `cols`, `rows`: lattice vertex resolution (>= 2 each). Defaulted when not
//   provided, and increased automatically so the emitted segment count never
//   drops below `BRIDGE_MESH_SEGMENT_COUNT`.
// - `color`: a THREE.Color / hex / CSS string applied to every vertex via the
//   `color` attribute (vertexColors). Defaults to white on invalid input.
// - `opacity`: line material opacity (defaults to 1 on non-finite input).
//
// Lays a `cols x rows` lattice of vertices over the bounds. For each cell the
// centroid is computed; if `maskFn(centroid)` passes, the quad is split into two
// triangles and each triangle's three undirected edges are emitted as closed
// line segments (a 3-cycle: A-B, B-C, C-A), so every triangle is closed with no
// dangling endpoint. Returns a THREE.LineSegments (additive, depthWrite:false,
// transparent) with `userData.segmentCount` set to the number of emitted
// segments, guaranteed `>= BRIDGE_MESH_SEGMENT_COUNT`.
export function buildLatticeMeshOverlay(maskFn, bounds, cols, rows, color, opacity) {
  // --- Sanitize bounds into a non-degenerate plane rectangle. ---
  const b = bounds && typeof bounds === 'object' ? bounds : {};
  let minX = Number.isFinite(b.minX) ? b.minX : -1;
  let maxX = Number.isFinite(b.maxX) ? b.maxX : 1;
  let minY = Number.isFinite(b.minY) ? b.minY : -1;
  let maxY = Number.isFinite(b.maxY) ? b.maxY : 1;
  // Guarantee positive width/height so each cell yields three distinct vertices.
  if (!(maxX > minX)) maxX = minX + 1;
  if (!(maxY > minY)) maxY = minY + 1;
  const planeZ = Number.isFinite(b.z) ? b.z : 0;

  // --- Sanitize mask, opacity, and lattice resolution. ---
  const mask = typeof maskFn === 'function' ? maskFn : () => true;
  const opacityVal = Number.isFinite(opacity) ? opacity : 1;

  const DEFAULT_COLS = 24; // wide lattice (the bridge spans horizontally)
  const DEFAULT_ROWS = 10;
  const MAX_RES = 512; // safety clamp against pathological inputs
  // A lattice needs >= 2 vertices per axis to form at least one cell.
  let effCols = Number.isFinite(cols) && cols >= 2 ? Math.min(MAX_RES, Math.floor(cols)) : DEFAULT_COLS;
  let effRows = Number.isFinite(rows) && rows >= 2 ? Math.min(MAX_RES, Math.floor(rows)) : DEFAULT_ROWS;

  const FLOOR = BRIDGE_MESH_SEGMENT_COUNT; // >= 200 closed-triangle segments

  // Collect triangle edges for a given mask + lattice resolution. Returns a
  // plain number[] of (x,y,z) pairs (two vertices per segment); each triangle's
  // three edges are emitted consecutively as a closed loop.
  const collect = (testFn, nCols, nRows) => {
    const verts = [];
    const xAt = (i) => minX + ((maxX - minX) * i) / (nCols - 1);
    const yAt = (j) => minY + ((maxY - minY) * j) / (nRows - 1);
    const pushEdge = (ax, ay, bx, by) => {
      verts.push(ax, ay, planeZ, bx, by, planeZ);
    };
    for (let i = 0; i < nCols - 1; i++) {
      const x0 = xAt(i);
      const x1 = xAt(i + 1);
      for (let j = 0; j < nRows - 1; j++) {
        const y0 = yAt(j);
        const y1 = yAt(j + 1);
        const cx = (x0 + x1) * 0.5;
        const cy = (y0 + y1) * 0.5;
        let keep;
        try {
          keep = !!testFn(cx, cy);
        } catch {
          keep = false;
        }
        if (!keep) continue;
        // Quad corners: (x0,y0)=A (x1,y0)=B (x1,y1)=C (x0,y1)=D.
        // Triangle 1: A-B-C (closed 3-cycle of edges).
        pushEdge(x0, y0, x1, y0);
        pushEdge(x1, y0, x1, y1);
        pushEdge(x1, y1, x0, y0);
        // Triangle 2: A-C-D (closed 3-cycle of edges).
        pushEdge(x0, y0, x1, y1);
        pushEdge(x1, y1, x0, y1);
        pushEdge(x0, y1, x0, y0);
      }
    }
    return verts;
  };

  const segCount = (verts) => verts.length / 6;

  // 1) Build with the provided mask at the requested/default resolution.
  let verts = collect(mask, effCols, effRows);

  // 2) If under the floor, grow the lattice (preserving aspect ratio) so a
  //    sparse-but-nonzero mask keeps enough cells to clear the floor. Bounded
  //    to a handful of attempts so a reject-everything mask can't spin forever.
  let growAttempts = 0;
  while (segCount(verts) < FLOOR && growAttempts < 6) {
    effCols = Math.min(MAX_RES, Math.ceil(effCols * 1.5));
    effRows = Math.min(MAX_RES, Math.ceil(effRows * 1.5));
    verts = collect(mask, effCols, effRows);
    growAttempts++;
  }

  // 3) If still under the floor (e.g. the mask rejects everything), fall back to
  //    a permissive full-pass mask on a modest lattice that guarantees >= FLOOR.
  if (segCount(verts) < FLOOR) {
    let fbCols = DEFAULT_COLS;
    let fbRows = DEFAULT_ROWS;
    verts = collect(() => true, fbCols, fbRows);
    while (segCount(verts) < FLOOR) {
      fbCols = Math.min(MAX_RES, Math.ceil(fbCols * 1.5));
      fbRows = Math.min(MAX_RES, Math.ceil(fbRows * 1.5));
      verts = collect(() => true, fbCols, fbRows);
    }
  }

  // --- Build geometry + colored, additive line material. ---
  const positions = new Float32Array(verts);
  let lineColor;
  try {
    lineColor = new THREE.Color(color === undefined || color === null ? 0xffffff : color);
  } catch {
    lineColor = new THREE.Color(0xffffff);
  }
  const vertexCount = positions.length / 3;
  const colors = new Float32Array(vertexCount * 3);
  for (let v = 0; v < vertexCount; v++) {
    colors[v * 3] = lineColor.r;
    colors[v * 3 + 1] = lineColor.g;
    colors[v * 3 + 2] = lineColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: opacityVal,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.userData.segmentCount = positions.length / 6;
  return lines;
}

// Build `ringCount` horizontal ellipse line loops sharing a common center on a
// waterline, for ripple effects on the lake surface.
//
// - `center`: `{ x, y, z }` lake-surface center; `center.y` is the waterline
//   height every ring sits at.
// - `ringCount`: number of concentric rings to build (must be >= 1).
// - `baseRadius`: radius of the innermost ring (ring 0).
// - `step`: radius increment per ring, so ring `i` has
//   `radius = baseRadius + i * step`. Radii are therefore STRICTLY INCREASING.
// - `color`: a THREE.Color / hex / CSS string applied to every ring's material.
//
// Each ring is a flat horizontal loop in the XZ plane at `y = center.y` (a
// ripple lying on the water surface), built as a `THREE.LineLoop` from a
// circle of `RIPPLE_RING_SEGMENTS` segments so all rings share the exact same
// center. Each ring's material is a `THREE.LineBasicMaterial` with
// `transparent: true`, `AdditiveBlending`, and `depthWrite: false`, and each
// ring carries `userData.baseOpacity` (decreasing slightly with radius) plus
// `userData.radius` so the animation loop can fade/animate them.
//
// Returns an ARRAY of `THREE.Line` (`LineLoop`) objects of length `ringCount`.
//
// Guards: `ringCount < 1` or non-finite returns `[]`. Non-finite
// `center` / `baseRadius` / `step` are sanitized to safe finite, positive
// values, and `step` is floored to a tiny positive value so radii stay strictly
// increasing. The output never contains NaN.
export function buildRippleRings(center, ringCount, baseRadius, step, color) {
  // Guard ring count: must be a finite integer >= 1.
  const count = Number.isFinite(ringCount) ? Math.floor(ringCount) : 0;
  if (count < 1) {
    return [];
  }

  // Sanitize the shared center to finite values (defaults to the origin).
  const c = center && typeof center === 'object' ? center : {};
  const cx = Number.isFinite(c.x) ? c.x : 0;
  const cy = Number.isFinite(c.y) ? c.y : 0;
  const cz = Number.isFinite(c.z) ? c.z : 0;

  // Sanitize radii. baseRadius must be positive so ring 0 is a real loop, and
  // step must be strictly positive so radii are strictly increasing.
  const safeBaseRadius = Number.isFinite(baseRadius) && baseRadius > 0 ? baseRadius : 0.5;
  const safeStep = Number.isFinite(step) && step > 0 ? step : 0.3;

  // Resolve the shared ring color once (fallback to white on invalid input).
  let ringColor;
  try {
    ringColor = new THREE.Color(color === undefined || color === null ? 0xffffff : color);
  } catch {
    ringColor = new THREE.Color(0xffffff);
  }

  const SEGMENTS = RIPPLE_RING_SEGMENTS;
  const rings = [];

  for (let i = 0; i < count; i++) {
    const radius = safeBaseRadius + i * safeStep;

    // Flat horizontal loop in the XZ plane at the waterline (y = center.y).
    const positions = new Float32Array(SEGMENTS * 3);
    for (let s = 0; s < SEGMENTS; s++) {
      const angle = (s / SEGMENTS) * Math.PI * 2;
      positions[s * 3] = cx + Math.cos(angle) * radius;
      positions[s * 3 + 1] = cy;
      positions[s * 3 + 2] = cz + Math.sin(angle) * radius;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: ringColor.clone(),
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Closed loop (LineLoop extends THREE.Line) so the ring needs no duplicate
    // closing vertex.
    const ring = new THREE.LineLoop(geometry, material);
    // Opacity decreases slightly with radius so outer ripples read fainter.
    ring.userData.baseOpacity = Math.max(0.08, 0.5 - i * 0.08);
    ring.userData.radius = radius;
    rings.push(ring);
  }

  return rings;
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
