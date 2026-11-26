// Capítulo 02 · El POT y la ciudad como sistema complejo. Todo sobre la página real «Red causal · 3 niveles + POT»
// (anasoficasca-code/humedalburro, red-causal-3n.html), usada en vivo: el POT se arma como red, «Grado» muestra los
// nodos centrales, «Métricas» los tipos de relación, «Ejes radiales» las jerarquías, «Todas» las capas la ciudad
// compleja, y Niveles 3D cómo se producen los problemas. Encima: X.ed solo con las palabras de la voz (zócalos, listas) y las fotos de los autores.
import { anclaNodo, grados } from '../paginas/humedalburro.js';
import { ctx, seguir, guardar, soltar, agregar, conGuardia } from './s01.js';

const H = 'humedalburro';
const POT = [5, 6, 7, 8, 9, 10, 11, 12];
const BARABASI = { nombre: 'Albert-László Barabási', rol: 'Física · ciencia de redes', img: './img/autores/barabasi.jpg', credito: 'Foto: World Economic Forum, CC BY-SA 2.0, Wikimedia Commons', x: 4, y: 66 };
const BATTY = { nombre: 'Michael Batty', rol: 'Urbanismo computacional', img: './img/autores/batty.jpg', credito: 'Foto: Pymouss, CC BY-SA 3.0, Wikimedia Commons', x: 4, y: 66 };
const NO_EXPLICA = ['las interacciones entre *agentes*', 'los procesos de *retroalimentación*', 'las dinámicas *emergentes*', 'cómo producen problemas *a través del tiempo*'];
const listaNo = (X, n, delay = 0) => X.ed.lista({ items: NO_EXPLICA.slice(0, n), x: 62, y: 45, ancho: 33, delay });

export default /* ===================================================================== 02 POT */
  {
    n: '02', nombre: 'El POT y la ciudad como sistema complejo', pagina: true, precarga: [H],
    beats: conGuardia([
      { t: 'Como punto de partida, el Plan de Ordenamiento Territorial de Bogotá', a: (X) => {
        X.pagina(H, 'pot', { entrada: 'barrido' });
        X.ed.rotulo('el *Plan de Ordenamiento Territorial* de Bogotá', { delay: 0.5 });
      } },
      // el cursor enciende las 8 capas del POT: los componentes aparecen como nodos
      { t: 'se reconstruyó como una red', a: async (X) => {
        const c = ctx(X);
        X.ed.rotulo('se reconstruyó como *una red*', { lado: 'der', delay: 0.3 });
        await X.pagina(H, 'potArma'); if (!c.vivo()) return;
      } },
      { t: 'a partir de los aportes de Albert-László Barabási, físico e investigador de la ciencia de redes.', a: (X) => {
        X.pagina(H, 'pot');
        X.ed.persona({ ...BARABASI, delay: 1.6 });
      } },
      // «Grado»: tamaño = número de relaciones; se señalan los tres más conectados (calculados de los datos de la página)
      { t: 'Se identificaron los nodos centrales,', a: async (X) => {
        const c = ctx(X);
        await X.pagina(H, 'grado');
        if (!c.vivo()) return;
        // los más conectados que se ven separados en pantalla (si uno queda detrás de otro, se toma el siguiente)
        const top = [];
        for (const t of grados(POT).slice(0, 8)) {
          const a = anclaNodo(t.id); if (!a) continue; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          if (r.width && top.every((o) => Math.hypot(o.cx - cx, o.cy - cy) > (o.w + r.width) * 0.6)) top.push({ ...t, cx, cy, w: r.width });
          if (top.length === 3) break;
        }
        if (!c.vivo()) return;
        const corto = (s) => s.replace(/\s*\(.*\)$/, '').replace(/^Zonas de amenaza por inundación y encharcamiento$/, 'Amenaza por inundación');
        c.seq(top.map((t, i) => [0.2 + i * 0.45, () => X.ed.senalar(H, anclaNodo(t.id), { lado: 'circulo', pad: 4 })]));
        X.ed.rotulo('los *nodos centrales*', { delay: 0.2 });
      } },
      // «Métricas»: la torta de tipos de relación; la mitad son dependencias de una misma entidad
      { t: 'las relaciones de dependencia', a: async (X) => {
        const c = ctx(X);
        await X.pagina(H, 'metricas');
        if (!c.vivo()) return;
        c.seq([[0.9, () => X.ed.senalar(H, '#legendA .legend-row', { texto: 'relaciones de dependencia', lado: 'arriba', pad: 6 })]]);
      } },
      { t: 'y las jerarquías que estructuran este modelo de ciudad.', a: (X) => {
        X.pagina(H, 'jerarquia');
        X.ed.rotulo('las *jerarquías* que estructuran este modelo de ciudad', { lado: 'der', delay: 0.8 });
      } },
      { t: 'Esta representación se contrastó con el enfoque de Michael Batty,', a: (X) => {
        X.pagina(H, 'pot');
        guardar('batty', X.ed.persona({ ...BATTY, delay: 2.2 }));
      } },
      // «Todas» las capas: la red del POT se vuelve la red causal completa de Kennedy
      { t: 'investigador del urbanismo computacional que estudia las ciudades como sistemas complejos.', mantener: true, a: async (X) => {
        const c = ctx(X);
        seguir(X, 'batty', () => X.ed.persona(BATTY));
        const p = X.pagina(H, 'complejo');
        X.ed.rotulo('las ciudades como *sistemas complejos*', { lado: 'der', delay: 0.4 });
        await p; if (!c.vivo()) return;
      } },
      { t: 'Se comprende que aunque el plan establece relaciones entre sus componentes,', a: async (X) => {
        const c = ctx(X);
        X.pagina(H, 'relaciones'); if (!c.vivo()) return;
        X.ed.rotulo('el plan establece *relaciones* entre sus componentes', { delay: 0.4 });
      } },
      // «Ninguna» → solo los actores del POT
      { t: 'su representación no explica suficientemente las interacciones entre agentes,', a: (X) => {
        X.pagina(H, 'actores');
        guardar('noexp', X.ed.rotulo('su representación *no explica* suficientemente', { lado: 'der', delay: 0.2 }));
        guardar('no', listaNo(X, 1, 1.6));
      } },
      { t: 'los procesos de retroalimentación,', mantener: true, a: (X) => {
        X.pagina(H, 'plano'); soltar(X, 'noexp');
        const L = seguir(X, 'no', () => listaNo(X, 1)); agregar(X, L, NO_EXPLICA[1], 0.2);
      } },
      { t: 'las dinámicas emergentes', mantener: true, a: (X) => {
        X.pagina(H, 'plano');
        const L = seguir(X, 'no', () => listaNo(X, 2)); agregar(X, L, NO_EXPLICA[2], 0.2);
      } },
      // Niveles 3D: lo visible (N1) produce efectos (N2) que remiten a una causa estructural (N3)
      { t: 'ni cómo estas transforman y producen problemas a través del tiempo.', mantener: true, a: (X) => {
        X.pagina(H, 'niveles', { inicioPaso: 0, pasos: [1, 2, 3], entre: 900 });
        const L = seguir(X, 'no', () => listaNo(X, 3)); agregar(X, L, NO_EXPLICA[3], 0.2);
      } },
    ]),
  };
