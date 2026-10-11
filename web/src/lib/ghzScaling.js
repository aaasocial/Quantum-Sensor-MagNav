// Rows for the GHZ scaling chart and its table, from the magnav.api ghz_scaling_json payload
// (plan 02-02). Pure ESM. A payload that is not ok, or has a missing or non-finite value in any
// series, gives [] and the chart shows its empty state (T-02-32).

const SERIES_FIELDS = [
  ['sql', 'sql_nT'],
  ['hl', 'hl_nT'],
  ['unentangled', 'unentangled_nT'],
  ['ghzIdeal', 'ghz_ideal_nT'],
];

const finiteList = (v, n) => Array.isArray(v) && v.length === n && v.every((x) => typeof x === 'number' && Number.isFinite(x));

// Contrast the emulator used for probe size n: measured this Run when present, else the model.
export function contrastUsed(p, n) {
  const key = String(n);
  const m = p?.c_measured?.[key];
  if (typeof m === 'number' && Number.isFinite(m)) return m;
  const c = p?.c_ideal?.[key];
  return typeof c === 'number' && Number.isFinite(c) ? c : null;
}

export function hasMeasured(p) {
  return Array.isArray(p?.ghz_measured_nT);
}

export function rowsFromPayload(p) {
  if (!p || p.ok !== true || !Array.isArray(p.n) || p.n.length === 0) return [];
  const len = p.n.length;
  if (!p.n.every((x) => Number.isInteger(x) && x > 0)) return [];
  for (const [, field] of SERIES_FIELDS) if (!finiteList(p[field], len)) return [];
  const measured = p.ghz_measured_nT;
  if (measured !== null && measured !== undefined && !finiteList(measured, len)) return [];
  return p.n.map((n, i) => {
    const row = { n };
    for (const [key, field] of SERIES_FIELDS) row[key] = p[field][i];
    row.ghzMeasured = Array.isArray(measured) ? measured[i] : null;
    row.cUsed = contrastUsed(p, n);
    return row;
  });
}
