"""Chunked live UAV run of one scenario, driven by magnav.api (uav_start / uav_quantum / live_*).

An orchestrator like uav_pipeline: it scores against Truth through uav_pipeline.finish_run. It
never submits a job itself: api.uav_quantum makes the Run's one job through qjob and hands the
decoded result to attach_quantum, which redraws the motor from the job's RNG bits and feeds the
measured GHZ-4 contrast into the fine stage.

The work is split so no single call blocks the page for long (Pyodide shares the main thread):
  start()          allowlist check, model, map tile, world and the shipped motor ("ready").
  attach_quantum() optional, while "ready": this Run's motor and measured c_n.
  step()           first call: sense_all in one call ("sense"), then the TERCOM generators;
                   later calls advance them in ESTIMATORS order for ~budget_ms ("tercom").
  result()         one scenario entry in exactly the shape of the recorded replay; with no job,
                   the shipped motor and the default c_n it equals the replay byte for byte.
Module state persists between calls; one run at a time (a new start discards the old one).
"""

import math
import time

from magnav import artifact, uav_pipeline
from magnav.data import load_map, load_provenance
from magnav.motor import motor_to_dict
from magnav.uav_pipeline import ESTIMATORS, SCENARIO_ORDER, SCENARIOS

BUDGET_MIN_MS = 50
BUDGET_MAX_MS = 2000
NOTE_IDEAL = "ideal simulator, no gate error"
NOTE_REJECTED = "measured value rejected (below 0.5)"

_STATE: dict = {}


class InvalidLivePayload(ValueError):
    """result() built a payload that magnav.artifact.validate_live_payload rejects (WR-03).

    Raised (never returned) so magnav.api.live_result reports it as {ok: false, error_type:
    "InvalidLivePayload"} and the page falls back to the recorded replay instead of rendering a
    payload whose motor/job seeds (or series) disagree.
    """


def clamp_budget(budget_ms) -> int:
    return max(BUDGET_MIN_MS, min(BUDGET_MAX_MS, int(budget_ms)))


def current_stage():
    """Phase of the run in progress ("ready", "tercom", "done"), or None."""
    return _STATE.get("phase") if _STATE else None


def _require():
    if not _STATE:
        raise RuntimeError("No live run in progress: call uav_start first")
    return _STATE


def _elapsed(st) -> float:
    return round(time.perf_counter() - st["t0"], 3)


def start(scenario, simulate_failure=False) -> dict:
    """Allowlist first (before any file access), then load the model, the map and the world."""
    _STATE.clear()
    if not isinstance(scenario, str) or scenario not in SCENARIO_ORDER:
        raise ValueError(f"unknown scenario {str(scenario)[:40]!r}; expected one of {list(SCENARIO_ORDER)}")
    if simulate_failure:
        raise RuntimeError("Simulated failure (demo of the fallback)")
    t0 = time.perf_counter()
    model = uav_pipeline.load_model()
    tile = load_map(SCENARIOS[scenario]["map_file"])
    rc = uav_pipeline.prepare_run(model, None, scenario=scenario, tile=tile)
    world = rc["world"]
    n = len(world.t)
    jam = int(float(world.flight["jam_fraction"]) * n)
    wpe = uav_pipeline.windows_per_estimator({"n": n, "jam_idx": jam}, model)
    _STATE.update(
        phase="ready",
        sid=scenario,
        t0=t0,
        model=model,
        tile=tile,
        rc=rc,
        quantum=None,
        sense=None,
        ctx=None,
        gens={},
        sigs={},
        navs={},
        progress=dict.fromkeys(ESTIMATORS, 0),
        current=0,
        wpe=wpe,
        samples_total=n,
    )
    return {"scenario": scenario, "stage": "ready", "samples_total": n, "S": rc["S"]}


def _looks_ionq(q) -> bool:
    return str(q.get("backend", "")).lower().startswith("ionq") or str(q.get("backend_class", "")).startswith("IonQ")


def attach_quantum(q: dict) -> dict:
    """Use this Run's job (qjob.quantum_run output) for the motor and the GHZ-4 contrast.

    Returns the uav_quantum payload (without rng_bits): the decode plus the motor summary,
    expected fringe P1, c_n_used / c_n_default / c_n_source / c_n_note.
    """
    from magnav import quantum  # lazy: the replay-only path never imports qiskit

    st = _require()
    if st["phase"] != "ready":
        raise RuntimeError("the job can only be attached before the run starts sensing")
    model, sid = st["model"], st["sid"]
    n_fine = int(max(model["ghz"]["n_set"]))
    default = float(model["ghz"]["c_n_default"][str(n_fine)])
    c4 = q["c_hat"].get("c4")
    c_n_used, source = quantum.guarded_cn(c4, default)
    measured = source == quantum.SRC_MEASURED
    if not measured:
        note = NOTE_REJECTED
    elif not _looks_ionq(q) and c4 == 1.0:
        note = NOTE_IDEAL
    else:
        note = ""
    rc = uav_pipeline.prepare_run(model, None, scenario=sid, tile=st["tile"], bits=q["rng_bits"],
                                  c_n_fine=c_n_used if measured else None)  # fmt: skip
    p = rc["p"]
    hist = list(q["rng_hist"])
    out = {k: v for k, v in q.items() if k != "rng_bits"}
    out.update(
        analytic_blocks=False,
        rng_n_qubits=int(round(math.log2(len(hist)))) if hist else 0,
        motor={
            "rpm_min": float(min(p.rpm_knots)),
            "rpm_max": float(max(p.rpm_knots)),
            "amps_nT": [float(a) for a in p.amps_nT],
            "phases": [float(a) for a in p.phases],
        },
        fringe_expected=quantum.fringe_expected(q["c_hat"]["c1"]),
        c_n_used=float(c_n_used),
        c_n_default=default,
        c_n_source=source,
        c_n_note=note,
    )
    out = artifact._clean(out)
    st["rc"] = rc
    st["quantum"] = out
    return dict(out)


def _progress(st, stage) -> dict:
    done_w = sum(st["progress"].values())
    total_w = st["wpe"] * len(ESTIMATORS)
    n = st["samples_total"]
    return {
        "stage": stage,
        "done": st["phase"] == "done",
        "windows_done": int(done_w),
        "windows_total": int(total_w),
        "samples_done": int(round(n * done_w / total_w)) if total_w else 0,
        "samples_total": int(n),
    }


def _advance(st, deadline):
    """Advance the TERCOM generators in ESTIMATORS order until the deadline (never skip one)."""
    while st["current"] < len(ESTIMATORS):
        name = ESTIMATORS[st["current"]]
        try:
            st["progress"][name] = next(st["gens"][name])
        except StopIteration as stop:
            st["navs"][name] = stop.value
            st["progress"][name] = len(stop.value.window_end)
            del st["gens"][name]
            st["current"] += 1
        if time.perf_counter() >= deadline:
            break
    if st["current"] >= len(ESTIMATORS):
        st["phase"] = "done"


def step(budget_ms=250) -> dict:
    """One bounded chunk: the sense stage (one call), then ~budget_ms of TERCOM per call."""
    st = _require()
    budget = clamp_budget(budget_ms)
    deadline = time.perf_counter() + budget / 1000.0
    if st["phase"] == "ready":
        st["sense"] = uav_pipeline.sense_run(st["rc"])
        st["ctx"], st["gens"], st["sigs"] = uav_pipeline.nav_begin(st["rc"], st["sense"])
        if uav_pipeline.windows_per_estimator(st["ctx"], st["model"]) != st["wpe"]:
            raise RuntimeError("window count differs from the planned count")
        st["phase"] = "tercom"
        return _progress(st, "sense")
    if st["phase"] == "tercom":
        _advance(st, deadline)
    return _progress(st, "done" if st["phase"] == "done" else "tercom")


def result() -> dict:
    """The finished run: one scenario entry (replay shape), the motor and this Run's job block."""
    st = _require()
    if st["phase"] != "done":
        raise RuntimeError("Live run not finished: call live_step until done")
    rc, sid = st["rc"], st["sid"]
    run = uav_pipeline.finish_run(rc, st["sense"], st["ctx"], st["navs"], st["sigs"])
    sc = SCENARIOS[sid]
    entry = artifact.scenario_entry(run, sc, load_provenance()["files"][sc["map_file"]])
    motor = dict(run["motor"])
    motor["seed_str"] = str(int(motor["seed"]))
    motor["seed_hex"] = format(int(motor["seed"]), "016x")
    payload = {
        "kind": artifact.LIVE_KIND,
        "scenario": entry,
        "motor": motor,
        "S": int(run["S"]),
        "model_sha256": run["model_sha256"],
        "quantum_job": None if st["quantum"] is None else dict(st["quantum"]),
    }
    out = artifact._clean(payload)
    _STATE.clear()  # the run is consumed either way; the page's next call starts a fresh one
    problems = artifact.validate_live_payload(out)
    if problems:
        raise InvalidLivePayload("live payload invalid: " + "; ".join(problems[:3]))
    return out


def cancel() -> bool:
    """Discard any run in progress; True if one existed."""
    had = bool(_STATE)
    _STATE.clear()
    return had


def run_scenario(sid, quantum=None) -> dict:
    """Python-only convenience: start, optionally attach a decoded job, step until done, result."""
    start(sid)
    if quantum is not None:
        attach_quantum(quantum)
    while not step(BUDGET_MAX_MS)["done"]:
        pass
    return result()
