// Mide el rendimiento: node tools/rend.mjs  → intervalo medio entre cuadros y nivel de calidad
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-frame-rate-limit'] });
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
p.on('console', (m) => { if (m.text().includes('calidad')) console.log('>>', m.text()); });
await p.goto('http://localhost:4330/?directo', { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.__k, { timeout: 120000 }); await new Promise((r) => setTimeout(r, 3000));
for (const [n, modo] of [[1, 'stop'], [20, 'stop'], [107, 'stop'], [20, 'fluido']]) {
  await p.evaluate((n) => window.__k.ir(n - 1, false), n);
  if (modo === 'fluido') await p.keyboard.press('s');
  await new Promise((r) => setTimeout(r, 2500));
  const r = await p.evaluate(() => new Promise((res) => { const t = []; let u = performance.now(); const f = () => { const a = performance.now(); t.push(a - u); u = a; if (t.length < 60) requestAnimationFrame(f); else res(t); }; requestAnimationFrame(f); }));
  const info = await p.evaluate(() => ({ nivel: window.__k.W.gob?.nivel, llamadas: window.__k.W.r.info.render.calls, tri: window.__k.W.r.info.render.triangles }));
  console.log('frase', n, modo, 'rAF medio', (r.reduce((a, b) => a + b, 0) / r.length).toFixed(1), 'ms', JSON.stringify(info));
}
const mem = await p.evaluate(() => (performance.memory?.usedJSHeapSize / 1048576).toFixed(0) + ' MB JS');
console.log(mem); await b.close();
