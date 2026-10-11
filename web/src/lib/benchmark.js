// Benchmark summary view-model (D-05). Input: data/benchmark_summary.json as written by
// magnav.regen. Every label, heading and caption is passed through verbatim from the JSON; this
// module only formats numbers (one decimal, with units). It never computes a statistic.
export const BENCHMARK_UNAVAILABLE = 'Benchmark summary unavailable';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v) => (typeof v === 'string' ? v : '');

function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v.toFixed(1) : 'n/a';
}

const pm = (mean, std, unit) => `${num(mean)} ± ${num(std)} ${unit}`;

export function benchmarkView(data) {
  if (!isObj(data) || data.kind !== 'benchmark_summary' || !Array.isArray(data.rows)) {
    return { error: BENCHMARK_UNAVAILABLE };
  }
  const rows = data.rows.filter(isObj).map((r) => ({
    key: str(r.estimator),
    label: str(r.label),
    cep50: pm(r.cep50_mean_m, r.cep50_std_m, 'm'),
    cep95: pm(r.cep95_mean_m, r.cep95_std_m, 'm'),
    pct556: pm(r.pct556_mean, r.pct556_std, '%'),
  }));
  const recorded = (Array.isArray(data.recorded) ? data.recorded : []).filter(isObj).map((r) => ({
    key: `${str(r.job_id)}/${str(r.scenario)}`,
    label: str(r.label),
    jobShort: str(r.job_id).slice(0, 8),
    seedHex: str(r.seed_hex),
    scenarioLabel: str(r.scenario_label),
    cep50Baseline: `${num(r.cep50_baseline_m)} m`,
    cep50Quantum: `${num(r.cep50_quantum_m)} m`,
  }));
  return { heading: str(data.heading), caption: str(data.caption), rows, recorded };
}
