"""Motor-tone generator (UAV-02): integrated RPM phase, GL-24 window integral, seed streams."""

import hashlib
import json

import numpy as np
import pytest
from scipy.integrate import quad

from magnav import motor, seeds
from magnav.motor import MotorParams

A1 = 1000.0  # nT, arbitrary test amplitude (the frozen amplitude arrives in plan 01-03)
DUR = 900.0


def _ramp_motor(rpm0, rate_rpm_s, span_s=3.0, A1_nT=A1, phases=(0.3, 1.1, 2.0, 4.5)):
    """Hand-made motor with a single linear RPM ramp of `rate_rpm_s` starting at t = 0."""
    return MotorParams(
        seed=None,
        bits=None,
        t_knots=(0.0, float(span_s)),
        rpm_knots=(float(rpm0), float(rpm0 + rate_rpm_s * span_s)),
        amps_nT=tuple(A1_nT * w for w in motor.HARMONIC_WEIGHTS),
        phases=tuple(float(p) for p in phases),
        A1_nT=float(A1_nT),
    )


def test_deterministic_bytes():
    t = np.linspace(0.0, 30.0, 20001)
    p1 = motor.draw_motor(1234, DUR, A1)
    p2 = motor.draw_motor(1234, DUR, A1)
    assert p1 == p2
    assert motor.tone_field(p1, t).tobytes() == motor.tone_field(p2, t).tobytes()
    bits = "1011" * 64
    q1 = motor.motor_from_bits(bits, DUR, A1)
    q2 = motor.motor_from_bits(bits, DUR, A1)
    assert q1 == q2 and q1.bits == bits
    assert motor.tone_field(q1, t).tobytes() == motor.tone_field(q2, t).tobytes()


def test_prior_and_K():
    p = motor.draw_motor(seeds.int_seed(0, "motor"), DUR, A1)
    rk = np.asarray(p.rpm_knots)
    assert np.all((rk >= motor.RPM_MIN) & (rk <= motor.RPM_MAX))
    assert motor.K == 4
    assert len(p.amps_nT) == len(p.phases) == 4
    np.testing.assert_allclose(p.amps_nT, A1 * np.array([1.0, 0.5, 0.3, 0.2]), rtol=0, atol=1e-12)
    ph = np.asarray(p.phases)
    assert np.all((ph >= 0) & (ph < 2 * np.pi))
    # knots cover servo windows before t = 0 and fine windows after the end
    assert p.t_knots[0] < 0.0 and p.t_knots[-1] > DUR


def test_rev_at_exact():
    p = motor.draw_motor(7, 200.0, A1)
    dt = 1e-4
    t = np.arange(0.0, 200.0 + dt / 2, dt)
    f = motor.rpm_at(p, t) / 60.0
    cum = np.concatenate([[0.0], np.cumsum(0.5 * (f[1:] + f[:-1]) * dt)])
    rev = motor.rev_at(p, t) - motor.rev_at(p, 0.0)
    assert np.max(np.abs(rev - cum)) < 1e-6
    # continuity across knots
    tk = np.asarray(p.t_knots)[1:-1]
    eps = 1e-9
    assert np.max(np.abs(motor.rev_at(p, tk + eps) - motor.rev_at(p, tk - eps))) < 1e-6


def test_window_integral_vs_quad():
    rng = np.random.default_rng(11)
    for _ in range(50):
        f1 = rng.uniform(motor.RPM_MIN, motor.RPM_MAX) / 60.0
        amps = A1 * np.asarray(motor.HARMONIC_WEIGHTS)
        ph = rng.uniform(0, 2 * np.pi, 4)
        tau = rng.uniform(0.002, 0.02)

        def g(s):
            return sum(a * np.cos(2 * np.pi * (k + 1) * f1 * s + th) for k, (a, th) in enumerate(zip(amps, ph)))

        ref, _ = quad(g, 0.0, tau, epsabs=1e-14, epsrel=1e-13, limit=200)
        got = motor.tone_integral_const_rpm(amps, ph, f1, tau)
        assert abs(got - ref) < 1e-9 * A1


def test_null_at_integer():
    rng = np.random.default_rng(12)
    amps = A1 * np.asarray(motor.HARMONIC_WEIGHTS)
    for rpm in (4500.0, 6000.0, 7777.0, 9000.0):
        f1 = rpm / 60.0
        tau = 60.0 / rpm
        ph = rng.uniform(0, 2 * np.pi, 4)
        assert abs(motor.tone_integral_const_rpm(amps, ph, f1, tau)) < 1e-12 * A1
        p = _ramp_motor(rpm, 0.0)
        t0 = np.linspace(0.1, 2.5, 20)
        got = motor.tone_window_integral(p, t0, np.full_like(t0, tau))
        assert np.max(np.abs(got)) < 1e-12 * A1 * tau


@pytest.mark.parametrize("rate", [500.0, 1000.0, 3000.0])
def test_gl24_vs_dense_chirp(rate):
    p = _ramp_motor(5000.0, rate, span_s=1.2)
    t0 = np.linspace(0.05, 1.0, 12)
    tau = 60.0 / motor.rpm_at(p, t0)
    got = motor.tone_window_integral(p, t0, tau)
    for a, tt, g in zip(t0, tau, got):
        ref, _ = quad(lambda s: float(motor.tone_field(p, np.array([s]))[0]), a, a + tt,
                      epsabs=1e-13, epsrel=1e-13, limit=400)  # fmt: skip
        assert abs(g - ref) < 1e-9 * A1 * tt


def test_chirp_leak_nonzero():
    t0 = np.linspace(0.1, 2.5, 20)
    p = _ramp_motor(5000.0, 1000.0)
    tau = 60.0 / motor.rpm_at(p, t0)
    leak = np.abs(motor.tone_window_integral(p, t0, tau)) / (A1 * tau)
    assert 3e-4 <= leak.max() <= 5e-3, leak.max()
    pc = _ramp_motor(5000.0, 0.0)
    tau_c = 60.0 / motor.rpm_at(pc, t0)
    leak_c = np.abs(motor.tone_window_integral(pc, t0, tau_c)) / (A1 * tau_c)
    assert leak_c.max() < 1e-12


def test_S_does_not_change_motor():
    ref = motor.draw_motor(seeds.int_seed(0, "motor"), DUR, A1)
    for S in (64, 256, 1024, 4096):
        seeds.stream(0, "q1", S).binomial(S, 0.5, size=1000)
        seeds.stream(0, "servo", S).standard_normal(1000)
        assert motor.draw_motor(seeds.int_seed(0, "motor"), DUR, A1) == ref


def test_bits_validation():
    for bad in ("", "0120", "1" * 4097, "10 1"):
        with pytest.raises(ValueError):
            motor.motor_from_bits(bad, DUR, A1)
    b = "0110100111"
    p = motor.motor_from_bits(b, DUR, A1)
    assert p.seed == int(hashlib.sha256(b.encode("ascii")).hexdigest()[:16], 16)
    assert p.bits == b
    assert motor.motor_from_bits("1" * 4096, DUR, A1).bits == "1" * 4096


def test_motor_dict_round_trip():
    for p in (motor.draw_motor(5, DUR, A1), motor.motor_from_bits("1100", DUR, A1)):
        d = motor.motor_to_dict(p)
        s = json.dumps(d, allow_nan=False)
        assert motor.motor_from_dict(json.loads(s)) == p
        assert motor.motor_from_dict(d) == p
