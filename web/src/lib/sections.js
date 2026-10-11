// Open/closed rule for the collapsed "This Run's IonQ job" and "Sensor" sections (UI-07, D-02).
// Both start collapsed. Entering 'result' opens both; entering 'fallback' opens only the job panel,
// because the failure detail lives there. Every other transition keeps whatever the user chose.

export const CLOSED = Object.freeze({ job: false, charts: false });

export function nextOpenState(prev, prevPhase, phase) {
  if (phase === prevPhase) return prev;
  if (phase === 'result') {
    return prev.job && prev.charts ? prev : { job: true, charts: true };
  }
  if (phase === 'fallback') {
    return prev.job ? prev : { job: true, charts: prev.charts };
  }
  return prev;
}
