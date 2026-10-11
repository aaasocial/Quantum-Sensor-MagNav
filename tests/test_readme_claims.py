"""Phase 3 README contract: required sentences, citations, honesty labels, links and numbers.

Numbers quoted in the README are re-derived here from the regenerated evidence files
(results/metrics.json, results/*.csv, data/benchmark_summary.json, data/forte_hardware_run.json),
so a regen that changes them makes this test fail until the README is updated.
"""

import csv
import json
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
DG_SENTENCE = (
    "The quantum sensor's filter function is a physical fact about how such sensors work; "
    "the field it filters here is injected as gate angles rather than felt; the downstream benefit "
    "equals that of a classical notch filter, achieved earlier and without consuming dynamic range."
)
# Built by concatenation so this file never matches itself.
MARKETING = ("revolution" + "ary", "unprece" + "dented", "outper" + "forms")


def _readme() -> str:
    return (ROOT / "README.md").read_text(encoding="utf-8")


def test_dg_sentence_verbatim():
    assert DG_SENTENCE in _readme()


def test_attribution():
    assert "This effort is supported by Qollab & IonQ." in _readme()


def test_citations():
    text = _readme()
    assert "FA8750-19-2-1000" in text
    assert "MagNav.jl" in text


def test_sister_pointer():
    assert "v0.1.1-smoke" in _readme()


def test_honest_labels():
    text = _readme()
    assert "simulator-sampled" in text
    assert "QPU-measured" in text
    assert "synthetic map (sensitivity study), not survey data" in text


def test_no_marketing():
    text = _readme()
    assert len(text) > 2000
    low = text.lower()
    assert not any(word in low for word in MARKETING)


GHZ_WORDING = (
    "entangled probes lower projection noise per shot by up to n at equal shot budget, "
    "until gate error and dephasing erode it"
)


@pytest.mark.parametrize(
    "needle",
    [
        "arXiv:2007.12158",
        "10.7289/V5H70CVX",
        "DATA_SHARING_AGREEMENT.md",
        "Huelga",
        "Monz",
        GHZ_WORDING,
        "Grover",
        "physically random",
        "pseudo-random",
        "fixed-wing",
        "400 m",
        "Chrome",
        "Run Project",
        "1.000",
        "Where it ties or loses",
        "magnav.regen",
        "FA8750-19-2-1000 - used 2026-10-09 to 2026-10-11",
        "No quantum advantage is claimed",
    ],
)
def test_required_strings(needle):
    assert needle in _readme()


def test_bibtex_block():
    text = _readme()
    assert "@misc{" in text or "@article{" in text
    assert "eprint={2007.12158}" in text


def test_quantum_ml_paragraph():
    low = _readme().lower()
    assert "quantum ml" in low or "quantum machine learning" in low


@pytest.mark.parametrize(
    "heading", ["Novelty", "Technical execution", "Impact", "Documentation"]
)
def test_criterion_headings(heading):
    assert re.search(rf"^#+ {re.escape(heading)}\s*$", _readme(), re.MULTILINE)


def test_ties_or_loses_heading_and_links():
    text = _readme()
    assert re.search(r"^#+ Where it ties or loses\s*$", text, re.MULTILINE)
    assert text.count("](#where-it-ties-or-loses)") >= 4


def test_no_null_claim_word():
    # The hardware cannot alter the nulls; the README must not suggest it does.
    assert ("sm" + "ear") not in _readme().lower()


def test_relative_links_exist():
    targets = re.findall(r"\]\(([^)\s]+)\)", _readme())
    local = [
        t for t in targets if not t.startswith(("http://", "https://", "#", "mailto:"))
    ]
    assert local, "expected relative links"
    for t in local:
        path = t.split("#", 1)[0]
        assert (ROOT / path).exists(), f"missing link target: {t}"


def test_required_images_linked():
    text = _readme()
    for img in (
        "docs/hero.png",
        "results/fig_ladder.png",
        "results/fig_ghz_scaling.png",
        "results/fig_filter_function.png",
        "results/fig_amp_sweep.png",
    ):
        assert f"]({img})" in text


def test_line_count():
    assert len(_readme().splitlines()) <= 320


def test_no_email_or_token():
    text = _readme()
    assert not re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}", text)
    assert not re.search(r"gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}", text)


# ---- numbers pinned to the regenerated evidence -------------------------------------------


def _metrics():
    return json.loads((ROOT / "results/metrics.json").read_text(encoding="utf-8"))


def _csv(name):
    with open(ROOT / "results" / name, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def _f(x, nd=1):
    return f"{float(x):.{nd}f}"


def _bench(S, est):
    (row,) = [
        r for r in _csv("benchmark.csv") if r["S"] == str(S) and r["estimator"] == est
    ]
    return row


def test_s256_table_numbers():
    text = _readme()
    b = _bench(256, "baseline_ls")
    g = _bench(256, "quantum_ghz4")
    q = _bench(256, "quantum_q1")
    assert f"{_f(b['cep50_mean_m'])} ± {_f(b['cep50_std_m'])} m" in text
    assert f"{_f(b['cep95_mean_m'])} ± {_f(b['cep95_std_m'])} m" in text
    assert f"{_f(b['signal_rmse_mean_nT'])} ± {_f(b['signal_rmse_std_nT'])} nT" in text
    assert f"{_f(g['cep50_mean_m'])} ± {_f(g['cep50_std_m'])} m" in text
    assert f"{_f(g['cep95_mean_m'])} ± {_f(g['cep95_std_m'])} m" in text
    assert (
        f"{_f(g['signal_rmse_mean_nT'], 3)} ± {_f(g['signal_rmse_std_nT'], 3)} nT"
        in text
    )
    assert (
        f"{_f(q['signal_rmse_mean_nT'], 3)} ± {_f(q['signal_rmse_std_nT'], 3)} nT"
        in text
    )
    summary = json.loads(
        (ROOT / "data/benchmark_summary.json").read_text(encoding="utf-8")
    )
    assert summary["S"] == 256 and summary["N"] == 8
    assert "8 seeded motor draws at S = 256" in text
    dr = _metrics()["benchmark"]["by_S"]["256"]["draws"][0]["dead_reckoning"]
    assert (
        f"| {_f(dr['cep50_m'])} m | {_f(dr['cep95_m'])} m | {_f(dr['pct_under_556'])} % |"
        in text
    )


def test_ladder_numbers():
    text = _readme()
    for S in (64, 256, 1024, 4096):
        b = _bench(S, "baseline_ls")
        g = _bench(S, "quantum_ghz4")
        nd = 1 if float(b["signal_rmse_mean_nT"]) >= 10 else 3
        if float(b["cep50_std_m"]) > 0:
            base_cep = f"{_f(b['cep50_mean_m'])} ± {_f(b['cep50_std_m'])} m"
        else:
            base_cep = f"{_f(b['cep50_mean_m'])} m"
        row = (
            f"| {S} | {base_cep} | {_f(g['cep50_mean_m'])} m | "
            f"{_f(b['signal_rmse_mean_nT'], nd)} nT | {_f(g['signal_rmse_mean_nT'], 3)} nT |"
        )
        assert row in text, row
    q4096 = _bench(4096, "quantum_q1")
    assert f"single qubit ({_f(q4096['signal_rmse_mean_nT'], 3)} nT)" in text
    drops = round(float(_bench(64, "baseline_ls")["ls_drops_mean"]))
    assert f"{drops} harmonic fits dropped" in text


def test_rpm_withheld_numbers():
    text = _readme()
    cells = _metrics()["rpm_2x2"]["cells"]
    qw = cells["quantum"]["rpm_withheld"]
    assert qw["fails"] is True
    assert f"slips {round(qw['slips_mean'])} cycles" in text
    assert f"CEP50 becomes {round(qw['cep50_m'])} m" in text
    bw = cells["baseline"]["rpm_withheld"]["cep50_m"]
    bk = cells["baseline"]["rpm_known"]["cep50_m"]
    assert f"({_f(bw)} m vs {_f(bk)} m)" in text


def test_replay_and_hardware_numbers():
    text = _readme()
    m = _metrics()
    assert m["replay"]["bits_source"] == "QPU-measured"
    assert m["replay"]["comparison_statement"] in text
    rec = {(r["label"], r["scenario"]): r for r in m["recorded"]}
    syn = rec[("QPU-measured", "synthetic_100m")]
    eas = rec[("QPU-measured", "eastern_400m")]
    assert (
        f"baseline reaches {_f(syn['cep50_baseline_m'])} m CEP50 at 100 m and {_f(eas['cep50_baseline_m'])} m at 400 m"
        in text
    )
    assert (
        f"against {_f(syn['cep50_quantum_m'])} m and {_f(eas['cep50_quantum_m'])} m for GHZ-4"
        in text
    )
    hw = json.loads((ROOT / "data/forte_hardware_run.json").read_text(encoding="utf-8"))
    assert hw["label"] == "QPU-measured"
    assert hw["job_id"] in text and hw["seed_hex"] in text
    assert f"{hw['shots']} shots requested, {hw['counts_sum']} counted" in text
    c = hw["ghz_measured"]
    assert f"c2 = {_f(c['c2'], 3)} and c4 = {_f(c['c4'], 3)}" in text


def test_ghz_scaling_numbers():
    text = _readme()
    g = _metrics()["ghz_scaling"]
    i4 = g["n"].index(4)
    assert f"{_f(g['ghz_ideal_nT'][i4], 3)} nT at the model contrast" in text
    assert f"{_f(g['ghz_measured_nT'][i4], 3)} nT at the contrast measured" in text
    assert f"{_f(g['sql_nT'][i4], 3)} nT at the standard quantum limit" in text


def test_amplitude_calibration_numbers():
    text = _readme()
    a1 = _metrics()["amp_sweep"]["frozen_A1_nT"]
    assert f"A1 = {round(a1)} nT" in text
    assert "S_ref = 256" in text
