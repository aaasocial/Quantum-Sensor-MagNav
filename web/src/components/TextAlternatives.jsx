// Table alternatives for the map, the sensor charts and the GHZ figure (UI-SPEC "Text
// alternatives"): rows every 60 s of flight time plus the jam row, in closed native <details>.
import { memo, useMemo } from 'react';
import { drErrorAt, errorAt } from '../lib/artifactV2.js';
import { fmtInt } from '../lib/format.js';
import { contrastUsed, rowsFromPayload } from '../lib/ghzScaling.js';
import { rmseValue, sampleIndices } from '../lib/signal.js';

const nT = (v) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(1) : 'n/a');
const nT3 = (v) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(3) : 'n/a');
const c3 = (v) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(3) : 'n/a');
const ms = (v) => (Number.isFinite(Number(v)) ? Number(v).toFixed(2) : 'n/a');

function TimeCell({ view, i }) {
  const t = Number(view.t[i]).toFixed(1);
  return <th scope="row">{i === view.jamIdx ? `${t} (GPS jammed)` : t}</th>;
}

const EST = [
  ['baseline_ls', 'Baseline'],
  ['quantum_q1', 'Single-qubit'],
  ['quantum_ghz4', 'GHZ-4'],
];

function TextAlternatives({ view, ghz }) {
  const idx = useMemo(() => (view ? sampleIndices(view, 60) : []), [view]);
  const ghzRows = useMemo(() => rowsFromPayload(ghz), [ghz]);
  return (
    <div className="text-alternatives">
      {view && (
        <details>
          <summary>{`Map track data, ${view.label} (every 60 s)`}</summary>
          <div className="table-scroll">
            <table className="data-table">
              <caption>{`True position and position errors: ${view.mapLabel}`}</caption>
              <thead>
                <tr>
                  <th scope="col">t (s)</th>
                  <th scope="col">True x (m)</th>
                  <th scope="col">True y (m)</th>
                  {EST.map(([k, l]) => <th key={k} scope="col">{`${l} error (m)`}</th>)}
                  <th scope="col">Dead reckoning error (m)</th>
                </tr>
              </thead>
              <tbody>
                {idx.map((i) => (
                  <tr key={i}>
                    <TimeCell view={view} i={i} />
                    <td>{fmtInt(view.truth.x[i])}</td>
                    <td>{fmtInt(view.truth.y[i])}</td>
                    {EST.map(([k]) => <td key={k}>{fmtInt(errorAt(view, k, i))}</td>)}
                    <td>{fmtInt(drErrorAt(view, i))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {view && (
        <details>
          <summary>{`Sensor data, ${view.label} (every 60 s)`}</summary>
          <div className="table-scroll">
            <table className="data-table">
              <caption>{`Sensed magnetic field in nanotesla and sensor timing: ${view.mapLabel}`}</caption>
              <thead>
                <tr>
                  <th scope="col">t (s)</th>
                  <th scope="col">Truth (nT)</th>
                  {EST.map(([k, l]) => <th key={k} scope="col">{`${l} (nT)`}</th>)}
                  <th scope="col">RPM</th>
                  <th scope="col">τ (ms)</th>
                </tr>
              </thead>
              <tbody>
                {idx.map((i) => (
                  <tr key={i}>
                    <TimeCell view={view} i={i} />
                    <td>{nT(view.truth.anomaly[i])}</td>
                    {EST.map(([k]) => <td key={k}>{nT(view.est[k]?.signal[i])}</td>)}
                    <td>{fmtInt(view.sensor?.rpm?.[i])}</td>
                    <td>{ms(view.sensor?.tau_ms?.[i])}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">RMSE after GPS loss</th>
                  <td>reference</td>
                  {EST.map(([k]) => <td key={k}>{nT(rmseValue(view, k))}</td>)}
                  <td />
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </details>
      )}
      <details>
        <summary>GHZ scaling data</summary>
        {ghzRows.length === 0 ? (
          <p className="help">GHZ scaling data is not in this artifact yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <caption>{`Signal RMSE (nT) at S = ${ghz.S} shots per probe qubit`}</caption>
              <thead>
                <tr>
                  <th scope="col">n</th>
                  <th scope="col">SQL (nT)</th>
                  <th scope="col">HL (nT)</th>
                  <th scope="col">Unentangled (nT)</th>
                  <th scope="col">GHZ ideal (nT)</th>
                  <th scope="col">GHZ measured (nT)</th>
                  <th scope="col">Contrast used</th>
                </tr>
              </thead>
              <tbody>
                {ghzRows.map((r) => (
                  <tr key={r.n}>
                    <th scope="row">{r.n}</th>
                    <td>{nT3(r.sql)}</td>
                    <td>{nT3(r.hl)}</td>
                    <td>{nT3(r.unentangled)}</td>
                    <td>{nT3(r.ghzIdeal)}</td>
                    <td>{r.ghzMeasured === null ? 'not measured' : nT3(r.ghzMeasured)}</td>
                    <td>{c3(contrastUsed(ghz, r.n))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </div>
  );
}

export default memo(TextAlternatives);
