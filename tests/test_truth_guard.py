"""Static guards: estimators never accept Truth; no h5py or pickle loading in magnav/."""

import ast
import inspect
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
MAGNAV = ROOT / "magnav"
# baseline.py added in plan 01-03.
# uav.py (and later uav_pipeline.py) legitimately build and score Truth, so they are not guarded.
REQUIRED = [MAGNAV / n for n in ("nav.py", "frames.py", "motor.py", "ramsey.py", "quantum.py", "baseline.py")]
GUARDED = REQUIRED


def test_guarded_modules_exist():
    missing = [p.name for p in REQUIRED if not p.exists()]
    assert not missing, f"guarded modules missing: {missing}"


def _names_in(node) -> set[str]:
    if node is None:
        return set()
    out = set()
    for sub in ast.walk(node):
        if isinstance(sub, ast.Name):
            out.add(sub.id)
        elif isinstance(sub, ast.Attribute):
            out.add(sub.attr)
        elif isinstance(sub, ast.Constant) and isinstance(sub.value, str):
            out.add(sub.value)
    return out


@pytest.mark.parametrize("path", GUARDED, ids=lambda p: p.name)
def test_truth_guard(path):
    tree = ast.parse(path.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            assert all(a.name != "Truth" for a in node.names), f"{path.name} imports Truth"
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
            a = node.args
            params = a.posonlyargs + a.args + a.kwonlyargs + [p for p in (a.vararg, a.kwarg) if p]
            for p in params:
                assert p.arg.lower() != "truth", f"{path.name}: parameter named truth"
                assert not any("Truth" in n for n in _names_in(p.annotation)), (
                    f"{path.name}: parameter {p.arg} annotated with Truth"
                )


def test_no_h5py_or_pickle_in_magnav():
    for path in MAGNAV.glob("*.py"):
        text = path.read_text(encoding="utf-8")
        assert "h5py" not in text, path.name
        assert "allow_pickle=True" not in text, path.name
        tree = ast.parse(text)
        for node in ast.walk(tree):
            if (
                isinstance(node, ast.Call)
                and isinstance(node.func, ast.Attribute)
                and node.func.attr == "load"
                and isinstance(node.func.value, ast.Name)
                and node.func.value.id in ("np", "numpy")
            ):
                kw = {k.arg: k.value for k in node.keywords}
                assert "allow_pickle" in kw, f"{path.name}:{node.lineno} np.load without allow_pickle"
                v = kw["allow_pickle"]
                assert isinstance(v, ast.Constant) and v.value is False, f"{path.name}:{node.lineno}"


ESTIMATOR_ALLOWED = {"n1", "shots", "n", "c", "phi", "tau_s", "b_ref_nT"}
ESTIMATOR_FORBIDDEN = {"truth", "crust", "b_true", "field", "B_k", "B_at", "world"}


def test_quantum_estimator_signatures():
    from magnav import ramsey

    for fn in (ramsey.phi_hat, ramsey.field_from_phase, ramsey.estimate_from_counts):
        names = set(inspect.signature(fn).parameters)
        assert names <= ESTIMATOR_ALLOWED, (fn.__name__, names - ESTIMATOR_ALLOWED)
        assert not names & ESTIMATOR_FORBIDDEN, (fn.__name__, names & ESTIMATOR_FORBIDDEN)


def _called_names(fn_node) -> set[str]:
    out = set()
    for sub in ast.walk(fn_node):
        if isinstance(sub, ast.Call):
            f = sub.func
            if isinstance(f, ast.Name):
                out.add(f.id)
            elif isinstance(f, ast.Attribute):
                out.add(f.attr)
    return out


def test_estimates_via_counts():
    tree = ast.parse((MAGNAV / "ramsey.py").read_text(encoding="utf-8"))
    fns = {n.name: n for n in tree.body if isinstance(n, ast.FunctionDef)}
    for name in ("coarse_track", "two_stage"):
        calls = _called_names(fns[name])
        assert "estimate_from_counts" in calls, name
        assert "field_from_phase" not in calls, name
