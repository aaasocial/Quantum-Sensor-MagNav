import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateLivePayload } from './artifactV2.js';
import {
  DEADLINE_MS, JOB_SHOTS, STEP_BUDGET_MS, createLiveRunner, runLive,
} from './liveRun.js';

const ART = JSON.parse(readFileSync(new URL('../../../data/precomputed_uav.json', import.meta.url), 'utf8'));
const byId = (id) => ART.scenarios.find((s) => s.id === id);

const QUANTUM = {
  ok: true,
  job_id: '55dade7a-5be3-4a32-9018-85efabd7b5f6',
  backend: 'basic_simulator',
  backend_class: 'BasicSimulator',
  is_qpu: false,
  bits_label: 'simulator-sampled',
  analytic_blocks: false,
  shots: 1024,
  counts_sum: 1024,
  submitted_utc: '2026-10-11T11:38:26+00:00',
  timestamp_utc: '2026-10-11T11:38:26+00:00',
  rng_n_qubits: 6,
  rng_hist: new Array(64).fill(16),
  seed_hex: '60d17af83ec9daa1',
  seed_str: '6976492504397503137',
  motor: { rpm_min: 4516.05, rpm_max: 8178.98, amps_nT: [3600, 1800, 1080, 720], phases: [3.6, 2.9, 4.7, 2.4] },
  fringe_p1: [0.149, 0.702, 0.867],
  fringe_expected: [0.146, 0.691, 0.854],
  c_hat: { c1: 1.0, c2: 0.95, c4: 0.9 },
  ancilla_return: { ghz2: 1.0, ghz4: 1.0 },
  c_n_used: 0.9,
  c_n_default: 0.922368,
  c_n_source: 'measured this Run',
  c_n_note: '',
  circuit_sha256: '45215a38b2b17c206f657e897ede7e1311332c8996fbbbe232c950ea82212560',
  reused: false,
};

function liveResultFor(id) {
  const { ok, ...job } = QUANTUM;
  return {
    ok: true,
    kind: 'uav_live',
    scenario: byId(id),
    motor: { ...ART.motor, seed_str: QUANTUM.seed_str, seed_hex: QUANTUM.seed_hex },
    S: ART.S,
    model_sha256: ART.model_sha256,
    quantum_job: job,
  };
}

// A scripted stand-in for magnav.api: a fake clock advanced by each call. Every call is recorded
// as {name, args, at}. failAt(name, n) may return a payload, an Error to throw, or a promise.
function makeSim({ steps = 5, msPerStep = 250, failAt = null, result = null } = {}) {
  const clock = { t: 0 };
  const calls = [];
  let scenario = null;
  let k = 0;
  async function callPy(name, ...args) {
    calls.push({ name, args, at: clock.t });
    if (failAt) {
      const f = failAt(name, calls.filter((c) => c.name === name).length);
      if (f instanceof Error) throw f;
      if (f) return f;
    }
    switch (name) {
      case 'uav_start':
        [scenario] = args;
        clock.t += 20;
        return { ok: true, scenario, stage: 'ready', samples_total: 1800, S: 256 };
      case 'uav_quantum':
        clock.t += 100;
        return { ...QUANTUM };
      case 'live_step': {
        clock.t += msPerStep;
        k += 1;
        const done = k > steps;
        const w = Math.min(248, Math.round((248 * (k - 1)) / steps));
        return {
          ok: true,
          stage: k === 1 ? 'sense' : done ? 'done' : 'tercom',
          done,
          windows_done: done ? 248 : w,
          windows_total: 248,
          samples_done: done ? 1800 : Math.round((1800 * w) / 248),
          samples_total: 1800,
        };
      }
      case 'live_result':
        return result ?? liveResultFor(scenario);
      case 'live_cancel':
        return { ok: true, cancelled: true };
      default:
        throw new Error(`unexpected ${name}`);
    }
  }
  return { clock, calls, callPy, names: () => calls.map((c) => c.name) };
}

function deps(sim, extra = {}) {
  const stages = [];
  const quantum = [];
  const steps = [];
  return {
    stages,
    quantum,
    steps,
    args: {
      scenario: 'synthetic_100m',
      hasBackend: true,
      simulateFailure: false,
      callPy: sim.callPy,
      now: () => sim.clock.t,
      yieldFn: async () => {},
      validate: validateLivePayload,
      onStage: (n) => stages.push(n),
      onQuantum: (q) => quantum.push({ q, callsBefore: sim.calls.length }),
      onStep: (s) => steps.push(s),
      ...extra,
    },
  };
}

// One macrotask per tick, advancing the fake clock by stepMs (a frame of wall time).
const tickBy = (sim, stepMs) => () => new Promise((resolve) => {
  setImmediate(() => { sim.clock.t += stepMs; resolve(); });
});

async function rejectsNamed(promise, name) {
  try {
    await promise;
  } catch (e) {
    assert.equal(e.name, name, `${e.name}: ${e.message}`);
    return e;
  }
  assert.fail(`expected a ${name} rejection`);
  return null;
}

test('constants match the UI-SPEC budget', () => {
  assert.equal(DEADLINE_MS, 90000);
  assert.equal(STEP_BUDGET_MS, 250);
  assert.equal(JOB_SHOTS, 1024);
});

test('happy path: uav_start -> uav_quantum -> live_step until done -> live_result', async () => {
  const sim = makeSim();
  const d = deps(sim);
  const res = await runLive(d.args);
  const names = sim.names();
  assert.deepEqual(sim.calls[0], { name: 'uav_start', args: ['synthetic_100m', false], at: 0 });
  assert.equal(sim.calls[1].name, 'uav_quantum');
  assert.deepEqual(sim.calls[1].args, [1024]);
  const steps = names.slice(2, -1);
  assert.ok(steps.length >= 2 && steps.every((n) => n === 'live_step'), names.join(','));
  for (const c of sim.calls.filter((x) => x.name === 'live_step')) assert.deepEqual(c.args, [250]);
  assert.equal(names.at(-1), 'live_result');
  assert.ok(!names.includes('live_cancel'));
  assert.deepEqual(d.stages, [1, 2, 3, 4]);
  assert.equal(d.quantum.length, 1);
  assert.equal(d.quantum[0].q.job_id, QUANTUM.job_id);
  assert.equal(d.quantum[0].callsBefore, 2, 'onQuantum fires before the first live_step');
  assert.ok(d.steps.length >= 2);
  assert.equal(d.steps.at(-1).done, true);
  assert.equal(res.ok, true);
  assert.deepEqual(validateLivePayload(res.result), []);
  assert.equal(res.result.scenario.id, 'synthetic_100m');
  assert.equal(res.quantum.job_id, QUANTUM.job_id);
  assert.ok(res.elapsedMs > 0);
});

test('the selected scenario and the failure flag are passed through', async () => {
  const sim = makeSim();
  const res = await runLive(deps(sim, { scenario: 'eastern_400m' }).args);
  assert.equal(res.result.scenario.id, 'eastern_400m');
  const sim2 = makeSim({
    failAt: (name) => (name === 'uav_start'
      ? { ok: false, stage: null, error_type: 'RuntimeError', error: 'Simulated failure (demo of the fallback)' }
      : null),
  });
  const e = await rejectsNamed(runLive(deps(sim2, { simulateFailure: true }).args), 'RuntimeError');
  assert.deepEqual(sim2.calls[0].args, ['synthetic_100m', true]);
  assert.match(e.message, /Simulated failure/);
  assert.ok(!sim2.names().includes('uav_quantum'));
});

test('a live_result for another scenario is a ScenarioMismatch and cancels', async () => {
  const sim = makeSim({ result: liveResultFor('eastern_400m') });
  await rejectsNamed(runLive(deps(sim).args), 'ScenarioMismatch');
  assert.equal(sim.names().at(-1), 'live_cancel');
});

test('an invalid live_result payload is InvalidPayload', async () => {
  const bad = liveResultFor('synthetic_100m');
  bad.kind = 'uav_run';
  const sim = makeSim({ result: bad });
  await rejectsNamed(runLive(deps(sim).args), 'InvalidPayload');
});

test('ok:false at uav_quantum rejects with its error_type and makes no live_step call', async () => {
  const sim = makeSim({
    failAt: (name) => (name === 'uav_quantum'
      ? { ok: false, stage: 'ready', error_type: 'IonQAPIError', error: 'HTTP 500' } : null),
  });
  const d = deps(sim);
  const e = await rejectsNamed(runLive(d.args), 'IonQAPIError');
  assert.equal(e.message, 'HTTP 500');
  assert.equal(e.stage, 1, 'step 2 (decoding) starts only once the counts have returned');
  assert.ok(!sim.names().includes('live_step'));
  assert.equal(sim.names().at(-1), 'live_cancel');
  assert.equal(d.quantum.length, 0);
});

test('a thrown bridge error keeps its name and the received job stays attached', async () => {
  const sim = makeSim({ failAt: (name, n) => (name === 'live_step' && n === 2 ? new TypeError('boom') : null) });
  const e = await rejectsNamed(runLive(deps(sim).args), 'TypeError');
  assert.equal(e.quantum.job_id, QUANTUM.job_id);
  assert.equal(e.stage, 3);
});

test('no backend: rejects with NoBackend before any Python call', async () => {
  const sim = makeSim();
  await rejectsNamed(runLive(deps(sim, { hasBackend: false }).args), 'NoBackend');
  assert.equal(sim.calls.length, 0);
});

test('deadline between calls: a slow run fails with TimeoutError and cancels', async () => {
  const sim = makeSim({ steps: 1000, msPerStep: 1000 });
  const e = await rejectsNamed(runLive(deps(sim).args), 'TimeoutError');
  assert.match(e.message, /longer than 90 s/);
  assert.equal(sim.names().at(-1), 'live_cancel');
  assert.ok(!sim.names().includes('live_result'));
});

test('watchdog: a normal run with a ticking watchdog still succeeds', async () => {
  const sim = makeSim();
  const res = await runLive(deps(sim, { nextFrame: tickBy(sim, 0) }).args);
  assert.equal(res.ok, true);
  assert.equal(sim.names().at(-1), 'live_result');
});

test('watchdog: a hung call fails with TimeoutError past 90 s and live_cancel is issued', async () => {
  const sim = makeSim({ failAt: (name) => (name === 'uav_quantum' ? new Promise(() => {}) : null) });
  const e = await rejectsNamed(runLive(deps(sim, { nextFrame: tickBy(sim, 1000) }).args), 'TimeoutError');
  assert.equal(e.abandoned, true);
  assert.ok(e.elapsedMs > DEADLINE_MS && e.elapsedMs <= DEADLINE_MS + 1000, String(e.elapsedMs));
  assert.equal(sim.names().at(-1), 'live_cancel', 'live_cancel is queued behind the hung call');
  assert.ok(!sim.names().includes('live_step'));
});

test('watchdog: the late result of an abandoned call is discarded', async () => {
  let release;
  const late = new Promise((resolve) => { release = resolve; });
  const sim = makeSim({ failAt: (name, n) => (name === 'live_step' && n === 3 ? late : null) });
  await rejectsNamed(runLive(deps(sim, { nextFrame: tickBy(sim, 5000) }).args), 'TimeoutError');
  const before = sim.names().length;
  release({ ok: true, stage: 'done', done: true, windows_done: 248, windows_total: 248 });
  await new Promise((r) => setImmediate(r));
  assert.equal(sim.names().length, before, 'no Python call follows the late result');
});

test('cancel(): rejects with AbortError while a call is pending', async () => {
  const sim = makeSim({ failAt: (name, n) => (name === 'live_step' && n === 2 ? new Promise(() => {}) : null) });
  const {
    scenario, simulateFailure, onStage, onQuantum, onStep, ...rest
  } = deps(sim, { nextFrame: tickBy(sim, 10) }).args;
  const runner = createLiveRunner(rest);
  const run = runner.start({ scenario, simulateFailure, onStage, onQuantum, onStep });
  run.catch(() => {});
  for (let i = 0; i < 5; i += 1) await new Promise((r) => setImmediate(r));
  assert.equal(runner.isInFlight(), true);
  runner.cancel();
  const e = await rejectsNamed(run, 'AbortError');
  assert.ok(e.elapsedMs < DEADLINE_MS);
  assert.equal(sim.names().at(-1), 'live_cancel');
  assert.equal(runner.isInFlight(), false);
});

test('createLiveRunner refuses a second start while one is in flight', async () => {
  const sim = makeSim();
  const { scenario, ...rest } = deps(sim).args;
  const runner = createLiveRunner(rest);
  const a = runner.start({ scenario });
  await rejectsNamed(runner.start({ scenario }), 'Busy');
  const res = await a;
  assert.equal(res.ok, true);
  assert.equal(sim.names().filter((n) => n === 'uav_quantum').length, 1);
});
