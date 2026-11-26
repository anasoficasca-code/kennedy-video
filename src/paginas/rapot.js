// Driver de la página RAPOT (v2.html): esfera de 38 componentes → Descompone / Organiza / Prioriza → seis relaciones
import { registrar, hasta } from '../pagina.js';

const CSS = `
  html { scroll-behavior: auto !important; }
  .nav, .nav-cta, .nav-links, .scroll-hint, .stage-caption .label + .label, #tip { display: none !important; }
  * { cursor: none !important; }
  .hl-rel { outline: 2px solid #4fdccc; outline-offset: 6px; border-radius: 12px; transition: outline-color .4s; }
`;

function ir(win, y, o) {
  const top = Math.max(0, Math.round(y));
  if (o?.rapido) { win.scrollTo({ top, behavior: 'instant' }); return Promise.resolve(); }
  return new Promise((res) => {
    const y0 = win.scrollY, dy = top - y0; if (Math.abs(dy) < 2) return res();
    const dur = Math.min(1600, 500 + Math.abs(dy) * 0.5), t0 = win.performance.now();
    const f = (now) => { const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; win.scrollTo({ top: y0 + dy * e, behavior: 'instant' }); k < 1 ? win.requestAnimationFrame(f) : res(); };
    win.requestAnimationFrame(f);
  });
}
const paso = (doc, n) => doc.querySelector(`.step[data-state="${n}"]`);
// el estado de la esfera lo decide qué paso cruza el centro de la ventana: se coloca el paso justo en el centro
const aPaso = (win, doc, n, o) => { const e = paso(doc, n); const r = e.getBoundingClientRect(); return ir(win, win.scrollY + r.top + r.height / 2 - win.innerHeight * 0.5 + (n ? 12 : 0), o); };

registrar('rapot', {
  url: './paginas/modelamiento2/v2.html',
  listo: async (win) => { await hasta(() => win.document.getElementById('legend')?.children.length > 0 && win.document.getElementById('rels')?.children.length > 0); },
  preparar: (win, doc) => { const s = doc.createElement('style'); s.textContent = CSS; doc.head.appendChild(s); },
  estados: {
    // esfera de 38 componentes, h1 «Ingeniería del POT»
    inicio: (win, doc, o) => { doc.querySelectorAll('.hl-rel').forEach((e) => e.classList.remove('hl-rel')); return ir(win, 0, o); },
    // 1 · Descompone: cuatro estructuras (EEP 14, EFC 10, ESECI 9, EIP 5)
    descompone: (win, doc, o) => aPaso(win, doc, 1, o),
    // 2 · Organiza: seis relaciones
    organiza: (win, doc, o) => aPaso(win, doc, 2, o),
    // 3 · Prioriza: el tamaño de cada grupo
    prioriza: (win, doc, o) => aPaso(win, doc, 3, o),
    // sección «Seis relaciones, en palabras del plan»
    relaciones: (win, doc, o) => { const e = doc.getElementById('relaciones'); return ir(win, win.scrollY + e.getBoundingClientRect().top - 70, o); },
  },
});


