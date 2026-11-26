// Prueba: node tools/cap.mjs <dir> <n1,n2,...>  (n = número de frase, 1-based). "s" = secuencial desde el inicio.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const [out, lista = '1', espera = '2600'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('CONSOLE', m.text().slice(0, 240)); });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 400)));
await p.goto(process.env.URL || "http://localhost:4330/?directo", { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.__k, { timeout: 120000 });
await new Promise((r) => setTimeout(r, 3000));
for (const tok of lista.split(',')) {
  if (tok.startsWith('s')) { const k = +tok.slice(1); for (let i = 0; i < k; i++) { await p.keyboard.press('ArrowRight'); await new Promise((r) => setTimeout(r, +espera)); await p.screenshot({ path: `${out}/q${String(await p.evaluate(() => location.hash.slice(1))).padStart(3, '0')}.png` }); } continue; }
  const n = +tok; await p.evaluate((n) => window.__k.ir(n - 1, true), n);
  await new Promise((r) => setTimeout(r, +espera));
  await p.screenshot({ path: `${out}/b${String(n).padStart(3, '0')}.png` });
}
await b.close();
