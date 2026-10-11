"""Shipped data files: size limits, map npz layout, provenance hash, literal paths."""

import hashlib
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MAX_FILE_BYTES = 2 * 1024 * 1024  # Qollab per-file cap (strict <)
MAP_NAME = "map_eastern_395.npz"


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _provenance() -> dict:
    return json.loads((DATA / "provenance.json").read_text(encoding="utf-8"))


def test_every_data_file_under_2mb():
    files = [p for p in DATA.rglob("*") if p.is_file()]
    assert files
    for p in files:
        assert p.stat().st_size < MAX_FILE_BYTES, f"{p} is {p.stat().st_size} bytes"
        assert p.suffix.lower() not in (".h5", ".hdf5"), f"raw HDF5 must never ship: {p}"


def test_map_npz_shape():
    prov = _provenance()["files"][f"data/{MAP_NAME}"]
    with np.load(DATA / MAP_NAME, allow_pickle=False) as z:
        M, mask, xx, yy = z["map"], z["mask"], z["xx"], z["yy"]
        assert M.dtype == np.float32
        assert mask.dtype == np.bool_
        assert M.shape == (len(yy), len(xx)) == mask.shape
        assert np.all(np.diff(xx) > 0) and np.all(np.diff(yy) > 0)
        assert list(M.shape) == prov["shape"]
        assert float(z["alt"]) == 395.0
    assert all(v == 1.0 for v in prov["track_valid_fraction"].values())


def test_provenance_sha():
    prov = _provenance()
    assert prov["schema_version"] == 1
    assert "FA8750-19-2-1000" in prov["dataset"] and "2007.12158" in prov["dataset"]
    assert set(prov["files"]) == {f"data/{MAP_NAME}"}
    for rel, entry in prov["files"].items():
        assert entry["output_sha256"] == _sha256(ROOT / rel), rel
        assert len(entry["source_sha256"]) == 64
        assert entry["source_file"]


def test_literal_paths():
    """Qollab preloads a data file only if its path is a quoted literal string in the Python code.

    Every file directly under data/ must therefore be declared as "data/<name>" in magnav/*.py.
    """
    sources = "\n".join(p.read_text(encoding="utf-8") for p in (ROOT / "magnav").glob("*.py"))
    files = sorted(p.name for p in DATA.iterdir() if p.is_file())
    assert "provenance.json" in files and MAP_NAME in files
    for name in files:
        assert f'"data/{name}"' in sources, f"data/{name} is not a quoted literal in magnav/*.py"
