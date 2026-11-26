// Capítulo 01 · Introducción — toda en 3D sobre la fotogrametría real de Kennedy (Google Photorealistic 3D Tiles).
// La cámara vuela (X.vuelo: curvas suaves, easing largo, deriva lenta al llegar) hacia los lugares reales que la voz
// relaciona, y X.ed.lugar los señala con etiquetas de vidrio ancladas al mundo. Las capas se encienden con la voz:
// flujos de carga → Corabastos (abastecimiento), ola de la ciudad (crecimiento), humedales (ecosistemas),
// red de los seis problemas + agentes (dinámicas que se refuerzan). Cierra con un montaje de pantallas de vidrio
// flotando en perspectiva con las páginas reales del proyecto (capturas en public/img/intro).
// Cada frase conserva solo lo que sigue diciendo la voz (limpiarSalvo); en un salto se recrea ya terminado (seguir).
import * as IN from './intro.js';

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

/** cada frase anula lo diferido o asíncrono de la anterior (saltos: las frases async no pintan tarde) */
export const conGuardia = (beats) => beats.map((b) => ({ ...b, a: (X) => { gen++; return b.a(X); } }));

/* ======================================================================= textos de la voz y lugares */
const TRES = ['la modernización del *abastecimiento*', 'el crecimiento *urbano*', 'la transformación del *suelo*'];
const EFECTOS = ['la dependencia *alimentaria*', 'la acumulación de *residuos*', 'la degradación de los *ecosistemas*'];
const IMG = (n) => './img/intro/' + n + '.jpg';
const PANTALLAS = [
  [IMG('pot'), 'el análisis del *POT de Bogotá*'],
  [IMG('problemas'), 'el diagnóstico y la formulación de los *problemas de Kennedy*'],
  [IMG('red'), 'la construcción de un *modelo propio* de ciudad'],
  [IMG('picos'), 'la exploración de sus posibles consecuencias mediante *simulaciones*'],
];
const PUNTOS = ['pA', 'pB', 'pC', 'pD', 'pE', 'pF'];

// lista de vidrio (arriba a la izquierda) y lugares señalados (se recrean ya terminados en un salto)
const lista = (X, items) => X.ed.lista({ items, x: 4.5, y: 12, cls: 'vidrio', paso: 0.5 });
const L = {
  cora: (X, d = 0) => X.ed.lugar(IN.P.cora, 'Corabastos', { delay: d }),
  patio: (X, d = 0) => X.ed.lugar(IN.P.patio, 'Patio Bonito', { lado: 'izq', delay: d }),
  bav: (X, d = 0) => X.ed.lugar(IN.P.bavaria, 'Bavaria', { delay: d }),
};
/** puntos reales de los problemas (conectografía) que aparecen suaves */
function puntos(X, ks, on = true, d = 2.2, paso = 0.25) {
  ks.forEach((k, i) => { const u = X.W.capas[k]?.userData.u; if (!u) return; if (on && X.W.capas[k].visible && u.uAp.value > 0.99) return; if (on) { u.uS.value = (k === 'pF' ? 90 : k === 'pB' ? 10 : 22) * 1.2; X.capa(k, true, 0.4); if (X.R.rapido) u.uAp.value = 1; else X.gsap.fromTo(u.uAp, { value: 0 }, { value: 1, duration: d, ease: 'power2.out', delay: i * paso }); } else X.capa(k, false, 1.2); });
}
/** precarga y decodifica las capturas del montaje (que no haya espera a mitad de frase) */
let precargadas = false;
function precargarImgs() { if (precargadas) return; precargadas = true; PANTALLAS.forEach(([src]) => { const im = new Image(); im.src = src; im.decode?.().catch(() => {}); }); }

// encuadres (marco local en metros: x = este, z = sur)
const CAM = {
  cora: () => ({ p: [IN.P.cora[0] + 1150, 1250, IN.P.cora[1] + 1650], o: [IN.P.cora[0], 0, IN.P.cora[1]] }),
  coraVia: () => ({ p: [-2300, 1500, 2900], o: [-600, 0, -250] }),
  tres: { p: [500, 4700, 4400], o: [-150, 0, -650] },
  efectos: () => ({ p: [IN.P.cora[0] + 700, 1150, IN.P.cora[1] + 1500], o: [IN.P.cora[0] - 120, 0, IN.P.cora[1] + 60] }),
  sistema: { p: [1100, 6600, 6000], o: [-200, 0, -250] },
  central: { p: [500, 8800, 6600], o: [0, 0, -200] },
  montaje: { p: [3000, 9800, 8200], o: [0, 0, 0] },
};

export default /* ===================================================================== 01 INTRODUCCIÓN */
  {
    n: '01', nombre: 'Introducción', cine: true, continuo: true, precarga: ['humedalburro'],
    base: (X) => { IN.armar(X); IN.revelar(X); IN.poner(X, { borde: 1 }, 1.5); IN.poner(X, { agua: 0 }, 1.2); precargarImgs(); },
    fin: (X, nuevo) => { if (!nuevo?.cine) IN.fin(X); },
    beats: conGuardia([
      // Corabastos: la cámara baja desde la portada; los flujos de carga reales convergen en la central
      { t: 'La modernización del abastecimiento,', mantener: true, a: (X) => {
        X.ed.limpiar();
        X.vuelo([CAM.coraVia(), CAM.cora()], 4.6, { ease: 'power2.inOut', deriva: 0.06 });
        IN.poner(X, { bordeOp: 0.45 }, 3);
        X.capa('flujos', true, 1.6); X.uTo('flujos', 'uV', 520, 0.1);
        guardar('tres', lista(X, TRES.slice(0, 1)));
        guardar('lCora', L.cora(X, 1.5));
      } },
      // crecimiento: la cámara se abre a toda Kennedy y la ciudad se rehace en ola desde Kennedy Central; Patio Bonito y Bavaria
      { t: 'el crecimiento urbano y la transformación del suelo', mantener: true, a: (X) => {
        const c = ctx(X);
        const li = seguir(X, 'tres', () => lista(X, TRES.slice(0, 1))), cora = seguir(X, 'lCora', () => L.cora(X));
        X.ed.limpiarSalvo([li, cora]);
        X.vuelo([CAM.tres], 4.8, { deriva: 0.13, derivaD: 22 });
        X.capa('flujos', false, 1.4); IN.poner(X, { bordeOp: 1 }, 2.5);
        const u = X.W.capas.edif.userData.u; X.gsap.killTweensOf(u.uSube); u.uOri.value.set(IN.P.kennedy[0], IN.P.kennedy[1]);
        if (!X.R.rapido) X.gsap.timeline().to(u.uSube, { value: 0.3, duration: 0.9, ease: 'power2.in' }).to(u.uSube, { value: 1, duration: 3.4, ease: 'power2.out' });
        X.ed.listaMas(li, TRES[1], 0.15);
        guardar('lPatio', L.patio(X, 0.9));
        c.seq([[1.7, () => { X.ed.listaMas(li, TRES[2]); guardar('lBav', L.bav(X, 0.2)); }]]);
      } },
      // tres lugares, tres necesidades: la cámara sigue su deriva lenta sobre Kennedy
      { t: 'buscaban responder a necesidades diferentes,', mantener: true, a: (X) => {
        const keep = [seguir(X, 'tres', () => lista(X, TRES)), seguir(X, 'lCora', () => L.cora(X)), seguir(X, 'lPatio', () => L.patio(X)), seguir(X, 'lBav', () => L.bav(X))];
        X.ed.limpiarSalvo(keep);
        if (X.R.rapido) X.vuelo([CAM.tres], 0);
        X.ed.rotulo('buscaban responder a *necesidades diferentes*', { delay: 0.15 });
      } },
      // los tres lugares se enlazan: arcos que se dibujan y fluyen
      { t: 'pero sus efectos terminaron entrelazándose,', mantener: true, a: (X) => {
        const keep = [seguir(X, 'tres', () => lista(X, TRES)), seguir(X, 'lCora', () => L.cora(X)), seguir(X, 'lPatio', () => L.patio(X)), seguir(X, 'lBav', () => L.bav(X))];
        X.ed.limpiarSalvo(keep);
        IN.poner(X, { arcos: 1, arcosOp: 1 }, 2.4, 'power2.inOut', 0.1);
        X.ed.rotulo('sus efectos terminaron *entrelazándose*', { delay: 0.15 });
      } },
      // los tres efectos, señalados en sus lugares: Corabastos, María Paz, humedal La Vaca
      { t: 'intensificando la dependencia alimentaria, la acumulación de residuos y la degradación de los ecosistemas.', mantener: true, a: (X) => {
        const c = ctx(X);
        X.ed.limpiar();
        IN.poner(X, { arcos: 0 }, 1.0, 'power2.in'); IN.poner(X, { bordeOp: 0.4 }, 2);
        X.vuelo([CAM.efectos()], 3.8, { deriva: 0.08, derivaD: 24 });
        X.capa('flujos', true, 1.4);
        const li = guardar('efectos', lista(X, [EFECTOS[0]]));
        X.ed.lugar(IN.P.cora, 'Corabastos', { delay: 0.9 });
        c.seq([[1.9, () => { X.ed.listaMas(li, EFECTOS[1]); X.ed.lugar(IN.P.mariapaz, 'María Paz', { delay: 0.15 }); puntos(X, ['pE'], true, 1.8); }],
          [3.6, () => { X.ed.listaMas(li, EFECTOS[2]); X.ed.lugar(IN.P.vaca, 'Humedal La Vaca', { lado: 'izq', delay: 0.1 }); IN.poner(X, { agua: 1 }, 1.6, 'power2.out'); }]]);
      } },
      // no una sola causa: la cámara se abre y aparecen los puntos reales de los seis problemas en toda Kennedy
      { t: 'Problemas que no fueron consecuencia de una sola decisión,', a: (X) => {
        IN.soltarVistas(X);
        X.vuelo([CAM.sistema], 4.2, { deriva: 0.16, derivaD: 22 });
        X.capa('flujos', false, 1.2); IN.poner(X, { agua: 0.55, bordeOp: 1 }, 2);
        puntos(X, PUNTOS, true, 2.4, 0.22);
        X.ed.frase('no fueron consecuencia de *una sola decisión*', { y: 11, delay: 0.3 });
      } },
      // las dinámicas: agentes en movimiento por las vías reales y la red dirigida de los seis problemas que se dibuja
      { t: 'sino de múltiples dinámicas que se reforzaron entre sí.', a: (X) => {
        const c = ctx(X);
        if (X.R.rapido) X.vuelo([CAM.sistema], 0);
        IN.poner(X, { agua: 0.35 }, 2);
        X.capa('agentes', true, 1.6); X.agentesVel(1);
        puntos(X, PUNTOS, false);
        X.capa('red6', true, 0.8);
        X.W.red6.tubos.forEach((t, i) => c.seq([[0.25 + i * 0.36, () => X.arista(i, 1.1)]]));
        X.ed.rotulo('múltiples dinámicas que *se reforzaron entre sí*', { delay: 0.2 });
      } },
      // las relaciones, señaladas sobre los arcos reales de la red (crecimiento → dependencia → residuos)
      { t: 'Precisamente, estas dinámicas y las relaciones', a: (X) => {
        const c = ctx(X);
        X.capa('agentes', true, 0); X.capa('red6', true, 0);
        if (X.R.rapido) { X.vuelo([CAM.sistema], 0); X.W.red6.tubos.forEach((t, i) => X.arista(i, 0)); }
        const ap = (a, b) => { const t = X.W.red6.tubos.find((q) => q.userData.a === a && q.userData.b === b); return t?.userData.curva.getPoint(0.5); };
        X.ed.rotulo('estas *dinámicas* y las *relaciones*', { delay: 0.15 });
        c.seq([[0.9, () => X.ed.lugar(ap('B', 'A'), 'Crecimiento poblacional → *Dependencia de alimentos*', { pin: false, alto: 40 })],
          [1.6, () => X.ed.lugar(ap('A', 'E'), 'Dependencia de alimentos → *Gestión de residuos*', { pin: false, alto: 40, lado: 'izq' })]]);
      } },
      // el centro del proyecto: Kennedy completa desde lo alto, con su límite encendido
      { t: 'son el punto central del proyecto de Modelamiento Dinámico y Simulación.', a: (X) => {
        X.capa('agentes', true, 0); X.capa('red6', true, 0);
        if (X.R.rapido) X.W.red6.tubos.forEach((t, i) => X.arista(i, 0));
        X.vuelo([CAM.central], 4.6, { deriva: 0.1, derivaD: 30 });
        IN.poner(X, { bordeOp: 1, agua: 0.35 }, 1.5);
        IN.centro3(X, 'el punto central: Modelamiento *Dinámico* y *Simulación*', { delay: 0.5, y: 13 });
      } },
      // montaje: pantallas de vidrio flotando en perspectiva con las páginas reales, una por cada parte de la frase
      { t: 'Su desarrollo comprende el análisis del POT de Bogotá,', mantener: true, a: (X) => {
        X.ed.limpiar();
        X.capa('red6', false, 1.2); X.capa('agentes', true, 0);
        X.vuelo([CAM.montaje], 7, { ease: 'sine.inOut', deriva: 0.12, derivaD: 40 });
        const V = guardar('ven', X.ed.ventanas());
        V?.agregar(...PANTALLAS[0], { delay: 0.35 });
      } },
      { t: 'el diagnóstico y la formulación de los problemas de Kennedy,', mantener: true, a: (X) => {
        const V = seguir(X, 'ven', () => montaje(X, 1));
        X.ed.limpiarSalvo([V]);
        V?.agregar(...PANTALLAS[1], { delay: 0.2 });
      } },
      { t: 'la construcción de un modelo propio de ciudad', mantener: true, a: (X) => {
        const V = seguir(X, 'ven', () => montaje(X, 2));
        X.ed.limpiarSalvo([V]);
        V?.agregar(...PANTALLAS[2], { delay: 0.2 });
      } },
      { t: 'y la exploración de sus posibles consecuencias mediante simulaciones.', mantener: true, a: (X) => {
        const V = seguir(X, 'ven', () => montaje(X, 3));
        X.ed.limpiarSalvo([V]);
        X.capa('agentes', true, 0.8); X.agentesVel(1.6); X.capa('flujos', true, 1.6);
        V?.agregar(...PANTALLAS[3], { delay: 0.2 });
      } },
    ]),
  };

/** montaje ya armado con n pantallas (cuando se salta directo a una frase del montaje) */
function montaje(X, n) { const V = X.ed.ventanas({ fundido: 0 }); if (!V) return V; PANTALLAS.slice(0, n).forEach((p) => V.agregar(...p)); return V; }
