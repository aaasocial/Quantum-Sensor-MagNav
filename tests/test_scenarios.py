"""Phase 1.1 scenarios: the 100 m synthetic flight and its guarantees.

Honesty order (SCN-02): the quantum-only slip gate and the motor-off parity on the 100 m flight are
measured and committed BEFORE the first motor-on 100 m comparison exists. Nothing here runs the
motor-on comparison pipeline, TERCOM or a baseline-vs-quantum navigation output. The frozen sensor
model (data/qsensor_model.json) and magnav/nav.py are pinned by sha256; a low-altitude model file is
only legal if it was committed alone before any 100 m comparison artifact.

Measured before this file existed (session scratch run, root 0, shipped synthetic map): 0 servo,
coarse and fine slips at every S in {64, 256, 1024, 4096}, motor on and off; motor-off parity LS/Q1
and mean/Q1 = 0.974 (S = 64), 0.996 (256), 0.997 (1024), 1.006 (4096). No low-altitude model frozen.
"""

import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
import pytest

from magnav import ramsey, synthmap, uav
from magnav.artifact import UAV_ARTIFACT_PATH, dumps_artifact
from magnav.motor import rpm_at, tone_window_integral
from magnav.seeds import stream
from magnav.uav_pipeline import QSENSOR_MODEL, load_model, sense_all, shipped_motor

ROOT = Path(__file__).resolve().parents[1]
MODEL_SHA256 = "a10a6f62456eb49458dd42071384b5a51cf00ca388c71702dfce16e5b27ac891"
NAV_SHA256 = "efc700cf796e49f4e4dfaa3fe9abd1108b5619c845c2e3f0394a918cd30c709a"  # measured at plan 01.1-02 start
LOWALT = "data/qsensor_model_lowalt.json"
GATE_S = (256, 1024, 4096)
MOTORS = ("off", "on")


@pytest.fixture(scope="module")
def model():
    return load_model(str(ROOT / QSENSOR_MODEL))


def _quantum_only(world, model, S, p, root):
    """The quantum block of `sense_all` only (servo + coarse + GHZ-n fine), no baseline, no TERCOM."""
    c1 = float(model["noise"]["c1"])
    tau0 = float(model["tau0_s"])
    h = float(model["servo"]["cycle_s"])
    m_rule = int(model["tau_rule"]["m"])
    n_fine = int(max(model["ghz"]["n_set"]))
    t, B = world.t, world.b_true
    n = len(t)
    if p is None:
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
    return ramsey.two_stage(t, B, lambda tq: uav.field_at(world, tq), tau, m, S, c1, rngs,
                            uav.servo_seed(world), n_fine=n_fine, tone_int=tone_int,
                            tone_int_fine=tone_int_fine, tau_at=tau_at,
                            servo_tone_int_at=servo_tone_int_at, h=h)  # fmt: skip


@pytest.fixture(scope="module")
def gate_results(model, worlds_100m):
    p_on = shipped_motor(model)
    return {(S, mot): _quantum_only(worlds_100m[0], model, S, None if mot == "off" else p_on, 0)
            for S in GATE_S for mot in MOTORS}  # fmt: skip


@pytest.mark.parametrize("motor_state", MOTORS)
@pytest.mark.parametrize("S", GATE_S)
def test_slip_gate_100m(gate_results, S, motor_state):
    r = gate_results[(S, motor_state)]
    print(f"\n[gate 100m] S={S} motor={motor_state}: servo max|phi| {r['servo_max_abs_phi']:.3f}, "
          f">pi/4 {r['servo_n_beyond_linear']}, coarse max|phi| {r['max_abs_phi']:.3f}, "
          f"fringe {r['n_fringe']}, fine_slips {r['fine_slips']}, fallbacks {r['n_fallback']}")  # fmt: skip
    assert r["servo_slips"] == 0
    assert r["slips"] == 0
    assert r["fine_slips"] == 0
    assert r["servo_max_abs_phi"] <= np.pi / 2
    assert r["max_abs_phi"] <= np.pi / 4


def _sha256(rel):
    return hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()


def test_model_unchanged():
    assert _sha256(QSENSOR_MODEL) == MODEL_SHA256


def test_nav_unchanged():
    assert _sha256("magnav/nav.py") == NAV_SHA256


def _git(*args) -> str:
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True,
                          check=True).stdout.strip()  # fmt: skip


def _first_commit(path: str) -> str | None:
    out = _git("log", "--format=%H", "--reverse", "--", path)
    return out.splitlines()[0] if out else None


def _strict_ancestor(a: str, b: str) -> bool:
    r = subprocess.run(["git", "-C", str(ROOT), "merge-base", "--is-ancestor", a, b], check=False)
    return r.returncode == 0 and a != b


def test_lowalt_freeze_precedes_comparison():
    if not (ROOT / LOWALT).exists():
        pytest.skip("no low-altitude model (slip gate passed with the frozen model)")
    if not (ROOT / ".git").exists():
        pytest.skip("no git metadata (e.g. Qollab upload)")
    F = _first_commit(LOWALT)
    assert F, f"{LOWALT} has no commit"
    assert _git("show", "--name-only", "--format=", F).split() == [LOWALT]
    T = _first_commit("tests/test_scenarios.py")
    if T:
        assert _strict_ancestor(F, T), f"lowalt freeze {F[:7]} not before tests/test_scenarios.py {T[:7]}"
    out = _git("log", "--format=%H", "--reverse", "-S", "synthetic_100m", "--", "data/precomputed_uav.json")
    if out:
        A = out.splitlines()[0]
        assert _strict_ancestor(F, A), f"lowalt freeze {F[:7]} not before 100 m artifact {A[:7]}"


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


# S = 64 sits below the S >= 256 regime; measured before this file existed at LS/Q1 0.974,
# mean/Q1 0.974 (within 10%), so it is a normal asserted case.
@pytest.mark.parametrize("S", [64, 256, 1024, 4096])
def test_motor_off_parity_100m(model, worlds_100m, S):
    assert S in model["shots_ladder"]
    ls, mean = _ratios(model, worlds_100m, S, lambda w: None)
    print(f"\n[parity motor-off 100m] S={S}: LS/Q1 {ls:.3f}, mean/Q1 {mean:.3f}")
    assert abs(ls - 1.0) < 0.10
    assert abs(mean - 1.0) < 0.10


# --- Plan 01.1-02 Task 4: scenario guarantees (after the as-found 100 m comparison) ---------------

LABEL = "synthetic map (sensitivity study), not survey data"
UI_SPEC = ".planning/phases/02-one-circuit-live-path-ui-and-hardware-capture/02-UI-SPEC.md"
PHASE1_ARTIFACT_COMMIT = "01de412"


@pytest.fixture(scope="module")
def art():
    return json.loads((ROOT / UAV_ARTIFACT_PATH).read_text(encoding="utf-8"))


def test_synthetic_label_everywhere(art):
    assert synthmap.SYNTH_LABEL == LABEL
    prov = json.loads((ROOT / "data/provenance.json").read_text(encoding="utf-8"))
    assert prov["files"]["data/map_synth_100m.npz"]["label"] == LABEL
    syn = art["scenarios"][0]
    assert syn["id"] == "synthetic_100m" and syn["synthetic"] is True
    assert syn["map_label"] == LABEL
    assert LABEL in syn["map_caption"]
    assert LABEL in syn["map"]["label"]
    spec = ROOT / UI_SPEC
    if not spec.exists():
        pytest.skip("planning docs absent (e.g. Qollab upload)")
    assert LABEL in spec.read_text(encoding="utf-8")


def test_eastern_identical_to_phase1(art, shipped_runs):
    """The eastern flight with the Phase 1 (shipped) motor is byte-identical to Phase 1. The committed
    replay carries the QPU-measured motor since plan 03-01 (D-08), so the line is rebuilt here."""
    if not (ROOT / ".git").exists():
        pytest.skip("no git metadata (e.g. Qollab upload)")
    from magnav.artifact import scenario_entry
    from magnav.data import load_provenance
    from magnav.uav_pipeline import SCENARIOS

    old = json.loads(_git("show", f"{PHASE1_ARTIFACT_COMMIT}:data/precomputed_uav.json"))
    sc = SCENARIOS["eastern_400m"]
    east = scenario_entry(shipped_runs["eastern_400m"], sc, load_provenance()["files"][sc["map_file"]])
    assert dumps_artifact(east["line"]) == dumps_artifact(old["line"])
    assert json.loads(dumps_artifact(east["provenance"])) == old["provenance"]  # stored values are _clean-rounded
    assert old["motor"]["seed"] == load_model()["seeds"]["shipped_motor_seed"]
    assert art["motor"]["seed"] == int("c1dfff10e69fae05", 16)  # replay: QPU-measured motor (D-08)
    assert art["S"] == old["S"]
    assert art["model_sha256"] == old["model_sha256"]


def test_flight_100m_comparison_recorded(art):
    sc = {s["id"]: s for s in art["scenarios"]}
    syn, east = sc["synthetic_100m"]["line"], sc["eastern_400m"]["line"]
    assert syn["map_file"] == "data/map_synth_100m.npz"
    for name in ("baseline_ls", "baseline_mean", "quantum_q1", "quantum_ghz4"):
        assert name in syn["metrics"], name
        assert syn["metrics"][name]["windows"] == east["metrics"][name]["windows"], name
    print("\n[comparison] " + art["comparison"]["statement"])
    assert art["comparison"]["statement"].startswith("At 100 m on the synthetic map")


def test_no_cessna():
    data = ROOT / "data"
    assert not list(data.glob("flt*.npz")) and not list(data.glob("*.h5"))
    texts = [(ROOT / UAV_ARTIFACT_PATH), data / "provenance.json", *sorted((ROOT / "magnav").glob("*.py"))]
    for path in texts:
        low = path.read_text(encoding="utf-8").lower()
        for bad in ("cessna", "flt100"):
            assert bad not in low, f"{bad!r} in {path.relative_to(ROOT)}"
