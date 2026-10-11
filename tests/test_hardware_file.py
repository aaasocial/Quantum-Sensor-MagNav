"""Schema, hash and label checks for data/forte_hardware_run.json (QS-05).

The file is pasted by a human from capture/main.py output (proxy first, then hardware after
Eason's approval). Skipped while the file is absent.
"""

import json
import math
import re
from datetime import datetime
from pathlib import Path

import pytest

from magnav import quantum

ROOT = Path(__file__).resolve().parents[1]
HW = ROOT / "data" / "forte_hardware_run.json"
FREEZE = ROOT / quantum.CIRCUIT_FREEZE

if not HW.exists():
    pytest.skip("data/forte_hardware_run.json not captured yet", allow_module_level=True)


def _no_nan(token):
    raise ValueError(f"non-finite constant {token} in {HW.name}")


@pytest.fixture(scope="module")
def rec():
    return json.loads(HW.read_text(encoding="utf-8"), parse_constant=_no_nan)


@pytest.fixture(scope="module")
def freeze():
    return json.loads(FREEZE.read_text(encoding="utf-8"))


def test_schema_and_label(rec):
    assert rec["schema_version"] == 1
    assert rec["label"] in {"QPU-measured", "simulator-sampled proxy"}
    assert (rec["label"] == "QPU-measured") == str(rec["backend"]).startswith("ionq_qpu")
    assert isinstance(rec["job_id"], str) and rec["job_id"]
    datetime.fromisoformat(rec["timestamp_utc"])


def test_counts(rec):
    assert rec["shots"] >= 500
    assert sum(rec["counts"].values()) == rec["counts_sum"]
    for key, n in rec["counts"].items():
        assert re.fullmatch(r"[01]{16}", key.replace(" ", "")), key
        assert isinstance(n, int) and n >= 0


def test_circuit_hash_matches_freeze(rec, freeze):
    assert rec["circuit_sha256"] == freeze["circuit_sha256"]


def test_ghz_measured_recomputed(rec, freeze):
    dec = quantum.decode_counts(rec["counts"], freeze["layout"])
    c = quantum.contrasts(dec, freeze["layout"])
    for k in ("c1", "c2", "c4"):
        assert math.isfinite(rec["ghz_measured"][k])
        assert abs(rec["ghz_measured"][k] - c[k]) < 1e-9
