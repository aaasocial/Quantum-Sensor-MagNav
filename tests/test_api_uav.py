"""Page-facing JSON API (magnav.api): never raises, one IonQ job per Run across scenarios,
end-to-end live run on a spy BasicSimulator (QS-03, QS-07, UI-05)."""

import hashlib
import json
import math
from pathlib import Path

import pytest
from qiskit import QuantumCircuit

from magnav import api, artifact, qjob
from magnav.synthmap import SYNTH_LABEL
from tests.fakes import BoomSim, SpySim

ROOT = Path(__file__).resolve().parents[1]
FREEZE = ROOT / "data" / "circuit_freeze.json"
HARDWARE = ROOT / "data" / "forte_hardware_run.json"


def _strict(raw):
    assert isinstance(raw, str)

    def reject(constant):  # JS JSON.parse has no NaN/Infinity
        raise ValueError(constant)

    out = json.loads(raw, parse_constant=reject)
    assert isinstance(out, dict) and "ok" in out
    return out


@pytest.fixture(autouse=True)
def _reset():
    api.live_cancel(None)
    qjob.reset_for_tests()
    yield
    api.live_cancel(None)
    qjob.reset_for_tests()


@pytest.fixture(scope="module")
def happy():
    """uav_start -> uav_quantum -> live_step loop -> live_result on one SpySim (synthetic, once)."""
    api.live_cancel(None)
    qjob.reset_for_tests()
    spy = SpySim()
    steps = []
    start = _strict(api.uav_start(spy, "synthetic_100m"))
    quant = _strict(api.uav_quantum(spy, 1024))
    for _ in range(2000):
        p = _strict(api.live_step(spy, 250))
        steps.append(p)
        if not p["ok"] or p["done"]:
            break
    payload = _strict(api.live_result(spy))
    calls = list(spy.calls)
    api.live_cancel(None)
    qjob.reset_for_tests()
    return {"start": start, "quantum": quant, "steps": steps, "payload": payload, "calls": calls}


def test_api_happy_path_synthetic(happy):
    assert happy["start"]["ok"] and happy["start"]["stage"] == "ready"
    assert happy["start"]["scenario"] == "synthetic_100m"
    q = happy["quantum"]
    assert q["ok"], q
    assert all(s["ok"] for s in happy["steps"])
    assert happy["steps"][-1]["done"] is True
    p = happy["payload"]
    assert p["ok"], p
    assert len(happy["calls"]) == 1 and isinstance(happy["calls"][0], QuantumCircuit)
    assert artifact.validate_live_payload(p) == []
    assert p["scenario"]["id"] == "synthetic_100m"
    assert p["scenario"]["map_label"] == SYNTH_LABEL
    qj = p["quantum_job"]
    assert p["motor"]["seed_hex"] == qj["seed_hex"] == q["seed_hex"]
    assert qj["bits_label"] == "simulator-sampled"
    assert qj["c_n_used"] == 1.0
    assert qj["c_n_source"] == "measured this Run"
    assert p["scenario"]["provenance"]["ghz"]["c_n"] == 1.0
    for k in ("job_id", "backend", "backend_class", "is_qpu", "analytic_blocks", "shots", "counts_sum",
              "submitted_utc", "timestamp_utc", "rng_n_qubits", "rng_hist", "seed_hex", "seed_str",
              "motor", "fringe_p1", "fringe_expected", "c_hat", "ancilla_return", "c_n_used",
              "c_n_default", "c_n_source", "c_n_note", "circuit_sha256", "reused"):  # fmt: skip
        assert k in q, k
    assert q["analytic_blocks"] is False and q["rng_n_qubits"] == 6 and len(q["rng_hist"]) == 64
    assert set(q["motor"]) == {"rpm_min", "rpm_max", "amps_nT", "phases"}
    assert "rng_bits" not in q and "rng_bits" not in qj


def test_one_job_across_scenarios():
    spy = SpySim()
    assert _strict(api.uav_start(spy, "synthetic_100m"))["ok"]
    a = _strict(api.uav_quantum(spy, 1024))
    assert _strict(api.uav_start(spy, "eastern_400m"))["ok"]
    b = _strict(api.uav_quantum(spy, 1024))
    assert a["ok"] and b["ok"]
    assert len(spy.calls) == 1 and isinstance(spy.calls[0], QuantumCircuit)
    assert spy.calls[0].num_qubits <= 16
    assert a["reused"] is False and b["reused"] is True
    assert b["seed_hex"] == a["seed_hex"]


def test_failed_job_never_retries():
    boom = BoomSim()
    assert _strict(api.uav_start(boom, "synthetic_100m"))["ok"]
    r = _strict(api.uav_quantum(boom, 1024))
    assert r["ok"] is False and r["error_type"] == "RuntimeError"
    spy = SpySim()
    r2 = _strict(api.uav_quantum(spy, 1024))
    assert r2["ok"] is False and r2["error_type"] == "AlreadyUsed"
    assert len(boom.calls) == 1 and spy.calls == []
    # the live run continues with the shipped motor
    assert _strict(api.live_step(spy, 50))["ok"]


def test_bad_scenario():
    r = _strict(api.uav_start(None, "cessna_x"))
    assert r["ok"] is False and r["error_type"] == "BadScenario"
    r = _strict(api.uav_start(None, 42))
    assert r["ok"] is False and r["error_type"] == "BadScenario"


def test_simulate_failure():
    spy = SpySim()
    r = _strict(api.uav_start(spy, "synthetic_100m", True))
    assert r["ok"] is False
    assert spy.calls == []


def test_no_backend():
    r = _strict(api.uav_quantum(None))
    assert r["ok"] is False and r["error_type"] == "NoBackend"


def test_quantum_before_start():
    spy = SpySim()
    r = _strict(api.uav_quantum(spy))
    assert r["ok"] is False and r["error_type"] == "NoLiveRun"
    assert spy.calls == []
    assert not qjob.latched()


def test_bad_shots_rejected_before_submit():
    spy = SpySim()
    assert _strict(api.uav_start(spy, "synthetic_100m"))["ok"]
    for bad in (500, 4096, True, 1024.5, "1024x"):
        r = _strict(api.uav_quantum(spy, bad))
        assert r["ok"] is False
    assert spy.calls == [] and not qjob.latched()


BAD = (object(), None, True, 200.9, float("nan"), float("inf"))


@pytest.mark.parametrize("bad", BAD, ids=lambda v: type(v).__name__ + ":" + repr(v)[:12])
def test_never_raises_json_contract(bad):
    calls = [
        lambda: api.backend_info(bad),
        lambda: api.artifact_json(bad),
        lambda: api.circuit_json(bad),
        lambda: api.hardware_json(bad),
        lambda: api.ghz_scaling_json(None, bad, bad, bad),
        lambda: api.uav_start(None, bad, bad),
        lambda: api.uav_quantum(bad, bad),
        lambda: api.uav_quantum(SpySim(), bad),
        lambda: api.live_step(None, bad),
        lambda: api.live_result(bad),
        lambda: api.live_cancel(bad),
    ]
    for fn in calls:
        _strict(fn())
    assert not qjob.latched()


def test_live_step_and_result_without_run():
    r = _strict(api.live_step(None, 250))
    assert r["ok"] is False
    r = _strict(api.live_result(None))
    assert r["ok"] is False
    c = _strict(api.live_cancel(None))
    assert c["ok"] is True and c["cancelled"] is False


def test_backend_info():
    info = _strict(api.backend_info(SpySim()))
    assert info["ok"] is True
    assert info["is_ionq"] is False and info["is_qpu"] is False
    assert info["class"] == "SpySim"
    assert set(info["versions"]) == {"qiskit", "qiskit_ionq", "numpy", "python"}
    assert info["versions"]["qiskit"]


def test_artifact_circuit_hardware_json():
    a = _strict(api.artifact_json(None))
    assert a["ok"] is True and len(a["artifact"]["scenarios"]) == 2
    c = _strict(api.circuit_json(None))
    assert c["ok"] is True
    want = json.loads(FREEZE.read_text(encoding="utf-8"))["circuit_sha256"]
    assert c["circuit"]["circuit_sha256"] == want
    assert want == hashlib.sha256(c["circuit"]["qasm3"].encode("utf-8")).hexdigest()
    h = _strict(api.hardware_json(None))
    if HARDWARE.exists():
        assert h["ok"] is True and isinstance(h["hardware"], dict)
    else:
        assert h["ok"] is False and h["error_type"] == "NotCaptured"


def test_ghz_scaling_json():
    a = _strict(api.ghz_scaling_json(None))
    assert a["ok"] is True, a
    assert a["n"] == [1, 2, 4]
    for k in ("sql_nT", "hl_nT", "unentangled_nT", "ghz_ideal_nT"):
        assert len(a[k]) == 3 and all(isinstance(v, float) and math.isfinite(v) for v in a[k]), k
    assert a["hl_nT"][2] < a["sql_nT"][2]
    assert a["hl_nT"][0] == pytest.approx(a["sql_nT"][0])
    assert a["ghz_measured_nT"] is None and a["c_measured"] is None
    assert set(a["c_ideal"]) == {"1", "2", "4"}
    b = _strict(api.ghz_scaling_json(None, c1=0.99, c2=0.95, c4=0.85))
    assert b["ok"] is True
    assert len(b["ghz_measured_nT"]) == 3 and all(math.isfinite(v) for v in b["ghz_measured_nT"])
    assert b["c_measured"]["4"] == pytest.approx(0.85)
    # deterministic
    assert api.ghz_scaling_json(None) == api.ghz_scaling_json(None)
    assert api.ghz_scaling_json(None, 0.99, 0.95, 0.85) == api.ghz_scaling_json(None, 0.99, 0.95, 0.85)
    # a lower measured GHZ-4 contrast gives a worse measured GHZ-4 sensitivity
    worse = _strict(api.ghz_scaling_json(None, c1=0.99, c2=0.95, c4=0.6))
    assert worse["ghz_measured_nT"][2] > b["ghz_measured_nT"][2]
