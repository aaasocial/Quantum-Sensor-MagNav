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

import json
import math

import numpy as np

from magnav.metrics import THRESHOLDS_M

UAV_ARTIFACT_PATH = "data/precomputed_uav.json"  # literal: Qollab preloads literal paths only
SCHEMA_VERSION = 2
KIND = "uav_run"
MAX_POINTS = 1500
PREVIEW_MAX = 160
MAX_BYTES = 2 * 1024 * 1024
TITLE = "Quantum MagNav - UAV over Eastern_395, Ramsey vs equal-budget baseline"
ESTIMATORS = ("baseline_ls", "baseline_mean", "quantum_q1", "quantum_ghz4")  # same as uav_pipeline
DEFAULT_ESTIMATOR = "quantum_ghz4"
REQUIRED_TOP = (
    "schema_version", "kind", "title", "thresholds_m", "estimators", "default_estimator", "S",
    "model_sha256", "motor", "provenance", "line",
)  # fmt: skip
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


def build_uav_artifact(run: dict) -> dict:
    """Assemble RunArtifact v2 from magnav.uav_pipeline.run_uav() output."""
    model = run["model"]
    prov = run["prov"]
    ghz = model["ghz"]
    n_fine = int(max(ghz["n_set"]))
    motor = dict(run["motor"])
    motor["seed_str"] = None if motor["seed"] is None else str(int(motor["seed"]))
    obj = {
        "schema_version": SCHEMA_VERSION,
        "kind": KIND,
        "title": TITLE,
        "thresholds_m": [int(v) for v in THRESHOLDS_M],
        "estimators": list(ESTIMATORS),
        "default_estimator": DEFAULT_ESTIMATOR,
        "S": int(run["S"]),
        "model_sha256": run["model_sha256"],
        "motor": motor,
        "provenance": {
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
        },
        "line": line_entry(run["line"], prov),
    }
    return _clean(obj)


def dumps_artifact(obj: dict) -> str:
    """Compact strict JSON (no NaN); deterministic for a given object."""
    return json.dumps(_clean(obj), separators=(",", ":"), allow_nan=False, sort_keys=False)


def _is_hex64(s) -> bool:
    return isinstance(s, str) and len(s) == 64 and all(c in "0123456789abcdef" for c in s)


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
    L = a.get("line")
    if not isinstance(L, dict):
        errs.append("line is not an object")
    else:
        miss = [k for k in REQUIRED_LINE if k not in L]
        if miss:
            errs.append(f"line: missing {miss}")
        else:
            n = len(L["t"])
            if n > MAX_POINTS:
                errs.append(f"t has {n} points > {MAX_POINTS}")
            series = {"truth." + k: v for k, v in L["truth"].items()}
            series.update({"dead_reckoning." + k: v for k, v in L["dead_reckoning"].items()})
            series.update({"sensor." + k: L["sensor"].get(k, []) for k in SENSOR_KEYS})
            missing_sensor = [k for k in SENSOR_KEYS if k not in L["sensor"]]
            if missing_sensor:
                errs.append(f"sensor missing {missing_sensor}")
            if set(L["estimates"]) != set(ESTIMATORS):
                errs.append(f"estimates keys {sorted(L['estimates'])} != {sorted(ESTIMATORS)}")
            for name, e in L["estimates"].items():
                for k in ("x", "y", "signal_nT"):
                    series[f"estimates.{name}.{k}"] = e.get(k, [])
                lens = {len(e.get(k, [])) for k in ("window_t", "ncc", "accepted")}
                if len(lens) != 1:
                    errs.append(f"{name}: window arrays differ in length")
                if any(v not in (0, 1) for v in e.get("accepted", [])):
                    errs.append(f"{name}: accepted not in {{0, 1}}")
                bad = [i for i, (c, ok) in enumerate(zip(e.get("ncc", []), e.get("accepted", []))) if c is None and ok]
                if bad:
                    errs.append(f"{name}: null ncc in accepted windows {bad[:5]}")
                for k in ("x", "y"):
                    if any(v is None for v in e.get(k, [])):
                        errs.append(f"{name}.{k} contains null")
            for k in FLAG_SERIES:
                if any(v not in (0, 1) for v in L["sensor"].get(k, [])):
                    errs.append(f"sensor.{k} not in {{0, 1}}")
            for grp in ("truth", "dead_reckoning"):
                for k in ("x", "y"):
                    if any(v is None for v in L[grp].get(k, [])):
                        errs.append(f"{grp}.{k} contains null")
            for name, v in series.items():
                if len(v) != n:
                    errs.append(f"{name} has {len(v)} points, t has {n}")
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
