"""Ramsey quantum magnetometer, emulated analytically (QS-01, pure numpy).

Probe: H, RZ(phi) (split in segments), RZ(pi/2) operating-point bias, H, so
P(1) = (1 + c sin(n phi)) / 2 with contrast c (n = 1 single qubit; GHZ-n accumulates n*phi).
`window_phase` is THE phase formula, phi = 2 pi gamma (dB tau + integral of tones over the
window); `field_from_phase` is its only inverse. Every consumer (coarse, fine, servo,
the Phase 2 circuit angles) goes through these two functions.

Interrogation time: tau = m * 60 / R with m = 1 (R = RPM channel at window start), so every
motor harmonic k * R / 60 completes an integer number of cycles and the sensor's filter
function |sinc(f tau)| nulls it inside the measurement. Without RPM, tau = TAU0.

Reference: a recursive 20 ms servo. At servo cycle j the reference is the linear predictor of
the sensor's own two previous estimates, b_ref_j = 2 Bhat_{j-1} - Bhat_{j-2}; the servo window
is read out with S shots and Bhat_j = estimate_from_counts(n1_j, S, tau_j, b_ref_j). Each
navigation window uses the same predictor from the two most recent servo estimates before it
(`servo_reference`). The recursion is seeded once, from the IGRF plane + the navigator's map
value at the first GPS fix of the flight (`uav.servo_seed`; no map-error term, no truth). It is
not re-seeded at the jam: a GPS fix does not change the magnetometer loop, and a map-referenced
pre-jam reference would see the navigator's map error (up to 6.99 nT on the shipped world)
against a pi/4 linear range of 2.7-5.5 nT (planner deviation PR-1, quick task 261011-17n).
Servo windows set the reference only and are not counted in the shot budget S. The crust is
held constant within one navigation sample's windows (disclosed approximation, 01-RESEARCH A6).

Separation of worlds: the true field (B_k, B_at, B_servo) only enters through `window_phase`
(physics: the phase the probe accumulates). The servo reference and the navigation predictor
depend only on the seed and past estimates; every estimate is formed by `estimate_from_counts`
from counts, shots, tau and the reference.
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
Z_STAR = 4.5  # fine-stage margin threshold in coarse sigmas (two-sided tail 6.8e-6)
GHZ_N_SET = (1, 2, 4)


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


def servo_times(t, h=SERVO_CYCLE_S):
    """Servo cycle times and the servo index of each navigation sample.

    ts = t[0] + (arange(J) - 2) h with J = round((t[-1] - t[0]) / h) + 3: two seed cycles before
    t[0]. Navigation sample k sits at servo index k_idx[k]; its reference uses cycles k_idx - 1
    and k_idx - 2 only (all strictly earlier).
    """
    t = np.asarray(t, dtype=np.float64)
    J = int(np.rint((t[-1] - t[0]) / h)) + 3
    ts = t[0] + (np.arange(J) - 2) * h
    k_idx = (2 + np.floor((t - t[0]) / h + 1e-9)).astype(np.int64)
    assert int(k_idx.max()) < J
    return ts, k_idx


def servo_track(B_servo, tone_int_servo, tau_servo, seed_nT, shots, c1, rng) -> dict:
    """Recursive 20 ms servo: b_ref_j = 2 bhat_{j-1} - bhat_{j-2}, one readout of S shots per cycle.

    The true field enters only through `window_phase` (physics: the phase the servo window
    accumulates); the reference uses only the seed and past estimates. tau_servo (length J)
    defines the number of cycles; tone_int_servo may be None (0), a scalar or length J.
    Cycles 0 and 1 hold the seed. Exactly one binomial draw per cycle j >= 2, so the stream's
    consumption is independent of the field. Servo windows are not counted in S.
    """
    tau_s = np.array(tau_servo, dtype=np.float64).ravel()
    J = tau_s.size
    ti = np.broadcast_to(np.asarray(0.0 if tone_int_servo is None else tone_int_servo, dtype=np.float64), (J,))
    S = int(shots)
    seed = float(seed_nT)
    bhat = np.empty(J)
    b_ref = np.empty(J)
    phi = np.zeros(J)
    bhat[:2] = seed
    b_ref[:2] = seed
    for j in range(2, J):
        r = 2.0 * bhat[j - 1] - bhat[j - 2]
        ph = float(window_phase(B_servo[j] - r, ti[j], tau_s[j]))
        n1 = rng.binomial(S, min(max(float(p1(ph, 1, c1)), 0.0), 1.0))
        bhat[j] = float(estimate_from_counts(n1, S, tau_s[j], r, 1, c1))
        b_ref[j] = r
        phi[j] = ph
    a = np.abs(phi[2:])
    return {
        "bhat_nT": bhat,
        "b_ref_nT": b_ref,
        "phi": phi,
        "max_abs_phi": float(a.max()) if a.size else 0.0,
        "slips": int(np.count_nonzero(a > SLIP_RAD)),
        "n_beyond_linear": int(np.count_nonzero(a > LINEAR_RANGE_RAD)),
    }


def servo_reference(bhat_nT, idx):
    """Navigation predictor from the two most recent servo estimates: 2 bhat[idx-1] - bhat[idx-2]."""
    bhat_nT = np.asarray(bhat_nT, dtype=np.float64)
    idx = np.asarray(idx)
    return 2.0 * bhat_nT[idx - 1] - bhat_nT[idx - 2]


def coarse_track(t, B_k, B_at, tau, m, shots, c1, rng_servo, rng_q1, seed_nT, tone_int=None,
                 tau_at=None, servo_tone_int_at=None, h=SERVO_CYCLE_S) -> dict:  # fmt: skip
    """Single-qubit coarse stage over a flight: recursive servo reference, one window per sample.

    B_k (true field at the samples) and B_at (callable) are the world side: B_at is evaluated
    once at the servo times as the servo's physics input and B_k sets the navigation phase,
    both only via `window_phase`. tau_at(ts) gives the servo interrogation times (default:
    interpolated tau), servo_tone_int_at(ts, tau) the servo-window tone integrals (default 0).
    The reference comes from the seed and past servo estimates; the estimate from counts alone.
    """
    t = np.asarray(t, dtype=np.float64)
    tau = np.broadcast_to(np.asarray(tau, dtype=np.float64), t.shape)
    m = np.broadcast_to(np.asarray(m), t.shape)
    ts, k_idx = servo_times(t, h)
    tau_sv = np.asarray(tau_at(ts) if tau_at is not None else np.interp(ts, t, tau), dtype=np.float64)
    ti_sv = 0.0 if servo_tone_int_at is None else servo_tone_int_at(ts, tau_sv)
    sv = servo_track(B_at(ts), ti_sv, tau_sv, seed_nT, shots, c1, rng_servo)
    b_ref = servo_reference(sv["bhat_nT"], k_idx)
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
        "servo_bhat_nT": sv["bhat_nT"],
        "servo_b_ref_nT": sv["b_ref_nT"],
        "servo_k_idx": k_idx,
        "servo_max_abs_phi": sv["max_abs_phi"],
        "servo_slips": sv["slips"],
        "servo_n_beyond_linear": sv["n_beyond_linear"],
        "servo_n_cycles": int(ts.size - 2),
    }


def fine_allowed(shots, n, c1, z_star=Z_STAR):
    """Static switch term: GHZ-n range / coarse sigma = pi c1 sqrt(S) / (2 n) >= z_star."""
    return bool(np.pi * c1 * np.sqrt(shots) / (2 * n) >= z_star)


def two_stage(t, B_k, B_at, tau, m, shots, c1, rngs, seed_nT, n_fine=4, tone_int=None,
              tone_int_fine=None, tau_at=None, servo_tone_int_at=None, h=SERVO_CYCLE_S,
              c_n=None) -> dict:  # fmt: skip
    """Recursive servo + single-qubit coarse stage, then a GHZ-n fine window referenced to the coarse estimate.

    `rngs` holds generators "servo", "q1" and "ghz" (callers: seeds.stream(root, "servo", S),
    stream(root, "q1", S), stream(root, "ghz", n, S)); seed_nT seeds the servo recursion
    (uav.servo_seed: IGRF plane + map value at the GPS fix). The fine window starts at t + tau and
    sees `tone_int_fine`; its phase is window_phase(B_k - bhat_q1, ...), and the GHZ
    accumulation of n * phi happens inside p1(phi, n, c_n) with c_n = c1 ** n.

    c_n (Phase 2): the GHZ-n contrast measured this Run overrides the c1 ** n model in the fine
    readout and its decoder only; the switch rule keeps the frozen c1 and the draws are unchanged.

    Switch rule (frozen): the fine estimate is used iff fine_allowed(S, n, c1) and the coarse
    sample is not fringe-risk; otherwise the GHZ track takes the coarse estimate (fallback).

    Shot accounting (disclosed): the GHZ navigation track spends S coarse + S fine shots; the
    SQL/HL scaling figure compares the fine stage alone at equal qubit-shots (`scaling_trial`).
    With n_fine == 1 the fine stage is a second single-qubit window (scaling checks only).
    """
    out = coarse_track(t, B_k, B_at, tau, m, shots, c1, rngs["servo"], rngs["q1"], seed_nT,
                       tone_int=tone_int, tau_at=tau_at, servo_tone_int_at=servo_tone_int_at,
                       h=h)  # fmt: skip
    tau = out["tau_s"]
    bhat_q1 = out["bhat_nT"]
    n = int(n_fine)
    c_n = contrast(n, c1) if c_n is None else float(c_n)
    ti_f = 0.0 if tone_int_fine is None else np.asarray(tone_int_fine, dtype=np.float64)
    phi_f = window_phase(np.asarray(B_k, dtype=np.float64) - bhat_q1, ti_f, tau)
    rf = readout(phi_f, shots, rngs["ghz"], n=n, c=c_n)
    bhat_fine = estimate_from_counts(rf["n1"], shots, tau, bhat_q1, n=n, c=c_n)
    fine_used = fine_allowed(shots, n, c1) & ~out["fringe"]
    out.update(
        {
            "bhat_q1_nT": bhat_q1,
            "bhat_ghz_nT": np.where(fine_used, bhat_fine, bhat_q1),
            "phi_fine": phi_f,
            "n1_fine": rf["n1"],
            "fine_used": fine_used,
            "fallback": ~fine_used,
            "n_fallback": int(np.count_nonzero(~fine_used)),
            "fine_slips": int(np.count_nonzero(fine_used & (np.abs(n * phi_f) > SLIP_RAD))),
            "n_fine": n,
            "c_n": float(c_n),
        }
    )
    return out


def scaling_trial(n, shots, c1, trials, rng, entangled, phi_halfwidth=0.05, c_n=None) -> float:
    """Phase RMSE (rad) of one fine-stage measurement at equal qubit-shots.

    entangled: one GHZ-n readout of S shots with contrast c1 ** n (or c_n if given).
    unentangled: mean of n independent single-qubit readouts of S shots each, contrast c1.
    Residual phase ~ U(-phi_halfwidth, phi_halfwidth).
    """
    phi = rng.uniform(-phi_halfwidth, phi_halfwidth, int(trials))
    if entangled:
        c = contrast(n, c1) if c_n is None else float(c_n)
        n1 = rng.binomial(int(shots), np.clip(p1(phi, n, c), 0.0, 1.0))
        est = phi_hat(n1, shots, n, c)
    else:
        n1 = rng.binomial(int(shots), np.clip(p1(phi, 1, c1), 0.0, 1.0)[:, None], size=(phi.size, int(n)))
        est = phi_hat(n1, shots, 1, c1).mean(axis=1)
    return float(np.sqrt(np.mean((est - phi) ** 2)))


def filter_function(f_hz, tau_s):
    """Ramsey filter function |sinc(f tau)| (normalised): nulls at f = k / tau."""
    return np.abs(np.sinc(np.asarray(f_hz) * tau_s))
