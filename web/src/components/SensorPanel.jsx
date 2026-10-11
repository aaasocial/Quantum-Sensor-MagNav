// Sensor panel (UI-SPEC layout item 6): follows the selected scenario. Four figures in order:
// (a) sensed field vs crustal truth, (b) residual from the metric start, (c) the Ramsey filter
// function at the playhead, (d) GHZ scaling (scenario-independent). Charts a and b render only
// when (view, quantum track) change; the Playhead child is their only per-frame subscriber.
import { memo, useId, useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Badge from './Badge.jsx';
import FilterFunctionChart from './FilterFunctionChart.jsx';
import GhzScalingChart from './GhzScalingChart.jsx';
import { fmtInt } from '../lib/format.js';
import { BASELINE_KEY, residualSeries, rmseLabels, rmseValue, sensedSeries } from '../lib/signal.js';
import { JAM_COLOR, SERIES, TRUTH } from '../theme.js';
import {
  GRID, MARGIN, Playhead, Swatch, TICK, TOOLTIP_STYLE, Y_AXIS_WIDTH, endLabel,
} from './chartParts.jsx';

const tooltipValue = (value, name) => [Number.isFinite(value) ? `${value.toFixed(1)} nT` : 'n/a', name];
const tooltipLabel = (t) => `t = ${Number(t).toFixed(1)} s`;
const rmse1 = (v) => (v === null ? 'n/a' : v.toFixed(1));

function seriesLine(key, series, last, dy) {
  return (
    <Line
      key={key}
      dataKey={key}
      name={series.label}
      stroke={series.color}
      strokeDasharray={series.dash || undefined}
      strokeLinecap={key === 'quantum_q1' ? 'round' : 'butt'}
      strokeWidth={2}
      dot={false}
      activeDot={false}
      isAnimationActive={false}
      connectNulls={false}
      label={endLabel(series.short ?? series.label, series.color, last, dy)}
    />
  );
}

function TraceChart({ rows, keys, height, ariaLabel, view, withTruth, xMin = 0 }) {
  const last = rows.length - 1;
  const domain = [xMin, view.tEnd];
  return (
    <div className="chart-box" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={rows} accessibilityLayer={false} margin={MARGIN}>
          <CartesianGrid stroke={GRID} strokeDasharray="2 4" />
          <XAxis
            dataKey="t"
            type="number"
            domain={domain}
            allowDataOverflow
            tickCount={7}
            tick={TICK}
            stroke={GRID}
            tickFormatter={fmtInt}
          />
          <YAxis width={Y_AXIS_WIDTH} tick={TICK} stroke={GRID} tickFormatter={fmtInt} />
          <Tooltip
            isAnimationActive={false}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: 'var(--color-text)' }}
            formatter={tooltipValue}
            labelFormatter={tooltipLabel}
          />
          {view.jamT >= xMin && <ReferenceLine x={view.jamT} stroke={JAM_COLOR} strokeDasharray="4 2" />}
          {withTruth && (
            <Line
              dataKey="truth"
              name={TRUTH.label}
              stroke={TRUTH.color}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              label={endLabel('Truth', TRUTH.color, last, -8)}
            />
          )}
          {keys.map((k, i) => seriesLine(k, SERIES[k], last, i === 0 ? 14 : -22))}
          <Playhead />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const SensedCharts = memo(function SensedCharts({ view, quantumKey }) {
  const titleA = useId();
  const titleB = useId();
  const keys = [BASELINE_KEY, quantumKey];
  const qLabel = SERIES[quantumKey]?.label ?? quantumKey;
  const rows = useMemo(() => sensedSeries(view, quantumKey), [view, quantumKey]);
  const resRows = useMemo(() => residualSeries(view, quantumKey), [view, quantumKey]);
  const badges = rmseLabels(view, quantumKey);
  const msT = Number(view.metricStartT);
  return (
    <>
      <figure className="chart-figure" role="group" aria-labelledby={titleA}>
        <h3 id={titleA} className="chart-title">Sensed field vs crustal truth (nT)</h3>
        <ul className="chart-legend">
          <li className="legend-item">
            <Swatch color={TRUTH.color} dash="" />
            {TRUTH.label}
            <span className="rmse-badge">{badges.truth}</span>
          </li>
          {keys.map((k) => (
            <li key={k} className="legend-item">
              <Swatch color={SERIES[k].color} dash={SERIES[k].dash} />
              {SERIES[k].label}
              <span className="rmse-badge">{badges[k]}</span>
            </li>
          ))}
        </ul>
        <TraceChart
          rows={rows}
          keys={keys}
          height={180}
          view={view}
          withTruth
          ariaLabel={`Sensed magnetic field over flight time: crustal truth, baseline and ${qLabel}. Data table below.`}
        />
        <figcaption className="chart-caption">
          {`RMSE after GPS loss: baseline ${rmse1(rmseValue(view, BASELINE_KEY))} nT, ${qLabel} ${rmse1(rmseValue(view, quantumKey))} nT.`}
        </figcaption>
      </figure>
      <figure className="chart-figure" role="group" aria-labelledby={titleB}>
        <h3 id={titleB} className="chart-title">Residual, sensed − truth (nT)</h3>
        <TraceChart
          rows={resRows}
          keys={keys}
          height={140}
          view={view}
          withTruth={false}
          xMin={resRows[0]?.t ?? 0}
          ariaLabel={`Residual of baseline and ${qLabel} against crustal truth after GPS loss.`}
        />
        <figcaption className="chart-caption">
          {`From t = ${fmtInt(msT)} s (first map-matching window).`}
        </figcaption>
      </figure>
    </>
  );
});

function SensorPanel({ view, quantumKey, ghz, ghzStatus, measuredSource, headingInSummary = false }) {
  const headingId = useId();
  // With headingInSummary the "Sensor" h2 lives in the enclosing details summary (App.jsx),
  // so the panel renders as a plain body block and no duplicate heading appears.
  const Wrap = headingInSummary ? 'div' : 'section';
  const wrapProps = headingInSummary
    ? { className: 'sensor-panel' }
    : { className: 'panel sensor-panel', 'aria-labelledby': headingId };
  return (
    <Wrap {...wrapProps}>
      <div className="panel-head">
        {!headingInSummary && <h2 id={headingId}>Sensor</h2>}
        <Badge>emulated sensor</Badge>
      </div>
      <p className="help">The quantum sensor is emulated: the field is injected as gate angles, not felt.</p>
      {view ? (
        <>
          <SensedCharts view={view} quantumKey={quantumKey} />
          <FilterFunctionChart view={view} />
        </>
      ) : (
        <p className="chart-empty">Loading recorded flights…</p>
      )}
      <GhzScalingChart payload={ghz} status={ghzStatus} measuredSource={measuredSource} />
    </Wrap>
  );
}

export default memo(SensorPanel);
