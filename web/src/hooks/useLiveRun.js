// Thin React wrapper around createLiveRunner: the real bridge callPy (probed), performance.now,
// a MessageChannel yield between chunks and an animation-frame watchdog tick. Every decision
// (sequence, 90 s deadline, abandon, cancel, payload checks) lives in lib/liveRun.js and is
// node-tested; this hook only mirrors stage, progress and the watchdog seconds into React state.
// No timers: Qollab injects its own timer functions, so nothing here schedules on them.
import { useCallback, useEffect, useRef, useState } from 'react';
import { callPy } from '../bridge.js';
import { validateLivePayload } from '../lib/artifactV2.js';
import { createLiveRunner } from '../lib/liveRun.js';
import { probeLiveCall } from '../probe.js';

// One macrotask turn so input and paint can run between Python chunks (no timers, no rAF).
function yieldToEventLoop() {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      ch.port1.close();
      resolve();
    };
    ch.port2.postMessage(0);
  });
}

// Watchdog tick: one animation frame, so a pending Python call is checked against the 90 s
// deadline about 60 times a second without timers or a busy loop. In a hidden tab rAF pauses,
// and the check resumes when the tab is shown again.
function nextFrame() {
  return new Promise((resolve) => { requestAnimationFrame(() => resolve()); });
}

const runner = createLiveRunner({
  callPy: probeLiveCall(callPy),
  now: () => performance.now(),
  yieldFn: yieldToEventLoop,
  nextFrame,
  validate: validateLivePayload,
});

const EMPTY = { samplesDone: 0, samplesTotal: 0, windowsDone: 0, windowsTotal: 0, stage: null };

export function useLiveRun({ hasBackend }) {
  const [inFlight, setInFlight] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(EMPTY);
  const [elapsedS, setElapsedS] = useState(0);
  const t0Ref = useRef(0);

  // Watchdog seconds for the progress row: text only, updated when the whole second changes.
  useEffect(() => {
    if (!inFlight) return undefined;
    let frame = null;
    let shown = -1;
    const tick = () => {
      const s = Math.floor((performance.now() - t0Ref.current) / 1000);
      if (s !== shown) {
        shown = s;
        setElapsedS(s);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { if (frame !== null) cancelAnimationFrame(frame); };
  }, [inFlight]);

  // Resolves {ok, result, quantum, elapsedMs}; rejects with a named Error (see lib/liveRun.js).
  const start = useCallback(async ({
    scenario, simulateFailure = false, onStage, onQuantum, onStep,
  }) => {
    if (runner.isInFlight()) throw Object.assign(new Error('A live run is already in progress'), { name: 'Busy' });
    t0Ref.current = performance.now();
    setInFlight(true);
    setStage(0);
    setProgress(EMPTY);
    setElapsedS(0);
    try {
      const res = await runner.start({
        scenario,
        hasBackend,
        simulateFailure,
        onStage: (n) => {
          setStage(n);
          onStage?.(n);
        },
        onQuantum: (q) => onQuantum?.(q),
        onStep: (step) => {
          setProgress({
            samplesDone: Number(step.samples_done ?? 0),
            samplesTotal: Number(step.samples_total ?? 0),
            windowsDone: Number(step.windows_done ?? 0),
            windowsTotal: Number(step.windows_total ?? 0),
            stage: step.stage ?? null,
          });
          onStep?.(step);
        },
      });
      console.log('[probe] live_summary', JSON.stringify({
        scenario, totalS: Math.round(res.elapsedMs) / 1000, outcome: 'ok', jobId: res.quantum?.job_id ?? null,
      }));
      return res;
    } catch (e) {
      console.log('[probe] live_summary', JSON.stringify({
        scenario, totalS: Math.round(e?.elapsedMs ?? 0) / 1000, outcome: `${e?.name}: ${e?.message}`,
      }));
      throw e;
    } finally {
      setInFlight(false);
    }
  }, [hasBackend]);

  const cancel = useCallback(() => runner.cancel(), []);

  return { inFlight, stage, progress, elapsedS, start, cancel };
}
