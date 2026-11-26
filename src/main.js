import gsap from 'gsap';
import * as THREE from 'three';
import { W, crearMundo, capa, uni, moverAgentes, moverEspecies, moverBavaria, LUG, COL_P, NOM_P, CAPAS_POT } from './mundo.js';
import * as UI from './ui.js';
import { R, D, tw, twf } from './ui.js';
import { transicion } from './trans.js';
import { actualizarCarto, avisoZoom } from './carto.js';
import { sombraSigue, gobernador } from './realismo.js';
import { CAPITULOS } from './guion.js';
import * as PAG from './pagina.js';
import * as ED from './edicion.js';
import './paginas/todas.js';
import './estilo.css';

const canal = new BroadcastChannel('kennedy-presentacion');
const esPresentadora = new URLSearchParams(location.search).has('presentador');

/* ======================================================================= lista plana de frases */
const BEATS = [];
CAPITULOS.forEach((c, ci) => c.beats.forEach((b, bi) => BEATS.push({ ...b, ci, bi })));
const TOTAL = BEATS.length;


/* ======================================================================= API para el guion (X) */
const ESTACIONES = {
  alto: { p: [2200, 7600, 7000], o: [0, 0, 300], nom: 'Localidad de Kennedy' },
  portada: { p: [-6200, 1500, 2600], o: [2500, 500, -1200], nom: 'Kennedy y los cerros orientales' },
  pot: { p: [0, 3300, 6200], o: [0, 800, 0], nom: 'Red multicapa del POT' },
  capas: { p: [6200, 3600, 6200], o: [0, 1300, 0] },
  red6: { p: [900, 2300, 2900], o: [250, 150, -250], nom: 'Red de seis problemas · conectografía' },
  mapa: { p: [0, 8800, 3600], o: [0, 0, 200], nom: 'Conectografía · Kennedy' },
  cora: { p: [-715 + 1100, 1700, -168 + 2300], o: [-715, 0, -168], nom: 'Corabastos' },
  coraCerca: { p: [-715 + 500, 650, -168 + 950], o: [-715, 60, -168], nom: 'Corabastos' },
  mariapaz: { p: [-533 + 700, 900, -385 + 1300], o: [-533, 0, -385], nom: 'María Paz' },
  bav: { p: [2119 + 1500, 1600, -1067 + 2100], o: [2119, 100, -1067], nom: 'Bavaria' },
  bavCerca: { p: [2119 + 700, 750, -1067 + 1000], o: [2119, 150, -1067], nom: 'Bavaria · naves' },
  oeste: { p: [-1200, 4300, 5600], o: [-1300, 200, -600], nom: 'Patio Bonito · Tintal Norte' },
  humedal: { p: [-1200, 1600, 2600], o: [-900, 0, 900], nom: 'Humedales y corredores' },
  lejos: { p: [9000, 26000, 26000], o: [0, 0, 0], nom: 'Bogotá' },
};
const camT = { p: new THREE.Vector3(...ESTACIONES.portada.p), o: new THREE.Vector3(...ESTACIONES.portada.o) };
/* ---- movimientos de cámara cinematográficos (intro): vuelo por una curva suave y deriva lenta al llegar ---- */
let vueloTw = null, derivaTw = null;
const EJE_Y = new THREE.Vector3(0, 1, 0);
const aV = (e) => { const s = typeof e === 'string' ? ESTACIONES[e] : e; return { p: new THREE.Vector3(...s.p), o: new THREE.Vector3(...s.o) }; };
function pararCam() { gsap.killTweensOf(camT.p); gsap.killTweensOf(camT.o); vueloTw?.kill(); vueloTw = null; derivaTw?.kill(); derivaTw = null; }
/** órbita muy lenta alrededor del objetivo (arranca y termina con velocidad cero: nunca un tirón) */
function derivar(ang = 0.08, d = 26) {
  derivaTw?.kill(); if (R.rapido || !ang) return;
  const st = { a: 0 }; let prev = 0;
  derivaTw = gsap.to(st, { a: ang, duration: d, ease: 'sine.inOut', onUpdate: () => { const da = st.a - prev; prev = st.a; const rel = camT.p.clone().sub(camT.o).applyAxisAngle(EJE_Y, da); camT.p.copy(camT.o).add(rel); } });
}
/** vuelo: la cámara recorre una curva Catmull-Rom (posición y objetivo) por los puntos dados, con easing largo.
 *  ruta: [estación | {p,o}, …] (el primer punto es la cámara actual) · o: { ease, delay, deriva: ángulo de la deriva al llegar } */
const velCam = { p: new THREE.Vector3(), o: new THREE.Vector3(), t: 0 };
function vuelo(ruta, d = 6, o = {}) {
  const cur = { p: camT.p.clone(), o: camT.o.clone() };
  // si la cámara venía volando, el nuevo vuelo sale en la misma dirección (sin quiebre ni frenazo)
  const enMarcha = vueloTw?.isActive() && performance.now() - velCam.t < 100;
  const pts = [cur];
  if (enMarcha) { const k = Math.min(0.6, d * 0.12); pts.push({ p: cur.p.clone().addScaledVector(velCam.p, k), o: cur.o.clone().addScaledVector(velCam.o, k) }); }
  pts.push(...ruta.map(aV));
  pararCam();
  const fin = pts[pts.length - 1];
  if (R.rapido || d === 0) { camT.p.copy(fin.p); camT.o.copy(fin.o); return; }
  const cp = new THREE.CatmullRomCurve3(pts.map((q) => q.p), false, 'centripetal'), co = new THREE.CatmullRomCurve3(pts.map((q) => q.o), false, 'centripetal');
  const k = { u: 0 }, prevP = camT.p.clone(), prevO = camT.o.clone(); let prevT = performance.now();
  vueloTw = gsap.to(k, { u: 1, duration: d, delay: o.delay || 0, ease: o.ease || (enMarcha ? 'power2.out' : 'power2.inOut'),
    onUpdate: () => {
      cp.getPointAt(k.u, camT.p); co.getPointAt(k.u, camT.o);
      const now = performance.now(), dt = Math.max(1, now - prevT) / 1000;
      velCam.p.subVectors(camT.p, prevP).divideScalar(dt); velCam.o.subVectors(camT.o, prevO).divideScalar(dt); velCam.t = now;
      prevP.copy(camT.p); prevO.copy(camT.o); prevT = now;
    },
    onComplete: () => { vueloTw = null; derivar(o.deriva ?? 0.08, o.derivaD ?? 26); } });
}
/** órbita explícita alrededor del objetivo: ang (rad), k = factor de distancia final, dy = cambio de altura */
function orbita(ang, d = 8, o = {}) {
  pararCam();
  const rel0 = camT.p.clone().sub(camT.o), st = { a: 0, k: 1, y: 0 };
  const aplicar = () => { const r = rel0.clone().applyAxisAngle(EJE_Y, st.a).multiplyScalar(st.k); r.y += st.y; camT.p.copy(camT.o).add(r); };
  if (R.rapido || d === 0) { Object.assign(st, { a: ang, k: o.k ?? 1, y: o.dy ?? 0 }); aplicar(); return; }
  vueloTw = gsap.to(st, { a: ang, k: o.k ?? 1, y: o.dy ?? 0, duration: d, delay: o.delay || 0, ease: o.ease || 'sine.inOut', onUpdate: aplicar, onComplete: () => { vueloTw = null; } });
}
/** cámara con convención de zoom: si el destino está lejos → zoom out, desplazamiento, zoom in */
function cam(nombre, d = 2.2) {
  const e = typeof nombre === 'string' ? ESTACIONES[nombre] : nombre;
  pararCam();
  if (R.rapido || d === 0) { camT.p.set(...e.p); camT.o.set(...e.o); return; }
  const dO = new THREE.Vector3(...e.o), dP = new THREE.Vector3(...e.p);
  const d0 = camT.p.distanceTo(camT.o), d1 = dP.distanceTo(dO), salto = camT.o.distanceTo(dO);
  const ir2 = (p, o, t, ease, delay = 0) => { gsap.to(camT.p, { x: p.x, y: p.y, z: p.z, duration: t, ease, delay }); gsap.to(camT.o, { x: o.x, y: o.y, z: o.z, duration: t, ease, delay }); };
  if (salto > 1800) {
    const mO = camT.o.clone().lerp(dO, 0.5), alt = Math.max(d0, d1, salto * 1.15);
    const dir = camT.p.clone().sub(camT.o).normalize().lerp(dP.clone().sub(dO).normalize(), 0.5).normalize();
    const mP = mO.clone().add(dir.multiplyScalar(alt));
    avisoZoom('out'); ir2(mP, mO, d * 0.45, 'power2.inOut');
    gsap.delayedCall(d * 0.45, () => avisoZoom('in', e.nom || '')); ir2(dP, dO, d * 0.6, 'expo.out', d * 0.45);
  } else {
    if (d1 < d0 * 0.8) avisoZoom('in', e.nom || ''); else if (d1 > d0 * 1.25) avisoZoom('out', e.nom || '');
    ir2(dP, dO, d, 'expo.inOut');
  }
}
const uTo = (nombre, k, v, d = 1, ease = 'expo.out') => { const u = uni(nombre); if (u?.[k]) tw(u[k], { value: v, duration: D(d), ease }); };
const X = {
  ...UI, R, D, tw, twf, gsap, W, LUG, COL_P, NOM_P, CAPAS_POT, cam, uTo, THREE,
  /** cámara cinematográfica: X.vuelo([estación|{p,o}, …], dur, {ease, deriva}) · X.orbita(ang, dur, {k, dy}) · X.derivar(ang, dur) */
  vuelo, orbita, derivar, camT,
  /** páginas reales de las autoras: X.pagina('red', 'estado', { camara: {x,y,s} }) · X.camPag({x,y,s}) · X.sinPagina() */
  pagina: PAG.pagina, camPag: PAG.camara, sinPagina: PAG.sinPagina, ventana: PAG.ventana, hasta: PAG.hasta,
  /** edición tipo video (src/edicion.js): X.ed.pop / persona / cifra / rotulo / senalar / capitulo / limpiar */
  ed: ED,
  capa: (n, on = true, d = 0.9) => capa(n, on, D(d)),
  capas: (lista, on = true) => lista.forEach((n) => capa(n, on, D(0.9))),
  /** edificios: crecen en ola desde un origen */
  sube(v = 1, ori = LUG.corabastos, d = 3) { const u = W.capas.edif.userData.u; u.uOri.value.set(ori[0], ori[1]); tw(u.uSube, { value: v, duration: D(d), ease: 'power2.out' }); },
  /** tiñe los edificios alrededor de un foco */
  foco(p, r = 900, color = '#C7FF27', d = 1.2) { const u = W.capas.edif.userData.u; if (p) u.uFoco.value.set(p[0], p[1]); u.uFC.value.set(color); tw(u.uFR, { value: r, duration: D(d), ease: 'expo.out' }); },
  sinFoco(d = 0.8) { tw(W.capas.edif.userData.u.uFR, { value: 0, duration: D(d) }); },
  gris(v = 1, d = 1) { tw(W.capas.edif.userData.u.uGris, { value: v, duration: D(d) }); },
  aparecer(nombre, v = 1, d = 1.6) { capa(nombre, true, D(0.2)); uTo(nombre, 'uAp', v, d, 'steps(12)'); },
  /** red de seis problemas */
  arista(i, d = 1.1) { const t = W.red6.tubos[i]; const pu = t.userData.punta; tw(pu.scale, { x: 1, y: 1, z: 1, duration: D(0.3), ease: 'back.out(3)', delay: D(d * 0.9) }); UI.matrizMarcar('adj', t.userData.a, t.userData.b); const p = { v: t.geometry.drawRange.count === Infinity ? 0 : t.geometry.drawRange.count }; tw(p, { v: t.userData.total, duration: D(d), ease: 'steps(14)', onUpdate: () => t.geometry.setDrawRange(0, Math.floor(p.v / 3) * 3) }); if (R.rapido) t.geometry.setDrawRange(0, t.userData.total); },
  nodo6(k, f, d = 0.8) { const m = W.red6.nod[k]; const s = m.userData.r * f; tw(m.scale, { x: s, y: s, z: s, duration: D(d), ease: 'back.out(2)' }); },
  aSuelo(on = true, d = 2.4) { Object.entries(W.red6.nod).forEach(([k, m], i) => { const dst = on ? W.red6Suelo[k] : W.red6.P[k]; tw(m.position, { x: dst.x, y: dst.y, z: dst.z, duration: D(d), ease: 'expo.inOut', delay: D(i * 0.08) }); }); /* en la conectografía los arcos siguen visibles sobre el territorio */ },
  /** UPZ */
  upzAlto(on = true, k = 1, d = 1.6) { Object.values(W.upz).forEach(({ m }, i) => tw(m.scale, { y: on ? m.userData.h * k : 0.001, duration: D(d), ease: 'steps(10)', delay: D(i * 0.05) })); },
  /** mercados distribuidos (esquema) */
  mercados(on = true, cob = 1) { W.mercados.forEach((g, i) => { const { ar, disco, n } = g.userData; tw([ar.scale, disco.scale], { x: on ? cob : 0.001, y: on ? cob : 0.001, z: 1, duration: D(1.1), ease: 'expo.out', delay: D(i * 0.09) }); tw(n.scale, { x: on ? 1 : 0.001, y: on ? 1 : 0.001, z: on ? 1 : 0.001, duration: D(0.6), ease: 'back.out(2)', delay: D(i * 0.09) }); }); if (on) capa('mercados', true, D(0.3)); },
  estaciones(on = true) { capa('estaciones', true, D(0.2)); W.estaciones.forEach((g, i) => tw(g.scale, { x: on ? 1 : 0.001, y: on ? 1 : 0.001, z: on ? 1 : 0.001, duration: D(0.7), ease: 'back.out(2)', delay: D(i * 0.12) })); },
  corredor(v = 1, d = 2.4) { capa('corredores', true, D(0.2)); const t = W.corredor; const p = { v: t.geometry.drawRange.count === Infinity ? 0 : t.geometry.drawRange.count }; tw(p, { v: v * t.userData.total, duration: D(d), ease: 'steps(20)', onUpdate: () => t.geometry.setDrawRange(0, Math.floor(p.v / 3) * 3) }); if (R.rapido) t.geometry.setDrawRange(0, Math.floor(v * t.userData.total / 3) * 3); },
  capas18(modo) { // 'apila' | 'nueve' | 'fuera'
    capa('capas18', modo !== 'fuera', D(0.6));
    W.capasPl.forEach((m, i) => {
      if (modo === 'apila') twf(m.position, { y: -200 }, { y: m.userData.y0, duration: D(0.6), ease: 'expo.out', delay: D(i * 0.08) });
      if (modo === 'nueve') { const par = Math.floor(i / 2); tw(m.position, { y: 300 + par * 240, duration: D(1.2), ease: 'steps(8)', delay: D(par * 0.05) }); }
    });
  },
  agentesVel(v) { if (R.rapido) W.agentes.vel = v; else gsap.to(W.agentes, { vel: v, duration: 1.5 }); },
  despiece(sep, d = 1.6) { W.pot.planos.forEach((g, i) => tw(g.position, { y: sep ? 300 + i * sep : 0, duration: D(d), ease: 'steps(12)', delay: D(i * 0.04) })); },
  temblor() { if (R.rapido) return; gsap.fromTo('#mundo, #escena', { x: 0 }, { x: () => (Math.random() - .5) * 30, y: () => (Math.random() - .5) * 20, duration: 0.06, repeat: 8, yoyo: true, ease: 'steps(1)', clearProps: 'transform' }); },
};

/* ======================================================================= estado base de cada capítulo */
const TODAS = ['losa', 'edif', 'vias', 'vias-prin', 'flujos', 'agua', 'upz', 'pA', 'pB', 'pC', 'pD', 'pE', 'pF', 'iso', 'metro', 'red-pot', 'red6', 'mercados', 'corabastos', 'estaciones', 'corredores', 'agentes', 'especies', 'capas18', 'bavaria'];
function reiniciarMundo() {
  TODAS.forEach((n) => capa(n, false, 0));
  [...'ABCDEF'].forEach((k) => { const u = uni('p' + k); if (u) { u.uAp.value = 0; u.uS.value = k === 'F' ? 90 : k === 'B' ? 10 : 22; } });
  const u = W.capas.edif.userData.u; u.uFR.value = 0; u.uGris.value = 0;
  Object.values(W.upz).forEach(({ m }) => (m.scale.y = 0.001));
  W.red6.tubos.forEach((t) => { t.geometry.setDrawRange(0, 0); t.material.opacity = 0.9; t.userData.punta.scale.setScalar(0.001); t.userData.punta.material.opacity = 0.95; });
  Object.entries(W.red6.nod).forEach(([k, m]) => { m.position.copy(W.red6.P[k]); m.scale.setScalar(m.userData.r); });
  W.pot.planos.forEach((g) => (g.position.y = 0));
  W.mercados.forEach((g) => { g.userData.ar.scale.setScalar(0.001); g.userData.disco.scale.setScalar(0.001); g.userData.n.scale.setScalar(0.001); });
  W.estaciones.forEach((g) => g.scale.setScalar(0.001));
  W.corredor.geometry.setDrawRange(0, 0);
  W.capasPl.forEach((m) => (m.position.y = m.userData.y0));
  W.pot.nodos.forEach((m) => m.scale.setScalar(m.userData.r));
  W.agentes.vel = 1;
}
let capActual = -1;
function entrarCapitulo(ci) {
  const c = CAPITULOS[ci];
  if (capActual !== ci) { try { CAPITULOS[capActual]?.fin?.(X, c); } catch (e) { console.error(e); } capActual = ci; }
  // capítulos «cine» (portada + introducción): sin HUD cartográfico y sin la deriva automática (la cámara la llevan sus vuelos)
  document.body.classList.toggle('cine', !!c.cine); W.deriva = c.cine ? 0 : 1;
  reiniciarMundo();
  UI.limpiarTodo();
  if (!c.pagina) PAG.sinPagina(true); // los capítulos con página la ponen en su primera frase
  // precarga las páginas de este capítulo y del siguiente para que no haya espera al llegar
  const usar = [...(c.precarga || []), ...(CAPITULOS[ci + 1]?.precarga || [])];
  PAG.liberar(usar); PAG.precargar(...usar);
  ED.limpiar();
  capa('losa', true, 0); capa('edif', true, 0);
  gsap.killTweensOf(W.capas.edif.userData.u.uSube); W.capas.edif.userData.u.uSube.value = 1;
  c.base?.(X);
  if (c.cam) cam(c.cam, 0);
  document.querySelector('#hud-sec b').textContent = c.n; document.querySelector('#hud-sec span').textContent = c.nombre;
}

/* ======================================================================= navegación */
let idx = -1, ocupado = false, gob = null, ultimoCuadro = 0;
async function correrBeat(n, conTransicion) {
  const b = BEATS[n]; const c = CAPITULOS[b.ci];
  if (b.bi === 0) {
    // portadilla limpia de capítulo (reemplaza las transiciones 3D): tapa, monta la escena debajo y se abre
    // capítulo «continuo»: sigue el mismo plano del anterior (sin fundido a negro)
    if (conTransicion && !R.rapido && n > 0 && c.continuo) { UI.limpiar(); entrarCapitulo(b.ci); b.a?.(X); return; }
    if (conTransicion && !R.rapido && n > 0) { UI.limpiar(); ED.limpiar(); await ED.capitulo(c.n, c.nombre, () => { entrarCapitulo(b.ci); b.a?.(X); }); return; }
    else entrarCapitulo(b.ci);
  }
  if (!b.mantener) ED.limpiar(); // los gráficos de edición son de cada frase
  b.a?.(X);
}
async function ir(n, animado = true) {
  n = Math.max(0, Math.min(TOTAL - 1, n));
  if (animado && n === idx + 1) { ocupado = true; idx = n; publicar(); await correrBeat(n, true); ocupado = false; return; }
  // salto: se reconstruye el capítulo de inmediato hasta la frase pedida
  const b = BEATS[n]; const ini = n - b.bi;
  gsap.globalTimeline.clear();
  // estado exacto hasta la frase anterior; la frase pedida se anima una sola vez
  R.rapido = true;
  for (let k = ini; k < n; k++) await correrBeat(k, false);
  R.rapido = !animado;
  await correrBeat(n, false);
  R.rapido = false; idx = n; publicar();
}
const sig = () => { if (!ocupado) ir(idx + 1); };
const ant = () => { if (!ocupado && idx > 0) ir(idx - 1); };

function publicar() {
  const b = BEATS[idx], s = BEATS[idx + 1]; const c = CAPITULOS[b.ci];
  document.getElementById('hud-n').textContent = String(idx + 1).padStart(3, '0') + ' / ' + TOTAL;
  document.querySelector('#hud-prog i').style.width = ((idx + 1) / TOTAL) * 100 + '%';
  document.getElementById('subtitulo').textContent = b.t;
  history.replaceState(null, '', '#' + (idx + 1));
  canal.postMessage({ tipo: 'estado', n: idx, total: TOTAL, cap: c.n + ' · ' + c.nombre, ahora: b.t, sig: s ? s.t : '— fin —', sigCap: s && s.bi === 0 ? CAPITULOS[s.ci].n + ' · ' + CAPITULOS[s.ci].nombre : '' });
}

/* ======================================================================= modo automático (ensayo) */
let auto = null;
function alternarAuto() {
  if (auto) { clearTimeout(auto); auto = null; modoHUD(); return; }
  const paso = () => { if (idx >= TOTAL - 1) { auto = null; modoHUD(); return; } sig(); const pal = BEATS[idx + 1]?.t.split(/\s+/).length || 8; auto = setTimeout(paso, Math.max(2600, pal * 400)); };
  paso(); modoHUD();
}
function modoHUD() { document.getElementById('hud-modo').textContent = [W.stop ? 'STOP-MOTION 12 FPS' : 'FLUIDO', auto ? 'AUTO' : ''].filter(Boolean).join(' · '); }

/* ======================================================================= bucle: 12 fps escalonados + vida ambiental */
const grano = document.getElementById('grano');
function texturaGrano() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); grano.style.backgroundImage = `url(${c.toDataURL()})`;
}
function cuadro() {
  const t = gsap.ticker.time; W.t = t;
  const dt = W.stop ? 1 / 12 : gsap.ticker.deltaRatio() / 60;
  // la cámara nunca se detiene: órbita lenta + respiración alrededor del objetivo
  const rel = camT.p.clone().sub(camT.o);
  rel.applyAxisAngle(EJE_Y, Math.sin(t * 0.03) * 0.12 * (W.deriva ?? 1)); // deriva muy lenta y suave, sin vaivén (0 en la intro: allí la llevan los vuelos)
  W.cam.position.copy(camT.o).add(rel);
  const ob = camT.o.clone();
  if (W.stop) { const k = rel.length() * 0.0009; W.cam.position.x += (Math.random() - .5) * k; W.cam.position.y += (Math.random() - .5) * k; ob.x += (Math.random() - .5) * k; }
  W.cam.lookAt(ob);
  ['vias-prin', 'flujos', 'iso', 'metro', 'red-pot', 'agentes', 'pA', 'pB', 'pC', 'pD', 'pE', 'pF'].forEach((n) => { const u = uni(n); if (u?.uT) u.uT.value = t; });
  moverAgentes(dt); moverEspecies(t); moverBavaria(t); W.gfoto?.update(dt);
  W.estaciones?.forEach((g) => { g.userData.a.rotation.z = t * 0.8; g.userData.b.rotation.y = t * 1.3; });
  W.coraAros?.forEach((a, i) => (a.rotation.z = t * (i ? -0.2 : 0.3)));
  W.mercados?.forEach((g, i) => (g.userData.n.rotation.y = t * 1.2 + i));
  W.pot?.actualizar(t);
  W.red6?.grp && (W.red6.grp.rotation.y = Math.sin(t * 0.15) * 0.12);
  W.arco.material.opacity = 0.25 + Math.sin(t * 1.05) * 0.12; W.polvo.rotation.y = t * 0.01;
  W.camObj = camT.o; sombraSigue(W, camT.o, W.cam.position.distanceTo(camT.o)); if (W.arboles) { W.arboles.UT.uT.value = t; W.arboles.grp.visible = W.cam.position.distanceTo(camT.o) < 5200; } // los árboles solo cuando se distinguen
  // con una página real tapando toda la pantalla el 3D no se dibuja (la GPU queda para la página)
  const tapado = document.body.classList.contains('con-pagina') && !document.body.classList.contains('pagina-transparente');
  const ahora = performance.now(); if (ultimoCuadro && !tapado) gob?.(ahora - ultimoCuadro); ultimoCuadro = ahora; if (!tapado) W.r.render(W.scene, W.cam);
  UI.proyectarEts(); actualizarCarto(camT.o);
  // hervor stop-motion de la capa DOM y grano que cambia cada cuadro
  if (W.stop) { document.getElementById('escena').style.transform = `translate(${(Math.random() - .5) * 2}px, ${(Math.random() - .5) * 2}px) rotate(${(Math.random() - .5) * 0.12}deg)`; grano.style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`; }
}
function alternarStop() { W.stop = !W.stop; gsap.ticker.fps(W.stop ? 12 : 60); if (!W.stop) document.getElementById('escena').style.transform = ''; modoHUD(); }

/* ======================================================================= arranque */
async function iniciar() {
  texturaGrano();
  await crearMundo(document.getElementById('mundo'));
  gob = gobernador(W); gsap.ticker.fps(60); gsap.ticker.add(cuadro); modoHUD();
  { const c = W.pot.centro, R = W.pot.radio; ESTACIONES.pot = { p: [c.x + R * 0.3, R * 1.45, c.z + R * 1.95], o: [c.x + R * 0.15, 0, c.z - R * 0.15], nom: 'Red del POT sobre Bogotá' }; }
  window.__k = { ir, sig, ant, BEATS, X, W };
  const desde = parseInt(location.hash.slice(1), 10);
  const empezar = () => { document.getElementById('inicio').remove(); document.body.classList.add('presentando'); if (desde > 1) ir(desde - 1, false); else ir(0); };
  document.getElementById('empezar').onclick = (e) => { e.stopPropagation(); empezar(); }; // el clic de Comenzar no cuenta como 'siguiente'
  if (new URLSearchParams(location.search).has('directo')) empezar();
  addEventListener('keydown', (e) => {
    if (document.getElementById('inicio')) { if (e.key === 'Enter' || e.key === ' ') empezar(); return; }
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'Enter', 'ArrowDown'].includes(k)) { e.preventDefault(); sig(); }
    else if (['ArrowLeft', 'PageUp', 'ArrowUp', 'Backspace'].includes(k)) { e.preventDefault(); ant(); }
    else if (k === 'f' || k === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    else if (k === 's' || k === 'S') alternarStop();
    else if (k === 't' || k === 'T') document.body.classList.toggle('subs');
    else if (k === 'a' || k === 'A') alternarAuto();
    else if (k === 'p' || k === 'P') window.open(location.pathname + '?presentador', 'presentadora', 'width=1100,height=700');
    else if (k === 'Home') ir(0, false);
    else if (k === 'b' || k === 'B') document.getElementById('escena').style.opacity = document.getElementById('escena').style.opacity === '0' ? '' : '0';
  });
  addEventListener('click', (e) => { if (!document.getElementById('inicio') && e.button === 0) sig(); });
  addEventListener('contextmenu', (e) => { e.preventDefault(); ant(); });
  canal.onmessage = (m) => { if (m.data.cmd === 'sig') sig(); if (m.data.cmd === 'ant') ant(); if (m.data.cmd === 'pedir' && idx >= 0) publicar(); if (m.data.cmd === 'ir') ir(m.data.n, false); };
}

/* ======================================================================= vista de presentadora */
function vistaPresentadora() {
  document.body.className = 'presentadora';
  document.body.innerHTML = `<div class="pres"><div class="pres-cab"><span id="pc"></span><span class="pres-reloj" id="pr">00:00</span><span><b id="pn"></b></span></div>
    <div class="pres-ahora" id="pa">Esperando la presentación…</div><div class="pres-sig" id="ps"></div>
    <div class="pres-pie"><button id="bA">← Anterior</button><button class="sig" id="bS">Siguiente frase →</button></div></div>`;
  let t0 = null;
  canal.onmessage = (m) => { const d = m.data; if (d.tipo !== 'estado') return; if (!t0) t0 = Date.now();
    document.getElementById('pc').textContent = d.cap; document.getElementById('pn').textContent = (d.n + 1) + ' / ' + d.total;
    document.getElementById('pa').textContent = d.ahora; document.getElementById('ps').textContent = (d.sigCap ? '[' + d.sigCap + '] ' : '') + d.sig; };
  setInterval(() => { if (!t0) return; const s = Math.floor((Date.now() - t0) / 1000); document.getElementById('pr').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 500);
  document.getElementById('bS').onclick = () => canal.postMessage({ cmd: 'sig' });
  document.getElementById('bA').onclick = () => canal.postMessage({ cmd: 'ant' });
  addEventListener('keydown', (e) => { if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); canal.postMessage({ cmd: 'sig' }); } if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); canal.postMessage({ cmd: 'ant' }); } });
  canal.postMessage({ cmd: 'pedir' });
}

if (esPresentadora) vistaPresentadora(); else iniciar();
