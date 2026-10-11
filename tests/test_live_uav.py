"""Chunked live UAV run (magnav.live_uav): live == replay without a job, bounded steps, and the
measured GHZ-4 contrast reaching the fine stage (QS-03, QS-07, UI-05)."""

import time

import pytest

from magnav import artifact, live_uav, qjob, quantum, ramsey
from magnav.uav_pipeline import SCENARIO_ORDER

C4_DEFAULT = 0.98**4  # model ghz.c_n_default["4"] (c1 ** 4 with c1 = 0.98)


@pytest.fixture(autouse=True)
def _reset():
    live_uav.cancel()
    qjob.reset_for_tests()
    yield
    live_uav.cancel()
    qjob.reset_for_tests()


def fake_quantum(c4, c1=1.0, c2=1.0):
    """A decoded-job dict shaped like qjob.quantum_run output (fixed, uniform RNG histogram)."""
    hist = [16] * 64
    bits = quantum.rng_bits(hist)
    seed_hex = quantum.seed_hex_from_bits(bits)
    return {
        "job_id": "fake-job",
        "backend": "basic_simulator",
        "backend_class": "BasicSimulator",
        "is_qpu": False,
        "bits_label": "simulator-sampled",
        "shots": 1024,
        "counts_sum": 1024,
        "submitted_utc": "2026-10-11T00:00:00+00:00",
        "timestamp_utc": "2026-10-11T00:00:01+00:00",
        "rng_hist": hist,
        "rng_bits": bits,
        "seed_hex": seed_hex,
        "seed_str": str(int(seed_hex, 16)),
        "fringe_p1": [0.15, 0.69, 0.85],
        "c_hat": {"c1": c1, "c2": c2, "c4": c4},
        "ancilla_return": {"ghz2": 1.0, "ghz4": 1.0},
        "circuit_sha256": "0" * 64,
        "reused": False,
    }


@pytest.fixture(scope="module")
def flights():
    """One stepwise live flight per scenario (no job, shipped motor), with per-call timings."""
    out = {}
    for sid in SCENARIO_ORDER:
        live_uav.cancel()
        st = live_uav.start(sid)
        stages, durations = [st["stage"]], []
        progress = []
        while True:
            t0 = time.perf_counter()
            p = live_uav.step(250)
            durations.append((p["stage"], stages[-1], time.perf_counter() - t0))
            stages.append(p["stage"])
            progress.append(p)
            if p["done"]:
                break
        out[sid] = {"start": st, "stages": stages, "durations": durations, "progress": progress,
                    "result": live_uav.result()}  # fmt: skip
    live_uav.cancel()
    return out


@pytest.mark.parametrize("sid", SCENARIO_ORDER)
def test_live_equals_replay(flights, sid, shipped_runs):
    """Live without a job == the offline pipeline with the same shipped motor. The committed replay
    carries the QPU-measured motor since plan 03-01 (D-08), so the reference is a fresh build."""
    from magnav.data import load_provenance
    from magnav.uav_pipeline import SCENARIOS, load_model

    sc = SCENARIOS[sid]
    ref = artifact.scenario_entry(shipped_runs[sid], sc, load_provenance()["files"][sc["map_file"]])
    res = flights[sid]["result"]
    assert res["kind"] == "uav_live"
    assert res["quantum_job"] is None
    assert artifact.dumps_artifact(res["scenario"]) == artifact.dumps_artifact(ref)
    assert artifact.validate_live_payload(res) == []
    assert res["motor"]["seed_str"] == str(load_model()["seeds"]["shipped_motor_seed"])


@pytest.mark.parametrize("sid", SCENARIO_ORDER)
def test_live_steps_bounded(flights, sid):
    f = flights[sid]
    assert f["start"]["stage"] == "ready"
    seq = [s for i, s in enumerate(f["stages"]) if i == 0 or s != f["stages"][i - 1]]
    assert seq == ["ready", "tercom", "done"] or seq == ["ready", "sense", "tercom", "done"]
    # the sense stage is exactly one call: the first step leaves "ready" for good
    assert f["stages"][1] in ("sense", "tercom")
    tercom_calls = [d for stage, prev, d in f["durations"] if prev != "ready"]
    assert tercom_calls, "no tercom chunks"
    assert max(tercom_calls) < 0.6, f"slowest tercom chunk {max(tercom_calls):.3f} s"
    last = f["progress"][-1]
    assert last["windows_done"] == last["windows_total"] > 0
    assert last["samples_done"] == last["samples_total"] == f["start"]["samples_total"]
    done = [p["windows_done"] for p in f["progress"]]
    assert done == sorted(done)


def test_result_refuses_invalid_payload(monkeypatch):
    """WR-03: the authoritative validator runs in result(); a rejected payload is never returned."""
    monkeypatch.setattr(artifact, "validate_live_payload", lambda p: ["forced problem", "second"])
    live_uav.start("synthetic_100m")
    while not live_uav.step(2000)["done"]:
        pass
    with pytest.raises(live_uav.InvalidLivePayload, match="forced problem; second"):
        live_uav.result()
    assert live_uav.current_stage() is None  # the run is consumed; nothing stale survives
    with pytest.raises(RuntimeError, match="No live run"):
        live_uav.result()


def test_measured_contrast_replaces_cn(monkeypatch):
    seen = []
    real = ramsey.two_stage

    def spy(*a, **kw):
        out = real(*a, **kw)
        seen.append(out["c_n"])
        return out

    monkeypatch.setattr(ramsey, "two_stage", spy)

    # accepted measurement: c4 = 0.85 drives the GHZ-4 fine stage and the provenance
    live_uav.start("synthetic_100m")
    q = live_uav.attach_quantum(fake_quantum(0.85))
    assert q["c_n_used"] == pytest.approx(0.85)
    assert q["c_n_source"] == "measured this Run"
    assert "rng_bits" not in q
    while not live_uav.step(2000)["done"]:
        pass
    res = live_uav.result()
    assert seen == [pytest.approx(0.85)]
    assert res["scenario"]["provenance"]["ghz"]["c_n"] == pytest.approx(0.85)
    assert res["quantum_job"]["c_n_source"] == "measured this Run"
    assert res["motor"]["seed_hex"] == res["quantum_job"]["seed_hex"]
    assert artifact.validate_live_payload(res) == []

    # rejected measurement (below the 0.5 floor): the frozen default stays
    seen.clear()
    live_uav.start("synthetic_100m")
    q = live_uav.attach_quantum(fake_quantum(0.3))
    assert q["c_n_used"] == pytest.approx(C4_DEFAULT, abs=1e-6)
    assert q["c_n_source"] == "default model, not measured"
    assert q["c_n_note"]
    live_uav.step(250)  # the sense call
    assert seen == [pytest.approx(C4_DEFAULT, abs=1e-6)]


def test_start_rejects_unknown_scenario():
    with pytest.raises(ValueError):
        live_uav.start("cessna_x")
    assert live_uav.current_stage() is None


def test_attach_requires_ready():
    with pytest.raises(RuntimeError):
        live_uav.attach_quantum(fake_quantum(0.9))


def test_clamp_budget():
    assert live_uav.clamp_budget(1) == 50
    assert live_uav.clamp_budget(10**6) == 2000
    assert live_uav.clamp_budget(250) == 250
