// Map panel (UI-06): the selected scenario's map label line, a canvas heatmap drawn once per
// (scenario, size, DPR) and an SVG overlay whose tracks and markers follow the playback index:
// true path, dead reckoning, the classical baseline (baseline_ls) and the selected quantum track.
// The heatmap is rasterised once per (scenario, size, DPR) into an offscreen canvas; each frame
// only copies the visible window of it. The box height is fixed across scenarios (A-13), so
// switching never shifts the layout; each map is letterboxed at its own aspect.
//
// Two view modes (Eason, 2026-10-11): "Follow the UAV" (default) shows a window centred on the
// playhead, 20x the mean post-jam baseline-quantum separation wide (600-3000 m, lib/follow.js), so
// the baseline and quantum tracks are visibly apart (at the full-trajectory zoom of ~60-75 m per
// pixel the quantum track covered the baseline). "Full trajectory" shows the whole map. The window
// is set per frame and never animated (no transition, so reduced motion needs no extra case).
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildCividisLut, colorbarTicks } from '../lib/colormap.js';
import { mapGeometry } from '../lib/geo.js';
import { followViewBox, followWindowMetres, meanSeparation } from '../lib/follow.js';
import { usePlaybackIndex } from '../hooks/usePlayback.js';
import JamBanner from './JamBanner.jsx';
import {
  CASING, DR, INVALID_BASE, INVALID_STRIPE, JAM_COLOR, SERIES, TEXT_COLOR, TRUTH,
} from '../theme.js';

const BASELINE_KEY = 'baseline_ls';
export const MAP_MODES = [
  { key: 'follow', label: 'Follow the UAV (zoomed)' },
  { key: 'full', label: 'Full trajectory' },
];
export const DEFAULT_MAP_MODE = 'follow';
const BASE_W = 7; // baseline band width (px), drawn under the 2 px quantum line
const BASE_MARKER = 20; // baseline triangle, larger than and drawn under the 12 px quantum marker
const BOX_ASPECT = 1.096; // tallest scenario preview (Eastern_395, 117 x 107 cells), H / W
const CAP_COMPACT = 300; // map-first at the ~520 px Qollab frame: controls stay near the fold
const CAP_WIDE = 520;
const WIDE_FROM = 700; // stage width in px
// Two-column layout (>= 900 px viewport): the map has the 3fr column to itself and nothing sits
// under it, so it can be taller than in the stacked layout.
const CAP_TWO_COL = 640;
const TWO_COL_QUERY = '(min-width: 900px)';
const BAR_W = 160;
const BAR_H = 12;
const SW_W = 28;
const SW_H = 12;
const MARKER = 12;

let lutCache = null;
const getLut = () => {
  if (!lutCache) lutCache = buildCividisLut();
  return lutCache;
};

function hexRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// 4x4 tile with one 45-degree stripe: a 1 px line every 4 px when repeated.
function hatchPattern(ctx) {
  const tile = document.createElement('canvas');
  tile.width = 4;
  tile.height = 4;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(4, 4);
  const [r, g, b] = hexRgb(INVALID_STRIPE);
  for (let k = 0; k < 4; k++) {
    const o = ((3 - k) * 4 + k) * 4;
    img.data[o] = r;
    img.data[o + 1] = g;
    img.data[o + 2] = b;
    img.data[o + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  return ctx.createPattern(tile, 'repeat');
}

function sizeCanvas(canvas, w, h, dpr) {
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawHeatmap(canvas, preview, [d0, d1], W, H, dpr) {
  const { nx, ny, nT, valid } = preview;
  const lut = getLut();
  const base = hexRgb(INVALID_BASE);
  const off = document.createElement('canvas'); // 1 px per cell
  off.width = nx;
  off.height = ny;
  const octx = off.getContext('2d');
  const img = octx.createImageData(nx, ny);
  const span = d1 - d0;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const src = j * nx + i;
      const dst = ((ny - 1 - j) * nx + i) * 4; // row 0 is SOUTH; canvas row 0 is the top
      if (!valid[src]) {
        img.data[dst] = base[0];
        img.data[dst + 1] = base[1];
        img.data[dst + 2] = base[2];
      } else {
        const k = Math.max(0, Math.min(255, Math.round(((nT[src] - d0) / span) * 255)));
        img.data[dst] = lut[3 * k];
        img.data[dst + 1] = lut[3 * k + 1];
        img.data[dst + 2] = lut[3 * k + 2];
      }
      img.data[dst + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  const ctx = sizeCanvas(canvas, W, H, dpr);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(off, 0, 0, W, H);

  // Hatch the invalid cells: one path of horizontal runs, filled with the stripe pattern.
  const cw = W / nx;
  const ch = H / ny;
  const path = new Path2D();
  let any = false;
  for (let j = 0; j < ny; j++) {
    const row = ny - 1 - j;
    let i = 0;
    while (i < nx) {
      if (valid[j * nx + i]) { i += 1; continue; }
      const i0 = i;
      while (i < nx && !valid[j * nx + i]) i += 1;
      path.rect(i0 * cw, row * ch, (i - i0) * cw, ch);
      any = true;
    }
  }
  if (any) {
    ctx.fillStyle = hatchPattern(ctx);
    ctx.fill(path);
  }
}

function drawColorbar(canvas, dpr) {
  const lut = getLut();
  const off = document.createElement('canvas');
  off.width = 256;
  off.height = 1;
  const octx = off.getContext('2d');
  const img = octx.createImageData(256, 1);
  for (let k = 0; k < 256; k++) {
    img.data[4 * k] = lut[3 * k];
    img.data[4 * k + 1] = lut[3 * k + 1];
    img.data[4 * k + 2] = lut[3 * k + 2];
    img.data[4 * k + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  const ctx = sizeCanvas(canvas, BAR_W, BAR_H, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, 0, 0, BAR_W, BAR_H);
}

function drawHatchSwatch(canvas, dpr) {
  const ctx = sizeCanvas(canvas, SW_W, SW_H, dpr);
  ctx.fillStyle = INVALID_BASE;
  ctx.fillRect(0, 0, SW_W, SW_H);
  ctx.fillStyle = hatchPattern(ctx);
  ctx.fillRect(0, 0, SW_W, SW_H);
}

// True while the media query matches (two-column layout); a change triggers a canvas redraw.
function useMediaQuery(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

// Width of the stage and the device pixel ratio; both trigger a canvas redraw.
function useStageSize(ref) {
  const [size, setSize] = useState({ width: 0, dpr: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const width = Math.floor(el.getBoundingClientRect().width);
      const dpr = window.devicePixelRatio || 1;
      setSize((s) => (s.width === width && s.dpr === dpr ? s : { width, dpr }));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let mq = null;
    const onDpr = () => {
      measure();
      watchDpr();
    };
    function watchDpr() {
      if (mq) mq.removeEventListener('change', onDpr);
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      mq.addEventListener('change', onDpr);
    }
    watchDpr();
    measure();
    return () => {
      ro.disconnect();
      if (mq) mq.removeEventListener('change', onDpr);
    };
  }, [ref]);
  return size;
}

// k = map pixels per screen pixel (1 in the full view, < 1 when zoomed): widths, dashes and
// marker sizes are multiplied by k so they keep their screen size at every zoom.
const scaleDash = (dash, k) => (dash ? dash.split(/[\s,]+/).map((v) => Number(v) * k).join(' ') : dash);

function Track({ points, color, dash, width = 2, round = false, k = 1 }) {
  if (!points) return null;
  const cap = round ? 'round' : 'butt';
  return (
    <>
      <polyline points={points} fill="none" stroke={CASING} strokeWidth={Math.max(4, width + 2) * k} strokeLinejoin="round" strokeLinecap="round" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={width * k}
        strokeDasharray={scaleDash(dash, k) || undefined}
        strokeLinejoin="round"
        strokeLinecap={cap}
      />
    </>
  );
}

// 12 px point marker, 1.5 px black outline: square (DR), triangle (baseline), diamond
// (single-qubit), circle (GHZ-4).
export function Marker({ shape, x, y, color, size: size0 = MARKER, k = 1 }) {
  const size = size0 * k;
  const h = size / 2;
  const common = { fill: color, stroke: CASING, strokeWidth: 1.5 * k };
  switch (shape) {
    case 'square':
      return <rect x={x - h} y={y - h} width={size} height={size} {...common} />;
    case 'triangle':
      return <polygon points={`${x},${y - h} ${x + h},${y + h} ${x - h},${y + h}`} {...common} />;
    case 'diamond':
      return <polygon points={`${x},${y - h} ${x + h},${y} ${x},${y + h} ${x - h},${y}`} {...common} />;
    case 'circle':
      return <circle cx={x} cy={y} r={h} {...common} />;
    default:
      return null;
  }
}

// 24 px fixed-wing silhouette pointing up, rotated to the heading (snaps, never tweens).
function Uav({ x, y, angle, k = 1 }) {
  const d = 'M0 -11 L2 -4 L11 1 L11 3 L2 1 L1.5 7 L5 10 L5 11.5 L0 10 L-5 11.5 L-5 10 L-1.5 7 L-2 1 L-11 3 L-11 1 L-2 -4 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${angle})`}>
      <path d={d} fill={TRUTH.color} stroke={CASING} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
}

function JamMarker({ x, y, right, k = 1 }) {
  const flip = x > right - 110 * k;
  const x2 = 'M-4 -4L4 4M4 -4L-4 4';
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle r={8} fill="none" stroke={CASING} strokeWidth={4} />
      <path d={x2} stroke={CASING} strokeWidth={4} strokeLinecap="round" />
      <circle r={8} fill="none" stroke={JAM_COLOR} strokeWidth={2} />
      <path d={x2} stroke={JAM_COLOR} strokeWidth={2} strokeLinecap="round" />
      <text
        x={flip ? -13 : 13}
        y={5}
        textAnchor={flip ? 'end' : 'start'}
        fontSize={14}
        fill={TEXT_COLOR}
        stroke={CASING}
        strokeWidth={3}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        GPS jammed
      </text>
    </g>
  );
}

function heading(xy, i) {
  const a = xy[Math.max(0, i - 1)];
  const b = xy[Math.min(xy.length - 1, Math.max(1, i))];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return 0;
  return (Math.atan2(dx, -dy) * 180) / Math.PI; // screen y grows downward; 0 deg = up
}

// The only per-frame part of the map: re-renders on index changes, reads precomputed strings,
// sets the view window (follow mode) and copies that window of the offscreen heatmap.
const Overlay = memo(function Overlay({ W, H, px, jamIdx, quantum, follow, winPx, canvasRef, heatRef, heatVer, dpr }) {
  const idx = usePlaybackIndex();
  const i = Math.min(idx, px.truth.xy.length - 1);
  const after = i >= jamIdx;
  const sliceStr = (s, from) => s.slice(from, i + 1).join(' ');
  const [tx, ty] = px.truth.xy[i];
  const dr = px.dr.xy[i];
  const base = px.base.xy[i];
  const q = px.q.xy[i];
  const jam = px.truth.xy[jamIdx];
  const B = SERIES[BASELINE_KEY];
  const win = follow ? followViewBox([tx, ty], winPx, { W, H }) : { x: 0, y: 0, w: W, h: H };
  const k = win.w / W;

  useEffect(() => {
    const canvas = canvasRef.current;
    const off = heatRef.current;
    if (!canvas || !off) return;
    const cw = Math.max(1, Math.round(W * dpr));
    const ch = Math.max(1, Math.round(H * dpr));
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(off, win.x * dpr, win.y * dpr, win.w * dpr, win.h * dpr, 0, 0, cw, ch);
  }, [canvasRef, heatRef, heatVer, W, H, dpr, win.x, win.y, win.w, win.h]);

  return (
    <svg
      className="map-overlay"
      viewBox={`${win.x} ${win.y} ${win.w} ${win.h}`}
      width={W}
      height={H}
      aria-hidden="true"
      focusable="false"
      style={follow ? { overflow: 'hidden' } : undefined}
    >
      {follow && <polyline points={px.truth.full} fill="none" stroke={TRUTH.color} strokeOpacity={0.3} strokeWidth={1.5 * k} />}
      <Track points={sliceStr(px.truth.str, 0)} color={TRUTH.color} dash="" k={k} />
      {after && <Track points={sliceStr(px.dr.str, jamIdx)} color={DR.color} dash={DR.mapDash} width={2.5} round k={k} />}
      {/* The baseline is a wide solid orange band under the quantum dash-dot line: the map matcher
          snaps both estimates to the same map cells much of the time, and where they coincide the
          band still shows as an orange border around the quantum line. */}
      {after && <Track points={sliceStr(px.base.str, jamIdx)} color={B.color} dash="" width={BASE_W} k={k} />}
      {after && <Track points={sliceStr(px.q.str, jamIdx)} color={quantum.color} dash={quantum.mapDash} k={k} />}
      {after && <JamMarker x={jam[0]} y={jam[1]} right={win.x + win.w} k={k} />}
      {after && <Marker shape={DR.marker} x={dr[0]} y={dr[1]} color={DR.color} k={k} />}
      {after && <Marker shape={B.marker} x={base[0]} y={base[1]} color={B.color} size={BASE_MARKER} k={k} />}
      {after && <Marker shape={quantum.marker} x={q[0]} y={q[1]} color={quantum.color} k={k} />}
      <Uav x={tx} y={ty} angle={heading(px.truth.xy, i)} k={k} />
    </svg>
  );
});

// The end labels hug the bar ends; drop the middle (0) label if it would overlap them.
const CHAR_PX = 8;
function tickFits(ticks, n, [d0, d1]) {
  if (n === 0 || n === ticks.length - 1) return true;
  const at = (v) => ((v - d0) / (d1 - d0)) * BAR_W;
  const half = (ticks[n].label.length * CHAR_PX) / 2 + 4;
  const leftEnd = at(ticks[0].value) + ticks[0].label.length * CHAR_PX;
  const last = ticks[ticks.length - 1];
  const rightStart = at(last.value) - last.label.length * CHAR_PX;
  const x = at(ticks[n].value);
  return x - half >= leftEnd && x + half <= rightStart;
}

function pixelSeries(xs, ys, toPx) {
  const xy = new Array(xs.length);
  const str = new Array(xs.length);
  for (let k = 0; k < xs.length; k++) {
    const p = toPx(xs[k], ys[k]);
    xy[k] = p;
    str[k] = `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  }
  return { xy, str };
}

// 28 x 12 legend swatch: a dash sample with the marker shape at its centre.
function LegendSwatch({ series, shape, dash, width = 2, jam = false }) {
  return (
    <svg width={SW_W} height={SW_H} viewBox={`0 0 ${SW_W} ${SW_H}`} aria-hidden="true" focusable="false" className="legend-swatch">
      {jam ? (
        <g transform={`translate(${SW_W / 2} ${SW_H / 2})`}>
          <circle r={5} fill="none" stroke={JAM_COLOR} strokeWidth={2} />
          <path d="M-3 -3L3 3M3 -3L-3 3" stroke={JAM_COLOR} strokeWidth={1.5} strokeLinecap="round" />
        </g>
      ) : (
        <>
          <line x1="1" y1={SW_H / 2} x2={SW_W - 1} y2={SW_H / 2} stroke={CASING} strokeWidth={Math.max(4, width + 2)} />
          <line
            x1="1"
            y1={SW_H / 2}
            x2={SW_W - 1}
            y2={SW_H / 2}
            stroke={series.color}
            strokeWidth={width}
            strokeDasharray={dash || undefined}
            strokeLinecap={series.key === DR.key ? 'round' : 'butt'}
          />
          {shape && <Marker shape={shape} x={SW_W / 2} y={SW_H / 2} color={series.color} size={8} />}
        </>
      )}
    </svg>
  );
}

function MapBody({ view, quantumKey, mapMode }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const barRef = useRef(null);
  const swatchRef = useRef(null);
  const heatRef = useRef(null);
  const [heatVer, setHeatVer] = useState(0);
  const follow = mapMode !== 'full';
  const { width, dpr } = useStageSize(stageRef);
  const twoCol = useMediaQuery(TWO_COL_QUERY);
  const preview = view.preview;
  const domain = view.domain;
  const ticks = useMemo(() => colorbarTicks(domain), [domain]);
  let cap = width >= WIDE_FROM ? CAP_WIDE : CAP_COMPACT;
  if (twoCol) cap = CAP_TWO_COL;
  const boxH = width > 0 ? Math.round(Math.min(cap, width * BOX_ASPECT)) : 0;
  const geom = useMemo(() => (width > 0 ? mapGeometry(preview, width, boxH) : null), [preview, width, boxH]);

  const px = useMemo(() => {
    if (!geom) return null;
    const q = view.est[quantumKey];
    const b = view.est[BASELINE_KEY];
    const truth = pixelSeries(view.truth.x, view.truth.y, geom.toPx);
    truth.full = truth.str.join(' ');
    return {
      truth,
      dr: pixelSeries(view.dr.x, view.dr.y, geom.toPx),
      base: pixelSeries(b.x, b.y, geom.toPx),
      q: pixelSeries(q.x, q.y, geom.toPx),
    };
  }, [view, quantumKey, geom]);

  // Follow window: FOLLOW_FACTOR x the mean post-jam baseline-quantum separation, in map pixels.
  const winPx = useMemo(() => {
    if (!geom) return 0;
    const sep = meanSeparation(view.est[BASELINE_KEY], view.est[quantumKey], view.jamIdx);
    const pxPerM = geom.W / (preview.nx * geom.dx);
    return followWindowMetres(sep) * pxPerM;
  }, [view, quantumKey, geom, preview]);

  // Rasterise the heatmap once into an offscreen canvas; the Overlay copies its window per frame.
  useEffect(() => {
    if (!geom) return;
    const off = document.createElement('canvas');
    drawHeatmap(off, preview, domain, geom.W, geom.H, dpr);
    heatRef.current = off;
    setHeatVer((v) => v + 1);
  }, [preview, domain, geom, dpr]);

  useEffect(() => {
    if (barRef.current) drawColorbar(barRef.current, dpr);
    if (swatchRef.current) drawHatchSwatch(swatchRef.current, dpr);
  }, [dpr, view.hasInvalid]);

  const quantum = SERIES[quantumKey];
  const B = SERIES[BASELINE_KEY];
  const [d0, d1] = domain;

  return (
    <>
      <div className="map-stage" ref={stageRef} style={boxH ? { height: `${boxH}px` } : undefined}>
        {geom && px && (
          <div className="map-plot" style={{ width: `${geom.W}px`, height: `${geom.H}px` }}>
            <canvas ref={canvasRef} aria-hidden="true" />
            <Overlay
              W={geom.W}
              H={geom.H}
              px={px}
              jamIdx={view.jamIdx}
              quantum={quantum}
              follow={follow}
              winPx={winPx}
              canvasRef={canvasRef}
              heatRef={heatRef}
              heatVer={heatVer}
              dpr={dpr}
            />
          </div>
        )}
      </div>
      {/* D-03: nothing overlays the map box; the jam banner sits in a fixed-height row under it.
          The position-error box lives in "Navigation accuracy" (ErrorReadout.jsx). */}
      <div className="readout-row">
        <div className="jam-slot">
          <JamBanner view={view} />
        </div>
      </div>
      <ul className="map-legend">
        <li className="legend-item"><LegendSwatch series={TRUTH} dash="" /><span>{TRUTH.label}</span></li>
        <li className="legend-item"><LegendSwatch series={DR} shape={DR.marker} dash={DR.mapDash} /><span>{DR.label}</span></li>
        <li className="legend-item"><LegendSwatch series={B} shape={B.marker} dash="" width={6} /><span>{B.label}</span></li>
        <li className="legend-item">
          <LegendSwatch series={quantum} shape={quantum.marker} dash={quantum.mapDash} />
          <span>{quantum.label}</span>
        </li>
        <li className="legend-item"><LegendSwatch series={TRUTH} jam /><span>GPS jammed</span></li>
        <li className="colorbar">
          <span>Magnetic anomaly (nT)</span>
          <canvas ref={barRef} className="colorbar-canvas" aria-hidden="true" />
          <div className="colorbar-ticks">
            {ticks.map((k, n) => (
              <span
                key={k.value}
                style={{
                  left: `${((k.value - d0) / (d1 - d0)) * 100}%`,
                  transform: n === 0 ? 'none' : n === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                {tickFits(ticks, n, domain) ? k.label : ''}
              </span>
            ))}
          </div>
        </li>
        {view.hasInvalid && (
          <li className="legend-item">
            <canvas ref={swatchRef} className="legend-hatch" aria-hidden="true" />
            <span>No map data</span>
          </li>
        )}
      </ul>
    </>
  );
}

export function mapCaption(view, quantumKey, mapMode = DEFAULT_MAP_MODE) {
  const q = SERIES[quantumKey];
  const shape = q.marker;
  const km = (v) => v.toFixed(1);
  const zoom = mapMode === 'full'
    ? 'Showing the full trajectory.'
    : 'Zoomed in on the UAV and following it, so the baseline and quantum tracks show apart; the full path is drawn faintly.';
  return `${view.mapCaption} Extent ${km(view.extentKm.w)} × ${km(view.extentKm.h)} km. ${zoom} True path solid white, `
    + `dead reckoning dotted green, baseline wide orange band (triangle) under the quantum line, showing as an orange border where the two coincide, ${q.label} dash-dot (${shape}).`;
}

export default function MapView({ view, quantumKey, mapMode = DEFAULT_MAP_MODE, loadingText = 'Loading recorded flights…' }) {
  const h2Id = useId();
  return (
    <figure className="panel map-figure" role="group" aria-labelledby={h2Id} tabIndex={0}>
      <h2 id={h2Id}>Map</h2>
      <p className="map-label-line">{view ? view.mapLabel : ''}</p>
      {view ? (
        <MapBody view={view} quantumKey={quantumKey} mapMode={mapMode} />
      ) : (
        <div className="map-loading">{loadingText}</div>
      )}
      {view && <figcaption>{mapCaption(view, quantumKey, mapMode)}</figcaption>}
    </figure>
  );
}
