// RunArtifact v2 (UAV, two map scenarios) validation and view models. Pure ESM (no JSX, no DOM)
// so node --test can import it. Mirrors magnav/artifact.py validate_uav_artifact and
// validate_live_payload. Every label, caption and number comes from the artifact; nothing
// scenario-specific is typed here except the synthetic-map label, which is a rule.

import { percentileDomain } from './colormap.js';

export const SYNTH_LABEL = 'synthetic map (sensitivity study), not survey data';

export const SCHEMA_VERSION = 2;
export const KIND = 'uav_run';
export const LIVE_KIND = 'uav_live';
export const ESTIMATORS = ['baseline_ls', 'baseline_mean', 'quantum_q1', 'quantum_ghz4'];
export const QUANTUM_KEYS = ['quantum_q1', 'quantum_ghz4'];
export const SCENARIO_ORDER = ['synthetic_100m', 'eastern_400m'];
export const BITS_LABELS = ['QPU-measured', 'simulator-sampled'];
export const CN_SOURCES = ['measured this Run', 'default model, not measured'];

const REQUIRED_TOP = [
  'schema_version', 'kind', 'title', 'thresholds_m', 'estimators', 'default_estimator', 'S',
  'model_sha256', 'motor', 'default_scenario', 'scenarios', 'comparison',
];
const REQUIRED_SCENARIO = [
  'id', 'label', 'map_label', 'map_caption', 'synthetic', 'alt_m', 'model_file', 'model_sha256',
  'map', 'notes', 'provenance', 'line',
];
const REQUIRED_LINE = [
  'line', 'map_file', 'frame', 'map_preview', 'jam', 'metric_start_index', 't', 'truth',
  'dead_reckoning', 'estimates', 'metrics', 'sensor',
];
const MOTOR_KEYS = ['t_knots', 'rpm_knots', 'amps_nT', 'phases', 'A1_nT'];

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const len = (v) => (Array.isArray(v) ? v.length : -1);
const isHex64 = (s) => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);
const isDigits = (s) => typeof s === 'string' && /^[0-9]+$/.test(s);

// Per-line checks (index space, series lengths, estimators, preview grid).
export function validateLine(L, prefix = 'line') {
  if (!isObj(L)) return [`${prefix} is not an object`];
  const miss = REQUIRED_LINE.filter((k) => !(k in L));
  if (miss.length) return [`${prefix}: missing ${miss.join(', ')}`];
  const errs = [];
  const n = len(L.t);
  if (n < 2) return [`${prefix}: t must have at least 2 points`];
  const want = (arr, name) => {
    if (len(arr) !== n) errs.push(`${prefix}: ${name} has ${len(arr)} points, t has ${n}`);
  };
  want(L.truth?.x, 'truth.x');
  want(L.truth?.y, 'truth.y');
  want(L.truth?.anomaly_nT, 'truth.anomaly_nT');
  want(L.dead_reckoning?.x, 'dead_reckoning.x');
  want(L.dead_reckoning?.y, 'dead_reckoning.y');
  const di = L.jam?.display_index;
  if (!Number.isInteger(di) || di < 0 || di >= n) errs.push(`${prefix}: jam.display_index ${di} out of range`);
  if (!(Number(L.jam?.index) > 0) || !Number.isFinite(Number(L.jam?.t))) {
    errs.push(`${prefix}: jam.index / jam.t invalid`);
  }
  const p = L.map_preview;
  if (!isObj(p) || len(p.nT) !== p.nx * p.ny || len(p.valid) !== p.nx * p.ny || p.nx < 2 || p.ny < 2) {
    errs.push(`${prefix}: map_preview grid does not match nx * ny`);
  }
  const est = isObj(L.estimates) ? L.estimates : {};
  const keys = Object.keys(est).sort();
  if (keys.join(',') !== [...ESTIMATORS].sort().join(',')) {
    errs.push(`${prefix}: estimates keys ${keys.join(',')} != ${ESTIMATORS.join(',')}`);
  }
  for (const k of ESTIMATORS) {
    const e = est[k];
    if (!isObj(e)) continue;
    want(e.x, `estimates.${k}.x`);
    want(e.y, `estimates.${k}.y`);
    want(e.signal_nT, `estimates.${k}.signal_nT`);
    const w = len(e.window_t);
    if (w < 0 || len(e.ncc) !== w || len(e.accepted) !== w) {
      errs.push(`${prefix}: ${k} window_t/ncc/accepted lengths disagree`);
    }
  }
  if (!isObj(L.metrics?.dead_reckoning)) errs.push(`${prefix}: metrics.dead_reckoning missing`);
  for (const k of ESTIMATORS) if (!isObj(L.metrics?.[k])) errs.push(`${prefix}: metrics.${k} missing`);
  return errs;
}

// The synthetic-label rule, both ways: a synthetic scenario carries SYNTH_LABEL as its map
// label and inside its caption; a survey scenario never carries it.
function validateScenarioLabels(s, sid) {
  const errs = [];
  for (const k of ['label', 'map_label', 'map_caption']) {
    if (typeof s[k] !== 'string' || !s[k]) errs.push(`scenario ${sid}: ${k} is not a non-empty string`);
  }
  if (s.synthetic === true) {
    if (s.map_label !== SYNTH_LABEL) errs.push(`scenario ${sid}: synthetic map_label != '${SYNTH_LABEL}'`);
    if (!String(s.map_caption).includes(SYNTH_LABEL)) {
      errs.push(`scenario ${sid}: synthetic map_caption lacks '${SYNTH_LABEL}'`);
    }
  } else if (String(s.map_label).includes(SYNTH_LABEL) || String(s.map_caption).includes(SYNTH_LABEL)) {
    errs.push(`scenario ${sid}: non-synthetic scenario carries the synthetic label`);
  }
  return errs;
}

function validateScenario(s) {
  if (!isObj(s)) return ['scenario entry is not an object'];
  const sid = s.id;
  const miss = REQUIRED_SCENARIO.filter((k) => !(k in s));
  if (miss.length) return [`scenario ${sid}: missing ${miss.join(', ')}`];
  const errs = validateScenarioLabels(s, sid);
  if (!Array.isArray(s.notes)) errs.push(`scenario ${sid}: notes is not a list`);
  errs.push(...validateLine(s.line, `scenario ${sid} line`));
  return errs;
}

export function validateUavArtifact(a) {
  if (!isObj(a)) return ['artifact is not an object'];
  const errs = [];
  if (a.schema_version !== SCHEMA_VERSION) errs.push(`schema_version ${a.schema_version} != ${SCHEMA_VERSION}`);
  if (a.kind !== KIND) errs.push(`kind ${a.kind} != ${KIND}`);
  for (const k of REQUIRED_TOP) if (!(k in a)) errs.push(`missing top-level key ${k}`);
  if (JSON.stringify(a.estimators) !== JSON.stringify(ESTIMATORS)) errs.push('estimators list differs');
  if (!ESTIMATORS.includes(a.default_estimator)) errs.push('default_estimator not in estimators');
  if (!isHex64(a.model_sha256)) errs.push('model_sha256 is not 64 hex characters');
  const mot = isObj(a.motor) ? a.motor : {};
  for (const k of MOTOR_KEYS) if (!(k in mot)) errs.push(`motor missing ${k}`);
  // JS numbers lose precision above 2^53: the page reads the seed only as a string.
  if (!isDigits(mot.seed_str)) errs.push('motor.seed_str is not a digit string');
  const scen = Array.isArray(a.scenarios) ? a.scenarios : [];
  if (!Array.isArray(a.scenarios)) errs.push('scenarios is not a list');
  const ids = scen.map((s) => (isObj(s) ? s.id : null));
  if (JSON.stringify(ids) !== JSON.stringify(SCENARIO_ORDER)) {
    errs.push(`scenario ids ${ids.join(',')} != ${SCENARIO_ORDER.join(',')}`);
  }
  if (!ids.includes(a.default_scenario)) errs.push(`default_scenario ${a.default_scenario} not among scenario ids`);
  for (const s of scen) errs.push(...validateScenario(s));
  const comp = a.comparison;
  if (!isObj(comp)) {
    errs.push('comparison missing');
  } else {
    if (!Array.isArray(comp.rows)) errs.push('comparison.rows is not a list');
    if (typeof comp.statement !== 'string') errs.push('comparison.statement is not a string');
    if (typeof comp.rule !== 'string') errs.push('comparison.rule is not a string');
    // The verdict word is the Python validator's business; the page renders it verbatim.
    if (typeof comp.verdict !== 'string' || !comp.verdict) errs.push('comparison.verdict is not a string');
  }
  return errs;
}

// Mirrors magnav/artifact.py validate_live_payload (plan 02-02).
export function validateLivePayload(p) {
  if (!isObj(p)) return ['live payload is not an object'];
  const errs = [];
  if (p.kind !== LIVE_KIND) errs.push(`kind ${p.kind} != ${LIVE_KIND}`);
  const s = p.scenario;
  if (!isObj(s)) {
    errs.push('scenario is not an object');
  } else {
    if (!SCENARIO_ORDER.includes(s.id)) errs.push(`scenario id ${s.id} unknown`);
    errs.push(...validateScenarioLabels(s, s.id));
    errs.push(...validateLine(s.line, `scenario ${s.id} line`));
  }
  const mot = isObj(p.motor) ? p.motor : {};
  for (const k of MOTOR_KEYS) if (!(k in mot)) errs.push(`motor missing ${k}`);
  if (!isDigits(mot.seed_str)) errs.push('motor.seed_str is not a digit string');
  const hexOk = typeof mot.seed_hex === 'string' && /^[0-9a-f]{16}$/.test(mot.seed_hex);
  if (!hexOk) {
    errs.push('motor.seed_hex is not 16 lowercase hex characters');
  } else if (isDigits(mot.seed_str) && BigInt(`0x${mot.seed_hex}`).toString() !== mot.seed_str) {
    errs.push('motor.seed_hex and motor.seed_str differ');
  }
  if (!Number.isInteger(p.S) || p.S <= 0) errs.push('S is not a positive integer');
  if (!isHex64(p.model_sha256)) errs.push('model_sha256 is not 64 hex characters');
  const q = p.quantum_job;
  if (q !== null && q !== undefined) {
    if (!isObj(q)) {
      errs.push('quantum_job is not an object');
    } else {
      if (!q.job_id) errs.push('quantum_job.job_id missing');
      if (!BITS_LABELS.includes(q.bits_label)) errs.push(`quantum_job.bits_label ${q.bits_label} invalid`);
      if (!CN_SOURCES.includes(q.c_n_source)) errs.push(`quantum_job.c_n_source ${q.c_n_source} invalid`);
      // The "motor drawn by this Run's job" badge is only true if the flight's motor came from
      // this job's RNG bits (same rule as the Python validator).
      if (q.seed_hex !== mot.seed_hex) errs.push('quantum_job.seed_hex differs from motor.seed_hex');
    }
  } else if (q === undefined) {
    errs.push('quantum_job missing (null allowed)');
  }
  return errs;
}

export function scenarioById(art, id) {
  return (art?.scenarios ?? []).find((s) => s.id === id) ?? null;
}

// metric_start_index and jam.index are RAW-sample indices; convert through time.
export function metricStartT(line) {
  return (line.metric_start_index * line.jam.t) / line.jam.index;
}

export function firstIndexAtOrAfter(t, time) {
  let lo = 0;
  let hi = t.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (t[mid] < time - 1e-9) lo = mid + 1;
    else hi = mid;
  }
  return Math.min(lo, t.length - 1);
}

// Percentile range per preview object, computed once (a WeakMap keeps it off the data).
const domainCache = new WeakMap();
export function previewDomain(preview) {
  let d = domainCache.get(preview);
  if (!d) {
    d = percentileDomain(preview.nT, preview.valid);
    domainCache.set(preview, d);
  }
  return d;
}

// One view model per scenario, shared by the recorded replay and a live result.
export function uavView(scenario) {
  const line = scenario.line;
  const t = line.t;
  const msT = metricStartT(line);
  const est = {};
  for (const k of ESTIMATORS) {
    const e = line.estimates[k];
    est[k] = { x: e.x, y: e.y, signal: e.signal_nT, windowT: e.window_t, ncc: e.ncc, accepted: e.accepted };
  }
  const p = line.map_preview;
  return {
    id: scenario.id,
    label: scenario.label,
    mapLabel: scenario.map_label,
    mapCaption: scenario.map_caption,
    synthetic: scenario.synthetic === true,
    notes: scenario.notes ?? [],
    mapSha: scenario.map?.sha256 ?? '',
    t,
    n: t.length,
    tEnd: t[t.length - 1],
    jamIdx: line.jam.display_index,
    jamDisplayIndex: line.jam.display_index,
    jamT: line.jam.t,
    metricStartT: msT,
    metricStartIdx: firstIndexAtOrAfter(t, msT),
    metricStartDisplayIndex: firstIndexAtOrAfter(t, msT),
    truth: { x: line.truth.x, y: line.truth.y, anomaly: line.truth.anomaly_nT },
    dr: { x: line.dead_reckoning.x, y: line.dead_reckoning.y },
    est,
    metrics: line.metrics,
    sensor: line.sensor,
    preview: p,
    domain: previewDomain(p),
    extentKm: { w: (p.x_max - p.x_min) / 1000, h: (p.y_max - p.y_min) / 1000 },
    hasInvalid: p.valid.some((v) => !v),
    frame: line.frame,
  };
}

// Euclidean position errors in metres at display index i (null if the series is absent).
export function errorAt(view, key, i) {
  const e = view.est[key];
  if (!e) return null;
  return Math.hypot(e.x[i] - view.truth.x[i], e.y[i] - view.truth.y[i]);
}

export function drErrorAt(view, i) {
  return Math.hypot(view.dr.x[i] - view.truth.x[i], view.dr.y[i] - view.truth.y[i]);
}
