// Driver de «Red de problemas» (anasoficasca-code/red-de-problemas, copia en public/paginas/red/).
// La página corre sola, a pantalla completa y sin zoom: el driver solo hace lo que haría una persona
// (scroll suave por la historia, clic en un nodo que abre su panel) y mueve la cámara 3D de la red con suavidad.
// Estados: inicio · hero · red · red1 · nodo  (+ 'propuesta' para propuesta.html)
import gsap from 'gsap';
import { registrar, hasta } from '../pagina.js';

const NOMBRE = 'red';
// SECS: 0 portada · 1..6 pasos F,B,C,D,A,E · 7 «todo está conectado» · 8 red1 · 9 red2 · 10 fin (la red sola)
const SEC = { hero: 0, F: 1, B: 2, C: 3, D: 4, A: 5, E: 6, ex: 7, red1: 8, red2: 9, fin: 10 };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let gen = 0; // cada estado nuevo invalida al anterior (atrás/saltos)

/** mientras el marco de la página está oculto, su requestAnimationFrame no trabaja (la GPU queda para lo visible) */
export function pausarOculta(win) {
  if (win.__rpRaf) return; win.__rpRaf = 1;
  const marco = win.frameElement?.parentElement; if (!marco) return;
  const raf0 = win.requestAnimationFrame.bind(win), caf0 = win.cancelAnimationFrame.bind(win);
  const vis = () => marco.classList.contains('on');
  let n = 0; const vivos = new Map();
  win.requestAnimationFrame = (cb) => {
    const id = ++n;
    const pide = () => vivos.set(id, raf0((t) => {
      if (!vivos.has(id)) return;
      if (vis()) { vivos.delete(id); cb(t); } else { vivos.set(id, 0); setTimeout(() => { if (vivos.has(id)) pide(); }, 250); }
    }));
    pide(); return id;
  };
  win.cancelAnimationFrame = (id) => { const r = vivos.get(id); vivos.delete(id); if (r) caf0(r); };
}

/* ---------------------------------------------------------------- utilidades compartidas (también las usa redag.js) */
export const ev = (win, s) => win.eval(s);
/** scroll animado (o inmediato), como la rueda de una persona */
export function scrollA(win, y, d, rapido) {
  y = Math.max(0, Math.round(y));
  gsap.killTweensOf(win.__rpScroll || {});
  if (rapido || !d || Math.abs(win.scrollY - y) < 2) { win.scrollTo(0, y); return Promise.resolve(); }
  const o = (win.__rpScroll = { y: win.scrollY });
  return new Promise((res) => gsap.to(o, { y, duration: d, ease: 'power2.inOut', onUpdate: () => win.scrollTo(0, o.y), onComplete: res }));
}
/** «fundido a negro» corto para saltos largos dentro de la misma página (corte limpio de edición) */
export async function aNegro(win, fn, rapido) {
  const fr = win.frameElement;
  gsap.killTweensOf(win.__rpScroll || {}); // un scroll anterior no debe seguir moviendo la página después del salto
  if (rapido || !fr) { await fn(); return; }
  await new Promise((r) => gsap.to(fr, { opacity: 0, duration: 0.28, ease: 'power1.in', onComplete: r }));
  await fn();
  await espera(120);
  gsap.to(fr, { opacity: 1, duration: 0.45, ease: 'power1.out' });
}
/** posición en % de pantalla de un nodo de la red 3D */
export function nodoPct(win, k) {
  try { return JSON.parse(ev(win, `(()=>{const v=byId['${k}'].p.clone().project(cam);return JSON.stringify({x:(v.x+1)/2*100,y:(1-v.y)/2*100})})()`)); } catch (e) { return null; }
}
/** resalta relaciones reales de la red: on = ['BA','FB'…] (origen+destino, en cualquier sentido), prev = ya dichas (atenuadas) */
export function resaltar(win, on = [], prev = [], nodos = null) {
  const par = (k) => [k, k[1] + k[0]];
  const sOn = new Set(on.flatMap(par)), sPrev = new Set(prev.flatMap(par));
  const nod = new Set(nodos || on.flatMap((k) => [...k]));
  ev(win, 'focus(null)');
  ev(win, 'E').forEach((e) => { const k = e.s + e.t; e.ot = sOn.has(k) ? 1 : sPrev.has(k) ? 0.3 : 0.05; });
  ev(win, 'N').forEach((n) => { n.to = nod.has(n.id) ? 1 : 0.16; n.ts = nod.has(n.id) && nod.size <= 3 ? 1.08 : 1; });
}
export const quitarResalte = (win) => { try { ev(win, 'focus(null)'); ev(win, 'N').forEach((n) => { n.ts = 1; }); } catch (e) { /* */ } };
/**
 * cámara 3D de la red, con suavidad (el lienzo queda nítido). c = { k: nodo hacia el que se inclina la vista o null,
 * f: distancia relativa a la vista de la página (1 = la de la página), d: segundos }
 */
export function camRed(win, c = {}, rapido) {
  try {
    const cam = ev(win, 'cam'), ctl = ev(win, 'ctl'), V = win.THREE.Vector3;
    ev(win, 'tw=null;T0=T0===null?performance.now()-3000:Math.min(T0,performance.now()-3000)'); // sin el acercamiento de entrada
    const L0 = ev(win, '(typeof baseLen!=="undefined"&&baseLen)||(typeof BASE0!=="undefined"&&BASE0)||RED_POS.length()/1.85') * (c.f ?? 1);
    const fT = ctl.target.clone(), tT = c.k ? ev(win, `byId['${c.k}'].p.clone().multiplyScalar(${c.m ?? 0.35})`) : new V();
    const fL = cam.position.distanceTo(ctl.target);
    const p = { q: 0 };
    gsap.killTweensOf(win.__rpCam || {}); win.__rpCam = p;
    const aplica = () => {
      const dir = cam.position.clone().sub(ctl.target).normalize();
      ctl.target.lerpVectors(fT, tT, p.q);
      cam.position.copy(ctl.target).addScaledVector(dir, fL + (L0 - fL) * p.q);
    };
    if (rapido) { p.q = 1; aplica(); return; }
    gsap.to(p, { q: 1, duration: c.d ?? 3, ease: 'sine.inOut', onUpdate: aplica });
  } catch (e) { console.warn('[red] cámara', e); }
}
/** CSS común: colores del formato (tinta #0b0d10, lima #cfff5e, papel #f3f4ee) y sin interfaz de navegación */
export const CSS_FORMATO = `
  html{scroll-behavior:auto!important;scrollbar-width:none}
  ::-webkit-scrollbar{display:none}
  html,body{background:#0b0d10!important}
  body{color:#f3f4ee}
  header,.legend,#volver,.goconecto,.goprop,#tip,#cgcarga,.al-modelo,.mdl-ir,a.sig,.bajar{visibility:hidden!important;pointer-events:none!important}
  #cgfr{visibility:visible!important}
  .hero .hud,.hero .hmaq-n{visibility:hidden!important}
  h1,h2,h3{font-family:'Barlow Condensed','Geist',sans-serif!important}
  /* sin numeración de tarjetas ni de nodos («06 · 5 conex») */
  #lbls small,.cpb .n,#criterios .ey>b:first-child,#panel .gh::before,#panel .gh>b:first-child{display:none!important}
`;
/**
 * sin numeración de capítulo/tarjeta en la página («01 / 06», «06 · 5 conex», «03 · Valorización…»): la autora no la quiere.
 * Las cifras de datos se quedan. Vigila los elementos que la página arma después (capas, conectografía).
 */
export function sinNumeros(win, doc) {
  const limpia = () => {
    doc.querySelectorAll('#story .card .num').forEach((n) => {
      if (n.dataset.sn) return; n.dataset.sn = 1;
      const b = n.querySelector('b'); if (b) n.innerHTML = b.outerHTML; else n.style.display = 'none';
    });
    doc.querySelectorAll('.kc-tag .h, .cpb .n, #criterios .ey b, .ee-num').forEach((el) => {
      const w = doc.createTreeWalker(el, 4); let t;
      while ((t = w.nextNode())) { const v = t.nodeValue.replace(/^\s*\d{1,2}\s*(\/\s*\d{1,2})?\s*(·\s*)?/, ''); if (v !== t.nodeValue) t.nodeValue = v; }
    });
  };
  limpia();
  let pend = 0; new win.MutationObserver(() => { if (pend) return; pend = 1; win.setTimeout(() => { pend = 0; limpia(); }, 50); }).observe(doc.body, { childList: true, subtree: true });
}
export function fondoFormato(win) { try { ev(win, 'scene.background&&scene.background.set(0x0b0d10);scene.fog&&scene.fog.color.set(0x0b0d10)'); } catch (e) { /* */ } }

/* ---------------------------------------------------------------- driver */
function topSec(win, k) { const s = ev(win, 'SECS')[SEC[k]]; return s.getBoundingClientRect().top + win.scrollY; }
function ySec(win, k) {
  const s = ev(win, 'SECS')[SEC[k]], top = topSec(win, k);
  return (k === 'red1' || k === 'red2') ? top + s.offsetHeight / 2 - win.innerHeight / 2 : top;
}
const cerrarPanel = (win) => { try { if (ev(win, 'P.open')) ev(win, 'closePanel()'); } catch (e) { /* */ } };

/** portada: o.on = claves encendidas (F,B,C,D,A,E); o.nombres = las que se encienden una a una con o.paso ms */
async function portada(win, doc, o) {
  const yo = ++gen; cerrarPanel(win); quitarResalte(win);
  await scrollA(win, 0, 0, true);
  const hc = doc.querySelector('#story .hcard');
  const sp = [...doc.querySelectorAll('#story .hcard .seis span')];
  const prev = new Set(o.on || []);
  const sel = !!(o.nombres || o.on);
  doc.documentElement.classList.toggle('rp-sel', sel);
  sp.forEach((s) => s.classList.toggle('k-on', prev.has(s.dataset.k)));
  if (o.reanimar && !o.rapido) { hc.classList.remove('vis'); void hc.offsetWidth; setTimeout(() => hc.classList.add('vis'), 80); } else hc.classList.add('vis');
  for (const [i, k] of (o.nombres || []).entries()) {
    if (!o.rapido) await espera(i === 0 ? (o.pausa0 ?? 200) : (o.paso ?? 1200));
    if (yo !== gen) return;
    sp.find((x) => x.dataset.k === k)?.classList.add('k-on');
  }
}

registrar(NOMBRE, {
  url: './paginas/red/index.html',
  listo: async (win) => {
    pausarOculta(win);
    await hasta(() => win.eval('typeof SECS') !== 'undefined' && win.eval('SECS.length') === 11 && typeof win.pasoMapa === 'function', 30000);
    win.eval('CG.pre=1'); // la conectografía de esta versión no se usa (se usa la de alejagoguti-cpu, driver redag)
  },
  preparar: (win, doc) => {
    const st = doc.createElement('style');
    st.textContent = CSS_FORMATO + `
      /* nombrar los seis problemas uno a uno en la portada */
      #story .hcard .seis span{transition:opacity .45s ease,transform .6s cubic-bezier(.2,1.4,.4,1)!important}
      html.rp-sel #story .hcard .seis span:not(.k-on){opacity:.18!important}
      html.rp-sel #story .hcard .seis span.k-on{transform:scale(1.1)!important}
    `;
    doc.head.appendChild(st);
    doc.querySelectorAll('#story .hcard .seis span').forEach((s, i) => { s.dataset.k = 'FBCDAE'[i]; });
    fondoFormato(win); sinNumeros(win, doc);
  },
  estados: {
    /** portada sin selección (lo pueden usar otros capítulos) */
    inicio: (win, doc, o) => portada(win, doc, { ...o, on: null, nombres: null }),
    /** portada con los seis problemas nombrándose */
    hero: portada,
    /**
     * la red de seis nodos con relaciones reales resaltadas: o.on, o.prev, o.nodos, o.cam
     * desde la historia baja por «todo está conectado» (la ciudad se desarma y cada punto viaja a su problema)
     */
    red: async (win, doc, o) => {
      const yo = ++gen; cerrarPanel(win);
      doc.documentElement.classList.remove('rp-sel');
      const yFin = ySec(win, 'fin');
      if (!o.rapido && win.scrollY < topSec(win, 'ex') - 10) {
        await scrollA(win, topSec(win, 'ex') - win.innerHeight * 0.1, 1.0, false);
        if (yo !== gen) return;
        await scrollA(win, yFin, o.viaje ?? 3.0, false);
      } else await scrollA(win, yFin, 1.0, o.rapido);
      if (yo !== gen) return;
      await espera(o.rapido ? 0 : 60); if (yo !== gen) return;
      if (o.on || o.nodos) resaltar(win, o.on || [], o.prev || [], o.nodos); else quitarResalte(win);
      if (o.cam) camRed(win, o.cam, o.rapido);
    },
    /** tarjeta «Centralización: el nodo con más conexiones» (la página enfoca F y sus 5 relaciones) */
    red1: async (win, doc, o) => {
      const yo = ++gen; cerrarPanel(win); quitarResalte(win);
      doc.documentElement.classList.remove('rp-sel');
      await scrollA(win, ySec(win, 'red1'), 1.6, o.rapido);
      if (yo !== gen) return;
      if (o.cam) camRed(win, o.cam, o.rapido);
    },
    /** clic en el nodo F: la página vuela hacia él y abre su panel con las relaciones */
    nodo: async (win, doc, o) => {
      const yo = ++gen; quitarResalte(win);
      doc.documentElement.classList.remove('rp-sel');
      const k = o.k || 'F';
      if (Math.abs(win.scrollY - ySec(win, 'fin')) > 4) await scrollA(win, ySec(win, 'fin'), 1.0, o.rapido);
      if (yo !== gen) return;
      if (!o.rapido) { await espera(o.antes ?? 900); if (yo !== gen) return; }
      ev(win, `if(sel!==byId['${k}'])select(byId['${k}'])`);
      // la página vuela hacia el nodo: se suaviza (sin acercarse de golpe; la distancia se mantiene)
      ev(win, 'if(tw){const d=tw.fP.distanceTo(tw.fT),dir=tw.tP.clone().sub(tw.tT).normalize();tw.tT=tw.tT.clone().multiplyScalar(.45);tw.tP=tw.tT.clone().addScaledVector(dir,d*.9);tw.d=2400}');
      if (o.rapido) ev(win, 'if(tw){tw.t0=performance.now()-5000}');
      // el panel (dialog) toma el foco: se devuelve a la presentación para que el clicker siga avanzando
      try { win.document.activeElement?.blur(); win.parent.focus(); } catch (e) { /* */ }
    },
  },
});

/* ---------------------------------------------------------------- propuesta.html (por si otro capítulo la usa) */
registrar('propuesta', {
  url: './paginas/red/propuesta.html',
  listo: async (win) => { pausarOculta(win); await hasta(() => win.document.querySelector('#pcs')?.children.length > 0, 20000); },
  preparar: (win, doc) => {
    const st = doc.createElement('style');
    st.textContent = 'html{scroll-behavior:auto!important;scrollbar-width:none}::-webkit-scrollbar{display:none}body>nav,header,.top,.nav,.prog{visibility:hidden!important}';
    doc.head.appendChild(st);
  },
  estados: {
    inicio: async (win, doc, o) => { ++gen; await scrollA(win, 0, 0, true); },
    problemas: async (win, doc, o) => {
      const yo = ++gen;
      const s = doc.getElementById('problemas'); if (!s) return;
      const y0 = s.getBoundingClientRect().top + win.scrollY - win.innerHeight * 0.12;
      await scrollA(win, y0, 0, true);
      if (o.rapido) doc.querySelectorAll('#problemas .rv').forEach((e) => e.classList.add('in'));
      if (o.recorre && !o.rapido) { await espera(900); if (yo !== gen) return; await scrollA(win, y0 + win.innerHeight * 0.55, o.recorre, false); }
    },
  },
});
