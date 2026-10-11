"""Frozen comparison rules (SC5): schema, values mirror the code, baseline-only amplitude rule,
and git order proving the freeze precedes every quantum-vs-baseline comparison."""

import ast
import json
import math
import subprocess
from pathlib import Path

import pytest

from magnav import motor, ramsey, seeds, uav
from magnav.uav_pipeline import QSENSOR_MODEL, REQUIRED_MODEL_KEYS, load_model

ROOT = Path(__file__).resolve().parents[1]
EQUAL_BUDGET_FIELDS = {
    "readouts_per_sample", "single_readout_noise_qs02", "single_readout_noise_refined",
    "rpm_channel", "ghz", "ghz_track_accounting", "S_meaning", "servo",
}  # fmt: skip
QUANTUM_ESTIMATORS = {"two_stage", "coarse_track", "readout", "servo_reference"}


@pytest.fixture(scope="module")
def model():
    return load_model(str(ROOT / QSENSOR_MODEL))


def _sig2(x):
    return float(f"{x:.2g}") == x


def test_schema_and_values(model):
    assert all(k in model for k in REQUIRED_MODEL_KEYS)
    assert model["schema_version"] == 1
    assert model["ghz"]["n_set"] == [1, 2, 4]
    c1 = model["noise"]["c1"]
    assert model["ghz"]["c_n_default"]["4"] == c1**4
    assert model["ghz"]["switch_rule"]["z_star"] == 4.5
    assert model["tau0_s"] == 0.010
    assert model["servo"]["cycle_s"] == 0.02
    assert model["S_default"] == 256
    assert model["shots_ladder"] == [64, 256, 1024, 4096]
    amp = model["tone_amplitude_rule"]
    assert amp["S_ref"] == 256 and amp["draws"] == 5 and amp["ratio"] == 0.6
    a1 = amp["A1_nT"]
    assert isinstance(a1, float) and math.isfinite(a1) and a1 > 0 and _sig2(a1)
    assert isinstance(model["map_error"]["seed"], int)
    eb = model["equal_budget"]
    assert set(eb) == EQUAL_BUDGET_FIELDS
    assert "1/(2*pi*gamma*tau0)" in eb["single_readout_noise_qs02"]
    assert "13%" in eb["single_readout_noise_refined"]
    assert "simulation" in model["baseline"]
    assert any("S_ref = 64" in n for n in model["notes"])
    raw = (ROOT / QSENSOR_MODEL).read_text(encoding="utf-8")
    assert "NaN" not in raw and "Infinity" not in raw
    assert len(raw.encode()) < 10240


def test_model_matches_code_constants(model):
    assert model["gamma_hz_per_nT"] == ramsey.GAMMA
    assert model["tau0_s"] == ramsey.TAU0
    assert model["noise"]["c1"] == ramsey.C1_DEFAULT
    assert model["ghz"]["switch_rule"]["z_star"] == ramsey.Z_STAR
    assert model["ghz"]["n_set"] == list(ramsey.GHZ_N_SET)
    assert model["servo"]["cycle_s"] == ramsey.SERVO_CYCLE_S
    assert model["tau_rule"]["m"] == ramsey.M_DEFAULT
    assert model["flight"] == json.loads(json.dumps(uav.FLIGHT_DEFAULT))
    assert model["ins"] == uav.INS_DEFAULT
    assert model["tercom"] == uav.TERCOM_PARAMS
    me = dict(model["map_error"])
    assert me.pop("seed") == seeds.int_seed(model["seeds"]["root"], "map_err")
    assert me == uav.MAP_ERROR_DEFAULT
    assert model["motor_prior"]["harmonic_weights"] == list(motor.HARMONIC_WEIGHTS)
    assert model["motor_prior"]["K"] == motor.K
    assert model["seeds"]["spawn_keys"] == {k: list(v) for k, v in seeds.SPAWN_KEYS.items()}
    assert model["seeds"]["shipped_motor_seed"] == seeds.int_seed(model["seeds"]["root"], "motor")


def test_amplitude_rule_is_baseline_only():
    tree = ast.parse((ROOT / "magnav" / "uav_pipeline.py").read_text(encoding="utf-8"))
    fns = {n.name: n for n in tree.body if isinstance(n, ast.FunctionDef)}
    for name in ("calibrate_amplitude", "build_model"):
        used = set()
        for sub in ast.walk(fns[name]):
            if isinstance(sub, ast.Name):
                used.add(sub.id)
            elif isinstance(sub, ast.Attribute):
                used.add(sub.attr)
        assert not used & QUANTUM_ESTIMATORS, (name, used & QUANTUM_ESTIMATORS)
        assert name != "calibrate_amplitude" or "ls_notch" in used


def _git(*args) -> str:
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True,
                          check=True).stdout.strip()  # fmt: skip


def _first_commit(path: str) -> str | None:
    out = _git("log", "--format=%H", "--reverse", "--", path)
    return out.splitlines()[0] if out else None


def _strict_ancestor(a: str, b: str) -> bool:
    r = subprocess.run(["git", "-C", str(ROOT), "merge-base", "--is-ancestor", a, b], check=False)
    return r.returncode == 0 and a != b


def test_freeze_precedes_comparison():
    if not (ROOT / ".git").exists():
        pytest.skip("no git metadata (e.g. Qollab upload)")
    F = _first_commit(QSENSOR_MODEL)
    assert F, "data/qsensor_model.json has no commit"
    assert _git("show", "--name-only", "--format=", F).split() == [QSENSOR_MODEL]
    for later in ("data/precomputed_uav.json", "tests/test_parity.py"):
        P = _first_commit(later)
        if P:
            assert _strict_ancestor(F, P), f"freeze {F[:7]} is not a strict ancestor of {later} {P[:7]}"
