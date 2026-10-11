import { test } from 'node:test';
import assert from 'node:assert/strict';
import { benchmarkView, BENCHMARK_UNAVAILABLE } from './benchmark.js';

// A fixture, not the shipped file: the view must pass labels through verbatim and only format numbers.
const fixture = () => ({
  schema_version: 1,
  kind: 'benchmark_summary',
  scenario: 'synthetic_100m',
  scenario_label: 'Scenario label X',
  S: 256,
  N: 8,
  ddof: 0,
  heading: 'Heading X',
  caption: 'Caption X',
  rows: [
    { estimator: 'baseline_ls', label: 'Row A', cep50_mean_m: 154.772, cep50_std_m: 5.07401,
      cep95_mean_m: 266.547, cep95_std_m: 21.0216, pct556_mean: 100, pct556_std: 0 },
    { estimator: 'quantum_ghz4', label: 'Row B', cep50_mean_m: 150.196, cep50_std_m: 0,
      cep95_mean_m: 251.385, cep95_std_m: 0, pct556_mean: 87.25, pct556_std: 3.05 },
  ],
  recorded: [
    { label: 'QPU-measured', job_id: '01a12aee-d8a8-7e14-b9aa-b11329aca850', seed_hex: 'c1dfff10e69fae05',
      scenario: 'eastern_400m', scenario_label: 'Scen E', backend: 'ionq_qpu.forte-1',
      cep50_baseline_m: 182.189, cep50_quantum_m: 154.699 },
  ],
});

test('rows: labels verbatim, mean +/- std to one decimal with units', () => {
  const v = benchmarkView(fixture());
  assert.equal(v.error, undefined);
  assert.equal(v.heading, 'Heading X');
  assert.equal(v.caption, 'Caption X');
  assert.deepEqual(v.rows[0], {
    key: 'baseline_ls', label: 'Row A', cep50: '154.8 ± 5.1 m', cep95: '266.5 ± 21.0 m', pct556: '100.0 ± 0.0 %',
  });
  assert.equal(v.rows[1].cep50, '150.2 ± 0.0 m');
  assert.equal(v.rows[1].pct556, '87.3 ± 3.1 %');
});

test('recorded rows: label, short job id, seed, scenario label, CEP50 pair', () => {
  const v = benchmarkView(fixture());
  assert.equal(v.recorded.length, 1);
  assert.deepEqual(v.recorded[0], {
    key: '01a12aee-d8a8-7e14-b9aa-b11329aca850/eastern_400m',
    label: 'QPU-measured', jobShort: '01a12aee', seedHex: 'c1dfff10e69fae05', scenarioLabel: 'Scen E',
    cep50Baseline: '182.2 m', cep50Quantum: '154.7 m',
  });
});

test('missing recorded list gives an empty list, a non-finite number shows n/a', () => {
  const d = fixture();
  delete d.recorded;
  d.rows[0].cep95_std_m = null;
  const v = benchmarkView(d);
  assert.deepEqual(v.recorded, []);
  assert.equal(v.rows[0].cep95, '266.5 ± n/a m');
});

test('null, wrong kind or missing rows give the failure text', () => {
  const err = { error: 'Benchmark summary unavailable' };
  assert.equal(BENCHMARK_UNAVAILABLE, 'Benchmark summary unavailable');
  assert.deepEqual(benchmarkView(null), err);
  assert.deepEqual(benchmarkView(undefined), err);
  assert.deepEqual(benchmarkView({ kind: 'other' }), err);
  assert.deepEqual(benchmarkView({ kind: 'benchmark_summary' }), err);
  assert.deepEqual(benchmarkView('text'), err);
});
