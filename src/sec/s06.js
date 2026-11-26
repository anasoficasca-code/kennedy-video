// Capítulo 06 · sobre la página real «Red de problemas» (public/paginas/red/, driver src/paginas/red.js)
// Cada problema en el orden de la página (F,B,C,D,A,E): primero su tarjeta de indicador (dona, pictograma, hectáreas,
// barras, flujos, pesos) y después su lugar en el mapa de Kennedy. Lo que no está en la página (la meta del 75 %, el
// modelo ecocéntrico, las Estaciones Circulares) va encima, como criterio, sin cifras nuevas.
const P = 'red';
const mapa = (s = 1.3, extra = {}) => ({ sel: '#mk .mk-mapa', s, d: 2.6, ...extra });

export default /* ===================================================================== 06 CRITERIOS */
  {
    n: '06', nombre: 'Del diagnóstico a los criterios de diseño', cam: 'cora', tr: 'esquina', pagina: true,
    base: (X) => { X.gris(0.6, 0); },
    beats: [
      // F · dona 97 % (Corabastos + Las Flores)
      { t: 'Corabastos y Las Flores concentran el 97 % del volumen mayorista registrado en Bogotá.', a: (X) => {
        X.pagina(P, 'mapa', { entrada: 'barrido', k: 'F', reanimar: true, zoom: { sel: '.dona', s: 1.85, d: 2.6 } });
      } },
      // F · mapa: a pie por las calles 5 · 10 · 15 min desde cada plaza
      { t: 'Para evaluar la accesibilidad a los mercados, tomamos quince minutos como tiempo de referencia.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'F', repite: true, zoom: mapa(1.35) });
      } },
      // F · pictograma 28 % tiene una plaza a ≤ 15 min
      { t: 'Bajo este criterio, la cobertura estimada es del 28 %.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'F', reanimar: true, zoom: { sel: '.gente', s: 1.75, d: 2.2 } });
      } },
      // la meta del 75 % no está en la página: criterio de diseño encima del pictograma
      { t: 'Por eso, nuestro criterio de diseño es aumentar esta cobertura al 75 %, mediante una red de mercados barriales distribuidos.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'F', zoom: { sel: '.gente', s: 1.6, dx: 9, d: 2.4 } });
        X.dato('d75', { v: 75, desde: 28, suf: '%', l: 'criterio de diseño · cobertura a ≤ 15 min con una red de mercados barriales distribuidos', left: 6, top: '30vh', dur: 2.4, delay: 0.5 });
      } },
      // B · 435 vs 90 hab/ha (cuadros de una hectárea)
      { t: 'En cuanto al crecimiento poblacional, Patio Bonito registra 435 habitantes por hectárea, frente a 90 en Tintal Norte.', a: (X) => {
        X.quitar('d75');
        X.pagina(P, 'mapa', { k: 'B', reanimar: true, zoom: { sel: '.ha2', s: 1.75, d: 2.6 } });
      } },
      // B · mapa de densidades por UPZ
      { t: 'El criterio no consiste en igualar estas densidades, sino en distribuir servicios de acuerdo con la concentración poblacional y los déficits de cobertura.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'B', repite: true, zoom: mapa(1.3, { dy: 3 }) });
        X.titulo('No ~igualar densidades~: *distribuir servicios* según la concentración y el déficit', { top: '7vh', left: 4, width: 40, cls: 'chico', delay: 0.6 });
      } },
      // C · +33,4 % valor catastral 2022 → 2026
      { t: 'En valorización del suelo, el valor catastral de Kennedy aumentó un 33,4 % entre 2022 y 2026.', a: (X) => {
        X.limpiar();
        X.pagina(P, 'mapa', { k: 'C', reanimar: true, zoom: { sel: '.val', s: 2.0, d: 2.6 } });
      } },
      // C · mapa: metro, obras, huerta (hoy el suelo se valora por servicios y transporte)
      { t: 'Actualmente se valora por el acceso a servicios y transporte, pero nuestro modelo ecocéntrico propone valorarlo por su biodiversidad, interacciones bióticas y conectividad ecológica.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'C', zoom: mapa(1.35, { dy: 4 }) });
        X.titulo('Valorar el suelo por ~servicios y transporte~ → por *biodiversidad*, *interacciones bióticas* y *conectividad ecológica*', { top: '7vh', left: 4, width: 44, cls: 'chico', delay: 0.8 });
      } },
      // D · la frase real de la página: avisos de venta cerca de la línea ~12 % al año (Hipótesis)
      { t: 'En especulación inmobiliaria, los precios anunciados cerca del metro aumentan aproximadamente un 12 % anual.', a: (X) => {
        X.limpiar();
        X.pagina(P, 'mapa', { k: 'D', reanimar: true, marca: 'p.frase:nth-of-type(2)', zoom: { sel: 'p.frase:nth-of-type(2)|.num', s: 1.75, d: 2.6 } });
      } },
      // D · mapa: dónde se espera que suba (estaciones, Américas, Carvajal)
      { t: 'Nuestra propuesta busca proteger los espacios comunitarios y productivos frente al aumento del precio del suelo.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'D', zoom: mapa(1.4, { dx: 6, dy: 4 }) });
        X.titulo('*Proteger* los espacios comunitarios y productivos', { top: '7vh', left: 4, width: 36, cls: 'chico', delay: 0.6 });
      } },
      // A · 2,2 millones de t a Corabastos (2022) con sus flujos por región
      { t: 'En dependencia alimentaria, durante 2022 llegaron aproximadamente 2,2 millones de toneladas de alimentos a Corabastos.', a: (X) => {
        X.limpiar();
        X.pagina(P, 'mapa', { k: 'A', reanimar: true, zoom: { sel: '.ton|.flujo', s: 1.7, d: 2.6 } });
      } },
      // A · mapa: todo llega a un único punto
      { t: 'Nuestra propuesta busca aumentar la producción local y el abastecimiento distribuido, reduciendo la dependencia de un único nodo.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'A', repite: true, zoom: mapa(1.2, { dy: 2 }) });
        X.titulo('De *un único nodo* a producción local y abastecimiento *distribuido*', { top: '7vh', left: 4, width: 40, cls: 'chico', delay: 0.6 });
      } },
      // E · María Paz: 5 t orgánicos · 18 t voluminosos
      { t: 'Finalmente, en gestión de residuos, identificamos acumulaciones en María Paz de 5 toneladas de residuos orgánicos y 18 de voluminosos.', a: (X) => {
        X.limpiar();
        X.pagina(P, 'mapa', { k: 'E', reanimar: true, zoom: { sel: '.mp', s: 1.85, d: 2.6 } });
      } },
      // E · mapa: María Paz y Corabastos; las Estaciones Circulares solo existen en el simulador → tarjeta sobria, sin cifras
      { t: 'Proponemos Estaciones Circulares para reducir estas acumulaciones y aprovechar la materia orgánica, con la meta de disminuir las toneladas acumuladas y aumentar las aprovechadas.', a: (X) => {
        X.pagina(P, 'mapa', { k: 'E', zoom: mapa(1.55, { dx: 2, dy: -2 }) });
        X.tarjeta('ec', { k: 'propuesta', t: 'Estaciones Circulares', d: 'reducir las acumulaciones · aprovechar la materia orgánica<br>↓ toneladas acumuladas · ↑ toneladas aprovechadas', left: 4, top: '9vh', cls: 'on', delay: 0.6 });
      } },
      // propuesta.html · 07 «Qué cambia, cuánto y cómo se mide»: indicadores de partida y de llegada por problema
      { t: 'De esta manera, los indicadores se convierten en criterios de localización, dimensionamiento y funcionamiento de las intervenciones.', a: (X) => {
        X.limpiar();
        X.pagina('propuesta', 'problemas', { entrada: 'barrido', recorre: 5 });
        X.lista('crit', { right: '2.2vw', top: '40vh', width: '14vw', items: ['Localización', 'Dimensionamiento', 'Funcionamiento'] });
      } },
    ],
  };
