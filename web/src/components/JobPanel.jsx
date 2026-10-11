// "This Run's IonQ job" (UI-SPEC A-4): one panel per Qollab Run, not per scenario. Before a job
// it lists the stored motor draw; while the job runs its fields fill in from the uav_quantum
// payload; afterwards it says which scenario the job was flown on. A nested details shows the
// Forte 1 capture record (data/forte_hardware_run.json) read through hardware_json, display only:
// the page never offers the hardware job. Every value is a React text node (no HTML injection).
import Badge from './Badge.jsx';
import { JOB_SHOTS } from '../lib/liveRun.js';

const NOT_RECEIVED = 'not received';
const WAITING = 'waiting for IonQ…';
const HW_NOT_CAPTURED = 'Not captured yet. The single Forte 1 job runs only with the builder\'s explicit approval; '
  + 'until then a forte-1 noise-model run is shown, labelled "simulator-sampled proxy".';

const isNum = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));
const fix = (v, d) => (isNum(v) ? Number(v).toFixed(d) : NOT_RECEIVED);
const hex12 = (s) => (typeof s === 'string' && s ? s.slice(0, 12) : NOT_RECEIVED);

// "{YYYY-MM-DD HH:MM:SS} UTC" from an ISO-8601 timestamp.
export function utcStamp(iso) {
  if (typeof iso !== 'string' || !iso) return NOT_RECEIVED;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}

// The 64-bit seed as binary in groups of 8, from its 16 hex characters.
function seedBinary(hex) {
  if (typeof hex !== 'string' || !/^[0-9a-f]{16}$/.test(hex)) return null;
  const bits = BigInt(`0x${hex}`).toString(2).padStart(64, '0');
  return bits.match(/.{8}/g).join(' ');
}

// Bits are QPU-measured only when the job ran on a QPU; any simulator is simulator-sampled.
export const bitsLabelOf = (q) => (q?.is_qpu === true ? 'QPU-measured' : 'simulator-sampled');

const rpmRange = (lo, hi) => (isNum(lo) && isNum(hi)
  ? `${Math.round(Number(lo))}–${Math.round(Number(hi))} RPM (swept)` : NOT_RECEIVED);
const list = (arr, d) => (Array.isArray(arr) && arr.length ? arr.map((a) => fix(a, d)).join(', ') : NOT_RECEIVED);

function Row({ label, children }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

// Model default contrast for an n-qubit GHZ probe, c_n = c1**n, from the GHZ-4 default.
const defaultFor = (n, c4Default) => (isNum(c4Default) ? Number(c4Default) ** (n / 4) : null);

function Contrast({ n, c, cDefault }) {
  return (
    <span className="dd-inline">
      <span className="mono">
        {isNum(c) ? `${Number(c).toFixed(3)} (model default ${fix(cDefault, 3)})` : NOT_RECEIVED}
      </span>
      <Badge>{`entangled probe n = ${n}`}</Badge>
    </span>
  );
}

function StoredMotor({ motor }) {
  const rpm = Array.isArray(motor?.rpm_knots) ? motor.rpm_knots : [];
  return (
    <dl className="job-dl">
      <Row label="Motor RPM">
        {rpm.length ? rpmRange(Math.min(...rpm), Math.max(...rpm)) : NOT_RECEIVED}
        {' '}
        <Badge>stored motor draw</Badge>
      </Row>
      <Row label="Harmonic amplitudes (nT)"><span className="mono">{list(motor?.amps_nT, 0)}</span></Row>
      <Row label="Harmonic phases (rad)"><span className="mono">{list(motor?.phases, 2)}</span></Row>
      <Row label="Seed">
        <span className="mono selectable">{motor?.seed_str ?? NOT_RECEIVED}</span>
        {' '}
        <span className="help">stored seed, not drawn this Run</span>
      </Row>
    </dl>
  );
}

function HardwareDetails({ hardware }) {
  const rec = hardware?.record ?? null;
  let body;
  if (hardware?.status === 'ok' && rec) {
    const qpu = rec.label === 'QPU-measured';
    const g = rec.ghz_measured ?? {};
    body = (
      <dl className="job-dl">
        <Row label="Label"><Badge>{qpu ? 'hardware · QPU-measured' : 'simulator-sampled proxy'}</Badge></Row>
        <Row label="Job ID"><span className="mono selectable">{rec.job_id ?? NOT_RECEIVED}</span></Row>
        <Row label="Backend"><Badge>{`backend: ${rec.backend ?? NOT_RECEIVED}`}</Badge></Row>
        <Row label="Shots">{isNum(rec.shots) ? `${rec.shots} shots` : NOT_RECEIVED}</Row>
        <Row label="Timestamp">{utcStamp(rec.timestamp_utc)}</Row>
        <Row label="Circuit SHA-256 (first 12 hex)"><span className="mono">{hex12(rec.circuit_sha256)}</span></Row>
        <Row label="GHZ-2 / GHZ-4 contrast">
          <span className="mono">{`${fix(g.c2, 3)} / ${fix(g.c4, 3)}`}</span>
        </Row>
      </dl>
    );
  } else if (hardware?.status === 'missing') {
    body = <p className="help">{HW_NOT_CAPTURED}</p>;
  } else if (hardware?.status === 'error') {
    body = <p className="help">{`Could not read the capture record (${hardware.error}).`}</p>;
  } else {
    body = <p className="help">Loading…</p>;
  }
  return (
    <details className="job-details">
      <summary>Hardware capture (Forte 1)</summary>
      {body}
    </details>
  );
}

export default function JobPanel({
  storedMotor = null, quantum = null, started = false, failed = false, backendName = null,
  isIonq = false, flownLabel = null, hardware = null, circuitSha = null, modelSha = null,
  headingInSummary = false,
}) {
  const q = quantum;
  const pending = started && !q && !failed;
  const missing = pending ? WAITING : NOT_RECEIVED;
  const name = q?.backend ?? backendName;
  const ionq = q ? String(q.backend_class ?? '').startsWith('IonQ') || String(q.backend ?? '').startsWith('ionq') : isIonq;
  const bin = seedBinary(q?.seed_hex);
  const hist = Array.isArray(q?.rng_hist) ? q.rng_hist : null;

  // With headingInSummary the h2#job-panel-h2 lives in the enclosing details summary (App.jsx),
  // so the panel renders as a plain body block and no duplicate heading appears.
  const Wrap = headingInSummary ? 'div' : 'section';
  const wrapProps = headingInSummary
    ? { className: 'job-panel' }
    : { className: 'panel job-panel', 'aria-labelledby': 'job-panel-h2' };

  return (
    <Wrap {...wrapProps}>
      {!headingInSummary && <h2 id="job-panel-h2">This Run&apos;s IonQ job</h2>}

      {!started && (
        <>
          <h3 className="empty-heading">No IonQ job this Run yet</h3>
          <p className="help">
            The values below are the stored motor draw used by both recorded flights. Press Run one IonQ job to draw a
            new motor from quantum random bits.
          </p>
          <StoredMotor motor={storedMotor} />
        </>
      )}

      {started && (
        <>
          <div className="badge-row">
            {q && <Badge>{bitsLabelOf(q)}</Badge>}
            {name && (ionq ? <Badge>{`backend: ${name}`}</Badge> : <Badge>built-in simulator</Badge>)}
            <Badge>{`${q?.shots ?? JOB_SHOTS} shots`}</Badge>
            {q?.timestamp_utc && <Badge>{utcStamp(q.timestamp_utc)}</Badge>}
          </div>
          {flownLabel && <p className="flown-on">{`Flown on: ${flownLabel}`}</p>}
          <dl className="job-dl">
            <Row label="Job ID"><span className="mono selectable">{q?.job_id ?? missing}</span></Row>
            <Row label="Backend">
              <span className="mono">{name ?? NOT_RECEIVED}</span>
            </Row>
            <Row label="Shots">{`${q?.shots ?? JOB_SHOTS} shots`}</Row>
            <Row label="Timestamp">{q ? utcStamp(q.timestamp_utc) : missing}</Row>
            <Row label="RNG bits">
              {hist && bin ? (
                <>
                  <span>{`${q.rng_n_qubits} qubits, ${hist.length}-bin histogram over ${q.counts_sum} shots, hashed to 64 bits:`}</span>
                  <span className="mono selectable bits">{bin}</span>
                </>
              ) : missing}
            </Row>
            <Row label="Seed">
              {q?.seed_hex ? (
                <span className="mono selectable">{`0x${q.seed_hex} (${q.seed_str})`}</span>
              ) : missing}
            </Row>
            <Row label="Motor RPM">{q ? rpmRange(q.motor?.rpm_min, q.motor?.rpm_max) : missing}</Row>
            <Row label="Harmonic amplitudes (nT)"><span className="mono">{q ? list(q.motor?.amps_nT, 0) : missing}</span></Row>
            <Row label="Harmonic phases (rad)"><span className="mono">{q ? list(q.motor?.phases, 2) : missing}</span></Row>
            <Row label="GHZ-2 contrast">
              {q ? <Contrast n={2} c={q.c_hat?.c2} cDefault={defaultFor(2, q.c_n_default)} /> : missing}
            </Row>
            <Row label="GHZ-4 contrast">
              {q ? <Contrast n={4} c={q.c_hat?.c4} cDefault={q.c_n_default} /> : missing}
            </Row>
            <Row label="Contrast used by the emulator">
              {q ? (
                <span className="dd-inline">
                  <span className="mono">{fix(q.c_n_used, 3)}</span>
                  <Badge>{q.c_n_source === 'measured this Run' ? 'measured this Run' : 'default model, not measured'}</Badge>
                  {q.c_n_note ? <span className="help">{q.c_n_note}</span> : null}
                </span>
              ) : missing}
            </Row>
          </dl>
        </>
      )}

      <HardwareDetails hardware={hardware} />

      <details className="job-details">
        <summary>Provenance</summary>
        <dl className="job-dl">
          <Row label="Circuit SHA-256 (first 12 hex)"><span className="mono">{hex12(q?.circuit_sha256 ?? circuitSha)}</span></Row>
          <Row label="Model SHA-256 (first 12 hex)"><span className="mono">{hex12(modelSha)}</span></Row>
        </dl>
      </details>
    </Wrap>
  );
}
