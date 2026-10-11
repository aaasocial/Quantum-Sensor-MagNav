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
