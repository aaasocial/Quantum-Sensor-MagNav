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


# --- WR-05: rank safety at harmonic alias collisions (frozen A1 from the model JSON) ---

import dataclasses  # noqa: E402

GUARD = baseline.GUARD_HZ


def _frozen_A1():
    from magnav import uav_pipeline

    return float(uav_pipeline.load_model()["tone_amplitude_rule"]["A1_nT"])


def _const_blocks(rpm, S, tones=True, noise=True, n=40):
    A1 = _frozen_A1()
    p0 = _motor(A1)
    p = dataclasses.replace(p0, rpm_knots=tuple(float(rpm) for _ in p0.rpm_knots))
    t = 10.0 + 0.5 * np.arange(n)
    B = np.full(n, 54000.0)
    r = motor.rpm_at(p, t)
    tau, _ = ramsey.choose_tau(r)
    s1_true = ramsey.sigma1(tau, ramsey.C1_DEFAULT)
    s1 = s1_true * (1.0 if noise else 0.0)
    t_read, y = baseline.sample_readouts(
        B, t, S, s1, seeds.stream(0, "baseline", S),
        tone_at=(lambda tq: motor.tone_field(p, tq)) if tones else None,
    )  # fmt: skip
    rev = motor.rev_at(p, t_read)
    floor = float(np.median(s1_true)) / np.sqrt(S)
    return t_read, y, rev, r / 60.0, B, floor, A1


def _check_block_set(rpm, S, expect_drops=0):
    t_read, y, rev, f1, B, floor, A1 = _const_blocks(rpm, S)
    bhat, drops = baseline.ls_notch(t_read, y, rev, f1, 2.0 * S)
    assert np.all(np.isfinite(bhat)), rpm
    assert drops == expect_drops, (rpm, drops)
    err = bhat - B
    rmse = np.sqrt(np.mean(err**2))
    assert rmse < 1.5 * floor, (rpm, rmse, floor)
    assert np.max(np.abs(err)) < 5 * floor, (rpm, np.max(np.abs(err)), floor)
    t_read, y, rev, f1, B, _floor, A1 = _const_blocks(rpm, S, noise=False)
    bhat0, _ = baseline.ls_notch(t_read, y, rev, f1, 2.0 * S)
    assert np.all(np.isfinite(bhat0))
    assert np.max(np.abs(bhat0 - B)) < 1e-9 * A1, (rpm, np.max(np.abs(bhat0 - B)))
    return rmse, floor


def test_ls_exact_harmonic_collision_6144_S256():
    S = 256
    t_read, _y, rev, _f1, _B, _floor, _A1 = _const_blocks(6144, S, n=1)
    cols = [np.ones(S)]
    for k in range(1, 5):
        cols += [np.cos(2 * np.pi * k * rev[0]), np.sin(2 * np.pi * k * rev[0])]
    # 1<->4 and 2<->3 alias together; rev ~ 1e3 leaves ~1e-12 round-off, hence rtol
    assert np.linalg.matrix_rank(np.stack(cols, -1), rtol=1e-8) <= 7
    rmse, floor = _check_block_set(6144, S)
    print(f"\n[WR-05] 6144 RPM S=256: RMSE {rmse:.4f} nT, floor {floor:.4f} nT")


def test_ls_near_collision_sweep_S256():
    out = []
    for rpm in range(6100, 6205, 5):
        rmse, floor = _check_block_set(rpm, 256)
        out.append(rmse / floor)
    print(f"\n[WR-05] 6100-6200 sweep S=256: RMSE/floor {min(out):.3f}..{max(out):.3f}")


def test_ls_collision_S64_4604():
    rmse, floor = _check_block_set(4604, 64)
    print(f"\n[WR-05] 4604 RPM S=64: RMSE {rmse:.4f} nT, floor {floor:.4f} nT")


def test_ls_nyquist_and_singular_blocks():
    rmse, floor = _check_block_set(4800, 64)  # k = 4 exactly at Nyquist (64 Hz)
    print(f"\n[WR-05] 4800 RPM S=64: RMSE {rmse:.4f} nT, floor {floor:.4f} nT")
    # 3840 RPM at S = 64 (fs = 128): k = 1, 3 at Nyquist, k = 2, 4 at DC (old solve raised
    # LinAlgError); only the two DC aliases are dropped per block
    n = 40
    t_read, y, rev, f1, _B, _floor, _A1 = _const_blocks(3840, 64, n=n)
    bhat, drops = baseline.ls_notch(t_read, y, rev, f1, 128.0)
    assert np.all(np.isfinite(bhat))
    assert drops == 2 * n


def test_ls_rank_safe_across_prior():
    A1 = _frozen_A1()
    p = _motor(A1)
    rpm = np.arange(4500.0, 9001.0, 1.0)
    f1 = rpm / 60.0
    for S in (64, 256):
        fs = 2.0 * S
        t_read = np.broadcast_to((np.arange(S) + 0.5) * 0.5 / S, (len(rpm), S))
        rev = f1[:, None] * t_read
        y = np.full(rev.shape, 54000.0)
        for k in range(1, 5):
            y = y + p.amps_nT[k - 1] * np.cos(2 * np.pi * k * rev + p.phases[k - 1])
        bhat, drops = baseline.ls_notch(t_read, y, rev, f1, fs)
        assert np.all(np.isfinite(bhat))
        dc = np.zeros(len(rpm), dtype=bool)
        for k in range(1, 5):
            dc |= np.abs(((k * f1 + fs / 2) % fs) - fs / 2) < GUARD
        err = np.abs(bhat - 54000.0)[~dc]
        print(f"\n[WR-05] prior grid S={S}: {dc.sum()} DC-dropped rows, max err {err.max():.3e} nT")
        assert err.max() < 1e-6 * A1
