// Kennedy en 3D con datos reales (red-de-problemas, macromodelos-kennedy, simulador, humedal El Burro).
// Marco: metros desde el centro de la nube del simulador; x = este, z = sur.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { cieloYLuz, cerros, suelo, arboles, materialEdificios, colorEdificio } from './realismo.js';
import { crearGoogle } from './google.js';

export const W = { capas: {}, et: new Map(), t: 0, stop: false };
const BASE = './';
const C = { lima: '#C7FF27', marfil: '#F5F3EB', lavanda: '#A99BCB', agua: '#6FA3AF', arcilla: '#B58C78', coral: '#E36C4B', gris: '#898D84', petroleo: '#294E59' };
export const COL_P = { A: C.arcilla, B: C.lavanda, C: C.agua, D: C.coral, E: C.marfil, F: C.lima };
export const NOM_P = { A: 'Dependencia de alimentos externos', B: 'Crecimiento poblacional', C: 'Valorización del suelo', D: 'Especulación inmobiliaria', E: 'Gestión de residuos sólidos', F: 'Centralización de servicios' };
export const LUG = {
  corabastos: [-715, -168], kennedy: [-926, 1118], flores: [-451, -469], bavaria: [2119, -1067], mariapaz: [-533, -385],
  patio: [-2033, -1239], tintal: [-126, -3059], centro: [0, 0],
};

const j = (u) => fetch(BASE + u).then((r) => r.json());

/* ------------------------------------------------------------------ utilidades de capa */
function registrar(nombre, obj, { visible = false } = {}) {
  obj.visible = visible; obj.userData.v = visible ? 1 : 0;
  obj.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach((m) => { if (m.userData.op0 === undefined) m.userData.op0 = m.opacity ?? 1; m.transparent = true; }); });
  W.scene.add(obj); W.capas[nombre] = obj; return obj;
}
function aplicarOp(obj, v) {
  obj.userData.v = v; obj.visible = v > 0.002;
  obj.traverse((o) => {
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    ms.forEach((m) => { if (m.uniforms?.uOp) m.uniforms.uOp.value = v; else m.opacity = m.userData.op0 * v; });
  });
}
/** muestra u oculta una capa con fundido escalonado */
export function capa(nombre, on = true, d = 0.8) {
  const o = W.capas[nombre]; if (!o) return;
  const p = { v: o.userData.v ?? 0 };
  gsap.killTweensOf(o.userData);
  if (d <= 0) return aplicarOp(o, on ? 1 : 0);
  gsap.to(p, { v: on ? 1 : 0, duration: d, ease: on ? 'expo.out' : 'expo.in', onUpdate: () => aplicarOp(o, p.v) });
}
export const uni = (nombre) => W.capas[nombre]?.userData.u;

/* ------------------------------------------------------------------ entorno cromado */
function entorno(r) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#08090C');
  const panel = (c, k, pos, rot, esc) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.rotation.set(...rot); m.scale.set(esc[0], esc[1], 1); s.add(m); };
  panel(C.marfil, 6, [0, 6, -9], [0, 0, 0], [12, 2]); panel(C.marfil, 3, [0, 9, 0], [Math.PI / 2, 0, 0], [10, 10]);
  panel(C.lavanda, 2.4, [-8, 1, 3], [0, Math.PI / 2, 0], [10, 3]); panel(C.lima, 1.8, [8, -2, 2], [0, -Math.PI / 2, 0], [8, 1.5]);
  panel(C.marfil, 2.6, [0, 0, 10], [0, Math.PI, 0], [20, 1]); panel(C.coral, 1.2, [0, -6, 6], [Math.PI / 2, 0, 0], [5, 5]);
  const pm = new THREE.PMREMGenerator(r); const t = pm.fromScene(s, 0.02).texture; pm.dispose(); return t;
}
export const cromo = (color = '#f1f2f5') => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: 0.12, iridescence: 0.55, iridescenceIOR: 1.4, iridescenceThicknessRange: [180, 520], clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2 });
export const cromoLima = () => { const m = cromo(C.lima); m.metalness = 0.75; m.emissive = new THREE.Color(C.lima); m.emissiveIntensity = 0.3; return m; };

/* ------------------------------------------------------------------ materiales de puntos y líneas animadas */
function matPuntos(color, size = 28) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uOp: { value: 0 }, uAp: { value: 0 }, uT: { value: 0 }, uC: { value: new THREE.Color(color) }, uS: { value: size }, uPix: { value: 1 } },
    vertexShader: `attribute float aR; attribute float aK; uniform float uAp, uT, uS, uPix; varying float vA; varying float vK;
      void main(){ float a = clamp((uAp*1.25 - aR)*6.0, 0.0, 1.0); vA = a; vK = aK;
        vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        float pul = 1.0 + 0.25*sin(uT*2.0 + aR*40.0);
        gl_PointSize = uS * aK * a * pul * uPix * (900.0 / -mv.z); }`,
    fragmentShader: `uniform vec3 uC; uniform float uOp; varying float vA; varying float vK;
      void main(){ vec2 p = gl_PointCoord - .5; float d = length(p); if(d>.5) discard;
        float nucleo = smoothstep(.5, .12, d); float aro = smoothstep(.5,.42,d) - smoothstep(.42,.34,d);
        gl_FragColor = vec4(uC * (nucleo*0.9 + aro*0.8) + vec3(nucleo*nucleo*0.4), (nucleo*0.85 + aro) * uOp * vA); }`,
  });
}
function matFlujo(color, vel = 260, largo = 140, hueco = 520) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uOp: { value: 0 }, uT: { value: 0 }, uDib: { value: 1 }, uC: { value: new THREE.Color(color) }, uV: { value: vel }, uL: { value: largo }, uH: { value: hueco }, uBase: { value: 0.18 } },
    vertexShader: `attribute float aD; attribute float aDT; varying float vD; varying float vDT; void main(){ vD = aD; vDT = aDT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uOp, uT, uDib, uV, uL, uH, uBase; uniform vec3 uC; varying float vD; varying float vDT;
      void main(){ if (vD > uDib * vDT) discard; float ph = mod(vD - uT*uV, uL + uH); float dash = ph < uL ? 1.0 : 0.0;
        gl_FragColor = vec4(uC, (uBase + dash*0.95) * uOp); }`,
  });
}
/** polilíneas [[x,z,x,z,...]] → LineSegments con distancia acumulada (aD) y total (aDT) */
function lineas(polis, y = 3) {
  const pos = [], d = [], dt = [];
  polis.forEach((pl) => {
    let acc = 0; const segs = []; for (let i = 0; i + 3 < pl.length; i += 2) { const L = Math.hypot(pl[i + 2] - pl[i], pl[i + 3] - pl[i + 1]); segs.push([pl[i], pl[i + 1], pl[i + 2], pl[i + 3], acc, acc + L]); acc += L; }
    segs.forEach(([x1, z1, x2, z2, a, b]) => { pos.push(x1, y, z1, x2, y, z2); d.push(a, b); dt.push(acc, acc); });
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aD', new THREE.Float32BufferAttribute(d, 1)); g.setAttribute('aDT', new THREE.Float32BufferAttribute(dt, 1));
  return g;
}
function puntos(pts, color, size, y = 8) {
  const pos = [], r = [], k = [];
  pts.forEach((p) => { pos.push(p[0], y + (p[2] || 1) * 4, p[1]); r.push(Math.random()); k.push(Math.min(3.5, Math.sqrt(p[2] || 1))); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aR', new THREE.Float32BufferAttribute(r, 1)); g.setAttribute('aK', new THREE.Float32BufferAttribute(k, 1));
  const m = new THREE.Points(g, matPuntos(color, size)); m.frustumCulled = false; return m;
}

/* ------------------------------------------------------------------ construcción */
export async function crearMundo(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(innerWidth, innerHeight, false);
  // el centro de la escena 3D se corre a la derecha: el texto vive a la izquierda
  // encuadre: en horizontal el centro 3D se corre a la derecha (texto a la izquierda);
  // en vertical (celular) se conserva el ancho de vista de una pantalla 16:9 y no se corre
  const desplazar = () => {
    const a = innerWidth / innerHeight;
    if (a < 1.2) { cam.fov = Math.min(80, 2 * Math.atan(Math.tan(18 * Math.PI / 180) * 1.6 / a) * 180 / Math.PI); cam.clearViewOffset(); }
    else { cam.fov = 36; cam.setViewOffset(innerWidth, innerHeight, -innerWidth * 0.11, 0, innerWidth, innerHeight); }
    cam.updateProjectionMatrix();
  };
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#08090C'); scene.fog = new THREE.FogExp2('#08090C', 0.000085);
  scene.environment = entorno(r);
  const cam = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 5, 60000);
  Object.assign(W, { r, scene, cam, obj: new THREE.Vector3(), pos: new THREE.Vector3(0, 9000, 9000) });
  cieloYLuz(W); cerros(W);
  addEventListener('resize', () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; desplazar(); });
  desplazar();

  // arco de luz del mundo (borde de planeta) — siempre vivo
  W.arco = { material: {} }; // (el arco de luz se reemplaza por el cielo real)
  const polvo = new THREE.BufferGeometry(); const pp = []; for (let i = 0; i < 900; i++) pp.push((Math.random() - .5) * 14000, 30 + Math.random() * 900, (Math.random() - .5) * 14000);
  polvo.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
  W.polvo = new THREE.Points(polvo, new THREE.PointsMaterial({ color: '#ffd9a8', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.45, depthWrite: false })); scene.add(W.polvo);

  const [lim, vias, agua, upz, lug, ctx, pot] = await Promise.all(['datos/limite.json', 'datos/vias.json', 'datos/agua.json', 'datos/upz.json', 'datos/lugares.json', 'datos/contexto.json', 'datos/pot.json'].map(j));
  W.datos = { lim, vias, agua, upz, lug, ctx, pot };

  /* losa recortada por el límite de la localidad */
  const sh = new THREE.Shape(lim.pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const gl = new THREE.ExtrudeGeometry(sh, { depth: 60, bevelEnabled: false }); gl.rotateX(-Math.PI / 2); gl.translate(0, -60, 0);
  const losa = new THREE.Group();
  const ml = new THREE.Mesh(gl, new THREE.MeshStandardMaterial({ color: '#4a4741', roughness: 0.95, metalness: 0 })); ml.receiveShadow = true; losa.add(ml);
  const borde = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(lim.pts.map(([x, z]) => new THREE.Vector3(x, 2, z))), new THREE.LineBasicMaterial({ color: C.lima, transparent: true, opacity: 0.9 }));
  losa.add(borde); registrar('losa', losa);

  /* vías */
  const vg = lineas(vias.vias.map((v) => v.slice(1)), 2.5);
  const vm = matFlujo(C.marfil, 0, 0, 1); vm.uniforms.uBase.value = 0.16; vm.blending = THREE.NormalBlending;
  registrar('vias', new THREE.LineSegments(vg, vm));
  const prin = vias.vias.filter((v) => v[0] >= 4).map((v) => v.slice(1));
  const vpm = matFlujo(C.lavanda, 420, 90, 700); vpm.uniforms.uBase.value = 0.35;
  registrar('vias-prin', new THREE.LineSegments(lineas(prin, 4), vpm)); uniRef('vias-prin', vpm);
  /* flujos de carga hacia Corabastos */
  const fl = Object.values(vias.flujos || {}).flat();
  const fm = matFlujo(C.coral, 520, 160, 420); fm.uniforms.uBase.value = 0.12;
  registrar('flujos', new THREE.LineSegments(lineas(fl, 9), fm)); uniRef('flujos', fm);

  /* agua */
  const ag = new THREE.Group();
  agua.agua.forEach((a) => {
    if (!a.poly || a.poly.length < 3) return;
    const s = new THREE.Shape(a.poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); g.translate(0, 3, 0);
    const ma = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#4d6e76', roughness: 0.08, metalness: 0.35, envMapIntensity: 1.4, transparent: true, opacity: 0.95, polygonOffset: true, polygonOffsetFactor: -3 })); ma.receiveShadow = true; ag.add(ma);
  });
  registrar('agua', ag);

  /* UPZ: prismas con altura = habitantes por hectárea */
  const ug = new THREE.Group(); W.upz = {};
  upz.upz.forEach((u) => {
    const s = new THREE.Shape(u.poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
    const col = new THREE.Color(C.lavanda).lerp(new THREE.Color(C.coral), Math.min(1, u.dens / 440));
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.55, roughness: 0.4, metalness: 0.3, emissive: col, emissiveIntensity: 0.25 }));
    m.scale.y = 0.001; m.userData.h = u.dens * 1.5; ug.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), new THREE.LineBasicMaterial({ color: C.marfil, transparent: true, opacity: 0.5 }));
    m.add(e); W.upz[u.n] = { m, u };
  });
  registrar('upz', ug);

  /* puntos de cada problema (conectografía) */
  [...'ABCDEF'].forEach((k) => {
    const pts = lug[k].pts; const p = puntos(pts, COL_P[k], k === 'F' ? 90 : k === 'B' ? 10 : 22, 10);
    registrar('p' + k, p); uniRef('p' + k, p.material);
  });

  /* isócronas a mercados (contexto.iso) */
  const iso = (ctx.iso || []).map((a) => a.slice(1));
  const im = matFlujo(C.lima, 300, 60, 120); im.uniforms.uBase.value = 0.45;
  registrar('iso', new THREE.LineSegments(lineas(iso, 12), im)); uniRef('iso', im);

  /* metro línea 1 */
  if (ctx.metro) { const mm = matFlujo(C.lavanda, 600, 300, 300); mm.uniforms.uBase.value = 0.5; registrar('metro', new THREE.LineSegments(lineas([ctx.metro.flat()], 30), mm)); uniRef('metro', mm); }

  /* edificios reales (edif.bin) con crecimiento en ola y tinte por foco */
  await edificios();
  await Promise.all([suelo(W), arboles(W)]);
  redPOT(pot); red6(); propuesta(); agentes(); await especies(); capas18(); bavaria();
  W.gfoto = crearGoogle(W, W.capas.edif.userData.u); // fotogrametría real encima de todo lo anterior
  return W;
}
function uniRef(nombre, mat) { W.capas[nombre].userData.u = mat.uniforms; }

async function edificios() {
  const buf = await fetch(BASE + 'datos/edif.bin').then((r) => r.arrayBuffer());
  const dv = new DataView(buf), n = dv.getUint32(4, true);
  const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0);
  { const ix = Array.from(g.index.array); ix.splice(18, 6); g.setIndex(ix); g.clearGroups(); } // sin cara inferior (nunca se ve)
  const U = { uSube: { value: 0 }, uOri: { value: new THREE.Vector2(-715, -168) }, uR: { value: 9000 }, uFoco: { value: new THREE.Vector2(-715, -168) }, uFR: { value: 0 }, uFC: { value: new THREE.Color(C.lima) }, uGris: { value: 0 }, uOp: { value: 1 } };
  const { mat, prof } = materialEdificios(U);
  // teselas de 1,2 km: cada una con su esfera envolvente → la GPU descarta lo que no está en cámara
  const T = 1200, tes = new Map();
  for (let i = 0; i < n; i++) { const b = 8 + i * 12; const k = Math.floor(dv.getInt16(b, true) / 2 / T) + ',' + Math.floor(dv.getInt16(b + 2, true) / 2 / T); (tes.get(k) || tes.set(k, []).get(k)).push(i); }
  const grp = new THREE.Group(), o = new THREE.Object3D(), c = new THREE.Color();
  tes.forEach((ids) => {
    const m = new THREE.InstancedMesh(g, mat, ids.length);
    ids.forEach((i, j) => {
      const b = 8 + i * 12; const hh = dv.getInt16(b + 10, true) / 2;
      o.position.set(dv.getInt16(b, true) / 2, 0, dv.getInt16(b + 2, true) / 2); o.rotation.set(0, dv.getInt16(b + 8, true) / 10000, 0);
      o.scale.set(dv.getInt16(b + 4, true) / 2, Math.max(3, hh), dv.getInt16(b + 6, true) / 2); o.updateMatrix(); m.setMatrixAt(j, o.matrix);
      colorEdificio(hh, ((i * 2654435761) % 1000) / 1000, c); m.setColorAt(j, c);
    });
    m.computeBoundingSphere(); m.castShadow = true; m.receiveShadow = true; m.customDepthMaterial = prof; grp.add(m);
  });
  registrar('edif', grp); W.capas.edif.userData.u = U;
  mat.transparent = false; // los edificios no se funden: crecen (uSube)
}

/* ------------------------------------------------------------------ CONECTOGRAFÍA: redes sobre su geografía real
   Nodo = lugar real (anillo en el suelo + haz de luz + cabeza) · relación = arco sobre el territorio.
   Convenciones de la red del POT: color = capa · tamaño = grado · halo = 5 de mayor grado · color/grosor del arco = tensión. */
export const CAPAS_POT = [
  ['Actuaciones Estratégicas (AE)', '#C7FF27'], ['Estructura ecológica', '#9be15d'], ['Condicionantes normativos', '#b9bcb3'], ['Movilidad e infraestructura', '#A99BCB'],
  ['Actividad económica', '#e0a070'], ['Usos del suelo (POT)', '#F5F3EB'], ['Actores clave', '#E36C4B'], ['Aspectos poco atendidos', '#6FC3D0'],
];
export const TENSION = { Media: ['#F5F3EB', 0.16], Alta: ['#A99BCB', 0.75], Severa: ['#e0a070', 0.95], 'Crítica': ['#E36C4B', 1] };
const MXg = 111320 * Math.cos(4.63 * Math.PI / 180), MYg = 110540;
/** [lng, lat] → marco local (igual que el simulador: modelo → x − cx, −(y − cy)) */
export const geo = (lng, lat) => [5193.24 + (lng + 74.17) * MXg - 7188, -((2090.06 + (lat - 4.63) * MYg) - 2045.46)];

function metricas(ids, ar) {
  const n = ids.length, idx = Object.fromEntries(ids.map((k, i) => [k, i])), ady = ids.map(() => new Set());
  ar.forEach((e) => { ady[idx[e.a]].add(idx[e.b]); ady[idx[e.b]].add(idx[e.a]); });
  const grado = ady.map((s) => s.size), CB = new Array(n).fill(0); let diam = 0, comp = 0; const visto = new Array(n).fill(false);
  for (let s = 0; s < n; s++) {
    const S = [], Pr = ids.map(() => []), sig = new Array(n).fill(0), d = new Array(n).fill(-1); sig[s] = 1; d[s] = 0; const Q = [s];
    while (Q.length) { const v = Q.shift(); S.push(v); for (const w of ady[v]) { if (d[w] < 0) { d[w] = d[v] + 1; Q.push(w); } if (d[w] === d[v] + 1) { sig[w] += sig[v]; Pr[w].push(v); } } }
    diam = Math.max(diam, ...d); const del = new Array(n).fill(0);
    while (S.length) { const w = S.pop(); for (const v of Pr[w]) del[v] += (sig[v] / sig[w]) * (1 + del[w]); if (w !== s) CB[w] += del[w]; }
    if (!visto[s]) { comp++; d.forEach((x, i) => { if (x >= 0) visto[i] = true; }); }
  }
  return { n, m: ar.length, grado, inter: CB.map((c) => c / ((n - 1) * (n - 2))), densidad: (2 * ar.length) / (n * (n - 1)), gradoMedio: (2 * ar.length) / n, diametro: diam, componentes: comp };
}

/** marcador de conectografía (unidad: con escala r → anillo de radio 0,5r, haz de 4r) */
const GEO_M = { anillo: new THREE.RingGeometry(0.42, 0.5, 64), disco: new THREE.CircleGeometry(0.42, 48), halo: new THREE.RingGeometry(0.62, 0.66, 64), haz: new THREE.CylinderGeometry(0.035, 0.06, 4, 10, 1, true).translate(0, 2, 0), cabeza: new THREE.SphereGeometry(0.15, 20, 14) };
[GEO_M.anillo, GEO_M.disco, GEO_M.halo].forEach((g) => g.rotateX(-Math.PI / 2));
function marcador(color, hub = false) {
  const g = new THREE.Group(), c = new THREE.Color(color);
  const add = (geo, op) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); g.add(m); return m; };
  add(GEO_M.anillo, 0.95).position.y = 2; add(GEO_M.disco, 0.22).position.y = 1.5; add(GEO_M.haz, 0.55);
  const cab = add(GEO_M.cabeza, 1); cab.position.y = 4; g.userData.cabeza = cab;
  if (hub) { const h = add(GEO_M.halo, 0.9); h.position.y = 2; g.userData.halo = h; }
  return g;
}

/* ---------------------------------------------------------------- red del POT sobre Bogotá (58 nodos y 383 relaciones reales) */
const SEG = 18; // segmentos por arco
function redPOT(pot) {
  const ids = Object.keys(pot.nodos), idx = Object.fromEntries(ids.map((k, i) => [k, i]));
  const ar = Object.values(pot.aristas).filter((e) => idx[e.a] !== undefined && idx[e.b] !== undefined);
  const M = metricas(ids, ar);
  const capaDe = ids.map((k) => Math.max(0, CAPAS_POT.findIndex((c) => c[0] === pot.nodos[k].capa)));
  const P = ids.map((k) => geo(pot.nodos[k].lon, pot.nodos[k].lat));
  // nodos en el mismo sitio se separan un poco en anillo (legibilidad), sin perder su lugar
  const usados = new Map(); P.forEach((p, i) => { const k = Math.round(p[0] / 60) + ',' + Math.round(p[1] / 60); const n = usados.get(k) || 0; usados.set(k, n + 1); if (n) { const a = n * 2.4; p[0] += Math.cos(a) * 90 * Math.sqrt(n); p[1] += Math.sin(a) * 90 * Math.sqrt(n); } });
  const xs = P.map((p) => p[0]), zs = P.map((p) => p[1]);
  const bb = { x0: Math.min(...xs) - 400, x1: Math.max(...xs) + 400, z0: Math.min(...zs) - 400, z1: Math.max(...zs) + 400 };
  const centro = new THREE.Vector3((bb.x0 + bb.x1) / 2, 0, (bb.z0 + bb.z1) / 2), radio = Math.max(bb.x1 - bb.x0, bb.z1 - bb.z0) / 2;
  const grp = new THREE.Group();
  const planos = CAPAS_POT.map(([nom, col], i) => {
    const g = new THREE.Group(); g.position.y = 0; g.userData.i = i;
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(bb.x1 - bb.x0, bb.z1 - bb.z0), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false, fog: false }));
    pl.rotation.x = -Math.PI / 2; pl.position.set(centro.x, 0, centro.z); g.add(pl); g.userData.pl = pl;
    const bord = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[bb.x0, bb.z0], [bb.x1, bb.z0], [bb.x1, bb.z1], [bb.x0, bb.z1]].map(([x, z]) => new THREE.Vector3(x, 0, z))), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.6, fog: false }));
    g.add(bord); g.userData.bord = bord;
    const ancla = new THREE.Object3D(); ancla.position.set(bb.x1, 0, bb.z1); g.add(ancla); g.userData.ancla = ancla;
    grp.add(g); return g;
  });
  const top5 = [...M.grado].sort((a, b) => b - a)[4];
  const nodos = ids.map((k, i) => {
    const hub = M.grado[i] >= top5, m = marcador(hub ? '#C7FF27' : CAPAS_POT[capaDe[i]][1], hub);
    m.position.set(P[i][0], 0, P[i][1]); const r = 34 + Math.sqrt(M.grado[i]) * 17;
    m.userData = { ...m.userData, r, hub, grado: M.grado[i], inter: M.inter[i], nombre: pot.nodos[k].nombre, capa: pot.nodos[k].capa, ci: capaDe[i] };
    m.scale.setScalar(r); planos[capaDe[i]].add(m); return m;
  });
  const mkL = (lista, ancho, op) => {
    const g = new LineSegmentsGeometry(); const mat = new LineMaterial({ vertexColors: true, linewidth: ancho, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    mat.resolution.set(innerWidth, innerHeight); addEventListener('resize', () => mat.resolution.set(innerWidth, innerHeight));
    const col = []; lista.forEach((e) => { const c = new THREE.Color((TENSION[e.tension] || TENSION.Media)[0]); for (let s = 0; s < SEG; s++) col.push(c.r, c.g, c.b, c.r, c.g, c.b); });
    g.setPositions(new Float32Array(lista.length * SEG * 6)); g.setColors(col);
    const l = new LineSegments2(g, mat); l.frustumCulled = false; grp.add(l); return { l, g, lista };
  };
  const debiles = mkL(ar.filter((e) => e.tension === 'Media'), 1, 0.13), fuertes = mkL(ar.filter((e) => e.tension !== 'Media'), 3, 0.95);
  const NP = ar.length * 2, pp = new Float32Array(NP * 3); const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  pg.setAttribute('aR', new THREE.BufferAttribute(new Float32Array(NP).map(() => Math.random()), 1)); pg.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(NP).fill(0.8), 1));
  const pm = new THREE.Points(pg, matPuntos('#ffffff', 11)); pm.material.uniforms.uAp.value = 1; pm.frustumCulled = false; grp.add(pm);
  registrar('red-pot', grp);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), Q = new THREE.Vector3();
  const punto = (a, b, u, out) => { const d = Math.hypot(b.x - a.x, b.z - a.z); const h = Math.min(1300, 90 + d * 0.24); out.lerpVectors(a, b, u); out.y += 4 * h * u * (1 - u); return out; };
  W.pot = { grp, nodos, planos, M, ids, ar, idx, centro, radio, actualizar(t) {
    if (!grp.visible) return;
    const base = (e, v) => { const m = nodos[idx[e]]; v.copy(m.position).add(m.parent.position); v.y += 6; return v; };
    [debiles, fuertes].forEach(({ g, lista }) => { const arr = g.attributes.instanceStart.data.array; let o = 0; lista.forEach((e) => { base(e.a, A); base(e.b, B); for (let s = 0; s < SEG; s++) { punto(A, B, s / SEG, Q); arr[o++] = Q.x; arr[o++] = Q.y; arr[o++] = Q.z; punto(A, B, (s + 1) / SEG, Q); arr[o++] = Q.x; arr[o++] = Q.y; arr[o++] = Q.z; } }); g.attributes.instanceStart.data.needsUpdate = true; g.computeBoundingSphere(); });
    ar.forEach((e, i) => { base(e.a, A); base(e.b, B); for (let s2 = 0; s2 < 2; s2++) { const f = (t * 0.22 + i * 0.137) % 1; punto(A, B, s2 ? 1 - f : f, Q); pp.set([Q.x, Q.y, Q.z], (i * 2 + s2) * 3); } });
    pg.attributes.position.needsUpdate = true;
    planos.forEach((g) => { const v = g.position.y > 40; g.userData.pl.visible = v; g.userData.bord.visible = v; });
    nodos.forEach((m) => { if (m.userData.halo) { const k = 1 + 0.18 * Math.sin(t * 3); m.userData.halo.scale.set(k, 1, k); } });
  } };
}

/* ---------------------------------------------------------------- red DIRIGIDA de los seis problemas, en sus lugares reales */
export const RED6 = { aristas: [['B', 'A'], ['B', 'F'], ['F', 'C'], ['F', 'D'], ['C', 'D'], ['A', 'F'], ['A', 'E'], ['F', 'E']] };
function red6() {
  const grp = new THREE.Group();
  const L = W.datos.lug, cen = (k) => { let x = 0, z = 0; L[k].pts.forEach((p) => { x += p[0]; z += p[1]; }); return [x / L[k].pts.length, z / L[k].pts.length]; };
  // un lugar por problema (sin superponer): hitos reales o el centroide de sus datos
  const lugar = { F: [-715, -168], E: [-533, -385], A: [-926, 1118], D: [2119, -1067], B: cen('B'), C: cen('C') };
  const P = {}; W.red6Suelo = {};
  Object.entries(lugar).forEach(([k, [x, z]]) => { P[k] = new THREE.Vector3(x, 0, z); W.red6Suelo[k] = P[k].clone(); });
  const grado = {}; [...'ABCDEF'].forEach((k) => (grado[k] = { in: 0, out: 0 })); RED6.aristas.forEach(([a, b]) => { grado[a].out++; grado[b].in++; });
  W.red6Grado = grado;
  const radio = (k) => 70 + (grado[k].in + grado[k].out) * 17;
  const nod = {};
  [...'FABCDE'].forEach((k) => { const m = marcador(COL_P[k], k === 'F'); m.position.copy(P[k]); m.userData = { ...m.userData, k, r: radio(k) }; m.scale.setScalar(radio(k)); grp.add(m); nod[k] = m; });
  const tubos = RED6.aristas.map(([a, b]) => {
    const A = P[a].clone().setY(8), B = P[b].clone().setY(8), d = A.distanceTo(B);
    const mid = A.clone().add(B).multiplyScalar(0.5).setY(Math.min(1400, 180 + d * 0.42));
    const curva = new THREE.QuadraticBezierCurve3(A, mid, B);
    const col = a === 'F' || b === 'F' ? C.lima : C.marfil;
    const t = new THREE.Mesh(new THREE.TubeGeometry(curva, 80, 9, 8, false), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, fog: false }));
    t.geometry.setDrawRange(0, 0);
    let u = 0.995; const rb = radio(b) * 0.5 + 20; while (u > 0.5 && Math.hypot(curva.getPoint(u).x - B.x, curva.getPoint(u).z - B.z) < rb) u -= 0.003;
    const punta = new THREE.Mesh(new THREE.ConeGeometry(34, 110, 20), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, fog: false }));
    punta.geometry.translate(0, -55, 0); punta.position.copy(curva.getPoint(u)); punta.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curva.getTangent(u).normalize()); punta.scale.setScalar(0.001);
    grp.add(punta); t.userData = { a, b, curva, total: t.geometry.index.count, punta }; grp.add(t); return t;
  });
  registrar('red6', grp);
  W.red6 = { grp, nod, tubos, P };
}

/* ------------------------------------------------------------------ propuesta: mercados, estaciones, corredores */
function anillo(color, r = 1) { return new THREE.Mesh(new THREE.RingGeometry(r * 0.96, r, 96), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })); }
function propuesta() {
  const L = W.datos.lug, U = W.datos.upz.upz;
  // mercados barriales distribuidos (esquema): un nodo por UPZ + coberturas de 15 min (~1.000 m a pie)
  const mg = new THREE.Group(); W.mercados = [];
  U.forEach((u) => {
    const g = new THREE.Group(); g.position.set(u.c[0], 14, u.c[1]);
    const ar = anillo(C.lima, 1000); ar.rotation.x = -Math.PI / 2; ar.scale.setScalar(0.001); g.add(ar);
    const disco = new THREE.Mesh(new THREE.CircleGeometry(1000, 64), new THREE.MeshBasicMaterial({ color: C.lima, transparent: true, opacity: 0.07, depthWrite: false })); disco.rotation.x = -Math.PI / 2; disco.scale.setScalar(0.001); g.add(disco);
    const n = new THREE.Mesh(new THREE.OctahedronGeometry(60), cromoLima()); n.position.y = 120; g.add(n);
    g.userData = { ar, disco, n }; mg.add(g); W.mercados.push(g);
  });
  registrar('mercados', mg);
  // Corabastos como nodo central (concentración actual)
  const cg = new THREE.Group(); cg.position.set(L.F.hitos[0].p[0], 20, L.F.hitos[0].p[1]);
  const t = new THREE.Mesh(new THREE.TorusGeometry(420, 26, 16, 120), cromo()); t.rotation.x = Math.PI / 2; cg.add(t);
  const t2 = new THREE.Mesh(new THREE.TorusGeometry(620, 10, 12, 120), cromoLima()); t2.rotation.x = Math.PI / 2; cg.add(t2);
  registrar('corabastos', cg); W.coraAros = [t, t2];
  // estaciones circulares: cerca de las mayores acumulaciones de residuos (puntos E reales)
  const E = L.E.pts; const sel = [[-533, -385]];
  for (let i = 0; i < 5; i++) { let mejor = null, md = -1; for (let k = 0; k < E.length; k += 7) { const p = E[k]; const d = Math.min(...sel.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]))); if (d > md && Math.abs(p[0]) < 3200 && Math.abs(p[1]) < 3200) { md = d; mejor = [p[0], p[1]]; } } sel.push(mejor); }
  const eg = new THREE.Group(); W.estaciones = [];
  sel.forEach((p) => {
    const g = new THREE.Group(); g.position.set(p[0], 60, p[1]);
    const a = new THREE.Mesh(new THREE.TorusGeometry(150, 30, 16, 64), cromoLima()); a.rotation.x = Math.PI / 2; g.add(a);
    const b = new THREE.Mesh(new THREE.TorusGeometry(100, 16, 12, 64), cromo()); g.add(b);
    g.userData = { a, b }; eg.add(g); W.estaciones.push(g);
  });
  registrar('estaciones', eg);
  // corredores ecológicos: cadena entre cuerpos de agua (centroides reales), tubos que se dibujan
  const cen = W.datos.agua.agua.filter((a) => a.poly?.length > 2).map((a) => { let x = 0, z = 0; a.poly.forEach((p) => { x += p[0]; z += p[1]; }); return new THREE.Vector3(x / a.poly.length, 30, z / a.poly.length); }).filter((v) => Math.abs(v.x) < 4200 && Math.abs(v.z) < 4200);
  const usados = new Set([0]); const cad = [cen[0]]; let act = 0;
  while (usados.size < Math.min(cen.length, 14)) { let mj = -1, md = 1e9; cen.forEach((c, i) => { if (!usados.has(i)) { const d = c.distanceTo(cen[act]); if (d < md) { md = d; mj = i; } } }); usados.add(mj); cad.push(cen[mj]); act = mj; }
  const curva = new THREE.CatmullRomCurve3(cad);
  const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, 600, 16, 10, false), new THREE.MeshBasicMaterial({ color: '#9be15d', transparent: true, opacity: 0.75 }));
  tubo.geometry.setDrawRange(0, 0); tubo.userData.total = tubo.geometry.index.count;
  const cg2 = new THREE.Group(); cg2.add(tubo); registrar('corredores', cg2); W.corredor = tubo; W.parches = cad;
}

/* ------------------------------------------------------------------ agentes del simulador (vehículos/personas sobre vías reales) */
function agentes() {
  const vias = W.datos.vias.vias.filter((v) => v.length > 8 && v[0] >= 3).slice(0, 2600);
  const N = 2600, pos = new Float32Array(N * 3), rnd = new Float32Array(N);
  const ag = []; for (let i = 0; i < N; i++) { const v = vias[i % vias.length].slice(1); ag.push({ v, t: Math.random() * (v.length / 2 - 1), s: (0.4 + Math.random()) * (Math.random() < .5 ? 1 : -1) }); rnd[i] = Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aR', new THREE.BufferAttribute(rnd, 1)); g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(N).fill(1), 1));
  const m = new THREE.Points(g, matPuntos(C.marfil, 9)); m.material.uniforms.uAp.value = 1; m.frustumCulled = false;
  registrar('agentes', m); uniRef('agentes', m.material);
  W.agentes = { ag, pos, g, vel: 1 };
}
export function moverAgentes(dt) {
  const A = W.agentes; if (!A || !W.capas.agentes.visible) return;
  A.ag.forEach((a, i) => {
    const n = a.v.length / 2 - 1; a.t += a.s * dt * 1.6 * A.vel; if (a.t < 0) { a.t = 0; a.s *= -1; } if (a.t > n) { a.t = n; a.s *= -1; }
    const k = Math.floor(Math.min(a.t, n - 0.001)), f = a.t - k;
    A.pos[i * 3] = a.v[k * 2] + (a.v[k * 2 + 2] - a.v[k * 2]) * f; A.pos[i * 3 + 1] = 14; A.pos[i * 3 + 2] = a.v[k * 2 + 1] + (a.v[k * 2 + 3] - a.v[k * 2 + 1]) * f;
  });
  A.g.attributes.position.needsUpdate = true;
}

/* ------------------------------------------------------------------ especies: recortes reales del humedal + abeja 3D */
async function especies() {
  const grp = new THREE.Group(); W.esp = {};
  const tl = new THREE.TextureLoader();
  const sprite = (src, s) => { const t = tl.load(BASE + 'esp/' + src + '.png'); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.set(s, s * 0.9, 1); return sp; };
  const parche = W.parches || [new THREE.Vector3()];
  const crear = (src, n, s, alt) => { const arr = []; for (let i = 0; i < n; i++) { const sp = sprite(src, s); const p = parche[(i * 3 + src.length) % parche.length]; sp.position.set(p.x + (Math.random() - .5) * 600, alt + Math.random() * 120, p.z + (Math.random() - .5) * 600); sp.userData = { base: sp.position.clone(), f: Math.random() * 6 }; grp.add(sp); arr.push(sp); } return arr; };
  W.esp.mirla = crear('mirla', 10, 42, 60); W.esp.tingua = crear('tingua_bogotana', 8, 36, 12); W.esp.colibri = crear('colibri', 6, 30, 70);
  try {
    const gltf = await new GLTFLoader().loadAsync(BASE + 'esp/abeja.glb');
    W.esp.abeja = [];
    for (let i = 0; i < 14; i++) { const a = gltf.scene.clone(); const b = new THREE.Box3().setFromObject(a); const k = 26 / Math.max(1e-3, b.getSize(new THREE.Vector3()).length()); a.scale.setScalar(k); const p = parche[i % parche.length]; a.position.set(p.x + (Math.random() - .5) * 400, 25 + Math.random() * 30, p.z + (Math.random() - .5) * 400); a.userData = { base: a.position.clone(), f: Math.random() * 6 }; grp.add(a); W.esp.abeja.push(a); }
  } catch (e) { W.esp.abeja = []; }
  registrar('especies', grp);
}
export function moverEspecies(t) {
  if (!W.capas.especies?.visible) return;
  Object.entries(W.esp).forEach(([k, arr]) => arr.forEach((s) => {
    const u = s.userData, r = k === 'tingua' ? 60 : 220;
    s.position.set(u.base.x + Math.cos(t * 0.6 + u.f) * r, u.base.y + Math.sin(t * 2.4 + u.f) * (k === 'tingua' ? 6 : 30), u.base.z + Math.sin(t * 0.6 + u.f) * r);
    if (k === 'abeja') s.rotation.y = -t * 0.6 - u.f;
  }));
}

/* ------------------------------------------------------------------ 18 capas satelitales → 9 índices */
function capas18() {
  const grp = new THREE.Group(); const lim = W.datos.lim.pts;
  const s = new THREE.Shape(lim.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2);
  const cols = [C.lavanda, C.agua, C.arcilla, C.coral, C.marfil, C.lima];
  W.capasPl = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
    const e = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(lim.map(([x, z]) => new THREE.Vector3(x, 0, z))), new THREE.LineBasicMaterial({ color: cols[i % cols.length], transparent: true, opacity: 0.7 }));
    m.add(e); m.position.y = 200 + i * 120; m.userData.y0 = m.position.y; grp.add(m); W.capasPl.push(m);
  }
  registrar('capas18', grp);
}

/* ------------------------------------------------------------------ Bavaria Común */
function bavaria() {
  const p = LUG.bavaria; const grp = new THREE.Group(); grp.position.set(p[0], 0, p[1]);
  const a = anillo(C.lima, 700); a.rotation.x = -Math.PI / 2; a.position.y = 16; grp.add(a);
  const b = anillo(C.lavanda, 900); b.rotation.x = -Math.PI / 2; b.position.y = 16; grp.add(b);
  // NBIC: cuatro esferas cromadas en órbita
  // NBIC: cuatro marcadores en el suelo alrededor de las naves (no esferas)
  W.nbic = ['N', 'B', 'I', 'C'].map((k, i) => { const a = (i / 4) * Math.PI * 2 + 0.4; const m = marcador(['#6FC3D0', '#C7FF27', '#A99BCB', '#e0a070'][i], i === 1); m.position.set(Math.cos(a) * 430, 4, Math.sin(a) * 430); m.scale.setScalar(95); m.userData = { ...m.userData, k, a }; grp.add(m); return m; });
  registrar('bavaria', grp); W.bavAros = [a, b];
}
export function moverBavaria(t) {
  if (!W.capas.bavaria?.visible) return;
  W.nbic.forEach((m, i) => { const k = 1 + 0.08 * Math.sin(t * 2.2 + i); m.scale.set(95 * k, 95, 95 * k); });
  W.bavAros[0].rotation.z = t * 0.2; W.bavAros[1].rotation.z = -t * 0.12;
}
