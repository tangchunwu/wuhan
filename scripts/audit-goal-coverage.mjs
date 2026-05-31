import { readFile } from 'node:fs/promises';

const files = {
  main: new URL('../src/main.jsx', import.meta.url),
  style: new URL('../src/style.css', import.meta.url),
  goal: new URL('../PROJECT_GOAL.md', import.meta.url),
  acceptance: new URL('../ACCEPTANCE.md', import.meta.url),
  retrospective: new URL('../RETROSPECTIVE.md', import.meta.url),
};

const [main, style, goal, acceptance, retrospective] = await Promise.all(
  Object.values(files).map((file) => readFile(file, 'utf8')),
);

const includesAll = (source, tokens) => tokens.every((token) => source.includes(token));
const includesAny = (source, tokens) => tokens.some((token) => source.includes(token));

const auditGroups = [
  {
    title: '核心概念',
    checks: [
      ['目标文档保留总概念', goal.includes('蒜鸟从武汉城市网络中诞生')],
      ['验收文档映射核心概念', acceptance.includes('武汉蒜鸟粒子网络验收审计')],
      ['复盘文档持续记录阶段推进', retrospective.includes('Challenges') && retrospective.includes('Solutions') && retrospective.includes('Learnings')],
    ],
  },
  {
    title: 'GraphPU 风格视觉底座',
    checks: [
      ['黑色深空与星尘层', includesAll(main, ['new THREE.FogExp2', 'DEEP_SPACE_DUST_COUNT', 'deep-space-dust']) && style.includes('background')],
      ['10 万核心粒子池', main.includes('const PARTICLE_COUNT = 100000')],
      ['外围网络节点与边线', includesAll(main, ['NETWORK_NODE_COUNT = 3600', 'NETWORK_EDGE_COUNT = 9600', 'createNetwork'])],
      ['中心爆发与关系光束', includesAll(main, ['createCentralBurst', 'CENTRAL_RELATION_RAY_COUNT', 'central-relation-rays'])],
      ['Bloom 后处理与发光材质', includesAll(main, ['EffectComposer', 'UnrealBloomPass', 'AdditiveBlending'])],
      ['网络深度扫描与空间扫光', includesAll(main, ['vDepthFade', 'vScan', 'spatialSweep'])],
      ['图计算波面', includesAll(main, ['GRAPH_COMPUTE_WAVE_COUNT', 'createGraphComputeWavefronts', 'graph-compute-wavefronts'])],
    ],
  },
  {
    title: '原创蒜鸟主体',
    checks: [
      ['蒜鸟粒子目标点', includesAll(main, ['createSuanbirdTargets', 'sampleLeaf', 'sampleWing'])],
      ['蒜形身体与蒜瓣结构', includesAny(main, ['suanbird-garlic-crown', 'suanbird-bulb-ribs', '蒜瓣'])],
      ['鸟头、喙、眼点识别锚', includesAll(main, ['suanbird-eye', 'suanbird-beak', 'suanbird-neck'])],
      ['蒜苗叶片与冠结', includesAll(main, ['suanbird-sprout-crown', 'suanbird-sprout-crown-knot'])],
      ['翅膀光轨与尾部拖尾', includesAll(main, ['suanbird-wing', 'suanbird-tail'])],
      ['生命脉冲 Shader', includesAll(main, ['vLifePulse', 'lifeWave', 'leafMask', 'wingMask'])],
    ],
  },
  {
    title: '武汉城市记忆层',
    checks: [
      ['长江与汉水光流', includesAll(main, ["createRiverCurve('yangtze')", "createRiverCurve('hanshui')", 'river-flow-packets'])],
      ['二江交汇脉冲', includesAll(main, ['createRiverConfluencePulse', 'river-confluence'])],
      ['黄鹤楼线稿', main.includes('yellow-crane-tower') || main.includes('黄鹤楼')],
      ['长江大桥线稿', main.includes('yangtze-bridge') || main.includes('长江大桥')],
      ['樱花与橙红火花', includesAll(main, ['sakura-drift', 'ember-sparks'])],
      ['城市记忆热点与关系线', includesAll(main, ['WUHAN_MEMORY_HOTSPOTS', 'WUHAN_MEMORY_LINKS', 'memory-link-lines'])],
      ['三镇拓扑与江城声纹', includesAll(main, ['wuhan-town-topology', 'jiangcheng-voice-waves'])],
      ['城市记忆编码雨与谱系轨道', includesAll(main, ['city-memory-code-rain', 'wuhan-memory-orbit-field'])],
    ],
  },
  {
    title: '互动与模式系统',
    checks: [
      ['OrbitControls 拖拽缩放', includesAll(main, ['OrbitControls', 'enableDamping', 'minDistance', 'maxDistance'])],
      ['五种状态模式', ['nebula', 'suanbird', 'city', 'network', 'burst'].every((id) => main.includes(`id: '${id}'`))],
      ['悬停扰动 Shader', includesAll(main, ['uPointer', 'pointer-field', 'pointermove'])],
      ['点击爆发与回流', includesAll(main, ['uClick', 'click-ripple', 'pointerdown'])],
      ['城市热点悬停与锁定', includesAll(main, ['setActiveHotspot', 'lockHotspot', 'memory-readout'])],
      ['暂停、恢复、重置视角', includesAll(main, ['setPaused', 'setResetSignal', '恢复动画'])],
    ],
  },
  {
    title: '性能与作品交付',
    checks: [
      ['性能档位覆盖轻量到极限', ['low', 'medium', 'high', 'extreme'].every((id) => main.includes(`${id}: { label:`))],
      ['移动端密度降级', includesAll(main, ['isCompactDevice', 'density: isCompactDevice ? 0.72 : 1'])],
      ['自适应 DPR 和密度守护', includesAll(main, ['adaptiveQuality', 'adaptiveDensity', 'setRenderStats'])],
      ['截图导出', includesAll(main, ['captureSignal', 'suanbird-wuhan-${Date.now()}.png', '导出截图'])],
      ['沉浸模式与控制面板收纳', includesAll(main, ['immersive', 'panelOpen']) && includesAll(style, ['.experience.is-immersive', '.panel-toggle'])],
      ['WebGL 上下文恢复提示', includesAll(main, ['webglcontextlost', 'webglcontextrestored', 'setWebglStatus']) && style.includes('.webgl-status')],
    ],
  },
  {
    title: '展演叙事',
    checks: [
      ['自动演示诞生序章', includesAll(main, ['DEMO_PROLOGUE_SEQUENCE', 'publishDemoBeat', '序章：江风'])],
      ['自动演示镜头导演', includesAll(main, ['DEMO_CAMERA_SEQUENCE', "source: 'demo-camera-director'", 'beat.preset'])],
      ['审美巡检序列', includesAll(main, ['AESTHETIC_AUDIT_SEQUENCE', 'AESTHETIC_AUDIT_PRESETS', 'publishAuditBeat', '审美巡检'])],
      ['八个取景预设', ['overview', 'suanbird', 'city', 'network', 'towns', 'voice', 'birth', 'confluence'].every((id) => main.includes(`id: '${id}'`))],
      ['真实相机平滑切换', includesAll(main, ['cameraPresetState', 'camera.position.lerpVectors', 'controls.target.lerpVectors'])],
      ['取景预设锁定城市记忆', includesAll(main, ['preset.memory', "source: 'preset'"])],
      ['URL 级取景复现', includesAll(main, ['readSceneUrlOptions', 'URL_SCENE_PARAMS', "source: 'url-preset'"])],
    ],
  },
];

const results = auditGroups.map((group) => ({
  ...group,
  failed: group.checks.filter(([, passed]) => !passed),
  passedCount: group.checks.filter(([, passed]) => passed).length,
}));

const total = results.reduce((sum, group) => sum + group.checks.length, 0);
const passed = results.reduce((sum, group) => sum + group.passedCount, 0);
const failed = results.flatMap((group) => group.failed.map(([name]) => `${group.title} / ${name}`));

console.log('武汉蒜鸟目标覆盖审计');
console.log(`覆盖项：${passed}/${total}`);

results.forEach((group) => {
  console.log(`\n${group.failed.length === 0 ? '✓' : '✗'} ${group.title}：${group.passedCount}/${group.checks.length}`);
  group.checks.forEach(([name, passedCheck]) => {
    console.log(`  ${passedCheck ? '✓' : '✗'} ${name}`);
  });
});

console.log('\n审美类目标仍需人工观看确认：蒜鸟第一眼识别度、GraphPU 参考强度、城市地标可读性、色彩比例。');

if (failed.length > 0) {
  console.error('\n目标覆盖审计失败：');
  failed.forEach((name) => console.error(`- ${name}`));
  process.exit(1);
}
