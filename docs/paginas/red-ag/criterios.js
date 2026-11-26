/* ============ DEL DIAGNÓSTICO A LOS CRITERIOS DE DISEÑO (entre la red de problemas y el modelo) ============
   Traza, para cada uno de los seis problemas: diagnóstico → criterio de diseño → meta → respuesta urbano-arquitectónica →
   indicador de comprobación → relaciones sistémicas. Añade una evaluación ecocéntrica transversal, la lectura espacial
   cruzada por UPZ y la estructura de datos de las doce simulaciones (seis experimentos × sin / con propuesta, 15 años).

   Reglas de rigor:
   - Las cifras del diagnóstico son las mismas que ya usa la página (objeto D de index.html y propuesta.html), con sus fuentes.
   - Las metas numéricas solo aparecen cuando ya estaban en la propuesta, o cuando el encargo las fija como meta preliminar.
   - Nada de lo que aquí aparece es un resultado de simulación. Los resultados se cargan desde simulaciones.json cuando existan.
   - Etiquetas cuando falta información: «Línea base pendiente de cálculo», «Meta preliminar de diseño»,
     «Pendiente de validación», «Pendiente de simulación». */
(function(){
'use strict';
const LIM='#cfff5e',AMB='#e6c36a',MUT='#7a8480';
const fmt=(v,d=0)=>(+v).toLocaleString('es-CO',{maximumFractionDigits:d,minimumFractionDigits:d});
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pc=k=>(typeof PC!=='undefined'&&PC[k])||(k==='X'?'#5fb8a8':LIM);
const pt=k=>k==='X'?'Evaluación ecocéntrica transversal':(typeof byId!=='undefined'&&byId[k]?byId[k].t:k);
// numeración del encargo: 01 dependencia … 06 centralización
const NUM={A:'01',B:'02',C:'03',D:'04',E:'05',F:'06',X:'ECO'};
const ORD=['A','B','C','D','E','F'];

/* ---------- fuentes que vienen de propuesta.html (misma numeración) ---------- */
if(typeof SRC!=='undefined'){
 SRC[11]=SRC[11]||['Alcaldía de Bogotá. «Distrito intervendrá 17 Plazas Distritales»: las plazas distritales representan el 5,1 % del abastecimiento de alimentos de la ciudad.','https://bogota.gov.co/mi-ciudad/desarrollo-economico/plazas-de-mercado-de-bogota-distrito-intervendra-17-plazas-distritales'];
 SRC[18]=SRC[18]||['Casas, Gómez y Trujillo. Distrito Bavaria Común y simulador de Kennedy: datos, sintaxis y usos del suelo (repositorio del simulador, 2026). Cálculos de acceso sobre 77.280 edificios residenciales.','https://anasoficasca-code.github.io/simulador/bavaria.html'];
 SRC[25]=SRC[25]||['Jardín Botánico de Bogotá, capa Arbolado por UPZ, con población proyectada por la SDP 2023–2024 (archivo upz.json de este repositorio).','https://alejagoguti-cpu.github.io/red-de-problemas/upz.json'];
 SRC[26]=SRC[26]||['Propuesta Bavaria Común: «Qué cambia, cuánto y cómo se mide» (metas y supuestos de la propuesta, no resultados).','https://alejagoguti-cpu.github.io/red-de-problemas/propuesta.html#problemas'];
}
const cite=a=>(a||[]).map(i=>typeof SRC!=='undefined'&&SRC[i]?'<a class="cb" href="'+SRC[i][1]+'" target="_blank" rel="noopener" title="'+String(SRC[i][0]).replace(/"/g,'')+'">['+i+']</a>':'').join('');

/* ---------- tipos de dato (se distinguen visualmente) ---------- */
const TIPO={
 real:['Dato del diagnóstico','con fuente verificable'],
 calc:['Cálculo propio','sobre datos con fuente'],
 meta:['Meta preliminar de diseño','propuesta, no resultado'],
 val:['Pendiente de validación','requiere revisión o fuente'],
 lb:['Línea base pendiente de cálculo','no hay dato suficiente'],
 sim:['Pendiente de simulación','sin corrida todavía'],
 res:['Resultado de simulación','cargado desde simulaciones.json']};
const tag=(t,txt)=>'<span class="ct ct-'+t+'" title="'+TIPO[t][0]+' · '+TIPO[t][1]+'">'+(txt||TIPO[t][0])+'</span>';
const val=(v,t)=>'<span class="cv cv-'+t+'">'+v+'</span>';

/* ---------- intervenciones (una misma intervención responde a varios problemas) ----------
   r: problemas a los que responde · pos: efectos esperados · neg: efectos indirectos posibles o conflictos entre objetivos.
   Los efectos son hipótesis del macromodelo: se comprueban con los indicadores, no se dan por ciertos. */
const INT={
 I1:{t:'Malla de plazas de barrio',d:'Una plaza mayor y 19 plazas de barrio ubicadas con el algoritmo de máxima cobertura y criterios de sintaxis espacial.',r:['F','A','B','E'],
  pos:['Acerca el abasto a la demanda (F1, F2)','Reparte la capacidad en vez de agrandar una central (B4)','Cada plaza funciona como punto verde de orgánicos (E3)'],
  neg:['Puede elevar el precio del suelo alrededor de cada plaza: refuerza C y D si no se protege el uso','Más viajes de surtido en calles locales si el acopio no se coordina']},
 I2:{t:'Centro de consolidación y acopio en Bavaria',d:'Selección, frío y empaque para que el alimento regional llegue a las plazas sin pasar por una sola central.',r:['A','F'],
  pos:['Acorta la cadena y diversifica los nodos de abastecimiento (A4, A6)','Permite la compra directa a productores (A5)'],
  neg:['Riesgo de recentralizar: si todo pasa por el acopio, se repite el patrón de Corabastos en menor escala']},
 I3:{t:'Huertas productivas en cubiertas, colegios y lotes',d:'Huertas acompañadas por promotores formados en Bavaria Común; abastecen a tiendas y comedores.',r:['A','E','X','B'],
  pos:['Aumenta la producción local (A1, A2)','Reciben el compost de las Estaciones Circulares (E4)','Pueden funcionar como pasaderas entre parches (X3, X4)'],
  neg:['Cerca del humedal pueden atraer aves a vidrios y luz: trampa ecológica (SIM-03, G16)','Demanda de agua y de horas de trabajo: abandono por carga (SIM-01, G7)']},
 I4:{t:'Estaciones Circulares',d:'Compostaje distribuido, una por sector, conectado con mercados, huertas y el distrito de hongos.',r:['E','A','F','X'],
  pos:['Trata orgánicos cerca de su origen (E3)','Devuelve nutrientes al suelo (E4, X10)','Descentraliza un servicio hoy concentrado (F)'],
  neg:['Sobre su capacidad generan olores y vectores (ocupación > 100 %, SIM-02, G12)','Pueden atraer fauna sinantrópica']},
 I5:{t:'Suelo común fuera del mercado (Bavaria Común)',d:'71,2 ha de suelo común, sin torres ni lotes en venta; el uso queda anclado a lo público.',r:['C','D','F'],
  pos:['Protege usos productivos, ecológicos y comunitarios de la presión inmobiliaria (C2, D3, D6)'],
  neg:['La presión puede desplazarse a los predios vecinos (efecto de borde): hay que medir el precio a 1 km (D1)']},
 I6:{t:'Gestión comunitaria y gobernanza heterárquica',d:'Federación de juntas con vocería rotativa y peso por saber que se enseña; mecanismos de gestión comunitaria del suelo.',r:['D','F','A'],
  pos:['Reduce la vulnerabilidad de las actividades comunitarias (D3)','Reparte la decisión en vez de concentrarla (F)'],
  neg:['Carga de participación: si sube, aumenta el abandono (SIM-01, G7)','Cola de decisiones si la capacidad no crece con la red (SIM-01, G6)']},
 I7:{t:'Corredores ecológicos, humedales y refugios',d:'Restauración del borde de los humedales La Vaca, El Burro y Techo, corredores entre parches y refugios de fauna.',r:['X','C','B'],
  pos:['Aumenta la conectividad funcional y la persistencia de especies (X2–X7)','Regula el ciclo del agua (X8)'],
  neg:['Puede aumentar el valor comercial del suelo vecino (valorización «verde»): no se asume, se mide (C1, D1)','Conflicto con la demanda de suelo en las UPZ que más crecen (B2)']},
 I8:{t:'Equipamientos de proximidad en estructuras existentes',d:'Reutilización de las naves de Bavaria y de edificaciones existentes para abasto, cocina, cuidado y formación.',r:['F','B','D'],
  pos:['Aumenta la capacidad disponible por habitante donde hay déficit (F5, B3)','Evita construir nuevo: menos carbono incorporado (X9)'],
  neg:['Si se concentran todos en el predio, vuelve la centralización: deben repartirse por sector']},
 I9:{t:'Transferencia de conocimiento desde Bavaria Común',d:'Instituto y escuela de saberes: formación de promotores y voceras que vuelven a enseñar en su barrio.',r:['A','F'],
  pos:['Sostiene la capacidad productiva local (A2) y la calidad de manejo (SIM-01, G5)'],
  neg:['Saturación del acompañamiento si los cupos no crecen con las huertas (SIM-01, G5)']}};

/* ---------- los seis problemas: criterio de diseño general ---------- */
const PROB={
 A:{dg:'Dependencia del abastecimiento externo, procedencia de los alimentos, concentración de la distribución y capacidad productiva local.',
  cr:'Aumentar la autonomía alimentaria y diversificar los nodos de abastecimiento.',
  pr:'Huertas productivas en cubiertas y colegios, mercados barriales, puntos de acopio y transferencia de conocimiento desde Bavaria Común.',
  co:'Porcentaje de la demanda alimentaria cubierto con producción local, toneladas producidas y porcentaje de abastecimiento externo.',
  re:'Centralización de servicios, movilidad, generación de residuos y transformación del suelo.',i:['I3','I1','I2','I9']},
 B:{dg:'Distribución espacial de la población, variación de la densidad y concentración del crecimiento por sectores.',
  cr:'Mejorar la correspondencia espacial entre la concentración poblacional, la disponibilidad de servicios y la capacidad de soporte ecológico.',
  pr:'Distribución estratégica de equipamientos de proximidad y aprovechamiento de estructuras existentes, empezando por los sectores con mayor déficit.',
  co:'Habitantes por hectárea, variación de la densidad por sector, cobertura de servicios y capacidad de los equipamientos frente a la población atendida.',
  re:'Centralización de servicios, valorización, especulación, demanda alimentaria y residuos.',i:['I8','I1','I7'],
  nota:'El crecimiento poblacional no es negativo por sí mismo. Se analiza dónde ocurre, en qué condiciones y qué presiones genera sobre el territorio.'},
 C:{dg:'Variación del valor catastral y distribución espacial de la valorización.',
  cr:'Incorporar el valor ecológico, social y funcional del territorio como criterio de transformación urbana, más allá de su valor monetario.',
  pr:'Recuperación de corredores ecológicos, restauración de hábitats, espacios productivos, equipamientos comunitarios y recuperación de estructuras existentes.',
  co:'Variación del valor monetario del suelo, conectividad ecológica, diversidad de especies, recuperación de funciones ecosistémicas y accesibilidad a servicios.',
  re:'Especulación inmobiliaria, biodiversidad, crecimiento poblacional y centralización.',i:['I5','I7','I8'],
  nota:'Valorización económica (precio) y valoración ecológica (función) son cosas distintas. No se asume que una mejora ecológica produzca un aumento determinado del valor comercial.'},
 D:{dg:'Variación de precios inmobiliarios, diferencias territoriales de precio, presión sobre usos existentes y posibles transformaciones del suelo.',
  cr:'Disminuir la vulnerabilidad de las actividades comunitarias, productivas y ecológicas frente a las presiones inmobiliarias.',
  pr:'Gestión comunitaria del suelo, protección de espacios productivos y ecológicos, reutilización de edificaciones y gobernanza heterárquica.',
  co:'Variación de precios, superficie con usos comunitarios y productivos, cambios de uso del suelo y hogares potencialmente expuestos al desplazamiento.',
  re:'Valorización, crecimiento poblacional, dependencia alimentaria y pérdida de soporte ecológico.',i:['I5','I6','I8'],
  nota:'El aumento de precios inmobiliarios es un indicador indirecto de presión. Por sí solo no demuestra que exista especulación.'},
 E:{dg:'Cantidad de residuos generados, puntos críticos de acumulación, capacidad de tratamiento y aprovechamiento.',
  cr:'Aumentar la capacidad territorial de aprovechamiento de residuos orgánicos y reducir su acumulación.',
  pr:'Estaciones Circulares distribuidas, compostaje y conexión entre mercados, huertas y espacios productivos.',
  co:'Toneladas generadas, tratadas y acumuladas, porcentaje de aprovechamiento y toneladas de compost reincorporadas a los ciclos productivos.',
  re:'Dependencia alimentaria, crecimiento poblacional, calidad ambiental y ciclos biogeoquímicos.',i:['I4','I1','I3']},
 F:{dg:'Concentración espacial de equipamientos, tiempos de desplazamiento y cobertura territorial.',
  cr:'Redistribuir los servicios según la demanda poblacional y los déficits de accesibilidad.',
  pr:'Red de mercados barriales, equipamientos de proximidad, Estaciones Circulares y espacios comunitarios conectados con criterios de sintaxis espacial.',
  co:'Porcentaje de población con acceso a servicios dentro de tiempos de desplazamiento definidos, cobertura por sector y capacidad disponible por habitante.',
  re:'Crecimiento poblacional, movilidad, dependencia alimentaria y valorización del suelo.',i:['I1','I8','I4','I6'],
  nota:'El paso 01 del recorrido cita 28 % de la población del suroccidente con una plaza a 15 minutos o menos (guion del proyecto, SDP 2022), pero sin URL verificable, así que no se usa como línea base. La línea base con fuente es el cálculo propio por la red peatonal: 22,5 % de las viviendas a 500 m y 47,3 % a 800 m, distancia que cabe en 15 minutos a pie. El 75 % es la meta de diseño del proyecto, preliminar y pendiente de validación.'},
 X:{dg:'Diversidad, parches, corredores, conectividad, especies focales, interacciones bióticas, persistencia y ciclos del agua, el carbono y los nutrientes.',
  cr:'Que cada intervención mantenga o aumente la capacidad del territorio para sostener la vida no humana, medida con los mismos indicadores antes y después.',
  pr:'Restauración de humedales, corredores ecológicos, refugios, huertas ubicadas por corredores y Estaciones Circulares.',
  co:'Índice de Shannon, número y superficie de parches, continuidad de corredores, conectividad funcional, ocupación por especie focal, persistencia y balances de agua, carbono y nutrientes.',
  re:'Atraviesa los seis problemas: el crecimiento y la valorización presionan el borde de los humedales, y los residuos y el abasto cierran o rompen los ciclos.',i:['I7','I3','I4','I8'],
  nota:'Los indicadores ecológicos no se leen aislados: cada uno se relaciona con una dinámica social, económica o territorial.'}};

/* ---------- indicadores ----------
   b: línea base {v: texto, n: número para comparar, u: unidad, a: año, s: fuentes, t: tipo}
   loc: localización territorial {v, t} · m: meta {v, n, t, nota} · dir: +1 subir, −1 bajar, 0 monitorear
   f: fórmula de comprobación · u: unidad · rel: indicadores relacionados · um: umbral crítico o condición de Game Over
   ex: experimento · sm: dónde lo toca hoy el modelo de esta página (no son resultados) */
const LB={v:'Línea base pendiente de cálculo',t:'lb'},MP=(txt)=>({v:txt||'Meta preliminar de diseño por definir',t:'val'}),UM={v:'Pendiente de definición',t:'val'};
const IND=[
 // ---------- 01 · Dependencia alimentaria
 {id:'A1',p:'A',n:'Demanda alimentaria de Kennedy cubierta con producción local',b:{v:'Línea base pendiente de cálculo',t:'lb'},loc:LB,
  c:'Aumentar la autonomía alimentaria sin buscar el autoabastecimiento: acortar la cadena.',m:MP(),dir:1,ri:['I3','I2','I9'],
  f:'toneladas producidas en Kennedy y consumidas en Kennedy ÷ demanda alimentaria total de Kennedy × 100',u:'%',rel:['A2','A3','E3','F1'],um:UM,ex:'EXP-01',sm:'SIM-01 · G3 (dependencia de Corabastos en la zona, con supuestos S)'},
 {id:'A2',p:'A',n:'Producción local en huertas',b:{v:'Línea base pendiente de cálculo',t:'lb'},loc:{v:'Una huerta registrada en el repositorio: Vive Vibra Verde, JAC Carvajal Osorio (Jardín Botánico)',t:'real'},
  c:'Aumentar la capacidad productiva local en cubiertas, colegios y lotes.',m:MP(),dir:1,ri:['I3','I9'],
  f:'Σ (m² de huerta × rendimiento) por año',u:'t/año',rel:['A1','E4','X1','X3'],um:UM,ex:'EXP-01',sm:'SIM-01 · G1 (producción y destino semanal, t/semana)'},
 {id:'A3',p:'A',n:'Procedencia del abastecimiento que entra a Corabastos',b:{v:'2.198.118 t · Cundinamarca 46,25 % · Meta 12,43 %',u:'t y %',a:'2022',s:[1],t:'real'},loc:{v:'Corabastos, UPZ 80 (Kennedy) · abastece a Bogotá y su área de influencia, no solo a Kennedy',t:'real'},
  c:'Diversificar los nodos de abastecimiento y reducir la exposición a interrupciones de una sola vía o región.',m:MP(),dir:-1,ri:['I2','I1'],
  f:'toneladas de origen externo a la región que abastecen a Kennedy ÷ toneladas totales que abastecen a Kennedy × 100',u:'%',rel:['A1','A4','F1'],um:{v:'Bloqueo del mayorista: estrés de SIM-01 (semanas 300–325)',t:'val'},ex:'EXP-01',sm:'SIM-01 · estrés «bloqueo del mayorista»'},
 {id:'A4',p:'A',n:'Participación de las plazas distritales en el abasto de Bogotá',b:{v:'5,1 %',n:5.1,u:'%',s:[11],t:'real'},loc:{v:'13 plazas de mercado en Kennedy (IPES y OpenStreetMap)',t:'calc',s:[18]},
  c:'Desconcentrar la distribución: que más alimento llegue por plazas y no por una sola central.',m:{v:'A monitorear',t:'val'},dir:1,ri:['I1','I2'],
  f:'toneladas comercializadas en plazas ÷ toneladas abastecidas × 100',u:'%',rel:['A3','F4'],um:UM,ex:'EXP-01',sm:'—'},
 {id:'A5',p:'A',n:'Compra directa a productores en las plazas',b:{v:'0 %',n:0,u:'%',t:'val',nota:'valor de partida de la propuesta'},loc:{v:'Plazas de la malla',t:'val'},
  c:'Acortar la cadena entre productor y consumidor.',m:{v:'45 %',n:45,t:'meta',nota:'supuesto del simulador, citado en la propuesta',s:[26]},dir:1,ri:['I2','I1'],
  f:'toneladas compradas directamente a productores ÷ toneladas vendidas en las plazas × 100',u:'%',rel:['A3','F1'],um:UM,ex:'EXP-01',sm:'Supuesto de entrada, no resultado'},
 {id:'A6',p:'A',n:'Puntos con selección, frío y empaque en Kennedy',b:{v:'0',n:0,u:'puntos',t:'val'},loc:{v:'Centro de consolidación en el predio de Bavaria (UPZ 113)',t:'meta'},
  c:'Contar con infraestructura de acopio propia que no dependa de la central.',m:{v:'1',n:1,t:'meta',s:[26]},dir:1,ri:['I2'],
  f:'número de centros operando',u:'puntos',rel:['A3','F1'],um:UM,ex:'EXP-01',sm:'SIM-01 · capacidad de acopio (t/sem)'},
 // ---------- 02 · Crecimiento poblacional
 {id:'B1',p:'B',n:'Densidad poblacional por UPZ',b:{v:'90 a 434 hab/ha · promedio local ≈ 269 hab/ha',u:'hab/ha',a:'2024',s:[4,25],t:'real'},loc:{v:'Más densa: Patio Bonito (434) y Calandaima (426). Menos densa: Tintal Norte (90) y Bavaria (150).',t:'real',s:[25]},
  c:'Hacer coincidir la concentración de población con servicios y soporte ecológico; no se busca bajar la densidad.',m:{v:'Ninguna UPZ con densidad superior al promedio queda bajo la meta de acceso F1',t:'meta',nota:'regla de diseño, pendiente de validación'},dir:0,ri:['I8','I1'],
  f:'población proyectada de la UPZ ÷ área de la UPZ',u:'hab/ha',rel:['F1','B4','X2'],um:UM,ex:'EXP-02',sm:'SIM-01 · estrés «crecimiento poblacional (+2 %/año)»'},
 {id:'B2',p:'B',n:'Variación de la población por UPZ',b:{v:'+0,26 % en Kennedy (2023 → 2024); crecen Calandaima (+1,22 %), Las Margaritas (+1,19 %), Tintal Norte (+1,02 %) y Bavaria (+0,90 %)',u:'%',a:'2023–2024',s:[25],t:'calc'},loc:{v:'El crecimiento proyectado se concentra en el borde occidental y en la UPZ 113, donde está el predio',t:'calc'},
  c:'Anticipar la demanda donde crece la población, con servicios ya instalados antes de que llegue.',m:MP(),dir:0,ri:['I8','I1','I7'],
  f:'(población año t − población año t−1) ÷ población año t−1 × 100, por UPZ',u:'%',rel:['B1','C1','E1','X2'],um:UM,ex:'EXP-02',sm:'—',
  nota:'Son proyecciones de la SDP, no dos censos. La serie 1.035.224 (2023) y 1.037.929 (2024) viene de dos estimaciones distintas.'},
 {id:'B3',p:'B',n:'Capacidad de los equipamientos frente a la población atendida',b:{v:'Línea base pendiente de cálculo',t:'lb'},loc:LB,
  c:'Que la capacidad de cada equipamiento crezca con la población de su área de servicio.',m:MP(),dir:1,ri:['I8','I1'],
  f:'cupos o m² disponibles ÷ población del área de servicio',u:'cupos/1.000 hab',rel:['F5','F4','B1'],um:UM,ex:'EXP-02',sm:'SIM-01 · población de la zona de servicio'},
 {id:'B4',p:'B',n:'Personas con una plaza a 500 m o menos',b:{v:'≈ 234.000',n:234000,u:'personas',a:'2024',s:[4,18],t:'calc',nota:'proporcional a edificios residenciales'},loc:{v:'Ver lectura espacial por UPZ',t:'calc'},
  c:'Sumar plazas en la malla en vez de agrandar una central.',m:{v:'≈ 987.000 con la malla completa',n:987000,t:'meta',nota:'estimación geométrica de la propuesta, no simulación',s:[26]},dir:1,ri:['I1'],
  f:'población × porcentaje de viviendas con plaza a ≤ 500 m',u:'personas',rel:['F1','B1'],um:UM,ex:'EXP-02',sm:'—'},
 // ---------- 03 · Valorización del suelo
 {id:'C1',p:'C',n:'Variación del valor catastral',b:{v:'+33,4 % (60,197 → 80,310 billones de pesos)',n:33.4,u:'%',a:'2022 → 2026',s:[5],t:'calc'},loc:{v:'Distribución por sector: línea base pendiente de cálculo (Catastro por manzana)',t:'lb'},
  c:'Leer el valor monetario como una dimensión más, no como el criterio que decide la transformación.',m:{v:'Se monitorea; no se fija meta de aumento ni de disminución',t:'val'},dir:0,ri:['I5','I7'],
  f:'(valor catastral año t − valor 2022) ÷ valor 2022 × 100, por sector',u:'%',rel:['D1','B2','X2'],um:UM,ex:'EXP-03',sm:'SIM-01 · estrés «revocación de baldíos por valorización (año 5)»',
  nota:'Incluye suelo y construcciones. No equivale al precio comercial del suelo.'},
 {id:'C2',p:'C',n:'Suelo con función ecológica, productiva o comunitaria protegida',b:{v:'0 ha fuera del mercado en el predio',n:0,u:'ha',t:'val'},loc:{v:'Predio de Bavaria, UPZ 113',t:'real'},
  c:'Proteger la función del suelo independientemente de su precio.',m:{v:'71,2 ha',n:71.2,t:'meta',s:[26]},dir:1,ri:['I5','I7'],
  f:'hectáreas con uso protegido por acuerdo o norma',u:'ha',rel:['D3','X2','F5'],um:UM,ex:'EXP-03',sm:'—'},
 {id:'C3',p:'C',n:'Valoración ecológica del territorio',b:{v:'Línea base pendiente de cálculo',t:'lb'},loc:LB,
  c:'Incorporar conectividad, diversidad y funciones ecosistémicas al valor del suelo.',m:MP(),dir:1,ri:['I7','I3'],
  f:'índice compuesto de X1 (Shannon), X4 (conectividad) y X8–X10 (ciclos); ponderación pendiente de validación',u:'índice 0–1',rel:['X1','X4','X8'],um:UM,ex:'EXP-03',sm:'SIM-03 · G15 (conectividad)'},
 {id:'C4',p:'C',n:'Accesibilidad a servicios como valor funcional',b:{v:'22,5 % de las viviendas a ≤ 500 m de una plaza',n:22.5,u:'%',a:'2026',s:[18],t:'calc'},loc:{v:'Ver F1 y la lectura espacial por UPZ',t:'calc'},
  c:'Contar la cercanía a servicios como valor del territorio, no como plusvalía.',m:{v:'Ver F1',t:'val'},dir:1,ri:['I1','I8'],
  f:'igual que F1',u:'%',rel:['F1','C1'],um:UM,ex:'EXP-03',sm:'—'},
 // ---------- 04 · Especulación inmobiliaria
 {id:'D1',p:'D',n:'Variación anual del precio de oferta a menos de 1 km del metro',b:{v:'≈ 12 % frente a ≈ 5 % en el resto de Bogotá',n:12,u:'%/año',a:'último año (2026)',s:[9],t:'real'},loc:{v:'Franja de 1 km alrededor de la Primera Línea del Metro; ≈ $3,7 millones/m² en Bosa y Kennedy',t:'real',s:[9]},
  c:'Detectar presión sobre los usos existentes, sin leerla como prueba de especulación.',m:{v:'Se monitorea; indicador indirecto de presión',t:'val'},dir:0,ri:['I5','I6'],
  f:'(precio de oferta por m² año t − año t−1) ÷ año t−1 × 100, a ≤ 1 km del trazado y del predio frente al resto de Kennedy',u:'%/año',rel:['C1','D5','B2'],um:UM,ex:'EXP-04',sm:'—',
  nota:'Fincaraiz mide avisos publicados, no transacciones registradas.'},
 {id:'D2',p:'D',n:'Barrios de Kennedy con aumento del precio por m²',b:{v:'12 de 18 barrios',u:'barrios',a:'2.º trim. 2024 vs 2023',s:[10],t:'real'},loc:{v:'18 barrios analizados por Properati; diferencias entre sectores (UNAL)',t:'real',s:[6,10]},
  c:'Identificar dónde la presión es mayor para priorizar la protección de usos.',m:{v:'Se monitorea',t:'val'},dir:0,ri:['I5','I6'],
  f:'barrios con variación positiva ÷ barrios analizados',u:'barrios',rel:['D1','C1'],um:UM,ex:'EXP-04',sm:'—'},
 {id:'D3',p:'D',n:'Superficie con usos comunitarios y productivos protegidos',b:{v:'Kennedy: línea base pendiente de cálculo',t:'lb'},loc:{v:'Predio de Bavaria: naves recuperadas',t:'meta'},
  c:'Disminuir la vulnerabilidad de las actividades comunitarias, productivas y ecológicas.',m:{v:'121.436 m² de huella en las naves recuperadas',n:121436,t:'meta',s:[26]},dir:1,ri:['I5','I6','I8'],
  f:'m² con uso comunitario o productivo protegido',u:'m²',rel:['C2','F5'],um:UM,ex:'EXP-04',sm:'—'},
 {id:'D4',p:'D',n:'Cambios de uso del suelo',b:{v:'73,2 % residencial · 23,9 % comercio · 2,1 % dotacional (por número de edificios)',u:'% de edificios',a:'2026',s:[18],t:'calc'},loc:{v:'36 polígonos de obra en OpenStreetMap a lo largo de la Línea 1 (contexto.json); serie temporal pendiente',t:'lb'},
  c:'Evitar que el suelo productivo y comunitario se convierta en suelo de renta.',m:MP(),dir:0,ri:['I5','I6'],
  f:'edificios o m² que cambian de uso entre t−1 y t ÷ total × 100, por tipo de cambio',u:'%',rel:['D3','A2','X2'],um:UM,ex:'EXP-04',sm:'—'},
 {id:'D5',p:'D',n:'Hogares potencialmente expuestos al desplazamiento',b:{v:'Línea base pendiente de cálculo',t:'lb'},loc:LB,
  c:'Que la transformación no expulse a quienes hoy habitan y producen.',m:MP(),dir:-1,ri:['I6','I5'],
  f:'hogares arrendatarios en zonas con D1 por encima del promedio × factor de carga del arriendo (metodología pendiente)',u:'hogares',rel:['D1','B2'],um:UM,ex:'EXP-04',sm:'—'},
 {id:'D6',p:'D',n:'Viviendas en torre previstas en el predio',b:{v:'> 14.000 (decreto vigente)',n:14000,u:'viviendas',t:'real',nota:'según la propuesta'},loc:{v:'Predio de Bavaria, UPZ 113',t:'real'},
  c:'Sacar el predio del mercado de suelo: sin lotes ni derechos de edificación transables.',m:{v:'0',n:0,t:'meta',s:[26]},dir:-1,ri:['I5'],
  f:'viviendas en torre aprobadas en el predio',u:'viviendas',rel:['C2','B2'],um:UM,ex:'EXP-04',sm:'—'},
 // ---------- 05 · Residuos
 {id:'E1',p:'E',n:'Residuos generados en Kennedy',b:{v:'Línea base pendiente de cálculo',t:'lb',nota:'las 820 t recogidas en 2025–2026 no son la generación total'},loc:LB,
  c:'Conocer la generación para dimensionar la capacidad de aprovechamiento.',m:MP(),dir:0,ri:['I4'],
  f:'toneladas generadas por día, por sector',u:'t/día',rel:['B1','E6'],um:UM,ex:'EXP-05',sm:'SIM-02 · generación de orgánicos'},
 {id:'E2',p:'E',n:'Puntos críticos de acumulación',b:{v:'77 (mayo de 2023) · 18 atendidos y 820 t recogidas (2025–2026)',n:77,u:'puntos',a:'2023',s:[7,8],t:'real'},loc:{v:'Se concentran junto al río Bogotá (operativo de 51 t en Patio Bonito); puntos sin georreferenciar en el repositorio',t:'val'},
  c:'Reducir la acumulación en el espacio público.',m:MP(),dir:-1,ri:['I4','I1'],
  f:'número de puntos críticos activos, con una metodología única de conteo',u:'puntos',rel:['E3','X8'],um:{v:'Residuos acumulados más de 48 h (lixiviados)',t:'val'},ex:'EXP-05',sm:'—',
  nota:'77 y 18 no son una serie comparable para calcular reducción.'},
 {id:'E3',p:'E',n:'Orgánicos tratados cerca de su origen',b:{v:'0 t/día',n:0,u:'t/día',t:'val'},loc:{v:'Estaciones Circulares y compostaje del predio, que además recibe 5 t/día de Corabastos',t:'meta'},
  c:'Aumentar la capacidad territorial de aprovechamiento de orgánicos.',m:{v:'14,9 t/día',n:14.9,t:'meta',s:[26]},dir:1,ri:['I4','I1'],
  f:'toneladas de orgánicos que entran a compostaje por día',u:'t/día',rel:['E4','A2','F1'],um:{v:'Ocupación de la estación > 100 % (SIM-02, G12)',t:'val'},ex:'EXP-05',sm:'SIM-02 · G8 (orgánicos desviados)'},
 {id:'E4',p:'E',n:'Compost reincorporado a los ciclos productivos',b:{v:'0 t/día',n:0,u:'t/día',t:'val'},loc:{v:'Huertas cercanas a cada estación y distrito de hongos',t:'meta'},
  c:'Cerrar el ciclo alimento → residuo → suelo.',m:{v:'5,9 t/día (40 % de la masa, estimado)',n:5.9,t:'meta',s:[26]},dir:1,ri:['I4','I3'],
  f:'toneladas de compost entregadas a huertas y al distrito de hongos por día',u:'t/día',rel:['A2','X10'],um:UM,ex:'EXP-05',sm:'SIM-02 · G9 (compost producido y devuelto)'},
 {id:'E5',p:'E',n:'Separación en la fuente en la UPZ 113',b:{v:'Línea base pendiente de cálculo',t:'lb'},loc:{v:'UPZ 113 Bavaria',t:'real'},
  c:'Que los orgánicos lleguen limpios a las estaciones.',m:{v:'60 %',n:60,t:'meta',s:[26]},dir:1,ri:['I4','I6'],
  f:'toneladas separadas en la fuente ÷ toneladas generadas × 100',u:'%',rel:['E3','E6'],um:UM,ex:'EXP-05',sm:'SIM-02 · fracción desviada'},
 {id:'E6',p:'E',n:'Porcentaje de aprovechamiento',b:{v:'Línea base pendiente de cálculo',t:'lb',nota:'no hay cifra pública de orgánicos aprovechados en Kennedy'},loc:LB,
  c:'Que lo aprovechado crezca más rápido que lo generado.',m:MP(),dir:1,ri:['I4'],
  f:'toneladas aprovechadas ÷ toneladas generadas × 100',u:'%',rel:['E1','E3'],um:UM,ex:'EXP-05',sm:'SIM-02 · G10 (personas cuyo residuo se aprovecha)'},
 // ---------- 06 · Centralización de servicios
 {id:'F1',p:'F',n:'Viviendas a 500 m o menos de una plaza (6 a 7 minutos a pie)',b:{v:'22,5 %',n:22.5,u:'%',a:'2026',s:[18],t:'calc'},loc:{v:'De 0 % en Carvajal y Las Margaritas a 81,8 % en Bavaria (muestra por UPZ)',t:'calc'},
  c:'Redistribuir el abasto de proximidad según la demanda poblacional y los déficits de accesibilidad.',m:{v:'75 %',n:75,t:'meta',nota:'meta preliminar de diseño, pendiente de validación; la estimación geométrica de la malla completa da 95,1 % (cálculo propio, no simulación)'},dir:1,ri:['I1','I8'],
  f:'viviendas con una plaza a ≤ 500 m por la red peatonal ÷ total de viviendas × 100',u:'%',rel:['B1','B4','C1','A4'],um:UM,ex:'EXP-06',sm:'Estimación geométrica en propuesta.html (no es simulación)'},
 {id:'F2',p:'F',n:'Viviendas a 1.000 m o menos de una plaza (≈ 12 a 15 minutos a pie)',b:{v:'63,0 %',n:63,u:'%',a:'2026',s:[18],t:'calc'},loc:{v:'Ver lectura espacial por UPZ',t:'calc'},
  c:'Que nadie dependa de un viaje largo para el abasto básico.',m:MP(),dir:1,ri:['I1'],
  f:'viviendas con una plaza a ≤ 1.000 m ÷ total de viviendas × 100',u:'%',rel:['F1','B1'],um:UM,ex:'EXP-06',sm:'—',
  nota:'El 28 % a 15 min del guion (SDP 2022) no tiene URL verificable; se usa el cálculo propio, que sí la tiene.'},
 {id:'F3',p:'F',n:'Distancia mediana a la plaza más cercana',b:{v:'832 m',n:832,u:'m',a:'2026',s:[18],t:'calc'},loc:{v:'De 257 m (Bavaria) a 1.592 m (Carvajal) en la muestra',t:'calc'},
  c:'Acortar el recorrido cotidiano al abasto.',m:{v:'Pendiente de validación · estimación geométrica 317 m',t:'val'},dir:-1,ri:['I1'],
  f:'mediana de la distancia por red de cada vivienda a la plaza más cercana',u:'m',rel:['F1','F2'],um:UM,ex:'EXP-06',sm:'—'},
 {id:'F4',p:'F',n:'Habitantes por plaza de mercado',b:{v:'≈ 79.800 (1.037.929 ÷ 13)',n:79800,u:'hab/plaza',a:'2024',s:[4,18],t:'calc'},loc:{v:'Sin plaza: Las Margaritas, Gran Britalia y Carvajal (en el registro usado)',t:'calc'},
  c:'Repartir la capacidad de abasto entre más nodos.',m:{v:'≈ 32.400 con 32 plazas',n:32400,t:'meta',nota:'estimación de la propuesta',s:[26]},dir:-1,ri:['I1'],
  f:'población ÷ número de plazas operando',u:'hab/plaza',rel:['B3','A4'],um:UM,ex:'EXP-06',sm:'—'},
 {id:'F5',p:'F',n:'Oferta de equipamientos y capacidad por habitante',b:{v:'185 colegios no oficiales · 42 oficiales · 79 unidades SDIS · 17 IPS públicas · 5 comisarías',u:'equipamientos',a:'2023–2024',s:[3,4],t:'real'},loc:{v:'Distribución espacial: línea base pendiente de cálculo',t:'lb'},
  c:'Medir la capacidad disponible por habitante y no solo el número de equipamientos.',m:MP(),dir:1,ri:['I8','I4'],
  f:'capacidad (cupos o m²) por cada 1.000 habitantes, por UPZ',u:'cupos/1.000 hab',rel:['B3','B1'],um:UM,ex:'EXP-06',sm:'—',
  nota:'Estas cifras describen la oferta; por sí solas no demuestran concentración espacial.'},
 {id:'F6',p:'F',n:'Cobertura bruta educativa',b:{v:'94,2 % (Bogotá: 99,1 %)',n:94.2,u:'%',a:'2022',s:[3],t:'real'},loc:{v:'Dato agregado de la localidad',t:'real'},
  c:'Se mantiene como contexto: la propuesta no interviene directamente la oferta educativa; los colegios entran como sede de huertas.',m:{v:'Pendiente de validación',t:'val'},dir:0,ri:['I3'],
  f:'matrícula total ÷ población en edad escolar × 100',u:'%',rel:['A2','F5'],um:UM,ex:'EXP-06',sm:'—',
  nota:'No confundir cobertura bruta con porcentaje de niños residentes escolarizados.'},
 // ---------- evaluación ecocéntrica transversal
 {id:'X1',p:'X',n:'Diversidad de especies · índice de Shannon',b:LB,loc:LB,
  c:'Mantener o aumentar la diversidad donde se interviene.',m:MP(),dir:1,ri:['I7','I3'],
  f:"H' = − Σ pᵢ · ln pᵢ (pᵢ: proporción de individuos de la especie i en el muestreo)",u:'adimensional',rel:['C3','B2','A2'],um:UM,ex:'EXP-03',sm:'—',soc:'La diversidad baja donde crece la ocupación del borde (B) y donde la valorización elimina lotes con vegetación (C).'},
 {id:'X2',p:'X',n:'Cantidad y superficie de parches ecológicos',b:{v:'Línea base pendiente de cálculo',t:'lb',nota:'la capa agua.json tiene 12 polígonos de humedal de dos fuentes superpuestas: requiere depuración'},loc:{v:'Humedales La Vaca, El Burro y Techo; Lago Timiza; Pondaje La Magdalena; río Bogotá',t:'real'},
  c:'No perder parches y aumentar su superficie efectiva.',m:MP(),dir:1,ri:['I7','I3'],
  f:'n.º de parches y Σ área (ha), por tipo de cobertura',u:'n.º y ha',rel:['B1','D4','C1'],um:UM,ex:'EXP-03',sm:'SIM-03 · parches de hábitat',soc:'Los parches compiten con la demanda de suelo en las UPZ que más crecen y con los cambios de uso (D4).'},
 {id:'X3',p:'X',n:'Continuidad de corredores',b:LB,loc:LB,
  c:'Conectar los parches con corredores sin interrupciones.',m:MP(),dir:1,ri:['I7','I3'],
  f:'longitud continua del corredor ÷ longitud total trazada × 100',u:'%',rel:['X4','F1'],um:UM,ex:'EXP-03',sm:'SIM-03 · escenario C «corredores»',soc:'Los corredores cruzan calles con tráfico de abasto: dependen de cómo se reorganice la logística (A, F).'},
 {id:'X4',p:'X',n:'Conectividad funcional entre hábitats',b:LB,loc:LB,
  c:'Que las especies focales puedan moverse entre parches.',m:MP(),dir:1,ri:['I7','I3'],
  f:'parches con un vecino a menos del alcance de dispersión α ÷ total de parches',u:'%',rel:['X2','X3','C3'],um:UM,ex:'EXP-03',sm:'SIM-03 · G15 (conectividad)',soc:'La ubicación de huertas la decide la asamblea con un mapa común; sin criterio, la conectividad no mejora.'},
 {id:'X5',p:'X',n:'Seguimiento de especies focales',b:{v:'Línea base pendiente de cálculo',t:'lb',nota:'el simulador 3D usa garza, tingua y copetón; la selección está pendiente de validación'},loc:{v:'Humedales y borde del predio',t:'val'},
  c:'Seguir especies que dependen del borde del humedal y de la conectividad.',m:MP(),dir:1,ri:['I7'],
  f:'parches ocupados por la especie ÷ parches disponibles × 100',u:'%',rel:['X4','X7'],um:UM,ex:'EXP-03',sm:'SIM-03 · G13 (ocupación por especie)',soc:'Vidrio y luz de los edificios nuevos pueden convertir el hábitat en trampa (G16).'},
 {id:'X6',p:'X',n:'Interacciones bióticas',b:LB,loc:LB,
  c:'Que las huertas y corredores sostengan polinización, dispersión de semillas y control biológico.',m:MP(),dir:1,ri:['I3','I7'],
  f:'n.º de interacciones distintas registradas (planta–polinizador, ave–planta) por parche',u:'interacciones',rel:['X1','A2'],um:UM,ex:'EXP-03',sm:'—',soc:'La polinización también sostiene la producción de las huertas (A2).'},
 {id:'X7',p:'X',n:'Persistencia de especies',b:LB,loc:LB,
  c:'Que ninguna especie focal desaparezca en el horizonte de la simulación.',m:MP(),dir:1,ri:['I7'],
  f:'especies focales con ocupación > 0 al final del horizonte',u:'especies',rel:['X5','X4'],um:{v:'Extinción local de una especie focal',t:'val'},ex:'EXP-03',sm:'SIM-03 · especies que persisten a 10 años',soc:'La persistencia depende de la presión sobre el humedal, que sube con la actividad del borde (B, C).'},
 {id:'X8',p:'X',n:'Ciclo del agua',b:LB,loc:{v:'Cuencas de los humedales y canales; presión sobre el humedal',t:'val'},
  c:'Aumentar infiltración y retención; bajar la presión sobre el humedal.',m:MP(),dir:1,ri:['I7','I3'],
  f:'balance: precipitación − escorrentía − evapotranspiración (m³/año); presión sobre el humedal (índice 0–100)',u:'m³/año · índice',rel:['E2','X2'],um:UM,ex:'EXP-03',sm:'SIM-03 · G14 (presión sobre el humedal)',soc:'Los residuos acumulados contaminan canales en lluvia (E2) y el riego de huertas aumenta la demanda (A2).'},
 {id:'X9',p:'X',n:'Ciclo del carbono',b:LB,loc:LB,
  c:'Que el balance de carbono de la propuesta sea mejor que el escenario sin propuesta.',m:MP(),dir:1,ri:['I8','I7','I4'],
  f:'carbono capturado en biomasa y suelo − emisiones de transporte, construcción y disposición (t CO₂e/año)',u:'t CO₂e/año',rel:['A3','E3','F3'],um:UM,ex:'EXP-03',sm:'—',soc:'Menos viajes al mayorista (A, F) y reutilizar las naves (D) bajan emisiones; construir nuevo las sube.'},
 {id:'X10',p:'X',n:'Ciclo de nutrientes',b:LB,loc:LB,
  c:'Devolver al suelo los nutrientes que hoy salen del barrio como residuo.',m:MP(),dir:1,ri:['I4','I3'],
  f:'nitrógeno, fósforo y potasio recirculados con el compost ÷ nutrientes contenidos en los orgánicos generados (t/año)',u:'t/año · %',rel:['E4','A2'],um:UM,ex:'EXP-03',sm:'SIM-02 · R4 (suelo vivo)',soc:'Depende de la separación en la fuente (E5) y de que el compost llegue a las huertas (E4).'}];
const byI={};IND.forEach(i=>byI[i.id]=i);

/* ---------- experimentos (6 × sin / con propuesta = 12 simulaciones, 15 años) ---------- */
const EXP=[
 {id:'EXP-01',p:'A',t:'Autonomía alimentaria y nodos de abastecimiento'},
 {id:'EXP-02',p:'B',t:'Población, servicios y soporte ecológico por sector'},
 {id:'EXP-03',p:'C',t:'Valor monetario frente a valor ecológico y funcional'},
 {id:'EXP-04',p:'D',t:'Presión inmobiliaria sobre usos comunitarios y productivos'},
 {id:'EXP-05',p:'E',t:'Aprovechamiento de orgánicos y acumulación'},
 {id:'EXP-06',p:'F',t:'Redistribución de servicios y accesibilidad'}];
const HORIZ=15;
let SIMR=null; // resultados: {experimentos:[{id, sin:{ID:[v0..v15]}, con:{…}}]}
const serie=(id,esc)=>{if(!SIMR)return null;const i=byI[id],e=(SIMR.experimentos||[]).find(x=>x.id===i.ex);const s=e&&e[esc]&&e[esc][id];return Array.isArray(s)&&s.length&&s.every(v=>typeof v==='number')?s:null};
function evalua(i){const s0=serie(i.id,'sin'),s1=serie(i.id,'con');if(!s0||!s1)return null;
 const a=s0[s0.length-1],b=s1[s1.length-1],d=b-a,dp=a!==0?d/Math.abs(a)*100:null;let cu=null;
 const b0=i.b&&typeof i.b.n==='number'?i.b.n:s1[0],mt=i.m&&typeof i.m.n==='number'?i.m.n:null;
 if(mt!==null&&mt!==b0)cu=Math.max(0,Math.min(1.5,(b-b0)/(mt-b0)));
 return {a,b,d,dp,cu}}

/* ---------- datos espaciales por UPZ (cálculo propio) ----------
   [cód, nombre, población 2023, población 2024, ha, hab/ha, muestra de edificios residenciales, % ≤500 m hoy, % ≤1.000 m hoy,
    % ≤500 m con la malla, mediana hoy (m), mediana con la malla (m), plazas hoy, plazas nuevas de la malla]
   Población y área: upz.json [25]. Acceso: muestra de 4.200 edificios residenciales de analisis.js (map.res), asignada a la UPZ
   por punto en polígono. Las plazas son las del registro IPES + OpenStreetMap usado en la propuesta [18]. */
const UPZ=[["83","Las Margaritas",32008,32390,147.2,220,68,0,0,88.2,1479,377,0,1],["81","Gran Britalia",62139,62111,179.9,345,826,18.9,55.7,99.4,940,300,0,3],["82","Patio Bonito",137776,137724,317.3,434,529,27.8,82,96.4,707,285,1,2],["45","Carvajal",88914,88878,438.6,203,386,0,4.9,92.7,1592,334,0,2],["80","Corabastos",56102,56072,184.5,304,454,13.4,84.4,96,706,365,1,2],["79","Calandaima",134340,135976,318.9,426,91,58.2,100,89,455,347,1,0],["47","Kennedy Central",92968,92927,337.2,276,852,18.2,70.8,95.2,793,322,1,3],["48","Timiza",139473,139367,430.4,324,364,50.5,53,92,484,302,1,2],["113","Bavaria",41086,41456,277.2,150,33,81.8,100,81.8,257,257,3,0],["44","Américas",78380,78326,381,206,396,33.3,66.4,94.7,761,319,2,3],["46","Castilla",141571,141924,503.2,282,201,31.8,91.5,93,672,332,1,1],["78","Tintal Norte",30467,30778,343.4,90,0,null,null,null,null,null,2,0]];
const DMED=269,MMIN=100; // densidad promedio local (hab/ha) · muestra mínima para leer la UPZ sin advertencia

const CRUCES=[
 ['Densidad poblacional × cobertura de servicios','calc','Densidad por UPZ [25] cruzada con el acceso a plazas de la muestra [18]. Las UPZ densas con baja cobertura son prioritarias.'],
 ['Accesibilidad a mercados × distribución poblacional','calc','Mismo cruce, con el tamaño de cada UPZ según su población: muestra cuántas personas quedan lejos, no solo qué porcentaje.'],
 ['Valorización del suelo × presión inmobiliaria','lb','Catastro publica el agregado de Kennedy [5] y Fincaraiz la franja de 1 km del metro [9]; falta el valor por manzana y el precio de oferta por sector para cruzarlos.'],
 ['Generación de residuos × capacidad de aprovechamiento','lb','Los 77 puntos críticos [7] no están georreferenciados en el repositorio y no hay capacidad instalada de aprovechamiento por sector.'],
 ['Transformación del suelo × fragmentación ecológica','lb','Hay humedales (agua.json) y obras de OpenStreetMap a lo largo de la Línea 1; falta una capa de cobertura vegetal comparable en el tiempo.'],
 ['Actividades productivas × demanda alimentaria','lb','Solo hay una huerta registrada en el repositorio (Vive Vibra Verde, Carvajal Osorio) y no hay demanda alimentaria por sector.']];

/* ---------- utilidades de pintura ---------- */
const chipsP=(arr)=>arr.map(k=>'<span class="cpq" style="--c:'+pc(k)+'">'+NUM[k]+' · '+pt(k)+'</span>').join('');
const intName=k=>INT[k]?INT[k].t:k;
const relLinks=arr=>(arr||[]).map(id=>byI[id]?'<button type="button" class="crel" data-ir="'+id+'" style="--c:'+pc(byI[id].p)+'" title="'+byI[id].n.replace(/"/g,'')+'">'+id+'</button>':'').join('');
function cellBase(i){const b=i.b;return val(b.v,b.t)+(b.a?'<em class="cyr">'+b.a+'</em>':'')+cite(b.s)}
function cellMeta(i){const m=i.m;return val(m.v,m.t)+cite(m.s)}

function miniChart(i){
 const W=420,H=150,l=34,r=12,t=14,b=24,s0=serie(i.id,'sin'),s1=serie(i.id,'con'),b0=i.b&&typeof i.b.n==='number'?i.b.n:null,mt=i.m&&typeof i.m.n==='number'?i.m.n:null;
 const vals=[b0,mt].concat(s0||[],s1||[]).filter(v=>typeof v==='number');
 let s='<svg viewBox="0 0 '+W+' '+H+'" class="cch" role="img" aria-label="Evolución de '+i.n.replace(/"/g,'')+' en 15 años">';
 const X=k=>l+k*(W-l-r)/HORIZ;
 for(let k=0;k<=HORIZ;k+=5)s+='<line class="g" x1="'+X(k)+'" x2="'+X(k)+'" y1="'+t+'" y2="'+(H-b)+'"/><text class="ax" x="'+X(k)+'" y="'+(H-8)+'" text-anchor="'+(k===HORIZ?'end':k?'middle':'start')+'">año '+k+'</text>';
 if(!vals.length){s+='<rect class="hatch" x="'+l+'" y="'+t+'" width="'+(W-l-r)+'" height="'+(H-t-b)+'"/><text class="pend" x="'+(W/2+l/2)+'" y="'+(H/2)+'" text-anchor="middle">Línea base pendiente de cálculo · Pendiente de simulación</text></svg>';return s}
 let lo=Math.min(...vals),hi=Math.max(...vals);if(lo===hi){lo=lo-Math.max(1,Math.abs(lo)*.2);hi=hi+Math.max(1,Math.abs(hi)*.2)}const pad=(hi-lo)*.15;lo-=pad;hi+=pad;if(lo<0&&Math.min(...vals)>=0)lo=0;
 const Y=v=>t+(1-(v-lo)/(hi-lo))*(H-t-b);
 [lo,(lo+hi)/2,hi].forEach(v=>{s+='<text class="ax" x="'+(l-6)+'" y="'+(Y(v)+3)+'" text-anchor="end">'+fmt(v,Math.abs(hi-lo)<10?1:0)+'</text>'});
 if(!s0||!s1)s+='<rect class="hatch" x="'+(X(0)+6)+'" y="'+t+'" width="'+(W-l-r-6)+'" height="'+(H-t-b)+'"/><text class="pend" x="'+(W/2+l/2)+'" y="'+((t+H-b)/2+4)+'" text-anchor="middle">Pendiente de simulación</text>';
 if(mt!==null)s+='<line class="mt" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(mt)+'" y2="'+Y(mt)+'"/><text class="mtx" x="'+(W-r)+'" y="'+(Y(mt)-5)+'" text-anchor="end">meta '+fmt(mt,mt%1?1:0)+'</text>';
 const path=a=>a.map((v,k)=>(k?'L':'M')+X(k).toFixed(1)+' '+Y(v).toFixed(1)).join('');
 if(s0)s+='<path class="s0" d="'+path(s0)+'"/>';if(s1)s+='<path class="s1" d="'+path(s1)+'"/>';
 if(b0!==null)s+='<circle class="b0 b0-'+i.b.t+'" cx="'+X(0)+'" cy="'+Y(b0)+'" r="4.5"/>';
 return s+'</svg>'}

function detalle(i){
 const ev=evalua(i),pend=tag('sim');
 const pr=k=>'<button type="button" class="cint" data-int="'+k+'">'+intName(k)+'</button>';
 return '<div class="cdt">'+
  '<div class="cdg"><div><h5>Diagnóstico</h5><p>'+cellBase(i)+(i.b.u?' <span class="cu">'+i.b.u+'</span>':'')+'</p>'+(i.b.nota?'<p class="cnota">'+i.b.nota+'</p>':'')+(i.nota?'<p class="cnota">'+i.nota+'</p>':'')+
  '<h5>Distribución espacial</h5><p>'+val(i.loc.v,i.loc.t)+cite(i.loc.s)+'</p></div>'+
  '<div><h5>Criterio de diseño</h5><p>'+i.c+'</p><h5>Meta de diseño</h5><p>'+cellMeta(i)+'</p>'+(i.m.nota?'<p class="cnota">'+i.m.nota+'</p>':'')+
  '<h5>Respuesta urbano-arquitectónica</h5><p class="cints">'+i.ri.map(pr).join('')+'</p></div>'+
  '<div><h5>Indicador de comprobación</h5><p class="cform">'+i.f+'</p><p><span class="cu">'+i.u+'</span> · '+(i.dir>0?'debe subir':i.dir<0?'debe bajar':'se monitorea')+'</p>'+
  '<h5>Relaciones sistémicas</h5><p>'+relLinks(i.rel)+'</p>'+(i.soc?'<p class="cnota">'+i.soc+'</p>':'')+
  '<h5>En el modelo de esta página</h5><p class="cnota">'+i.sm+'</p></div></div>'+
  '<div class="csim"><div class="csh"><b>'+i.ex+'</b> · sin propuesta frente a con propuesta · mismas condiciones externas · '+HORIZ+' años</div>'+miniChart(i)+
  '<div class="cley"><span class="l-b">valor inicial</span><span class="l-0">sin propuesta</span><span class="l-1">con propuesta</span><span class="l-m">meta</span></div>'+
  '<dl class="ckv">'+
   '<div><dt>Valor inicial</dt><dd>'+val(i.b.v,i.b.t)+'</dd></div>'+
   '<div><dt>Sin propuesta · año '+HORIZ+'</dt><dd>'+(ev?val(fmt(ev.a,1),'res'):pend)+'</dd></div>'+
   '<div><dt>Con propuesta · año '+HORIZ+'</dt><dd>'+(ev?val(fmt(ev.b,1),'res'):pend)+'</dd></div>'+
   '<div><dt>Diferencia absoluta</dt><dd>'+(ev?val((ev.d>0?'+':'')+fmt(ev.d,1)+' '+i.u,'res'):pend)+'</dd></div>'+
   '<div><dt>Diferencia porcentual</dt><dd>'+(ev&&ev.dp!==null&&i.u!=='%'?val((ev.dp>0?'+':'')+fmt(ev.dp,1)+' %','res'):ev&&i.u==='%'?val('no aplica: el indicador ya es un porcentaje','res'):pend)+'</dd></div>'+
   '<div><dt>Meta de diseño</dt><dd>'+val(i.m.v,i.m.t)+'</dd></div>'+
   '<div><dt>Grado de cumplimiento</dt><dd>'+(ev&&ev.cu!==null?val(fmt(ev.cu*100,0)+' %','res'):pend)+'</dd></div>'+
   '<div><dt>Umbral crítico · Game Over</dt><dd>'+val(i.um.v,i.um.t)+'</dd></div>'+
  '</dl></div></div>'}

const COLS=['Problema','Indicador','Línea base','Localización territorial','Criterio de diseño','Meta cuantitativa','Estrategia urbano-arquitectónica','Fórmula de comprobación','Unidad','Indicadores relacionados','Resultado sin propuesta','Resultado con propuesta','Cumplimiento de la meta'];
function fila(i){const ev=evalua(i),pend=tag('sim','Pendiente de simulación');
 return '<details class="cfila" data-p="'+i.p+'" id="ci-'+i.id+'" style="--c:'+pc(i.p)+'"><summary>'+
  '<span class="c0"><b>'+i.id+'</b>'+(i.p==='X'?'Ecocéntrica':pt(i.p))+'</span>'+
  '<span class="c1">'+i.n+'</span>'+
  '<span class="c2">'+cellBase(i)+'</span>'+
  '<span class="c3">'+val(i.loc.v,i.loc.t)+'</span>'+
  '<span class="c4">'+i.c+'</span>'+
  '<span class="c5">'+cellMeta(i)+'</span>'+
  '<span class="c6">'+i.ri.map(intName).join(' · ')+'</span>'+
  '<span class="c7 cform">'+i.f+'</span>'+
  '<span class="c8">'+i.u+'</span>'+
  '<span class="c9">'+(i.rel||[]).join(' · ')+'</span>'+
  '<span class="c10">'+(ev?val(fmt(ev.a,1),'res'):pend)+'</span>'+
  '<span class="c11">'+(ev?val(fmt(ev.b,1),'res'):pend)+'</span>'+
  '<span class="c12">'+(ev&&ev.cu!==null?val(fmt(ev.cu*100,0)+' %','res'):pend)+'</span>'+
  '<i class="cx" aria-hidden="true">+</i></summary>'+detalle(i)+'</details>'}

/* ---------- lectura espacial cruzada: dispersión densidad × acceso ---------- */
function dispersion(modo){
 const W=760,H=420,l=58,r=16,t=24,b=50,X=v=>l+(v-60)/(460-60)*(W-l-r),Y=v=>t+(1-v/100)*(H-t-b),R=p=>4+Math.sqrt(p)/30;
 let s='<svg viewBox="0 0 '+W+' '+H+'" class="cdis" role="img" aria-label="Densidad poblacional frente a viviendas con plaza a 500 m o menos, por UPZ">';
 // cuadrante prioritario: densidad sobre el promedio y acceso bajo la meta preliminar
 s+='<rect class="qd" x="'+X(DMED)+'" y="'+Y(75)+'" width="'+(X(460)-X(DMED))+'" height="'+(Y(0)-Y(75))+'"/><text class="qdt" x="'+(X(460)-8)+'" y="'+(Y(0)-10)+'" text-anchor="end">más densas que el promedio y bajo la meta preliminar</text>';
 [0,25,50,75,100].forEach(v=>{s+='<line class="g" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="ax" x="'+(l-8)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+' %</text>'});
 [100,200,300,400].forEach(v=>{s+='<text class="ax" x="'+X(v)+'" y="'+(H-b+18)+'" text-anchor="middle">'+v+'</text>'});
 s+='<text class="axt" x="'+((l+W-r)/2)+'" y="'+(H-10)+'" text-anchor="middle">habitantes por hectárea (2024)</text><text class="axt" transform="translate(14 '+((t+H-b)/2)+') rotate(-90)" text-anchor="middle">viviendas con plaza a ≤ 500 m</text>';
 s+='<line class="mt" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(75)+'" y2="'+Y(75)+'"/><text class="mtx" x="'+(l+6)+'" y="'+(Y(75)-6)+'">meta preliminar 75 %</text>';
 s+='<line class="g gm" x1="'+X(DMED)+'" x2="'+X(DMED)+'" y1="'+t+'" y2="'+(H-b)+'"/><text class="ax" x="'+(X(DMED)+5)+'" y="'+(t+10)+'">promedio local ≈ 269</text>';
 UPZ.filter(u=>u[6]>0).forEach(u=>{const v0=u[7],v1=u[9],v=modo==='con'?v1:v0,x=X(u[5]),y=Y(v),pr=u[5]>DMED&&v<75,low=u[6]<MMIN;
  if(modo==='con')s+='<line class="mv" x1="'+x+'" x2="'+x+'" y1="'+Y(v0)+'" y2="'+y+'"/>';
  const rr=R(u[3]),izq=u[5]>400,dy=u[0]==='45'?-rr-4:u[0]==='83'?rr+12:4,lx=dy===4?(izq?x-rr-4:x+rr+4):x;
  s+='<g class="pu'+(pr?' pri':'')+(low?' low':'')+'" data-u="'+u[0]+'"><title>'+u[1]+' · '+u[5]+' hab/ha · hoy '+fmt(v0,1)+' % · con la malla '+fmt(v1,1)+' %</title><circle cx="'+x+'" cy="'+y+'" r="'+rr.toFixed(1)+'"/>'+(modo==='con'?'':'<text x="'+lx+'" y="'+(y+dy)+'" text-anchor="'+(dy!==4?'middle':izq?'end':'start')+'">'+u[1]+(low?' *':'')+'</text>')+'</g>'});
 return s+'</svg>'}
function tablaUPZ(){
 return '<div class="scrollx"><table class="ctab"><thead><tr><th>UPZ</th><th>Población 2024</th><th>Variación 2023–24</th><th>hab/ha</th><th>Muestra</th><th>≤ 500 m hoy</th><th>≤ 1.000 m hoy</th><th>≤ 500 m con la malla</th><th>Mediana hoy</th><th>Plazas hoy</th><th>Plazas nuevas</th></tr></thead><tbody>'+
 UPZ.slice().sort((a,b)=>b[5]-a[5]).map(u=>{const vr=(u[3]/u[2]-1)*100,pr=u[6]>0&&u[5]>DMED&&u[7]<75,low=u[6]<MMIN;
  const c=v=>v===null?'<span class="cv cv-lb">sin muestra</span>':val(fmt(v,1)+' %','calc');
  return '<tr'+(pr?' class="pri"':'')+'><td><b>'+u[1]+'</b><em>UPZ '+u[0]+'</em></td><td>'+fmt(u[3])+'</td><td>'+(vr>0?'+':'')+fmt(vr,2)+' %</td><td>'+u[5]+'</td><td>'+(u[6]?fmt(u[6])+(low?' *':''):'0')+'</td><td>'+c(u[7])+'</td><td>'+c(u[8])+'</td><td>'+c(u[9])+'</td><td>'+(u[10]===null?'—':fmt(u[10])+' m')+'</td><td>'+u[12]+'</td><td>'+u[13]+'</td></tr>'}).join('')+
 '</tbody></table></div>'}

/* ---------- red de intervenciones (intervención × problema) ---------- */
function redInt(){
 const cols=ORD.concat('X');
 return '<div class="scrollx"><table class="cint-t"><thead><tr><th>Intervención</th>'+cols.map(k=>'<th style="--c:'+pc(k)+'"><span>'+NUM[k]+'</span>'+(k==='X'?'Eco':pt(k).split(' ')[0])+'</th>').join('')+'</tr></thead><tbody>'+
  Object.keys(INT).map(k=>{const it=INT[k];return '<tr data-int="'+k+'"><th><button type="button" class="cintb" data-int="'+k+'">'+it.t+'</button></th>'+cols.map(p=>'<td>'+(it.r.includes(p)?'<i class="dot" style="--c:'+pc(p)+'" title="Responde a '+pt(p).replace(/"/g,'')+'"></i>':'')+'</td>').join('')+'</tr>'}).join('')+
 '</tbody></table></div><div class="cintd" aria-live="polite"></div>'}
function intDet(k){const it=INT[k];const ind=IND.filter(i=>i.ri.includes(k));
 return '<h4>'+it.t+'</h4><p>'+it.d+'</p><div class="cpqs">'+chipsP(it.r)+'</div>'+
  '<div class="cef"><div><h5>Efectos esperados</h5><ul>'+it.pos.map(x=>'<li class="pos">'+x+'</li>').join('')+'</ul></div><div><h5>Efectos indirectos posibles y conflictos</h5><ul>'+it.neg.map(x=>'<li class="neg">'+x+'</li>').join('')+'</ul></div></div>'+
  '<h5>Se comprueba con</h5><p>'+relLinks(ind.map(i=>i.id))+'</p><p class="cnota">Los efectos son hipótesis del macromodelo y pueden retroalimentarse: un efecto indirecto puede activar otro problema de la red. Se verifican con los indicadores, no se dan por ciertos.</p>'}

/* ---------- CSS ---------- */
const css=`
#criterios{position:relative;z-index:7;background:#050607;color:#eaefed;font-family:'Geist',ui-sans-serif,system-ui,sans-serif;border-top:1px solid rgba(214,228,222,.12);overflow:clip}
#criterios *{box-sizing:border-box}
#criterios .mw{max-width:1240px;margin:0 auto;padding:0 32px}
#criterios .blq{padding:88px 0 40px;border-bottom:1px solid rgba(214,228,222,.08)}
#criterios .ey{font:500 10.5px 'Geist Mono',ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:${MUT}}
#criterios .ey b{color:${LIM};font-weight:500}
#criterios h2,#criterios h3{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:300;text-transform:uppercase;letter-spacing:.01em;line-height:.95;margin:0;text-wrap:balance}
#criterios h2{font-size:clamp(38px,5.6vw,80px);margin:14px 0 18px}
#criterios h3{font-size:clamp(22px,2.4vw,30px);margin:0 0 10px}
#criterios h4{font:500 15px 'Geist',sans-serif;margin:0 0 8px;color:#eaefed}
#criterios h5{font:500 10px 'Geist Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:${MUT};margin:14px 0 6px}
#criterios h5:first-child{margin-top:0}
#criterios p{margin:0;color:#a9b3af;font-size:14.5px;line-height:1.6;max-width:72ch}
#criterios .lead{font-size:18px;color:#cfd6d3;max-width:64ch}
#criterios a{color:inherit}
#criterios .cb{font:500 10px 'Geist Mono',monospace;color:${MUT};text-decoration:none;margin-left:3px;vertical-align:1px}
#criterios .cb:hover{color:#eaefed}
#criterios .scrollx{overflow-x:auto;scrollbar-width:thin}
/* cadena de preguntas */
.cflujo{display:flex;flex-wrap:wrap;gap:0;margin:28px 0 8px;counter-reset:q;list-style:none;padding:0}
.cflujo li{counter-increment:q;flex:1 1 150px;padding:14px 16px 14px;border:1px solid rgba(214,228,222,.12);margin:-1px 0 0 -1px;font-size:13.5px;line-height:1.35;color:#cfd6d3;position:relative}
.cflujo li::before{content:counter(q,decimal-leading-zero);display:block;font:500 10px 'Geist Mono',monospace;color:${LIM};letter-spacing:.14em;margin-bottom:6px}
.cflujo li::after{content:'→';position:absolute;right:8px;top:12px;color:${MUT};font-size:12px}
.cflujo li:last-child::after{content:''}
/* tipos de dato */
.cleg{display:flex;flex-wrap:wrap;gap:8px 18px;margin:22px 0 0;font-size:12px;color:#a9b3af}
.cleg span{display:inline-flex;align-items:center;gap:8px}
.cv{display:inline;padding:1px 0;color:#eaefed}
.cv-real{color:#eaefed;font-weight:500}
.cv-calc{color:#eaefed;background:repeating-linear-gradient(135deg,rgba(234,239,237,.09) 0 2px,transparent 2px 5px)}
.cv-meta{color:${AMB};border-bottom:1px dashed ${AMB}}
.cv-val{color:#c5b994;font-style:italic}
.cv-lb{color:${MUT};font-style:italic}
.cv-res{color:${LIM};font-weight:500}
.ct{display:inline-block;font:500 9.5px 'Geist Mono',monospace;letter-spacing:.06em;text-transform:uppercase;padding:3px 6px;border:1px solid rgba(214,228,222,.25);color:#a9b3af;white-space:nowrap}
.ct-real{border-color:#eaefed;color:#eaefed}
.ct-calc{border-color:#eaefed;color:#eaefed;background:repeating-linear-gradient(135deg,rgba(234,239,237,.12) 0 2px,transparent 2px 5px)}
.ct-meta{border:1px dashed ${AMB};color:${AMB}}
.ct-val{border:1px dashed #c5b994;color:#c5b994}
.ct-lb{border:1px dashed ${MUT};color:${MUT}}
.ct-sim{border:1px dotted ${MUT};color:${MUT}}
.ct-res{border-color:${LIM};color:${LIM}}
/* seis problemas */
.cseis{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:30px}
.cpb{border:1px solid rgba(214,228,222,.12);padding:20px 20px 18px;position:relative;background:rgba(214,228,222,.02);display:flex;flex-direction:column;gap:2px}
.cpb::before{content:'';position:absolute;left:-1px;top:-1px;width:28px;height:2px;background:var(--c)}
.cpb .n{font:500 10px 'Geist Mono',monospace;letter-spacing:.14em;color:var(--c)}
.cpb h3{margin:6px 0 8px}
.cpb p{font-size:13.5px}
.cpb .cnota{margin-top:10px}
.cpb .ir{margin-top:auto;padding-top:14px;display:flex;gap:10px;flex-wrap:wrap}
.cbtn{font:500 12px 'Geist',sans-serif;background:none;border:1px solid rgba(214,228,222,.25);color:#eaefed;padding:8px 12px;cursor:pointer;text-decoration:none}
.cbtn:hover,.cbtn:focus-visible{border-color:var(--c,${LIM});color:var(--c,${LIM})}
.cnota{font-size:12.5px!important;color:${MUT}!important;line-height:1.5!important}
.cpqs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
.cpq{font-size:11.5px;border:1px solid var(--c);color:var(--c);padding:3px 8px}
/* matriz */
.cfil{display:flex;flex-wrap:wrap;gap:6px;margin:26px 0 14px}
.cfil button{font:500 12px 'Geist',sans-serif;background:none;border:1px solid rgba(214,228,222,.2);color:#a9b3af;padding:7px 11px;cursor:pointer}
.cfil button[aria-pressed=true]{border-color:var(--c,${LIM});color:#050607;background:var(--c,${LIM})}
.cmat{min-width:1880px}
.chead,.cfila>summary{display:grid;grid-template-columns:120px 190px 170px 170px 190px 150px 160px 210px 80px 110px 120px 120px 120px 26px;gap:0}
.chead{position:sticky;top:0;z-index:2;background:#050607;border-bottom:1px solid rgba(214,228,222,.25)}
.chead span{font:500 9.5px 'Geist Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:${MUT};padding:10px 10px}
.cfila{border-bottom:1px solid rgba(214,228,222,.08)}
.cfila>summary{list-style:none;cursor:pointer;font-size:12.5px;line-height:1.4;color:#a9b3af;position:relative}
.cfila>summary::-webkit-details-marker{display:none}
.cfila>summary>span{padding:12px 10px;border-left:1px solid rgba(214,228,222,.05)}
.cfila>summary:hover{background:rgba(214,228,222,.03)}
.cfila>summary:focus-visible{outline:1px solid var(--c);outline-offset:-1px}
.cfila .c0{border-left:2px solid var(--c)!important;color:#eaefed}
.cfila .c0 b{display:block;font:500 12px 'Geist Mono',monospace;color:var(--c);margin-bottom:2px}
.cfila .c1{color:#eaefed}
.cfila .cx{font-style:normal;color:${MUT};padding:12px 6px;transition:transform .2s}
.cfila[open] .cx{transform:rotate(45deg);color:var(--c)}
.cfila[open]>summary{background:rgba(214,228,222,.04)}
.cform{font-family:'Geist Mono',monospace;font-size:11.5px!important;color:#cfd6d3}
.cyr{font-style:normal;display:block;font:400 10.5px 'Geist Mono',monospace;color:${MUT};margin-top:3px}
.cdt{padding:18px 18px 22px;border-left:2px solid var(--c);background:rgba(214,228,222,.025);position:sticky;left:0;max-width:min(1180px,calc(100vw - 64px))}
.cdg{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.cdg p{font-size:13.5px;margin-bottom:4px}
.cu{font:400 11px 'Geist Mono',monospace;color:${MUT}}
.cints{display:flex;flex-wrap:wrap;gap:6px}
.cint{font:500 12px 'Geist',sans-serif;background:none;border:1px solid rgba(214,228,222,.22);color:#eaefed;padding:5px 9px;cursor:pointer}
.cint:hover,.cint:focus-visible{border-color:${LIM};color:${LIM}}
.crel{font:500 11px 'Geist Mono',monospace;background:none;border:1px solid var(--c);color:var(--c);padding:3px 7px;margin:0 5px 5px 0;cursor:pointer}
.crel:hover,.crel:focus-visible{background:var(--c);color:#050607}
.csim{margin-top:20px;border-top:1px solid rgba(214,228,222,.1);padding-top:16px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:8px 26px;align-items:start}
.csh{grid-column:1/-1;font-size:12px;color:#a9b3af}
.csh b{font-family:'Geist Mono',monospace;color:${LIM};font-weight:500}
.cch{width:100%;height:auto;display:block}
.cch .g,.cdis .g{stroke:rgba(214,228,222,.1);stroke-width:1}
.cch .ax,.cdis .ax{fill:${MUT};font:400 10px 'Geist Mono',monospace}
.cch .hatch{fill:url(#crayado);stroke:rgba(214,228,222,.18);stroke-dasharray:3 3}
.cch .pend{fill:${MUT};font:500 11px 'Geist',sans-serif}
.cch .mt,.cdis .mt{stroke:${AMB};stroke-dasharray:5 4;stroke-width:1.3}
.cch .mtx,.cdis .mtx{fill:${AMB};font:500 10.5px 'Geist Mono',monospace}
.cch .s0{fill:none;stroke:#a9b3af;stroke-width:1.6;stroke-dasharray:2 3}
.cch .s1{fill:none;stroke:${LIM};stroke-width:2.2}
.cch .b0{fill:#eaefed}
.cch .b0-calc{fill:#050607;stroke:#eaefed;stroke-width:1.6}
.cch .b0-val,.cch .b0-lb{fill:#050607;stroke:${MUT};stroke-dasharray:2 2}
.cley{display:flex;flex-wrap:wrap;gap:12px;font-size:11px;color:${MUT};grid-column:1}
.cley span::before{content:'';display:inline-block;width:14px;height:0;border-top:2px solid;vertical-align:middle;margin-right:6px}
.cley .l-b::before{width:8px;height:8px;border:0;background:#eaefed;border-radius:50%}
.cley .l-0::before{border-top:2px dotted #a9b3af}.cley .l-1::before{border-color:${LIM}}.cley .l-m::before{border-top:2px dashed ${AMB}}
.ckv{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:0;grid-column:2;grid-row:2/4}
.ckv div{padding:8px 10px;border-bottom:1px solid rgba(214,228,222,.08)}
.ckv dt{font:500 9.5px 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:${MUT};margin-bottom:4px}
.ckv dd{margin:0;font-size:12.5px;line-height:1.4}
/* intervenciones */
.cint-t{border-collapse:collapse;width:100%;min-width:760px;margin-top:26px}
.cint-t th,.cint-t td{border-bottom:1px solid rgba(214,228,222,.08);padding:9px 8px;text-align:center;font-weight:400}
.cint-t thead th{font:500 10px 'Geist Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:${MUT};vertical-align:bottom}
.cint-t thead th span{display:block;color:var(--c);font-size:11px;margin-bottom:3px}
.cint-t tbody th{text-align:left;width:34%}
.cintb{background:none;border:0;color:#cfd6d3;font:400 14px 'Geist',sans-serif;cursor:pointer;padding:0;text-align:left}
.cintb:hover,.cintb:focus-visible,tr.on .cintb{color:${LIM}}
.cint-t tr.on td,.cint-t tr.on th{background:rgba(207,255,94,.05)}
.cint-t .dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px rgba(5,6,7,1),0 0 0 4px var(--c)}
.cintd{margin-top:20px;border:1px solid rgba(214,228,222,.12);padding:20px;min-height:120px}
.cef{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:10px 0 6px}
.cef ul{margin:0;padding:0;list-style:none;display:grid;gap:6px}
.cef li{font-size:13.5px;color:#a9b3af;padding-left:18px;position:relative;line-height:1.45}
.cef li.pos::before{content:'+';position:absolute;left:0;color:${LIM};font-weight:600}
.cef li.neg::before{content:'−';position:absolute;left:0;color:#ff8a6a;font-weight:600}
/* lectura espacial */
.cesp{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:28px;margin-top:26px;align-items:start}
.cdis{width:100%;height:auto;display:block}
.cdis .axt{fill:#a9b3af;font:400 11.5px 'Geist',sans-serif}
.cdis .gm{stroke-dasharray:2 4;stroke:rgba(214,228,222,.3)}
.cdis .qd{fill:rgba(255,138,106,.06);stroke:rgba(255,138,106,.25);stroke-dasharray:3 3}
.cdis .qdt{fill:#ff8a6a;font:500 10.5px 'Geist',sans-serif}
.cdis .pu circle{fill:rgba(234,239,237,.12);stroke:#eaefed;stroke-width:1.2;transition:cy .7s cubic-bezier(.2,.7,.2,1)}
.cdis .pu.pri circle{fill:rgba(255,138,106,.22);stroke:#ff8a6a}
.cdis .pu.low circle{stroke-dasharray:3 2}
.cdis .pu text{fill:#cfd6d3;font:500 11px 'Geist',sans-serif}
.cdis .mv{stroke:${LIM};stroke-width:1;stroke-dasharray:2 3;opacity:.7}
.cseg{display:inline-flex;border:1px solid rgba(214,228,222,.2);margin-top:18px}
.cseg button{font:500 12px 'Geist',sans-serif;background:none;border:0;color:#a9b3af;padding:8px 14px;cursor:pointer}
.cseg button[aria-pressed=true]{background:${LIM};color:#050607}
.ctab{border-collapse:collapse;width:100%;min-width:880px;margin-top:22px;font-size:12.5px}
.ctab th{font:500 9.5px 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:${MUT};text-align:left;padding:8px;border-bottom:1px solid rgba(214,228,222,.25);font-weight:500}
.ctab td{padding:8px;border-bottom:1px solid rgba(214,228,222,.08);color:#a9b3af}
.ctab td b{color:#eaefed;font-weight:500;display:block}
.ctab td em{font-style:normal;font:400 10px 'Geist Mono',monospace;color:${MUT}}
.ctab tr.pri td:first-child{box-shadow:inset 2px 0 #ff8a6a}
.ccruces{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.ccruces li{border:1px solid rgba(214,228,222,.1);padding:12px 14px}
.ccruces li b{display:block;font-weight:500;color:#eaefed;font-size:13.5px;margin-bottom:6px}
.ccruces li p{font-size:12.5px}
/* experimentos */
.cexp{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:26px}
.cex{border:1px solid rgba(214,228,222,.12);padding:16px 16px 14px;position:relative}
.cex::before{content:'';position:absolute;left:-1px;top:-1px;width:24px;height:2px;background:var(--c)}
.cex .id{font:500 11px 'Geist Mono',monospace;color:var(--c);letter-spacing:.08em}
.cex h4{margin:6px 0 10px}
.cex .esc2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.cex .esc2 div{border:1px dotted rgba(214,228,222,.25);padding:8px;font-size:11.5px;color:${MUT}}
.cex .esc2 div b{display:block;color:#cfd6d3;font-weight:500;font-size:12px;margin-bottom:3px}
.cex .esc2 div.ok{border-style:solid;border-color:${LIM}}
.cex p{font-size:12.5px}
.ccode{font:400 11.5px/1.55 'Geist Mono',monospace;color:#a9b3af;background:rgba(214,228,222,.03);border:1px solid rgba(214,228,222,.1);padding:14px;overflow:auto;margin-top:18px;white-space:pre}
/* panel de la red */
#panel .crp{margin-top:6px;border-top:1px solid var(--line);padding-top:4px}
#panel .crp .crk{font-size:12px;color:var(--mut);margin:18px 0 8px;font-weight:500}
#panel .crp .crc{border-left:2px solid var(--ac);padding:2px 0 2px 12px;color:#ececee;font-size:13.5px;line-height:1.45}
#panel .crp .cri{list-style:none;margin:0;padding:0}
#panel .crp .cri li{padding:9px 0;border-bottom:1px solid var(--line)}
#panel .crp .cri li b{font-weight:500;color:#ececee;display:block;margin-bottom:4px}
#panel .crp .cri .cpqs{margin:4px 0}
#panel .crp .cpq{font-size:10.5px;padding:2px 6px}
#panel .crp .cri small{display:block;color:var(--mut);font-size:11.5px;line-height:1.45;margin-top:3px}
#panel .crp .cri small.neg{color:#ff9f86}
#panel .crp .cind{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:12.5px;align-items:baseline}
#panel .crp .cind b{font:500 11px 'Geist Mono',monospace;color:var(--ac)}
#panel .crp .cind span{color:#c9c9cf;line-height:1.4}
#panel .crp .cind em{font-style:normal;display:block;margin-top:2px}
#panel .crp .cv{font-size:12px}
#panel .crp .crm{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
#panel .crp .crm button{font:500 12px inherit;font-family:inherit;background:none;border:1px solid var(--ac);color:var(--ac);padding:8px 12px;cursor:pointer;border-radius:3px}
#panel .crp .crm button:hover{background:var(--ac);color:#0e0e11}
#panel .crp .cnota{display:block;margin-top:8px}
/* aparición */
#criterios .rv{opacity:0;transform:translateY(18px);transition:opacity .7s cubic-bezier(.2,.7,.2,1) var(--d,0s),transform .7s cubic-bezier(.2,.7,.2,1) var(--d,0s)}
#criterios .rv.vis{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){#criterios .rv{opacity:1;transform:none;transition:none}.cdis .pu circle{transition:none}}
body.encrit header,body.encrit .legend,body.encrit .goprop,body.encrit #volver,body.encrit #panel,body.encrit #tip,body.encrit #lbls,body.encrit .hito{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
html.incrustado #criterios{visibility:hidden!important;pointer-events:none!important}
@media (max-width:980px){.cseis,.cexp{grid-template-columns:1fr 1fr}.cesp{grid-template-columns:1fr}.cdg{grid-template-columns:1fr 1fr}}
@media (max-width:700px){
 #criterios .mw{padding:0 16px}#criterios .blq{padding:64px 0 32px}
 .cseis,.cexp,.cdg,.cef{grid-template-columns:1fr}
 .cmat{min-width:0}.chead{display:none}
 .cfila>summary{display:block;padding:12px 30px 12px 12px;border-left:2px solid var(--c)}
 .cfila>summary>span{display:none;padding:0;border:0}
 .cfila>summary>.c0,.cfila>summary>.c1,.cfila>summary>.c2,.cfila>summary>.c5{display:block;margin-bottom:6px}
 .cfila>summary>.c0{border-left:0!important}
 .cfila>summary>.c2::before{content:'Línea base · ';color:${MUT};font-size:11px}
 .cfila>summary>.c5::before{content:'Meta · ';color:${MUT};font-size:11px}
 .cfila .cx{position:absolute;right:6px;top:10px}
 .cdt{max-width:none;position:static;padding:14px 12px 18px}
 .csim{grid-template-columns:1fr}.ckv{grid-column:1;grid-row:auto}
 .cflujo li{flex-basis:50%}
}`;

/* ---------- página ---------- */
function montar(){
 const M=document.getElementById('modelo');if(!M)return false;if(document.getElementById('criterios'))return true;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const C=document.createElement('div');C.id='criterios';C.setAttribute('aria-label','Del diagnóstico a los criterios de diseño');
 let h='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><pattern id="crayado" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="rgba(214,228,222,.12)" stroke-width="2"/></pattern></defs></svg>';
 // 0 · introducción
 h+='<section class="blq" id="cr-intro"><div class="mw"><div class="ey"><b>Trazabilidad</b> · diagnóstico → diseño → simulación</div><h2>Del diagnóstico a los<br>criterios de diseño</h2>'+
  '<p class="lead">Cada indicador del diagnóstico se convierte en una condición que el diseño busca cambiar, una meta que se puede medir, una intervención de Bavaria Común y una fórmula para comprobarla en el simulador. Se usa el mismo indicador antes y después siempre que es posible.</p>'+
  '<ol class="cflujo">'+['¿Qué problema existe?','¿Dónde ocurre?','¿Cómo se mide?','¿Qué condición busca modificar el diseño?','¿Qué intervención se propone?','¿Cómo se comprueba su funcionamiento?','¿Qué otros problemas puede afectar?'].map(x=>'<li>'+x+'</li>').join('')+'</ol>'+
  '<div class="cleg">'+['real','calc','meta','val','lb','sim','res'].map(k=>'<span>'+tag(k)+'<em style="font-style:normal">'+TIPO[k][1]+'</em></span>').join('')+'</div></div></section>';
 // 1 · seis problemas + ecocéntrico
 h+='<section class="blq" id="cr-seis"><div class="mw"><div class="ey"><b>1</b> · seis problemas, un sistema</div><h2>Qué cambia el diseño<br>en cada problema</h2>'+
  '<p class="lead">Ningún criterio responde a un solo problema: cada intervención toca varios a la vez, y algunas pueden empeorar otro. Por eso cada criterio lleva sus relaciones.</p><div class="cseis">'+
  ORD.concat('X').map(k=>{const p=PROB[k],n=IND.filter(i=>i.p===k).length;return '<article class="cpb" style="--c:'+pc(k)+'"><span class="n">'+NUM[k]+(k==='X'?' · TRANSVERSAL':'')+'</span><h3>'+pt(k)+'</h3>'+
   '<h5>Diagnóstico</h5><p>'+p.dg+'</p><h5>Criterio de diseño</h5><p style="color:#eaefed">'+p.cr+'</p><h5>Propuesta</h5><p>'+p.pr+'</p><h5>Comprobación</h5><p>'+p.co+'</p><h5>Relaciones</h5><p>'+p.re+'</p>'+
   (p.nota?'<p class="cnota">'+p.nota+'</p>':'')+'<div class="ir"><button type="button" class="cbtn" data-filtro="'+k+'">'+n+' indicadores en la matriz ↓</button>'+(k!=='X'?'<button type="button" class="cbtn" data-red="'+k+'">Ver en la red ↑</button>':'')+'</div></article>'}).join('')+'</div></div></section>';
 // 2 · matriz
 h+='<section class="blq" id="cr-matriz"><div class="mw"><div class="ey"><b>2</b> · matriz interactiva</div><h2>Matriz de criterios<br>de diseño</h2>'+
  '<p class="lead">Filtra por problema y abre cada fila para ver el detalle: diagnóstico, criterio, intervención, fórmula, relaciones y la comparación de los dos escenarios a quince años.</p>'+
  '<div class="cfil" role="group" aria-label="Filtrar la matriz por problema"><button type="button" data-f="*" aria-pressed="true">Todos · '+IND.length+'</button>'+ORD.concat('X').map(k=>'<button type="button" data-f="'+k+'" style="--c:'+pc(k)+'" aria-pressed="false">'+NUM[k]+' · '+(k==='X'?'Ecocéntrica':pt(k))+'</button>').join('')+'</div>'+
  '<div class="scrollx"><div class="cmat"><div class="chead">'+COLS.map(c=>'<span>'+c+'</span>').join('')+'<span></span></div>'+IND.map(fila).join('')+'</div></div>'+
  '<p class="cnota" style="margin-top:14px">Ninguna celda de resultados contiene valores inventados: mientras no existan las corridas, dicen «Pendiente de simulación». Las metas en ámbar vienen de la propuesta o del encargo y son preliminares.</p></div></section>';
 // 3 · ecocéntrica
 h+='<section class="blq" id="cr-eco"><div class="mw"><div class="ey"><b>3</b> · evaluación transversal</div><h2>El territorio también<br>es de los que no votan</h2>'+
  '<p class="lead">El ecocentrismo es el enfoque principal de la propuesta. Estos diez indicadores atraviesan los seis problemas y no forman un séptimo: cada uno se liga a una intervención concreta y a una dinámica social o territorial.</p>'+
  '<div class="cseis">'+IND.filter(i=>i.p==='X').map(i=>'<article class="cpb" style="--c:'+pc('X')+'"><span class="n">'+i.id+'</span><h4>'+i.n+'</h4><p class="cform">'+i.f+'</p><h5>Intervenciones</h5><p>'+i.ri.map(intName).join(' · ')+'</p><h5>Relación social y territorial</h5><p>'+i.soc+'</p><div class="ir">'+tag(i.b.t)+'<button type="button" class="cbtn" data-ir="'+i.id+'">Detalle ↓</button></div></article>').join('')+'</div></div></section>';
 // 4 · intervenciones
 h+='<section class="blq" id="cr-int"><div class="mw"><div class="ey"><b>4</b> · una intervención, varios problemas</div><h2>Lo que responde a varios<br>a la vez, y lo que choca</h2>'+
  '<p class="lead">Elige una intervención: se ven los problemas a los que responde, sus efectos esperados y los efectos indirectos que pueden crear nuevas retroalimentaciones, incluidos los negativos y los conflictos entre objetivos.</p>'+redInt()+'</div></section>';
 // 5 · lectura espacial
 h+='<section class="blq" id="cr-esp"><div class="mw"><div class="ey"><b>5</b> · lectura espacial cruzada</div><h2>Dónde, y no solo<br>cuánto en Kennedy</h2>'+
  '<p class="lead">Los promedios de toda Kennedy esconden diferencias. Cruzamos la densidad de cada UPZ con el acceso a plazas para justificar dónde van las intervenciones. Los demás cruces quedan marcados donde faltan datos.</p>'+
  '<div class="cesp"><div><div class="cseg" role="group" aria-label="Escenario del mapa de dispersión"><button type="button" data-m="hoy" aria-pressed="true">Hoy</button><button type="button" data-m="con" aria-pressed="false">Con la malla de plazas · estimación geométrica</button></div><div class="cdisw">'+dispersion('hoy')+'</div>'+
  '<p class="cnota">Tamaño del círculo: población 2024. Línea discontinua: muestra de menos de '+MMIN+' edificios residenciales (*). Tintal Norte no tiene viviendas en la muestra. Cálculo propio sobre la muestra de 4.200 edificios de analisis.js asignados a su UPZ [18][25]; es indicativo y no reemplaza el cálculo sobre los 77.280 edificios. La vista «con la malla» es la estimación geométrica de la propuesta, no una simulación; en ella el nombre de cada UPZ aparece al pasar el cursor.</p></div>'+
  '<div><h3>Seis cruces</h3><ul class="ccruces">'+CRUCES.map(c=>'<li><b>'+c[0]+'</b>'+tag(c[1],c[1]==='calc'?'Cálculo propio':'Línea base pendiente de cálculo')+'<p style="margin-top:6px">'+c[2]+'</p></li>').join('')+'</ul></div></div>'+
  '<h3 style="margin-top:34px">Qué justifica la ubicación</h3><p>Patio Bonito, Gran Britalia, Corabastos y Kennedy Central son más densas que el promedio local y tienen menos del 30 % de sus viviendas a 500 m de una plaza en la muestra. Carvajal y Las Margaritas no tienen ninguna en la muestra. Allí cae la mayoría de las plazas nuevas de la malla. A la vez, el crecimiento proyectado se concentra en Calandaima, Las Margaritas, Tintal Norte y Bavaria: ahí los equipamientos deben llegar antes que la población, y es donde más presión hay sobre el borde de los humedales.</p>'+
  tablaUPZ()+'</div></section>';
 // 6 · doce simulaciones
 h+='<section class="blq" id="cr-sim"><div class="mw"><div class="ey"><b>6</b> · comprobación</div><h2>Seis experimentos,<br>doce simulaciones</h2>'+
  '<p class="lead">Cada experimento corre dos veces, sin propuesta y con propuesta, con las mismas condiciones externas durante '+HORIZ+' años. Los indicadores de la matriz son las salidas que se comparan. La estructura está lista y las corridas todavía no.</p>'+
  '<div class="cexp">'+EXP.map(e=>{const ids=IND.filter(i=>i.ex===e.id).map(i=>i.id),r=SIMR&&(SIMR.experimentos||[]).find(x=>x.id===e.id),ok0=r&&r.sin&&Object.keys(r.sin).length,ok1=r&&r.con&&Object.keys(r.con).length;
   return '<article class="cex" style="--c:'+pc(e.p)+'" data-exp="'+e.id+'"><span class="id">'+e.id+' · '+NUM[e.p]+'</span><h4>'+e.t+'</h4><div class="esc2"><div'+(ok0?' class="ok"':'')+'><b>Sin propuesta</b>'+(ok0?'cargada':'Pendiente de simulación')+'</div><div'+(ok1?' class="ok"':'')+'><b>Con propuesta</b>'+(ok1?'cargada':'Pendiente de simulación')+'</div></div><p>Indicadores: '+relLinks(ids)+'</p></article>'}).join('')+'</div>'+
  '<p class="cnota" style="margin-top:18px">Las tres simulaciones que ya corren en la sección siguiente (SIM-01, SIM-02 y SIM-03) comparan escenarios A, B y C con supuestos (S) por calibrar; no son las doce corridas ni sus resultados se copian aquí. La matriz indica qué gráfico de esas simulaciones toca cada indicador.</p>'+
  '<p style="margin-top:18px">Para cargar resultados, se completa <code>simulaciones.json</code> con una serie de '+(HORIZ+1)+' valores (año 0 a '+HORIZ+') por indicador y escenario. La página calcula sola la diferencia absoluta y porcentual y el grado de cumplimiento frente a la meta:</p>'+
  '<pre class="ccode">{\n  "horizonte_anios": 15,\n  "experimentos": [\n    { "id": "EXP-06",\n      "sin": { "F1": [22.5, 22.5, …, 23.1] },\n      "con": { "F1": [22.5, 30.2, …, 78.0] } }\n  ]\n}</pre>'+
  '<p class="cnota">Grado de cumplimiento = (valor con propuesta en el año '+HORIZ+' − línea base) ÷ (meta − línea base). Solo se calcula cuando la línea base y la meta son números.</p></div></section>';
 C.innerHTML=h;M.insertAdjacentElement('beforebegin',C);
 wire(C);
 $$('[data-acrit]').forEach(a=>a.addEventListener('click',ev=>{ev.preventDefault();C.scrollIntoView({behavior:RM?'auto':'smooth'})}));
 if(/^#cr-/.test(location.hash)){const t=document.querySelector(location.hash);if(t)setTimeout(()=>t.scrollIntoView(),300)}
 return true}

function wire(C){
 // filtro de la matriz
 const fil=f=>{$$('.cfil button',C).forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===f));$$('.cfila',C).forEach(r=>{r.hidden=!(f==='*'||r.dataset.p===f)})};
 $$('.cfil button',C).forEach(b=>b.addEventListener('click',()=>fil(b.dataset.f)));
 const irMatriz=(f,id)=>{fil(f);const t=id?$('#ci-'+id,C):$('#cr-matriz',C);if(id&&t){t.open=true}(t||C).scrollIntoView({behavior:RM?'auto':'smooth',block:id?'center':'start'})};
 CRIT.matriz=irMatriz;
 C.addEventListener('click',ev=>{
  const fb=ev.target.closest('[data-filtro]');if(fb){irMatriz(fb.dataset.filtro);return}
  const ir=ev.target.closest('[data-ir]');if(ir){const i=byI[ir.dataset.ir];if(i)irMatriz(i.p,i.id);return}
  const rd=ev.target.closest('[data-red]');if(rd){scrollTo({top:0,behavior:RM?'auto':'smooth'});const n=typeof byId!=='undefined'&&byId[rd.dataset.red];if(n&&typeof select==='function')setTimeout(()=>select(n),RM?0:900);return}
  const it=ev.target.closest('[data-int]');if(it){verInt(it.dataset.int,!ev.target.closest('#cr-int'));return}
 });
 // intervenciones
 const verInt=(k,scroll)=>{$$('.cint-t tbody tr',C).forEach(r=>r.classList.toggle('on',r.dataset.int===k));$('.cintd',C).innerHTML=intDet(k);if(scroll)$('#cr-int',C).scrollIntoView({behavior:RM?'auto':'smooth'})};
 verInt('I1',false);
 // dispersión hoy / con la malla
 $$('.cseg button',C).forEach(b=>b.addEventListener('click',()=>{$$('.cseg button',C).forEach(x=>x.setAttribute('aria-pressed',x===b));$('.cdisw',C).innerHTML=dispersion(b.dataset.m)}));
 // aparición
 const SEL='.ey,h2,.lead,.cflujo,.cleg,.cpb,.cfil,.cesp,.cex,.cint-t,.cintd,.ccode';let n=0;
 $$(SEL,C).forEach(x=>{x.classList.add('rv');x.style.setProperty('--d',Math.min(.5,(n++%8)*.06)+'s')});
 const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('vis');io.unobserve(en.target)}}),{rootMargin:'0px 0px -6% 0px'});$$('.rv',C).forEach(x=>io.observe(x));
 // al entrar a esta sección se esconden los controles flotantes de la red (igual que en el modelo)
 new IntersectionObserver(es=>es.forEach(en=>document.body.classList.toggle('encrit',en.isIntersecting)),{rootMargin:'0px 0px -40% 0px'}).observe(C);
 // resultados de simulación, si existen
 fetch('simulaciones.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(!j||!Array.isArray(j.experimentos))return;
  const hay=j.experimentos.some(e=>['sin','con'].some(s=>e[s]&&Object.keys(e[s]).length));if(!hay)return;SIMR=j;
  // vuelve a pintar matriz y experimentos con los resultados
  const mat=$('.cmat',C);$$('.cfila',mat).forEach(r=>r.remove());mat.insertAdjacentHTML('beforeend',IND.map(fila).join(''));fil($('.cfil button[aria-pressed=true]',C).dataset.f);
 }).catch(()=>{});
}

/* ---------- bloque para el panel de un nodo de la red ---------- */
function panel(k){
 const p=PROB[k];if(!p)return '';
 const inds=IND.filter(i=>i.p===k);
 const otros=Object.keys(INT).filter(x=>!p.i.includes(x)&&INT[x].r.includes(k));
 const li=x=>{const it=INT[x],ot=it.r.filter(q=>q!==k);return '<li><b>'+it.t+'</b>'+(ot.length?'<div class="cpqs">'+ot.map(q=>'<span class="cpq" style="--c:'+pc(q)+'">también '+(q==='X'?'ecocéntrica':pt(q).toLowerCase())+'</span>').join('')+'</div>':'')+
  '<small>+ '+it.pos[0]+'</small>'+it.neg.map(n=>'<small class="neg">− '+n+'</small>').join('')+'</li>'};
 return '<div class="crp"><div class="gh">DEL DIAGNÓSTICO AL DISEÑO</div>'+
  '<div class="crk">Criterio de diseño</div><div class="crc">'+p.cr+'</div>'+
  (p.nota?'<small class="cnota">'+p.nota+'</small>':'')+
  '<div class="crk">Intervenciones que responden</div><ul class="cri">'+p.i.map(li).join('')+(otros.length?otros.map(li).join(''):'')+'</ul>'+
  '<div class="crk">Indicadores de comprobación</div><div class="cind">'+inds.map(i=>'<b>'+i.id+'</b><span>'+i.n+'<em>'+val(i.b.v,i.b.t)+' → '+val(i.m.v,i.m.t)+' · '+tag('sim','pendiente de simulación')+'</em></span>').join('')+'</div>'+
  '<div class="crk">Relaciones con los demás problemas</div><div class="crc" style="border-color:var(--mut)">'+p.re+'</div>'+
  '<div class="crm"><button type="button" class="crgo" data-k="'+k+'">Ver en la matriz de criterios ↓</button></div></div>'}
function wirePanel(P,k){const b=P.querySelector('.crgo');if(!b)return;b.addEventListener('click',()=>{if(typeof closePanel==='function')closePanel();setTimeout(()=>{if(CRIT.matriz)CRIT.matriz(k)},60)})}

const CRIT=window.CRIT={panel,wirePanel,IND,INT,PROB,EXP,UPZ,matriz:null};
if(!montar()){const t=setInterval(()=>{if(montar())clearInterval(t)},150)}
})();
