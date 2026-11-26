// Driver de «Red causal · 3 niveles + POT» (anasoficasca-code/humedalburro · red-causal-3n.html, commit 7fdd4ed).
// Copia en public/paginas/humedalburro/ recoloreada con los colores del formato (recolor.cjs: solo colores,
// tipografías y sin el territorio 3D de 45 MB). La página se usa como la usaría una persona: un cursor se mueve
// hasta los botones reales (capas, Grado, Métricas, Ejes radiales, Niveles 3D…) y les hace clic; nada de zoom.
// Cada estado es ABSOLUTO: primero deja la página en su base (capas, relaciones, vista, paneles, cámara) y luego anima.
import gsap from 'gsap';
import { registrar, hasta, ventana } from '../pagina.js';

const NOMBRE = 'humedalburro';
const POT = [5, 6, 7, 8, 9, 10, 11, 12]; // capas «POT · …» (las 0-4 son la red causal de 3 niveles + indicadores)
const CAUSAL = [0, 1, 2, 3, 4];
const ACTORES = 11;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700;800&display=swap');
  html, body { background: #0b0d10 !important; }
  body, button, input, .btn-flat, .glass-panel, .rel-card, .cat-card, .gp-btn, #nivTour .niv-step, #nivText, .concl-text, .metric-sources { font-family: 'Geist', system-ui, sans-serif !important; }
  .brand-title, .brand-title span, .gp-title, .drawer-header > span, .node-title, .pie-card-title, .concl-title, .cc-card h3, .welcome-header > div > div:first-child, #nivText b, .seq-title {
    font-family: 'Barlow Condensed', 'Geist', sans-serif !important; letter-spacing: .04em !important; font-weight: 600 !important; }
  .brand-title span { font-size: 15px !important; }
  * { cursor: none !important; }
  /* la barra de la página baja un poco para no chocar con el logo de la presentación */
  .top-header { top: 54px !important; }
  .side-drawer { top: 96px !important; max-height: calc(100vh - 170px) !important; }
  .gephi-panel { top: 104px !important; }
  .node-inspector { top: 108px !important; }
  .chat-widget-btn, #faqChatModal, #toastNotify, #relTip:empty { display: none !important; }
  :root { --accent: #cfff5e; --accent-glow: rgba(207,255,94,.35); --ink: #f3f4ee; --ink-dim: #a3a89f; --glass-bg: rgba(11,13,16,.92); }
  #hb-cur { position: fixed; left: 0; top: 0; width: 26px; height: 26px; z-index: 99999; pointer-events: none; transform: translate(-200px,-200px); }
  #hb-cur svg { width: 26px; height: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.6)); }
  #hb-cur i { position: absolute; left: -16px; top: -16px; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #cfff5e; opacity: 0; transform: scale(.3); }
  .hb-ancla { position: fixed; pointer-events: none; }
`;

const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const nuevo = (win) => (win.__hbTok = (win.__hbTok || 0) + 1);

/* ------------------------------------------------------------------ cursor de «persona usando la página» */
function cursor(doc) {
  let c = doc.getElementById('hb-cur');
  if (!c) {
    c = doc.createElement('div'); c.id = 'hb-cur';
    c.innerHTML = '<i></i><svg viewBox="0 0 24 24"><path d="M4 2.5 L4 19 L8.6 14.8 L11.7 21.5 L14.5 20.3 L11.4 13.7 L17.6 13.4 Z" fill="#f3f4ee" stroke="#0b0d10" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    doc.body.appendChild(c); c._x = innerWidth * 0.62; c._y = innerHeight * 0.7;
  }
  return c;
}
const centro = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
function mover(win, doc, destino, ms = 650) {
  const c = cursor(doc); const d = destino.getBoundingClientRect ? centro(destino) : destino;
  const x0 = c._x, y0 = c._y, t0 = win.performance.now();
  return new Promise((res) => {
    const f = (now) => {
      const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      c._x = x0 + (d.x - x0) * e; c._y = y0 + (d.y - y0) * e; c.style.transform = `translate(${c._x - 4}px, ${c._y - 3}px)`;
      k < 1 ? win.requestAnimationFrame(f) : res();
    };
    win.requestAnimationFrame(f);
  });
}
function pulsar(doc) {
  const c = cursor(doc), i = c.querySelector('i');
  gsap.fromTo(i, { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 1.4, duration: 0.5, ease: 'power2.out' });
  gsap.fromTo(c.querySelector('svg'), { scale: 0.85 }, { scale: 1, duration: 0.25, ease: 'back.out(3)', transformOrigin: '20% 15%' });
}
function ocultarCursor(doc) { const c = doc.getElementById('hb-cur'); if (c) c.style.transform = 'translate(-200px,-200px)'; }
/** mueve el cursor hasta `el`, «hace clic» y ejecuta fn (en un salto: solo fn) */
async function clic(win, doc, el, fn, o, ms = 600) {
  if (o.rapido || !el) { fn(); return; }
  await mover(win, doc, el, ms); pulsar(doc); fn();
}
function sobre(win, el, on = true) { el?.dispatchEvent(new win.MouseEvent(on ? 'mouseenter' : 'mouseleave', { bubbles: false })); }

/* ------------------------------------------------------------------ anclas: siguen a un nodo 3D en pantalla */
const anclas = new Map();
function sprite(win, id) { let s = null; win.__viewer.scene.traverse((o) => { if (!s && o.userData && o.userData.taxaId === id) s = o; }); return s; }
function bucleAnclas(win) {
  if (win.__hbBucle) return; win.__hbBucle = true;
  const v = new win.THREE.Vector3();
  const f = () => {
    if (!anclas.size) { win.__hbBucle = false; return; }
    const { camera } = win.__viewer;
    for (const [id, a] of anclas) {
      const s = a._s; if (!s || !s.visible) { a.style.display = 'none'; continue; }
      s.getWorldPosition(v); const dist = camera.position.distanceTo(v); v.project(camera);
      const px = innerHeight / 2 / (dist * Math.tan(camera.fov * Math.PI / 360));
      const r = Math.max(10, s.scale.x * 0.5 * px * 0.92);
      Object.assign(a.style, { display: 'block', left: ((v.x + 1) / 2 * innerWidth - r) + 'px', top: ((1 - v.y) / 2 * innerHeight - r) + 'px', width: 2 * r + 'px', height: 2 * r + 'px' });
    }
    win.requestAnimationFrame(f);
  };
  win.requestAnimationFrame(f);
}
/** elemento (dentro de la página) que sigue al nodo `id`; para X.ed.senalar('humedalburro', anclaNodo(id)) */
export function anclaNodo(id) {
  const win = ventana(NOMBRE); if (!win?.__viewer) return null;
  let a = anclas.get(id);
  if (!a) { a = win.document.createElement('div'); a.className = 'hb-ancla'; win.document.body.appendChild(a); anclas.set(id, a); }
  a._s = sprite(win, id); bucleAnclas(win); return a;
}
function quitarAnclas() { for (const a of anclas.values()) a.remove(); anclas.clear(); }
/** grado de cada nodo con las capas dadas activas (mismo cálculo que el inspector de la página) */
export function grados(cats) {
  const win = ventana(NOMBRE); const D = win?.RED_DATA; if (!D) return [];
  const on = new Set(D.nodes.map((n, i) => (cats.includes(n.cat) ? i : -1)).filter((i) => i >= 0)); const g = {};
  D.edges.forEach((e) => { if (on.has(e.source) && on.has(e.target)) { g[e.source] = (g[e.source] || 0) + 1; g[e.target] = (g[e.target] || 0) + 1; } });
  return Object.entries(g).sort((a, b) => b[1] - a[1]).map(([i, d]) => ({ id: D.nodes[i].id, nombre: D.nodes[i].name, grado: d }));
}
/** lee los contadores de la barra de estado de la página */
export function contadores() {
  const win = ventana(NOMBRE); const d = win?.document;
  return { nodos: +(d?.getElementById('lblActiveNodes')?.textContent || 0), relaciones: +(d?.getElementById('lblActiveEdges')?.textContent || 0) };
}

/* ------------------------------------------------------------------ estado base absoluto */
function terminar(win) {
  // las transiciones internas de la página (gsap) se completan para partir de un estado limpio
  try { win.gsap.globalTimeline.getChildren(true, true, false).forEach((t) => t.progress(1)); } catch (e) { /* */ }
}
function camaraCasa(win, o, ms = 1400) {
  const { camera, controls } = win.__viewer;
  const D = (win._red3dR + 6) / Math.tan(camera.fov * Math.PI / 360) / Math.min(1, camera.aspect);
  const p = { x: 0, y: D * 0.18, z: D };
  if (o.rapido) { camera.position.set(p.x, p.y, p.z); controls.target.set(0, 0, 0); return; }
  if (camera.position.distanceTo(new win.THREE.Vector3(p.x, p.y, p.z)) < 1 && controls.target.length() < 0.5) return;
  win.gsap.to(camera.position, { ...p, duration: ms / 1000, ease: 'power2.inOut' }); win.gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: ms / 1000, ease: 'power2.inOut' });
}
/** centra la cámara en lo visible (como cuando una persona arrastra la vista para verlo entero) */
function encuadrar(win, o) {
  const { camera, controls } = win.__viewer, V = win.THREE.Vector3; const b = new win.THREE.Box3(), p = new V();
  win.__viewer.scene.traverse((s) => { if (s.isSprite && s.visible && s.userData?.taxaId) b.expandByPoint(s.getWorldPosition(p)); });
  if (b.isEmpty()) return; const c = b.getCenter(new V()), r = b.getSize(new V()).length() / 2;
  const D = (r + 4) / Math.tan(camera.fov * Math.PI / 360) / Math.min(1, camera.aspect);
  const dst = { x: c.x, y: c.y, z: c.z + D };
  if (o.rapido) { camera.position.set(dst.x, dst.y, dst.z); controls.target.copy(c); return; }
  win.gsap.to(camera.position, { ...dst, duration: 1.2, ease: 'power2.inOut' }); win.gsap.to(controls.target, { x: c.x, y: c.y, z: c.z, duration: 1.2, ease: 'power2.inOut' });
}
function ponerCapas(win, lista) { const o = win.opts; for (let c = 0; c < 13; c++) { const q = lista.includes(c); if (!!o.cats[c] !== q) win.toggleCat(c); } }
function ponerRelaciones(win, todas = true) { const o = win.opts; for (let i = 0; i < 16; i++) if ((o.interactions[i] !== false) !== todas) win.toggleInteraction(i); }
function cajon(win, doc, abierto) { const d = doc.getElementById('sideDrawer'); if (d && d.classList.contains('collapsed') === abierto) win.toggleSideDrawer(); }
const abierto = (doc, id) => doc.getElementById(id)?.style.display === 'flex';

function base(win, doc, o, cfg = {}) {
  const { capas = [...CAUSAL, ...POT], vista = 'taxonomy', disp = 'red3d', drawer = false, rot = true, camara = true } = cfg;
  terminar(win); quitarAnclas();
  doc.getElementById('relTip')?.style.setProperty('display', 'none');
  doc.querySelectorAll('.rel-card, .cat-card').forEach((e) => sobre(win, e, false));
  try { win.closeInspector(); } catch (e) { /* */ }
  if (abierto(doc, 'welcomeModalOverlay')) win.closeWelcomeModal();
  if (abierto(doc, 'conclModalOverlay')) win.closeConclusiones();
  if (doc.getElementById('subnetworkModal')?.style.display !== 'none') { try { win.closeSubNetworkModal(); } catch (e) { /* */ } }
  if (doc.getElementById('lblHiddenCount')?.textContent !== '0') { try { win.restoreHiddenNodes(); } catch (e) { /* */ } }
  ponerCapas(win, capas); ponerRelaciones(win, true);
  if ((win.opts.viewMode || 'taxonomy') !== vista) win.setViewMode(vista);
  if (win.opts.layout !== disp) { win.setLayout(disp); if (o.rapido) terminar(win); }
  if (disp === 'niveles3d') { /* el paso lo pone cada estado */ }
  cajon(win, doc, drawer);
  win.opts.autoRotate = rot; doc.getElementById('btnAutoRot')?.classList.toggle('active', rot);
  if (camara && disp === 'red3d') camaraCasa(win, o);
  if (o.rapido) { ocultarCursor(doc); terminar(win); }
}

registrar(NOMBRE, {
  url: './paginas/humedalburro/red-causal-3n.html',
  listo: async (win) => { await hasta(() => win.__viewer && win.Niveles && win._red3dR && win.document.querySelectorAll('#catCardsHost .cat-card').length === 13, 30000); },
  preparar: (win, doc) => {
    const s = doc.createElement('style'); s.textContent = CSS; doc.head.appendChild(s);
    try { win.__viewer.renderer.setClearColor('#0b0d10', 1); } catch (e) { /* */ }
    cursor(doc); ocultarCursor(doc);
    // oculta (precargada o detrás de otra página) dibuja a 4 cuadros/s: la GPU queda para la página visible
    const raf = win.requestAnimationFrame.bind(win), marco = win.frameElement?.parentElement;
    win.requestAnimationFrame = (cb) => (marco && !marco.classList.contains('on') ? win.setTimeout(() => raf(cb), 250) : raf(cb));
  },
  estados: {
    // la red completa (3 niveles + POT), girando
    inicio: async (win, doc, o) => { nuevo(win); base(win, doc, o); },
    // los efectos se entrelazan: el cursor enciende uno a uno los tipos de relación
    entrelaza: async (win, doc, o) => {
      const tk = nuevo(win); base(win, doc, o, { drawer: true });
      if (o.rapido) return;
      win.toggleAllInteractions(false);
      await esp(350);
      for (let i = 0; i < 16; i++) {
        if (win.__hbTok !== tk) return;
        const el = doc.getElementById('interItem' + i);
        await clic(win, doc, el, () => win.toggleInteraction(i), o, i ? 110 : 500);
      }
      await esp(250); if (win.__hbTok === tk) ocultarCursor(doc);
    },
    // red completa con el cajón cerrado (para señalar nodos encima)
    red: async (win, doc, o) => { nuevo(win); base(win, doc, o); ocultarCursor(doc); },
    // cajón abierto: capas y tipos de relación a la vista; el cursor pasa sobre los tipos de relación
    cajon: async (win, doc, o) => {
      const tk = nuevo(win); base(win, doc, o, { drawer: true });
      if (o.rapido) return;
      await esp(500);
      for (const i of o.sobre || []) {
        if (win.__hbTok !== tk) return;
        const el = doc.getElementById('interItem' + i); await mover(win, doc, el, 600); sobre(win, el); await esp(1100); sobre(win, el, false);
      }
    },
    // Niveles 3D: o.paso = paso final; o.pasos = pasos que el cursor recorre antes (clic en el recorrido)
    niveles: async (win, doc, o) => {
      const tk = nuevo(win); const ya = win.opts.layout === 'niveles3d';
      base(win, doc, o, { disp: 'niveles3d', camara: false });
      const pasos = o.pasos || [o.paso ?? 0];
      if (o.rapido) { win.Niveles.setStep(pasos[pasos.length - 1]); terminar(win); return; }
      if (!ya || o.inicioPaso != null) win.Niveles.setStep(o.inicioPaso ?? 0);
      for (const p of pasos) {
        if (win.__hbTok !== tk) return;
        const el = doc.querySelectorAll('#nivTour .niv-step')[p];
        await clic(win, doc, el, () => win.Niveles.setStep(p), o, 600);
        await esp(o.entre ?? 900);
      }
    },
    // solo el POT (8 capas, 53 componentes) en Red 3D
    pot: async (win, doc, o) => { nuevo(win); base(win, doc, o, { capas: POT }); ocultarCursor(doc); },
    // de la red completa al POT: el cursor apaga las capas causales en el filtro de capas
    potQuita: async (win, doc, o) => {
      const tk = nuevo(win);
      if (o.rapido) { base(win, doc, o, { capas: POT, drawer: true }); return; }
      base(win, doc, o, { drawer: true });
      await esp(450);
      for (const c of CAUSAL) { if (win.__hbTok !== tk) return; await clic(win, doc, doc.getElementById('catCard' + c), () => win.toggleCat(c), o, c ? 260 : 550); }
    },
    // el POT se arma como red: el cursor enciende sus 8 capas una a una
    potArma: async (win, doc, o) => {
      const tk = nuevo(win);
      if (o.rapido) { base(win, doc, o, { capas: POT, drawer: true }); return; }
      base(win, doc, o, { capas: [], drawer: true });
      await esp(350);
      for (const c of POT) { if (win.__hbTok !== tk) return; await clic(win, doc, doc.getElementById('catCard' + c), () => win.toggleCat(c), o, c === POT[0] ? 500 : 230); }
    },
    // nodos centrales: clic en «Grado» (tamaño y brillo = número de relaciones)
    grado: async (win, doc, o) => {
      nuevo(win); base(win, doc, o, { capas: POT });
      await clic(win, doc, doc.getElementById('gpViewdegree'), () => win.setViewMode('degree'), o, 700);
    },
    // relaciones del POT resaltadas (vista Grado: los enlaces se iluminan según su conexión)
    relaciones: async (win, doc, o) => { nuevo(win); base(win, doc, o, { capas: POT, vista: 'degree' }); ocultarCursor(doc); },
    // métricas: clic en «Métricas» → tortas de tipos de relación y de capas (animación propia de la página)
    metricas: async (win, doc, o) => {
      nuevo(win); base(win, doc, o, { capas: POT, vista: 'degree' });
      const btn = [...doc.querySelectorAll('.top-header .btn-flat')].find((b) => /M[eé]tricas/.test(b.textContent));
      await clic(win, doc, btn, () => win.openWelcomeModal(), o, 650);
      if (!o.rapido) { await esp(300); await mover(win, doc, { x: innerWidth * 0.4, y: innerHeight * 0.62 }, 900); }
    },
    // jerarquías: clic en «Ejes radiales» (un eje por capa, los más conectados al centro)
    jerarquia: async (win, doc, o) => {
      nuevo(win); base(win, doc, o, { capas: POT, vista: 'degree' });
      await clic(win, doc, doc.getElementById('gpLayoutradial'), () => win.setLayout('radial'), o, 700);
      if (o.rapido) terminar(win); else await esp(1650);
      encuadrar(win, o);
    },
    // ciudad como sistema complejo: el cursor enciende «Todas» las capas → 83 nodos, 426 relaciones
    complejo: async (win, doc, o) => {
      nuevo(win);
      if (o.rapido) { base(win, doc, o, { drawer: true }); return; }
      base(win, doc, o, { capas: POT, drawer: true });
      await esp(300);
      const todas = [...doc.querySelectorAll('#sideDrawer .quick-toggle-btn')].find((b) => /Todas/.test(b.textContent));
      await clic(win, doc, todas, () => win.toggleAllCats(true), o, 700);
    },
    // los actores del POT, solos
    actores: async (win, doc, o) => {
      nuevo(win);
      if (o.rapido) { base(win, doc, o, { capas: [ACTORES], drawer: true }); return; }
      base(win, doc, o, { capas: POT, drawer: true });
      await esp(300);
      const ninguna = [...doc.querySelectorAll('#sideDrawer .quick-toggle-btn')].find((b) => /Ninguna/.test(b.textContent));
      await clic(win, doc, ninguna, () => win.toggleAllCats(false), o, 650);
      await esp(250);
      await clic(win, doc, doc.getElementById('catCard' + ACTORES), () => win.toggleCat(ACTORES), o, 500);
    },
    // Plano 2D del POT (relaciones con flecha, en un plano)
    plano: async (win, doc, o) => {
      nuevo(win); const ya = win.opts.layout === 'plano2d';
      base(win, doc, o, { capas: POT, disp: ya ? 'plano2d' : 'red3d', camara: !ya });
      if (!ya) await clic(win, doc, doc.getElementById('btnLayoutPlano'), () => win.setLayout('plano2d'), o, 700);
      if (o.rapido) terminar(win);
    },
  },
});
