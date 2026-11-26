// Visor «Indicadores en 3D» (picos/index.html): los picos de cada índice sobre el territorio de Kennedy.
// Los estados eligen índices y encuadran la cámara con las mismas variables del visor (selected, sync, controls…).
import gsap from 'gsap';
import { registrar, hasta } from '../pagina.js';

const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const nuevo = (win) => (win.__tok = (win.__tok || 0) + 1);

const CSS = `
#side,.seg,#pPlan,#hint,#menuBtn{display:none!important}
#notice{display:none!important}
html,body{background:#000}
`;

/** índices → posición en el marco de los picos (m, x este / y norte) → escena (1 unidad = 10 m) */
const esc = (xm, ym) => [xm * 0.1, -ym * 0.1];
// Zonas de datos (calculadas con CCL.json y SE.json): máximo de CCL y sector donde CCL alto coincide con SE bajo
const PICO_CCL = esc(-1086, -790);
const COINCIDE = esc(-1001, -750);

function elegir(win, codigos) {
  const ids = codigos.map((c) => win.eval(`ind.findIndex(o=>o.d.code==='${c}'&&!o.d.year)`));
  win.document.getElementById('multi').checked = codigos.length > 1;
  win.eval(`setStack(false);selected=new Set([${ids}]);lastSel=${ids[ids.length - 1]};sync()`);
  return ids;
}
/** en un salto no hay animación: los picos ya están a su altura */
function crecidos(win) { win.eval('ind.forEach(o=>{if(o.group)o.t=o.on?1:0});dirty=true'); }

/** mueve la cámara ortográfica del visor: objetivo (escena), zoom y velocidad de giro */
function mover(win, { x, z, zoom, giro = 0.5, d = 2.6, rapido = false }) {
  const c = win.eval('controls'), cam = win.eval('camera');
  const y = win.eval(`terrainH(${x},${-z})`) + 6;
  const p = { k: 0, x0: c.target.x, y0: c.target.y, z0: c.target.z, zm0: cam.zoom };
  c.autoRotate = true; c.autoRotateSpeed = giro;
  const poner = (k) => {
    const tx = p.x0 + (x - p.x0) * k, ty = p.y0 + (y - p.y0) * k, tz = p.z0 + (z - p.z0) * k;
    cam.position.x += tx - c.target.x; cam.position.y += ty - c.target.y; cam.position.z += tz - c.target.z;
    c.target.set(tx, ty, tz); cam.zoom = p.zm0 + (zoom - p.zm0) * k; cam.updateProjectionMatrix();
  };
  gsap.killTweensOf(p); win.__camTw?.kill();
  if (rapido) { poner(1); return null; }
  win.__camTw = gsap.to(p, { k: 1, duration: d, ease: 'power3.inOut', onUpdate: () => poner(p.k) });
  return win.__camTw;
}

registrar('picos', {
  url: './paginas/picos/index.html',
  listo: async (win) => { await hasta(() => win.document.getElementById('loading')?.style.display === 'none' && win.eval('ind.length'), 45000, 120); },
  preparar: (win, doc) => {
    const st = doc.createElement('style'); st.textContent = CSS; doc.head.appendChild(st);
    // se construyen las mallas de CCL y SE de antemano para que al aparecer solo crezcan
    for (const c of ['CCL', 'SE']) win.eval(`(()=>{const i=ind.findIndex(o=>o.d.code==='${c}'&&!o.d.year);if(!ind[i].group)build(i);})()`);
    win.eval('planOn=false;controls.autoRotate=true;selected=new Set();sync();ind.forEach(o=>{o.t=0});dirty=true');
  },
  estados: {
    /** CCL solo: la superficie crece desde el territorio y la cámara se acerca a su pico */
    ccl: async (win, doc, o) => {
      nuevo(win);
      elegir(win, ['CCL']);
      if (o.rapido) { crecidos(win); mover(win, { x: PICO_CCL[0], z: PICO_CCL[1], zoom: 1.6, rapido: true }); return; }
      mover(win, { x: 0, z: 0, zoom: 1, giro: 0.5, rapido: true });
      await esp(500);
      mover(win, { x: PICO_CCL[0], z: PICO_CCL[1], zoom: 1.6, giro: 0.6, d: 3.4 });
    },
    /** SE solo: la cobertura vegetal, con sus vacíos */
    se: async (win, doc, o) => {
      nuevo(win);
      elegir(win, ['SE']);
      if (o.rapido) { crecidos(win); mover(win, { x: 0, z: 0, zoom: 1.35, rapido: true }); return; }
      mover(win, { x: 0, z: 0, zoom: 1.35, giro: 0.6, d: 3 });
    },
    /** CCL y SE juntos («Ver varios a la vez»); la cámara baja al sector donde coinciden */
    ambos: async (win, doc, o) => {
      nuevo(win);
      elegir(win, ['CCL', 'SE']);
      if (o.rapido) { crecidos(win); mover(win, { x: COINCIDE[0], z: COINCIDE[1], zoom: 1.45, rapido: true }); return; }
      mover(win, { x: 0, z: 0, zoom: 1, giro: 0.5, rapido: true });
      await esp(900);
      mover(win, { x: COINCIDE[0], z: COINCIDE[1], zoom: 1.45, giro: 0.7, d: 3.2 });
    },
  },
});
