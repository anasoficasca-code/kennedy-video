// Driver de macromodelos (modulo-04.html): «¿Qué otros modelos necesitamos…?» y sus seis modelos
import { registrar, hasta } from '../pagina.js';

const CSS = `
  html { scroll-behavior: auto !important; }
  * { cursor: none !important; }
  .sidebar, .icon-nav, .topbar { display: none !important; }
  .model-keyword-card { transition: transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s, border-color .5s, opacity .5s; }
  .complementary-models.mm-foco .model-keyword-card { opacity: .35; }
  .complementary-models.mm-foco .model-keyword-card.mm-on { opacity: 1; transform: scale(1.06); border-color: #c7ff27 !important; box-shadow: 0 0 0 2px #c7ff27, 0 18px 50px rgba(199,255,39,.22); }
  .mm-pregunta { color: #fff !important; text-shadow: 0 0 28px rgba(199,255,39,.45); }
`;
const seccion = (doc) => doc.querySelector('.complementary-models');
function ir(win, doc, y, o) {
  const m = doc.querySelector('main.main'); const top = Math.max(0, Math.round(y));
  if (o?.rapido) { m.scrollTo({ top, behavior: 'instant' }); return Promise.resolve(); }
  return new Promise((res) => {
    const y0 = m.scrollTop, dy = top - y0; if (Math.abs(dy) < 2) return res();
    const dur = Math.min(1500, 500 + Math.abs(dy) * 0.5), t0 = win.performance.now();
    const f = (now) => { const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; m.scrollTo({ top: y0 + dy * e, behavior: 'instant' }); k < 1 ? win.requestAnimationFrame(f) : res(); };
    win.requestAnimationFrame(f);
  });
}
const aSeccion = (win, doc, o) => { const m = doc.querySelector('main.main'); const s = seccion(doc); return ir(win, doc, m.scrollTop + s.getBoundingClientRect().top - m.getBoundingClientRect().top - 24, o); };
function enfocar(doc, patron, pregunta = false) {
  const s = seccion(doc); s.classList.toggle('mm-foco', !!patron);
  s.querySelectorAll('h2').forEach((h) => h.classList.toggle('mm-pregunta', pregunta));
  [...s.querySelectorAll('.model-keyword-card')].forEach((c) => c.classList.toggle('mm-on', !!patron && patron.test(c.textContent)));
}

registrar('macromodelos', {
  url: './paginas/modelamiento2/modulo-04.html?v2=1',
  listo: async (win) => { await hasta(() => win.document.querySelectorAll('.model-keyword-card').length >= 6); },
  preparar: (win, doc) => { const s = doc.createElement('style'); s.textContent = CSS; doc.head.appendChild(s); },
  estados: {
    inicio: (win, doc, o) => { enfocar(doc, null); return ir(win, doc, 0, o); },
    // «¿Qué otros modelos necesitamos para comprender mejor aquello que el POT no puede explicar o abordar?»
    pregunta: async (win, doc, o) => { enfocar(doc, null, true); await aSeccion(win, doc, o); },
    // resalta un modelo (patrón sobre su título): dinámico, causal, agentes, adaptativo, multiescalar, flujos
    modelo: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, o.patron || /din[aá]mico/i); },
    dinamico: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, /din[aá]mico/i); },
    agentes: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, /agentes/i); },
    causal: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, /causal/i); },
    adaptativo: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, /adaptativo/i); },
    multiescalar: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, /multiescalar/i); },
    flujos: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, /de flujos/i); },
    todos: async (win, doc, o) => { await aSeccion(win, doc, o); enfocar(doc, /./); },
  },
});



