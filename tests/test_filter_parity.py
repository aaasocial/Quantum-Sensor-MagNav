"""Parity of the page's filter function (web/src/lib/filterFunction.js) with magnav.ramsey.

The JS test file carries a numpy-computed fixture (frequencies, tau, |sinc| values). This test
parses those literals and checks them against ramsey.filter_function, so the JS tests and the
Python model cannot drift apart. When node is available it also evaluates the JS response()
at the same points.
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest

from magnav import ramsey

ROOT = Path(__file__).resolve().parents[1]
JS_TEST = ROOT / "web" / "src" / "lib" / "filterFunction.test.js"
JS_LIB = ROOT / "web" / "src" / "lib" / "filterFunction.js"


def _literal(name):
    text = JS_TEST.read_text(encoding="utf-8")
    m = re.search(rf"const {name} = (\[[^\]]*\]|[0-9.eE+-]+);", text)
    assert m, f"{name} not found in {JS_TEST.name}"
    return json.loads(m.group(1))


def test_fixture_matches_ramsey_filter_function():
    tau = _literal("PARITY_TAU_S")
    f = np.asarray(_literal("PARITY_F_HZ"), dtype=float)
    want = np.asarray(_literal("PARITY_RESPONSE"), dtype=float)
    assert f.size == want.size == 3
    np.testing.assert_allclose(ramsey.filter_function(f, tau), want, rtol=0, atol=1e-12)


@pytest.mark.skipif(shutil.which("node") is None, reason="node not on PATH")
def test_js_response_matches_ramsey():
    tau = 7.629e-3
    f = np.linspace(0.0, 600.0, 61)
    script = (
        f"import {{ response }} from {json.dumps(JS_LIB.as_uri())};"
        f"console.log(JSON.stringify({json.dumps(f.tolist())}.map((x) => response(x, {tau}))));"
    )
    out = subprocess.run(
        ["node", "--input-type=module", "-e", script], capture_output=True, text=True, check=True, timeout=60
    )
    got = np.asarray(json.loads(out.stdout), dtype=float)
    np.testing.assert_allclose(got, ramsey.filter_function(f, tau), rtol=0, atol=1e-12)
