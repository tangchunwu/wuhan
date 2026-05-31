import { readFile } from 'node:fs/promises';

const files = {
  main: new URL('../src/main.jsx', import.meta.url),
  style: new URL('../src/style.css', import.meta.url),
  goal: new URL('../PROJECT_GOAL.md', import.meta.url),
  acceptance: new URL('../ACCEPTANCE.md', import.meta.url),
  packageJson: new URL('../package.json', import.meta.url),
};

const [main, style, goal, acceptance, packageJson] = await Promise.all(
  Object.values(files).map((file) => readFile(file, 'utf8')),
);

const requiredChecks = [
  ['目标文档存在核心概念', goal.includes('蒜鸟从武汉城市网络中诞生')],
  ['验收文档覆盖展演取景预设', acceptance.includes('展演取景预设')],
  ['粒子池达到 10 万', main.includes('const PARTICLE_COUNT = 100000')],
  ['包含五种视觉模式', ['nebula', 'suanbird', 'city', 'network', 'burst'].every((id) => main.includes(`id: '${id}'`) || main.includes(`'${id}'`))],
  ['包含八个展演取景预设', ['overview', 'suanbird', 'city', 'network', 'towns', 'voice', 'birth', 'confluence'].every((id) => main.includes(`id: '${id}'`))],
  ['自动演示诞生序章存在', main.includes('DEMO_PROLOGUE_SEQUENCE') && main.includes('publishDemoBeat') && main.includes('序章：江风')],
  ['自动演示镜头导演存在', main.includes('DEMO_CAMERA_SEQUENCE') && main.includes("source: 'demo-camera-director'") && main.includes('beat.preset')],
  ['审美巡检序列存在', main.includes('AESTHETIC_AUDIT_SEQUENCE') && main.includes('publishAuditBeat') && main.includes('审美巡检')],
  ['取景预设接入真实相机', main.includes('cameraPresetState') && main.includes('camera.position.lerpVectors')],
  ['取景预设可锁定城市记忆', main.includes('preset.memory') && main.includes("source: 'preset'")],
  ['URL 级取景入口存在', main.includes('readSceneUrlOptions') && main.includes('URL_SCENE_PARAMS') && main.includes("source: 'url-preset'")],
  ['主网络沿边流动光脉冲存在', main.includes('NETWORK_FLOW_PACKET_COUNT') && main.includes('network-flow-packets')],
  ['主网络深度扫描 Shader 存在', main.includes('vDepthFade') && main.includes('vScan') && main.includes('spatialSweep')],
  ['图计算波面存在', main.includes('GRAPH_COMPUTE_WAVE_COUNT') && main.includes('graph-compute-wavefronts')],
  ['中心关系光束存在', main.includes('CENTRAL_RELATION_RAY_COUNT') && main.includes('central-relation-rays')],
  ['蒜鸟生命脉冲 Shader 存在', main.includes('vLifePulse') && main.includes('lifeWave') && main.includes('leafMask')],
  ['江城声纹层存在', main.includes('JIANGCHENG_VOICE_PACKET_COUNT') && main.includes('jiangcheng-voice-waves')],
  ['武汉三镇拓扑层存在', main.includes('WUHAN_TOWN_PACKET_COUNT') && main.includes('wuhan-town-topology')],
  ['城市记忆编码雨存在', main.includes('CITY_MEMORY_CODE_COUNT') && main.includes('city-memory-code-rain')],
  ['武汉记忆谱系轨道存在', main.includes('WUHAN_MEMORY_ORBIT_PACKET_COUNT') && main.includes('wuhan-memory-orbit-field')],
  ['蒜鸟识别锚点存在', main.includes('suanbird-identity-anchors') && main.includes('suanbird-garlic-crown') && main.includes('suanbird-sprout-crown-knot')],
  ['江河与地标动态脉冲存在', main.includes('RIVER_FLOW_PACKET_COUNT') && main.includes('river-flow-packets') && main.includes('landmark-pulse-packets')],
  ['城市能量诞生涡旋存在', main.includes('BIRTH_VORTEX_PACKET_COUNT') && main.includes('city-birth-vortex')],
  ['深空间星尘层存在', main.includes('DEEP_SPACE_DUST_COUNT') && main.includes('deep-space-dust')],
  ['自动演示保留城市记忆序列', main.includes('DEMO_MEMORY_SEQUENCE')],
  ['截图导出入口存在', main.includes('suanbird-wuhan-${Date.now()}.png') && main.includes('导出截图')],
  ['审美截图脚本存在', packageJson.includes('audit:screenshots') && acceptance.includes('audit-screenshots')],
  ['性能档位完整', ['low', 'medium', 'high', 'extreme'].every((id) => main.includes(`${id}: { label:`))],
  ['移动端控制面板可收纳', main.includes('panelOpen') && style.includes('.panel-toggle')],
  ['首屏默认收起控制面板', main.includes('panelOpen: false') && main.includes('useState(initialScene.panelOpen)') && style.includes('.experience.is-panel-closed .panel-toggle')],
  ['取景预设样式存在', style.includes('.view-row')],
  ['WebGL 上下文恢复提示存在', main.includes('webglcontextlost') && main.includes('webglcontextrestored') && main.includes('setWebglStatus') && style.includes('.webgl-status')],
  ['目标覆盖审计脚本存在', packageJson.includes('verify:goal') && acceptance.includes('目标覆盖审计')],
];

const failed = requiredChecks.filter(([, passed]) => !passed);

if (failed.length > 0) {
  console.error('静态自检失败：');
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log('静态自检通过：关键目标入口、展演取景预设、性能档位和展示控制均存在。');
