// Page shell: artifact load, selection state (scenario, run mode, quantum track), the map-first
// layout, the global keyboard map, focus management, the single Announcer and the Qollab
// keep-alive. Per-frame state lives in the playback store, never in App state. The live run
// (plan 02-06) flies the scenario selected when Run is pressed and renders its result through
// the same uavView path as the replay; any failure shows that scenario's recorded replay from
// memory (no Python call). The sensor panel (right column from 900 px), the results section and
// "What is quantum here" (plan 02-07) follow the selected scenario; the comparison block always
// shows the recorded artifact. GHZ scaling comes from ghz_scaling_json: once at mount (model
// contrast) and again with this Run's measured contrasts after a live result.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlBar, { DEFAULT_SPEED } from './components/ControlBar.jsx';
import StatusStrip, {
  BUILTIN_NOTICE, LiveProgress, STEP_TEXT, idleHint, stepLine,
} from './components/StatusStrip.jsx';
import JobPanel, { bitsLabelOf } from './components/JobPanel.jsx';
import MapView from './components/MapView.jsx';
import ScenarioPicker from './components/ScenarioPicker.jsx';
import RunModePicker from './components/RunModePicker.jsx';
import QuantumTrackToggle from './components/QuantumTrackToggle.jsx';
import SensorPanel from './components/SensorPanel.jsx';
import MetricsTable from './components/MetricsTable.jsx';
import ComparisonBlock from './components/ComparisonBlock.jsx';
import TextAlternatives from './components/TextAlternatives.jsx';
import Announcer, { announce } from './components/Announcer.jsx';
import { useArtifact } from './hooks/useArtifact.js';
import { useLiveRun } from './hooks/useLiveRun.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';
import { playback } from './hooks/usePlayback.js';
import { QUANTUM_KEYS, errorAt, scenarioById, uavView } from './lib/artifactV2.js';
import {
  createThrottle, decodedText, fallbackText, finishedText, jamText, jobText, liveResultText, loadedText,
  pausedText, playText, progressText, readoutText, runModeText, scenarioText, shortJobId, stageText, trackText,
} from './lib/announce.js';
import { callPy, qBackend } from './bridge.js';
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
const runHelpAfter = (label) => `One IonQ job per Run, flown on ${label}. Press Stop, then Run on Qollab, to draw a new motor.`;
const otherHelp = (label) => `This Run's IonQ job was flown on ${label}. Showing the recorded replay here.`;
const lockHelp = (label) => `Map scenario is locked while the live run flies ${label}.`;
const successText = (s, label, jobId) => `Live run finished in ${s} s on ${label}. Motor drawn by IonQ job ${shortJobId(jobId)}.`;
const failureText = (failure, label) => (failure.timeout
  ? `Live run took longer than 90 s. Showing the recorded replay of ${label} with its stored motor. Press Stop, then Run on Qollab, to try again.`
  : `Live run failed: ${failure.name}: ${failure.message}. Showing the recorded replay of ${label} with its stored motor. Press Stop, then Run on Qollab, to try a new job.`);
const PROGRESS_EVERY_MS = 10 * 1000; // announced replay progress: at most once per 10 s wall time
// CLAUDE.md honesty constraint: printed verbatim in "What is quantum here".
const DG_SENTENCE = 'The quantum sensor\'s filter function is a physical fact about how such sensors work; the field it '
  + 'filters here is injected as gate angles rather than felt; the downstream benefit equals that of a classical notch '
  + 'filter, achieved earlier and without consuming dynamic range.';

// GHZ scaling payload from magnav.api; contrasts are this Run's (c1, c2, c4) or none (model).
async function loadGhz(c) {
  try {
    const res = c ? await callPy('ghz_scaling_json', c.c1 ?? null, c.c2 ?? null, c.c4 ?? null) : await callPy('ghz_scaling_json');
    if (res?.ok === true) return { status: 'ok', payload: res };
    return { status: 'error', payload: null, error: `${res?.error_type ?? 'Error'}: ${res?.error ?? 'ghz_scaling_json'}` };
  } catch (e) {
    return { status: 'error', payload: null, error: e?.message ?? String(e) };
  }
}

// One JSON call at mount for the static panels; a failure leaves that panel's empty state.
async function loadJson(name, key) {
  try {
    const res = await callPy(name);
    if (res?.ok === true) return { status: 'ok', record: key ? res[key] : res };
    if (res?.error_type === 'NotCaptured') return { status: 'missing', record: null };
    return { status: 'error', record: null, error: `${res?.error_type ?? 'Error'}: ${res?.error ?? name}` };
  } catch (e) {
    return { status: 'error', record: null, error: e?.message ?? String(e) };
  }
}

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
  const scenarioFocusRef = useRef(null);
  const runButtonRef = useRef(null);
  const endedRef = useRef(false);

  // Live run state: one job per Qollab Run (latched on the first press, never re-enabled).
  const hasBackend = Boolean(qBackend) || import.meta.env.DEV;
  const liveRun = useLiveRun({ hasBackend });
  const [runPhase, setRunPhase] = useState('idle'); // idle | running | result | fallback
  const [liveScenario, setLiveScenario] = useState(null);
  const [liveResults, setLiveResults] = useState({});
  const [quantum, setQuantum] = useState(null);
  const [failure, setFailure] = useState(null);
  const [doneS, setDoneS] = useState(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const latchRef = useRef(false);
  const [backendInfo, setBackendInfo] = useState(null);
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [hardware, setHardware] = useState({ status: 'loading', record: null });
  const [ghz, setGhz] = useState({ status: 'loading', payload: null });

  const activeSid = sid ?? artifact?.default_scenario ?? null;
  const activeQuantum = quantumKey
    ?? (QUANTUM_KEYS.includes(artifact?.default_estimator) ? artifact.default_estimator : 'quantum_ghz4');
  const live = mode === 'live';
  const liveEntry = live ? (liveResults[activeSid] ?? null) : null;
  // The live result renders through the same uavView path as the replay; otherwise (including
  // every fallback) the recorded replay of the selected scenario, straight from memory.
  const scenario = useMemo(() => {
    if (liveEntry) return liveEntry.scenario;
    return artifact ? scenarioById(artifact, activeSid) : null;
  }, [artifact, activeSid, liveEntry]);

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

  // Static panels at mount, queued on the bridge before any live call can be made.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const b = await loadJson('backend_info', null);
      if (!cancelled && b.status === 'ok') setBackendInfo(b.record);
      const c = await loadJson('circuit_json', 'circuit');
      if (!cancelled && c.status === 'ok') setCircuitInfo(c.record);
      const h = await loadJson('hardware_json', 'hardware');
      if (!cancelled) setHardware(h);
      const g = await loadGhz(null);
      if (g.status !== 'ok') console.error('[ghz] scaling failed', g.error);
      // A live result may already have replaced the model payload: never overwrite it.
      if (!cancelled) setGhz((prev) => (prev.status === 'ok' ? prev : g));
    })();
    return () => { cancelled = true; };
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
  // check runs on an animation-frame tick gated to once per IDLE_CHECK_MS, and when the tab
  // becomes visible again (rAF pauses in a hidden tab, so a long absence is caught up here before
  // the user can interact). Input is activity, never a trigger: it only refreshes lastActivity.
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
    const onActivity = () => { lastActivity = performance.now(); };
    const onVisible = () => {
      if (document.visibilityState === 'visible') check(performance.now());
    };
    document.addEventListener('pointerdown', onActivity, true);
    document.addEventListener('keydown', onActivity, true);
    document.addEventListener('visibilitychange', onVisible);
    const offEnd = playback.on('end', () => { lastActivity = performance.now(); });
    frame = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener('pointerdown', onActivity, true);
      document.removeEventListener('keydown', onActivity, true);
      document.removeEventListener('visibilitychange', onVisible);
      offEnd();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  // Scenario switch keeps the playback index, play state and quantum toggle (UI-SPEC).
  const onScenarioChange = useCallback((id) => {
    const sc = artifact ? scenarioById(artifact, id) : null;
    setSid(id);
    if (sc) announce(scenarioText(sc.label, sc.map_label, mode === 'live' && Boolean(liveResults[id])));
  }, [artifact, mode, liveResults]);

  const onModeChange = useCallback((m) => {
    setMode(m);
    announce(runModeText(m));
  }, []);

  const onQuantumChange = useCallback((k) => {
    setQuantumKey(k);
    announce(trackText(qLabelOf(k)));
  }, []);

  // Run one IonQ job: flies the selected scenario; latched for the rest of this Qollab Run.
  const onRun = useCallback(async () => {
    if (latchRef.current || !hasBackend || !artifact || !view) return;
    latchRef.current = true;
    const sc = activeSid;
    const label = scenarioById(artifact, sc)?.label ?? sc;
    // The Run button and the scenario radios disable themselves: park focus on the status
    // message rather than letting it drop to <body> (WR-02), and return it afterwards.
    const ae = document.activeElement;
    const fromScenario = Boolean(ae && scenarioFocusRef.current?.closest('fieldset')?.contains(ae));
    if (ae === runButtonRef.current || fromScenario) statusFocusRef.current?.focus();
    playback.pause();
    setLiveScenario(sc);
    setQuantum(null);
    setFailure(null);
    setRunPhase('running');
    liveRunFlag.inFlight = true;
    const progressAllowed = createThrottle(PROGRESS_EVERY_MS);
    progressAllowed.mark();
    try {
      const res = await liveRun.start({
        scenario: sc,
        simulateFailure,
        // Step 2 is announced by the job and decode summary below (the same moment).
        onStage: (n) => { if (n !== 2) announce(stageText(n, STEP_TEXT[n])); },
        onQuantum: (q) => {
          setQuantum(q);
          announce(`${jobText(q.job_id, q.backend)} ${decodedText(q.motor?.rpm_min, q.motor?.rpm_max, q.c_hat?.c4, bitsLabelOf(q))}`);
        },
        onStep: (step) => {
          if (!step.done && progressAllowed()) announce(progressText(step.samples_done, step.samples_total));
        },
      });
      const v = uavView(res.result.scenario);
      setQuantum(res.quantum);
      setLiveResults({ [sc]: res.result });
      setDoneS(Math.round(res.elapsedMs / 1000));
      setRunPhase('result');
      playback.load(v.t);
      if (reduced) {
        playback.seekIndex(v.n - 1);
      } else {
        playback.seekIndex(0);
        playback.play();
      }
      announce(liveResultText(label));
      // GHZ figure with this Run's measured contrasts; a failure keeps the previous payload.
      const c = res.quantum?.c_hat;
      if (c && [c.c1, c.c2, c.c4].some((x) => Number.isFinite(x))) {
        const g = await loadGhz(c);
        if (g.status === 'ok') setGhz(g);
        else console.error('[ghz] measured scaling failed', g.error);
      }
    } catch (e) {
      console.error('[live] failed', e);
      if (e?.quantum) setQuantum(e.quantum);
      setFailure({
        name: String(e?.name ?? 'Error'),
        message: String(e?.message ?? e),
        timeout: e?.name === 'TimeoutError',
      });
      setRunPhase('fallback');
      announce(fallbackText(label));
    } finally {
      liveRunFlag.inFlight = false;
      if (fromScenario && document.activeElement === statusFocusRef.current) scenarioFocusRef.current?.focus();
    }
  }, [hasBackend, artifact, view, activeSid, liveRun, simulateFailure, reduced]);

  const loadError = status === 'error' ? error : viewError;
  const danger = loadError
    ? `Could not load the recorded flights (${loadError}). Press Stop, then Run on Qollab, to reload.`
    : null;
  const ready = status === 'ready' && Boolean(view);
  const running = runPhase === 'running';
  const latched = runPhase !== 'idle';
  const flownLabel = liveScenario && artifact ? (scenarioById(artifact, liveScenario)?.label ?? liveScenario) : null;
  const onFlown = activeSid === liveScenario;
  const showingLive = Boolean(liveEntry);

  let helpLine = REPLAY_HELP;
  if (live) {
    if (!hasBackend) helpLine = RUN_HELP_NO_BACKEND;
    else if (!latched || running) helpLine = RUN_HELP_IDLE;
    else helpLine = onFlown ? runHelpAfter(flownLabel) : otherHelp(flownLabel);
  }

  let message = null;
  if (running) message = stepLine(liveRun.stage || 1);
  else if (view && showingLive && runPhase === 'result') message = successText(doneS, view.label, quantum?.job_id);
  else if (view) message = idleHint(view.label, view.jamT, live && !latched);

  const runDanger = runPhase === 'fallback' && failure && flownLabel ? failureText(failure, flownLabel) : null;
  const builtinNotice = quantum?.analytic_blocks === true && (running || showingLive) ? BUILTIN_NOTICE : null;
  let modeKey = 'replay';
  if (running) modeKey = 'computing';
  else if (showingLive) modeKey = 'computed';
  let motorKey = 'stored';
  if (running) motorKey = null;
  else if (showingLive) motorKey = 'drawn';

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
                disabled={!ready || running}
                lockHelp={running && flownLabel ? lockHelp(flownLabel) : null}
                focusRef={scenarioFocusRef}
              />
            )}
            <RunModePicker value={mode} onChange={onModeChange} disabled={!ready} />
            <div className="run-row">
              {live && (
                <button
                  type="button"
                  className="btn-primary run-button"
                  ref={runButtonRef}
                  onClick={onRun}
                  disabled={!ready || !hasBackend || latched}
                  aria-describedby="run-help"
                >
                  Run one IonQ job
                </button>
              )}
              <p id="run-help" className="help run-help">{helpLine}</p>
              {live && (
                <details className="demo-options">
                  <summary>Demo options</summary>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      disabled={latched}
                    />
                    Simulate a failure
                  </label>
                  <p className="help">
                    Starts the live run with a forced error before any IonQ job, to show the recorded-replay fallback.
                  </p>
                </details>
              )}
            </div>
            <QuantumTrackToggle value={activeQuantum} onChange={onQuantumChange} disabled={!ready} />
            <ControlBar view={view} speed={speed} onSpeedChange={setSpeed} disabled={!ready || running} />
          </section>

          <StatusStrip
            mode={modeKey}
            motor={motorKey}
            mapLabel={view ? view.mapLabel : null}
            fallbackLabel={live && runPhase === 'fallback' && onFlown ? flownLabel : null}
            bitsLabel={showingLive && quantum ? bitsLabelOf(quantum) : null}
            message={message}
            danger={runDanger}
            notice={builtinNotice}
            focusRef={statusFocusRef}
          >
            {running ? (
              <LiveProgress
                stage={liveRun.stage}
                progress={liveRun.progress}
                elapsedS={liveRun.elapsedS}
                reduced={reduced}
              />
            ) : null}
          </StatusStrip>

          <JobPanel
            storedMotor={artifact?.motor ?? null}
            quantum={quantum}
            started={latched}
            failed={runPhase === 'fallback'}
            backendName={backendInfo?.name ?? null}
            isIonq={backendInfo?.is_ionq === true}
            flownLabel={runPhase === 'result' ? flownLabel : null}
            hardware={hardware}
            circuitSha={circuitInfo?.circuit_sha256 ?? null}
            modelSha={liveResults[liveScenario]?.model_sha256 ?? artifact?.model_sha256 ?? null}
          />
        </div>

        <div className="col-right">
          <SensorPanel
            view={view}
            quantumKey={activeQuantum}
            ghz={ghz.payload}
            ghzStatus={ghz.status}
            measuredSource={quantum?.c_n_source ?? null}
          />
        </div>
      </div>

      <section className="panel results" aria-labelledby="results-heading">
        <h2 id="results-heading">Navigation accuracy</h2>
        <MetricsTable
          view={view}
          quantumKey={activeQuantum}
          thresholds={artifact?.thresholds_m ?? null}
          isLive={showingLive}
        />
        {artifact && <ComparisonBlock artifact={artifact} />}
        <TextAlternatives view={view} ghz={ghz.payload} />
      </section>

      <section className="panel quantum-here" aria-labelledby="quantum-here-heading">
        <h2 id="quantum-here-heading">What is quantum here</h2>
        <ul>
          <li>
            One IonQ job per Run holds one circuit: single-qubit Ramsey probes, GHZ-2 and GHZ-4 blocks, and
            random-number qubits.
          </li>
          <li>
            Its random bits draw this Run&apos;s motor, and its measured GHZ contrast sets the entangled probe&apos;s
            contrast in the emulator. On a simulator the bits are simulator-sampled; only a QPU run is physically random.
          </li>
          <li>The navigation flight itself is emulated in your browser, over the map you pick.</li>
        </ul>
        <p className="dg-sentence">{DG_SENTENCE}</p>
      </section>

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
