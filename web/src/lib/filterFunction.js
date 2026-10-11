// Ramsey filter function, the JS twin of magnav/ramsey.py filter_function: |sinc(f tau)| with
// the normalised sinc sin(pi x)/(pi x), so the nulls sit at f = k / tau. Pure ESM (node --test).
// tests/test_filter_parity.py checks this file against numpy.

export const DB_FLOOR = 1e-6; // -120 dB, as magnav uses max(response, 1e-6)

export function response(fHz, tauS) {
  const x = Number(fHz) * Number(tauS);
  if (x === 0) return 1;
  const px = Math.PI * x;
  return Math.abs(Math.sin(px) / px);
}

export function responseDb(fHz, tauS) {
  return 20 * Math.log10(Math.max(response(fHz, tauS), DB_FLOOR));
}

// Motor harmonic frequencies k * rpm / 60 for k = 1..K (Hz).
export function harmonics(rpm, K = 4) {
  const f1 = Number(rpm) / 60;
  return Array.from({ length: K }, (_, i) => (i + 1) * f1);
}

// Filter nulls k / tau for k = 1..count (Hz).
export function nulls(tauS, count = 4) {
  return Array.from({ length: count }, (_, i) => (i + 1) / Number(tauS));
}

// Chart rows {f, db} from 0 to fMax inclusive.
export function curve(tauS, fMax, nPts = 241) {
  const out = new Array(nPts);
  for (let i = 0; i < nPts; i += 1) {
    const f = (fMax * i) / (nPts - 1);
    out[i] = { f, db: responseDb(f, tauS) };
  }
  return out;
}
