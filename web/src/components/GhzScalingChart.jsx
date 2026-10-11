// Chart d: GHZ scaling at equal qubit-shots, log-log signal RMSE (nT) against probe size n in
// {1, 2, 4}. SQL and HL reference lines; unentangled, GHZ ideal-contrast and GHZ measured-contrast
// points (measured only once this Run's job returned contrasts). Every value comes from the
// magnav.api ghz_scaling_json payload, computed in Pyodide from the frozen model (D-C).
import { memo, useId, useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Badge from './Badge.jsx';
import { contrastUsed, hasMeasured, rowsFromPayload } from '../lib/ghzScaling.js';
import { SERIES } from '../theme.js';
import {
  AXIS_LABEL, GRID, MARGIN, Marker, Swatch, TICK, TOOLTIP_STYLE, Y_AXIS_WIDTH, endLabel,
} from './chartParts.jsx';

export const GHZ_MISSING = 'GHZ scaling data is not in this artifact yet.';
const SQL_COLOR = 'var(--color-text-muted)';
const HL_COLOR = 'var(--color-text)';
const Q1 = SERIES.quantum_q1.color;
const GHZ = SERIES.quantum_ghz4.color;
const NICE = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];

// Point series: {key, label, shape, colour, filled}. Lines: SQL and HL.
const POINTS = [
  { key: 'unentangled', label: 'Unentangled, n qubits', shape: 'square', color: Q1, filled: true },
  { key: 'ghzIdeal', label: 'GHZ, ideal contrast', shape: 'circle', color: GHZ, filled: false },
  { key: 'ghzMeasured', label: 'GHZ, measured contrast', shape: 'diamond', color: GHZ, filled: true },
];

const fmtNT = (v) => (Number.isFinite(v) ? v.toFixed(3) : 'n/a');
export const fmtC = (c) => (Number.isFinite(c) ? c.toFixed(3) : 'n/a');

function pointDot(p) {
  return function Dot(props) {
    return <Marker key={props.index} shape={p.shape} cx={props.cx} cy={props.cy} color={p.color} filled={p.filled} />;
  };
}

function yDomain(rows) {
  const vals = rows.flatMap((r) => [r.sql, r.hl, r.unentangled, r.ghzIdeal, r.ghzMeasured]).filter((v) => v > 0);
  const lo = Math.min(...vals) / 1.4;
  const hi = Math.max(...vals) * 1.4;
  return [lo, hi];
}

const GhzPlot = memo(function GhzPlot({ rows, measured }) {
  const domain = useMemo(() => yDomain(rows), [rows]);
  const ticks = NICE.filter((v) => v >= domain[0] && v <= domain[1]);
  const last = rows.length - 1;
  const points = POINTS.filter((p) => p.key !== 'ghzMeasured' || measured);
  return (
    <div
      className="chart-box"
      role="img"
      aria-label="Signal error versus probe size for 1, 2 and 4 qubits against the standard quantum limit and Heisenberg limit lines. Table below."
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={rows} accessibilityLayer={false} margin={{ ...MARGIN, right: 24 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="2 4" />
          <XAxis
            dataKey="n"
            type="number"
            scale="log"
            domain={[0.85, 4.7]}
            allowDataOverflow
            ticks={[1, 2, 4]}
            tick={TICK}
            stroke={GRID}
            label={{ value: 'Probe qubits n', position: 'insideBottomRight', offset: -4, ...AXIS_LABEL }}
            height={36}
          />
          <YAxis
            width={Y_AXIS_WIDTH}
            type="number"
            scale="log"
            domain={domain}
            allowDataOverflow
            ticks={ticks}
            tick={TICK}
            stroke={GRID}
            tickFormatter={(v) => String(v)}
            label={{ value: 'Signal RMSE (nT)', angle: -90, position: 'insideLeft', offset: 12, ...AXIS_LABEL }}
          />
          <Tooltip
            isAnimationActive={false}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: 'var(--color-text)' }}
            labelFormatter={(n) => `n = ${n}`}
            formatter={(v, name) => [`${fmtNT(v)} nT`, name]}
          />
          <Line
            dataKey="sql"
            name="SQL 1/√(n·S)"
            stroke={SQL_COLOR}
            strokeDasharray="6 4"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            label={endLabel('SQL', SQL_COLOR, last, -6)}
          />
          <Line
            dataKey="hl"
            name="HL 1/(n·√S)"
            stroke={HL_COLOR}
            strokeDasharray="2 3"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            label={endLabel('HL', HL_COLOR, last, 16)}
          />
          {points.map((p) => (
            <Line
              key={p.key}
              dataKey={p.key}
              name={p.label}
              stroke="none"
              dot={pointDot(p)}
              activeDot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

function GhzScalingChart({ payload, status, measuredSource }) {
  const titleId = useId();
  const rows = useMemo(() => rowsFromPayload(payload), [payload]);
  const S = payload?.ok === true ? payload.S : null;
  const measured = rows.length > 0 && hasMeasured(payload);
  const c2 = rows.length ? contrastUsed(payload, 2) : null;
  const c4 = rows.length ? contrastUsed(payload, 4) : null;
  const source = measured ? (measuredSource ?? 'measured this Run') : 'default model, not measured';
  const title = S ? `GHZ scaling at S = ${S} shots` : 'GHZ scaling';
  let body;
  if (rows.length) body = <GhzPlot rows={rows} measured={measured} />;
  else if (status === 'loading') body = <p className="help chart-empty">Computing GHZ scaling in-page…</p>;
  else body = <p className="help chart-empty">{GHZ_MISSING}</p>;
  return (
    <figure className="chart-figure" role="group" aria-labelledby={titleId}>
      <h3 id={titleId} className="chart-title">{title}</h3>
      <ul className="chart-legend">
        <li className="legend-item"><Swatch color={SQL_COLOR} dash="6 4" />SQL 1/√(n·S)</li>
        <li className="legend-item"><Swatch color={HL_COLOR} dash="2 3" />HL 1/(n·√S)</li>
        {POINTS.filter((p) => p.key !== 'ghzMeasured' || measured).map((p) => (
          <li key={p.key} className="legend-item">
            <Swatch color={p.color} line={false} shape={p.shape} filled={p.filled} />
            {p.label}
          </li>
        ))}
      </ul>
      {body}
      {rows.length > 0 && (
        <figcaption className="chart-caption">
          <span>
            {`Signal RMSE vs probe size n at equal qubit-shots. Gate error erodes the Heisenberg gain: measured contrast GHZ-2 ${fmtC(c2)}, GHZ-4 ${fmtC(c4)}.`}
          </span>
          <span className="badge-row">
            <Badge>entangled probe n = 2</Badge>
            <Badge>entangled probe n = 4</Badge>
            <Badge>{source}</Badge>
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export default memo(GhzScalingChart);
