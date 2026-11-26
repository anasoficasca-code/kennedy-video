// Capítulo 05 · La red de los seis problemas
// Páginas reales, a pantalla completa y sin zoom:
//   «Red de problemas» de anasoficasca-code (driver 'red'): portada con los seis problemas → la red 3D con sus
//   11 relaciones reales (se resaltan las que dice la voz) → tarjeta «Centralización: el nodo con más conexiones» → clic en F.
//   versión de alejagoguti-cpu (driver 'redag'): botón «Conectografía» (las esferas estallan y Kennedy se rearma con las
//   causas por problema) → «Seis capas, un solo territorio» con el indicador de cada problema.
// Encima, la edición (X.ed): lista de los seis problemas, relaciones en zócalo, cifra de conexiones, señales sobre la página.
import { precargarConecto } from '../paginas/redag.js';
import { liberar } from '../pagina.js';

const P = 'red', AG = 'redag';
const COL = { F: '#ee8a45', B: '#d9bf6e', C: '#dba73a', D: '#d4553f', A: '#a3b845', E: '#a77b5a' }; // colores de problema de la página
const NOM = { F: 'Centralización de servicios', B: 'Crecimiento poblacional', C: 'Valorización del suelo', D: 'Especulación inmobiliaria', A: 'Dependencia de alimentos externos', E: 'Gestión de residuos sólidos' };
const item = (k) => `<i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${COL[k]};margin-right:12px;vertical-align:2px"></i>${NOM[k]}`;

/** acciones al ritmo de la voz; se anulan en cuanto empieza otra frase (de este capítulo o del otro, 05/06) */
function ctx(X, t) {
  const g = (window.__ctx56 = (window.__ctx56 || 0) + 1), r = X.R.rapido;
  const i = window.__k ? window.__k.BEATS.findIndex((b) => b.t === t) : -1;
  const vivo = () => g === window.__ctx56 && (i < 0 || location.hash === '#' + (i + 1));
  const seq = (pasos) => pasos.forEach(([s, f]) => { const fn = () => { if (vivo()) f(); }; if (r || !s) fn(); else X.gsap.delayedCall(s, fn); });
  return { vivo, seq, r };
}
/** marca el rectángulo alrededor de un nodo de la red 3D (en % de pantalla) */
function marcaNodo(X, pag, k, o = {}) {
  const w = X.ventana(pag); if (!w) return;
  let p; try { p = JSON.parse(w.eval(`(()=>{const v=byId['${k}'].p.clone().project(cam);const r=byId['${k}'].r*1.25;const c=cam.position.distanceTo(byId['${k}'].p);const h=r/ (c*Math.tan(cam.fov*Math.PI/360))*50;return JSON.stringify({x:(v.x+1)/2*100,y:(1-v.y)/2*100,h})})()`)); } catch (e) { return; }
  const hh = Math.max(9, p.h * 2), ww = hh * innerHeight / innerWidth;
  X.ed.senalar(pag, { x: p.x - ww / 2, y: p.y - hh / 2, w: ww, h: hh }, o);
}
let lista = null;
/** cambio de página con fundido cruzado (la anterior sigue debajo ~1 s): sin cortes ni barridos */
export function fundido(X, pag, mostrar) {
  const r = mostrar();
  if (!X.R.rapido) {
    const m = document.querySelector(`#paginas .pag-marco[data-p="${pag}"]`);
    if (m) X.gsap.fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.inOut' });
  }
  return r;
}

export default /* ===================================================================== 05 RED DE SEIS PROBLEMAS */
  {
    n: '05', nombre: 'La red de los seis problemas', cam: 'red6', tr: 'cubo', pagina: true, precarga: ['red'],
    base: (X) => { X.gris(0.85, 0); },
    beats: [
      // portada real: KENNEDY y los seis íconos de problema
      { t: 'A partir de estas dinámicas identificamos seis problemas relacionados:', a: (X) => {
        const c = ctx(X, 'A partir de estas dinámicas identificamos seis problemas relacionados:');
        X.pagina(P, 'hero', { entrada: 'corte', reanimar: true });
        c.seq([[0.9, () => X.ed.rotulo('seis problemas *relacionados*', { lado: 'der' })]]);
      } },
      // se encienden uno a uno, al ritmo de la voz
      { t: 'la centralización de servicios, el crecimiento poblacional, la valorización del suelo,', a: (X) => {
        const c = ctx(X, 'la centralización de servicios, el crecimiento poblacional, la valorización del suelo,');
        X.pagina(P, 'hero', { nombres: ['F', 'B', 'C'], pausa0: 250, paso: 1450 });
        lista = X.ed.lista({ items: ['F', 'B', 'C'].map(item), x: 64, y: 62, ancho: 30, paso: 1.45, delay: 0.1 });
        lista?.querySelectorAll('.n').forEach((n) => n.remove()); // el punto de color del problema hace de viñeta
        void c;
      } },
      { t: 'la especulación inmobiliaria, la dependencia de alimentos externos y la gestión de residuos sólidos.', mantener: true, a: (X) => {
        X.pagina(P, 'hero', { on: ['F', 'B', 'C'], nombres: ['D', 'A', 'E'], pausa0: 250, paso: 1700 });
        if (X.R.rapido) return;
        if (lista && lista.isConnected) {
          const ol = lista.querySelector('ol');
          const nuevos = ['D', 'A', 'E'].map((k, i) => { const li = document.createElement('li'); li.innerHTML = `<span>${item(k)}</span>`; void i; ol.appendChild(li); return li; });
          X.gsap.fromTo(nuevos, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'back.out(1.6)', stagger: 1.7, delay: 0.25 });
        } else {
          lista = X.ed.lista({ items: ['F', 'B', 'C', 'D', 'A', 'E'].map(item), x: 64, y: 62, ancho: 30, paso: 0.5 });
          lista?.querySelectorAll('.n').forEach((n) => n.remove());
        }
      } },
      // la página baja por «Ningún problema ocurre solo»: la ciudad se desarma y cada punto viaja a su problema → la red
      // B→A (más población exige más alimento) y F→B (concentrar servicios atrae población)
      { t: 'Al representarlos como una red, encontramos que el crecimiento poblacional aumenta la demanda de alimentos y servicios,', a: (X) => {
        const c = ctx(X, 'Al representarlos como una red, encontramos que el crecimiento poblacional aumenta la demanda de alimentos y servicios,');
        X.pagina(P, 'red', { on: ['BA', 'FB'], nodos: ['B', 'A', 'F'], viaje: 3.0, cam: { f: 0.9, d: 3 } });
        c.seq([[4.3, () => X.ed.rotulo(`<span style="color:${COL.B}">el crecimiento poblacional</span> aumenta la demanda de <span style="color:${COL.A}">alimentos</span> y <span style="color:${COL.F}">servicios</span>`)],
          [4.6, () => marcaNodo(X, P, 'B', { texto: 'crecimiento poblacional' })]]);
      } },
      // F→C (cerca de los servicios sube el suelo) · C⇄D (se refuerzan)
      { t: 'cuya concentración influye en la valorización y especulación del suelo.', a: (X) => {
        const c = ctx(X, 'cuya concentración influye en la valorización y especulación del suelo.');
        X.pagina(P, 'red', { on: ['FC', 'CD'], prev: ['BA', 'FB'], nodos: ['F', 'C', 'D'], cam: { k: 'C', f: 0.9, d: 3.4 } });
        c.seq([[0.5, () => X.ed.rotulo(`<span style="color:${COL.F}">cuya concentración</span> influye en la <span style="color:${COL.C}">valorización</span> y <span style="color:${COL.D}">especulación</span> del suelo`)]]);
      } },
      // F→A (centralizar abastos aleja la producción local) · A→E (alimentos traídos de fuera generan residuos)
      { t: 'A su vez, la dependencia alimentaria concentra el abastecimiento en Corabastos, aumentando la generación de residuos.', a: (X) => {
        const c = ctx(X, 'A su vez, la dependencia alimentaria concentra el abastecimiento en Corabastos, aumentando la generación de residuos.');
        X.pagina(P, 'red', { on: ['FA', 'AE'], prev: ['BA', 'FB', 'FC', 'CD'], nodos: ['F', 'A', 'E'], cam: { k: 'A', f: 0.9, d: 3.4 } });
        c.seq([[0.5, () => X.ed.rotulo(`<span style="color:${COL.A}">la dependencia alimentaria</span> concentra el abastecimiento en *Corabastos*`)],
          [4.2, () => X.ed.pop({ t: `aumentando la generación de <span style="color:${COL.E}">residuos</span>`, x: 64, y: 10, ancho: 28, cls: 'oscuro' })]]);
      } },
      // tarjeta real «Centralización: el nodo con más conexiones» (la página enfoca F y sus 5 relaciones)
      { t: 'Al ser la centralización de servicios uno de los nodos con mayor número de conexiones, se convierte en un problema prioritario para nuestra propuesta,', a: (X) => {
        const c = ctx(X, 'Al ser la centralización de servicios uno de los nodos con mayor número de conexiones, se convierte en un problema prioritario para nuestra propuesta,');
        X.pagina(P, 'red1', { cam: { k: 'F', f: 0.95, d: 4 } });
        c.seq([[1.6, () => X.ed.rotulo('uno de los nodos con *mayor número de conexiones*', { lado: 'der' })],
          [5.6, () => X.ed.pop({ t: 'un problema *prioritario* para nuestra propuesta', x: 64, y: 10, ancho: 28, cls: 'oscuro' })],
          [3.0, () => { precargarConecto(); }]]);
      } },
      // clic en el nodo: la página vuela hacia él y abre su panel «Relaciones en la red»
      { t: 'porque su relación con los demás permite identificar dónde una intervención podría generar mayores transformaciones.', a: (X) => {
        const c = ctx(X, 'porque su relación con los demás permite identificar dónde una intervención podría generar mayores transformaciones.');
        X.pagina(P, 'nodo', { k: 'F', antes: 1100 });
        c.seq([[0.25, () => marcaNodo(X, P, 'F', { dur: 1.1 })],
          [2.4, () => X.ed.senalar(P, '#panel ul.rl', { texto: 'su relación con los demás', pad: 6 })],
          [0, () => { precargarConecto(); }]]);
      } },
      // versión alejagoguti-cpu: clic en «Conectografía» → las esferas estallan y Kennedy se rearma
      { t: 'Mediante la conectografía localizamos los problemas en Kennedy,', a: (X) => {
        const c = ctx(X, 'Mediante la conectografía localizamos los problemas en Kennedy,');
        fundido(X, AG, () => X.pagina(AG, 'red', { entrada: 'corte' }));
        c.seq([[0.9, () => X.ed.senalar(AG, '.goconecto', { texto: 'conectografía', pad: 8, dur: 1.4 })],
          [1.7, () => X.pagina(AG, 'conecto')],
          [2.0, () => X.ed.rotulo('localizamos los problemas *en Kennedy*', { lado: 'der' })],
          [2.2, () => liberar(['redag'])]]); // la red de anasoficasca ya no se usa: se descarga (la GPU queda para la conectografía)
      } },
      // la leyenda real «causas por problema»: comercio (F), población (B), valorización (C), residuos (E)
      { t: 'identificando dónde se concentran las actividades comerciales, la población, la valorización del suelo y los residuos.', a: (X) => {
        const c = ctx(X, 'identificando dónde se concentran las actividades comerciales, la población, la valorización del suelo y los residuos.');
        X.pagina(AG, 'conecto', { entrada: 'corte' });
        const fila = (i) => `#cgleg > div:nth-of-type(${i})`;
        c.seq([[1.6, () => X.ed.senalar(AG, fila(1), { texto: 'actividades comerciales', pad: 4, lado: 'arriba', dur: 1.2 })],
          [2.9, () => X.ed.senalar(AG, fila(2), { texto: 'la población', pad: 4, lado: 'arriba', dur: 1.2 })],
          [3.9, () => X.ed.senalar(AG, fila(3), { texto: 'la valorización del suelo', pad: 4, lado: 'arriba', dur: 1.4 })],
          [5.4, () => X.ed.senalar(AG, fila(6), { texto: 'los residuos', pad: 4, lado: 'arriba' })]]);
      } },
      // «Seis capas, un solo territorio» → «Los indicadores se juntan» y el botón «Del diagnóstico a los criterios»
      { t: 'Esto nos permitió reconocer dónde se manifiestan y establecer criterios de intervención a partir de sus indicadores.', a: (X) => {
        const c = ctx(X, 'Esto nos permitió reconocer dónde se manifiestan y establecer criterios de intervención a partir de sus indicadores.');
        X.pagina(AG, 'capas', { desde: 0.36, p: 0.46, d: 2.0, entrada: 'corte' });
        c.seq([[3.4, () => X.pagina(AG, 'capas', { p: 0.74, d: 2.2 })],
          [6.0, () => X.ed.senalar(AG, '#kcap .kc-fin a', { texto: 'criterios de intervención', pad: 8 })]]);
      } },
    ],
  };
