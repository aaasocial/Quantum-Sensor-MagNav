// Accessibility audit + README hero screenshot (A11Y-03, D-13). Dev-time only: Vite builds only
// src/main.jsx, so this file is never bundled. main.js imports 'magnav.api' (Pyodide), so the
// audit targets the Vite dev server, where vite.config.js aliases magnav.api to the dev stub.
// Run from anywhere: `npm --prefix web run audit` or `cd web && node scripts/audit.mjs`.
// Writes results/a11y_axe.json, results/a11y_keyboard.json and docs/hero.png (no timestamps).
// Exit 1 on any critical/serious axe violation, an unreached keyboard target, sections not
// auto-opened after the simulated Run, or a change in the readout row height (D-03).
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
  await page.locator('.status-message', { hasText: RESULT_TEXT }).waitFor({ timeout: RUN_TIMEOUT_MS });
  await page.waitForTimeout(1000); // auto-open, sensor charts mount, map redraw
  return running;
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
      // First screen at 1280 px wide, extended down to just past the Run row so the hero shows
      // the map with its full trajectory and the Run controls under it (D-13).
      const runBottom = await page.locator('.run-row').evaluate(
        (el) => Math.ceil(el.getBoundingClientRect().bottom + window.scrollY),
      );
      const height = Math.max(viewport.height, runBottom + 24);
      await page.screenshot({ path: HERO, fullPage: true, clip: { x: 0, y: 0, width: viewport.width, height } });
    }
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

      const idle = await readoutHeight(page2);
      const running = await keyboardRun(page2);
      const afterRun = await readoutHeight(page2);
      const openAfter = await detailsOpen(page2);
      const jamShown = await page2.locator('.jam-slot')
        .evaluate((el) => el.textContent.trim().length > 0);
      keyOut.focus_order = order;
      keyOut.reached = { ...reached, real_flight_link: realFlight };
      keyOut.summary_keyboard_toggle = toggles;
      keyOut.details_open_after_run = openAfter;
      keyOut.readout_row_height = { idle, running, after_run: afterRun, jam_banner_after_run: jamShown };
      for (const [k, v] of Object.entries(reached)) if (!v) problems.push(`keyboard target unreached: ${k}`);
      if (realFlight === false) problems.push('keyboard target unreached: real_flight_link');
      for (const [k, v] of Object.entries(toggles)) if (!v) problems.push(`summary keyboard toggle failed: ${k}`);
      if (!openAfter.job || !openAfter.charts) {
        problems.push(`details not auto-opened after Run: ${JSON.stringify(openAfter)}`);
      }
      if (!(idle === running && running === afterRun)) {
        problems.push(`readout row height changed: ${idle}/${running}/${afterRun}`);
      }
    } else {
      await keyboardRun(page2);
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
  : 'audit passed: no critical/serious violations, keyboard targets reached, readout row stable');
process.exit(all.length ? 1 : 0);
