// Capítulo 03 · usa las páginas reales de las autoras: «De 18 capas a 9 índices» (cruces) y «Indicadores en 3D» (picos)
import { precargar } from '../pagina.js';

export default /* ===================================================================== 03 INDICADORES */
  {
    n: '03', nombre: 'De los mapas a las dinámicas territoriales', cam: 'capas', tr: 'recorte', pagina: true,
    base: (X) => { X.gris(0.8, 0); },
    beats: [
      { t: 'Para comenzar a comprender Kennedy desde la complejidad, se cruzaron dieciocho capas de información satelital,', a: (X) => {
        precargar('picos');
        X.pagina('cruces', 'pila', { entrada: 'barrido', camara: { x: 27, y: 52, s: 1.55, d: 0 } });
      } },
      { t: 'a partir de las cuales se construyeron nueve índices territoriales.', a: (X) => {
        X.pagina('cruces', 'nueve');
      } },
      { t: 'Entre ellos, el índice de concentración comercial y logística y el índice de soporte ecológico.', a: (X) => {
        X.pagina('cruces', 'ccl_se');
      } },
      { t: 'Mientras las actividades comerciales y logísticas se intensificaban alrededor de Corabastos,', a: (X) => {
        X.pagina('picos', 'ccl', { entrada: 'zoom', camara: { x: 50, y: 50, s: 1, d: 0 } });
      } },
      { t: 'el soporte ecológico presentaba discontinuidades y fragmentación de la cobertura vegetal.', a: (X) => {
        X.pagina('picos', 'se');
      } },
      { t: 'Al cruzar estos índices se pueden reconocer sectores donde coinciden diferentes presiones urbanas y ecológicas,', a: (X) => {
        X.pagina('picos', 'ambos');
      } },
      { t: 'identificando relaciones espaciales que orientan el análisis de los problemas.', a: (X) => {
        X.pagina('cruces', 'relaciones', { entrada: 'barrido', camara: { x: 50, y: 50, s: 1, d: 0 } });
      } },
    ],
  };
