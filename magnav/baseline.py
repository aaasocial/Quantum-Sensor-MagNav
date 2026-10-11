"""Equal-budget classical baseline magnetometer (QS-02, pure numpy).

Per navigation sample k the baseline takes S readouts evenly spaced over the centred block
[t_k - 0.25 s, t_k + 0.25 s) (read rate 2*S Hz). One readout has the noise of one Ramsey shot
at the interrogation time the quantum sensor uses for that sample, sigma1_k =
1/(2*pi*gamma*tau_k*c1) (PD-5), and the crust is frozen at its value at t_k for the whole
block (disclosed approximation, the same one the quantum sensor makes).

World side: `sample_readouts` is the physical magnetometer and the only function here that
sees the field. DSP side: `ls_notch` and `block_mean` receive readouts and the shared RPM
channel only.

Baseline output for sample k uses readouts in [t_k - 0.25 s, t_k + 0.25 s); block-local, so
no phase delay, no zero-phase two-pass filtering and no comb filter; S readouts are simulated
per sample (PD-6).

LS notch: per block, least squares on [1, cos(2 pi k rev), sin(2 pi k rev)], k = 1..K, with
rev the integrated shaft revolutions from the RPM channel. Guard (01-RESEARCH Pitfall 6): a
harmonic whose alias at the read rate falls within `guard_hz` of DC is collinear with the DC
column, so its cos/sin pair is dropped for that block (counted in provenance). Blocks are
solved in chunks so the design tensor stays small at S = 4096.
"""

from __future__ import annotations

import numpy as np

BLOCK_S = 0.5
GUARD_HZ = 3.0  # = 1.5 * fs_nav at 2 Hz
CHUNK = 200


def sample_readouts(B_k, t_k, shots, sigma1_k, rng, tone_at=None, block_s=BLOCK_S):
    """World side: S noisy readouts per navigation sample (crust frozen at B_k per block).

    Returns (t_read, y), both of shape (n, S).
    """
    B_k = np.asarray(B_k, dtype=np.float64)
    t_k = np.asarray(t_k, dtype=np.float64)
    S = int(shots)
    t_read = t_k[:, None] - block_s / 2 + (np.arange(S) + 0.5) * block_s / S
    s1 = np.broadcast_to(np.asarray(sigma1_k, dtype=np.float64), t_k.shape)
    y = B_k[:, None] + s1[:, None] * rng.standard_normal(t_read.shape)
    if tone_at is not None:
        y = y + tone_at(t_read)
    return t_read, y


def block_mean(y):
    """Low-pass variant: centred block mean of the S readouts."""
    return np.asarray(y, dtype=np.float64).mean(axis=1)


def ls_notch(t_read, y, rev_read, f1_k, fs_read, K=4, fs_nav=2.0, guard_hz=None, chunk=CHUNK):
    """Guarded per-block least-squares harmonic notch on the RPM channel.

    t_read, y, rev_read: (n, S) readout times, readouts and shaft revolutions; f1_k: (n,)
    fundamental (RPM / 60) per block; fs_read: read rate. guard_hz defaults to 1.5 * fs_nav.
    Returns (bhat, n_drops): the DC coefficient per block and the number of dropped
    harmonic-blocks. K = 0 or rev_read None reduces to the block mean.
    """
    y = np.asarray(y, dtype=np.float64)
    n, S = y.shape
    assert np.shape(t_read) == (n, S)
    mu = y.mean(axis=1)
    if K == 0 or rev_read is None:
        return mu, 0
    guard = 1.5 * fs_nav if guard_hz is None else float(guard_hz)
    rev = np.asarray(rev_read, dtype=np.float64)
    f1 = np.broadcast_to(np.asarray(f1_k, dtype=np.float64), (n,))
    fs = np.broadcast_to(np.asarray(fs_read, dtype=np.float64), (n,))
    keep = np.ones((n, 2 * K + 1), dtype=bool)
    for k in range(1, K + 1):
        fa = np.abs(((k * f1 + fs / 2) % fs) - fs / 2)
        bad = fa < guard
        keep[bad, 2 * k - 1] = False
        keep[bad, 2 * k] = False
    eye = np.eye(2 * K + 1)
    out = np.empty(n)
    yc = y - mu[:, None]  # centring only shifts the DC coefficient (better conditioning)
    for a in range(0, n, int(chunk)):
        b = min(a + int(chunk), n)
        r = rev[a:b]
        cols = [np.ones_like(r)]
        for k in range(1, K + 1):
            cols += [np.cos(2 * np.pi * k * r), np.sin(2 * np.pi * k * r)]
        X = np.stack(cols, -1) * keep[a:b, None, :]
        A = np.einsum("nsi,nsj->nij", X, X) + (~keep[a:b])[:, :, None] * eye
        rhs = np.einsum("nsi,ns->ni", X, yc[a:b])
        out[a:b] = np.linalg.solve(A, rhs[..., None])[:, 0, 0]
    return mu + out, int((~keep[:, 1::2]).sum())
