import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scenarioById, uavView } from './artifactV2.js';
import { residualSeries, rmseLabels, sampleIndices, sensedSeries } from './signal.js';

const ARTIFACT = JSON.parse(readFileSync(new URL('../../../data/precomputed_uav.json', import.meta.url), 'utf8'));
const view = (id = 'synthetic_100m') => uavView(scenarioById(ARTIFACT, id));

test('sensedSeries has one row per display index with t, truth, baseline and the quantum key', () => {
  const v = view();
  const rows = sensedSeries(v, 'quantum_ghz4');
  assert.equal(rows.length, 901);
  assert.equal(rows.length, v.n);
  assert.deepEqual(Object.keys(rows[0]).sort(), ['baseline_ls', 'quantum_ghz4', 't', 'truth']);
  assert.equal(rows[10].t, v.t[10]);
  assert.equal(rows[10].truth, v.truth.anomaly[10]);
  assert.equal(rows[10].baseline_ls, v.est.baseline_ls.signal[10]);
  assert.equal(rows[10].quantum_ghz4, v.est.quantum_ghz4.signal[10]);
});

test('sensedSeries follows the quantum toggle', () => {
  const rows = sensedSeries(view(), 'quantum_q1');
  assert.deepEqual(Object.keys(rows[0]).sort(), ['baseline_ls', 'quantum_q1', 't', 'truth']);
});

test('residualSeries starts at the metric-start display index', () => {
  const v = view();
  const rows = residualSeries(v, 'quantum_ghz4');
  const ms = v.metricStartDisplayIndex;
  assert.ok(ms > 0);
  assert.equal(rows.length, v.n - ms);
  assert.equal(rows[0].t, v.t[ms]);
  assert.equal(rows[0].baseline_ls, v.est.baseline_ls.signal[ms] - v.truth.anomaly[ms]);
  assert.equal(rows[0].quantum_ghz4, v.est.quantum_ghz4.signal[ms] - v.truth.anomaly[ms]);
});

test('rmseLabels read line.metrics values without recomputation', () => {
  for (const id of ['synthetic_100m', 'eastern_400m']) {
    const v = view(id);
    const labels = rmseLabels(v, 'quantum_q1');
    assert.equal(labels.truth, 'reference');
    assert.equal(labels.baseline_ls, `RMSE ${v.metrics.baseline_ls.signal_rmse_nT.toFixed(1)} nT`);
    assert.equal(labels.quantum_q1, `RMSE ${v.metrics.quantum_q1.signal_rmse_nT.toFixed(1)} nT`);
  }
});

test('sampleIndices is sorted, unique, has 0 and the jam index, one per 60 s', () => {
  const v = view();
  const idx = sampleIndices(v, 60);
  assert.deepEqual(idx, [...new Set(idx)].sort((a, b) => a - b));
  assert.ok(idx.includes(0));
  assert.ok(idx.includes(v.jamIdx));
  assert.ok(idx.length >= 15 && idx.length <= 18, `got ${idx.length}`);
});
