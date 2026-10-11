"""JS-facing API. Every function takes the injected backend first and returns a JSON string with
an `ok` key; none ever raises. Failure shape: {ok: false, stage, error_type, error (<= 2000 chars)}.

The only route to the Run's single IonQ job is uav_quantum -> qjob.quantum_run (which holds the
module's one backend.run behind a latch). magnav modules are imported lazily inside each
function, so an import problem is also reported as JSON. This module imports no qiskit.
"""

import json
import math
import sys

CIRCUIT_FREEZE_PATH = "data/circuit_freeze.json"  # literal: Qollab preloads literal paths only
ALLOWED_JOB_SHOTS = (1024,)
SCALING_TRIALS = 4000
SCALING_N = (1, 2, 4)
SCALING_SPAWN_KEY = 11  # unused elsewhere; not in seeds.SPAWN_KEYS (the frozen model pins those)


def _safe_value(value):
    """JSON-safe echo of a caller input: plain ints pass through, anything else is repr()'d."""
    if type(value) is int:
        return value
    try:
        return repr(value)[:50]
    except Exception:  # noqa: BLE001 - a hostile __repr__ must not break the contract
        return f"<unrepresentable {type(value).__name__}>"


def _backend_name(backend):
    if backend is None:
        return None
    try:
        name = getattr(backend, "name", None)
        if callable(name):
            name = name()
    except Exception:  # noqa: BLE001
        return None
    return None if name is None else str(name)


def _as_int(value) -> int:
    """Strict int coercion: rejects bools and non-integral floats instead of truncating."""
    if isinstance(value, bool):
        raise TypeError(f"expected an integer, got bool {value!r}")
    if isinstance(value, float) and not value.is_integer():
        raise ValueError(f"expected an integer, got non-integral float {value!r}")
    return int(value)


def _text(x) -> str:
    try:
        return str(x)
    except Exception:  # noqa: BLE001
        return f"<unprintable {type(x).__name__}>"


def _live_stage():
    try:
        from magnav import live_uav

        stage = live_uav.current_stage()
        return stage if isinstance(stage, str) else None
    except Exception:  # noqa: BLE001
        return None


def _live_failure(stage, error_type, message) -> str:
    """Failure JSON. Never raises."""
    return json.dumps(
        {
            "ok": False,
            "stage": stage if isinstance(stage, str) else None,
            "error_type": _text(error_type)[:200],
            "error": _text(message)[:2000],
        }
    )


def _fail(e) -> str:
    return _live_failure(_live_stage(), type(e).__name__, e)


def _live_ok(payload: dict) -> str:
    out = {"ok": True}
    out.update(payload)
    return json.dumps(out, allow_nan=False, separators=(",", ":"))


def _strict_json(text: str):
    def reject(constant):  # JS JSON.parse has no NaN/Infinity
        raise ValueError(f"{constant} is not valid JSON")

    return json.loads(text, parse_constant=reject)


def _splice(key: str, path: str) -> str:
    """'{"ok":true,"<key>":<file text>}' without re-serialising (the file is checked strict first)."""
    with open(path, encoding="utf-8") as f:
        text = f.read().strip()
    _strict_json(text)
    return '{"ok":true,"' + key + '":' + text + "}"


def _version(name):
    mod = sys.modules.get(name)
    return None if mod is None else str(getattr(mod, "__version__", "unknown"))


# ---------- static data ----------


def backend_info(backend) -> str:
    """Describe the backend and runtime. Never submits a job."""
    try:
        from magnav import qjob

        if backend is None:
            name, cls, ionq, qpu, nq, noise = None, None, False, False, None, None
        else:
            name = _backend_name(backend)
            cls = type(backend).__name__
            ionq = bool(qjob.is_ionq(backend))
            qpu = bool(qjob.is_qpu(backend))
            nq = getattr(backend, "num_qubits", None)
            nq = nq if type(nq) is int else None
            noise = qjob._noise_model(backend)
        import numpy

        return _live_ok(
            {
                "name": name,
                "class": cls,
                "is_ionq": ionq,
                "is_qpu": qpu,
                "num_qubits": nq,
                "noise_model": noise,
                "versions": {
                    "qiskit": _version("qiskit"),
                    "qiskit_ionq": _version("qiskit_ionq"),
                    "numpy": str(numpy.__version__),
                    "python": sys.version.split()[0],
                },
            }
        )
    except Exception as e:  # noqa: BLE001
        return _fail(e)


def artifact_json(backend) -> str:
    """The recorded replay (data/precomputed_uav.json) as JSON text; call once at mount."""
    try:
        from magnav.artifact import UAV_ARTIFACT_PATH

        return _splice("artifact", UAV_ARTIFACT_PATH)
    except Exception as e:  # noqa: BLE001
        return _fail(e)


def circuit_json(backend) -> str:
    """The frozen packed circuit (data/circuit_freeze.json)."""
    try:
        return _splice("circuit", CIRCUIT_FREEZE_PATH)
    except Exception as e:  # noqa: BLE001
        return _fail(e)


def hardware_json(backend) -> str:
    """The captured Forte 1 record (data/forte_hardware_run.json), or NotCaptured."""
    try:
        from magnav.artifact import HARDWARE_RUN_PATH

        return _splice("hardware", HARDWARE_RUN_PATH)
    except FileNotFoundError:
        return _live_failure(_live_stage(), "NotCaptured", "the Forte 1 hardware record has not been captured yet")
    except Exception as e:  # noqa: BLE001
        return _fail(e)


def _contrast_arg(v):
    if v is None:
        return None
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        raise TypeError(f"contrast must be a number or null, got {_safe_value(v)}")
    return float(v)


def ghz_scaling_json(backend, c1=None, c2=None, c4=None) -> str:
    """SQL vs Heisenberg scaling at equal qubit-shots (emulated; nT at S = S_default, tau0).

    Ideal lines use the model contrast c_n = c1 ** n; with measured contrasts (c1, c2, c4 from
    this Run's job, each guarded by the 0.5 floor) a measured GHZ line is added.
    """
    try:
        meas = {"1": _contrast_arg(c1), "2": _contrast_arg(c2), "4": _contrast_arg(c4)}
        import numpy as np

        from magnav import quantum, ramsey
        from magnav.uav_pipeline import load_model

        model = load_model()
        S = int(model["S_default"])
        c1m = float(model["noise"]["c1"])
        tau0 = float(model["tau0_s"])
        gamma = float(model["gamma_hz_per_nT"])
        root = int(model["seeds"]["root"])
        k = 2.0 * math.pi * gamma * tau0  # rad per nT

        def rng(n, entangled, variant):
            ss = np.random.SeedSequence(root, spawn_key=(SCALING_SPAWN_KEY, n, int(entangled), variant))
            return np.random.default_rng(ss)

        c_ideal = {str(n): c1m**n for n in SCALING_N}
        sql = [1.0 / (c1m * math.sqrt(n * S)) / k for n in SCALING_N]
        hl = [1.0 / (n * c_ideal[str(n)] * math.sqrt(S)) / k for n in SCALING_N]
        unent = [ramsey.scaling_trial(n, S, c1m, SCALING_TRIALS, rng(n, False, 0), False) / k for n in SCALING_N]
        ideal = [ramsey.scaling_trial(n, S, c1m, SCALING_TRIALS, rng(n, True, 0), True) / k for n in SCALING_N]
        c_meas, ghz_meas = None, None
        if any(v is not None for v in meas.values()):
            c_meas = {key: float(quantum.guarded_cn(meas[key], c_ideal[key])[0]) for key in c_ideal}
            ghz_meas = [
                ramsey.scaling_trial(n, S, c1m, SCALING_TRIALS, rng(n, True, 1), True, c_n=c_meas[str(n)]) / k
                for n in SCALING_N
            ]
        return _live_ok(
            {
                "S": S,
                "tau0_s": tau0,
                "gamma_hz_per_nT": gamma,
                "trials": SCALING_TRIALS,
                "n": list(SCALING_N),
                "sql_nT": [float(v) for v in sql],
                "hl_nT": [float(v) for v in hl],
                "unentangled_nT": [float(v) for v in unent],
                "ghz_ideal_nT": [float(v) for v in ideal],
                "ghz_measured_nT": None if ghz_meas is None else [float(v) for v in ghz_meas],
                "c_ideal": c_ideal,
                "c_measured": c_meas,
            }
        )
    except Exception as e:  # noqa: BLE001
        return _fail(e)


# ---------- live UAV run (one scenario at a time; one IonQ job per Run) ----------


def uav_start(backend, scenario, simulate_failure=False) -> str:
    """Start a live run of one scenario from the allowlist (BadScenario otherwise)."""
    try:
        from magnav import live_uav

        if not isinstance(scenario, str) or scenario not in live_uav.SCENARIO_ORDER:
            live_uav.cancel()
            return _live_failure(
                None,
                "BadScenario",
                f"unknown scenario {_safe_value(scenario)!s:.40}; expected one of {list(live_uav.SCENARIO_ORDER)}",
            )
        return _live_ok(live_uav.start(scenario, bool(simulate_failure)))
    except Exception as e:  # noqa: BLE001
        return _fail(e)


def uav_quantum(backend, job_shots=1024) -> str:
    """This Run's one IonQ job (or its cached result on a second scenario), attached to the run."""
    try:
        shots = _as_int(job_shots)
    except Exception as e:  # noqa: BLE001
        return _live_failure(_live_stage(), "ValueError", f"job_shots: {type(e).__name__}: {_text(e)}")
    try:
        if shots not in ALLOWED_JOB_SHOTS:
            return _live_failure(_live_stage(), "ValueError", f"job_shots must be one of {list(ALLOWED_JOB_SHOTS)}")
        if backend is None:
            return _live_failure(_live_stage(), "NoBackend", "no backend was injected; nothing was submitted")
        from magnav import live_uav, qjob

        if live_uav.current_stage() != "ready":
            return _live_failure(
                _live_stage(), "NoLiveRun", "call uav_start first (the job is attached before sensing starts)"
            )
        q = qjob.quantum_run(backend, shots)
        return _live_ok(live_uav.attach_quantum(q))
    except Exception as e:  # noqa: BLE001 - surface IonQ CamelCase error names to the page
        return _fail(e)


def live_step(backend, budget_ms=250) -> str:
    """One bounded chunk: the sense stage in one call, then ~budget_ms of TERCOM per call."""
    try:
        from magnav import live_uav

        budget = live_uav.clamp_budget(_as_int(budget_ms))
    except Exception as e:  # noqa: BLE001
        return _live_failure(_live_stage(), "ValueError", f"budget_ms: {type(e).__name__}: {_text(e)}")
    try:
        return _live_ok(live_uav.step(budget))
    except Exception as e:  # noqa: BLE001
        return _fail(e)


def live_result(backend) -> str:
    """The finished live run: {kind: uav_live, scenario, motor, S, model_sha256, quantum_job}."""
    try:
        from magnav import live_uav

        return _live_ok(live_uav.result())
    except Exception as e:  # noqa: BLE001
        return _fail(e)


def live_cancel(backend) -> str:
    """Discard any live run in progress. Always ok."""
    try:
        from magnav import live_uav

        cancelled = bool(live_uav.cancel())
    except Exception:  # noqa: BLE001 - cancel must always report ok
        cancelled = False
    return json.dumps({"ok": True, "cancelled": cancelled})
