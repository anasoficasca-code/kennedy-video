// Capítulo 06 · Del diagnóstico a los criterios de diseño
// Página real: «Red de problemas» de alejagoguti-cpu (driver 'redag', public/paginas/red-ag/), su recorrido por los seis
// problemas: para cada uno, la tarjeta del indicador (dona, pictograma, hectáreas, barras, flujos, pesos) sobre su mapa
// de Kennedy y, un scroll más abajo, su «Criterio de diseño» (del 28 % al 75 %, servicios al ritmo de la gente, suelo con
// función, que el precio no expulse, producir cerca, que lo orgánico vuelva a la tierra). Al final, la sección
// «Qué cambia el diseño en cada problema». Encima, la edición: cifras que cuentan, señales sobre la página y zócalos.
const P = 'redag';
const paso = (X, k, o = {}) => X.pagina(P, 'paso', { k, ...o });
const card = (k, sel = '') => `#story .paso[data-k="${k}"] .card${sel ? ' ' + sel : ''}`;

/** acciones al ritmo de la voz; se anulan en cuanto empieza otra frase (de este capítulo o del otro, 05/06) */
function ctx(X, t) {
  const g = (window.__ctx56 = (window.__ctx56 || 0) + 1), r = X.R.rapido;
  const i = window.__k ? window.__k.BEATS.findIndex((b) => b.t === t) : -1;
  const vivo = () => g === window.__ctx56 && (i < 0 || location.hash === '#' + (i + 1));
  const seq = (pasos) => pasos.forEach(([s, f]) => { const fn = () => { if (vivo()) f(); }; if (r || !s) fn(); else X.gsap.delayedCall(s, fn); });
  return { vivo, seq, r };
}
// zona libre para las cifras: arriba a la derecha, sobre el cielo del mapa
const CX = 64, CY = 9;

export default /* ===================================================================== 06 CRITERIOS */
  {
    n: '06', nombre: 'Del diagnóstico a los criterios de diseño', cam: 'cora', tr: 'esquina', pagina: true, precarga: ['redag'],
    base: (X) => { X.gris(0.6, 0); },
    beats: [
      // centralización · la dona: Corabastos + Las Flores
      { t: 'Corabastos y Las Flores concentran el 97 % del volumen mayorista registrado en Bogotá.', a: (X) => {
        const c = ctx(X, 'Corabastos y Las Flores concentran el 97 % del volumen mayorista registrado en Bogotá.');
        paso(X, 'F', { reanimar: true, entrada: 'corte' });
        c.seq([[0.6, () => X.ed.cifra({ v: 97, suf: '%', texto: 'del volumen mayorista registrado en Bogotá', x: CX, y: CY })],
          [1.4, () => X.ed.senalar(P, card('F', '.dona'), { texto: 'Corabastos y Las Flores', pad: 8 })]]);
      } },
      // el mapa vuelve a dibujar las calles a pie: 5 · 10 · 15 min desde cada plaza
      { t: 'Para evaluar la accesibilidad a los mercados, tomamos quince minutos como tiempo de referencia.', a: (X) => {
        const c = ctx(X, 'Para evaluar la accesibilidad a los mercados, tomamos quince minutos como tiempo de referencia.');
        paso(X, 'F', { repite: true });
        c.seq([[1.6, () => X.ed.cifra({ v: 15, suf: 'min', texto: 'como *tiempo de referencia*', x: CX, y: CY })],
          [2.6, () => X.ed.senalar(P, '#mk .mk-ley, #mk .mk-leyenda, #mk [class*=ley]', { pad: 6, lado: 'arriba' })]]);
      } },
      // el pictograma: 28 % tiene una plaza a ≤ 15 min
      { t: 'Bajo este criterio, la cobertura estimada es del 28 %.', a: (X) => {
        const c = ctx(X, 'Bajo este criterio, la cobertura estimada es del 28 %.');
        paso(X, 'F', { reanimar: true });
        c.seq([[0.5, () => X.ed.senalar(P, card('F', '.gente'), { pad: 8 })],
          [1.2, () => X.ed.cifra({ v: 28, suf: '%', texto: 'la *cobertura estimada*', x: CX, y: CY })]]);
      } },
      // scroll al «Criterio de diseño»: del 28 % al 75 %, la malla de plazas de barrio aparece en el mapa
      { t: 'Por eso, nuestro criterio de diseño es aumentar esta cobertura al 75 %, mediante una red de mercados barriales distribuidos.', a: (X) => {
        const c = ctx(X, 'Por eso, nuestro criterio de diseño es aumentar esta cobertura al 75 %, mediante una red de mercados barriales distribuidos.');
        paso(X, 'F2', { d: 1.6 });
        c.seq([[1.9, () => X.ed.cifra({ v: 75, desde: 28, suf: '%', texto: 'mediante una *red de mercados barriales distribuidos*', x: CX, y: CY, dur_conteo: 2.2 })],
]);
      } },
      // crecimiento poblacional · dos hectáreas: Patio Bonito y Tintal Norte
      { t: 'En cuanto al crecimiento poblacional, Patio Bonito registra 435 habitantes por hectárea, frente a 90 en Tintal Norte.', a: (X) => {
        const c = ctx(X, 'En cuanto al crecimiento poblacional, Patio Bonito registra 435 habitantes por hectárea, frente a 90 en Tintal Norte.');
        paso(X, 'B', { d: 1.6 });
        c.seq([[2.6, () => X.ed.cifra({ v: 435, texto: 'hab/ha · *Patio Bonito*', x: 60, y: CY })],
          [4.6, () => X.ed.cifra({ v: 90, texto: 'hab/ha · *Tintal Norte*', x: 80, y: CY })],
          [3.0, () => X.ed.senalar(P, card('B', '.ha2'), { pad: 8 })]]);
      } },
      // «Servicios al ritmo de la gente»
      { t: 'El criterio no consiste en igualar estas densidades, sino en distribuir servicios de acuerdo con la concentración poblacional y los déficits de cobertura.', a: (X) => {
        const c = ctx(X, 'El criterio no consiste en igualar estas densidades, sino en distribuir servicios de acuerdo con la concentración poblacional y los déficits de cobertura.');
        paso(X, 'B2', { d: 1.6 });
        c.seq([[0.8, () => X.ed.rotulo('no consiste en igualar estas densidades, sino en *distribuir servicios*')],
          [4.2, () => X.ed.pop({ t: 'de acuerdo con la *concentración poblacional* y los *déficits de cobertura*', x: CX, y: CY, ancho: 30, cls: 'oscuro' })]]);
      } },
      // valorización del suelo · barras 2022 → 2026
      { t: 'En valorización del suelo, el valor catastral de Kennedy aumentó un 33,4 % entre 2022 y 2026.', a: (X) => {
        const c = ctx(X, 'En valorización del suelo, el valor catastral de Kennedy aumentó un 33,4 % entre 2022 y 2026.');
        paso(X, 'C', { d: 1.6, reanimar: true });
        c.seq([[1.6, () => X.ed.cifra({ v: 33.4, dec: 1, pre: '+', suf: '%', texto: 'el valor catastral de Kennedy, entre *2022 y 2026*', x: CX, y: CY })],
          [2.4, () => X.ed.senalar(P, card('C', '.val'), { pad: 8 })]]);
      } },
      // «Suelo con función, no solo precio»: hoy servicios y transporte (metro en el mapa) → modelo ecocéntrico
      { t: 'Actualmente se valora por el acceso a servicios y transporte, pero nuestro modelo ecocéntrico propone valorarlo por su biodiversidad, interacciones bióticas y conectividad ecológica.', a: (X) => {
        const c = ctx(X, 'Actualmente se valora por el acceso a servicios y transporte, pero nuestro modelo ecocéntrico propone valorarlo por su biodiversidad, interacciones bióticas y conectividad ecológica.');
        paso(X, 'C2', { d: 1.6 });
        c.seq([[0.6, () => X.ed.pop({ t: 'se valora por el acceso a *servicios y transporte*', x: CX, y: CY, ancho: 30, cls: 'oscuro' })],
          [4.2, () => X.ed.lista({ titulo: 'nuestro modelo ecocéntrico', items: ['*biodiversidad*', '*interacciones bióticas*', '*conectividad ecológica*'], x: CX, y: CY + 17, ancho: 30, paso: 1.0 })]]);
      } },
      // especulación · la frase real de la página (hipótesis)
      { t: 'En especulación inmobiliaria, los precios anunciados cerca del metro aumentan aproximadamente un 12 % anual.', a: (X) => {
        const c = ctx(X, 'En especulación inmobiliaria, los precios anunciados cerca del metro aumentan aproximadamente un 12 % anual.');
        paso(X, 'D', { d: 1.6 });
        c.seq([[2.6, () => X.ed.cifra({ v: 12, pre: '≈', suf: '% anual', texto: 'los precios anunciados *cerca del metro*', x: CX, y: CY })],
          [3.2, () => X.ed.senalar(P, card('D', 'p.frase:nth-of-type(2), .frase + .frase'), { pad: 6 })]]);
      } },
      // «Que el precio no expulse»
      { t: 'Nuestra propuesta busca proteger los espacios comunitarios y productivos frente al aumento del precio del suelo.', a: (X) => {
        const c = ctx(X, 'Nuestra propuesta busca proteger los espacios comunitarios y productivos frente al aumento del precio del suelo.');
        paso(X, 'D2', { d: 1.6 });
        c.seq([[0.9, () => X.ed.rotulo('proteger los espacios *comunitarios y productivos*')]]);
      } },
      // dependencia alimentaria · flujos hacia Corabastos
      { t: 'En dependencia alimentaria, durante 2022 llegaron aproximadamente 2,2 millones de toneladas de alimentos a Corabastos.', a: (X) => {
        const c = ctx(X, 'En dependencia alimentaria, durante 2022 llegaron aproximadamente 2,2 millones de toneladas de alimentos a Corabastos.');
        paso(X, 'A', { d: 1.6, reanimar: true });
        c.seq([[2.6, () => X.ed.cifra({ v: 2.2, dec: 1, suf: 'millones de t', texto: 'de alimentos a *Corabastos* durante 2022', x: CX, y: CY })]]);
      } },
      // «Producir cerca»
      { t: 'Nuestra propuesta busca aumentar la producción local y el abastecimiento distribuido, reduciendo la dependencia de un único nodo.', a: (X) => {
        const c = ctx(X, 'Nuestra propuesta busca aumentar la producción local y el abastecimiento distribuido, reduciendo la dependencia de un único nodo.');
        paso(X, 'A2', { d: 1.6 });
        c.seq([[0.8, () => X.ed.lista({ items: ['aumentar la *producción local*', 'el abastecimiento *distribuido*', 'reduciendo la dependencia de *un único nodo*'], x: CX, y: CY, ancho: 30, paso: 1.5 })]]);
      } },
      // residuos · María Paz: barras de 5 t y 18 t
      { t: 'Finalmente, en gestión de residuos, identificamos acumulaciones en María Paz de 5 toneladas de residuos orgánicos y 18 de voluminosos.', a: (X) => {
        const c = ctx(X, 'Finalmente, en gestión de residuos, identificamos acumulaciones en María Paz de 5 toneladas de residuos orgánicos y 18 de voluminosos.');
        paso(X, 'E', { d: 1.6, reanimar: true });
        c.seq([[2.8, () => X.ed.senalar(P, card('E', '.mp'), { texto: 'María Paz', pad: 6 })],
          [3.6, () => X.ed.cifra({ v: 5, suf: 't', texto: 'de residuos *orgánicos*', x: CX, y: CY })],
          [5.4, () => X.ed.cifra({ v: 18, suf: 't', texto: '*voluminosos*', x: CX + 15, y: CY })]]);
      } },
      // «Que lo orgánico vuelva a la tierra»: las Estaciones Circulares (están en la matriz de criterios de esta página)
      { t: 'Proponemos Estaciones Circulares para reducir estas acumulaciones y aprovechar la materia orgánica, con la meta de disminuir las toneladas acumuladas y aumentar las aprovechadas.', a: (X) => {
        const c = ctx(X, 'Proponemos Estaciones Circulares para reducir estas acumulaciones y aprovechar la materia orgánica, con la meta de disminuir las toneladas acumuladas y aumentar las aprovechadas.');
        paso(X, 'E2', { d: 1.6 });
        c.seq([[0.8, () => X.ed.pop({ t: 'Estaciones Circulares', d: 'para reducir estas acumulaciones y aprovechar la materia orgánica', x: CX, y: CY, ancho: 30 })],
          [5.6, () => X.ed.lista({ items: ['disminuir las toneladas *acumuladas*', 'aumentar las *aprovechadas*'], x: CX, y: CY + 22, ancho: 30, paso: 1.4 })]]);
      } },
      // «Qué cambia el diseño en cada problema»: diagnóstico → criterio → propuesta → comprobación
      { t: 'De esta manera, los indicadores se convierten en criterios de localización, dimensionamiento y funcionamiento de las intervenciones.', a: (X) => {
        const c = ctx(X, 'De esta manera, los indicadores se convierten en criterios de localización, dimensionamiento y funcionamiento de las intervenciones.');
        X.pagina(P, 'criterios', { sec: 'cr-seis', dy: -40, recorre: 420, pausa: 400, d: 6 });
        c.seq([[2.8, () => X.ed.lista({ titulo: 'criterios de', items: ['*localización*', '*dimensionamiento*', '*funcionamiento*'], x: 64, y: 12, ancho: 28, paso: 0.9 })]]);
      } },
    ],
  };
