import { test } from 'node:test';
import assert from 'node:assert/strict';
import { curve, harmonics, nulls, response, responseDb } from './filterFunction.js';

// Fixture from numpy (magnav/ramsey.py filter_function = |np.sinc(f * tau)|), produced by
//   python -c "import numpy as np;print(np.abs(np.sinc(np.array([12.5,37.5,62.5])*0.01)).tolist())"
// tests/test_filter_parity.py checks these literals against ramsey.filter_function.
const PARITY_TAU_S = 0.01;
const PARITY_F_HZ = [12.5, 37.5, 62.5];
const PARITY_RESPONSE = [0.9744953584044327, 0.7842133035765372, 0.4705279821459223];

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

test('response is 1 at DC and 0 at the first null 1/tau', () => {
  assert.equal(response(0, 0.01), 1);
  assert.ok(response(100, 0.01) < 1e-12);
});

test('response matches numpy |sinc(f tau)| at the parity fixture', () => {
  PARITY_F_HZ.forEach((f, i) => close(response(f, PARITY_TAU_S), PARITY_RESPONSE[i], 1e-12));
});

test('harmonics are k * rpm / 60', () => {
  assert.deepEqual(harmonics(4500, 4), [75, 150, 225, 300]);
  assert.equal(harmonics(4500).length, 4);
});

test('with tau = 1 / f1 (m = 1 rule) every motor harmonic sits on a null', () => {
  const rpm = 7865;
  const tau = 60 / rpm;
  for (const f of harmonics(rpm, 4)) assert.ok(response(f, tau) < 1e-9, `f = ${f}`);
});

test('nulls are k / tau', () => {
  const ns = nulls(0.01, 4);
  assert.equal(ns.length, 4);
  ns.forEach((f, i) => close(f, (i + 1) * 100, 1e-9));
});

test('responseDb floors at 1e-6 (-120 dB) and is 0 dB at DC', () => {
  assert.equal(responseDb(0, 0.01), 0);
  assert.equal(responseDb(100, 0.01), -120);
  close(responseDb(37.5, 0.01), 20 * Math.log10(PARITY_RESPONSE[1]), 1e-9);
});

test('curve spans 0..fMax with nPts finite points in dB', () => {
  const c = curve(0.01, 400, 201);
  assert.equal(c.length, 201);
  assert.equal(c[0].f, 0);
  assert.equal(c[200].f, 400);
  assert.ok(c.every((p) => Number.isFinite(p.db) && p.db <= 0 && p.db >= -120));
});
