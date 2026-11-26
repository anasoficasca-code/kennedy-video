// Captura en celular vertical: node tools/movil.mjs <dir> <frases>
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const [out, lista = '10'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage();
await p.emulate({ viewport: { width: 412, height: 892, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36' });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 300)));
await p.goto(process.env.URL || 'http://localhost:4330/?directo', { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.__k, { timeout: 120000 }); await new Promise((r) => setTimeout(r, 3000));
for (const n of lista.split(',').map(Number)) { await p.evaluate((n) => window.__k.ir(n - 1, true), n); await new Promise((r) => setTimeout(r, 16000)); await p.screenshot({ path: `${out}/m${String(n).padStart(3, '0')}.png` }); }
await b.close();
