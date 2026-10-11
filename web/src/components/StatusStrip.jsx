// Run status (UI-SPEC Status strip): badge row (mode, fallback, motor source, bits, map label),
// the status message, the live progress row (step text, bar, sample counter, watchdog seconds)
// and notices. The status message is plain text; announcements go through the single Announcer.
import Badge from './Badge.jsx';

export const MODE_BADGE = {
  replay: 'precomputed replay',
  computing: 'computing in-page…',
  computed: 'computed in-page',
};
export const MOTOR_BADGE = {
  stored: 'stored motor draw',
  drawn: "motor drawn by this Run's IonQ job",
};
export const STEP_TEXT = {
  1: 'submitting one IonQ job…',
  2: 'decoding counts (RNG bits, probes, GHZ contrast)…',
  3: 'flying the UAV in-page…',
  4: 'map matching and scoring…',
};
export const BUILTIN_NOTICE = 'Built-in simulator: probe blocks computed analytically, not sampled.';
export const WATCHDOG_S = 90;

export const stepLine = (n) => `Step ${n} of 4: ${STEP_TEXT[n] ?? STEP_TEXT[1]}`;
export const fallbackBadge = (label) => `fallback: precomputed replay (${label})`;

export function idleHint(label, jamT, live) {
  const jam = `GPS is jammed at t = ${Math.round(Number(jamT))} s.`;
  return live
    ? `Showing the recorded flight: ${label}. Press Run one IonQ job to draw a new motor and fly this map, or Play to watch. ${jam}`
    : `Showing the recorded flight: ${label}. Press Play to watch. ${jam}`;
}

// The live progress row under the step message: progress bar (hidden under reduced motion) and
// the "{i} of {n} samples · {s} s of 90 s" counter (text only, updated once per second).
export function LiveProgress({ stage, progress, elapsedS, reduced }) {
  const n = Math.max(1, Math.min(4, stage || 1));
  const total = progress?.samplesTotal ?? 0;
  const done = progress?.samplesDone ?? 0;
  const s = Math.min(WATCHDOG_S, Math.max(0, Math.floor(elapsedS ?? 0)));
  return (
    <>
      {!reduced && n >= 3 && total > 0 && (
        <progress max={total} value={done} aria-label="Live run progress" />
      )}
      <p className="live-counter">
        {total > 0 ? `${done} of ${total} samples · ` : ''}
        {`${s} s of ${WATCHDOG_S} s`}
      </p>
    </>
  );
}

export default function StatusStrip({
  mode = 'replay', motor = 'stored', mapLabel = null, fallbackLabel = null, bitsLabel = null,
  message = null, danger = null, notice = null, focusRef = null, children = null,
}) {
  return (
    <section className="panel status-strip" aria-label="Run status">
      <div className="badge-row">
        <Badge variant={mode === 'computed' ? 'ok' : 'neutral'}>{MODE_BADGE[mode] ?? MODE_BADGE.replay}</Badge>
        {fallbackLabel && <Badge variant="attention">{fallbackBadge(fallbackLabel)}</Badge>}
        {motor && <Badge>{MOTOR_BADGE[motor] ?? MOTOR_BADGE.stored}</Badge>}
        {bitsLabel && <Badge>{bitsLabel}</Badge>}
        {mapLabel && <Badge>{mapLabel}</Badge>}
      </div>
      {/* tabIndex -1: focus parks here when the focused control disables itself (WR-02). */}
      <p className="status-message" tabIndex={-1} ref={focusRef}>{message ?? ''}</p>
      <div className="live-progress" hidden={!children}>{children}</div>
      {notice && <p className="info-notice">{notice}</p>}
      {danger && <p className="danger-notice">{danger}</p>}
    </section>
  );
}
