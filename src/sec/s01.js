// Capítulo 01 · Introducción. Arranca en la fotogrametría 3D (abastecimiento, crecimiento, suelo) y entra a la
// página real «Red causal · 3 niveles + POT» (humedalburro), que se usa en vivo; cierra con el montaje de las páginas
// del proyecto (POT → problemas → modelo propio) y vuelve al 3D para las simulaciones.
// Edición: solo X.ed (listas, zócalos, señales); cada frase limpia la anterior salvo las marcadas `mantener`.
import { I } from './util.js';
import { precargar, liberar } from '../pagina.js';
import { anclaNodo } from '../paginas/humedalburro.js';

const H = 'humedalburro';
let gen = 0;
/** contexto de frase: pasos diferidos que se anulan si llega otra frase; en un salto corren de inmediato */
export function ctx(X) {
  const g = ++gen, r = X.R.rapido, vivo = () => g === gen;
  const seq = (pasos) => pasos.forEach(([t, f]) => { const fn = () => { if (vivo()) f(); }; if (r || !t) fn(); else X.gsap.delayedCall(t, fn); });
  return { vivo, seq };
}

/* ---------- gráficos que siguen de una frase a otra (frases con `mantener`) ---------- */
const guardados = {};
const vive = (e) => e && e.isConnected && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0.05;
/** deja un gráfico recién creado en su estado final (sin animación de entrada) */
export function fijo(X, e) {
  if (!e) return e;
  const objetivos = [e, ...e.querySelectorAll('*')];
  objetivos.forEach((t) => X.gsap.getTweensOf(t).forEach((tw) => { const p = tw.parent; if (p && p !== X.gsap.globalTimeline) p.progress(1); else tw.progress(1); }));
  return e;
}
/** devuelve el gráfico `clave` si sigue en pantalla; si no (se saltó hasta aquí), lo crea ya terminado */
export function seguir(X, clave, crear) {
  if (vive(guardados[clave])) return guardados[clave];
  return (guardados[clave] = fijo(X, crear()));
}
export function guardar(clave, e) { guardados[clave] = e; return e; }
export function soltar(X, clave) { const e = guardados[clave]; delete guardados[clave]; if (e) X.gsap.to(e, { autoAlpha: 0, y: '-=10', duration: 0.35, onComplete: () => e.remove() }); }
/** agrega un ítem animado a una X.ed.lista existente */
export function agregar(X, lista, texto, delay = 0) {
  if (!lista) return;
  const ol = lista.querySelector('ol'); const n = ol.children.length + 1;
  const li = document.createElement('li');
  li.innerHTML = `<span class="n"></span><span>${String(texto).replace(/\*([^*]+)\*/g, '<em>$1</em>')}</span>`;
  ol.appendChild(li);
  X.gsap.fromTo(li, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'back.out(1.6)', delay });
}

const TRES = ['la modernización del *abastecimiento*', 'el crecimiento *urbano*', 'la transformación del *suelo*'];
const PROYECTO = ['el análisis del *POT de Bogotá*', 'el diagnóstico y la formulación de los *problemas de Kennedy*', 'la construcción de un *modelo propio* de ciudad', 'la exploración de sus posibles consecuencias mediante *simulaciones*'];
const listaProyecto = (X, n, delay = 0) => X.ed.lista({ items: PROYECTO.slice(0, n), x: 62, y: 45, ancho: 33, paso: 0.5, delay });
const AXO = ['1956', '1972', '1988', '2024']; // axonometrías reales de Kennedy (public/img)

/** cada frase anula lo diferido o asíncrono de la anterior (saltos: las frases async no pintan tarde) */
export const conGuardia = (beats) => beats.map((b) => ({ ...b, a: (X) => { gen++; return b.a(X); } }));

export default /* ===================================================================== 01 INTRODUCCIÓN */
  {
    n: '01', nombre: 'Introducción', cam: 'alto', precarga: [H],
    base: (X) => { X.capa('agua', true, 0); },
    beats: conGuardia([
      // 3D: Corabastos (abastecimiento) → los edificios crecen (crecimiento urbano) → axonometrías reales 1956-2024 (suelo)
      { t: 'La modernización del abastecimiento, el crecimiento urbano y la transformación del suelo', a: (X) => {
        const c = ctx(X);
        X.sinPagina(); X.W.capas.edif.userData.u.uSube.value = 0.15;
        X.cam('cora', 3.2); X.capa('corabastos'); X.foco(X.LUG.corabastos, 900, '#cfff5e');
        guardar('tres', X.ed.lista({ items: TRES, x: 5, y: 16, ancho: 30, paso: 1.45, delay: 0.1 }));
        c.seq([[1.6, () => { X.sinFoco(); X.sube(1, X.LUG.corabastos, 3.2); }],
          [3.0, () => {
            const e = guardar('axo', X.ed.pop({ img: I('axo_1956.jpg'), t: '', cls: 'oscuro hb-axo', x: 66, y: 16, ancho: 26 }));
            if (!e) return; const im = e.querySelector('.img'); Object.assign(im.style, { flex: '1 1 auto', height: '30vh' }); e.querySelector('.cuerpo').style.display = 'none';
            AXO.slice(1).forEach((a, i) => X.gsap.delayedCall(0.9 + i * 0.85, () => { if (!e.isConnected) return; im.style.backgroundImage = `url('${I('axo_' + a + '.jpg')}')`; }));
          }]]);
        if (X.R.rapido) { X.sube(1, X.LUG.corabastos, 0); X.sinFoco(0); }
      } },
      // las tres siguen en pantalla; se suma «necesidades diferentes» y la cámara se abre a toda Kennedy
      { t: 'buscaban responder a necesidades diferentes,', mantener: true, a: (X) => {
        X.sinPagina(); X.sinFoco(); X.capa('corabastos', false); X.W.capas.edif.userData.u.uSube.value = 1;
        X.cam('alto', 3);
        soltar(X, 'axo');
        seguir(X, 'tres', () => X.ed.lista({ items: TRES, x: 5, y: 16, ancho: 30 }));
        X.ed.rotulo('buscaban responder a *necesidades diferentes*', { lado: 'der' });
      } },
      // la red causal real: sus relaciones se encienden una a una (se entrelazan)
      { t: 'pero sus efectos terminaron entrelazándose,', a: (X) => {
        X.pagina(H, 'entrelaza', { entrada: 'barrido' });
        X.ed.rotulo('sus efectos terminaron *entrelazándose*', { lado: 'der', delay: 0.6 });
      } },
      // los tres problemas, señalados sobre sus nodos en la red
      { t: 'intensificando la dependencia alimentaria, la acumulación de residuos y la degradación de los ecosistemas.', a: async (X) => {
        const c = ctx(X);
        await X.pagina(H, 'red');
        if (!c.vivo()) return;
        X.ed.lista({ items: ['la dependencia *alimentaria*', 'la acumulación de *residuos*', 'la degradación de los *ecosistemas*'], x: 4, y: 16, ancho: 27, paso: 1.5, delay: 0.5 });
        c.seq([[0.8, () => X.ed.senalar(H, anclaNodo('N3-HIP'), { lado: 'circulo arriba', texto: 'dependencia alimentaria', pad: 6 })],
          [2.3, () => X.ed.senalar(H, anclaNodo('N1-RES'), { lado: 'circulo', texto: 'residuos', pad: 6 })],
          [3.8, () => X.ed.senalar(H, anclaNodo('N2-HEB'), { lado: 'circulo', texto: 'ecosistemas', pad: 6 })]]);
      } },
      // Niveles 3D de la página: no hay una sola causa, la red sube por niveles
      { t: 'Problemas que no fueron consecuencia de una sola decisión,', a: (X) => {
        X.pagina(H, 'niveles', { paso: 0 });
        X.ed.frase('no fueron consecuencia de *una sola decisión*', { y: 15, delay: 0.3 });
      } },
      // el cursor recorre Nivel 1 → Nivel 2 → Nivel 3 (cada nivel refuerza al siguiente)
      { t: 'sino de múltiples dinámicas que se reforzaron entre sí.', a: (X) => {
        X.pagina(H, 'niveles', { pasos: [1, 2, 3], entre: 700 });
        X.ed.pop({ t: 'múltiples dinámicas que *se reforzaron entre sí*', cls: 'oscuro', x: 4, y: 16, ancho: 30, delay: 0.3 });
      } },
      // la red completa con el filtro abierto: capas y tipos de relación
      { t: 'Precisamente, estas dinámicas y las relaciones son el punto central', a: (X) => {
        X.pagina(H, 'cajon', { sobre: [0, 7] });
        X.ed.rotulo('estas *dinámicas* y las *relaciones*', { lado: 'der', delay: 0.3 });
        X.ed.senalar(H, '#relGridHost', { texto: 'las relaciones', lado: 'arriba', delay: 0.9, pad: 8 });
      } },
      { t: 'del proyecto de Modelamiento Dinámico y Simulación.', a: (X) => {
        X.pagina(H, 'cajon');
        X.ed.rotulo('Modelamiento *Dinámico* y *Simulación*', { lado: 'der' });
      } },
      // montaje del proyecto: 01 POT (el cursor apaga la red causal y queda el POT)
      { t: 'Su desarrollo comprende el análisis del POT de Bogotá,', a: (X) => {
        X.pagina(H, 'potQuita');
        precargar('problemas');
        guardar('proyecto', listaProyecto(X, 1, 0.3));
      } },
      // 02 problemas de Kennedy (página «Problemáticas de Kennedy»)
      { t: 'el diagnóstico y la formulación de los problemas de Kennedy,', mantener: true, a: (X) => {
        Promise.resolve().then(() => X.pagina('problemas', null, { entrada: 'barrido' })).catch(() => {});
        precargar('red');
        const L = seguir(X, 'proyecto', () => listaProyecto(X, 1)); agregar(X, L, PROYECTO[1], 0.4);
      } },
      // 03 modelo propio de ciudad (página «Red de problemas»: Kennedy en 3D)
      { t: 'la construcción de un modelo propio de ciudad', mantener: true, a: (X) => {
        Promise.resolve().then(() => X.pagina('red', null, { entrada: 'barrido' })).catch(() => {});
        ctx(X).seq([[1.4, () => liberar([H])]]); // una sola página pesada viva
        const L = seguir(X, 'proyecto', () => listaProyecto(X, 2)); agregar(X, L, PROYECTO[2], 0.4);
      } },
      // 04 simulaciones: de vuelta al territorio 3D con los agentes en movimiento
      { t: 'y la exploración de sus posibles consecuencias mediante simulaciones.', mantener: true, a: (X) => {
        X.sinPagina(); ctx(X).seq([[1.3, () => liberar([H])]]);
        X.cam('cora', 3); X.capa('agentes'); X.capa('flujos'); X.uTo('flujos', 'uV', 900, 2);
        const L = seguir(X, 'proyecto', () => listaProyecto(X, 3)); agregar(X, L, PROYECTO[3], 0.4);
      } },
    ]),
  };
