// Mide la fluidez frase por frase: node tools/fps.mjs [desde=1] [hasta=fin] [ms por frase=6000]
// Usa la GPU de alto rendimiento. Reporta mediana, p95 y peor cuadro (ms) de cada frase.
import puppeteer from 'puppeteer-core';
const [desde = '1', hasta = '999', ms = '6000'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, protocolTimeout: 120000,
  args: ['--force_high_performance_gpu', '--ignore-gpu-blocklist', '--window-size=1600,900', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 200)));
await p.goto(process.env.URL || 'http://localhost:5199/?directo', { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.__k, { timeout: 120000 });
console.log('GPU:', await p.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; }));
await p.evaluate(() => { window.__dt = []; let t0 = performance.now(); const f = (t) => { window.__dt.push(t - t0); t0 = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
await new Promise((r) => setTimeout(r, 25000)); // portada
if (process.env.PRE) { const t0 = Date.now(); await p.keyboard.press('g'); while (!(await p.evaluate(() => /Listo/.test(document.getElementById('precarga')?.textContent || '')))) await new Promise((r) => setTimeout(r, 3000)); console.log('precarga', ((Date.now() - t0) / 1000).toFixed(0), 's'); }
const total = await p.evaluate(() => window.__k.BEATS.length);
for (let n = +desde; n <= Math.min(+hasta, total); n++) {
  if (n > 1) { await p.evaluate((n) => window.__k.ir(n - 1, true), n); }
  await p.evaluate(() => (window.__dt = []));
  await new Promise((r) => setTimeout(r, +ms));
  const d = await p.evaluate(() => window.__dt.slice());
  d.sort((a, b) => a - b); const q = (k) => d[Math.min(d.length - 1, Math.floor(d.length * k))] || 0;
  const ci = await p.evaluate((n) => window.__k.BEATS[n - 1].ci, n);
  console.log(`frase ${String(n).padStart(3)} cap ${ci}  med ${q(0.5).toFixed(1)}  p95 ${q(0.95).toFixed(1)}  peor ${d[d.length - 1]?.toFixed(0)}  ${(1000 / q(0.5)).toFixed(0)} fps`);
}
await b.close();
