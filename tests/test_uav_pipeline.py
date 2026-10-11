"""Motor-on UAV run (plan 01-04): four estimators through the unchanged TERCOM, frozen model."""

import numpy as np
import pytest

from magnav import motor
from magnav.uav_pipeline import ESTIMATORS, load_model, run_uav

POS_KEYS = ("cep50_m", "pct_under_556", "signal_rmse_nT")


@pytest.fixture(scope="module")
def model():
    return load_model()


@pytest.fixture(scope="module")
def run(tile, model):
    return run_uav(model=model, tile=tile)


def test_run_uav_tracks(run):
    L = run["line"]
    n = L["n"]
    assert set(L["results"]) == set(ESTIMATORS)
    for name in ESTIMATORS:
        r = L["results"][name]
        assert len(r["x"]) == n and len(r["y"]) == n
        assert np.all(np.isfinite(r["x"])) and np.all(np.isfinite(r["y"]))
        for k in POS_KEYS:
            assert k in r["metrics"], (name, k)
        assert r["metrics"]["denoiser"] == name
    assert "cep50_m" in L["dr_metrics"] and L["dr_metrics"]["denoiser"] == "dead_reckoning"
    assert len(L["dr_x"]) == n


def test_run_uav_quantum_provenance(run):
    n = run["line"]["n"]
    P = run["prov"]
    for k in ("tau_s", "m", "b_ref_nT", "fringe", "ghz_fallback"):
        assert len(P[k]) == n, k
    assert P["slips"] == 0
    assert P["fine_slips"] == 0
    assert P["max_abs_phi"] <= np.pi / 4


def test_run_uav_uses_frozen_model(run, model):
    assert run["motor"]["seed"] == model["seeds"]["shipped_motor_seed"]
    assert run["motor"]["A1_nT"] == model["tone_amplitude_rule"]["A1_nT"]
    assert run["S"] == model["S_default"]
    assert len(run["model_sha256"]) == 64


def test_run_uav_bits_path(tile, model):
    bits = "0110" * 32
    r = run_uav(model=model, tile=tile, bits=bits)
    duration = model["flight"]["n"] / model["fs_hz"]
    expect = motor.motor_from_bits(bits, duration, model["tone_amplitude_rule"]["A1_nT"])
    assert r["motor"]["bits"] == bits
    assert r["motor"]["seed"] == expect.seed
    assert r["motor"]["rpm_knots"] == list(expect.rpm_knots)
    assert set(r["line"]["results"]) == set(ESTIMATORS)


def test_run_uav_rejects_tile_scenario_mismatch(synth_tile, model):
    """A supplied tile must be the scenario's map file, or the artifact would attest the sha256 of a
    map that was never flown (review WR-02); raised before any world is built."""
    with pytest.raises(ValueError, match="does not match scenario"):
        run_uav(model=model, tile=synth_tile, scenario="eastern_400m")


SCENARIO_KEYS = {"id", "map_file", "alt_m", "synthetic", "label", "map_label", "map_caption", "model_file", "notes"}


def test_scenarios_registry():
    from magnav import synthmap
    from magnav.uav_pipeline import DEFAULT_SCENARIO, SCENARIO_ORDER, SCENARIOS

    assert SCENARIO_ORDER == ("synthetic_100m", "eastern_400m")
    assert DEFAULT_SCENARIO == "synthetic_100m"
    assert set(SCENARIOS) == set(SCENARIO_ORDER)
    for sid, sc in SCENARIOS.items():
        assert set(sc) == SCENARIO_KEYS, sid
        assert sc["id"] == sid
        assert sc["model_file"] == "data/qsensor_model.json"
    s = SCENARIOS["synthetic_100m"]
    assert s["map_file"] == "data/map_synth_100m.npz" and s["alt_m"] == 100.0 and s["synthetic"] is True
    assert s["map_label"] == synthmap.SYNTH_LABEL and s["map_caption"] == synthmap.SYNTH_CAPTION
    e = SCENARIOS["eastern_400m"]
    assert e["map_file"] == "data/map_eastern_395.npz" and e["alt_m"] == 400.0 and e["synthetic"] is False
    for k in ("label", "map_label", "map_caption"):
        assert synthmap.SYNTH_LABEL not in e[k]


def test_prepare_uav_map_file(world):
    from magnav.uav import prepare_uav

    a = prepare_uav(world, mag={"clean": world.b_true})
    b = prepare_uav(world, mag={"clean": world.b_true}, map_file="data/map_synth_100m.npz")
    assert a["map_file"] == "data/map_eastern_395.npz"
    assert b["map_file"] == "data/map_synth_100m.npz"
    assert set(a) == set(b)


def test_run_uav_default_is_eastern(run, model):
    import copy

    before = copy.deepcopy(model["flight"])
    assert run["scenario"] == "eastern_400m"
    assert run["line"]["map_file"] == "data/map_eastern_395.npz"
    assert load_model()["flight"] == before == model["flight"]


# ---------- Phase 3 (plan 03-01): RPM-withheld switch and the QPU replay bits ----------


@pytest.fixture(scope="module")
def withheld(synth_tile, model):
    return run_uav(model=model, tile=synth_tile, scenario="synthetic_100m", rpm_known=False)


def test_run_uav_rpm_withheld(withheld):
    """Withheld (D-07): tau = tau0, no notch; tones still present, so the quantum sensor slips and
    the baseline LS notch reduces to the block mean."""
    R = withheld["line"]["results"]
    for name in ESTIMATORS:
        for k in POS_KEYS:
            assert np.isfinite(R[name]["metrics"][k]), (name, k)
    assert withheld["prov"]["slips"] > 0
    assert np.all(np.asarray(withheld["prov"]["m"]) == 0)
    assert np.allclose(withheld["prov"]["tau_s"], 0.01)
    ls, mean = R["baseline_ls"]["metrics"], R["baseline_mean"]["metrics"]
    for k in ("signal_rmse_nT", "cep50_m", "cep95_m", "pct_under_556"):
        assert ls[k] == mean[k], k


def test_run_uav_rpm_known_default_unchanged(run, tile, model):
    explicit = run_uav(model=model, tile=tile, rpm_known=True)
    for name in ESTIMATORS:
        assert explicit["line"]["results"][name]["metrics"] == run["line"]["results"][name]["metrics"], name


def test_replay_bits_is_qpu_seed(tmp_path):
    import json

    from magnav import quantum
    from magnav.uav_pipeline import replay_bits

    with open("data/forte_hardware_run.json", encoding="utf-8") as f:
        h = json.load(f)
    assert h["label"] == "QPU-measured"
    bits = replay_bits()
    assert isinstance(bits, str) and len(bits) == 1024
    assert quantum.seed_hex_from_bits(bits) == "c1dfff10e69fae05"
    proxy = dict(h, label="simulator-sampled proxy")
    p = tmp_path / "proxy.json"
    p.write_text(json.dumps(proxy), encoding="utf-8")
    assert replay_bits(str(p)) is None
    assert replay_bits(str(tmp_path / "missing.json")) is None
