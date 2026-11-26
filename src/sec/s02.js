// Capítulo 02 · hecho con las páginas reales de las autoras (rapot, potred, complejo, macromodelos)
import { precargar } from '../pagina.js';

export default /* ===================================================================== 02 POT */
  {
    n: '02', nombre: 'El POT y la ciudad como sistema complejo', cam: 'pot', tr: 'persiana', pagina: true,
    base: () => { precargar('rapot', 'potred', 'complejo', 'macromodelos'); },
    beats: [
      // 1 · el POT: la esfera de sus 38 componentes
      { t: 'Como punto de partida, el Plan de Ordenamiento Territorial de Bogotá', a: (X) => {
        X.pagina('rapot', 'inicio', { entrada: 'zoom', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 62, y: 52, s: 1.18, d: 6.5, ease: 'sine.inOut' });
      } },
      // 2 · «una red»
      { t: 'se reconstruyó como una red', a: (X) => {
        X.pagina('potred', 'red', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 43.5, y: 59, s: 1.85, d: 3.4, ease: 'power3.inOut' });
      } },
      // 3 · Barabási
      { t: 'a partir de los aportes de Albert-László Barabási,', a: (X) => {
        X.pagina('potred', 'red');
        X.tarjeta('bar', { k: 'Aportes de', t: 'Albert-László Barabási', left: 3, top: '72vh', width: 21 });
        X.camPag({ x: 36, y: 52, s: 2.3, d: 3.8, ease: 'sine.inOut' });
      } },
      // 4 · ciencia de redes
      { t: 'físico e investigador de la ciencia de redes.', a: (X) => {
        X.pagina('potred', 'red');
        X.tarjeta('bar', { k: 'Ciencia de redes', t: 'Albert-László Barabási', d: 'Físico e investigador de la ciencia de redes.', left: 3, top: '66vh', width: 21 });
        X.camPag({ x: 38, y: 60, s: 2.3, d: 3.2, ease: 'sine.inOut' });
      } },
      // 5 · nodos centrales: los dos hubs de la red
      { t: 'Se identificaron los nodos centrales,', a: (X) => {
        X.quitar('bar');
        X.pagina('potred', 'hubs');
        X.camPag({ x: 43.5, y: 59, s: 3.2, d: 2.6, ease: 'power3.inOut' });
      } },
      // 6 · dependencias: las seis relaciones entre estructuras
      { t: 'las relaciones de dependencia', a: (X) => {
        X.pagina('rapot', 'organiza', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 68, y: 50, s: 1.4, d: 3.5, ease: 'sine.inOut' });
      } },
      // 7 · jerarquías: el tamaño de cada estructura
      { t: 'y las jerarquías', a: (X) => {
        X.pagina('rapot', 'prioriza');
        X.camPag({ x: 58, y: 50, s: 1.25, d: 3, ease: 'sine.inOut' });
      } },
      // 8 · la centralidad no equivale a la jerarquía normativa
      { t: 'que estructuran este modelo de ciudad.', a: (X) => {
        X.pagina('potred', 'jerarquia', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 76, y: 54, s: 1.3, d: 2.6, ease: 'sine.inOut' });
      } },
      // 9 · Batty
      { t: 'Esta representación se contrastó con el enfoque de Michael Batty,', a: (X) => {
        X.pagina('complejo', 'inicio', { entrada: 'zoom', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.tarjeta('bat', { k: 'Enfoque de', t: 'Michael Batty', right: 5, top: '58vh', width: 25 });
        X.camPag({ x: 38, y: 22, s: 1.4, d: 4, ease: 'sine.inOut' });
      } },
      // 10 · urbanismo computacional, sistemas complejos
      { t: 'investigador del urbanismo computacional que estudia las ciudades como sistemas complejos.', a: (X) => {
        X.pagina('complejo', 'inicio');
        X.tarjeta('bat', { k: 'Urbanismo computacional', t: 'Michael Batty', d: 'Estudia las ciudades como sistemas complejos.', right: 5, top: '58vh', width: 25 });
        X.camPag({ x: 40, y: 18, s: 1.9, d: 5.5, ease: 'sine.inOut' });
      } },
      // 11 · el plan sí relaciona sus componentes
      { t: 'Se comprende que aunque el plan establece relaciones entre sus componentes,', a: (X) => {
        X.quitar('bat');
        X.pagina('potred', 'relaciones', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 43.5, y: 59, s: 2.2, d: 4.5, ease: 'sine.inOut' });
      } },
      // 12 · lo que el POT no puede explicar
      { t: 'su representación no explica suficientemente', a: (X) => {
        X.pagina('macromodelos', 'pregunta', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 40, y: 50, s: 1.6, d: 3, ease: 'sine.inOut' });
      } },
      // 13 · interacciones entre agentes
      { t: 'las interacciones entre agentes,', a: (X) => {
        X.pagina('complejo', 'agentes', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 50, y: 50, s: 1.35, d: 2.6, ease: 'power2.inOut' });
      } },
      // 14 · retroalimentación
      { t: 'los procesos de retroalimentación,', a: (X) => {
        X.pagina('complejo', 'construccion', { paso: 1 });
        X.camPag({ x: 50, y: 38, s: 2, d: 2.6, ease: 'power2.inOut' });
      } },
      // 15 · dinámicas emergentes
      { t: 'las dinámicas emergentes', a: (X) => {
        X.pagina('complejo', 'emergencia');
        X.camPag({ x: 44, y: 50, s: 1.7, d: 2.2, ease: 'power2.inOut' });
      } },
      // 16 · a través del tiempo
      { t: 'ni cómo estas transforman y producen problemas a través del tiempo.', a: (X) => {
        X.pagina('macromodelos', 'dinamico', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0.01 } });
        X.camPag({ x: 24, y: 40, s: 2.1, d: 3.2, ease: 'power2.inOut' });
      } },
    ],
  };


