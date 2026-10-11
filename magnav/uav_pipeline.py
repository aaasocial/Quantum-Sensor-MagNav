"""UAV pipeline: frozen comparison rules (`data/qsensor_model.json`) and the orchestration that
runs the quantum sensor and the equal-budget baseline on one world (pure numpy + stdlib).

Freeze order (SC5): every rule that could bias the comparison (equal budget, sigma1 matching,
GHZ set, c_n, switch rule, tone-amplitude rule and value, map-error seed, tau0, flight, INS,
TERCOM, seeds) is written by `freeze_model` and committed alone, before any motor-on
quantum-vs-baseline output exists. The tone-amplitude rule (`calibrate_amplitude`) uses the
baseline only; no quantum estimator runs during the freeze (AST-tested).

This module orchestrates, so it may touch the World (like the sister pipeline.py).

CLI: `python -m magnav.uav_pipeline freeze` (once; refuses to overwrite) and
`python -m magnav.uav_pipeline build` (motor-on run -> data/precomputed_uav.json).
"""

from __future__ import annotations

import argparse
import dataclasses
import hashlib
import json
import sys
from pathlib import Path

import numpy as np

from magnav import baseline, motor, ramsey, seeds, synthmap, uav
from magnav.data import MAP_EASTERN, load_map
from magnav.metrics import position_metrics, signal_metrics
from magnav.motor import motor_to_dict, rev_at, rpm_at, tone_field, tone_window_integral
from magnav.nav import anomaly_signal, tercom
from magnav.seeds import ROOT_SEED, int_seed, stream

QSENSOR_MODEL = "data/qsensor_model.json"
MODEL_SCHEMA_VERSION = 1
S_DEFAULT = 256
SHOTS_LADDER = (64, 256, 1024, 4096)
AMP_RULE = {"ratio": 0.6, "S_ref": 256, "draws": 5, "alt_S_ref": 64}
L1_EXACT = 1e-9  # leftover per unit A1 at or below this is exact cancellation (draw skipped)
REQUIRED_MODEL_KEYS = (
    "schema_version",
    "gamma_hz_per_nT",
    "fs_hz",
    "tau0_s",
    "tau_rule",
    "servo",
    "igrf_plane",
    "crust_within_sample",
    "flight",
    "ins",
    "tercom",
    "motor_prior",
    "tone_amplitude_rule",
    "noise",
    "equal_budget",
    "ghz",
    "baseline",
    "map_error",
    "shots_ladder",
    "S_default",
    "seeds",
    "notes",
)


def _sig2(x: float) -> float:
    """Round to 2 significant figures."""
    return float(f"{float(x):.2g}")


def _rms(a) -> float:
    return float(np.sqrt(np.mean(np.square(a))))


def calibrate_amplitude(world, S_ref, draws=5, root_seed=ROOT_SEED, ratio=0.6,
                        tercom=uav.TERCOM_PARAMS) -> dict:  # fmt: skip
    """Tone-amplitude rule (BASELINE ONLY): A1 such that the guarded-LS baseline leftover RMS
    after the jam equals `ratio` x the median 120-sample window std of the true anomaly.

    Per draw d: L1 = leftover RMS per unit A1 (noise-free readouts, unit tones), floor = LS
    RMS on noisy readouts with tones off; A1_d = sqrt(max(target^2 - floor^2, 0)) / L1.
    Returns the median over draws rounded to 2 significant figures.
    """
    n = len(world.t)
    fs = float(world.flight["fs_hz"])
    jam = int(float(world.flight["jam_fraction"]) * n)
    win = int(tercom["window"])
    stride = int(tercom["stride"])
    start = jam + win
    anom = world.b_true - world.igrf
    sigma_s = np.array([np.std(anom[s : s + win]) for s in range(jam, n - win + 1, stride)])
    target = float(ratio) * float(np.median(sigma_s))
    S = int(S_ref)
    t = world.t
    B = world.b_true
    per_draw, L1s, floors = [], [], []
    for d in range(int(draws)):
        p = motor.draw_motor(int_seed(root_seed, "amp_cal", d), n / fs, A1_nT=1.0)
        rpm = motor.rpm_at(p, t)
        tau, _ = ramsey.choose_tau(rpm)
        s1 = ramsey.sigma1(tau, ramsey.C1_DEFAULT)
        t_read, y_tone = baseline.sample_readouts(
            B, t, S, np.zeros_like(s1), stream(root_seed, "amp_cal", d),
            tone_at=lambda tq, p=p: motor.tone_field(p, tq),
        )  # fmt: skip
        rev = motor.rev_at(p, t_read)
        f1 = rpm / 60.0
        bl, _ = baseline.ls_notch(t_read, y_tone, rev, f1, 2.0 * S)
        L1 = _rms((bl - B)[start:])
        _, y_noise = baseline.sample_readouts(B, t, S, s1, stream(root_seed, "amp_cal", d, S))
        bf, _ = baseline.ls_notch(t_read, y_noise, rev, f1, 2.0 * S)
        floor = _rms((bf - B)[start:])
        L1s.append(L1)
        floors.append(floor)
        if L1 > L1_EXACT and np.isfinite(L1):  # exact cancellation: no finite solution (null)
            per_draw.append(float(np.sqrt(max(target**2 - floor**2, 0.0)) / L1))
        else:
            per_draw.append(None)
    finite = [a for a in per_draw if a is not None]
    A1 = _sig2(np.median(finite)) if finite else None
    return {
        "A1_nT": A1,
        "sigma_s_median_nT": float(np.median(sigma_s)),
        "target_nT": target,
        "per_draw_A1_nT": per_draw,
        "L1_per_unit": L1s,
        "floor_nT": floors,
        "S_ref": S,
    }


def build_model(tile, root_seed=ROOT_SEED) -> dict:
    """Assemble the frozen comparison rules (amplitude computed by the baseline-only rule)."""
    world = uav.build_world(tile, uav.FLIGHT_DEFAULT, uav.MAP_ERROR_DEFAULT, root_seed)
    c1 = ramsey.C1_DEFAULT
    amp = calibrate_amplitude(world, AMP_RULE["S_ref"], AMP_RULE["draws"], root_seed, AMP_RULE["ratio"])
    alt = calibrate_amplitude(world, AMP_RULE["alt_S_ref"], AMP_RULE["draws"], root_seed, AMP_RULE["ratio"])
    tone_rule = {
        "rule": "A1 such that the guarded-LS baseline leftover RMS after the jam = ratio x median "
        "120-sample window std of the true anomaly (stride 20 from the jam); "
        "sqrt((A1*L1)^2 + floor^2) = target per draw; median over draws; 2 significant figures",
        "ratio": AMP_RULE["ratio"],
        "draws": AMP_RULE["draws"],
        "draw_seeds": "seeds.int_seed(root, 'amp_cal', d), d = 0..draws-1; noise stream ('amp_cal', d, S_ref)",
        "estimator": "baseline only (ls_guarded); no quantum estimator runs during the freeze",
        "exact_cancellation": f"a draw with L1 <= {L1_EXACT:g} per unit A1 (no dropped harmonic) has no "
        "finite solution; it is recorded as null and skipped in the median",
    }
    tone_rule.update(amp)
    return {
        "schema_version": MODEL_SCHEMA_VERSION,
        "gamma_hz_per_nT": ramsey.GAMMA,
        "fs_hz": float(uav.FLIGHT_DEFAULT["fs_hz"]),
        "tau0_s": ramsey.TAU0,
        "tau_rule": {"m": ramsey.M_DEFAULT, "formula": "tau_k = m*60/R(t_k), R at window start",
                     "no_rpm": "tau0"},
        "servo": {
            "cycle_s": ramsey.SERVO_CYCLE_S,
            "predictor": "2*Bhat(t-h) - Bhat(t-2h)",
            "seed": "IGRF plane + map value at the GPS fix",
            "linear_range_rad": ramsey.LINEAR_RANGE_RAD,
            "slip_rad": ramsey.SLIP_RAD,
            "note": "servo windows set the reference only; their noise cancels in the output and "
            "is not counted in S",
        },
        "igrf_plane": dict(
            uav.IGRF_PLANE,
            source="lstsq of the SGL 1003.02 igrf channel vs local (x, y) in the Eastern_395 frame, "
            "computed once from the sister repo (line file not lifted); RMS 0.22 nT; hard-coded here",
        ),
        "crust_within_sample": "frozen at crust(t_k) for all windows and readouts of sample k "
        "(disclosed approximation)",
        "flight": dict(uav.FLIGHT_DEFAULT),
        "ins": dict(uav.INS_DEFAULT),
        "tercom": dict(uav.TERCOM_PARAMS),
        "motor_prior": {
            "rpm_min": motor.RPM_MIN,
            "rpm_max": motor.RPM_MAX,
            "K": motor.K,
            "knot_spacing_s": motor.KNOT_SPACING_S,
            "harmonic_weights": list(motor.HARMONIC_WEIGHTS),
            "phase": "U(0, 2pi)",
            "rpm_channel": "exact",
        },
        "tone_amplitude_rule": tone_rule,
        "noise": {
            "sigma1_rule": "sigma1_k = 1/(2*pi*gamma*tau_k*c1); tau_k = tau0 without RPM, so the "
            "motor-off single-readout noise is 1/(2*pi*gamma*tau0*c1)",
            "c1": c1,
        },
        "equal_budget": {
            "readouts_per_sample": "S readouts (baseline) vs S Ramsey shots (quantum) per navigation sample",
            "single_readout_noise_qs02": "1/(2*pi*gamma*tau0), the literal QS-02 / SC5 definition; it "
            "holds for the motor-off parity test, where tau_k = tau0 (both sensors also share the "
            "1/c1 contrast factor)",
            "single_readout_noise_refined": "sigma1_k = 1/(2*pi*gamma*tau_k*c1) per navigation sample, "
            "tau_k = m*60/R_k from the shared RPM channel, tau0 = 10 ms without RPM; refines QS-02 "
            "because a baseline pinned at tau0 while the quantum tau_k follows the RPM differs by up "
            "to ~13% (RMS-equivalent tau 8.73 ms over the prior) and fails the 10% parity test, while "
            "the matched definition gives parity within 2.5% at every S (01-RESEARCH Check 5)",
            "rpm_channel": "the same exact commanded RPM channel for both sensors",
            "ghz": "GHZ-n at S shots compared with n unentangled qubits at S shots each (equal "
            "qubit-shots) and with the baseline magnetometer",
            "ghz_track_accounting": "the GHZ navigation track spends S coarse + S fine shots (disclosed)",
            "S_meaning": "S is an ensemble size, not sequential shots",
            "servo": "servo windows are not counted in S; their noise cancels in the output",
        },
        "ghz": {
            "n_set": list(ramsey.GHZ_N_SET),
            "contrast_model": "c_n = c1**n",
            "c_n_default": {str(n): c1**n for n in ramsey.GHZ_N_SET},
            "switch_rule": {
                "z_star": ramsey.Z_STAR,
                "static": "pi*c1*sqrt(S)/(2n) >= z_star",
                "per_sample": "coarse sample not fringe-risk (|phi_hat| <= pi/4 and 0 < n1 < S)",
            },
            "fallback": "single-qubit coarse estimate, counted per sample",
        },
        "baseline": {
            "primary": "ls_guarded",
            "guard_alias_hz": baseline.GUARD_HZ,
            "K": motor.K,
            "variant": "block_mean",
            "window": "centred 0.5 s block: readouts in [t_k - 0.25 s, t_k + 0.25 s)",
            "causality": "block-local, no zero-phase two-pass filtering, 0.25 s look-ahead disclosed",
            "simulation": "S readouts simulated per navigation sample in 200-block chunks; refines "
            "QS-02's closed-form tone response because with the exact RPM channel the kept-harmonic "
            "response is identically zero and only sample-level simulation measures guard drops and "
            "dropped-harmonic leakage; research cost 0.03/0.12/0.47/2.13 s at S = 64/256/1024/4096 "
            "for 1500 blocks (CPython)",
        },
        "map_error": dict(uav.MAP_ERROR_DEFAULT, seed=int_seed(root_seed, "map_err")),
        "shots_ladder": list(SHOTS_LADDER),
        "S_default": S_DEFAULT,
        "S_default_note": "the amplitude anchor S_ref equals S_default; Phase 2 must read S_default "
        "from this file for the live budget",
        "seeds": {
            "root": int(root_seed),
            "shipped_motor_seed": int_seed(root_seed, "motor"),
            "dr_seed": int_seed(root_seed, "dr"),
            "spawn_keys": {k: list(v) for k, v in seeds.SPAWN_KEYS.items()},
            "extra_key_parts": {"servo": "S", "q1": "S", "baseline": "S", "ghz": "n, S",
                                "amp_cal": "d[, S]"},
        },
        "notes": [
            (f"S_ref = {AMP_RULE['alt_S_ref']} alternative (physically smaller tones; the live S = 256 "
            f"demo would then be a tie): A1 = {alt['A1_nT']} nT (per draw {alt['per_draw_A1_nT']})"),
            "RPM-withheld (wrong-tau) path not built in Phase 1 (PD-1, cut order item 2); tau_rule.no_rpm kept",
            "no shots-ladder outputs in Phase 1 (PD-2)",
            ("assumptions: tone amplitudes are a declared scenario assumption; c1 = 0.98 placeholder "
            "replaced by measured contrast in Phase 2; UAV INS 1.5 m/s bias / 0.1 rw; RPM channel "
            "exact; crust frozen within a navigation sample"),
        ],
    }


ESTIMATORS = ("baseline_ls", "baseline_mean", "quantum_q1", "quantum_ghz4")

# Scenarios (Phase 1.1): the same racetrack, motor tones, map-error field, INS drift and GPS jam,
# flown over a different map at a different altitude. The frozen model is shared (not re-frozen);
# the flight is copied per scenario with its alt_m, never mutated.
SCENARIO_ORDER = ("synthetic_100m", "eastern_400m")
DEFAULT_SCENARIO = "synthetic_100m"
SCENARIOS = {
    "synthetic_100m": {
        "id": "synthetic_100m",
        "map_file": synthmap.SYNTH_MAP,
        "alt_m": 100.0,
        "synthetic": True,
        "label": "UAV at 100 m over a synthetic crustal map",
        "map_label": synthmap.SYNTH_LABEL,
        "map_caption": synthmap.SYNTH_CAPTION,
        "model_file": QSENSOR_MODEL,
        "notes": [
            synthmap.NOTES[3],
            "Sensor model data/qsensor_model.json is not re-frozen; TERCOM is unchanged.",
            "Same racetrack, motor tones, map-error field, INS drift and GPS-jam event as eastern_400m; "
            "only the map and altitude differ.",
        ],
    },
    "eastern_400m": {
        "id": "eastern_400m",
        "map_file": MAP_EASTERN,
        "alt_m": 400.0,
        "synthetic": False,
        "label": "UAV at 400 m over the Eastern_395 survey map",
        "map_label": "Eastern_395 survey map (SGL 2020, MagNav.jl)",
        "map_caption": "Eastern_395 anomaly map (Sander Geophysics survey via MagNav.jl), upward continued "
        "to 395 m; real survey data.",
        "model_file": QSENSOR_MODEL,
        "notes": ["Validation scenario: the Phase 1 flight, unchanged."],
    },
}


def shipped_motor(model, root_seed=None):
    """The offline motor: seed from the model's root, frozen A1, full-flight duration (S-independent)."""
    root = model["seeds"]["root"] if root_seed is None else int(root_seed)
    duration = float(model["flight"]["n"]) / float(model["fs_hz"])
    return motor.draw_motor(int_seed(root, "motor"), duration, float(model["tone_amplitude_rule"]["A1_nT"]))


def sense_all(world, model, shots, motor=None, root_seed=None) -> dict:
    """Run the four estimators on one world with the frozen rules read from `model`.

    motor None: motor off (tau = tau0, no tones, no RPM channel, LS reduces to the block mean).
    Otherwise both sensors share the exact RPM channel of `motor` (a MotorParams).
    Quantum: recursive servo (seeded from IGRF + map at the first GPS fix) + single-qubit coarse + GHZ-n fine (n = max of the frozen n_set).
    Baseline: S readouts per sample with sigma1_k matched to the quantum tau_k; guarded LS notch
    and block mean. Returns {"bhat", "prov", "motor", "S"}.
    """
    p = motor
    S = int(shots)
    root = model["seeds"]["root"] if root_seed is None else int(root_seed)
    c1 = float(model["noise"]["c1"])
    tau0 = float(model["tau0_s"])
    h = float(model["servo"]["cycle_s"])
    m_rule = int(model["tau_rule"]["m"])
    n_fine = int(max(model["ghz"]["n_set"]))
    z_star = float(model["ghz"]["switch_rule"]["z_star"])
    guard = float(model["baseline"]["guard_alias_hz"])
    K = int(model["motor_prior"]["K"])
    fs_nav = float(model["fs_hz"])
    if z_star != ramsey.Z_STAR:
        raise ValueError("model z_star differs from ramsey.Z_STAR (two_stage uses the code constant)")
    t = world.t
    B = world.b_true
    n = len(t)
    if p is None:
        rpm = np.zeros(n)
        tau = np.full(n, tau0)
        m = np.zeros(n, dtype=int)
        tone_int = tone_int_fine = servo_tone_int_at = None

        def tau_at(tq):
            return np.full(np.shape(tq), tau0)
    else:
        rpm = rpm_at(p, t)
        tau, m = ramsey.choose_tau(rpm, m_rule, tau0)
        tone_int = tone_window_integral(p, t, tau)
        tone_int_fine = tone_window_integral(p, t + tau, tau)

        def tau_at(tq):
            return ramsey.choose_tau(rpm_at(p, tq), m_rule, tau0)[0]

        def servo_tone_int_at(tq, tt):
            return tone_window_integral(p, tq, tt)

    rngs = {"servo": stream(root, "servo", S), "q1": stream(root, "q1", S),
            "ghz": stream(root, "ghz", n_fine, S)}  # fmt: skip
    q = ramsey.two_stage(t, B, lambda tq: uav.field_at(world, tq), tau, m, S, c1, rngs,
                         uav.servo_seed(world), n_fine=n_fine, tone_int=tone_int,
                         tone_int_fine=tone_int_fine, tau_at=tau_at,
                         servo_tone_int_at=servo_tone_int_at, h=h)  # fmt: skip
    sigma1_k = ramsey.sigma1(tau, c1)
    tone_at = None if p is None else (lambda tq: tone_field(p, tq))
    t_read, y = baseline.sample_readouts(B, t, S, sigma1_k, stream(root, "baseline", S), tone_at=tone_at)
    if p is None:
        b_ls, drops = baseline.ls_notch(t_read, y, None, None, 2.0 * S, K=0)
    else:
        b_ls, drops = baseline.ls_notch(t_read, y, rev_at(p, t_read), rpm / 60.0, 2.0 * S, K,
                                        fs_nav=fs_nav, guard_hz=guard)  # fmt: skip
    b_mean = baseline.block_mean(y)
    return {
        "bhat": {
            "baseline_ls": b_ls,
            "baseline_mean": b_mean,
            "quantum_q1": q["bhat_q1_nT"],
            "quantum_ghz4": q["bhat_ghz_nT"],
        },
        "prov": {
            "tau_s": np.asarray(q["tau_s"]),
            "m": np.asarray(q["m"]),
            "b_ref_nT": q["b_ref_nT"],
            "fringe": q["fringe"],
            "ghz_fallback": q["fallback"],
            "rpm": rpm,
            "ls_drops": int(drops),
            "max_abs_phi": q["max_abs_phi"],
            "slips": q["slips"],
            "fine_slips": q["fine_slips"],
            "n_fallback": q["n_fallback"],
            "n_fringe": q["n_fringe"],
        },
        "motor": None if p is None else motor_to_dict(p),
        "S": S,
    }


def freeze_model(path=QSENSOR_MODEL, force=False) -> dict:
    """Write the frozen model once (refuses to overwrite unless force)."""
    if Path(path).exists() and not force:
        raise FileExistsError(f"{path} exists; the model is frozen (use force only before its commit)")
    model = build_model(load_map(MAP_EASTERN))
    text = json.dumps(model, indent=1, sort_keys=True, allow_nan=False) + "\n"
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    return model


def load_model(path=QSENSOR_MODEL) -> dict:
    """Load and validate the frozen model."""
    with open(path, encoding="utf-8") as f:
        model = json.load(f)
    if model.get("schema_version") != MODEL_SCHEMA_VERSION:
        raise ValueError(f"{path}: schema_version {model.get('schema_version')!r} != {MODEL_SCHEMA_VERSION}")
    missing = [k for k in REQUIRED_MODEL_KEYS if k not in model]
    if missing:
        raise ValueError(f"{path}: missing keys {missing}")
    return model


def model_sha256(path=QSENSOR_MODEL) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def score_result(ctx: dict, name: str, cleaned, sig, nav) -> dict:
    """Results entry for one estimator: GPS-aided lead-in + nav track, metrics row (uses Truth)."""
    tx, ty, jam_idx, start = ctx["tx"], ctx["ty"], ctx["jam_idx"], ctx["start"]
    ex = np.concatenate([tx[:jam_idx], nav.x])  # GPS-aided lead-in, then nav
    ey = np.concatenate([ty[:jam_idx], nav.y])
    row = {"line": ctx["line"], "sensor": "uav", "denoiser": name}
    row.update(signal_metrics(cleaned, ctx["truth"].mag_1_c, start))
    row.update(position_metrics(ex, ey, tx, ty, start))
    row["accepted"] = int(nav.accepted.sum())
    row["windows"] = len(nav.window_end)
    return {
        "cleaned": cleaned,
        "signal": sig,
        "x": ex,
        "y": ey,
        "window_end": nav.window_end,
        "ncc": nav.ncc,
        "accepted": nav.accepted,
        "metrics": row,
    }


def line_out(ctx: dict, results: dict) -> dict:
    """Per-line output (the input of artifact.line_entry)."""
    sens, truth, tile = ctx["sens"], ctx["truth"], ctx["tile"]
    return {
        "line": ctx["line"],
        "map_file": ctx["map_file"],
        "tile": tile,
        "frame": dataclasses.asdict(tile.frame),
        "n": ctx["n"],
        "jam_idx": ctx["jam_idx"],
        "jam_t": float(sens.t[ctx["jam_idx"]]),
        "metric_start": ctx["start"],
        "t": sens.t,
        "truth_x": ctx["tx"],
        "truth_y": ctx["ty"],
        "truth_anomaly": truth.mag_1_c - sens.igrf - sens.diurnal,
        "igrf": sens.igrf,
        "dr_x": ctx["dr_x"],
        "dr_y": ctx["dr_y"],
        "dr_metrics": ctx["dr_row"],
        "results": results,
    }


def run_uav(model=None, shots=None, motor_seed=None, bits=None, tile=None, scenario="eastern_400m") -> dict:
    """Motor-on UAV flight with the frozen rules: four estimators through the unchanged TERCOM.

    The motor comes from `bits` (Phase 2: IonQ RNG block) if given, else from `motor_seed`
    (default: the model's shipped motor seed), always at the frozen A1. Estimators see only
    the sensed arrays and `Sensors`; Truth is used in score_result / line_out for scoring.
    """
    model = model or load_model()
    shots = int(shots or model["S_default"])
    sc = SCENARIOS[scenario]
    tile = load_map(sc["map_file"]) if tile is None else tile
    root = int(model["seeds"]["root"])
    map_error = {k: v for k, v in model["map_error"].items() if k != "seed"}
    flight = dict(model["flight"], alt_m=sc["alt_m"])  # copy; the frozen model is never mutated
    world = uav.build_world(tile, flight, map_error, root)
    if world.map_err_seed != model["map_error"]["seed"]:
        raise ValueError("map-error seed differs from the frozen model")
    duration = len(world.t) / float(model["fs_hz"])
    A1 = float(model["tone_amplitude_rule"]["A1_nT"])
    if bits:
        p = motor.motor_from_bits(bits, duration, A1)
    else:
        seed = model["seeds"]["shipped_motor_seed"] if motor_seed is None else int(motor_seed)
        p = motor.draw_motor(seed, duration, A1)
    sense = sense_all(world, model, shots, p, root)
    ctx = uav.prepare_uav(world, mag=sense["bhat"], cur={"rpm": rpm_at(p, world.t)}, ins=model["ins"],
                          root_seed=root, window=model["tercom"]["window"],
                          map_file=sc["map_file"])  # fmt: skip
    if ctx["dr"].seed != model["seeds"]["dr_seed"]:
        raise ValueError("DR seed differs from the frozen model")
    results = {}
    for name in ESTIMATORS:
        cleaned = sense["bhat"][name]
        sig = anomaly_signal(cleaned, ctx["sens"])
        nav = tercom(sig, ctx["dr"], ctx["jam_idx"], ctx["fix_xy"], ctx["tile"], **model["tercom"])
        results[name] = score_result(ctx, name, cleaned, sig, nav)
    return {
        "scenario": scenario,
        "line": line_out(ctx, results),
        "prov": sense["prov"],
        "motor": motor_to_dict(p),
        "S": shots,
        "model": model,
        "model_sha256": model_sha256(),
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="magnav.uav_pipeline")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("freeze", help="write data/qsensor_model.json once")
    sub.add_parser("build", help="motor-on run with the frozen model -> data/precomputed_uav.json")
    args = ap.parse_args(argv)
    if args.cmd == "freeze":
        m = freeze_model()
        amp = m["tone_amplitude_rule"]
        print(f"wrote {QSENSOR_MODEL}: A1 = {amp['A1_nT']} nT (S_ref {amp['S_ref']}), "
              f"median sigma_s {amp['sigma_s_median_nT']:.2f} nT, sha256 {model_sha256()}")  # fmt: skip
    elif args.cmd == "build":
        from magnav import artifact  # imported here: artifact must not import this module back

        art = artifact.build_uav_artifact(run_uav())
        errs = artifact.validate_uav_artifact(art)
        if errs:
            print("artifact invalid:\n  " + "\n  ".join(errs), file=sys.stderr)
            return 1
        data = artifact.dumps_artifact(art).encode("utf-8")
        with open(artifact.UAV_ARTIFACT_PATH, "wb") as f:
            f.write(data)
        print(f"wrote {artifact.UAV_ARTIFACT_PATH}: {len(data)} bytes, S = {art['S']}, "
              f"motor seed {art['motor']['seed']}")  # fmt: skip
        for name in ("dead_reckoning", *ESTIMATORS):
            row = art["line"]["metrics"][name]
            print(f"  {name:15s} CEP50 {row['cep50_m']} m, under 556 m {row['pct_under_556']}%, "
                  f"signal RMSE {row.get('signal_rmse_nT')} nT")  # fmt: skip
    return 0


if __name__ == "__main__":
    sys.exit(main())
