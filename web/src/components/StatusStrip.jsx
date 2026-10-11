// Run status (UI-SPEC Status strip): badge row (mode, motor source, map label), the status
// message, a live-progress slot (filled by the live run, plan 02-06) and notices. The status
// message is plain text; announcements go through the single Announcer.
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

export function idleHint(label, jamT, live) {
  const jam = `GPS is jammed at t = ${Math.round(Number(jamT))} s.`;
  return live
    ? `Showing the recorded flight: ${label}. Press Run one IonQ job to draw a new motor and fly this map, or Play to watch. ${jam}`
    : `Showing the recorded flight: ${label}. Press Play to watch. ${jam}`;
}

export default function StatusStrip({
  mode = 'replay', motor = 'stored', mapLabel = null, message = null, danger = null, notice = null,
  focusRef = null, children = null,
}) {
  return (
    <section className="panel status-strip" aria-label="Run status">
      <div className="badge-row">
        <Badge variant={mode === 'computed' ? 'ok' : 'neutral'}>{MODE_BADGE[mode] ?? MODE_BADGE.replay}</Badge>
        <Badge>{MOTOR_BADGE[motor] ?? MOTOR_BADGE.stored}</Badge>
        {mapLabel && <Badge>{mapLabel}</Badge>}
      </div>
      {/* tabIndex -1: focus parks here when the focused control disables itself (WR-02). */}
      <p className="status-message" tabIndex={-1} ref={focusRef}>{message ?? ''}</p>
      {/* Live progress slot: the live run (plan 02-06) renders its step text and bar here. */}
      <div className="live-progress" hidden={!children}>{children}</div>
      {notice && <p className="info-notice">{notice}</p>}
      {danger && <p className="danger-notice">{danger}</p>}
    </section>
  );
}
