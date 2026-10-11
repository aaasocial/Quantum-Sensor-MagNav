"""Motor-tone interference generator (UAV-02, pure numpy).

The UAV's motor pollutes the magnetometer with tones at the RPM harmonics. The RPM follows a
piecewise-linear profile through knots drawn from a uniform 4500-9000 RPM prior; the tone
phase is the exact integral of RPM/60 (`rev_at`), never cos(2*pi*f(t)*t). Harmonics 1..K
(K = 4) have amplitudes A1 * HARMONIC_WEIGHTS and uniform start phases.

Randomness: a motor is fully determined by one integer seed (`draw_motor`), which comes from
`seeds.int_seed(root, "motor")` offline or from the SHA-256 of a bit string decoded from the
IonQ job (`motor_from_bits`). Draw order inside `draw_motor` is fixed: first the RPM knots,
then the K start phases. Nothing here depends on the shot count S.

Window integral: the chirped tone must be integrated with Gauss-Legendre (GL-24) on the exact
integrated phase (`tone_window_integral`). The constant-RPM closed form
(`tone_integral_const_rpm`) evaluated at the same RPM that picks tau = 60/R is identically
zero and would hide the in-window ramp leak (01-RESEARCH Pitfall 4); it exists for tests.
"""

from __future__ import annotations

import dataclasses
import hashlib
from dataclasses import dataclass

import numpy as np

RPM_MIN = 4500.0
RPM_MAX = 9000.0
K = 4
HARMONIC_WEIGHTS = (1.0, 0.5, 0.3, 0.2)
KNOT_SPACING_S = 60.0
GL_NODES = 24
_XG, _WG = np.polynomial.legendre.leggauss(GL_NODES)
MAX_BITS = 4096


@dataclass(frozen=True)
class MotorParams:
    """Everything needed to regenerate a motor byte-identically (stored in provenance)."""

    seed: int | None
    bits: str | None
    t_knots: tuple
    rpm_knots: tuple
    amps_nT: tuple
    phases: tuple
    A1_nT: float


def draw_motor(
    seed: int,
    duration_s: float,
    A1_nT: float,
    knot_spacing_s: float = KNOT_SPACING_S,
    rpm_min: float = RPM_MIN,
    rpm_max: float = RPM_MAX,
    weights: tuple = HARMONIC_WEIGHTS,
) -> MotorParams:
    """Draw a motor from `seed`: RPM knots first, then K start phases (fixed order)."""
    rng = np.random.default_rng(seed)
    t_knots = np.arange(-knot_spacing_s, duration_s + 2 * knot_spacing_s, knot_spacing_s)
    rpm_knots = rng.uniform(rpm_min, rpm_max, t_knots.size)
    phases = rng.uniform(0.0, 2 * np.pi, len(weights))
    amps = float(A1_nT) * np.asarray(weights, dtype=np.float64)
    return MotorParams(
        seed=None if seed is None else int(seed),
        bits=None,
        t_knots=tuple(float(v) for v in t_knots),
        rpm_knots=tuple(float(v) for v in rpm_knots),
        amps_nT=tuple(float(v) for v in amps),
        phases=tuple(float(v) for v in phases),
        A1_nT=float(A1_nT),
    )


def motor_from_bits(bits: str, duration_s: float, A1_nT: float, **kw) -> MotorParams:
    """Motor from a bit string (IonQ RNG block): seed = first 64 bits of sha256(bits)."""
    if not isinstance(bits, str) or not (1 <= len(bits) <= MAX_BITS) or not set(bits) <= {"0", "1"}:
        raise ValueError(f"bits must be a 1..{MAX_BITS} character string of '0'/'1'")
    seed = int(hashlib.sha256(bits.encode("ascii")).hexdigest()[:16], 16)
    return dataclasses.replace(draw_motor(seed, duration_s, A1_nT, **kw), bits=bits)


def motor_to_dict(p: MotorParams) -> dict:
    """JSON-safe dict (lists of floats)."""
    return {
        "seed": p.seed,
        "bits": p.bits,
        "t_knots": list(p.t_knots),
        "rpm_knots": list(p.rpm_knots),
        "amps_nT": list(p.amps_nT),
        "phases": list(p.phases),
        "A1_nT": p.A1_nT,
    }


def motor_from_dict(d: dict) -> MotorParams:
    return MotorParams(
        seed=None if d["seed"] is None else int(d["seed"]),
        bits=d["bits"],
        t_knots=tuple(float(v) for v in d["t_knots"]),
        rpm_knots=tuple(float(v) for v in d["rpm_knots"]),
        amps_nT=tuple(float(v) for v in d["amps_nT"]),
        phases=tuple(float(v) for v in d["phases"]),
        A1_nT=float(d["A1_nT"]),
    )


def rpm_at(p: MotorParams, t):
    """RPM channel: linear interpolation between knots (held constant outside)."""
    return np.interp(np.asarray(t, dtype=np.float64), p.t_knots, p.rpm_knots)


def rev_at(p: MotorParams, t):
    """Shaft revolutions = exact integral of rpm/60 (quadratic within each linear segment)."""
    t = np.asarray(t, dtype=np.float64)
    tk = np.asarray(p.t_knots)
    rk = np.asarray(p.rpm_knots)
    seg = np.concatenate([[0.0], np.cumsum(0.5 * (rk[1:] + rk[:-1]) * np.diff(tk) / 60.0)])
    i = np.clip(np.searchsorted(tk, t, side="right") - 1, 0, tk.size - 2)
    dt = t - tk[i]
    slope = (rk[i + 1] - rk[i]) / (tk[i + 1] - tk[i])
    return seg[i] + (rk[i] * dt + 0.5 * slope * dt**2) / 60.0


def tone_field(p: MotorParams, t):
    """Motor tones (nT): sum_k A_k cos(2*pi*k*rev(t) + theta_k)."""
    r = rev_at(p, t)
    out = np.zeros_like(r)
    for k, (a, ph) in enumerate(zip(p.amps_nT, p.phases)):
        out = out + a * np.cos(2 * np.pi * (k + 1) * r + ph)
    return out


def tone_window_integral(p: MotorParams, t0, tau):
    """Integral of the tones over [t0, t0 + tau] (nT*s), GL-24 on the exact chirped phase.

    Vectorised over windows; ~5e-13 relative accuracy for K <= 4, m = 1, ramps <= 3000 rpm/s.
    """
    t0 = np.atleast_1d(np.asarray(t0, dtype=np.float64))
    tau = np.broadcast_to(np.asarray(tau, dtype=np.float64), t0.shape)
    t = t0[:, None] + 0.5 * tau[:, None] * (_XG[None, :] + 1.0)
    return 0.5 * tau * np.sum(_WG[None, :] * tone_field(p, t), axis=1)


def tone_integral_const_rpm(amps_nT, phases_at_t0, f1_hz, tau):
    """Closed form at constant RPM: sum_k a_k [sin(2 pi k f1 tau + th_k) - sin(th_k)]/(2 pi k f1).

    Tests only: at tau = 60/R it is identically zero (Pitfall 4).
    """
    total = 0.0
    for k, (a, th) in enumerate(zip(amps_nT, phases_at_t0), start=1):
        w = 2 * np.pi * k * f1_hz
        total = total + a * (np.sin(w * tau + th) - np.sin(th)) / w
    return total
