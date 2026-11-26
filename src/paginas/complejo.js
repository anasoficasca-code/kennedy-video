// Driver de «Bogotá como sistema complejo» (modulo-07.html): agentes, procesos, flujos, interacciones, sistemas, emergencia
import { registrar, hasta } from '../pagina.js';

const CSS = `
  html { scroll-behavior: auto !important; }
  * { cursor: none !important; }
  .sidebar, .icon-nav { display: none !important; }
  .bubble-node { transition: r .5s, stroke-width .5s, opacity .5s, filter .5s; }
  .bubble-net-svg.cx-foco .bubble-node, .bubble-net-svg.cx-foco .bubble-node-label { opacity: .3; transition: opacity .5s; }
  .bubble-net-svg.cx-foco .bubble-node.cx-on { opacity: 1; stroke: #c7ff27 !important; stroke-width: 4 !important; filter: drop-shadow(0 0 16px #c7ff27); }
  .bubble-net-svg.cx-foco .bubble-node-label.cx-on { opacity: 1; }
  .model-construction-diagram.cx-on, .model-construction-step.cx-on { outline: 2px solid #c7ff27; outline-offset: 5px; border-radius: 14px; }
  .cx-titulo { text-shadow: 0 0 30px rgba(199,255,39,.35); }
`;
const NODOS = ['agentes', 'procesos', 'flujos', 'interacciones', 'sistemas', 'emergencia'];

function ir(win, y, o) {
  const top = Math.max(0, Math.round(y));
  if (o?.rapido) { win.scrollTo({ top, behavior: 'instant' }); return Promise.resolve(); }
  return new Promise((res) => {
    const y0 = win.scrollY, dy = top - y0; if (Math.abs(dy) < 2) return res();
    const dur = Math.min(1500, 500 + Math.abs(dy) * 0.5), t0 = win.performance.now();
    const f = (now) => { const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; win.scrollTo({ top: y0 + dy * e, behavior: 'instant' }); k < 1 ? win.requestAnimationFrame(f) : res(); };
    win.requestAnimationFrame(f);
  });
}
const alto = (win, el, off) => win.scrollY + el.getBoundingClientRect().top - off;
function foco(doc, lista) {
  const svg = doc.querySelector('.bubble-net-svg'); svg.classList.toggle('cx-foco', !!lista?.length);
  NODOS.forEach((k) => {
    const on = !!lista?.includes(k);
    doc.querySelector('.bn-' + k)?.classList.toggle('cx-on', on);
    const lab = [...doc.querySelectorAll('.bubble-node-label')].find((l) => l.textContent.trim().toLowerCase() === k); lab?.classList.toggle('cx-on', on);
  });
}
const constr = (doc, on, paso) => {
  const d = doc.querySelector('.model-construction-diagram'); d.classList.remove('cx-on');
  doc.querySelectorAll('.model-construction-step').forEach((s) => s.classList.remove('cx-on'));
  if (on) { (paso == null ? d : doc.querySelectorAll('.model-construction-step')[paso]).classList.add('cx-on'); }
};

registrar('complejo', {
  url: './paginas/modelamiento2/modulo-07.html?v2=1',
  listo: async (win) => { await hasta(() => win.document.querySelectorAll('.bubble-node').length >= 6 && win.document.querySelector('.model-construction-diagram')); },
  preparar: (win, doc) => { const s = doc.createElement('style'); s.textContent = CSS; doc.head.appendChild(s); },
  estados: {
    // título «Bogotá como sistema complejo»
    inicio: (win, doc, o) => { foco(doc, null); constr(doc, false); return ir(win, 0, o); },
    // «¿Qué queremos hacer visible?»: los seis conceptos. lista: cuáles resaltar (por clave)
    visibles: async (win, doc, o) => { foco(doc, o.lista || null); constr(doc, false); await ir(win, alto(win, doc.querySelector('.visible-elements-section'), 70), o); },
    agentes: async (win, doc, o) => { foco(doc, ['interacciones', 'agentes']); constr(doc, false); await ir(win, alto(win, doc.querySelector('.visible-elements-section'), 70), o); },
    procesos: async (win, doc, o) => { foco(doc, ['procesos', 'flujos']); constr(doc, false); await ir(win, alto(win, doc.querySelector('.visible-elements-section'), 70), o); },
    emergencia: async (win, doc, o) => { foco(doc, ['emergencia']); constr(doc, false); await ir(win, alto(win, doc.querySelector('.visible-elements-section'), 70), o); },
    // «pasamos de componentes aislados a relaciones, interacciones y retroalimentaciones, de las que emergen patrones»
    construccion: async (win, doc, o) => { foco(doc, null); constr(doc, true, o.paso); await ir(win, alto(win, doc.querySelector('.model-construction-diagram'), win.innerHeight * 0.35), o); },
    // lectura del territorio: seis subsistemas
    territorio: async (win, doc, o) => { foco(doc, null); constr(doc, false); await ir(win, alto(win, doc.querySelector('.territory-reading-section'), 60), o); },
  },
});


