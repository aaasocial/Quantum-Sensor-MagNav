"""Loaders for the shipped Eastern_395 map crop (MagNav.jl) and the Sensors/Truth types.

Qollab preloads a data file only if its path appears as a literal string in the Python
code, so every path below is a literal constant and callers pass these constants.

The SGL flight-line loaders of the sister project are not shipped in this project: the
UAV world (magnav/uav.py) builds its own Sensors and Truth from the map.

Truth / Sensors split: `Truth` holds what an aircraft cannot observe without GPS (true
total field, lat/lon, UTM). Only the world builder and the scoring code use it;
estimators and the navigator receive `Sensors` (and bare arrays) only.
"""

import json
from dataclasses import dataclass

import numpy as np

from magnav.frames import Frame, ll_to_local

MAP_EASTERN = "data/map_eastern_395.npz"  # Eastern_395 crop (MagNav.jl)
PROVENANCE = "data/provenance.json"


@dataclass(frozen=True)
class Truth:
    """GPS truth. Only the world builder (uav.py) and scoring code may touch this."""

    t: np.ndarray
    mag_1_c: np.ndarray
    mag_1_igrf: np.ndarray
    lat: np.ndarray
    lon: np.ndarray
    utm_x: np.ndarray
    utm_y: np.ndarray
    utm_z: np.ndarray


@dataclass(frozen=True)
class Sensors:
    """What the aircraft measures on board (plus external IGRF model and base station)."""

    t: np.ndarray
    fs: float
    line: str
    mag: dict
    flux: dict
    cur: dict
    ins_pitch: np.ndarray
    ins_roll: np.ndarray
    ins_yaw: np.ndarray
    ins_vn: np.ndarray
    ins_vw: np.ndarray
    ins_vu: np.ndarray
    igrf: np.ndarray
    diurnal: np.ndarray

    @property
    def n(self) -> int:
        return len(self.t)


@dataclass(frozen=True)
class MapTile:
    """Anomaly map tile on a uniform local grid (rows = north, cols = east)."""

    name: str
    frame: Frame
    gx: np.ndarray
    gy: np.ndarray
    dx: float
    dy: float
    nx: int
    ny: int
    M: np.ndarray
    V: np.ndarray
    lon: np.ndarray
    lat: np.ndarray

    def sample(self, x, y):
        """Bilinear map value at local (x, y); ok only if inside and all 4 cells valid."""
        x = np.asarray(x, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        fx = (x - self.gx[0]) / self.dx
        fy = (y - self.gy[0]) / self.dy
        i0 = np.floor(fx).astype(np.int64)
        j0 = np.floor(fy).astype(np.int64)
        inside = (i0 >= 0) & (j0 >= 0) & (i0 < self.nx - 1) & (j0 < self.ny - 1)
        i0 = np.clip(i0, 0, self.nx - 2)
        j0 = np.clip(j0, 0, self.ny - 2)
        tx = fx - i0
        ty = fy - j0
        M, V = self.M, self.V
        v = (
            M[j0, i0] * (1 - tx) * (1 - ty)
            + M[j0, i0 + 1] * tx * (1 - ty)
            + M[j0 + 1, i0] * (1 - tx) * ty
            + M[j0 + 1, i0 + 1] * tx * ty
        )
        ok = inside & V[j0, i0] & V[j0, i0 + 1] & V[j0 + 1, i0] & V[j0 + 1, i0 + 1]
        return v, ok


def _f64(z, key: str) -> np.ndarray:
    return np.array(z[key], dtype=np.float64)


def load_map(path: str) -> MapTile:
    """Load a map crop (pass MAP_EASTERN)."""
    with np.load(path, allow_pickle=False) as z:
        xx = _f64(z, "xx")
        yy = _f64(z, "yy")
        M = _f64(z, "map")
        V = np.array(z["mask"], dtype=bool)
    frame = Frame(lat0=float(yy.mean()), lon0=float(xx.mean()))
    gx, _ = ll_to_local(np.full_like(xx, frame.lat0), xx, frame)
    _, gy = ll_to_local(yy, np.full_like(yy, frame.lon0), frame)
    name = path.rsplit("/", 1)[-1].removesuffix(".npz")
    return MapTile(
        name=name,
        frame=frame,
        gx=gx,
        gy=gy,
        dx=float((gx[-1] - gx[0]) / (len(gx) - 1)),
        dy=float((gy[-1] - gy[0]) / (len(gy) - 1)),
        nx=len(xx),
        ny=len(yy),
        M=M,
        V=V,
        lon=xx,
        lat=yy,
    )


def load_provenance() -> dict:
    with open(PROVENANCE, encoding="utf-8") as f:
        return json.load(f)
