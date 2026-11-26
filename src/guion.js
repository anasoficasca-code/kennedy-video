// Guion de la sustentación: cada frase (beat) = un clic = una animación sincronizada con lo que se dice.
// X = API (ui.js + mundo.js + main.js). Todas las cifras son las del guion de las autoras.
import { I, E, V, P, nodoEt, lugar } from './sec/util.js';
import s01 from './sec/s01.js';
import * as IN from './sec/intro.js';
import s02 from './sec/s02.js';
import s03 from './sec/s03.js';
import s04 from './sec/s04.js';
import s05 from './sec/s05.js';
import s06 from './sec/s06.js';

export const CAPITULOS = [
  /* ===================================================================== 00 PORTADA */
  // sobrevuelo de apertura sobre la fotogrametría real: arranca tras un velo cuando la foto ya cubre la vista,
  // dolly lento del suroccidente hacia los cerros, el límite de la localidad se dibuja y entra el nombre del proyecto
  {
    n: '00', nombre: 'Kennedy', cine: true,
    base: (X) => { IN.armar(X); },
    fin: (X, nuevo) => { IN.cortar(); IN.finPortada(X); if (!nuevo?.cine) IN.fin(X); },
    beats: [
      { t: '[Portada] Kennedy: modelamiento dinámico y simulación.', a: (X) => IN.portada(X) },
    ],
  },

  s01,
  s02,
  s03,
  s04,
  s05,
  s06,

  /* ===================================================================== 07 OBJETIVOS Y MACROMODELOS */
  {
    n: '07', nombre: 'Objetivos y macromodelos', cam: 'alto', tr: 'escalera',
    base: (X) => { X.gris(0.5, 0); X.capa('agua', true, 0); },
    beats: [
      { t: 'El objetivo general del proyecto es formular y evaluar, mediante simulaciones, un modelo urbano-arquitectónico ecocéntrico que transforme las relaciones territoriales asociadas a la fragmentación de Kennedy.', a: (X) => {
        X.titulo('Formular y evaluar un modelo urbano-arquitectónico *ecocéntrico*', { kick: '07 · Objetivo general', width: 60, cls: 'chico' });
        X.capa('agentes'); X.corredor(1, 4);
      } },
      { t: 'Para ello se establecieron tres objetivos específicos:', a: (X) => { X.limpiar(); X.dato('o3', { v: 3, l: 'objetivos específicos', left: 7, top: '16vh' }); X.lista('obj', { left: 8, top: '46vh', width: 50, items: [] }); } },
      { t: 'Analizar las relaciones espaciales entre los problemas y convertir sus indicadores en criterios de diseño.', a: (X) => { X.agregarItem('obj', 'Analizar relaciones espaciales → <span style="color:var(--lima)">criterios de diseño</span>', 0); X.aparecer('pF', 1, 1); X.aparecer('pE', 1, 1); } },
      { t: 'Plantear una red distribuida de equipamientos productivos, infraestructuras circulares y conexiones ecológicas articuladas mediante Bavaria Común.', a: (X) => { X.agregarItem('obj', 'Red distribuida articulada por <span style="color:var(--lima)">Bavaria Común</span>', 1); X.mercados(true, 0.5); X.estaciones(true); X.capa('bavaria'); } },
      { t: 'Y evaluar las consecuencias de estas intervenciones mediante simulaciones contrastadas.', a: (X) => { X.agregarItem('obj', 'Evaluar con <span style="color:var(--lima)">simulaciones contrastadas</span>', 2); X.agentesVel(2); } },
      { t: 'El ecocentrismo constituye el macromodelo principal, complementado por dos enfoques que también pueden evaluarse: la circularidad de recursos y el comercio ecológico.', a: (X) => {
        X.limpiar(); X.mercados(false); X.capa('pF', false); X.capa('pE', false);
        X.tarjeta('m1', { k: 'Macromodelo principal', t: 'Ecocentrismo', left: 37, top: '30vh', cls: 'on' });
        X.tarjeta('m2', { k: 'Enfoque', t: 'Circularidad de recursos', left: 8, top: '58vh', delay: 0.3 });
        X.tarjeta('m3', { k: 'Enfoque', t: 'Comercio ecológico', right: '8vw', top: '58vh', delay: 0.5 });
      } },
      { t: 'El primero se comprueba mediante la biodiversidad, las interacciones bióticas, la continuidad de corredores y los ciclos biogeoquímicos.', a: (X) => {
        X.el('m1').querySelector('.t').insertAdjacentHTML('afterend', '<div class="d">biodiversidad · interacciones bióticas · continuidad de corredores · ciclos biogeoquímicos</div>');
        X.capa('especies'); X.cam('humedal', 2.4);
      } },
      { t: 'La circularidad se evalúa mediante el aprovechamiento de residuos y la recuperación de nutrientes.', a: (X) => {
        X.marcar('m1', 'on', false); X.marcar('m2', 'on'); X.el('m2').insertAdjacentHTML('beforeend', '<div class="d">aprovechamiento de residuos · recuperación de nutrientes</div>');
        X.capa('especies', false); X.cam('alto', 2.4);
      } },
      { t: 'Y el comercio ecológico, mediante la producción local, la autonomía alimentaria y la accesibilidad al abastecimiento.', a: (X) => {
        X.marcar('m2', 'on', false); X.marcar('m3', 'on'); X.el('m3').insertAdjacentHTML('beforeend', '<div class="d">producción local · autonomía alimentaria · accesibilidad</div>'); X.mercados(true, 0.5);
      } },
      { t: 'Estos indicadores establecen las condiciones que la propuesta busca transformar y que posteriormente se ponen a prueba.', a: (X) => {
        X.limpiar(); X.titulo('Condiciones que se *ponen a prueba*', { cls: 'centro' });
      } },
    ],
  },

  /* ===================================================================== 08 BAVARIA COMÚN Y EL SIMULADOR */
  {
    n: '08', nombre: 'Bavaria Común y el simulador', cam: 'bav', tr: 'vuelo',
    base: (X) => { X.gris(0.7, 0); X.capa('agua', true, 0); X.capa('vias-prin', true, 0); },
    beats: [
      { t: 'Para materializar estos criterios se plantea Bavaria Común, un Distrito de Tecnologías Convergentes localizado en la antigua cervecería, entre las avenidas Boyacá y Las Américas.', a: (X) => {
        X.capa('bavaria'); X.foco(X.LUG.bavaria, 900);
        X.titulo('Bavaria *Común*', { kick: '08 · Distrito de Tecnologías Convergentes', width: 40 });
        lugar(X, 'bv', X.LUG.bavaria, 'Bavaria Común', 'Av. Boyacá × Av. Las Américas', 0.6, 300);
      } },
      { t: 'La intervención parte de la antigua cervecería Bavaria, un espacio actualmente desocupado y sin actividad.', a: (X) => {
        X.limpiar(); X.foto('bvf', { src: I('bavaria.jpg'), left: 6, top: '20vh', width: 44, height: '56vh', desde: 'izq', ry: 8, cap: '<b>simulador</b> · antigua cervecería Bavaria' });
      } },
      { t: 'Se propone recuperar parte de sus estructuras para transformarlas en espacios de formación, investigación y experimentación.', a: (X) => {
        X.lista('usos', { right: '7vw', top: '24vh', items: ['Formación', 'Investigación', 'Experimentación'] }); X.cam('bavCerca', 2.4);
      } },
      { t: 'Su programa se fundamenta en los estudios sobre convergencia de tecnologías NBIC, desarrollados por Roco y Bainbridge en un informe científico de 2002.', a: (X) => {
        X.limpiar(); X.quitarEts();
        X.titulo('Convergencia *NBIC*', { kick: 'Roco y Bainbridge · 2002', width: 40 });
        ['N', 'B', 'I', 'C'].forEach((k, i) => X.et('nb' + k, { p: [0, 0, 0], obj: X.W.nbic[i].userData.cabeza, t: k, s: ['nanotecnología', 'biotecnología', 'información', 'ciencias cognitivas'][i], cls: 'nodo grande', delay: i * 0.2 }));
      } },
      { t: 'La biotecnología se vincula con la hidroponía, el compostaje y el cultivo experimental de hongos.', a: (X) => { X.limpiar(); X.tarjeta('tb', { img: E('hongos'), k: 'B · biotecnología', t: 'Hidroponía · compostaje · hongos', left: 7, top: '24vh', cls: 'on' }); } },
      { t: 'Las tecnologías de la información coordinan pedidos, entregas y excedentes.', a: (X) => { X.marcar('tb', 'on', false); X.tarjeta('ti', { k: 'I · información', t: 'Pedidos · entregas · excedentes', left: 7, top: '50vh', cls: 'on' }); } },
      { t: 'Las ciencias cognitivas orientan el aprendizaje y la toma de decisiones, mientras la nanotecnología se incorpora como línea de investigación en materiales para la conservación de alimentos.', a: (X) => {
        X.marcar('ti', 'on', false); X.tarjeta('tc', { k: 'C · cognitivas', t: 'Aprendizaje y decisiones', right: '7vw', top: '24vh', cls: 'on' }); X.tarjeta('tn', { k: 'N · nanotecnología', t: 'Materiales para conservar alimentos', right: '7vw', top: '50vh', delay: 0.5 });
      } },
      { t: 'Bavaria funciona como clúster de conocimiento y aprendizaje, mientras las capacidades productivas se distribuyen por Kennedy.', a: (X) => {
        X.limpiar(); X.quitarEts(); X.cam('alto', 2.6); X.mercados(true, 0.5); X.sinFoco();
        X.titulo('Conocimiento en *Bavaria*, producción *distribuida*', { width: 46, cls: 'chico' });
      } },
      { t: 'Para evaluar estas intervenciones se desarrolló un simulador dirigido a arquitectos, urbanistas y actores vinculados con la transformación territorial.', a: (X) => {
        X.limpiar(); X.mercados(false); X.capa('bavaria', false);
        X.foto('sim', { src: I('portada_render.jpg'), left: 22, top: '16vh', width: 56, height: '58vh', cap: '<b>simulador</b> · Kennedy' });
        X.bloque('pub', '<span class="mono" style="color:var(--lima)">arquitectos · urbanistas · actores territoriales</span>', { left: 22, top: '80vh' });
      } },
      { t: 'El entorno representa calles, edificios, cubiertas, lotes y humedales,', a: (X) => {
        X.limpiar(); X.cam('humedal', 2.4); X.capa('edif', false, 0); X.capa('vias', false, 0); X.capa('agua', false, 0);
        const seq = [['vias', 'Calles'], ['edif', 'Edificios · cubiertas'], ['losa', 'Lotes'], ['agua', 'Humedales']];
        X.lista('ent', { left: 7, top: '24vh', items: [] });
        seq.forEach(([c, t], i) => X.gsap.delayedCall(X.R.rapido ? 0 : i * 0.7, () => { if (c === 'edif') X.W.capas.edif.userData.u.uSube.value = X.R.rapido ? 1 : 0; X.capa(c); if (c === 'edif') X.sube(1, [-900, 900], 2); X.agregarItem('ent', t, i); }));
      } },
      { t: 'junto con agentes que participan en procesos de desplazamiento, producción, consumo y distribución.', a: (X) => { X.capa('agentes'); X.agentesVel(2); X.capa('especies'); X.lista('ag', { right: '7vw', top: '24vh', items: ['Desplazamiento', 'Producción', 'Consumo', 'Distribución'], n: ['●', '●', '●', '●'] }); } },
      { t: 'El modelo dinámico-causal organiza sus relaciones, mientras el Game Design Canvas establece los controles, parámetros, reglas e indicadores.', a: (X) => {
        X.limpiar(); X.capa('especies', false);
        X.tarjeta('mdc', { k: 'relaciones', t: 'Modelo dinámico-causal', left: 10, top: '30vh', cls: 'on' });
        X.tarjeta('gdc', { k: 'controles · parámetros · reglas · indicadores', t: 'Game Design Canvas', right: '10vw', top: '30vh', delay: 0.4 });
      } },
      { t: 'Cada tick representa una semana, con un horizonte de quince años y un control horario que permite visualizar diferentes momentos del día.', a: (X) => { X.limpiar(); X.reloj('rel', { right: '7vw', top: '22vh' }); X.agentesVel(4); X.cam('alto', 3); } },
      { t: 'La evaluación se organiza en seis pares de simulaciones, bajo las mismas condiciones iniciales y perturbaciones, diferenciadas por la incorporación de la propuesta.', a: (X) => {
        X.limpiar(); X.agentesVel(1);
        const nombres = ['Abastecimiento', 'Movilidad', 'Residuos', 'Biodiversidad', 'Población', 'Recursos'];
        X.bloque('pares', `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;width:84vw">${nombres.map((n, i) => `<div class="vid" style="position:relative;padding:14px"><div class="mono" style="color:var(--lima)">par 0${i + 1}</div><div style="font:800 22px var(--f);letter-spacing:-.03em;margin:8px 0">${n}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><div class="mono" style="padding:8px;border:1px solid rgba(245,243,235,.2);font-size:10px">sin</div><div class="mono" style="padding:8px;border:1px solid #C7FF27;color:#C7FF27;font-size:10px">con</div></div></div>`).join('')}</div>`, { left: 8, top: '34vh' });
        if (!X.R.rapido) X.gsap.from(X.el('pares').querySelectorAll('.vid'), { rotationY: -90, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'expo.out' });
        X.titulo('6 pares · *12 simulaciones*', { width: 50, cls: 'chico', top: '12vh' });
      } },
    ],
  },

  /* ===================================================================== 09 PAR 01 */
  {
    n: '09', nombre: 'Primer par · abastecimiento y producción distribuida', cam: 'cora', tr: 'persiana',
    base: (X) => { X.gris(0.6, 0); X.capa('agua', true, 0); },
    beats: [
      { t: 'El primer par responde a la dependencia alimentaria y a la baja cobertura de mercados identificada en el diagnóstico.', a: (X) => { X.titulo('Par 01 · *Abastecimiento*', { kick: 'dependencia alimentaria · baja cobertura', width: 44 }); X.capa('flujos'); X.aparecer('pA'); X.capa('corabastos'); } },
      { t: 'La propuesta incorpora módulos productivos en cubiertas compartidas, colegios y otros espacios habilitados.', a: (X) => {
        X.limpiar(); X.foto('inem', { src: I('inem.jpg'), right: '6vw', top: '20vh', width: 40, height: '50vh', cap: '<b>simulador</b> · módulos en cubiertas y colegios' });
        X.lista('mod', { left: 7, top: '26vh', items: ['Cubiertas compartidas', 'Colegios', 'Espacios habilitados'] }); X.foco(X.LUG.corabastos, 3000, '#C7FF27', 3);
      } },
      { t: 'La formación se articula desde Bavaria, mientras las familias y organizaciones participan en la producción, destinando una parte al autoconsumo y otra a los puntos de acopio y mercados barriales.', a: (X) => {
        X.limpiar(); X.sinFoco(); X.cam('alto', 2.4); X.capa('bavaria'); X.mercados(true, 0.5);
        X.tarjeta('auto', { k: 'una parte', t: 'Autoconsumo', left: 7, top: '26vh' }); X.tarjeta('acop', { k: 'otra parte', t: 'Acopio y mercados barriales', left: 7, top: '50vh', delay: 0.4, cls: 'on' });
      } },
      { t: 'Los alimentos que no pueden producirse localmente continúan llegando de otras regiones. Corabastos permanece como uno de los nodos de abastecimiento.', a: (X) => { X.limpiar(); X.uTo('flujos', 'uBase', 0.2, 1); lugar(X, 'cora', X.LUG.corabastos, 'Corabastos', 'sigue siendo un nodo', 0.3, 260); } },
      { t: 'Al aumentar la demanda, el escenario sin propuesta conserva sus capacidades iniciales. En el segundo se incorporan los módulos productivos y mercados distribuidos.', a: (X) => {
        X.quitarEts(); X.par('p1', { izq: { t: 'capacidades iniciales', src: V('sim_agentes.mp4'), video: true }, der: { t: 'módulos + mercados', src: V('sim_propuesta.mp4'), video: true } });
      } },
      { t: 'Comparamos los volúmenes recibidos, las reservas, los déficits, el autoconsumo y la cobertura de mercados a menos de quince minutos.', a: (X) => X.filas('p1', ['Volúmenes recibidos', 'Reservas', 'Déficits', 'Autoconsumo', 'Cobertura < 15 min']) },
      { t: 'Así se evalúa si la distribución de capacidades productivas y comerciales responde al criterio de accesibilidad y autonomía alimentaria.', a: (X) => { X.limpiar(); X.titulo('¿Responde a la *accesibilidad* y la *autonomía alimentaria*?', { cls: 'centro chico' }); } },
    ],
  },

  /* ===================================================================== 10 PAR 02 */
  {
    n: '10', nombre: 'Segundo par · movilidad y accesibilidad', cam: 'alto', tr: 'recorte',
    base: (X) => { X.gris(0.7, 0); X.capa('vias-prin', true, 0); },
    beats: [
      { t: 'La localización de los mercados también responde a la configuración de la red vial.', a: (X) => { X.titulo('Par 02 · *Movilidad*', { kick: 'red vial y mercados', width: 40 }); X.mercados(true, 0.4); X.uTo('vias-prin', 'uBase', 0.6, 1); } },
      { t: 'Mediante la sintaxis espacial, la integración permite reconocer tramos accesibles y la elección identifica recorridos potenciales.', a: (X) => {
        X.limpiar(); X.mercados(false);
        X.tarjeta('int', { k: 'sintaxis espacial', t: 'Integración', d: 'tramos accesibles', left: 7, top: '24vh', cls: 'on' }); X.tarjeta('ele', { k: 'sintaxis espacial', t: 'Elección', d: 'recorridos potenciales', left: 7, top: '48vh', delay: 0.4 });
        X.uTo('vias-prin', 'uV', 1200, 1);
      } },
      { t: 'En Bavaria, estos análisis orientan nuevos pasajes que conectan las naves recuperadas con las calles del entorno, evitando extender la intervención sobre el bosque.', a: (X) => {
        X.limpiar(); X.cam('bavCerca', 2.6); X.capa('bavaria'); X.foco(X.LUG.bavaria, 700);
        X.foto('bv2', { src: I('bavaria.jpg'), right: '6vw', top: '20vh', width: 36, height: '46vh', cap: '<b>pasajes</b> · sin extenderse sobre el bosque' });
      } },
      { t: 'Al modificar la circulación, observamos cómo los vehículos reorganizan sus recorridos.', a: (X) => { X.limpiar(); X.capa('bavaria', false); X.sinFoco(); X.cam('alto', 2.4); X.capa('agentes'); X.agentesVel(4); } },
      { t: 'Con la propuesta, los nuevos destinos comerciales y conexiones modifican parte de los desplazamientos.', a: (X) => { X.mercados(true, 0.4); X.agentesVel(2); X.titulo('Nuevos destinos → *nuevos recorridos*', { width: 44, cls: 'chico' }); } },
      { t: 'Comparamos los tiempos de viaje, los niveles de congestión y el ruido asociado al tránsito, considerando también sus posibles efectos sobre la fauna.', a: (X) => {
        X.limpiar(); X.par('p2', { izq: { t: 'hora pico', src: I('flujo_pico.jpg') }, der: { t: 'ruido y fauna', src: I('ruido.jpg') } });
        X.filas('p2', ['Tiempos de viaje', 'Congestión', 'Ruido del tránsito', 'Efectos sobre la fauna']);
      } },
      { t: 'La prueba permite determinar en qué sectores disminuyen o aumentan las presiones y si la reorganización territorial mejora la capacidad de respuesta o traslada parte de la congestión hacia otros lugares.', a: (X) => { X.limpiar(); X.titulo('¿Mejora la respuesta o *traslada* la congestión?', { cls: 'centro chico' }); } },
    ],
  },

  /* ===================================================================== 11 PAR 03 */
  {
    n: '11', nombre: 'Tercer par · residuos y circularidad', cam: 'mariapaz', tr: 'cubo',
    base: (X) => { X.gris(0.7, 0); },
    beats: [
      { t: 'Los sectores con acumulación de residuos orientan la localización de Estaciones Circulares distribuidas.', a: (X) => { X.titulo('Par 03 · *Residuos*', { kick: 'estaciones circulares', width: 40 }); X.aparecer('pE'); X.estaciones(true); X.cam('alto', 3); } },
      { t: 'Estas infraestructuras incorporan espacios de recepción, separación, almacenamiento y tratamiento de materia orgánica.', a: (X) => { X.lista('est', { left: 7, top: '40vh', items: ['Recepción', 'Separación', 'Almacenamiento', 'Tratamiento orgánico'] }); } },
      { t: 'Parte de los residuos puede transformarse en compost y reincorporarse a los cultivos en suelo, relacionando el abastecimiento con la recuperación de nutrientes.', a: (X) => {
        X.limpiar();
        const ciclo = [['bacterias', 'compost'], ['nutrientes', 'nutrientes'], ['hongos', 'suelo vivo'], ['sauco', 'cultivos']];
        X.bloque('ciclo', `<div class="ciclo" style="position:relative;width:34vw;height:34vw">${ciclo.map(([s, t], i) => `<div class="cn" style="position:absolute;left:50%;top:50%;width:9vw;text-align:center;translate:-50% -50%"><img src="${E(s)}" style="width:7vw;height:7vw;object-fit:contain;filter:drop-shadow(0 6px 14px #000)"><div class="mono" style="color:var(--lima)">${t}</div></div>`).join('')}<div style="position:absolute;inset:12%;border:2px dashed rgba(199,255,39,.6);border-radius:50%"></div></div>`, { right: '8vw', top: '18vh' });
        const nodos = X.el('ciclo').querySelectorAll('.cn'); const p = { a: 0 };
        const pon = () => nodos.forEach((n, i) => { const a = p.a + i * Math.PI / 2; n.style.transform = `translate(${Math.cos(a) * 13}vw, ${Math.sin(a) * 13}vw)`; }); pon();
        X.gsap.to(p, { a: Math.PI * 2, duration: 12, repeat: -1, ease: 'none', onUpdate: pon });
        X.titulo('Residuo → *compost* → cultivo', { width: 40, cls: 'chico' });
      } },
      { t: 'En esta prueba aumentamos la generación de residuos orgánicos en ambos escenarios.', a: (X) => { X.uTo('pE', 'uS', 70, 2.5, 'steps(10)'); X.titulo('Perturbación: *más residuos orgánicos* en ambos escenarios', { width: 40, cls: 'chico abajo' }); } },
      { t: 'Sin propuesta, los residuos dependen de las capacidades iniciales de gestión. Con propuesta, se incorporan las nuevas estaciones y sus capacidades de procesamiento.', a: (X) => {
        X.limpiar(); X.par('p3', { izq: { t: 'capacidades iniciales', html: `<img src="${E('lixiviados')}" style="position:absolute;inset:18% 30%;width:40%;height:auto;object-fit:contain">` }, der: { t: 'estaciones circulares', html: `<img src="${E('nutrientes')}" style="position:absolute;inset:18% 30%;width:40%;height:auto;object-fit:contain">` } });
      } },
      { t: 'Se comparan las toneladas acumuladas, los residuos aprovechados, el compost recuperado y los momentos de saturación.', a: (X) => X.filas('p3', ['Toneladas acumuladas', 'Residuos aprovechados', 'Compost recuperado', 'Momentos de saturación']) },
      { t: 'Esto permite evaluar cuánto material se reincorpora al ciclo productivo y bajo qué condiciones las estaciones mantienen su funcionamiento.', a: (X) => { X.limpiar(); X.titulo('¿Cuánto material *vuelve al ciclo*?', { cls: 'centro chico' }); } },
    ],
  },

  /* ===================================================================== 12 PAR 04 */
  {
    n: '12', nombre: 'Cuarto par · biodiversidad y conectividad ecológica', cam: 'humedal', tr: 'pliegue',
    base: (X) => { X.gris(0.75, 0); X.capa('agua', true, 0); },
    beats: [
      { t: 'El diagnóstico ecológico identificó discontinuidades entre hábitats y presiones asociadas a las vías, el ruido y la transformación del suelo.', a: (X) => { X.titulo('Par 04 · *Biodiversidad*', { kick: 'hábitats discontinuos', width: 44 }); X.capa('vias-prin'); X.foto('rd', { src: I('ruido.jpg'), right: '6vw', top: '22vh', width: 34, height: '40vh', cap: '<b>simulador</b> · ruido del tránsito' }); } },
      { t: 'La propuesta incorpora jardines florales, restauración vegetal, recuperación de bordes de humedal y corredores ecológicos.', a: (X) => { X.limpiar(); X.corredor(1, 3); X.lista('eco', { left: 7, top: '24vh', items: ['Jardines florales', 'Restauración vegetal', 'Bordes de humedal', 'Corredores ecológicos'] }); } },
      { t: 'Su localización responde a las relaciones entre las especies y sus recursos.', a: (X) => { X.limpiar(); X.capa('especies'); X.titulo('Especies ↔ *recursos*', { width: 40 }); } },
      { t: 'Las abejas requieren recursos florales para la polinización;', a: (X) => { X.limpiar(); X.cam({ p: [-700, 700, 1500], o: [-900, 120, 900] }, 2.4); X.tarjeta('ab', { k: 'polinización', t: 'Abejas', d: 'requieren recursos florales', left: 7, top: '24vh', cls: 'on' }); } },
      { t: 'las mirlas participan en la dispersión de semillas,', a: (X) => { X.marcar('ab', 'on', false); X.tarjeta('mi', { img: E('mirla'), k: 'dispersión de semillas', t: 'Mirlas', left: 7, top: '46vh', cls: 'on' }); } },
      { t: 'mientras las tinguas dependen de las condiciones de los humedales.', a: (X) => { X.marcar('mi', 'on', false); X.tarjeta('ti', { img: E('tingua_bogotana'), k: 'humedales', t: 'Tinguas', right: '7vw', top: '30vh', cls: 'on' }); } },
      { t: 'En esta prueba introducimos el deterioro de un parche ecológico y observamos cómo responden las especies en los dos escenarios.', a: (X) => {
        X.limpiar(); X.cam('humedal', 2.4); const p = X.W.parches[2]; X.foco([p.x, p.z], 700, '#E36C4B');
        X.et('par', { p: [p.x, 150, p.z], t: 'Parche deteriorado', s: 'perturbación' }); X.titulo('Perturbación: un parche *se deteriora*', { width: 44, cls: 'chico' });
      } },
      { t: 'Para comprobar el macromodelo ecocéntrico, analizamos la diversidad de especies, la continuidad de corredores, la conectividad funcional y las interacciones bióticas.', a: (X) => { X.limpiar(); X.quitarEts(); X.sinFoco(); X.lista('ind', { left: 7, top: '22vh', items: ['Diversidad de especies', 'Continuidad de corredores', 'Conectividad funcional', 'Interacciones bióticas'] }); } },
      { t: 'También registramos los atropellamientos de fauna para reconocer las vías que dificultan sus desplazamientos.', a: (X) => { X.limpiar(); X.cam('alto', 2.4); X.uTo('vias-prin', 'uBase', 0.8, 0.6); X.titulo('Atropellamientos: las *vías* como barrera', { width: 44, cls: 'chico' }); } },
      { t: 'La comparación permite reconocer si las intervenciones mantienen las funciones ecológicas o si persisten condiciones de deterioro, a partir de los cambios en la permanencia de especies, sus interacciones y la conectividad de sus hábitats.', a: (X) => {
        X.limpiar(); X.par('p4', { izq: { t: 'deterioro', src: V('sim_humedal.mp4'), video: true }, der: { t: 'corredores y restauración', src: I('arboles.jpg') } });
        X.filas('p4', ['Permanencia de especies', 'Interacciones', 'Conectividad de hábitats']);
      } },
    ],
  },

  /* ===================================================================== 13 PAR 05 */
  {
    n: '13', nombre: 'Quinto par · población y presiones sobre el suelo', cam: 'oeste', tr: 'esquina',
    base: (X) => { X.gris(0.6, 0); X.capa('upz', true, 0); X.capa('edif', false, 0); },
    beats: [
      { t: 'La diferencia de densidad entre Patio Bonito y Tintal Norte evidencia que la demanda de servicios no se distribuye de manera uniforme.', a: (X) => {
        X.upzAlto(true); X.titulo('Par 05 · *Población*', { kick: 'demanda no uniforme', width: 40 });
        X.et('upb', { p: [X.LUG.patio[0], 700, X.LUG.patio[1]], t: 'Patio Bonito', s: '435 hab/ha', delay: 0.8 }); X.et('utn', { p: [X.LUG.tintal[0], 320, X.LUG.tintal[1]], t: 'Tintal Norte', s: '90 hab/ha', delay: 1.1 });
      } },
      { t: 'Por eso, la propuesta incorpora equipamientos de proximidad en sectores deficitarios y plantea proteger espacios productivos, comunitarios y ecológicos frente a las presiones inmobiliarias.', a: (X) => { X.limpiar(); X.quitarEts(); X.mercados(true, 0.45); X.aparecer('pD'); X.lista('prox', { left: 7, top: '22vh', items: ['Equipamientos de proximidad', 'Proteger lo productivo, comunitario y ecológico'] }); } },
      { t: 'En esta prueba introducimos el mismo crecimiento poblacional en ambos escenarios.', a: (X) => { X.limpiar(); X.upzAlto(true, 1.35); X.titulo('Mismo *crecimiento* en ambos escenarios', { width: 44, cls: 'chico' }); } },
      { t: 'El análisis permite estudiar dónde se concentra ese crecimiento, qué servicios reciben los habitantes y cómo evolucionan los usos del suelo.', a: (X) => { X.limpiar(); X.foto('usos', { src: I('usos.jpg'), right: '6vw', top: '20vh', width: 40, height: '50vh', cap: '<b>simulador</b> · usos del suelo' }); X.lista('q', { left: 7, top: '24vh', items: ['¿Dónde crece?', '¿Qué servicios recibe?', '¿Cómo cambian los usos?'], n: ['?', '?', '?'] }); } },
      { t: 'Desde el enfoque ecocéntrico, el valor del territorio también se evalúa mediante su capacidad de mantener biodiversidad, conectividad e interacciones ecológicas.', a: (X) => { X.limpiar(); X.upzAlto(false); X.capa('edif', true, 0.3); X.mercados(false); X.capa('pD', false); X.cam('humedal', 2.4); X.capa('agua'); X.corredor(1, 2.5); X.capa('especies'); X.titulo('El valor del suelo también es *ecológico*', { width: 44, cls: 'chico' }); } },
      { t: 'Así se reconocen las tensiones entre crecimiento urbano, presión inmobiliaria y capacidad de soporte ecológico.', a: (X) => {
        X.limpiar(); X.tarjeta('t1', { k: 'tensión', t: 'Crecimiento urbano', left: 40, top: '18vh' }); X.tarjeta('t2', { k: 'tensión', t: 'Presión inmobiliaria', left: 14, top: '58vh', delay: 0.3 }); X.tarjeta('t3', { k: 'tensión', t: 'Soporte ecológico', right: '12vw', top: '58vh', delay: 0.6, cls: 'on' });
      } },
    ],
  },

  /* ===================================================================== 14 PAR 06 */
  {
    n: '14', nombre: 'Sexto par · distribución de recursos', cam: 'bav', tr: 'escalera',
    base: (X) => { X.gris(0.7, 0); X.capa('agua', true, 0); },
    beats: [
      { t: 'La distribución de infraestructuras requiere también capacidades de organización y gestión.', a: (X) => { X.titulo('Par 06 · *Recursos*', { kick: 'organización y gestión', width: 40 }); } },
      { t: 'Entre los actores del territorio se encuentra el colectivo Salvemos el Bosque de Bavaria, cuya labor se relaciona con la protección de este ecosistema.', a: (X) => { X.limpiar(); X.foco(X.LUG.bavaria, 800, '#9be15d'); X.capa('bavaria'); X.foto('sbb', { src: I('logo_bosque_bavaria.png'), right: '8vw', top: '22vh', width: 24, height: '24vw', cap: '<b>colectivo</b> · Salvemos el Bosque de Bavaria' }); } },
      { t: 'La propuesta plantea una federación de asambleas con vocerías rotativas para coordinar iniciativas comunitarias, productivas y ambientales.', a: (X) => {
        X.limpiar(); X.sinFoco(); X.capa('bavaria', false); X.cam('alto', 2.4); X.mercados(true, 0.4);
        X.titulo('Federación de asambleas · vocería *rotativa*', { width: 46, cls: 'chico' });
        if (!X.R.rapido) { let i = 0; const rot = () => { X.W.mercados.forEach((g, k) => g.userData.n.scale.setScalar(k === i % X.W.mercados.length ? 2.6 : 1)); i++; }; rot(); X.gsap.to({}, { duration: 0.6, repeat: 30, onRepeat: rot }); }
      } },
      { t: 'La sexta prueba compara la distribución territorial de recursos limitados ante necesidades simultáneas en diferentes sectores.', a: (X) => { X.limpiar(); X.capa('upz'); X.upzAlto(true, 0.5); X.titulo('Recursos *limitados*, necesidades *simultáneas*', { width: 46, cls: 'chico' }); } },
      { t: 'Observamos qué equipamientos pueden habilitarse, qué necesidades se atienden y qué sectores permanecen sin cobertura.', a: (X) => { X.limpiar(); X.W.mercados.forEach((g, k) => { if (k % 3 === 2) X.tw(g.userData.ar.scale, { x: 0.001, y: 0.001, duration: X.D(0.6), ease: 'steps(4)', delay: X.D(k * 0.05) }); }); X.lista('rec', { left: 7, top: '22vh', items: ['¿Qué se habilita?', '¿Qué se atiende?', '¿Qué queda sin cobertura?'], n: ['✓', '✓', '✕'] }); } },
      { t: 'Esta simulación explora las consecuencias espaciales de distribuir recursos. La evaluación completa del funcionamiento político de la gobernanza heterárquica permanece como una posibilidad de desarrollo futuro.', a: (X) => { X.limpiar(); X.upzAlto(false); X.titulo('Gobernanza heterárquica: *desarrollo futuro*', { cls: 'centro chico' }); } },
    ],
  },

  /* ===================================================================== 15 GAME OVER */
  {
    n: '15', nombre: 'Indicadores, condiciones críticas y Game Over', cam: 'alto', tr: 'recorte',
    base: (X) => { X.gris(0.8, 0); X.capa('agentes', true, 0); },
    beats: [
      { t: 'Los resultados de las doce simulaciones se comparan en momentos equivalentes, identificando qué condiciones cambian, dónde ocurre esa transformación y durante cuánto tiempo se mantiene.', a: (X) => { X.titulo('12 simulaciones · *momentos equivalentes*', { width: 50, cls: 'chico' }); X.lista('qd', { left: 8, top: '44vh', items: ['Qué cambia', 'Dónde', 'Cuánto dura'] }); } },
      { t: 'Desde el comercio ecológico, se evalúa la producción local, la autonomía alimentaria y la accesibilidad a mercados.', a: (X) => { X.limpiar(); X.tarjeta('g1', { k: 'comercio ecológico', t: 'Producción local · autonomía · accesibilidad', left: 6, top: '24vh', cls: 'on' }); X.mercados(true, 0.4); } },
      { t: 'Desde la circularidad, el aprovechamiento de residuos y la reincorporación de nutrientes.', a: (X) => { X.marcar('g1', 'on', false); X.tarjeta('g2', { k: 'circularidad', t: 'Residuos aprovechados · nutrientes', left: 37, top: '24vh', cls: 'on' }); X.estaciones(true); } },
      { t: 'Y desde el ecocentrismo, la diversidad de especies, las interacciones bióticas, la continuidad de corredores y los ciclos biogeoquímicos del agua, el carbono y los nutrientes.', a: (X) => { X.marcar('g2', 'on', false); X.tarjeta('g3', { k: 'ecocentrismo', t: 'Especies · interacciones · corredores · ciclos', right: '6vw', top: '24vh', cls: 'on' }); X.corredor(1, 2); X.capa('agua'); } },
      { t: 'Para identificar los límites de funcionamiento se plantearon condiciones de Game Over.', a: (X) => { X.limpiar(); X.mercados(false); X.gameover(); X.gris(1, 0.4); X.temblor(); } },
      { t: 'En abastecimiento, cuando un sector recibe menos del 80 % de los alimentos que necesita.', a: (X) => { X.limpiar(); X.dato('g80', { v: 80, pre: '< ', suf: '%', l: 'abastecimiento · alimentos recibidos por sector', left: 6, top: '22vh', chico: true }); X.aparecer('pA'); } },
      { t: 'En residuos, cuando la acumulación supera la capacidad disponible de almacenamiento.', a: (X) => { X.bloque('gres', '<div class="vid" style="position:relative;width:26vw"><div class="mono" style="color:var(--coral)">residuos</div><div style="font:800 36px var(--f);letter-spacing:-.04em;margin-top:8px">acumulación &gt; capacidad</div></div>', { left: 37, top: '26vh' }); X.aparecer('pE'); } },
      { t: 'Y en biodiversidad, cuando la presencia de especies se reduce un 30 % o más respecto a las condiciones iniciales, según el indicador definido.', a: (X) => { X.dato('g30', { v: 30, pre: '−', suf: '%', l: 'biodiversidad · presencia de especies o más', right: '6vw', top: '22vh', chico: true }); } },
      { t: 'Estas condiciones se comprueban durante cuatro semanas consecutivas para distinguir fluctuaciones temporales de situaciones persistentes.', a: (X) => {
        X.bloque('sem', `<div style="display:flex;gap:12px">${[1, 2, 3, 4].map((s) => `<div class="vid s" style="position:relative;width:13vw;padding:18px"><div class="mono">semana ${s}</div><div class="b" style="height:10px;margin-top:14px;background:rgba(245,243,235,.12)"><i style="display:block;height:100%;width:0;background:var(--coral)"></i></div></div>`).join('')}</div>`, { left: 14, top: '62vh' });
        X.tw(X.el('sem').querySelectorAll('i'), { width: '100%', duration: X.D(0.7), ease: 'steps(5)', stagger: X.D(0.7) });
      } },
      { t: 'Basta con que se cumpla una de estas condiciones para activar el Game Over.', a: (X) => { X.limpiar(); X.gameover(); X.temblor(); X.foco([0, 0], 6000, '#E36C4B', 0.6); } },
      { t: 'Cuando se alcanza un límite, el simulador registra el indicador afectado, su localización y la semana correspondiente.', a: (X) => {
        X.limpiar(); X.sinFoco();
        X.bloque('log', '<div class="vid" style="position:relative;width:40vw;font:500 18px var(--m);line-height:2"><div style="color:var(--coral)">● GAME OVER REGISTRADO</div><div>indicador ......... <span class="ty"></span></div><div>localización ...... <span class="ty"></span></div><div>semana ............ <span class="ty"></span></div></div>', { left: 30, top: '30vh' });
        const v = ['afectado', 'sector', 'n.º']; X.el('log').querySelectorAll('.ty').forEach((s, i) => { if (X.R.rapido) { s.textContent = v[i]; return; } const p = { n: 0 }; X.gsap.to(p, { n: v[i].length, duration: 0.6, delay: 0.5 + i * 0.6, ease: 'steps(' + v[i].length + ')', onUpdate: () => (s.textContent = v[i].slice(0, Math.round(p.n)) + '▌') }); });
      } },
      { t: 'La comparación permite identificar cuáles intervenciones responden a los criterios de diseño, cuáles requieren ajustes y qué nuevas vulnerabilidades pueden surgir.', a: (X) => { X.limpiar(); X.gris(0.5); X.lista('res', { left: 8, top: '30vh', items: ['Responden a los criterios', 'Requieren ajustes', 'Nuevas vulnerabilidades'], n: ['✓', '↻', '!'] }); } },
    ],
  },

  /* ===================================================================== 16 LÍMITES */
  {
    n: '16', nombre: 'Límites del modelo', cam: 'alto', tr: 'persiana',
    base: (X) => { X.gris(1, 0); },
    beats: [
      { t: 'Los resultados dependen de las condiciones representadas en el modelo.', a: (X) => { X.titulo('Los resultados dependen de lo *representado*', { cls: 'centro chico' }); } },
      { t: 'La producción alimentaria está limitada por la superficie disponible y el rendimiento de los cultivos.', a: (X) => { X.limpiar(); X.tarjeta('l1', { k: 'límite', t: 'Producción alimentaria', d: 'superficie disponible · rendimiento de cultivos', left: 7, top: '24vh' }); } },
      { t: 'El aprovechamiento de residuos depende de las capacidades de tratamiento, mientras las interacciones ecológicas requieren representar adecuadamente las necesidades de cada especie.', a: (X) => { X.tarjeta('l2', { k: 'límite', t: 'Residuos', d: 'capacidades de tratamiento', left: 37, top: '24vh' }); X.tarjeta('l3', { k: 'límite', t: 'Interacciones ecológicas', d: 'necesidades de cada especie', right: '6vw', top: '24vh', delay: 0.4 }); } },
      { t: 'Por eso, las simulaciones no constituyen una predicción exacta del futuro de Kennedy.', a: (X) => { X.limpiar(); X.titulo('No es una ~predicción exacta~', { cls: 'centro' }); } },
      { t: 'Su aporte consiste en comparar decisiones, explorar sus consecuencias y reconocer las condiciones necesarias para que las intervenciones mantengan su funcionamiento.', a: (X) => { X.limpiar(); X.gris(0.3, 2); X.capa('agentes'); X.lista('ap', { left: 8, top: '28vh', items: ['Comparar decisiones', 'Explorar consecuencias', 'Reconocer condiciones necesarias'] }); } },
    ],
  },

  /* ===================================================================== 17 CIERRE */
  {
    n: '17', nombre: 'Cierre · posibilidades futuras', cam: 'alto', tr: 'vuelo',
    base: (X) => { X.gris(0.3, 0); X.capa('agua', true, 0); },
    beats: [
      { t: 'La investigación permitió pasar del análisis del POT al reconocimiento de las relaciones territoriales de Kennedy, convirtiendo los indicadores del diagnóstico en criterios de diseño que orientan una propuesta urbano-arquitectónica.', a: (X) => {
        X.lista('rec', { left: 7, top: '24vh', items: ['POT', 'Relaciones territoriales', 'Indicadores', 'Criterios de diseño', 'Propuesta'], n: ['→', '→', '→', '→', '●'] });
        const seq = ['red-pot', 'red6', 'mercados']; seq.forEach((c, i) => X.gsap.delayedCall(X.R.rapido ? 0 : i * 1.3, () => { seq.forEach((o) => X.capa(o, false, 0.3)); if (c === 'mercados') X.mercados(true, 0.5); else X.capa(c); }));
      } },
      { t: 'La evaluación se concentra en el macromodelo ecocéntrico, la circularidad de recursos y el comercio ecológico.', a: (X) => { X.limpiar(); X.capas(['red6', 'red-pot'], false); X.estaciones(true); X.corredor(1, 2); X.tarjeta('e1', { k: 'principal', t: 'Ecocentrismo', left: 37, top: '22vh', cls: 'on' }); X.tarjeta('e2', { t: 'Circularidad', left: 10, top: '56vh', delay: 0.3 }); X.tarjeta('e3', { t: 'Comercio ecológico', right: '10vw', top: '56vh', delay: 0.5 }); } },
      { t: 'Sin embargo, otros enfoques, como el hidrocéntrico, el regenerativo, la autonomía territorial, las redes de cuidado y la gobernanza heterárquica, amplían las posibilidades del proyecto', a: (X) => {
        X.limpiar(); const f = ['Hidrocéntrico', 'Regenerativo', 'Autonomía territorial', 'Redes de cuidado', 'Gobernanza heterárquica'];
        f.forEach((t, i) => { const a = (i / f.length) * Math.PI * 2 - Math.PI / 2; X.tarjeta('f' + i, { k: 'enfoque futuro', t, left: 40 + Math.cos(a) * 30, top: (42 + Math.sin(a) * 28) + 'vh', delay: i * 0.18 }); });
      } },
      { t: 'y requieren nuevas reglas e indicadores para comprobar su funcionamiento.', a: (X) => { X.titulo('Nuevas *reglas* e *indicadores*', { cls: 'centro chico' }); } },
      { t: 'Kennedy constituye el área de estudio donde se ponen a prueba estas relaciones, permitiendo explorar futuras aplicaciones del modelo a otras escalas de Bogotá.', a: (X) => { X.limpiar(); X.mercados(false); X.cam('lejos', 5); X.titulo('Kennedy → *otras escalas* de Bogotá', { width: 50, cls: 'chico' }); } },
      { t: 'Así, el proyecto plantea una forma de diseñar la ciudad desde sus interdependencias, comprendiendo que cada intervención modifica múltiples dinámicas y que sus consecuencias pueden evaluarse antes de su materialización.', a: (X) => { X.limpiar(); X.cam('alto', 4); X.capa('agentes'); X.capa('flujos'); X.titulo('Diseñar la ciudad desde sus *interdependencias*', { cls: 'centro' }); } },
      { t: 'Muchas gracias.', a: (X) => { X.limpiar(); X.capas(['red6', 'red-pot'], false); X.capas(['especies', 'vias-prin']); X.titulo('Muchas *gracias*', { cls: 'centro' }); X.bloque('aut', '<span class="mono" style="color:#b9bcb3">Kennedy · modelamiento dinámico y simulación</span>', { left: 38, top: '64vh' }); } },
    ],
  },
];
