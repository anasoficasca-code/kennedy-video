/* ============ LAS SEIS CAPAS (al final del recorrido por los seis problemas) ============
   Escena por scroll entre el mapa de los seis problemas (#mk) y «Ningún problema ocurre solo»:
   1) las seis capas del mapa aparecen una encima de la otra, cada una con su indicador principal;
   2) las capas bajan y se funden en un solo territorio, y los seis indicadores se juntan en un tablero.
   Cada capa es una foto del mapa del recorrido en ese paso (mismo encuadre de Kennedy): el 3D del paso (edificios,
   volúmenes de densidad o metro) y el dibujo del paso con sus estilos reales. Nada se redibuja a mano.
   Las cifras son las de la tarjeta de cada paso del recorrido (objeto ESC de index.html), con sus mismas fuentes. */
(function(){
'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const cl=x=>Math.max(0,Math.min(1,x)),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,eoc=x=>1-Math.pow(1-x,3);
const ICOK={F:'mercado',B:'persona',C:'suelo',D:'precio',A:'camion',E:'basura'};
const SQ=.6,GAP=980,M='matrix(0.86603 -0.28000 0.50000 0.48497 0 0)';

/* cifra principal de la tarjeta de cada paso del recorrido (ESC en index.html), con su misma fuente */
const IND={ // cada cifra con la URL de su fuente
 F:{v:'28 %',t:'tiene una plaza a ≤ 15 min · suroccidente',a:'DANE-SIPSA 2025 · SDP 2022'},
 B:{v:'1.037.929',t:'habitantes en 2024 · 434 hab/ha en Patio Bonito, 90 en Tintal Norte',a:'SaluData · Kennedy 2024',u:'https://saludata.saludcapital.gov.co/osb/wp-content/uploads/2024/12/Kennedy_MasBienestar_2024_v1_2.pdf'},
 C:{v:'+33,4 %',t:'valor catastral total de Kennedy (suelo + construcciones), 2022 → 2026',a:'Catastro Bogotá · Censo Inmobiliario 2026',u:'https://www.catastrobogota.gov.co/sites/default/files/recursos/Documento_Censo_Inmobiliario_Vig_2026_20260331_publicar.pdf'},
 D:{v:'≈ 12 %',t:'al año suben los avisos de venta a < 1 km de la línea (5 % en el resto de Bogotá) · hipótesis',a:'Infobae con datos de Fincaraíz, 2026',u:'https://www.infobae.com/colombia/2026/11/10/vivir-cerca-del-metro-de-bogota-seria-mas-costoso-el-precio-de-la-vivienda-podria-aumentar-cerca-de-12-al-ano/'},
 A:{v:'2,2 M t',t:'de alimentos llegaron a Corabastos en 2022 (2.198.118 t)',a:'Región Metropolitana · SIPSA-DANE 2022',u:'https://regionmetropolitana.gov.co/sites/default/files/archivos/normatividad/2024-11-19/189_5-logistica-y-distribucion-de-alimentos.pdf'},
 E:{v:'745',t:'contenedores de basura · 625 de reciclaje',a:'UAESP/IDECA contenerización'}};
const indicador=id=>IND[id]||{v:'—',t:'',a:''};

const css=`
#kcap{position:relative;z-index:1;height:430vh;background:var(--campo-0,#050607);pointer-events:auto;border-top:1px solid var(--linea,rgba(214,228,222,.12))}
#kcap .kc-v{position:sticky;top:0;height:100vh;overflow:hidden;display:grid;grid-template-columns:minmax(0,40fr) minmax(0,60fr)}
#kcap .kc-txt{position:relative;z-index:3;padding:13vh 2vw 6vh 5vw;display:flex;flex-direction:column}
#kcap .kc-k{font:500 10.5px var(--letra-dato,'Geist Mono',monospace);letter-spacing:.2em;text-transform:uppercase;color:#7a8480}
#kcap .kc-k b{color:#cfff5e;font-weight:500}
#kcap .kc-fase{position:relative;min-height:13.5em}
#kcap .kc-f{position:absolute;inset:0 0 auto 0;transition:opacity .6s,transform .6s cubic-bezier(.2,.7,.2,1)}
#kcap .kc-f.off{opacity:0;transform:translateY(14px);pointer-events:none}
#kcap h2{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:300;text-transform:uppercase;font-size:clamp(38px,4.6vw,72px);line-height:.92;margin:14px 0 16px;color:#eaefed;letter-spacing:.005em}
#kcap p{margin:0;color:#a9b3af;font-size:15px;line-height:1.6;max-width:44ch}
#kcap p em{font-style:normal;color:#eaefed}
#kcap .kc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px;max-width:520px}
#kcap .kc-slot{height:var(--th,96px);border:1px dashed rgba(214,228,222,.1);opacity:0;transition:opacity .4s}
#kcap.junto .kc-slot{opacity:1}
#kcap .kc-fin{margin-top:18px;opacity:0;transform:translateY(10px);transition:opacity .6s,transform .6s;pointer-events:none}
#kcap.listo .kc-fin{opacity:1;transform:none;pointer-events:auto}
#kcap .kc-fin a{display:inline-flex;align-items:center;gap:8px;padding:11px 16px;background:#cfff5e;color:#050607;text-decoration:none;font:500 11px var(--letra-dato,'Geist Mono',monospace);letter-spacing:.1em;text-transform:uppercase}
#kcap .kc-fin a .ico{width:16px;height:16px}
#kcap .kc-mapa{position:relative;z-index:1}
#kcap svg.kc-svg{position:absolute;inset:4vh 0 4vh 0;width:100%;height:92vh;overflow:visible}
#kcap .kl-losa{fill:rgba(8,10,11,.62);stroke:var(--pc);stroke-width:1.6;vector-effect:non-scaling-stroke;transition:fill-opacity .6s}
#kcap .kl.lista .kl-losa{fill-opacity:0}
#kcap .kl-3d,#kcap .kl-svg{opacity:0;transition:opacity .6s}
#kcap .kl.lista .kl-svg{opacity:1}
#mksvg.kc-shot,#mksvg.kc-shot *{transition:none!important;animation:none!important}
#kcap .kl-n{font:500 150px 'Geist Mono',monospace;fill:var(--pc);letter-spacing:.06em}
#kcap .kc-tags{position:absolute;inset:0;pointer-events:none;z-index:4}
#kcap .kc-tag{--c:#fff;position:absolute;left:0;top:0;width:var(--tw,240px);height:var(--th,96px);padding:11px 12px 10px 14px;background:rgba(8,10,11,.86);border:1px solid rgba(214,228,222,.14);border-left:2px solid var(--c);opacity:0;will-change:transform,opacity;display:flex;flex-direction:column;gap:3px;overflow:hidden}
#kcap .kc-tag .h{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:7px;font:500 9.5px var(--letra-dato,'Geist Mono',monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--c)}
#kcap .kc-tag .h .ico{width:15px;height:15px;color:var(--c);stroke:var(--c)}
#kcap .kc-tag b{font:300 28px/1 'Barlow Condensed','Arial Narrow',sans-serif;color:#eaefed;letter-spacing:.01em}
#kcap .kc-tag b.calc{color:var(--c)}
#kcap .kc-tag span{font-size:11.5px;line-height:1.3;color:#a9b3af;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#kcap .kc-tag em a{color:inherit;text-decoration:none;pointer-events:auto}
#kcap .kc-tag em a:hover{color:#eaefed;text-decoration:underline}
#kcap .kc-tag em{font-style:normal;font:400 9.5px var(--letra-dato,'Geist Mono',monospace);color:#6c7672;margin-top:auto}
#kcap .kc-guia{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3}
#kcap .kc-guia line{stroke:var(--c);stroke-width:1;stroke-dasharray:2 3;opacity:.55}
@media (max-width:760px){
 #kcap{height:400vh}
 #kcap .kc-v{grid-template-columns:1fr;grid-template-rows:auto 1fr}
 #kcap .kc-txt{padding:52px 16px 0;position:static}
 #kcap .kc-fase{min-height:9.5em}
 #kcap h2{font-size:34px;margin:8px 0 8px}
 #kcap p{font-size:13.5px}
 #kcap .kc-grid{position:absolute;left:16px;right:16px;top:calc(52px + 11.5em);margin:0;gap:6px;max-width:none}
 #kcap .kc-fin{position:absolute;left:16px;right:16px;top:calc(52px + 11.5em + 3 * var(--th,52px) + 26px);margin:0}
 #kcap svg.kc-svg{inset:0;height:100%}
 #kcap .kc-tag{padding:7px 8px 6px 9px;gap:2px}
 #kcap .kc-tag b{font-size:20px}
 #kcap .kc-tag span{display:none}
 #kcap .kc-tag em{display:none}
 #kcap .kc-tag .h{font-size:8.5px;letter-spacing:.08em}
}`;

let S=null; // estado de la escena

function construir(sec){
 const src=document.getElementById('mksvg');
 if(!src||typeof MK==='undefined'||!MK.P||!MK.lim||!src.querySelector('.mk-losa'))return false;
 const losaD=src.querySelector('.mk-losa').getAttribute('d');
 // contorno proyectado (para el ancla de cada etiqueta: el punto más a la derecha de la losa)
 let xr=-1e9,yr=0,x0=1e9,y0=1e9,y1=-1e9;MK.lim.forEach(p=>{const q=MK.P(p[0],p[1],0);if(q[0]>xr){xr=q[0];yr=q[1]}x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])});
 const ord=(typeof ORDEN!=='undefined'?ORDEN:['F','B','C','D','A','E']).slice(); // de abajo hacia arriba: la causa raíz es la base
 const N=ord.length,top=y0*SQ-(N-1)*GAP-260,bot=y1*SQ+380,MOB=innerWidth<=760;
 const vbx0=x0-220,vbx1=MOB?xr+5200:xr+3600;
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('class','kc-svg');svg.setAttribute('viewBox',vbx0+' '+top+' '+(vbx1-vbx0)+' '+(bot-top));svg.setAttribute('preserveAspectRatio',MOB?'xMidYMax meet':'xMinYMid meet');svg.setAttribute('aria-hidden','true');
 const L=ord.map((id,i)=>{
  const g=document.createElementNS(NS,'g');g.setAttribute('class','kl');g.style.setProperty('--pc',PC[id]);g.style.opacity=0;
  const inner=document.createElementNS(NS,'g');inner.setAttribute('transform','scale(1 '+SQ+')');
  // foto del 3D del paso, foto del dibujo del paso y el borde de la losa en el color del problema
  inner.innerHTML='<image class="kl-3d" preserveAspectRatio="none"/><image class="kl-svg" preserveAspectRatio="none"/><g transform="'+M+'"><path class="kl-losa" d="'+losaD+'"/></g>';
  g.appendChild(inner);svg.appendChild(g);
  return {id,g,i,off:-i*GAP,ay:yr*SQ,ind:indicador(id)}});
 const mapa=sec.querySelector('.kc-mapa');mapa.appendChild(svg);
 // guías (línea punteada de la capa a su etiqueta) y etiquetas
 const guia=document.createElementNS(NS,'svg');guia.setAttribute('class','kc-guia');guia.setAttribute('aria-hidden','true');sec.querySelector('.kc-v').appendChild(guia);
 const tags=sec.querySelector('.kc-tags');
 L.forEach(l=>{const t=document.createElement('div');t.className='kc-tag';t.style.setProperty('--c',PC[l.id]);
  const nombre=typeof byId!=='undefined'&&byId[l.id]?byId[l.id].t:l.id;
  t.innerHTML='<div class="h">'+(typeof ic==='function'?ic(ICOK[l.id]):'')+String(l.i+1).padStart(2,'0')+' · '+esc(nombre)+'</div><b'+(l.ind.c?' class="calc"':'')+'>'+esc(l.ind.v)+'</b><span>'+esc(l.ind.t)+'</span><em>'+(l.ind.u?'<a href="'+l.ind.u+'" target="_blank" rel="noopener">'+esc(l.ind.a)+' ↗</a>':esc(l.ind.a))+'</em>';
  tags.appendChild(t);l.tag=t;
  const ln=document.createElementNS(NS,'line');ln.style.setProperty('--c',PC[l.id]);guia.appendChild(ln);l.ln=ln});
 // casillas del tablero final, en el mismo orden del recorrido
 const grid=sec.querySelector('.kc-grid');grid.innerHTML=L.map(()=>'<div class="kc-slot"></div>').join('');L.forEach((l,i)=>l.slot=grid.children[i]);
 S={sec,svg,L,xr,MOB};medir();return true}

/* ---------- fotos de cada paso del mapa del recorrido ---------- */
const cuadros=n=>new Promise(r=>{let k=0,hecho=0;const fin=()=>{if(!hecho){hecho=1;r()}};const f=()=>{if(++k>=n)fin();else requestAnimationFrame(f)};requestAnimationFrame(f);setTimeout(fin,90*n)});
const PROPS=['display','visibility','opacity','fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin','paint-order','vector-effect','font-family','font-size','font-weight','letter-spacing','text-anchor','dominant-baseline','text-transform','filter','mix-blend-mode'];
const URLRE=/url\("?[^#")]*#([^")]+)"?\)/g;
// el SVG del mapa tal como se ve (estilos calculados en línea), convertido en imagen
async function fotoSVG(src){const ori=[src,...src.querySelectorAll('*')],k=src.cloneNode(true),cop=[k,...k.querySelectorAll('*')],quita=[];
 ori.forEach((e,i)=>{const cs=getComputedStyle(e),c=cop[i];if(i&&cs.display==='none'){quita.push(c);return}
  c.setAttribute('style',PROPS.map(p=>{let v=cs.getPropertyValue(p);if(!v)return '';v=v.replace(URLRE,'url(#$1)');return p+':'+v}).filter(Boolean).join(';'));c.removeAttribute('class')});
 quita.forEach(c=>c.remove());const r=src.getBoundingClientRect();k.setAttribute('xmlns',NS);k.setAttribute('width',r.width);k.setAttribute('height',r.height);k.removeAttribute('id');
 const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(k));await img.decode();
 const c=document.createElement('canvas'),d=Math.min(2,devicePixelRatio||1)*1.5;c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/png')}
function marco(src){const r=src.getBoundingClientRect(),inv=src.getScreenCTM().inverse(),pt=src.createSVGPoint();pt.x=r.left;pt.y=r.top;const a=pt.matrixTransform(inv);pt.x=r.right;pt.y=r.bottom;const b=pt.matrixTransform(inv);return [a.x,a.y,b.x-a.x,b.y-a.y]}
const pon=(im,url,f)=>{im.setAttribute('href',url);im.setAttribute('x',f[0].toFixed(1));im.setAttribute('y',f[1].toFixed(1));im.setAttribute('width',f[2].toFixed(1));im.setAttribute('height',f[3].toFixed(1))};
// pone el mapa del recorrido en cada paso (sin animación, con el encuadre de Kennedy) y lo fotografía; solo cuando ese mapa no está en pantalla
async function fotos(){if(!S||S.fotos||S.tomando)return;const src=document.getElementById('mksvg'),caja=document.querySelector('#mk .mk-mapa');if(!src||!caja||typeof pasoMapa!=='function')return;
 const rc=caja.getBoundingClientRect();if(rc.bottom>0&&rc.top<innerHeight)return;
 const gl=typeof M3!=='undefined'&&M3.r;if(gl&&!M3.edif)return; // los edificios aún no cargan
 S.tomando=1;const antes=MK.paso,mov=typeof MOV!=='undefined'?MOV.on:null;
 try{if(mov!==null)MOV.on=false;src.classList.add('kc-shot');
  for(const l of S.L){pasoMapa(l.id);await cuadros(2);
   cancelAnimationFrame(MK.rafv);if(MK.VBK){MK.vbAct=MK.VBK.slice();MK.vb=MK.vbAct;src.setAttribute('viewBox',MK.vbAct.map(v=>v.toFixed(1)).join(' '))}escalarMapa();await cuadros(2);
   const f=marco(src);let u3='';if(gl&&typeof dibujar3D==='function'&&M3.obj){dibujar3D();u3=M3.r.domElement.toDataURL('image/png')}
   const us=await fotoSVG(src);if(u3)pon(l.g.querySelector('.kl-3d'),u3,f);pon(l.g.querySelector('.kl-svg'),us,f);l.u3=!!u3;l.g.classList.add('lista')}
  S.fotos=1}catch(e){console.warn('capas: no se pudo fotografiar el mapa',e)}
 finally{src.classList.remove('kc-shot');if(mov!==null)MOV.on=mov;if(antes)pasoMapa(antes);S.tomando=0;pedirPintar()}}
let pedirPintar=()=>{};
function medir(){if(!S)return;const MOB=innerWidth<=760,tw=MOB?(S.sec.querySelector('.kc-grid').clientWidth-6)/2:Math.min(250,(S.sec.querySelector('.kc-grid').clientWidth-10)/2),th=MOB?54:124;
 S.sec.style.setProperty('--tw',tw+'px');S.sec.style.setProperty('--th',th+'px');S.tw=tw;S.th=th}

function pintar(){if(!S)return;if(!S.fotos&&!S.tomando){const t=performance.now();if(!S.tf||t-S.tf>500){S.tf=t;fotos()}}
 const r=S.sec.getBoundingClientRect(),span=S.sec.offsetHeight-innerHeight,p=cl(-r.top/span);
 const N=S.L.length,col=eio(cl((p-.56)/.2)),junta=cl((p-.62)/.24);
 S.sec.classList.toggle('junto',junta>.02);S.sec.classList.toggle('listo',junta>.97);
 S.sec.querySelectorAll('.kc-f').forEach((f,i)=>f.classList.toggle('off',i===0?col>.5:col<=.5));
 const vr=S.sec.querySelector('.kc-v').getBoundingClientRect(),ctm=S.svg.getScreenCTM();if(!ctm)return;
 const AN=S.L.map(l=>{const a=RM?(p>.04+l.i*.07?1:0):eoc(cl((p-.04-l.i*.07)/.1)),y=l.off*(1-col)-(1-a)*700,pt=S.svg.createSVGPoint();pt.x=S.xr;pt.y=l.ay+y;return pt.matrixTransform(ctm).y-vr.top-S.th/2});
 {const idx=AN.map((y,i)=>i).sort((u,v)=>AN[u]-AN[v]),G=S.th+8,ys=idx.map(i=>AN[i]);for(let k=1;k<ys.length;k++)ys[k]=Math.max(ys[k],ys[k-1]+G);const sh=(AN[idx[0]]+AN[idx[idx.length-1]])/2-(ys[0]+ys[ys.length-1])/2;let lo=8-ys[0],hi=vr.height-8-S.th-ys[ys.length-1];const d=Math.max(lo,Math.min(hi,sh));idx.forEach((i,k)=>AN[i]=ys[k]+d)}
 S.L.forEach((l,i)=>{
  const a=RM?(p>.04+i*.07?1:0):eoc(cl((p-.04-i*.07)/.1));          // aparición de la capa i
  const y=l.off*(1-col)-(1-a)*700;                                  // apilada → fundida; entra desde arriba
  l.g.setAttribute('transform','translate(0,'+y.toFixed(1)+')');l.g.style.opacity=a.toFixed(3);
  // al fundirse queda el 3D de la capa base (edificios) y encima el dibujo de los seis pasos
  const im=l.g.querySelector('.kl-3d');if(im&&l.u3)im.style.opacity=(i===0?1:1-col).toFixed(2);
  const lo0=l.g.querySelector('.kl-losa');if(lo0)lo0.style.strokeOpacity=(i===0?1:1-col).toFixed(2);
  // ancla en pantalla (borde derecho de la losa)
  const pt=S.svg.createSVGPoint();pt.x=S.xr;pt.y=l.ay+y;const sp=pt.matrixTransform(ctm);
  const ax=sp.x-vr.left+(S.MOB?6:18),ay=AN[i];
  const sr=l.slot.getBoundingClientRect(),bx=sr.left-vr.left,by=sr.top-vr.top;
  const q=RM?(junta>.5?1:0):eio(cl((junta-(N-1-i)*.05)/(1-(N-1)*.05)));
  const axc=Math.min(ax,vr.width-S.tw-8),x=axc+(bx-axc)*q,yy=ay+(by-ay)*q;
  l.tag.style.transform='translate('+x.toFixed(1)+'px,'+yy.toFixed(1)+'px)';l.tag.style.opacity=a.toFixed(3);
  // guía punteada mientras la etiqueta está junto a su capa
  const lo=a*(1-q)*(1-col);l.ln.setAttribute('x1',(sp.x-vr.left).toFixed(1));l.ln.setAttribute('y1',(sp.y-vr.top).toFixed(1));l.ln.setAttribute('x2',x.toFixed(1));l.ln.setAttribute('y2',(yy+S.th/2).toFixed(1));l.ln.style.opacity=lo.toFixed(2)});
}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function montar(){
 const mk=document.getElementById('mk');if(!mk||typeof PC==='undefined')return false;if(document.getElementById('kcap'))return true;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const sec=document.createElement('div');sec.id='kcap';sec.setAttribute('aria-label','Las seis capas de Kennedy y sus indicadores');
 const fl=typeof ic==='function'?ic('flecha'):'→';
 sec.innerHTML='<div class="kc-v"><div class="kc-txt"><div class="kc-k"><b>Las seis capas</b> · un mismo suelo</div><div class="kc-fase">'+
  '<div class="kc-f"><h2>Seis capas,<br>un solo territorio</h2><p>Cada problema deja su propia huella sobre Kennedy. Puestas <em>una encima de la otra</em>, la causa raíz, la centralización, queda en la base.</p></div>'+
  '<div class="kc-f off"><h2>Los indicadores<br>se juntan</h2><p>Al bajar, las capas se funden en un mismo mapa. Ningún indicador explica el territorio solo: <em>se leen juntos</em>, y de ahí salen los criterios de diseño.</p></div></div>'+
  '<div class="kc-grid"></div><div class="kc-fin"><a href="#criterios" data-kcrit>Del diagnóstico a los criterios '+fl+'</a></div></div>'+
  '<div class="kc-mapa"></div><div class="kc-tags"></div></div>';
 mk.insertAdjacentElement('afterend',sec);
 sec.querySelector('[data-kcrit]').addEventListener('click',ev=>{const c=document.getElementById('criterios');if(c){ev.preventDefault();c.scrollIntoView({behavior:RM?'auto':'smooth'})}});
 // se construye cuando la escena se acerca (el mapa original ya está dibujado)
 let raf=0;const tick=()=>{raf=0;pintar()};const pedir=()=>{if(!raf)raf=requestAnimationFrame(tick)};pedirPintar=pedir;
 const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting&&!S){if(construir(sec))pedir()}}),{rootMargin:'100% 0px 100% 0px'});io.observe(sec);
 addEventListener('scroll',()=>{if(S)pedir()},{passive:true});
 let rz=0;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(!S)return;const MOB=innerWidth<=760;if(MOB!==S.MOB){S.svg.remove();S.sec.querySelector('.kc-guia').remove();S.sec.querySelector('.kc-tags').innerHTML='';S=null;construir(sec)}medir();pedir()},200)});
 return true}
if(!montar()){const t=setInterval(()=>{if(montar())clearInterval(t)},150)}
})();
