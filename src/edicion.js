// EDICIÓN TIPO VIDEO (motion graphics encima de las páginas y del 3D).
// Todo entra con resortes limpios (sin desenfoques ni temblores) y se va solo al cambiar de frase.
// API (en el guion: X.ed.*):
//   rotulo(texto, {kick, lado})                 → zócalo inferior (lower third)
//   pop({t, d, img, icono, x, y, ancho, delay}) → tarjeta que aparece con rebote
//   persona({nombre, rol, img, credito, x, y})  → foto circular + nombre (cuando se menciona a alguien)
//   cifra({v, desde, dec, pre, suf, texto, x, y, delay}) → número grande que cuenta
//   lista({titulo, items, x, y, paso})          → enumeración que va saliendo ítem por ítem
//   senalar(nombrePagina, selector|rect, {texto, lado, delay}) → marco que señala un elemento de la página
//   frase(texto con *énfasis*, {y})             → frase clave centrada, palabra por palabra
//   capitulo(n, titulo) → Promise              → portadilla de capítulo a pantalla completa
//   limpiar()                                   → saca todo
// Posiciones x/y en % de pantalla (esquina superior izquierda del elemento salvo que se diga otra cosa).
import gsap from 'gsap';
import { R } from './ui.js';
import { ventana } from './pagina.js';

const capa = () => document.getElementById('edicion');
const vivos = new Set();
const SPRING = 'back.out(1.6)', SUAVE = 'expo.out';

function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function poner(e, x, y) { if (x != null) e.style.left = typeof x === 'number' ? x + 'vw' : x; if (y != null) e.style.top = typeof y === 'number' ? y + 'vh' : y; capa().appendChild(e); vivos.add(e); return e; }
const enfasis = (s) => String(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

export function limpiar() {
  for (const e of [...vivos]) { vivos.delete(e); e._sal?.(); gsap.killTweensOf(e); gsap.to(e, { autoAlpha: 0, y: '-=12', duration: R.rapido ? 0 : 0.35, ease: 'power2.in', onComplete: () => e.remove() }); }
}
function salir(e, dur) { if (dur) gsap.delayedCall(dur, () => { if (!vivos.has(e)) return; vivos.delete(e); gsap.to(e, { autoAlpha: 0, y: '-=12', duration: 0.35, onComplete: () => e.remove() }); }); }

/** zócalo inferior */
export function rotulo(texto, o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-rotulo' + (o.lado === 'der' ? ' der' : ''), `<i class="barra"></i><div class="txt">${o.kick ? `<span class="kick">${o.kick}</span>` : ''}<span class="mask"><b>${enfasis(texto)}</b></span></div>`);
  poner(e);
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.fromTo(e.querySelector('.barra'), { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: SUAVE })
    .fromTo(e.querySelector('.kick'), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: SUAVE }, 0.15)
    .fromTo(e.querySelector('.mask b'), { yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: SUAVE }, 0.22);
  salir(e, o.dur); return e;
}

/** tarjeta con rebote */
export function pop(o = {}) {
  if (R.rapido) return;
  const img = o.img ? `<div class="img" style="background-image:url('${o.img}')"></div>` : '';
  const ic = o.icono ? `<span class="ic">${o.icono}</span>` : '';
  const e = h('div', 'ed-pop' + (o.img ? ' con-img' : '') + (o.cls ? ' ' + o.cls : ''), `${img}<div class="cuerpo">${o.kick ? `<span class="kick">${ic}${o.kick}</span>` : ic}<b>${enfasis(o.t || '')}</b>${o.d ? `<p>${enfasis(o.d)}</p>` : ''}${o.fuente ? `<small>${o.fuente}</small>` : ''}</div>`);
  if (o.ancho) e.style.width = o.ancho + 'vw';
  poner(e, o.x ?? 6, o.y ?? 14);
  gsap.fromTo(e, { autoAlpha: 0, scale: 0.86, y: 18 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: SPRING, delay: o.delay || 0 });
  salir(e, o.dur); return e;
}

/** foto de una persona mencionada */
export function persona(o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-persona', `<div class="foto"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="57"/></svg><div class="img" style="background-image:url('${o.img}')"></div></div><div class="nom"><span class="kick">${o.rol || ''}</span><span class="mask"><b>${o.nombre}</b></span>${o.credito ? `<small>${o.credito}</small>` : ''}</div>`);
  poner(e, o.x ?? 6, o.y ?? 62);
  const c = e.querySelector('circle'), L = 2 * Math.PI * 57; c.style.strokeDasharray = L;
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.fromTo(e.querySelector('.img'), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: SPRING })
    .fromTo(c, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.05)
    .fromTo(e.querySelector('.kick'), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: SUAVE }, 0.35)
    .fromTo(e.querySelector('.mask b'), { yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: SUAVE }, 0.4)
    .fromTo(e.querySelector('small'), { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.5 }, 0.8);
  salir(e, o.dur); return e;
}

/** número grande que cuenta */
export function cifra(o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-cifra' + (o.cls ? ' ' + o.cls : ''), `<div class="num"><span class="pre">${o.pre || ''}</span><b>0</b><span class="suf">${o.suf || ''}</span></div><i class="linea"></i><p>${enfasis(o.texto || '')}</p>${o.fuente ? `<small>${o.fuente}</small>` : ''}`);
  poner(e, o.x ?? 6, o.y ?? 50);
  const b = e.querySelector('b'), dec = o.dec ?? 0, fmt = (v) => v.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const p = { v: o.desde ?? 0 }; b.textContent = fmt(p.v);
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.fromTo(e, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: SUAVE })
    .to(p, { v: o.v, duration: o.dur_conteo ?? 1.4, ease: 'power3.out', onUpdate: () => (b.textContent = fmt(p.v)) }, 0.1)
    .fromTo(e.querySelector('.linea'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: SUAVE }, 0.3)
    .fromTo(e.querySelector('p'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: SUAVE }, 0.5);
  salir(e, o.dur); return e;
}

/** enumeración que va saliendo (paso = segundos entre ítems, para ir con la voz) */
export function lista(o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-lista', `${o.titulo ? `<span class="kick">${o.titulo}</span>` : ''}<ol>${o.items.map((t, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span>${enfasis(t)}</span></li>`).join('')}</ol>`);
  if (o.ancho) e.style.width = o.ancho + 'vw';
  poner(e, o.x ?? 6, o.y ?? 18);
  gsap.fromTo(e.querySelector('.kick'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: o.delay || 0 });
  gsap.fromTo(e.querySelectorAll('li'), { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: SPRING, stagger: o.paso ?? 0.6, delay: (o.delay || 0) + 0.15 });
  salir(e, o.dur); return e;
}

/** frase clave centrada, palabra por palabra */
export function frase(texto, o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-frase', String(texto).split(/(\*[^*]+\*)/).filter(Boolean).map((p) => p.startsWith('*') ? `<em>${p.slice(1, -1).split(' ').map((w) => `<span class="w">${w}</span>`).join(' ')}</em>` : p.split(' ').filter(Boolean).map((w) => `<span class="w">${w}</span>`).join(' ')).join(' '));
  if (o.y != null) e.style.top = o.y + 'vh';
  poner(e);
  gsap.fromTo(e.querySelectorAll('.w'), { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: SUAVE, stagger: o.paso ?? 0.07, delay: o.delay || 0 });
  salir(e, o.dur); return e;
}

/** marco que señala un elemento de una página (sigue al elemento si la página se mueve) */
export function senalar(nombre, objetivo, o = {}) {
  if (R.rapido) return;
  const e = h('div', 'ed-senal' + (o.lado ? ' ' + o.lado : ''), `<i class="marco"></i>${o.texto ? `<span class="et">${enfasis(o.texto)}</span>` : ''}`);
  poner(e, 0, 0);
  const fr = [...document.querySelectorAll('#paginas .pag-marco')].find((m) => m.dataset.p === nombre)?.querySelector('iframe');
  const rectDe = () => {
    if (typeof objetivo === 'object' && objetivo && 'w' in objetivo) return { left: objetivo.x * innerWidth / 100, top: objetivo.y * innerHeight / 100, width: objetivo.w * innerWidth / 100, height: objetivo.h * innerHeight / 100 };
    const w = ventana(nombre); const el = typeof objetivo === 'string' ? w?.document.querySelector(objetivo) : objetivo; if (!el || !fr) return null;
    const r = el.getBoundingClientRect(), f = fr.getBoundingClientRect(); const pad = o.pad ?? 10;
    return { left: f.left + r.left - pad, top: f.top + r.top - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
  };
  let vivo = true; e._sal = () => (vivo = false);
  const seguir = () => { if (!vivo) return; const r = rectDe(); if (r) Object.assign(e.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); requestAnimationFrame(seguir); };
  seguir();
  const tl = gsap.timeline({ delay: o.delay || 0 });
  tl.fromTo(e.querySelector('.marco'), { autoAlpha: 0, scale: 1.25 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: SPRING });
  if (o.texto) tl.fromTo(e.querySelector('.et'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: SUAVE }, 0.25);
  salir(e, o.dur); return e;
}

/** portadilla de capítulo: cubre la pantalla, ejecuta `durante` (montar la escena) y se abre */
export function capitulo(n, titulo, durante) {
  const e = h('div', 'ed-capitulo', `<div class="fondo"></div><div class="cont"><span class="n">${n}</span><span class="mask"><b>${titulo}</b></span><i class="linea"></i></div>`);
  capa().appendChild(e);
  return new Promise((res) => {
    const tl = gsap.timeline({ onComplete: () => { e.remove(); res(); } });
    tl.fromTo(e.querySelector('.fondo'), { xPercent: -101 }, { xPercent: 0, duration: 0.6, ease: 'expo.inOut' })
      .fromTo(e.querySelector('.n'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: SUAVE }, 0.45)
      .fromTo(e.querySelector('.mask b'), { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: SUAVE }, 0.55)
      .fromTo(e.querySelector('.linea'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: SUAVE }, 0.7)
      .add(() => { try { durante?.(); } catch (err) { console.error(err); } }, 0.7)
      .to(e.querySelector('.cont'), { autoAlpha: 0, y: -20, duration: 0.45, ease: 'power2.in' }, 2.3)
      .to(e.querySelector('.fondo'), { xPercent: 101, duration: 0.7, ease: 'expo.inOut' }, 2.5);
  });
}
