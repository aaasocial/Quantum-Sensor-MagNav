# Qollab Findings (Phase 2 page verification)

Status: TEMPLATE, prepared 2026-10-11 05:20 PDT by the plan 02-08 executor. Results are filled in after Eason's in-browser check (plan 02-08, Task 2).

Scope: upload only, into an unpublished Qollab project. Publish is not pressed and the "IonQ Forte 1 (36q) Credits apply" hardware backend is not selected (CLAUDE.md submission approval gate). The executor does not operate Qollab.

Date/time (PDT): ______  Browser/version: Chrome ______  Qollab project URL: ______  Checked by: Eason

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
| Hardware record (`data/forte_hardware_run.json`) | label "simulator-sampled proxy", job `01a12ad6-11fb-70ec-a4eb-240fb59fe500`, seed_hex `8713efc07ed06d1e`, 500 shots, forte-1 noise model |
| `data/qsensor_model.json` sha256 | `a10a6f62456eb49458dd42071384b5a51cf00ca388c71702dfce16e5b27ac891` (unchanged, D-C) |
| `magnav/nav.py` sha256 | `efc700cf796e49f4e4dfaa3fe9abd1108b5619c845c2e3f0394a918cd30c709a` (unchanged, D-C) |
| `data/precomputed_uav.json` sha256 | `07220343fa63763fd95034ab57cfe6ec1a2fb0662c8aea01d29d677e264b427a` (unchanged, D-C) |

## Results

One row per step of plan 02-08 Task 2. Values are copied verbatim from Eason's report.

| Step | Check | Backend | Scenario | Result | Time (s) | Job ID | seed_hex | c2 | c4 | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Page load: synthetic replay default, synthetic label (above map, picker, badge), first ~520 px view, no Cessna | built-in simulator | synthetic_100m | | | | | | | |
| 2 | Live run: step texts, job ID, "built-in simulator" badge, GHZ contrasts 1.000, "computed in-page", < 90 s | built-in simulator | synthetic_100m | | | | | | | |
| 3 | Live run: job ID within ~15 s, "simulator-sampled", motor RPM range, GHZ-2/GHZ-4 < 1 with "entangled probe n = 2/4" and "measured this Run", < 90 s | IonQ Forte 1 simulator | synthetic_100m | | | | | | | |
| 4 | Second Run: seed_hex differs from step 3; eastern_400m live run < 90 s; synthetic_100m recorded replay shows "This Run's IonQ job was flown on ..." | IonQ Forte 1 simulator | eastern_400m | | | | | | | |
| 5 | Forced failure (Demo options: Simulate a failure): replay stays, "fallback: precomputed replay (...)" badge, failure copy, Run button stays disabled | | | | | | | | | |
| 6 | "UAV (recorded replay)" mode on both scenarios: map, sensor panel, CEP table, "Both scenarios, as found"; hardware details label | n/a | both | | | | | | | |
| 7 | Keyboard only (Tab, Space play/pause, J jump to jam); OS reduced motion: no animation, no auto-play | n/a | | | | | | | | |

## Issues observed

(to be filled)

## Gaps for /gsd:plan-phase 2 --gaps

(to be filled; "none" if every step passes)
