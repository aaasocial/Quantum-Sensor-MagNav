// Chart c: the Ramsey filter function |sinc(f tau)| in dB at the playhead sample, using that
// sample's sensor.tau_ms and sensor.rpm. The motor harmonics k * rpm / 60 are marked and land on
// the nulls k / tau. The chart redraws only when the playhead index changes, and its curve only
// when (tau, rpm) change; under reduced motion the playback store already steps the index.
import { memo, useId, useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { usePlaybackIndex } from '../hooks/usePlayback.js';
import { curve, harmonics, nulls } from '../lib/filterFunction.js';
import { MOTOR } from '../theme.js';
import { AXIS_LABEL, GRID, MARGIN, Swatch, TICK, Y_AXIS_WIDTH, endLabel } from './chartParts.jsx';

const K = 4;
const N_PTS = 361;
const DB_MIN = -60;
const CURVE_COLOR = 'var(--series-truth)';
const fmtHz = (f) => f.toFixed(1);

function HarmonicLabel({ viewBox, text }) {
  if (!viewBox) return null;
  const x = viewBox.x;
  const y = viewBox.y;
  return (
    <g aria-hidden="true">
      <polygon points={`${x - 4},${y} ${x + 4},${y} ${x},${y + 8}`} fill={MOTOR} stroke="#000" strokeWidth={1} />
      <text x={x} y={y - 2} textAnchor="middle" fontSize={12} fill={MOTOR} stroke="#000" strokeWidth={1} paintOrder="stroke">
        {text}
      </text>
    </g>
  );
}

// The plot itself, memoised on (tau, rpm) so a playhead step that keeps both is free.
const FilterPlot = memo(function FilterPlot({ tauMs, rpm, ariaLabel }) {
  const tau = tauMs / 1000;
  const hs = useMemo(() => harmonics(rpm, K), [rpm]);
  const fMax = hs[K - 1] * 1.125;
  const rows = useMemo(() => curve(tau, fMax, N_PTS), [tau, fMax]);
  return (
    <div className="chart-box" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={rows} accessibilityLayer={false} margin={{ ...MARGIN, top: 24 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="2 4" />
          <XAxis
            dataKey="f"
            type="number"
            domain={[0, fMax]}
            ticks={hs.map((f) => Math.round(f))}
            tick={TICK}
            stroke={GRID}
            label={{ value: 'Frequency (Hz)', position: 'insideBottomRight', offset: -4, ...AXIS_LABEL }}
            height={36}
          />
          <YAxis
            width={Y_AXIS_WIDTH}
            domain={[DB_MIN, 0]}
            allowDataOverflow
            ticks={[-60, -40, -20, 0]}
            tick={TICK}
            stroke={GRID}
            label={{ value: 'Response (dB)', angle: -90, position: 'insideLeft', offset: 12, ...AXIS_LABEL }}
          />
          {hs.map((f, i) => (
            <ReferenceLine
              key={i}
              x={f}
              stroke={MOTOR}
              strokeWidth={1}
              strokeDasharray="4 4"
              label={<HarmonicLabel text={`${i + 1}×`} />}
            />
          ))}
          <Line
            dataKey="db"
            name="Filter response"
            stroke={CURVE_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            label={endLabel('Filter', CURVE_COLOR, rows.length - 1, 14)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

function FilterFunctionChart({ view }) {
  const titleId = useId();
  const idx = usePlaybackIndex();
  if (!view?.sensor) return null;
  const i = Math.min(Math.max(idx, 0), view.n - 1);
  const tauMs = Number(view.sensor.tau_ms[i]);
  const rpm = Number(view.sensor.rpm[i]);
  const t = Number(view.t[i]);
  const ok = Number.isFinite(tauMs) && tauMs > 0 && Number.isFinite(rpm) && rpm > 0;
  const hs = ok ? harmonics(rpm, K) : [];
  const ns = ok ? nulls(tauMs / 1000, K) : [];
  const hList = hs.map(fmtHz).join(', ');
  const nList = ns.map(fmtHz).join(', ');
  const ariaLabel = `Filter response versus frequency; nulls at ${nList} hertz match motor harmonics at ${hList} hertz.`;
  return (
    <figure className="chart-figure" role="group" aria-labelledby={titleId}>
      <h3 id={titleId} className="chart-title">{`Ramsey filter function at t = ${t.toFixed(1)} s (dB)`}</h3>
      <ul className="chart-legend">
        <li className="legend-item"><Swatch color={CURVE_COLOR} dash="" />Filter response</li>
        <li className="legend-item"><Swatch color={MOTOR} dash="4 4" shape="triangle" />Motor harmonic k×</li>
      </ul>
      {ok ? (
        <FilterPlot tauMs={tauMs} rpm={rpm} ariaLabel={ariaLabel} />
      ) : (
        <p className="help chart-empty">No sensor timing at this sample.</p>
      )}
      {ok && (
        <figcaption className="chart-caption">
          {`τ = ${tauMs.toFixed(2)} ms set from ${Math.round(rpm)} RPM, so the nulls at k/τ land on the motor harmonics (${hList} Hz).`}
        </figcaption>
      )}
    </figure>
  );
}

export default memo(FilterFunctionChart);
