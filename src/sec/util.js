// ayudas compartidas por los capítulos
export const I = (n) => './img/' + n;
export const E = (n) => './esp/' + n + '.png';
export const V = (n) => './vid/' + n;
export const P = (k, X, extra = {}) => X.et('p' + k, { p: [X.W.red6Suelo?.[k]?.x ?? 0, 300, X.W.red6Suelo?.[k]?.z ?? 0], t: X.NOM_P[k], c: X.COL_P[k], cls: 'nodo', ...extra });
export const nodoEt = (X, k, d = 0) => X.et('n' + k, { p: [0, 0, 0], obj: X.W.red6.nod[k].userData.cabeza, t: X.NOM_P[k], c: X.COL_P[k], cls: 'nodo', delay: d });
export const lugar = (X, id, p, t, s, d = 0, y = 120) => X.et(id, { p: [p[0], y, p[1]], t, s, delay: d });
