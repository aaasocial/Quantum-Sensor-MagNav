// Accessibility audit + README hero screenshot (A11Y-03, D-13). Dev-time only: Vite builds only
// src/main.jsx, so this file is never bundled. main.js imports 'magnav.api' (Pyodide), so the
// audit targets the Vite dev server, where vite.config.js aliases magnav.api to the dev stub.
// Run from anywhere: `npm --prefix web run audit` or `cd web && node scripts/audit.mjs`.
// Writes results/a11y_axe.json, results/a11y_keyboard.json and docs/hero.png (no timestamps).
// Exit 1 on any critical/serious axe violation, an unreached keyboard target, sections not
// auto-opened after the simulated Run, a change in the height of the jam-banner row under the map
// (D-03) or of the position-error box, or a layout check failure: the error box must be the first
// item of "Navigation accuracy" (above the benchmark) and not under the map, and the per-track CEP
// table and the two-scenario comparison (README-only since the 03-07 ad-hoc change) must be absent.
// Since the second ad-hoc change: the left column holds only the map; the right column runs
// Navigation accuracy, Run controls, Run status, job, Sensor (DOM order = single-column order); at
// the wide viewport the error box sits beside the map (to its right, within its height) and the
// map column is the wider one. Since the fourth ad-hoc change: the map follows the UAV zoomed in
// by default (Map view radio group in Demo options, keyboard operable), and the legend and overlay
// carry the classical-baseline track again. Same request: the right column's first card holds
// Navigation accuracy (heading, error box) and directly under it the Run controls group (with the
// quantum-track toggle inside Demo options); the benchmark is a separate card below it.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERO = `${ROOT}docs/hero.png`;
const AXE_OUT = `${ROOT}results/a11y_axe.json`;
const KEY_OUT = `${ROOT}results/a11y_keyboard.json`;
const PORT = 5173;
const PAGE_URL = `http://127.0.0.1:${PORT}/`;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const VIEWPORTS = [['wide', { width: 1280, height: 900 }], ['narrow', { width: 390, height: 844 }]];
const MAX_TABS = 80;
const RESULT_TEXT = 'Live run finished';
const RUN_TIMEOUT_MS = 60_000;
const write = (path, obj) => writeFileSync(path, JSON.stringify(obj, null, 1) + '\n');

const pick = (r) => r.violations.map((v) => ({
  id: v.id,
  impact: v.impact,
  help: v.help,
  nodes: v.nodes.length,
  targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
}));

async function axe(page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return { version: r.testEngine.version, violations: pick(r) };
}

async function openPage(browser, viewport) {
  // AxeBuilder needs a page from an explicit context (browser.newPage is rejected); one
  // context per page keeps every pass on a fresh stub (one job per page load).
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('close', () => { context.close().catch(() => {}); });
  await page.goto(PAGE_URL);
  await page.getByRole('heading', { name: 'Navigation accuracy' }).waitFor();
  await page.waitForTimeout(1500); // map canvas draw; with reduced motion the replay sits at its end
  return page;
}

const readoutHeight = (page) => page.evaluate(
  () => Math.round(document.querySelector('.readout-row').getBoundingClientRect().height * 100) / 100,
);
const errorBoxHeight = (page) => page.evaluate(
  () => Math.round(document.querySelector('.results .error-readout').getBoundingClientRect().height * 100) / 100,
);

// Where the position-error box sits, and that the README-only tables are gone from the page.
const layoutCheck = (page) => page.evaluate(() => {
  const results = document.querySelector('section.results');
  const heading = results?.querySelector(':scope > h2');
  const first = heading?.nextElementSibling ?? null;
  const box = results?.querySelector(':scope > .error-readout') ?? null;
  const bench = document.querySelector('section.benchmark-card > .benchmark');
  const controlsInCard = Boolean(results?.querySelector(':scope > .controls[aria-label="Run controls"]'));
  const toggleInDemo = Boolean(document.querySelector('details.demo-options .quantum-toggle, details.demo-options fieldset input[name="quantum-track"], details.demo-options [data-quantum-toggle]'))
    || [...document.querySelectorAll('details.demo-options legend')].some((l) => /quantum/i.test(l.textContent));
  const captions = [...document.querySelectorAll('caption')].map((c) => c.textContent);
  const headings = [...document.querySelectorAll('h2, h3')].map((h) => h.textContent.trim());
  return {
    error_box_first_in_results: Boolean(box) && first === box,
    error_box_above_benchmark: Boolean(box && bench)
      && Boolean(box.compareDocumentPosition(bench) & Node.DOCUMENT_POSITION_FOLLOWING),
    error_boxes_on_page: document.querySelectorAll('.error-readout').length,
    run_controls_in_accuracy_card: controlsInCard,
    benchmark_separate_card: Boolean(bench) && !results?.contains(bench),
    quantum_toggle_in_demo_options: toggleInDemo,
    error_box_under_map: Boolean(document.querySelector('.readout-row .error-readout')),
    readout_row_children: [...document.querySelector('.readout-row').children].map((c) => c.className),
    error_box_text: box ? box.textContent.replace(/\s+/g, ' ').trim() : null,
    per_track_table_present: captions.some((t) => t.startsWith('Position error after GPS loss')),
    comparison_present: headings.includes('Both scenarios, as found')
      || captions.some((t) => t.startsWith('Navigation and signal results for both maps'))
      || Boolean(document.querySelector('.comparison, .verdict-statement')),
    ...columns(),
  };

  function columns() {
    const left = document.querySelector('.layout > .col-left');
    const right = document.querySelector('.layout > .col-right');
    const map = document.querySelector('figure.map-figure');
    const tag = (el) => {
      const c = el.classList;
      if (c.contains('map-figure')) return 'map';
      if (c.contains('results')) return 'navigation_accuracy_and_run_controls';
      if (c.contains('benchmark-card')) return 'benchmark';
      if (c.contains('status-strip')) return 'run_status';
      if (c.contains('job-section')) return 'job';
      if (c.contains('sensor-section')) return 'sensor';
      return el.className;
    };
    const r = (el) => el?.getBoundingClientRect();
    const mapR = r(map);
    const boxR = r(document.querySelector('.results .error-readout'));
    const leftR = r(left);
    const rightR = r(right);
    const two = Boolean(leftR && rightR && rightR.left >= leftR.right);
    const legend = document.querySelector('.map-legend')?.textContent ?? '';
    const strokes = [...document.querySelectorAll('.map-overlay [stroke]')].map((e) => e.getAttribute('stroke').toUpperCase());
    return {
      left_column: left ? [...left.children].map(tag) : null,
      right_column: right ? [...right.children].map(tag) : null,
      two_columns: two,
      map_column_wider: two ? leftR.width > rightR.width : null,
      error_box_beside_map: two
        ? boxR.left >= mapR.right && boxR.top >= mapR.top && boxR.bottom <= mapR.bottom
        : null,
      map_stage_px: (() => {
        const st = r(document.querySelector('.map-stage'));
        return st ? [Math.round(st.width), Math.round(st.height)] : null;
      })(),
      legend_lists_baseline: /Baseline: magnetometer \+ notch/.test(legend),
      map_draws_baseline: strokes.includes('#D55E00'),
      map_mode: document.querySelector('input[name="map-mode"]:checked')?.value ?? null,
    };
  }
});
const RIGHT_ORDER = '["navigation_accuracy_and_run_controls","benchmark","run_status","job","sensor"]';
const layoutProblems = (name, L) => {
  const out = [];
  if (!L.error_box_first_in_results) out.push(`${name}: error box is not the first item of Navigation accuracy`);
  if (!L.error_box_above_benchmark) out.push(`${name}: error box is not above the benchmark`);
  if (!L.run_controls_in_accuracy_card) out.push(`${name}: Run controls are not in the Navigation accuracy card`);
  if (!L.benchmark_separate_card) out.push(`${name}: benchmark is not a separate card`);
  if (!L.quantum_toggle_in_demo_options) out.push(`${name}: quantum-track toggle is not in Demo options`);
  if (L.error_boxes_on_page !== 1) out.push(`${name}: ${L.error_boxes_on_page} error boxes on the page`);
  if (L.error_box_under_map) out.push(`${name}: error box still under the map`);
  if (JSON.stringify(L.readout_row_children) !== '["jam-slot"]') out.push(`${name}: row under the map holds ${L.readout_row_children}`);
  if (L.per_track_table_present) out.push(`${name}: per-track CEP table still on the page`);
  if (L.comparison_present) out.push(`${name}: comparison block still on the page`);
  if (JSON.stringify(L.left_column) !== '["map"]') out.push(`${name}: left column holds ${L.left_column}`);
  if (JSON.stringify(L.right_column) !== RIGHT_ORDER) out.push(`${name}: right column order ${L.right_column}`);
  if (name.startsWith('wide')) {
    if (!L.two_columns) out.push(`${name}: not two columns`);
    if (!L.map_column_wider) out.push(`${name}: map column is not the wider one`);
    if (!L.error_box_beside_map) out.push(`${name}: error box is not beside the map`);
  } else if (L.two_columns) out.push(`${name}: two columns at the narrow viewport`);
  if (!L.legend_lists_baseline) out.push(`${name}: map legend does not list the baseline`);
  if (!L.map_draws_baseline) out.push(`${name}: map overlay does not draw the baseline`);
  if (L.map_mode !== 'follow') out.push(`${name}: map view is ${L.map_mode}, expected follow`);
  return out;
};

const detailsOpen = (page) => page.evaluate(() => ({
  job: document.querySelector('details.job-section').open,
  charts: document.querySelector('details.sensor-section').open,
}));

// Role + accessible name of the focused element (enough to identify every stop on this page).
const focused = (page) => page.evaluate(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute('role')
    || ({ a: 'link', button: 'button', summary: 'summary', select: 'combobox' }[tag])
    || (tag === 'input' ? (el.type === 'range' ? 'slider' : el.type) : tag);
  const label = el.labels && el.labels[0] ? el.labels[0].textContent : '';
  const name = (el.getAttribute('aria-label') || label || el.textContent || '')
    .replace(/\s+/g, ' ').trim().slice(0, 60);
  const group = el.closest('fieldset')?.querySelector('legend')?.textContent?.trim() ?? null;
  const out = { role, name };
  if (group) out.group = group;
  if (tag === 'a') out.href = el.getAttribute('href');
  return out;
});

// Simulated live Run on the stub, driven from the keyboard (focus Run, press Enter).
// Returns the readout row height measured while the run is in progress.
async function keyboardRun(page) {
  await page.getByRole('button', { name: 'Run one IonQ job' }).focus();
  await page.keyboard.press('Enter');
  await page.locator('.live-progress:not([hidden])').waitFor({ timeout: 10_000 });
  const running = await readoutHeight(page);
  const boxRunning = await errorBoxHeight(page);
  await page.locator('.status-message', { hasText: RESULT_TEXT }).waitFor({ timeout: RUN_TIMEOUT_MS });
  await page.waitForTimeout(1000); // auto-open, sensor charts mount, map redraw
  return { running, boxRunning };
}

const server = await createServer({
  root: WEB,
  logLevel: 'error',
  server: { port: PORT, strictPort: true, host: '127.0.0.1' },
});
await server.listen();
const browser = await chromium.launch();

const axeOut = { axe_version: null, states: {} };
const keyOut = {};
const problems = [];
try {
  for (const [name, viewport] of VIEWPORTS) {
    // Pass 1: sections closed, then every details element opened.
    const page = await openPage(browser, viewport);
    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!reduced) problems.push(`${name}: reduced-motion emulation not active`);
    if (name === 'wide') {
      mkdirSync(`${ROOT}docs`, { recursive: true });
      // First screen at 1280 px wide, extended down to just past whichever ends lower, the map
      // figure (left column) or the Run row (right column, under Navigation accuracy), so the
      // hero shows the map with its full trajectory and the Run button (D-13).
      const bottomOf = (sel) => page.locator(sel).evaluate(
        (el) => Math.ceil(el.getBoundingClientRect().bottom + window.scrollY),
      );
      const runBottom = Math.max(await bottomOf('.run-row'), await bottomOf('figure.map-figure'));
      const height = Math.max(viewport.height, runBottom + 24);
      await page.screenshot({ path: HERO, fullPage: true, clip: { x: 0, y: 0, width: viewport.width, height } });
    }
    const layoutIdle = await layoutCheck(page);
    problems.push(...layoutProblems(`${name}/idle`, layoutIdle));
    const closed = await axe(page);
    axeOut.axe_version = closed.version;
    for (const s of await page.locator('details > summary').all()) {
      if (!(await s.evaluate((el) => el.parentElement.open))) await s.click();
    }
    await page.waitForTimeout(800); // sensor charts mount
    const open = await axe(page);
    await page.close();

    // Pass 2: fresh page (sections closed); keyboard walk on wide, then a keyboard-driven Run.
    const page2 = await openPage(browser, viewport);
    if (name === 'wide') {
      const order = [];
      await page2.evaluate(() => document.activeElement?.blur());
      for (let k = 0; k < MAX_TABS; k += 1) {
        await page2.keyboard.press('Tab');
        const f = await focused(page2);
        if (!f) break;
        if (order.length && JSON.stringify(order[0]) === JSON.stringify(f)) break; // wrapped
        order.push(f);
      }
      const has = (pred) => order.some(pred);
      const reached = {
        scenario_picker: has((f) => f.role === 'radio' && f.group === 'Map scenario'),
        run_button: has((f) => f.role === 'button' && f.name === 'Run one IonQ job'),
        play_pause: has((f) => f.role === 'button' && (f.name === 'Play' || f.name === 'Pause')),
        scrubber: has((f) => f.role === 'slider'),
        job_summary: has((f) => f.role === 'summary' && f.name === "This Run's IonQ job"),
        sensor_summary: has((f) => f.role === 'summary' && f.name === 'Sensor'),
      };
      // The page carries no real-flight link by design (UI-SPEC A-8, SCN-03: only the README
      // links the published v0.1.1-smoke project). Record that; if a link ever appears it must
      // be reachable by Tab.
      const links = await page2.locator('a[href]').count();
      const realFlight = links === 0
        ? 'not_on_page (UI-SPEC A-8 / SCN-03: README-only link)'
        : has((f) => f.role === 'link');
      // Enter opens and Space closes the Sensor summary from the keyboard.
      await page2.locator('details.sensor-section > summary').focus();
      await page2.keyboard.press('Enter');
      await page2.waitForTimeout(300);
      const afterEnter = (await detailsOpen(page2)).charts;
      await page2.keyboard.press('Space');
      await page2.waitForTimeout(300);
      const afterSpace = (await detailsOpen(page2)).charts;
      const toggles = { sensor_enter_opens: afterEnter === true, sensor_space_closes: afterSpace === false };

      // Map view radio group: open Demo options with Enter, Tab into the group (Follow checked),
      // ArrowDown selects Full trajectory (caption follows), ArrowUp returns to Follow.
      const caption = () => page2.locator('figure.map-figure figcaption').evaluate((el) => el.textContent);
      await page2.locator('details.demo-options > summary').focus();
      await page2.keyboard.press('Enter');
      await page2.waitForTimeout(200);
      await page2.keyboard.press('Tab');
      const mvFirst = await focused(page2);
      await page2.keyboard.press('ArrowDown');
      await page2.waitForTimeout(200);
      const mvFull = await caption();
      const mvFullVal = await page2.evaluate(() => document.querySelector('input[name="map-mode"]:checked')?.value);
      await page2.keyboard.press('ArrowUp');
      await page2.waitForTimeout(200);
      const mvFollowVal = await page2.evaluate(() => document.querySelector('input[name="map-mode"]:checked')?.value);
      await page2.locator('details.demo-options > summary').focus();
      await page2.keyboard.press('Enter'); // close again
      await page2.waitForTimeout(200);
      const mapView = {
        first_stop: mvFirst,
        arrow_down_selects_full: mvFullVal === 'full' && /full trajectory/i.test(mvFull),
        arrow_up_returns_to_follow: mvFollowVal === 'follow',
      };
      if (!(mvFirst && mvFirst.role === 'radio' && mvFirst.group === 'Map view' && /Follow the UAV/.test(mvFirst.name))) {
        problems.push(`map view radio not the first stop in Demo options: ${JSON.stringify(mvFirst)}`);
      }
      if (!mapView.arrow_down_selects_full) problems.push('map view: ArrowDown did not select Full trajectory');
      if (!mapView.arrow_up_returns_to_follow) problems.push('map view: ArrowUp did not return to Follow');

      const idle = await readoutHeight(page2);
      const boxIdle = await errorBoxHeight(page2);
      const { running, boxRunning } = await keyboardRun(page2);
      const afterRun = await readoutHeight(page2);
      const boxAfter = await errorBoxHeight(page2);
      const layoutAfter = await layoutCheck(page2);
      problems.push(...layoutProblems(`${name}/after_run`, layoutAfter));
      const openAfter = await detailsOpen(page2);
      const jamShown = await page2.locator('.jam-slot')
        .evaluate((el) => el.textContent.trim().length > 0);
      keyOut.focus_order = order;
      keyOut.reached = { ...reached, real_flight_link: realFlight };
      keyOut.summary_keyboard_toggle = toggles;
      keyOut.map_view_keyboard = mapView;
      keyOut.details_open_after_run = openAfter;
      keyOut.readout_row_height = { idle, running, after_run: afterRun, jam_banner_after_run: jamShown };
      keyOut.error_box_height = { idle: boxIdle, running: boxRunning, after_run: boxAfter };
      keyOut.layout = { idle: layoutIdle, after_run: layoutAfter };
      for (const [k, v] of Object.entries(reached)) if (!v) problems.push(`keyboard target unreached: ${k}`);
      if (realFlight === false) problems.push('keyboard target unreached: real_flight_link');
      for (const [k, v] of Object.entries(toggles)) if (!v) problems.push(`summary keyboard toggle failed: ${k}`);
      if (!openAfter.job || !openAfter.charts) {
        problems.push(`details not auto-opened after Run: ${JSON.stringify(openAfter)}`);
      }
      if (!(idle === running && running === afterRun)) {
        problems.push(`readout row height changed: ${idle}/${running}/${afterRun}`);
      }
      if (!(boxIdle === boxRunning && boxRunning === boxAfter)) {
        problems.push(`error box height changed: ${boxIdle}/${boxRunning}/${boxAfter}`);
      }
      if (!/\d m/.test(layoutAfter.error_box_text ?? '')) {
        problems.push(`error box shows no error after the Run: ${layoutAfter.error_box_text}`);
      }
      // The box follows the playhead from its new place: Home (start, GPS available), End (error).
      const boxText = () => page2.locator('.results .error-readout').evaluate((el) => el.textContent);
      await page2.evaluate(() => document.activeElement?.blur());
      await page2.keyboard.press('Home');
      await page2.waitForTimeout(300);
      const atStart = await boxText();
      await page2.keyboard.press('End');
      await page2.waitForTimeout(300);
      const atEnd = await boxText();
      const follows = atStart.includes('GPS available') && /\d m/.test(atEnd);
      keyOut.error_box_follows_playhead = { home: atStart.includes('GPS available'), end: /\d m/.test(atEnd) };
      if (!follows) problems.push(`error box does not follow the playhead: "${atStart}" / "${atEnd}"`);
    } else {
      await keyboardRun(page2);
      problems.push(...layoutProblems(`${name}/after_run`, await layoutCheck(page2)));
      const openAfter = await detailsOpen(page2);
      if (!openAfter.job || !openAfter.charts) problems.push(`${name}: details not auto-opened after Run`);
    }
    const afterRunAxe = await axe(page2);
    await page2.close();
    axeOut.states[name] = { closed: closed.violations, open: open.violations, after_run: afterRunAxe.violations };
  }
} finally {
  await browser.close();
  await server.close();
}

mkdirSync(`${ROOT}results`, { recursive: true });
write(AXE_OUT, axeOut);
write(KEY_OUT, keyOut);

const bad = Object.entries(axeOut.states).flatMap(([vp, states]) => Object.entries(states).flatMap(
  ([st, list]) => list
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${vp}/${st}: ${v.id} (${v.impact}) ${v.targets.join(', ')}`),
));
const all = [...bad, ...problems];
console.log(all.length
  ? all.join('\n')
  : 'audit passed: no critical/serious violations, keyboard targets reached, readout row and error box stable, layout as specified');
process.exit(all.length ? 1 : 0);
