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
