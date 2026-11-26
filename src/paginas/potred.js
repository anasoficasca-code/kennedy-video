// Driver de la red del POT (modulo-03.html): 4 estructuras, 30 nodos, 47 relaciones, hubs, puentes y hallazgos
import { registrar, hasta } from '../pagina.js';

const CSS = `
  html { scroll-behavior: auto !important; }
  * { cursor: none !important; }
  .sidebar, .icon-nav, .topbar, header.top, .app > header { display: none !important; }
  .concept.dim { opacity: .22 !important; transition: opacity .5s; }
  .rel.dim { opacity: .08 !important; transition: opacity .5s; }
  .zoom-controls { display: none !important; }
  .weak-banner { display: none !important; }
  #networkFinding { position: fixed !important; right: 3vw !important; top: 14vh !important; width: min(30vw, 460px) !important; z-index: 50; }
  .rel.rp-on { stroke-width: 7 !important; opacity: 1 !important; filter: drop-shadow(0 0 10px #fff); }
  .concept.rp-on .node-ring { stroke: #fff !important; stroke-width: 7 !important; }
  .concept.rp-on { filter: drop-shadow(0 0 22px #c7ff27); }
  .rp-nota b { color: #c7ff27 !important; background: rgba(199,255,39,.14); padding: 0 3px; border-radius: 3px; }
  .pcard.rp-card { outline: 2px solid #c7ff27; outline-offset: 4px; }
`;

const E = (win, js) => win.eval(js);
function limpiar(win, doc) {
  try { if (E(win, 'SYS.some(s => !state[s]) || offNodes.size > 0 || selectedRel')) E(win, 'resetAll()'); } catch (e) { /* aún no carga */ }
  const nf = doc.getElementById('networkFinding'); if (nf) { nf.style.setProperty('display', 'none', 'important'); nf.classList.remove('is-open'); nf.setAttribute('aria-hidden', 'true'); }
  doc.querySelectorAll('.dim').forEach((e) => e.classList.remove('dim'));
  doc.querySelectorAll('.rp-on').forEach((e) => e.classList.remove('rp-on'));
  doc.querySelectorAll('.rp-card').forEach((e) => e.classList.remove('rp-card'));
  doc.querySelectorAll('.rp-nota').forEach((e) => e.classList.remove('rp-nota'));
}
const colDer = (doc) => doc.querySelector('.col.right');
function irCol(doc, el, o, margen = 12) {
  const c = colDer(doc); if (!c || !el) return;
  const top = Math.max(0, c.scrollTop + el.getBoundingClientRect().top - c.getBoundingClientRect().top - margen);
  c.scrollTo({ top, behavior: o?.rapido ? 'instant' : 'smooth' });
}
const hubs = (win, n = 2) => E(win, `Object.values(model.concepts).sort((a,b)=>b.rels.length-a.rels.length).slice(${n}).map(c=>c.id)`);
const losHubs = (win) => E(win, 'Object.values(model.concepts).sort((a,b)=>b.rels.length-a.rels.length).slice(0,2).map(c=>c.id)');
const nodo = (doc, id) => [...doc.querySelectorAll('#gNodes .concept')].find((g) => g.getAttribute('data-id') === id);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

registrar('potred', {
  url: './paginas/modelamiento2/modulo-03.html?v2=1',
  listo: async (win) => { await hasta(() => win.document.querySelectorAll('#gNodes .concept').length >= 30 && win.model); },
  preparar: (win, doc) => { const s = doc.createElement('style'); s.textContent = CSS; doc.head.appendChild(s); win.scrollTo(0, 0); },
  estados: {
    // la red completa: 4 estructuras, 30 nodos, 47 relaciones. En vivo, la red se rearma nodo por nodo
    inicio: (win, doc, o) => { limpiar(win, doc); win.scrollTo(0, 0); colDer(doc)?.scrollTo(0, 0); },
    red: async (win, doc, o) => {
      limpiar(win, doc); win.scrollTo(0, 0); colDer(doc)?.scrollTo(0, 0);
      if (!o.rapido) { try { E(win, 'render()'); } catch (e) { /* */ } }
    },
    // nodos centrales: se enfocan los dos hubs (Humedales 8, Servicios empresariales 8) con sus conexiones
    hubs: async (win, doc, o) => {
      limpiar(win, doc); win.scrollTo(0, 0); colDer(doc)?.scrollTo(0, 0);
      const [a, b] = losHubs(win);
      if (o.rapido) { E(win, `focusConcept(${JSON.stringify(a)})`); nodo(doc, a)?.classList.add('rp-on'); nodo(doc, b)?.classList.add('rp-on'); return; }
      await espera(500); E(win, `focusConcept(${JSON.stringify(a)})`); nodo(doc, a)?.classList.add('rp-on');
      await espera(2300); E(win, 'clearFocus()'); nodo(doc, a)?.classList.remove('rp-on');
      E(win, `focusConcept(${JSON.stringify(b)})`); nodo(doc, b)?.classList.add('rp-on');
    },
    // todas las relaciones activas (47) con la red entera iluminada
    relaciones: async (win, doc, o) => {
      limpiar(win, doc); win.scrollTo(0, 0); colDer(doc)?.scrollTo(0, 0);
      doc.querySelectorAll('#gRels .rel').forEach((p, i) => { if (o.rapido) p.classList.add('rp-on'); else setTimeout(() => p.classList.add('rp-on'), i * 40); });
    },
    // «Nodos puente»
    puentes: async (win, doc, o) => { limpiar(win, doc); win.scrollTo(0, 0); const t = doc.getElementById('bridgeList'); irCol(doc, t?.closest('.pcard'), o); t?.closest('.pcard')?.classList.add('rp-card'); },
    // hallazgo: «ESECI articula más conexiones»
    hallazgo: async (win, doc, o) => {
      limpiar(win, doc); win.scrollTo(0, 0); colDer(doc)?.scrollTo(0, 0);
      try { E(win, "showStructureInsight('ESECI', false)"); } catch (e) { /* */ }
    },
    // «la centralidad de la red no equivale a la jerarquía normativa del POT»
    jerarquia: async (win, doc, o) => {
      limpiar(win, doc); win.scrollTo(0, 0);
      const nota = doc.querySelector('#rankList')?.closest('.pcard'); irCol(doc, nota, o); nota?.querySelector('.note')?.classList.add('rp-nota'); nota?.classList.add('rp-card');
    },
    // apagar una estructura: ya no hay conexiones que dependan de ella
    sinEstructura: async (win, doc, o) => { limpiar(win, doc); win.scrollTo(0, 0); await espera(o.rapido ? 0 : 400); E(win, `toggleSystem('${o.k || 'EEP'}')`); },
  },
});



