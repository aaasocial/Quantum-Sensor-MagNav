"""RunArtifact v2: the UAV run as columnar JSON for the precomputed replay fallback (pure numpy).

One shared downsample index for every series; metres rounded to integers, nT to 0.1, t to
0.1 s, ncc to 3 decimals, metrics to 0.1. NaN/inf become null and `allow_nan=False` rejects
anything left over; there are no wall-clock timestamps, so the same run gives the same bytes.

Nullable fields consumers must handle: estimates[name].ncc[i] is null when every candidate in
window i touched an invalid map cell (such a window is never accepted); metrics values may be
null (the signal columns of the dead_reckoning row).

Large integers: motor.seed and the provenance seeds are 64-bit and lose precision in a
JavaScript JSON.parse; motor.seed_str carries the exact decimal string for the browser.
"""

from __future__ import annotations

import hashlib
import json
import math

import numpy as np

from magnav.metrics import THRESHOLDS_M
from magnav.synthmap import SYNTH_LABEL

UAV_ARTIFACT_PATH = "data/precomputed_uav.json"  # literal: Qollab preloads literal paths only
SCHEMA_VERSION = 2
KIND = "uav_run"
MAX_POINTS = 1500
PREVIEW_MAX = 160
MAX_BYTES = 2 * 1024 * 1024
TITLE = "Quantum MagNav - UAV, Ramsey vs equal-budget baseline"
ESTIMATORS = ("baseline_ls", "baseline_mean", "quantum_q1", "quantum_ghz4")  # same as uav_pipeline
DEFAULT_ESTIMATOR = "quantum_ghz4"
REQUIRED_TOP = (
    "schema_version", "kind", "title", "thresholds_m", "estimators", "default_estimator", "S",
    "model_sha256", "motor", "default_scenario", "scenarios", "comparison",
)  # fmt: skip
REQUIRED_SCENARIO = (
    "id", "label", "map_label", "map_caption", "synthetic", "alt_m", "model_file", "model_sha256",
    "map", "notes", "provenance", "line",
)  # fmt: skip
SCENARIO_ORDER = ("synthetic_100m", "eastern_400m")  # same as uav_pipeline (not imported back)
DEFAULT_SCENARIO = "synthetic_100m"
COMPARISON_ROWS = ("dead_reckoning", *ESTIMATORS)
VERDICTS = ("grows", "shrinks", "stays about the same", "is mixed")
CEP_TIE_M = 10.0  # tie band: one sixth of the 60 m TERCOM step
REQUIRED_LINE = (
    "line", "map_file", "frame", "map_preview", "jam", "metric_start_index", "t", "truth",
    "dead_reckoning", "estimates", "metrics", "sensor",
)  # fmt: skip
SENSOR_KEYS = ("rpm", "tau_ms", "m", "b_ref_nT", "fringe", "ghz_fallback")
MOTOR_KEYS = ("seed", "bits", "t_knots", "rpm_knots", "amps_nT", "phases", "A1_nT")
FLAG_SERIES = ("fringe", "ghz_fallback")


def downsample_idx(n: int, jam_idx: int, max_points: int = MAX_POINTS) -> np.ndarray:
    """Shared display index: a uniform stride plus the jam sample and the last sample."""
    step = max(1, math.ceil(n / (max_points - 2)))
    idx = np.union1d(np.arange(0, n, step), [int(jam_idx), n - 1])
    return idx.astype(np.int64)


def _r(a, nd: int) -> list:
    """Round an array to nd decimals (nd=0 gives ints); non-finite -> None."""
    a = np.asarray(a, dtype=np.float64)
    out = []
    for v in a.tolist():
        if not math.isfinite(v):
            out.append(None)
        elif nd == 0:
            out.append(round(v))
        else:
            out.append(round(v, nd))
    return out


def _flags(a) -> list:
    return [int(bool(v)) for v in np.asarray(a).tolist()]


def _clean(obj, nd: int = 6):
    """Recursive JSON-safe copy: numpy scalars/arrays to Python, NaN/inf to None."""
    if isinstance(obj, dict):
        return {str(k): _clean(v, nd) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_clean(v, nd) for v in obj]
    if isinstance(obj, np.ndarray):
        return _clean(obj.tolist(), nd)
    if isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, (float, np.floating)):
        v = float(obj)
        return round(v, nd) if math.isfinite(v) else None
    return obj


def map_preview(tile, max_side: int = PREVIEW_MAX) -> dict:
    """Block-mean preview of a MapTile (all-valid rule), rows south-to-north, row-major."""
    k = max(1, math.ceil(max(tile.nx, tile.ny) / max_side))
    ny, nx = tile.ny // k, tile.nx // k
    M = np.asarray(tile.M, dtype=np.float64)[: ny * k, : nx * k].reshape(ny, k, nx, k)
    V = np.asarray(tile.V, dtype=bool)[: ny * k, : nx * k].reshape(ny, k, nx, k)
    valid = V.all(axis=(1, 3))
    Mm = np.where(V, M, 0.0).sum(axis=(1, 3)) / np.maximum(V.sum(axis=(1, 3)), 1)
    nT = np.clip(np.round(np.where(valid, Mm, 0.0)), -32768, 32767).astype(np.int64)
    gx = np.asarray(tile.gx, dtype=np.float64)[: nx * k].reshape(nx, k).mean(axis=1)
    gy = np.asarray(tile.gy, dtype=np.float64)[: ny * k].reshape(ny, k).mean(axis=1)
    return {
        "nx": int(nx),
        "ny": int(ny),
        "block": int(k),
        "x_min": round(float(gx[0])),
        "x_max": round(float(gx[-1])),
        "y_min": round(float(gy[0])),
        "y_max": round(float(gy[-1])),
        "extent_note": "cell-centre coordinates (local m) of the first/last preview cells",
        "nT": nT.ravel().tolist(),
        "valid": valid.astype(np.int64).ravel().tolist(),
    }


def _metrics(row: dict) -> dict:
    out = {}
    for k, v in row.items():
        if k in ("line", "sensor", "denoiser"):
            continue
        if v is None or isinstance(v, (int, np.integer)):
            out[k] = None if v is None else int(v)
        else:
            out[k] = round(float(v), 1) if math.isfinite(float(v)) else None
    return out


def line_entry(L: dict, prov: dict) -> dict:
    """The artifact's `line` object from run_uav()["line"] and the sensor provenance."""
    n = int(L["n"])
    jam = int(L["jam_idx"])
    idx = downsample_idx(n, jam)
    t = np.asarray(L["t"], dtype=np.float64)
    estimates, metrics = {}, {"dead_reckoning": _metrics(L["dr_metrics"])}
    for name in ESTIMATORS:
        r = L["results"][name]
        we = np.asarray(r["window_end"], dtype=np.int64)
        estimates[name] = {
            "x": _r(np.asarray(r["x"])[idx], 0),
            "y": _r(np.asarray(r["y"])[idx], 0),
            "signal_nT": _r(np.asarray(r["signal"])[idx], 1),
            "window_t": _r(t[np.clip(we - 1, 0, n - 1)] - t[0], 1),
            "ncc": _r(r["ncc"], 3),
            "accepted": _flags(r["accepted"]),
        }
        metrics[name] = _metrics(r["metrics"])
    igrf = np.asarray(L["igrf"], dtype=np.float64)
    sensor = {
        "rpm": _r(np.asarray(prov["rpm"])[idx], 0),
        "tau_ms": _r(1e3 * np.asarray(prov["tau_s"], dtype=np.float64)[idx], 3),
        "m": [int(v) for v in np.asarray(prov["m"])[idx].tolist()],
        "b_ref_nT": _r((np.asarray(prov["b_ref_nT"], dtype=np.float64) - igrf)[idx], 1),
        "b_ref_note": "servo reference minus the IGRF plane (nT)",
        "fringe": _flags(np.asarray(prov["fringe"])[idx]),
        "ghz_fallback": _flags(np.asarray(prov["ghz_fallback"])[idx]),
    }
    frame = L["frame"]
    return {
        "line": L["line"],
        "map_file": L["map_file"],
        "frame": {"type": "local_equirectangular", "lat0": frame["lat0"], "lon0": frame["lon0"], "R_m": frame["R"]},
        "map_preview": map_preview(L["tile"]),
        "jam": {
            "index": jam,
            "t": round(float(t[jam] - t[0]), 1),
            "display_index": int(np.searchsorted(idx, jam)),
        },
        "metric_start_index": int(L["metric_start"]),
        "t": _r(t[idx] - t[0], 1),
        "truth": {
            "x": _r(np.asarray(L["truth_x"])[idx], 0),
            "y": _r(np.asarray(L["truth_y"])[idx], 0),
            "anomaly_nT": _r(np.asarray(L["truth_anomaly"])[idx], 1),
        },
        "dead_reckoning": {"x": _r(np.asarray(L["dr_x"])[idx], 0), "y": _r(np.asarray(L["dr_y"])[idx], 0)},
        "estimates": estimates,
        "metrics": metrics,
        "sensor": sensor,
    }


def _provenance(run: dict) -> dict:
    """Per-scenario sensor/navigation provenance (keys and values unchanged from Phase 1)."""
    model = run["model"]
    prov = run["prov"]
    ghz = model["ghz"]
    n_fine = int(max(ghz["n_set"]))
    return {
        "model_file": "data/qsensor_model.json",
        "tercom": dict(model["tercom"]),
        "ins": dict(model["ins"]),
        "seeds": {k: model["seeds"][k] for k in ("root", "shipped_motor_seed", "dr_seed")},
        "map_error_seed": model["map_error"]["seed"],
        "servo_cycle_s": model["servo"]["cycle_s"],
        "ghz": {
            "n": n_fine,
            "c_n": model["ghz"]["c_n_default"][str(n_fine)],
            "switch_rule": ghz["switch_rule"],
            "n_fallback": int(prov["n_fallback"]),
            "fine_slips": int(prov["fine_slips"]),
        },
        "quantum": {
            "slips": int(prov["slips"]),
            "max_abs_phi": float(prov["max_abs_phi"]),
            "n_fringe": int(prov["n_fringe"]),
        },
        "baseline": {"primary": "ls_guarded", "variant": "block_mean", "ls_drops": int(prov["ls_drops"])},
        "crust_within_sample": "frozen",
        "note": "servo windows set the reference only; not counted in S",
    }


def _file_sha256(path: str) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def scenario_entry(run: dict, sc: dict, map_info: dict) -> dict:
    """One `scenarios[]` entry from a run_uav(scenario=...) output, its SCENARIOS entry and its
    data/provenance.json files[map_file] entry (passed in: artifact does not import uav_pipeline)."""
    if sc["synthetic"]:
        mp = {
            "file": sc["map_file"],
            "sha256": map_info["output_sha256"],
            "seed": int(map_info["seed"]),
            "seed_str": str(int(map_info["seed"])),
            "beta": map_info["beta"],
            "beta_band_m": list(map_info["beta_band_m"]),
            "cell_m": map_info["cell_m"],
            "z0_m": map_info["z0_m"],
            "h_fit_m": map_info["h_fit_m"],
            "label": map_info["label"],
        }
    else:
        mp = {
            "file": sc["map_file"],
            "sha256": map_info["output_sha256"],
            "source_file": map_info["source_file"],
            "source_sha256": map_info["source_sha256"],
        }
    return {
        "id": sc["id"],
        "synthetic": bool(sc["synthetic"]),
        "alt_m": float(sc["alt_m"]),
        "label": sc["label"],
        "map_label": sc["map_label"],
        "map_caption": sc["map_caption"],
        "model_file": sc["model_file"],
        "model_sha256": _file_sha256(sc["model_file"]),
        "map": mp,
        "notes": list(sc["notes"]),
        "provenance": _provenance(run),
        "line": line_entry(run["line"], run["prov"]),
    }


def _sign(v: float) -> int:
    return (v > 0) - (v < 0)


def comparison_summary(scenarios: list) -> dict:
    """The comparison rule fixed in plan 01.1-02 before any 100 m result (applied unchanged).

    Rows per scenario x (dead_reckoning + four estimators); advantage of quantum_ghz4 over
    baseline_ls per scenario; d_cep / d_lost between 100 m and 400 m; 10 m CEP50 tie band; verdict.
    """
    by_id = {s["id"]: s for s in scenarios}
    rows = []
    for sid in SCENARIO_ORDER:
        met = by_id[sid]["line"]["metrics"]
        for name in COMPARISON_ROWS:
            r = met[name]
            windows = r.get("windows")
            lost = None if name == "dead_reckoning" or windows is None else int(windows) - int(r["accepted"])
            rows.append({
                "scenario": sid,
                "estimator": name,
                "signal_rmse_nT": r.get("signal_rmse_nT"),
                "cep50_m": r.get("cep50_m"),
                "cep95_m": r.get("cep95_m"),
                "pct_under_556": r.get("pct_under_556"),
                "windows": None if name == "dead_reckoning" or windows is None else int(windows),
                "matches_lost": lost,
            })  # fmt: skip
    R = {(r["scenario"], r["estimator"]): r for r in rows}

    def adv(sid):
        ls, g = R[(sid, "baseline_ls")], R[(sid, "quantum_ghz4")]
        return float(ls["cep50_m"]) - float(g["cep50_m"]), int(ls["matches_lost"]) - int(g["matches_lost"])

    a100, la100 = adv("synthetic_100m")
    a400, la400 = adv("eastern_400m")
    d_cep = a100 - a400
    d_lost = la100 - la400
    sign_cep = 1 if d_cep > CEP_TIE_M else (-1 if d_cep < -CEP_TIE_M else 0)
    sign_lost = _sign(d_lost)
    if sign_cep >= 0 and sign_lost >= 0 and (sign_cep > 0 or sign_lost > 0):
        verdict = "grows"
    elif sign_cep <= 0 and sign_lost <= 0 and (sign_cep < 0 or sign_lost < 0):
        verdict = "shrinks"
    elif sign_cep == 0 and sign_lost == 0:
        verdict = "stays about the same"
    else:
        verdict = "is mixed"
    s100, s400 = "synthetic_100m", "eastern_400m"
    w100, w400 = R[(s100, "baseline_ls")]["windows"], R[(s400, "baseline_ls")]["windows"]
    statement = (
        f"At 100 m on the synthetic map the quantum navigation advantage {verdict} compared with the "
        f"400 m Eastern_395 flight: GHZ-4 vs LS baseline CEP50 advantage {a100:+.1f} m at 100 m vs "
        f"{a400:+.1f} m at 400 m; TERCOM matches lost (LS baseline / GHZ-4) "
        f"{R[(s100, 'baseline_ls')]['matches_lost']}/{w100} vs {R[(s100, 'quantum_ghz4')]['matches_lost']}/{w100} "
        f"at 100 m and {R[(s400, 'baseline_ls')]['matches_lost']}/{w400} vs "
        f"{R[(s400, 'quantum_ghz4')]['matches_lost']}/{w400} at 400 m. The signal-level advantage "
        f"({float(R[(s100, 'baseline_ls')]['signal_rmse_nT']):.1f} nT vs "
        f"{float(R[(s100, 'quantum_ghz4')]['signal_rmse_nT']):.1f} nT at 100 m) does not depend on the map."
    )
    return {
        "rule": "advantage = baseline_ls - quantum_ghz4 (CEP50 m, TERCOM matches lost); d = 100 m - 400 m; "
        "CEP50 tie band 10 m; grows / shrinks / stays about the same / is mixed",
        "rows": rows,
        "advantage": {
            s100: {"cep50_adv_m": round(a100, 1), "lost_adv": la100},
            s400: {"cep50_adv_m": round(a400, 1), "lost_adv": la400},
        },
        "d_cep_m": round(d_cep, 1),
        "d_lost": d_lost,
        "sign_cep": sign_cep,
        "sign_lost": sign_lost,
        "verdict": verdict,
        "statement": statement,
    }


def build_scenarios_artifact(runs: list, scenarios_meta: list, map_infos: list) -> dict:
    """Assemble RunArtifact v2 with `scenarios` from run_uav(scenario=s) outputs (one per scenario,
    in SCENARIO_ORDER), the matching SCENARIOS entries and data/provenance.json map entries."""
    if [sc["id"] for sc in scenarios_meta] != list(SCENARIO_ORDER):
        raise ValueError(f"scenarios must be {list(SCENARIO_ORDER)}")
    if [r["scenario"] for r in runs] != list(SCENARIO_ORDER):
        raise ValueError("runs are not in SCENARIO_ORDER")
    r0 = runs[0]
    for r in runs[1:]:
        if r["motor"] != r0["motor"] or r["S"] != r0["S"] or r["model_sha256"] != r0["model_sha256"]:
            raise ValueError("scenario runs differ in motor, S or model_sha256")
    motor = dict(r0["motor"])
    motor["seed_str"] = None if motor["seed"] is None else str(int(motor["seed"]))
    scen = [scenario_entry(r, sc, mi) for r, sc, mi in zip(runs, scenarios_meta, map_infos)]
    scen = _clean(scen)
    obj = {
        "schema_version": SCHEMA_VERSION,
        "kind": KIND,
        "title": TITLE,
        "thresholds_m": [int(v) for v in THRESHOLDS_M],
        "estimators": list(ESTIMATORS),
        "default_estimator": DEFAULT_ESTIMATOR,
        "S": int(r0["S"]),
        "model_sha256": r0["model_sha256"],
        "motor": motor,
        "default_scenario": DEFAULT_SCENARIO,
        "scenarios": scen,
        "comparison": comparison_summary(scen),
    }
    return _clean(obj)


def dumps_artifact(obj: dict) -> str:
    """Compact strict JSON (no NaN); deterministic for a given object."""
    return json.dumps(_clean(obj), separators=(",", ":"), allow_nan=False, sort_keys=False)


def _is_hex64(s) -> bool:
    return isinstance(s, str) and len(s) == 64 and all(c in "0123456789abcdef" for c in s)


def _validate_line(L, prefix: str = "line") -> list:
    """Per-line checks (unchanged from Phase 1), messages prefixed with the scenario."""
    errs = []
    if not isinstance(L, dict):
        return [f"{prefix} is not an object"]
    miss = [k for k in REQUIRED_LINE if k not in L]
    if miss:
        return [f"{prefix}: missing {miss}"]
    n = len(L["t"])
    if n > MAX_POINTS:
        errs.append(f"{prefix}: t has {n} points > {MAX_POINTS}")
    series = {"truth." + k: v for k, v in L["truth"].items()}
    series.update({"dead_reckoning." + k: v for k, v in L["dead_reckoning"].items()})
    series.update({"sensor." + k: L["sensor"].get(k, []) for k in SENSOR_KEYS})
    missing_sensor = [k for k in SENSOR_KEYS if k not in L["sensor"]]
    if missing_sensor:
        errs.append(f"{prefix}: sensor missing {missing_sensor}")
    if set(L["estimates"]) != set(ESTIMATORS):
        errs.append(f"{prefix}: estimates keys {sorted(L['estimates'])} != {sorted(ESTIMATORS)}")
    for name, e in L["estimates"].items():
        for k in ("x", "y", "signal_nT"):
            series[f"estimates.{name}.{k}"] = e.get(k, [])
        lens = {len(e.get(k, [])) for k in ("window_t", "ncc", "accepted")}
        if len(lens) != 1:
            errs.append(f"{prefix}: {name}: window arrays differ in length")
        if any(v not in (0, 1) for v in e.get("accepted", [])):
            errs.append(f"{prefix}: {name}: accepted not in {{0, 1}}")
        bad = [i for i, (c, ok) in enumerate(zip(e.get("ncc", []), e.get("accepted", []))) if c is None and ok]
        if bad:
            errs.append(f"{prefix}: {name}: null ncc in accepted windows {bad[:5]}")
        for k in ("x", "y"):
            if any(v is None for v in e.get(k, [])):
                errs.append(f"{prefix}: {name}.{k} contains null")
    for k in FLAG_SERIES:
        if any(v not in (0, 1) for v in L["sensor"].get(k, [])):
            errs.append(f"{prefix}: sensor.{k} not in {{0, 1}}")
    for grp in ("truth", "dead_reckoning"):
        for k in ("x", "y"):
            if any(v is None for v in L[grp].get(k, [])):
                errs.append(f"{prefix}: {grp}.{k} contains null")
    for name, v in series.items():
        if len(v) != n:
            errs.append(f"{prefix}: {name} has {len(v)} points, t has {n}")
    return errs


def validate_uav_artifact(a: dict) -> list:
    """Return a list of problems; an empty list means valid."""
    if not isinstance(a, dict):
        return ["artifact is not an object"]
    errs = []
    if a.get("schema_version") != SCHEMA_VERSION:
        errs.append(f"schema_version {a.get('schema_version')!r} != {SCHEMA_VERSION}")
    if a.get("kind") != KIND:
        errs.append(f"kind {a.get('kind')!r} != {KIND!r}")
    errs += [f"missing top-level key {k}" for k in REQUIRED_TOP if k not in a]
    if list(a.get("estimators", [])) != list(ESTIMATORS):
        errs.append(f"estimators {a.get('estimators')!r} != {list(ESTIMATORS)}")
    if a.get("default_estimator") not in ESTIMATORS:
        errs.append("default_estimator not in estimators")
    if not _is_hex64(a.get("model_sha256")):
        errs.append("model_sha256 is not 64 hex characters")
    mot = a.get("motor") or {}
    errs += [f"motor missing {k}" for k in MOTOR_KEYS if k not in mot]
    if not isinstance(mot.get("seed"), int) or isinstance(mot.get("seed"), bool):
        errs.append("motor.seed is not an int")
    scen = a.get("scenarios")
    if not isinstance(scen, list):
        errs.append("scenarios is not a list")
        scen = []
    ids = [s.get("id") if isinstance(s, dict) else None for s in scen]
    if len(set(ids)) != len(ids):
        errs.append(f"duplicate scenario ids {ids}")
    if ids != list(SCENARIO_ORDER):
        errs.append(f"scenario ids {ids} != {list(SCENARIO_ORDER)}")
    if a.get("default_scenario") not in ids:
        errs.append(f"default_scenario {a.get('default_scenario')!r} not among scenario ids")
    for s in scen:
        if not isinstance(s, dict):
            errs.append("scenario entry is not an object")
            continue
        sid = s.get("id")
        miss = [k for k in REQUIRED_SCENARIO if k not in s]
        if miss:
            errs.append(f"scenario {sid}: missing {miss}")
            continue
        if not _is_hex64(s.get("model_sha256")):
            errs.append(f"scenario {sid}: model_sha256 is not 64 hex characters")
        texts = (str(s.get("map_label")), str(s.get("map_caption")))
        if s.get("synthetic") is True:
            if s.get("map_label") != SYNTH_LABEL:
                errs.append(f"scenario {sid}: synthetic map_label != {SYNTH_LABEL!r}")
            if SYNTH_LABEL not in str(s.get("map_caption")):
                errs.append(f"scenario {sid}: synthetic map_caption lacks {SYNTH_LABEL!r}")
        elif any(SYNTH_LABEL in t for t in texts):
            errs.append(f"scenario {sid}: non-synthetic scenario carries the synthetic label")
        errs += _validate_line(s.get("line"), f"scenario {sid} line")
    comp = a.get("comparison")
    if not isinstance(comp, dict) or comp.get("verdict") not in VERDICTS:
        errs.append(f"comparison verdict not in {list(VERDICTS)}")
    try:
        size = len(json.dumps(a, separators=(",", ":"), allow_nan=False).encode("utf-8"))
    except ValueError as exc:  # NaN/inf left in the object
        errs.append(f"not strict JSON: {exc}")
    else:
        if size >= MAX_BYTES:
            errs.append(f"serialized size {size} >= {MAX_BYTES}")
    return errs


def load_uav_artifact() -> dict:
    with open(UAV_ARTIFACT_PATH, encoding="utf-8") as f:
        return json.load(f)
