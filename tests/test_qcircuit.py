"""The packed 16-qubit circuit (QS-03/QS-07): width, gate set, level-0 transpile, IonQ serialization,
decoder vs qiskit's marginal_distribution, RNG seed from the histogram, per-block Statevector checks,
GHZ parity marginals and the contrast guard."""

import hashlib
import json
import math
import warnings

import numpy as np
import pytest
from qiskit import transpile
from qiskit.providers.basic_provider import BasicSimulator
from qiskit.quantum_info import Statevector
from qiskit.result import marginal_distribution

from magnav import quantum
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
