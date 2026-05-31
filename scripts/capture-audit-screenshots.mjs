import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

const auditProfile = process.env.AUDIT_PROFILE || 'medium';
const scenes = [
  ['suanbird', `preset=suanbird&profile=${auditProfile}&demo=off&panel=closed`],
  ['network', `preset=network&profile=${auditProfile}&demo=off&panel=closed`],
  ['city-confluence', `preset=confluence&profile=${auditProfile}&demo=off&panel=closed`],
  ['birth', `preset=birth&profile=${auditProfile}&demo=off&panel=closed`],
];

const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chromePath) {
  console.error('未找到 Chrome/Edge，无法生成审美验收截图。');
  process.exit(1);
}

const baseUrl = process.env.AUDIT_BASE_URL || 'http://localhost:5174/';
const outputDir = resolve('audit-screenshots');
await mkdir(outputDir, { recursive: true });

function capture(sceneName, query) {
  const outputPath = resolve(outputDir, `${sceneName}.png`);
  const userDataDir = resolve(outputDir, `.chrome-profile-${sceneName}`);
  const url = `${baseUrl}?${query}&immersive=on&speed=0.8&density=0.72`;
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    '--virtual-time-budget=5200',
    `--user-data-dir=${userDataDir}`,
    `--screenshot=${outputPath}`,
    url,
  ];

  return new Promise((resolveCapture, reject) => {
    const child = spawn(chromePath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const timer = setTimeout(() => {
      if (child.pid) {
        spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      }
      reject(new Error(`截图超时：${sceneName}`));
    }, 45000);
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`截图失败：${sceneName}\n${stderr}`));
        return;
      }
      const size = existsSync(outputPath) ? statSync(outputPath).size : 0;
      if (size < 50000) {
        reject(new Error(`截图疑似黑屏或空画布：${sceneName} (${size} bytes)`));
        return;
      }
      resolveCapture(outputPath);
    });
  });
}

const results = [];
const failures = [];
for (const [sceneName, query] of scenes) {
  // 串行截图，避免多个 Chrome 同时争抢 GPU/WebGL 资源。
  try {
    results.push(await capture(sceneName, query));
  } catch (error) {
    failures.push(`${sceneName}: ${error.message}`);
  }
}

console.log('审美验收截图已生成：');
results.forEach((file) => console.log(`- ${file}`));

if (failures.length > 0) {
  console.error('\n部分审美截图生成失败：');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = results.length > 0 ? 0 : 1;
}
