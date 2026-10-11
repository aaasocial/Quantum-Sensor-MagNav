"""Ramsey sensor (QS-01): analytic readout vs Statevector, tau rule, single phase formula,
20 ms servo reference over the full UAV flight."""

import ast
import re
from pathlib import Path

import numpy as np
import pytest
from qiskit.quantum_info import Statevector

from magnav import motor, ramsey, seeds, uav
from magnav.quantum import ghz_block, ramsey_block

# Explicit TEST amplitude for the motor tones; the frozen amplitude arrives in plan 01-03.
TEST_A1_NT = 5000.0
S_LADDER = (64, 256, 1024, 4096)
MAGNAV = Path(__file__).resolve().parents[1] / "magnav"
PHIS = [s * v for v in (0.05, 0.3, 0.7, 1.2) for s in (1.0, -1.0)]


def _tau_at(p):
    return lambda tq: ramsey.choose_tau(motor.rpm_at(p, tq))[0]


def _flight_inputs(world, tones=True):
    p = motor.draw_motor(seeds.int_seed(0, "motor"), 900.0, TEST_A1_NT)
    tau, m = ramsey.choose_tau(motor.rpm_at(p, world.t))
    tau_at = _tau_at(p)
    if tones:
        tone_int = motor.tone_window_integral(p, world.t, tau)

        def tone_mean_at(tq):
            tt = tau_at(tq)
            return motor.tone_window_integral(p, tq, tt) / tt
    else:
        tone_int, tone_mean_at = None, None
    return p, tau, m, tone_int, tone_mean_at


def _coarse(world, S, tones=True, c1=ramsey.C1_DEFAULT):
    _p, tau, m, tone_int, tone_mean_at = _flight_inputs(world, tones)
    return ramsey.coarse_track(
        world.t,
        world.b_true,
        lambda tq: uav.field_at(world, tq),
        tau,
        m,
        S,
        c1,
        seeds.stream(0, "servo", S),
        seeds.stream(0, "q1", S),
        tone_int=tone_int,
        tone_mean_at=tone_mean_at,
    )


@pytest.mark.parametrize("phi", PHIS)
def test_statevector_ramsey_both_signs(phi):
    sv = Statevector(ramsey_block(phi, 4)).probabilities([0])[1]
    assert abs(sv - ramsey.p1(phi)) < 1e-12


def test_probe_gates_pure_ramsey():
    ops = dict(ramsey_block(0.3, 4).count_ops())
    assert set(ops) == {"h", "rz"}
    assert ops == {"h": 2, "rz": 5}


@pytest.mark.parametrize("c", [1.0, 0.98])
def test_phi_hat_inverts_p1(c):
    S = 256
    for phi in np.linspace(-1.19, 1.19, 41):
        n1 = S * ramsey.p1(phi, c=c)
        assert abs(ramsey.phi_hat(n1, S, c=c) - phi) < 1e-12


def test_choose_tau():
    tau, m = ramsey.choose_tau(np.array([4500.0, 9000.0, 6123.0]))
    np.testing.assert_allclose(tau[:2], [0.0133333333333, 0.0066666666667], atol=1e-12)
    assert np.all(m == 1)
    f1 = np.array([4500.0, 9000.0, 6123.0]) / 60.0
    for k in range(1, 5):
        x = k * f1 * tau
        assert np.max(np.abs(x - np.round(x))) < 1e-12
    for rpm in (None, 0.0):
        t0, _ = ramsey.choose_tau(rpm)
        assert float(t0) == ramsey.TAU0 == 0.010
    tz, mz = ramsey.choose_tau(np.array([0.0, 6000.0]))
    assert tz[0] == ramsey.TAU0 and abs(tz[1] - 0.01) < 1e-15 and mz[1] == 1


def test_window_phase_is_single_source():
    pat = re.compile(r"pi\s*\*\s*GAMMA")
    hits = []
    for path in sorted(MAGNAV.glob("*.py")):
        for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            if pat.search(line):
                hits.append((path.name, i))
    assert len(hits) == 2, hits
    tree = ast.parse((MAGNAV / "ramsey.py").read_text(encoding="utf-8"))
    spans = {
        n.name: (n.lineno, n.end_lineno)
        for n in tree.body
        if isinstance(n, ast.FunctionDef) and n.name in ("window_phase", "field_from_phase")
    }
    assert set(spans) == {"window_phase", "field_from_phase"}
    owners = set()
    for fname, line in hits:
        assert fname == "ramsey.py"
        owner = [k for k, (a, b) in spans.items() if a <= line <= b]
        assert len(owner) == 1, (fname, line)
        owners.add(owner[0])
    assert owners == {"window_phase", "field_from_phase"}


def test_window_phase_round_trip():
    tau = np.array([0.0067, 0.01, 0.0133])
    dB = np.array([1.3, -0.4, 2.2])
    phi = ramsey.window_phase(dB, 0.0, tau)
    np.testing.assert_allclose(ramsey.field_from_phase(phi, tau), dB, atol=1e-12)
    assert abs(ramsey.sigma1(0.01, 1.0) - 4.549) < 1e-3


def test_servo_over_flight(world):
    res = {}
    for S in S_LADDER:
        r = _coarse(world, S)
        res[S] = r
        assert r["slips"] == 0, (S, r["max_abs_phi"])
    assert res[256]["max_abs_phi"] <= np.pi / 4
    assert res[1024]["max_abs_phi"] <= np.pi / 4
    assert res[4096]["max_abs_phi"] <= np.pi / 4
    # S = 64 fringe-risk count is recorded, not asserted zero (Pitfall 2)
    assert 0 <= res[64]["n_fringe"] < 0.05 * len(world.t)
    print({S: (round(res[S]["max_abs_phi"], 4), res[S]["n_fringe"]) for S in S_LADDER})


def test_coarse_estimate_tracks_field(world):
    r = _coarse(world, 256)
    err = r["bhat_nT"] - world.b_true
    sig = ramsey.sigma1(r["tau_s"], ramsey.C1_DEFAULT) / np.sqrt(256)
    # error is projection noise plus a small tone leak; normalised RMS close to 1
    assert 0.8 < np.sqrt(np.mean((err / sig) ** 2)) < 1.6


def test_provenance_fields(world):
    r = _coarse(world, 256)
    n = len(world.t)
    assert n == 1800
    for key in ("tau_s", "m", "b_ref_nT", "fringe", "phi", "n1", "phi_hat", "bhat_nT"):
        assert np.shape(r[key]) == (n,), key
    assert r["fringe"].dtype == bool


def test_filter_function_nulls():
    tau = 0.0123
    for k in range(1, 5):
        assert ramsey.filter_function(k / tau, tau) < 1e-12
    assert ramsey.filter_function(0.0, tau) == 1.0


@pytest.mark.parametrize("n", [1, 4])
def test_estimate_from_counts(n):
    rng = np.random.default_rng(3)
    shots, tau, c = 256, 0.0111, 0.98**n
    n1 = rng.integers(10, 246, 50)
    b_ref = rng.normal(53000.0, 100.0, 50)
    got = ramsey.estimate_from_counts(n1, shots, tau, b_ref, n=n, c=c)
    want = b_ref + ramsey.field_from_phase(ramsey.phi_hat(n1, shots, n, c), tau)
    assert np.max(np.abs(got - want)) < 1e-12


def test_readout_fringe_flags():
    rng = np.random.default_rng(0)
    r = ramsey.readout(np.array([0.0, 1.5, -1.5, 0.1]), 64, rng, c=0.98)
    assert r["n1"].shape == (4,)
    assert not r["fringe"][0]
    assert r["fringe"][1] and r["fringe"][2]


# ---------------------------------------------------------------- GHZ-n fine stage (QS-06)

@pytest.mark.parametrize("n", [1, 2, 4])
def test_statevector_ghz_n1_n2_n4(n):
    for nphi in PHIS:
        phi = nphi / n
        sv = Statevector(ghz_block(n, phi))
        assert abs(sv.probabilities([0])[1] - ramsey.p1(phi, n)) < 1e-12
        for q in range(1, n):
            assert sv.probabilities([q])[0] > 1 - 1e-12
    if n == 4:
        assert abs(Statevector(ghz_block(4, -0.2)).probabilities([0])[1] - 0.1413) < 1e-4
        assert abs(Statevector(ghz_block(4, 0.2)).probabilities([0])[1] - 0.8587) < 1e-4


def test_ghz4_gate_counts():
    assert dict(ghz_block(4, 0.1).count_ops()) == {"cx": 6, "rz": 5, "h": 2}


def test_fine_allowed_static_rule():
    assert ramsey.Z_STAR == 4.5
    assert ramsey.GHZ_N_SET == (1, 2, 4)
    assert not ramsey.fine_allowed(64, 4, 0.98)
    assert ramsey.fine_allowed(256, 4, 0.98)
    assert ramsey.fine_allowed(64, 2, 0.98)


def _two_stage(world, S, n_fine=4, tones=True, c1=ramsey.C1_DEFAULT):
    p, tau, m, tone_int, tone_mean_at = _flight_inputs(world, tones)
    tone_int_fine = motor.tone_window_integral(p, world.t + tau, tau) if tones else None
    rngs = {
        "servo": seeds.stream(0, "servo", S),
        "q1": seeds.stream(0, "q1", S),
        "ghz": seeds.stream(0, "ghz", n_fine, S),
    }
    return ramsey.two_stage(
        world.t,
        world.b_true,
        lambda tq: uav.field_at(world, tq),
        tau,
        m,
        S,
        c1,
        rngs,
        n_fine=n_fine,
        tone_int=tone_int,
        tone_int_fine=tone_int_fine,
        tone_mean_at=tone_mean_at,
    )


def test_ghz4_zero_fine_slips_over_flight(world):
    r = _two_stage(world, 256)
    n = len(world.t)
    assert r["fine_slips"] == 0
    assert r["n_fallback"] <= 0.01 * n
    assert r["fine_used"].shape == r["fallback"].shape == (n,)
    assert r["n_fine"] == 4 and abs(r["c_n"] - 0.98**4) < 1e-15
    # coarse keys pass through unchanged
    for key in ("tau_s", "m", "b_ref_nT", "phi", "bhat_nT", "fringe", "slips"):
        assert key in r
    np.testing.assert_array_equal(r["bhat_q1_nT"], r["bhat_nT"])
    print("S=256 GHZ-4:", r["n_fallback"], "fallbacks; max|n*phi_f| =",
          round(float(np.max(np.abs(4 * r["phi_fine"]))), 4))  # fmt: skip


def test_ghz4_fallback_at_S64(world):
    r = _two_stage(world, 64)
    assert r["fallback"].all()
    assert r["fine_slips"] == 0
    np.testing.assert_array_equal(r["bhat_ghz_nT"], r["bhat_q1_nT"])


def test_ghz_track_beats_coarse_noise(world):
    r = _two_stage(world, 256, tones=False)
    jam = int(world.flight["jam_fraction"] * len(world.t))
    e_q1 = (r["bhat_q1_nT"] - world.b_true)[jam:]
    e_ghz = (r["bhat_ghz_nT"] - world.b_true)[jam:]
    rq, rg = np.sqrt(np.mean(e_q1**2)), np.sqrt(np.mean(e_ghz**2))
    assert rg < rq
    print(f"post-jam RMSE q1 {rq:.4f} nT, GHZ-4 {rg:.4f} nT")


def _slope(entangled, c1, S=256, trials=40_000):
    ns = np.array(ramsey.GHZ_N_SET)
    rmse = [
        ramsey.scaling_trial(int(n), S, c1, trials, seeds.stream(0, "test_noise", int(n), int(entangled)), entangled)
        for n in ns
    ]
    return np.polyfit(np.log(ns), np.log(rmse), 1)[0], rmse


def test_sql_hl_slopes():
    s_sql, r_sql = _slope(False, 1.0)
    s_hl, r_hl = _slope(True, 1.0)
    assert abs(s_sql + 0.5) < 0.03, s_sql
    assert abs(s_hl + 1.0) < 0.03, s_hl
    s_er, _ = _slope(True, 0.95)
    assert abs(s_er + 0.886) < 0.03, s_er
    assert s_er > -0.97
    assert abs(r_sql[0] - 1 / 16) < 0.003 and abs(r_hl[2] - 1 / 64) < 0.001
    print(f"slopes: SQL {s_sql:.4f}, HL {s_hl:.4f}, HL c1=0.95 {s_er:.4f}")
