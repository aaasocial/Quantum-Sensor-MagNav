// Follow-the-UAV map view (Eason, 2026-10-11): a window centred on the playhead, zoomed in far
// enough that the classical baseline and the quantum track are visibly apart. Pure functions,
// tested with node --test (follow.test.js).

export const FOLLOW_MIN_M = 600; // narrowest window (metres across)
export const FOLLOW_MAX_M = 3000; // widest window
export const FOLLOW_FACTOR = 20; // window = 20 x mean post-jam baseline-quantum separation

// Mean distance (metres) between two estimate tracks from index `from` on.
export function meanSeparation(a, b, from = 0) {
  const n = Math.min(a.x.length, b.x.length);
  let s = 0;
  let k = 0;
  for (let i = Math.max(0, from); i < n; i++) {
    const d = Math.hypot(a.x[i] - b.x[i], a.y[i] - b.y[i]);
    if (Number.isFinite(d)) {
      s += d;
      k += 1;
    }
  }
  return k ? s / k : 0;
}

// Window width in metres: FOLLOW_FACTOR x the separation, clamped to [FOLLOW_MIN_M, FOLLOW_MAX_M].
export function followWindowMetres(separationM) {
  const w = FOLLOW_FACTOR * (Number.isFinite(separationM) ? separationM : 0);
  return Math.min(FOLLOW_MAX_M, Math.max(FOLLOW_MIN_M, w));
}

// View box {x, y, w, h} in map pixels: `windowPx` wide, the map's aspect, centred on `center`
// and clamped inside the map extent {W, H} (centred on the map if the window is larger).
export function followViewBox(center, windowPx, extent) {
  const { W, H } = extent;
  const w = Math.max(1, windowPx);
  const h = w * (H / W);
  const clamp = (c, size, span) => (size >= span ? (span - size) / 2 : Math.min(span - size, Math.max(0, c - size / 2)));
  return { x: clamp(center[0], w, W), y: clamp(center[1], h, H), w, h };
}
