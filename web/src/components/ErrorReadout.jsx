// Position-error box (D-03, moved by Eason's 2026-10-11 request): the first item of the
// "Navigation accuracy" section. It follows the playback index like the map overlay, so it
// updates during playback; it is not a live region (the single Announcer speaks the throttled
// readout). Fixed height, so idle, playback, running and result states never shift the section.
import { memo } from 'react';
import { drErrorAt, errorAt } from '../lib/artifactV2.js';
import { fmtInt } from '../lib/format.js';
import { usePlaybackIndex } from '../hooks/usePlayback.js';
import { SERIES } from '../theme.js';
import { BASELINE_KEY, rmseValue } from '../lib/signal.js';

// Per-Run sensor-level signal error, read from the displayed artifact's line metrics.
const fmtNT = (v, d) => (v === null ? '–' : v.toFixed(d));
function SignalLine({ view, quantumKey }) {
  const b = view ? fmtNT(rmseValue(view, BASELINE_KEY), 1) : '–';
  const q = view ? fmtNT(rmseValue(view, quantumKey), 2) : '–';
  return <p className="readout-sub readout-signal">{`Signal error this Run: baseline ${b} nT, quantum ${q} nT`}</p>;
}

function ErrorReadout({ view, quantumKey }) {
  const idx = usePlaybackIndex();
  if (!view) return <div className="error-readout"><SignalLine view={null} quantumKey={quantumKey} /></div>;
  const qLabel = SERIES[quantumKey].label;
  const i = Math.min(idx, view.n - 1);
  let body;
  if (i < view.jamIdx) {
    body = <p className="readout-state">GPS available</p>;
  } else if (i < view.metricStartIdx) {
    body = <p className="readout-state">Collecting first map-matching window…</p>;
  } else {
    const err = errorAt(view, quantumKey, i);
    body = (
      <>
        <p className="readout-value">{err === null ? 'n/a' : `${fmtInt(err)} m`}</p>
        <p className="readout-sub">
          {`Baseline ${fmtInt(errorAt(view, BASELINE_KEY, i))} m · Dead reckoning ${fmtInt(drErrorAt(view, i))} m`}
        </p>
      </>
    );
  }
  return (
    <div className="error-readout">
      <p className="readout-label">{`Position error, ${qLabel}`}</p>
      {body}
      <SignalLine view={view} quantumKey={quantumKey} />
    </div>
  );
}

export default memo(ErrorReadout);
