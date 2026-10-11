"""Walking-skeleton slice: UAV racetrack world on the real tile, DR drift, unchanged TERCOM."""

import numpy as np

from magnav import nav, seeds
from magnav.metrics import position_metrics
from magnav.uav import (
    FLIGHT_DEFAULT,
    TERCOM_PARAMS,
    build_world,
    field_at,
    make_sensors,
    map_error_field,
    perimeter,
    prepare_uav,
    racetrack,
)

CTX_KEYS = {
    "line", "map_file", "sens", "truth", "tile", "n", "jam_idx", "tx", "ty", "fix_xy",
    "dr", "start", "dr_x", "dr_y", "dr_row", "seed_used",
}  # fmt: skip


def _clean_ctx(world):
    rng = seeds.stream(0, "test_noise")
    clean = world.b_true + rng.normal(0.0, 0.3, len(world.t))
    return prepare_uav(world, mag={"clean": clean}), clean


def test_seed_streams_fixed_keys():
    assert seeds.SPAWN_KEYS["motor"] == (1,) and seeds.SPAWN_KEYS["test_noise"] == (9,)
    a = seeds.stream(0, "q1", 256).random(4)
    b = seeds.stream(0, "q1", 256).random(4)
    c = seeds.stream(0, "q1", 64).random(4)
    assert np.array_equal(a, b) and not np.array_equal(a, c)
    # explicit spawn key equals the k-th spawned child (research Pattern 4)
    child = np.random.SeedSequence(0).spawn(4)[3]
    assert np.array_equal(
        np.random.default_rng(child).random(3), seeds.stream(0, "dr").random(3)
    )
    s = seeds.int_seed(0, "dr")
    assert isinstance(s, int) and 0 <= s < 2**63 and s == seeds.int_seed(0, "dr")


def test_ctx_keys(world):
    ctx, _ = _clean_ctx(world)
    assert set(ctx) == CTX_KEYS
    assert ctx["line"] == "uav" and ctx["map_file"] == "data/map_eastern_395.npz"
    assert ctx["n"] == 1800 and ctx["jam_idx"] == 450
    assert ctx["start"] == 450 + TERCOM_PARAMS["window"]
    assert ctx["seed_used"] == seeds.ROOT_SEED
    assert len(ctx["dr_x"]) == ctx["n"] == len(ctx["dr_y"])


def test_flight_geometry(world):
    f = FLIGHT_DEFAULT
    assert len(world.t) == 1800 and f["fs_hz"] == 2.0
    P = perimeter(f)
    assert abs(P - (2 * 18000.0 + np.pi * 3000.0)) < 1e-9
    s = np.linspace(0.0, P, 97)
    x0, y0, _ = racetrack(s, f)
    x1, y1, _ = racetrack(s + P, f)
    assert np.allclose(x0, x1, atol=1e-6) and np.allclose(y0, y1, atol=1e-6)

    speed = np.hypot(np.diff(world.x), np.diff(world.y)) * f["fs_hz"]
    assert np.all(np.abs(speed - 60.0) < 0.01)  # chord vs arc on the turns
    # steps whose two ends lie on the same straight are exact
    sm = (f["v_mps"] * world.t) % P
    L = f["leg_m"]
    half = np.pi * f["sep_m"] / 2.0
    seg = np.where(sm < L, 0, np.where(sm < L + half, 1, np.where(sm < 2 * L + half, 2, 3)))
    straight = (seg[:-1] == seg[1:]) & np.isin(seg[:-1], (0, 2)) & (sm[1:] > sm[:-1])
    assert straight.sum() > 1000
    assert np.all(np.abs(speed[straight] - 60.0) < 1e-6)
    assert np.any(~straight)  # the flight includes turns


def test_path_inside_tile_with_margin(world, tile):
    for dx in (-3000.0, 0.0, 3000.0):
        for dy in (-3000.0, 0.0, 3000.0):
            _, ok = tile.sample(world.x + dx, world.y + dy)
            assert ok.all(), (dx, dy)


def test_field_at_matches_world(world):
    assert np.max(np.abs(field_at(world, world.t) - world.b_true)) < 1e-9
    assert np.allclose(world.b_true, world.igrf + world.crust_map + world.map_err, atol=1e-9)
    # arbitrary (off-grid) times are well defined and smooth
    tq = world.t[:-1] + 0.25
    bq = field_at(world, tq)
    assert np.all(np.isfinite(bq))


def test_map_error_field(world):
    me = world.map_error
    a = map_error_field(world.x, world.y, world.map_err_seed, me["sigma_nT"], me["lmin_m"], me["lmax_m"], me["n_modes"])
    b = map_error_field(world.x, world.y, world.map_err_seed, me["sigma_nT"], me["lmin_m"], me["lmax_m"], me["n_modes"])
    assert np.array_equal(a, b) and np.array_equal(a, world.map_err)
    assert 1.5 < float(np.std(a)) < 5.0
    c = map_error_field(world.x, world.y, world.map_err_seed + 1, me["sigma_nT"], me["lmin_m"], me["lmax_m"], me["n_modes"])
    assert not np.array_equal(a, c)


def test_dr_reproduces_path_without_drift(world):
    sens = make_sensors(world, mag={})
    jam = int(FLIGHT_DEFAULT["jam_fraction"] * len(world.t))
    fix = (float(world.x[jam]), float(world.y[jam]))
    dr = nav.simulate_dr(sens, jam, fix, bias_mps=0.0, rw_sigma=0.0)
    err = np.hypot(dr.x - world.x[jam:], dr.y - world.y[jam:])
    assert err.max() < 1e-6


def test_dr_seed_deterministic(tile):
    w = build_world(tile)
    a = prepare_uav(w, mag={})
    b = prepare_uav(w, mag={})
    c = prepare_uav(w, mag={}, root_seed=1)
    assert np.array_equal(a["dr_x"], b["dr_x"]) and np.array_equal(a["dr_y"], b["dr_y"])
    assert not np.array_equal(a["dr_x"], c["dr_x"])


def test_tercom_runs_end_to_end(world):
    ctx, clean = _clean_ctx(world)
    sens, jam, start = ctx["sens"], ctx["jam_idx"], ctx["start"]
    res = nav.tercom(nav.anomaly_signal(clean, sens), ctx["dr"], jam, ctx["fix_xy"], ctx["tile"], **TERCOM_PARAMS)
    nx = np.concatenate([ctx["tx"][:jam], res.x])
    ny = np.concatenate([ctx["ty"][:jam], res.y])
    nav_m = position_metrics(nx, ny, ctx["tx"], ctx["ty"], start)
    dr_m = ctx["dr_row"]
    assert res.accepted.mean() > 0.5
    assert nav_m["cep50_m"] < dr_m["cep50_m"]
    assert nav_m["cep50_m"] < 300.0
