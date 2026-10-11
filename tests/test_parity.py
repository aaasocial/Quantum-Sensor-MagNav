"""Motor-off parity (SC5), created after the freeze commit: with no tones, the equal-budget
baseline (guarded LS and block mean) and the single-qubit quantum sensor reach the same signal
RMSE within 10% at every S of the frozen ladder. Also the shape of `sense_all`."""

import numpy as np
import pytest

from magnav import motor, uav
from magnav.data import MAP_EASTERN, load_map
from magnav.uav_pipeline import ESTIMATORS, load_model, sense_all, shipped_motor

ROOTS = (0, 1, 2)
PROV_KEYS = {"tau_s", "m", "b_ref_nT", "fringe", "ghz_fallback", "rpm", "ls_drops",
             "max_abs_phi", "slips", "fine_slips", "n_fallback", "n_fringe"}  # fmt: skip


@pytest.fixture(scope="module")
def model():
    return load_model()


@pytest.fixture(scope="module")
def worlds(model):
    tile = load_map(MAP_EASTERN)
    return {r: uav.build_world(tile, model["flight"], {k: v for k, v in model["map_error"].items()
                                                       if k != "seed"}, r) for r in ROOTS}  # fmt: skip


def _post_jam_rmse(world, model, bhat):
    n = len(world.t)
    start = int(model["flight"]["jam_fraction"] * n) + int(model["tercom"]["window"])
    return float(np.sqrt(np.mean((bhat[start:] - world.b_true[start:]) ** 2)))


def _ratios(model, worlds, S, motor_for):
    r_ls, r_mean = [], []
    for root, w in worlds.items():
        out = sense_all(w, model, S, motor=motor_for(w), root_seed=root)
        q = _post_jam_rmse(w, model, out["bhat"]["quantum_q1"])
        r_ls.append(_post_jam_rmse(w, model, out["bhat"]["baseline_ls"]) / q)
        r_mean.append(_post_jam_rmse(w, model, out["bhat"]["baseline_mean"]) / q)
    return float(np.mean(r_ls)), float(np.mean(r_mean))


@pytest.mark.parametrize("S", [64, 256, 1024, 4096])
def test_motor_off_parity(model, worlds, S):
    assert S in model["shots_ladder"]
    ls, mean = _ratios(model, worlds, S, lambda w: None)
    print(f"\n[parity motor-off] S={S}: LS/Q1 {ls:.3f}, mean/Q1 {mean:.3f}")
    assert abs(ls - 1.0) < 0.10
    assert abs(mean - 1.0) < 0.10


@pytest.mark.parametrize("S", [64, 256, 1024, 4096])
def test_tones_off_rpm_known_parity(model, worlds, S):
    def zero_tone_motor(w):
        return motor.draw_motor(model["seeds"]["shipped_motor_seed"], len(w.t) / model["fs_hz"], 0.0)

    ls, mean = _ratios(model, worlds, S, zero_tone_motor)
    print(f"\n[parity tones-off, RPM known] S={S}: LS/Q1 {ls:.3f}, mean/Q1 {mean:.3f}")
    assert abs(ls - 1.0) < 0.10
    assert abs(mean - 1.0) < 0.10


def test_sense_all_outputs(model, worlds):
    w = worlds[0]
    out = sense_all(w, model, 256, motor=shipped_motor(model))
    n = len(w.t)
    assert set(out["bhat"]) == set(ESTIMATORS) == {"quantum_q1", "quantum_ghz4", "baseline_ls", "baseline_mean"}
    assert all(np.shape(v) == (n,) for v in out["bhat"].values())
    assert set(out["prov"]) == PROV_KEYS
    assert out["S"] == 256 and out["motor"]["A1_nT"] == model["tone_amplitude_rule"]["A1_nT"]
    off = sense_all(w, model, 256)
    assert off["motor"] is None and np.all(off["prov"]["tau_s"] == model["tau0_s"])
    assert off["prov"]["ls_drops"] == 0 and np.all(off["prov"]["rpm"] == 0)


def test_sense_all_S_independent_motor(model, worlds):
    w = worlds[0]
    a = sense_all(w, model, 64, motor=shipped_motor(model))
    b = sense_all(w, model, 4096, motor=shipped_motor(model))
    assert a["motor"] == b["motor"]
    assert a["motor"]["seed"] == model["seeds"]["shipped_motor_seed"]
