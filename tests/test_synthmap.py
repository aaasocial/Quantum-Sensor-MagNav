"""Synthetic 100 m crustal map (SCN-01): shipped npz layout, label, byte-level regeneration,
and the unchanged TERCOM flying the Phase 1 racetrack at 100 m on it with a clean signal.

No quantum sensor or baseline runs on the synthetic tile in this file (plan 01.1-01)."""

import hashlib
import json
from pathlib import Path

import numpy as np
import pytest

from magnav import nav, seeds, synthmap
from magnav.data import MAP_EASTERN, load_map
from magnav.synthmap import SYNTH_MAP
from magnav.uav import TERCOM_PARAMS, prepare_uav

ROOT = Path(__file__).resolve().parents[1]
SYNTH_REL = "data/map_synth_100m.npz"


def _prov_entry() -> dict:
    prov = json.loads((ROOT / "data/provenance.json").read_text(encoding="utf-8"))
    return prov["files"][SYNTH_REL]


@pytest.fixture(scope="module")
def fields():
    return synthmap.build_fields()


def test_npz_layout(tile, synth_tile):
    p = ROOT / SYNTH_REL
    assert p.exists() and p.stat().st_size < 2_000_000
    with np.load(p, allow_pickle=False) as z:
        assert set(z.files) == {"alt", "map", "mask", "xx", "yy"}
        M, mask, xx, yy = z["map"], z["mask"], z["xx"], z["yy"]
        assert M.dtype == np.float32 and M.shape == (481, 601)
        assert mask.dtype == np.bool_ and mask.all()
        assert np.all(np.diff(xx) > 0) and np.all(np.diff(yy) > 0)
        assert float(z["alt"]) == 100.0
    st = synth_tile
    assert abs(st.dx - 50.0) < 1e-6 and abs(st.dy - 50.0) < 1e-6
    assert abs(st.frame.lat0 - tile.frame.lat0) < 1e-9
    assert abs(st.frame.lon0 - tile.frame.lon0) < 1e-9
    assert abs(st.gx[0] + 15000.0) < 1.0 and abs(st.gx[-1] - 15000.0) < 1.0
    assert abs(st.gy[0] + 12000.0) < 1.0 and abs(st.gy[-1] - 12000.0) < 1.0


def test_synthetic_label():
    assert synthmap.SYNTH_LABEL == "synthetic map (sensitivity study), not survey data"
    assert _prov_entry()["label"] == synthmap.SYNTH_LABEL
    assert _prov_entry()["kind"] == "synthetic_map"
    assert synthmap.SYNTH_LABEL in synthmap.SYNTH_CAPTION


def test_regenerates_shipped_map(fields):
    with np.load(ROOT / SYNTH_REL, allow_pickle=False) as z:
        M = np.array(z["map"])
    diff = float(np.max(np.abs(fields["crop"].astype(np.float64) - M)))
    print(f"\n[synthmap] regenerated crop max abs diff {diff:.2e} nT")
    assert diff < 1e-3
    sha = hashlib.sha256((ROOT / SYNTH_REL).read_bytes()).hexdigest()
    assert sha == _prov_entry()["output_sha256"]
    assert SYNTH_MAP == SYNTH_REL


def test_flight_100m_tercom_clean(world_100m):
    w = world_100m
    assert w.tile.name == "map_synth_100m"
    clean = w.b_true + seeds.stream(0, "test_noise").normal(0.0, 0.3, len(w.t))
    ctx = prepare_uav(w, mag={"clean": clean})
    sig = nav.anomaly_signal(clean, ctx["sens"])
    res = nav.tercom(sig, ctx["dr"], ctx["jam_idx"], ctx["fix_xy"], ctx["tile"], **TERCOM_PARAMS)
    a, nw = int(res.accepted.sum()), len(res.accepted)
    ncc = np.asarray(res.ncc)[np.isfinite(res.ncc)]
    print(f"\n[tercom clean 100m] accepted {a}/{nw}, NCC median {np.median(ncc):.3f}, min {ncc.min():.3f}")
    assert a >= 0.9 * nw


def test_fit_source_is_eastern():
    sha = hashlib.sha256((ROOT / MAP_EASTERN).read_bytes()).hexdigest()
    assert _prov_entry()["fit_source_sha256"] == sha
    assert load_map(MAP_EASTERN).name == "map_eastern_395"


# ---- Scientific validation (SCN-01). The "400 m" in ROADMAP SC1 is the real flight altitude;
# calibration and the RMS test use 395 m, the Eastern tile's stored altitude (npz key alt),
# because that is the height the real tile's spectrum and std actually describe.


@pytest.fixture(scope="module")
def real_spectrum(tile):
    return synthmap.radial_spectrum(tile.M, tile.dx)


def _syn_395_calib(fields):
    return fields["scale"] * fields["fields"][fields["h_fit_m"]][synthmap.calib_slice()]


def test_beta_fit_real_tile(real_spectrum):
    beta, resid = synthmap.fit_beta(*real_spectrum, 395.0, (600, 10000))
    print(f"\n[synthmap] beta fitted on Eastern_395 {beta:.4f} (residual RMS {resid:.3f} ln units)")
    assert abs(beta - _prov_entry()["beta"]) < 1e-6
    assert 1.80 <= beta <= 1.90


def test_beta_recovered_on_synthetic(fields):
    Z = _syn_395_calib(fields)
    assert Z.shape == (840, 768)
    k, P = synthmap.radial_spectrum(Z, synthmap.PARAMS["cell_m"])
    beta_hat, _ = synthmap.fit_beta(k, P, 395.0, (600, 10000))
    print(f"\n[synthmap] beta_hat {beta_hat:.3f} vs {fields['beta']:.3f}")
    assert abs(beta_hat - fields["beta"]) <= 0.2


def _band_power(Z, d, edges):
    """Per-bin mean power density (P * cell area) on shared radial bin edges (research d_cal.py)."""
    ny, nx = Z.shape
    Z = Z - Z.mean()
    W = np.outer(np.hanning(ny), np.hanning(nx))
    P = np.abs(np.fft.fft2(Z * W)) ** 2 / (W**2).sum() * d * d
    K = np.hypot(*np.meshgrid(2 * np.pi * np.fft.fftfreq(nx, d), 2 * np.pi * np.fft.fftfreq(ny, d)))
    idx = np.digitize(K.ravel(), edges)
    return np.array([P.ravel()[idx == b].mean() for b in range(1, len(edges))])


def test_rms_400m_matches_real(tile, fields):
    """Named for the ROADMAP's 400 m flight; it calibrates and tests at 395 m, the tile's stored alt.

    Independent cross-check (the estimator of 01.1-RESEARCH (b), scratch d_cal.py): power density
    P * d^2 on 12 shared log-spaced radial bins spanning 600-10,000 m for the real tile and for the
    RMS-calibrated synthetic 395 m field over the calibration region; the amplitude ratio is
    sqrt(exp(mean ln(P_syn / P_real))) and must lie in [0.85, 1.15]. Measured 0.993 for the derived
    seed. The ln-domain mean is used because the slope fit itself is in ln P; an arithmetic mean
    over the same bins gives 1.137 (dominated by the noisiest long-wavelength bins)."""
    Z = _syn_395_calib(fields)
    std_syn, std_real = float(np.std(Z)), float(np.std(tile.M))
    print(f"\n[synthmap] std 395 m calib {std_syn:.2f} vs real {std_real:.2f} nT")
    assert abs(std_real - 318.64) < 0.01
    assert abs(std_syn / std_real - 1.0) < 0.01
    edges = np.sort(2 * np.pi / np.geomspace(10000.0, 600.0, 13))
    Pr = _band_power(tile.M, tile.dx, edges)
    Ps = _band_power(Z, synthmap.PARAMS["cell_m"], edges)
    assert np.all(np.isfinite(Pr)) and np.all(np.isfinite(Ps))
    ratio = float(np.sqrt(np.exp(np.mean(np.log(Ps) - np.log(Pr)))))
    arith = float(np.sqrt(Ps.mean() / Pr.mean()))
    print(f"[synthmap] band-power ratio {ratio:.3f} (ln-mean, 12 bins; arithmetic {arith:.3f})")
    assert 0.85 <= ratio <= 1.15


def test_fine_scale_power(fields):
    N, d = synthmap.PARAMS["N"], synthmap.PARAMS["cell_m"]
    F = fields["fields"]
    S395, S100 = np.fft.rfft2(F[395.0]), np.fft.rfft2(F[100.0])
    K = np.hypot(2 * np.pi * np.fft.fftfreq(N, d)[:, None], 2 * np.pi * np.fft.rfftfreq(N, d)[None, :])
    fine = K > 2 * np.pi / 1000.0
    ratio = float((np.abs(S100[fine]) ** 2).sum() / (np.abs(S395[fine]) ** 2).sum())
    print(f"\n[synthmap] fine-scale (< 1 km) power ratio 100 m / 395 m {ratio:.1f}")
    assert ratio >= 50.0
    mode = abs(S395[3, 5] / S100[3, 5])  # continuation 100 m -> 395 m attenuates by exp(-K * 295)
    print(f"[synthmap] mode (3, 5) |F395 / F100| {mode:.12f} vs exp(-K 295) {np.exp(-K[3, 5] * 295.0):.12f}")
    assert abs(mode / np.exp(-K[3, 5] * 295.0) - 1.0) < 1e-9


def test_seed_derived_not_in_spawn_keys():
    seed = int(np.random.SeedSequence(0, spawn_key=(10,)).generate_state(1, dtype=np.uint64)[0] >> np.uint64(1))
    e = _prov_entry()
    assert synthmap.map_seed() == seed == e["seed"] == 525034912271016516
    assert e["seed_str"] == str(seed)
    assert "synthmap" not in seeds.SPAWN_KEYS
    assert (10,) not in seeds.SPAWN_KEYS.values()


def test_generation_fast(fields):
    """Algorithmic-regression guard (an N or cell_m change), not a timing benchmark.

    Measured: one 1024 x 1024 rfft2 plus two irfft2 take about 32 ms in CPython (2026-10-11, M-series
    laptop) against the 700 ms CPython budget recorded for the Pyodide in-page target, which this test
    cannot establish. The asserted bound is deliberately generous (5 s) so scheduler noise on a loaded
    machine never fails it (review WR-03); the measured figure is printed for the record."""
    import time

    t0 = time.perf_counter()
    synthmap.generate_fields(synthmap.map_seed(), 1024, 50.0, fields["beta"], (395.0, 100.0))
    dt = time.perf_counter() - t0
    print(f"\n[synthmap] generation {dt * 1000:.0f} ms (measured 32 ms; budget 700 ms CPython; bound 5 s)")
    assert dt < 5.0
