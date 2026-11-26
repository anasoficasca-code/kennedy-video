// Kennedy fotográfico: Google Photorealistic 3D Tiles (igual que el simulador), alineado con el marco local.
// La foto es el mundo; los datos, redes y conectografías van encima. Si falla (sin red o llave), queda la ciudad procedural.
import * as THREE from 'three';
import { TilesRenderer, WGS84_ELLIPSOID } from '3d-tiles-renderer';
import { GoogleCloudAuthPlugin, GLTFExtensionsPlugin } from '3d-tiles-renderer/plugins';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GKEY } from './clave.js';

const MXg = 111320 * Math.cos(4.63 * Math.PI / 180), MYg = 110540, D2R = Math.PI / 180;
const LNG0 = -74.17 + (7188 - 5193.24) / MXg, LAT0 = 4.63 + (2045.46 - 2090.06) / MYg; // origen del marco local

export function crearGoogle(W, U) {
  if (new URLSearchParams(location.search).get('google') === '0') return null;
  const G = { ok: false, dy: 0, calib: 0, t: 0, meta: 7, mats: new Set(), atrib: 0 };
  U.uLuz = U.uLuz || { value: 0.92 };
  const tiles = new TilesRenderer();
  tiles.registerPlugin(new GoogleCloudAuthPlugin({ apiToken: GKEY, autoRefreshToken: true }));
  tiles.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader: new DRACOLoader().setDecoderPath('./draco/') }));
  tiles.setCamera(W.cam); tiles.setResolutionFromRenderer(W.cam, W.r);
  tiles.parseQueue.maxJobs = 4; // menos teselas procesadas a la vez (el plugin pone 10): carga un poco más lenta, sin tirones
  const MOVIL = innerWidth < 900 || /Android|iPhone|iPad/i.test(navigator.userAgent);
  tiles.errorTarget = MOVIL ? 40 : 40; G.meta = MOVIL ? 9 : 7;
  const frame = new THREE.Matrix4(); WGS84_ELLIPSOID.getEastNorthUpFrame(LAT0 * D2R, LNG0 * D2R, frame);
  frame.multiply(new THREE.Matrix4().makeTranslation(0, 0, 2564)); // altura elipsoidal aproximada del suelo de Kennedy; luego se calibra
  const M = new THREE.Matrix4().makeRotationX(-Math.PI / 2).multiply(frame.invert());
  tiles.group.matrixAutoUpdate = false;
  const aplicar = () => { tiles.group.matrix.makeTranslation(0, G.dy, 0).multiply(M); tiles.group.matrixWorldNeedsUpdate = true; tiles.group.updateMatrixWorld(true); };
  aplicar();

  tiles.addEventListener('load-model', ({ scene: s }) => {
    G.cargadas = (G.cargadas || 0) + 1;
    s.traverse((c) => {
      const m = c.isMesh && c.material; if (!m || !m.map) return;
      m.map.anisotropy = W.r.capabilities.getMaxAnisotropy();
      if (!m.isMeshBasicMaterial) { m.emissiveMap = m.map; m.emissive.setScalar(1); m.color.setScalar(0); m.roughness = 1; m.metalness = 0; }
      m.toneMapped = false;
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = 'varying vec3 vWPg;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWPg = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        sh.fragmentShader = 'varying vec3 vWPg; uniform float uSube, uR, uFR, uGris, uLuz, uScan, uScanW; uniform vec2 uOri, uFoco; uniform vec3 uFC;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
          if (uSube < 0.999 && distance(vWPg.xz, uOri) > uSube * uR) discard; // la ciudad aparece en ola; terminada, se ve todo (cerros incluidos)
          // LOOK DE DÍA (sin atardecer): neutro, nítido, apenas desaturado y con contraste limpio
          vec3 c = max(outgoingLight - vec3(0.006), 0.0);
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          c = mix(vec3(l), c, 0.86);
          c = pow(c, vec3(1.06)) * vec3(0.97, 1.0, 1.035) * uLuz * 1.12;
          // lejanía: solo más allá de ~25 km se funde hacia el tono pizarra del horizonte (la ciudad queda nítida)
          c = mix(c, vec3(0.024, 0.034, 0.05), smoothstep(22000.0, 62000.0, distance(vWPg, cameraPosition)));
          // ESCANEO de la apertura: al este de uScan la ciudad es un esquema de datos (tinta + retícula); al oeste, la foto real
          if (uScan < 5e5) {
            float sd = vWPg.x - uScan;
            vec2 q = vWPg.xz / 500.0, fw = fwidth(q); vec2 gq = abs(fract(q - 0.5) - 0.5) / max(fw, vec2(1e-4));
            float ret = (1.0 - min(min(gq.x, gq.y), 1.0)) * (1.0 - smoothstep(0.04, 0.18, max(fw.x, fw.y)));
            vec3 esq = vec3(l) * vec3(0.09, 0.11, 0.13) + vec3(0.0022, 0.0028, 0.0036) + vec3(0.62, 1.0, 0.11) * ret * 0.035;
            c = mix(c, esq, smoothstep(-uScanW * 0.35, uScanW * 0.35, sd));
            c += vec3(0.62, 1.0, 0.11) * (exp(-abs(sd) / (uScanW * 0.06)) * 0.9 + exp(-max(sd, 0.0) / (uScanW * 0.9)) * step(0.0, sd) * 0.05);
          }
          float f = uFR > 0.0 ? 1.0 - smoothstep(uFR * 0.55, uFR, distance(vWPg.xz, uFoco)) : 0.0;
          float borde = smoothstep(0.0, 0.25, f) * (1.0 - smoothstep(0.25, 0.6, f));
          c = mix(c, c * 0.8 + uFC * 0.25, f * 0.45) + uFC * borde * 0.35;   // foco sutil: tinte leve + aro de luz
          float g = dot(c, vec3(0.299, 0.587, 0.114));
          c = mix(c, vec3(g) * 0.75, uGris * 0.65 * (1.0 - f));             // contexto en gris para que resalten los datos
          outgoingLight = c;
          #include <opaque_fragment>`);
      };
      m.customProgramCacheKey = () => 'kennedyFoto'; m.needsUpdate = true;
      G.mats.add(m);
    });
  });
  tiles.addEventListener('dispose-model', ({ scene: s }) => s.traverse((c) => { if (c.isMesh) G.mats.delete(c.material); }));
  tiles.addEventListener('load-error', (e) => { G.errores = (G.errores || 0) + 1; if (G.errores > 8 && !G.ok) { const ind = document.getElementById('foto-estado'); if (ind) ind.textContent = 'Foto real no disponible · ciudad modelada'; } if (!G.ok) console.warn('fotogrametría no disponible: se usa la ciudad procedural', e?.error?.message || ''); });

  // cuando llega la primera tesela, la foto reemplaza a la ciudad procedural
  // foto ↔ ciudad modelada: se muestra la foto solo donde de verdad cubre la vista (rayos al suelo);
  // si falta (zona sin descargar, sin red), vuelve la ciudad modelada: nunca queda negro
  let enFoto = false;
  function usarFoto(on) {
    if (on === enFoto) return; enFoto = on; G.ok = on; W.google = on ? G : null;
    const ed = W.capas.edif; if (tiles.group.parent !== ed) ed.add(tiles.group);
    ed.children.forEach((m) => { if (m !== tiles.group) m.visible = !on; }); tiles.group.visible = true;
    ['arboles', 'parques', 'calles'].forEach((k) => { const o = W[k]?.grp || W[k]; if (o) o.visible = !on; });
    W.cerrosMallas?.forEach((m) => (m.visible = !on));
    if (W.baseSuelo) W.baseSuelo.visible = !on; // sin el plano marrón de respaldo bajo la foto
    W.capas.losa.children.forEach((c) => { if (c.isMesh) c.visible = !on; });
    W.sol.castShadow = !on;
    ['pA', 'pB', 'pC', 'pD', 'pE', 'pF', 'agentes', 'flujos', 'iso', 'metro', 'vias-prin'].forEach((n) => W.capas[n]?.traverse((o) => { if (o.material) { o.material.depthTest = !on; o.renderOrder = on ? 5 : 0; } }));
    document.getElementById('atrib')?.classList.toggle('on', on);
  }
  const rcC = new THREE.Raycaster(), bajo = new THREE.Vector3(0, -1, 0), cen = new THREE.Vector3();
  function cubre() {
    const o = W.camObj || cen; const d = W.cam.position.distanceTo(o), r = Math.min(2500, d * 0.3); let n = 0;
    for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) { rcC.set(new THREE.Vector3(o.x + dx, 3500, o.z + dz), bajo); if (rcC.intersectObject(tiles.group, true).some((h) => Math.abs(h.point.y) < 300)) n++; }
    return n >= 4;
  }
  const activar = () => usarFoto(true);
  G.diag = () => { const o = W.camObj || cen; const d = W.cam.position.distanceTo(o), r = Math.min(2500, d * 0.3); return [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].map(([dx, dz]) => { rcC.set(new THREE.Vector3(o.x + dx, 3500, o.z + dz), bajo); return rcC.intersectObject(tiles.group, true).map((h) => Math.round(h.point.y)); }); };
  // el suelo de la foto se pone en y = 0 midiendo cruces de calles reales (percentil bajo: no techos ni copas)
  const rc = new THREE.Raycaster(), abajo = new THREE.Vector3(0, -1, 0);
  const muestras = W.datos.vias.vias.filter((v) => v[0] >= 4).slice(0, 400).filter((_, i) => i % 8 === 0).map((v) => [v[1], v[2]]);
  function calibrar() {
    // solo impactos cerca del suelo esperado (los rayos también atraviesan el planeta y tocan teselas lejanas)
    const h = []; for (const [x, z] of muestras) { rc.set(new THREE.Vector3(x, 3000, z), abajo); const r = rc.intersectObject(tiles.group, true).filter((q) => Math.abs(q.point.y) < 700); if (r.length) h.push(r[0].point.y); }
    if (h.length < 10) return false; h.sort((a, b) => a - b); const aj = h[Math.floor(h.length * 0.25)];
    if (Math.abs(aj) > 500) return false; G.dy -= aj; aplicar(); return true;
  }
  G.update = (dt) => {
    try {
      tiles.setResolutionFromRenderer(W.cam, W.r); W.cam.updateMatrixWorld(); tiles.update();
      const st = tiles.stats;
      G.reloj = (G.reloj || 0) + dt;
      // la foto entra en cuanto cubre la vista (no hace falta que termine de descargar el detalle)
      if (!enFoto && (G.chequeo = (G.chequeo || 0) - dt) <= 0) { /* confirmada la foto ya no se lanzan rayos (eran tirones) */ G.chequeo = 0.8; const c = cubre(); G.malas = c ? 0 : (G.malas || 0) + 1; if (c) usarFoto(true); } // una vez confirmada, la foto se queda (las teselas gruesas de Kennedy siguen en memoria)
      const ind = document.getElementById('foto-estado');
      if (ind) ind.textContent = enFoto ? 'Foto real ✓' : 'Foto real: cargando ' + Math.min(99, Math.round(((G.cargadas || 0) / 60) * 100)) + ' %';
      if (tiles.errorTarget > G.meta && st.downloading === 0 && st.parsing === 0 && st.visible > 3) tiles.errorTarget = Math.max(G.meta, Math.round(tiles.errorTarget * 0.7));
      G.t += dt; if (G.calib < 2 && G.t > [3, 10][G.calib]) { if (calibrar()) { G.calib++; G.malas = 0; } else G.t = 0; }
      if ((G.atrib -= dt) <= 0) { G.atrib = 3; const a = tiles.getAttributions?.() || []; const txt = a.filter((x) => x.type === 'string').map((x) => x.value).join(' · '); const el = document.getElementById('atrib'); if (el && txt) el.textContent = 'Fotogrametría: Google · ' + txt; }
    } catch (err) { if (!G.fallo) { G.fallo = true; console.warn('fotogrametría', err); } }
  };
  G.tiles = tiles;
  tiles.group.visible = true; W.scene.add(tiles.group); // provisional hasta activar(): se carga detrás de la ciudad modelada
  return G;
}
