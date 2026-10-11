import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastUsed, rowsFromPayload } from './ghzScaling.js';

const FIXTURE = {
  ok: true,
  S: 256,
  tau0_s: 0.001,
  gamma_hz_per_nT: 3.4986,
  trials: 4000,
  n: [1, 2, 4],
  sql_nT: [2.84, 2.01, 1.42],
  hl_nT: [2.84, 1.42, 0.71],
  unentangled_nT: [2.86, 2.02, 1.43],
  ghz_ideal_nT: [2.86, 1.44, 0.73],
  ghz_measured_nT: null,
  c_ideal: { 1: 0.98, 2: 0.9604, 4: 0.922368 },
  c_measured: null,
};

test('rowsFromPayload gives one row per n with every series', () => {
  const rows = rowsFromPayload(FIXTURE);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((r) => r.n), [1, 2, 4]);
  assert.deepEqual(
    Object.keys(rows[0]).sort(),
    ['cUsed', 'ghzIdeal', 'ghzMeasured', 'hl', 'n', 'sql', 'unentangled'],
  );
  assert.equal(rows[1].sql, 2.01);
  assert.equal(rows[2].ghzIdeal, 0.73);
  assert.ok(rows[2].hl < rows[2].sql);
});

test('ghzMeasured is null without measured values and filled with them', () => {
  assert.ok(rowsFromPayload(FIXTURE).every((r) => r.ghzMeasured === null));
  const m = { ...FIXTURE, ghz_measured_nT: [2.86, 1.52, 0.81], c_measured: { 1: 0.98, 2: 0.95, 4: 0.9 } };
  const rows = rowsFromPayload(m);
  assert.deepEqual(rows.map((r) => r.ghzMeasured), [2.86, 1.52, 0.81]);
  assert.equal(rows[2].cUsed, 0.9);
  assert.equal(contrastUsed(m, 2), 0.95);
  assert.equal(contrastUsed(FIXTURE, 4), 0.922368);
});

test('rowsFromPayload rejects ok:false, missing and non-finite payloads', () => {
  assert.deepEqual(rowsFromPayload({ ok: false, error: 'x' }), []);
  assert.deepEqual(rowsFromPayload(null), []);
  assert.deepEqual(rowsFromPayload({ ...FIXTURE, sql_nT: [1, 'x', 2] }), []);
  assert.deepEqual(rowsFromPayload({ ...FIXTURE, hl_nT: [1, 2] }), []);
  assert.deepEqual(rowsFromPayload({ ...FIXTURE, ghz_measured_nT: [1, Infinity, 2] }), []);
});
