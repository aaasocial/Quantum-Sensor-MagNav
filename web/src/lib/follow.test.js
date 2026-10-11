import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLLOW_MAX_M, FOLLOW_MIN_M, followViewBox, followWindowMetres, meanSeparation,
} from './follow.js';

test('followViewBox centres the window on the playhead', () => {
  const v = followViewBox([300, 200], 100, { W: 600, H: 400 });
  assert.deepEqual(v, { x: 250, y: 200 - 100 * (400 / 600) / 2, w: 100, h: 100 * (400 / 600) });
});

test('followViewBox clamps to the map extent', () => {
  const ext = { W: 600, H: 400 };
  const a = followViewBox([5, 5], 120, ext);
  assert.equal(a.x, 0);
  assert.equal(a.y, 0);
  const b = followViewBox([599, 399], 120, ext);
  assert.equal(b.x, 600 - 120);
  assert.equal(b.y, 400 - 80);
});

test('followViewBox centres a window wider than the map', () => {
  const v = followViewBox([10, 10], 1200, { W: 600, H: 400 });
  assert.equal(v.x, -300);
  assert.equal(v.y, -200);
  assert.equal(v.h, 800);
});

test('followWindowMetres is 20x the separation within the floor and ceiling', () => {
  assert.equal(followWindowMetres(5), FOLLOW_MIN_M);
  assert.equal(followWindowMetres(37), 740);
  assert.equal(followWindowMetres(1000), FOLLOW_MAX_M);
  assert.equal(followWindowMetres(NaN), FOLLOW_MIN_M);
});

test('meanSeparation averages from the jam index on', () => {
  const a = { x: [0, 0, 0], y: [0, 0, 0] };
  const b = { x: [100, 3, 0], y: [0, 4, 0] };
  assert.equal(meanSeparation(a, b, 1), 2.5);
  assert.equal(meanSeparation(a, b, 3), 0);
});
