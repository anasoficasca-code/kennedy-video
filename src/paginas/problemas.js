// Driver de «Problemáticas de Kennedy» (alejagoguti-cpu/problemaskennedy): árbol causal, Relato (pasos 0..16), panel plano y axonometría.
import { registrar, hasta } from '../pagina.js';

const NOMBRE = 'problemas';
let ventana = null; // ventana viva de la página (se fija en listo)

/** posición (en % de la pantalla) del nodo `clave` del diagrama del Relato en curso; null si no está */
export function nodoPct(clave) {
  const w = ventana; if (!w) return null;
  try {
    const net = w.eval('STEPS[SQ.i].net'); const i = net.indexOf(clave); if (i < 0) return null;
    const g = w.document.querySelectorAll('.sq-dia svg > g')[i]; if (!g) return null;
    const r = g.getBoundingClientRect();
    return { x: (r.left + r.width / 2) / w.innerWidth * 100, y: (r.top + r.height / 2) / w.innerHeight * 100 };
  } catch (e) { return null; }
}
/** centro (en %) del diagrama del Relato */
export function diagramaPct() {
  const w = ventana; if (!w) return { x: 50, y: 50 };
  const r = w.document.querySelector('.sq-dia')?.getBoundingClientRect(); if (!r) return { x: 50, y: 50 };
  return { x: (r.left + r.width / 2) / w.innerWidth * 100, y: (r.top + r.height / 2) / w.innerHeight * 100 };
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** abre el paso `n` del Relato: palabra grande y enseguida la escena (diagrama causal animado) */
async function relato(win, n, o = {}) {
  const SQ = win.eval('SQ');
  if (SQ.on && SQ.i === n && SQ.ph === 's') return;
  win.eval('SQ.play=false'); win.sqGo(n);
  const sqAt = win.eval('sqAt');
  const t = o.rapido || o.palabra === 0 ? 0 : (o.palabra ?? 1100);
  if (o.anio) sqAt(() => { try { win.hpSetYear(o.anio); } catch (e) { /* panel aún cerrado */ } }, t + (o.rapido ? 1400 : 2300));
  if (!t) { win.sqScene(); return; }
  sqAt(() => win.sqScene(), t);
  await espera(t + 100);
}

registrar(NOMBRE, {
  url: './paginas/problemas/index.html#todo',
  listo: async (win) => {
    ventana = win;
    await hasta(() => win.sqGo && win.eval('typeof expandAll') === 'function' && win.eval('KK.root'));
    win.eval('SQ.play=false');
  },
  preparar: (win, doc) => {
    ventana = win;
    const st = doc.createElement('style');
    st.textContent = `
      .sq-top,.sq-foot,.sq-bar,.sq-word small,.sq-txt p,.sq-txt .nv,.sq-x{display:none!important}
      .sq-scene{top:48px!important;bottom:20px!important}
      .sq-txt h2{font-size:clamp(22px,2.4vw,34px)!important}
      .sq-word{cursor:default!important}
      #bar,#hint,#zoom,#mini,#legend,#tip{display:none!important}
      .sq-scene{flex-direction:column!important;gap:6px!important}
      .sq-txt{width:auto!important;max-height:none!important;flex:none!important}
      .sq-scene.hasp{margin-right:calc(min(640px,42vw) + 40px)!important}
      .sq-dia{width:100%}
      #sq .sq-dia svg{max-height:100%}
    `;
    doc.head.appendChild(st);
  },
  estados: {
    /** árbol completo expandido (tablero, sin Relato) */
    todo: async (win, doc, o) => {
      win.eval('sqClose()'); win.eval('expandAll()');
    },
    /** raíz y sus tres ramas: los tres problemas que alimentan la fragmentación */
    tronco: async (win, doc, o) => {
      win.eval('sqClose()');
      win.eval('all.forEach(n=>{n.open=false}); KK.root.open=true; refresh(null); fit()');
    },
    /** paso del Relato: o.paso (0..16), o.palabra (ms que se ve la palabra; 0 = directo) */
    relato: async (win, doc, o) => { await relato(win, o.paso ?? 0, o); },
    /** pulsa «Propagar» del tablero */
    propagar: async (win, doc, o) => { try { win.document.querySelector('#bProp')?.click(); } catch (e) { /* sin botón */ } },
    cerrar: async (win) => { win.eval('sqClose()'); },
  },
});

