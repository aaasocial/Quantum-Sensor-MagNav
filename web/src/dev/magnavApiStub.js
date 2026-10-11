// Local stand-in for the Pyodide 'magnav.api' module (vite dev only, never bundled).
// Every function returns a JSON STRING, exactly like Python, so dev exercises JSON.parse and the
// same ok / error_type contract as magnav/api.py (plan 02-02): backend_info, the data calls,
// ghz_scaling_json and the live run (uav_start, uav_quantum, live_step, live_result,
// live_cancel; plan 02-06). Keys mirror the real payloads; the values are not results.
const py = (impl) => ({ callPromising: async (...args) => impl(...args) });

export const backend_info = py(async () => JSON.stringify({
  ok: true,
  name: 'dev-stub',
  class: 'DevStub',
  is_ionq: false,
  is_qpu: false,
  num_qubits: 16,
  noise_model: null,
  versions: { qiskit: 'n/a', qiskit_ionq: null, numpy: 'n/a', python: 'n/a (vite dev stub)' },
}));

// ---- data files (the real files, served by vite dev through server.fs.allow) ----

let artifactText = null;
async function loadArtifactText() {
  if (artifactText === null) {
    artifactText = (await import('../../../data/precomputed_uav.json?raw')).default.trim();
  }
  return artifactText;
}

let circuitText = null;
async function loadCircuitText() {
  if (circuitText === null) {
    circuitText = (await import('../../../data/circuit_freeze.json?raw')).default.trim();
  }
  return circuitText;
}

export const artifact_json = py(async () => '{"ok":true,"artifact":' + (await loadArtifactText()) + '}');

export const circuit_json = py(async () => '{"ok":true,"circuit":' + (await loadCircuitText()) + '}');

let benchmarkText = null;
async function loadBenchmarkText() {
  if (benchmarkText === null) {
    benchmarkText = (await import('../../../data/benchmark_summary.json?raw')).default.trim();
  }
  return benchmarkText;
}

export const benchmark_json = py(async () => '{"ok":true,"benchmark":' + (await loadBenchmarkText()) + '}');

export const hardware_json = py(async () => JSON.stringify({
  ok: false,
  error_type: 'NotCaptured',
  error: 'data/forte_hardware_run.json is not present (dev stub)',
}));

// A fixed, plausible payload with the 02-02 contract keys (dev only; numbers are not results).
// With contrasts (c1, c2, c4 from this Run's job) it adds the measured GHZ series, as the real
// ghz_scaling_json does.
export const ghz_scaling_json = py(async (_backend, c1 = null, c2 = null, c4 = null) => {
  const measured = c1 !== null || c2 !== null || c4 !== null;
  const cIdeal = { 1: 0.98, 2: 0.9604, 4: 0.92236816 };
  return JSON.stringify({
    ok: true,
    S: 256,
    tau0_s: 0.01,
    gamma_hz_per_nT: 3.4986,
    trials: 4000,
    n: [1, 2, 4],
    sql_nT: [0.2901, 0.2051, 0.1451],
    hl_nT: [0.2901, 0.1480, 0.0771],
    unentangled_nT: [0.2906, 0.2080, 0.1427],
    ghz_ideal_nT: [0.2883, 0.1485, 0.0775],
    ghz_measured_nT: measured ? [0.2882, 0.1495, 0.0789] : null,
    c_ideal: cIdeal,
    c_measured: measured ? { 1: c1 ?? cIdeal[1], 2: c2 ?? cIdeal[2], 4: c4 ?? cIdeal[4] } : null,
  });
});

// ---- live run (dev only; mirrors magnav/api.py uav_start .. live_cancel key for key) ----

const SCENARIOS = ['synthetic_100m', 'eastern_400m'];
const STUB_STEPS = 20;
const STUB_SAMPLES = 1800;
const STUB_WINDOWS = 248;
const STUB_SEED_HEX = '0123456789abcdef';
const STUB_SEED_STR = BigInt(`0x${STUB_SEED_HEX}`).toString();
let live = null; // {scenario, steps, quantum}
let stubJob = null; // one job per page load, like the Python latch

const fail = (stage, errorType, error) => JSON.stringify({ ok: false, stage, error_type: errorType, error });

// Busy-waits so the dev page shows the chunked, main-thread cost of a real live_step.
function spin(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) { /* dev stub only */ }
}

export const uav_start = py(async (_backend, scenario, simulateFailure = false) => {
  live = null;
  if (!SCENARIOS.includes(scenario)) return fail(null, 'BadScenario', `unknown scenario ${String(scenario)}`);
  if (simulateFailure) return fail(null, 'RuntimeError', 'Simulated failure (demo of the fallback)');
  live = { scenario, steps: 0, quantum: null };
  return JSON.stringify({ ok: true, scenario, stage: 'ready', samples_total: STUB_SAMPLES, S: 256 });
});

export const uav_quantum = py(async (_backend, jobShots = 1024) => {
  if (Number(jobShots) !== 1024) return fail(null, 'ValueError', 'job_shots must be one of [1024]');
  if (!live || live.steps > 0) return fail(null, 'NoLiveRun', 'call uav_start first');
  const reused = stubJob !== null;
  const now = new Date().toISOString().replace(/\.\d+Z$/, '+00:00');
  stubJob = stubJob ?? {
    job_id: 'stub-job-0001',
    backend: 'dev-stub',
    backend_class: 'DevStub',
    is_qpu: false,
    bits_label: 'simulator-sampled',
    shots: 1024,
    counts_sum: 1024,
    submitted_utc: now,
    timestamp_utc: now,
    rng_hist: new Array(64).fill(16),
    seed_hex: STUB_SEED_HEX,
    seed_str: STUB_SEED_STR,
    fringe_p1: [0.15, 0.70, 0.86],
    c_hat: { c1: 0.98, c2: 0.95, c4: 0.90 },
    ancilla_return: { ghz2: 0.99, ghz4: 0.97 },
    circuit_sha256: '45215a38b2b17c206f657e897ede7e1311332c8996fbbbe232c950ea82212560',
    analytic_blocks: false,
    rng_n_qubits: 6,
    motor: { rpm_min: 4516.05, rpm_max: 8178.98, amps_nT: [3600, 1800, 1080, 720], phases: [3.6, 2.94, 4.72, 2.43] },
    fringe_expected: [0.146, 0.691, 0.854],
    c_n_used: 0.90,
    c_n_default: 0.922368,
    c_n_source: 'measured this Run',
    c_n_note: '',
  };
  live.quantum = { ...stubJob, reused };
  return JSON.stringify({ ok: true, ...live.quantum });
});

export const live_step = py(async (_backend, budgetMs = 250) => {
  if (!live) return fail(null, 'RuntimeError', 'No live run in progress: call uav_start first');
  spin(Math.min(Number(budgetMs) || 250, 250));
  live.steps += 1;
  const done = live.steps > STUB_STEPS;
  const w = done ? STUB_WINDOWS : Math.round((STUB_WINDOWS * (live.steps - 1)) / STUB_STEPS);
  return JSON.stringify({
    ok: true,
    stage: live.steps === 1 ? 'sense' : done ? 'done' : 'tercom',
    done,
    windows_done: w,
    windows_total: STUB_WINDOWS,
    samples_done: Math.round((STUB_SAMPLES * w) / STUB_WINDOWS),
    samples_total: STUB_SAMPLES,
  });
});

export const live_result = py(async () => {
  if (!live || live.steps <= STUB_STEPS) return fail('tercom', 'RuntimeError', 'Live run not finished');
  const art = JSON.parse(await loadArtifactText());
  const scenario = art.scenarios.find((s) => s.id === live.scenario);
  const quantumJob = live.quantum;
  live = null;
  return JSON.stringify({
    ok: true,
    kind: 'uav_live',
    scenario,
    motor: { ...art.motor, seed: STUB_SEED_STR, seed_str: STUB_SEED_STR, seed_hex: STUB_SEED_HEX },
    S: art.S,
    model_sha256: art.model_sha256,
    quantum_job: quantumJob,
  });
});

export const live_cancel = py(async () => {
  const cancelled = live !== null;
  live = null;
  return JSON.stringify({ ok: true, cancelled });
});
