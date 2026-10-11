"""Local frame and TERCOM tests on synthetic tiles (lifted subset; UAV DR tests live in test_uav.py)."""

import numpy as np
from scipy.ndimage import gaussian_filter

from magnav.data import MapTile, Sensors
from magnav.frames import Frame, ll_to_local, local_to_ll
from magnav.nav import DRResult, tercom, tercom_steps

TRUTH_ONLY = ("mag_1_c", "mag_1_igrf", "lat", "lon", "utm_x", "utm_y", "utm_z")


def test_frame_round_trip():
    f = Frame(45.0, -76.0)
    lat, lon = local_to_ll(*ll_to_local([44.9, 45.2], [-76.3, -75.8], f), f)
    assert np.allclose(lat, [44.9, 45.2]) and np.allclose(lon, [-76.3, -75.8])


# ---------- synthetic TERCOM ----------

CELL = 60.0
N = 420  # samples along a straight eastward track
SPEED = 34.0  # m per sample (68 m/s at 2 Hz)
Y_TRUE = 4000.0


def _tile(valid=None, seed=0) -> MapTile:
    rng = np.random.default_rng(seed)
    nx, ny = 300, 140  # 18 km x 8.4 km
    M = gaussian_filter(rng.normal(size=(ny, nx)), 5.0)
    M *= 300.0 / M.std()
    gx = np.arange(nx) * CELL
    gy = np.arange(ny) * CELL
    V = np.ones((ny, nx), bool) if valid is None else valid(gx, gy)
    return MapTile("synthetic", Frame(0.0, 0.0), gx, gy, CELL, CELL, nx, ny, M, V, gx, gy)


def _truth_track():
    x = 1500.0 + SPEED * np.arange(N)
    return x, np.full(N, Y_TRUE)


def _dr(x, y, dx=700.0, dy=0.0):
    return DRResult(x=x + dx, y=y + dy, bias_mps=0.0, bias_signs=[1, 1], rw_sigma=0.0, seed=0)


def test_tercom_planted_offset():
    tile = _tile()
    tx, ty = _truth_track()
    sig, ok = tile.sample(tx, ty)
    assert ok.all()
    dr = _dr(tx, ty)
    nav = tercom(sig, dr, 0, (dr.x[0], dr.y[0]), tile)
    assert nav.accepted.any()
    first = int(np.argmax(nav.accepted))
    start = nav.window_end[first] - 1
    err = np.hypot(nav.x[start:] - tx[start:], nav.y[start:] - ty[start:])
    assert err.max() <= CELL


def _planted():
    tile = _tile()
    tx, ty = _truth_track()
    sig, _ = tile.sample(tx, ty)
    dr = _dr(tx, ty)
    return sig, dr, 0, (dr.x[0], dr.y[0]), tile


def _drain(gen):
    yields = []
    while True:
        try:
            yields.append(next(gen))
        except StopIteration as stop:
            return yields, stop.value


def test_tercom_steps_matches_tercom():
    args = _planted()
    _, res = _drain(tercom_steps(*args))
    ref = tercom(*args)
    for f in ("x", "y", "window_end", "ncc", "accepted", "est_x", "est_y"):
        assert np.array_equal(getattr(res, f), getattr(ref, f)), f


def test_tercom_steps_yield_count():
    yields, res = _drain(tercom_steps(*_planted()))
    assert len(res.window_end) > 0
    assert yields == list(range(1, len(res.window_end) + 1))


def test_tercom_never_uses_invalid_cells():
    def band(gx, gy):
        V = np.ones((len(gy), len(gx)), bool)
        V[np.abs(gy - Y_TRUE) <= 300.0, :] = False
        return V

    tile = _tile(valid=band)
    clean = _tile()
    tx, ty = _truth_track()
    sig, _ = clean.sample(tx, ty)  # signal from the real field, map band masked
    dr = _dr(tx, ty)
    nav = tercom(sig, dr, 0, (dr.x[0], dr.y[0]), tile)
    for k in np.flatnonzero(nav.accepted):
        e = nav.window_end[k]
        rx = dr.x[e - 120 : e] - dr.x[e - 1]
        ry = dr.y[e - 120 : e] - dr.y[e - 1]
        _, ok = tile.sample(nav.est_x[k] + rx, nav.est_y[k] + ry)
        assert ok.all(), k
        assert abs(nav.est_y[k] - Y_TRUE) > 300.0


def test_tercom_gate_coasts():
    tile = _tile()
    tx, ty = _truth_track()
    sig = np.random.default_rng(5).normal(0.0, 100.0, N)
    dr = _dr(tx, ty)
    fix = (dr.x[0] - 200.0, dr.y[0] + 100.0)
    nav = tercom(sig, dr, 0, fix, tile)
    assert len(nav.window_end) > 0
    assert not nav.accepted.any()
    assert np.allclose(nav.x[nav.window_end[0] - 1 :], dr.x[nav.window_end[0] - 1 :] - 200.0)
    assert np.allclose(nav.y[nav.window_end[0] - 1 :], dr.y[nav.window_end[0] - 1 :] + 100.0)


def test_sensors_type_has_no_truth_fields():
    fields = set(Sensors.__dataclass_fields__)
    assert not fields & set(TRUTH_ONLY)
