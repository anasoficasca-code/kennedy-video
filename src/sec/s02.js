// Capítulo 02
import { I, E, V, P, nodoEt, lugar } from './util.js';

export default /* ===================================================================== 02 POT */
  {
    n: '02', nombre: 'El POT y la ciudad como sistema complejo', cam: 'pot', tr: 'persiana',
    base: (X) => { X.capa('edif', true, 0); X.gris(0.55, 0); X.W.pot.planos.forEach((g) => (g.position.y = 0)); },
    beats: [
      { t: 'Como punto de partida, el Plan de Ordenamiento Territorial de Bogotá se reconstruyó como una red', a: (X) => {
        X.capa('red-pot');
        X.W.pot.nodos.forEach((m, i) => X.twf(m.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: m.userData.r, y: m.userData.r, z: m.userData.r, duration: X.D(0.5), ease: 'back.out(2)', delay: X.D(i * 0.025) }));
        X.titulo('El POT reconstruido como una *red* sobre la ciudad', { kick: '02 · Punto de partida · conectografía', width: 40, cls: 'chico' });
      } },
      { t: 'a partir de los aportes de Albert-László Barabási, físico e investigador de la ciencia de redes.', a: (X) => {
        const M = X.W.pot.M;
        X.tarjeta('bar', { k: 'Ciencia de redes', t: 'Albert-László Barabási', d: 'Físico · la estructura se lee en los nodos y sus conexiones.', left: 7, top: '40vh' });
        X.metricasRed('met', { titulo: 'Métricas de la red · macromodelo del POT', right: '5vw', top: '16vh', resumen: [['nodos', M.n], ['aristas', M.m], ['grado medio', M.gradoMedio.toFixed(1).replace('.', ',')], ['densidad', M.densidad.toFixed(3).replace('.', ',')], ['diámetro', M.diametro], ['componentes', M.componentes]], nota: 'Red no dirigida · cada nodo en su ubicación real · 8 capas temáticas · tensión de cada relación según el macromodelo.' });
      } },
      { t: 'Se identificaron los nodos centrales,', a: (X) => {
        X.quitar('bar');
        const N = X.W.pot.nodos;
        N.forEach((m) => { const k = m.userData.hub ? m.userData.r * 1.5 : m.userData.r * 0.6; X.tw(m.scale, { x: k, y: k, z: k, duration: X.D(0.9), ease: 'steps(8)' }); });
        const top = [...N].sort((a, b) => b.userData.grado - a.userData.grado).slice(0, 5);
        const corto = (s) => s.replace(/^[A-Z]+\d+ - /, '').replace(/\s*\(.*\)$/, '');
        X.metricasRed('met', { titulo: 'Nodos centrales · top 5 por grado', right: '5vw', top: '16vh', cols: ['nodo', 'grado k', 'intermediación'], filas: top.map((m) => [corto(m.userData.nombre), m.userData.grado, m.userData.inter.toFixed(3).replace('.', ',')]), nota: 'Grado = número de relaciones. Intermediación (Brandes, normalizada) = cuánto del camino más corto entre otros nodos pasa por este.' });
        top.slice(0, 3).forEach((m, i) => X.et('hub' + i, { p: [0, 0, 0], obj: m.userData.cabeza, t: corto(m.userData.nombre), s: 'k = ' + m.userData.grado, cls: 'nodo', delay: i * 0.2 }));
      } },
      { t: 'las relaciones de dependencia y las jerarquías que estructuran este modelo de ciudad.', a: (X) => {
        X.quitarEts(); X.quitar('met');
        X.despiece(420, 2); { const c = X.W.pot.centro, R = X.W.pot.radio; X.cam({ p: [c.x + R * 0.3, 2900 + R * 0.55, c.z + R * 2.0], o: [c.x, 1900, c.z], nom: 'Red multicapa sobre Bogotá' }, 2.4); }
        X.titulo('Arquitectura *multicapa*: dependencias y jerarquías', { kick: '02 · Estructura del plan', width: 38, cls: 'chico' });
        X.W.pot.planos.forEach((g, i) => X.et('capa' + i, { p: [0, 0, 0], obj: g.userData.ancla, t: X.CAPAS_POT[i][0], s: 'capa ' + (i + 1) + ' · ' + X.W.pot.nodos.filter((m) => m.userData.ci === i).length + ' nodos', c: X.CAPAS_POT[i][1], cls: 'nodo', delay: 0.6 + i * 0.12 }));
      } },
      { t: 'Esta representación se contrastó con el enfoque de Michael Batty, investigador del urbanismo computacional que estudia las ciudades como sistemas complejos.', a: (X) => {
        X.limpiar(); X.quitarEts(); X.despiece(0, 1.6);
        X.tarjeta('bat', { k: 'Urbanismo computacional', t: 'Michael Batty', d: 'La ciudad como sistema complejo: agentes, flujos y tiempo.', right: '7vw', top: '24vh' });
        X.capa('agentes'); X.gris(0, 1.5); X.cam({ p: [2600, 2300, 4800], o: [0, 700, 0], nom: 'Agentes sobre la ciudad' }, 2.6);
      } },
      { t: 'Se comprende que aunque el plan establece relaciones entre sus componentes, su representación no explica suficientemente', a: (X) => {
        X.limpiar(); X.titulo('El plan *relaciona*… pero ~no explica~', { width: 50 });
      } },
      { t: 'las interacciones entre agentes, los procesos de retroalimentación, las dinámicas emergentes', a: (X) => {
        X.lista('falta', { left: 8, top: '40vh', items: ['Interacciones entre agentes', 'Retroalimentación', 'Dinámicas emergentes'], n: ['↻', '↻', '↻'] });
        X.agentesVel(3);
      } },
      { t: 'ni cómo estas transforman y producen problemas a través del tiempo.', a: (X) => {
        X.dato('anio', { v: 2026, desde: 1972, l: 'problemas que se producen a través del tiempo', right: '7vw', top: '58vh', dur: 2.4 });
        X.capa('red-pot', false, 1.6); X.cam('alto', 3); X.foco(X.LUG.corabastos, 2600, '#E36C4B', 2.4);
      } },
    ],
  };
