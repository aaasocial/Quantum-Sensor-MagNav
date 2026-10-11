// CEP table for the selected scenario (recorded flight, or this Run's live result when shown).
// Numbers come only from line.metrics; the UI never recomputes them.
import { memo } from 'react';
import { fmtInt } from '../lib/format.js';
import { SERIES, TABLE_ORDER } from '../theme.js';

const num1 = (v) => (typeof v === 'number' && Number.isFinite(v)
  ? v.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
  : 'n/a');

const windowsText = (m) => (Number.isInteger(m?.accepted) && Number.isInteger(m?.windows)
  ? `${m.accepted} of ${m.windows}`
  : 'n/a');

function MetricsTable({ view, quantumKey, thresholds, isLive }) {
  if (!view) return null;
  const thr = Array.isArray(thresholds) && thresholds.length ? thresholds[0] : null;
  const pctKey = thr === null ? null : `pct_under_${thr}`;
  const source = isLive ? 'this Run' : 'recorded flight';
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption>{`Position error after GPS loss (from t = ${fmtInt(view.metricStartT)} s): ${view.label}, ${source}`}</caption>
        <thead>
          <tr>
            <th scope="col">Track</th>
            <th scope="col">CEP50 (m)</th>
            <th scope="col">CEP95 (m)</th>
            <th scope="col">{`Under ${thr ?? 'n/a'} m (%)`}</th>
            <th scope="col">Signal RMSE (nT)</th>
            <th scope="col">Windows accepted</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ORDER.map((k) => {
            const m = view.metrics?.[k];
            const dr = k === 'dead_reckoning';
            const current = k === quantumKey;
            const label = SERIES[k]?.label ?? k;
            return (
              <tr key={k} className={current ? 'row-current' : undefined}>
                <th scope="row">{current ? `${label} (on map)` : label}</th>
                <td>{num1(m?.cep50_m)}</td>
                <td>{num1(m?.cep95_m)}</td>
                <td>{pctKey ? num1(m?.[pctKey]) : 'n/a'}</td>
                <td>{dr ? 'n/a' : num1(m?.signal_rmse_nT)}</td>
                <td>{dr ? 'n/a' : windowsText(m)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default memo(MetricsTable);
