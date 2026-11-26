// Kennedy realista y optimizado (mismo lenguaje que el simulador: hora dorada sobre Bogotá).
// Optimización: todo en pocas llamadas de dibujo (instancias por teselas con descarte por cámara),
// texturas de 512 px, sombras solo en el área visible, y un gobernador que baja la calidad si la máquina no da.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* Fotograma clave del simulador (cielo.js) entre la puesta (e = 0°) y la hora dorada (e = 5°) */
export const HORA = {
  top: new THREE.Color(0x1d3a72), mid: new THREE.Color(0x6a6fa8), bot: new THREE.Color(0xf09a5c), hor: new THREE.Color(0xff9a4e),
  fog: new THREE.Color(0x5d5a78), hemi: new THREE.Color(0x8a93a8), suelo: new THREE.Color(0x3a322b), sol: new THREE.Color(0xffa45c),
};
// sol al occidente (−x), 7° sobre el horizonte, un poco al sur
export const SOL_DIR = new THREE.Vector3(-0.93, 0.2, 0.3).normalize(); // puesta: sol rasante al occidente
const tl = new THREE.TextureLoader();
const tex = (u, rep = true) => { const t = tl.load(u); t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; };

/* ---------------------------------------------------------------- cielo, niebla y luz */
export function cieloYLuz(W) {
  const U = { top: { value: HORA.top }, mid: { value: HORA.mid }, bot: { value: HORA.bot }, uHor: { value: HORA.hor }, uSun: { value: SOL_DIR }, uT: { value: 0 } };
  const cielo = new THREE.Mesh(new THREE.SphereGeometry(45000, 48, 24), new THREE.ShaderMaterial({
    uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vP; uniform vec3 top, mid, bot, uHor, uSun; uniform float uT;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
      void main(){ vec3 d = normalize(vP); float h = d.y; vec3 S = normalize(uSun);
        vec3 c = h > .1 ? mix(mid, top, smoothstep(.1,.8,h)) : mix(bot, mid, smoothstep(-.06,.1,h));
        vec2 dh = normalize(d.xz+1e-5), sh = normalize(S.xz+1e-5); float lado = .35 + .65*pow(max(dot(dh,sh)*.5+.5,0.),2.5);
        c = mix(c, uHor, lado * exp(-max(h,0.)*7.) * smoothstep(-.12,.02,h));
        float sa = max(dot(d,S),0.); c += vec3(1.,.75,.45) * (pow(sa,900.)*6. + pow(sa,12.)*.35);
        c = mix(c, vec3(.13,.12,.13), smoothstep(-.01,-.09,h)); // bajo el horizonte: suelo oscuro, nunca cielo
        if (h > 0.) { vec2 uv = d.xz/(h+.22)*.7 + uT*vec2(.006,.002); float n = fbm(uv), n2 = fbm(uv*2.3+4.);
          float cov = smoothstep(.5,.78, n*.72+n2*.28) * smoothstep(0.,.16,h);
          vec3 nub = mix(vec3(.55,.45,.52), vec3(1.,.78,.62), clamp(.4 + (fbm(uv - S.xz*.06)-n)*3.5 + lado*.4, 0., 1.));
          c = mix(c, nub, cov*.85); }
        gl_FragColor = vec4(c, 1.); }`,
  }));
  cielo.frustumCulled = false; cielo.renderOrder = -1; W.scene.add(cielo); W.cielo = cielo; W.cieloU = U;
  W.scene.background = null;
  W.scene.fog = new THREE.FogExp2(HORA.fog, 0.000022);
  // entorno de reflejos a partir del propio cielo (cromo, agua y vidrio reflejan el atardecer)
  const s = new THREE.Scene(); const cc = cielo.clone(); cc.scale.setScalar(0.001); s.add(cc); // dentro del alcance de la cámara cúbica
  const pm = new THREE.PMREMGenerator(W.r); W.scene.environment = pm.fromScene(s, 0.04).texture; pm.dispose();
  // luces
  const hemi = new THREE.HemisphereLight(HORA.hemi, HORA.suelo, 1.05); W.scene.add(hemi);
  const sol = new THREE.DirectionalLight(HORA.sol, 4.2); sol.castShadow = true;
  sol.shadow.mapSize.set(4096, 4096); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 1.5;
  Object.assign(sol.shadow.camera, { near: 100, far: 30000 }); W.scene.add(sol); W.scene.add(sol.target); W.sol = sol;
  W.r.shadowMap.enabled = true; W.r.shadowMap.type = THREE.PCFSoftShadowMap; W.r.toneMappingExposure = 0.95;
}
/** la sombra solo cubre lo que se ve (calidad constante a cualquier zoom) */
export function sombraSigue(W, obj, dist) {
  const s = W.sol, S = THREE.MathUtils.clamp(dist * 0.8, 350, 7500), c = s.shadow.camera;
  s.target.position.copy(obj); s.position.copy(obj).addScaledVector(SOL_DIR, 12000);
  if (Math.abs(c.right - S) > S * 0.08) { c.left = -S; c.right = S; c.top = S; c.bottom = -S; c.updateProjectionMatrix(); }
  W.cieloU.uT.value = W.t;
}

/* ---------------------------------------------------------------- cerros orientales y bordes de la Sabana */
export function cerros(W) {
  const ruido = (x) => Math.sin(x * 0.00031) * 0.5 + Math.sin(x * 0.00087 + 1.3) * 0.28 + Math.sin(x * 0.0021 + 4.1) * 0.12 + Math.sin(x * 0.0057) * 0.05;
  const hacer = (cx, ancho, largo, alto, col, rotY) => {
    const g = new THREE.PlaneGeometry(largo, ancho, 220, 40); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const perfil = Math.max(0, 1 - Math.pow(Math.abs(z) / (ancho / 2), 1.6)); p.setY(i, alto * perfil * (0.72 + ruido(x) * 0.55) + Math.sin(x * 0.013 + z * 0.02) * 12); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, roughness: 1, metalness: 0 })); m.position.set(cx[0], -20, cx[1]); m.rotation.y = rotY; W.scene.add(m); (W.cerrosMallas ||= []).push(m); return m;
  };
  hacer([17000, -2000], 7000, 60000, 950, '#3b5446', Math.PI / 2); // cerros orientales (al este, de norte a sur)
  hacer([-2000, 21000], 9000, 50000, 420, '#4a5a48', 0.2); // bordes del sur
  hacer([-26000, -6000], 9000, 50000, 300, '#55604c', Math.PI / 2.3); // occidente, más allá del río Bogotá
}

/* ---------------------------------------------------------------- suelo, calles y parques */
export async function suelo(W, lim) {
  const base = new THREE.Mesh(new THREE.PlaneGeometry(120000, 120000), new THREE.MeshStandardMaterial({ color: '#34322e', roughness: 1 }));
  base.rotation.x = -Math.PI / 2; base.position.y = -62; base.receiveShadow = true; W.scene.add(base); W.baseSuelo = base;
  // calles: cintas de asfalto con el ancho según la jerarquía (una sola malla)
  const pos = [], nor = [];
  W.datos.vias.vias.forEach((v) => {
    const t = v[0], w = (t >= 4 ? 18 : t === 3 ? 12 : 7) / 2;
    for (let i = 1; i + 3 < v.length; i += 2) {
      const x1 = v[i], z1 = v[i + 1], x2 = v[i + 2], z2 = v[i + 3]; const L = Math.hypot(x2 - x1, z2 - z1) || 1; const nx = -(z2 - z1) / L * w, nz = (x2 - x1) / L * w;
      const y = 0.3 + (t >= 4 ? 0.1 : 0);
      pos.push(x1 + nx, y, z1 + nz, x2 + nx, y, z2 + nz, x2 - nx, y, z2 - nz, x1 + nx, y, z1 + nz, x2 - nx, y, z2 - nz, x1 - nx, y, z1 - nz);
      for (let k = 0; k < 6; k++) nor.push(0, 1, 0);
    }
  });
  const gc = new THREE.BufferGeometry(); gc.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gc.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  const calles = new THREE.Mesh(gc, new THREE.MeshStandardMaterial({ color: '#2f3033', roughness: 0.82, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 }));
  calles.receiveShadow = true; W.scene.add(calles); W.calles = calles;
  // parques reales con textura de pasto (una sola malla, UV en metros)
  const P = await fetch('./datos/parques.json').then((r) => r.json());
  const gs = [];
  P.parques.forEach((p) => { try { const s = new THREE.Shape(p.p.map(([x, z]) => new THREE.Vector2(x, -z))); const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); g.translate(0, 0.55, 0); g.deleteAttribute('uv'); gs.push(g); } catch (e) { /* polígono inválido */ } });
  const gp = mergeGeometries(gs); const pp = gp.attributes.position, uv = new Float32Array(pp.count * 2);
  for (let i = 0; i < pp.count; i++) { uv[i * 2] = pp.getX(i) / 22; uv[i * 2 + 1] = pp.getZ(i) / 22; }
  gp.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const parques = new THREE.Mesh(gp, new THREE.MeshStandardMaterial({ map: tex('./tex/pasto_color.jpg'), color: '#93b46e', roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 }));
  parques.receiveShadow = true; W.scene.add(parques); W.parques = parques;
}

/* ---------------------------------------------------------------- material de edificios: ladrillo, ventanas, cubiertas y oclusión */
export function materialEdificios(U) {
  Object.assign(U, { uLad: { value: tex('./tex/ladrillo_color.jpg') }, uTecho: { value: tex('./tex/techos.jpg') }, uNoche: { value: 1.6 } });
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, metalness: 0.0, envMapIntensity: 0.55 });
  const ola = `
      vec2 cen = (instanceMatrix * vec4(0.,0.,0.,1.)).xz;
      float ola = clamp((uSube * uR - distance(cen, uOri)) / 380.0, 0.0, 1.0);
      vec3 transformed = vec3(position.x, position.y * ola, position.z);`;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'uniform float uSube, uR, uFR; uniform vec2 uOri, uFoco; varying float vF; varying vec3 vWP; varying vec3 vWN; varying float vSeed; varying float vH;\n' + sh.vertexShader.replace('#include <begin_vertex>', ola + `
      vF = uFR > 0. ? 1.0 - smoothstep(uFR*0.55, uFR, distance(cen, uFoco)) : 0.0;
      vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
      vWN = normalize(mat3(instanceMatrix) * objectNormal);
      vSeed = fract(sin(dot(cen, vec2(12.9898, 78.233))) * 43758.5453);
      vH = length(instanceMatrix[1].xyz) * ola;`);
    sh.fragmentShader = 'uniform vec3 uFC; uniform float uGris, uNoche; uniform sampler2D uLad, uTecho; varying float vF; varying vec3 vWP; varying vec3 vWN; varying float vSeed; varying float vH;\nfloat h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      float muro = 1.0 - step(0.5, abs(vWN.y));
      vec2 tg = normalize(vec2(-vWN.z, vWN.x) + 1e-5); float u = dot(vWP.xz, tg), v = vWP.y;
      float cu = fract(u / 3.4), cv = fract(v / 2.8);
      float ven = muro * step(0.2, cu) * step(cu, 0.72) * step(0.32, cv) * step(cv, 0.82) * step(1.4, v) * step(v, vH - 0.5);
      vec3 lad = texture2D(uLad, vec2(u, v) / 3.5).rgb; float lum = dot(lad, vec3(.299,.587,.114));
      vec3 murC = diffuseColor.rgb * (0.45 + 0.95 * lum);
      vec3 techo = mix(texture2D(uTecho, vWP.xz / 26.0).rgb * 1.15, diffuseColor.rgb, 0.35);
      diffuseColor.rgb = mix(techo, murC, muro);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.06, 0.075, 0.095), ven);
      diffuseColor.rgb *= mix(0.42, 1.0, smoothstep(0.0, 7.0, vWP.y)) * (1.0 - muro * 0.0) ;
      diffuseColor.rgb = mix(diffuseColor.rgb, uFC, vF * 0.6);
      float g = dot(diffuseColor.rgb, vec3(.299,.587,.114)); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(g) * 0.85, uGris * 0.6 * (1.0 - vF));`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.12, ven);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n metalnessFactor = mix(metalnessFactor, 0.7, ven);')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float lit = step(0.7, h21(floor(vec2(u / 3.4, v / 2.8)) + vSeed * 97.0));
      totalEmissiveRadiance += vec3(1.0, 0.7, 0.4) * lit * ven * uNoche * 0.9 * (1.0 - uGris * 0.7) + uFC * vF * 0.3;`);
  };
  const prof = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  prof.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U); sh.vertexShader = 'uniform float uSube, uR; uniform vec2 uOri;\n' + sh.vertexShader.replace('#include <begin_vertex>', ola); };
  return { mat, prof };
}
/** paleta de Bogotá: mucho ladrillo en lo bajo, más concreto claro en lo alto */
const PAL_BAJO = ['#a4502f', '#934528', '#b05a35', '#8a4129', '#b8754d', '#bfb29c', '#c9c1b1', '#8f8b82'];
const PAL_ALTO = ['#bdb7aa', '#cbc5b8', '#a7a399', '#a65d3d', '#8d9194', '#b8a98f'];
export function colorEdificio(h, r, c) { const p = h > 16 ? PAL_ALTO : PAL_BAJO; return c.set(p[Math.floor(r * p.length) % p.length]); }

/* ---------------------------------------------------------------- 119.886 árboles reales (vallas cruzadas + copa) */
export async function arboles(W) {
  const buf = await fetch('./datos/arboles.bin').then((r) => r.arrayBuffer());
  const dv = new DataView(buf), n = dv.getUint32(4, true);
  const map = tex('./tex/arbol.png', false);
  const q1 = new THREE.PlaneGeometry(1, 1); q1.translate(0, 0.5, 0);
  const q2 = q1.clone().rotateY(Math.PI / 2);
  const q3 = new THREE.PlaneGeometry(0.85, 0.85); q3.rotateX(-Math.PI / 2); q3.translate(0, 0.72, 0);
  const uv3 = q3.attributes.uv; for (let i = 0; i < uv3.count; i++) uv3.setXY(i, 0.18 + uv3.getX(i) * 0.64, 0.5 + uv3.getY(i) * 0.45);
  const geo = mergeGeometries([q1, q2, q3]);
  const UT = { uT: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({ map, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.92 });
  mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, UT); sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position; vec2 c0 = (instanceMatrix * vec4(0.,0.,0.,1.)).xz; transformed.x += sin(uT * 1.6 + c0.x * 0.05 + c0.y * 0.03) * 0.035 * position.y;`); };
  const prof = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.45, side: THREE.DoubleSide });
  const T = 1600, teselas = new Map(), o = new THREE.Object3D(), c = new THREE.Color();
  for (let i = 0; i < n; i++) { const b = 8 + i * 6; const x = dv.getInt16(b, true) / 2, z = dv.getInt16(b + 2, true) / 2; const k = Math.floor(x / T) + ',' + Math.floor(z / T); (teselas.get(k) || teselas.set(k, []).get(k)).push(i); }
  const grp = new THREE.Group();
  teselas.forEach((ids) => {
    const m = new THREE.InstancedMesh(geo, mat, ids.length);
    ids.forEach((i, j) => {
      const b = 8 + i * 6; const h = Math.max(3, dv.getUint8(b + 4) / 10), sp = dv.getUint8(b + 5);
      o.position.set(dv.getInt16(b, true) / 2, 0, dv.getInt16(b + 2, true) / 2); o.rotation.set(0, (sp * 1.7 + i) % 6.28, 0);
      const hv = Math.max(6, h * 2.2), w = Math.max(5, hv * 0.85); o.scale.set(w, hv, w); // copa legible desde la altura de la cámara o.updateMatrix(); m.setMatrixAt(j, o.matrix);
      m.setColorAt(j, c.setHSL(0.24 + ((sp * 37) % 10) / 160, 0.32 + ((sp * 13) % 10) / 60, 0.36 + ((i * 7) % 10) / 90));
    });
    m.computeBoundingSphere(); m.castShadow = true; m.receiveShadow = true; m.customDepthMaterial = prof; grp.add(m);
  });
  W.scene.add(grp); W.arboles = { grp, UT };
}

/* ---------------------------------------------------------------- gobernador de rendimiento */
export function gobernador(W) {
  const G = { nivel: 2, ms: [], ultimo: 0 };
  W.gob = G;
  return (ms) => {
    G.ms.push(ms); if (G.ms.length < 24) return; const prom = G.ms.reduce((a, b) => a + b, 0) / G.ms.length; G.ms = [];
    if (document.hidden) return;
    const presupuesto = W.stop ? 125 : 40; // intervalo real entre cuadros: 12 fps = 83 ms, 60 fps = 17 ms
    if (prom > presupuesto && G.nivel > 0) {
      G.nivel--;
      if (G.nivel === 1) { /* nunca se baja la resolución (se vería borroso) */ W.sol.shadow.mapSize.set(2048, 2048); W.sol.shadow.map?.dispose(); W.sol.shadow.map = null; }
      if (G.nivel === 0) { W.sol.castShadow = false; W.arboles.grp.children.forEach((m) => (m.castShadow = false)); }
      console.info('calidad reducida a', G.nivel, prom.toFixed(1) + ' ms');
    }
  };
}
