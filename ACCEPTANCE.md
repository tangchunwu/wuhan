# 武汉蒜鸟粒子网络验收审计

更新时间：2026-05-31

## 当前结论

项目已经具备完整的第五期作品形态：全屏 3D 粒子星云、原创蒜鸟主体、武汉城市记忆层、动态图网络、交互反馈、性能档位、移动端降级、沉浸展示、截图导出和作品化 HUD 文案。

这份文档用于把 `PROJECT_GOAL.md` 的目标映射到当前实现证据。审美类目标仍需要人工观看确认，工程类目标已通过构建、运行时截图和像素检查持续验证。

## 工程证据

- 构建命令：`npm run build`
- 静态自检：`npm run verify:static`
- 目标覆盖审计：`npm run verify:goal`
- 完整验证：`npm run verify:all`
- 本地服务：`http://localhost:5174/`
- 主实现：`src/main.jsx`
- 样式：`src/style.css`
- 阶段复盘：`RETROSPECTIVE.md`

## 目标覆盖

### 视觉底座

- 黑色深空背景：已实现。
- 深空间星尘 / 景深暗场：已实现，见 `deep-space-dust`。
- 中心白光爆发：已实现，见 `createCentralBurst()`。
- 城市能量诞生涡旋：已实现，见 `city-birth-vortex`，外围城市网络能量常态向中心汇聚。
- 中心关系光束：已实现，见 `central-relation-rays`，从中心白光向外围网络辐射细密关系线，强化 GraphPU 参考里的核心节点扩散感。
- 江城声纹层：已实现，见 `jiangcheng-voice-waves`，用环形声波、街巷声纹线和微粒脉冲表达方言幽默与烟火气被编码进图谱。
- 武汉三镇拓扑场：已实现，见 `wuhan-town-topology`，以汉口、汉阳、武昌三个空间场和桥接脉冲表达城市骨架。
- 城市记忆编码雨：已实现，见 `city-memory-code-rain`，从武汉记忆热点持续向中心投递微粒，强化城市记忆编码成蒜鸟能量体的常态叙事。
- 武汉记忆谱系轨道：已实现，见 `wuhan-memory-orbit-field`，用低透明轨道、记忆弦线和微粒把热点关系包裹成中心外的城市记忆层。
- 密集粒子星云：已实现，核心粒子池 `PARTICLE_COUNT = 100000`。
- 外围球形网络：已实现，网络节点 `NETWORK_NODE_COUNT = 3600`，边线 `NETWORK_EDGE_COUNT = 9600`。
- 半透明发光线条和 Bloom：已实现，使用 `LineSegments`、`ShaderMaterial`、`EffectComposer`、`UnrealBloomPass`。
- 主网络深度扫描：已实现，见 `vDepthFade`、`vScan` 与 `spatialSweep`，节点和边线会按空间深度衰减，并在网络态出现克制扫描高光。
- 图计算波面：已实现，见 `graph-compute-wavefronts`，网络态、城市态和爆发态中会出现从中心扩散的计算波壳，强化 GraphPU 式“图谱正在运算”的活体感。
- 审美显影参数：已实现，见 `READABILITY_TUNING`，用于压住网络态/城市态过曝，同时让蒜鸟身份锚点在复杂图谱中更稳定可见。

代表截图：

- `verification-extreme-100k.png`
- `verification-network-shader.png`
- `verification-mode-transition-city.png`

### 原创蒜鸟主体

- 蒜形身体：已实现，粒子目标点与线稿骨架共同表达。
- 鸟头、尖喙、小眼睛：已实现，并通过管状几何强化。
- 顶部蒜苗叶片：已实现。
- 两侧翅膀光轨：已实现。
- 尾部粒子拖尾：已实现。
- 星云到蒜鸟 morph：已实现，核心粒子在 Shader 中完成 morph。
- 蒜鸟生命脉冲：已实现，见 `vLifePulse`、`lifeWave` 与 `leafMask`，蒜鸟态中蒜瓣、蒜苗和翅膀粒子会出现克制呼吸光流。
- 蒜鸟识别锚点：已实现，新增蒜瓣轮廓、蒜苗冠结、鸟颈轮廓、脸颊呼吸线和翅尖光线。
- 复杂模式前景显影：已实现，蒜鸟身份锚点在城市态与网络态中有额外前景权重，降低被中心白光和网络线吞没的概率。

代表截图：

- `verification-suanbird-composition-refined.png`
- `verification-suanbird-face-final.png`
- `verification-copy-suanbird.png`

### 武汉城市记忆层

- 长江 / 汉水光流：已实现，见 `createRiverCurve()`。
- 长江 / 汉水流动粒子：已实现，见 `river-flow-packets`。
- 黄鹤楼线稿：已实现。
- 长江大桥线稿：已实现。
- 黄鹤楼 / 长江大桥地标脉冲：已实现，见 `landmark-pulse-packets`。
- 樱花粒子：已实现，见 `sakura-drift`。
- 橙红小火花：已实现，见 `ember-sparks`。
- 方言 / 烟火气声纹：已实现，见 `jiangcheng-voice-waves`，蒜鸟态、城市态和爆发态增强，网络态轻微保留。
- 汉口 / 汉阳 / 武昌三镇拓扑：已实现，见 `wuhan-town-topology`，城市态和网络态中作为底层结构浮现。
- 城市记忆编码雨：已实现，见 `city-memory-code-rain`，城市态和网络态更明显，蒜鸟态作为低强度供能保留。
- 武汉记忆谱系轨道：已实现，见 `wuhan-memory-orbit-field`，城市态和网络态中强化热点关系的空间谱系，爆发态中参与中心诞生叙事。
- 城市记忆热点：已实现，包含 10 个武汉节点。
- 城市记忆关系线：已实现，见 `WUHAN_MEMORY_LINKS` 与 `memory-link-lines`。

代表截图：

- `verification-city-readable.png`
- `verification-ember-sparks-city.png`
- `verification-memory-links-city.png`

### 交互

- 拖拽旋转 / 滚轮缩放：已实现，使用 `OrbitControls`。
- 自动巡航：已实现。
- 暂停巡航：已实现。
- 真实暂停 / 恢复动画：已实现。
- 悬停扰动：已实现，Shader 响应 `uPointer`。
- 悬停力场可视化：已实现，见 `pointer-field`。
- 点击爆发与回流：已实现，Shader 响应 `uClick`。
- 局部点击扩散波：已实现，见 `click-ripple`。
- 城市热点 hover / click HUD：已实现。

代表截图：

- `verification-pointer-field.png`
- `verification-click-ripple-center.png`
- `verification-hotspot-interaction.png`
- `verification-paused-animation.png`

### 模式系统

- 星云态：已实现。
- 蒜鸟态：已实现。
- 城市态：已实现。
- 网络态：已实现。
- 爆发态：已实现。
- 模式切换叙事脉冲：已实现，见 `mode-transition-pulse`。
- 主网络沿边流动光脉冲：已实现，见 `network-flow-packets`。
- 中心到外围关系辐射：已实现，见 `central-relation-rays`，网络态和爆发态增强，蒜鸟态自动克制。
- 网络深度与扫描高光：已实现，主网络 Shader 对节点和边线加入深度雾化与空间扫描波，强化 GraphPU 式图谱运算感。
- 图计算波面：已实现，低透明波面随网络态和热点锁定呼吸，给外围关系图谱增加“计算正在发生”的空间节奏。

代表截图：

- `verification-copy-nebula.png`
- `verification-copy-suanbird.png`
- `verification-copy-network.png`
- `verification-mode-transition-suanbird.png`

### 性能与展示

- 性能档位：已实现，轻量 / 均衡 / 高密 / 极限。
- 桌面 1 万到 5 万粒子：已实现，均衡约 18000，高密约 48000。
- 高性能 10 万粒子：已实现，极限档 100000。
- 移动端 3000 到 8000 粒子：已实现，移动高 DPR 验证约 4680。
- 自适应 DPR 质量守护：已实现。
- FPS / 质量读数：已实现。
- WebGPU 能力与降级状态读数：已实现。
- WebGL 上下文丢失 / 恢复提示：已实现，浏览器暂停或恢复上下文时会在控制面板给出低干扰状态反馈。
- 沉浸展示模式：已实现。
- 截图导出：已实现。
- 一键展演取景预设：已实现，全景 / 蒜鸟 / 城市 / 网络 / 三镇 / 声纹 / 诞生 / 江汇八个展示镜头可快速切换。
- 自动演示诞生序章：已实现，见 `DEMO_PROLOGUE_SEQUENCE`，按星云、网络、城市、蒜鸟、爆发调度模式与城市记忆焦点。
- 自动演示镜头导演：已实现，序章每一段都会同步触发对应取景预设，让模式、城市记忆和真实 Three 相机一起推进。
- 审美巡检序列：已实现，见 `AESTHETIC_AUDIT_SEQUENCE`，可按固定镜头检查蒜鸟识别、GraphPU 质感、武汉城市层、色彩比例和诞生爆发。
- URL 级取景复现：已实现，支持 `?preset=suanbird&demo=off&immersive=on`、`?preset=network&demo=off` 等入口，便于固定复现蒜鸟、网络、城市、诞生镜头。
- 审美验收截图：已实现，`npm run audit:screenshots` 会用系统 Chrome 生成 `audit-screenshots/suanbird.png`、`network.png`、`city-confluence.png`、`birth.png` 四张固定镜头截图，并带基础黑屏体积检查。
- 首屏作品化展示：已实现，桌面与移动端默认收起控制面板，只保留极简“控制”入口，让 3D 主视觉优先出现。

代表截图：

- `verification-device-stats-desktop.png`
- `verification-device-stats-mobile.png`
- `verification-immersive-hidden.png`
- `verification-paused-animation.png`

## 展示与验收辅助

- `CAMERA_PRESETS` 已定义全景、蒜鸟、城市、网络、三镇、声纹、诞生、江汇八个固定构图。
- URL 参数支持 `preset`、`mode`、`profile`、`density`、`speed`、`intensity`、`demo`、`audit`、`panel`、`immersive`、`paused`，用于录屏、审美复核和回归截图。
- 点击取景预设会退出自动演示、切换对应模式，并平滑移动真实 Three 相机。
- 三镇、声纹、诞生、江汇等展演预设会同步锁定相关城市记忆，便于录屏和现场演示直接进入叙事焦点。
- 演示模式会发布 `demoBeat`，用克制短句同步当前叙事段落，不新增喧宾夺主的说明页面。
- 演示模式会发布 `DEMO_CAMERA_SEQUENCE`，自动调用全景、网络、城市、声纹、诞生镜头完成开场导演调度。
- 控制面板提供“审美巡检”入口，触发 `AESTHETIC_AUDIT_SEQUENCE`，帮助人工按固定镜头复核尚不能由脚本判断的审美目标。
- 控制面板默认收起，展开后提供“取景预设”工具行，用于展览调试、录屏构图和阶段截图。
- `npm run verify:static` 会检查核心目标入口、五种模式、八个展演取景预设、性能档位、截图导出与控制面板收纳能力是否仍存在。
- `npm run verify:goal` 会按核心概念、GraphPU 视觉底座、蒜鸟主体、武汉城市记忆层、互动模式、性能交付和展演叙事七组检查目标覆盖。
- `npm run verify:all` 会串联静态自检、目标覆盖审计和生产构建，作为阶段交付前的完整工程验证。
- `npm run audit:screenshots` 会生成可视化审美证据，默认使用均衡档和较低截图密度，避免把截图流程变成性能压力测试。

## 尚需人工审美确认

- 蒜鸟识别锚点已补强，但“第一眼能看出蒜 + 鸟 + 蒜苗”的审美强度仍建议人工观看确认。
- GraphPU 参考质感是否已经达到用户心中的最终强度；当前已做一轮过曝压制，仍建议继续人工对比参考图。
- 城市态中黄鹤楼、长江大桥、长江 / 汉水是否在不同视角下都足够可读。
- 色彩比例是否稳定接近黑底 70%、白光青绿 20%、粉金橙 10%。
- 官网首屏或展览大屏的最终默认模式应选择星云态、蒜鸟态还是演示模式。

## 下一步建议

- 做一次人工观看审美审计：桌面打开 `http://localhost:5174/`，依次查看五个模式和沉浸模式。
- 也可以展开控制面板点击“审美巡检”，让系统自动按蒜鸟、网络、城市、色彩、诞生五段镜头完成观看路线。
- 根据人工观看结果微调默认相机、Bloom、蒜鸟态构图和城市态亮度。
- 如需继续冲更高级别性能，再评估 WebGPU Compute Shader 或 Worker 路线。
