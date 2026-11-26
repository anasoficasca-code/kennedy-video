/* ============ DEL DIAGNÓSTICO A LA ESTRATEGIA, PASO A PASO (dentro del recorrido de los seis problemas) ============
   Después de cada problema del recorrido se agregan tres pasos con la misma presentación (tarjeta + el mismo mapa fijo):
     2 · criterio y estrategia de diseño, con su sustento y URL;
     3 · escenarios: una barra deslizable («¿qué pasa si se agrega esto?») que cambia la cifra y el mapa;
     4 · plausibilidad: gráficas y literatura científica que muestran si el escenario es posible.
   Primero: 01 · Centralización de servicios. Las cifras de los escenarios son cálculo propio ya publicado en propuesta.html
   (máxima cobertura sobre 77.280 edificios residenciales por la red peatonal), no simulación dinámica. */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const fmt=(v,d=0)=>(+v).toLocaleString('es-CO',{maximumFractionDigits:d,minimumFractionDigits:d});
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- fuentes (todas con URL) ---------- */
const F={
 guion:['Guion del proyecto: «28 % tiene una plaza a ≤ 15 min · suroccidente» (SDP 2022). Sin URL: no se usa como línea base hasta aportar el documento de la SDP.',''],
 paso:['Bohannon, R. W. y Andrews, A. W. (2011). Normal walking speed: a descriptive meta-analysis. Physiotherapy, 97(3), 182–189 (23.111 personas; de 0,94 a 1,43 m/s según edad y sexo).','https://pubmed.ncbi.nlm.nih.gov/21820535/'],
 pot:['Alcaldía de Bogotá. Con las Unidades de Planeamiento Local, Bogotá se consolida como la ciudad de 30 minutos (POT Bogotá Reverdece, Decreto 555 de 2021).','https://bogota.gov.co/mi-ciudad/planeacion/pot-reglamentacion-de-33-unidades-de-planeacion-local-30-urbanas'],
 pot15:['El Tiempo. El nuevo POT de Bogotá le apunta a una ciudad de 15 minutos.','https://www.eltiempo.com/bogota/nuevo-pot-de-bogota-le-apunta-a-ciudad-de-15-minutos-536761'],
 cl30:['Alcaldía de Bogotá. «Haremos una ciudad de 30 minutos con vías para bicicletas y peatones»: alcaldesa Claudia López.','https://bogota.gov.co/internacional/como-construir-una-ciudad-sostenible-y-neutra-en-carbono'],
 moreno:['Moreno, C., Allam, Z., Chabaud, D., Gall, C. y Pratlong, F. (2021). Introducing the “15-Minute City”: Sustainability, Resilience and Place Identity in Future Post-Pandemic Cities. Smart Cities, 4(1), 93–111.','https://doi.org/10.3390/smartcities4010006'],
 bruno:['Bruno, M., Monteiro Melo, H. P., Campanelli, B. y Loreto, V. (2024). A universal framework for inclusive 15-minute cities. Nature Cities, 1, 633–641.','https://arxiv.org/abs/2408.03794'],
 mclp:['Localización óptima de oferta de alimentos con el problema de máxima cobertura (supermercados y mercados de productores en Filadelfia), SSRN 2438247.','https://faculty.wharton.upenn.edu/wp-content/uploads/2014/05/SSRN-id2438247.pdf'],
 bcn:['Instituto Municipal de Mercados de Barcelona. Memoria 2023: 39 mercados alimentarios; ningún barrio sin mercado de referencia.','https://ajuntament.barcelona.cat/mercats/sites/default/files/2024-05/Memoria_IMMB_2023.pdf'],
 unal:['Instituto de Estudios Urbanos, UNAL. «En las ciudades latinoamericanas se dificulta implementar el modelo de 15 minutos dada la gran segregación» (C. A. Moreno Luna).','https://ieu.unal.edu.co/divulgacion-academica/en-las-ciudades-latinoamericanas-se-dificulta-implementar-el-modelo-de-15-minutos-dada-la-gran-segregacion-carlos-augusto-moreno-luna'],
 calc:['Casas, Gómez y Trujillo. Distrito Bavaria Común y simulador de Kennedy: acceso a plazas por la red peatonal y máxima cobertura (77.280 edificios residenciales).','https://anasoficasca-code.github.io/simulador/bavaria.html'],
 prop:['Propuesta Bavaria Común: «El comercio llega a todos; el abasto mayorista, a casi nadie».','https://alejagoguti-cpu.github.io/red-de-problemas/propuesta.html#acceso'],
 pob:['Secretaría Distrital de Salud – SaluData. Caracterización de Kennedy 2024 (1.037.929 habitantes).','https://saludata.saludcapital.gov.co/osb/wp-content/uploads/2024/12/Kennedy_MasBienestar_2024_v1_2.pdf']};
let NREF=0;const NUM={};
const ref=(...ks)=>ks.map(k=>{if(!NUM[k])NUM[k]=++NREF;const s=F[k];return s[1]?'<a class="ee-c" href="'+s[1]+'" target="_blank" rel="noopener" title="'+s[0].replace(/"/g,'')+'">['+NUM[k]+']</a>':'<span class="ee-c ee-p" title="'+s[0].replace(/"/g,'')+'">[URL pendiente]</span>'}).join('');
const lista=ks=>'<ul class="ee-src">'+ks.map(k=>{const s=F[k];return '<li>'+(s[1]?'<a href="'+s[1]+'" target="_blank" rel="noopener">'+s[0]+'</a><span class="ee-url">'+s[1].replace(/^https?:\/\//,'')+'</span>':s[0])+'</li>'}).join('')+'</ul>';

/* ---------- datos del escenario de plazas (cálculo propio publicado en propuesta.html) ---------- */
const POP=1037929,PLAZAS=13;
// cobertura (% de viviendas) a 500 m y 800 m por la red peatonal según cuántas plazas nuevas se suman, en orden de mayor ganancia
const CURVA={500:[22.5,33.9,42.1,49.8,55.5,60.4,65.3,70.2,74.4,78.1,81.4,83.9,86.1,87.9,89.4,90.8,92.2,93.5,94.4,95.1],800:[47.3,68.7,78.7,84.8,90,92,93.9,95.4,96.8,98.1,99,99.3,99.6,99.7,99.8,99.8,99.9,99.9,99.9,100]};
// 19 sitios de la malla (marco del análisis) y viviendas de la muestra que gana cada uno; al marco del mapa: + (−7374, −2332)
const SITIOS=[[5530,3474,8841],[5620,1698,6367],[5672,2705,5935],[5028,3063,4355],[6346,3226,3823],[8828,4498,3813],[8060,3704,3739],[8886,3553,3288],[4493,3777,2797],[7006,1626,2577],[6330,4544,1949],[7594,2784,1708],[4763,2143,1398],[7733,1794,1149],[9367,2510,1074],[7429,4116,1059],[5181,3986,1019],[6002,1205,732],[9910,3337,473]].map(([x,y,g])=>[x-7374,y-2332,g]);
const META=75;
const llega=r=>CURVA[r].findIndex(v=>v>=META);

/* ---------- CSS ---------- */
const css=`
#story .card.ee{max-width:500px}
#story .card.ee .num b{color:var(--c);font-weight:500;letter-spacing:.14em}
.ee-big{display:flex;align-items:baseline;gap:14px;margin:16px 0 6px;flex-wrap:wrap}
.ee-big b{font:300 54px/1 var(--letra-titulo,'Barlow Condensed'),sans-serif;color:#f1f2f3}
.ee-big b.m{color:var(--c)}
.ee-big i{font-style:normal;color:#7a8480;font-size:22px}
.ee-big span{font:500 10px var(--letra-dato,'Geist Mono',monospace);letter-spacing:.12em;text-transform:uppercase;color:#7a8480;display:block;margin-top:4px}
.ee-tg{display:inline-block;font:500 9.5px var(--letra-dato,'Geist Mono',monospace);letter-spacing:.08em;text-transform:uppercase;padding:3px 6px;border:1px dashed var(--c);color:var(--c);margin-left:6px;vertical-align:2px}
.ee-tg.r{border-style:solid;border-color:#eaefed;color:#eaefed}
.ee-tg.c{border-style:solid;border-color:#eaefed;color:#eaefed;background:repeating-linear-gradient(135deg,rgba(234,239,237,.14) 0 2px,transparent 2px 5px)}
.ee-l{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:9px}
.ee-l li{font-size:13.5px;line-height:1.5;color:var(--tinta-2,#b6bcc0);padding-left:16px;position:relative}
.ee-l li::before{content:'';position:absolute;left:0;top:.6em;width:7px;height:7px;background:var(--c)}
.ee-l li em{font-style:normal;color:#f1f2f3}
.ee-c{font:500 10px var(--letra-dato,'Geist Mono',monospace);color:var(--c);text-decoration:none;margin-left:3px;vertical-align:1px;pointer-events:auto}
.ee-c:hover{text-decoration:underline}
.ee-p{color:#c5b994}
.ee-h{font:500 10px var(--letra-dato,'Geist Mono',monospace);letter-spacing:.14em;text-transform:uppercase;color:#7a8480;margin:16px 0 6px}
.ee-fx{margin-top:12px;font:500 10px var(--letra-dato,'Geist Mono',monospace);letter-spacing:.1em;text-transform:uppercase;color:#5f6966}
.ee-src{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:6px;max-height:190px;overflow:auto;pointer-events:auto;scrollbar-width:thin}
.ee-src li{font-size:11.5px;line-height:1.4;color:#8b9591}
.ee-src a{color:#b6bcc0;text-decoration:none}
.ee-src a:hover{color:#f1f2f3;text-decoration:underline}
.ee-url{display:block;font:400 10px var(--letra-dato,'Geist Mono',monospace);color:#5f6966;word-break:break-all}
.ee-ctl{margin-top:14px;pointer-events:auto}
.ee-ctl label{display:flex;justify-content:space-between;font-size:12.5px;color:#b6bcc0;margin-bottom:6px}
.ee-ctl label b{color:#f1f2f3;font-weight:500}
.ee-ctl input[type=range]{width:100%;accent-color:var(--c);cursor:pointer}
.ee-seg{display:inline-flex;border:1px solid rgba(214,228,222,.22);margin-top:10px}
.ee-seg button{font:500 11.5px Geist,sans-serif;background:none;border:0;color:#a9b3af;padding:7px 11px;cursor:pointer}
.ee-seg button[aria-pressed=true]{background:var(--c);color:#050607}
.ee-bar{position:relative;height:14px;background:rgba(214,228,222,.08);margin:16px 0 4px}
.ee-bar i{position:absolute;left:0;top:0;bottom:0;background:var(--c);transition:width .35s cubic-bezier(.2,.7,.2,1)}
.ee-bar s{position:absolute;top:-5px;bottom:-5px;width:0;border-left:2px dashed #e6c36a}
.ee-bar s::after{content:'meta 75 %';position:absolute;left:4px;top:-15px;font:500 9.5px var(--letra-dato,'Geist Mono',monospace);color:#e6c36a;white-space:nowrap}
.ee-bar u{position:absolute;top:-3px;bottom:-3px;width:0;border-left:2px solid #f1f2f3;opacity:.6}
.ee-kv{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:12px}
.ee-kv div{border:1px solid rgba(214,228,222,.12);padding:8px}
.ee-kv b{display:block;font:300 24px/1 var(--letra-titulo,'Barlow Condensed'),sans-serif;color:#f1f2f3}
.ee-kv span{display:block;font-size:10.5px;color:#7a8480;margin-top:4px;line-height:1.3}
.ee-ok{margin-top:10px;font-size:13px;color:#f1f2f3;border-left:2px solid var(--c);padding-left:10px}
.ee-ch{width:100%;height:auto;display:block;margin-top:10px}
.ee-ch .g{stroke:rgba(214,228,222,.1)}
.ee-ch .ax{fill:#7a8480;font:400 9.5px 'Geist Mono',monospace}
.ee-ch .l5{fill:none;stroke:var(--c);stroke-width:2.2}
.ee-ch .l8{fill:none;stroke:#eaefed;stroke-width:1.6;stroke-dasharray:4 3}
.ee-ch .mt{stroke:#e6c36a;stroke-dasharray:5 4;stroke-width:1.3}
.ee-ch .mtx{fill:#e6c36a;font:500 9.5px 'Geist Mono',monospace}
.ee-ch .pt{fill:#050607;stroke-width:2}
.ee-ch .lb{fill:#f1f2f3;font:500 10px Geist,sans-serif}
.ee-nt{margin-top:10px;font-size:11.5px!important;line-height:1.45!important;color:#7a8480!important}
/* capa de la estrategia sobre el mapa del recorrido */
#mksvg .ee-g{opacity:0;transition:opacity .6s;pointer-events:none}
#mksvg[data-sub^=F] .ee-g.F{opacity:1}
#mksvg .ee-ring{fill:rgba(207,255,94,.07);stroke:#cfff5e;stroke-width:1.2;stroke-dasharray:4 3;vector-effect:non-scaling-stroke;transition:opacity .4s}
#mksvg .ee-palo{stroke:#cfff5e;stroke-width:1.4;vector-effect:non-scaling-stroke}
#mksvg .ee-pin{fill:#cfff5e;stroke:#050607;stroke-width:1.5;vector-effect:non-scaling-stroke}
#mksvg .ee-s{transition:opacity .4s}
#mksvg .ee-s.off{opacity:0}
.sw.nueva{background:#cfff5e;border:2px solid #050607;box-shadow:0 0 0 1px #cfff5e}
.sw.ring{background:rgba(207,255,94,.12);border:1.5px dashed #cfff5e}
`;

/* ---------- tarjetas ---------- */
// fuentes en una sola línea: [1] [2] … cada una con su URL
const fuentes=ks=>'<div class="ee-fx">Fuentes '+ref(...ks)+'</div>';
function tarjetas(){
 const r5=llega(500),r8=llega(800),T={};
 T.F2='<div class="num"><span>01</span> / 06 · <b>Criterio de diseño</b></div><h2>Del 28 % al 75 %</h2><p class="tag">Una plaza a 15 minutos a pie</p>'+
  '<div class="ee-big"><div><b>28 %</b><span>hoy · suroccidente</span></div><i>→</i><div><b class="m">75 %</b><span>meta</span></div></div>'+
  '<ul class="ee-l"><li><em>Ciudad de 15 y 30 minutos</em> · POT Bogotá Reverdece'+ref('pot','cl30')+'</li><li><em>Ciudad de 15 minutos</em> · Moreno et al., 2021'+ref('moreno')+'</li><li><em>19 plazas de barrio</em> + plaza mayor en Bavaria'+ref('calc')+'</li></ul>'+
  fuentes(['guion','pot','cl30','moreno','calc']);
 T.F3='<div class="num"><span>01</span> / 06 · <b>Escenarios</b></div><h2>¿Y si sumamos plazas?</h2><p class="tag">Mueve la barra</p>'+
  '<div class="ee-ctl"><label for="ee-k">Plazas nuevas <b id="ee-kv">0</b></label><input id="ee-k" type="range" min="0" max="19" step="1" value="0" aria-describedby="ee-out"/>'+
  '<div class="ee-seg" role="group" aria-label="Distancia a pie"><button type="button" data-r="800" aria-pressed="true">800 m</button><button type="button" data-r="500" aria-pressed="false">500 m</button></div></div>'+
  '<div class="ee-bar" aria-hidden="true"><i id="ee-bi"></i><u id="ee-b0"></u><s style="left:75%"></s></div>'+
  '<div class="ee-kv" id="ee-out" aria-live="polite"><div><b id="ee-p">47,3 %</b><span>viviendas cubiertas</span></div><div><b id="ee-d">+0,0</b><span>puntos</span></div><div><b id="ee-h">79.800</b><span>hab. por plaza</span></div></div>'+
  '<p class="ee-ok" id="ee-ok"></p>'+fuentes(['calc','pob','paso']);
 T.F4='<div class="num"><span>01</span> / 06 · <b>Plausibilidad</b></div><h2>¿Es posible?</h2><p class="tag">Sí: la meta llega antes de completar la malla</p>'+
  grafica(r5,r8)+
  '<ul class="ee-l"><li>Máxima cobertura para ubicar alimentos'+ref('mclp')+'</li><li>La densidad local es clave para los 15 min'+ref('bruno')+'</li><li>Barcelona: 39 mercados de barrio'+ref('bcn')+'</li><li>Límite: la segregación'+ref('unal')+'</li></ul>'+
  fuentes(['calc','mclp','bruno','bcn','unal']);
 return T}

function grafica(r5,r8){const W=420,H=190,l=34,r=10,t=14,b=28,X=k=>l+k*(W-l-r)/19,Y=v=>t+(1-v/100)*(H-t-b);
 const path=a=>a.map((v,k)=>(k?'L':'M')+X(k).toFixed(1)+' '+Y(v).toFixed(1)).join('');
 let s='<svg class="ee-ch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Viviendas con plaza a 500 y 800 m según el número de plazas nuevas">';
 [0,25,50,75,100].forEach(v=>s+='<line class="g" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="ax" x="'+(l-5)+'" y="'+(Y(v)+3)+'" text-anchor="end">'+v+'%</text>');
 [0,5,10,15,19].forEach(k=>s+='<text class="ax" x="'+X(k)+'" y="'+(H-12)+'" text-anchor="middle">'+k+'</text>');
 s+='<text class="ax" x="'+((l+W-r)/2)+'" y="'+(H-1)+'" text-anchor="middle">plazas nuevas</text>';
 s+='<line class="mt" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(75)+'" y2="'+Y(75)+'"/><text class="mtx" x="'+(W-r)+'" y="'+(Y(75)-4)+'" text-anchor="end">meta 75 %</text>';
 s+='<path class="l8" d="'+path(CURVA[800])+'"/><path class="l5" d="'+path(CURVA[500])+'"/>';
 s+='<circle class="pt" style="stroke:#eaefed" cx="'+X(r8)+'" cy="'+Y(CURVA[800][r8])+'" r="4"/><text class="lb" x="'+(X(r8)+6)+'" y="'+(Y(CURVA[800][r8])+14)+'">800 m: '+r8+'</text>';
 s+='<circle class="pt" style="stroke:var(--c)" cx="'+X(r5)+'" cy="'+Y(CURVA[500][r5])+'" r="4"/><text class="lb" x="'+(X(r5)+6)+'" y="'+(Y(CURVA[500][r5])+14)+'">500 m: '+r5+'</text>';
 return s+'</svg>'}

/* ---------- capa de la estrategia en el mapa del recorrido ---------- */
function capaMapa(){const svg=document.getElementById('mksvg');if(!svg||typeof MK==='undefined'||!MK.P)return null;let g=svg.querySelector('.ee-g.F');if(g)return g;
 g=document.createElementNS(NS,'g');g.setAttribute('class','ee-g F');
 let h='';SITIOS.forEach(([x,z],i)=>{const ring=[];for(let a=0;a<48;a++){const q=MK.P(x+500*Math.cos(a/48*6.2832),z+500*Math.sin(a/48*6.2832),0);ring.push(q[0].toFixed(1)+' '+q[1].toFixed(1))}
  const b=MK.P(x,z,0),tp=MK.P(x,z,260);
  h+='<g class="ee-s" data-i="'+i+'"><path class="ee-ring" d="M'+ring.join('L')+'Z"/><line class="ee-palo" x1="'+b[0]+'" y1="'+b[1]+'" x2="'+tp[0]+'" y2="'+tp[1]+'"/><circle class="ee-pin" cx="'+tp[0]+'" cy="'+tp[1]+'" r="46"/></g>'});
 g.innerHTML=h;svg.appendChild(g);return g}
function verSitios(k){const g=capaMapa();if(!g)return;g.querySelectorAll('.ee-s').forEach(s=>s.classList.toggle('off',+s.dataset.i>=k))}

const TAG={F2:'criterio: plazas a la escala del barrio',F3:'escenarios: ¿y si sumamos plazas?',F4:'plausibilidad de la malla'};
const LEY2={F2:[['cora','Corabastos · central mayorista'],['plaza','plazas de mercado hoy'],['nueva','19 plazas nuevas de la malla'],['ring','500 m a la redonda (6–7 min)']],
 F3:[['plaza','plazas de mercado hoy'],['nueva','plazas nuevas sumadas'],['ring','500 m a la redonda']],
 F4:[['plaza','plazas de mercado hoy'],['nueva','malla completa: 19 plazas'],['ring','500 m a la redonda']]};
let K=0;
function envolverPaso(){if(typeof pasoMapa!=='function'||pasoMapa.__ee)return typeof pasoMapa==='function';const base=pasoMapa;
 const nuevo=function(id){const m=/^([A-F])(\d)$/.exec(id);const svg=document.getElementById('mksvg');
  if(!m){base(id);if(svg)delete svg.dataset.sub;return}
  base(m[1]);if(!svg)return;svg.dataset.sub=id;capaMapa();verSitios(id==='F3'?K:19);
  const tg=document.getElementById('mktag');if(tg)tg.textContent=TAG[id]||'';
  const ley=document.getElementById('mkley');if(ley&&LEY2[id])ley.innerHTML=LEY2[id].map(([k,t])=>'<span><i class="sw '+k+'"></i>'+t+'</span>').join('')};
 nuevo.__ee=1;pasoMapa=nuevo;return true}

function montar(){
 const pf=document.querySelector('#mk .paso[data-k=F]');if(!pf||typeof PC==='undefined'||!envolverPaso())return false;if(document.querySelector('#mk .paso[data-k=F2]'))return true;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const T=tarjetas();let ant=pf;
 ['F2','F3','F4'].forEach(k=>{const s=document.createElement('section');s.className='pb paso ee-paso';s.dataset.k=k;
  s.innerHTML='<article class="card esc ee" style="--c:'+PC.F+'" aria-label="'+TAG[k]+'">'+T[k]+'</article>';ant.insertAdjacentElement('afterend',s);ant=s;
  const c=s.querySelector('.card');if(typeof vis!=='undefined'&&vis.observe)vis.observe(c);else c.classList.add('vis')});
 // el mapa sigue al paso visible, igual que los pasos del recorrido
 const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)pasoMapa(e.target.dataset.k)}),{rootMargin:'-45% 0px -45% 0px'});
 document.querySelectorAll('#mk .ee-paso').forEach(p=>obs.observe(p));
 // escenarios
 let R=800;const out=()=>{const p=CURVA[R][K],p0=CURVA[R][0],hab=Math.round(POP/(PLAZAS+K)/100)*100;
  document.getElementById('ee-kv').textContent=K;document.getElementById('ee-p').textContent=fmt(p,1)+' %';document.getElementById('ee-d').textContent='+'+fmt(p-p0,1);document.getElementById('ee-h').textContent=fmt(hab);
  document.getElementById('ee-bi').style.width=p+'%';document.getElementById('ee-b0').style.left=p0+'%';
  const n=llega(R);document.getElementById('ee-ok').textContent=p>=META?'Meta del 75 % alcanzada':'Faltan '+(n-K)+' plazas para el 75 %';
  if(document.getElementById('mksvg')&&document.getElementById('mksvg').dataset.sub==='F3')verSitios(K)};
 const rg=document.getElementById('ee-k');rg.addEventListener('input',()=>{K=+rg.value;out()});
 document.querySelectorAll('.ee-seg button').forEach(b=>b.addEventListener('click',()=>{R=+b.dataset.r;document.querySelectorAll('.ee-seg button').forEach(x=>x.setAttribute('aria-pressed',x===b));out()}));
 out();return true}
if(!montar()){const t=setInterval(()=>{if(montar())clearInterval(t)},200)}

/* ============ 02 a 06: el mismo patrón (criterio · escenarios · plausibilidad), con poco texto y todo con URL ============ */
Object.assign(F,{
 sdis:['Secretaría Distrital de Integración Social. Diagnóstico local de Kennedy 2023 (1.035.224 habitantes).','https://www.integracionsocial.gov.co/images/_docs/2024/Entidad/localidades/04062024-8-Kennedy-Diagnostico-2023.pdf'],
 luo:['Luo, W. y Wang, F. (2003). Measures of spatial accessibility to health care in a GIS environment (método de dos pasos: oferta ÷ demanda). Environment and Planning B, 30(6), 865–884.','https://doi.org/10.1068/b29120'],
 catastro:['Catastro Bogotá. Censo Inmobiliario 2026, apartado «8 Kennedy» (valor catastral 2022–2026).','https://www.catastrobogota.gov.co/sites/default/files/recursos/Documento_Censo_Inmobiliario_Vig_2026_20260331_publicar.pdf'],
 prop2:['Propuesta Bavaria Común: «Qué cambia, cuánto y cómo se mide» (71,2 ha, >14.000 viviendas del decreto vigente, 121.436 m² de naves, 14,9 t/día de orgánicos, compost al 40 %).','https://alejagoguti-cpu.github.io/red-de-problemas/propuesta.html#problemas'],
 clt:['Ali, O. y Raviola, S. (2025). The effects of community land trusts on neighborhood outcomes. Real Estate Economics, 53(3), 498–542.','https://ideas.repec.org/a/bla/reesec/v53y2025i3p498-542.html'],
 verde:['Lincoln Institute of Land Policy (2025). Equitable Urban Greening: el reverdecimiento fue factor de gentrificación en 17 de 28 ciudades (Anguelovski, Connolly y otros).','https://www.lincolninst.edu/publications/land-lines-magazine/articles/equitable-urban-greening/'],
 inf:['Infobae con datos de Fincaraíz (2026). Precio de venta a menos de 1 km de la Primera Línea del Metro: ≈12 % anual frente a ≈5 % en el resto de Bogotá.','https://www.infobae.com/colombia/2026/11/10/vivir-cerca-del-metro-de-bogota-seria-mas-costoso-el-precio-de-la-vivienda-podria-aumentar-cerca-de-12-al-ano/'],
 jtlu:['Vergel-Tovar, C. E. y otros (2025). Estimation of the anticipation effects of the metro project on real estate dynamics in Bogotá. Journal of Transport and Land Use, 18(1), 123–173.','https://jtlu.org/index.php/jtlu/article/view/2593'],
 unal2:['UNAL, Agencia de Noticias. «Vivir junto al Metro no aseguraría más valorización en Kennedy».','https://agenciadenoticias.unal.edu.co/detalle/vivir-junto-al-metro-no-aseguraria-mas-valorizacion-en-kennedy'],
 rmb:['Región Metropolitana Bogotá–Cundinamarca. Logística y distribución de alimentos (SIPSA-DANE 2022): 2.198.118 t a Corabastos.','https://regionmetropolitana.gov.co/sites/default/files/archivos/normatividad/2024-11-19/189_5-logistica-y-distribucion-de-alimentos.pdf'],
 carrot:['Carrot City (ResCUE-AB, Universidad de Bolonia). GreenHousing: 82 ha de cubiertas con huertas sin suelo darían 12.500 t/año, más de tres cuartos de las hortalizas de Bolonia.','https://www.torontomu.ca/carrotcity/board_pages/rooftops/greenhousing.html'],
 clinton:['Clinton, N. y otros (2018). A Global Geospatial Ecosystem Services Estimate of Urban Agriculture. Earth’s Future, 6, 40–60 (reseña de Eos).','https://eos.org/research-spotlights/urban-agriculture-could-provide-billions-in-ecosystem-services'],
 lfs:['Revisión de dos décadas de investigación sobre sistemas alimentarios locales (Agricultural Systems, 2021): lo local no es bueno por definición.','https://ui.adsabs.harvard.edu/abs/2021AgSys.19303226E'],
 uaesp:['Alcaldía de Bogotá (2026). «Miles de toneladas ya no llegan a Doña Juana»: más del 50 % de lo que llega es orgánico; cerca de 5.600 t/día.','https://bogota.gov.co/mi-ciudad/habitat/bogota-avanza-en-el-reciclaje-de-miles-de-toneladas-de-residuos'],
 bari:['Community composting: a multidisciplinary evaluation of an inclusive, participative, and eco-friendly approach (Cleaner Environmental Systems, 2022).','https://ricerca.uniba.it/retrieve/f408bec5-db2d-4b31-bd49-d284bb5f4741/Community-composting--A-multidisciplinary-evaluation-of-an_2022_Cleaner-Envi.pdf'],
 dhaka:['Evaluación de ciclo de vida del compostaje descentralizado en Dhaka (Journal of Material Cycles and Waste Management, 2025): menos impacto que el relleno.','https://link.springer.com/article/10.1007/s10163-025-02340-2'],
 frc:['Decentralized Composting of Food Waste: A Perspective on Scientific Knowledge (Frontiers in Chemical Engineering, 2022): la evidencia a escala comunitaria aún es escasa.','https://www.frontiersin.org/journals/chemical-engineering/articles/10.3389/fceng.2022.850308']});

// gráfica de líneas genérica: series [{d:[[x,y]...],cls,lb}], meta opcional
function lineas(o){const W=420,H=180,l=46,r=10,t=14,b=28,xs=o.series.flatMap(s=>s.d.map(p=>p[0])),ys=o.series.flatMap(s=>s.d.map(p=>p[1])).concat(o.meta!=null?[o.meta]:[]);
 const x0=Math.min(...xs),x1=Math.max(...xs),y0=o.y0!=null?o.y0:0,y1=Math.max(...ys)*1.08,X=v=>l+(v-x0)/(x1-x0)*(W-l-r),Y=v=>t+(1-(v-y0)/(y1-y0))*(H-t-b);
 let s='<svg class="ee-ch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+o.aria+'">';
 [0,.5,1].forEach(q=>{const v=y0+(y1-y0)*q;s+='<line class="g" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="ax" x="'+(l-5)+'" y="'+(Y(v)+3)+'" text-anchor="end">'+o.fy(v)+'</text>'});
 o.ticks.forEach(v=>s+='<text class="ax" x="'+X(v)+'" y="'+(H-12)+'" text-anchor="middle">'+v+'</text>');
 s+='<text class="ax" x="'+((l+W-r)/2)+'" y="'+(H-1)+'" text-anchor="middle">'+o.xl+'</text>';
 if(o.meta!=null)s+='<line class="mt" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(o.meta)+'" y2="'+Y(o.meta)+'"/><text class="mtx" x="'+(W-r)+'" y="'+(Y(o.meta)-4)+'" text-anchor="end">'+o.ml+'</text>';
 o.series.forEach(se=>{s+='<path class="'+se.cls+'" d="'+se.d.map((p,k)=>(k?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('')+'"/>';const e=se.d[se.d.length-1];if(se.lb)s+='<text class="lb" x="'+(X(e[0])-4)+'" y="'+(Y(e[1])-6)+'" text-anchor="end">'+se.lb+'</text>'});
 return s+'</svg>'}
const rango=(a,b,p)=>{const r=[];for(let v=a;v<=b+1e-9;v+=p)r.push(+v.toFixed(4));return r};
const big=(a,al,b,bl)=>'<div class="ee-big"><div><b>'+a+'</b><span>'+al+'</span></div><i>→</i><div><b class="m">'+b+'</b><span>'+bl+'</span></div></div>';
const li=arr=>'<ul class="ee-l">'+arr.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
const cab=(n,k,h,tg)=>'<div class="num"><span>'+n+'</span> / 06 · <b>'+k+'</b></div><h2>'+h+'</h2><p class="tag">'+tg+'</p>';

// crecimiento: tasa 2023→2024 (cálculo propio con dos estimaciones) y carga por plaza
const G0=(POP/1035224-1)*100,CAGR=Math.pow(80.310/60.197,1/4)-1,KM=12500/82;
const P={
 B:{n:'02',tag:{2:'criterio: servicios al ritmo de la gente',3:'escenarios: ¿y si la población crece más?',4:'plausibilidad: carga por plaza'},
  c2:()=>cab('02','Criterio de diseño','Servicios al ritmo de la gente','Que cada plaza no atienda a más gente')+big('79.800','hab. por plaza hoy','32.400','con la malla de 32')+
   li(['<em>Accesibilidad = oferta ÷ demanda</em> en cada zona'+ref('luo'),'<em>La densidad local</em> es clave en la proximidad'+ref('bruno'),'<em>Malla de plazas</em> donde vive más gente'+ref('calc')])+fuentes(['pob','luo','bruno','calc']),
  esc:{lab:'Crecimiento anual',min:0,max:2,step:.05,v:+G0.toFixed(2),f:v=>fmt(v,2)+' %',
   calc:v=>{const p15=POP*Math.pow(1+v/100,15),a=p15/PLAZAS,b=p15/32;return {kv:[[fmt(Math.round(p15/1000)*1000),'habitantes en 15 años'],[fmt(Math.round(a/100)*100),'hab./plaza con 13'],[fmt(Math.round(b/100)*100),'hab./plaza con 32']],ok:b<=79800?'Con la malla, cada plaza atiende menos gente que hoy':'Ni con la malla se baja la carga de hoy'}},
   nota:'Cálculo propio: población 2024'+ref('pob')+' × (1 + crecimiento)¹⁵; hoy crece '+fmt(G0,2)+' % al año'+ref('sdis','pob')+'.',src:['pob','sdis','calc']},
  c4:()=>cab('02','Plausibilidad','¿Es posible?','Sí: aun creciendo 2 % al año, la malla reduce la carga')+lineas({aria:'Habitantes por plaza en 15 años',xl:'años',ticks:[0,5,10,15],fy:v=>fmt(Math.round(v/1000))+' mil',y0:0,meta:79800,ml:'hoy 79.800',
    series:[{d:rango(0,15,1).map(t=>[t,POP*Math.pow(1.02,t)/PLAZAS]),cls:'l8',lb:'13 plazas · +2 %'},{d:rango(0,15,1).map(t=>[t,POP*Math.pow(1.02,t)/32]),cls:'l5',lb:'32 plazas · +2 %'}]})+
   li(['Kennedy creció '+fmt(G0,2)+' % entre 2023 y 2024'+ref('sdis','pob'),'Método de dos pasos, estándar para planear servicios'+ref('luo'),'Límite: son proyecciones, no censo'+ref('pob')])+fuentes(['sdis','pob','luo'])},
 C:{n:'03',tag:{2:'criterio: suelo con función, no solo con precio',3:'escenarios: ¿cuánto suelo sale del mercado?',4:'plausibilidad: valor y suelo común'},
  c2:()=>cab('03','Criterio de diseño','Suelo con función, no solo precio','Sacar el predio del mercado de suelo')+big('+33,4 %','valor catastral 2022–2026','71,2 ha','suelo común')+
   li(['<em>Suelo común</em>, sin torres ni lotes en venta'+ref('prop2'),'<em>Fideicomisos de tierra</em>: precios cercanos estables, sin desplazamiento detectado'+ref('clt'),'<em>Riesgo:</em> lo verde gentrificó 17 de 28 ciudades'+ref('verde')])+fuentes(['catastro','prop2','clt','verde']),
  esc:{lab:'Suelo común en el predio',min:0,max:71.2,step:.1,v:0,f:v=>fmt(v,1)+' ha',
   calc:v=>{const q=v/71.2;return {kv:[[fmt(q*100,0)+' %','del predio fuera del mercado'],['≈ '+fmt(Math.round(14000*(1-q)/100)*100),'viviendas en torre posibles'],[fmt(v,1)+' ha','suelo común']],ok:q>=1?'Predio completo fuera del mercado: meta de la propuesta':'Meta de la propuesta: 71,2 ha'}},
   nota:'Supuesto lineal sobre las >14.000 viviendas que permite el decreto vigente en el predio'+ref('prop2')+'.',src:['prop2']},
  c4:()=>cab('03','Plausibilidad','¿Es posible?','El valor sube solo; el suelo común se protege')+lineas({aria:'Valor catastral de Kennedy y tendencia',xl:'año',ticks:[2022,2026,2031,2036,2041],fy:v=>fmt(v,0),y0:0,
    series:[{d:[[2022,60.197],[2023,65.248],[2024,70.123],[2025,77.323],[2026,80.310]],cls:'l5',lb:'Catastro'},{d:rango(2026,2041,1).map(a=>[a,80.310*Math.pow(1+CAGR,a-2026)]),cls:'l8',lb:'si sigue '+fmt(CAGR*100,1)+' %/año'}]})+
   li(['Billones de pesos; 2022–2026 de Catastro'+ref('catastro')+', después tendencia (cálculo propio)','Fideicomisos de tierra: estabilizan o suben precios cercanos sin desplazamiento detectado'+ref('clt'),'Límite: reverdecer puede expulsar si no se protege el uso'+ref('verde')])+fuentes(['catastro','clt','verde'])},
 D:{n:'04',tag:{2:'criterio: que el precio no expulse',3:'escenarios: ¿y si la tendencia sigue?',4:'plausibilidad: presión de precios'},
  c2:()=>cab('04','Criterio de diseño','Que el precio no expulse','Proteger lo comunitario y lo productivo')+big('≈ 12 %','al año cerca del metro','0','lotes en venta')+
   li(['<em>Avisos de venta</em> suben ≈12 % junto a la línea'+ref('inf'),'<em>Gestión comunitaria</em> del suelo'+ref('clt'),'<em>121.436 m²</em> de naves para uso común'+ref('prop2')])+fuentes(['inf','clt','prop2']),
  esc:{lab:'Años',min:0,max:15,step:1,v:0,f:v=>v+' años',
   calc:v=>{const a=100*Math.pow(1.12,v),b=100*Math.pow(1.05,v);return {kv:[[fmt(a,0),'índice cerca del metro'],[fmt(b,0),'índice resto de Bogotá'],['+'+fmt((a/b-1)*100,0)+' %','brecha']],ok:'Si la tendencia se mantuviera (no es predicción)'}},
   nota:'Índice 2026 = 100 con ≈12 % y ≈5 % anual de los avisos'+ref('inf')+'. Avisos de venta, no transacciones.',src:['inf']},
  c4:()=>cab('04','Plausibilidad','¿Es posible?','La presión existe; la especulación no está medida')+lineas({aria:'Índice de precios en 15 años',xl:'años',ticks:[0,5,10,15],fy:v=>fmt(v,0),y0:0,
    series:[{d:rango(0,15,1).map(t=>[t,100*Math.pow(1.12,t)]),cls:'l5',lb:'cerca del metro'},{d:rango(0,15,1).map(t=>[t,100*Math.pow(1.05,t)]),cls:'l8',lb:'resto de Bogotá'}]})+
   li(['Precios suben a 800 m de la Línea 1 desde 2016'+ref('jtlu'),'Cercanía no garantiza valorización en Kennedy'+ref('unal2'),'Fideicomisos de tierra: sin desplazamiento detectado'+ref('clt')])+fuentes(['jtlu','unal2','clt','inf'])},
 A:{n:'05',tag:{2:'criterio: producir cerca',3:'escenarios: ¿y si cultivamos cubiertas?',4:'plausibilidad: agricultura urbana'},
  c2:()=>cab('05','Criterio de diseño','Producir cerca','Una parte de lo que se come, del barrio')+big('2,2 M t','a Corabastos en 2022','huertas','en cubiertas y colegios')+
   li(['<em>Bolonia:</em> 82 ha de cubiertas = 12.500 t/año'+ref('carrot'),'<em>Huertas + acopio</em> en Bavaria Común'+ref('prop2'),'<em>Potencial global</em> de la agricultura urbana'+ref('clinton')])+fuentes(['rmb','carrot','prop2','clinton']),
  esc:{lab:'Cubiertas con huerta',min:0,max:82,step:1,v:0,f:v=>v+' ha',
   calc:v=>{const t=v*KM;return {kv:[[fmt(Math.round(t)),'t al año'],[fmt(t/52,0),'t por semana'],[fmt(t/2198118*100,2)+' %','de lo que llegó a Corabastos']],ok:'Rendimiento de Bolonia: '+fmt(KM,0)+' t/ha al año'}},
   nota:'Cálculo propio: 12.500 t ÷ 82 ha'+ref('carrot')+'; Corabastos 2022'+ref('rmb')+'. Sin meta: falta la demanda local.',src:['carrot','rmb']},
  c4:()=>cab('05','Plausibilidad','¿Es posible?','Complementa; no reemplaza a Corabastos')+lineas({aria:'Toneladas al año según hectáreas de cubiertas',xl:'hectáreas de cubiertas',ticks:[0,20,40,60,82],fy:v=>fmt(Math.round(v/1000))+' mil t',y0:0,
    series:[{d:rango(0,82,2).concat([82]).map(h=>[h,h*KM]),cls:'l5',lb:'t/año'}]})+
   li(['Bolonia: más de ¾ de sus hortalizas con cubiertas'+ref('carrot'),'Agricultura urbana: alimento y servicios ecosistémicos'+ref('clinton'),'Límite: lo local no es bueno por definición'+ref('lfs')])+fuentes(['carrot','clinton','lfs'])},
 E:{n:'06',tag:{2:'criterio: lo orgánico vuelve a la tierra',3:'escenarios: ¿y si cada plaza composta?',4:'plausibilidad: compostaje en el barrio'},
  c2:()=>cab('06','Criterio de diseño','Que lo orgánico vuelva a la tierra','Compostar cerca de donde se genera')+big('> 50 %','orgánico en Doña Juana','14,9 t/día','tratadas en Kennedy')+
   li(['<em>Más de la mitad</em> de lo que llega al relleno es orgánico'+ref('uaesp'),'<em>Cada plaza</em> es un punto de compostaje'+ref('prop2'),'<em>Compost:</em> 40 % de la masa'+ref('prop2')])+fuentes(['uaesp','prop2']),
  esc:{lab:'Plazas que compostan',min:0,max:19,step:1,v:0,f:v=>String(v),
   calc:v=>{const t=5+9.9*v/19;return {kv:[[fmt(t,1),'t/día tratadas'],[fmt(t*.4,1),'t/día de compost'],[fmt(t/14.9*100,0)+' %','de la meta']],ok:v>=19?'Meta de la propuesta alcanzada: 14,9 t/día':'Meta de la propuesta: 14,9 t/día'}},
   nota:'Incluye 5 t/día de Corabastos; las 9,9 t/día restantes se reparten por igual entre 19 plazas (supuesto)'+ref('prop2')+'.',src:['prop2']},
  c4:()=>cab('06','Plausibilidad','¿Es posible?','Sí, con la escala de la propuesta')+lineas({aria:'Toneladas al día tratadas según plazas que compostan',xl:'plazas que compostan',ticks:[0,5,10,15,19],fy:v=>fmt(v,0)+' t',y0:0,meta:14.9,ml:'meta 14,9 t/día',
    series:[{d:rango(0,19,1).map(k=>[k,5+9.9*k/19]),cls:'l5',lb:''}]})+
   li(['Compostaje comunitario evaluado con ciclo de vida y costos'+ref('bari'),'Descentralizado: menos impacto que el relleno'+ref('dhaka'),'Límite: aún hay poca evidencia a escala de barrio'+ref('frc')])+fuentes(['bari','dhaka','frc','uaesp'])}};

function montarOtros(){
 if(!document.querySelector('#mk .paso[data-k=F4]'))return false;if(document.querySelector('#mk .paso[data-k=B2]'))return true;
 const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)pasoMapa(e.target.dataset.k)}),{rootMargin:'-45% 0px -45% 0px'});
 Object.keys(P).forEach(L=>{const p=P[L],paso=document.querySelector('#mk .paso[data-k='+L+']');if(!paso)return;Object.assign(TAG,{[L+'2']:p.tag[2],[L+'3']:p.tag[3],[L+'4']:p.tag[4]});
  const e=p.esc,id='ee'+L;
  const c3=cab(p.n,'Escenarios','¿Qué pasaría si…?','Mueve la barra')+
   '<div class="ee-ctl"><label for="'+id+'-r">'+e.lab+' <b id="'+id+'-v">'+e.f(e.v)+'</b></label><input id="'+id+'-r" type="range" min="'+e.min+'" max="'+e.max+'" step="'+e.step+'" value="'+e.v+'"/></div>'+
   '<div class="ee-kv" id="'+id+'-o" aria-live="polite"></div><p class="ee-ok" id="'+id+'-ok"></p><p class="ee-nt">'+e.nota+'</p>'+fuentes(e.src);
  const html={2:p.c2(),3:c3,4:p.c4()};let ant=paso;
  [2,3,4].forEach(k=>{const s=document.createElement('section');s.className='pb paso ee-paso';s.dataset.k=L+k;
   s.innerHTML='<article class="card esc ee" style="--c:'+PC[L]+'" aria-label="'+p.tag[k]+'">'+html[k]+'</article>';ant.insertAdjacentElement('afterend',s);ant=s;
   const c=s.querySelector('.card');if(typeof vis!=='undefined'&&vis.observe)vis.observe(c);else c.classList.add('vis');obs.observe(s)});
  const rg=document.getElementById(id+'-r'),pinta=()=>{const v=+rg.value,r=e.calc(v);document.getElementById(id+'-v').textContent=e.f(v);
   document.getElementById(id+'-o').innerHTML=r.kv.map(([a,b])=>'<div><b>'+a+'</b><span>'+b+'</span></div>').join('');document.getElementById(id+'-ok').textContent=r.ok};
  rg.addEventListener('input',pinta);pinta()});
 return true}
if(!montarOtros()){const t2=setInterval(()=>{if(montarOtros())clearInterval(t2)},250)}

})();
