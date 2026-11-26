// Driver de «Red de problemas» (anasoficasca-code/red-de-problemas, copia en public/paginas/red/).
// index.html: portada con los seis problemas, mapa #mk con un paso por problema (F,B,C,D,A,E), red 3D de seis nodos
// (11 relaciones reales) y conectografía. Todo se maneja por JS (mismo origen): scroll a cada sección, resaltado de
// relaciones reales, pasoMapa() del mapa y zoom de cámara sobre elementos reales de la página.
import gsap from 'gsap';
import { registrar, hasta, camara, precargar } from '../pagina.js';

const NOMBRE = 'red';
// orden de las secciones de la historia (SECS): 0 portada · 1..6 pasos F,B,C,D,A,E · 7 «todo está conectado» · 8 red1 · 9 red2 · 10 fin
const SEC = { hero: 0, F: 1, B: 2, C: 3, D: 4, A: 5, E: 6, ex: 7, red1: 8, red2: 9, fin: 10 };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let gen = 0; // cada estado nuevo invalida al anterior (atrás/saltos)

/* la página se empieza a cargar (oculta) cuando la presentación llega al capítulo 04 → en el 05 aparece de una vez */
try {
  const bc = new BroadcastChannel('kennedy-presentacion');
  bc.onmessage = (m) => { const d = m.data || {}; if (d.tipo === 'estado' && /^0[456]/.test(d.cap || '')) precargar(NOMBRE); if (d.tipo === 'estado' && /^06/.test(d.cap || '')) precargar('propuesta'); };
} catch (e) { /* sin BroadcastChannel */ }

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

/* ---------------------------------------------------------------- utilidades sobre la página */
const ev = (win, s) => win.eval(s);
function topSec(win, k) { const s = ev(win, 'SECS')[SEC[k]]; return s.getBoundingClientRect().top + win.scrollY; }
/** y de scroll que deja la sección k donde la página la lee: los pasos y la portada arriba, las tarjetas de la red centradas */
function ySec(win, k) {
  const s = ev(win, 'SECS')[SEC[k]], top = topSec(win, k);
  if (k === 'red1' || k === 'red2') return top + s.offsetHeight / 2 - win.innerHeight / 2;
  return top;
}
/** scroll animado (o inmediato) */
function scrollA(win, y, d, rapido) {
  y = Math.max(0, Math.round(y));
  gsap.killTweensOf(win.__rpScroll || {});
  if (rapido || !d || Math.abs(win.scrollY - y) < 2) { win.scrollTo(0, y); return Promise.resolve(); }
  const o = (win.__rpScroll = { y: win.scrollY });
  return new Promise((res) => gsap.to(o, { y, duration: d, ease: 'power2.inOut', onUpdate: () => win.scrollTo(0, o.y), onComplete: res }));
}
/** rectángulo (unión) de uno o varios selectores, en % de la pantalla */
function rectPct(win, sel, raiz) {
  const r0 = raiz || win.document;
  const els = sel.split('|').map((s) => r0.querySelector(s.trim())).filter(Boolean);
  if (!els.length) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  els.forEach((e) => { const r = e.getBoundingClientRect(); x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); });
  const W = win.innerWidth, H = win.innerHeight;
  return { x: (x0 + x1) / 2 / W * 100, y: (y0 + y1) / 2 / H * 100, w: (x1 - x0) / W, h: (y1 - y0) / H };
}
/** posición en % de un nodo de la red 3D */
export function nodoPct(win, k) {
  try { return JSON.parse(ev(win, `(()=>{const v=byId['${k}'].p.clone().project(cam);return JSON.stringify({x:(v.x+1)/2*100,y:(1-v.y)/2*100})})()`)); } catch (e) { return { x: 50, y: 50 }; }
}
/**
 * cámara del video sobre la página: z = { sel, s, dx, dy, d } (sel: selector CSS, 'svg' = mapa, 'nodo:F' = nodo de la red)
 * si no se da s, se calcula para que el elemento ocupe ~`llena` de la pantalla
 */
function zoom(win, z, rapido, raiz) {
  if (!z) { camara({ x: 50, y: 50, s: 1, d: rapido ? 0 : 1.6 }); return; }
  let p = null;
  if (z.sel?.startsWith('nodo:')) p = nodoPct(win, z.sel.slice(5));
  else if (z.sel === 'svg') p = rectPct(win, '#mksvg');
  else if (z.sel) p = rectPct(win, z.sel, raiz);
  if (!p) p = { x: 50, y: 50, w: 1, h: 1 };
  const llena = z.llena ?? 0.78;
  const s = z.s ?? Math.max(1, Math.min(2.4, llena / Math.max(p.w || 0.01, (p.h || 0.01) * 1.0)));
  camara({ x: p.x + (z.dx || 0), y: p.y + (z.dy || 0), s, d: rapido ? 0 : (z.d ?? 2.2), ease: z.ease || 'power3.inOut' });
}
/** vuelve a disparar la animación de entrada de una tarjeta de la historia (gráficos y contadores) */
function reanimar(win, el) {
  if (!el) return;
  el.classList.add('rp-keep'); el.classList.remove('vis'); void el.offsetWidth;
  setTimeout(() => { el.classList.add('vis'); el.classList.remove('rp-keep'); try { win.contar(el); } catch (e) { /* sin contadores */ } }, 60);
}
/** apaga la conectografía si estaba armada */
function sinConecto(win, rapido) {
  try {
    if (ev(win, 'CG.to')) { ev(win, 'cgIr(false)'); if (rapido) ev(win, 'CG.t0=performance.now()-20000'); }
  } catch (e) { /* aún no se armó */ }
}
/** resalta relaciones reales de la red: on = ['BA','FB'…] (origen+destino), prev = ya dichas (atenuadas), nodos */
function resaltar(win, on = [], prev = [], nodos = null) {
  const sOn = new Set(on), sPrev = new Set(prev);
  const nod = new Set(nodos || on.flatMap((k) => [...k]));
  win.__rpRes = { on, prev, nodos: [...nod] };
  ev(win, 'focus(null)');
  ev(win, 'E').forEach((e) => { const k = e.s + e.t; e.ot = sOn.has(k) ? 1 : sPrev.has(k) ? 0.32 : 0.05; });
  ev(win, 'N').forEach((n) => { n.to = nod.has(n.id) ? 1 : 0.16; n.ts = nod.has(n.id) && nod.size <= 3 ? 1.1 : 1; });
}
const quitarResalte = (win) => { win.__rpRes = null; try { ev(win, 'N').forEach((n) => { n.ts = 1; }); } catch (e) { /* */ } };

/** coloca la historia en la sección k, con o sin recorrido animado */
async function irSeccion(win, k, o, d = 1.4) {
  const y = ySec(win, k);
  await scrollA(win, y, d, o.rapido);
}

/* ---------------------------------------------------------------- driver */
registrar(NOMBRE, {
  url: './paginas/red/index.html',
  listo: async (win) => {
    pausarOculta(win);
    await hasta(() => win.eval('typeof SECS') !== 'undefined' && win.eval('SECS.length') === 11 && win.eval('!!MK.svg') && typeof win.pasoMapa === 'function', 30000);
  },
  preparar: (win, doc) => {
    const st = doc.createElement('style');
    st.textContent = `
      html{scroll-behavior:auto!important;scrollbar-width:none}
      ::-webkit-scrollbar{display:none}
      header,.legend,#volver,.goconecto,.goprop,#tip,#dv,#cgcarga{visibility:hidden!important;pointer-events:none!important}
      /* la conectografía del módulo 12 debe cargar visible (opacidad 0) para ubicar bien sus burbujas */
      #cgfr{visibility:visible!important}
      /* nombrar los seis problemas uno a uno en la portada */
      #story .hcard .seis span{transition:opacity .45s ease,filter .45s ease,transform .6s cubic-bezier(.2,1.4,.4,1)!important}
      html.rp-sel #story .hcard .seis span:not(.k-on){opacity:.14!important;filter:grayscale(1)!important}
      html.rp-sel #story .hcard .seis span.k-on{transform:scale(1.14)!important}
      /* volver a animar una tarjeta: se mantiene visible mientras sus gráficos vuelven a cero */
      #story .card.rp-keep{opacity:1!important;transform:none!important}
      #story .card.esc.rp-keep>*{opacity:1!important;transform:none!important;transition:none!important}
      #story .card.rp-keep *{transition:none!important}
      /* tarjetas de la red ocultas mientras se recorre hacia la red completa */
      html.rp-sinrd #story .rd .card{visibility:hidden!important}
      /* marca sobre la frase que dice la voz */
      #story .frase.rp-marca{outline:1px solid var(--c,#cfff5e);outline-offset:8px;background:rgba(255,255,255,.035);transition:outline-color .4s}
    `;
    doc.head.appendChild(st);
    // la portada: cada ícono sabe qué problema es (mismo orden de la página: F,B,C,D,A,E)
    doc.querySelectorAll('#story .hcard .seis span').forEach((s, i) => { s.dataset.k = 'FBCDAE'[i]; });
  },
  estados: {
    /** portada con los seis problemas. o.nombres: claves que se encienden una a una (o.previos ya encendidas), o.zoom */
    hero: async (win, doc, o) => {
      const yo = ++gen; sinConecto(win, true); quitarResalte(win);
      doc.documentElement.classList.remove('rp-sinrd');
      await scrollA(win, 0, 0, true);
      const hc = doc.querySelector('#story .hcard');
      const sp = [...doc.querySelectorAll('#story .hcard .seis span')];
      const prev = new Set(o.previos || []);
      if (o.nombres || o.previos) { doc.documentElement.classList.add('rp-sel'); sp.forEach((s) => s.classList.toggle('k-on', prev.has(s.dataset.k))); }
      else { doc.documentElement.classList.remove('rp-sel'); sp.forEach((s) => s.classList.remove('k-on')); }
      if (o.reanimar && !o.rapido) { hc.classList.remove('vis'); void hc.offsetWidth; setTimeout(() => hc.classList.add('vis'), 80); }
      else hc.classList.add('vis');
      zoom(win, o.zoom, o.rapido);
      for (const [i, k] of (o.nombres || []).entries()) {
        if (!o.rapido) await espera(i === 0 ? (o.pausa0 ?? 250) : (o.paso ?? 1150));
        if (yo !== gen) return;
        const s = sp.find((x) => x.dataset.k === k); s?.classList.add('k-on');
        if (o.sigue && !o.rapido && s) zoom(win, { sel: `#story .hcard .seis span[data-k="${k}"]`, s: o.sigue, d: 1.1 }, false);
      }
      if (o.final && !o.rapido) { await espera(900); if (yo === gen) zoom(win, o.final, false); }
    },
    /** red 3D de seis nodos con relaciones reales resaltadas: o.on, o.prev, o.nodos, o.zoom */
    red: async (win, doc, o) => {
      const yo = ++gen; sinConecto(win, o.rapido);
      doc.documentElement.classList.remove('rp-sel');
      const yFin = ySec(win, 'fin');
      if (!o.rapido && win.scrollY < topSec(win, 'ex') - 10) {
        // desde la historia: la ciudad se desarma y cada punto viaja a su problema (sección «todo está conectado»)
        doc.documentElement.classList.add('rp-sinrd');
        await scrollA(win, topSec(win, 'ex') - win.innerHeight * 0.2, 0, true);
        await scrollA(win, yFin, o.viaje ?? 3.2, false);
      } else await scrollA(win, yFin, 1.0, o.rapido);
      if (yo !== gen) return;
      doc.documentElement.classList.remove('rp-sinrd');
      await espera(60); if (yo !== gen) return; // la página aplica su propio foco al cambiar de sección; después va el resalte
      if (o.on || o.nodos) resaltar(win, o.on || [], o.prev || [], o.nodos); else { quitarResalte(win); ev(win, 'focus(null)'); }
      zoom(win, o.zoom, o.rapido);
    },
    /** tarjeta «Centralización: el nodo con más conexiones» (la página enfoca F y sus 5 relaciones) */
    red1: async (win, doc, o) => {
      const yo = ++gen; sinConecto(win, o.rapido); quitarResalte(win);
      doc.documentElement.classList.remove('rp-sinrd', 'rp-sel');
      await irSeccion(win, 'red1', o, 1.6);
      if (yo !== gen) return;
      zoom(win, o.zoom, o.rapido);
    },
    /** tarjeta «De la red a la propuesta · Tres criterios» */
    red2: async (win, doc, o) => {
      const yo = ++gen; sinConecto(win, o.rapido); quitarResalte(win);
      doc.documentElement.classList.remove('rp-sinrd', 'rp-sel');
      if (!o.rapido && win.scrollY < topSec(win, 'ex') - 10) {
        await scrollA(win, topSec(win, 'ex') - win.innerHeight * 0.2, 0, true);
        await scrollA(win, ySec(win, 'red2'), o.viaje ?? 3.4, false);
      } else await irSeccion(win, 'red2', o, 1.4);
      if (yo !== gen) return;
      zoom(win, o.zoom, o.rapido);
    },
    /** conectografía: las esferas estallan y Kennedy se rearma con las 41 causas en los colores de los seis problemas */
    conecto: async (win, doc, o) => {
      const yo = ++gen; quitarResalte(win);
      doc.documentElement.classList.remove('rp-sinrd', 'rp-sel');
      await scrollA(win, ySec(win, 'fin'), 0.9, o.rapido);
      if (yo !== gen) return;
      await espera(80); if (yo !== gen) return;
      ev(win, 'focus(null)');
      if (!ev(win, 'CG.to')) { ev(win, 'cgIr(true)'); if (o.rapido) ev(win, 'CG.t0=performance.now()-20000'); }
      zoom(win, o.zoom, o.rapido);
    },
    /**
     * mapa de Kennedy (#mk) en el paso o.k (F,B,C,D,A,E) con la tarjeta de su indicador.
     * o.mapa: otra capa del mapa (pasoMapa) · o.ciclo: capas en secuencia · o.reanimar: vuelve a animar la tarjeta
     * o.zoom: { sel, s } · o.marca: selector de una frase que se marca
     */
    mapa: async (win, doc, o) => {
      const yo = ++gen; sinConecto(win, true); quitarResalte(win);
      doc.documentElement.classList.remove('rp-sinrd', 'rp-sel');
      const k = o.k || 'F';
      const y = ySec(win, k), lejos = Math.abs(win.scrollY - y) > win.innerHeight * 1.6;
      await scrollA(win, y, lejos ? 0 : 1.3, o.rapido || lejos);
      if (yo !== gen) return;
      const card = doc.querySelector(`#story .paso[data-k="${k}"] .card`);
      card?.classList.add('vis');
      doc.querySelectorAll('#story .frase.rp-marca').forEach((f) => f.classList.remove('rp-marca'));
      if (o.marca && card) card.querySelector(o.marca)?.classList.add('rp-marca');
      await espera(o.rapido ? 0 : 40); if (yo !== gen) return;
      const capa = o.mapa || k;
      if (o.repite && !o.rapido) { win.pasoMapa(capa === 'F' ? 'E' : 'F'); await espera(120); if (yo !== gen) return; }
      if (win.eval('MK.paso') !== capa || o.repite) win.pasoMapa(capa);
      if (o.reanimar && !o.rapido) reanimar(win, card);
      const z = o.zoom ? { ...o.zoom, sel: o.zoom.sel === 'card' ? `#story .paso[data-k="${k}"] .card` : o.zoom.sel } : null;
      if (z && z.sel && !z.sel.startsWith('#') && z.sel !== 'svg' && card) {
        // selector relativo a la tarjeta del paso
        const p = rectPct(win, z.sel.split('|').map((s) => `#story .paso[data-k="${k}"] .card ${s.trim()}`).join('|'));
        if (p) { const llena = z.llena ?? 0.78; camara({ x: p.x + (z.dx || 0), y: p.y + (z.dy || 0), s: z.s ?? Math.max(1, Math.min(2.4, llena / Math.max(p.w, p.h))), d: o.rapido ? 0 : (z.d ?? 2.2), ease: 'power3.inOut' }); }
      } else zoom(win, z, o.rapido);
      if (o.ciclo) {
        for (const [i, c] of o.ciclo.entries()) {
          if (o.rapido) { win.pasoMapa(o.ciclo[o.ciclo.length - 1]); break; }
          if (i) await espera(o.paso ?? 1500);
          if (yo !== gen) return;
          win.pasoMapa(c);
        }
      }
    },
  },
});

/* ---------------------------------------------------------------- propuesta.html (sección 07 «Qué cambia, cuánto y cómo se mide») */
registrar('propuesta', {
  url: './paginas/red/propuesta.html',
  listo: async (win) => { pausarOculta(win); await hasta(() => win.document.querySelector('#pcs')?.children.length > 0, 20000); },
  preparar: (win, doc) => {
    const st = doc.createElement('style');
    st.textContent = 'html{scroll-behavior:auto!important;scrollbar-width:none}::-webkit-scrollbar{display:none}body>nav,header,.top,.nav,.prog{visibility:hidden!important}';
    doc.head.appendChild(st);
  },
  estados: {
    /** «07 · Problema por problema»: o.recorre = segundos de scroll lento hacia las tarjetas */
    problemas: async (win, doc, o) => {
      const yo = ++gen;
      const s = doc.getElementById('problemas'); if (!s) return;
      const y0 = s.getBoundingClientRect().top + win.scrollY - win.innerHeight * 0.12;
      await scrollA(win, y0, 0, true);
      if (o.rapido) doc.querySelectorAll('#problemas .rv').forEach((e) => e.classList.add('in'));
      zoom(win, o.zoom, o.rapido);
      if (o.recorre && !o.rapido) { await espera(900); if (yo !== gen) return; await scrollA(win, y0 + win.innerHeight * 0.55, o.recorre, false); }
    },
  },
});
