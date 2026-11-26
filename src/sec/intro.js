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
/** cámaras de precarga: la fotogrametría baja también el detalle de los encuadres que vienen (sin dibujarlos) */
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
export function fin(X) { if (X) soltarVistas(X); tok++; gsap.killTweensOf(S); Object.assign(S, { borde: 0, bordeOp: 1, agua: 0, arcos: 0, arcosOp: 1 }); if (G) G.grp.visible = false; }

/* ======================================================================= PORTADA (capítulo 00) */
// sobrevuelo de apertura desde el suroccidente hacia los cerros; arranca cuando la foto real ya cubre la vista
export const PORTADA = [
  { p: [-9800, 3900, 7600], o: [900, 0, -600] },
  { p: [-7200, 2900, 5900], o: [900, 0, -500] },
  { p: [-5200, 2350, 4700], o: [800, 0, -450] },
];
const hh = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; };
export function portada(X) {
  const t = ++tok, ok = () => t === tok, W = X.W;
  armar(X);
  X.W.capas.edif.userData.u.uSube.value = 1;
  if (X.R.rapido) { X.vuelo([PORTADA[2]], 0); S.borde = 1; S.bordeOp = 1; return; }
  X.vuelo([PORTADA[0]], 0); S.borde = 0;
  const velo = X.ed.anexar(hh('div', 'ed-velo', '')); gsap.set(velo, { autoAlpha: 1 });
  const arrancar = () => {
    if (!ok()) return;
    gsap.to(velo, { autoAlpha: 0, duration: 2.6, ease: 'sine.inOut', onComplete: () => velo.remove() });
    X.vuelo([PORTADA[1], PORTADA[2]], 17, { ease: 'sine.inOut', deriva: 0.05, derivaD: 30 });
    // mientras corre la portada se baja el detalle de los primeros encuadres de la introducción
    gsap.delayedCall(2, () => ok() && precargarVistas(X, [
      { p: [P.cora[0] + 1150, 1250, P.cora[1] + 1650], o: [P.cora[0], 0, P.cora[1]] },
      { p: [P.cora[0] + 700, 1150, P.cora[1] + 1500], o: [P.cora[0] - 120, 0, P.cora[1] + 60] },
      { p: [500, 4700, 4400], o: [-150, 0, -650] },
    ]));
    poner(X, { borde: 1 }, 6, 'power2.inOut', 3.4);
    gsap.delayedCall(4.6, () => { if (ok()) titulo(X); });
  };
  // espera a que la fotogrametría cubra la vista y termine de bajar el detalle de este encuadre (máx. 25 s)
  const t0 = performance.now(); let cubierta = 0;
  const esperar = () => {
    if (!ok()) return;
    const ms = performance.now() - t0, st = W.gfoto?.tiles?.stats || {};
    if (W.google && !cubierta) cubierta = ms;
    const quieto = cubierta && st.downloading === 0 && st.parsing === 0;
    if ((cubierta && (quieto || ms - cubierta > 7000) && ms - cubierta > 900) || ms > 25000 || !W.gfoto) gsap.delayedCall(0.4, arrancar);
    else setTimeout(esperar, 150);
  };
  esperar();
}
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
