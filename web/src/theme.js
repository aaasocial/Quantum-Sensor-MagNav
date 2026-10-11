// JS mirror of the UI-SPEC series tokens (canvas, SVG and chart drawing read colours from here).
// Hex literals live only here and in app.css :root. Colour is always doubled by dash pattern,
// marker shape and a text label.

export const TRUTH = { key: 'truth', label: 'True path', color: '#F5F5F5', dash: '', mapDash: '', marker: 'uav' };
export const DR = {
  key: 'dead_reckoning', label: 'Dead reckoning (INS only)', color: '#009E73', dash: null, mapDash: '1 4', marker: 'square',
};

export const SERIES = {
  baseline_ls: {
    key: 'baseline_ls', label: 'Baseline: magnetometer + notch', short: 'Baseline',
    color: '#D55E00', dash: '8 4', mapDash: '8 5', marker: 'triangle',
  },
  // Table only: never drawn on the map or charted.
  baseline_mean: {
    key: 'baseline_mean', label: 'Baseline variant: block mean', short: 'Block mean',
    color: null, dash: null, mapDash: null, marker: null,
  },
  quantum_q1: {
    key: 'quantum_q1', label: 'Quantum: single-qubit Ramsey', short: 'Single-qubit',
    color: '#56B4E9', dash: '2 3', mapDash: '10 3 2 3', marker: 'diamond',
  },
  quantum_ghz4: {
    key: 'quantum_ghz4', label: 'Quantum: GHZ-4 entangled', short: 'GHZ-4 entangled',
    color: '#CC79A7', dash: '10 3 2 3', mapDash: '10 3 2 3', marker: 'circle',
  },
  truth: TRUTH,
  dead_reckoning: DR,
};

// Table row order (dead reckoning first) and the two quantum tracks the toggle picks between.
export const TABLE_ORDER = ['dead_reckoning', 'baseline_ls', 'baseline_mean', 'quantum_q1', 'quantum_ghz4'];
export const QUANTUM_ORDER = ['quantum_q1', 'quantum_ghz4'];

export const MOTOR = '#E69F00';
export const JAM_COLOR = '#FFD166';
export const CASING = '#000000';
export const INVALID_BASE = '#24282F';
export const INVALID_STRIPE = '#3A3F47';
export const TEXT_COLOR = '#E8EAED';

// Chart chrome (mirrors app.css --color-border, --color-text-muted, --color-accent).
export const GRID = '#3A404C';
export const MUTED = '#A9B0BB';
export const ACCENT = '#A5B4FC';
