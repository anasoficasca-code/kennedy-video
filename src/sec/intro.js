// INTRO CINEMATOGRÁFICA (portada + capítulo 01) sobre la fotogrametría real de Kennedy (Google Photorealistic 3D Tiles).
// Capas 3D propias de la intro, todas con datos del proyecto (public/datos):
//   borde  → límite real de la localidad (limite.json), línea lima que se dibuja
//   agua   → humedales, lagos y ríos con nombre (agua.json): relleno translúcido + contorno
//   arcos  → relaciones entre tres lugares reales (Corabastos · Patio Bonito · Bavaria), punteado que fluye
// Estado en S (0..1); se anima con X.tw (en los saltos queda en su valor final). fin() lo apaga todo.
import * as THREE from 'three';
import gsap from 'gsap';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const S = { borde: 0, bordeOp: 1, agua: 0, arcos: 0, arcosOp: 1 };
let G = null; // { grp, borde, glow, aguaF, aguaL, arcos }
let tok = 0;
/** lugares reales (marco local, metros): hitos de lugares.json, centroides de agua.json y upz.json */
export const P = {};

const lineMat = (color, ancho, op, extra = {}) => {
  const m = new LineMaterial({ color, linewidth: ancho, transparent: true, opacity: op, depthTest: false, depthWrite: false, toneMapped: false, ...extra });
  m.fog = false; m.resolution.set(innerWidth, innerHeight); addEventListener('resize', () => m.resolution.set(innerWidth, innerHeight));
  return m;
};
const linea = (pts, mat) => { const g = new LineGeometry(); g.setPositions(pts); const l = new Line2(g, mat); l.computeLineDistances(); l.frustumCulled = false; l.renderOrder = 25; l.userData.n = pts.length / 3 - 1; return l; };
const centro = (poly) => { let x = 0, z = 0; poly.forEach((p) => { x += p[0]; z += p[1]; }); return [x / poly.length, z / poly.length]; };

export function armar(X) {
  const W = X.W;
  if (G) { G.grp.visible = true; return G; }
  const D = W.datos, grp = new THREE.Group(); grp.name = 'intro';
  // lugares
  const hit = (k, n) => D.lug[k].hitos.find((h) => h.n === n)?.p;
  const agua = (n) => { const a = D.agua.agua.filter((w) => w.n === n && w.poly?.length > 2).sort((a, b) => b.poly.length - a.poly.length)[0]; return a && centro(a.poly); };
  const upz = (n) => D.upz.upz.find((u) => u.n === n)?.c;
  Object.assign(P, {
    cora: hit('F', 'Corabastos'), mariapaz: hit('E', 'María Paz'), bavaria: hit('D', 'Bavaria'), plazaKennedy: hit('A', 'Plaza Kennedy'),
    vaca: agua('Humedal La Vaca') || agua('Humedal de la Vaca'), burro: agua('Humedal El Burro'), timiza: agua('Lago Timiza'),
    patio: upz('Patio Bonito'), kennedy: upz('Kennedy Central'),
  });
  // borde de la localidad (cerrado)
  const lim = D.lim.pts, pb = []; [...lim, lim[0]].forEach(([x, z]) => pb.push(x, 6, z));
  const borde = linea(pb, lineMat('#cfff5e', 2, 1)), glow = linea(pb, lineMat('#cfff5e', 9, 0.14, { blending: THREE.AdditiveBlending }));
  grp.add(glow, borde);
  // agua con nombre (humedales, lagos, ríos)
  const aguaF = new THREE.Group(), aguaL = new THREE.Group();
  const mf = new THREE.MeshBasicMaterial({ color: '#7fd8e8', transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide });
  const ml = lineMat('#9fe8f4', 1.6, 0);
  D.agua.agua.filter((a) => a.n && a.poly?.length > 2).forEach((a) => {
    const s = new THREE.Shape(a.poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); g.translate(0, 5, 0);
    const m = new THREE.Mesh(g, mf); m.renderOrder = 24; aguaF.add(m);
    const pl = []; [...a.poly, a.poly[0]].forEach(([x, z]) => pl.push(x, 7, z)); aguaL.add(linea(pl, ml));
  });
  grp.add(aguaF, aguaL);
  // arcos entre los tres lugares (abastecimiento · crecimiento · suelo)
  const arcos = [[P.cora, P.patio], [P.patio, P.bavaria], [P.bavaria, P.cora]].map(([a, b]) => {
    const A = new THREE.Vector3(a[0], 10, a[1]), B = new THREE.Vector3(b[0], 10, b[1]), d = A.distanceTo(B);
    const M = A.clone().lerp(B, 0.5); M.y = Math.min(1500, 220 + d * 0.3);
    const c = new THREE.QuadraticBezierCurve3(A, M, B), pts = []; c.getPoints(90).forEach((p) => pts.push(p.x, p.y, p.z));
    const l = linea(pts, lineMat('#cfff5e', 2.2, 0, { dashed: true, dashSize: 110, gapSize: 70, blending: THREE.AdditiveBlending }));
    grp.add(l); return l;
  });
  W.scene.add(grp);
  G = { grp, borde, glow, aguaF, aguaL, mf, ml, arcos };
  gsap.ticker.add(tick);
  precompilar(W);
  return G;
}
/** compila de una vez los shaders de todo lo que la intro va a encender (sin tirones al aparecer a mitad de frase) */
function precompilar(W) {
  try {
    const capas = ['flujos', 'agentes', 'red6', 'pA', 'pB', 'pC', 'pD', 'pE', 'pF'].map((n) => W.capas[n]).filter(Boolean);
    const antes = capas.map((o) => o.visible); capas.forEach((o) => (o.visible = true));
    const ocultos = []; G.grp.traverse((o) => { if (!o.visible) { ocultos.push(o); o.visible = true; } });
    const pin = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 8).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#cfff5e', transparent: true, opacity: 0.5, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, toneMapped: false }));
    W.scene.add(pin);
    W.r.compile(W.scene, W.cam);
    W.scene.remove(pin); pin.geometry.dispose(); pin.material.dispose();
    capas.forEach((o, i) => (o.visible = antes[i])); ocultos.forEach((o) => (o.visible = false));
  } catch (e) { console.warn('precompilar intro', e); }
}
/** cámaras de precarga (NO se usan: con varias cámaras la fotogrametría carga y dibuja miles de teselas de más y cae a ~25 fps) */
const precargas = [];
export function precargarVistas(X, vistas) {
  const W = X.W, tiles = W.gfoto?.tiles; if (!tiles) return;
  vistas.forEach((v) => {
    const c = W.cam.clone(); c.position.set(...v.p); c.lookAt(new THREE.Vector3(...v.o)); c.updateMatrixWorld(); c.updateProjectionMatrix();
    tiles.setCamera(c); tiles.setResolutionFromRenderer(c, W.r); precargas.push(c);
  });
}
export function soltarVistas(X) { const tiles = X.W.gfoto?.tiles; precargas.splice(0).forEach((c) => tiles?.deleteCamera(c)); }
function dibujar(l, f) { l.geometry.instanceCount = Math.max(0, Math.floor(l.userData.n * f)); }
function tick() {
  if (!G || !G.grp.visible) return;
  const t = gsap.ticker.time;
  dibujar(G.borde, S.borde); dibujar(G.glow, S.borde);
  G.borde.material.opacity = 0.95 * S.bordeOp; G.glow.material.opacity = 0.14 * S.bordeOp;
  G.mf.opacity = 0.26 * S.agua * (0.85 + 0.15 * Math.sin(t * 1.6)); G.ml.opacity = 0.9 * S.agua; G.aguaF.visible = G.aguaL.visible = S.agua > 0.002;
  G.arcos.forEach((l, i) => { dibujar(l, Math.min(1, Math.max(0, S.arcos * 1.6 - i * 0.3))); l.material.opacity = S.arcosOp * Math.min(1, S.arcos * 3); l.material.dashOffset = -t * 160; l.visible = S.arcos > 0.002; });
}
/** anima el estado de las capas de la intro: X.tw sobre S (en saltos queda directo) */
export function poner(X, v, d = 1.6, ease = 'power2.inOut', delay = 0) { gsap.killTweensOf(S, Object.keys(v).join(',')); X.tw(S, { ...v, duration: d, ease, delay }); }
/** anula lo pendiente de la portada (si se avanza antes de que termine) */
export function cortar() { tok++; }
/** al salir de la intro: todo apagado */
export function fin(X) { if (X) { soltarVistas(X); const u = X.W.capas.edif.userData.u; gsap.killTweensOf(u.uScan); u.uScan.value = 1e6; } tok++; gsap.killTweensOf(S); Object.assign(S, { borde: 0, bordeOp: 1, agua: 0, arcos: 0, arcosOp: 1 }); if (G) G.grp.visible = false; }

/* ======================================================================= PORTADA (capítulo 00) · «de dato a ciudad real» */
// Apertura tipo título de documental: desde la escala de Bogotá (≈ 36 km de altura, vista cenital) la cámara desciende
// en un solo movimiento continuo hasta Kennedy. Mientras baja, Kennedy se construye como dato: el límite real en lima,
// las vías reales como líneas de luz que se trazan y los cuerpos de agua; la ciudad está en modo esquema (tinta + retícula)
// y una línea de escaneo lima la barre de occidente a oriente revelando la fotogrametría real debajo.
// Solo arranca cuando la foto ya cubre la vista y bajó el detalle de los encuadres del recorrido (sin borrones).
export const PORTADA = [
  { p: [300, 36000, 3600], o: [0, 0, -200] },      // escala de Bogotá, casi cenital
  { p: [250, 17000, 7600], o: [-100, 0, -300] },   // descenso
  { p: [600, 5800, 7800], o: [-200, 0, -450] },    // Kennedy completa, en oblicuo
];
const hh = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; };
const viasMat = (W) => W.capas.vias?.material;
/** vías como líneas de luz (solo durante la apertura) */
function viasLuz(W, on) {
  const m = viasMat(W); if (!m) return;
  if (on) { m.depthTest = false; m.blending = THREE.AdditiveBlending; m.uniforms.uC.value.set('#dbeab8'); m.uniforms.uBase.value = 0.2; W.capas.vias.renderOrder = 22; }
  else { m.depthTest = true; m.blending = THREE.NormalBlending; m.uniforms.uC.value.set('#F5F3EB'); m.uniforms.uBase.value = 0.16; m.uniforms.uDib.value = 1; W.capas.vias.renderOrder = 0; }
  m.needsUpdate = true;
}
const U = (W) => W.capas.edif.userData.u;
/** termina el escaneo (si se avanza antes de que acabe) y deja la ciudad real */
export function revelar(X, d = 0.9) {
  const u = U(X.W); gsap.killTweensOf(u.uScan);
  if (u.uScan.value > 5e5) return;
  if (X.R.rapido || !d) { u.uScan.value = 1e6; return; }
  gsap.to(u.uScan, { value: 40000, duration: d, ease: 'power2.in', onComplete: () => (u.uScan.value = 1e6) });
}
export function portada(X) {
  const t = ++tok, ok = () => t === tok, W = X.W, u = U(W);
  armar(X);
  u.uSube.value = 1;
  const fin = PORTADA[PORTADA.length - 1];
  if (X.R.rapido) { X.vuelo([fin], 0); S.borde = 1; S.bordeOp = 1; u.uScan.value = 1e6; return; }
  X.vuelo([PORTADA[0]], 0);
  Object.assign(S, { borde: 0, bordeOp: 1, agua: 0 });
  u.uScan.value = -60000; u.uScanW.value = 1500;          // todo en esquema
  viasLuz(W, true); X.capa('vias', true, 0); viasMat(W).uniforms.uDib.value = 0; X.capa('vias', false, 0);
  const velo = X.ed.anexar(hh('div', 'ed-velo', '')); gsap.set(velo, { autoAlpha: 1 });
  const arrancar = () => {
    if (!ok()) return;
    gsap.to(velo, { autoAlpha: 0, duration: 1.8, ease: 'sine.inOut', onComplete: () => velo.remove() });
    X.vuelo([PORTADA[1], fin], 19, { ease: 'sine.inOut', deriva: 0.06, derivaD: 30 });
    poner(X, { borde: 1 }, 3.2, 'power2.inOut', 0.5);                                   // 1 · el límite real
    gsap.delayedCall(1.3, () => { if (!ok()) return; X.capa('vias', true, 0.6); gsap.to(viasMat(W).uniforms.uDib, { value: 1, duration: 4.2, ease: 'power1.inOut' }); }); // 2 · las vías se trazan
    poner(X, { agua: 0.9 }, 2.2, 'power2.out', 2.4);                                    // 3 · el agua
    gsap.timeline({ delay: 5.0 }).fromTo(u.uScan, { value: -10000 }, { value: 12000, duration: 4.6, ease: 'power1.inOut', immediateRender: false }) // 4 · escaneo: de dato a ciudad real
      .add(() => { u.uScan.value = 1e6; });
    gsap.to(u.uScanW, { value: 700, duration: 6, delay: 5.2, ease: 'sine.inOut' });
    gsap.delayedCall(9.2, () => { if (!ok()) return; X.capa('vias', false, 2.4); poner(X, { agua: 0 }, 2.4); });
    gsap.delayedCall(10.2, () => { if (ok()) titulo(X); });
  };
  // espera: foto activa + descargas quietas (máx. 22 s; si no hay foto, arranca igual sobre la ciudad modelada)
  const t0 = performance.now(); let cubierta = 0, quietoDesde = 0;
  const esperar = () => {
    if (!ok()) return;
    const ms = performance.now() - t0, st = W.gfoto?.tiles?.stats || {};
    if (W.google && !cubierta) cubierta = ms;
    const quieto = cubierta && st.downloading === 0 && st.parsing === 0;
    quietoDesde = quieto ? quietoDesde || ms : 0;
    if ((cubierta && ((quietoDesde && ms - quietoDesde > 600) || ms - cubierta > 12000)) || ms > 22000 || !W.gfoto) gsap.delayedCall(0.2, arrancar);
    else setTimeout(esperar, 150);
  };
  esperar();
}
/** al salir de la portada: vías normales y ciudad real */
export function finPortada(X) { const u = U(X.W); gsap.killTweensOf(u.uScan); gsap.killTweensOf(u.uScanW); gsap.killTweensOf(viasMat(X.W)?.uniforms.uDib); viasLuz(X.W, false); }
function titulo(X) {
  const e = X.ed.anexar(hh('div', 'ed-portada', `<div class="l1">${X.ed.palabras('Kennedy')}</div><i class="linea"></i><div class="l2">${X.ed.palabras('modelamiento *dinámico* y simulación')}</div>`));
  const tl = gsap.timeline(); tl.set(e, { autoAlpha: 1 });
  tl.fromTo(e.querySelectorAll('.l1 .w'), { autoAlpha: 0, y: 14, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out', clearProps: 'filter' }, 0)
    .fromTo(e.querySelector('.linea'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, 0.5);
  X.ed.escribir(tl, e.querySelector('.l2'), 0.9, 0.09);
  return e;
}

/** tarjeta de vidrio centrada con las palabras de la voz */
export function centro3(X, texto, o = {}) {
  if (X.R.rapido) return null;
  const e = X.ed.anexar(hh('div', 'ed-centro', `<i class="nodo"></i><span>${X.ed.palabras(texto)}</span>`));
  if (o.y != null) e.style.top = o.y + 'vh';
  const tl = gsap.timeline({ delay: o.delay || 0 }); tl.set(e, { autoAlpha: 1 })
    .fromTo(e, { clipPath: 'inset(0 50% 0 50% round 14px)' }, { clipPath: 'inset(0 0% 0 0% round 14px)', duration: 0.8, ease: 'power3.inOut' }, 0)
    .fromTo(e.querySelector('.nodo'), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0.4);
  X.ed.escribir(tl, e, 0.45, 0.07);
  return e;
}