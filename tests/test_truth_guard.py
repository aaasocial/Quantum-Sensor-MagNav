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
    for name in ("coarse_track", "two_stage", "servo_track"):
        calls = _called_names(fns[name])
        assert "estimate_from_counts" in calls, name
        assert "field_from_phase" not in calls, name


def _parents(tree) -> dict:
    par = {}
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            par[child] = node
    return par


def _call_name(node):
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        return node.func.id
    return None


def test_servo_reference_takes_no_field():
    """WR-01: the servo reference is a recursion on past estimates; truth only via window_phase."""
    from magnav import ramsey

    names = set(inspect.signature(ramsey.servo_reference).parameters)
    assert names == {"bhat_nT", "idx"}
    assert not names & ESTIMATOR_FORBIDDEN

    tree = ast.parse((MAGNAV / "ramsey.py").read_text(encoding="utf-8"))
    fns = {n.name: n for n in tree.body if isinstance(n, ast.FunctionDef)}
    par = _parents(tree)

    # (2) servo_track: B_servo is only read inside a window_phase(...) call and never rebound
    st = fns["servo_track"]
    loads = 0
    for node in ast.walk(st):
        if isinstance(node, ast.Name) and node.id == "B_servo":
            assert isinstance(node.ctx, ast.Load), f"B_servo assigned at line {node.lineno}"
            loads += 1
            anc, ok = par.get(node), False
            while anc is not None and anc is not st:
                if _call_name(anc) == "window_phase":
                    ok = True
                    break
                anc = par.get(anc)
            assert ok, f"B_servo used outside window_phase at line {node.lineno}"
    assert loads >= 1

    # (3) coarse_track: B_at called exactly once, as servo_track's first positional argument
    ct = fns["coarse_track"]
    b_at = [n for n in ast.walk(ct) if isinstance(n, ast.Name) and n.id == "B_at"]
    assert len(b_at) == 1, [n.lineno for n in b_at]
    call = par[b_at[0]]
    assert isinstance(call, ast.Call) and call.func is b_at[0]
    outer = par[call]
    assert _call_name(outer) == "servo_track" and outer.args and outer.args[0] is call
    refs = [n for n in ast.walk(ct) if _call_name(n) == "servo_reference"]
    assert len(refs) == 1
    for arg in list(refs[0].args) + [k.value for k in refs[0].keywords]:
        used = {n.id for n in ast.walk(arg) if isinstance(n, ast.Name)}
        assert not used & {"B_at", "B_k", "B_servo"}, used

    # (4) the old oracle hook is gone
    for fn in fns.values():
        a = fn.args
        params = a.posonlyargs + a.args + a.kwonlyargs
        assert all(p.arg != "tone_mean_at" for p in params), fn.name
