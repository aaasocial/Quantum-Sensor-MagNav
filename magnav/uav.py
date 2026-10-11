"""Synthetic fixed-wing UAV world on the real Eastern_395 tile (pure numpy).

The UAV flies a racetrack (stadium) at constant speed and altitude. The true total field
at the aircraft is IGRF (a fitted plane) + the crustal map value + a smooth seeded
map-error field that the navigator's map does not contain. This module builds `Truth`
(like the sister pipeline.py) and the on-board `Sensors`; estimators never see `Truth`.

Geometry convention: `heading_deg` is the direction of the first straight, in degrees
counter-clockwise from local east (x); the stadium is centred at `centre_m` in the tile's
local frame. Returned headings are compass headings of travel (clockwise from north).
"""

from dataclasses import dataclass

import numpy as np

from magnav import nav, seeds
from magnav.data import MAP_EASTERN, MapTile, Sensors, Truth
from magnav.frames import local_to_ll
from magnav.metrics import position_metrics
from magnav.seeds import ROOT_SEED

FLIGHT_DEFAULT = {
    "n": 1800,
    "fs_hz": 2.0,
    "v_mps": 60.0,
    "alt_m": 400.0,
    "path": "racetrack",
    "centre_m": [0.0, 0.0],
    "heading_deg": 30.0,
    "leg_m": 18000.0,
    "sep_m": 3000.0,
    "jam_fraction": 0.25,
}
INS_DEFAULT = {"bias_mps": 1.5, "rw_sigma": 0.1}  # UAV-grade drift (01-RESEARCH Check 7)
MAP_ERROR_DEFAULT = {"sigma_nT": 3.0, "lmin_m": 1000.0, "lmax_m": 6000.0, "n_modes": 48}
# lstsq of the SGL 1003.02 igrf channel against local (x, y) in the Eastern_395 frame (RMS 0.22 nT)
IGRF_PLANE = {"c0_nT": 53615.07, "cx_nT_per_m": -0.001765, "cy_nT_per_m": 0.003860}
TERCOM_PARAMS = {
    "window": 120,
    "stride": 20,
    "half_width_m": 1500.0,
    "step_m": 60.0,
    "gate": 0.85,
    "median": 3,
}  # unchanged from the sister project


def perimeter(flight: dict = FLIGHT_DEFAULT) -> float:
    """Racetrack length: two straights plus two semicircles of radius sep_m / 2."""
    return 2.0 * float(flight["leg_m"]) + np.pi * float(flight["sep_m"])


def racetrack(s_m, flight: dict = FLIGHT_DEFAULT):
    """Position (x, y) and compass heading (rad) at arc length s_m along the racetrack.

    Segments in order: straight 0 (+u, at v = -r), semicircle around (+L/2, 0) turning left,
    straight 2 (-u, at v = +r), semicircle around (-L/2, 0). Starts at the beginning of
    straight 0; arc length wraps modulo the perimeter.
    """
    L = float(flight["leg_m"])
    r = float(flight["sep_m"]) / 2.0
    half = np.pi * r
    s = np.mod(np.asarray(s_m, dtype=np.float64), perimeter(flight))
    u = np.empty_like(s)
    v = np.empty_like(s)
    du = np.empty_like(s)
    dv = np.empty_like(s)

    m0 = s < L
    m1 = (s >= L) & (s < L + half)
    m2 = (s >= L + half) & (s < 2 * L + half)
    m3 = s >= 2 * L + half

    u[m0], v[m0], du[m0], dv[m0] = -L / 2 + s[m0], -r, 1.0, 0.0
    a = (s[m1] - L) / r  # angle swept on the first turn
    u[m1], v[m1] = L / 2 + r * np.sin(a), -r * np.cos(a)
    du[m1], dv[m1] = np.cos(a), np.sin(a)
    u[m2], v[m2], du[m2], dv[m2] = L / 2 - (s[m2] - L - half), r, -1.0, 0.0
    b = (s[m3] - 2 * L - half) / r
    u[m3], v[m3] = -L / 2 - r * np.sin(b), r * np.cos(b)
    du[m3], dv[m3] = -np.cos(b), -np.sin(b)

    h = np.deg2rad(float(flight["heading_deg"]))
    ch, sh = np.cos(h), np.sin(h)
    cx, cy = float(flight["centre_m"][0]), float(flight["centre_m"][1])
    x = cx + ch * u - sh * v
    y = cy + sh * u + ch * v
    ve = ch * du - sh * dv
    vn = sh * du + ch * dv
    heading = np.mod(np.arctan2(ve, vn), 2.0 * np.pi)
    return x, y, heading


def igrf_plane(x, y, plane: dict = IGRF_PLANE):
    """IGRF main field as a plane in the local frame (nT)."""
    x = np.asarray(x, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    return plane["c0_nT"] + plane["cx_nT_per_m"] * x + plane["cy_nT_per_m"] * y


def map_error_field(x, y, seed, sigma_nT=3.0, lmin_m=1000.0, lmax_m=6000.0, n_modes=48):
    """Smooth seeded field the map does not contain: sum of cosines, log-uniform wavelengths."""
    x = np.atleast_1d(np.asarray(x, dtype=np.float64))
    y = np.atleast_1d(np.asarray(y, dtype=np.float64))
    n_modes = int(n_modes)
    rng = np.random.default_rng(seed)
    lam = np.exp(rng.uniform(np.log(lmin_m), np.log(lmax_m), n_modes))
    th, ph = rng.uniform(0, 2 * np.pi, n_modes), rng.uniform(0, 2 * np.pi, n_modes)
    kx, ky = 2 * np.pi / lam * np.cos(th), 2 * np.pi / lam * np.sin(th)
    return sigma_nT * np.cos(np.outer(x, kx) + np.outer(y, ky) + ph).sum(1) / np.sqrt(n_modes / 2)


@dataclass(frozen=True)
class World:
    """Ground truth of one UAV flight; b_true = igrf + crust_map + map_err (nT)."""

    t: np.ndarray
    x: np.ndarray
    y: np.ndarray
    heading: np.ndarray
    crust_map: np.ndarray
    map_err: np.ndarray
    igrf: np.ndarray
    b_true: np.ndarray
    flight: dict
    map_error: dict
    map_err_seed: int
    tile: MapTile


def _field_xy(tile: MapTile, x, y, map_error: dict, map_err_seed: int):
    crust, ok = tile.sample(x, y)
    if not np.all(ok):
        raise ValueError("UAV path leaves the valid cells of the map tile")
    me = map_error_field(x, y, map_err_seed, map_error["sigma_nT"], map_error["lmin_m"],
                         map_error["lmax_m"], map_error["n_modes"])  # fmt: skip
    ig = igrf_plane(x, y)
    return crust, me, ig


def build_world(
    tile: MapTile,
    flight: dict = FLIGHT_DEFAULT,
    map_error: dict = MAP_ERROR_DEFAULT,
    root_seed: int = ROOT_SEED,
) -> World:
    """Fly the racetrack over the tile at 2 Hz and record the true total field."""
    n = int(flight["n"])
    fs = float(flight["fs_hz"])
    t = np.arange(n) / fs
    x, y, heading = racetrack(float(flight["v_mps"]) * t, flight)
    map_err_seed = seeds.int_seed(root_seed, "map_err")
    crust, me, ig = _field_xy(tile, x, y, map_error, map_err_seed)
    return World(
        t=t,
        x=x,
        y=y,
        heading=heading,
        crust_map=crust,
        map_err=me,
        igrf=ig,
        b_true=ig + crust + me,
        flight=dict(flight),
        map_error=dict(map_error),
        map_err_seed=map_err_seed,
        tile=tile,
    )


def field_at(world: World, t_query) -> np.ndarray:
    """True total field (nT) at arbitrary times, from the exact racetrack geometry."""
    tq = np.atleast_1d(np.asarray(t_query, dtype=np.float64))
    x, y, _ = racetrack(float(world.flight["v_mps"]) * tq, world.flight)
    crust, me, ig = _field_xy(world.tile, x, y, world.map_error, world.map_err_seed)
    return ig + crust + me


def servo_seed(world: World, idx: int = 0) -> float:
    """Ramsey servo seed: IGRF plane + the navigator's map value at the GPS position of sample idx.

    Uses only the GPS position and the navigator's map (crust only, no map-error term), never the
    true field: this is the frozen servo.seed "IGRF plane + map value at the GPS fix". The
    pipeline seeds once at the first GPS fix of the flight (idx 0; planner deviation PR-1).
    """
    x = np.atleast_1d(np.asarray(world.x[idx], dtype=np.float64))
    y = np.atleast_1d(np.asarray(world.y[idx], dtype=np.float64))
    val, ok = world.tile.sample(x, y)
    if not np.all(ok):
        raise ValueError("GPS fix lies outside the valid cells of the map tile")
    return float(igrf_plane(x, y)[0] + val[0])


def make_truth(world: World) -> Truth:
    """GPS truth for scoring; UTM is not defined for the synthetic flight (NaN)."""
    lat, lon = local_to_ll(world.x, world.y, world.tile.frame)
    nan = np.full(len(world.t), np.nan)
    return Truth(
        t=world.t.copy(),
        mag_1_c=world.b_true.copy(),
        mag_1_igrf=world.b_true - world.igrf,
        lat=lat,
        lon=lon,
        utm_x=nan.copy(),
        utm_y=nan.copy(),
        utm_z=nan.copy(),
    )


def make_sensors(world: World, mag: dict, cur: dict | None = None) -> Sensors:
    """On-board sensors: magnetometer channels, forward-difference INS velocities, IGRF model.

    Forward differences (last sample 0) make nav.simulate_dr reproduce the true path exactly
    when bias and random walk are zero. ins_vw is the WEST velocity (sister dataset convention).
    """
    fs = float(world.flight["fs_hz"])
    n = len(world.t)
    vn = np.zeros(n)
    vw = np.zeros(n)
    vn[:-1] = np.diff(world.y) * fs
    vw[:-1] = -np.diff(world.x) * fs
    zeros = np.zeros(n)
    return Sensors(
        t=world.t.copy(),
        fs=fs,
        line="uav",
        mag=dict(mag),
        flux={},
        cur=dict(cur or {}),
        ins_pitch=zeros.copy(),
        ins_roll=zeros.copy(),
        ins_yaw=np.mod(np.rad2deg(world.heading), 360.0),
        ins_vn=vn,
        ins_vw=vw,
        ins_vu=zeros.copy(),
        igrf=world.igrf.copy(),
        diurnal=zeros.copy(),
    )


def prepare_uav(
    world: World,
    mag: dict,
    cur: dict | None = None,
    ins: dict = INS_DEFAULT,
    root_seed: int = ROOT_SEED,
    window: int = TERCOM_PARAMS["window"],
) -> dict:
    """Jam GPS, dead-reckon with UAV-grade drift and score DR; same 16 ctx keys as the sister prepare_line."""
    sens = make_sensors(world, mag, cur)
    truth = make_truth(world)
    n = sens.n
    jam_idx = int(float(world.flight["jam_fraction"]) * n)
    tx, ty = world.x.copy(), world.y.copy()
    fix_xy = (float(tx[jam_idx]), float(ty[jam_idx]))  # last GPS fix before the jam
    dr = nav.simulate_dr(
        sens,
        jam_idx,
        fix_xy,
        seed=seeds.int_seed(root_seed, "dr"),
        bias_mps=ins["bias_mps"],
        rw_sigma=ins["rw_sigma"],
    )
    start = jam_idx + int(window)
    if start >= n:
        raise ValueError(f"UAV flight of {n} samples is too short (jam {jam_idx} + window {window})")
    dr_x = np.concatenate([tx[:jam_idx], dr.x])
    dr_y = np.concatenate([ty[:jam_idx], dr.y])
    dr_row = {"line": "uav", "sensor": "-", "denoiser": "dead_reckoning",
              "signal_err_std_nT": None, "signal_rmse_nT": None,
              "accepted": None, "windows": None}  # fmt: skip
    dr_row.update(position_metrics(dr_x, dr_y, tx, ty, start))
    return {
        "line": "uav",
        "map_file": MAP_EASTERN,
        "sens": sens,
        "truth": truth,
        "tile": world.tile,
        "n": n,
        "jam_idx": jam_idx,
        "tx": tx,
        "ty": ty,
        "fix_xy": fix_xy,
        "dr": dr,
        "start": start,
        "dr_x": dr_x,
        "dr_y": dr_y,
        "dr_row": dr_row,
        "seed_used": int(root_seed),
    }
