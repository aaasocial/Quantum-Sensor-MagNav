"""Phase 3 README contract. Every test fails on the Phase 2 stub README.

The module-level xfail(strict=True) marker MUST be removed by the Phase 3 task that writes the
README; otherwise the then-passing tests become XPASS(strict) failures and the suite goes red.
"""

from pathlib import Path

import pytest

pytestmark = pytest.mark.xfail(strict=True, reason="README is written in Phase 3")

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
