"""Ramsey quantum magnetometer, emulated analytically (QS-01, pure numpy).

Probe: H, RZ(phi) (split in segments), RZ(pi/2) operating-point bias, H, so
P(1) = (1 + c sin(n phi)) / 2 with contrast c (n = 1 single qubit; GHZ-n accumulates n*phi).
`window_phase` is THE phase formula, phi = 2 pi gamma (dB tau + integral of tones over the
window); `field_from_phase` is its only inverse. Every consumer (coarse, fine, servo noise,
the Phase 2 circuit angles) goes through these two functions.

Interrogation time: tau = m * 60 / R with m = 1 (R = RPM channel at window start), so every
motor harmonic k * R / 60 completes an integer number of cycles and the sensor's filter
function |sinc(f tau)| nulls it inside the measurement. Without RPM, tau = TAU0.

Reference: a 20 ms servo (`servo_reference`) predicts the field linearly from the two
previous servo cycles, b_ref = 2 Bhat(t - h) - Bhat(t - 2h). Servo windows set the reference
only; their projection noise cancels in the output (no-slip identity) and they are not counted
in the shot budget S. The crust is held constant within one navigation sample's windows
(disclosed approximation, 01-RESEARCH A6).

Separation of worlds: the field (B_k, B_at) only enters through `window_phase` and the servo;
every estimate is formed by `estimate_from_counts` from counts, shots, tau and the reference.
"""

from __future__ import annotations

import numpy as np

GAMMA = 3.4986  # Hz/nT, Cs-133 ground-state gyromagnetic ratio
TAU0 = 0.010  # s, interrogation time without an RPM channel
C1_DEFAULT = 0.98  # single-qubit Ramsey contrast
SERVO_CYCLE_S = 0.02
LINEAR_RANGE_RAD = np.pi / 4
SLIP_RAD = np.pi / 2
M_DEFAULT = 1


def window_phase(dB_nT, tone_int_nTs, tau_s):
    """THE phase formula: phi = 2 pi gamma (dB * tau + integral of the tones over the window)."""
    return 2 * np.pi * GAMMA * (np.asarray(dB_nT) * tau_s + tone_int_nTs)


def field_from_phase(phi, tau_s):
    """Inverse of `window_phase` for a static field: dB = phi / (2 pi gamma tau)."""
    return np.asarray(phi) / (2 * np.pi * GAMMA * np.asarray(tau_s))


def sigma1(tau_s, c1):
    """Single-readout field noise (nT per shot): 1 / (2 pi gamma tau c1); shared with the baseline."""
    return field_from_phase(1.0, tau_s) / c1


def p1(phi, n=1, c=1.0):
    """P(1) of the biased Ramsey / GHZ-n probe: (1 + c sin(n phi)) / 2."""
    return 0.5 * (1.0 + c * np.sin(n * np.asarray(phi)))


def phi_hat(n1, shots, n=1, c=1.0):
    """Phase estimate from counts: arcsin(clip((2 n1 / shots - 1) / c, -1, 1)) / n."""
    x = np.clip((2.0 * np.asarray(n1) / shots - 1.0) / c, -1.0, 1.0)
    return np.arcsin(x) / n


def estimate_from_counts(n1, shots, tau_s, b_ref_nT, n=1, c=1.0):
    """Field estimate (nT) from counts, shots, tau and the reference only; never the field."""
    return b_ref_nT + field_from_phase(phi_hat(n1, shots, n, c), tau_s)


def contrast(n, c1):
    """GHZ-n contrast model c_n = c1 ** n."""
    return c1**n


def choose_tau(rpm, m=M_DEFAULT, tau0=TAU0):
    """Frozen tau rule: tau = m * 60 / R where R > 0, else tau0 (m reported as 0 there)."""
    if rpm is None:
        return np.asarray(float(tau0)), np.asarray(0)
    r = np.asarray(rpm, dtype=np.float64)
    ok = r > 0
    tau = np.where(ok, m * 60.0 / np.where(ok, r, 1.0), float(tau0))
    m_arr = np.where(ok, int(m), 0)
    return tau, m_arr


def readout(phi, shots, rng, n=1, c=1.0):
    """Binomial projection-noise readout of one window per element of `phi`.

    fringe-risk: n1 in {0, shots}, |2 n1 / shots - 1| >= c, or |n phi_hat| > pi/4.
    """
    phi = np.asarray(phi, dtype=np.float64)
    n1 = rng.binomial(int(shots), np.clip(p1(phi, n, c), 0.0, 1.0))
    ph = phi_hat(n1, shots, n, c)
    x = 2.0 * n1 / shots - 1.0
    fringe = (n1 == 0) | (n1 == shots) | (np.abs(x) >= c) | (np.abs(n * ph) > LINEAR_RANGE_RAD)
    return {"n1": n1, "phi_hat": ph, "fringe": fringe}


def servo_reference(B_at, t, tau, shots, c1, rng, h=SERVO_CYCLE_S, tone_mean_at=None):
    """b_ref(t) = 2 Bhat(t - h) - Bhat(t - 2h), h = 20 ms (vectorised no-slip identity).

    Bhat = B_at(.) (+ tone_mean_at(.) if given: the tone leak seen by a servo window)
    + projection noise field_from_phase(N(0, 1) / (c1 sqrt(shots)), tau). Servo windows set
    the reference only; their noise cancels in the output and they are not counted in S.
    """
    t = np.asarray(t, dtype=np.float64)
    tau = np.broadcast_to(np.asarray(tau, dtype=np.float64), t.shape)
    e = field_from_phase(rng.standard_normal((t.size, 2)) / (c1 * np.sqrt(shots)), tau[:, None])

    def bhat(tq, ek):
        b = np.asarray(B_at(tq), dtype=np.float64)
        if tone_mean_at is not None:
            b = b + tone_mean_at(tq)
        return b + ek

    return 2.0 * bhat(t - h, e[:, 0]) - bhat(t - 2.0 * h, e[:, 1])


def coarse_track(t, B_k, B_at, tau, m, shots, c1, rng_servo, rng_q1, tone_int=None,
                 tone_mean_at=None, h=SERVO_CYCLE_S) -> dict:  # fmt: skip
    """Single-qubit coarse stage over a flight: servo reference, one window per sample.

    B_k (true field at the samples) and B_at (callable) are the world side: they only set the
    phase via `window_phase` and the servo reference. The estimate comes from counts alone.
    """
    t = np.asarray(t, dtype=np.float64)
    tau = np.broadcast_to(np.asarray(tau, dtype=np.float64), t.shape)
    m = np.broadcast_to(np.asarray(m), t.shape)
    b_ref = servo_reference(B_at, t, tau, shots, c1, rng_servo, h=h, tone_mean_at=tone_mean_at)
    ti = 0.0 if tone_int is None else np.asarray(tone_int, dtype=np.float64)
    phi = window_phase(np.asarray(B_k, dtype=np.float64) - b_ref, ti, tau)
    r = readout(phi, shots, rng_q1, n=1, c=c1)
    bhat = estimate_from_counts(r["n1"], shots, tau, b_ref, n=1, c=c1)
    return {
        "tau_s": np.array(tau),
        "m": np.array(m),
        "b_ref_nT": b_ref,
        "phi": phi,
        "n1": r["n1"],
        "phi_hat": r["phi_hat"],
        "bhat_nT": bhat,
        "fringe": r["fringe"],
        "max_abs_phi": float(np.max(np.abs(phi))),
        "slips": int(np.count_nonzero(np.abs(phi) > SLIP_RAD)),
        "n_fringe": int(np.count_nonzero(r["fringe"])),
    }


def filter_function(f_hz, tau_s):
    """Ramsey filter function |sinc(f tau)| (normalised): nulls at f = k / tau."""
    return np.abs(np.sinc(np.asarray(f_hz) * tau_s))
