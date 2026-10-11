"""magnav.regen (plan 03-01, D-08): one command, same bytes twice. Always writes into tmp dirs."""

import hashlib
import importlib.util
import json
import os
from pathlib import Path

import pytest

from magnav import regen

ROOT = Path(__file__).resolve().parents[1]
CSVS = ("ladder.csv", "rpm_2x2.csv", "amp_sweep.csv", "benchmark.csv", "ghz_scaling.csv", "filter_function.csv")
FIGS = ("fig_ladder.png", "fig_amp_sweep.png", "fig_filter_function.png", "fig_ghz_scaling.png")
HAS_MPL = importlib.util.find_spec("matplotlib") is not None  # figures are dev-only (plan 03-03)
PNG_SIG = b"\x89PNG\r\n\x1a\n"


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
    ma = regen.build(a, quick=True, figures=HAS_MPL)
    regen.build(b, quick=True, figures=HAS_MPL)
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


def test_quick_figures_byte_identical(quick_builds):
    """Plan 03-03 (METR-05): every PNG and the circuit drawing are the same bytes on two runs."""
    pytest.importorskip("matplotlib")
    a, b, m = quick_builds
    for name in (*FIGS, "circuit.txt"):
        pa, pb = a / "results" / name, b / "results" / name
        assert pa.is_file() and pb.is_file(), name
        assert _sha(pa) == _sha(pb), name
    for name in FIGS:
        data = (a / "results" / name).read_bytes()
        assert data.startswith(PNG_SIG), name
        assert len(data) < 2_000_000, name
        assert str(ROOT).encode() not in data and str(a).encode() not in data, name  # T-03-07
    assert "fig_ghz_scaling.png" in FIGS
    circ = (a / "results" / "circuit.txt").read_text(encoding="utf-8")
    assert "rz" in circ and "M" in circ and m["inputs"]["circuit_sha256"] in circ
    ff = m["filter_function"]
    assert ff["harmonic_hz"] == pytest.approx(ff["null_hz"][: len(ff["harmonic_hz"])])  # m = 1: nulls at harmonics
    assert all(v <= -100.0 for v in ff["quantum_db_at_harmonics"])


def test_no_figures_flag_keeps_numbers(tmp_path, quick_builds):
    a, _, _ = quick_builds
    regen.build(tmp_path, quick=True, figures=False)
    assert not (tmp_path / "results" / "fig_ladder.png").exists()
    for name in ("metrics.json", "filter_function.csv"):
        assert _sha(tmp_path / "results" / name) == _sha(a / "results" / name), name


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
