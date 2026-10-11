// aria-live phrasing (UI-SPEC "aria-live phrasing", one polite region). Pure ESM so node --test
// can import it. Numbers are spoken as whole integers without separators; never use the
// multiplication sign. Scenario labels and map labels are artifact strings passed in verbatim.

const int = (n) => String(Math.round(Number(n)));
const noEllipsis = (s) => String(s).replace(/…$/, '');

// Returns allow(): true at most once per intervalMs of wall time (measured from the last
// allowed or marked call). allow.mark() starts a new interval without announcing, so a
// throttled readout never clobbers a just-made announcement; allow.reset() clears it.
export function createThrottle(intervalMs, now = () => globalThis.performance.now()) {
  let last = null;
  const allow = () => {
    const t = now();
    if (last !== null && t - last < intervalMs) return false;
    last = t;
    return true;
  };
  allow.mark = () => { last = now(); };
  allow.reset = () => { last = null; };
  return allow;
}

export const speedWords = (speed) => `${int(speed)} times speed`;

export const loadedText = (label, mapLabel) =>
  `Recorded flights loaded. Scenario: ${label}, ${mapLabel}. Press Run one IonQ job, or Play.`;

export const scenarioText = (label, mapLabel, live = false) =>
  `Scenario: ${label}, ${mapLabel}. ${live ? "Showing this Run's live result" : 'Showing recorded replay'}.`;

export const runModeText = (mode) => `Run mode: ${mode === 'live' ? 'live' : 'recorded replay'}.`;

export const playText = (speed) => `Playing at ${speedWords(speed)}.`;

export const pausedText = (t) => `Paused at ${int(t)} seconds.`;

export const jamText = (t) => `GPS jammed at ${int(t)} seconds. Navigating by magnetic map matching.`;

export const readoutText = (t, quantumLabel, err, baseErr) =>
  `${int(t)} seconds. ${quantumLabel}: ${int(err)} metres. Baseline: ${int(baseErr)} metres.`;

export const trackText = (quantumLabel) => `Quantum track: ${quantumLabel}.`;

// A trailing ellipsis in the badge ("computing in-page…") is dropped so speech ends on one full stop.
export const modeText = (badge) => `Mode: ${noEllipsis(badge)}.`;

export const stageText = (n, text) => `Step ${int(n)} of 4: ${noEllipsis(text)}.`;

export const finishedText = (quantumLabel, err, baseErr) => {
  const ok = (v) => v !== null && v !== undefined && Number.isFinite(Number(v));
  if (!ok(err) || !ok(baseErr)) return 'Replay finished.';
  return `Replay finished. ${quantumLabel}: ${int(err)} metres. Baseline: ${int(baseErr)} metres.`;
};
