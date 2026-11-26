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
//   limpiar()
import gsap from 'gsap';
import { R } from './ui.js';
import { ventana } from './pagina.js';

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
  const e = h('div', 'ed-lista', `<ol>${o.items.map((t) => `<li><i class="n"></i><span>${palabras(t)}</span></li>`).join('')}</ol>`);
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
