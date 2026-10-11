# Qollab Findings (Phase 2 page verification)

Status: FILLED, 2026-10-11, from Eason's in-browser check (plan 02-08, Task 2). Template prepared 05:20 PDT by the plan 02-08 executor (Task 1); results recorded by the Task 3 executor. Values below are copied verbatim from Eason's reply; anything he did not report is written "not reported".

Scope: upload only, into an unpublished Qollab project. Publish is not pressed and the "IonQ Forte 1 (36q) Credits apply" hardware backend is not selected (submission approval rule). The executor does not operate Qollab.

Date/time: 2026-10-11, about 13:25-13:40 UTC (06:25-06:40 PDT); job timestamps 13:28:04, 13:31:18 and 13:35:09 UTC  Browser/version: Chrome, version not reported  Qollab project URL: not reported (unpublished project editor)  Checked by: Eason

Uploaded bundle: `dist/qollab-upload.zip` as rebuilt by the orchestrator on main after plan 02-05, so it includes the QPU record (`data/forte_hardware_run.json`, label "QPU-measured", job `01a12aee-d8a8-7e14-b9aa-b11329aca850`). The "Hardware record" rows in the build facts below give the current QPU record and, as history, the proxy that was current when Task 1 ran (corrected in plan 03-09); full suite on main after the rebuild: 284 passed, 1 skipped, 6 xfailed.

How the page was reached: the project card read "Runs as JS". The preview frame showed "qollab.xyz refused to connect" until Eason entered the runner (Code tab -> Run Project -> Run); after that the page rendered ("oh yep its running now"). See observation O-2.

## Build facts (local gate, 2026-10-11)

| Fact | Value |
|---|---|
| Git base | `90cfb85` |
| pytest (`uv run pytest -q`) | 283 passed, 2 skipped, 6 xfailed (127.8 s) |
| Node lib tests (`npm --prefix web test`) | 60 passed, 0 failed |
| Fresh `npm --prefix web run build` vs committed bundle | identical (`git diff --exit-code main.js main.css THIRD_PARTY_WEB_LICENSES.md` exits 0) |
| `main.js` | 894,668 bytes (225.81 kB gzip) |
| `main.css` | 12,526 bytes (2.92 kB gzip) |
| `dist/qollab-upload.zip` | 32 entries, 1,906,174 bytes compressed / 3,035,979 uncompressed, no `main.py`, sha256 `15d9dff6889157230cfbe72eeebe91227069c604712b37145075d0f3d92e9b59` |
| `dist/qollab-capture-py.zip` | 10 entries (8 files), 9,443 bytes, sha256 `905dde194d38acc7a8414fd224b6109d57e28f2f57e46bacd783986068c5bb90` |
| circuit_sha256 (`data/circuit_freeze.json`) | `45215a38b2b17c206f657e897ede7e1311332c8996fbbbe232c950ea82212560` (16 qubits, 4 segments, transpile optimization_level 0, live shots 1024) |
| Hardware record (`data/forte_hardware_run.json`), current | label "QPU-measured", job `01a12aee-d8a8-7e14-b9aa-b11329aca850`, backend `ionq_qpu.forte-1`, seed_hex `c1dfff10e69fae05`, 500 shots requested, counts_sum 504, IonQ default debiasing, measured contrasts c1 = 0.996, c2 = 0.996, c4 = 1.000 (plan 02-05; this is the record in the uploaded bundle and the seed of the regenerated replay) |
| Hardware record, history (superseded) | label "simulator-sampled proxy", job `01a12ad6-11fb-70ec-a4eb-240fb59fe500`, seed_hex `8713efc07ed06d1e`, 500 shots, forte-1 noise model (plan 02-04; current when Task 1 of plan 02-08 ran, replaced by the QPU record above) |
| `data/qsensor_model.json` sha256 | `a10a6f62456eb49458dd42071384b5a51cf00ca388c71702dfce16e5b27ac891` (unchanged, D-C) |
| `magnav/nav.py` sha256 | `efc700cf796e49f4e4dfaa3fe9abd1108b5619c845c2e3f0394a918cd30c709a` (unchanged, D-C) |
| `data/precomputed_uav.json` sha256 | `07220343fa63763fd95034ab57cfe6ec1a2fb0662c8aea01d29d677e264b427a` (unchanged, D-C) |

## Results

One row per step of plan 02-08 Task 2. Values are copied verbatim from Eason's report.

| Step | Check | Backend | Scenario | Result | Time (s) | Job ID | seed_hex | c2 | c4 | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Page load: synthetic replay default, synthetic label (above map, picker, badge), first ~520 px view, no Cessna | built-in simulator | synthetic_100m | PASS ("confirmed") | n/a | n/a | n/a | n/a | n/a | Eason: "confirmed". Page rendered only after Run Project -> Run (O-2) |
| 2 | Live run: step texts, job ID, "built-in simulator" badge, GHZ contrasts 1.000, "computed in-page", < 90 s | built-in simulator | synthetic_100m | PASS | ~15 ("took around 15 seconds") | `600398de-d8b6-4088-856c-389ca867d6c3` | `0xafbbb480ac4d3db7` (12662913242021838263) | 1.000 (model default 0.960) | 1.000 (model default 0.922) | Backend `basic_simulator`; 1024 shots; 2026-10-11 13:28:04 UTC; "Flown on: UAV at 100 m over a synthetic crustal map"; RNG 6 qubits, 64-bin histogram over 1024 shots, hashed to 64 bits; Motor RPM 4650–8973 (swept); harmonic amplitudes 3600, 1800, 1080, 720 nT; phases 1.65, 4.18, 0.12, 4.18 rad; "Contrast used by the emulator 1.000 measured this Run" |
| 3 | Live run: job ID within ~15 s, "simulator-sampled", motor RPM range, GHZ-2/GHZ-4 < 1 with "entangled probe n = 2/4" and "measured this Run", < 90 s | IonQ Forte 1 simulator | synthetic_100m | PASS (with observation O-1) | not reported | `01a12b28-f6cc-754a-b9aa-1441fa9b79f8` | `0xc77828df74e35765` (14373283150956812133) | 1.000 (model default 0.960), "entangled probe n = 2" | 1.000 (model default 0.922), "entangled probe n = 4" | Backend `ionq_simulator`; 1024 shots; 2026-10-11 13:31:18 UTC; "Flown on: UAV at 100 m over a synthetic crustal map"; Motor RPM 4512–8593 (swept); amplitudes 3600, 1800, 1080, 720 nT; phases 4.59, 4.65, 5.60, 3.34 rad; "Contrast used by the emulator 1.000 measured this Run". Contrasts are 1.000, not < 1 as the checklist expected (O-1). "simulator-sampled" badge text not explicitly quoted |
| 4 | Second Run: seed_hex differs from step 3; eastern_400m live run < 90 s; synthetic_100m recorded replay shows "This Run's IonQ job was flown on ..." | IonQ Forte 1 simulator | eastern_400m | PASS (with observation O-1) | not reported | `01a12b2c-7a7d-75af-a1ce-a34acbb6bf1c` | `0x88b8bc7b2962d297` (9851831422034301591), differs from step 3 | 1.000 (model default 0.960), "entangled probe n = 2" | 1.000 (model default 0.922), "entangled probe n = 4" | Backend `ionq_simulator`; 1024 shots; 2026-10-11 13:35:09 UTC; "Flown on: UAV at 400 m over the Eastern_395 survey map"; Motor RPM 4510–8972 (swept); amplitudes 3600, 1800, 1080, 720 nT; phases 4.70, 5.79, 5.49, 5.05 rad; "Contrast used by the emulator 1.000 measured this Run". The "This Run's IonQ job was flown on ..." caption on the synthetic replay: not reported |
| 5 | Forced failure (Demo options: Simulate a failure): replay stays, "fallback: precomputed replay (...)" badge, failure copy, Run button stays disabled | not reported | synthetic_100m | PASS | n/a | n/a | n/a | n/a | n/a | Message shown, verbatim: "Live run failed: RuntimeError: Simulated failure (demo of the fallback). Showing the recorded replay of UAV at 100 m over a synthetic crustal map with its stored motor. Press Stop, then Run on Qollab, to try a new job." Badge text and Run-button state: not reported |
| 6 | "UAV (recorded replay)" mode on both scenarios: map, sensor panel, CEP table, "Both scenarios, as found"; hardware details label | n/a | both | PASS | n/a | n/a | n/a | n/a | n/a | Both CEP tables pasted (below); "Both scenarios, as found" present. Hardware details label ("hardware · QPU-measured"): not reported |
| 7 | Keyboard only (Tab, Space play/pause, J jump to jam); OS reduced motion: no animation, no auto-play | n/a | n/a | PASS ("yep all works") | n/a | n/a | n/a | n/a | n/a | Eason: "yep all works". Per-key and reduced-motion detail: not reported |

### Step 6 CEP tables, as pasted

Position error after GPS loss (from t = 285 s): UAV at 400 m over the Eastern_395 survey map, recorded flight

| Track | CEP50 (m) | CEP95 (m) | Under 556 m (%) | Signal RMSE (nT) | Windows accepted |
|---|---|---|---|---|---|
| Dead reckoning (INS only) | 974.5 | 2,035.9 | 27.2 | n/a | n/a |
| Baseline: magnetometer + notch | 162.6 | 500.3 | 96.7 | 11.8 | 55 of 62 |
| Baseline variant: block mean | 169.3 | 500.3 | 96.7 | 17.9 | 55 of 62 |
| Quantum: single-qubit Ramsey | 157.0 | 420.2 | 95.1 | 0.3 | 62 of 62 |
| Quantum: GHZ-4 entangled (on map) | 154.7 | 420.2 | 95.1 | 0.2 | 62 of 62 |

Both scenarios, as found

Position error after GPS loss (from t = 285 s): UAV at 100 m over a synthetic crustal map, recorded flight

| Track | CEP50 (m) | CEP95 (m) | Under 556 m (%) | Signal RMSE (nT) | Windows accepted |
|---|---|---|---|---|---|
| Dead reckoning (INS only) | 974.5 | 2,035.9 | 27.2 | n/a | n/a |
| Baseline: magnetometer + notch | 150.2 | 251.4 | 100.0 | 11.8 | 62 of 62 |
| Baseline variant: block mean | 150.2 | 260.0 | 100.0 | 17.9 | 62 of 62 |
| Quantum: single-qubit Ramsey | 150.2 | 251.4 | 100.0 | 0.3 | 62 of 62 |
| Quantum: GHZ-4 entangled (on map) | 150.2 | 251.4 | 100.0 | 0.2 | 62 of 62 |

RNG bits as reported (64-bit hash of the 64-bin RNG histogram):

- Step 2: `10101111 10111011 10110100 10000000 10101100 01001101 00111101 10110111`
- Step 3: `11000111 01111000 00101000 11011111 01110100 11100011 01010111 01100101`
- Step 4: `10001000 10111000 10111100 01111011 00101001 01100010 11010010 10010111`

Three Runs gave three different seed_hex values and three different motors (4650–8973, 4512–8593, 4510–8972 RPM), as the "two simulator Runs give different motors" truth requires.

## Issues observed

No step failed. Two observations, recorded as observations, not failures:

- **O-1: Forte 1 remote simulator returned GHZ contrast 1.000.** On both IonQ Forte 1 simulator Runs (steps 3 and 4: jobs `01a12b28-f6cc-754a-b9aa-1441fa9b79f8` and `01a12b2c-7a7d-75af-a1ce-a34acbb6bf1c`), GHZ-2 and GHZ-4 contrast were 1.000, labelled "measured this Run". This matches the committed simulator proxy (job `01a12ad6-11fb-70ec-a4eb-240fb59fe500`, plan 02-04: c1 = c2 = c4 = 1.0 over 500 shots, noise_model forte-1). The checklist expected values below 1. The page behaved correctly: it showed the measured value with the right badges, and the model defaults (0.960, 0.922) are displayed alongside. A plausible cause (not verified) is that the remote simulator applies little or no two-qubit gate noise to these short GHZ round trips. The degradation story therefore rests on the model defaults and the QPU record (job `01a12aee-d8a8-7e14-b9aa-b11329aca850`, plan 02-05), not on the remote simulator.
- **O-2: preview frame reads "qollab.xyz refused to connect" before the runner starts.** Before Code tab -> Run Project -> Run was pressed, the preview frame showed "qollab.xyz refused to connect". After Run it rendered normally. This is consistent with Qollab's docs: the JS page is a sandboxed frame shown "above the console when you run it". A judge who opens the project without pressing Run could see the error, so the README "How to run" must say so.

## Gaps for /gsd:plan-phase 2 --gaps

none

Phase 3 follow-ups (not Phase 2 gaps):

- README "How to run" must tell judges to press Run Project, then Run, and wait for Pyodide to load before the page appears (O-2).
- README / honesty text should state that the IonQ Forte 1 remote simulator returned GHZ-2/GHZ-4 contrast 1.000 on both Runs here and on the 02-04 proxy job (O-1), so the sub-unity contrast shown comes from the model defaults and the QPU record, not the simulator.
