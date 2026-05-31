import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import './style.css';

const PARTICLE_COUNT = 100000;
const NETWORK_NODE_COUNT = 3600;
const NETWORK_EDGE_COUNT = 9600;
const GRAPH_NEBULA_VEIL_LINE_COUNT = 5200;
const GRAPH_NEBULA_VEIL_NODE_COUNT = 520;
const NETWORK_FLOW_PACKET_COUNT = 1400;
const RIVER_FLOW_PACKET_COUNT = 260;
const LANDMARK_PULSE_COUNT = 140;
const BIRTH_VORTEX_PACKET_COUNT = 180;
const DEEP_SPACE_DUST_COUNT = 1800;
const CENTRAL_RELATION_RAY_COUNT = 220;
const GRAPH_COMPUTE_WAVE_COUNT = 7;
const JIANGCHENG_VOICE_PACKET_COUNT = 132;
const WUHAN_TOWN_PACKET_COUNT = 168;
const CITY_MEMORY_CODE_COUNT = 240;
const WUHAN_MEMORY_ORBIT_PACKET_COUNT = 192;
const RIVER_POINT_COUNT = 260;
const DPR_LIMIT = 1.65;
const PARTICLE_PROFILES = {
  low: { label: '轻量', particleRatio: 0.065, networkRatio: 0.16, bloom: 0.42, dpr: 1 },
  medium: { label: '均衡', particleRatio: 0.18, networkRatio: 0.36, bloom: 0.56, dpr: 1.1 },
  high: { label: '高密', particleRatio: 0.48, networkRatio: 0.72, bloom: 0.66, dpr: 1.18 },
  extreme: { label: '极限', particleRatio: 1, networkRatio: 1, bloom: 0.7, dpr: 1.12 },
};
const MODES = [
  { id: 'nebula', label: '星云态' },
  { id: 'suanbird', label: '蒜鸟态' },
  { id: 'city', label: '城市态' },
  { id: 'network', label: '网络态' },
  { id: 'burst', label: '爆发态' },
];
const CAMERA_PRESETS = [
  { id: 'overview', label: '全景', mode: 'nebula', position: [1.18, 0.72, 6.35], target: [0.22, 0.02, 0] },
  { id: 'suanbird', label: '蒜鸟', mode: 'suanbird', position: [2.45, 1.05, 6.2], target: [0.24, 0.16, 0] },
  { id: 'city', label: '城市', mode: 'city', position: [-5.7, 1.08, 6.45], target: [0, -0.08, -0.4] },
  { id: 'network', label: '网络', mode: 'network', position: [6.55, 1.55, 7.8], target: [0, 0.02, 0] },
  { id: 'towns', label: '三镇', mode: 'city', memory: '长江大桥', position: [-3.8, 1.35, 5.45], target: [-0.55, -0.2, -0.35] },
  { id: 'voice', label: '声纹', mode: 'suanbird', memory: '江汉路', position: [1.45, 0.62, 4.85], target: [0.18, 0.06, 0.28] },
  { id: 'birth', label: '诞生', mode: 'burst', memory: '黄鹤楼', position: [-1.35, 1.46, 9.2], target: [-0.18, 0.1, 0] },
  { id: 'confluence', label: '江汇', mode: 'city', memory: '汉口江滩', position: [-1.4, 0.9, 5.8], target: [0.12, -0.46, -0.18] },
];
const DEMO_INTERVAL_MS = 5400;
const DEMO_PROLOGUE_SEQUENCE = [
  { id: 'nebula', preset: 'overview', memory: '汉口江滩', beat: '序章：江风、街巷和人声先被编码成一团黑色星云。' },
  { id: 'network', preset: 'network', memory: '长江大桥', beat: '桥梁与节点被点亮，城市关系开始在细线之间传递。' },
  { id: 'city', preset: 'city', memory: '黄鹤楼', beat: '长江、汉水、黄鹤楼和大桥浮出，武汉成为这团星云的骨架。' },
  { id: 'suanbird', preset: 'voice', memory: '江汉路', beat: '街巷烟火回流到中心，蒜瓣、鸟头和蒜苗开始聚合。' },
  { id: 'burst', preset: 'birth', memory: '光谷', beat: '中心白光外扩后回收，蒜鸟像从城市网络里重新诞生。' },
];
const DEMO_SEQUENCE = DEMO_PROLOGUE_SEQUENCE.map((item) => item.id);
const DEMO_MEMORY_SEQUENCE = DEMO_PROLOGUE_SEQUENCE.map((item) => item.memory);
const DEMO_CAMERA_SEQUENCE = DEMO_PROLOGUE_SEQUENCE.map((item) => item.preset);
const AESTHETIC_AUDIT_INTERVAL_MS = 4200;
const AESTHETIC_AUDIT_SEQUENCE = [
  { id: 'suanbird', preset: 'suanbird', memory: '江汉路', beat: '审美巡检：看蒜形身体、鸟头、喙、眼点、蒜苗和翅膀是否第一眼成立。' },
  { id: 'network', preset: 'network', memory: '长江大桥', beat: '审美巡检：看节点、细线、深度扫描和中心关系光束是否接近 GraphPU 图谱感。' },
  { id: 'city', preset: 'confluence', memory: '汉口江滩', beat: '审美巡检：看长江、汉水、黄鹤楼、大桥和城市记忆是否融进空间。' },
  { id: 'city', preset: 'towns', memory: '武大樱花', beat: '审美巡检：看黑底、白光青绿、粉金橙点缀的比例是否克制。' },
  { id: 'burst', preset: 'birth', memory: '黄鹤楼', beat: '审美巡检：看中心爆发后，蒜鸟是否像从武汉城市网络中诞生。' },
];
const AESTHETIC_AUDIT_PRESETS = AESTHETIC_AUDIT_SEQUENCE.map((item) => item.preset);
const URL_SCENE_PARAMS = ['preset', 'mode', 'profile', 'density', 'speed', 'intensity', 'demo', 'audit', 'panel', 'immersive', 'paused'];

const palette = {
  sprout: new THREE.Color('#7dfc91'),
  river: new THREE.Color('#42d9c8'),
  core: new THREE.Color('#fff8d9'),
  noodle: new THREE.Color('#f5c85a'),
  sakura: new THREE.Color('#ff8fb8'),
  ember: new THREE.Color('#ff6b36'),
  dim: new THREE.Color('#23362c'),
};
const READABILITY_TUNING = {
  coreSphereOpacity: 0.34,
  coreRayOpacity: 0.24,
  cityNetworkExposure: 0.42,
  graphNetworkExposure: 0.43,
  foregroundAnchorLift: 0.16,
  birdParticleScale: 0.31,
  cityParticleOpacityCut: 0.78,
  graphParticleOpacityCut: 0.82,
  birdParticleOpacityCut: 0.8,
  cityCoreBoostCut: 0.98,
  graphCoreBoostCut: 1.02,
  birdCoreBoostCut: 0.76,
  birdParticleCountScale: 0.38,
  cityParticleCountScale: 0.68,
  graphParticleCountScale: 0.56,
  burstParticleCountScale: 0.36,
};

const SCENE_SIGNATURES = {
  nebula: {
    tint: '#d7e6cf',
    networkTint: '#e6e3d3',
    citySilence: 0.96,
    graphPresence: 0.92,
    birdPresence: 0.08,
    vortexPresence: 0.12,
    skylinePresence: 0.02,
    riverPresence: 0.08,
    rotationBias: -0.04,
    verticalBias: 0.02,
  },
  suanbird: {
    tint: '#f7ffd7',
    networkTint: '#7dfc91',
    citySilence: 0.9,
    graphPresence: 0.12,
    birdPresence: 1.18,
    vortexPresence: 0.1,
    skylinePresence: 0.04,
    riverPresence: 0.08,
    rotationBias: -0.32,
    verticalBias: 0.16,
  },
  city: {
    tint: '#42d9c8',
    networkTint: '#f5c85a',
    citySilence: 0,
    graphPresence: 0.12,
    birdPresence: 0.32,
    vortexPresence: 0.18,
    skylinePresence: 1.1,
    riverPresence: 1.18,
    rotationBias: 0.16,
    verticalBias: -0.08,
  },
  network: {
    tint: '#6fa8ff',
    networkTint: '#5a7dff',
    citySilence: 0.78,
    graphPresence: 1.36,
    birdPresence: 0.08,
    vortexPresence: 0.2,
    skylinePresence: 0.08,
    riverPresence: 0.18,
    rotationBias: 0.28,
    verticalBias: 0.04,
  },
  burst: {
    tint: '#ffd9a8',
    networkTint: '#2e86ff',
    citySilence: 0.68,
    graphPresence: 0.3,
    birdPresence: 0.38,
    vortexPresence: 1.34,
    skylinePresence: 0.18,
    riverPresence: 0.26,
    rotationBias: 0,
    verticalBias: 0.1,
  },
};

const WUHAN_MEMORY_HOTSPOTS = [
  { name: '江汉路', note: '街巷烟火', position: [-3.15, 0.8, -2.35], color: '#fff1a8', story: '老街、招牌和人声，是城市记忆里最热闹的一束线。' },
  { name: '汉口江滩', note: '江风码头', position: [-4.05, -0.35, -0.8], color: '#42d9c8', story: '江风把码头、轮渡和散步的人群连接成城市边界。' },
  { name: '长江大桥', note: '钢索与浪', position: [-1.25, -1.18, -1.75], color: '#f5c85a', story: '桥把三镇缝在一起，也让图谱有了横向骨架。' },
  { name: '黄鹤楼', note: '金色远景', position: [2.5, 0.92, -2.42], color: '#fff8d9', story: '它不做写实地标，只作为远处的金色时间坐标。' },
  { name: '东湖', note: '湖面呼吸', position: [3.75, 0.12, 0.95], color: '#7dfc91', story: '湖面让城市图谱慢下来，像一块会呼吸的留白。' },
  { name: '武大樱花', note: '粉色漂移', position: [2.7, 1.34, 1.92], color: '#ff8fb8', story: '少量粉色粒子漂浮，不抢主色，只留下春天的瞬间。' },
  { name: '光谷', note: '数字脉冲', position: [4.42, -0.72, 0.18], color: '#ff6b36', story: '更快的数字脉冲，让传统江城和技术网络接上电。' },
  { name: '户部巷', note: '热干面金', position: [0.62, -1.42, -2.12], color: '#f5c85a', story: '热干面金色像小火花，把烟火气藏进暗色图谱。' },
  { name: '琴台', note: '汉水回声', position: [-2.48, 0.22, 1.54], color: '#80ff96', story: '汉水边的回声给城市态增加一条柔和的声波线。' },
  { name: '汤逊湖', note: '外环微光', position: [1.45, -1.1, 2.72], color: '#42d9c8', story: '外环湖泊像远场节点，让星云不只集中在中心。' },
];

const WUHAN_MEMORY_LINKS = [
  ['汉口江滩', '长江大桥'],
  ['长江大桥', '黄鹤楼'],
  ['黄鹤楼', '户部巷'],
  ['户部巷', '江汉路'],
  ['江汉路', '汉口江滩'],
  ['琴台', '汉口江滩'],
  ['琴台', '长江大桥'],
  ['东湖', '武大樱花'],
  ['武大樱花', '光谷'],
  ['光谷', '汤逊湖'],
  ['东湖', '汤逊湖'],
  ['黄鹤楼', '东湖'],
  ['户部巷', '长江大桥'],
];

function readSceneUrlOptions(isCompactDevice) {
  const fallback = {
    speed: 1,
    intensity: 1,
    paused: false,
    mode: 'nebula',
    profile: isCompactDevice ? 'low' : 'medium',
    density: isCompactDevice ? 0.72 : 1,
    demoMode: true,
    auditMode: false,
    panelOpen: false,
    immersive: false,
    cameraPresetSignal: null,
    memorySignal: null,
    demoBeat: DEMO_PROLOGUE_SEQUENCE[0].beat,
  };

  if (typeof window === 'undefined') return fallback;
  const params = new URLSearchParams(window.location.search);
  const hasSceneParam = URL_SCENE_PARAMS.some((key) => params.has(key));
  if (!hasSceneParam) return fallback;

  const profileParam = params.get('profile');
  const modeParam = params.get('mode');
  const preset = CAMERA_PRESETS.find((item) => item.id === params.get('preset'));
  const auditParam = params.get('audit');
  const demoParam = params.get('demo');
  const panelParam = params.get('panel');
  const immersiveParam = params.get('immersive');
  const pausedParam = params.get('paused');
  const parseRange = (key, defaultValue, min, max) => {
    const value = Number(params.get(key));
    if (!Number.isFinite(value)) return defaultValue;
    return THREE.MathUtils.clamp(value, min, max);
  };
  const stamp = Date.now();
  const mode = preset
    ? preset.mode
    : MODES.some((item) => item.id === modeParam)
      ? modeParam
      : fallback.mode;
  const profile = Object.keys(PARTICLE_PROFILES).includes(profileParam) ? profileParam : fallback.profile;
  const auditMode = auditParam === 'on';
  const demoMode = demoParam === 'on' ? true : demoParam === 'off' || preset || auditMode ? false : fallback.demoMode;
  const auditBeat = auditMode ? AESTHETIC_AUDIT_SEQUENCE[0] : null;

  return {
    speed: parseRange('speed', fallback.speed, 0.2, 2),
    intensity: parseRange('intensity', fallback.intensity, 0.2, 1.8),
    paused: pausedParam === 'on',
    mode: auditBeat?.id || mode,
    profile,
    density: parseRange('density', fallback.density, 0.45, 1),
    demoMode,
    auditMode,
    panelOpen: panelParam === 'open',
    immersive: immersiveParam === 'on',
    cameraPresetSignal: preset
      ? { id: preset.id, source: 'url-preset', stamp }
      : auditBeat
        ? { id: auditBeat.preset, source: 'url-aesthetic-audit', stamp }
        : null,
    memorySignal: preset?.memory
      ? { name: preset.memory, source: 'url-preset', stamp }
      : auditBeat?.memory
        ? { name: auditBeat.memory, source: 'url-aesthetic-audit', stamp }
        : null,
    demoBeat: auditBeat?.beat || (preset ? `URL 取景：${preset.label}` : fallback.demoBeat),
  };
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function randomSpherePoint(rand, radius, flatten = 0.86) {
  const u = rand();
  const v = rand();
  const theta = Math.PI * 2 * u;
  const phi = Math.acos(2 * v - 1);
  const jitter = 0.76 + rand() * 0.32;
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta) * radius * jitter,
    Math.cos(phi) * radius * flatten * jitter,
    Math.sin(phi) * Math.sin(theta) * radius * jitter,
  );
}

function rotateZ(vector, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = vector.x * cos - vector.y * sin;
  const y = vector.x * sin + vector.y * cos;
  vector.x = x;
  vector.y = y;
  return vector;
}

function sampleEllipsoid(rand, cx, cy, cz, rx, ry, rz) {
  const p = randomSpherePoint(rand, 1, 1).normalize();
  const radius = Math.cbrt(rand());
  return new THREE.Vector3(
    cx + p.x * rx * radius,
    cy + p.y * ry * radius,
    cz + p.z * rz * radius,
  );
}

function sampleLeaf(rand, angle, length, width, lift) {
  const t = rand();
  const side = (rand() - 0.5) * 2;
  const taper = Math.sin(t * Math.PI);
  const p = new THREE.Vector3(
    side * width * taper * (0.35 + rand() * 0.65),
    0.58 + t * length,
    (rand() - 0.5) * 0.18,
  );
  p.x += Math.sin(t * Math.PI) * lift;
  rotateZ(p, angle);
  return p;
}

function sampleWing(rand, side) {
  const t = rand();
  const arc = Math.sin(t * Math.PI);
  const span = 1.65 + rand() * 0.55;
  const p = new THREE.Vector3(
    side * (0.45 + t * span),
    0.08 + arc * 0.52 - t * 0.15,
    (rand() - 0.5) * 0.28,
  );
  rotateZ(p, side * -0.18);
  return p;
}

function createSuanbirdTargets(count) {
  const rand = seededRandom(94177);
  const targets = [];
  for (let i = 0; i < count; i += 1) {
    const roll = rand();
    let p;
    if (roll < 0.38) {
      p = sampleEllipsoid(rand, -0.08, -0.22, 0, 0.78, 1.06, 0.5);
      p.y += Math.abs(p.x) * 0.18;
    } else if (roll < 0.5) {
      const lobe = Math.floor(rand() * 5) - 2;
      const t = rand();
      const height = -1.04 + t * 1.52;
      const width = Math.sin(t * Math.PI) * (0.18 + (2 - Math.abs(lobe)) * 0.055);
      p = new THREE.Vector3(lobe * 0.22 + (rand() - 0.5) * width, height, (rand() - 0.5) * 0.34);
      p.y += Math.abs(p.x) * 0.22;
    } else if (roll < 0.62) {
      p = sampleEllipsoid(rand, 0.62, 0.47, 0.02, 0.38, 0.32, 0.28);
    } else if (roll < 0.68) {
      const t = rand();
      p = new THREE.Vector3(0.98 + t * 0.86, 0.5 + (rand() - 0.5) * (0.16 - t * 0.08), (rand() - 0.5) * 0.08);
    } else if (roll < 0.83) {
      const leafIndex = Math.floor(rand() * 5);
      const angles = [-0.62, -0.32, -0.04, 0.28, 0.58];
      p = sampleLeaf(rand, angles[leafIndex], 1.18 + rand() * 0.72, 0.2, (leafIndex - 2) * 0.1);
    } else if (roll < 0.94) {
      p = sampleWing(rand, rand() < 0.5 ? -1 : 1);
    } else {
      const t = rand();
      const strand = Math.floor(rand() * 3) - 1;
      p = new THREE.Vector3(-0.68 - t * (0.9 + rand() * 0.55), -0.28 - Math.sin(t * Math.PI) * (0.16 + strand * 0.04), (rand() - 0.5) * 0.18 + strand * 0.08);
    }
    p.multiplyScalar(1.22);
    p.z += Math.sin(p.x * 2.4 + p.y) * 0.12;
    targets.push(p);
  }
  return targets;
}

function createNebulaPoints() {
  const rand = seededRandom(20260531);
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const targets = createSuanbirdTargets(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const coreBias = rand();
    const radius = coreBias < 0.34 ? 0.8 + rand() * 1.25 : 2.2 + rand() * 4.7;
    const pos = randomSpherePoint(rand, radius, 0.78);

    if (coreBias < 0.2) {
      pos.multiplyScalar(0.62);
      pos.x += (rand() - 0.5) * 0.8;
      pos.y += (rand() - 0.5) * 0.55;
    }

    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;
    targetPositions[i * 3] = targets[i].x;
    targetPositions[i * 3 + 1] = targets[i].y;
    targetPositions[i * 3 + 2] = targets[i].z;

    const colorRoll = rand();
    const color = colorRoll < 0.5
      ? palette.sprout.clone().lerp(palette.core, rand() * 0.32)
      : colorRoll < 0.76
        ? palette.river.clone().lerp(palette.core, rand() * 0.28)
        : colorRoll < 0.9
          ? palette.noodle.clone()
          : palette.sakura.clone();

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    sizes[i] = coreBias < 0.18
      ? 5.2 + rand() * 8.8
      : coreBias < 0.44
        ? 2.4 + rand() * 4.2
        : 0.85 + rand() * 2.35;
    phases[i] = rand() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, DPR_LIMIT) },
      uModeScale: { value: 1 },
      uBirdMix: { value: 0 },
      uBurstMix: { value: 0 },
      uParticleOpacity: { value: 1 },
      uCoreBoost: { value: 1 },
      uNebulaStyle: { value: 0 },
      uSceneTint: { value: new THREE.Color('#f6fff7') },
      uSceneTintMix: { value: 0 },
      uIntensity: { value: 1 },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uClick: { value: new THREE.Vector4(0, 0, 0, 0) },
      uMemoryFlow: { value: new THREE.Vector4(0, 0, 0, 0) },
    },
    vertexShader: `
      attribute float size;
      attribute float phase;
      attribute vec3 targetPosition;
      varying vec3 vColor;
      varying float vLifePulse;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uModeScale;
      uniform float uBirdMix;
      uniform float uBurstMix;
      uniform float uParticleOpacity;
      uniform float uCoreBoost;
      uniform float uNebulaStyle;
      uniform float uIntensity;
      uniform vec3 uPointer;
      uniform vec4 uClick;
      uniform vec4 uMemoryFlow;

      void main() {
        vColor = color;
        float leafMask = smoothstep(0.45, 1.92, targetPosition.y) * (0.65 + smoothstep(0.12, 0.85, abs(targetPosition.x)) * 0.35);
        float bulbMask = smoothstep(-1.42, 0.12, targetPosition.y) * (1.0 - smoothstep(0.45, 1.28, targetPosition.y));
        float wingMask = smoothstep(0.8, 2.8, abs(targetPosition.x)) * (1.0 - smoothstep(0.78, 1.55, targetPosition.y));
        float lifeWave = sin(uTime * 2.1 - targetPosition.y * 3.2 + phase);
        vLifePulse = uBirdMix * (0.46 + 0.54 * lifeWave) * (0.48 * leafMask + 0.34 * bulbMask + 0.3 * wingMask);
        float breathe = sin(uTime * 0.73 + phase) * 0.035 * uIntensity;
        float swirl = cos(uTime * 0.34 + phase) * 0.018 * uIntensity;
        float explosion = 1.0 + uBurstMix * (0.5 + sin(uTime * 2.4 + phase) * 0.14);
        vec3 p = vec3(
          (position.x * (1.0 + breathe) + -position.z * swirl) * explosion,
          (position.y * (1.0 + breathe * 0.7) + sin(uTime * 0.8 + phase) * 0.018) * explosion,
          (position.z * (1.0 + breathe) + position.x * swirl) * explosion
        );
        vec3 target = targetPosition + vec3(
          sin(uTime * 1.2 + phase) * 0.025,
          cos(uTime * 1.1 + phase) * 0.025 + vLifePulse * 0.038,
          sin(uTime * 0.9 + phase) * 0.025
        );
        target.x += normalize(vec2(targetPosition.x, 0.18)).x * vLifePulse * (0.024 + leafMask * 0.035);
        target.z += sin(uTime * 1.7 + phase) * vLifePulse * 0.026;
        p = mix(p, target, uBirdMix);

        vec2 pointerDelta = p.xy - uPointer.xy;
        float pointerDist = dot(pointerDelta, pointerDelta);
        if (pointerDist < 0.52) {
          float push = (0.52 - pointerDist) * 0.18 * uIntensity;
          p.xy += pointerDelta * push;
        }

        if (uClick.w > 0.001) {
          vec3 clickDelta = p - uClick.xyz;
          float clickDistance = length(clickDelta) + 0.001;
          float wave = sin(uClick.w * 10.0 - clickDistance * 1.7);
          float local = max(0.0, 1.2 - clickDistance * 0.16) * uClick.w * (0.36 + wave * 0.08);
          p += normalize(clickDelta) * local;
        }

        if (uMemoryFlow.w > 0.001) {
          vec3 memoryDelta = uMemoryFlow.xyz - p;
          float memoryDistance = length(memoryDelta) + 0.001;
          float corridor = max(0.0, 1.0 - memoryDistance * 0.14);
          float pulseFlow = 0.55 + 0.45 * sin(uTime * 3.0 + phase + memoryDistance * 1.2);
          p += normalize(memoryDelta) * corridor * uMemoryFlow.w * pulseFlow * 0.34;
          p += normalize(-p) * corridor * uMemoryFlow.w * (0.08 + pulseFlow * 0.08);
        }

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        float pulse = 0.72 + 0.28 * sin(uTime * 1.7 + p.x * 1.8 + p.y);
        gl_PointSize = size * pulse * (1.0 + vLifePulse * 0.42) * uModeScale * uPixelRatio * (8.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vLifePulse;
      uniform float uParticleOpacity;
      uniform float uCoreBoost;
      uniform vec3 uSceneTint;
      uniform float uSceneTintMix;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.0, dist);
        float core = smoothstep(0.18, 0.0, dist);
        vec3 lifeTint = vec3(0.55, 1.0, 0.58) * vLifePulse * 0.36;
        vec3 normalColor = vColor + core * 0.42 * uCoreBoost + lifeTint;
        vec3 graphNebulaColor = mix(vec3(0.5, 0.72, 0.28), vec3(0.78, 0.78, 0.7), core * 0.18);
        vec3 displayColor = mix(normalColor, graphNebulaColor, uNebulaStyle);
        vec3 sceneColor = uSceneTint * (0.72 + core * 0.42 + vLifePulse * 0.18);
        displayColor = mix(displayColor, sceneColor, uSceneTintMix);
        gl_FragColor = vec4(displayColor, alpha * (0.72 + vLifePulse * 0.18) * uParticleOpacity);
      }
    `,
  });

  return { points: new THREE.Points(geometry, material) };
}

function createDeepSpaceDust() {
  const rand = seededRandom(260531);
  const positions = new Float32Array(DEEP_SPACE_DUST_COUNT * 3);
  const colors = new Float32Array(DEEP_SPACE_DUST_COUNT * 3);
  const sizes = new Float32Array(DEEP_SPACE_DUST_COUNT);
  for (let i = 0; i < DEEP_SPACE_DUST_COUNT; i += 1) {
    const radius = 7.5 + rand() * 11.5;
    const p = randomSpherePoint(rand, radius, 0.72);
    const centerVoid = Math.max(0.42, Math.min(1, p.length() / 9.5));
    positions[i * 3] = p.x * centerVoid;
    positions[i * 3 + 1] = p.y * centerVoid;
    positions[i * 3 + 2] = p.z * centerVoid;
    const color = rand() < 0.62
      ? palette.river.clone().lerp(palette.core, 0.24 + rand() * 0.18)
      : rand() < 0.84
        ? palette.sprout.clone().lerp(palette.core, rand() * 0.22)
        : palette.noodle.clone().lerp(palette.core, rand() * 0.18);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    sizes[i] = 0.012 + rand() * 0.045;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('dustSize', new THREE.BufferAttribute(sizes, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uOpacity: { value: 0.22 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, DPR_LIMIT) },
    },
    vertexShader: `
      attribute float dustSize;
      varying vec3 vColor;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = dustSize * uPixelRatio * (1300.0 / max(2.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      uniform float uOpacity;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float alpha = smoothstep(0.5, 0.0, length(center));
        gl_FragColor = vec4(vColor, alpha * uOpacity);
      }
    `,
  });
  const dust = new THREE.Points(geometry, material);
  dust.name = 'deep-space-dust';
  dust.renderOrder = -2;
  return dust;
}

function createNetwork() {
  const rand = seededRandom(7301);
  const nodes = [];
  const phases = new Float32Array(NETWORK_NODE_COUNT);
  for (let i = 0; i < NETWORK_NODE_COUNT; i += 1) {
    const p = randomSpherePoint(rand, 4.1 + rand() * 2.2, 0.78);
    nodes.push(p);
    phases[i] = rand() * Math.PI * 2;
  }

  const nodePositions = new Float32Array(NETWORK_NODE_COUNT * 3);
  const nodeColors = new Float32Array(NETWORK_NODE_COUNT * 3);
  const nodePhases = new Float32Array(NETWORK_NODE_COUNT);
  for (let i = 0; i < NETWORK_NODE_COUNT; i += 1) {
    const p = nodes[i];
    nodePositions[i * 3] = p.x;
    nodePositions[i * 3 + 1] = p.y;
    nodePositions[i * 3 + 2] = p.z;
    nodePhases[i] = phases[i];
    const c = i % 9 === 0 ? palette.ember : i % 5 === 0 ? palette.noodle : palette.sprout;
    nodeColors[i * 3] = c.r;
    nodeColors[i * 3 + 1] = c.g;
    nodeColors[i * 3 + 2] = c.b;
  }

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
  nodeGeometry.setAttribute('phase', new THREE.BufferAttribute(nodePhases, 1));
  const networkUniforms = () => ({
    uTime: { value: 0 },
    uNetworkMix: { value: 0 },
    uIntensity: { value: 1 },
    uNodeSize: { value: 0.025 },
    uOpacity: { value: 0.82 },
    uNebulaStyle: { value: 0 },
    uSceneTint: { value: new THREE.Color('#f4f0df') },
    uSceneTintMix: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, DPR_LIMIT) },
    uPointer: { value: new THREE.Vector3(99, 99, 0) },
    uClick: { value: new THREE.Vector4(0, 0, 0, 0) },
    uMemoryFocus: { value: new THREE.Vector4(0, 0, 0, 0) },
  });
  const networkMotionGLSL = `
    vec3 animateNetworkPosition(vec3 base, float phase) {
      float nodeBreath = 1.0 + sin(uTime * (0.42 + uNetworkMix * 0.42) + phase) * (0.018 + uNetworkMix * 0.045);
      float tangent = cos(uTime * 0.26 + phase) * (0.018 + uNetworkMix * 0.035) * uIntensity;
      vec3 p = vec3(
        base.x * nodeBreath + -base.z * tangent,
        base.y * (1.0 + cos(uTime * 0.36 + phase) * (0.014 + uNetworkMix * 0.026)),
        base.z * nodeBreath + base.x * tangent
      );

      vec2 pointerDelta = p.xy - uPointer.xy;
      float pointerDist = dot(pointerDelta, pointerDelta);
      if (pointerDist < 1.1) {
        float pull = (1.1 - pointerDist) * (0.035 + uNetworkMix * 0.055) * uIntensity;
        p.xy += pointerDelta * pull;
      }

      if (uClick.w > 0.001) {
        vec3 clickDelta = p - uClick.xyz;
        float clickDistance = length(clickDelta) + 0.001;
        float local = max(0.0, 1.4 - clickDistance * 0.14) * uClick.w * (0.42 + uNetworkMix * 0.28);
        p += normalize(clickDelta) * local;
      }

      if (uMemoryFocus.w > 0.001) {
        vec3 memoryDelta = p - uMemoryFocus.xyz;
        float memoryDistance = length(memoryDelta) + 0.001;
        float local = max(0.0, 1.0 - memoryDistance * 0.18);
        float wave = sin(uTime * 3.2 - memoryDistance * 2.1 + phase);
        float pull = local * uMemoryFocus.w * (0.06 + wave * 0.028);
        p += normalize(memoryDelta) * pull;
        p += normalize(uMemoryFocus.xyz) * local * uMemoryFocus.w * 0.018;
      }

      return p;
    }
  `;
  const nodeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: networkUniforms(),
    vertexShader: `
      attribute float phase;
      varying vec3 vColor;
      varying float vAlpha;
      varying float vDepthFade;
      varying float vScan;
      uniform float uTime;
      uniform float uNetworkMix;
      uniform float uIntensity;
      uniform float uNodeSize;
      uniform float uOpacity;
      uniform float uNebulaStyle;
      uniform vec3 uSceneTint;
      uniform float uSceneTintMix;
      uniform float uPixelRatio;
      uniform vec3 uPointer;
      uniform vec4 uClick;
      uniform vec4 uMemoryFocus;
      ${networkMotionGLSL}

      void main() {
        vColor = color;
        vec3 p = animateNetworkPosition(position, phase);
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        float pulse = 0.72 + 0.28 * sin(uTime * 1.1 + phase);
        float memoryDistance = length(p - uMemoryFocus.xyz);
        float memoryGlow = uMemoryFocus.w * max(0.0, 1.0 - memoryDistance * 0.18);
        float spatialSweep = sin(uTime * 1.35 + p.x * 0.72 + p.y * 0.44 - p.z * 0.36 + phase);
        vScan = smoothstep(0.72, 1.0, spatialSweep) * uNetworkMix;
        vDepthFade = smoothstep(18.0, 3.2, -mvPosition.z);
        vAlpha = uOpacity * (0.56 + uNetworkMix * 0.28 + memoryGlow * 0.56 + vScan * 0.3 + uNebulaStyle * 0.1) * vDepthFade;
        gl_PointSize = uNodeSize * pulse * (1.0 + memoryGlow * 1.35 + vScan * 0.55 + uNebulaStyle * 0.62) * uPixelRatio * (900.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      varying float vDepthFade;
      varying float vScan;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.0, dist);
        float core = smoothstep(0.2, 0.0, dist);
        vec3 scanTint = vec3(1.0, 0.92, 0.64) * vScan * 0.34;
        vec3 gold = vec3(0.95, 0.62, 0.08);
        vec3 whiteGraph = vec3(0.74, 0.74, 0.7);
        float goldMask = smoothstep(0.42, 0.88, vColor.r - vColor.g * 0.28);
        vec3 graphColor = mix(whiteGraph, gold, goldMask);
        vec3 displayColor = mix(vColor * (0.72 + vDepthFade * 0.34) + core * 0.35 + scanTint, graphColor + core * 0.16, uNebulaStyle);
        displayColor = mix(displayColor, displayColor * uSceneTint, uSceneTintMix);
        gl_FragColor = vec4(displayColor, alpha * vAlpha);
      }
    `,
  });

  const edges = new Float32Array(NETWORK_EDGE_COUNT * 2 * 3);
  const edgeColors = new Float32Array(NETWORK_EDGE_COUNT * 2 * 3);
  const edgePhases = new Float32Array(NETWORK_EDGE_COUNT * 2);
  for (let i = 0; i < NETWORK_EDGE_COUNT; i += 1) {
    const a = Math.floor(rand() * nodes.length);
    const b = Math.floor(rand() * nodes.length);
    const pa = nodes[a];
    const pb = nodes[b];
    edges.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], i * 6);
    edgePhases[i * 2] = phases[a];
    edgePhases[i * 2 + 1] = phases[b];
    const c = rand() < 0.64 ? palette.sprout : rand() < 0.82 ? palette.river : palette.ember;
    edgeColors.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
  }

  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position', new THREE.BufferAttribute(edges, 3));
  edgeGeometry.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3));
  edgeGeometry.setAttribute('phase', new THREE.BufferAttribute(edgePhases, 1));
  const edgeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    uniforms: networkUniforms(),
    vertexShader: `
      attribute float phase;
      varying vec3 vColor;
      varying float vAlpha;
      varying float vDepthFade;
      varying float vScan;
      uniform float uTime;
      uniform float uNetworkMix;
      uniform float uIntensity;
      uniform float uOpacity;
      uniform float uNebulaStyle;
      uniform vec3 uSceneTint;
      uniform float uSceneTintMix;
      uniform vec3 uPointer;
      uniform vec4 uClick;
      uniform vec4 uMemoryFocus;
      ${networkMotionGLSL}

      void main() {
        vColor = color;
        vec3 p = animateNetworkPosition(position, phase);
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        float memoryDistance = length(p - uMemoryFocus.xyz);
        float memoryGlow = uMemoryFocus.w * max(0.0, 1.0 - memoryDistance * 0.18);
        float spatialSweep = sin(uTime * 1.18 + p.x * 0.64 - p.z * 0.52 + phase);
        vScan = smoothstep(0.76, 1.0, spatialSweep) * uNetworkMix;
        vDepthFade = smoothstep(18.0, 3.4, -mvPosition.z);
        vAlpha = uOpacity * (0.48 + uNetworkMix * 0.34 + memoryGlow * 0.42 + vScan * 0.34 + uNebulaStyle * 0.18) * vDepthFade;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      varying float vDepthFade;
      varying float vScan;

      void main() {
        vec3 scanTint = vec3(1.0, 0.88, 0.52) * vScan * 0.28;
        vec3 graphLine = vec3(0.72, 0.72, 0.68);
        vec3 displayColor = mix(vColor * (0.64 + vDepthFade * 0.42) + scanTint, graphLine, uNebulaStyle);
        displayColor = mix(displayColor, displayColor * uSceneTint, uSceneTintMix);
        gl_FragColor = vec4(displayColor, vAlpha);
      }
    `,
  });

  const flowPositions = new Float32Array(NETWORK_FLOW_PACKET_COUNT * 3);
  const flowColors = new Float32Array(NETWORK_FLOW_PACKET_COUNT * 3);
  const flowSeeds = new Float32Array(NETWORK_FLOW_PACKET_COUNT);
  const flowGeometry = new THREE.BufferGeometry();
  for (let i = 0; i < NETWORK_FLOW_PACKET_COUNT; i += 1) {
    const edgeIndex = Math.floor(rand() * NETWORK_EDGE_COUNT);
    const offset = edgeIndex * 6;
    const stream = rand();
    const ax = edges[offset];
    const ay = edges[offset + 1];
    const az = edges[offset + 2];
    const bx = edges[offset + 3];
    const by = edges[offset + 4];
    const bz = edges[offset + 5];
    flowPositions[i * 3] = ax + (bx - ax) * stream;
    flowPositions[i * 3 + 1] = ay + (by - ay) * stream;
    flowPositions[i * 3 + 2] = az + (bz - az) * stream;
    const c = rand() < 0.52 ? palette.river : rand() < 0.82 ? palette.sprout : palette.noodle;
    flowColors[i * 3] = c.r;
    flowColors[i * 3 + 1] = c.g;
    flowColors[i * 3 + 2] = c.b;
    flowSeeds[i] = rand() * Math.PI * 2;
  }
  flowGeometry.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
  flowGeometry.setAttribute('color', new THREE.BufferAttribute(flowColors, 3));
  flowGeometry.setAttribute('flowSeed', new THREE.BufferAttribute(flowSeeds, 1));
  flowGeometry.setDrawRange(0, 0);
  const flowMaterial = new THREE.PointsMaterial({
    size: 0.052,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const flows = new THREE.Points(flowGeometry, flowMaterial);
  flows.name = 'network-flow-packets';
  flows.userData = {
    edges,
    edgePhases,
    count: NETWORK_FLOW_PACKET_COUNT,
    opacity: 0,
    baseSize: 0.052,
  };

  return {
    nodes: new THREE.Points(nodeGeometry, nodeMaterial),
    edges: new THREE.LineSegments(edgeGeometry, edgeMaterial),
    flows,
  };
}

function createRiverCurve(kind) {
  const points = [];
  const width = kind === 'yangtze' ? 8.8 : 6.2;
  const yOffset = kind === 'yangtze' ? -0.68 : 0.2;
  const zOffset = kind === 'yangtze' ? 0.1 : -0.58;
  for (let i = 0; i < RIVER_POINT_COUNT; i += 1) {
    const t = i / (RIVER_POINT_COUNT - 1);
    const x = (t - 0.5) * width;
    const y = Math.sin(t * Math.PI * 2.2 + (kind === 'yangtze' ? 0.2 : 1.3)) * 0.46 + yOffset;
    const z = Math.cos(t * Math.PI * 1.55 + (kind === 'yangtze' ? 0.4 : 1.5)) * 0.76 + zOffset;
    points.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(360));
  const material = new THREE.LineBasicMaterial({
    color: kind === 'yangtze' ? '#34ddcf' : '#80ff96',
    transparent: true,
    opacity: kind === 'yangtze' ? 0.42 : 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Line(geometry, material);
}

function createRiverConfluencePulse() {
  const group = new THREE.Group();
  group.name = 'river-confluence-pulse';
  group.position.set(0.18, -0.42, -0.12);

  [0.62, 0.98, 1.36].forEach((radius, index) => {
    const points = [];
    for (let i = 0; i <= 180; i += 1) {
      const a = (i / 180) * Math.PI * 2;
      const wobble = 1 + Math.sin(a * 5 + index) * 0.035;
      points.push(new THREE.Vector3(
        Math.cos(a) * radius * wobble,
        Math.sin(a) * radius * 0.34 * wobble,
        Math.sin(a * 2 + index) * 0.05,
      ));
    }
    const line = makeLine(points, index === 1 ? '#f5c85a' : '#42d9c8', index === 1 ? 0.08 : 0.1);
    line.rotation.z = -0.08 + index * 0.06;
    line.userData.baseOpacity = line.material.opacity;
    line.userData.phase = index * 0.72;
    group.add(line);
  });

  const streamSegments = [];
  for (let i = 0; i < 56; i += 1) {
    const t = i / 55;
    const x = -1.72 + t * 3.44;
    const y = Math.sin(t * Math.PI * 2.1) * 0.18;
    const z = Math.cos(t * Math.PI * 1.4) * 0.08;
    streamSegments.push(
      x - 0.08,
      y - 0.02,
      z,
      x + 0.08,
      y + 0.02,
      z + 0.02,
    );
  }
  const streamGeometry = new THREE.BufferGeometry();
  streamGeometry.setAttribute('position', new THREE.Float32BufferAttribute(streamSegments, 3));
  const streamMaterial = new THREE.LineBasicMaterial({
    color: '#34ddcf',
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const streams = new THREE.LineSegments(streamGeometry, streamMaterial);
  streams.name = 'river-confluence-streams';
  streams.userData.baseOpacity = 0.11;
  group.add(streams);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 18, 10),
    new THREE.MeshBasicMaterial({
      color: '#fff1a8',
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  core.name = 'river-confluence-core';
  core.userData.baseOpacity = 0.14;
  group.add(core);

  group.rotation.x = -0.18;
  return group;
}

function createRiverFlowPackets() {
  const group = new THREE.Group();
  group.name = 'river-flow-packets';
  const packetPositions = new Float32Array(RIVER_FLOW_PACKET_COUNT * 3);
  const packetColors = new Float32Array(RIVER_FLOW_PACKET_COUNT * 3);
  const packetSeeds = new Float32Array(RIVER_FLOW_PACKET_COUNT);
  for (let i = 0; i < RIVER_FLOW_PACKET_COUNT; i += 1) {
    const isYangtze = i % 3 !== 0;
    const color = isYangtze ? palette.river : palette.sprout;
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
    packetSeeds[i] = (i * 0.377) % 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  geometry.setAttribute('riverSeed', new THREE.BufferAttribute(packetSeeds, 1));
  const packets = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.058,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'river-flow-packets-core';
  packets.userData.baseOpacity = 0.74;
  group.add(packets);
  group.userData = { packets, opacity: 0 };
  group.scale.setScalar(1.34);
  group.position.y = -0.06;
  group.visible = false;
  return group;
}

function createLandmarkPulsePackets() {
  const group = new THREE.Group();
  group.name = 'landmark-pulse-packets';
  const positions = new Float32Array(LANDMARK_PULSE_COUNT * 3);
  const colors = new Float32Array(LANDMARK_PULSE_COUNT * 3);
  const seeds = new Float32Array(LANDMARK_PULSE_COUNT);
  for (let i = 0; i < LANDMARK_PULSE_COUNT; i += 1) {
    const color = i % 4 === 0 ? palette.core : i % 3 === 0 ? palette.sakura : palette.noodle;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    seeds[i] = (i * 0.217) % 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('landmarkSeed', new THREE.BufferAttribute(seeds, 1));
  const packets = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.052,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'landmark-pulse-packets-core';
  packets.userData.baseOpacity = 0.78;
  group.add(packets);
  group.userData = { packets, opacity: 0 };
  group.visible = false;
  return group;
}

function createFlowTrails() {
  const group = new THREE.Group();
  group.name = 'flow-trails';
  const rand = seededRandom(6182026);

  for (let i = 0; i < 18; i += 1) {
    const points = [];
    const radius = 1.35 + rand() * 3.9;
    const tilt = (rand() - 0.5) * 0.75;
    const phase = rand() * Math.PI * 2;
    const height = (rand() - 0.5) * 1.4;
    for (let j = 0; j <= 150; j += 1) {
      const t = j / 150;
      const angle = phase + t * Math.PI * (1.35 + rand() * 0.45);
      const fadeRadius = radius * (0.78 + Math.sin(t * Math.PI) * 0.18);
      points.push(new THREE.Vector3(
        Math.cos(angle) * fadeRadius,
        height + Math.sin(t * Math.PI * 2 + phase) * 0.28 + t * tilt,
        Math.sin(angle) * fadeRadius * 0.72,
      ));
    }
    const color = i % 5 === 0 ? '#ff8fb8' : i % 3 === 0 ? '#f5c85a' : i % 2 === 0 ? '#42d9c8' : '#7dfc91';
    const line = makeLine(points, color, 0.08 + rand() * 0.08);
    line.userData = {
      phase,
      baseOpacity: line.material.opacity,
      spin: (rand() < 0.5 ? -1 : 1) * (0.018 + rand() * 0.03),
      lift: (rand() - 0.5) * 0.08,
    };
    group.add(line);
  }

  return group;
}

function createMemoryReturnTrails() {
  const group = new THREE.Group();
  group.name = 'memory-return-trails';
  const colors = ['#42d9c8', '#7dfc91', '#f5c85a', '#ff8fb8'];

  for (let i = 0; i < 10; i += 1) {
    const points = [];
    for (let j = 0; j <= 96; j += 1) {
      points.push(new THREE.Vector3(0, 0, 0));
    }
    const line = makeLine(points, colors[i % colors.length], 0);
    line.name = 'memory-return-trail';
    line.userData = {
      baseOpacity: 0.18 + (i % 3) * 0.035,
      offset: (i - 4.5) * 0.065,
      phase: i * 0.58,
      speed: 1.1 + i * 0.08,
    };
    group.add(line);
  }

  const packetCount = 96;
  const packetPositions = new Float32Array(packetCount * 3);
  const packetColors = new Float32Array(packetCount * 3);
  for (let i = 0; i < packetCount; i += 1) {
    const color = i % 4 === 0 ? palette.noodle : i % 5 === 0 ? palette.sakura : i % 2 === 0 ? palette.river : palette.sprout;
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
  }
  const packetGeometry = new THREE.BufferGeometry();
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  packetGeometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  const packets = new THREE.Points(
    packetGeometry,
    new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'memory-return-packets';
  packets.userData.count = packetCount;
  packets.userData.baseOpacity = 0.62;
  group.add(packets);

  group.visible = false;
  group.userData.opacity = 0;
  group.userData.target = new THREE.Vector3();
  group.userData.packets = packets;
  return group;
}

function createCityMemoryCodeRain() {
  const group = new THREE.Group();
  group.name = 'city-memory-code-rain';
  const hotspotPositions = WUHAN_MEMORY_HOTSPOTS.map((hotspot) => new THREE.Vector3(...hotspot.position));
  const packetPositions = new Float32Array(CITY_MEMORY_CODE_COUNT * 3);
  const packetColors = new Float32Array(CITY_MEMORY_CODE_COUNT * 3);
  const packetSeeds = new Float32Array(CITY_MEMORY_CODE_COUNT);
  const packetSources = new Float32Array(CITY_MEMORY_CODE_COUNT);

  for (let i = 0; i < CITY_MEMORY_CODE_COUNT; i += 1) {
    const sourceIndex = i % hotspotPositions.length;
    const hotspot = WUHAN_MEMORY_HOTSPOTS[sourceIndex];
    const color = new THREE.Color(hotspot.color || '#42d9c8').lerp(i % 5 === 0 ? palette.core : palette.sprout, 0.22);
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
    packetSeeds[i] = (i * 0.618033) % 1;
    packetSources[i] = sourceIndex;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  geometry.setAttribute('codeSeed', new THREE.BufferAttribute(packetSeeds, 1));
  geometry.setAttribute('codeSource', new THREE.BufferAttribute(packetSources, 1));
  geometry.setDrawRange(0, 0);

  const packets = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'city-memory-code-packets';
  packets.userData.baseOpacity = 0.68;
  group.add(packets);

  group.visible = false;
  group.userData = {
    opacity: 0,
    packets,
    hotspotPositions,
  };
  return group;
}

function createWuhanMemoryOrbitField() {
  const group = new THREE.Group();
  group.name = 'wuhan-memory-orbit-field';
  const hotspotPositions = WUHAN_MEMORY_HOTSPOTS.map((hotspot) => new THREE.Vector3(...hotspot.position));
  const hotspotColors = WUHAN_MEMORY_HOTSPOTS.map((hotspot) => new THREE.Color(hotspot.color || '#42d9c8'));
  const orbitColors = ['#42d9c8', '#7dfc91', '#f5c85a', '#ff8fb8'];

  for (let orbitIndex = 0; orbitIndex < 4; orbitIndex += 1) {
    const points = [];
    const radius = 2.05 + orbitIndex * 0.62;
    const tilt = -0.22 + orbitIndex * 0.13;
    const zScale = 0.58 + orbitIndex * 0.055;
    for (let i = 0; i <= 220; i += 1) {
      const t = i / 220;
      const angle = t * Math.PI * 2;
      const wobble = 1 + Math.sin(angle * (3 + orbitIndex) + orbitIndex * 0.7) * 0.04;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius * wobble,
        Math.sin(angle * 2 + orbitIndex) * 0.12 + tilt,
        Math.sin(angle) * radius * zScale * wobble,
      ));
    }
    const orbit = makeLine(points, orbitColors[orbitIndex], 0);
    orbit.name = 'wuhan-memory-orbit-ring';
    orbit.userData = {
      baseOpacity: 0.06 + orbitIndex * 0.012,
      phase: orbitIndex * 0.74,
      spin: (orbitIndex % 2 === 0 ? 1 : -1) * (0.014 + orbitIndex * 0.004),
    };
    orbit.rotation.x = tilt * 0.38;
    group.add(orbit);
  }

  const chordPositions = [];
  const chordColors = [];
  WUHAN_MEMORY_LINKS.forEach(([from, to], index) => {
    const start = hotspotPositions[WUHAN_MEMORY_HOTSPOTS.findIndex((hotspot) => hotspot.name === from)];
    const end = hotspotPositions[WUHAN_MEMORY_HOTSPOTS.findIndex((hotspot) => hotspot.name === to)];
    if (!start || !end) return;
    const middle = start.clone().lerp(end, 0.5).multiplyScalar(0.62);
    middle.y += 0.28 + Math.sin(index * 0.9) * 0.12;
    const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
    const points = curve.getPoints(16);
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      chordPositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const color = hotspotColors[index % hotspotColors.length].clone().lerp(i % 2 === 0 ? palette.river : palette.noodle, 0.32);
      chordColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
  });
  const chordGeometry = new THREE.BufferGeometry();
  chordGeometry.setAttribute('position', new THREE.Float32BufferAttribute(chordPositions, 3));
  chordGeometry.setAttribute('color', new THREE.Float32BufferAttribute(chordColors, 3));
  const chords = new THREE.LineSegments(
    chordGeometry,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  chords.name = 'wuhan-memory-orbit-chords';
  chords.userData.baseOpacity = 0.08;
  group.add(chords);

  const packetPositions = new Float32Array(WUHAN_MEMORY_ORBIT_PACKET_COUNT * 3);
  const packetColors = new Float32Array(WUHAN_MEMORY_ORBIT_PACKET_COUNT * 3);
  const packetSeeds = new Float32Array(WUHAN_MEMORY_ORBIT_PACKET_COUNT);
  const packetSources = new Float32Array(WUHAN_MEMORY_ORBIT_PACKET_COUNT);
  for (let i = 0; i < WUHAN_MEMORY_ORBIT_PACKET_COUNT; i += 1) {
    const sourceIndex = i % hotspotPositions.length;
    const color = hotspotColors[sourceIndex].clone().lerp(i % 6 === 0 ? palette.core : palette.river, 0.34);
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
    packetSeeds[i] = (i * 0.414214) % 1;
    packetSources[i] = sourceIndex;
  }
  const packetGeometry = new THREE.BufferGeometry();
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  packetGeometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  packetGeometry.setAttribute('orbitSeed', new THREE.BufferAttribute(packetSeeds, 1));
  packetGeometry.setAttribute('orbitSource', new THREE.BufferAttribute(packetSources, 1));
  packetGeometry.setDrawRange(0, 0);
  const packets = new THREE.Points(
    packetGeometry,
    new THREE.PointsMaterial({
      size: 0.046,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'wuhan-memory-orbit-packets';
  packets.userData.baseOpacity = 0.66;
  group.add(packets);

  group.visible = false;
  group.userData = {
    opacity: 0,
    packets,
    chords,
    hotspotPositions,
  };
  group.traverse((object) => {
    if (object.material) {
      object.material.depthTest = false;
      object.renderOrder = 5;
    }
  });
  return group;
}

function createBirthVortex() {
  const group = new THREE.Group();
  group.name = 'city-birth-vortex';
  const rand = seededRandom(5312026);
  const colors = ['#42d9c8', '#7dfc91', '#f5c85a', '#fff8d9'];

  for (let i = 0; i < 14; i += 1) {
    const points = [];
    const phase = rand() * Math.PI * 2;
    const startRadius = 4.4 + rand() * 2.1;
    const verticalBias = (rand() - 0.5) * 1.8;
    for (let j = 0; j <= 120; j += 1) {
      const t = j / 120;
      const radius = THREE.MathUtils.lerp(startRadius, 0.22, t);
      const angle = phase + t * Math.PI * (1.8 + rand() * 0.7);
      const lift = verticalBias * (1 - t) + Math.sin(t * Math.PI * 2 + phase) * 0.22 * (1 - t * 0.4);
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        lift * 0.62,
        Math.sin(angle) * radius * 0.74,
      ));
    }
    const line = makeLine(points, colors[i % colors.length], 0);
    line.name = 'city-birth-vortex-line';
    line.userData = {
      points,
      baseOpacity: 0.09 + (i % 4) * 0.018,
      phase,
      spin: (i % 2 === 0 ? 1 : -1) * (0.006 + rand() * 0.014),
    };
    group.add(line);
  }

  const packetPositions = new Float32Array(BIRTH_VORTEX_PACKET_COUNT * 3);
  const packetColors = new Float32Array(BIRTH_VORTEX_PACKET_COUNT * 3);
  const packetSeeds = new Float32Array(BIRTH_VORTEX_PACKET_COUNT);
  for (let i = 0; i < BIRTH_VORTEX_PACKET_COUNT; i += 1) {
    const color = i % 6 === 0 ? palette.sakura : i % 4 === 0 ? palette.noodle : i % 3 === 0 ? palette.sprout : palette.river;
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
    packetSeeds[i] = (i * 0.271) % 1;
  }
  const packetGeometry = new THREE.BufferGeometry();
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  packetGeometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  packetGeometry.setAttribute('birthSeed', new THREE.BufferAttribute(packetSeeds, 1));
  const packets = new THREE.Points(
    packetGeometry,
    new THREE.PointsMaterial({
      size: 0.062,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'city-birth-vortex-packets';
  packets.userData.baseOpacity = 0.76;
  group.add(packets);

  group.userData = {
    opacity: 0,
    packets,
  };
  group.visible = false;
  return group;
}

function createCentralBurst() {
  const group = new THREE.Group();
  const coreGeometry = new THREE.SphereGeometry(0.16, 32, 16);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: '#fff4c6',
    transparent: true,
    opacity: READABILITY_TUNING.coreSphereOpacity,
    blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Mesh(coreGeometry, coreMaterial));

  const rayPositions = [];
  const rayColors = [];
  const rand = seededRandom(428);
  for (let i = 0; i < 260; i += 1) {
    const dir = randomSpherePoint(rand, 1, 0.66).normalize();
    const len = 0.35 + rand() * 2.65;
    rayPositions.push(0, 0, 0, dir.x * len, dir.y * len, dir.z * len);
    const color = rand() < 0.52 ? palette.core : rand() < 0.76 ? palette.sprout : palette.noodle;
    rayColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(rayPositions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(rayColors, 3));
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: READABILITY_TUNING.coreRayOpacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  group.add(new THREE.LineSegments(geometry, material));
  return group;
}

function createCentralRelationRays() {
  const rand = seededRandom(777531);
  const positions = [];
  const colors = [];
  const phases = new Float32Array(CENTRAL_RELATION_RAY_COUNT * 2);
  for (let i = 0; i < CENTRAL_RELATION_RAY_COUNT; i += 1) {
    const dir = randomSpherePoint(rand, 1, 0.72).normalize();
    const inner = 0.34 + rand() * 0.18;
    const outer = 3.1 + rand() * 4.2;
    const sag = (rand() - 0.5) * 0.32;
    positions.push(
      dir.x * inner,
      dir.y * inner + sag * 0.12,
      dir.z * inner,
      dir.x * outer,
      dir.y * outer + sag,
      dir.z * outer,
    );
    const color = rand() < 0.54 ? palette.core : rand() < 0.78 ? palette.sprout : rand() < 0.9 ? palette.river : palette.noodle;
    colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    phases[i * 2] = rand() * Math.PI * 2;
    phases[i * 2 + 1] = phases[i * 2] + rand() * 0.7;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('rayPhase', new THREE.BufferAttribute(phases, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPulse: { value: 0 },
    },
    vertexShader: `
      attribute float rayPhase;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uPulse;

      void main() {
        vColor = color;
        float wave = 0.65 + 0.35 * sin(uTime * 1.4 + rayPhase);
        vAlpha = uOpacity * (0.72 + wave * 0.28 + uPulse * 0.42);
        vec3 p = position * (1.0 + uPulse * 0.035 + sin(uTime * 0.42 + rayPhase) * 0.006);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        gl_FragColor = vec4(vColor, vAlpha);
      }
    `,
  });
  const rays = new THREE.LineSegments(geometry, material);
  rays.name = 'central-relation-rays';
  rays.visible = false;
  rays.userData.opacity = 0;
  return rays;
}

function createGraphNebulaVeil() {
  const rand = seededRandom(120531);
  const linePositions = new Float32Array(GRAPH_NEBULA_VEIL_LINE_COUNT * 2 * 3);
  const lineColors = new Float32Array(GRAPH_NEBULA_VEIL_LINE_COUNT * 2 * 3);
  const gray = new THREE.Color('#c8c8be');
  const paleGreen = new THREE.Color('#89d85d');
  const gold = new THREE.Color('#c98918');

  for (let i = 0; i < GRAPH_NEBULA_VEIL_LINE_COUNT; i += 1) {
    const anchor = randomSpherePoint(rand, 1.35 + rand() * 2.8, 0.72);
    anchor.x += 0.2;
    const outer = anchor.clone().multiplyScalar(1.15 + rand() * 1.7);
    outer.x += (rand() - 0.5) * 2.2;
    outer.y += (rand() - 0.5) * 0.7;
    outer.z += (rand() - 0.5) * 1.6;
    const offset = i * 6;
    linePositions.set([anchor.x, anchor.y, anchor.z, outer.x, outer.y, outer.z], offset);
    const color = rand() < 0.82
      ? gray.clone().lerp(paleGreen, rand() * 0.16)
      : gold.clone().lerp(gray, rand() * 0.42);
    lineColors.set([color.r, color.g, color.b, color.r, color.g, color.b], offset);
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  lines.name = 'graphpu-nebula-veil-lines';
  lines.userData.baseOpacity = 0.14;

  const nodePositions = new Float32Array(GRAPH_NEBULA_VEIL_NODE_COUNT * 3);
  const nodeColors = new Float32Array(GRAPH_NEBULA_VEIL_NODE_COUNT * 3);
  for (let i = 0; i < GRAPH_NEBULA_VEIL_NODE_COUNT; i += 1) {
    const p = randomSpherePoint(rand, 1.45 + rand() * 4.2, 0.72);
    p.x += 0.24;
    nodePositions.set([p.x, p.y, p.z], i * 3);
    const color = rand() < 0.62
      ? gold.clone().lerp(gray, rand() * 0.18)
      : paleGreen.clone().lerp(gray, rand() * 0.24);
    nodeColors.set([color.r, color.g, color.b], i * 3);
  }
  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
  const nodes = new THREE.Points(
    nodeGeometry,
    new THREE.PointsMaterial({
      size: 0.07,
      transparent: true,
      opacity: 0,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  nodes.name = 'graphpu-nebula-veil-nodes';
  nodes.userData.baseOpacity = 0.62;

  const group = new THREE.Group();
  group.name = 'graphpu-nebula-veil';
  group.visible = false;
  group.userData.opacity = 0;
  group.add(lines);
  group.add(nodes);
  return group;
}

function createGraphComputeWavefronts() {
  const group = new THREE.Group();
  group.name = 'graph-compute-wavefronts';
  const colors = ['#42d9c8', '#7dfc91', '#fff8d9', '#f5c85a'];

  for (let i = 0; i < GRAPH_COMPUTE_WAVE_COUNT; i += 1) {
    const radius = 1.25 + i * 0.62;
    const geometry = new THREE.TorusGeometry(radius, 0.006 + i * 0.0008, 8, 220);
    const material = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wave = new THREE.Mesh(geometry, material);
    wave.name = `graph-compute-wavefront-${i}`;
    wave.rotation.x = Math.PI / 2 + (i - 3) * 0.035;
    wave.rotation.z = i * 0.38;
    wave.scale.y = 0.62 + (i % 3) * 0.12;
    wave.userData = {
      baseRadius: radius,
      baseOpacity: 0.12 + i * 0.012,
      phase: i * 0.72,
      spin: (i % 2 === 0 ? 1 : -1) * (0.006 + i * 0.0015),
    };
    group.add(wave);
  }

  group.userData.opacity = 0;
  group.visible = false;
  return group;
}

function createJiangchengVoiceWaves() {
  const group = new THREE.Group();
  group.name = 'jiangcheng-voice-waves';

  const voiceColors = ['#fff8d9', '#7dfc91', '#42d9c8', '#f5c85a', '#ff8fb8'];
  [-0.52, -0.18, 0.18, 0.52].forEach((y, index) => {
    const points = [];
    const radius = 0.78 + index * 0.34;
    for (let i = 0; i <= 192; i += 1) {
      const t = i / 192;
      const angle = t * Math.PI * 2;
      const wobble = 1 + Math.sin(angle * (5 + index) + index * 0.7) * 0.035;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius * wobble - 0.08,
        y + Math.sin(angle) * 0.16 * wobble,
        Math.sin(angle) * radius * 0.18 + 0.48 + index * 0.025,
      ));
    }
    const ring = makeLine(points, voiceColors[index], 0);
    ring.name = 'jiangcheng-voice-ring';
    ring.userData.baseOpacity = 0.13 + index * 0.026;
    ring.userData.phase = index * 0.74;
    ring.userData.spin = (index % 2 === 0 ? 1 : -1) * (0.012 + index * 0.003);
    group.add(ring);
  });

  for (let lane = 0; lane < 5; lane += 1) {
    const points = [];
    for (let i = 0; i <= 128; i += 1) {
      const t = i / 128;
      const x = -2.6 + t * 5.2;
      const wordPulse = Math.sin(t * Math.PI * (6 + lane) + lane * 0.8);
      points.push(new THREE.Vector3(
        x,
        -0.72 + lane * 0.34 + wordPulse * 0.035,
        0.72 + Math.sin(t * Math.PI * 2 + lane) * 0.22,
      ));
    }
    const line = makeLine(points, lane % 2 === 0 ? '#f5c85a' : '#42d9c8', 0);
    line.name = 'jiangcheng-voice-lane';
    line.userData.baseOpacity = 0.08 + lane * 0.012;
    line.userData.phase = lane * 0.51;
    line.userData.points = points;
    group.add(line);
  }

  const packetPositions = new Float32Array(JIANGCHENG_VOICE_PACKET_COUNT * 3);
  const packetColors = new Float32Array(JIANGCHENG_VOICE_PACKET_COUNT * 3);
  const packetSeeds = new Float32Array(JIANGCHENG_VOICE_PACKET_COUNT);
  for (let i = 0; i < JIANGCHENG_VOICE_PACKET_COUNT; i += 1) {
    const color = i % 7 === 0 ? palette.sakura : i % 5 === 0 ? palette.noodle : i % 2 === 0 ? palette.river : palette.sprout;
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
    packetSeeds[i] = (i * 0.381966) % 1;
  }
  const packetGeometry = new THREE.BufferGeometry();
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  packetGeometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  packetGeometry.setAttribute('voiceSeed', new THREE.BufferAttribute(packetSeeds, 1));
  const packets = new THREE.Points(
    packetGeometry,
    new THREE.PointsMaterial({
      size: 0.052,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'jiangcheng-voice-packets';
  packets.userData.baseOpacity = 0.72;
  group.add(packets);

  group.scale.setScalar(1.16);
  group.visible = false;
  group.userData = {
    opacity: 0,
    packets,
  };
  group.traverse((object) => {
    if (object.material) {
      object.material.depthTest = false;
      object.renderOrder = 7;
    }
  });
  return group;
}

function createWuhanTownTopology() {
  const group = new THREE.Group();
  group.name = 'wuhan-town-topology';

  const towns = [
    { name: '汉口', position: new THREE.Vector3(-2.82, 0.18, -0.92), color: '#42d9c8', radius: 0.72 },
    { name: '汉阳', position: new THREE.Vector3(-1.06, -0.76, 0.64), color: '#f5c85a', radius: 0.58 },
    { name: '武昌', position: new THREE.Vector3(1.72, 0.18, -0.58), color: '#fff8d9', radius: 0.78 },
  ];

  towns.forEach((town, townIndex) => {
    const townGroup = new THREE.Group();
    townGroup.name = 'wuhan-town-field';
    townGroup.position.copy(town.position);
    townGroup.userData = {
      name: town.name,
      baseRadius: town.radius,
      phase: townIndex * 0.78,
    };

    [0, 1].forEach((ringIndex) => {
      const points = [];
      const radius = town.radius * (1 + ringIndex * 0.34);
      for (let i = 0; i <= 160; i += 1) {
        const angle = (i / 160) * Math.PI * 2;
        const wobble = 1 + Math.sin(angle * (4 + townIndex) + ringIndex) * 0.045;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius * wobble,
          Math.sin(angle) * radius * 0.34 * wobble,
          Math.sin(angle * 2 + townIndex) * 0.08,
        ));
      }
      const ring = makeLine(points, town.color, 0);
      ring.name = 'wuhan-town-ring';
      ring.userData.baseOpacity = 0.13 - ringIndex * 0.035;
      ring.userData.phase = townIndex * 0.72 + ringIndex * 0.44;
      townGroup.add(ring);
    });

    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 16, 8),
      new THREE.MeshBasicMaterial({
        color: town.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    node.name = 'wuhan-town-core';
    node.userData.baseOpacity = 0.42;
    townGroup.add(node);
    group.add(townGroup);
  });

  const bridgePairs = [
    [towns[0], towns[1]],
    [towns[1], towns[2]],
    [towns[0], towns[2]],
  ];
  bridgePairs.forEach(([from, to], index) => {
    const points = [];
    const mid = from.position.clone().lerp(to.position, 0.5);
    mid.y += 0.18 + index * 0.06;
    mid.z += index === 2 ? -0.28 : 0.18;
    for (let i = 0; i <= 96; i += 1) {
      const t = i / 96;
      const a = from.position.clone().lerp(mid, t);
      const b = mid.clone().lerp(to.position, t);
      const p = a.lerp(b, t);
      p.y += Math.sin(t * Math.PI) * (0.12 + index * 0.045);
      points.push(p);
    }
    const link = makeLine(points, index === 0 ? '#42d9c8' : index === 1 ? '#f5c85a' : '#7dfc91', 0);
    link.name = 'wuhan-town-link';
    link.userData.baseOpacity = 0.14 + index * 0.025;
    link.userData.phase = index * 0.68;
    link.userData.points = points;
    group.add(link);
  });

  const packetPositions = new Float32Array(WUHAN_TOWN_PACKET_COUNT * 3);
  const packetColors = new Float32Array(WUHAN_TOWN_PACKET_COUNT * 3);
  const packetSeeds = new Float32Array(WUHAN_TOWN_PACKET_COUNT);
  for (let i = 0; i < WUHAN_TOWN_PACKET_COUNT; i += 1) {
    const color = i % 6 === 0 ? palette.sakura : i % 4 === 0 ? palette.noodle : i % 2 === 0 ? palette.river : palette.sprout;
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
    packetSeeds[i] = (i * 0.236067) % 1;
  }
  const packetGeometry = new THREE.BufferGeometry();
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  packetGeometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  packetGeometry.setAttribute('townSeed', new THREE.BufferAttribute(packetSeeds, 1));
  const packets = new THREE.Points(
    packetGeometry,
    new THREE.PointsMaterial({
      size: 0.052,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'wuhan-town-packets';
  packets.userData.baseOpacity = 0.68;
  group.add(packets);

  group.visible = false;
  group.userData = {
    opacity: 0,
    towns,
    bridgePairs,
    packets,
  };
  group.traverse((object) => {
    if (object.material) {
      object.material.depthTest = false;
      object.renderOrder = 4;
    }
  });
  return group;
}

function createModeTransitionPulse() {
  const group = new THREE.Group();
  group.name = 'mode-transition-pulse';

  const ringGeometry = new THREE.RingGeometry(0.82, 0.86, 160);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: '#fff8d9',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI * 0.5;
  ring.userData.baseOpacity = 0.42;
  group.add(ring);

  const ripple = [];
  for (let i = 0; i <= 220; i += 1) {
    const angle = (i / 220) * Math.PI * 2;
    const wobble = 1 + Math.sin(angle * 6) * 0.035;
    ripple.push(new THREE.Vector3(Math.cos(angle) * wobble, Math.sin(angle) * wobble * 0.74, 0));
  }
  const rippleLine = makeLine(ripple, '#7dfc91', 0.38);
  rippleLine.userData.baseOpacity = 0.38;
  group.add(rippleLine);

  const spokes = [];
  for (let i = 0; i < 72; i += 1) {
    const angle = (i / 72) * Math.PI * 2;
    const inner = 0.38 + (i % 5) * 0.015;
    const outer = 1.1 + (i % 7) * 0.05;
    spokes.push(
      0, 0, 0,
      Math.cos(angle) * outer,
      Math.sin(angle) * outer * 0.78,
      Math.sin(angle * 3) * 0.08,
    );
    if (i % 3 === 0) {
      spokes.push(
        Math.cos(angle) * inner,
        Math.sin(angle) * inner * 0.78,
        0,
        Math.cos(angle) * (outer + 0.34),
        Math.sin(angle) * (outer + 0.34) * 0.78,
        Math.sin(angle * 4) * 0.12,
      );
    }
  }
  const spokeGeometry = new THREE.BufferGeometry();
  spokeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(spokes, 3));
  const spokeMaterial = new THREE.LineBasicMaterial({
    color: '#42d9c8',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const spokeLines = new THREE.LineSegments(spokeGeometry, spokeMaterial);
  spokeLines.userData.baseOpacity = 0.28;
  group.add(spokeLines);

  group.visible = false;
  return group;
}

function createPointerField() {
  const group = new THREE.Group();
  group.name = 'pointer-field';

  const ringPoints = [];
  for (let i = 0; i <= 120; i += 1) {
    const angle = (i / 120) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(Math.cos(angle) * 0.52, Math.sin(angle) * 0.52, 0));
  }
  const ring = makeLine(ringPoints, '#7dfc91', 0.28);
  ring.name = 'pointer-field-ring';
  group.add(ring);

  const cross = [
    -0.68, 0, 0, -0.28, 0, 0,
    0.28, 0, 0, 0.68, 0, 0,
    0, -0.48, 0, 0, -0.18, 0,
    0, 0.18, 0, 0, 0.48, 0,
  ];
  const crossGeometry = new THREE.BufferGeometry();
  crossGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cross, 3));
  const crossMaterial = new THREE.LineBasicMaterial({
    color: '#42d9c8',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const crossLines = new THREE.LineSegments(crossGeometry, crossMaterial);
  crossLines.userData.baseOpacity = 0.2;
  group.add(crossLines);

  group.visible = false;
  group.userData.opacity = 0;
  return group;
}

function createClickRipple() {
  const group = new THREE.Group();
  group.name = 'click-ripple';

  const ringPoints = [];
  for (let i = 0; i <= 168; i += 1) {
    const angle = (i / 168) * Math.PI * 2;
    const wobble = 1 + Math.sin(angle * 5) * 0.04;
    ringPoints.push(new THREE.Vector3(Math.cos(angle) * wobble, Math.sin(angle) * wobble, 0));
  }
  const ring = makeLine(ringPoints, '#fff8d9', 0.44);
  ring.name = 'click-ripple-ring';
  group.add(ring);

  const rays = [];
  for (let i = 0; i < 36; i += 1) {
    const angle = (i / 36) * Math.PI * 2;
    const inner = 0.34 + (i % 4) * 0.035;
    const outer = 0.92 + (i % 6) * 0.06;
    rays.push(
      Math.cos(angle) * inner,
      Math.sin(angle) * inner,
      0,
      Math.cos(angle) * outer,
      Math.sin(angle) * outer,
      Math.sin(angle * 2) * 0.05,
    );
  }
  const rayGeometry = new THREE.BufferGeometry();
  rayGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rays, 3));
  const rayMaterial = new THREE.LineBasicMaterial({
    color: '#f5c85a',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const rayLines = new THREE.LineSegments(rayGeometry, rayMaterial);
  rayLines.userData.baseOpacity = 0.26;
  group.add(rayLines);

  group.visible = false;
  return group;
}

function createMemoryFocusBeam() {
  const group = new THREE.Group();
  group.name = 'memory-focus-beam';

  const beam = makeLine([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ], '#fff8d9', 0);
  beam.name = 'memory-focus-beam-line';
  beam.userData.baseOpacity = 0.36;
  group.add(beam);

  const anchorRingPoints = [];
  for (let i = 0; i <= 96; i += 1) {
    const angle = (i / 96) * Math.PI * 2;
    anchorRingPoints.push(new THREE.Vector3(Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0));
  }
  const anchorRing = makeLine(anchorRingPoints, '#f5c85a', 0);
  anchorRing.name = 'memory-focus-anchor-ring';
  anchorRing.userData.baseOpacity = 0.42;
  group.add(anchorRing);

  group.visible = false;
  group.userData.opacity = 0;
  group.userData.target = new THREE.Vector3();
  group.userData.beam = beam;
  group.userData.anchorRing = anchorRing;
  return group;
}

function createMemoryFocusField() {
  const group = new THREE.Group();
  group.name = 'memory-focus-field';
  const colors = ['#fff8d9', '#7dfc91', '#42d9c8', '#f5c85a'];

  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(1.08, 96),
    new THREE.MeshBasicMaterial({
      color: '#010903',
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  lens.name = 'memory-focus-field-lens';
  lens.userData.baseOpacity = 0.28;
  group.add(lens);

  for (let ringIndex = 0; ringIndex < 3; ringIndex += 1) {
    const points = [];
    const radius = 0.42 + ringIndex * 0.24;
    for (let i = 0; i <= 144; i += 1) {
      const angle = (i / 144) * Math.PI * 2;
      const wobble = 1 + Math.sin(angle * (5 + ringIndex) + ringIndex) * 0.045;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius * wobble,
        Math.sin(angle) * radius * 0.72 * wobble,
        Math.sin(angle * 3 + ringIndex) * 0.035,
      ));
    }
    const ring = makeLine(points, colors[ringIndex], 0);
    ring.name = 'memory-focus-field-ring';
    ring.userData.baseOpacity = 0.28 - ringIndex * 0.032;
    ring.userData.phase = ringIndex * 0.9;
    group.add(ring);
  }

  const rayPositions = [];
  const rayCount = 72;
  for (let i = 0; i < rayCount; i += 1) {
    const angle = (i / rayCount) * Math.PI * 2;
    const inner = 0.18 + (i % 4) * 0.018;
    const outer = 0.7 + (i % 9) * 0.045;
    const yScale = 0.72 + Math.sin(i * 0.8) * 0.08;
    rayPositions.push(
      Math.cos(angle) * inner,
      Math.sin(angle) * inner * yScale,
      Math.sin(angle * 2) * 0.02,
      Math.cos(angle) * outer,
      Math.sin(angle) * outer * yScale,
      Math.sin(angle * 3) * 0.12,
    );
  }
  const rayGeometry = new THREE.BufferGeometry();
  rayGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rayPositions, 3));
  const rays = new THREE.LineSegments(
    rayGeometry,
    new THREE.LineBasicMaterial({
      color: '#7dfc91',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  rays.name = 'memory-focus-field-rays';
  rays.userData.baseOpacity = 0.24;
  group.add(rays);

  const moteCount = 84;
  const motePositions = new Float32Array(moteCount * 3);
  const moteColors = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i += 1) {
    const color = i % 5 === 0 ? palette.noodle : i % 3 === 0 ? palette.sakura : i % 2 === 0 ? palette.sprout : palette.river;
    moteColors[i * 3] = color.r;
    moteColors[i * 3 + 1] = color.g;
    moteColors[i * 3 + 2] = color.b;
  }
  const moteGeometry = new THREE.BufferGeometry();
  moteGeometry.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  moteGeometry.setAttribute('color', new THREE.BufferAttribute(moteColors, 3));
  const motes = new THREE.Points(
    moteGeometry,
    new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  motes.name = 'memory-focus-field-motes';
  motes.userData.count = moteCount;
  motes.userData.baseOpacity = 0.76;
  group.add(motes);

  group.visible = false;
  group.userData.opacity = 0;
  group.userData.target = new THREE.Vector3();
  group.userData.localTarget = new THREE.Vector3();
  group.userData.motes = motes;
  group.userData.rays = rays;
  group.traverse((object) => {
    if (object.material) {
      object.material.depthTest = false;
      object.renderOrder = 7;
    }
  });
  return group;
}

function createMemoryNetworkRipples() {
  const group = new THREE.Group();
  group.name = 'memory-network-ripples';
  const hotspotPositionMap = new Map(
    WUHAN_MEMORY_HOTSPOTS.map((hotspot) => [hotspot.name, new THREE.Vector3(...hotspot.position)]),
  );

  WUHAN_MEMORY_LINKS.forEach(([from, to], index) => {
    const start = hotspotPositionMap.get(from);
    const end = hotspotPositionMap.get(to);
    if (!start || !end) return;

    const middle = start.clone().lerp(end, 0.5);
    middle.y += 0.28 + (index % 4) * 0.06;
    middle.z += Math.sin(index * 1.17) * 0.24;
    const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
    const points = curve.getPoints(28);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap((p) => [p.x, p.y, p.z]), 3));
    const material = new THREE.LineBasicMaterial({
      color: index % 2 === 0 ? '#7dfc91' : '#f5c85a',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    line.name = 'memory-network-ripple-link';
    line.userData = {
      from,
      to,
      baseOpacity: 0.46 + (index % 3) * 0.06,
      phase: index * 0.47,
      points,
    };
    group.add(line);
  });

  const packetCount = 120;
  const packetPositions = new Float32Array(packetCount * 3);
  const packetColors = new Float32Array(packetCount * 3);
  for (let i = 0; i < packetCount; i += 1) {
    const color = i % 4 === 0 ? palette.noodle : i % 3 === 0 ? palette.sprout : i % 2 === 0 ? palette.river : palette.sakura;
    packetColors[i * 3] = color.r;
    packetColors[i * 3 + 1] = color.g;
    packetColors[i * 3 + 2] = color.b;
  }
  const packetGeometry = new THREE.BufferGeometry();
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
  packetGeometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
  const packets = new THREE.Points(
    packetGeometry,
    new THREE.PointsMaterial({
      size: 0.052,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  packets.name = 'memory-network-ripple-packets';
  packets.userData.count = packetCount;
  packets.userData.baseOpacity = 0.86;
  group.add(packets);

  group.visible = false;
  group.userData.opacity = 0;
  group.userData.activeLinks = [];
  group.userData.packets = packets;
  group.traverse((object) => {
    if (object.material) {
      object.material.depthWrite = false;
      object.material.depthTest = false;
      object.renderOrder = 8;
    }
  });
  return group;
}

function createCityMemoryMarks() {
  const group = new THREE.Group();
  group.name = 'wuhan-memory-layer';

  const bridgePositions = [];
  for (let i = 0; i < 72; i += 1) {
    const x = -3.65 + i * (7.3 / 71);
    const deckY = -1.52 + Math.sin(i * 0.28) * 0.035;
    bridgePositions.push(x, deckY, -1.82, x, deckY + 0.28 + Math.sin(i * 0.7) * 0.06, -1.82);
    if (i < 71) {
      const nx = -3.65 + (i + 1) * (7.3 / 71);
      bridgePositions.push(x, deckY, -1.82, nx, -1.52 + Math.sin((i + 1) * 0.28) * 0.035, -1.82);
    }
  }
  [-1.35, 1.35].forEach((x) => {
    bridgePositions.push(x, -1.54, -1.82, x, -0.72, -1.82);
    bridgePositions.push(x - 0.18, -0.72, -1.82, x + 0.18, -0.72, -1.82);
    bridgePositions.push(x - 0.18, -0.72, -1.82, x, -0.42, -1.82);
    bridgePositions.push(x + 0.18, -0.72, -1.82, x, -0.42, -1.82);
  });
  for (let i = 0; i < 22; i += 1) {
    const t = i / 21;
    const x = -1.35 + t * 2.7;
    const arch = -0.45 - Math.sin(t * Math.PI) * 0.32;
    bridgePositions.push(x, -1.5, -1.82, x, arch, -1.82);
  }
  const bridgeGeometry = new THREE.BufferGeometry();
  bridgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bridgePositions, 3));
  const bridge = new THREE.LineSegments(
    bridgeGeometry,
    new THREE.LineBasicMaterial({
      color: '#f5c85a',
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  bridge.name = 'yangtze-bridge-glyph';
  bridge.userData.baseOpacity = 0.24;
  group.add(bridge);

  const towerShape = [];
  const floorYs = [0, 0.28, 0.58, 0.88, 1.16];
  const widths = [0.78, 0.62, 0.48, 0.34, 0.16];
  floorYs.forEach((y, index) => {
    const width = widths[index];
    towerShape.push([-width, y, 0], [width, y, 0]);
    towerShape.push([-width * 0.72, y + 0.16, 0], [width * 0.72, y + 0.16, 0]);
    towerShape.push([-width, y, 0], [-width * 0.72, y + 0.16, 0]);
    towerShape.push([width, y, 0], [width * 0.72, y + 0.16, 0]);
    if (index < floorYs.length - 1) {
      towerShape.push([-width * 0.35, y, 0], [-widths[index + 1] * 0.35, floorYs[index + 1], 0]);
      towerShape.push([width * 0.35, y, 0], [widths[index + 1] * 0.35, floorYs[index + 1], 0]);
    }
  });
  towerShape.push([0, 1.32, 0], [0, 1.58, 0]);
  const towerGeometry = new THREE.BufferGeometry();
  towerGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(towerShape.flatMap(([x, y, z]) => [x + 2.5, y - 0.2, z - 2.4]), 3),
  );
  const tower = new THREE.LineSegments(
    towerGeometry,
    new THREE.LineBasicMaterial({
      color: '#fff1a8',
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  tower.name = 'yellow-crane-tower-glyph';
  tower.userData.baseOpacity = 0.26;
  group.add(tower);

  const nodeRand = seededRandom(2026);
  const cityNodePositions = [];
  const cityNodeColors = [];
  const cityColors = [palette.river, palette.sprout, palette.noodle, palette.sakura, palette.ember];
  for (let i = 0; i < 180; i += 1) {
    const cluster = i % 6;
    const anchorAngle = (cluster / 6) * Math.PI * 2 + 0.3;
    const radius = 2.4 + nodeRand() * 3.8;
    const x = Math.cos(anchorAngle) * radius + (nodeRand() - 0.5) * 1.25;
    const y = (nodeRand() - 0.5) * 2.7;
    const z = Math.sin(anchorAngle) * radius * 0.8 + (nodeRand() - 0.5) * 1.15;
    cityNodePositions.push(x, y, z);
    const c = cityColors[i % cityColors.length];
    cityNodeColors.push(c.r, c.g, c.b);
  }
  const cityNodeGeometry = new THREE.BufferGeometry();
  cityNodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cityNodePositions, 3));
  cityNodeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(cityNodeColors, 3));
  const cityNodes = new THREE.Points(
    cityNodeGeometry,
    new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.46,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  cityNodes.name = 'city-nodes';
  group.add(cityNodes);

  const hotspotGroup = new THREE.Group();
  hotspotGroup.name = 'memory-hotspots';
  WUHAN_MEMORY_HOTSPOTS.forEach((hotspot, index) => {
    const position = new THREE.Vector3(...hotspot.position);
    const color = new THREE.Color(hotspot.color);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 10),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    marker.name = 'memory-hotspot-marker';
    marker.position.copy(position);
    marker.userData = { ...hotspot, phase: index * 0.72, baseScale: 1, isMemoryHotspot: true };
    hotspotGroup.add(marker);

    const hitArea = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 8),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    hitArea.name = 'memory-hotspot-hitarea';
    hitArea.position.copy(position);
    hitArea.userData = { ...hotspot, phase: index * 0.72, isMemoryHotspot: true };
    hotspotGroup.add(hitArea);

    const ringPoints = [];
    for (let i = 0; i <= 72; i += 1) {
      const angle = (i / 72) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(
        position.x + Math.cos(angle) * 0.18,
        position.y + Math.sin(angle) * 0.18,
        position.z,
      ));
    }
    const ring = makeLine(ringPoints, hotspot.color, 0.16);
    ring.name = 'memory-hotspot-ring';
    ring.userData = { ...hotspot, phase: index * 0.72 };
    hotspotGroup.add(ring);

    const spoke = makeLine([position, position.clone().multiplyScalar(0.78)], hotspot.color, 0.12);
    spoke.name = 'memory-hotspot-spoke';
    spoke.userData = { ...hotspot, phase: index * 0.72 };
    hotspotGroup.add(spoke);

  });
  group.add(hotspotGroup);

  const hotspotPositionMap = new Map(
    WUHAN_MEMORY_HOTSPOTS.map((hotspot) => [hotspot.name, new THREE.Vector3(...hotspot.position)]),
  );
  const memoryLinkPositions = [];
  const memoryLinkColors = [];
  const focusLinkGroup = new THREE.Group();
  focusLinkGroup.name = 'memory-focus-links';
  WUHAN_MEMORY_LINKS.forEach(([from, to], index) => {
    const start = hotspotPositionMap.get(from);
    const end = hotspotPositionMap.get(to);
    if (!start || !end) return;
    const middle = start.clone().lerp(end, 0.5);
    middle.y += 0.16 + (index % 3) * 0.06;
    middle.z += Math.sin(index * 1.37) * 0.18;
    const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
    const points = curve.getPoints(18);
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      memoryLinkPositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const color = i % 2 === 0 ? palette.river : palette.noodle;
      memoryLinkColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
    const focusColor = index % 2 === 0 ? '#42d9c8' : '#f5c85a';
    const focusLine = makeLine(points, focusColor, 0);
    focusLine.name = 'memory-focus-link';
    focusLine.userData = { from, to, baseOpacity: 0.36, phase: index * 0.42 };
    focusLinkGroup.add(focusLine);
  });
  const memoryLinkGeometry = new THREE.BufferGeometry();
  memoryLinkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(memoryLinkPositions, 3));
  memoryLinkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(memoryLinkColors, 3));
  const memoryLinks = new THREE.LineSegments(
    memoryLinkGeometry,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  memoryLinks.name = 'memory-link-lines';
  memoryLinks.userData.baseOpacity = 0.08;
  group.add(memoryLinks);
  group.add(focusLinkGroup);

  const blossomPositions = [];
  const blossomColors = [];
  for (let i = 0; i < 220; i += 1) {
    const p = randomSpherePoint(nodeRand, 3.6 + nodeRand() * 2.8, 0.7);
    p.y += 0.35 + Math.sin(i) * 0.25;
    blossomPositions.push(p.x, p.y, p.z);
    const c = palette.sakura.clone().lerp(palette.core, nodeRand() * 0.18);
    blossomColors.push(c.r, c.g, c.b);
  }
  const blossomGeometry = new THREE.BufferGeometry();
  blossomGeometry.setAttribute('position', new THREE.Float32BufferAttribute(blossomPositions, 3));
  blossomGeometry.setAttribute('color', new THREE.Float32BufferAttribute(blossomColors, 3));
  const blossoms = new THREE.Points(
    blossomGeometry,
    new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  blossoms.name = 'sakura-drift';
  group.add(blossoms);

  const sparkPositions = [];
  const sparkColors = [];
  const sparkRand = seededRandom(250531);
  const sparkAnchors = [
    new THREE.Vector3(0.62, -1.42, -2.12),
    new THREE.Vector3(-3.15, 0.8, -2.35),
    new THREE.Vector3(4.42, -0.72, 0.18),
    new THREE.Vector3(-4.05, -0.35, -0.8),
  ];
  for (let i = 0; i < 360; i += 1) {
    const anchor = sparkAnchors[i % sparkAnchors.length];
    const orbit = randomSpherePoint(sparkRand, 0.42 + sparkRand() * 1.6, 0.58);
    orbit.x += (sparkRand() - 0.5) * 0.8;
    orbit.y += Math.abs(sparkRand() - 0.35) * 0.55;
    const p = anchor.clone().add(orbit);
    sparkPositions.push(p.x, p.y, p.z);
    const c = (sparkRand() < 0.62 ? palette.ember : palette.noodle).clone().lerp(palette.core, sparkRand() * 0.16);
    sparkColors.push(c.r, c.g, c.b);
  }
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3));
  sparkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sparkColors, 3));
  const sparks = new THREE.Points(
    sparkGeometry,
    new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  sparks.name = 'ember-sparks';
  group.add(sparks);

  return group;
}

function createReferenceSceneMotifs() {
  const group = new THREE.Group();
  group.name = 'reference-scene-motifs';

  const addLine = (name, points, color, opacity, renderOrder = 3) => {
    const line = makeLine(points, color, opacity);
    line.name = name;
    line.userData.baseOpacity = opacity;
    line.renderOrder = renderOrder;
    group.add(line);
    return line;
  };

  const addSegments = (name, positions, color, opacity) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const segments = new THREE.LineSegments(geometry, material);
    segments.name = name;
    segments.userData.baseOpacity = opacity;
    group.add(segments);
    return segments;
  };

  const lakeLines = [];
  for (let r = 0; r < 12; r += 1) {
    const points = [];
    const radiusX = 1.2 + r * 0.42;
    const radiusZ = 0.18 + r * 0.08;
    for (let i = 0; i <= 120; i += 1) {
      const a = (i / 120) * Math.PI * 2;
      points.push(new THREE.Vector3(
        -2.2 + Math.cos(a) * radiusX,
        -1.72 + r * 0.005,
        -0.34 + Math.sin(a) * radiusZ,
      ));
    }
    const line = addLine('motif-lake-ripple', points, r % 3 === 0 ? '#f5c85a' : '#42d9c8', 0.055 + r * 0.004, 1);
    line.userData.phase = r * 0.37;
    lakeLines.push(line);
  }

  const pavilion = [];
  const roofLevels = [
    { y: -0.08, width: 0.72, lift: 0.16 },
    { y: 0.16, width: 0.58, lift: 0.12 },
  ];
  roofLevels.forEach((roof) => {
    pavilion.push(
      1.92 - roof.width, roof.y, -1.12,
      1.92, roof.y + roof.lift, -1.12,
      1.92, roof.y + roof.lift, -1.12,
      1.92 + roof.width, roof.y, -1.12,
      1.92 - roof.width * 0.76, roof.y - 0.08, -1.12,
      1.92 + roof.width * 0.76, roof.y - 0.08, -1.12,
    );
  });
  [-0.34, 0, 0.34].forEach((x) => {
    pavilion.push(1.92 + x, -0.84, -1.12, 1.92 + x, 0.02, -1.12);
  });
  pavilion.push(1.38, -0.84, -1.12, 2.46, -0.84, -1.12);
  addSegments('motif-lake-pavilion', pavilion, '#fff1a8', 0.2);

  const reflection = pavilion.map((value, index) => (index % 3 === 1 ? -1.74 - (value + 0.84) * 0.48 : value));
  addSegments('motif-lake-reflection', reflection, '#42d9c8', 0.08);

  const skyline = [];
  const skylineWidths = [0.34, 0.22, 0.44, 0.28, 0.52, 0.24, 0.4, 0.3, 0.5, 0.26, 0.36, 0.58, 0.3];
  skylineWidths.forEach((width, index) => {
    const x = -4.8 + index * 0.72;
    const h = 0.42 + ((index * 37) % 9) * 0.14;
    const y0 = -1.18;
    const y1 = y0 + h;
    skyline.push(
      x - width, y0, -2.82, x - width, y1, -2.82,
      x - width, y1, -2.82, x + width, y1, -2.82,
      x + width, y1, -2.82, x + width, y0, -2.82,
      x - width, y0, -2.82, x + width, y0, -2.82,
    );
    for (let floor = 1; floor < 7; floor += 1) {
      const fy = y0 + (h * floor) / 7;
      skyline.push(x - width * 0.72, fy, -2.82, x + width * 0.72, fy, -2.82);
    }
  });
  addSegments('motif-neon-skyline', skyline, '#5bb7ff', 0.13);

  const road = [];
  for (let i = 0; i <= 96; i += 1) {
    const t = i / 96;
    const x = -4.7 + t * 5.1;
    const y = -1.46 + Math.sin(t * Math.PI) * 0.22;
    const z = -2.18 + Math.sin(t * Math.PI * 1.6) * 0.18;
    road.push(new THREE.Vector3(x, y, z));
  }
  addLine('motif-gold-road-flow', road, '#f5c85a', 0.22);

  const bridgeHero = [];
  for (let i = 0; i < 96; i += 1) {
    const t = i / 95;
    const x = -5.2 + t * 9.8;
    const y = -1.06 + t * 0.52;
    const z = -1.66 + Math.sin(t * Math.PI) * 0.08;
    if (i < 95) {
      const nt = (i + 1) / 95;
      const nx = -5.2 + nt * 9.8;
      const ny = -1.06 + nt * 0.52;
      const nz = -1.66 + Math.sin(nt * Math.PI) * 0.08;
      bridgeHero.push(x, y, z, nx, ny, nz);
    }
    if (i % 6 === 0) {
      bridgeHero.push(x, y - 0.42, z, x, y + 0.42, z);
    }
  }
  [-2.0, 1.74].forEach((x) => {
    bridgeHero.push(
      x, -1.42, -1.66, x, 0.56, -1.66,
      x - 0.42, 0.24, -1.66, x + 0.42, 0.24, -1.66,
      x - 0.34, 0.56, -1.66, x, 0.96, -1.66,
      x + 0.34, 0.56, -1.66, x, 0.96, -1.66,
    );
  });
  addSegments('motif-hero-bridge', bridgeHero, '#f5c85a', 0.18);

  const monument = [];
  for (let i = 0; i <= 5; i += 1) {
    const y = -1.12 + i * 0.54;
    const width = Math.max(0.12, 0.42 - i * 0.055);
    monument.push(-width, y, 0.18, width, y, 0.18);
  }
  monument.push(0, -1.12, 0.18, 0, 1.88, 0.18, -0.2, 1.35, 0.18, 0, 1.88, 0.18, 0.2, 1.35, 0.18, 0, 1.88, 0.18);
  addSegments('motif-birth-monument', monument, '#fff8d9', 0.18);

  for (let ring = 0; ring < 4; ring += 1) {
    const points = [];
    for (let i = 0; i <= 160; i += 1) {
      const t = i / 160;
      const a = t * Math.PI * 2;
      const r = 0.88 + ring * 0.36;
      points.push(new THREE.Vector3(
        Math.cos(a) * r,
        -0.1 + Math.sin(a + ring) * 0.34 + ring * 0.12,
        Math.sin(a) * r * 0.52,
      ));
    }
    const line = addLine('motif-birth-ring', points, ring % 2 === 0 ? '#358dff' : '#f5c85a', 0.14);
    line.rotation.z = ring * 0.42;
    line.userData.phase = ring * 0.6;
  }

  group.visible = false;
  group.userData.opacity = 0;
  group.traverse((object) => {
    if (object.material) {
      object.material.depthTest = false;
    }
  });
  return group;
}

function makeLine(points, color, opacity = 0.42) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap((p) => [p.x, p.y, p.z]), 3));
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.userData.baseOpacity = opacity;
  return line;
}

function makeTube(points, color, radius = 0.018, opacity = 0.6) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, Math.max(12, points.length * 8), radius, 8, false);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.baseOpacity = opacity;
  return mesh;
}

function createSuanbirdGlyph() {
  const group = new THREE.Group();
  group.name = 'suanbird-glyph';
  const negativeSpace = new THREE.Group();
  negativeSpace.name = 'suanbird-negative-space-silhouette';
  group.add(negativeSpace);
  const identityAnchors = new THREE.Group();
  identityAnchors.name = 'suanbird-identity-anchors';
  group.add(identityAnchors);

  // 蒜鸟识别锚点：加强“蒜 + 鸟 + 蒜苗”的第一眼轮廓，仍保持光线雕塑感。
  const addNegativeSpaceDisk = (name, position, scale, opacity = 0.32) => {
    const material = new THREE.MeshBasicMaterial({
      color: '#020503',
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 96), material);
    mesh.name = name;
    mesh.position.copy(position);
    mesh.scale.set(scale.x, scale.y, 1);
    mesh.userData.baseOpacity = opacity;
    negativeSpace.add(mesh);
    return mesh;
  };

  const addNegativeSpaceShape = (name, points, opacity = 0.3) => {
    const shape = new THREE.Shape();
    points.forEach((point, index) => {
      if (index === 0) shape.moveTo(point.x, point.y);
      else shape.lineTo(point.x, point.y);
    });
    shape.closePath();
    const material = new THREE.MeshBasicMaterial({
      color: '#020503',
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
    mesh.name = name;
    mesh.position.z = 0.26;
    mesh.userData.baseOpacity = opacity;
    negativeSpace.add(mesh);
    return mesh;
  };

  const addAnchorLine = (name, points, color, opacity = 0.46) => {
    const line = makeLine(points, color, opacity);
    line.name = name;
    identityAnchors.add(line);
    return line;
  };

  const addAnchorTube = (name, points, color, radius = 0.01, opacity = 0.34) => {
    const tube = makeTube(points, color, radius, opacity);
    tube.name = name;
    identityAnchors.add(tube);
    return tube;
  };

  const addGlowDot = (position, color, radius, opacity) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 18, 10),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    dot.position.copy(position);
    dot.userData.baseOpacity = opacity;
    group.add(dot);
  };

  const addAnchorGlowDot = (name, position, color, radius, opacity) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 18, 10),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    dot.name = name;
    dot.position.copy(position);
    dot.userData.baseOpacity = opacity;
    identityAnchors.add(dot);
    return dot;
  };

  addNegativeSpaceDisk(
    'suanbird-negative-space-body',
    new THREE.Vector3(-0.1, -0.2, 0.22),
    new THREE.Vector3(0.98, 1.2, 1),
    0.3,
  );
  addNegativeSpaceDisk(
    'suanbird-negative-space-head',
    new THREE.Vector3(0.76, 0.52, 0.3),
    new THREE.Vector3(0.52, 0.4, 1),
    0.26,
  );
  addNegativeSpaceShape('suanbird-negative-space-beak', [
    new THREE.Vector2(1.02, 0.62),
    new THREE.Vector2(1.88, 0.5),
    new THREE.Vector2(1.02, 0.38),
  ], 0.24);
  addNegativeSpaceShape('suanbird-negative-space-sprout', [
    new THREE.Vector2(-0.26, 0.5),
    new THREE.Vector2(-0.06, 2.32),
    new THREE.Vector2(0.16, 0.52),
    new THREE.Vector2(0.02, 0.42),
  ], 0.18);

  const body = [];
  for (let i = 0; i <= 160; i += 1) {
    const a = (i / 160) * Math.PI * 2;
    const squash = 1 - Math.max(0, Math.sin(a)) * 0.18;
    body.push(new THREE.Vector3(Math.cos(a) * 0.9 * squash - 0.1, Math.sin(a) * 1.12 - 0.2, Math.sin(a * 2) * 0.08));
  }
  group.add(makeLine(body, '#fff8d9', 0.52));
  group.add(makeTube(body, '#fff8d9', 0.012, 0.32));
  addAnchorLine('suanbird-bulb-silhouette-left', [
    new THREE.Vector3(-0.78, 0.34, 0.48),
    new THREE.Vector3(-1.02, -0.18, 0.5),
    new THREE.Vector3(-0.78, -0.82, 0.48),
    new THREE.Vector3(-0.32, -1.18, 0.44),
  ], '#fff8d9', 0.44);
  addAnchorLine('suanbird-bulb-silhouette-right', [
    new THREE.Vector3(0.56, 0.34, 0.48),
    new THREE.Vector3(0.82, -0.12, 0.5),
    new THREE.Vector3(0.62, -0.82, 0.48),
    new THREE.Vector3(0.12, -1.18, 0.44),
  ], '#fff8d9', 0.44);

  [-0.36, -0.18, 0, 0.18, 0.36].forEach((x, index) => {
    const bulbRib = [];
    for (let i = 0; i <= 84; i += 1) {
      const t = i / 84;
      const y = -1.08 + t * 1.74;
      const taper = Math.sin(t * Math.PI);
      const sideCurve = x * taper * (0.72 + t * 0.24) - 0.08;
      bulbRib.push(new THREE.Vector3(
        sideCurve,
        y + Math.abs(x) * 0.08 * taper,
        0.18 + Math.sin(t * Math.PI + index * 0.7) * 0.035,
      ));
    }
    group.add(makeTube(bulbRib, index === 2 ? '#fff8d9' : '#7dfc91', index === 2 ? 0.011 : 0.008, index === 2 ? 0.38 : 0.24));
  });

  [-0.46, -0.22, 0, 0.22, 0.46].forEach((x, index) => {
    const vein = [];
    for (let i = 0; i <= 72; i += 1) {
      const t = i / 72;
      const y = -1.08 + t * 1.72;
      const taper = Math.sin(t * Math.PI);
      vein.push(new THREE.Vector3(x * taper - 0.08, y, Math.sin(t * Math.PI + index) * 0.035));
    }
    group.add(makeLine(vein, index === 2 ? '#fff8d9' : '#7dfc91', index === 2 ? 0.46 : 0.3));
  });

  [-0.34, -0.12, 0.12, 0.34].forEach((x, index) => {
    const root = [];
    for (let i = 0; i <= 40; i += 1) {
      const t = i / 40;
      root.push(new THREE.Vector3(
        x * (1 - t * 0.35) - 0.08,
        -1.17 - Math.sin(t * Math.PI) * (0.08 + index * 0.012),
        (t - 0.5) * 0.12,
      ));
    }
    group.add(makeLine(root, '#f5c85a', 0.24));
  });

  [-0.48, -0.28, -0.08, 0.12, 0.32, 0.52].forEach((x, index) => {
    const rootlet = [
      new THREE.Vector3(x - 0.08, -1.14, 0.14),
      new THREE.Vector3(x * 0.92 - 0.08, -1.28 - (index % 2) * 0.03, 0.18 + (index - 2.5) * 0.018),
      new THREE.Vector3(x * 0.78 - 0.08, -1.36 - (index % 3) * 0.02, 0.22 + (index - 2.5) * 0.025),
    ];
    group.add(makeTube(rootlet, '#f5c85a', 0.007, 0.22));
  });

  addGlowDot(new THREE.Vector3(-0.1, -1.18, 0.2), '#fff1a8', 0.035, 0.58);

  const garlicCrown = [];
  for (let i = 0; i <= 72; i += 1) {
    const t = i / 72;
    const a = Math.PI * (1.02 + t * 0.96);
    garlicCrown.push(new THREE.Vector3(
      Math.cos(a) * 0.54 - 0.08,
      0.46 + Math.sin(a) * 0.18,
      0.24 + Math.sin(t * Math.PI) * 0.06,
    ));
  }
  addAnchorLine('suanbird-garlic-crown', garlicCrown, '#fff8d9', 0.5);
  addAnchorTube('suanbird-garlic-crown-core', garlicCrown, '#7dfc91', 0.009, 0.3);

  [-0.42, -0.2, 0, 0.2, 0.42].forEach((x, index) => {
    const clove = [];
    for (let i = 0; i <= 60; i += 1) {
      const t = i / 60;
      const y = -1.02 + t * 1.22;
      const taper = Math.sin(t * Math.PI);
      const side = x * taper * (0.86 + t * 0.16) - 0.08;
      clove.push(new THREE.Vector3(
        side,
        y + Math.abs(x) * 0.1 * taper,
        0.36 + Math.sin(t * Math.PI + index * 0.48) * 0.045,
      ));
    }
    addAnchorLine(`suanbird-garlic-clove-${index}`, clove, index === 2 ? '#fff8d9' : '#f5c85a', index === 2 ? 0.44 : 0.28);
  });

  const head = [];
  for (let i = 0; i <= 96; i += 1) {
    const a = (i / 96) * Math.PI * 2;
    head.push(new THREE.Vector3(0.74 + Math.cos(a) * 0.44, 0.5 + Math.sin(a) * 0.34, Math.sin(a) * 0.04));
  }
  group.add(makeLine(head, '#fff8d9', 0.48));

  const faceArc = [];
  for (let i = 0; i <= 54; i += 1) {
    const t = i / 54;
    const a = -0.72 + t * 1.72;
    faceArc.push(new THREE.Vector3(0.78 + Math.cos(a) * 0.34, 0.5 + Math.sin(a) * 0.25, 0.42));
  }
  group.add(makeLine(faceArc, '#fff8d9', 0.68));

  group.add(makeLine([
    new THREE.Vector3(0.38, 0.26, 0.03),
    new THREE.Vector3(0.55, 0.42, 0.02),
    new THREE.Vector3(0.68, 0.32, 0.02),
  ], '#fff8d9', 0.32));

  const profileNeck = [
    new THREE.Vector3(0.2, 0.12, 0.34),
    new THREE.Vector3(0.42, 0.32, 0.42),
    new THREE.Vector3(0.74, 0.48, 0.52),
    new THREE.Vector3(1.04, 0.52, 0.58),
  ];
  addAnchorLine('suanbird-neck-profile', profileNeck, '#fff8d9', 0.48);
  addAnchorTube('suanbird-neck-profile-core', profileNeck, '#42d9c8', 0.01, 0.3);

  const beak = [
    new THREE.Vector3(1.08, 0.56, 0.42),
    new THREE.Vector3(1.74, 0.5, 0.48),
    new THREE.Vector3(1.08, 0.42, 0.4),
    new THREE.Vector3(1.08, 0.56, 0.42),
  ];
  addAnchorLine('suanbird-beak-outline', beak, '#f5c85a', 0.78);
  addAnchorTube('suanbird-beak-core', beak, '#f5c85a', 0.018, 0.5);

  const beakRidge = [
    new THREE.Vector3(1.08, 0.5, 0.46),
    new THREE.Vector3(1.86, 0.5, 0.5),
  ];
  addAnchorLine('suanbird-beak-ridge', beakRidge, '#ff6b36', 0.56);
  addAnchorTube('suanbird-beak-ridge-core', beakRidge, '#ff6b36', 0.014, 0.44);
  addAnchorLine('suanbird-beak-inner-spark', [
    new THREE.Vector3(1.18, 0.54, 0.44),
    new THREE.Vector3(1.48, 0.5, 0.48),
    new THREE.Vector3(1.18, 0.45, 0.43),
  ], '#fff1a8', 0.34);
  addGlowDot(new THREE.Vector3(1.84, 0.5, 0.5), '#ff6b36', 0.04, 0.76);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 20, 12),
    new THREE.MeshBasicMaterial({
      color: '#ff8fb8',
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  eye.name = 'suanbird-eye-core';
  eye.position.set(0.96, 0.68, 0.68);
  eye.userData.baseOpacity = 0.95;
  group.add(eye);
  addGlowDot(new THREE.Vector3(0.99, 0.71, 0.76), '#fff8d9', 0.03, 0.95);

  const eyeHalo = [];
  for (let i = 0; i <= 48; i += 1) {
    const a = (i / 48) * Math.PI * 2;
    eyeHalo.push(new THREE.Vector3(0.96 + Math.cos(a) * 0.12, 0.68 + Math.sin(a) * 0.084, 0.66));
  }
  addAnchorLine('suanbird-eye-halo', eyeHalo, '#ff8fb8', 0.95);
  addAnchorTube('suanbird-eye-halo-core', eyeHalo, '#ff8fb8', 0.016, 0.72);
  addAnchorGlowDot('suanbird-eye-spark-anchor', new THREE.Vector3(0.98, 0.7, 0.78), '#fff8d9', 0.038, 0.98);

  group.add(makeLine([
    new THREE.Vector3(0.76, 0.81, 0.62),
    new THREE.Vector3(0.96, 0.86, 0.68),
    new THREE.Vector3(1.13, 0.76, 0.64),
  ], '#f5c85a', 0.46));

  addAnchorLine('suanbird-cheek-breath', [
    new THREE.Vector3(0.86, 0.54, 0.72),
    new THREE.Vector3(0.96, 0.5, 0.76),
    new THREE.Vector3(1.06, 0.54, 0.72),
  ], '#ff8fb8', 0.46);

  [-0.62, -0.32, -0.04, 0.28, 0.58].forEach((angle, index) => {
    const leaf = [];
    const edge = [];
    for (let i = 0; i <= 80; i += 1) {
      const t = i / 80;
      const p = new THREE.Vector3(Math.sin(t * Math.PI) * (index - 2) * 0.045, 0.52 + t * 1.82, Math.sin(t * Math.PI) * 0.05);
      p.x += Math.sin(t * Math.PI) * (index - 2) * 0.17;
      rotateZ(p, angle);
      leaf.push(p);
      const e = p.clone();
      e.x += Math.sin(t * Math.PI) * 0.045 * (index < 2 ? -1 : 1);
      edge.push(e);
    }
    addAnchorLine(`suanbird-sprout-leaf-${index}`, leaf, '#7dfc91', index === 2 ? 0.78 : 0.66);
    group.add(makeLine(edge, '#42d9c8', 0.24));
    addAnchorGlowDot(`suanbird-sprout-tip-${index}`, leaf[leaf.length - 1], index === 2 ? '#fff8d9' : '#7dfc91', 0.032, index === 2 ? 0.86 : 0.74);
  });

  const sproutCrown = [];
  for (let i = 0; i <= 44; i += 1) {
    const a = (i / 44) * Math.PI * 2;
    sproutCrown.push(new THREE.Vector3(
      Math.cos(a) * 0.18 - 0.08,
      0.62 + Math.sin(a) * 0.08,
      0.34 + Math.sin(a * 2) * 0.025,
    ));
  }
  addAnchorLine('suanbird-sprout-crown-knot', sproutCrown, '#7dfc91', 0.56);
  addAnchorTube('suanbird-sprout-crown-knot-core', sproutCrown, '#fff8d9', 0.008, 0.34);

  [-1, 1].forEach((side) => {
    const wing = [];
    for (let i = 0; i <= 100; i += 1) {
      const t = i / 100;
      wing.push(new THREE.Vector3(side * (0.46 + t * 2.25), 0.03 + Math.sin(t * Math.PI) * 0.72 - t * 0.2, Math.sin(t * Math.PI) * 0.08));
    }
    addAnchorLine(`suanbird-wing-arc-${side < 0 ? 'left' : 'right'}`, wing, side < 0 ? '#42d9c8' : '#7dfc91', 0.52);

    [0.32, 0.52, 0.72].forEach((offset) => {
      const feather = [];
      for (let i = 0; i <= 52; i += 1) {
        const t = i / 52;
        feather.push(new THREE.Vector3(side * (0.56 + t * (1.25 + offset)), -0.02 + Math.sin(t * Math.PI) * (0.26 + offset * 0.36) - offset * 0.32, Math.sin(t * Math.PI) * 0.06));
      }
      addAnchorLine(`suanbird-wing-feather-${side < 0 ? 'left' : 'right'}-${Math.round(offset * 100)}`, feather, side < 0 ? '#42d9c8' : '#7dfc91', 0.3);
    });

    const wingTipSpark = [
      new THREE.Vector3(side * 1.86, 0.28, 0.08),
      new THREE.Vector3(side * 2.2, 0.18, 0.1),
      new THREE.Vector3(side * 2.48, -0.02, 0.08),
    ];
    addAnchorLine(`suanbird-wing-tip-${side < 0 ? 'left' : 'right'}`, wingTipSpark, side < 0 ? '#42d9c8' : '#7dfc91', 0.44);
  });

  [-0.16, 0, 0.16].forEach((offset, index) => {
    const tail = [];
    for (let i = 0; i <= 80; i += 1) {
      const t = i / 80;
      tail.push(new THREE.Vector3(-0.68 - t * (1.18 + index * 0.18), -0.34 - Math.sin(t * Math.PI) * (0.22 + index * 0.08), offset + Math.sin(t * Math.PI * 2) * 0.06));
    }
    addAnchorLine(`suanbird-tail-trail-${index}`, tail, index === 1 ? '#ff8fb8' : '#f5c85a', index === 1 ? 0.48 : 0.32);
  });

  group.scale.setScalar(1.22);
  group.traverse((object) => {
    if (object.material && object.userData.baseOpacity === undefined) {
      object.userData.baseOpacity = object.material.opacity;
    }
    if (object.material) {
      object.material.depthTest = false;
      object.renderOrder = object.name?.startsWith('suanbird-negative-space') ? 4 : 5;
    }
  });
  return group;
}

function createSuanbirdMemoryPulse() {
  const group = new THREE.Group();
  group.name = 'suanbird-memory-pulse';

  const rings = [
    { y: -0.78, rx: 0.48, ry: 0.16, opacity: 0.28 },
    { y: -0.38, rx: 0.66, ry: 0.22, opacity: 0.34 },
    { y: 0.02, rx: 0.74, ry: 0.24, opacity: 0.32 },
  ];
  rings.forEach(({ y, rx, ry, opacity }, index) => {
    const points = [];
    for (let i = 0; i <= 112; i += 1) {
      const angle = (i / 112) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * rx - 0.1, y + Math.sin(angle) * ry, Math.sin(angle * 2) * 0.08 + 0.28));
    }
    const ring = makeLine(points, '#fff8d9', 0);
    ring.name = 'suanbird-memory-ring';
    ring.userData.baseOpacity = opacity;
    ring.userData.phase = index * 0.64;
    group.add(ring);
  });

  [-0.46, 0, 0.46].forEach((angle, index) => {
    const points = [];
    for (let i = 0; i <= 88; i += 1) {
      const t = i / 88;
      const p = new THREE.Vector3(
        Math.sin(t * Math.PI) * (index - 1) * 0.08,
        0.42 + t * 1.95,
        0.3 + Math.sin(t * Math.PI) * 0.1,
      );
      p.x += Math.sin(t * Math.PI) * (index - 1) * 0.22;
      rotateZ(p, angle);
      points.push(p);
    }
    const sprout = makeLine(points, '#7dfc91', 0);
    sprout.name = 'suanbird-memory-sprout';
    sprout.userData.baseOpacity = 0.38;
    sprout.userData.phase = 1.4 + index * 0.55;
    group.add(sprout);
  });

  [-1, 1].forEach((side, wingIndex) => {
    const points = [];
    for (let i = 0; i <= 104; i += 1) {
      const t = i / 104;
      points.push(new THREE.Vector3(
        side * (0.42 + t * 2.35),
        0.04 + Math.sin(t * Math.PI) * 0.78 - t * 0.22,
        0.26 + Math.sin(t * Math.PI) * 0.14,
      ));
    }
    const wing = makeLine(points, '#42d9c8', 0);
    wing.name = 'suanbird-memory-wing';
    wing.userData.baseOpacity = 0.32;
    wing.userData.phase = 2.2 + wingIndex * 0.7;
    group.add(wing);
  });

  group.scale.setScalar(1.22);
  group.visible = false;
  group.userData.opacity = 0;
  group.userData.color = new THREE.Color('#fff8d9');
  group.traverse((object) => {
    if (object.material) {
      object.material.depthTest = false;
      object.renderOrder = 6;
    }
  });
  return group;
}

function useSuanbirdScene(containerRef, settings) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#010307', 0.06);

    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 80);
    camera.position.set(0.4, 1.2, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    const getProfile = () => PARTICLE_PROFILES[settings.current.profile] || PARTICLE_PROFILES.medium;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, getProfile().dpr));
    renderer.setClearColor('#010201', 1);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.userData = { resetSignal: settings.current.resetSignal };
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.48;
    controls.zoomSpeed = 0.68;
    controls.minDistance = 3.8;
    controls.maxDistance = 16;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.26;

    const root = new THREE.Group();
    scene.add(root);

    const ambient = new THREE.AmbientLight('#7dff9e', 0.45);
    scene.add(ambient);

    const deepSpaceDust = createDeepSpaceDust();
    root.add(deepSpaceDust);

    const nebula = createNebulaPoints();
    root.add(nebula.points);

    const network = createNetwork();
    root.add(network.edges);
    root.add(network.nodes);
    root.add(network.flows);

    const graphNebulaVeil = createGraphNebulaVeil();
    root.add(graphNebulaVeil);

    const burst = createCentralBurst();
    root.add(burst);
    const centralRelationRays = createCentralRelationRays();
    root.add(centralRelationRays);
    const graphComputeWavefronts = createGraphComputeWavefronts();
    root.add(graphComputeWavefronts);
    const suanbirdGlyph = createSuanbirdGlyph();
    root.add(suanbirdGlyph);
    const suanbirdMemoryPulse = createSuanbirdMemoryPulse();
    root.add(suanbirdMemoryPulse);
    const jiangchengVoiceWaves = createJiangchengVoiceWaves();
    root.add(jiangchengVoiceWaves);

    const yangtze = createRiverCurve('yangtze');
    const hanshui = createRiverCurve('hanshui');
    root.add(yangtze);
    root.add(hanshui);
    const riverConfluence = createRiverConfluencePulse();
    root.add(riverConfluence);
    const riverFlowPackets = createRiverFlowPackets();
    root.add(riverFlowPackets);
    const cityMarks = createCityMemoryMarks();
    root.add(cityMarks);
    const referenceSceneMotifs = createReferenceSceneMotifs();
    root.add(referenceSceneMotifs);
    const landmarkPulsePackets = createLandmarkPulsePackets();
    root.add(landmarkPulsePackets);
    const wuhanTownTopology = createWuhanTownTopology();
    root.add(wuhanTownTopology);
    const flowTrails = createFlowTrails();
    root.add(flowTrails);
    const birthVortex = createBirthVortex();
    root.add(birthVortex);
    const memoryReturnTrails = createMemoryReturnTrails();
    root.add(memoryReturnTrails);
    const cityMemoryCodeRain = createCityMemoryCodeRain();
    root.add(cityMemoryCodeRain);
    const wuhanMemoryOrbitField = createWuhanMemoryOrbitField();
    root.add(wuhanMemoryOrbitField);
    const modePulse = createModeTransitionPulse();
    root.add(modePulse);
    const pointerField = createPointerField();
    root.add(pointerField);
    const clickRipple = createClickRipple();
    root.add(clickRipple);
    const memoryFocusBeam = createMemoryFocusBeam();
    root.add(memoryFocusBeam);
    const memoryFocusField = createMemoryFocusField();
    root.add(memoryFocusField);
    const memoryNetworkRipples = createMemoryNetworkRipples();
    root.add(memoryNetworkRipples);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.62, 0.12);
    composer.addPass(bloom);

    const pointer = new THREE.Vector2(99, 99);
    const raycaster = new THREE.Raycaster();
    const hotspotMarkers = [];
    cityMarks.traverse((object) => {
      if (object.userData?.isMemoryHotspot) hotspotMarkers.push(object);
    });
    let hoveredHotspot = null;
    let lockedHotspot = null;
    let lastMemorySignalStamp = null;
    const clickBurst = { strength: 0, x: 0, y: 0, worldX: 0, worldY: 0, worldZ: 0, time: 0 };
    const publishHotspot = (hotspot, locked = false) => {
      if (settings.current.setActiveHotspot) {
        settings.current.setActiveHotspot(hotspot ? {
          name: hotspot.userData.name,
          note: hotspot.userData.note,
          story: hotspot.userData.story,
          color: hotspot.userData.color,
          locked,
        } : null);
      }
    };
    const detectHotspot = () => {
      if (pointer.x > 9 || hotspotMarkers.length === 0) return null;
      raycaster.setFromCamera(pointer, camera);
      const [hit] = raycaster.intersectObjects(hotspotMarkers, false);
      if (hit?.object) return hit.object;

      let nearest = null;
      let nearestDistance = Infinity;
      const projected = new THREE.Vector3();
      hotspotMarkers.forEach((marker) => {
        marker.getWorldPosition(projected);
        projected.project(camera);
        const dx = projected.x - pointer.x;
        const dy = projected.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = marker;
        }
      });
      return nearestDistance < 0.22 ? nearest : null;
    };
    const lockHotspot = (hotspot, elapsedTime, strength = 1) => {
      if (!hotspot) {
        lockedHotspot = null;
        publishHotspot(hoveredHotspot, false);
        return;
      }
      const world = hotspot.getWorldPosition(new THREE.Vector3());
      const projected = world.clone().project(camera);
      clickBurst.x = projected.x;
      clickBurst.y = projected.y;
      clickBurst.worldX = world.x;
      clickBurst.worldY = world.y;
      clickBurst.worldZ = world.z;
      clickBurst.strength = strength;
      clickBurst.time = elapsedTime;
      clickRipple.position.set(clickBurst.worldX, clickBurst.worldY, clickBurst.worldZ + 0.08);
      lockedHotspot = hotspot;
      hoveredHotspot = hotspot;
      publishHotspot(hotspot, true);
    };
    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      const nextHotspot = detectHotspot();
      if (nextHotspot !== hoveredHotspot) {
        hoveredHotspot = nextHotspot;
        publishHotspot(lockedHotspot || hoveredHotspot, Boolean(lockedHotspot));
      }
    };
    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      const selectedHotspot = detectHotspot();
      if (selectedHotspot) {
        lockHotspot(selectedHotspot, scene.userData.visualElapsed || 0, 1);
      } else {
        lockedHotspot = null;
        publishHotspot(hoveredHotspot, false);
        clickBurst.x = pointer.x;
        clickBurst.y = pointer.y;
        clickBurst.worldX = pointer.x * 3.2;
        clickBurst.worldY = pointer.y * 2;
        clickBurst.worldZ = 0;
      }
      clickBurst.strength = 1;
      clickBurst.time = scene.userData.visualElapsed || 0;
      clickRipple.position.set(clickBurst.worldX, clickBurst.worldY, clickBurst.worldZ + 0.08);
    };
    const onPointerLeave = () => {
      pointer.set(99, 99);
      hoveredHotspot = null;
      publishHotspot(lockedHotspot, Boolean(lockedHotspot));
    };
    const onContextLost = (event) => {
      event.preventDefault();
      settings.current.setWebglStatus?.('lost');
    };
    const onContextRestored = () => {
      settings.current.setWebglStatus?.('restored');
      window.setTimeout(() => {
        settings.current.setWebglStatus?.('ok');
      }, 1800);
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, getProfile().dpr));
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      bloom.resolution.set(width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const clock = new THREE.Clock();
    let previousElapsed = 0;
    let birdMix = 0;
    let currentPixelRatio = Math.min(window.devicePixelRatio, getProfile().dpr);
    let lastCaptureSignal = settings.current.captureSignal;
    let pendingCapture = false;
    let fpsEstimate = 60;
    let adaptiveQuality = 1;
    let adaptiveDensity = 1;
    let lastStatsPublish = 0;
    let compositionTurn = 0;
    let lastMode = settings.current.mode;
    let lastCameraPresetStamp = null;
    let userCameraControlUntil = 0;
    const modePulseState = { strength: 0, time: 0 };
    const cameraPresetState = {
      active: false,
      startedAt: 0,
      duration: 0.82,
      fromPosition: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPosition: camera.position.clone(),
      toTarget: controls.target.clone(),
    };
    const demoCameraTarget = {
      position: new THREE.Vector3(0.4, 1.2, 9.5),
      lookAt: new THREE.Vector3(0, 0, 0),
    };
    const demoFocus = {
      world: new THREE.Vector3(),
      lookAt: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      orbit: new THREE.Vector3(),
      position: new THREE.Vector3(),
    };
    const markUserCameraControl = () => {
      userCameraControlUntil = clock.getElapsedTime() + 8;
    };
    controls.addEventListener('start', markUserCameraControl);
    const animate = () => {
      const clockElapsed = clock.getElapsedTime();
      const rawFrameDelta = Math.max(0.001, clockElapsed - previousElapsed);
      const frameDelta = Math.min(rawFrameDelta, 0.05);
      previousElapsed = clockElapsed;
      fpsEstimate = THREE.MathUtils.lerp(fpsEstimate, 1 / rawFrameDelta, 0.06);
      const speed = settings.current.speed;
      const intensity = settings.current.intensity;
      const paused = settings.current.paused;
      const mode = settings.current.mode;
      if (!paused) {
        scene.userData.visualElapsed = (scene.userData.visualElapsed || 0) + frameDelta;
      }
      const elapsed = scene.userData.visualElapsed || 0;
      const delta = paused ? 0 : frameDelta;
      const profile = getProfile();
      const profileId = settings.current.profile;
      const resetSignal = settings.current.resetSignal;
      const captureSignal = settings.current.captureSignal;
      const memorySignal = settings.current.memorySignal;
      const cameraPresetSignal = settings.current.cameraPresetSignal;
      const density = settings.current.density;
      const demoMode = settings.current.demoMode;
      const birdMixTarget = mode === 'suanbird' ? 1 : mode === 'city' ? 0.04 : mode === 'network' ? 0 : mode === 'burst' ? 0.06 : 0;
      const burstMix = mode === 'burst' ? 1 : 0;
      const cityMix = mode === 'city' ? 1 : 0;
      const networkMix = mode === 'network' ? 1 : 0;
      const suanbirdMix = mode === 'suanbird' ? 1 : 0;
      const nebulaMix = mode === 'nebula' ? 1 : 0;
      const signature = SCENE_SIGNATURES[mode] || SCENE_SIGNATURES.nebula;
      const signatureTint = new THREE.Color(signature.tint);
      const signatureNetworkTint = new THREE.Color(signature.networkTint);
      const citySilence = signature.citySilence;
      const graphPresence = signature.graphPresence;
      const birdPresence = signature.birdPresence;
      const vortexPresence = signature.vortexPresence;
      const skylinePresence = signature.skylinePresence;
      const riverPresence = signature.riverPresence;
      if (mode !== lastMode) {
        lastMode = mode;
        modePulseState.strength = 1;
        modePulseState.time = elapsed;
        clickBurst.strength = Math.max(clickBurst.strength, 0.65);
        clickBurst.worldX = 0;
        clickBurst.worldY = 0;
        clickBurst.worldZ = 0;
        clickBurst.time = elapsed;
      }
      const pressureThreshold = profileId === 'extreme' ? 38 : profileId === 'high' ? 40 : 34;
      if (fpsEstimate < pressureThreshold) {
        adaptiveQuality = Math.max(0.72, adaptiveQuality - delta * 0.16);
        adaptiveDensity = Math.max(profileId === 'extreme' ? 0.58 : 0.66, adaptiveDensity - delta * 0.2);
      } else if (fpsEstimate > 53) {
        adaptiveQuality = Math.min(1, adaptiveQuality + delta * 0.08);
        adaptiveDensity = Math.min(1, adaptiveDensity + delta * 0.075);
      }
      const densityScale = THREE.MathUtils.clamp(density * adaptiveDensity, 0.34, 1);
      const activeParticles = Math.min(
        PARTICLE_COUNT,
        Math.floor(PARTICLE_COUNT * profile.particleRatio * densityScale * (1 + nebulaMix * 1.65)),
      );
      const sceneQuietScale = THREE.MathUtils.clamp(
        1 - cityMix * 0.22 - networkMix * 0.3 - burstMix * 0.24,
        0.46,
        1,
      );
      const readableParticleScale = THREE.MathUtils.clamp(
        1
          - birdMix * (1 - READABILITY_TUNING.birdParticleCountScale)
          - cityMix * (1 - READABILITY_TUNING.cityParticleCountScale)
          - networkMix * (1 - READABILITY_TUNING.graphParticleCountScale)
          - burstMix * (1 - READABILITY_TUNING.burstParticleCountScale),
        0.2,
        1,
      ) * sceneQuietScale;
      const activeNodes = Math.min(
        NETWORK_NODE_COUNT,
        Math.floor(NETWORK_NODE_COUNT * profile.networkRatio * densityScale * (1 + nebulaMix * 1.45)),
      );
      const activeEdges = Math.min(
        NETWORK_EDGE_COUNT,
        Math.floor(NETWORK_EDGE_COUNT * profile.networkRatio * densityScale * (1 + nebulaMix * 2.2)),
      );
      birdMix = THREE.MathUtils.damp(birdMix, birdMixTarget, 3.6, delta);
      nebula.points.material.uniforms.uModeScale.value = THREE.MathUtils.lerp(
        1 + networkMix * 0.12 + nebulaMix * 0.36,
        READABILITY_TUNING.birdParticleScale,
        birdMix,
      );
      nebula.points.geometry.setDrawRange(0, Math.floor(activeParticles * readableParticleScale));
      network.nodes.geometry.setDrawRange(0, activeNodes);
      network.edges.geometry.setDrawRange(0, activeEdges * 2);
      deepSpaceDust.geometry.setDrawRange(0, Math.floor(DEEP_SPACE_DUST_COUNT * THREE.MathUtils.clamp(densityScale * 0.92, 0.28, 1)));
      const birdFocusMix = suanbirdMix;
      const cityStructureMix = Math.max(cityMix * 1.58, networkMix * 1.28);
      const readabilityMix = Math.max(cityMix * 0.82, networkMix);
      bloom.strength = THREE.MathUtils.damp(
        bloom.strength,
        profile.bloom * (1 - cityStructureMix * 0.72 - birdFocusMix * 0.34 - nebulaMix * 0.56 - burstMix * 0.38),
        2.8,
        delta,
      );
      const nextPixelRatio = Math.min(window.devicePixelRatio, profile.dpr * adaptiveQuality);
      if (Math.abs(nextPixelRatio - currentPixelRatio) > 0.01) {
        currentPixelRatio = nextPixelRatio;
        renderer.setPixelRatio(currentPixelRatio);
        composer.setPixelRatio(currentPixelRatio);
      }
      deepSpaceDust.material.uniforms.uPixelRatio.value = currentPixelRatio;
      deepSpaceDust.material.uniforms.uOpacity.value = THREE.MathUtils.damp(
        deepSpaceDust.material.uniforms.uOpacity.value,
        (0.055 + nebulaMix * 0.07 + graphPresence * 0.028 + cityMix * 0.012) * (mode === 'suanbird' ? 0.48 : 1),
        3.2,
        frameDelta,
      );
      if (elapsed - lastStatsPublish > 0.5 && settings.current.setRenderStats) {
        lastStatsPublish = elapsed;
        settings.current.setRenderStats({
          fps: Math.min(99, fpsEstimate),
          quality: adaptiveQuality * adaptiveDensity,
          density: adaptiveDensity,
        });
      }

      if (resetSignal !== controls.userData?.resetSignal) {
        controls.userData.resetSignal = resetSignal;
        cameraPresetState.active = false;
        camera.position.set(0.4, 1.2, 9.5);
        controls.target.set(0, 0, 0);
        controls.update();
      }

      if (cameraPresetSignal && cameraPresetSignal.stamp !== lastCameraPresetStamp) {
        lastCameraPresetStamp = cameraPresetSignal.stamp;
        const nextPreset = CAMERA_PRESETS.find((item) => item.id === cameraPresetSignal.id);
        if (nextPreset) {
          cameraPresetState.active = true;
          cameraPresetState.startedAt = clockElapsed;
          cameraPresetState.fromPosition.copy(camera.position);
          cameraPresetState.fromTarget.copy(controls.target);
          cameraPresetState.toPosition.fromArray(nextPreset.position);
          cameraPresetState.toTarget.fromArray(nextPreset.target);
          userCameraControlUntil = clockElapsed + cameraPresetState.duration + 0.8;
        }
      }

      if (captureSignal !== lastCaptureSignal) {
        lastCaptureSignal = captureSignal;
        pendingCapture = true;
      }

      if (memorySignal && memorySignal.stamp !== lastMemorySignalStamp) {
        lastMemorySignalStamp = memorySignal.stamp;
        if (!memorySignal.name) {
          lockedHotspot = null;
          publishHotspot(hoveredHotspot, false);
        } else {
          const targetHotspot = hotspotMarkers.find((object) => object.userData.name === memorySignal.name);
          if (targetHotspot) {
            lockHotspot(targetHotspot, elapsed, memorySignal.source === 'demo' ? 0.72 : 1);
          }
        }
      }

      if (cameraPresetState.active) {
        const progress = THREE.MathUtils.clamp((clockElapsed - cameraPresetState.startedAt) / cameraPresetState.duration, 0, 1);
        const eased = 1 - (1 - progress) ** 3;
        camera.position.lerpVectors(cameraPresetState.fromPosition, cameraPresetState.toPosition, eased);
        controls.target.lerpVectors(cameraPresetState.fromTarget, cameraPresetState.toTarget, eased);
        if (progress >= 1) cameraPresetState.active = false;
      } else if (demoMode && !paused && clockElapsed > userCameraControlUntil) {
        const demoAngle = elapsed * 0.09;
        const modeDistance = mode === 'suanbird' ? 6.35 : mode === 'network' ? 11.05 : mode === 'city' ? 8.35 : mode === 'burst' ? 11.4 : 10.85;
        const modeHeight = mode === 'suanbird' ? 0.72 : mode === 'network' ? 1.55 : mode === 'city' ? 0.82 : mode === 'burst' ? 1.28 : 1.08;
        const sideBias = mode === 'city' ? -0.72 : mode === 'suanbird' ? 0.34 : 0;
        demoFocus.orbit.set(
          Math.cos(demoAngle + sideBias),
          0,
          Math.sin(demoAngle + sideBias),
        ).normalize();
        demoCameraTarget.lookAt.set(
          mode === 'suanbird' ? 0.34 : 0,
          mode === 'city' ? -0.08 : mode === 'suanbird' ? 0.18 : 0,
          0,
        );
        demoCameraTarget.position.copy(demoFocus.orbit).multiplyScalar(modeDistance);
        demoCameraTarget.position.y = modeHeight + Math.sin(elapsed * 0.24) * 0.22;

        if (lockedHotspot) {
          lockedHotspot.getWorldPosition(demoFocus.world);
          const focusStrength = mode === 'city' ? 0.72 : mode === 'network' ? 0.58 : mode === 'suanbird' ? 0.3 : 0.42;
          demoFocus.lookAt.copy(demoFocus.world).multiplyScalar(mode === 'suanbird' ? 0.28 : 0.58);
          demoFocus.lookAt.y += mode === 'suanbird' ? 0.08 : 0.02;
          demoCameraTarget.lookAt.lerp(demoFocus.lookAt, focusStrength);

          demoFocus.direction.copy(demoFocus.world);
          demoFocus.direction.y *= 0.35;
          if (demoFocus.direction.lengthSq() > 0.001) {
            demoFocus.direction.normalize();
            demoFocus.orbit.lerp(demoFocus.direction, focusStrength * 0.74).normalize();
          }
          const focusDistance = modeDistance - focusStrength * (mode === 'city' ? 1.6 : 0.95);
          demoFocus.position
            .copy(demoCameraTarget.lookAt)
            .addScaledVector(demoFocus.orbit, focusDistance);
          demoFocus.position.y += modeHeight + demoFocus.world.y * focusStrength * 0.36;
          demoCameraTarget.position.lerp(demoFocus.position, focusStrength);
        }

        camera.position.lerp(demoCameraTarget.position, 0.026);
        controls.target.lerp(demoCameraTarget.lookAt, 0.046);
      }

      compositionTurn = THREE.MathUtils.damp(compositionTurn, birdMix * -0.28 + signature.rotationBias, 2.4, delta);
      root.rotation.y = elapsed * 0.025 * speed + compositionTurn;
      root.rotation.x = Math.sin(elapsed * 0.12) * 0.04 + birdMix * -0.05 + signature.verticalBias * 0.12;
      deepSpaceDust.rotation.y = -root.rotation.y * 0.18 + elapsed * 0.0025 * speed;
      deepSpaceDust.rotation.x = Math.sin(elapsed * 0.05) * 0.018;
      const burstAge = elapsed - clickBurst.time;
      const burstWave = clickBurst.strength * Math.max(0, 1 - burstAge * 0.72);
      const modePulseAge = elapsed - modePulseState.time;
      const modePulseWave = modePulseState.strength * Math.max(0, 1 - modePulseAge * 0.85);
      const totalWave = Math.max(burstWave, modePulseWave * 0.75);
      const clickWorld = new THREE.Vector3(clickBurst.worldX, clickBurst.worldY, clickBurst.worldZ);
      clickBurst.strength = burstWave;
      const burstVisibility = THREE.MathUtils.clamp(1 - nebulaMix * 0.98 - birdMix * 1.36 - cityMix * 1.04 - networkMix * 1.02 - suanbirdMix * 0.28 + burstMix * 0.32, 0.004, 0.46);
      burst.scale.setScalar((1 + Math.sin(elapsed * 1.8) * 0.035) * (0.66 + burstVisibility * 0.3));
      burst.visible = birdMix < 0.72;
      burst.children.forEach((object) => {
        if (object.material) {
          const baseOpacity = object.type === 'LineSegments' ? 0.3 : 0.34;
          object.material.opacity = baseOpacity * burstVisibility;
        }
      });
      const relationRayTarget = THREE.MathUtils.clamp(
        0.02 + nebulaMix * 0.12 + networkMix * 0.08 + vortexPresence * 0.015 + totalWave * 0.05,
        0,
        0.24,
      ) * (mode === 'suanbird' ? 0.22 : 1);
      centralRelationRays.userData.opacity = THREE.MathUtils.damp(centralRelationRays.userData.opacity || 0, relationRayTarget, 4.6, frameDelta);
      centralRelationRays.visible = centralRelationRays.userData.opacity > 0.012;
      if (centralRelationRays.visible) {
        centralRelationRays.rotation.y = -root.rotation.y * 0.24 + elapsed * 0.006 * speed;
        centralRelationRays.rotation.x = Math.sin(elapsed * 0.11) * 0.025;
        centralRelationRays.material.uniforms.uTime.value = elapsed * speed;
        centralRelationRays.material.uniforms.uOpacity.value = centralRelationRays.userData.opacity * (0.02 + nebulaMix * 0.028 + networkMix * 0.018 + vortexPresence * 0.01);
        centralRelationRays.material.uniforms.uPulse.value = Math.max(totalWave * 0.72, vortexPresence * 0.22);
        centralRelationRays.geometry.setDrawRange(0, Math.floor(CENTRAL_RELATION_RAY_COUNT * 2 * THREE.MathUtils.clamp(densityScale * 0.9, 0.32, 1)));
      }
      const veilTarget = THREE.MathUtils.clamp((nebulaMix * 0.9 + networkMix * 0.18) * densityScale * 1.18, 0, 1);
      graphNebulaVeil.userData.opacity = THREE.MathUtils.damp(graphNebulaVeil.userData.opacity || 0, veilTarget, 4.6, frameDelta);
      graphNebulaVeil.visible = graphNebulaVeil.userData.opacity > 0.01;
      if (graphNebulaVeil.visible) {
        graphNebulaVeil.rotation.y = -root.rotation.y * 0.18 + elapsed * 0.012 * speed;
        graphNebulaVeil.rotation.x = Math.sin(elapsed * 0.12) * 0.025;
        graphNebulaVeil.children.forEach((object) => {
          if (object.material) {
            const baseOpacity = object.userData.baseOpacity || 0.2;
            object.material.opacity = baseOpacity
              * graphNebulaVeil.userData.opacity
              * (0.82 + Math.sin(elapsed * 0.72 + object.id) * 0.18);
          }
          if (object.name === 'graphpu-nebula-veil-nodes') {
            object.material.size = 0.055 + graphNebulaVeil.userData.opacity * 0.045;
          }
        });
      }
      const computeWaveTarget = THREE.MathUtils.clamp(
        networkMix * 0.76 + cityMix * 0.03 + vortexPresence * 0.08 + totalWave * 0.14 + (lockedHotspot ? 0.16 : 0),
        0,
        1,
      ) * (mode === 'suanbird' ? 0.22 : 1);
      graphComputeWavefronts.userData.opacity = THREE.MathUtils.damp(graphComputeWavefronts.userData.opacity || 0, computeWaveTarget, 4.2, frameDelta);
      graphComputeWavefronts.visible = graphComputeWavefronts.userData.opacity > 0.012;
      if (graphComputeWavefronts.visible) {
        graphComputeWavefronts.rotation.y = -root.rotation.y * 0.18 + elapsed * 0.018 * speed;
        graphComputeWavefronts.children.forEach((wave, index) => {
          if (!wave.material) return;
          const phase = wave.userData.phase + elapsed * (0.84 + index * 0.08) * speed;
          const travel = (Math.sin(phase) + 1) * 0.5;
          const pulse = Math.sin(phase * 1.7 + index) * 0.5 + 0.5;
          const scale = 0.72 + travel * 0.42 + totalWave * 0.08;
          wave.scale.x = scale;
          wave.scale.z = scale;
          wave.scale.y = (0.58 + (index % 3) * 0.11) * (1 + pulse * 0.035);
          wave.rotation.z += wave.userData.spin * speed;
          wave.material.opacity = wave.userData.baseOpacity
            * graphComputeWavefronts.userData.opacity
            * (0.42 + pulse * 0.58)
            * densityScale;
        });
      }
      yangtze.rotation.z = Math.sin(elapsed * 0.18) * 0.025;
      hanshui.rotation.z = -Math.sin(elapsed * 0.16) * 0.03;
      yangtze.material.opacity = (0.04 + riverPresence * 0.56 + Math.sin(elapsed * 1.2) * 0.035) * (1 - birdMix * 0.58) * (1 - nebulaMix * 0.92);
      hanshui.material.opacity = (0.03 + riverPresence * 0.42 + Math.sin(elapsed * 1.1 + 1) * 0.025) * (1 - birdMix * 0.56) * (1 - nebulaMix * 0.92);
      const confluenceMix = cityMix + networkMix * 0.18 + vortexPresence * 0.28;
      riverConfluence.visible = confluenceMix > 0.02 || birdMix < 0.08;
      riverConfluence.rotation.z = Math.sin(elapsed * 0.22) * 0.05;
      riverConfluence.scale.setScalar(0.92 + confluenceMix * 0.18 + Math.sin(elapsed * 1.2) * 0.025);
      riverConfluence.children.forEach((object, index) => {
        if (object.material) {
          const baseOpacity = object.userData.baseOpacity ?? 0.14;
          object.material.opacity = baseOpacity
            * (0.12 + confluenceMix * 1.28)
            * (0.78 + Math.sin(elapsed * 1.4 + index) * 0.22)
            * (1 - birdMix * 0.5);
        }
      });
      const riverFlowOpacity = THREE.MathUtils.clamp(riverPresence * 0.9 + networkMix * 0.06 + vortexPresence * 0.08, 0, 1) * (1 - birdMix * 0.68) * (1 - nebulaMix * 0.92);
      riverFlowPackets.userData.opacity = THREE.MathUtils.damp(riverFlowPackets.userData.opacity || 0, riverFlowOpacity, 5.8, frameDelta);
      riverFlowPackets.visible = riverFlowPackets.userData.opacity > 0.01;
      if (riverFlowPackets.visible) {
        const packets = riverFlowPackets.userData.packets;
        const positions = packets.geometry.attributes.position.array;
        const seeds = packets.geometry.attributes.riverSeed.array;
        for (let i = 0; i < RIVER_FLOW_PACKET_COUNT; i += 1) {
          const isYangtze = i % 3 !== 0;
          const seed = seeds[i];
          const t = (elapsed * (isYangtze ? 0.055 : 0.038) * speed + seed) % 1;
          const width = isYangtze ? 8.8 : 6.2;
          const yOffset = isYangtze ? -0.68 : 0.2;
          const zOffset = isYangtze ? 0.1 : -0.58;
          const wavePhase = isYangtze ? 0.2 : 1.3;
          const zPhase = isYangtze ? 0.4 : 1.5;
          const x = (t - 0.5) * width;
          const y = Math.sin(t * Math.PI * 2.2 + wavePhase) * 0.46 + yOffset;
          const z = Math.cos(t * Math.PI * 1.55 + zPhase) * 0.76 + zOffset;
          const side = Math.sin(elapsed * 1.2 + i) * (isYangtze ? 0.08 : 0.05);
          positions[i * 3] = x + side;
          positions[i * 3 + 1] = y + Math.sin(t * Math.PI) * 0.05;
          positions[i * 3 + 2] = z + Math.cos(elapsed * 0.9 + i) * 0.035;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity * riverFlowPackets.userData.opacity;
        packets.material.size = 0.045 + riverFlowPackets.userData.opacity * 0.036;
      }
      const landmarkPulseOpacity = THREE.MathUtils.clamp(skylinePresence * 0.84 + networkMix * 0.08, 0, 1) * (1 - birdMix * 0.78) * (1 - nebulaMix * 0.92);
      landmarkPulsePackets.userData.opacity = THREE.MathUtils.damp(landmarkPulsePackets.userData.opacity || 0, landmarkPulseOpacity, 5.2, frameDelta);
      landmarkPulsePackets.visible = landmarkPulsePackets.userData.opacity > 0.01;
      if (landmarkPulsePackets.visible) {
        const packets = landmarkPulsePackets.userData.packets;
        const positions = packets.geometry.attributes.position.array;
        const seeds = packets.geometry.attributes.landmarkSeed.array;
        for (let i = 0; i < LANDMARK_PULSE_COUNT; i += 1) {
          const seed = seeds[i];
          if (i % 2 === 0) {
            const t = (seed + elapsed * 0.026 * speed) % 1;
            const x = -3.65 + t * 7.3;
            const deckY = -1.52 + Math.sin(t * 71 * 0.28) * 0.035;
            const towerPulse = Math.sin(t * Math.PI * 2);
            positions[i * 3] = x;
            positions[i * 3 + 1] = deckY + 0.16 + Math.abs(towerPulse) * 0.18;
            positions[i * 3 + 2] = -1.82 + Math.sin(elapsed + i) * 0.035;
          } else {
            const floor = Math.floor(seed * 5);
            const floorYs = [0, 0.28, 0.58, 0.88, 1.16];
            const widths = [0.78, 0.62, 0.48, 0.34, 0.16];
            const local = (seed * 5) % 1;
            const width = widths[floor] || 0.22;
            const x = 2.5 + (local - 0.5) * width * 1.8;
            const y = -0.2 + (floorYs[floor] || 0.9) + Math.sin(elapsed * 1.5 + i) * 0.045;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = -2.4 + Math.cos(elapsed + i) * 0.04;
          }
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * landmarkPulsePackets.userData.opacity
          * (0.76 + Math.sin(elapsed * 2.1) * 0.24);
        packets.material.size = 0.042 + landmarkPulsePackets.userData.opacity * 0.032;
      }
      const townTopologyTarget = THREE.MathUtils.clamp(skylinePresence * 0.68 + networkMix * 0.18 + vortexPresence * 0.08 + totalWave * 0.1, 0, 1)
        * (1 - nebulaMix * 0.92)
        * (1 - birdMix * 0.68);
      wuhanTownTopology.userData.opacity = THREE.MathUtils.damp(wuhanTownTopology.userData.opacity || 0, townTopologyTarget, 5.4, frameDelta);
      wuhanTownTopology.visible = wuhanTownTopology.userData.opacity > 0.012;
      if (wuhanTownTopology.visible) {
        wuhanTownTopology.rotation.y = Math.sin(elapsed * 0.13) * 0.035;
        wuhanTownTopology.children.forEach((object, index) => {
          if (!object.material && object.name !== 'wuhan-town-field') return;
          if (object.name === 'wuhan-town-field') {
            object.rotation.z = Math.sin(elapsed * 0.16 + object.userData.phase) * 0.08;
            object.scale.setScalar(1 + wuhanTownTopology.userData.opacity * 0.08 + Math.sin(elapsed * 1.5 + object.userData.phase) * 0.035);
            object.children.forEach((child, childIndex) => {
              if (!child.material) return;
              child.material.opacity = child.userData.baseOpacity
                * wuhanTownTopology.userData.opacity
                * (0.66 + Math.sin(elapsed * 2.1 + object.userData.phase + childIndex) * 0.34);
              if (child.name === 'wuhan-town-ring') child.rotation.z = elapsed * (0.035 + childIndex * 0.02);
              if (child.name === 'wuhan-town-core') {
                child.scale.setScalar(1 + Math.sin(elapsed * 2.3 + object.userData.phase) * 0.18);
              }
            });
          } else if (object.name === 'wuhan-town-link') {
            object.material.opacity = object.userData.baseOpacity
              * wuhanTownTopology.userData.opacity
              * (0.7 + Math.sin(elapsed * 1.8 + object.userData.phase) * 0.3);
            object.scale.setScalar(1 + Math.sin(elapsed * 1.2 + object.userData.phase) * 0.018);
          }
        });
        const packets = wuhanTownTopology.userData.packets;
        const packetPositions = packets.geometry.attributes.position.array;
        const packetSeeds = packets.geometry.attributes.townSeed.array;
        const links = wuhanTownTopology.children.filter((object) => object.name === 'wuhan-town-link');
        const packetCount = Math.floor(WUHAN_TOWN_PACKET_COUNT * THREE.MathUtils.clamp(densityScale * 1.05, 0.28, 1));
        packets.geometry.setDrawRange(0, packetCount);
        for (let i = 0; i < packetCount; i += 1) {
          const seed = packetSeeds[i];
          const link = links[i % Math.max(1, links.length)];
          const points = link?.userData.points || [new THREE.Vector3()];
          const stream = (seed + elapsed * (0.105 + (i % 7) * 0.009) * speed) % 1;
          const pointIndex = Math.min(points.length - 1, Math.floor(stream * (points.length - 1)));
          const p = points[pointIndex];
          const pulse = Math.sin(stream * Math.PI);
          packetPositions[i * 3] = p.x + Math.sin(elapsed * 1.3 + i) * 0.04 * pulse;
          packetPositions[i * 3 + 1] = p.y + Math.cos(elapsed * 1.1 + i) * 0.035 * pulse;
          packetPositions[i * 3 + 2] = p.z + Math.sin(elapsed * 1.5 + i) * 0.04 * pulse;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * wuhanTownTopology.userData.opacity
          * (0.7 + networkMix * 0.18 + cityMix * 0.12);
        packets.material.size = 0.04 + wuhanTownTopology.userData.opacity * 0.03;
      }
      const motifTarget = THREE.MathUtils.clamp(
        skylinePresence * 1.18 + networkMix * 0.92 + vortexPresence * 1.12,
        0,
        1,
      ) * (1 - suanbirdMix * 0.92) * (1 - nebulaMix * 0.84);
      referenceSceneMotifs.userData.opacity = THREE.MathUtils.damp(referenceSceneMotifs.userData.opacity || 0, motifTarget, 5.8, frameDelta);
      referenceSceneMotifs.visible = referenceSceneMotifs.userData.opacity > 0.01;
      if (referenceSceneMotifs.visible) {
        referenceSceneMotifs.rotation.y = -root.rotation.y * 0.2 + cityMix * -0.12 + networkMix * 0.1;
        referenceSceneMotifs.rotation.x = cityMix * 0.02 + vortexPresence * -0.02;
        referenceSceneMotifs.children.forEach((object, index) => {
          if (!object.material) return;
          const name = object.name || '';
          let sceneWeight = 0;
          if (name.startsWith('motif-lake') || name === 'motif-lake-pavilion' || name === 'motif-lake-reflection') {
            sceneWeight = cityMix * 1.15 + (cameraPresetSignal?.id === 'confluence' ? 0.34 : 0);
          } else if (name === 'motif-neon-skyline' || name === 'motif-gold-road-flow') {
            sceneWeight = networkMix * 1.28 + cityMix * 0.34;
          } else if (name === 'motif-hero-bridge') {
            sceneWeight = (cameraPresetSignal?.id === 'towns' ? 1.1 : cityMix * 0.44) + networkMix * 0.22;
          } else if (name === 'motif-birth-monument' || name === 'motif-birth-ring') {
            sceneWeight = vortexPresence * 1.25;
          }
          const motifBoost = name === 'motif-lake-pavilion'
            || name === 'motif-hero-bridge'
            || name === 'motif-birth-monument'
            || name === 'motif-neon-skyline'
            ? 3.35
            : name === 'motif-lake-reflection' || name === 'motif-gold-road-flow'
              ? 2.25
              : 1.65;
          const shimmer = 0.82 + Math.sin(elapsed * (0.72 + index * 0.015) + (object.userData.phase || 0)) * 0.18;
          object.material.opacity = object.userData.baseOpacity
            * referenceSceneMotifs.userData.opacity
            * THREE.MathUtils.clamp(sceneWeight, 0, 1.25)
            * motifBoost
            * shimmer;
          if (name === 'motif-lake-ripple') {
            object.scale.setScalar(1 + Math.sin(elapsed * 0.72 + object.userData.phase) * 0.018);
          }
          if (name === 'motif-neon-skyline') {
            object.scale.set(1.08, 1.22, 1);
          }
          if (name === 'motif-hero-bridge') {
            object.scale.set(1.12, 1.18, 1);
          }
          if (name === 'motif-birth-monument') {
            object.scale.set(1.28, 1.34, 1.08);
          }
          if (name === 'motif-birth-ring') {
            object.rotation.z += delta * speed * (0.18 + index * 0.015);
            object.scale.setScalar(1 + vortexPresence * 0.08 + Math.sin(elapsed * 1.4 + index) * 0.02);
          }
        });
      }
      cityMarks.traverse((object) => {
        if (object.material) {
          const memoryMix = cityMix + networkMix * 0.26 + vortexPresence * 0.12;
          if (object.name === 'memory-hotspot-hitarea') {
            object.material.opacity = 0;
          } else if (object.name === 'memory-hotspot-marker') {
            const isHovered = hoveredHotspot?.userData.name === object.userData.name;
            const isLocked = lockedHotspot?.userData.name === object.userData.name;
            object.material.opacity = (0.04 + memoryMix * 0.36 + (isHovered ? 0.18 : 0) + (isLocked ? 0.28 : 0)) * (1 - citySilence * 0.82);
            object.scale.setScalar(1 + memoryMix * 0.48 + (isHovered ? 0.52 : 0) + (isLocked ? 0.92 : 0) + Math.sin(elapsed * 1.8 + object.userData.phase) * 0.16);
          } else if (object.name === 'memory-hotspot-ring' || object.name === 'memory-hotspot-spoke') {
            const isHovered = hoveredHotspot?.userData.name === object.userData.name;
            const isLocked = lockedHotspot?.userData.name === object.userData.name;
            const focusBoost = isLocked ? 3.2 : isHovered ? 1.85 : 1;
            object.material.opacity = (0.014 + memoryMix * 0.14) * focusBoost * (1 - citySilence * 0.76) * (0.78 + Math.sin(elapsed * 1.4 + object.userData.phase) * 0.22);
            if (object.name === 'memory-hotspot-ring') object.rotation.z = elapsed * 0.08 + object.userData.phase;
          } else if (object.name === 'memory-focus-link') {
            const focusName = lockedHotspot?.userData.name || hoveredHotspot?.userData.name;
            const isLinked = focusName && (object.userData.from === focusName || object.userData.to === focusName);
            const lockBoost = lockedHotspot ? 1.25 : 0.72;
            object.material.opacity = object.userData.baseOpacity
              * memoryMix
              * (isLinked ? lockBoost : 0)
              * (0.76 + Math.sin(elapsed * 1.5 + object.userData.phase) * 0.24);
          } else if (object.name === 'memory-link-lines') {
            object.material.opacity = object.userData.baseOpacity
              * (0.22 + skylinePresence * 1.9 + networkMix * 0.72 + vortexPresence * 0.48)
              * (1 - birdMix * 0.68)
              * (1 - nebulaMix * 0.92)
              * (0.82 + Math.sin(elapsed * 0.9) * 0.18);
          } else if (object.name === 'yangtze-bridge-glyph') {
            object.material.opacity = object.userData.baseOpacity
              * (0.18 + skylinePresence * 3.22 + networkMix * 0.22)
              * (1 - birdMix * 0.74)
              * (1 - nebulaMix * 0.92)
              * (0.86 + Math.sin(elapsed * 1.05) * 0.14);
          } else if (object.name === 'yellow-crane-tower-glyph') {
            object.material.opacity = object.userData.baseOpacity
              * (0.2 + skylinePresence * 3.36 + networkMix * 0.16)
              * (1 - birdMix * 0.78)
              * (1 - nebulaMix * 0.92)
              * (0.86 + Math.sin(elapsed * 0.95 + 0.8) * 0.14);
          } else {
            object.material.opacity = (0.05 + skylinePresence * 0.32 + networkMix * 0.04 + vortexPresence * 0.08) * (1 - birdMix * 0.72) * (1 - nebulaMix * 0.9);
          }
          if (object.name === 'city-nodes') object.material.size = 0.034 + skylinePresence * 0.034 + networkMix * 0.01;
          if (object.name === 'sakura-drift') object.rotation.y = elapsed * 0.035;
          if (object.name === 'ember-sparks') {
            object.rotation.y = Math.sin(elapsed * 0.18) * 0.18;
            object.rotation.z = Math.sin(elapsed * 0.12) * 0.05;
            object.material.size = 0.02 + skylinePresence * 0.012 + vortexPresence * 0.02;
            object.material.opacity = (0.04 + skylinePresence * 0.2 + networkMix * 0.035 + vortexPresence * 0.22) * (1 - birdMix * 0.48);
          }
        }
      });
      flowTrails.children.forEach((line, index) => {
        if (!paused) line.rotation.y += line.userData.spin * speed;
        line.position.y = Math.sin(elapsed * 0.34 + line.userData.phase) * line.userData.lift;
        line.material.opacity = line.userData.baseOpacity
          * (0.16 + graphPresence * 0.86 + skylinePresence * 0.26 + birdPresence * 0.16 + vortexPresence * 0.28)
          * (1 - nebulaMix * 0.9)
          * (0.78 + Math.sin(elapsed * 0.82 + index) * 0.22);
      });
      const birthVortexTarget = THREE.MathUtils.clamp(
        0.08 + skylinePresence * 0.26 + graphPresence * 0.12 + birdPresence * 0.16 + vortexPresence * 0.68,
        0,
        0.58,
      ) * (1 - nebulaMix * 0.96);
      birthVortex.userData.opacity = THREE.MathUtils.damp(birthVortex.userData.opacity || 0, birthVortexTarget, 4.8, frameDelta);
      birthVortex.visible = birthVortex.userData.opacity > 0.015;
      if (birthVortex.visible) {
        birthVortex.rotation.y += delta * speed * (0.018 + vortexPresence * 0.048);
        birthVortex.rotation.x = Math.sin(elapsed * 0.18) * 0.035;
        birthVortex.children.forEach((object, index) => {
          if (!object.material) return;
          if (object.name === 'city-birth-vortex-line') {
            if (!paused) object.rotation.y += object.userData.spin * speed;
            object.material.opacity = object.userData.baseOpacity
              * birthVortex.userData.opacity
              * (0.72 + Math.sin(elapsed * 1.25 + object.userData.phase + index) * 0.28);
          }
        });
        const packets = birthVortex.userData.packets;
        const packetPositions = packets.geometry.attributes.position.array;
        const packetSeeds = packets.geometry.attributes.birthSeed.array;
        for (let i = 0; i < BIRTH_VORTEX_PACKET_COUNT; i += 1) {
          const seed = packetSeeds[i];
          const stream = (seed + elapsed * (0.075 + (i % 5) * 0.008) * speed) % 1;
          const inward = 1 - stream;
          const radius = THREE.MathUtils.lerp(4.9 + (i % 9) * 0.12, 0.18, stream);
          const angle = seed * Math.PI * 8 + stream * Math.PI * (2.2 + (i % 7) * 0.11) + elapsed * 0.12;
          const pulse = Math.sin(stream * Math.PI);
          packetPositions[i * 3] = Math.cos(angle) * radius + Math.sin(elapsed + i) * 0.025 * pulse;
          packetPositions[i * 3 + 1] = Math.sin(seed * Math.PI * 2) * inward * 0.9 + Math.sin(stream * Math.PI * 3 + elapsed) * 0.1 * pulse;
          packetPositions[i * 3 + 2] = Math.sin(angle) * radius * 0.74 + Math.cos(elapsed * 0.9 + i) * 0.025 * pulse;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * birthVortex.userData.opacity
          * (0.42 + vortexPresence * 0.18 + birdPresence * 0.08);
        packets.material.size = 0.04 + birthVortex.userData.opacity * 0.026 + vortexPresence * 0.006;
      }
      const codeRainTarget = THREE.MathUtils.clamp(
        skylinePresence * 0.42 + networkMix * 0.66 + birdPresence * 0.05 + vortexPresence * 0.24 + (lockedHotspot ? 0.22 : 0),
        0,
        1,
      ) * (1 - nebulaMix * 0.95);
      cityMemoryCodeRain.userData.opacity = THREE.MathUtils.damp(cityMemoryCodeRain.userData.opacity || 0, codeRainTarget, 5.6, frameDelta);
      cityMemoryCodeRain.visible = cityMemoryCodeRain.userData.opacity > 0.012;
      if (cityMemoryCodeRain.visible) {
        const packets = cityMemoryCodeRain.userData.packets;
        const codePositions = packets.geometry.attributes.position.array;
        const codeSeeds = packets.geometry.attributes.codeSeed.array;
        const codeSources = packets.geometry.attributes.codeSource.array;
        const hotspotPositions = cityMemoryCodeRain.userData.hotspotPositions;
        const maxCodeCount = Math.floor(CITY_MEMORY_CODE_COUNT * THREE.MathUtils.clamp(densityScale * (0.54 + cityMemoryCodeRain.userData.opacity * 0.46), 0.24, 1));
        packets.geometry.setDrawRange(0, maxCodeCount);
        for (let i = 0; i < maxCodeCount; i += 1) {
          const seed = codeSeeds[i];
          const source = hotspotPositions[codeSources[i] % hotspotPositions.length];
          const stream = (seed + elapsed * (0.095 + (i % 7) * 0.006) * speed) % 1;
          const inward = 1 - stream;
          const bendPhase = seed * Math.PI * 2 + elapsed * 0.5;
          const lateral = new THREE.Vector3(-source.z, 0.32 + Math.sin(seed * 7) * 0.08, source.x).normalize();
          const p = source.clone().multiplyScalar(inward);
          const arc = Math.sin(stream * Math.PI);
          p.y += arc * (0.26 + (i % 5) * 0.025) + Math.sin(bendPhase + stream * 4) * 0.045;
          p.addScaledVector(lateral, Math.sin(stream * Math.PI * 2 + bendPhase) * arc * 0.16);
          p.z += Math.cos(bendPhase + stream * 3) * arc * 0.055;
          codePositions[i * 3] = p.x;
          codePositions[i * 3 + 1] = p.y;
          codePositions[i * 3 + 2] = p.z;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * cityMemoryCodeRain.userData.opacity
          * (0.5 + graphPresence * 0.18 + vortexPresence * 0.12);
        packets.material.size = 0.034 + cityMemoryCodeRain.userData.opacity * 0.032;
      } else {
        cityMemoryCodeRain.userData.packets.geometry.setDrawRange(0, 0);
      }
      const orbitFieldTarget = THREE.MathUtils.clamp(
        skylinePresence * 0.36 + networkMix * 0.64 + birdPresence * 0.06 + vortexPresence * 0.18 + (lockedHotspot ? 0.18 : 0),
        0,
        1,
      ) * (1 - suanbirdMix * 0.24) * (1 - nebulaMix * 0.95);
      wuhanMemoryOrbitField.userData.opacity = THREE.MathUtils.damp(wuhanMemoryOrbitField.userData.opacity || 0, orbitFieldTarget, 5.1, frameDelta);
      wuhanMemoryOrbitField.visible = wuhanMemoryOrbitField.userData.opacity > 0.012;
      if (wuhanMemoryOrbitField.visible) {
        wuhanMemoryOrbitField.rotation.y = -root.rotation.y * 0.18 + Math.sin(elapsed * 0.11) * 0.035;
        wuhanMemoryOrbitField.rotation.x = Math.sin(elapsed * 0.09) * 0.026;
        wuhanMemoryOrbitField.children.forEach((object, index) => {
          if (!object.material) return;
          if (object.name === 'wuhan-memory-orbit-ring') {
            if (!paused) object.rotation.y += object.userData.spin * speed;
            object.material.opacity = object.userData.baseOpacity
              * wuhanMemoryOrbitField.userData.opacity
              * (0.72 + Math.sin(elapsed * 1.25 + object.userData.phase + index) * 0.28);
            object.scale.setScalar(1 + Math.sin(elapsed * 0.9 + object.userData.phase) * 0.018);
          } else if (object.name === 'wuhan-memory-orbit-chords') {
            object.material.opacity = object.userData.baseOpacity
              * wuhanMemoryOrbitField.userData.opacity
              * (0.64 + networkMix * 0.46 + cityMix * 0.24 + Math.sin(elapsed * 0.82) * 0.12);
          }
        });
        const packets = wuhanMemoryOrbitField.userData.packets;
        const orbitPositions = packets.geometry.attributes.position.array;
        const orbitSeeds = packets.geometry.attributes.orbitSeed.array;
        const orbitSources = packets.geometry.attributes.orbitSource.array;
        const hotspotPositions = wuhanMemoryOrbitField.userData.hotspotPositions;
        const orbitPacketCount = Math.floor(WUHAN_MEMORY_ORBIT_PACKET_COUNT * THREE.MathUtils.clamp(densityScale * (0.46 + wuhanMemoryOrbitField.userData.opacity * 0.54), 0.22, 1));
        packets.geometry.setDrawRange(0, orbitPacketCount);
        for (let i = 0; i < orbitPacketCount; i += 1) {
          const seed = orbitSeeds[i];
          const source = hotspotPositions[orbitSources[i] % hotspotPositions.length];
          const stream = (seed + elapsed * (0.072 + (i % 9) * 0.005) * speed) % 1;
          const orbitRadius = 2.08 + (i % 4) * 0.62;
          const angle = stream * Math.PI * 2 + seed * Math.PI * 4 + elapsed * 0.045;
          const orbitPoint = new THREE.Vector3(
            Math.cos(angle) * orbitRadius,
            -0.18 + Math.sin(angle * 2 + seed * 8) * 0.16,
            Math.sin(angle) * orbitRadius * (0.58 + (i % 4) * 0.055),
          );
          const sourceBlend = 0.2 + Math.sin(stream * Math.PI) * 0.34;
          const p = orbitPoint.lerp(source, sourceBlend);
          const towardCore = Math.sin(stream * Math.PI * 2 + elapsed * 0.42) * 0.045;
          p.multiplyScalar(1 - Math.max(0, towardCore));
          p.y += Math.sin(elapsed * 1.2 + i) * 0.035;
          orbitPositions[i * 3] = p.x;
          orbitPositions[i * 3 + 1] = p.y;
          orbitPositions[i * 3 + 2] = p.z;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * wuhanMemoryOrbitField.userData.opacity
          * (0.58 + networkMix * 0.22 + cityMix * 0.14 + burstMix * 0.16);
        packets.material.size = 0.034 + wuhanMemoryOrbitField.userData.opacity * 0.034;
      } else {
        wuhanMemoryOrbitField.userData.packets.geometry.setDrawRange(0, 0);
      }
      const focusHotspot = lockedHotspot || hoveredHotspot;
      const focusTargetOpacity = focusHotspot ? cityMix * 0.9 + networkMix * 0.42 + 0.12 : 0;
      memoryFocusBeam.userData.opacity = THREE.MathUtils.damp(memoryFocusBeam.userData.opacity || 0, focusTargetOpacity, 7, frameDelta);
      memoryFocusBeam.visible = memoryFocusBeam.userData.opacity > 0.01;
      if (memoryFocusBeam.visible && focusHotspot) {
        const target = focusHotspot.getWorldPosition(memoryFocusBeam.userData.target);
        const beamLine = memoryFocusBeam.userData.beam;
        const positions = beamLine.geometry.attributes.position.array;
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0.08;
        positions[3] = target.x;
        positions[4] = target.y;
        positions[5] = target.z;
        beamLine.geometry.attributes.position.needsUpdate = true;
        beamLine.material.opacity = beamLine.userData.baseOpacity
          * memoryFocusBeam.userData.opacity
          * (0.72 + Math.sin(elapsed * 2.4) * 0.28);

        const anchorRing = memoryFocusBeam.userData.anchorRing;
        anchorRing.position.copy(target);
        anchorRing.rotation.z = elapsed * (lockedHotspot ? 0.92 : 0.5);
        anchorRing.scale.setScalar(1.1 + (lockedHotspot ? 0.5 : 0.18) + Math.sin(elapsed * 2.1) * 0.08);
        anchorRing.material.opacity = anchorRing.userData.baseOpacity
          * memoryFocusBeam.userData.opacity
          * (lockedHotspot ? 1.15 : 0.7);
      }
      const focusFieldTargetOpacity = focusHotspot
        ? cityMix * 0.72 + networkMix * 1.18 + (lockedHotspot ? 0.34 : 0.12)
        : 0;
      memoryFocusField.userData.opacity = THREE.MathUtils.damp(memoryFocusField.userData.opacity || 0, focusFieldTargetOpacity, 6.4, frameDelta);
      memoryFocusField.visible = memoryFocusField.userData.opacity > 0.01;
      if (memoryFocusField.visible && focusHotspot) {
        const target = focusHotspot.getWorldPosition(memoryFocusField.userData.target);
        memoryFocusField.userData.localTarget.copy(target);
        root.worldToLocal(memoryFocusField.userData.localTarget);
        memoryFocusField.position.copy(memoryFocusField.userData.localTarget);
        memoryFocusField.lookAt(root.worldToLocal(camera.position.clone()));
        memoryFocusField.rotateZ(elapsed * (lockedHotspot ? 0.18 : 0.08));
        memoryFocusField.scale.setScalar(1.08 + memoryFocusField.userData.opacity * 0.72 + Math.sin(elapsed * 1.8) * 0.045);
        const hotspotColor = focusHotspot.userData.color ? new THREE.Color(focusHotspot.userData.color) : palette.noodle;
        memoryFocusField.children.forEach((object, index) => {
          if (!object.material) return;
          if (object.name === 'memory-focus-field-lens') {
            object.material.opacity = object.userData.baseOpacity
              * memoryFocusField.userData.opacity
              * (0.72 + networkMix * 0.28);
          } else if (object.name === 'memory-focus-field-ring') {
            object.material.color.copy(hotspotColor).lerp(index === 0 ? palette.core : palette.sprout, 0.42);
            object.material.opacity = object.userData.baseOpacity
              * memoryFocusField.userData.opacity
              * (0.72 + Math.sin(elapsed * 2.2 + object.userData.phase) * 0.28);
            object.rotation.z = elapsed * (0.18 + index * 0.04);
          } else if (object.name === 'memory-focus-field-rays') {
            object.material.color.copy(hotspotColor).lerp(palette.sprout, 0.58);
            object.material.opacity = object.userData.baseOpacity
              * memoryFocusField.userData.opacity
              * (0.62 + Math.sin(elapsed * 2.6) * 0.38);
          }
        });
        const motes = memoryFocusField.userData.motes;
        const motePositions = motes.geometry.attributes.position.array;
        for (let i = 0; i < motes.userData.count; i += 1) {
          const phase = i * 1.618;
          const spin = elapsed * (0.42 + (i % 7) * 0.025) + phase;
          const radius = 0.22 + ((i * 17) % 41) * 0.018;
          const lift = Math.sin(elapsed * 1.4 + phase) * 0.14;
          motePositions[i * 3] = Math.cos(spin) * radius;
          motePositions[i * 3 + 1] = Math.sin(spin * 1.17) * radius * 0.62 + lift;
          motePositions[i * 3 + 2] = Math.sin(spin) * radius * 0.34;
        }
        motes.geometry.attributes.position.needsUpdate = true;
        motes.material.opacity = motes.userData.baseOpacity
          * memoryFocusField.userData.opacity
          * (0.74 + Math.sin(elapsed * 2.1) * 0.26);
        motes.material.size = 0.045 + memoryFocusField.userData.opacity * 0.036;
      }
      const rippleTargetOpacity = lockedHotspot ? networkMix * 0.78 + cityMix * 0.5 + 0.18 : 0;
      memoryNetworkRipples.userData.opacity = THREE.MathUtils.damp(memoryNetworkRipples.userData.opacity || 0, rippleTargetOpacity, 5.4, frameDelta);
      memoryNetworkRipples.visible = memoryNetworkRipples.userData.opacity > 0.01;
      if (memoryNetworkRipples.visible) {
        const focusName = lockedHotspot?.userData.name;
        const activeLinks = [];
        memoryNetworkRipples.children.forEach((object) => {
          if (object.name !== 'memory-network-ripple-link' || !object.material) return;
          const isLinked = focusName && (object.userData.from === focusName || object.userData.to === focusName);
          const phase = object.userData.phase;
          const wave = 0.58 + Math.sin(elapsed * 2.3 + phase) * 0.42;
          object.material.opacity = object.userData.baseOpacity
            * memoryNetworkRipples.userData.opacity
            * (isLinked ? 1.25 + wave * 0.72 : 0.035);
          object.scale.setScalar(isLinked ? 1 + Math.sin(elapsed * 1.8 + phase) * 0.028 : 1);
          if (isLinked) activeLinks.push(object);
        });
        memoryNetworkRipples.userData.activeLinks = activeLinks;

        const packets = memoryNetworkRipples.userData.packets;
        const packetPositions = packets.geometry.attributes.position.array;
        const activeCount = activeLinks.length;
        for (let i = 0; i < packets.userData.count; i += 1) {
          if (activeCount === 0) {
            packetPositions[i * 3] = 0;
            packetPositions[i * 3 + 1] = 0;
            packetPositions[i * 3 + 2] = 0;
            continue;
          }
          const link = activeLinks[i % activeCount];
          const points = link.userData.points;
          const phase = i * 0.23 + link.userData.phase;
          const stream = (elapsed * (0.24 + (i % 6) * 0.018) + phase) % 1;
          const pointIndex = Math.min(points.length - 1, Math.floor(stream * (points.length - 1)));
          const p = points[pointIndex];
          const pulse = Math.sin(stream * Math.PI);
          packetPositions[i * 3] = p.x + Math.sin(elapsed * 1.6 + phase) * 0.035 * pulse;
          packetPositions[i * 3 + 1] = p.y + Math.cos(elapsed * 1.4 + phase) * 0.035 * pulse;
          packetPositions[i * 3 + 2] = p.z + Math.sin(elapsed * 1.2 + phase) * 0.045 * pulse;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * memoryNetworkRipples.userData.opacity
          * (activeLinks.length > 0 ? 1 : 0);
        packets.material.size = 0.045 + memoryNetworkRipples.userData.opacity * 0.035;
      }
      const returnTargetOpacity = lockedHotspot ? cityMix * 0.92 + networkMix * 0.45 + 0.16 : 0;
      memoryReturnTrails.userData.opacity = THREE.MathUtils.damp(memoryReturnTrails.userData.opacity || 0, returnTargetOpacity, 6, frameDelta);
      memoryReturnTrails.visible = memoryReturnTrails.userData.opacity > 0.01;
      if (memoryReturnTrails.visible && lockedHotspot) {
        const target = lockedHotspot.getWorldPosition(memoryReturnTrails.userData.target);
        const makeReturnPoint = (stream, phase, offsetScale = 1) => {
          const lift = 0.28 + Math.sin(phase * 1.7) * 0.08;
          const lateral = new THREE.Vector3(-target.z, 0.2 + Math.sin(phase) * 0.08, target.x).normalize();
          const fade = Math.sin(stream * Math.PI);
          const bend = lateral.multiplyScalar((Math.sin(stream * Math.PI * 2 + phase) * 0.18 + offsetScale) * fade);
          const p = target.clone().multiplyScalar(1 - stream);
          p.y += Math.sin(stream * Math.PI) * lift + Math.sin(elapsed * 1.2 + phase + stream * 4) * 0.035;
          p.add(bend);
          p.z += Math.sin(stream * Math.PI) * 0.08;
          return p;
        };
        memoryReturnTrails.children.forEach((line, index) => {
          if (line.name !== 'memory-return-trail') return;
          const positions = line.geometry.attributes.position.array;
          const phase = line.userData.phase;
          for (let i = 0; i <= 96; i += 1) {
            const t = i / 96;
            const stream = (t + elapsed * 0.18 * line.userData.speed + phase) % 1;
            const p = makeReturnPoint(stream, phase, line.userData.offset);
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
          }
          line.geometry.attributes.position.needsUpdate = true;
          line.material.opacity = line.userData.baseOpacity
            * memoryReturnTrails.userData.opacity
            * (0.7 + Math.sin(elapsed * 2.6 + phase) * 0.3);
        });
        const packets = memoryReturnTrails.userData.packets;
        const packetPositions = packets.geometry.attributes.position.array;
        for (let i = 0; i < packets.userData.count; i += 1) {
          const phase = i * 0.37;
          const stream = (elapsed * (0.22 + (i % 5) * 0.018) + phase) % 1;
          const p = makeReturnPoint(stream, phase, ((i % 9) - 4) * 0.035);
          packetPositions[i * 3] = p.x;
          packetPositions[i * 3 + 1] = p.y;
          packetPositions[i * 3 + 2] = p.z;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * memoryReturnTrails.userData.opacity
          * (0.82 + Math.sin(elapsed * 2.8) * 0.18);
        packets.material.size = 0.055 + memoryReturnTrails.userData.opacity * 0.035;
      }
      suanbirdGlyph.visible = birdMix > 0.12;
      suanbirdGlyph.rotation.y = birdMix * -0.16 + Math.sin(elapsed * 0.35) * 0.08;
      suanbirdGlyph.rotation.x = birdMix * -0.03;
      suanbirdGlyph.position.x = birdMix * 0.16;
      suanbirdGlyph.position.y = birdMix * 0.12;
      suanbirdGlyph.position.z = birdMix * 0.12;
      suanbirdGlyph.scale.setScalar(1.16 + Math.sin(elapsed * 1.1) * 0.018);
      suanbirdGlyph.traverse((object) => {
        if (object.material) {
          const baseOpacity = object.userData.baseOpacity ?? 0.42;
          const isNegativeSpace = object.name?.startsWith('suanbird-negative-space');
          const negativeSpaceOpacity = isNegativeSpace
            ? baseOpacity * THREE.MathUtils.clamp(birdMix * 1.15 + suanbirdMix * 0.34, 0, 1)
            : null;
          if (isNegativeSpace) {
            object.material.opacity = negativeSpaceOpacity;
            object.scale.set(
              object.scale.x,
              object.scale.y,
              1 + Math.sin(elapsed * 1.1 + (object.id % 7)) * 0.006,
            );
            return;
          }
          const focusPulse = 0.9 + Math.sin(elapsed * 1.6) * 0.1;
          const isIdentityAnchor = object.parent?.name === 'suanbird-identity-anchors';
          const identityBoost = object.name?.startsWith('suanbird-')
            ? 1.22 + suanbirdMix * 0.24
            : 1;
          const foregroundLift = object.parent?.name === 'suanbird-identity-anchors'
            ? READABILITY_TUNING.foregroundAnchorLift + suanbirdMix * 0.08
            : 0;
          object.material.opacity = Math.min(
            1,
            baseOpacity * (0.16 + birdMix * 1.1 + foregroundLift) * focusPulse * identityBoost,
          );
          if (isIdentityAnchor) {
            object.scale.setScalar(1 + birdMix * 0.032 + suanbirdMix * 0.018 + Math.sin(elapsed * 2.2 + (object.id % 11)) * 0.012);
          }
        }
      });
      const memoryPulseTarget = lockedHotspot ? birdMix * (0.52 + suanbirdMix * 0.72) : 0;
      suanbirdMemoryPulse.userData.opacity = THREE.MathUtils.damp(suanbirdMemoryPulse.userData.opacity || 0, memoryPulseTarget, 5.6, frameDelta);
      suanbirdMemoryPulse.visible = suanbirdMemoryPulse.userData.opacity > 0.01;
      if (suanbirdMemoryPulse.visible) {
        if (lockedHotspot?.userData.color) {
          suanbirdMemoryPulse.userData.color.set(lockedHotspot.userData.color);
        }
        suanbirdMemoryPulse.rotation.y = suanbirdGlyph.rotation.y + Math.sin(elapsed * 0.5) * 0.035;
        suanbirdMemoryPulse.rotation.x = suanbirdGlyph.rotation.x;
        suanbirdMemoryPulse.position.copy(suanbirdGlyph.position);
        suanbirdMemoryPulse.children.forEach((object, index) => {
          if (!object.material) return;
          const colorMix = object.name === 'suanbird-memory-sprout' ? 0.45 : object.name === 'suanbird-memory-wing' ? 0.62 : 0.72;
          object.material.color.copy(palette.core).lerp(suanbirdMemoryPulse.userData.color, colorMix);
          object.material.opacity = object.userData.baseOpacity
            * suanbirdMemoryPulse.userData.opacity
            * (0.64 + Math.sin(elapsed * 2.4 + object.userData.phase + index * 0.18) * 0.36);
          object.scale.setScalar(1 + suanbirdMemoryPulse.userData.opacity * 0.06 + Math.sin(elapsed * 2.1 + object.userData.phase) * 0.018);
        });
      }
      const voiceTarget = THREE.MathUtils.clamp(
        suanbirdMix * 0.58 + cityMix * 0.44 + networkMix * 0.16 + burstMix * 0.66 + (lockedHotspot ? 0.22 : 0) + totalWave * 0.18,
        0,
        1,
      );
      jiangchengVoiceWaves.userData.opacity = THREE.MathUtils.damp(jiangchengVoiceWaves.userData.opacity || 0, voiceTarget, 5.2, frameDelta);
      jiangchengVoiceWaves.visible = jiangchengVoiceWaves.userData.opacity > 0.012;
      if (jiangchengVoiceWaves.visible) {
        jiangchengVoiceWaves.position.copy(suanbirdGlyph.position);
        jiangchengVoiceWaves.position.y -= 0.04;
        jiangchengVoiceWaves.rotation.x = suanbirdGlyph.rotation.x * 0.72 + Math.sin(elapsed * 0.21) * 0.018;
        jiangchengVoiceWaves.rotation.y = suanbirdGlyph.rotation.y * 0.82 + Math.sin(elapsed * 0.28) * 0.045;
        jiangchengVoiceWaves.rotation.z = Math.sin(elapsed * 0.18) * 0.035;
        jiangchengVoiceWaves.children.forEach((object, index) => {
          if (!object.material) return;
          if (object.name === 'jiangcheng-voice-ring') {
            object.rotation.y += delta * speed * object.userData.spin;
            object.scale.setScalar(1 + jiangchengVoiceWaves.userData.opacity * 0.08 + Math.sin(elapsed * 1.7 + object.userData.phase) * 0.035);
            object.material.opacity = object.userData.baseOpacity
              * jiangchengVoiceWaves.userData.opacity
              * (0.62 + Math.sin(elapsed * 2.2 + object.userData.phase) * 0.38);
          } else if (object.name === 'jiangcheng-voice-lane') {
            object.position.x = Math.sin(elapsed * 0.36 + object.userData.phase) * 0.08;
            object.material.opacity = object.userData.baseOpacity
              * jiangchengVoiceWaves.userData.opacity
              * (0.66 + Math.sin(elapsed * 2.8 + object.userData.phase + index * 0.1) * 0.34);
          }
        });
        const packets = jiangchengVoiceWaves.userData.packets;
        const voicePositions = packets.geometry.attributes.position.array;
        const voiceSeeds = packets.geometry.attributes.voiceSeed.array;
        const packetCount = Math.floor(JIANGCHENG_VOICE_PACKET_COUNT * THREE.MathUtils.clamp(densityScale * 1.08, 0.28, 1));
        packets.geometry.setDrawRange(0, packetCount);
        for (let i = 0; i < packetCount; i += 1) {
          const seed = voiceSeeds[i];
          const stream = (seed + elapsed * (0.13 + (i % 5) * 0.012) * speed) % 1;
          const lane = i % 5;
          const x = -2.55 + stream * 5.1;
          const carrier = Math.sin(stream * Math.PI * (7 + lane) + elapsed * 2.2 + lane);
          const pulse = Math.sin(stream * Math.PI);
          voicePositions[i * 3] = x + Math.sin(elapsed * 0.9 + i) * 0.035 * pulse;
          voicePositions[i * 3 + 1] = -0.72 + lane * 0.34 + carrier * 0.07;
          voicePositions[i * 3 + 2] = 0.72 + Math.cos(stream * Math.PI * 2 + lane) * 0.22 + Math.sin(elapsed + i) * 0.035;
        }
        packets.geometry.attributes.position.needsUpdate = true;
        packets.material.opacity = packets.userData.baseOpacity
          * jiangchengVoiceWaves.userData.opacity
          * (0.68 + suanbirdMix * 0.18 + burstMix * 0.2);
        packets.material.size = 0.038 + jiangchengVoiceWaves.userData.opacity * 0.032 + burstMix * 0.018;
      }

      const pointerWorld = new THREE.Vector3(pointer.x * 3.2, pointer.y * 2, 0);
      const pointerActive = pointer.x < 9;
      const pointerTargetOpacity = pointerActive ? 1 : 0;
      pointerField.userData.opacity = THREE.MathUtils.damp(pointerField.userData.opacity || 0, pointerTargetOpacity, 8, frameDelta);
      pointerField.visible = pointerField.userData.opacity > 0.01;
      if (pointerField.visible) {
        pointerField.position.copy(pointerWorld);
        pointerField.position.z = 0.16 + Math.sin(elapsed * 0.8) * 0.06;
        pointerField.rotation.z = elapsed * 0.75;
        pointerField.scale.setScalar(0.82 + Math.sin(elapsed * 2.4) * 0.06);
        pointerField.children.forEach((object, index) => {
          if (object.material) {
            const baseOpacity = object.userData.baseOpacity ?? 0.2;
            object.material.opacity = baseOpacity * pointerField.userData.opacity * (0.78 + Math.sin(elapsed * 3 + index) * 0.22);
          }
        });
      }
      clickRipple.visible = burstWave > 0.012;
      if (clickRipple.visible) {
        const rippleScale = 0.42 + (1 - burstWave) * 2.2;
        clickRipple.scale.setScalar(rippleScale);
        clickRipple.rotation.z = elapsed * 0.5;
        clickRipple.children.forEach((object, index) => {
          if (object.material) {
            const baseOpacity = object.userData.baseOpacity ?? 0.28;
            object.material.opacity = baseOpacity * burstWave * (0.78 + Math.sin(elapsed * 4 + index) * 0.22);
          }
        });
      }
      const flowTargetOpacity = THREE.MathUtils.clamp(networkMix * 0.82 + cityMix * 0.36 + burstMix * 0.22 + totalWave * 0.16, 0, 1)
        * (mode === 'suanbird' ? 0.28 : 1);
      network.flows.userData.opacity = THREE.MathUtils.damp(network.flows.userData.opacity || 0, flowTargetOpacity, 5.2, frameDelta);
      network.flows.visible = network.flows.userData.opacity > 0.012;
      if (network.flows.visible) {
        const flowPositions = network.flows.geometry.attributes.position.array;
        const flowSeeds = network.flows.geometry.attributes.flowSeed.array;
        const flowEdges = network.flows.userData.edges;
        const flowEdgePhases = network.flows.userData.edgePhases;
        const maxFlowCount = Math.floor(NETWORK_FLOW_PACKET_COUNT * THREE.MathUtils.clamp(densityScale * (0.42 + network.flows.userData.opacity * 0.58), 0.18, 1));
        network.flows.geometry.setDrawRange(0, maxFlowCount);
        for (let i = 0; i < maxFlowCount; i += 1) {
          const seed = flowSeeds[i];
          const edgeIndex = Math.floor((i * 37 + seed * 113) % NETWORK_EDGE_COUNT);
          const offset = edgeIndex * 6;
          const phase = flowEdgePhases[edgeIndex * 2] || seed;
          const stream = (elapsed * (0.055 + (i % 11) * 0.0025) * speed + seed * 0.159) % 1;
          const pulse = Math.sin(stream * Math.PI);
          const ax = flowEdges[offset];
          const ay = flowEdges[offset + 1];
          const az = flowEdges[offset + 2];
          const bx = flowEdges[offset + 3];
          const by = flowEdges[offset + 4];
          const bz = flowEdges[offset + 5];
          const jitter = Math.sin(elapsed * 1.8 + phase + i) * 0.026 * pulse;
          flowPositions[i * 3] = ax + (bx - ax) * stream + Math.sin(phase + elapsed) * jitter;
          flowPositions[i * 3 + 1] = ay + (by - ay) * stream + Math.cos(phase + elapsed * 1.1) * jitter;
          flowPositions[i * 3 + 2] = az + (bz - az) * stream + Math.sin(phase * 1.7 + elapsed * 0.8) * jitter;
        }
        network.flows.geometry.attributes.position.needsUpdate = true;
        network.flows.material.opacity = network.flows.userData.opacity * (0.22 + networkMix * 0.42 + burstMix * 0.07);
        network.flows.material.size = network.flows.userData.baseSize
          * (0.78 + network.flows.userData.opacity * 0.72)
          * (mode === 'network' ? 1.08 : 0.92);
      } else {
        network.flows.geometry.setDrawRange(0, 0);
      }
      modePulseState.strength = modePulseWave;
      modePulse.visible = modePulseWave > 0.01;
      modePulse.scale.setScalar(0.8 + (1 - modePulseWave) * 3.4);
      modePulse.rotation.z = elapsed * 0.24;
      modePulse.children.forEach((object, index) => {
        if (object.material) {
          const baseOpacity = object.userData.baseOpacity ?? 0.3;
          object.material.opacity = baseOpacity * modePulseWave * (0.8 + Math.sin(elapsed * 2 + index) * 0.2);
        }
      });
      const particleUniforms = nebula.points.material.uniforms;
      particleUniforms.uTime.value = elapsed * speed;
      particleUniforms.uBirdMix.value = birdMix;
      particleUniforms.uBurstMix.value = burstMix;
      particleUniforms.uParticleOpacity.value = THREE.MathUtils.clamp(
        1
          + nebulaMix * 0.18
          - cityMix * (READABILITY_TUNING.cityParticleOpacityCut + 0.12)
          - networkMix * (READABILITY_TUNING.graphParticleOpacityCut + 0.08)
          - birdMix * 0.34
          - suanbirdMix * READABILITY_TUNING.birdParticleOpacityCut
          - burstMix * 0.54,
        0.035,
        0.58,
      );
      particleUniforms.uCoreBoost.value = THREE.MathUtils.clamp(
        1
          - nebulaMix * 0.92
          - cityMix * READABILITY_TUNING.cityCoreBoostCut
          - networkMix * READABILITY_TUNING.graphCoreBoostCut
          - birdMix * 0.52
          - suanbirdMix * READABILITY_TUNING.birdCoreBoostCut
          - burstMix * 0.2,
        0.012,
        0.42,
      );
      particleUniforms.uNebulaStyle.value = nebulaMix;
      particleUniforms.uSceneTint.value.copy(signatureTint);
      particleUniforms.uSceneTintMix.value = THREE.MathUtils.clamp(
        0.16 + networkMix * 0.62 + cityMix * 0.48 + suanbirdMix * 0.08 + vortexPresence * 0.54,
        0,
        0.82,
      );
      particleUniforms.uIntensity.value = intensity;
      particleUniforms.uPointer.value.set(pointerWorld.x, pointerWorld.y, pointerWorld.z);
      particleUniforms.uClick.value.set(clickWorld.x, clickWorld.y, clickWorld.z, totalWave);
      if (lockedHotspot) {
        const target = lockedHotspot.getWorldPosition(new THREE.Vector3());
        const flowStrength = memoryReturnTrails.userData.opacity || 0;
        particleUniforms.uMemoryFlow.value.set(target.x, target.y, target.z, flowStrength);
      } else {
        particleUniforms.uMemoryFlow.value.set(0, 0, 0, 0);
      }

      const nodeUniforms = network.nodes.material.uniforms;
      const edgeUniforms = network.edges.material.uniforms;
      const memoryNetworkStrength = lockedHotspot
        ? THREE.MathUtils.clamp(networkMix * 0.92 + cityMix * 0.42 + (memoryNetworkRipples.userData.opacity || 0) * 0.52, 0, 1)
        : 0;
      if (lockedHotspot) {
        const target = lockedHotspot.getWorldPosition(new THREE.Vector3());
        nodeUniforms.uMemoryFocus.value.set(target.x, target.y, target.z, memoryNetworkStrength);
        edgeUniforms.uMemoryFocus.value.set(target.x, target.y, target.z, memoryNetworkStrength * 0.82);
      } else {
        nodeUniforms.uMemoryFocus.value.set(0, 0, 0, 0);
        edgeUniforms.uMemoryFocus.value.set(0, 0, 0, 0);
      }
      const networkExposure = mode === 'network'
        ? READABILITY_TUNING.graphNetworkExposure * 0.72
        : mode === 'city'
          ? READABILITY_TUNING.cityNetworkExposure * 0.22
          : mode === 'nebula'
            ? 1.12
            : mode === 'burst'
              ? 0.18
              : 1;
      const networkOpacity = (0.065 + nebulaMix * 0.72 + networkMix * 0.2 + totalWave * 0.12 + Math.sin(elapsed * 0.9) * 0.026)
        * networkExposure
        * (mode === 'suanbird' ? 0.28 : 1);
      const nodeSize = (0.014 + nebulaMix * 0.058 + networkMix * 0.02 + totalWave * 0.012 + Math.sin(elapsed * 1.1) * 0.004)
        * (mode === 'network' ? 0.74 : 1)
        * (mode === 'city' ? 0.82 : 1)
        * (mode === 'suanbird' ? 0.72 : 1);
      nodeUniforms.uTime.value = elapsed * speed;
      nodeUniforms.uNetworkMix.value = networkMix;
      nodeUniforms.uIntensity.value = intensity;
      nodeUniforms.uNodeSize.value = nodeSize;
      nodeUniforms.uOpacity.value = Math.min(0.94, 0.34 + nebulaMix * 0.56 + networkMix * 0.18 + totalWave * 0.12) * networkExposure;
      nodeUniforms.uNebulaStyle.value = nebulaMix;
      nodeUniforms.uSceneTint.value.copy(signatureNetworkTint);
      nodeUniforms.uSceneTintMix.value = THREE.MathUtils.clamp(networkMix * 0.72 + cityMix * 0.28 + vortexPresence * 0.36, 0, 0.78);
      nodeUniforms.uPixelRatio.value = currentPixelRatio;
      nodeUniforms.uPointer.value.set(pointerWorld.x, pointerWorld.y, pointerWorld.z);
      nodeUniforms.uClick.value.set(clickWorld.x, clickWorld.y, clickWorld.z, totalWave);
      edgeUniforms.uTime.value = elapsed * speed;
      edgeUniforms.uNetworkMix.value = networkMix;
      edgeUniforms.uIntensity.value = intensity;
      edgeUniforms.uOpacity.value = networkOpacity;
      edgeUniforms.uNebulaStyle.value = nebulaMix;
      edgeUniforms.uSceneTint.value.copy(signatureNetworkTint);
      edgeUniforms.uSceneTintMix.value = THREE.MathUtils.clamp(networkMix * 0.78 + cityMix * 0.22 + vortexPresence * 0.42, 0, 0.82);
      edgeUniforms.uPointer.value.set(pointerWorld.x, pointerWorld.y, pointerWorld.z);
      edgeUniforms.uClick.value.set(clickWorld.x, clickWorld.y, clickWorld.z, totalWave);
      controls.autoRotate = settings.current.autoRotate && !paused && (!demoMode || clockElapsed <= userCameraControlUntil);
      controls.update();
      composer.render();
      if (pendingCapture) {
        pendingCapture = false;
        const link = document.createElement('a');
        link.download = `suanbird-wuhan-${Date.now()}.png`;
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost, false);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored, false);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [containerRef, settings]);
}

function App() {
  const containerRef = useRef(null);
  const isCompactDevice = typeof window !== 'undefined' && (
    window.matchMedia('(max-width: 720px)').matches
    || (window.matchMedia('(max-width: 1024px)').matches && window.devicePixelRatio > 1.8)
  );
  const initialScene = useMemo(() => readSceneUrlOptions(isCompactDevice), [isCompactDevice]);
  const settingsRef = useRef({
    speed: initialScene.speed,
    intensity: initialScene.intensity,
    autoRotate: true,
    paused: initialScene.paused,
    mode: initialScene.mode,
    profile: initialScene.profile,
    density: initialScene.density,
    resetSignal: 0,
    captureSignal: 0,
    cameraPresetSignal: initialScene.cameraPresetSignal,
    demoMode: initialScene.demoMode,
    memorySignal: initialScene.memorySignal,
    setActiveHotspot: null,
    setRenderStats: null,
    setWebglStatus: null,
  });
  const [speed, setSpeed] = useState(initialScene.speed);
  const [intensity, setIntensity] = useState(initialScene.intensity);
  const [autoRotate, setAutoRotate] = useState(true);
  const [paused, setPaused] = useState(initialScene.paused);
  const [mode, setMode] = useState(initialScene.mode);
  const [profile, setProfile] = useState(initialScene.profile);
  const [density, setDensity] = useState(initialScene.density);
  const [demoMode, setDemoMode] = useState(initialScene.demoMode);
  const [auditMode, setAuditMode] = useState(initialScene.auditMode);
  const [memorySignal, setMemorySignal] = useState(initialScene.memorySignal);
  const [demoBeat, setDemoBeat] = useState(initialScene.demoBeat);
  const [resetSignal, setResetSignal] = useState(0);
  const [captureSignal, setCaptureSignal] = useState(0);
  const [cameraPresetSignal, setCameraPresetSignal] = useState(initialScene.cameraPresetSignal);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [renderStats, setRenderStats] = useState({ fps: 60, quality: 1, density: 1 });
  const [webglStatus, setWebglStatus] = useState('ok');
  const [deviceStats, setDeviceStats] = useState({
    webgpu: false,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    compact: isCompactDevice,
  });
  const [immersive, setImmersive] = useState(initialScene.immersive);
  const [panelOpen, setPanelOpen] = useState(initialScene.panelOpen);
  const publishDemoBeat = (index) => {
    const beat = DEMO_PROLOGUE_SEQUENCE[index % DEMO_PROLOGUE_SEQUENCE.length];
    const stamp = Date.now();
    setMode(beat.id);
    setDemoBeat(beat.beat);
    setCameraPresetSignal({ id: beat.preset, source: 'demo-camera-director', stamp });
    setMemorySignal({ name: beat.memory, source: 'demo', stamp });
  };
  const publishAuditBeat = (index) => {
    const beat = AESTHETIC_AUDIT_SEQUENCE[index % AESTHETIC_AUDIT_SEQUENCE.length];
    const stamp = Date.now();
    setMode(beat.id);
    setDemoBeat(beat.beat);
    setCameraPresetSignal({ id: beat.preset, source: 'aesthetic-audit-camera', stamp });
    setMemorySignal({ name: beat.memory, source: 'aesthetic-audit', stamp });
  };

  const settingValues = useMemo(
    () => ({
      speed,
      intensity,
      autoRotate,
      paused,
      mode,
      profile,
      density,
      resetSignal,
      captureSignal,
      cameraPresetSignal,
      demoMode,
      auditMode,
      memorySignal,
      setActiveHotspot,
      setRenderStats,
      setWebglStatus,
    }),
    [speed, intensity, autoRotate, paused, mode, profile, density, resetSignal, captureSignal, cameraPresetSignal, demoMode, auditMode, memorySignal],
  );
  const activeMode = MODES.find((item) => item.id === mode) || MODES[0];
  const activeProfile = PARTICLE_PROFILES[profile] || PARTICLE_PROFILES.medium;
  const switchMode = (nextMode) => {
    setDemoMode(false);
    setAuditMode(false);
    setMode(nextMode);
  };
  const clearMemoryLock = () => {
    setDemoMode(false);
    setAuditMode(false);
    setMemorySignal({ name: null, source: 'manual', stamp: Date.now() });
  };
  const applyCameraPreset = (preset) => {
    setDemoMode(false);
    setAuditMode(false);
    setMode(preset.mode);
    setCameraPresetSignal({ id: preset.id, stamp: Date.now() });
    if (preset.memory) {
      setMemorySignal({ name: preset.memory, source: 'preset', stamp: Date.now() });
    }
  };
  const modeSummary = {
    nebula: '黑色空间里，江河、街巷和人声被编码成一团缓慢呼吸的城市星云。',
    suanbird: '中心粒子收拢成原创蒜鸟：蒜瓣、鸟头、蒜苗和翅膀光轨在白光里浮现。',
    city: '长江、汉水、黄鹤楼、长江大桥与城市记忆节点从星云深处浮出。',
    network: '节点和细线被点亮，武汉的街区、湖泊、桥梁与夜市织成一张关系图谱。',
    burst: '中心能量向外扩散，粒子散开又回流，像蒜鸟从城市网络中重新诞生。',
  }[mode];

  useEffect(() => {
    settingsRef.current = settingValues;
  }, [settingValues]);

  useEffect(() => {
    const updateDeviceStats = () => {
      setDeviceStats({
        webgpu: Boolean(navigator.gpu),
        pixelRatio: window.devicePixelRatio || 1,
        compact: window.matchMedia('(max-width: 720px)').matches
          || (window.matchMedia('(max-width: 1024px)').matches && window.devicePixelRatio > 1.8),
      });
    };
    updateDeviceStats();
    window.addEventListener('resize', updateDeviceStats);
    return () => window.removeEventListener('resize', updateDeviceStats);
  }, []);

  useEffect(() => {
    if (!demoMode || auditMode) return undefined;
    let index = 0;
    setAutoRotate(true);
    setPaused(false);
    publishDemoBeat(index);
    const timer = window.setInterval(() => {
      index = (index + 1) % DEMO_SEQUENCE.length;
      publishDemoBeat(index);
    }, DEMO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [demoMode, auditMode]);

  useEffect(() => {
    if (!auditMode) return undefined;
    let index = 0;
    setDemoMode(false);
    setAutoRotate(true);
    setPaused(false);
    publishAuditBeat(index);
    const timer = window.setInterval(() => {
      index = (index + 1) % AESTHETIC_AUDIT_SEQUENCE.length;
      publishAuditBeat(index);
    }, AESTHETIC_AUDIT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [auditMode]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === 'h') setImmersive((value) => !value);
      if (event.key === 'Escape') setImmersive(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useSuanbirdScene(containerRef, settingsRef);

  return (
    <main className={`${immersive ? 'experience is-immersive' : 'experience'} ${panelOpen ? 'is-panel-open' : 'is-panel-closed'}`}>
      <div className="scene" ref={containerRef} aria-label="武汉蒜鸟主题 3D 粒子网络" />
      <button
        className="panel-toggle"
        type="button"
        aria-label={immersive ? '显示界面' : panelOpen ? '收起控制面板' : '展开控制面板'}
        onClick={() => {
          if (immersive) {
            setImmersive(false);
            setPanelOpen(true);
          } else {
            setPanelOpen((value) => !value);
          }
        }}
      >
        {immersive ? '界面' : panelOpen ? '收起' : '控制'}
      </button>
      <section className="hud" aria-label="作品状态">
        <p className="kicker">SUANBIRD / WUHAN PARTICLE NETWORK</p>
        <h1>蒜鸟从城市星云中诞生</h1>
        <p className="summary">{modeSummary}</p>
        <div className={activeHotspot ? 'memory-readout is-visible' : 'memory-readout'} aria-live="polite">
          <span>{activeHotspot?.locked ? '已锁定城市记忆' : '城市记忆'}</span>
          <strong>{activeHotspot?.name || '靠近节点'}</strong>
          <small>{activeHotspot ? `${activeHotspot.note} / ${activeHotspot.story}` : '悬停或点击武汉节点，读取这团星云里的城市线索。'}</small>
          {activeHotspot?.locked && <em>{demoMode ? '演示正在读取这段城市记忆' : '点击空白处解除锁定'}</em>}
        </div>
      </section>
      <aside className="control-panel" aria-label="视觉控制" aria-hidden={!panelOpen || immersive}>
        <div className="stage-row">
          <span>阶段</span>
          <strong>{activeMode.label}</strong>
        </div>
        <p className={demoMode || auditMode ? 'demo-readout is-active' : 'demo-readout'}>
          {demoMode || auditMode ? demoBeat : '手动探索模式'}
        </p>
        <nav className="mode-grid" aria-label="模式切换">
          {MODES.map((item) => (
            <button
              className={mode === item.id ? 'is-active' : ''}
              key={item.id}
              type="button"
              onClick={() => switchMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="view-row" aria-label="取景预设">
          {CAMERA_PRESETS.map((preset) => (
            <button
              className={cameraPresetSignal?.id === preset.id && mode === preset.mode ? 'is-active' : ''}
              key={preset.id}
              type="button"
              onClick={() => applyCameraPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <label>
          动画速度
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.05"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </label>
        <label>
          呼吸强度
          <input
            type="range"
            min="0.2"
            max="1.8"
            step="0.05"
            value={intensity}
            onChange={(event) => setIntensity(Number(event.target.value))}
          />
        </label>
        <label>
          粒子密度
          <input
            type="range"
            min="0.45"
            max="1"
            step="0.05"
            value={density}
            onChange={(event) => setDensity(Number(event.target.value))}
          />
        </label>
        <div className="profile-row" aria-label="性能档位">
          {Object.entries(PARTICLE_PROFILES).map(([id, item]) => (
            <button
              className={profile === id ? 'is-active' : ''}
              key={id}
              type="button"
              onClick={() => setProfile(id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="density-readout">
          粒子 {Math.round(activeProfile.particleRatio * density * PARTICLE_COUNT).toLocaleString('zh-CN')} / 网络 {Math.round(activeProfile.networkRatio * density * NETWORK_NODE_COUNT).toLocaleString('zh-CN')}
        </p>
        <p className="render-readout">
          FPS {Math.round(renderStats.fps)} / 质量 {Math.round(renderStats.quality * 100)}% / 密度守护 {Math.round((renderStats.density ?? 1) * 100)}%
        </p>
        <p className="render-readout">
          {deviceStats.webgpu ? 'WebGPU 可用' : 'WebGL 展示'} / DPR {deviceStats.pixelRatio.toFixed(1)} / {deviceStats.compact ? '移动降级' : '桌面档'}
        </p>
        {webglStatus !== 'ok' && (
          <p className={`webgl-status is-${webglStatus}`} role="status" aria-live="polite">
            {webglStatus === 'lost' ? 'WebGL 上下文已暂停，浏览器正在尝试恢复。' : 'WebGL 已恢复，粒子网络正在重新稳定。'}
          </p>
        )}
        <button className="cruise-button" type="button" onClick={() => setAutoRotate((value) => !value)}>
          {autoRotate ? '暂停巡航' : '开启巡航'}
        </button>
        <button
          className={paused ? 'ghost-button is-active' : 'ghost-button'}
          type="button"
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? '恢复动画' : '暂停动画'}
        </button>
        <button
          className={demoMode ? 'ghost-button is-active' : 'ghost-button'}
          type="button"
          onClick={() => {
            setAuditMode(false);
            setDemoMode((value) => !value);
          }}
        >
          {demoMode ? '退出演示' : '演示模式'}
        </button>
        <button
          className={auditMode ? 'ghost-button is-active' : 'ghost-button'}
          type="button"
          onClick={() => setAuditMode((value) => !value)}
        >
          {auditMode ? '退出巡检' : '审美巡检'}
        </button>
        <button
          className={immersive ? 'ghost-button is-active' : 'ghost-button'}
          type="button"
          onClick={() => setImmersive((value) => !value)}
        >
          {immersive ? '显示界面' : '沉浸模式'}
        </button>
        <button className="ghost-button" type="button" onClick={() => setResetSignal((value) => value + 1)}>
          重置视角
        </button>
        <button className="ghost-button" type="button" onClick={clearMemoryLock}>
          清除记忆锁定
        </button>
        <button className="ghost-button" type="button" onClick={() => setCaptureSignal((value) => value + 1)}>
          导出截图
        </button>
      </aside>
    </main>
  );
}

createRoot(document.getElementById('app')).render(<App />);
