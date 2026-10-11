// Small pieces shared by the sensor-panel charts: the playhead cursor (the only per-frame
// subscriber inside a chart), legend swatches, point markers and the direct end-of-line label.
import { useSyncExternalStore } from 'react';
import { usePlotArea, useXAxisScale } from 'recharts';
import { playback } from '../hooks/usePlayback.js';
import { ACCENT, CASING, GRID, MUTED } from '../theme.js';

export const TICK = { fill: MUTED, fontSize: 12 };
export const AXIS_LABEL = { fill: MUTED, fontSize: 12 };
export const Y_AXIS_WIDTH = 56;
export const MARGIN = { top: 12, right: 16, bottom: 8, left: 0 };
export const TOOLTIP_STYLE = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  color: 'var(--color-text)',
  fontSize: 13,
};
export { GRID };

// Accent cursor at the playhead time (UI-SPEC accent use 4).
export function Playhead() {
  const t = useSyncExternalStore(playback.subscribe, playback.getTime);
  const x = useXAxisScale();
  const area = usePlotArea();
  if (!x || !area) return null;
  const px = x(t);
  if (!Number.isFinite(px) || px < area.x - 0.5 || px > area.x + area.width + 0.5) return null;
  return (
    <line
      x1={px}
      x2={px}
      y1={area.y}
      y2={area.y + area.height}
      stroke={ACCENT}
      strokeWidth={1}
      aria-hidden="true"
      pointerEvents="none"
    />
  );
}

// 8 px point markers (SVG), centred on (cx, cy).
export function Marker({ shape, cx, cy, color, filled = true, size = 8 }) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  const h = size / 2;
  const fill = filled ? color : 'none';
  const common = { stroke: filled ? CASING : color, strokeWidth: filled ? 1 : 2, fill };
  if (shape === 'square') return <rect x={cx - h} y={cy - h} width={size} height={size} {...common} />;
  if (shape === 'diamond') {
    const d = h * 1.25;
    return <polygon points={`${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`} {...common} />;
  }
  if (shape === 'triangle') {
    return <polygon points={`${cx},${cy - h} ${cx + h},${cy + h} ${cx - h},${cy + h}`} {...common} />;
  }
  return <circle cx={cx} cy={cy} r={h} {...common} />;
}

// Legend swatch: 28 x 12 dash sample with an optional marker shape at its centre.
export function Swatch({ color, dash, shape = null, filled = true, line = true }) {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true" focusable="false" className="legend-swatch">
      {line && (
        <line x1="1" y1="6" x2="27" y2="6" stroke={color} strokeWidth="2" strokeDasharray={dash || undefined} />
      )}
      {shape && <Marker shape={shape} cx={14} cy={6} color={color} filled={filled} size={8} />}
    </svg>
  );
}

// Direct end label for a Line (rendered by recharts' label prop at every point; only the last
// index draws). Series colour with a 1 px black text stroke so it reads over any line.
export function endLabel(text, color, lastIndex, dy = -6) {
  return function EndLabel(props) {
    const { x, y, index } = props;
    if (index !== lastIndex || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    return (
      <text
        x={x - 2}
        y={y + dy}
        textAnchor="end"
        fontSize={12}
        fill={color}
        stroke={CASING}
        strokeWidth={1}
        paintOrder="stroke"
        aria-hidden="true"
      >
        {text}
      </text>
    );
  };
}
