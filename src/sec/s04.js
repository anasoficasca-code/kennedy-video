// Capítulo 04 — todo sale de «Problemáticas de Kennedy» (diagramas causales del Relato, panel plano y axonometría)
import { nodoPct, diagramaPct } from '../paginas/problemas.js';

const P = 'problemas';
/** ejecuta pasos temporales [segundos, fn]; en un salto (rápido) corre todos de inmediato y en orden */
const seq = (X, pasos) => pasos.forEach(([t, f]) => { if (X.R.rapido || t === 0) f(); else X.gsap.delayedCall(t, f); });
/** acerca la «cámara» sobre un nodo del diagrama del Relato */
const nodo = (X, clave, s = 1.7, d = 1.6) => { const p = nodoPct(clave); if (p) X.camPag({ x: p.x, y: p.y, s, d }); };
const todo = (X, d = 1.6) => { const p = diagramaPct(); X.camPag({ x: p.x, y: p.y, s: 1, d }); };
const paso = (X, n, o = {}) => X.pagina(P, 'relato', { entrada: 'corte', paso: n, ...o });

export default /* ===================================================================== 04 FRAGMENTACIÓN */
  {
    n: '04', nombre: 'Los problemas de fondo', cam: 'alto', tr: 'pliegue', pagina: true,
    base: (X) => { X.capa('agua', true, 0); },
    beats: [
      // "El análisis de estos índices permitió identificar diferentes problemas en Kennedy,"
      { t: 'El análisis de estos índices permitió identificar diferentes problemas en Kennedy,', a: (X) => {
        X.pagina(P, 'tronco', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1.0, d: 0 } });
        seq(X, [[1.0, () => X.camPag({ x: 50, y: 50, s: 1.18, d: 4 })]]);
      } },
      // "dando paso al estudio de sus causas más profundas y a comprender cómo convergen en un problema estructural más amplio: la fragmentación territorial."
      { t: 'dando paso al estudio de sus causas más profundas y a comprender cómo convergen en un problema estructural más amplio: la fragmentación territorial.', a: async (X) => {
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        await paso(X, 0, { palabra: 1300 });
        seq(X, [[1.6, () => X.camPag({ x: 50, y: 50, s: 1.1, d: 5 })]]);
      } },
      // "La hiperconcentración del mercado mayorista comienza por la inauguración de Corabastos en 1972 para mejorar la salubridad del abastecimiento,"
      { t: 'La hiperconcentración del mercado mayorista comienza por la inauguración de Corabastos en 1972 para mejorar la salubridad del abastecimiento,', a: async (X) => {
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        seq(X, [[3.4, async () => { X.camPag({ x: 50, y: 50, s: 1, d: 0.4 }); await paso(X, 3, { palabra: 700, anio: 1972 }); }]]);
        await paso(X, 1, { palabra: 1100 });
      } },
      // "a medida que se perdió producción agrícola local, aumentó la dependencia de otras regiones y se concentraron los viajes de carga."
      { t: 'a medida que se perdió producción agrícola local, aumentó la dependencia de otras regiones y se concentraron los viajes de carga.', a: async (X) => {
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        seq(X, [[3.6, async () => { await paso(X, 2, { palabra: 600 }); }]]);
        await paso(X, 4, { palabra: 900 });
      } },
      // "El segundo es la saturación de residuos."
      { t: 'El segundo es la saturación de residuos.', a: async (X) => {
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        await paso(X, 9, { palabra: 1700 });
      } },
      // "La concentración comercial incrementa la generación de desechos que, cuando superan la capacidad de recolección y tratamiento, se acumulan."
      { t: 'La concentración comercial incrementa la generación de desechos que, cuando superan la capacidad de recolección y tratamiento, se acumulan.', a: async (X) => {
        await paso(X, 9, { palabra: 0 });
        seq(X, [[1.2, () => nodo(X, 'rsol', 1.9, 1.8)], [4.0, () => nodo(X, 'san', 1.9, 1.8)], [6.4, () => nodo(X, 'res', 1.9, 1.6)]]);
      } },
      // "A esto se suma la impermeabilización del suelo, que aumenta la escorrentía y el arrastre de contaminantes hacia los cuerpos de agua."
      { t: 'A esto se suma la impermeabilización del suelo, que aumenta la escorrentía y el arrastre de contaminantes hacia los cuerpos de agua.', a: async (X) => {
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        await paso(X, 14, { palabra: 900 });
        seq(X, [[0.6, () => nodo(X, 'imperm', 1.7, 1.6)],
          [3.4, async () => { X.camPag({ x: 50, y: 50, s: 1, d: 0.5 }); await paso(X, 10, { palabra: 600 }); }]]);
      } },
      // "Finalmente, la degradación del soporte ecológico está relacionada con la expansión urbana y la pérdida de vegetación, que fragmentan los hábitats"
      { t: 'Finalmente, la degradación del soporte ecológico está relacionada con la expansión urbana y la pérdida de vegetación, que fragmentan los hábitats', a: async (X) => {
        X.camPag({ x: 50, y: 50, s: 1, d: 0 });
        await paso(X, 11, { palabra: 1300 });
        seq(X, [[0.6, () => nodo(X, 'plan', 1.5, 1.4)], [3.2, () => nodo(X, 'supcons', 1.5, 1.6)], [5.6, () => nodo(X, 'perdveg', 1.5, 1.6)], [7.6, () => nodo(X, 'hab', 1.5, 1.6)]]);
      } },
    ],
  };

