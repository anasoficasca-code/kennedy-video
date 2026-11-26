// Capítulo 01
import { I, E, V, P, nodoEt, lugar } from './util.js';

export default /* ===================================================================== 01 INTRODUCCIÓN */
  {
    n: '01', nombre: 'Introducción', cam: 'alto', tr: 'pliegue',
    base: (X) => { X.capa('agua', true, 0); },
    beats: [
      { t: 'La modernización del abastecimiento, el crecimiento urbano y la transformación del suelo buscaban responder a necesidades diferentes,', a: (X) => {
        X.tarjeta('c1', { k: '01 · abastecimiento', t: 'Modernizar el abasto', left: 8, top: '22vh', rz: -3 });
        X.tarjeta('c2', { k: '02 · ciudad', t: 'Crecimiento urbano', left: 38, top: '48vh', rz: 2, delay: 0.25 });
        X.tarjeta('c3', { k: '03 · suelo', t: 'Transformar el suelo', left: 68, top: '24vh', rz: -2, delay: 0.5 });
      } },
      { t: 'pero sus efectos terminaron entrelazándose,', a: (X) => {
        ['c1', 'c2', 'c3'].forEach((id, i) => X.tw(X.el(id), { left: (34 + i * 4) + 'vw', top: (34 + i * 5) + 'vh', rotation: (i - 1) * 9, duration: X.D(1.2), ease: 'steps(10)' }));
        X.capa('flujos'); X.cam('cora', 3);
      } },
      { t: 'intensificando la dependencia alimentaria, la acumulación de residuos y la degradación de los ecosistemas.', a: (X) => {
        X.limpiar(); X.titulo('*dependencia* alimentaria · *residuos* · ecosistemas *degradados*', { top: '14vh', width: 60 });
        X.aparecer('pA'); X.aparecer('pE', 1, 2.4); X.foco(X.LUG.corabastos, 1500, '#E36C4B');
      } },
      { t: 'Problemas que no fueron consecuencia de una sola decisión, sino de múltiples dinámicas que se reforzaron entre sí.', a: (X) => {
        X.limpiar(); X.sinFoco();
        X.titulo('No fue ~una sola decisión~: *múltiples dinámicas* que se refuerzan', { top: '12vh', width: 44, cls: 'chico' });
        X.foto('axo', { src: I('axo_1956.jpg'), left: 50, top: '20vh', width: 42, height: '52vh', cap: '<b>1956</b> · Kennedy antes de Kennedy' });
        X.flipbook('axo', [I('axo_1956.jpg'), I('axo_1972.jpg'), I('axo_1988.jpg'), I('axo_2024.jpg')], 1.1, ['<b>1956</b> · suelo rural', '<b>1972</b> · llega Corabastos', '<b>1988</b> · la ciudad crece', '<b>2024</b> · hoy']);
      } },
      { t: 'Precisamente, estas dinámicas y las relaciones son el punto central del proyecto de Modelamiento Dinámico y Simulación.', a: (X) => {
        X.limpiar(); X.titulo('Las *relaciones* son el centro del proyecto', { cls: 'centro' });
        X.capa('vias-prin'); X.cam('alto', 3); X.capa('flujos', false);
      } },
      { t: 'Su desarrollo comprende el análisis del POT de Bogotá, el diagnóstico y la formulación de los problemas de Kennedy,', a: (X) => {
        X.limpiar(); X.lista('fases', { left: 8, top: '22vh', items: ['Análisis del POT de Bogotá', 'Diagnóstico y formulación de los problemas de Kennedy'] });
        X.capa('red-pot'); X.cam('pot', 3);
      } },
      { t: 'la construcción de un modelo propio de ciudad y la exploración de sus posibles consecuencias mediante simulaciones.', a: (X) => {
        X.agregarItem('fases', 'Construcción de un modelo propio de ciudad', 2, '03');
        X.agregarItem('fases', 'Exploración de consecuencias mediante <span style="color:var(--lima)">simulaciones</span>', 3, '04', 0.25);
        X.capa('red-pot', false); X.capa('agentes'); X.cam('cora', 3);
      } },
    ],
  };
