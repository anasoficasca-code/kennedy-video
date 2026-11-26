// Capítulo 04 — todo sale de «Problemáticas de Kennedy» (diagramas causales del Relato, panel plano y axonometría)
import { nodoPct } from '../paginas/problemas.js';

const P = 'problemas';
let gen = 0; // cada frase invalida las acciones diferidas de la anterior (saltos y retrocesos)

/** contexto de una frase: pasos temporales, cámara sobre nodos y pasos del Relato, todos con guardia de vigencia */
function ctx(X) {
  const g = ++gen, r = X.R.rapido, vivo = () => g === gen;
  /** pasos [segundos, fn]; en un salto (rápido) corre todos de inmediato y en orden */
  const seq = (pasos) => pasos.forEach(([t, f]) => { const fn = () => { if (vivo()) f(); }; if (r || t === 0) fn(); else X.gsap.delayedCall(t, fn); });
  const nodo = (clave, s = 1.7, d = 1.6) => { const p = nodoPct(clave); if (!p) return; const k = (v) => Math.min(100 - 50 / s, Math.max(50 / s, v)); X.camPag({ x: k(p.x), y: k(p.y), s, d }); };
  const todo = (d = 0.5) => X.camPag({ x: 50, y: 50, s: 1, d });
  const paso = async (n, o = {}) => { if (!vivo()) return false; await X.pagina(P, 'relato', { entrada: 'corte', paso: n, ...o }); return vivo(); };
  return { vivo, seq, nodo, todo, paso };
}

export default /* ===================================================================== 04 FRAGMENTACIÓN */
  {
    n: '04', nombre: 'Los problemas de fondo', cam: 'alto', tr: 'pliegue', pagina: true,
    base: (X) => { X.capa('agua', true, 0); },
    beats: [
      // "El análisis de estos índices permitió identificar diferentes problemas en Kennedy,"
      { t: 'El análisis de estos índices permitió identificar diferentes problemas en Kennedy,', a: (X) => {
        const c = ctx(X);
        X.pagina(P, 'tronco', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1.0, d: 0 } });
        c.seq([[1.0, () => X.camPag({ x: 50, y: 50, s: 1.18, d: 4 })]]);
      } },
      // "dando paso al estudio de sus causas más profundas y a comprender cómo convergen en un problema estructural más amplio: la fragmentación territorial."
      { t: 'dando paso al estudio de sus causas más profundas y a comprender cómo convergen en un problema estructural más amplio: la fragmentación territorial.', a: async (X) => {
        const c = ctx(X); c.todo(0);
        if (!await c.paso(0, { palabra: 1300 })) return;
        c.seq([[1.6, () => X.camPag({ x: 50, y: 50, s: 1.1, d: 5 })]]);
      } },
      // "La hiperconcentración del mercado mayorista comienza por la inauguración de Corabastos en 1972 para mejorar la salubridad del abastecimiento,"
      { t: 'La hiperconcentración del mercado mayorista comienza por la inauguración de Corabastos en 1972 para mejorar la salubridad del abastecimiento,', a: async (X) => {
        const c = ctx(X); c.todo(0);
        c.seq([[3.4, async () => {
          c.todo(0.4);
          if (!await c.paso(3, { palabra: 700, anio: 1972 })) return;
        }]]);
        await c.paso(1, { palabra: 1100 });
      } },
      // "a medida que se perdió producción agrícola local, aumentó la dependencia de otras regiones y se concentraron los viajes de carga."
      { t: 'a medida que se perdió producción agrícola local, aumentó la dependencia de otras regiones y se concentraron los viajes de carga.', a: async (X) => {
        const c = ctx(X); c.todo(0);
        c.seq([[4.8, async () => { c.todo(0.4); await c.paso(2, { palabra: 600 }); }]]);
        await c.paso(4, { palabra: 900 });
      } },
      // "El segundo es la saturación de residuos."
      { t: 'El segundo es la saturación de residuos.', a: async (X) => {
        const c = ctx(X); c.todo(0);
        await c.paso(9, { palabra: 1700 });
      } },
      // "La concentración comercial incrementa la generación de desechos que, cuando superan la capacidad de recolección y tratamiento, se acumulan."
      { t: 'La concentración comercial incrementa la generación de desechos que, cuando superan la capacidad de recolección y tratamiento, se acumulan.', a: async (X) => {
        const c = ctx(X); c.todo(0);
        if (!await c.paso(9, { palabra: 0 })) return;
        c.seq([[1.6, () => c.nodo('rsol', 1.7, 1.8)], [4.2, () => c.nodo('san', 1.7, 1.8)], [6.6, () => c.nodo('res', 1.7, 1.6)]]);
      } },
      // "A esto se suma la impermeabilización del suelo, que aumenta la escorrentía y el arrastre de contaminantes hacia los cuerpos de agua."
      { t: 'A esto se suma la impermeabilización del suelo, que aumenta la escorrentía y el arrastre de contaminantes hacia los cuerpos de agua.', a: async (X) => {
        const c = ctx(X); c.todo(0);
        c.seq([[3.6, async () => { c.todo(0.4); await c.paso(10, { palabra: 600 }); }]]);
        if (!await c.paso(14, { palabra: 900 })) return;
        c.seq([[0.8, () => c.nodo('imperm', 1.7, 1.6)]]);
      } },
      // "Finalmente, la degradación del soporte ecológico está relacionada con la expansión urbana y la pérdida de vegetación, que fragmentan los hábitats"
      { t: 'Finalmente, la degradación del soporte ecológico está relacionada con la expansión urbana y la pérdida de vegetación, que fragmentan los hábitats', a: async (X) => {
        const c = ctx(X); c.todo(0);
        if (!await c.paso(11, { palabra: 1300 })) return;
        c.seq([[0.8, () => c.nodo('plan', 1.5, 1.4)], [3.4, () => c.nodo('supcons', 1.5, 1.6)], [5.8, () => c.nodo('perdveg', 1.5, 1.6)], [7.8, () => c.nodo('hab', 1.5, 1.6)]]);
      } },
    ],
  };
