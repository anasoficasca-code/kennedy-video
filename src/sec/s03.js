// Capítulo 03 · páginas reales de las autoras corriendo a pantalla completa (sin zoom), usadas con un cursor:
// «De 18 capas a 9 índices» (picos/cruces) y «Indicadores en 3D» (picos). Encima, edición X.ed.
/** nodo de un índice en la página de cruces (o null si aún no está) */
const nodo = (X, id) => { try { return X.ventana('cruces')?.eval('nodos.' + id) || null; } catch (e) { return null; } };

export default /* ===================================================================== 03 INDICADORES */
  {
    n: '03', nombre: 'De los mapas a las dinámicas territoriales', cam: 'capas', tr: 'recorte', pagina: true, precarga: ['cruces', 'picos'],
    base: (X) => { X.gris(0.8, 0); },
    beats: [
      { t: 'Para comenzar a comprender Kennedy desde la complejidad,', a: (X) => {
        X.pagina('cruces', 'inicio', { entrada: 'barrido' });
        X.ed.rotulo('Kennedy desde la *complejidad*', { kick: 'Para comenzar', lado: 'der', delay: 0.6 });
      } },
      { t: 'se cruzaron dieciocho capas de información satelital,', a: (X) => {
        // el número cuenta al ritmo del cursor: cada rótulo que toca es una capa (01 → 18)
        const c = X.ed.cifra({ v: 0, desde: 0, dur_conteo: 0.01, texto: 'capas de información', x: 50, y: 34 });
        const b = c?.querySelector('.num b');
        X.pagina('cruces', 'capas', { paso: 150, alPaso: (k) => { if (b) b.textContent = k; } });
      } },
      { t: 'a partir de las cuales se construyeron nueve índices territoriales.', a: (X) => {
        const c = X.ed.cifra({ v: 0, desde: 0, dur_conteo: 0.01, texto: 'índices territoriales', x: 71, y: 77, delay: 0.9 });
        const b = c?.querySelector('.num b');
        X.pagina('cruces', 'indices', { espera: 1300, paso: 110, alPaso: (k) => { if (b) b.textContent = k; } });
      } },
      { t: 'Entre ellos, el índice de concentración comercial y logística', a: (X) => {
        X.pagina('cruces', 'ccl', { alClic: () => X.ed.senalar('cruces', nodo(X, 'CCL'), { texto: 'Concentración comercial y logística', lado: 'arriba', pad: 12 }) });
      } },
      { t: 'y el índice de soporte ecológico.', a: (X) => {
        X.pagina('cruces', 'se', { alClic: () => X.ed.senalar('cruces', nodo(X, 'SE'), { texto: 'Soporte ecológico', lado: 'arriba', pad: 12 }) });
      } },
      { t: 'Mientras las actividades comerciales y logísticas se intensificaban alrededor de Corabastos,', a: (X) => {
        X.pagina('picos', 'ccl', { entrada: 'barrido' });
        X.ed.rotulo('Actividades comerciales y *logísticas*', { kick: 'CCL · altura y color = intensidad', lado: 'der', delay: 1.6 });
      } },
      { t: 'el soporte ecológico presentaba discontinuidades y fragmentación de la cobertura vegetal.', a: (X) => {
        X.pagina('picos', 'se');
        X.ed.rotulo('*Discontinuidades* y *fragmentación* de la cobertura vegetal', { kick: 'SE · soporte ecológico', lado: 'der', delay: 1.2 });
      } },
      { t: 'Al cruzar estos índices', a: (X) => {
        X.pagina('picos', 'cruce', { alClic: () => X.ed.pop({ kick: 'Cruce de índices', t: '*CCL* + *SE* sobre el mismo territorio', cls: 'oscuro', x: 66, y: 12, ancho: 26 }) });
      } },
      { t: 'se pueden reconocer sectores donde coinciden diferentes presiones urbanas y ecológicas,', a: (X) => {
        X.pagina('picos', 'coinciden');
        X.ed.lista({ titulo: 'Coinciden', items: ['Presión urbana · *CCL alto*', 'Presión ecológica · *SE bajo*'], x: 69, y: 12, ancho: 25, delay: 1.8, paso: 0.9 });
      } },
      { t: 'identificando relaciones espaciales que orientan el análisis de los problemas.', a: (X) => {
        X.pagina('picos', 'relaciones');
        X.ed.rotulo('Relaciones espaciales que orientan el *análisis de los problemas*', { kick: 'Del índice al problema', lado: 'der', delay: 0.5 });
      } },
    ],
  };
