// Capa de PÁGINAS: las páginas reales de las autoras (copiadas en public/paginas/, mismo origen)
// se muestran a pantalla completa dentro de la presentación y cada frase las pone en un estado exacto.
// Un "driver" por página (src/paginas/<nombre>.js) sabe esperar a que cargue y llevarla a cada estado.
import gsap from 'gsap';
import { R, D } from './ui.js';

const DRIVERS = {};
/** registra un driver: { url, listo(win) → Promise, estados: { clave: (win, doc, o) → void|Promise } } */
export function registrar(nombre, drv) { DRIVERS[nombre] = drv; }

const vivos = new Map(); // nombre → { fr, marco, listo: Promise }
let actual = null;
const raiz = () => document.getElementById('paginas');

function espera(ms) { return new Promise((r) => setTimeout(r, ms)); }
/** espera a que una condición sobre la ventana de la página se cumpla */
export async function hasta(fn, max = 15000, paso = 80) {
  const t0 = performance.now();
  while (performance.now() - t0 < max) { try { const v = fn(); if (v) return v; } catch (e) { /* aún no existe */ } await espera(paso); }
  console.warn('[pagina] tiempo agotado esperando', fn.toString().slice(0, 80));
  return null;
}

function crear(nombre) {
  const drv = DRIVERS[nombre]; if (!drv) throw new Error('página sin driver: ' + nombre);
  const marco = document.createElement('div'); marco.className = 'pag-marco'; marco.dataset.p = nombre;
  const fr = document.createElement('iframe');
  fr.src = drv.url; fr.setAttribute('tabindex', '-1'); fr.setAttribute('aria-hidden', 'true'); fr.loading = 'eager';
  marco.appendChild(fr); raiz().appendChild(marco);
  const listo = new Promise((res) => fr.addEventListener('load', res, { once: true }))
    .then(() => (drv.listo ? drv.listo(fr.contentWindow) : null))
    .then(() => { try { drv.preparar?.(fr.contentWindow, fr.contentDocument); } catch (e) { console.warn('[pagina] preparar', nombre, e); } });
  const v = { fr, marco, listo }; vivos.set(nombre, v); return v;
}

/** precarga páginas en segundo plano (no se muestran) */
export function precargar(...nombres) { nombres.forEach((n) => { if (!vivos.has(n)) crear(n); }); }

/**
 * Muestra la página `nombre` y la pone en el estado `clave`.
 * o.entrada: 'corte' | 'barrido' | 'zoom' (cómo aparece si no estaba visible)
 */
export async function pagina(nombre, clave, o = {}) {
  const v = vivos.get(nombre) || crear(nombre);
  const rapido = R.rapido; // se lee antes de esperar la carga (en un salto R.rapido cambia después)
  const turno = ++v.turno || (v.turno = 1); // si llega otra frase antes de que cargue, solo vale la última
  const cambio = actual !== nombre;
  if (cambio) {
    const prev = actual && vivos.get(actual); actual = nombre;
    document.body.classList.add('con-pagina');
    v.marco.classList.add('on'); gsap.killTweensOf(v.marco);
    gsap.set(v.marco, { zIndex: 2 }); if (prev) gsap.set(prev.marco, { zIndex: 1 });
    const ent = o.entrada || 'barrido';
    if (R.rapido) gsap.set(v.marco, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, scale: 1, x: 0, y: 0 });
    else if (ent === 'zoom') gsap.fromTo(v.marco, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out' });
    else if (ent === 'corte') gsap.set(v.marco, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, scale: 1 });
    else gsap.fromTo(v.marco, { clipPath: 'inset(0% 0% 0% 100%)', opacity: 1, scale: 1.04 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.0, ease: 'expo.inOut' });
    if (prev) { const pm = prev.marco; gsap.delayedCall(R.rapido ? 0 : 1.05, () => { if (actual !== prev.marco.dataset.p) pm.classList.remove('on'); }); }
    if (!o.camara) gsap.to(v.fr, { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, duration: D(0.9), ease: 'expo.out' });
  }
  if (o.camara) camara(o.camara);
  await v.listo;
  if (turno !== v.turno || actual !== nombre) return;
  if (clave) {
    const f = DRIVERS[nombre].estados?.[clave];
    if (!f) console.warn('[pagina] estado desconocido', nombre, clave);
    else { try { await f(v.fr.contentWindow, v.fr.contentDocument, { ...o, rapido }); } catch (e) { console.warn('[pagina] estado', nombre, clave, e); } }
  }
}

/** "cámara" sobre la página: encuadra un punto (x,y en % de la pantalla) con escala s → zoom/paneo animado */
export function camara({ x = 50, y = 50, s = 1, rx = 0, ry = 0, d = 2.4, ease = 'power2.inOut' } = {}) {
  const v = actual && vivos.get(actual); if (!v) return;
  const tx = (50 - x) * (s - 0) / 100 * innerWidth, ty = (50 - y) * s / 100 * innerHeight;
  gsap.killTweensOf(v.fr);
  const dst = { x: s === 1 ? 0 : tx, y: s === 1 ? 0 : ty, scale: s, rotationX: rx, rotationY: ry };
  if (R.rapido) gsap.set(v.fr, dst); else gsap.to(v.fr, { ...dst, duration: d, ease });
}

/** quita la página y vuelve al mundo 3D */
export function sinPagina(inmediato = false) {
  if (!actual) return; const v = vivos.get(actual); actual = null;
  document.body.classList.remove('con-pagina');
  if (inmediato || R.rapido) { v.marco.classList.remove('on'); return; }
  gsap.to(v.marco, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.9, ease: 'expo.inOut', onComplete: () => { if (actual !== v.marco.dataset.p) v.marco.classList.remove('on'); } });
}
export const paginaActual = () => actual;
/** ventana de la página (para acciones sueltas desde el guion) */
export const ventana = (nombre) => vivos.get(nombre)?.fr.contentWindow;
