"""Static checks that the built artifacts match Qollab's JS-project contract."""

import re
import shutil
import subprocess
import zipfile
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MAIN_JS = ROOT / "main.js"
MAIN_CSS = ROOT / "main.css"
LICENSES = ROOT / "THIRD_PARTY_WEB_LICENSES.md"
ATTRIBUTION = "This effort is supported by Qollab & IonQ."
MAX_FILE_BYTES = 2 * 1024 * 1024
MAX_MAIN_JS = 1_500_000  # headroom under Qollab's 2 MB per-file cap
FORBIDDEN_TAGS = re.compile(r"<script|<html|<head|<body", re.IGNORECASE)
# Any ES export statement, minified or not: `export {`, `;export{x}`, `export *`, `export default`,
# `export const/let/var/function/class`.
EXPORT_STMT = re.compile(
    r"(^|[;})\s])export\s*(\{|\*|default\b|const\b|let\b|var\b|function\b|class\b|async\b)",
    re.MULTILINE,
)
WEB = ROOT / "web"
VITE = WEB / "node_modules" / ".bin" / "vite"
SYNTH_LABEL = "synthetic map (sensitivity study), not survey data"


def test_index_html_body_only():
    text = INDEX.read_text(encoding="utf-8")
    assert 'id="root"' in text
    assert not FORBIDDEN_TAGS.search(text)


def test_main_js_first_line():
    first = MAIN_JS.read_text(encoding="utf-8").splitlines()[0]
    assert re.match(r'^import \* as [A-Za-z_$][\w$]* from "magnav\.api";', first), first


def test_main_js_no_exports_and_size():
    text = MAIN_JS.read_text(encoding="utf-8")
    match = EXPORT_STMT.search(text)
    assert match is None, text[max(0, match.start() - 40) : match.end() + 40]
    assert MAIN_JS.stat().st_size < MAX_FILE_BYTES
    assert MAIN_CSS.stat().st_size < MAX_FILE_BYTES


@pytest.mark.parametrize(
    "snippet",
    ["export { a };", "x();export{a}", "}export * from 'y'", "export default App", "export const a = 1"],
)
def test_export_regex_catches_minified_forms(snippet):
    assert EXPORT_STMT.search(snippet)


def test_export_regex_ignores_identifiers():
    assert not EXPORT_STMT.search("const exports = {}; module.exports = x; reexport(y);")


@pytest.mark.skipif(
    not VITE.exists() or shutil.which("node") is None,
    reason="web/node_modules not installed (run npm --prefix web ci)",
)
def test_committed_bundle_matches_fresh_build(tmp_path):
    """The committed main.js/main.css must be what web/src builds to (no stale bundle)."""
    subprocess.run(
        [str(VITE), "build", "--outDir", str(tmp_path), "--emptyOutDir", "--logLevel", "error"],
        cwd=WEB,
        check=True,
        capture_output=True,
        timeout=180,
    )
    for name in ("main.js", "main.css", "THIRD_PARTY_WEB_LICENSES.md"):
        fresh = (tmp_path / name).read_bytes()
        assert fresh == (ROOT / name).read_bytes(), (
            f"{name} is stale: run `npm --prefix web run build` and commit it"
        )


def test_main_js_contents():
    text = MAIN_JS.read_text(encoding="utf-8")
    assert "callPromising" in text
    assert ATTRIBUTION in text


def test_main_css_nonempty():
    assert MAIN_CSS.exists()
    assert MAIN_CSS.stat().st_size > 0


def test_no_stray_build_output():
    assert not (ROOT / "assets").exists()
    assert "<script" not in INDEX.read_text(encoding="utf-8").lower()


def test_main_js_budget():
    assert MAIN_JS.stat().st_size < MAX_MAIN_JS


def test_bundle_has_no_artifact_copy():
    # The artifact comes through Python at runtime; the dev stub's ?raw import never ships.
    assert "precomputed" + "_uav.json?raw" not in MAIN_JS.read_text(encoding="utf-8")


def _web_sources(*suffixes):
    return [p for p in (WEB / "src").rglob("*") if p.suffix in suffixes and p.is_file()]


def test_charts_disable_accessibility_layer():
    for path in _web_sources(".jsx"):
        text = path.read_text(encoding="utf-8")
        charts = len(re.findall(r"<(LineChart|ComposedChart|ScatterChart|AreaChart|BarChart)\b", text))
        assert charts == text.count("accessibilityLayer={false}"), path.name


# Recharts elements that animate (and schedule work through setTimeout) unless told not to.
ANIMATED_RECHARTS = re.compile(r"<(Line|Area|Bar|Scatter|Pie|Radar|RadialBar|Funnel|Tooltip)\b")


def test_recharts_animation_and_debounce_stay_off():
    """WR-06: bundled third-party timers run on Qollab's injected, promise-returning setTimeout,
    so no first-party code may switch on a recharts animation or a debounce."""
    for path in _web_sources(".jsx", ".js"):
        text = path.read_text(encoding="utf-8")
        if "from 'recharts'" not in text:
            continue
        animated = len(ANIMATED_RECHARTS.findall(text))
        assert animated == text.count("isAnimationActive={false}"), path.name
        assert "isAnimationActive={true}" not in text, path.name
    for path in _web_sources(".jsx", ".js"):
        assert not re.search(r"\bdebounce\s*[=:(]", path.read_text(encoding="utf-8")), path.name


# Timer references in the built bundle: React's scheduler plus probe.js, which only inspects
# Qollab's injected timers (both setInterval hits are probe.js typeof/String checks). First-party
# page code schedules no timers. A change here means a dependency or first-party code started
# scheduling on Qollab's injected timers: check that the new call site works with a
# promise-returning setTimeout, then update.
# Re-pinned in 02-03 Task 4 to {17, 6, 2} without recharts, and in 02-07 Task 3 once the sensor
# panel bundled recharts 3.10.1: +15 setTimeout / +7 clearTimeout, all inside recharts (the same
# counts the sister bundle shipped with; its third setInterval was a first-party keep-alive).
# Every recharts animation is off and no ResponsiveContainer debounce is set (test above).
BUNDLE_TIMER_REFS = {"setTimeout": 32, "clearTimeout": 13, "setInterval": 2}


def test_bundle_timer_call_sites_are_known():
    text = MAIN_JS.read_text(encoding="utf-8")
    found = {name: len(re.findall(rf"\b{name}\b", text)) for name in BUNDLE_TIMER_REFS}
    assert found == BUNDLE_TIMER_REFS


def test_no_unsafe_html_in_web_src():
    for path in _web_sources(".js", ".jsx"):
        text = path.read_text(encoding="utf-8")
        for bad in ("dangerouslySetInnerHTML", "innerHTML", "eval("):
            assert bad not in text, f"{bad} in {path.relative_to(ROOT)}"


# CLAUDE.md honesty constraint: the D-G framing sentence, verbatim, on the page.
DG_SENTENCE = (
    "The quantum sensor's filter function is a physical fact about how such sensors work; the field it "
    "filters here is injected as gate angles rather than felt; the downstream benefit equals that of a "
    "classical notch filter, achieved earlier and without consuming dynamic range."
)


@pytest.mark.parametrize(
    "copy",
    [
        "UAV (live, IonQ-drawn motor)",
        "UAV (recorded replay)",
        "Map scenario",
        "Run mode",
        "precomputed replay",
        "stored motor draw",
        "Quantum track on map and charts",
        "GHZ-4 entangled",
        "Single-qubit",
        SYNTH_LABEL,
        # Live run (02-06)
        "Run one IonQ job",
        "This Run's IonQ job",
        "simulator-sampled",
        "QPU-measured",
        "simulator-sampled proxy",
        "Not captured yet",
        "computed in-page",
        "motor drawn by this Run's IonQ job",
        "fallback: precomputed replay",
        "Live run took longer than 90 s",
        "entangled probe n = ",
        "measured this Run",
        "default model, not measured",
        "built-in simulator",
        "waiting for IonQ",
        # Sensor panel, results and honesty section (02-07)
        "Sensor",
        "emulated sensor",
        "Ramsey filter function",
        "GHZ scaling",
        "Navigation accuracy",
        "Both scenarios, as found",
        "Comparison rule",
        "What is quantum here",
        "Map track data",
        "GHZ scaling data",
        DG_SENTENCE,
    ],
)
def test_ui_copy_in_bundle(copy):
    assert copy in MAIN_JS.read_text(encoding="utf-8")


def test_third_party_licenses_present():
    text = LICENSES.read_text(encoding="utf-8")
    for name in ("react", "d3-scale-chromatic", "recharts"):
        assert f"## {name} - " in text, name


# D-A: no v1 (real-flight) entry, string or link anywhere a visitor can see it. Needles are
# built by concatenation so this file never matches itself.
V1_UI_NEEDLES = (
    "ces" + "sna",
    "flt" + "100",
    "tol" + "les",
    "ren" + "frew",
    "1003" + ".02",
    "precomputed" + "_run",
    "feature" + "_map",
)
# Exempt on purpose and never scanned: data/qsensor_model.json is byte-pinned by D-C
# (sha256 a10a6f62...), and both files carry the SGL "1003.02" survey-line data citation in
# their notes/source fields. They are data citations the page never renders as UI copy, and
# editing either would break D-C. Do not widen this tuple to make the scan pass.
V1_SCAN_EXEMPT = ("data/qsensor_model.json", "data/provenance.json")
# Data artifacts this phase produces (scanned when present). README.md is not scanned.
V1_SCAN_DATA = (
    "data/precomputed_uav.json",
    "data/circuit_freeze.json",
    "data/forte_hardware_run.json",
)
# Page-facing Python from plan 02-02 (runs in parallel; scanned once present).
V1_SCAN_OPTIONAL_PY = ("magnav/api.py", "magnav/live_uav.py")


def _v1_scan_files():
    files = [p for p in sorted((WEB / "src").rglob("*")) if p.is_file()]
    files += [WEB / "index.html", INDEX, ROOT / "capture" / "main.py"]
    files += sorted((ROOT / "scripts").glob("*.sh"))
    # The bundle pair is scanned only once built; the other contract tests go RED without it.
    files += [p for p in (MAIN_JS, MAIN_CSS) if p.exists()]
    files += [ROOT / f for f in V1_SCAN_OPTIONAL_PY if (ROOT / f).exists()]
    files += [ROOT / f for f in V1_SCAN_DATA if (ROOT / f).exists()]
    return files


def test_no_v1_ui_strings():
    files = _v1_scan_files()
    assert all(p.relative_to(ROOT).as_posix() not in V1_SCAN_EXEMPT for p in files)
    hits = []
    for path in files:
        text = path.read_text(encoding="utf-8", errors="replace").lower()
        hits += [f"{path.relative_to(ROOT)}: {n}" for n in V1_UI_NEEDLES if n in text]
    assert not hits, hits


def test_v1_scan_exemptions_are_citations_only():
    sources = [p.read_text(encoding="utf-8") for p in (WEB / "src").rglob("*") if p.is_file()]
    for rel in V1_SCAN_EXEMPT:
        assert (ROOT / rel).is_file(), rel
        name = rel.rsplit("/", 1)[-1]
        assert not any(name in text for text in sources), f"web/src references {rel}"


def test_no_hardcoded_comparison():
    # Comparison numbers and verdict prose come from the artifact, never from the bundle.
    text = MAIN_JS.read_text(encoding="utf-8")
    assert "quantum navigation advantage" not in text
    assert "150.2" not in text


UPLOAD_ZIP = ROOT / "dist" / "qollab-upload.zip"


@pytest.mark.skipif(not UPLOAD_ZIP.exists(), reason="dist/qollab-upload.zip not built")
def test_upload_zip():
    with zipfile.ZipFile(UPLOAD_ZIP) as zf:
        infos = zf.infolist()
    names = {i.filename for i in infos}
    assert "main.py" not in names
    for need in (
        "main.js",
        "main.css",
        "index.html",
        "data/circuit_freeze.json",
        "data/map_synth_100m.npz",
        "data/map_eastern_395.npz",
    ):
        assert need in names, need
    assert len(infos) <= 100
    assert all(i.file_size < MAX_FILE_BYTES for i in infos)
