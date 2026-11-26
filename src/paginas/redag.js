// Driver de «Red de problemas», versión de alejagoguti-cpu (copia en public/paginas/red-ag/).
// Esta versión agrega, después de cada problema del recorrido, su «Criterio de diseño» (F2, B2…), las «Seis capas»
// (#kcap: cada problema sobre Kennedy con su indicador) y la conectografía con la leyenda «causas por problema».
// Estados: red · conecto · capas · paso · criterios
import { registrar, hasta, precargar, ventana } from '../pagina.js';
import { pausarOculta, ev, scrollA, aNegro, camRed, quitarResalte, CSS_FORMATO, fondoFormato } from './red.js';

const NOMBRE = 'redag';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let gen = 0;

const secFin = (win) => { const S = ev(win, 'SECS'); const s = S[S.length - 1]; return s.getBoundingClientRect().top + win.scrollY; };
const topDe = (win, el) => el.getBoundingClientRect().top + win.scrollY;
/** la conectografía (módulo 12, otra página) empieza a cargar antes de que se use */
function cgCarga(win) { try { ev(win, 'CG.pre=1;cgArma();if(!CG.fr.src||CG.fr.src==="about:blank"){CG.listo=false;CG.fr.src=CGURL}'); } catch (e) { console.warn('[redag] conectografía', e); } }
function cgApaga(win, rapido) { try { if (ev(win, 'CG.to')) { ev(win, 'cgIr(false)'); if (rapido) ev(win, 'CG.t0=performance.now()-20000'); } } catch (e) { /* aún no se armó */ } }
const cerrarPanel = (win) => { try { if (ev(win, 'P.open')) ev(win, 'closePanel()'); } catch (e) { /* */ } };

/** se llama desde el capítulo 05 unos segundos antes de la conectografía: la página (oculta) queda en la red y el módulo 12 cargando */
export async function precargarConecto() {
  precargar(NOMBRE);
  const win = await hasta(() => { const w = ventana(NOMBRE); return w && w.__raListo ? w : null; }, 40000);
  if (!win) return;
  if (Math.abs(win.scrollY - secFin(win)) > 4) win.scrollTo(0, secFin(win));
  cgCarga(win);
}

/** lleva la historia al paso k del recorrido (F, F2, B, B2…): la tarjeta y el mapa fijo de ese paso */
async function irPaso(win, doc, k, o) {
  const p = doc.querySelector(`#story .paso[data-k="${k}"]`); if (!p) { console.warn('[redag] paso', k); return null; }
  const y = topDe(win, p);
  const dist = Math.abs(win.scrollY - y);
  if (o.rapido || dist < 2) win.scrollTo(0, y);
  else if (dist <= win.innerHeight * 1.2) await scrollA(win, y, o.d ?? 1.5, false); // el paso siguiente: scroll como una persona
  else await aNegro(win, async () => { win.scrollTo(0, y); await espera(60); }, false); // salto largo: corte limpio
  return p;
}

registrar(NOMBRE, {
  url: './paginas/red-ag/index.html',
  listo: async (win) => {
    pausarOculta(win);
    await hasta(() => win.eval('typeof SECS') !== 'undefined' && win.eval('SECS.length') >= 11 && typeof win.pasoMapa === 'function' && win.document.querySelector('#kcap .kc-tags') && win.document.getElementById('criterios'), 40000);
    win.__raListo = 1;
  },
  preparar: (win, doc) => {
    const st = doc.createElement('style');
    st.textContent = CSS_FORMATO + `
      /* la leyenda de la conectografía con los colores del formato */
      #cgleg{background:rgba(11,13,16,.9)!important;border-color:rgba(243,244,238,.14)!important}
      #cgleg b{color:#cfff5e!important}
      /* tarjetas del recorrido sobre tinta */
      #story .card.esc{background:transparent!important}
      #kcap{background:#0b0d10!important}
      #criterios .blq{background:#0b0d10!important}
    `;
    doc.head.appendChild(st);
    fondoFormato(win);
  },
  estados: {
    /** la red de seis nodos (sección final), sin resaltes */
    red: async (win, doc, o) => {
      const yo = ++gen; cerrarPanel(win); cgApaga(win, true); quitarResalte(win);
      await scrollA(win, secFin(win), 0, true);
      await hasta(() => ev(win, 'H.modo') === 'red', 8000); if (yo !== gen) return;
      ev(win, 'T0=T0===null?performance.now()-3000:Math.min(T0,performance.now()-3000)');
      cgCarga(win);
      if (o.cam) camRed(win, o.cam, o.rapido);
    },
    /** clic en «Conectografía»: las esferas estallan, Kennedy se rearma y entra la axonometría con las causas por problema */
    conecto: async (win, doc, o) => {
      const yo = ++gen; cerrarPanel(win); quitarResalte(win);
      if (Math.abs(win.scrollY - secFin(win)) > 4) await scrollA(win, secFin(win), 0, true);
      cgCarga(win);
      await hasta(() => ev(win, 'H.modo') === 'red', 8000); if (yo !== gen) return;
      ev(win, 'T0=T0===null?performance.now()-3000:Math.min(T0,performance.now()-3000)');
      if (ev(win, 'CG.to')) return; // ya está en la conectografía
      if (!o.rapido) { await espera(o.antes ?? 0); if (yo !== gen) return; }
      ev(win, 'cgIr(true)');
      if (o.rapido) ev(win, 'CG.t0=performance.now()-20000');
    },
    /**
     * «Seis capas, un solo territorio» (#kcap): o.p = avance 0..1 de la escena (0,45 capas apiladas con sus indicadores;
     * 0,75 se funden y «los indicadores se juntan»), o.desde = avance desde el que arranca el scroll, o.d = segundos
     */
    capas: async (win, doc, o) => {
      const yo = ++gen; cerrarPanel(win);
      const k = doc.getElementById('kcap'); if (!k) return;
      const y0 = topDe(win, k), H = k.offsetHeight - win.innerHeight;
      const yA = y0 + H * (o.desde ?? o.p), yB = y0 + H * o.p;
      const lejos = Math.abs(win.scrollY - yA) > win.innerHeight * 1.5;
      if (lejos && !o.rapido) await aNegro(win, async () => { cgApaga(win, true); win.scrollTo(0, yA); await espera(300); }, false);
      else if (lejos) { cgApaga(win, true); win.scrollTo(0, yA); }
      if (yo !== gen) return;
      await scrollA(win, yB, o.d ?? 3, o.rapido);
    },
    /** paso k del recorrido; o.reanimar vuelve a contar la tarjeta, o.repite vuelve a dibujar la capa del mapa */
    paso: async (win, doc, o) => {
      const yo = ++gen; cerrarPanel(win); cgApaga(win, true);
      const p = await irPaso(win, doc, o.k, o); if (!p || yo !== gen) return;
      const card = p.querySelector('.card');
      if (card && (o.reanimar && !o.rapido)) {
        card.classList.remove('vis'); void card.offsetWidth;
        await espera(80); if (yo !== gen) return;
        card.classList.add('vis'); try { win.contar(card); } catch (e) { /* */ }
      } else if (card && !card.classList.contains('vis')) { card.classList.add('vis'); try { win.contar(card); } catch (e) { /* */ } }
      if (o.repite && !o.rapido) {
        const otro = o.k[0] === 'F' ? 'B' : 'F';
        win.pasoMapa(otro); await espera(90); if (yo !== gen) return; win.pasoMapa(o.k);
      } else if (ev(win, 'MK.paso') !== o.k) win.pasoMapa(o.k);
    },
    /** «Del diagnóstico a los criterios de diseño»: o.sec (id de la sección), o.recorre = px que baja leyendo, o.d segundos */
    criterios: async (win, doc, o) => {
      const yo = ++gen; cerrarPanel(win); cgApaga(win, true);
      const s = doc.getElementById(o.sec || 'cr-seis'); if (!s) return;
      const y = topDe(win, s) + (o.dy ?? 0);
      if (Math.abs(win.scrollY - y) > win.innerHeight * 1.2 && !o.rapido) await aNegro(win, async () => { win.scrollTo(0, y); await espera(120); }, false);
      else await scrollA(win, y, 1.2, o.rapido);
      if (yo !== gen || !o.recorre) return;
      if (o.rapido) { win.scrollTo(0, y + o.recorre); return; }
      await espera(o.pausa ?? 600); if (yo !== gen) return;
      await scrollA(win, y + o.recorre, o.d ?? 5, false);
    },
  },
});
