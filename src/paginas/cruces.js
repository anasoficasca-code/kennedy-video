// Página «De 18 capas a 9 índices» (picos/cruces): pila de 18 láminas → filamentos → 9 índices.
// Se usa como la usaría una persona: un cursor recorre los rótulos y los nodos (hover real de la página:
// pasar(id)) y hace clic (fijo = id). Sin zoom: la página se ve entera, tal cual.
// Estados ABSOLUTOS e idempotentes: inicio · capas · indices · ccl · se
import gsap from 'gsap';
import { registrar, hasta } from '../pagina.js';

const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const nuevo = (win) => (win.__tok = (win.__tok || 0) + 1);
const IDX9 = ['IC', 'CCL', 'PA', 'EPO', 'PM', 'OC', 'CO', 'SE', 'CV']; // orden de la página: col. A, col. B, compuestos

/* ------------------------------------------------------------------ cursor (compartido con picos.js) */
const CSS_CURSOR = `
#ed-cursor{position:fixed;left:0;top:0;z-index:99999;width:26px;height:26px;pointer-events:none;opacity:0;will-change:transform}
#ed-cursor svg{display:block;width:26px;height:26px;overflow:visible}
#ed-cursor .onda{position:absolute;left:-17px;top:-17px;width:34px;height:34px;border-radius:50%;border:2px solid #cfff5e;opacity:0}
`;
/** cursor de una persona dentro de la página (flecha blanca con borde tinta + onda lima al hacer clic) */
export function cursor(win) {
  const doc = win.document;
  let c = doc.getElementById('ed-cursor');
  if (!c) {
    const st = doc.createElement('style'); st.textContent = CSS_CURSOR; doc.head.appendChild(st);
    c = doc.createElement('div'); c.id = 'ed-cursor';
    c.innerHTML = '<i class="onda"></i><svg viewBox="0 0 26 26"><path d="M2 1.5 L2 20 L6.8 15.6 L10 23 L13.4 21.5 L10.3 14.3 L16.8 14.3 Z" fill="#f3f4ee" stroke="#0b0d10" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    doc.body.appendChild(c);
    c.__p = { x: win.innerWidth * 0.62, y: win.innerHeight * 0.55, a: 0 };
  }
  return c;
}
function pintarCursor(c) { const p = c.__p; c.style.transform = `translate(${p.x}px,${p.y}px)`; c.style.opacity = p.a; }
/** punto (px de la página) del centro de un elemento, con un desvío natural */
export function centroDe(el, fx = 0.5, fy = 0.5) { const r = el.getBoundingClientRect(); return { x: r.left + r.width * fx, y: r.top + r.height * fy }; }
/** mueve el cursor hasta (x, y) con la curva de una mano (rápido al salir, frena al llegar) */
export function moverCursor(win, x, y, o = {}) {
  const c = cursor(win), p = c.__p;
  gsap.killTweensOf(p);
  if (o.rapido) { Object.assign(p, { x, y, a: o.oculto ? 0 : 1 }); pintarCursor(c); return Promise.resolve(); }
  return new Promise((res) => gsap.to(p, { x, y, a: 1, duration: o.d ?? 0.75, ease: o.ease || 'power2.inOut', onUpdate: () => pintarCursor(c), onComplete: res }));
}
/** clic: la flecha se hunde un instante y sale una onda lima */
export function clic(win, o = {}) {
  const c = cursor(win); if (o.rapido) return;
  const sv = c.querySelector('svg'), on = c.querySelector('.onda');
  gsap.fromTo(sv, { scale: 1 }, { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '2px 2px' });
  gsap.fromTo(on, { scale: 0.3, opacity: 0.95 }, { scale: 1.5, opacity: 0, duration: 0.6, ease: 'power2.out' });
}
export function ocultarCursor(win, rapido) { const c = cursor(win), p = c.__p; gsap.killTweensOf(p); if (rapido) { p.a = 0; pintarCursor(c); } else gsap.to(p, { a: 0, duration: 0.4, onUpdate: () => pintarCursor(c) }); }

/* ------------------------------------------------------------------ página */
const CSS = `
.marco,.pie{display:none!important}
.genealogia{padding-top:70px}
/* colores del formato: tinta, papel, lima, grises (la página ya usa Barlow Condensed + Geist) */
:root{--campo-0:#0b0d10;--tinta-1:#f3f4ee;--acento-1:#cfff5e}
body{background:#0b0d10}
.genealogia__cabeza h2,.sintesis__titulo{visibility:hidden}   /* sin títulos en pantalla: solo lo que dice la voz */
/* las entradas sin desenfoque (más nítido y más liviano) */
@keyframes surgir{0%{opacity:0;translate:-16px 0}}
/* frases de las 18 capas: solo la pila; lo demás espera (animaciones pausadas) y entra cuando se quita la clase */
.red.solo-pila :is(.red__indices,.red__sintesis,.red__flujos){visibility:hidden}
.genealogia__cabeza{transition:opacity .9s}
.genealogia:has(.red.solo-pila) .genealogia__cabeza{opacity:0}
.red.solo-pila :is(.red__indices,.red__sintesis,.red__flujos) *{animation-play-state:paused!important}
`;

const red = (win) => win.document.querySelector('.red');
const pintar = (win, fijo, hover = null) => win.eval(`fijo=${JSON.stringify(fijo)};hover=${JSON.stringify(hover)};pintar()`);
const elDe = (win, id) => win.eval(`(esBase('${id}')?rotulos['${id}'].querySelector('.rotulo__boton'):nodos['${id}'].querySelector('.nodo__lienzo'))`);
/** suelta la entrada retenida de la red (solo = solo la pila de capas) */
function soltar(win, solo) {
  const R = red(win); win.__libre = true;
  R.classList.toggle('solo-pila', !!solo);
  if (!R.hasAttribute('data-visto')) R.setAttribute('data-visto', '');
}
/** reinicia la entrada de la página (como si recién se abriera) */
function reabrir(win) { const R = red(win); win.__libre = true; R.classList.add('solo-pila'); R.removeAttribute('data-visto'); void R.offsetWidth; }

registrar('cruces', {
  url: './paginas/picos/cruces/index.html',
  listo: async (win) => { await hasta(() => win.document.querySelectorAll('.estrato').length === 18 && win.document.querySelector('.nodo')); },
  preparar: (win, doc) => {
    const st = doc.createElement('style'); st.textContent = CSS; doc.head.appendChild(st);
    const R = red(win); win.__libre = false;
    R.classList.add('solo-pila');
    // la página activa su entrada sola (IntersectionObserver / temporizador): se retiene hasta que la frase la pida
    R.removeAttribute('data-visto');
    new win.MutationObserver(() => { if (!win.__libre && R.hasAttribute('data-visto')) R.removeAttribute('data-visto'); }).observe(R, { attributes: true, attributeFilter: ['data-visto'] });
    cursor(win);
  },
  estados: {
    /** «comprender Kennedy desde la complejidad»: la página se abre y la pila de capas se levanta */
    inicio: async (win, doc, o) => {
      nuevo(win); pintar(win, null);
      ocultarCursor(win, true);
      if (o.rapido) { soltar(win, true); return; }
      reabrir(win); await esp(350);
      red(win).setAttribute('data-visto', '');
    },
    /** «dieciocho capas»: el cursor sube por los rótulos 01 → 18 y cada capa se levanta al pasar (o.alPaso(k)) */
    capas: async (win, doc, o) => {
      const t = nuevo(win); soltar(win, true); pintar(win, null);
      const ids = win.eval('BASE.map(b=>b.id)');
      if (o.rapido) { const p = centroDe(elDe(win, ids[17]), 0.55, 0.5); moverCursor(win, p.x, p.y, { rapido: true, oculto: true }); return; }
      const p0 = centroDe(elDe(win, ids[0]), 0.6, 0.5);
      await moverCursor(win, p0.x + 40, p0.y + 26, { rapido: true, oculto: true });
      await moverCursor(win, p0.x, p0.y, { d: 0.35, ease: 'power2.out' });
      for (let k = 0; k < ids.length; k++) {
        if (win.__tok !== t) return;
        const p = centroDe(elDe(win, ids[k]), 0.55 + 0.08 * Math.sin(k * 1.3), 0.5);
        moverCursor(win, p.x, p.y, { d: 0.14, ease: 'none' });
        win.eval(`pasar('${ids[k]}')`); o.alPaso?.(k + 1);
        await esp(o.paso ?? 150);
      }
      await esp(500); if (win.__tok !== t) return;
      win.eval('pasar(null)');
    },
    /** «nueve índices»: entran filamentos y nodos (animación propia); el cursor los recorre uno a uno (o.alPaso(k)) */
    indices: async (win, doc, o) => {
      const t = nuevo(win); pintar(win, null); soltar(win, false);
      if (o.rapido) { const p = centroDe(elDe(win, 'CV'), 0.5, 0.55); moverCursor(win, p.x, p.y, { rapido: true }); return; }
      await esp(o.espera ?? 1300);
      for (let k = 0; k < IDX9.length; k++) {
        if (win.__tok !== t) return;
        const p = centroDe(elDe(win, IDX9[k]), 0.5 + 0.06 * Math.sin(k * 2.1), 0.55);
        await moverCursor(win, p.x, p.y, { d: k ? 0.24 : 0.5, ease: 'power2.inOut' });
        win.eval(`pasar('${IDX9[k]}')`); o.alPaso?.(k + 1);
        await esp(o.paso ?? 110);
      }
      await esp(450); if (win.__tok !== t) return;
      win.eval('pasar(null)');
    },
    /** «concentración comercial y logística»: clic en CCL → se iluminan sus capas de origen (o.alClic) */
    ccl: async (win, doc, o) => fijarCon(win, 'CCL', o),
    /** «soporte ecológico»: clic en SE → NDVI, NDMI y EEP (o.alClic) */
    se: async (win, doc, o) => fijarCon(win, 'SE', o),
  },
});

async function fijarCon(win, id, o) {
  const t = nuevo(win); soltar(win, false); win.eval('pasar(null)');
  const p = centroDe(elDe(win, id), 0.52, 0.52);
  if (o.rapido) { pintar(win, id); moverCursor(win, p.x, p.y, { rapido: true }); return; }
  await esp(o.espera ?? 250); if (win.__tok !== t) return;
  await moverCursor(win, p.x, p.y, { d: 0.9 }); if (win.__tok !== t) return;
  win.eval(`pasar('${id}')`); await esp(180); if (win.__tok !== t) return;
  clic(win); win.eval(`hover=null;fijo='${id}';pintar()`); o.alClic?.();
}
