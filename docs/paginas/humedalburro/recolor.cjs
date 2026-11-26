// Copia de anasoficasca-code/humedalburro · red-causal-3n.html (commit 7fdd4ed) con los COLORES DEL FORMATO del video.
// Uso: node public/paginas/humedalburro/recolor.cjs <ruta a humedalburro>/red-causal-3n.html
// Solo cambia colores, tipografías y la carga del territorio 3D (45 MB que la presentación no usa).
// No toca datos, textos ni lógica de la red.
const fs = require('fs'), path = require('path');
const src = process.argv[2] || 'C:/Users/ACER/humedalburro-ana/red-causal-3n.html';
let s = fs.readFileSync(src, 'utf8');
const lineas = s.split('\n');
const iDatos = lineas.findIndex((l) => l.includes('window.RED_DATA = '));
const datos = lineas[iDatos]; // los datos quedan intactos
let t = lineas.map((l, i) => (i === iDatos ? '@@DATOS@@' : l)).join('\n');

const MAPA = [
  // lima de marca → lima del formato
  [/#DBF343/gi, '#CFFF5E'], [/rgba\(\s*219\s*,\s*243\s*,\s*67/gi, 'rgba(207, 255, 94'],
  // violetas → grises del formato
  [/#8A3FFC/gi, '#A3A89F'], [/#660ED3/gi, '#9FD13A'], [/rgba\(\s*102\s*,\s*14\s*,\s*211/gi, 'rgba(207, 255, 94'],
  [/#B48CFF/gi, '#C9CCC4'], [/#A78BFA/gi, '#C9CCC4'], [/#9C86B8/gi, '#A3A89F'], [/#C4B5FD/gi, '#C9CCC4'],
  [/#B7ABDB/gi, '#D6D9D0'], [/#5A5370/gi, '#4D534D'], [/#8F86A8/gi, '#8C9289'], [/#5E5A66/gi, '#555B55'],
  [/#8E8A99/gi, '#7F857D'], [/#E9F78A/gi, '#E6FFB0'], [/#F2F2F2/gi, '#F3F4EE'], [/#CFCFD6/gi, '#D6D9D0'], [/#B9B9C4/gi, '#BDC1B8'],
  // dorado / terracota / verde de las conclusiones → lima y grises
  [/#E7C878/gi, '#CFFF5E'], [/rgba\(\s*231\s*,\s*200\s*,\s*120/gi, 'rgba(207, 255, 94'],
  [/#7FB08A/gi, '#D6D9D0'], [/#D98E5C/gi, '#A3A89F'], [/#D9A066/gi, '#A3A89F'], [/rgba\(\s*217\s*,\s*160\s*,\s*102/gi, 'rgba(163, 168, 159'],
  // grises azulados (slate) → grises neutros
  [/#94A3B8/gi, '#A3A89F'], [/#CBD5E1/gi, '#D6D9D0'], [/#64748B/gi, '#737970'], [/#F1F5F9/gi, '#F3F4EE'], [/#E2E8F0/gi, '#E6E8E0'],
  [/#F8FAFC/gi, '#F3F4EE'], [/#475569/gi, '#4D534D'], [/#EEF2F6/gi, '#F3F4EE'], [/#EAE4DA/gi, '#F3F4EE'],
  [/rgba\(\s*15\s*,\s*23\s*,\s*42/gi, 'rgba(11, 13, 16'], [/#0B1118/gi, '#13161A'],
  // negros → tinta
  [/#0A0A0C/gi, '#0B0D10'], [/#050505/gi, '#0B0D10'], [/#111010/gi, '#0B0D10'], [/#141313/gi, '#13161A'], [/rgba\(\s*17\s*,\s*16\s*,\s*16/gi, 'rgba(11, 13, 16'],
  // tipografías: Geist (texto) y Barlow Condensed (títulos, en el CSS que inyecta el driver)
  [/family=IBM\+Plex\+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700;800;900/g, 'family=Barlow+Condensed:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;600'],
  [/'IBM Plex Mono'/g, "'Geist Mono'"], [/"Inter"/g, '"Geist"'], [/'Inter'/g, "'Geist'"], [/px Inter, /g, 'px Geist, '], [/ Inter, sans-serif/g, ' Geist, sans-serif'],
  // sin territorio 3D (no se usa en la presentación)
  ['Promise.all([loadWater(), loadTrees(), loadRoads(), loadBuildings()])', 'Promise.resolve() /* presentación: sin territorio 3D */'],
];
for (const [a, b] of MAPA) t = typeof a === 'string' ? t.split(a).join(b) : t.replace(a, b);
t = t.replace('@@DATOS@@', datos);
fs.writeFileSync(path.join(__dirname, 'red-causal-3n.html'), t);
console.log('ok', t.length);
