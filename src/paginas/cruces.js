// Página «De 18 capas a 9 índices» (picos/cruces): pila de 18 láminas → filamentos → 9 índices.
// Los estados simulan lo que hace el visor con el cursor (hover / clic) sin tocar su contenido.
import { registrar, hasta, camara } from '../pagina.js';

const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const nuevo = (win) => (win.__tok = (win.__tok || 0) + 1);
const IDX9 = ['IC', 'CCL', 'PA', 'EPO', 'PM', 'OC', 'CO', 'SE', 'CV']; // el orden de la página: col. A, col. B, cruces finales

const CSS = `
.marco,.pie{display:none!important}
.genealogia{padding-top:66px}
/* frase de las 18 capas: solo la pila; lo demás espera (animaciones pausadas) y entra cuando se quita la clase */
.red.solo-pila :is(.red__indices,.red__sintesis,.red__flujos){visibility:hidden}
.genealogia__cabeza{transition:opacity .9s}
.genealogia:has(.red.solo-pila) .genealogia__cabeza{opacity:0}
.red.solo-pila :is(.red__indices,.red__sintesis,.red__flujos) *{animation-play-state:paused!important}
`;

const red = (win) => win.document.querySelector('.red');
const fijar = (win, id, hover = null) => win.eval(`fijo=${JSON.stringify(id)};hover=${JSON.stringify(hover)};pintar()`);
const centro = (win, id) => {
  const el = win.eval(`(esBase('${id}')?estratos:nodos)['${id}']`); const r = el.getBoundingClientRect();
  return { l: r.left, t: r.top, r: r.right, b: r.bottom };
};
/** encuadra un índice con sus capas de origen (pila → nodo) */
function enfocar(win, id, o = {}) {
  const ent = win.eval(`IDX.find(d=>d.id==='${id}').in.filter(esBase)`);
  const caj = [id, ...ent].map((k) => centro(win, k));
  const l = Math.min(...caj.map((c) => c.l)) - (ent.length ? 230 : 0), r = Math.max(...caj.map((c) => c.r)), t = Math.min(...caj.map((c) => c.t)), b = Math.max(...caj.map((c) => c.b));
  const W = win.innerWidth, H = win.innerHeight;
  const s = Math.max(1, Math.min(o.max || 2.1, 0.78 * Math.min(W / (r - l), H / (b - t))));
  camara({ x: ((l + r) / 2 / W) * 100, y: ((t + b) / 2 / H) * 100, s, d: o.d ?? 1.6, ease: 'power3.inOut' });
}
const libre = (win, solo) => {
  const R = red(win); win.__libre = true;
  R.classList.toggle('solo-pila', !!solo);
  if (!R.hasAttribute('data-visto')) R.setAttribute('data-visto', '');
};

registrar('cruces', {
  url: './paginas/picos/cruces/index.html',
  listo: async (win) => { await hasta(() => win.document.querySelectorAll('.estrato').length === 18 && win.document.querySelector('.nodo')); },
  preparar: (win, doc) => {
    const st = doc.createElement('style'); st.textContent = CSS; doc.head.appendChild(st);
    const R = red(win); win.__libre = false;
    R.classList.add('solo-pila');
    // la página activa la entrada sola (IntersectionObserver / temporizador): se retiene hasta que la frase la pida
    R.removeAttribute('data-visto');
    new win.MutationObserver(() => { if (!win.__libre && R.hasAttribute('data-visto')) R.removeAttribute('data-visto'); }).observe(R, { attributes: true, attributeFilter: ['data-visto'] });
  },
  estados: {
    /** «dieciocho capas»: la pila se levanta y se recorre capa por capa (01 Bibliored … 18 EEP y parques) */
    pila: async (win, doc, o) => {
      const t = nuevo(win); const R = red(win);
      fijar(win, null);
      if (o.rapido) { libre(win, true); return; }
      win.__libre = true; R.classList.add('solo-pila'); R.removeAttribute('data-visto'); void R.offsetWidth;
      await esp(450); if (win.__tok !== t) return;
      R.setAttribute('data-visto', '');
      await esp(1500);
      const ids = win.eval('BASE.map(b=>b.id)');
      for (const id of ids) { if (win.__tok !== t) return; fijar(win, null, id); await esp(285); }
      if (win.__tok === t) fijar(win, null);
    },
    /** «nueve índices»: entran los filamentos y los 9 nodos; se recorren uno a uno */
    nueve: async (win, doc, o) => {
      const t = nuevo(win); fijar(win, null);
      camara({ x: 50, y: 50, s: 1, d: o.rapido ? 0 : 1.4 });
      if (o.rapido) { libre(win, false); return; }
      libre(win, false);
      await esp(1050);
      for (const id of IDX9) { if (win.__tok !== t) return; fijar(win, null, id); await esp(300); }
      if (win.__tok === t) fijar(win, null);
    },
    /** «CCL y SE»: cada índice con sus capas de origen y su fórmula */
    ccl_se: async (win, doc, o) => {
      const t = nuevo(win); libre(win, false);
      if (o.rapido) { fijar(win, 'SE'); enfocar(win, 'SE', { d: 0 }); return; }
      fijar(win, 'CCL'); enfocar(win, 'CCL');
      await esp(3100); if (win.__tok !== t) return;
      fijar(win, 'SE'); enfocar(win, 'SE', { d: 1.5 });
    },
    /** «relaciones espaciales»: la red completa; se resaltan CCL y SE como cruce */
    relaciones: async (win, doc, o) => {
      const t = nuevo(win); libre(win, false);
      camara({ x: 50, y: 50, s: 1, d: o.rapido ? 0 : 1.6 });
      if (o.rapido) { fijar(win, null); return; }
      fijar(win, null); await esp(900);
      for (const id of ['CCL', 'SE']) { if (win.__tok !== t) return; fijar(win, id); await esp(1500); }
      if (win.__tok === t) fijar(win, null);
    },
  },
});
