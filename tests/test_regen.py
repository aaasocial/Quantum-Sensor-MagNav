"""magnav.regen (plan 03-01, D-08): one command, same bytes twice. Always writes into tmp dirs."""

import hashlib
import json
import os
from pathlib import Path

import pytest

from magnav import regen

ROOT = Path(__file__).resolve().parents[1]
CSVS = ("ladder.csv", "rpm_2x2.csv", "amp_sweep.csv", "benchmark.csv", "ghz_scaling.csv")


def _sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def _outputs(root: Path) -> list:
    return [root / "results" / "metrics.json", *(root / "results" / c for c in CSVS),
            root / "data" / "benchmark_summary.json"]  # fmt: skip


def _reject(constant):
    raise ValueError(f"{constant} is not valid JSON")


@pytest.fixture(scope="module")
def quick_builds(tmp_path_factory):
    a, b = tmp_path_factory.mktemp("regen_a"), tmp_path_factory.mktemp("regen_b")
    ma = regen.build(a, quick=True)
    regen.build(b, quick=True)
    return a, b, ma


def test_quick_regen_byte_identical(quick_builds):
    a, b, _ = quick_builds
    for pa in _outputs(a):
        pb = b / pa.relative_to(a)
        assert pa.is_file() and pb.is_file(), pa.name
        assert _sha(pa) == _sha(pb), pa.name
    assert _sha(a / "data" / "precomputed_uav.json") == _sha(b / "data" / "precomputed_uav.json")


def test_quick_metrics_shape(quick_builds):
    a, _, m = quick_builds
    text = (a / "results" / "metrics.json").read_text(encoding="utf-8")
    disk = json.loads(text, parse_constant=_reject)
    assert disk["profile"] == "quick" and m["profile"] == "quick"
    for k in ("benchmark", "rpm_2x2", "amp_sweep", "recorded", "ghz_scaling", "ghz_row", "inputs"):
        assert k in disk, k
    by = disk["benchmark"]["by_S"]
    assert set(by) == {"64", "256"}
    assert all(len(by[s]["draws"]) == 2 for s in by)
    assert {r["label"] for r in disk["recorded"]} <= {"QPU-measured", "simulator-sampled"}
    w = disk["rpm_2x2"]["cells"]["quantum"]["rpm_withheld"]
    assert w["fails"] is True and w["slips_mean"] > 0
    assert str(ROOT) not in text and str(a) not in text  # no absolute paths (T-03-01)


def test_benchmark_summary_strict_and_small(quick_builds):
    a, _, _ = quick_builds
    p = a / "data" / "benchmark_summary.json"
    assert p.stat().st_size < 2_000_000
    s = json.loads(p.read_text(encoding="utf-8"), parse_constant=_reject)
    assert s["kind"] == "benchmark_summary" and s["S"] == 256
    assert {r["estimator"] for r in s["rows"]} >= {"baseline_ls", "quantum_ghz4"}
    rows_text = json.dumps(s["rows"])
    assert "QPU-measured" not in rows_text and "simulator-sampled" not in rows_text  # D-06: never in the mean
    assert all(r["label"] in ("QPU-measured", "simulator-sampled") for r in s["recorded"])


def test_regen_seed_rule_reserved_key():
    from magnav import seeds

    assert regen.BENCH_SPAWN_KEY == 12
    assert all(regen.BENCH_SPAWN_KEY not in v for v in seeds.SPAWN_KEYS.values())
    assert regen.bench_seed(0, 0) == regen.bench_seed(0, 0) != regen.bench_seed(0, 1)


@pytest.mark.skipif(os.environ.get("MAGNAV_SLOW") != "1", reason="full regen takes minutes; set MAGNAV_SLOW=1")
def test_full_regen_matches_committed(tmp_path):
    regen.build(tmp_path, quick=False)
    for p in [*_outputs(tmp_path), tmp_path / "data" / "precomputed_uav.json"]:
        committed = ROOT / p.relative_to(tmp_path)
        assert p.read_bytes() == committed.read_bytes(), p.name
