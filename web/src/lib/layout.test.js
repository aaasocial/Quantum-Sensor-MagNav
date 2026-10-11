// Page layout after Eason's 2026-10-11 request: the position-error box is the first item of
// "Navigation accuracy" (above the benchmark), the row under the map holds only the jam banner,
// and the per-track CEP table and two-scenario comparison are README-only. Static checks on the
// component sources (node --test has no DOM); web/scripts/audit.mjs checks the rendered page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const src = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const app = src('App.jsx');
const mapView = src('components/MapView.jsx');

test('the error box opens the Navigation accuracy section, above the benchmark', () => {
  const start = app.indexOf('<h2 id="results-heading">Navigation accuracy</h2>');
  const end = app.indexOf('</section>', start);
  assert.ok(start > 0 && end > start);
  const section = app.slice(start, end);
  const readout = section.indexOf('<ErrorReadout view={view} quantumKey={activeQuantum} />');
  const bench = section.indexOf('<BenchmarkTable');
  assert.ok(readout > 0, 'ErrorReadout not in the results section');
  assert.ok(bench > readout, 'ErrorReadout must precede BenchmarkTable');
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
