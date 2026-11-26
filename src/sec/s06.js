// Capítulo 06
import { I, E, V, P, nodoEt, lugar } from './util.js';

export default /* ===================================================================== 06 CRITERIOS */
  {
    n: '06', nombre: 'Del diagnóstico a los criterios de diseño', cam: 'cora', tr: 'esquina',
    base: (X) => { X.gris(0.6, 0); X.capa('agua', true, 0); },
    beats: [
      { t: 'Corabastos y Las Flores concentran el 97 % del volumen mayorista registrado en Bogotá.', a: (X) => {
        X.capa('corabastos'); X.foco(X.LUG.corabastos, 900); X.dato('d97', { v: 97, suf: '%', l: 'del volumen mayorista de Bogotá · Corabastos y Las Flores', left: 7, top: '18vh' });
        lugar(X, 'cora', X.LUG.corabastos, 'Corabastos', 'central mayorista', 0.3, 260); lugar(X, 'fl', X.LUG.flores, 'Plaza Las Flores', 'plaza distrital', 0.6, 160);
      } },
      { t: 'Para evaluar la accesibilidad a los mercados, tomamos quince minutos como tiempo de referencia.', a: (X) => {
        X.limpiar(); X.quitarEts(); X.cam('alto', 2.4); X.capa('iso'); X.dato('d15', { v: 15, suf: 'min', l: 'tiempo de referencia para llegar a un mercado', left: 7, top: '18vh' });
      } },
      { t: 'Bajo este criterio, la cobertura estimada es del 28 %.', a: (X) => {
        X.dato('d28', { v: 28, suf: '%', l: 'cobertura estimada actual', left: 7, top: '50vh' });
      } },
      { t: 'Por eso, nuestro criterio de diseño es aumentar esta cobertura al 75 %, mediante una red de mercados barriales distribuidos.', a: (X) => {
        X.quitar('d15'); X.dato('d28', { v: 75, desde: 28, suf: '%', l: 'criterio de diseño · red de mercados barriales distribuidos', left: 7, top: '50vh', dur: 2.2 });
        X.mercados(true); X.capa('iso', false); X.bloque('esq', '<span class="mono" style="color:#b9bcb3">esquema de la red distribuida · un nodo por UPZ</span>', { right: '6vw', bottom: '8vh' });
      } },
      { t: 'En cuanto al crecimiento poblacional, Patio Bonito registra 435 habitantes por hectárea, frente a 90 en Tintal Norte.', a: (X) => {
        X.limpiar(); X.mercados(false); X.cam('oeste', 2.6); X.capa('upz'); X.upzAlto(true); X.capa('edif', false);
        X.dato('pb', { v: 435, l: 'hab/ha · Patio Bonito', left: 7, top: '18vh', chico: true }); X.dato('tn', { v: 90, l: 'hab/ha · Tintal Norte', left: 7, top: '46vh', chico: true, delay: 0.6 });
        X.et('upb', { p: [X.LUG.patio[0], 700, X.LUG.patio[1]], t: 'Patio Bonito', s: '435 hab/ha' }); X.et('utn', { p: [X.LUG.tintal[0], 320, X.LUG.tintal[1]], t: 'Tintal Norte', s: '90 hab/ha', delay: 0.6 });
      } },
      { t: 'El criterio no consiste en igualar estas densidades, sino en distribuir servicios de acuerdo con la concentración poblacional y los déficits de cobertura.', a: (X) => {
        X.limpiar(); X.quitarEts(); X.titulo('No ~igualar densidades~: *distribuir servicios* según la demanda', { width: 48, cls: 'chico' });
        X.mercados(true, 0.6);
      } },
      { t: 'En valorización del suelo, el valor catastral de Kennedy aumentó un 33,4 % entre 2022 y 2026.', a: (X) => {
        X.limpiar(); X.mercados(false); X.upzAlto(false); X.capa('upz', false, 1.2); X.capa('edif', true, 0.2); X.cam('alto', 2.4);
        X.foco([0, 0], 5200, '#A99BCB', 2); X.aparecer('pC');
        X.dato('d33', { v: 33.4, dec: 1, suf: '%', l: 'aumento del valor catastral · 2022–2026', left: 7, top: '18vh' });
      } },
      { t: 'Actualmente se valora por el acceso a servicios y transporte, pero nuestro modelo ecocéntrico propone valorarlo por su biodiversidad, interacciones bióticas y conectividad ecológica.', a: (X) => {
        X.limpiar(); X.sinFoco(); X.cam('humedal', 2.6);
        X.titulo('Valorar por ~servicios y transporte~ → por *biodiversidad*, *interacciones* y *conectividad*', { width: 52, cls: 'chico' });
        X.corredor(1, 3); X.capa('especies');
      } },
      { t: 'En especulación inmobiliaria, los precios anunciados cerca del metro aumentan aproximadamente un 12 % anual.', a: (X) => {
        X.limpiar(); X.capa('especies', false); X.capa('corredores', false); X.capa('metro'); X.aparecer('pD'); X.cam('alto', 2.4);
        X.dato('d12', { v: 12, suf: '% anual', l: 'precios anunciados cerca del metro', left: 7, top: '18vh' });
      } },
      { t: 'Nuestra propuesta busca proteger los espacios comunitarios y productivos frente al aumento del precio del suelo.', a: (X) => {
        X.limpiar(); X.titulo('*Proteger* lo comunitario y lo productivo', { width: 44 }); X.mercados(true, 0.35);
      } },
      { t: 'En dependencia alimentaria, durante 2022 llegaron aproximadamente 2,2 millones de toneladas de alimentos a Corabastos.', a: (X) => {
        X.limpiar(); X.mercados(false); X.capa('metro', false); X.capa('pD', false); X.cam('cora', 2.4); X.capa('flujos'); X.uTo('flujos', 'uBase', 0.4, 1); X.capa('corabastos');
        X.dato('d22', { v: 2.2, dec: 1, suf: 'M t', l: 'de alimentos llegaron a Corabastos en 2022', left: 7, top: '18vh' });
      } },
      { t: 'Nuestra propuesta busca aumentar la producción local y el abastecimiento distribuido, reduciendo la dependencia de un único nodo.', a: (X) => {
        X.limpiar(); X.cam('alto', 2.4); X.uTo('flujos', 'uBase', 0.08, 2); X.mercados(true);
        X.titulo('De *un único nodo* a una *red distribuida*', { width: 44, cls: 'chico' });
      } },
      { t: 'Finalmente, en gestión de residuos, identificamos acumulaciones en María Paz de 5 toneladas de residuos orgánicos y 18 de voluminosos.', a: (X) => {
        X.limpiar(); X.mercados(false); X.capa('flujos', false); X.capa('corabastos', false); X.cam('mariapaz', 2.4); X.aparecer('pE'); X.foco(X.LUG.mariapaz, 600, '#E36C4B');
        X.dato('d5', { v: 5, suf: 't', l: 'residuos orgánicos · María Paz', left: 7, top: '18vh', chico: true }); X.dato('d18', { v: 18, suf: 't', l: 'residuos voluminosos · María Paz', left: 7, top: '46vh', chico: true, delay: 0.5 });
        lugar(X, 'mp', X.LUG.mariapaz, 'María Paz', 'acumulación de residuos', 0.4, 80);
      } },
      { t: 'Proponemos Estaciones Circulares para reducir estas acumulaciones y aprovechar la materia orgánica, con la meta de disminuir las toneladas acumuladas y aumentar las aprovechadas.', a: (X) => {
        X.limpiar(); X.quitarEts(); X.sinFoco(); X.estaciones(true); X.cam('alto', 2.4);
        X.tarjeta('ec', { img: E('nutrientes'), k: 'propuesta', t: 'Estaciones Circulares', d: '↓ toneladas acumuladas · ↑ toneladas aprovechadas', left: 7, top: '22vh', cls: 'on' });
      } },
      { t: 'De esta manera, los indicadores se convierten en criterios de localización, dimensionamiento y funcionamiento de las intervenciones.', a: (X) => {
        X.limpiar(); X.mercados(true, 0.5);
        X.titulo('Indicadores → *criterios*', { kick: '06 · De diagnóstico a diseño', width: 40 });
        X.lista('crit', { left: 8, top: '42vh', items: ['Localización', 'Dimensionamiento', 'Funcionamiento'] });
      } },
    ],
  };
