// Capítulo 04 — «Problemas de fondo» (anasoficasca-code/problemaskennedy) corriendo a pantalla completa:
// el árbol causal, el Relato paso a paso (diagramas causales animados de la propia página), el plano de flujos
// y la axonometría 1900 → 1972. Encima, la edición: rótulos, la cifra 1972, una lista y señales sobre los nodos
// que nombra la voz. Sin zooms: la página se ve entera, como grabada mientras alguien la usa.
import { nodoEl, cajaProfundas } from '../paginas/problemas.js';

const P = 'problemas';
let gen = 0; // cada frase invalida las acciones diferidas de la anterior (saltos y retrocesos)

/** contexto de una frase: pasos temporizados con guardia de vigencia */
function ctx(X) {
  const g = ++gen, vivo = () => g === gen;
  // si la frase entra con la portadilla del capítulo, la voz empieza cuando la portadilla se abre
  const off = document.querySelector('#edicion .ed-capitulo') ? 2.4 : 0;
  const en = (t, f) => { if (X.R.rapido) return; X.gsap.delayedCall(off + t, () => { if (vivo()) f(); }); };
  const pag = (estado, o = {}) => (vivo() ? X.pagina(P, estado, { entrada: 'corte', ...o }) : null);
  /** señala un nodo del diagrama causal (espera a que esté dibujado) */
  const nodo = (clave, texto, t, dur) => en(t, async () => {
    const el = await X.hasta(() => nodoEl(clave), 2500, 60); if (!el || !vivo()) return;
    const r = el.getBoundingClientRect();
    X.ed.senalar(P, el, { texto, dur, pad: 8, lado: r.bottom > innerHeight * 0.66 ? 'arriba' : '' });
  });
  return { vivo, en, pag, nodo, off };
}

export default /* ===================================================================== 04 PROBLEMAS DE FONDO */
  {
    n: '04', nombre: 'Los problemas de fondo', cam: 'alto', pagina: true, precarga: ['problemas'],
    beats: [
      // árbol causal de la página: arranca con la raíz y sus tres ramas y crece hasta todas las variables
      { t: 'El análisis de estos índices permitió identificar diferentes problemas en Kennedy,', a: (X) => {
        const c = ctx(X);
        X.pagina(P, 'arbol', { entrada: 'corte', crece: (c.off + 1.0) * 1000 });
        c.en(2.0, () => X.ed.rotulo('Diferentes *problemas* en Kennedy', { kick: 'Del análisis de los índices' }));
      } },
      // causas profundas (columnas del fondo del árbol) → el cursor abre el Relato → FRAGMENTACIÓN: raíz y 3 ramas
      { t: 'dando paso al estudio de sus causas más profundas y a comprender cómo convergen en un problema estructural más amplio: la fragmentación territorial.', a: (X) => {
        const c = ctx(X);
        if (X.R.rapido) { X.pagina(P, 'relato', { entrada: 'corte', paso: 0, palabra: 0 }); return; }
        X.pagina(P, 'todo', { entrada: 'corte' });
        c.en(1.6, () => { const k = cajaProfundas(3); if (k) X.ed.senalar(P, k, { texto: 'Causas más profundas', dur: 2.6 }); });
        c.en(4.0, () => c.pag('abrirRelato', { paso: 0, palabra: 1500 }));
        c.nodo('root', 'Problema estructural', 7.4);
      } },
      // Relato 02 · HIPERCONCENTRACIÓN
      { t: 'La hiperconcentración del mercado mayorista', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 1, palabra: 900 });
        c.en(0.5, () => X.ed.rotulo('Hiperconcentración del *mercado mayorista*', { kick: 'Problema 01' }));
      } },
      // Relato 04 · 1972: nace Corabastos — el cursor abre la axonometría y pulsa 1972; la higiene/salubridad se marca en el diagrama
      { t: 'comienza por la inauguración de Corabastos en 1972 para mejorar la salubridad del abastecimiento,', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 3, palabra: 800, panel: 'clic', clicPanel: 250, anio: 1972, clicAnio: 2600 });
        c.en(2.3, () => X.ed.cifra({ v: 1972, desde: 1900, dur_conteo: 1.1, texto: 'Se inaugura *Corabastos*', miles: false, x: 31, y: 9 }));
        c.nodo('hig', 'Salubridad del abastecimiento', 3.9);
      } },
      // Relato 05 · RAÍCES: pérdida de producción local
      { t: 'a medida que se perdió producción agrícola local,', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 4, palabra: 700, panel: 'no' });
        c.nodo('perd', 'Pérdida de producción local', 1.0);
      } },
      // Relato 03 · DEPENDENCIA: el cursor abre el plano con los flujos que llegan a Corabastos
      { t: 'aumentó la dependencia de otras regiones y se concentraron los viajes de carga.', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 2, palabra: 600, panel: 'clic', clicPanel: 150 });
        c.en(0.2, () => X.ed.lista({ titulo: 'En cadena', items: ['Pérdida de producción local', 'Dependencia de *otras regiones*', 'Viajes de carga *concentrados*'], x: 29, y: 10, paso: 1.25, ancho: 26 }));
        c.nodo('dep', 'Dependencia alimentaria', 1.4, 2.4);
        c.en(3.2, () => X.ed.senalar(P, '#pl', { texto: 'Viajes de carga hacia Corabastos', pad: 0, lado: 'arriba' }));
      } },
      // Relato 10 · RESIDUOS
      { t: 'El segundo es la saturación de residuos.', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 9, palabra: 1500 });
        c.en(0.5, () => X.ed.rotulo('Saturación de *residuos*', { kick: 'Problema 02' }));
      } },
      // misma escena: la voz recorre la cadena y cada nodo se marca cuando se nombra
      { t: 'La concentración comercial incrementa la generación de desechos que, cuando superan la capacidad de recolección y tratamiento, se acumulan.', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 9, palabra: 0 });
        c.nodo('desc', 'Generación de desechos', 1.4, 2.4);
        c.nodo('san', 'Capacidad de recolección y tratamiento', 4.0, 2.4);
        c.nodo('res', 'Se acumulan', 6.4);
      } },
      // Relato 15 · METABOLISMO (impermeabilización) → Relato 11 · AGUA (escorrentía, contaminantes, cuerpos de agua)
      { t: 'A esto se suma la impermeabilización del suelo, que aumenta la escorrentía y el arrastre de contaminantes hacia los cuerpos de agua.', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 14, palabra: 0 });
        c.nodo('imperm', 'Impermeabilización del suelo', 1.5, 2.2);
        c.en(3.9, () => c.pag('relato', { paso: 10, palabra: 0 }));
        c.nodo('cargas', 'Arrastre de contaminantes', 5.6, 2.0);
        c.nodo('calagua', 'Cuerpos de agua', 7.7);
      } },
      // Relato 12 · SOPORTE ECOLÓGICO
      { t: 'Finalmente, la degradación del soporte ecológico está relacionada con la expansión urbana y la pérdida de vegetación, que fragmentan los hábitats.', a: (X) => {
        const c = ctx(X);
        c.pag('relato', { paso: 11, palabra: 1300 });
        c.en(0.6, () => X.ed.rotulo('Degradación del *soporte ecológico*', { kick: 'Problema 03' }));
        c.nodo('supcons', 'Expansión urbana', 4.2, 1.8);
        c.nodo('perdveg', 'Pérdida de vegetación', 5.6, 1.8);
        c.nodo('hab', 'Hábitats fragmentados', 7.3);
      } },
    ],
  };
