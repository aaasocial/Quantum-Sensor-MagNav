import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createThrottle, speedWords, loadedText, scenarioText, runModeText, playText, pausedText,
  jamText, readoutText, trackText, modeText, stageText, finishedText,
} from './announce.js';

const art = JSON.parse(readFileSync(new URL('../../../data/precomputed_uav.json', import.meta.url), 'utf8'));
const [synth, east] = art.scenarios;

test('createThrottle allows the first call, blocks within the interval, allows after', () => {
  let now = 1000;
  const allow = createThrottle(10000, () => now);
  assert.equal(allow(), true);
  now += 5000;
  assert.equal(allow(), false);
  now += 4999;
  assert.equal(allow(), false);
  now += 1;
  assert.equal(allow(), true);
  now += 100;
  assert.equal(allow(), false);
  allow.reset();
  assert.equal(allow(), true);
});

test('speedWords never uses the multiplication sign', () => {
  assert.equal(speedWords(30), '30 times speed');
  assert.equal(speedWords(90), '90 times speed');
});

test('scenario change uses the artifact strings verbatim', () => {
  assert.equal(
    scenarioText(synth.label, synth.map_label),
    `Scenario: ${synth.label}, ${synth.map_label}. Showing recorded replay.`,
  );
  assert.equal(
    scenarioText(east.label, east.map_label, true),
    `Scenario: ${east.label}, ${east.map_label}. Showing this Run's live result.`,
  );
  assert.ok(scenarioText(synth.label, synth.map_label).includes('synthetic map (sensitivity study), not survey data'));
});

test('builders return the exact UI-SPEC strings', () => {
  assert.equal(
    loadedText(synth.label, synth.map_label),
    `Recorded flights loaded. Scenario: ${synth.label}, ${synth.map_label}. Press Run one IonQ job, or Play.`,
  );
  assert.equal(runModeText('live'), 'Run mode: live.');
  assert.equal(runModeText('replay'), 'Run mode: recorded replay.');
  assert.equal(playText(30), 'Playing at 30 times speed.');
  assert.equal(pausedText(224.6), 'Paused at 225 seconds.');
  assert.equal(jamText(225), 'GPS jammed at 225 seconds. Navigating by magnetic map matching.');
  assert.equal(
    readoutText(600, 'Quantum: GHZ-4 entangled', 151.4, 180.6),
    '600 seconds. Quantum: GHZ-4 entangled: 151 metres. Baseline: 181 metres.',
  );
  assert.equal(trackText('Quantum: single-qubit Ramsey'), 'Quantum track: Quantum: single-qubit Ramsey.');
  assert.equal(modeText('computing in-page…'), 'Mode: computing in-page.');
  assert.equal(stageText(1, 'submitting one IonQ job…'), 'Step 1 of 4: submitting one IonQ job.');
  assert.equal(
    finishedText('Quantum: GHZ-4 entangled', 150, 160),
    'Replay finished. Quantum: GHZ-4 entangled: 150 metres. Baseline: 160 metres.',
  );
  assert.equal(finishedText('x', null, 1), 'Replay finished.');
});

test('no output contains the multiplication sign', () => {
  const all = [
    speedWords(30), loadedText('a', 'b'), scenarioText('a', 'b'), runModeText('live'), playText(90),
    pausedText(1), jamText(1), readoutText(1, 'q', 1, 1), trackText('q'), modeText('x'),
    stageText(2, 'y'), finishedText('q', 1, 1),
  ];
  for (const s of all) assert.ok(!s.includes('×'), s);
});
