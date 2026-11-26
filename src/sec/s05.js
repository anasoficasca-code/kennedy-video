// Capítulo 05 · sobre la página real «Red de problemas» (public/paginas/red/index.html, driver src/paginas/red.js)
// Portada con los seis problemas → red 3D con sus 11 relaciones reales (se resaltan las que dice la voz) →
// centralización (5 conexiones) → conectografía → mapa de Kennedy por problema → «Tres criterios».
const P = 'red';
const seis = '#story .hcard .seis';

export default /* ===================================================================== 05 RED DE SEIS PROBLEMAS */
  {
    n: '05', nombre: 'La red de los seis problemas', cam: 'red6', tr: 'cubo', pagina: true,
    base: (X) => { X.gris(0.85, 0); },
    beats: [
      { t: 'A partir de estas dinámicas identificamos seis problemas relacionados:', a: (X) => {
        X.pagina(P, 'hero', { entrada: 'barrido', reanimar: true, zoom: { sel: '#story .hcard', s: 1.12, d: 2.6 }, final: { sel: seis, s: 1.75, d: 2.4 } });
      } },
      { t: 'la centralización de servicios, el crecimiento poblacional, la valorización del suelo,', a: (X) => {
        X.pagina(P, 'hero', { nombres: ['F', 'B', 'C'], pausa0: 200, paso: 1250, zoom: { sel: seis, s: 1.9, dx: -3, d: 3.2 } });
      } },
      { t: 'la especulación inmobiliaria, la dependencia de alimentos externos y la gestión de residuos sólidos.', a: (X) => {
        X.pagina(P, 'hero', { previos: ['F', 'B', 'C'], nombres: ['D', 'A', 'E'], pausa0: 200, paso: 1500, zoom: { sel: seis, s: 1.9, dx: 3, d: 3.6 } });
      } },
      // relaciones reales: B→A (más población exige más alimento), F→B (concentrar servicios atrae población)
      { t: 'Al representarlos como una red, encontramos que el crecimiento poblacional aumenta la demanda de alimentos y servicios,', a: (X) => {
        X.pagina(P, 'red', { on: ['BA', 'FB'], nodos: ['B', 'A', 'F'], viaje: 3.4, cam: { f: 0.62, d: 2.6 } });
      } },
      // F→C (cerca de los servicios sube el suelo), C⇄D (valorización y especulación se refuerzan), D┄F
      { t: 'cuya concentración influye en la valorización y especulación del suelo.', a: (X) => {
        X.pagina(P, 'red', { on: ['FC', 'CD', 'DF'], prev: ['BA', 'FB'], nodos: ['F', 'C', 'D'], cam: { k: 'C', f: 0.5, d: 3.2 } });
      } },
      // F→A (centralizar abastos y mercados) y A→E (alimentos traídos de fuera generan residuos)
      { t: 'A su vez, la dependencia alimentaria concentra el abastecimiento en Corabastos, aumentando la generación de residuos.', a: (X) => {
        X.pagina(P, 'red', { on: ['FA', 'AE'], prev: ['BA', 'FB', 'FC', 'CD', 'DF'], nodos: ['F', 'A', 'E'], cam: { k: 'A', f: 0.5, d: 3.2 } });
      } },
      // tarjeta real de la página: «Centralización: el nodo con más conexiones» (la página enfoca F y sus 5 relaciones)
      { t: 'Al ser la centralización de servicios uno de los nodos con mayor número de conexiones, se convierte en un problema prioritario para nuestra propuesta,', a: (X) => {
        X.pagina(P, 'red1', { cam: { f: 0.62, d: 2.4 }, precargaCG: true });
      } },
      { t: 'porque su relación con los demás permite identificar dónde una intervención podría generar mayores transformaciones.', a: (X) => {
        X.pagina(P, 'red1', { cam: { k: 'F', f: 0.42, d: 4.2 }, precargaCG: true });
      } },
      // conectografía real: las esferas estallan y Kennedy se rearma con las causas de cada problema
      { t: 'Mediante la conectografía localizamos los problemas en Kennedy,', a: (X) => {
        X.pagina(P, 'conecto', { zoom: { x: 50, y: 50, s: 1.0, d: 1.2 } });
      } },
      // mapa de la página: comercio (plazas, F) · población (B) · valorización (C) · residuos (E)
      { t: 'identificando dónde se concentran las actividades comerciales, la población, la valorización del suelo y los residuos.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'F', ciclo: ['F', 'B', 'C', 'E'], paso: 1550, zoom: { sel: '#mk .mk-mapa', s: 1.32, dy: 2, d: 2.4 } });
      } },
      // tarjeta real «De la red a la propuesta · Tres criterios»
      { t: 'Esto nos permitió reconocer dónde se manifiestan y establecer criterios de intervención a partir de sus indicadores.', a: (X) => {
        X.pagina(P, 'red2', { viaje: 3.2, zoom: { x: 50, y: 50, s: 1.0, d: 1.2 } });
      } },
    ],
  };
