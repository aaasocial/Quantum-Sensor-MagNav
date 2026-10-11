"""One regeneration entry point for every numeric evidence file (D-08; dev-only, never shipped).

CLI: `python -m magnav.regen [--out DIR] [--quick] [--no-figures]` (run from the repository root: data paths are
relative literals). Writes, under DIR (default: the current directory):

  results/metrics.json      every evidence number (benchmark, ladder, 2x2, amplitude sweep,
                            recorded IonQ rows, GHZ scaling, GHZ row, input hashes)
  results/ladder.csv, rpm_2x2.csv, amp_sweep.csv, benchmark.csv, ghz_scaling.csv,
  results/filter_function.csv
  results/fig_ladder.png, fig_amp_sweep.png, fig_filter_function.png, fig_ghz_scaling.png and
  results/circuit.txt (magnav.figures.render_all; skipped with --no-figures)
  data/benchmark_summary.json   the page's benchmark table (D-05)
  data/precomputed_uav.json     the replay artifact, seeded from the QPU record when it is
                                labelled QPU-measured (D-08), model-default c_n

Determinism: every motor comes from a fixed SeedSequence (BENCH_SPAWN_KEY, not a seeds.SPAWN_KEYS
name: the frozen model pins those), jobs run in a fixed order through ProcessPoolExecutor.map, every
float is rounded to 6 significant digits, JSON uses sort_keys, CSVs use "\\n" line endings, and no
timestamp, absolute path or hostname is written. Two runs give the same bytes.

Benchmark honesty (D-06): mean +/- population std (ddof 0) over N seeded local draws; the recorded
IonQ seeds are separate rows labelled "QPU-measured" or "simulator-sampled", never in the mean.
"""

from __future__ import annotations

import argparse
import copy
import csv
import hashlib
import json
import math
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np

from magnav import uav_pipeline as up

BENCH_SPAWN_KEY = 12  # 10 = synthmap, 11 = api scaling; not in seeds.SPAWN_KEYS (frozen model pins those)
HARDWARE_RUN = "data/forte_hardware_run.json"
BENCHMARK_SUMMARY = "data/benchmark_summary.json"  # page table (D-05); api.py gets its own literal (plan 03-04)
CIRCUIT_FREEZE = "data/circuit_freeze.json"
BENCH_SCENARIO = "synthetic_100m"
S_REF = 256
DDOF = 0
SIG = 6
METRIC_KEYS = ("signal_rmse_nT", "signal_err_std_nT", "cep50_m", "cep95_m", "mean_err_m", "final_err_m",
               "pct_under_556", "accepted", "windows")  # fmt: skip
DR_KEYS = ("cep50_m", "cep95_m", "mean_err_m", "final_err_m", "pct_under_556")
PROV_KEYS = ("slips", "fine_slips", "n_fallback", "n_fringe", "ls_drops")
AGG_KEYS = ("cep50_m", "cep95_m", "pct_under_556", "signal_rmse_nT")
BASELINE, QUANTUM, SINGLE = "baseline_ls", "quantum_ghz4", "quantum_q1"
ROW_LABELS = {
    "baseline_ls": "Baseline magnetometer + LS notch",
    "baseline_mean": "Baseline magnetometer, block mean",
    "quantum_q1": "Ramsey sensor, single qubit",
    "quantum_ghz4": "Ramsey sensor, GHZ-4",
}
# Forte 1 simulator Runs recorded in docs/QOLLAB_FINDINGS.md (seed only, no counts committed).
SIM_RUNS = (
    {"job_id": "01a12b28-f6cc-754a-b9aa-1441fa9b79f8", "backend": "ionq_simulator", "seed_hex": "c77828df74e35765",
     "scenario": "synthetic_100m"},
    {"job_id": "01a12b2c-7a7d-75af-a1ce-a34acbb6bf1c", "backend": "ionq_simulator", "seed_hex": "88b8bc7b2962d297",
     "scenario": "eastern_400m"},
    {"job_id": "600398de-d8b6-4088-856c-389ca867d6c3", "backend": "basic_simulator", "seed_hex": "afbbb480ac4d3db7",
     "scenario": "synthetic_100m"},
)  # fmt: skip
PROFILES = {
    "full": {"N": 8, "S": (64, 256, 1024, 4096), "A1": (0.0, 450.0, 900.0, 1800.0, 3600.0, 7200.0),
             "eastern_ladder": True, "sim_rows": True, "qpu_scenarios": ("synthetic_100m", "eastern_400m")},
    "quick": {"N": 2, "S": (64, 256), "A1": (0.0, 3600.0), "eastern_ladder": False, "sim_rows": False,
              "qpu_scenarios": ("synthetic_100m",)},
}  # fmt: skip


# ---------- helpers ----------


def bench_seed(root: int, d: int) -> int:
    """63-bit motor seed of benchmark draw d (int_seed pattern on a reserved spawn key)."""
    ss = np.random.SeedSequence(int(root), spawn_key=(BENCH_SPAWN_KEY, int(d)))
    return int(ss.generate_state(1, np.uint64)[0] >> np.uint64(1))


def _round(obj, sig: int = SIG):
    """Recursive JSON-safe copy with every float rounded to `sig` significant digits."""
    if isinstance(obj, dict):
        return {str(k): _round(v, sig) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_round(v, sig) for v in obj]
    if isinstance(obj, np.ndarray):
        return _round(obj.tolist(), sig)
    if isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, (float, np.floating)):
        v = float(obj)
        if not math.isfinite(v):
            raise ValueError(f"non-finite value {v} in evidence output")
        v = float(f"{v:.{sig}g}")
        return 0.0 if v == 0 else v  # no "-0.0"
    return obj


def _fmt(v) -> str:
    if v is None:
        return ""
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, np.integer)):
        return str(int(v))
    if isinstance(v, (float, np.floating)):
        return f"{float(v):.6g}"
    return str(v)


def _sha256(path) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def _write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


def _dump_json(obj) -> bytes:
    return (json.dumps(_round(obj), indent=1, sort_keys=True, allow_nan=False) + "\n").encode("utf-8")


def _write_csv(path: Path, header, rows) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(header)
        for r in rows:
            w.writerow([_fmt(v) for v in r])


def load_hardware(path=HARDWARE_RUN):
    if not Path(path).exists():
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ---------- worker ----------

_CACHE: dict = {}


def _model():
    if "model" not in _CACHE:
        _CACHE["model"] = up.load_model()
    return _CACHE["model"]


def _tile(scenario):
    key = ("tile", scenario)
    if key not in _CACHE:
        _CACHE[key] = up.load_map(up.SCENARIOS[scenario]["map_file"])
    return _CACHE[key]


def run_job(job: dict) -> dict:
    """One run_uav call; returns only the small metrics dict (never the run's arrays)."""
    model = _model()
    if job.get("A1_nT") is not None:
        model = copy.deepcopy(model)
        model["tone_amplitude_rule"]["A1_nT"] = float(job["A1_nT"])
    sc = job["scenario"]
    run = up.run_uav(model=model, shots=int(job["S"]), motor_seed=int(job["motor_seed"]), tile=_tile(sc),
                     scenario=sc, rpm_known=bool(job.get("rpm_known", True)))  # fmt: skip
    L = run["line"]
    est = {name: {k: L["results"][name]["metrics"][k] for k in METRIC_KEYS} for name in up.ESTIMATORS}
    return {
        "job": dict(job),
        "estimators": est,
        "dead_reckoning": {k: L["dr_metrics"][k] for k in DR_KEYS},
        "prov": {k: int(run["prov"][k]) for k in PROV_KEYS},
        "motor_seed_hex": f"{int(job['motor_seed']):016x}",
        "A1_nT": float(run["motor"]["A1_nT"]),
    }


# ---------- job matrix ----------


def job_list(model: dict, prof: dict, hw) -> list:
    root = int(model["seeds"]["root"])
    shipped = int(model["seeds"]["shipped_motor_seed"])
    jobs = []
    for S in prof["S"]:  # (a) benchmark, RPM known
        for d in range(prof["N"]):
            jobs.append({"block": "benchmark", "scenario": BENCH_SCENARIO, "S": S, "draw": d,
                         "motor_seed": bench_seed(root, d), "rpm_known": True})  # fmt: skip
    if prof["eastern_ladder"]:  # (b) shipped-motor ladder on the real survey map
        for S in prof["S"]:
            jobs.append({"block": "ladder_eastern", "scenario": "eastern_400m", "S": S, "motor_seed": shipped,
                         "rpm_known": True})  # fmt: skip
    for d in range(prof["N"]):  # (c) withheld column at S_REF
        jobs.append({"block": "withheld", "scenario": BENCH_SCENARIO, "S": S_REF, "draw": d,
                     "motor_seed": bench_seed(root, d), "rpm_known": False})  # fmt: skip
    for A in prof["A1"]:  # (d) amplitude sweep, shipped motor
        jobs.append({"block": "amp_sweep", "scenario": BENCH_SCENARIO, "S": S_REF, "motor_seed": shipped,
                     "A1_nT": float(A), "rpm_known": True})  # fmt: skip
    if hw is not None and hw.get("label") == "QPU-measured":  # (e) recorded rows
        for sc in prof["qpu_scenarios"]:
            jobs.append({"block": "recorded", "scenario": sc, "S": S_REF, "motor_seed": int(hw["seed_hex"], 16),
                         "label": "QPU-measured", "job_id": hw["job_id"], "seed_hex": hw["seed_hex"],
                         "backend": hw.get("backend")})  # fmt: skip
    if prof["sim_rows"]:
        for r in SIM_RUNS:
            jobs.append({"block": "recorded", "scenario": r["scenario"], "S": S_REF,
                         "motor_seed": int(r["seed_hex"], 16), "label": "simulator-sampled",
                         "job_id": r["job_id"], "seed_hex": r["seed_hex"], "backend": r["backend"]})  # fmt: skip
    return jobs


# ---------- aggregation ----------


def _agg(results: list) -> dict:
    """mean and population std (ddof 0) per estimator over draws."""
    mean, std = {}, {}
    for name in up.ESTIMATORS:
        mean[name], std[name] = {}, {}
        for k in AGG_KEYS:
            v = np.array([r["estimators"][name][k] for r in results], dtype=float)
            mean[name][k] = float(np.mean(v))
            std[name][k] = float(np.std(v, ddof=DDOF))
    slips = np.array([r["prov"]["slips"] for r in results], dtype=float)
    drops = np.array([r["prov"]["ls_drops"] for r in results], dtype=float)
    return {"mean": mean, "std": std, "slips_mean": float(np.mean(slips)), "ls_drops_mean": float(np.mean(drops))}


def _draw_row(r: dict) -> dict:
    j = r["job"]
    return {"draw": j.get("draw"), "motor_seed_hex": r["motor_seed_hex"], "estimators": r["estimators"],
            "dead_reckoning": r["dead_reckoning"], "prov": r["prov"]}  # fmt: skip


def aggregate(model: dict, prof: dict, results: list, hw, ghz: dict) -> dict:
    by = {}
    for r in results:
        by.setdefault(r["job"]["block"], []).append(r)
    bench = {"scenario": BENCH_SCENARIO, "N": prof["N"], "ddof": DDOF, "rpm_known": True,
             "seed_rule": f"SeedSequence(root, spawn_key=({BENCH_SPAWN_KEY}, d)).generate_state(1, uint64)[0] >> 1, "
             f"d = 0..N-1", "note": "mean and population std over N seeded local motor draws; recorded IonQ "
             "seeds are reported separately and never enter the mean (D-06)", "by_S": {}}  # fmt: skip
    for S in prof["S"]:
        rs = [r for r in by.get("benchmark", []) if r["job"]["S"] == S]
        rs.sort(key=lambda r: r["job"]["draw"])
        entry = _agg(rs)
        entry["draws"] = [_draw_row(r) for r in rs]
        bench["by_S"][str(S)] = entry
    ref = bench["by_S"][str(S_REF)]

    ladder_e = None
    if prof["eastern_ladder"]:
        ladder_e = {"scenario": "eastern_400m", "motor": "shipped", "by_S": {}}
        for r in by.get("ladder_eastern", []):
            ladder_e["by_S"][str(r["job"]["S"])] = {"estimators": r["estimators"], "dead_reckoning": r["dead_reckoning"],
                                                    "prov": r["prov"]}  # fmt: skip

    wh = sorted(by.get("withheld", []), key=lambda r: r["job"]["draw"])
    wagg = _agg(wh)
    cells = {}
    for sensor, name in (("baseline", BASELINE), ("quantum", QUANTUM), ("quantum_single", SINGLE)):
        known = {k: ref["mean"][name][k] for k in AGG_KEYS}
        known.update({f"{k}_std": ref["std"][name][k] for k in AGG_KEYS})
        prov_key = "ls_drops_mean" if sensor == "baseline" else "slips_mean"  # each sensor's own provenance
        known[prov_key] = ref[prov_key]
        withheld = {k: wagg["mean"][name][k] for k in AGG_KEYS}
        withheld.update({f"{k}_std": wagg["std"][name][k] for k in AGG_KEYS})
        withheld[prov_key] = wagg[prov_key]
        if sensor.startswith("quantum"):
            withheld["fails"] = bool(wagg["slips_mean"] > 0)
            withheld["fails_note"] = ("tones exceed the +/-pi/2 unambiguous phase range at tau0: cycle slips make "
                                      "the signal RMSE not meaningful")  # fmt: skip
        cells[sensor] = {"estimator": name, "rpm_known": known, "rpm_withheld": withheld}
    rpm_2x2 = {"scenario": BENCH_SCENARIO, "S": S_REF, "N": prof["N"], "ddof": DDOF, "cells": cells,
               "withheld_rule": "RPM withheld from both sensors, tones still present: quantum tau = tau0 for every "
               "window (m = 0); baseline without a notch (block mean)",
               "withheld_draws": [_draw_row(r) for r in wh]}  # fmt: skip

    amp = {"scenario": BENCH_SCENARIO, "S": S_REF, "motor": "shipped (amplitudes scaled to A1)",
           "frozen_A1_nT": float(model["tone_amplitude_rule"]["A1_nT"]),
           "points": [{"A1_nT": r["A1_nT"], "estimators": r["estimators"], "prov": r["prov"]}
                      for r in sorted(by.get("amp_sweep", []), key=lambda r: r["A1_nT"])]}  # fmt: skip

    recorded = []
    for r in by.get("recorded", []):
        j = r["job"]
        recorded.append({"label": j["label"], "job_id": j["job_id"], "seed_hex": j["seed_hex"],
                         "backend": j.get("backend"), "scenario": j["scenario"], "S": j["S"],
                         "estimators": r["estimators"], "dead_reckoning": r["dead_reckoning"], "prov": r["prov"],
                         "cep50_baseline_m": r["estimators"][BASELINE]["cep50_m"],
                         "cep50_quantum_m": r["estimators"][QUANTUM]["cep50_m"]})  # fmt: skip

    ghz_row = {"scenario": BENCH_SCENARIO, "S": S_REF, "N": prof["N"],
               "note": "quantum_q1 is the single-qubit coarse stage (one qubit at S shots), not n unentangled "
               "qubits; the GHZ track spends S coarse + S fine shots (disclosed in the frozen model)",
               "rows": [{"estimator": name, "label": ROW_LABELS[name],
                         **{f"{k}_mean": ref["mean"][name][k] for k in AGG_KEYS},
                         **{f"{k}_std": ref["std"][name][k] for k in AGG_KEYS}}
                        for name in (QUANTUM, SINGLE, BASELINE)]}  # fmt: skip

    ladder_analytic = {name: {str(S): ref["mean"][name]["signal_rmse_nT"] * math.sqrt(S_REF / S) for S in prof["S"]}
                       for name in up.ESTIMATORS}  # fmt: skip
    return {"benchmark": bench, "ladder_eastern": ladder_e, "ladder_analytic_rmse_nT": ladder_analytic,
            "rpm_2x2": rpm_2x2, "amp_sweep": amp, "recorded": recorded, "ghz_scaling": ghz, "ghz_row": ghz_row}  # fmt: skip


def ghz_scaling(hw) -> dict:
    from magnav import api  # imported here: api pulls in the live path

    meas = (hw or {}).get("ghz_measured") or {}
    qpu = hw is not None and hw.get("label") == "QPU-measured"
    c = (meas.get("c1"), meas.get("c2"), meas.get("c4")) if qpu else (None, None, None)
    out = json.loads(api.ghz_scaling_json(None, *c))
    if not out.get("ok"):
        raise RuntimeError(f"ghz_scaling_json failed: {out}")
    out.pop("ok")
    out["measured_source"] = (f"QPU-measured c_n (job {hw['job_id']})" if qpu else None)
    out["ideal_source"] = "model default c_n = c1^n"
    return out


def inputs_block(hw) -> dict:
    with open(CIRCUIT_FREEZE, encoding="utf-8") as f:
        circ = json.load(f)
    return {
        "model_file": up.QSENSOR_MODEL,
        "model_sha256": up.model_sha256(),
        "circuit_sha256": circ.get("circuit_sha256"),
        "hardware_file": HARDWARE_RUN,
        "hardware_sha256": _sha256(HARDWARE_RUN) if hw is not None else None,
        "hardware_job_id": None if hw is None else hw.get("job_id"),
        "hardware_label": None if hw is None else hw.get("label"),
        "hardware_seed_hex": None if hw is None else hw.get("seed_hex"),
        "maps": {up.SCENARIOS[s]["map_file"]: _sha256(up.SCENARIOS[s]["map_file"]) for s in up.SCENARIO_ORDER},
    }


# ---------- outputs ----------


def benchmark_summary(model: dict, metrics: dict, art_scenarios: dict) -> dict:
    ref = metrics["benchmark"]["by_S"][str(S_REF)]
    N = metrics["benchmark"]["N"]
    rows = []
    for name in (BASELINE, QUANTUM, SINGLE):
        m, s = ref["mean"][name], ref["std"][name]
        rows.append({"estimator": name, "label": ROW_LABELS[name], "cep50_mean_m": m["cep50_m"],
                     "cep50_std_m": s["cep50_m"], "cep95_mean_m": m["cep95_m"], "cep95_std_m": s["cep95_m"],
                     "pct556_mean": m["pct_under_556"], "pct556_std": s["pct_under_556"]})  # fmt: skip
    recorded = [{"label": r["label"], "job_id": r["job_id"], "seed_hex": r["seed_hex"], "scenario": r["scenario"],
                 "scenario_label": up.SCENARIOS[r["scenario"]]["label"], "backend": r["backend"],
                 "cep50_baseline_m": r["cep50_baseline_m"], "cep50_quantum_m": r["cep50_quantum_m"]}
                for r in metrics["recorded"]]  # fmt: skip
    return {
        "schema_version": 1,
        "kind": "benchmark_summary",
        "scenario": BENCH_SCENARIO,
        "scenario_label": art_scenarios.get(BENCH_SCENARIO, up.SCENARIOS[BENCH_SCENARIO]["label"]),
        "S": S_REF,
        "N": N,
        "ddof": DDOF,
        "heading": f"Benchmark over {N} motor draws",
        "caption": f"Mean +/- standard deviation of position error over {N} seeded motor draws at S = {S_REF} "
        "shots per sample; the recorded IonQ seeds are listed separately and are not part of the mean.",
        "rows": rows,
        "recorded": recorded,
    }


def write_csvs(res: Path, metrics: dict) -> None:
    b = metrics["benchmark"]
    _write_csv(res / "benchmark.csv",
               ["S", "estimator", "N", "cep50_mean_m", "cep50_std_m", "cep95_mean_m", "cep95_std_m",
                "pct556_mean", "pct556_std", "signal_rmse_mean_nT", "signal_rmse_std_nT", "slips_mean",
                "ls_drops_mean"],
               [[int(S), name, b["N"], e["mean"][name]["cep50_m"], e["std"][name]["cep50_m"],
                 e["mean"][name]["cep95_m"], e["std"][name]["cep95_m"], e["mean"][name]["pct_under_556"],
                 e["std"][name]["pct_under_556"], e["mean"][name]["signal_rmse_nT"],
                 e["std"][name]["signal_rmse_nT"], e["slips_mean"], e["ls_drops_mean"]]
                for S, e in sorted(b["by_S"].items(), key=lambda kv: int(kv[0])) for name in up.ESTIMATORS])  # fmt: skip
    rows = []
    for S, e in sorted(b["by_S"].items(), key=lambda kv: int(kv[0])):
        for name in up.ESTIMATORS:
            rows.append([BENCH_SCENARIO, "benchmark_mean", int(S), name, e["mean"][name]["signal_rmse_nT"],
                         e["std"][name]["signal_rmse_nT"], metrics["ladder_analytic_rmse_nT"][name][S],
                         e["mean"][name]["cep50_m"], e["mean"][name]["pct_under_556"]])  # fmt: skip
    if metrics["ladder_eastern"]:
        for S, e in sorted(metrics["ladder_eastern"]["by_S"].items(), key=lambda kv: int(kv[0])):
            for name in up.ESTIMATORS:
                m = e["estimators"][name]
                rows.append(["eastern_400m", "shipped_motor", int(S), name, m["signal_rmse_nT"], None, None,
                             m["cep50_m"], m["pct_under_556"]])  # fmt: skip
    _write_csv(res / "ladder.csv", ["scenario", "source", "S", "estimator", "signal_rmse_nT", "signal_rmse_std_nT",
                                    "analytic_rmse_nT", "cep50_m", "pct556"], rows)  # fmt: skip
    rows = []
    for sensor, c in metrics["rpm_2x2"]["cells"].items():
        for rk in ("rpm_known", "rpm_withheld"):
            v = c[rk]
            rows.append([sensor, c["estimator"], rk, v["cep50_m"], v["cep50_m_std"], v["cep95_m"],
                         v["pct_under_556"], v["signal_rmse_nT"], v.get("slips_mean"), v.get("ls_drops_mean"),
                         v.get("fails", False)])  # fmt: skip
    _write_csv(res / "rpm_2x2.csv", ["sensor", "estimator", "rpm", "cep50_mean_m", "cep50_std_m", "cep95_mean_m",
                                     "pct556_mean", "signal_rmse_mean_nT", "slips_mean", "ls_drops_mean", "fails"],
               rows)  # fmt: skip
    rows = []
    for p in metrics["amp_sweep"]["points"]:
        for name in up.ESTIMATORS:
            m = p["estimators"][name]
            rows.append([p["A1_nT"], name, m["cep50_m"], m["cep95_m"], m["pct_under_556"], m["signal_rmse_nT"],
                         p["prov"]["slips"], p["prov"]["ls_drops"]])  # fmt: skip
    _write_csv(res / "amp_sweep.csv", ["A1_nT", "estimator", "cep50_m", "cep95_m", "pct556", "signal_rmse_nT",
                                       "slips", "ls_drops"], rows)  # fmt: skip
    g = metrics["ghz_scaling"]
    meas = g.get("ghz_measured_nT") or [None] * len(g["n"])
    cm = g.get("c_measured") or {}
    _write_csv(res / "ghz_scaling.csv", ["n", "sql_nT", "hl_nT", "unentangled_nT", "ghz_ideal_nT", "ghz_measured_nT",
                                         "c_ideal", "c_measured"],
               [[n, g["sql_nT"][i], g["hl_nT"][i], g["unentangled_nT"][i], g["ghz_ideal_nT"][i], meas[i],
                 g["c_ideal"][str(n)], cm.get(str(n))] for i, n in enumerate(g["n"])])  # fmt: skip


def build_replay(bits) -> tuple:
    """The replay artifact (uav_pipeline build sequence) with the given bits."""
    from magnav import artifact  # imported here: artifact must not import uav_pipeline back

    runs = [up.run_uav(scenario=s, bits=bits, tile=_tile(s)) for s in up.SCENARIO_ORDER]
    files = up.load_provenance()["files"]
    map_infos = [files[up.SCENARIOS[s]["map_file"]] for s in up.SCENARIO_ORDER]
    art = artifact.build_scenarios_artifact(runs, [up.SCENARIOS[s] for s in up.SCENARIO_ORDER], map_infos)
    errs = artifact.validate_uav_artifact(art)
    return art, errs, artifact.dumps_artifact(art).encode("utf-8")


def build(out_dir=".", quick=False, max_workers=None, figures=True) -> dict:
    """Run the job matrix and write every evidence file under out_dir; returns metrics.

    figures=False (CLI --no-figures) skips the PNGs and circuit.txt only; metrics.json and
    filter_function.csv are the same either way.
    """
    # imported here: figures is numpy-only at import and imports matplotlib inside its functions
    from magnav import figures as figs

    out = Path(out_dir)
    profile = "quick" if quick else "full"
    prof = PROFILES[profile]
    model = _model()
    hw = load_hardware()
    jobs = job_list(model, prof, hw)
    with ProcessPoolExecutor(max_workers=max_workers) as ex:
        pending = ex.map(run_job, jobs)  # submitted now, results in input order
        bits = up.replay_bits()  # None unless the record is QPU-measured (D-08)
        art, errs, art_bytes = build_replay(bits)
        results = list(pending)
    if errs:
        raise ValueError("replay artifact invalid:\n  " + "\n  ".join(errs))
    ghz = ghz_scaling(hw)
    metrics = {"schema_version": 1, "profile": profile, "inputs": inputs_block(hw), "cut_items": []}
    metrics.update(aggregate(model, prof, results, hw, ghz))
    metrics["replay"] = {"motor_seed": str(art["motor"]["seed"]),
                         "bits_source": "QPU-measured" if bits else "shipped motor seed",
                         "c_n": "model default (c1^n)",
                         "comparison_statement": art["comparison"]["statement"],
                         "metrics": {sc["id"]: sc["line"]["metrics"] for sc in art["scenarios"]}}  # fmt: skip
    ff = figs.filter_function_data(model)
    metrics["filter_function"] = ff["summary"]
    res = out / "results"
    _write_bytes(res / "metrics.json", _dump_json(metrics))
    write_csvs(res, metrics)
    _write_csv(res / "filter_function.csv", ff["header"], ff["rows"])
    labels = {sc["id"]: sc["label"] for sc in art["scenarios"]}
    summ = benchmark_summary(model, metrics, labels)
    _write_bytes(out / BENCHMARK_SUMMARY, _dump_json(summ))
    _write_bytes(out / "data" / "precomputed_uav.json", art_bytes)
    if figures:
        figs.render_all(metrics, model, out, ff=ff)
    return metrics


def _report(metrics: dict) -> None:
    b = metrics["benchmark"]
    print(f"profile {metrics['profile']}: benchmark {b['scenario']}, N = {b['N']} draws (ddof {b['ddof']})")
    for S, e in sorted(b["by_S"].items(), key=lambda kv: int(kv[0])):
        parts = [f"{n} {e['mean'][n]['cep50_m']:.1f}+/-{e['std'][n]['cep50_m']:.1f} m" for n in up.ESTIMATORS]
        print(f"  S = {S:>4}: CEP50 " + ", ".join(parts))
    for sensor, c in metrics["rpm_2x2"]["cells"].items():
        k, w = c["rpm_known"], c["rpm_withheld"]
        print(f"  2x2 {sensor:15s} known CEP50 {k['cep50_m']:.1f} m | withheld CEP50 {w['cep50_m']:.1f} m, "
              f"slips {w.get('slips_mean', 0):.0f}")  # fmt: skip
    for r in metrics["recorded"]:
        print(f"  recorded {r['label']} {r['seed_hex']} {r['scenario']}: CEP50 baseline {r['cep50_baseline_m']:.1f} m,"
              f" GHZ-4 {r['cep50_quantum_m']:.1f} m")  # fmt: skip
    print("replay: " + metrics["replay"]["comparison_statement"])


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="magnav.regen", description="regenerate every numeric evidence file")
    ap.add_argument("--out", default=".", help="output root (writes results/ and data/ under it)")
    ap.add_argument("--quick", action="store_true", help="small profile for tests (N = 2, S in {64, 256})")
    ap.add_argument("--no-figures", action="store_true", help="skip the PNG figures and circuit.txt (needs no matplotlib)")
    args = ap.parse_args(argv)
    try:
        metrics = build(args.out, quick=args.quick, figures=not args.no_figures)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        return 1
    _report(metrics)
    return 0


if __name__ == "__main__":
    sys.exit(main())
