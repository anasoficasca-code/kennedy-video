import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
await p.goto('http://localhost:4330/?directo', { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.__k, { timeout: 120000 });
for (const n of [2, 20, 38, 73, 107, 142]) { await p.evaluate((n) => window.__k.ir(n - 1, true), n); for (let s = 0; s < 6; s++) { await new Promise((r) => setTimeout(r, 2000)); } const ok = await p.evaluate(() => !!window.__k.W.gfoto?.ok); console.log('frase', n, 'foto', ok); }
await b.close();
