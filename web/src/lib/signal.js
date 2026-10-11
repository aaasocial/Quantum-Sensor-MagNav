// Row builders for the sensor panel and the 60 s text-alternative tables. Pure ESM so
// node --test can import it. Everything is indexed by the display index of uavView; RMSE values
// are read from line.metrics, never recomputed.

export const BASELINE_KEY = 'baseline_ls';

// Sensed-field rows: {t, truth, baseline_ls, <quantumKey>} for every display index.
export function sensedSeries(view, quantumKey) {
  const base = view.est[BASELINE_KEY]?.signal;
  const q = view.est[quantumKey]?.signal;
  const rows = new Array(view.n);
  for (let i = 0; i < view.n; i += 1) {
    const row = { t: view.t[i], truth: view.truth.anomaly[i] };
    if (base) row[BASELINE_KEY] = base[i];
    if (q) row[quantumKey] = q[i];
    rows[i] = row;
  }
  return rows;
}

// Residual rows (sensed - truth) from the metric-start display index to the end.
export function residualSeries(view, quantumKey) {
  const base = view.est[BASELINE_KEY]?.signal;
  const q = view.est[quantumKey]?.signal;
  const rows = [];
  for (let i = view.metricStartDisplayIndex; i < view.n; i += 1) {
    const truth = view.truth.anomaly[i];
    const row = { t: view.t[i] };
    if (base) row[BASELINE_KEY] = base[i] - truth;
    if (q) row[quantumKey] = q[i] - truth;
    rows.push(row);
  }
  return rows;
}

export function rmseValue(view, key) {
  const v = view?.metrics?.[key]?.signal_rmse_nT;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

export const rmseText = (v) => (v === null ? 'RMSE n/a' : `RMSE ${v.toFixed(1)} nT`);

// Legend badges: truth is the reference, the others read line.metrics.
export function rmseLabels(view, quantumKey) {
  return {
    truth: 'reference',
    [BASELINE_KEY]: rmseText(rmseValue(view, BASELINE_KEY)),
    [quantumKey]: rmseText(rmseValue(view, quantumKey)),
  };
}

// Display indices nearest each multiple of everyS seconds of flight time, plus the jam index.
export function sampleIndices(view, everyS = 60) {
  const out = new Set([0, view.jamIdx]);
  let i = 0;
  for (let target = 0; target <= view.tEnd + 1e-9; target += everyS) {
    while (i + 1 < view.n && Math.abs(view.t[i + 1] - target) <= Math.abs(view.t[i] - target)) i += 1;
    out.add(i);
  }
  return [...out].sort((a, b) => a - b);
}
