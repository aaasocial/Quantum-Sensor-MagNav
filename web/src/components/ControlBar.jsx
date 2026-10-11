// Playback row (UI-SPEC Playback): Play/Pause, scrub slider, time readout, Speed. Only the leaf
// Scrubber, TimeReadout and PlayButton subscribe to the playback store, so the bar itself
// re-renders on selection changes only.
import { memo, useId } from 'react';
import { playback, usePlaybackIndex, usePlaybackPlaying, usePlaybackTime } from '../hooks/usePlayback.js';
import { fmtSeconds } from '../lib/format.js';

export const SPEEDS = [10, 30, 90];
export const DEFAULT_SPEED = 30;

function PlayGlyph({ playing }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      {playing ? (
        <>
          <rect x="2" y="1" width="3.5" height="12" fill="currentColor" />
          <rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" />
        </>
      ) : (
        <path d="M3 1 L12.5 7 L3 13 Z" fill="currentColor" />
      )}
    </svg>
  );
}

const PlayButton = memo(function PlayButton({ disabled }) {
  const playing = usePlaybackPlaying();
  const text = playing ? 'Pause' : 'Play';
  return (
    <button type="button" className="btn-primary play-btn" aria-label={text} onClick={() => playback.toggle()} disabled={disabled}>
      <PlayGlyph playing={playing} />
      <span>{text}</span>
    </button>
  );
});

function onSliderKeyDown(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowRight':
      e.preventDefault();
      playback.stepWindow(e.key === 'ArrowRight' ? 1 : -1);
      break;
    case 'PageDown':
    case 'PageUp':
      e.preventDefault();
      playback.stepSeconds(e.key === 'PageUp' ? 60 : -60);
      break;
    default:
      break; // Home/End stay native; Space is not handled here (UI-SPEC Keyboard table)
  }
}

const Scrubber = memo(function Scrubber({ id, view, disabled }) {
  const idx = usePlaybackIndex();
  const n = view ? view.n : 1;
  const i = Math.min(idx, n - 1);
  const valueText = view
    ? `t = ${fmtSeconds(view.t[i])} s of ${fmtSeconds(view.tEnd)} s${i >= view.jamIdx ? ', GPS jammed' : ''}`
    : 'Loading';
  return (
    <input
      id={id}
      type="range"
      className="scrubber"
      min={0}
      max={Math.max(0, n - 1)}
      step={1}
      value={i}
      aria-valuetext={valueText}
      onChange={(e) => playback.seekIndex(Number(e.target.value))}
      onKeyDown={onSliderKeyDown}
      disabled={disabled}
    />
  );
});

const TimeReadout = memo(function TimeReadout({ view }) {
  const time = usePlaybackTime();
  return (
    <span className="time-readout">
      {view ? `t = ${fmtSeconds(time)} s / ${fmtSeconds(view.tEnd)} s` : 't = – s'}
    </span>
  );
});

export default function ControlBar({ view, speed, onSpeedChange, disabled = false }) {
  const sliderId = useId();
  const speedId = useId();
  const off = disabled || !view;
  return (
    <div className="playback-row">
      <PlayButton disabled={off} />
      <div className="field field-slider">
        <label htmlFor={sliderId}>Flight time</label>
        <div className="slider-row">
          <Scrubber id={sliderId} view={view} disabled={off} />
          <TimeReadout view={view} />
        </div>
      </div>
      <div className="field field-speed">
        <label htmlFor={speedId}>Speed</label>
        <select id={speedId} value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} disabled={disabled}>
          {SPEEDS.map((s) => <option key={s} value={s}>{`${s}×`}</option>)}
        </select>
      </div>
    </div>
  );
}
