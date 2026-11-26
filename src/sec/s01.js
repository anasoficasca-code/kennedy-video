// Capítulo 01 — arranca en la fotogrametría 3D y entra a las páginas reales del proyecto
import { I } from './util.js';
import { nodoPct } from '../paginas/problemas.js';

const P = 'problemas';
let gen = 0; // cada frase invalida las acciones diferidas de la anterior (saltos y retrocesos)

function ctx(X) {
  const g = ++gen, r = X.R.rapido, vivo = () => g === gen;
  /** pasos [segundos, fn]; en un salto (rápido) corre todos de inmediato y en orden */
  const seq = (pasos) => pasos.forEach(([t, f]) => { const fn = () => { if (vivo()) f(); }; if (r || t === 0) fn(); else X.gsap.delayedCall(t, fn); });
  const nodo = (clave, s = 1.6, d = 1.4) => { const p = nodoPct(clave); if (!p) return; const k = (v) => Math.min(100 - 50 / s, Math.max(50 / s, v)); X.camPag({ x: k(p.x), y: k(p.y), s, d }); };
  /** muestra una página; si su driver no existe todavía, usa la alternativa */
  const pag = (nombre, estado, o, alt) => Promise.resolve().then(() => X.pagina(nombre, estado, o)).catch(() => { if (vivo()) alt?.(); });
  return { vivo, seq, nodo, pag };
}
const centro = { camara: { x: 50, y: 50, s: 1, d: 0 } };

export default /* ===================================================================== 01 INTRODUCCIÓN */
  {
    n: '01', nombre: 'Introducción', cam: 'alto', tr: 'pliegue',
    base: (X) => { X.capa('agua', true, 0); },
    beats: [
      // "La modernización del abastecimiento, el crecimiento urbano y la transformación del suelo buscaban responder a necesidades diferentes,"
      { t: 'La modernización del abastecimiento, el crecimiento urbano y la transformación del suelo buscaban responder a necesidades diferentes,', a: (X) => {
        const c = ctx(X);
        // abastecimiento: Corabastos
        X.cam('cora', 3); X.capa('corabastos'); X.foco(X.LUG.corabastos, 900, '#C7FF27');
        // crecimiento urbano: los edificios crecen en ola desde Corabastos
        c.seq([[2.6, () => { X.sinFoco(); X.sube(1, X.LUG.corabastos, 3); X.W.capas.edif.userData.u.uSube.value = 0.15; X.sube(1, X.LUG.corabastos, 3.2); }]]);
        // transformación del suelo: las axonometrías reales de Kennedy
        c.seq([[5.4, () => {
          X.foto('axo', { src: I('axo_1956.jpg'), right: '5vw', top: '18vh', width: 40, height: '50vh', cap: '<b>1956</b>' });
          X.flipbook('axo', [I('axo_1956.jpg'), I('axo_1972.jpg'), I('axo_1988.jpg'), I('axo_2024.jpg')], 0.9, ['<b>1956</b>', '<b>1972</b>', '<b>1988</b>', '<b>2024</b>']);
        }]]);
      } },
      // "pero sus efectos terminaron entrelazándose,"
      { t: 'pero sus efectos terminaron entrelazándose,', a: (X) => {
        X.limpiar(); X.sinFoco(); X.capa('corabastos', false); X.W.capas.edif.userData.u.uSube.value = 1;
        X.cam('mapa', 3); X.capa('vias-prin'); X.capa('flujos'); X.capa('agua');
        X.uTo('flujos', 'uV', 900, 2);
      } },
      // "intensificando la dependencia alimentaria, la acumulación de residuos y la degradación de los ecosistemas."
      { t: 'intensificando la dependencia alimentaria, la acumulación de residuos y la degradación de los ecosistemas.', a: async (X) => {
        const c = ctx(X); X.limpiar();
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        await X.pagina(P, 'relato', { entrada: 'barrido', paso: 0, palabra: 0, camara: { x: 50, y: 50, s: 1, d: 0 } });
        if (!c.vivo()) return;
        c.seq([[0.9, () => c.nodo('may', 1.7, 1.2)], [2.3, () => c.nodo('res', 1.7, 1.2)], [3.7, () => c.nodo('eco', 1.7, 1.2)], [5.0, () => X.camPag({ x: 50, y: 50, s: 1, d: 0.8 })]]);
      } },
      // "Problemas que no fueron consecuencia de una sola decisión, sino de múltiples dinámicas que se reforzaron entre sí."
      { t: 'Problemas que no fueron consecuencia de una sola decisión, sino de múltiples dinámicas que se reforzaron entre sí.', a: async (X) => {
        const c = ctx(X);
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        await X.pagina(P, 'todo', { entrada: 'corte', camara: { x: 50, y: 50, s: 1, d: 0 } });
        if (!c.vivo()) return;
        c.seq([[3.4, () => X.pagina(P, 'propagar', {})], [0.5, () => X.camPag({ x: 50, y: 50, s: 1.35, d: 5.5 })]]);
      } },
      // "Precisamente, estas dinámicas y las relaciones son el punto central del proyecto de Modelamiento Dinámico y Simulación."
      { t: 'Precisamente, estas dinámicas y las relaciones son el punto central del proyecto de Modelamiento Dinámico y Simulación.', a: async (X) => {
        const c = ctx(X);
        X.pagina(P, 'todo', {});
        X.camPag({ x: 50, y: 50, s: 1.35, d: 0 });
        c.seq([[1.0, () => X.camPag({ x: 50, y: 50, s: 1, d: 2.2 })],
          [4.2, () => { c.pag('macromodelos', 'dinamico', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0 } }); }]]);
      } },
      // "Su desarrollo comprende el análisis del POT de Bogotá, el diagnóstico y la formulación de los problemas de Kennedy,"
      { t: 'Su desarrollo comprende el análisis del POT de Bogotá, el diagnóstico y la formulación de los problemas de Kennedy,', a: (X) => {
        const c = ctx(X);
        c.pag('rapot', 'inicio', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0 } });
        c.seq([[2.6, () => { c.pag('cruces', 'nueve', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0 } }); }],
          [4.4, () => { c.pag(P, 'tronco', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0 } }); }]]);
      } },
      // "la construcción de un modelo propio de ciudad y la exploración de sus posibles consecuencias mediante simulaciones."
      { t: 'la construcción de un modelo propio de ciudad y la exploración de sus posibles consecuencias mediante simulaciones.', a: (X) => {
        const c = ctx(X);
        c.pag('propuesta', 'inicio', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0 } },
          () => c.pag('macromodelos', 'todos', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0 } }));
        c.seq([[3.4, () => { X.sinPagina(); X.limpiar(); X.cam('cora', 3); X.capa('agentes'); }]]);
      } },
    ],
  };
