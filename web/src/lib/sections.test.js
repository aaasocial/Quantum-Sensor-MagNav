import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLOSED, nextOpenState } from './sections.js';

test('initial state is both sections collapsed', () => {
  assert.deepEqual(CLOSED, { job: false, charts: false });
});

test('running -> result opens the job panel and the sensor charts', () => {
  assert.deepEqual(nextOpenState({ job: false, charts: false }, 'running', 'result'), { job: true, charts: true });
});

test('running -> fallback opens the job panel only and keeps the charts choice', () => {
  assert.deepEqual(nextOpenState({ job: false, charts: false }, 'running', 'fallback'), { job: true, charts: false });
  assert.deepEqual(nextOpenState({ job: false, charts: true }, 'running', 'fallback'), { job: true, charts: true });
});

test('no transition keeps the user choice (same object)', () => {
  const prev = { job: false, charts: true };
  assert.equal(nextOpenState(prev, 'result', 'result'), prev);
  assert.equal(nextOpenState(prev, 'fallback', 'fallback'), prev);
});

test('idle and running transitions keep the user choice', () => {
  const prev = { job: true, charts: false };
  assert.equal(nextOpenState(prev, 'idle', 'running'), prev);
  assert.equal(nextOpenState(prev, 'result', 'running'), prev);
  assert.equal(nextOpenState(prev, 'running', 'idle'), prev);
  assert.equal(nextOpenState(prev, 'result', 'idle'), prev);
});

test('already-open state is returned unchanged on result', () => {
  const prev = { job: true, charts: true };
  assert.equal(nextOpenState(prev, 'running', 'result'), prev);
});
