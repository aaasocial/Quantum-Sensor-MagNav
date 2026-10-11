// Page shell: artifact load, selection state (scenario, run mode, quantum track), the map-first
// layout, the global keyboard map, focus management, the single Announcer and the Qollab
// keep-alive. Per-frame state lives in the playback store, never in App state. In this slice
// the page shows the recorded replay of the selected scenario; the live run (plan 02-06) and
// the sensor panel and results (plan 02-07) plug into the slots below.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlBar, { DEFAULT_SPEED } from './components/ControlBar.jsx';
import StatusStrip, { idleHint } from './components/StatusStrip.jsx';
import MapView from './components/MapView.jsx';
import ScenarioPicker from './components/ScenarioPicker.jsx';
import RunModePicker from './components/RunModePicker.jsx';
import QuantumTrackToggle from './components/QuantumTrackToggle.jsx';
import Announcer, { announce } from './components/Announcer.jsx';
import { useArtifact } from './hooks/useArtifact.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';
import { playback } from './hooks/usePlayback.js';
import { QUANTUM_KEYS, errorAt, scenarioById, uavView } from './lib/artifactV2.js';
import {
  createThrottle, finishedText, jamText, loadedText, pausedText, playText, readoutText, runModeText,
  scenarioText, trackText,
} from './lib/announce.js';
import { qBackend } from './bridge.js';
import { logFrameProbe, logTimerProbe } from './probe.js';
import { SERIES } from './theme.js';

const BASELINE_KEY = 'baseline_ls';
const IDLE_LIMIT_MS = 30 * 60 * 1000; // keep-alive bound: 30 min with no input
const IDLE_CHECK_MS = 30 * 1000;
const READOUT_EVERY_MS = 10 * 1000; // announced error readout: at most once per 10 s wall time

const RUN_HELP_IDLE = 'Draws this Run\'s motor from quantum random bits, measures the GHZ contrast, then flies the UAV '
  + 'over the selected map in your browser (up to 90 s). If anything fails, that map\'s recorded replay is shown.';
const RUN_HELP_NO_BACKEND = 'Needs a backend: press Run on Qollab and pick one. The recorded replays work without it.';
const REPLAY_HELP = 'Recorded replay: stored motor draw, no IonQ job.';

// main.jsx awaits runDone to keep the Qollab run alive. It resolves only on the idle bound;
// never because no backend is selected (the replay needs none). Resolving twice is harmless.
let resolveRunDone;
export const runDone = new Promise((resolve) => { resolveRunDone = resolve; });

// Set by the live run (plan 02-06); the idle check never ends the run while it is true.
export const liveRunFlag = { inFlight: false };

const SKIP_TARGETS = 'input, select, textarea, button, summary, [contenteditable]';

export default function App() {
  const { status, artifact, error } = useArtifact();
  const reduced = useReducedMotion();
  const [sid, setSid] = useState(null);
  const [mode, setMode] = useState('live');
  const [quantumKey, setQuantumKey] = useState(null);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const statusFocusRef = useRef(null);
  const endedRef = useRef(false);

  const activeSid = sid ?? artifact?.default_scenario ?? null;
  const activeQuantum = quantumKey
    ?? (QUANTUM_KEYS.includes(artifact?.default_estimator) ? artifact.default_estimator : 'quantum_ghz4');
  const scenario = useMemo(() => (artifact ? scenarioById(artifact, activeSid) : null), [artifact, activeSid]);

  const { view, viewError } = useMemo(() => {
    if (!scenario) return { view: null, viewError: null };
    try {
      return { view: uavView(scenario), viewError: null };
    } catch (e) {
      return { view: null, viewError: e?.message ?? String(e) };
    }
  }, [scenario]);

  const viewRef = useRef(view);
  viewRef.current = view;
  const quantumRef = useRef(activeQuantum);
  quantumRef.current = activeQuantum;
  const loadedRef = useRef(false);

  const qLabelOf = (k) => SERIES[k]?.label ?? k;

  // Both scenarios share the same display time axis: load it once, then keep the playhead and
  // play state across scenario switches. On load the playhead sits at the final index (A-6),
  // so every track is complete with zero interaction.
  useEffect(() => {
    if (!view || loadedRef.current) return;
    loadedRef.current = true;
    playback.load(view.t);
    playback.seekIndex(view.n - 1);
    announce(loadedText(view.label, view.mapLabel));
  }, [view]);

  useEffect(() => { playback.setSpeed(speed); }, [speed]);
  useEffect(() => { playback.setReduced(reduced); }, [reduced]);

  // Playback announcements: play/pause, jam crossed once per forward pass, the throttled
  // error readout while playing after the metric start, and replay finished.
  useEffect(() => {
    const readoutAllowed = createThrottle(READOUT_EVERY_MS);
    let prevIdx = playback.getIndex();
    const offPlay = playback.on('play', () => {
      readoutAllowed.mark();
      announce(playText(playback.getSpeed()));
    });
    const offPause = playback.on('pause', () => announce(pausedText(playback.getTime())));
    const offEnd = playback.on('end', () => {
      const v = viewRef.current;
      if (!v) return;
      const k = quantumRef.current;
      const i = v.n - 1;
      announce(finishedText(qLabelOf(k), errorAt(v, k, i), errorAt(v, BASELINE_KEY, i)));
    });
    const unsubscribe = playback.subscribe(() => {
      const v = viewRef.current;
      const idx = playback.getIndex();
      const prev = prevIdx;
      prevIdx = idx;
      if (!v || !playback.isPlaying()) return;
      if (prev < v.jamIdx && v.jamIdx <= idx) {
        readoutAllowed.mark();
        announce(jamText(v.jamT));
        return;
      }
      if (idx >= v.metricStartIdx && idx < v.n && readoutAllowed()) {
        const k = quantumRef.current;
        const err = errorAt(v, k, idx);
        if (err !== null) announce(readoutText(v.t[idx], qLabelOf(k), err, errorAt(v, BASELINE_KEY, idx)));
      }
    });
    return () => {
      offPlay();
      offPause();
      offEnd();
      unsubscribe();
    };
  }, []);

  // Probes once on mount (Pitfalls 5 and 7).
  useEffect(() => {
    logTimerProbe();
    logFrameProbe();
  }, []);

  // Global keyboard map (UI-SPEC Keyboard table). Form controls keep their native keys; the
  // slider handles its own arrows and PageUp/PageDown.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target;
      if (el instanceof Element && el.closest(SKIP_TARGETS)) return;
      const v = viewRef.current;
      if (!v) return;
      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          if (e.repeat) break; // holding Space must not toggle at key-repeat rate
          playback.toggle();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          playback.stepWindow(e.key === 'ArrowRight' ? 1 : -1);
          break;
        case 'Home':
          e.preventDefault();
          playback.seekIndex(0);
          break;
        case 'End':
          e.preventDefault();
          playback.seekIndex(v.n - 1);
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          playback.seekTime(v.jamT - 5);
          break;
        default:
          break;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Keep-alive idle bound. No first-party timers (Qollab injects its own timer functions): the
  // check runs on input and on an animation-frame tick gated to once per IDLE_CHECK_MS.
  useEffect(() => {
    let lastActivity = performance.now();
    let lastCheck = lastActivity;
    let frame = null;
    const busy = () => playback.isPlaying() || liveRunFlag.inFlight;
    const check = (now) => {
      if (endedRef.current) return;
      if (busy()) {
        lastActivity = now; // playing or computing counts as activity
        return;
      }
      if (now - lastActivity >= IDLE_LIMIT_MS) {
        endedRef.current = true;
        resolveRunDone();
      }
    };
    const tick = (ts) => {
      frame = null;
      if (endedRef.current) return;
      if (ts - lastCheck >= IDLE_CHECK_MS) {
        lastCheck = ts;
        check(performance.now());
      }
      frame = requestAnimationFrame(tick);
    };
    const onActivity = () => {
      const now = performance.now();
      check(now);
      lastActivity = now;
    };
    document.addEventListener('pointerdown', onActivity, true);
    document.addEventListener('keydown', onActivity, true);
    const offEnd = playback.on('end', () => { lastActivity = performance.now(); });
    frame = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener('pointerdown', onActivity, true);
      document.removeEventListener('keydown', onActivity, true);
      offEnd();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  // Scenario switch keeps the playback index, play state and quantum toggle (UI-SPEC).
  const onScenarioChange = useCallback((id) => {
    const sc = artifact ? scenarioById(artifact, id) : null;
    setSid(id);
    if (sc) announce(scenarioText(sc.label, sc.map_label, false));
  }, [artifact]);

  const onModeChange = useCallback((m) => {
    setMode(m);
    announce(runModeText(m));
  }, []);

  const onQuantumChange = useCallback((k) => {
    setQuantumKey(k);
    announce(trackText(qLabelOf(k)));
  }, []);

  const loadError = status === 'error' ? error : viewError;
  const danger = loadError
    ? `Could not load the recorded flights (${loadError}). Press Stop, then Run on Qollab, to reload.`
    : null;
  const ready = status === 'ready' && Boolean(view);
  const hasBackend = Boolean(qBackend) || import.meta.env.DEV;
  const live = mode === 'live';
  const helpLine = live ? (hasBackend ? RUN_HELP_IDLE : RUN_HELP_NO_BACKEND) : REPLAY_HELP;
  const message = view ? idleHint(view.label, view.jamT, live) : null;

  return (
    <main className="page">
      <header className="page-header">
        <h1>Quantum MagNav: a UAV holding position without GPS</h1>
        <p className="intro">
          After GPS is jammed, the UAV navigates by matching its magnetometer reading to a magnetic anomaly map;
          an emulated Ramsey quantum sensor and an ordinary magnetometer with a classical notch each feed the same
          map matcher.
        </p>
      </header>

      {danger && <p className="danger-notice">{danger}</p>}

      <div className="layout">
        <div className="col-left">
          <MapView view={view} quantumKey={activeQuantum} />

          <section className="panel controls" aria-label="Run controls">
            {artifact && (
              <ScenarioPicker
                scenarios={artifact.scenarios}
                value={activeSid}
                onChange={onScenarioChange}
                disabled={!ready}
              />
            )}
            <RunModePicker value={mode} onChange={onModeChange} disabled={!ready} />
            <p className="help run-help">{helpLine}</p>
            <QuantumTrackToggle value={activeQuantum} onChange={onQuantumChange} disabled={!ready} />
            <ControlBar view={view} speed={speed} onSpeedChange={setSpeed} disabled={!ready} />
          </section>

          <StatusStrip
            mode="replay"
            motor="stored"
            mapLabel={view ? view.mapLabel : null}
            message={message}
            focusRef={statusFocusRef}
          />
        </div>
      </div>

      <Announcer />

      <footer>
        <p>
          This effort is supported by Qollab &amp; IonQ. · Survey map: MagNav.jl Eastern_395 · Data supported by
          USAF FA8750-19-2-1000 · Synthetic map generated by this project from a fixed seed · MIT License
        </p>
      </footer>
    </main>
  );
}
