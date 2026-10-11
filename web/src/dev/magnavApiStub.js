// Local stand-in for the Pyodide 'magnav.api' module (vite dev only, never bundled).
// Every function returns a JSON STRING, exactly like Python, so dev exercises JSON.parse and the
// same ok / error_type contract as magnav/api.py (plan 02-02). This plan stubs backend_info,
// artifact_json, circuit_json, hardware_json and ghz_scaling_json; the live calls arrive with
// the live run (plan 02-06).
const py = (impl) => ({ callPromising: async (...args) => impl(...args) });

export const backend_info = py(async () => JSON.stringify({
  ok: true,
  name: 'dev-stub',
  class: 'DevStub',
  num_qubits: 16,
  noise_model: null,
  is_ionq: false,
  python: 'n/a (vite dev stub)',
  platform: 'browser-dev',
  qiskit: 'n/a',
  numpy: 'n/a',
  scipy: 'n/a',
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

export const hardware_json = py(async () => JSON.stringify({
  ok: false,
  error_type: 'NotCaptured',
  error: 'data/forte_hardware_run.json is not present (dev stub)',
}));

// A fixed, plausible payload with the 02-02 contract keys (dev only; numbers are not results).
export const ghz_scaling_json = py(async (_backend, c1 = null, c2 = null, c4 = null) => {
  const measured = c2 !== null && c4 !== null;
  return JSON.stringify({
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
    ghz_measured_nT: measured ? [2.86, 1.52, 0.81] : null,
    c_ideal: { 1: 1.0, 2: 1.0, 4: 1.0 },
    c_measured: measured ? { 1: c1 ?? 1.0, 2: c2, 4: c4 } : null,
  });
});
