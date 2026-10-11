"""The packed 16-qubit circuit (QS-03/QS-07): width, gate set, level-0 transpile, IonQ serialization,
decoder vs qiskit's marginal_distribution, RNG seed from the histogram, per-block Statevector checks,
GHZ parity marginals and the contrast guard."""

import hashlib
import json
import math
import subprocess
import warnings
from pathlib import Path

import numpy as np
import pytest
from qiskit import transpile
from qiskit.providers.basic_provider import BasicSimulator
from qiskit.quantum_info import Statevector
from qiskit.result import marginal_distribution

from magnav import quantum, uav_pipeline
from magnav.motor import motor_from_bits
from magnav.quantum import DEFAULT_FREEZE, LAYOUT, PHASES

EXPECTED_OPS = {"rz": 25, "h": 18, "measure": 16, "cx": 8, "barrier": 1}


@pytest.fixture(scope="module")
def packed():
    return quantum.build_packed_circuit(DEFAULT_FREEZE)


@pytest.fixture(scope="module")
def sim_counts(packed):
    sim = BasicSimulator()
    tqc = transpile(packed, sim, optimization_level=0)
    return dict(sim.run(tqc, shots=1024, seed_simulator=7).result().get_counts())


def test_packed_width_and_gates(packed):
    assert packed.num_qubits == 16
    ops = dict(packed.count_ops())
    assert set(ops) <= {"h", "rz", "cx", "measure", "barrier"}
    for bad in ("u", "u1", "p"):
        assert bad not in ops
    assert ops == EXPECTED_OPS
    assert [r.name for r in packed.cregs] == ["meas"]


def test_level0_preserves_ops(packed):
    tqc = transpile(packed, BasicSimulator(), optimization_level=0)
    assert dict(tqc.count_ops()) == dict(packed.count_ops())


def test_ionq_serialization(packed):
    pytest.importorskip("qiskit_ionq")
    from qiskit_ionq import IonQProvider
    from qiskit_ionq.helpers import qiskit_to_ionq

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        ib = IonQProvider("dummy").get_backend("ionq_simulator")
        ib.set_options(noise_model="forte-1")
        tq = transpile(packed, ib, optimization_level=0)
        j = json.loads(qiskit_to_ionq(tq, ib, passed_args={"shots": 1024}))
    assert j["type"] == "ionq.circuit.v1"
    assert j["input"]["qubits"] == 16
    assert {g["gate"] for g in j["input"]["circuit"]} <= {"h", "rz", "x"}


def test_decoder_matches_marginal_distribution(sim_counts):
    tot = sum(sim_counts.values())
    dec = quantum.decode_counts(sim_counts)
    assert dec["shots"] == tot
    for q in (0, 1, 2, 3, 4, 6):
        m = marginal_distribution(sim_counts, indices=[q])
        assert dec["p1"][q] == pytest.approx(m.get("1", 0) / tot, abs=1e-15)
    m6 = marginal_distribution(sim_counts, indices=list(range(10, 16)))
    assert len(dec["rng_hist"]) == 64
    for b in range(64):
        assert dec["rng_hist"][b] == m6.get(format(b, "06b"), 0)
    assert sum(dec["rng_hist"]) == tot

    # space-separated keys decode identically
    spaced = {k[:8] + " " + k[8:]: v for k, v in sim_counts.items()}
    assert quantum.decode_counts(spaced) == dec

    # normalise by sum(counts), never by the requested shots
    trimmed = dict(sim_counts)
    k0 = max(trimmed, key=trimmed.get)
    trimmed[k0] -= 3
    assert sum(trimmed.values()) == 1021
    d2 = quantum.decode_counts(trimmed)
    assert d2["shots"] == 1021
    ones0 = sum(v for k, v in trimmed.items() if k[-1] == "1")
    assert d2["p1"][0] == pytest.approx(ones0 / 1021, abs=1e-15)


def test_decoder_rejects_bad_input():
    with pytest.raises(ValueError):
        quantum.decode_counts({})
    with pytest.raises(ValueError):
        quantum.decode_counts({"0" * 16: 0})
    with pytest.raises(ValueError):
        quantum.decode_counts({"junk": 3})


def test_rng_seed_is_sha256_of_histogram(sim_counts):
    hist = quantum.decode_counts(sim_counts)["rng_hist"]
    bits = quantum.rng_bits(hist)
    assert len(bits) == 1024 and set(bits) <= {"0", "1"}
    seed = motor_from_bits(bits, 900.0, 3600.0).seed
    assert seed == int(hashlib.sha256(bits.encode("ascii")).hexdigest()[:16], 16)
    h2 = list(hist)
    h2[5] += 1
    assert motor_from_bits(quantum.rng_bits(h2), 900.0, 3600.0).seed != seed


def _p1_q0(block):
    return float(Statevector(block).probabilities([0])[1])


def test_statevector_per_block():
    seg = DEFAULT_FREEZE["segments"]
    for phi in PHASES["fringe"]:
        blk = quantum.ramsey_block(phi, seg)
        assert abs(_p1_q0(blk) - (1 + math.sin(phi)) / 2) < 1e-12
    assert abs(_p1_q0(quantum.ramsey_block(PHASES["cal"], 1)) - 1.0) < 1e-12
    for n, key in ((2, "ghz2"), (4, "ghz4")):
        blk = quantum.ghz_block(n, PHASES[key])
        assert blk.num_qubits == n <= 4
        assert abs(_p1_q0(blk) - (1 + math.sin(n * PHASES[key])) / 2) < 1e-12


def test_ghz_parity_marginal(sim_counts):
    dec = quantum.decode_counts(sim_counts)
    assert quantum.contrast_from_p1(dec["p1"][LAYOUT["cal"][0]]) == pytest.approx(1.0)
    assert quantum.contrast_from_p1(dec["p1"][LAYOUT["ghz2"][0]]) == pytest.approx(1.0)
    assert quantum.contrast_from_p1(dec["p1"][LAYOUT["ghz4"][0]]) == pytest.approx(1.0)
    assert dec["ancilla_return"] == {"ghz2": 1.0, "ghz4": 1.0}


def test_contrast_guard():
    assert quantum.contrast_from_p1(1.2) == 1.0
    assert quantum.contrast_from_p1(0.2) == 0.0
    assert quantum.contrast_from_p1(0.75) == pytest.approx(0.5)
    assert quantum.guarded_cn(0.3, default=0.9224) == (0.9224, "default model, not measured")
    assert quantum.guarded_cn(0.91, 0.9224) == (0.91, "measured this Run")
    assert quantum.guarded_cn(None, 0.9224) == (0.9224, "default model, not measured")
    assert quantum.guarded_cn(float("nan"), 0.9224) == (0.9224, "default model, not measured")


def test_fringe_expected():
    exp = quantum.fringe_expected(1.0)
    assert exp == pytest.approx([(1 + np.sin(p)) / 2 for p in PHASES["fringe"]])


# --- D-C circuit freeze (data/circuit_freeze.json, committed alone) -------------------------------

ROOT = Path(__file__).resolve().parents[1]
FREEZE_FILE = ROOT / quantum.CIRCUIT_FREEZE
HW_FILE = "data/forte_hardware_run.json"
MODEL_SHA256 = "a10a6f62456eb49458dd42071384b5a51cf00ca388c71702dfce16e5b27ac891"


def _git(*args) -> str:
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True,
                          check=True).stdout.strip()  # fmt: skip


def _first_commit(path: str) -> str | None:
    out = _git("log", "--format=%H", "--reverse", "--", path)
    return out.splitlines()[0] if out else None


def _strict_ancestor(a: str, b: str) -> bool:
    r = subprocess.run(["git", "-C", str(ROOT), "merge-base", "--is-ancestor", a, b], check=False)
    return r.returncode == 0 and a != b


def test_circuit_freeze():
    assert FREEZE_FILE.exists(), "data/circuit_freeze.json missing"
    freeze = json.loads(FREEZE_FILE.read_text(encoding="utf-8"))
    sha = hashlib.sha256(freeze["qasm3"].encode("utf-8")).hexdigest()
    assert sha == freeze["circuit_sha256"] == quantum.circuit_sha256(quantum.build_packed_circuit(freeze))
    assert freeze["model_sha256"] == uav_pipeline.model_sha256(str(ROOT / uav_pipeline.QSENSOR_MODEL)) == MODEL_SHA256
    assert freeze["model_file"] == uav_pipeline.QSENSOR_MODEL
    assert freeze["layout"] == LAYOUT
    assert freeze["phases"] == PHASES
    assert freeze["n_qubits"] == 16 and freeze["hw_shots"] >= 500
    assert freeze["transpile_optimization_level"] == 0
    assert freeze["c_floor"] == quantum.C_FLOOR


def test_freeze_commit_order():
    if not (ROOT / ".git").exists():
        pytest.skip("no git metadata (e.g. Qollab upload)")
    rel = quantum.CIRCUIT_FREEZE
    F = _first_commit(rel)
    assert F, f"{rel} has no commit"
    assert _git("show", "--name-only", "--format=", F).split() == [rel]
    H = _first_commit(HW_FILE)
    if H:
        assert _strict_ancestor(F, H), f"circuit freeze {F[:7]} not before {HW_FILE} {H[:7]}"
