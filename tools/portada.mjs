import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const out = process.argv[2];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
await p.goto('http://localhost:4330/', { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.__k, { timeout: 120000 }); await new Promise((r) => setTimeout(r, 6000));
await p.click('#empezar'); // como la usuaria: pantalla de inicio → Comenzar
await new Promise((r) => setTimeout(r, 4000)); await p.screenshot({ path: out + '/p1.png' });
await new Promise((r) => setTimeout(r, 12000)); await p.screenshot({ path: out + '/p2.png' });
await p.keyboard.press('ArrowRight'); await new Promise((r) => setTimeout(r, 14000)); await p.screenshot({ path: out + '/p3.png' });
await b.close();
