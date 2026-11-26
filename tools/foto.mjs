// ¿Se activa la fotogrametría? node tools/foto.mjs  → segundos hasta activarse y estado de las teselas
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
await p.goto(process.env.URL || 'http://localhost:4330/?directo', { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.__k, { timeout: 120000 });
for (let s = 2; s <= 30; s += 2) {
  await new Promise((r) => setTimeout(r, 2000));
  const e = await p.evaluate(() => { const g = window.__k.W.gfoto; const st = g?.tiles?.stats || {}; return { ok: !!g?.ok, cargadas: g?.cargadas, vis: st.visible, desc: st.downloading, parse: st.parsing }; });
  console.log(s + ' s', JSON.stringify(e)); if (e.ok) break;
}
await b.close();
