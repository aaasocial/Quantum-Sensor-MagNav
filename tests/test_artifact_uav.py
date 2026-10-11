"""RunArtifact v2 (data/precomputed_uav.json): validity, size, tracks, bindings, determinism."""

import copy
import hashlib
import json
from pathlib import Path

import pytest

from magnav.artifact import (
    ESTIMATORS,
    MAX_POINTS,
    UAV_ARTIFACT_PATH,
    build_uav_artifact,
    dumps_artifact,
    validate_uav_artifact,
)
from magnav.uav_pipeline import QSENSOR_MODEL, load_model, run_uav

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / UAV_ARTIFACT_PATH


@pytest.fixture(scope="module")
def art():
    return json.loads(PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def model():
    return load_model(str(ROOT / QSENSOR_MODEL))


def test_valid_and_small(art):
    assert validate_uav_artifact(art) == []
    assert PATH.stat().st_size < 2_000_000
    assert b"NaN" not in PATH.read_bytes()


def test_tracks_present(art):
    L = art["line"]
    n = len(L["t"])
    assert 0 < n <= MAX_POINTS
    assert set(L["truth"]) == {"x", "y", "anomaly_nT"}
    assert set(L["dead_reckoning"]) == {"x", "y"}
    assert set(L["estimates"]) == set(ESTIMATORS)
    for v in (*L["truth"].values(), *L["dead_reckoning"].values()):
        assert len(v) == n
    for name, e in L["estimates"].items():
        for k in ("x", "y", "signal_nT", "window_t", "ncc", "accepted"):
            assert k in e, (name, k)
        for k in ("x", "y", "signal_nT"):
            assert len(e[k]) == n, (name, k)
        assert len(e["window_t"]) == len(e["ncc"]) == len(e["accepted"]) > 0
    for name in (*ESTIMATORS, "dead_reckoning"):
        assert "cep50_m" in L["metrics"][name] and "pct_under_556" in L["metrics"][name]


def test_motor_and_model_binding(art, model):
    mot = art["motor"]
    assert mot["seed"] == model["seeds"]["shipped_motor_seed"]
    assert mot["seed_str"] == str(model["seeds"]["shipped_motor_seed"])
    for k in ("t_knots", "rpm_knots", "amps_nT", "phases", "A1_nT"):
        assert k in mot
    assert mot["A1_nT"] == model["tone_amplitude_rule"]["A1_nT"]
    assert art["S"] == model["S_default"]
    assert art["model_sha256"] == hashlib.sha256((ROOT / QSENSOR_MODEL).read_bytes()).hexdigest()


def test_sensor_provenance(art):
    L = art["line"]
    n = len(L["t"])
    for k in ("rpm", "tau_ms", "m", "b_ref_nT", "fringe", "ghz_fallback"):
        assert len(L["sensor"][k]) == n, k
    P = art["provenance"]
    assert P["quantum"]["slips"] == 0
    assert P["ghz"]["fine_slips"] == 0
    assert P["ghz"]["n"] == 4
    assert isinstance(P["ghz"]["n_fallback"], int)
    assert isinstance(P["quantum"]["n_fringe"], int)
    assert isinstance(P["baseline"]["ls_drops"], int)
    assert P["quantum"]["max_abs_phi"] <= 0.7854


def test_deterministic_rebuild(tile):
    built = dumps_artifact(build_uav_artifact(run_uav(tile=tile)))
    assert built.encode("utf-8") == PATH.read_bytes()


def test_validator_rejects(art):
    a = copy.deepcopy(art)
    a["schema_version"] = 1
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    del a["line"]["estimates"]["quantum_ghz4"]
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["line"]["truth"]["x"][0] = float("nan")
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["line"]["estimates"]["baseline_ls"]["x"].pop()
    assert validate_uav_artifact(a)
