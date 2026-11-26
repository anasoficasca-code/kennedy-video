// Capítulo 05
import { I, E, V, P, nodoEt, lugar } from './util.js';

export default /* ===================================================================== 05 RED DE SEIS PROBLEMAS */
  {
    n: '05', nombre: 'La red de los seis problemas', cam: 'red6', tr: 'cubo',
    base: (X) => { X.gris(0.85, 0); X.capa('red6', true, 0); Object.values(X.W.red6.nod).forEach((m) => m.scale.setScalar(0.01)); },
    beats: [
      { t: 'A partir de estas dinámicas identificamos seis problemas relacionados:', a: (X) => {
        Object.entries(X.W.red6.nod).forEach(([k, m], i) => { const s = m.userData.r; X.twf(m.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: s, y: s, z: s, duration: X.D(0.7), ease: 'back.out(2.2)', delay: X.D(i * 0.12) }); });
        X.dato('seis', { v: 6, l: 'problemas relacionados', left: 7, top: '20vh' });
      } },
      { t: 'la centralización de servicios, el crecimiento poblacional, la valorización del suelo,', a: (X) => { X.quitar('seis'); ['F', 'B', 'C'].forEach((k, i) => nodoEt(X, k, i * 0.35)); } },
      { t: 'la especulación inmobiliaria, la dependencia de alimentos externos y la gestión de residuos sólidos.', a: (X) => { ['D', 'A', 'E'].forEach((k, i) => nodoEt(X, k, i * 0.35)); } },
      { t: 'Al representarlos como una red, encontramos que el crecimiento poblacional aumenta la demanda de alimentos y servicios,', a: (X) => { X.matriz('adj', { nodos: ['F', 'A', 'B', 'C', 'D', 'E'], colores: X.COL_P, nombres: X.NOM_P, right: '2vw', top: '12vh' }); X.arista(0); X.gsap.delayedCall(X.R.rapido ? 0 : 0.6, () => X.arista(1)); X.nodo6('B', 1.25); } },
      { t: 'cuya concentración influye en la valorización y especulación del suelo.', a: (X) => { X.arista(2); X.gsap.delayedCall(X.R.rapido ? 0 : 0.5, () => X.arista(3)); X.gsap.delayedCall(X.R.rapido ? 0 : 1, () => X.arista(4)); } },
      { t: 'A su vez, la dependencia alimentaria concentra el abastecimiento en Corabastos, aumentando la generación de residuos.', a: (X) => { X.arista(5); X.gsap.delayedCall(X.R.rapido ? 0 : 0.6, () => X.arista(6)); X.gsap.delayedCall(X.R.rapido ? 0 : 1.2, () => X.arista(7)); } },
      { t: 'Al ser la centralización de servicios uno de los nodos con mayor número de conexiones, se convierte en un problema prioritario para nuestra propuesta,', a: (X) => {
        X.nodo6('F', 1.45, 1); ['A', 'B', 'C', 'D', 'E'].forEach((k) => X.nodo6(k, 0.75));
        X.dato('cx', { v: 5, l: 'conexiones (k_in 2 + k_out 3) · nodo prioritario', left: 7, top: '20vh' }); X.resaltarGrado('adj', 'F');
      } },
      { t: 'porque su relación con los demás permite identificar dónde una intervención podría generar mayores transformaciones.', a: (X) => {
        X.quitar('cx'); X.titulo('Intervenir donde la red *más se transforma*', { top: '12vh', width: 44, cls: 'chico' });
        X.W.red6.tubos.forEach((t, i) => { if (t.userData.a === 'F' || t.userData.b === 'F') X.twf(t.material.color, { r: 1, g: 1, b: 1 }, { r: 0.78, g: 1, b: 0.15, duration: X.D(0.6), repeat: X.R.rapido ? 0 : 3, yoyo: true, ease: 'steps(3)', delay: X.D(i * 0.1) }); });
      } },
      { t: 'Mediante la conectografía localizamos los problemas en Kennedy,', a: (X) => {
        X.limpiar(); X.quitarEts(); X.aSuelo(true); X.cam('mapa', 2.6); X.gris(0.6);
        X.titulo('*Conectografía*', { kick: '05 · Localizar los problemas', width: 40 });
      } },
      { t: 'identificando dónde se concentran las actividades comerciales, la población, la valorización del suelo y los residuos.', a: (X) => {
        ['F', 'B', 'C', 'E'].forEach((k, i) => { X.gsap.delayedCall(X.R.rapido ? 0 : i * 0.5, () => { X.aparecer('p' + k, 1, 1.2); }); });
        ['F', 'B', 'C', 'E'].forEach((k, i) => X.et('l' + k, { p: [X.W.red6Suelo[k].x, 200, X.W.red6Suelo[k].z], t: X.NOM_P[k], c: X.COL_P[k], cls: 'nodo', delay: i * 0.5 }));
      } },
      { t: 'Esto nos permitió reconocer dónde se manifiestan y establecer criterios de intervención a partir de sus indicadores.', a: (X) => {
        X.limpiar(); X.titulo('De dónde se manifiestan → *criterios de intervención*', { top: '12vh', width: 50, cls: 'chico' });
      } },
    ],
  };
