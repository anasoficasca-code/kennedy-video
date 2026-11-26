// Visor «Indicadores en 3D» (picos/index.html): los picos de cada índice sobre el territorio de Kennedy.
// Se usa como una persona: el cursor hace clic en la lista de índices y en «Ver varios a la vez»; la cámara
// del visor solo orbita despacio (su autoRotate) y se desplaza con suavidad, sin acercamientos bruscos.
// Estados ABSOLUTOS e idempotentes: ccl · se · cruce · coinciden · relaciones
import gsap from 'gsap';
import { registrar, hasta } from '../pagina.js';
import { moverCursor, clic, centroDe, ocultarCursor, cursor } from './cruces.js';

const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const nuevo = (win) => (win.__tok = (win.__tok || 0) + 1);

/* Referencias en el marco del visor (m; x este, y norte).
   · Corabastos: alineado cruzando los edificios del visor con los de la presentación (desfase −244 / −700 m;
     Corabastos (−715, −168) de la presentación → (−471, −532) aquí). Solo es referencia geográfica.
   · Sector de coincidencia: celdas de 200 m con CCL ≥ percentil 75 y SE ≤ percentil 25 (valores leídos de los
     colores de las mallas contra la escala de cada índice). El núcleo más compacto está en x −1400…−800,
     y −1200…−200 (incluye el máximo de CCL); en Corabastos CCL ≈ 0,57 (media 0,58) y SE ≈ 0,23 (media 0,34). */
const CORA = [-471, -532];
const SECTOR = [-1100, -700], SECTOR_R = 520;
const S = 0.1; // 1 unidad de escena = 10 m

const CSS = `
/* colores del formato: tinta #0b0d10, papel #f3f4ee, lima #cfff5e, grises; Barlow Condensed + Geist */
html,body,#view,#stage,#under{background:#0b0d10!important}
body{font-family:'Geist',system-ui,sans-serif;color:#f3f4ee}
aside{background:#0b0d10;border-right:1px solid rgba(214,228,222,.12);padding:22px 18px}
aside h1,.mtitle{display:none!important}
#list{margin-top:64px}   /* deja libre la marca del video (arriba a la izquierda) */
.ind button{background:#111418;border:1px solid rgba(214,228,222,.12);border-radius:6px;font:400 13.5px/1.25 'Geist',sans-serif;color:#c9cdc5;transition:border-color .25s,background .25s,color .25s}
.ind button .code{font:500 12.5px/1 'Geist Mono','Geist',monospace;color:#9aa09a;min-width:38px}
.ind button.on{background:#161a10;border-color:#cfff5e;color:#f3f4ee;font-weight:500}
.ind button.on .code{color:#cfff5e}
.yr{border-color:rgba(214,228,222,.25);color:#9aa09a;font:500 10.5px/1.5 'Geist',sans-serif}
.row,#hint,#notice,.seg,#pPlan,#menuBtn,.pfig{display:none!important}
.ctl{margin-top:18px;padding-top:14px;border-top:1px solid rgba(214,228,222,.12)}
.ctl>*{display:none!important}
.ctl>label.chk:has(#multi){display:flex!important;color:#c9cdc5;font:400 13.5px 'Geist',sans-serif}
input[type=checkbox]{border-color:#5a605a;background:#111418}
input[type=checkbox]:checked{background:#cfff5e!important;border-color:#cfff5e!important}
#under,#under.on{border-top:1px solid rgba(214,228,222,.12)!important;padding:10px 22px 12px!important}
#legend h3{font:500 17px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.03em;color:#f3f4ee}
#legend canvas{height:10px!important;border:0!important;border-radius:2px}
#legend .ticks{font:400 11.5px 'Geist Mono','Geist',monospace!important;color:#9aa09a!important}
#legend .ticks span:first-child::after{content:'  bajo';color:#6d736d}
#legend .ticks span:last-child::before{content:'alto  ';color:#6d736d}
#loading{background:#0b0d10;color:#9aa09a;font-family:'Geist',sans-serif}
.ed-pin{position:fixed;left:0;top:0;z-index:50;pointer-events:none;opacity:0;will-change:transform}
.ed-pin i{position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:#f3f4ee;border:2px solid #0b0d10}
.ed-pin s{position:absolute;left:-1px;bottom:0;width:2px;height:70px;background:#f3f4ee;text-decoration:none}
.ed-pin b{position:absolute;left:-1px;bottom:70px;white-space:nowrap;background:#f3f4ee;color:#0b0d10;font:600 17px/1 'Barlow Condensed',sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:6px 10px 6px}
.ed-pin small{display:block;margin-top:3px;font:500 10px/1 'Geist',sans-serif;letter-spacing:.08em;color:#5b605b}
.ed-pin.lima i{background:#cfff5e}
.ed-pin.lima s{background:#cfff5e}
.ed-pin.lima b{background:#cfff5e}
.ed-pin.izq b{left:auto;right:-1px}
.ed-pin.alto s{height:120px}
.ed-pin.alto b{bottom:120px}
`;

/** escena del visor a partir de un punto (m) */
const aEscena = (win, xm, ym, alto = 0) => { const x = xm * S, ys = ym * S; return new win.THREE.Vector3(x, win.eval(`terrainH(${x},${ys})`) + alto, -ys); };

function selec(win, codigos, multi) {
  const ids = codigos.map((c) => win.eval(`ind.findIndex(o=>o.d.code==='${c}'&&!o.d.year)`));
  win.document.getElementById('multi').checked = !!multi;
  win.eval(`setStack(false);period='now';selected=new Set([${ids}]);lastSel=${ids.length ? ids[ids.length - 1] : -1};sync()`);
}
/** en un salto no hay animación de crecimiento: los picos ya están a su altura */
const crecidos = (win) => win.eval('ind.forEach(o=>{if(o.group)o.t=o.on?1:0});dirty=true');
const boton = (win, code) => [...win.document.querySelectorAll('#list .ind button')].find((b) => b.querySelector('.code')?.textContent === code);

/** nombres 3D de los índices: con uno solo ayudan; con dos se cruzan con los marcadores, se apagan */
function nombres(win, on, rapido) { const p = { v: win.__nombres ?? 1 }; gsap.killTweensOf(win.__nomTw || {}); if (rapido) { win.__nombres = on ? 1 : 0; return; } win.__nomTw = p; gsap.to(p, { v: on ? 1 : 0, duration: 0.6, onUpdate: () => (win.__nombres = p.v) }); }

/** desplaza el objetivo de la cámara (y su zoom) con suavidad; la órbita lenta del visor sigue */
function mover(win, { x = 0, y = 0, zoom = 1.18, d = 3, rapido = false }) {
  const c = win.eval('controls'), cam = win.eval('camera'), v = aEscena(win, x, y, 6);
  const p = { k: 0, x0: c.target.x, y0: c.target.y, z0: c.target.z, zm0: cam.zoom };
  const poner = (k) => {
    const tx = p.x0 + (v.x - p.x0) * k, ty = p.y0 + (v.y - p.y0) * k, tz = p.z0 + (v.z - p.z0) * k;
    cam.position.x += tx - c.target.x; cam.position.y += ty - c.target.y; cam.position.z += tz - c.target.z;
    c.target.set(tx, ty, tz); cam.zoom = p.zm0 + (zoom - p.zm0) * k; cam.updateProjectionMatrix();
  };
  win.__camTw?.kill();
  if (rapido) { poner(1); return; }
  win.__camTw = gsap.to(p, { k: 1, duration: d, ease: 'sine.inOut', onUpdate: () => poner(p.k) });
}

/* ---------- marcadores que siguen al 3D (pin de Corabastos, anillo del sector) */
function pin(win, id, texto, sub, cls = '') {
  const doc = win.document; let e = doc.getElementById(id);
  if (!e) { e = doc.createElement('div'); e.id = id; e.className = 'ed-pin ' + cls; e.innerHTML = `<s></s><i></i><b>${texto}${sub ? `<small>${sub}</small>` : ''}</b>`; doc.body.appendChild(e); e.__a = { a: 0 }; }
  return e;
}
function mostrar(e, on, rapido) { gsap.killTweensOf(e.__a); if (rapido) e.__a.a = on ? 1 : 0; else gsap.to(e.__a, { a: on ? 1 : 0, duration: on ? 0.6 : 0.35, ease: 'power2.out' }); }
function anillo(win) {
  if (win.__anillo) return win.__anillo;
  const T = win.THREE, sc = win.eval('scene');
  const g = new T.RingGeometry(SECTOR_R * S - 1.6, SECTOR_R * S, 96);
  const m = new T.MeshBasicMaterial({ color: 0xcfff5e, transparent: true, opacity: 0, depthTest: false, side: T.DoubleSide });
  const r = new T.Mesh(g, m); r.rotation.x = -Math.PI / 2; r.renderOrder = 999;
  const c = aEscena(win, SECTOR[0], SECTOR[1], 1.5); r.position.copy(c); sc.add(r);
  const relleno = new T.Mesh(new T.CircleGeometry(SECTOR_R * S, 96), new T.MeshBasicMaterial({ color: 0xcfff5e, transparent: true, opacity: 0, depthTest: false, side: T.DoubleSide }));
  relleno.rotation.x = -Math.PI / 2; relleno.renderOrder = 998; relleno.position.copy(c); sc.add(relleno);
  win.__anillo = { r, relleno, a: { a: 0, s: 1 } };
  return win.__anillo;
}
function verAnillo(win, on, rapido) {
  const A = anillo(win); gsap.killTweensOf(A.a);
  if (rapido) Object.assign(A.a, { a: on ? 1 : 0, s: 1 });
  else if (on) gsap.fromTo(A.a, { a: 0, s: 0.4 }, { a: 1, s: 1, duration: 1.1, ease: 'expo.out' });
  else gsap.to(A.a, { a: 0, duration: 0.4 });
}

registrar('picos', {
  url: './paginas/picos/index.html',
  listo: async (win) => {
    await hasta(() => win.document.getElementById('loading')?.style.display === 'none' && win.eval('ind.length'), 60000, 120);
    // tipografías del formato dentro del visor (los nombres 3D se dibujan en canvas: se esperan antes de construir)
    const doc = win.document, l = doc.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600&family=Geist:wght@300..600&family=Geist+Mono:wght@400;500&display=swap';
    doc.head.appendChild(l);
    await Promise.race([new Promise((r) => l.addEventListener('load', r, { once: true })), esp(2500)]);
    await Promise.race([Promise.all(['600 54px "Barlow Condensed"', '400 14px Geist'].map((f) => doc.fonts.load(f))), esp(2500)]);
  },
  preparar: (win, doc) => {
    const st = doc.createElement('style'); st.textContent = CSS; doc.head.appendChild(st);
    const T = win.THREE;
    // escena en tinta; terreno y edificios en grises neutros
    win.eval('scene').background = new T.Color(0x0b0d10); win.eval('renderer').setClearColor(0x0b0d10, 1);
    win.eval('terr').children.forEach((o) => {
      if (o.isInstancedMesh && o.instanceColor) { const a = o.instanceColor.array; for (let i = 0; i < a.length; i += 3) { const g = (a[i] + a[i + 1] + a[i + 2]) / 3; a[i] = a[i + 1] = a[i + 2] = g * 0.92; } o.instanceColor.needsUpdate = true; }
      else if (o.material?.color) o.material.color.set(0x15181b);
    });
    // nombres 3D con la tipografía del formato (Barlow Condensed, papel sobre tinta, barra lima)
    win.label = (text) => {
      const c = doc.createElement('canvas'); c.width = 1024; c.height = 112; const x = c.getContext('2d');
      x.fillStyle = 'rgba(11,13,16,.88)'; x.fillRect(0, 0, 1024, 112); x.fillStyle = '#cfff5e'; x.fillRect(0, 0, 10, 112);
      let fs = 64; const f = () => (x.font = `600 ${fs}px "Barlow Condensed", "Geist", sans-serif`); f();
      while (x.measureText(text.toUpperCase()).width > 940 && fs > 26) { fs -= 2; f(); }
      x.fillStyle = '#f3f4ee'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text.toUpperCase(), 517, 60);
      const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthTest: false }));
      s.scale.set(190, 20.8, 1); return s;
    };
    // el nombre 3D de SE ya se había construido al abrir el visor (con la letra original): se rehace
    win.eval('ind').forEach((o) => { if (o.group && o.label) { const nl = win.label(o.d.name); nl.position.copy(o.label.position); o.group.remove(o.label); o.label.material.map?.dispose(); o.label.material.dispose(); o.group.add(nl); o.label = nl; } });
    // CCL y SE se construyen de antemano para que al aparecer solo crezcan (sin tirón)
    for (const c of ['CCL', 'SE']) win.eval(`(()=>{const i=ind.findIndex(o=>o.d.code==='${c}'&&!o.d.year);if(!ind[i].group)build(i);})()`);
    win.eval("planOn=false;controls.autoRotate=true;controls.autoRotateSpeed=0.35;selected=new Set();sync();ind.forEach(o=>{o.t=0});dirty=true");
    cursor(win);
    const cora = pin(win, 'pin-cora', 'Corabastos'), sect = pin(win, 'pin-sector', 'Donde coinciden', '', 'lima izq alto');
    // render solo cuando la página está a la vista (en segundo plano no gasta GPU) + marcadores que siguen al 3D
    const marco = win.frameElement?.parentElement, rf = win.renderFrame, v = new T.Vector3();
    const stage = doc.getElementById('stage'), cam = win.eval('camera');
    const seguir = (e, p) => {
      const a = e.__a.a; e.style.opacity = a; if (a <= 0.001) return;
      const r = stage.getBoundingClientRect(); v.copy(p).project(cam);
      e.style.transform = `translate(${r.left + (v.x + 1) / 2 * r.width}px,${r.top + (1 - v.y) / 2 * r.height}px)`;
    };
    const pCora = aEscena(win, CORA[0], CORA[1], 2), pSect = aEscena(win, SECTOR[0], SECTOR[1] + SECTOR_R * 0.55, 2);
    const IND = win.eval('ind');
    win.renderFrame = () => {
      if (marco && !marco.classList.contains('on')) return;
      const nv = win.__nombres ?? 1; IND.forEach((o) => { if (o.label) o.label.material.opacity = nv; });
      const A = win.__anillo; if (A) { A.r.material.opacity = A.a.a; A.relleno.material.opacity = A.a.a * 0.13; A.r.scale.setScalar(A.a.s); A.relleno.scale.setScalar(A.a.s); A.r.visible = A.relleno.visible = A.a.a > 0.001; }
      rf(); seguir(cora, pCora); seguir(sect, pSect);
    };
    anillo(win);
  },
  estados: {
    /** «actividades comerciales y logísticas… alrededor de Corabastos»: clic en CCL, la superficie crece; Corabastos como referencia */
    ccl: async (win, doc, o) => {
      const t = nuevo(win); nombres(win, true, true); verAnillo(win, false, true); mostrar(doc.getElementById('pin-sector'), false, true);
      const cora = doc.getElementById('pin-cora');
      if (o.rapido) { selec(win, ['CCL']); crecidos(win); mover(win, { rapido: true }); mostrar(cora, true, true); const p = centroDe(boton(win, 'CCL'), 0.4, 0.5); moverCursor(win, p.x, p.y, { rapido: true }); return; }
      selec(win, []); mostrar(cora, false, true); mover(win, { rapido: true });
      await moverCursor(win, win.innerWidth * 0.5, win.innerHeight * 0.5, { rapido: true, oculto: true });
      await esp(500); if (win.__tok !== t) return;
      const p = centroDe(boton(win, 'CCL'), 0.4, 0.5);
      await moverCursor(win, p.x, p.y, { d: 0.95 }); if (win.__tok !== t) return;
      clic(win); selec(win, ['CCL']);
      await esp(1300); if (win.__tok !== t) return;
      mostrar(cora, true); o.alPin?.();
    },
    /** «el soporte ecológico…»: clic en SE (reemplaza a CCL) */
    se: async (win, doc, o) => {
      const t = nuevo(win); nombres(win, true, o.rapido); verAnillo(win, false, true); mostrar(doc.getElementById('pin-sector'), false, true);
      mostrar(doc.getElementById('pin-cora'), true, o.rapido); mover(win, { rapido: o.rapido, d: 2 });
      const p = centroDe(boton(win, 'SE'), 0.4, 0.5);
      if (o.rapido) { selec(win, ['SE']); crecidos(win); moverCursor(win, p.x, p.y, { rapido: true }); return; }
      await esp(200); await moverCursor(win, p.x, p.y, { d: 0.8 }); if (win.__tok !== t) return;
      clic(win); selec(win, ['SE']);
    },
    /** «al cruzar estos índices»: activa «Ver varios a la vez» y suma CCL → CCL y SE sobre el mismo territorio */
    cruce: async (win, doc, o) => {
      const t = nuevo(win); nombres(win, false, o.rapido); verAnillo(win, false, true); mostrar(doc.getElementById('pin-sector'), false, true);
      mostrar(doc.getElementById('pin-cora'), true, o.rapido); mover(win, { rapido: o.rapido, d: 2 });
      const pc = centroDe(doc.getElementById('multi'), 0.5, 0.5), pb = centroDe(boton(win, 'CCL'), 0.4, 0.5);
      if (o.rapido) { selec(win, ['SE', 'CCL'], true); crecidos(win); moverCursor(win, pb.x, pb.y, { rapido: true }); return; }
      selec(win, ['SE']);
      await moverCursor(win, pc.x, pc.y, { d: 0.7 }); if (win.__tok !== t) return;
      clic(win); doc.getElementById('multi').checked = true; await esp(350); if (win.__tok !== t) return;
      await moverCursor(win, pb.x, pb.y, { d: 0.75 }); if (win.__tok !== t) return;
      clic(win); selec(win, ['SE', 'CCL'], true); o.alClic?.();
    },
    /** «sectores donde coinciden presiones»: la cámara se desplaza despacio al sector CCL alto · SE bajo y se marca */
    coinciden: async (win, doc, o) => {
      const t = nuevo(win); nombres(win, false, true); selec(win, ['SE', 'CCL'], true); mostrar(doc.getElementById('pin-cora'), true, o.rapido);
      if (o.rapido) { crecidos(win); mover(win, { x: SECTOR[0] * 0.6, y: SECTOR[1] * 0.6, zoom: 1.28, rapido: true }); verAnillo(win, true, true); mostrar(doc.getElementById('pin-sector'), true, true); ocultarCursor(win, true); return; }
      ocultarCursor(win);
      mover(win, { x: SECTOR[0] * 0.6, y: SECTOR[1] * 0.6, zoom: 1.28, d: 3.2 });
      await esp(900); if (win.__tok !== t) return;
      verAnillo(win, true); await esp(500); if (win.__tok !== t) return;
      mostrar(doc.getElementById('pin-sector'), true); o.alSector?.();
    },
    /** «relaciones espaciales…»: vuelve la vista completa; quedan las dos referencias */
    relaciones: async (win, doc, o) => {
      nuevo(win); nombres(win, false, true); selec(win, ['SE', 'CCL'], true); if (o.rapido) crecidos(win);
      ocultarCursor(win, o.rapido); verAnillo(win, true, true);
      mostrar(doc.getElementById('pin-cora'), true, true); mostrar(doc.getElementById('pin-sector'), true, true);
      mover(win, { zoom: 1.12, rapido: o.rapido, d: 3.5 });
    },
  },
});
