// EDICIÓN TIPO VIDEO (motion graphics encima de las páginas y del 3D) — estilo de los referentes de la autora:
// letra fina y pequeña que entra palabra por palabra (la palabra clave en lima), tarjetas claras compactas,
// avatares en cuadro redondeado con pop, líneas finas que conectan el texto con lo señalado.
// Todo se va solo al cambiar de frase. Sin títulos ni números de sección: solo palabras de la voz.
// API (en el guion: X.ed.*):
//   rotulo(texto, {lado, delay, dur})                   → texto de la voz, abajo
//   pop({t, d, img, x, y, ancho, delay, cls:'oscuro'})  → tarjeta compacta
//   persona({nombre, rol, img, credito, x, y})          → foto + nombre cuando se menciona a alguien
//   cifra({v, desde, dec, pre, suf, texto, x, y, miles}) → número que cuenta
//   lista({items, x, y, paso, ancho})                   → filas compactas que van saliendo
//   senalar(nombrePagina, selector|rect, {texto, lado:'arriba'|'izq'|'der', delay}) → marco fino + etiqueta con línea
//   frase(texto con *énfasis*, {y})                     → frase centrada palabra por palabra
//   capitulo(n, titulo, durante) → Promise             → fundido corto entre capítulos (sin título)
//   lugar(p3, texto, {sub, lado:'der'|'izq', delay, alto, pin}) → etiqueta de vidrio anclada a un punto 3D del mundo
//   ventanas() → contenedor de pantallas flotando en perspectiva; .agregar(img, texto, {delay})
//   quitar(e) · limpiarSalvo([e, …])                   → quita un gráfico suelto · limpia todo menos los dados
//   limpiar()
import gsap from 'gsap';
import * as THREE from 'three';
import { R } from './ui.js';
import { ventana } from './pagina.js';
import { W } from './mundo.js';

const capa = () => document.getElementById('edicion');
const vivos = new Set();
const POP = 'back.out(1.7)', SUAVE = 'expo.out';

function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function poner(e, x, y) { if (x != null) e.style.left = typeof x === 'number' ? x + 'vw' : x; if (y != null) e.style.top = typeof y === 'number' ? y + 'vh' : y; capa().appendChild(e); vivos.add(e); return e; }
/** texto con *énfasis* → palabras sueltas (span.w), las enfatizadas en <em> */
function palabras(s) {
  // respeta HTML en línea (p.ej. <span style=…>): solo envuelve las palabras, nunca parte las etiquetas
  const html = String(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag, w) => (tag ? tag : `<span class="w">${w}</span>`));
}
/** entrada palabra por palabra (enfoque suave, sin rebote) */
function escribir(tl, raiz, en = 0, paso = 0.055) {
  const ws = raiz.querySelectorAll('.w'); if (!ws.length) return tl;
  return tl.fromTo(ws, { autoAlpha: 0, y: 8, filter: 'blur(5px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out', stagger: paso, clearProps: 'filter' }, en);
}

export function limpiar() {
  for (const e of [...vivos]) { vivos.delete(e); e._sal?.(); gsap.killTweensOf(e); gsap.to(e, { autoAlpha: 0, y: '-=8', duration: R.rapido ? 0 : 0.3, ease: 'power2.in', onComplete: () => e.remove() }); }
}
/** agrega a la capa de edición un elemento armado afuera (se limpia como los demás) */
export function anexar(e) { capa().appendChild(e); vivos.add(e); return e; }
export { palabras, escribir };
/** quita un gráfico suelto (con su salida) */
export function quitar(e, d = 0.35) {
  if (!e || !vivos.has(e)) return; vivos.delete(e); e._sal?.(); gsap.killTweensOf(e);
  gsap.to(e, { autoAlpha: 0, duration: R.rapido ? 0 : d, ease: 'power2.in', onComplete: () => e.remove() });
}
/** limpia todos los gráficos menos los dados (para frases que conservan parte de la anterior) */
export function limpiarSalvo(guardar = []) { for (const e of [...vivos]) if (!guardar.includes(e)) quitar(e); }
function salir(e, dur) { if (dur) gsap.delayedCall(dur, () => { if (!vivos.has(e)) return; vivos.delete(e); gsap.to(e, { autoAlpha: 0, y: '-=8', duration: 0.3, onComplete: () => e.remove() }); }); }

/** texto de la voz, abajo */
export function rotulo(texto, o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-rotulo' + (o.lado === 'der' ? ' der' : ''), `<i class="punto"></i><span class="txt">${palabras(texto)}</span>`);
  poner(e);
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.set(e, { autoAlpha: 1 }, 0)
    .fromTo(e, { clipPath: 'inset(0 100% 0 0 round 12px)' }, { clipPath: 'inset(0 0% 0 0 round 12px)', duration: 0.55, ease: 'power3.inOut' }, 0)
    .fromTo(e.querySelector('.punto'), { scale: 0 }, { scale: 1, duration: 0.4, ease: POP }, 0.2);
  escribir(tl, e, 0.25);
  salir(e, o.dur); return e;
}

/** tarjeta compacta */
export function pop(o = {}) {
  if (R.rapido) return;
  const img = o.img ? `<div class="img" style="background-image:url('${o.img}')"></div>` : '';
  const e = h('div', 'ed-pop' + (o.img ? ' con-img' : '') + (o.cls ? ' ' + o.cls : ''), `${img}<div class="cuerpo"><b>${palabras(o.t || '')}</b>${o.d ? `<p>${palabras(o.d)}</p>` : ''}${o.fuente ? `<small>${o.fuente}</small>` : ''}</div>`);
  if (o.ancho) e.style.width = o.ancho + 'vw';
  poner(e, o.x ?? 6, o.y ?? 14);
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.fromTo(e, { autoAlpha: 0, scale: 0.92, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: POP });
  escribir(tl, e, 0.12, 0.04);
  salir(e, o.dur); return e;
}

/** foto de una persona mencionada (cuadro redondeado con pop) */
export function persona(o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-persona', `<div class="img" style="background-image:url('${o.img}')"></div><div class="nom"><b>${palabras(o.nombre)}</b>${o.rol ? `<span class="rol">${o.rol}</span>` : ''}${o.credito ? `<small>${o.credito}</small>` : ''}</div>`);
  poner(e, o.x ?? 6, o.y ?? 64);
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.set(e, { autoAlpha: 1 }, 0)
    .fromTo(e.querySelector('.img'), { scale: 0.3, autoAlpha: 0, rotation: -6 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.65, ease: POP })
    .fromTo(e.querySelector('.nom'), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: SUAVE }, 0.25);
  escribir(tl, e.querySelector('.nom'), 0.3);
  tl.fromTo(e.querySelectorAll('.rol, small'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.1 }, 0.6);
  salir(e, o.dur); return e;
}

/** número que cuenta */
export function cifra(o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-cifra' + (o.cls ? ' ' + o.cls : ''), `<div class="num">${o.pre ? `<span class="pre">${o.pre}</span>` : ''}<b>0</b>${o.suf ? `<span class="suf">${o.suf}</span>` : ''}</div><p>${palabras(o.texto || '')}</p>${o.fuente ? `<small>${o.fuente}</small>` : ''}`);
  poner(e, o.x ?? 6, o.y ?? 50);
  const b = e.querySelector('.num b'), dec = o.dec ?? 0, fmt = (v) => v.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: o.miles !== false });
  const p = { v: o.desde ?? 0 }; b.textContent = fmt(p.v);
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.fromTo(e, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: SUAVE })
    .to(p, { v: o.v, duration: o.dur_conteo ?? 1.3, ease: 'power3.out', onUpdate: () => (b.textContent = fmt(p.v)) }, 0.05);
  escribir(tl, e.querySelector('p'), 0.35, 0.045);
  salir(e, o.dur); return e;
}

/** filas compactas que van saliendo (paso = segundos entre filas, para ir con la voz) */
export function lista(o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-lista' + (o.cls ? ' ' + o.cls : ''), `<ol>${o.items.map((t) => `<li><i class="n"></i><span>${palabras(t)}</span></li>`).join('')}</ol>`);
  if (o.ancho) e.style.width = o.ancho + 'vw';
  poner(e, o.x ?? 6, o.y ?? 18);
  gsap.set(e, { autoAlpha: 1, delay: o.delay || 0 });
  const paso = o.paso ?? 0.6;
  e.querySelectorAll('li').forEach((li, i) => {
    const tl = gsap.timeline({ delay: (o.delay || 0) + 0.1 + i * paso });
    tl.fromTo(li, { autoAlpha: 0, y: 10, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: POP });
    escribir(tl, li, 0.1, 0.035);
  });
  salir(e, o.dur); return e;
}

/** frase centrada, palabra por palabra */
export function frase(texto, o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-frase', palabras(texto));
  if (o.y != null) e.style.top = o.y + 'vh';
  poner(e);
  const tl = gsap.timeline({ delay: o.delay || 0 }); tl.set(e, { autoAlpha: 1 }, 0);
  escribir(tl, e, 0, o.paso ?? 0.08);
  salir(e, o.dur); return e;
}

/** marco fino que señala un elemento de una página + etiqueta unida por una línea con nodo cuadrado */
export function senalar(nombre, objetivo, o = {}) {
  if (R.rapido) return;
  const lado = o.lado || 'abajo';
  const e = h('div', 'ed-senal ' + lado, `<i class="marco"></i>${o.texto ? `<i class="linea"></i><i class="nodo"></i><span class="et">${palabras(o.texto)}</span>` : ''}`);
  poner(e, 0, 0);
  const fr = [...document.querySelectorAll('#paginas .pag-marco')].find((m) => m.dataset.p === nombre)?.querySelector('iframe');
  const rectDe = () => {
    if (typeof objetivo === 'object' && objetivo && 'w' in objetivo) { const f = fr?.getBoundingClientRect() || { left: 0, top: 0, width: innerWidth, height: innerHeight }; return { left: f.left + objetivo.x * f.width / 100, top: f.top + objetivo.y * f.height / 100, width: objetivo.w * f.width / 100, height: objetivo.h * f.height / 100 }; } // {x,y,w,h} en % de la página
    const w = ventana(nombre); const el = typeof objetivo === 'string' ? w?.document.querySelector(objetivo) : objetivo; if (!el || !fr) return null;
    const r = el.getBoundingClientRect(), f = fr.getBoundingClientRect(); const pad = o.pad ?? 8;
    const k = f.width / (fr.offsetWidth || f.width); // la página puede estar dentro de una ventana escalada
    return { left: f.left + r.left * k - pad, top: f.top + r.top * k - pad, width: r.width * k + pad * 2, height: r.height * k + pad * 2 };
  };
  let vivo = true; e._sal = () => (vivo = false);
  const seguir = () => { if (!vivo) return; const r = rectDe(); if (r) Object.assign(e.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); requestAnimationFrame(seguir); };
  seguir();
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.set(e, { autoAlpha: 1 }, 0).fromTo(e.querySelector('.marco'), { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: SUAVE });
  if (o.texto) {
    tl.fromTo(e.querySelector('.linea'), { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'power3.inOut' }, 0.25)
      .fromTo(e.querySelector('.nodo'), { scale: 0 }, { scale: 1, duration: 0.3, ease: POP }, 0.55)
      .fromTo(e.querySelector('.et'), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: POP }, 0.6);
    escribir(tl, e.querySelector('.et'), 0.65, 0.04);
  }
  salir(e, o.dur); return e;
}

/** agrega una fila a una lista existente (misma entrada que las demás filas) */
export function listaMas(e, texto, delay = 0) {
  if (!e || R.rapido) return;
  const li = h('li', null, `<i class="n"></i><span>${palabras(texto)}</span>`); e.querySelector('ol').appendChild(li);
  const tl = gsap.timeline({ delay });
  tl.fromTo(li, { autoAlpha: 0, y: 10, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: POP });
  escribir(tl, li, 0.1, 0.035);
}

/* ------------------------------------------------------------------ LUGAR: etiqueta de vidrio anclada al mundo 3D */
const LIMA = new THREE.Color('#cfff5e');
const GEO_L = { aro: new THREE.RingGeometry(0.86, 1, 64).rotateX(-Math.PI / 2), fino: new THREE.RingGeometry(0.95, 1, 64).rotateX(-Math.PI / 2), disco: new THREE.CircleGeometry(0.86, 48).rotateX(-Math.PI / 2) };
const v3 = new THREE.Vector3();
function anclaDe(p3) {
  if (p3?.isObject3D) return () => p3.getWorldPosition(v3);
  const p = p3?.isVector3 ? p3.clone() : p3.length === 2 ? new THREE.Vector3(p3[0], 0, p3[1]) : new THREE.Vector3(p3[0], p3[1], p3[2]);
  return () => v3.copy(p);
}
/**
 * Señala un lugar del mundo 3D: anillo pulsante en el suelo + línea fina con nodo cuadrado + etiqueta de vidrio.
 * Se proyecta cada cuadro con la cámara (W.cam); se oculta si queda detrás o fuera de pantalla. Se va con limpiar().
 * p3: [x, z] (suelo) | [x, y, z] | THREE.Vector3 | Object3D · texto con *énfasis* · o: { sub, lado: 'der'|'izq', delay, alto (px), pin: false sin anillo }
 */
export function lugar(p3, texto, o = {}) {
  if (R.rapido || !W.cam) return;
  const lado = o.lado === 'izq' ? 'izq' : 'der';
  const e = h('div', 'ed-lugar ' + lado, `<div class="in"><i class="tallo"></i><i class="nodo"></i><div class="et"><b>${palabras(texto)}</b>${o.sub ? `<small>${palabras(o.sub)}</small>` : ''}</div></div>`);
  e.style.setProperty('--h', (o.alto ?? 64) + 'px');
  poner(e, 0, 0);
  const inn = e.querySelector('.in'), ancla = anclaDe(p3);
  // pin en el suelo (3D): disco tenue + aro + pulso que se expande
  const k = { s: 0 }; let pin = null;
  if (o.pin !== false) {
    const mat = (op) => new THREE.MeshBasicMaterial({ color: LIMA, transparent: true, opacity: op, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, toneMapped: false });
    const g = new THREE.Group(), aro = new THREE.Mesh(GEO_L.aro, mat(0.9)), pulso = new THREE.Mesh(GEO_L.fino, mat(0.7)), disco = new THREE.Mesh(GEO_L.disco, mat(0.12));
    [aro, pulso, disco].forEach((m) => { m.renderOrder = 30; g.add(m); }); g.renderOrder = 30;
    W.scene.add(g); pin = { g, aro, pulso, disco, op: { v: 1 } };
  }
  let visto = null, vivo = true;
  const tick = () => {
    if (!vivo) return;
    const p = ancla(); const d = W.cam.position.distanceTo(p);
    if (pin) {
      pin.g.position.set(p.x, p.y + 3, p.z);
      const s = Math.min(420, Math.max(14, d * 0.016)) * k.s, f = (gsap.ticker.time * 0.55) % 1;
      pin.aro.scale.setScalar(s); pin.disco.scale.setScalar(s);
      pin.pulso.scale.setScalar(s * (1 + f * 1.8)); pin.pulso.material.opacity = 0.7 * (1 - f) * k.s * pin.op.v;
      pin.aro.material.opacity = 0.9 * pin.op.v; pin.disco.material.opacity = 0.12 * pin.op.v;
    }
    v3.copy(p).project(W.cam);
    const vis = v3.z < 1 && Math.abs(v3.x) < 1.02 && Math.abs(v3.y) < 1.02;
    if (vis !== visto) { visto = vis; gsap.to(inn, { autoAlpha: vis ? 1 : 0, duration: 0.25, overwrite: true }); }
    if (vis) e.style.transform = `translate3d(${((v3.x + 1) / 2 * innerWidth).toFixed(1)}px, ${((1 - v3.y) / 2 * innerHeight).toFixed(1)}px, 0)`;
  };
  gsap.ticker.add(tick); tick();
  e._sal = () => {
    vivo = false; gsap.ticker.remove(tick);
    if (pin) gsap.to(pin.op, { v: 0, duration: R.rapido ? 0 : 0.35, onUpdate: () => { pin.aro.material.opacity = 0.9 * pin.op.v; pin.disco.material.opacity = 0.12 * pin.op.v; pin.pulso.material.opacity = 0; }, onComplete: () => { W.scene.remove(pin.g); [pin.aro, pin.pulso, pin.disco].forEach((m) => m.material.dispose()); } });
  };
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.set(e, { autoAlpha: 1 }, 0)
    .to(k, { s: 1, duration: 0.9, ease: 'expo.out' }, 0)
    .fromTo(e.querySelector('.tallo'), { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.out' }, 0.1)
    .fromTo(e.querySelector('.nodo'), { scale: 0 }, { scale: 1, duration: 0.35, ease: POP }, 0.45)
    .fromTo(e.querySelector('.et'), { autoAlpha: 0, x: lado === 'der' ? -8 : 8, clipPath: lado === 'der' ? 'inset(0 100% 0 0 round 10px)' : 'inset(0 0 0 100% round 10px)' }, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0% round 10px)', duration: 0.55, ease: 'power3.out' }, 0.5);
  escribir(tl, e.querySelector('.et'), 0.6, 0.045);
  salir(e, o.dur); return e;
}

/* ------------------------------------------------------------------ VENTANAS: pantallas reales flotando en perspectiva */
// la más nueva al frente (derecha); las anteriores se corren hacia atrás y a la izquierda, como una pila de pantallas
const SLOT = [
  { x: 8, z: 0, ry: -9, op: 1 }, { x: -13, z: -300, ry: 14, op: 0.92 }, { x: -29, z: -600, ry: 19, op: 0.8 }, { x: -42, z: -900, ry: 23, op: 0.68 },
];
export function ventanas(o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-ventanas', '<i class="luz"></i><div class="escenario"></div>');
  poner(e, 0, 0);
  const esc = e.querySelector('.escenario'), lista = [];
  const colocar = (dur) => lista.forEach((w, i) => {
    const s = SLOT[Math.min(SLOT.length - 1, lista.length - 1 - i)];
    if (i === lista.length - 1) return; // la nueva entra con su propia animación
    gsap.to(w, { x: s.x + 'vw', z: s.z, rotationY: s.ry, autoAlpha: s.op, duration: dur, ease: 'power3.inOut' });
    gsap.to(w.querySelector('.cap'), { autoAlpha: 0, duration: dur * 0.5 });
  });
  gsap.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: o.fundido ?? 1.1, ease: 'power2.out', delay: o.delay || 0 });
  /** agrega una pantalla (img = captura de la página real) con su texto de la voz debajo */
  e.agregar = (img, texto, op = {}) => {
    if (R.rapido) return null;
    const w = h('div', 'ed-ven', `<div class="barra"><i></i><i></i><i></i></div><div class="img" style="background-image:url('${img}')"></div>
      <div class="cap"><i class="tallo"></i><i class="nodo"></i><span>${palabras(texto)}</span></div>`);
    esc.appendChild(w); lista.push(w);
    const tl = gsap.timeline({ delay: op.delay || 0 });
    tl.add(() => colocar(1.5), 0)
      .fromTo(w, { x: '46vw', z: -150, rotationY: -32, autoAlpha: 0 }, { x: SLOT[0].x + 'vw', z: 0, rotationY: SLOT[0].ry, autoAlpha: 1, duration: 1.5, ease: 'power3.out', immediateRender: true }, 0)
      .fromTo(w.querySelector('.tallo'), { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: 'power3.out' }, 0.75)
      .fromTo(w.querySelector('.nodo'), { scale: 0 }, { scale: 1, duration: 0.3, ease: POP }, 1.0)
      .fromTo(w.querySelector('.cap span'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 1.05);
    escribir(tl, w.querySelector('.cap span'), 1.1, 0.045);
    return w;
  };
  salir(e, o.dur); return e;
}

/** fundido corto entre capítulos (sin título: en pantalla solo va texto de lo que dice la voz) */
export function capitulo(n, titulo, durante) {
  const velo = h('div', 'ed-velo'); capa().appendChild(velo);
  return new Promise((res) => {
    gsap.timeline()
      .fromTo(velo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.in' })
      .add(() => { try { durante?.(); } catch (err) { console.error(err); } res(); })
      .to(velo, { autoAlpha: 0, duration: 0.7, ease: 'power1.out', onComplete: () => velo.remove() });
  });
}
