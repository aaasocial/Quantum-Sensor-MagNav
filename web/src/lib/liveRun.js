// Live-run driver (UI-SPEC "Live sequence", D-B). Pure ESM: the Python calls, the clock, the
// yield between chunks and the watchdog tick are injected, so node --test proves every decision.
//
// Sequence on the scenario selected when Run was pressed:
//   1 uav_start(scenario, simulateFailure)
//   2 uav_quantum(JOB_SHOTS)   this Run's one IonQ job -> onQuantum(payload)
//   3 live_step(STEP_BUDGET_MS) until done (the first call senses, the rest map-match)
//   4 live_result()            one scenario entry in the replay's shape
// The 90 s deadline is checked before every Python call. Any failure (ok:false, a thrown
// error, a wrong scenario, an invalid payload, the deadline or cancel()) rejects with a named
// Error after live_cancel has cleared the Python state; the caller shows the recorded replay.
//
// Watchdog: with an injected `nextFrame` (one animation frame in the app), every Python call is
// raced against the deadline and cancel(), re-checked each frame with the injected clock. A call
// that outlives the deadline is ABANDONED: the run rejects with TimeoutError at once, its late
// result is ignored, and live_cancel is queued behind it without being awaited. Pyodide cannot
// interrupt Python running on the page's thread; the bridge queue moves on only when it returns.

export const DEADLINE_MS = 90000;
export const STEP_BUDGET_MS = 250;
export const JOB_SHOTS = 1024;
const MAX_STEPS = 10000; // a Python run that never reports done still ends (by the deadline first)

export function namedError(name, message) {
  const e = new Error(message);
  e.name = name;
  return e;
}

// ok:false from Python becomes an Error named by its error_type.
export function checkOk(res, what) {
  if (!res || typeof res !== 'object') throw namedError('InvalidShape', `${what} returned no JSON object`);
  if (res.ok !== true) {
    throw namedError(String(res.error_type ?? 'Error'), String(res.error ?? `${what} failed`));
  }
  return res;
}

const timeoutError = () => namedError('TimeoutError', 'Live run took longer than 90 s');
const abortError = () => namedError('AbortError', 'Live run cancelled');

export async function runLive({
  callPy, scenario, hasBackend = true, simulateFailure = false, validate = () => [],
  now, yieldFn = async () => {}, nextFrame = null,
  onStage = () => {}, onQuantum = () => {}, onStep = () => {}, isCancelled = () => false,
}) {
  if (!hasBackend) {
    throw namedError('NoBackend', 'Needs a backend: press Run on Qollab and pick one');
  }
  const t0 = now();
  const elapsed = () => now() - t0;
  let stage = 0;
  let quantum = null;
  const enter = (n) => {
    if (n > stage) {
      stage = n;
      onStage(n);
    }
  };
  const check = () => {
    if (isCancelled()) throw abortError();
    if (elapsed() > DEADLINE_MS) throw timeoutError();
  };

  // Races one Python call against the deadline and cancel() (plain await without nextFrame).
  const call = async (...args) => {
    check();
    const p = Promise.resolve(callPy(...args));
    if (!nextFrame) return p;
    let settled = false;
    const watch = (async () => {
      while (!settled) {
        await nextFrame();
        if (settled) return undefined;
        let err = null;
        if (isCancelled()) err = abortError();
        else if (elapsed() > DEADLINE_MS) err = timeoutError();
        if (err) {
          err.abandoned = true;
          p.catch(() => {}); // the late result (or error) of the abandoned call is discarded
          throw err;
        }
      }
      return undefined;
    })();
    try {
      return await Promise.race([p, watch]);
    } finally {
      settled = true;
    }
  };

  try {
    enter(1);
    checkOk(await call('uav_start', scenario, Boolean(simulateFailure)), 'uav_start');
    await yieldFn(); // let "Step 1 of 4" paint before the job call

    quantum = checkOk(await call('uav_quantum', JOB_SHOTS), 'uav_quantum');
    enter(2);
    onQuantum(quantum);
    await yieldFn();

    for (let k = 0; ; k += 1) {
      if (k >= MAX_STEPS) throw namedError('InvalidShape', 'live_step never reported done');
      const step = checkOk(await call('live_step', STEP_BUDGET_MS), 'live_step');
      enter(3);
      onStep(step);
      if (step.done === true) break;
      await yieldFn();
    }

    await yieldFn();
    enter(4);
    const res = checkOk(await call('live_result'), 'live_result');
    const got = res?.scenario?.id;
    if (got !== scenario) {
      throw namedError('ScenarioMismatch', `live_result is for ${String(got)}, not ${String(scenario)}`);
    }
    const problems = validate(res);
    if (problems.length) throw namedError('InvalidPayload', problems.slice(0, 3).join('; '));
    return { ok: true, result: res, quantum, elapsedMs: elapsed() };
  } catch (err0) {
    const err = err0 instanceof Error ? err0 : namedError('Error', String(err0));
    try {
      const cancelled = Promise.resolve(callPy('live_cancel'));
      // An abandoned call still holds the bridge queue: queue the cancel, do not wait for it.
      if (err.abandoned) cancelled.catch(() => {});
      else await cancelled;
    } catch {
      // best effort: the run is already failing
    }
    err.stage = stage || 1;
    err.elapsedMs = elapsed();
    err.quantum = quantum;
    throw err;
  }
}

// One live run at a time. The in-flight flag is set before the first await, so a second
// start() is refused without touching Python. cancel() asks the run in flight to stop at its
// next check (or the next watchdog frame); the run then rejects with AbortError.
export function createLiveRunner(deps) {
  let inFlight = false;
  let cancelRequested = false;
  return {
    isInFlight: () => inFlight,
    start(args) {
      if (inFlight) return Promise.reject(namedError('Busy', 'A live run is already in progress'));
      inFlight = true;
      cancelRequested = false;
      return runLive({ ...deps, ...args, isCancelled: () => cancelRequested }).finally(() => {
        inFlight = false;
      });
    },
    cancel() {
      if (inFlight) cancelRequested = true;
    },
  };
}
