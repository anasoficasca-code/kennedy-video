// Driver de «Problemas de fondo» (anasoficasca-code/problemaskennedy): árbol causal, Relato (STEPS 0..16),
// panel plano (flujos a Corabastos), axonometría 1900/1972 y animaciones de tarjeta.
// La página se ve entera, sin zoom: un cursor (el propio de la página) la usa como lo haría una persona.
// Colores del formato: paleta «formato» (?pal=formato, agregada a la copia) + CSS inyectado en preparar().
import gsap from 'gsap';
import { registrar, hasta } from '../pagina.js';

const NOMBRE = 'problemas';
let ventana = null; // ventana viva de la página (se fija en listo)
let turno = 0;      // cada estado invalida los pasos diferidos del anterior

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------------- posiciones (para X.ed.senalar) */
/** elemento <rect> del nodo `clave` en el diagrama causal del Relato en curso (o null) */
export function nodoEl(clave) {
  const w = ventana; if (!w) return null;
  try {
    const net = w.eval('SQ.on&&SQ.ph==="s"?STEPS[SQ.i].net:null'); if (!net) return null;
    const i = net.indexOf(clave); if (i < 0) return null;
    return w.document.querySelectorAll('.sq-dia svg > g')[i]?.querySelector('rect') || null;
  } catch (e) { return null; }
}
/** posición (en % de la pantalla) del centro del nodo `clave` del Relato; null si no está */
export function nodoPct(clave) {
  const el = nodoEl(clave); const w = ventana; if (!el || !w) return null;
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / w.innerWidth * 100, y: (r.top + r.height / 2) / w.innerHeight * 100 };
}
/** centro (en %) del diagrama del Relato */
export function diagramaPct() {
  const w = ventana; if (!w) return { x: 50, y: 50 };
  const r = w.document.querySelector('.sq-dia svg')?.getBoundingClientRect(); if (!r) return { x: 50, y: 50 };
  return { x: (r.left + r.width / 2) / w.innerWidth * 100, y: (r.top + r.height / 2) / w.innerHeight * 100 };
}
/** caja (en % de pantalla, {x,y,w,h}) que encierra los nodos visibles del árbol con profundidad ≥ d */
export function cajaProfundas(d = 3) {
  const w = ventana; if (!w) return null;
  try {
    const rs = w.eval('all').filter((n) => n.vis && n.depth >= d).map((n) => n.el.getBoundingClientRect()).filter((r) => r.width);
    if (!rs.length) return null;
    const x0 = Math.min(...rs.map((r) => r.left)) - 12, y0 = Math.min(...rs.map((r) => r.top)) - 12;
    const x1 = Math.max(...rs.map((r) => r.right)) + 12, y1 = Math.max(...rs.map((r) => r.bottom)) + 12;
    const W = w.innerWidth / 100, H = w.innerHeight / 100;
    return { x: x0 / W, y: y0 / H, w: (x1 - x0) / W, h: (y1 - y0) / H };
  } catch (e) { return null; }
}

/* ---------------------------------------------------------------- cursor (el de la página) */
const cur = { x: null, y: null, tw: null };
function evento(win, tipo, x, y) {
  const t = win.document.elementFromPoint(x, y) || win.document.body;
  t.dispatchEvent(new win.MouseEvent(tipo, { clientX: x, clientY: y, bubbles: true, cancelable: true, view: win }));
}
/** lleva el cursor a (x,y) px con una curva natural */
function mover(win, x, y, d = 0.85) {
  if (cur.x == null) { cur.x = win.innerWidth * 0.56; cur.y = win.innerHeight * 0.78; }
  cur.tw?.kill();
  const p = { x: cur.x, y: cur.y }, dx = x - p.x, dy = y - p.y, arco = Math.min(60, Math.hypot(dx, dy) * 0.08);
  return new Promise((res) => {
    cur.tw = gsap.to(p, { x, y, duration: d, ease: 'power2.inOut', onUpdate() {
      const k = this.progress(), b = Math.sin(k * Math.PI) * arco; // leve arco, como una mano
      cur.x = p.x; cur.y = p.y; evento(win, 'mousemove', p.x - (dy / (Math.hypot(dx, dy) || 1)) * b, p.y + (dx / (Math.hypot(dx, dy) || 1)) * b);
    }, onComplete: res, onInterrupt: res });
  });
}
function ocultarCursor(win) { cur.tw?.kill(); try { win.document.dispatchEvent(new win.MouseEvent('mouseleave', { bubbles: false })); win.document.body.classList.remove('cur-hover', 'cur-down'); } catch (e) { /* */ } cur.x = cur.y = null; }
/** el cursor va al elemento, lo pulsa y ejecuta `accion` (o el click del elemento) */
async function clic(win, el, accion, o = {}) {
  if (!el) { accion?.(); return; }
  const r = el.getBoundingClientRect();
  await mover(win, r.left + r.width * (o.fx ?? 0.5), r.top + r.height * (o.fy ?? 0.5), o.d ?? 0.8);
  await espera(120);
  evento(win, 'mousedown', cur.x, cur.y); await espera(140); evento(win, 'mouseup', cur.x, cur.y);
  if (accion) accion(); else el.click();
}

/* ---------------------------------------------------------------- Relato */
function cortarAutomaticos(win) { win.eval('SQ.subs.forEach(clearTimeout); SQ.subs=[]; clearTimeout(SQ.tm); SQ.play=false'); }
function ajustarPanel(win) { win.eval('[150,500,900,1400,2200].forEach(ms=>sqAt(sqFitP,ms))'); }

/**
 * Paso `n` del Relato. o.palabra: ms que se ve la palabra grande (0 = directo a la escena).
 * o.panel: 'auto' (como la página) | 'clic' (el cursor pulsa «Ver …» a los o.clicPanel ms) | 'no'.
 * o.anio: 1972 → el cursor pulsa ese año en la línea de tiempo a los o.clicAnio ms (con panel de historia).
 */
async function relato(win, o, mio = ++turno) {
  const n = o.paso ?? 0, vivo = () => mio === turno;
  const SQ = win.eval('SQ'), rapido = !!o.rapido;
  const yaEsta = SQ.on && SQ.i === n && SQ.ph === 's';
  if (!yaEsta) {
    if (!rapido && SQ.on && SQ.ph === 's') { // fundido continuo: la escena y su panel se desvanecen antes de cambiar
      const d = win.document; d.querySelector('#sqS')?.classList.remove('show'); ocultarCursor(win);
      ['#pl', '#hp', '#pp'].forEach((q) => { const p = d.querySelector(q); if (p) { p.style.transition = 'opacity .35s ease'; p.style.opacity = '0'; } });
      await espera(360); if (!vivo()) return;
      setTimeout(() => ['#pl', '#hp', '#pp'].forEach((q) => { const p = d.querySelector(q); if (p) { p.style.opacity = ''; p.style.transition = ''; } }), 60);
    }
    win.eval('SQ.play=false'); win.eval('closeInsp()'); win.sqGo(n); cortarAutomaticos(win);
    const t = rapido ? 0 : (o.palabra ?? 0);
    if (t) { await espera(t); if (!vivo()) return; }
    win.sqScene();
    if ((o.panel ?? 'no') !== 'auto') cortarAutomaticos(win);
    if ((o.panel ?? 'no') === 'no') { win.document.querySelector('#sqS')?.classList.remove('hasp'); win.document.querySelector('#sqV')?.remove(); } // sin panel: el diagrama usa todo el ancho
  }
  const s = win.eval('STEPS[SQ.i]');
  if (!s.panel || o.panel === 'no' || o.panel === 'auto') return;
  const abierto = () => win.eval('plOpen||hpOpen||!!document.querySelector("#pp.show")');
  const abrir = () => { win.eval('sqPanel(STEPS[SQ.i])'); cortarAutomaticos(win); ajustarPanel(win); };
  const anio = () => { if (o.anio) { try { win.hpSetYear(o.anio); } catch (e) { /* */ } } };
  if (rapido) { if (!abierto()) abrir(); anio(); ocultarCursor(win); return; }
  if (!yaEsta || !abierto()) {
    await espera(o.clicPanel ?? 500); if (!vivo()) return;
    await clic(win, win.document.querySelector('#sqV'), abrir);
    if (!vivo()) return;
  }
  if (o.anio) {
    const t0 = performance.now(); await espera(Math.max(0, (o.clicAnio ?? 2000) - 900)); if (!vivo()) return;
    const b = await hasta(() => win.document.querySelector(`#hp .hd[data-y="${o.anio}"]`), 3000); if (!vivo()) return;
    await clic(win, b, anio, { d: 0.9 });
    void t0;
  }
  await espera(900); if (vivo()) ocultarCursor(win); // la mano se retira
}

/* ---------------------------------------------------------------- estilo del formato */
const CSS = `
:root{--bg:#0b0d10;--line:#20252c;--line2:#323943;--fg:#f3f4ee;--mut:#8c928c;--dim:#5b615c;
  --sans:"Geist","IBM Plex Sans",system-ui,sans-serif;--mono:"Geist","IBM Plex Mono",ui-monospace,monospace;--tit:"Barlow Condensed","Geist",sans-serif}
html,body{background:#0b0d10}
#stage{background:radial-gradient(ellipse 80% 60% at 30% 50%,#121820 0%,#0b0d10 70%),#0b0d10!important}
#stage::before,#sq::before{background-image:radial-gradient(#1b2027 1px,transparent 1.1px)!important}
#sq{background:radial-gradient(ellipse 70% 55% at 55% 45%,#121820 0%,#0b0d10 75%)!important}
.btn{background:#0f1216;border-color:#2c333c;font-family:var(--sans)}
.btn.pri{background:#cfff5e!important;color:#0b0d10!important;border-color:#cfff5e!important}
#bar{background:linear-gradient(#0b0d10 55%,rgba(11,13,16,0))!important}
#bar b,.sq-top b{font:600 22px/1 var(--tit)!important;letter-spacing:.01em}
.node{font-family:var(--sans)}
/* edición: sin controles ni ayudas que tapen (la página se ve como grabada, la explicación la pone la voz) */
#hint,#legend,#mini,#zoom,#tip,.sq-foot,.sq-word,.sq-x,.sq-txt p,.sq-txt .nind,.sq-txt .kk,.sq-txt h2,.sq-txt .nchips,#brand,#dsearch{display:none!important}
.sq-txt{width:auto!important;min-width:0!important;padding:0!important}
#bar{justify-content:flex-end}
.sq-scene{transition:opacity .38s ease!important}
body.sq-open #sq{animation:fmtIn .45s ease}@keyframes fmtIn{from{opacity:0}}
.sq-top{display:none!important}
.sq-scene{top:92px!important;bottom:150px!important}
#bar{padding-top:62px!important}
body.sq-open #hp,#pl{top:92px!important}
.sq-word .w{font:600 clamp(56px,8.4vw,150px)/1 var(--tit)!important;letter-spacing:.03em!important;color:#f3f4ee!important;text-shadow:none!important}
.sq-word .w span:first-child{color:var(--c)}
.sq-txt .kk{font:500 12px/1 var(--sans)!important;letter-spacing:.2em!important;color:var(--c)!important;margin-bottom:12px!important}
.sq-txt h2{font:600 clamp(32px,3vw,52px)/1 var(--tit)!important;letter-spacing:.005em;border-left:5px solid var(--c)!important;padding-left:16px!important;margin-bottom:18px!important;color:#f3f4ee}
.sq-txt .nv{background:#0f1216!important;color:#f3f4ee!important;border:1px solid color-mix(in srgb,var(--c) 70%,#000)!important;font:500 14px var(--sans)!important}
.sq-txt .nv svg{color:var(--c)}
.nchips div{background:rgba(15,18,22,.9)!important;border-color:#2c333c!important;font-family:var(--sans)!important}
.nchips b{color:var(--c)!important}
.sq-dia text{font-family:"Geist",sans-serif}
.sq-dia rect[fill="#0c0c0c"]{fill:#11151a}
#hp{background:rgba(11,13,16,.97)!important}
#hp .hcap,#hp .hh b{font-family:var(--sans)}
#hp .hrow{display:none!important}
#pl{background:#0b0d10!important;border-color:#262c34!important}
#pl .pl-h i{background:#cfff5e!important}
.pl-d{fill:#cfff5e!important}.pl-line{stroke:#e6ffb0!important}.pl-p circle:first-child{fill:rgba(207,255,94,.28)!important}.pl-p circle:last-child{fill:#efffc8!important}
#cur2{border-width:2.5px}
`;

registrar(NOMBRE, {
  url: './paginas/problemas/index.html?pal=formato#todo',
  listo: async (win) => {
    ventana = win;
    await hasta(() => win.sqGo && win.eval('typeof expandAll') === 'function' && win.eval('KK.root'));
    win.eval('SQ.play=false');
  },
  preparar: (win, doc) => {
    ventana = win;
    const ln = doc.createElement('link'); ln.rel = 'stylesheet';
    ln.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap';
    doc.head.appendChild(ln);
    const st = doc.createElement('style'); st.id = 'formato-presentacion'; st.textContent = CSS; doc.head.appendChild(st);
    try { win.eval('preloadHist()'); } catch (e) { /* */ } // las imágenes de la axonometría quedan listas antes de que se pidan
  },
  estados: {
    /** como se abre la página: solo la Fragmentación Territorial (sin Relato) */
    inicio: async (win) => { ++turno; ocultarCursor(win); win.eval('sqClose()'); win.eval('reset()'); },
    /** árbol completo expandido (tablero, sin Relato) */
    todo: async (win) => { ++turno; ocultarCursor(win); win.eval('sqClose()'); win.eval('expandAll()'); },
    /** raíz y sus tres ramas: los tres problemas que alimentan la fragmentación */
    tronco: async (win) => {
      ++turno; ocultarCursor(win); win.eval('sqClose()');
      win.eval('all.forEach(n=>{n.open=false}); KK.root.open=true; introStage=2; hideHints(); refresh(null); fit()');
    },
    /** el árbol crece: de la raíz con sus tres ramas a todas las variables (o.crece = ms antes de expandir) */
    arbol: async (win, doc, o) => {
      const mio = ++turno; ocultarCursor(win); win.eval('sqClose()');
      if (o.rapido) { win.eval('expandAll()'); return; }
      win.eval('all.forEach(n=>{n.open=false}); KK.root.open=true; introStage=2; hideHints(); refresh(null); fit()');
      await espera(o.crece ?? 1200); if (mio !== turno) return;
      win.eval('expandAll()');
    },
    /** desde el árbol, el cursor pulsa «Relato» y se abre el paso 0 (o.paso) */
    abrirRelato: async (win, doc, o) => {
      const mio = ++turno;
      if (o.rapido || win.eval('SQ.on')) return relato(win, { ...o, paso: o.paso ?? 0 }, mio);
      if (o.antes) { await espera(o.antes); if (mio !== turno) return; }
      await clic(win, doc.querySelector('#bNar'), () => {});
      if (mio !== turno) return;
      await relato(win, { ...o, paso: o.paso ?? 0 }, mio);
      if (mio === turno && o.retira !== false) ocultarCursor(win);
    },
    /** paso del Relato: o.paso (0..16), o.palabra (ms de la palabra; 0 = directo), o.panel, o.anio */
    relato: async (win, doc, o) => { if (o.rapido) ocultarCursor(win); await relato(win, o); },
    /** pulsa «Propagar» del tablero */
    propagar: async (win) => { try { win.document.querySelector('#bProp')?.click(); } catch (e) { /* sin botón */ } },
    cerrar: async (win) => { ++turno; win.eval('sqClose()'); },
  },
});
