"""Labelled synthetic crustal anomaly map for a sensitivity study at 100 m (pure numpy).

This is NOT survey data. It draws one seeded Gaussian random field whose radial power
spectrum follows the power law P(k) ~ k^-beta * exp(-2 K h), with beta fitted on the real
Eastern_395 tile (MagNav.jl) at that tile's stored altitude, and continues the same spectrum
analytically to 395 m and 100 m. One amplitude scale is chosen so the 395 m field has the
real tile's standard deviation over a tile-sized region, and that scale is applied at every
height. The 100 m field is cropped to the racetrack plus margin and stored in the Eastern_395
npz key layout and frame, so the unchanged `load_map`, `build_world` and TERCOM read it.

Source of truth: the committed npz (`SYNTH_MAP`), checked by its sha256 in
data/provenance.json. FFT rounding differs between platforms (pocketfft/SIMD, wasm), so an
in-page regeneration is close but not bit-identical; never trust a regenerated sha256.

CLI: `python -m magnav.synthmap build` (refuses to overwrite; `--force` rebuilds byte for byte).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

import numpy as np

from magnav.data import MAP_EASTERN, PROVENANCE, MapTile, load_map
from magnav.frames import local_to_ll
from magnav.seeds import ROOT_SEED

SYNTH_MAP = "data/map_synth_100m.npz"
SYNTH_LABEL = "synthetic map (sensitivity study), not survey data"
SYNTH_CAPTION = "Synthetic crustal anomaly map at 100 m - " + SYNTH_LABEL + "."
PARAMS = {
    "band_m": (600.0, 10000.0),
    "n_bins": 40,
    "N": 1024,
    "cell_m": 50.0,
    "heights_m": (395.0, 100.0),
    "alt_m": 100.0,
    "z0_m": 0.0,
    "calib_shape": (840, 768),  # (rows, cols) = 42.0 x 38.4 km, the real tile's physical size
    "crop_half": (240, 300),  # (rows, cols): y +/-12 km, x +/-15 km
    "seed_spawn_key": (10,),
}
NOTES = [
    "Depth to source z0 = 0 is a disclosed modelling choice; residual curvature of the real-tile "
    "spectrum below 750 m wavelength hints at a depth of about 100-150 m.",
    "The joint (beta, h) fit is degenerate (beta 0.92 at h 543 m for this band) and was rejected; "
    "beta is fitted with h fixed at the tile's stored 395 m.",
    "Power below 600 m wavelength is an extrapolation of the fitted power law.",
    "The frozen motor amplitude A1 = 3600 nT came from the 0.6 x median window-std rule evaluated "
    "on the real 400 m world and is not re-evaluated for this map.",
    "The npz is the source of truth; in-page regeneration is not bit-reproducible across platforms.",
]


def map_seed() -> int:
    """Map seed from the project SeedSequence tree (spawn key 10, deliberately not in SPAWN_KEYS)."""
    seq = np.random.SeedSequence(ROOT_SEED, spawn_key=PARAMS["seed_spawn_key"])
    return int(seq.generate_state(1, dtype=np.uint64)[0] >> np.uint64(1))


def radial_spectrum(Z, d, nb=40):
    """Radially binned power of a non-periodic grid: plane detrend, 2-D Hann taper, log bins."""
    Z = np.asarray(Z, dtype=np.float64)
    ny, nx = Z.shape
    J, I = np.mgrid[:ny, :nx]
    A = np.c_[np.ones(Z.size), I.ravel(), J.ravel()]
    c, *_ = np.linalg.lstsq(A, Z.ravel(), rcond=None)
    Z = Z - (A @ c).reshape(Z.shape)
    W = np.outer(np.hanning(ny), np.hanning(nx))
    P = np.abs(np.fft.fft2(Z * W)) ** 2 / (W**2).sum()
    K = np.hypot(*np.meshgrid(2 * np.pi * np.fft.fftfreq(nx, d), 2 * np.pi * np.fft.fftfreq(ny, d)))
    edges = np.geomspace(2 * np.pi / (max(nx, ny) * d), np.pi / d, nb + 1)
    idx = np.digitize(K.ravel(), edges)
    k, p = [], []
    for b in range(1, nb + 1):
        s = idx == b
        if s.sum() > 3:
            k.append(np.sqrt(edges[b - 1] * edges[b]))
            p.append(P.ravel()[s].mean())
    return np.array(k), np.array(p)


def fit_beta(k, P, h_m, band_m=(600.0, 10000.0)):
    """Least squares on ln P + 2 k h = c - beta ln k over the band; returns (beta, residual RMS)."""
    lam = 2 * np.pi / k
    s = (lam >= band_m[0]) & (lam <= band_m[1])
    A = np.c_[np.ones(s.sum()), -np.log(k[s])]
    y = np.log(P[s]) + 2 * k[s] * h_m
    c, *_ = np.linalg.lstsq(A, y, rcond=None)
    resid = y - A @ c
    return float(c[1]), float(np.sqrt(np.mean(resid**2)))


def generate_fields(seed, N, d, beta, heights, z0=0.0):
    """Periodic N x N fields (unscaled) at each height from ONE white-noise spectrum."""
    rng = np.random.default_rng(seed)
    W = np.fft.rfft2(rng.standard_normal((N, N)))
    K = np.hypot(2 * np.pi * np.fft.fftfreq(N, d)[:, None], 2 * np.pi * np.fft.rfftfreq(N, d)[None, :])
    K0 = K.copy()
    K0[0, 0] = 1.0
    A = K0 ** (-beta / 2.0)
    A[0, 0] = 0.0  # zero-mean field (no inf at k = 0)
    return {h: np.fft.irfft2(W * A * np.exp(-K * (h + z0)), s=(N, N)) for h in heights}


def _tile_alt() -> float:
    with np.load(MAP_EASTERN, allow_pickle=False) as z:
        return float(z["alt"])


def calib_slice(N: int = PARAMS["N"]):
    c = N // 2
    r, q = PARAMS["calib_shape"]
    return slice(c - r // 2, c + r // 2), slice(c - q // 2, c + q // 2)


def crop_slice(N: int = PARAMS["N"]):
    c = N // 2
    hr, hc = PARAMS["crop_half"]
    return slice(c - hr, c + hr + 1), slice(c - hc, c + hc + 1)


def build_fields(tile: MapTile | None = None) -> dict:
    """Fit beta on the real tile, generate 395 m and 100 m, calibrate at 395 m, crop the 100 m field."""
    tile = load_map(MAP_EASTERN) if tile is None else tile
    h_fit = _tile_alt()
    k, P = radial_spectrum(tile.M, tile.dx, PARAMS["n_bins"])
    beta, resid = fit_beta(k, P, h_fit, PARAMS["band_m"])
    target = float(np.std(tile.M))
    N, d = PARAMS["N"], PARAMS["cell_m"]
    h_lo = PARAMS["alt_m"]
    F = generate_fields(map_seed(), N, d, beta, (h_fit, h_lo), PARAMS["z0_m"])
    cal = calib_slice(N)
    scale = target / float(np.std(F[h_fit][cal]))
    crop = (scale * F[h_lo][crop_slice(N)]).astype(np.float32)
    hr, hc = PARAMS["crop_half"]
    return {
        "beta": beta,
        "fit_residual_rms": resid,
        "h_fit_m": h_fit,
        "scale": scale,
        "target_std_nT": target,
        "std_395_calib_nT": float(np.std(scale * F[h_fit][cal])),
        "std_100_calib_nT": float(np.std(scale * F[h_lo][cal])),
        "std_100_crop_nT": float(np.std(crop.astype(np.float64))),
        "crop": crop,
        "gx": (np.arange(2 * hc + 1) - hc) * d,
        "gy": (np.arange(2 * hr + 1) - hr) * d,
        "frame": tile.frame,
        "fields": F,
    }


def _sha256(path: str) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def provenance_entry(fields: dict, file_sha: str) -> dict:
    seed = map_seed()
    return {
        "kind": "synthetic_map",
        "label": SYNTH_LABEL,
        "generator": "magnav/synthmap.py (python -m magnav.synthmap build)",
        "alt": float(PARAMS["alt_m"]),
        "keys": ["alt", "map", "mask", "xx", "yy"],
        "shape": [int(s) for s in fields["crop"].shape],
        "cell_m": PARAMS["cell_m"],
        "N": PARAMS["N"],
        "seed": seed,
        "seed_str": str(seed),
        "seed_spawn_key": list(PARAMS["seed_spawn_key"]),
        "beta": fields["beta"],
        "beta_band_m": list(PARAMS["band_m"]),
        "beta_fit_residual_rms": fields["fit_residual_rms"],
        "h_fit_m": fields["h_fit_m"],
        "z0_m": PARAMS["z0_m"],
        "calib_shape": list(PARAMS["calib_shape"]),
        "calib_std_nT": fields["target_std_nT"],
        "scale": fields["scale"],
        "std_395_calib_nT": fields["std_395_calib_nT"],
        "std_100_calib_nT": fields["std_100_calib_nT"],
        "std_100_crop_nT": fields["std_100_crop_nT"],
        "output_sha256": file_sha,
        "fit_source_file": "data/map_eastern_395.npz",
        "fit_source_sha256": _sha256(MAP_EASTERN),
        "mask_rule": "all_valid",
        "valid_fraction": 1.0,
        "notes": list(NOTES),
    }


def write_map(force: bool = False) -> dict:
    """Write the npz once (refuses to overwrite unless force) and return its provenance entry."""
    if Path(SYNTH_MAP).exists() and not force:
        raise FileExistsError(f"{SYNTH_MAP} exists; use --force to rebuild it")
    fields = build_fields()
    gx, gy, frame = fields["gx"], fields["gy"], fields["frame"]
    lat, _ = local_to_ll(np.zeros_like(gy), gy, frame)
    _, lon = local_to_ll(gx, np.zeros_like(gx), frame)
    crop = fields["crop"]
    np.savez_compressed(
        "data/map_synth_100m.npz",
        map=crop,
        mask=np.ones(crop.shape, dtype=bool),
        xx=lon,
        yy=lat,
        alt=np.float64(PARAMS["alt_m"]),
    )
    return provenance_entry(fields, _sha256(SYNTH_MAP))


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="magnav.synthmap")
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build", help="write data/map_synth_100m.npz and its provenance entry")
    b.add_argument("--force", action="store_true", help="overwrite the existing npz")
    args = ap.parse_args(argv)
    if args.cmd == "build":
        entry = write_map(force=args.force)
        with open(PROVENANCE, encoding="utf-8") as f:
            prov = json.load(f)
        prov["files"][SYNTH_MAP] = entry
        with open(PROVENANCE, "w", encoding="utf-8") as f:
            f.write(json.dumps(prov, indent=1, sort_keys=True) + "\n")
        print(f"wrote {SYNTH_MAP}: beta {entry['beta']:.4f}, scale {entry['scale']:.3f}, "
              f"std 395 calib {entry['std_395_calib_nT']:.2f} / 100 calib {entry['std_100_calib_nT']:.2f} / "
              f"100 crop {entry['std_100_crop_nT']:.2f} nT, seed {entry['seed_str']}, "
              f"sha256 {entry['output_sha256']}")  # fmt: skip
    return 0


if __name__ == "__main__":
    sys.exit(main())
