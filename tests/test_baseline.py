"""Equal-budget classical baseline (QS-02): S readouts per sample, guarded per-block LS
notch on the shared RPM channel, centred block mean. Baseline-only (no quantum estimator)."""

import inspect
import time

import numpy as np

from magnav import baseline, motor, ramsey, seeds

A1_TEST_NT = 1000.0
N_HEAD = 300
DSP_FORBIDDEN = {"truth", "crust", "b_true", "field", "B_k", "world"}


def _motor(A1=A1_TEST_NT):
    return motor.draw_motor(seeds.int_seed(0, "motor"), 900.0, A1)


def _inputs(world, S, n=None, A1=A1_TEST_NT, tones=True, noise=True):
    n = len(world.t) if n is None else n
    p = _motor(A1)
    t = world.t[:n]
    B = world.b_true[:n]
    rpm = motor.rpm_at(p, t)
    tau, _ = ramsey.choose_tau(rpm)
    s1 = ramsey.sigma1(tau, ramsey.C1_DEFAULT) * (1.0 if noise else 0.0)
    t_read, y = baseline.sample_readouts(
        B, t, S, s1, seeds.stream(0, "baseline", S),
        tone_at=(lambda tq: motor.tone_field(p, tq)) if tones else None,
    )  # fmt: skip
    rev = motor.rev_at(p, t_read)
    return p, t, B, tau, s1, t_read, y, rev, rpm / 60.0


def test_readout_times_centred(world):
    S = 64
    _p, t, _B, _tau, _s1, t_read, _y, _rev, _f1 = _inputs(world, S, n=50)
    assert t_read.shape == (50, S)
    assert np.all(t_read >= t[:, None] - 0.25) and np.all(t_read < t[:, None] + 0.25)
    d = np.diff(t_read, axis=1)
    fs_read = 1.0 / d.mean()
    assert np.allclose(d, 0.5 / S)
    assert abs(fs_read - 2 * S) < 1e-6
    assert np.allclose(t_read.mean(axis=1), t)


def test_readout_noise_matches_sigma1(world):
    S = 1024
    _p, _t, B, _tau, s1, _tr, y, _rev, _f1 = _inputs(world, S, n=N_HEAD, tones=False)
    z = (y - B[:, None]) / s1[:, None]
    assert abs(z.std() - 1.0) < 0.02


def test_ls_cancels_tones_exact_rpm(world):
    S = 1024
    _p, _t, B, _tau, _s1, t_read, y, rev, f1 = _inputs(world, S, n=N_HEAD, noise=False)
    bhat, drops = baseline.ls_notch(t_read, y, rev, f1, 2.0 * S)
    assert drops == 0
    assert np.max(np.abs(bhat - B)) / A1_TEST_NT < 1e-9


def test_guard_drops_at_low_S(world):
    S = 64
    _p, _t, B, _tau, s1, t_read, y, rev, f1 = _inputs(world, S, tones=False)
    bhat, drops = baseline.ls_notch(t_read, y, rev, f1, 2.0 * S)
    assert drops > 0
    rmse = np.sqrt(np.mean((bhat - B) ** 2))
    assert rmse / (np.median(s1) / np.sqrt(S)) < 1.5


def test_chunking_invariance(world):
    S = 256
    _p, _t, _B, _tau, _s1, t_read, y, rev, f1 = _inputs(world, S, n=N_HEAD)
    a, da = baseline.ls_notch(t_read, y, rev, f1, 2.0 * S, chunk=7)
    b, db = baseline.ls_notch(t_read, y, rev, f1, 2.0 * S, chunk=200)
    assert da == db
    assert np.max(np.abs(a - b)) < 1e-9


def test_block_mean(world):
    _p, _t, _B, _tau, _s1, t_read, y, rev, f1 = _inputs(world, 64, n=40)
    assert np.array_equal(baseline.block_mean(y), y.mean(axis=1))
    # K = 0, or no RPM channel, reduces the LS notch to the block mean
    for r, f, K in ((rev, f1, 0), (None, None, 4)):
        bhat, drops = baseline.ls_notch(t_read, y, r, f, 128.0, K=K)
        assert drops == 0
        assert np.allclose(bhat, y.mean(axis=1), atol=1e-9)


def test_dsp_signatures_take_no_truth():
    for fn in (baseline.ls_notch, baseline.block_mean):
        names = set(inspect.signature(fn).parameters)
        assert not names & DSP_FORBIDDEN, (fn.__name__, names & DSP_FORBIDDEN)


def test_ls_cost_at_4096(world):
    """PD-6: sample-level baseline over the full flight at the top of the ladder."""
    S = 4096
    t0 = time.perf_counter()
    _p, _t, B, _tau, _s1, t_read, y, rev, f1 = _inputs(world, S)
    bhat, drops = baseline.ls_notch(t_read, y, rev, f1, 2.0 * S)
    dt = time.perf_counter() - t0
    print(f"\n[PD-6] S=4096 sample_readouts + ls_notch over {len(B)} samples: {dt:.2f} s")
    assert drops == 0 and bhat.shape == B.shape
    assert dt < 20.0
