import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SYNTH_LABEL, validateUavArtifact, validateLivePayload, scenarioById, uavView, comparisonView,
  errorAt, drErrorAt,
} from './artifactV2.js';

const text = readFileSync(new URL('../../../data/precomputed_uav.json', import.meta.url), 'utf8');
const fresh = () => JSON.parse(text);
const art = fresh();

test('the shipped artifact validates', () => {
  assert.deepEqual(validateUavArtifact(art), []);
});

test('a synthetic scenario with a changed map_label is rejected, naming SYNTH_LABEL', () => {
  const a = fresh();
  a.scenarios[0].map_label = 'some other label';
  const errs = validateUavArtifact(a);
  assert.ok(errs.some((e) => e.includes(SYNTH_LABEL)), errs.join('\n'));
});

test('a survey scenario carrying the synthetic label is rejected', () => {
  const a = fresh();
  a.scenarios[1].map_caption += ` ${SYNTH_LABEL}`;
  assert.ok(validateUavArtifact(a).some((e) => e.includes('non-synthetic')));
});

test('schema_version 1 and a missing estimator are rejected', () => {
  const a = fresh();
  a.schema_version = 1;
  assert.ok(validateUavArtifact(a).some((e) => e.includes('schema_version')));
  const b = fresh();
  delete b.scenarios[1].line.estimates.quantum_q1;
  assert.ok(validateUavArtifact(b).length > 0);
});

test('motor.seed_str must be a digit string', () => {
  const a = fresh();
  a.motor.seed_str = 12;
  assert.ok(validateUavArtifact(a).some((e) => e.includes('seed_str')));
});

test('scenarioById finds both scenarios and returns null for unknown ids', () => {
  assert.equal(scenarioById(art, 'eastern_400m').id, 'eastern_400m');
  assert.equal(scenarioById(art, 'synthetic_100m').id, 'synthetic_100m');
  assert.equal(scenarioById(art, 'nope'), null);
});

test('uavView: index space, jam and metric start display indices', () => {
  for (const s of art.scenarios) {
    const v = uavView(s);
    assert.equal(v.n, 901);
    assert.equal(v.jamDisplayIndex, 225);
    const msT = (s.line.metric_start_index * s.line.jam.t) / s.line.jam.index;
    assert.equal(msT, 285);
    const want = s.line.t.findIndex((t) => t >= msT);
    assert.equal(v.metricStartDisplayIndex, want);
    assert.equal(v.mapLabel, s.map_label);
    assert.equal(v.mapCaption, s.map_caption);
    assert.ok(v.domain[0] < 0 && v.domain[1] > 0);
    assert.equal(uavView(s).domain, v.domain, 'percentile range is cached per preview');
    for (const k of ['baseline_ls', 'baseline_mean', 'quantum_q1', 'quantum_ghz4']) {
      assert.equal(v.est[k].x.length, 901);
    }
    const i = v.n - 1;
    assert.ok(Number.isFinite(errorAt(v, 'quantum_ghz4', i)));
    assert.ok(Number.isFinite(drErrorAt(v, i)));
    assert.equal(errorAt(v, 'missing', i), null);
  }
  assert.equal(uavView(art.scenarios[0]).mapLabel, SYNTH_LABEL);
});

test('comparisonView pivots comparison.rows: 5 groups, 2 columns, values from data', () => {
  const cv = comparisonView(art);
  assert.deepEqual(cv.groups.map((g) => g.estimator),
    ['dead_reckoning', 'baseline_ls', 'baseline_mean', 'quantum_q1', 'quantum_ghz4']);
  assert.deepEqual(cv.columns.map((c) => c.id), ['synthetic_100m', 'eastern_400m']);
  assert.equal(cv.columns[0].mapLabel, SYNTH_LABEL);
  for (const g of cv.groups) for (const r of g.rows) assert.equal(r.cells.length, 2);
  const dr = cv.groups[0];
  assert.deepEqual(dr.rows.map((r) => r.key), ['cep50_m', 'cep95_m', 'pct_under_556']);
  const cep = cv.groups[1].rows.find((r) => r.key === 'cep50_m');
  const rowVal = (sid) => art.comparison.rows.find((r) => r.scenario === sid && r.estimator === 'baseline_ls').cep50_m;
  assert.equal(cep.cells[0].value, rowVal('synthetic_100m'));
  assert.equal(cep.cells[1].value, rowVal('eastern_400m'));
  // replay seeded from the QPU-measured job since plan 03-01 (D-08)
  assert.equal(cep.cells[0].value, 149.3);
  assert.equal(cep.cells[1].value, 182.2);
  assert.ok(cv.groups[1].rows.some((r) => r.label === `Under ${art.thresholds_m[0]} m (%)`));
  assert.equal(cv.statement, art.comparison.statement);
  assert.equal(cv.verdict, art.comparison.verdict);
  assert.equal(cv.rule, art.comparison.rule);
  assert.equal(comparisonView({ scenarios: [] }), null);
});

function livePayload() {
  const a = fresh();
  return {
    kind: 'uav_live',
    scenario: a.scenarios[0],
    motor: { ...a.motor, seed_hex: '0123456789abcdef', seed_str: '81985529216486895' },
    S: a.S,
    model_sha256: a.model_sha256,
    quantum_job: {
      job_id: 'job-1', bits_label: 'simulator-sampled', c_n_source: 'measured this Run',
      seed_hex: '0123456789abcdef',
    },
  };
}

test('validateLivePayload accepts a well-formed payload (quantum_job may be null)', () => {
  assert.deepEqual(validateLivePayload(livePayload()), []);
  const p = livePayload();
  p.quantum_job = null;
  assert.deepEqual(validateLivePayload(p), []);
});

test('validateLivePayload rejects a wrong kind, a missing synthetic label and bad provenance', () => {
  const p = livePayload();
  p.kind = 'uav_run';
  assert.ok(validateLivePayload(p).some((e) => e.includes('kind')));
  const q = livePayload();
  q.scenario.map_label = 'not the label';
  assert.ok(validateLivePayload(q).some((e) => e.includes(SYNTH_LABEL)));
  const r = livePayload();
  r.quantum_job.bits_label = 'quantum';
  assert.ok(validateLivePayload(r).some((e) => e.includes('bits_label')));
  const s = livePayload();
  s.motor.seed_hex = 'XYZ';
  assert.ok(validateLivePayload(s).some((e) => e.includes('seed_hex')));
});

test('validateLivePayload rejects a motor not drawn from this job and disagreeing seed forms', () => {
  // the job's RNG seed must be the seed the flight's motor was drawn from
  const p = livePayload();
  p.quantum_job.seed_hex = 'fedcba9876543210';
  assert.ok(validateLivePayload(p).some((e) => e === 'quantum_job.seed_hex differs from motor.seed_hex'));
  const q = livePayload();
  delete q.quantum_job.seed_hex;
  assert.ok(validateLivePayload(q).some((e) => e.includes('quantum_job.seed_hex differs')));
  // seed_hex and seed_str are two spellings of one integer
  const r = livePayload();
  r.motor.seed_str = '81985529216486896';
  assert.ok(validateLivePayload(r).some((e) => e === 'motor.seed_hex and motor.seed_str differ'));
  // with no job the motor is the shipped one and no cross-check applies
  const s = livePayload();
  s.quantum_job = null;
  assert.deepEqual(validateLivePayload(s), []);
});
