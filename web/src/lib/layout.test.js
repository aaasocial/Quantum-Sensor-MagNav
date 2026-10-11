// Page layout after Eason's 2026-10-11 requests: the position-error box is the first item of
// "Navigation accuracy" (above the benchmark), the row under the map holds only the jam banner,
// and the per-track CEP table and two-scenario comparison are README-only. Second request: the
// map has the (wider) left column to itself; the right column holds Navigation accuracy, then the
// Run controls and status, then the collapsed job and Sensor sections. Fourth request: the map
// follows the UAV zoomed in by default, so the baseline track is drawn and listed again (Map view
// radio group in Demo options). Static checks on the component sources
// (node --test has no DOM); web/scripts/audit.mjs checks the rendered page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const src = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const app = src('App.jsx');
const mapView = src('components/MapView.jsx');

test('the error box opens the Navigation accuracy card, above the benchmark card', () => {
  const start = app.indexOf('<h2 id="results-heading">Navigation accuracy</h2>');
  const end = app.indexOf('</section>', start);
  assert.ok(start > 0 && end > start);
  const section = app.slice(start, end);
  const readout = section.indexOf('<ErrorReadout view={view} quantumKey={activeQuantum} />');
  assert.ok(readout > 0, 'ErrorReadout not in the results section');
  assert.ok(!section.includes('<BenchmarkTable'), 'the benchmark is a separate card');
  assert.ok(app.indexOf('<BenchmarkTable') > end, 'ErrorReadout must precede BenchmarkTable');
  // first child after the heading: nothing but whitespace between them
  assert.equal(section.slice(section.indexOf('</h2>') + 5, readout).trim(), '');
  assert.equal(app.split('<ErrorReadout').length - 1, 1, 'exactly one error box on the page');
});

test('the row under the map keeps only the jam banner', () => {
  assert.ok(!mapView.includes('<ErrorReadout'), 'MapView must not render the error box');
  const row = mapView.slice(mapView.indexOf('<div className="readout-row">'));
  assert.match(row, /^<div className="readout-row">\s*<div className="jam-slot">\s*<JamBanner view=\{view\} \/>/);
});

test('the per-track CEP table and the comparison block are not on the page', () => {
  for (const name of ['MetricsTable', 'ComparisonBlock']) {
    assert.ok(!app.includes(name), `${name} still referenced in App.jsx`);
    assert.ok(!existsSync(new URL(`../components/${name}.jsx`, import.meta.url)), `${name}.jsx still exists`);
  }
});

test('the error box is not a live region (the single Announcer speaks the readout)', () => {
  const box = src('components/ErrorReadout.jsx');
  assert.ok(!box.includes('aria-live'));
  assert.ok(!box.includes('role="status"'));
  assert.ok(box.includes('usePlaybackIndex()'), 'the box must follow the playback index');
});

test('the left column holds only the map; the right column runs results, controls, status, job, Sensor', () => {
  const left = app.slice(app.indexOf('<div className="col-left">'), app.indexOf('<div className="col-right">'));
  assert.match(left, /^<div className="col-left">\s*<MapView view=\{view\} quantumKey=\{activeQuantum\} mapMode=\{mapMode\} \/>\s*<\/div>\s*$/);
  const right = app.slice(app.indexOf('<div className="col-right">'), app.indexOf('className="panel quantum-here"'));
  const at = (needle) => {
    const k = right.indexOf(needle);
    assert.ok(k > 0, `${needle} not in the right column`);
    return k;
  };
  const order = [
    '<h2 id="results-heading">Navigation accuracy</h2>',
    '<div className="controls" role="group" aria-label="Run controls">',
    '<ScenarioPicker',
    '<RunModePicker',
    'Run one IonQ job',
    '<legend>Demo options</legend>',
    '<QuantumTrackToggle',
    '<ControlBar',
    '<section className="panel benchmark-card" aria-label="Benchmark">',
    '<BenchmarkTable',
    '<StatusStrip',
    'className="panel job-section"',
    'className="panel sensor-section"',
  ].map(at);
  for (let k = 1; k < order.length; k += 1) assert.ok(order[k] > order[k - 1], `right column out of order at ${k}`);
});

test('two columns from 900 px give the map the wider column', () => {
  const css = src('app.css');
  const wide = css.slice(css.indexOf('@media (min-width: 900px) {'));
  assert.match(wide.slice(0, wide.indexOf('\n}')), /\.layout:has\(> \.col-right\) \{ grid-template-columns: minmax\(0, 3fr\) minmax\(0, 2fr\);/);
});

test('the map draws and lists the classical baseline track again (follow view separates it)', () => {
  assert.ok(mapView.includes("const BASELINE_KEY = 'baseline_ls';"), 'MapView must read the baseline estimate');
  assert.ok(mapView.includes('sliceStr(px.base.str, jamIdx)'), 'baseline polyline missing');
  assert.ok(mapView.includes('<Marker shape={B.marker} x={base[0]} y={base[1]}'), 'baseline marker missing');
  const legend = mapView.slice(mapView.indexOf('<ul className="map-legend">'), mapView.indexOf('</ul>'));
  assert.ok(legend.includes('<LegendSwatch series={B} shape={B.marker} dash="" width={6} />'), 'legend lacks the baseline');
  assert.ok(legend.indexOf('series={B}') < legend.indexOf('series={quantum}'), 'baseline listed before the quantum track');
  assert.ok(mapView.includes('baseline wide orange band (triangle)'));
  assert.ok(!mapView.includes('The classical baseline is not drawn'));
});

test('the map view control sits in Demo options, defaults to following the UAV, outside the live-only block', () => {
  assert.ok(mapView.includes("export const DEFAULT_MAP_MODE = 'follow';"));
  assert.match(mapView, /\{ key: 'follow', label: 'Follow the UAV \(zoomed\)' \},\s*\{ key: 'full', label: 'Full trajectory' \}/);
  const demo = app.slice(app.indexOf('<fieldset className="demo-options">'), app.indexOf('<QuantumTrackToggle', app.indexOf('<fieldset className="demo-options">')));
  assert.ok(demo.includes('<legend>Map view</legend>'));
  assert.ok(demo.includes('type="radio"'));
  assert.ok(!demo.includes('{live && ('), 'map view must not depend on live mode');
  assert.ok(app.includes('<MapView view={view} quantumKey={activeQuantum} mapMode={mapMode} />'));
  assert.ok(app.includes('useState(DEFAULT_MAP_MODE)'));
});

test('one card holds Navigation accuracy and the Run controls; the benchmark is its own card', () => {
  const start = app.indexOf('<section className="panel results" aria-labelledby="results-heading">');
  const end = app.indexOf('</section>', start);
  const card = app.slice(start, end);
  for (const needle of ['<ErrorReadout', 'aria-label="Run controls"', '<ScenarioPicker', '<RunModePicker',
    'Run one IonQ job', '<legend>Demo options</legend>', '<legend>Map view</legend>', '<QuantumTrackToggle', '<ControlBar']) {
    assert.ok(card.includes(needle), `${needle} not in the Navigation accuracy card`);
  }
  const demo = card.slice(card.indexOf('<fieldset className="demo-options">'), card.indexOf('<ControlBar'));
  assert.ok(demo.includes('<QuantumTrackToggle'), 'quantum-track toggle sits in Demo options');
  const bench = app.slice(app.indexOf('className="panel benchmark-card"'));
  assert.ok(bench.slice(0, bench.indexOf('</section>')).includes('<BenchmarkTable'));
});

test('Demo options is always visible and the forced-failure control is gone (adhoc5)', () => {
  assert.ok(app.includes('<fieldset className="demo-options">'));
  assert.ok(!app.includes('<details className="demo-options">'));
  assert.ok(!app.includes('Simulate a failure'));
  assert.ok(!app.includes('setSimulateFailure'));
});

test('the error box shows the per-Run signal error from line metrics, with 1/2 decimals and placeholders', () => {
  const box = src('components/ErrorReadout.jsx');
  assert.ok(box.includes('Signal error this Run: baseline'));
  assert.ok(box.includes('rmseValue(view, BASELINE_KEY), 1)'));
  assert.ok(box.includes('rmseValue(view, quantumKey), 2)'));
  assert.ok(box.includes('<SignalLine view={null}'), 'idle state renders placeholder dashes');
  const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
  assert.match(css, /\.error-readout \{[^}]*height: 96px;/);
});
