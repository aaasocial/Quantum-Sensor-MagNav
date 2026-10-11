"""Scaffold hygiene: no v1 leftovers, pinned deps, licence attribution, browser-safe imports."""

import ast
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAGNAV = ROOT / "magnav"
TESTS = ROOT / "tests"

# Built by concatenation so this file never matches itself.
V1_STRINGS = ("feature" + "_map", "ZZFeature" + "Map", "Quantum" + "Denoiser", "precomputed" + "_run")
FORBIDDEN_NUMERIC = (
    "iir" + "comb",
    "np.random." + "seed(",
    "np.random." + "binomial(",
    "np.random." + "normal(",
    "np.random." + "uniform(",
)
BROWSER_ALLOWED = {
    "numpy", "scipy", "json", "math", "hashlib", "dataclasses", "collections", "typing",
    "argparse", "sys", "pathlib", "magnav", "__future__", "time", "datetime",
}  # fmt: skip
NEVER_IN_MAGNAV = {"qiskit_aer", "qiskit_ionq", "sklearn"}


def _py_files(*dirs):
    for d in dirs:
        yield from sorted(d.rglob("*.py"))


def _imported_roots(path: Path) -> set[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    roots = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            roots |= {a.name.split(".")[0] for a in node.names}
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            roots.add(node.module.split(".")[0])
    return roots


def _req_name(spec: str) -> str:
    for sep in ("==", ">=", "<=", "~=", ">", "<", "[", ";", " "):
        spec = spec.split(sep)[0]
    return spec.strip().lower()


def test_no_v1_strings():
    for path in _py_files(MAGNAV, TESTS):
        text = path.read_text(encoding="utf-8")
        for s in V1_STRINGS:
            assert s not in text, f"{path.relative_to(ROOT)} contains {s}"


def test_pyproject_deps():
    raw = (ROOT / "pyproject.toml").read_text(encoding="utf-8")
    cfg = tomllib.loads(raw)
    runtime = cfg["project"]["dependencies"]
    assert {_req_name(d) for d in runtime} == {"qiskit", "numpy", "scipy"}
    dev = cfg["dependency-groups"]["dev"]
    assert "qiskit-ionq==1.0.2" in dev
    assert all("qiskit-ionq" not in d for d in runtime)
    assert "scikit-learn" not in raw


def test_license_attribution():
    text = (ROOT / "LICENSE").read_text(encoding="utf-8")
    assert "MIT License" in text
    assert "This effort is supported by Qollab & IonQ." in text


def test_browser_modules_pure():
    files = sorted(MAGNAV.glob("*.py"))
    assert files
    for path in files:
        roots = _imported_roots(path)
        assert not roots & NEVER_IN_MAGNAV, f"{path.name} imports {roots & NEVER_IN_MAGNAV}"
        allowed = BROWSER_ALLOWED | ({"qiskit"} if path.name in {"quantum.py", "qjob.py"} else set())
        assert roots <= allowed, f"{path.name} imports outside the browser-safe set: {roots - allowed}"


def test_no_forbidden_numpy_scipy():
    for path in sorted(MAGNAV.glob("*.py")):
        text = path.read_text(encoding="utf-8")
        for s in FORBIDDEN_NUMERIC:
            assert s not in text, f"{path.name} contains {s}"


CAPTURE = ROOT / "capture"
RUN_ATTR = "r" + "un"
FORBIDDEN_QISKIT_IMPORT_PREFIXES = ("qiskit." + "primitives",)
FORBIDDEN_NAME_PARTS = ("Sam" + "pler", "Esti" + "mator")
NEVER_IN_CAPTURE = {"qiskit" + "_ionq", "qiskit" + "_aer"}


def test_backend_run_only_in_qjob():
    """The only `.run(` call in magnav/ is backend.run in qjob.py (one job per Run)."""
    for path in sorted(MAGNAV.glob("*.py")):
        if path.name == "qjob.py":
            continue
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                assert node.func.attr != RUN_ATTR, f"{path.name}:{node.lineno} calls .{RUN_ATTR}("


def test_no_sampler_estimator_ionq_aer():
    files = sorted(MAGNAV.glob("*.py")) + (sorted(CAPTURE.glob("*.py")) if CAPTURE.exists() else [])
    for path in files:
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            mods, names = [], []
            if isinstance(node, ast.Import):
                mods = [a.name for a in node.names]
                names = [a.name for a in node.names]
            elif isinstance(node, ast.ImportFrom) and node.module:
                mods = [node.module]
                names = [a.name for a in node.names]
            for m in mods:
                assert m.split(".")[0] not in NEVER_IN_CAPTURE, f"{path.name} imports {m}"
                assert not m.startswith(FORBIDDEN_QISKIT_IMPORT_PREFIXES), f"{path.name} imports {m}"
            for n in names:
                assert not any(part in n for part in FORBIDDEN_NAME_PARTS), f"{path.name} imports {n}"


def test_api_and_live_import_no_qiskit():
    for name in ("api.py", "live_uav.py"):
        path = MAGNAV / name
        if path.exists():
            assert "qiskit" not in _imported_roots(path), f"{name} imports qiskit"
