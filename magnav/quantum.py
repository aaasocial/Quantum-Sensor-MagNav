"""Qiskit circuit builders for the sensor probes (the only magnav module importing qiskit).

Blocks are unmeasured and use only `h`, `rz` and `cx` (no X pulses: they would turn a
navigation probe into an AC echo sensor that cancels the crust). With RZ(a) = diag(e^{-ia/2},
e^{ia/2}), H RZ(phi) RZ(pi/2) H gives P(1) = (1 + sin phi) / 2, and the GHZ-n block gives
P(1 on q0) = (1 + sin(n phi)) / 2 (Statevector-verified in tests).

Phase 2 packing: one 16-qubit circuit per Run holds three fringe probes (fixed phases, 4 RZ
segments each), one calibration probe, a GHZ-2 and a GHZ-4 block and a 6-qubit RNG block, measured
into one `meas` register by `measure_all()`. The layout and phases are frozen in
`data/circuit_freeze.json` (D-C) and `circuit_sha256` = sha256 of the qasm3 text of the logical
(pre-transpile) circuit. This module imports no other magnav module: it ships alone in the
Qollab capture zip.
"""

import hashlib
import json
import math

import numpy as np
from qiskit import QuantumCircuit

CIRCUIT_FREEZE = "data/circuit_freeze.json"  # literal: Qollab preloads literal paths only
MODEL_FILE = "data/qsensor_model.json"
N_QUBITS = 16
C_FLOOR = 0.5
JOB_SHOTS_LIVE = 1024
HW_SHOTS = 500
SEGMENTS = 4
GATES = ["h", "rz", "cx", "measure", "barrier"]
SRC_MEASURED = "measured this Run"
SRC_DEFAULT = "default model, not measured"
HASH_METHOD = "sha256(qiskit.qasm3.dumps(logical circuit, pre-transpile)) utf-8"

LAYOUT = {
    "fringe": [0, 1, 2],
    "cal": [3],
    "ghz2": [4, 5],
    "ghz4": [6, 7, 8, 9],
    "rng": [10, 11, 12, 13, 14, 15],
}
PHASES = {
    "fringe": [-math.pi / 4, math.pi / 8, math.pi / 4],
    "cal": math.pi / 2,
    "ghz2": math.pi / 4,
    "ghz4": math.pi / 8,
}
DEFAULT_FREEZE = {"layout": LAYOUT, "phases": PHASES, "segments": SEGMENTS}


def ramsey_block(phi, segments=1):
    """Single-qubit Ramsey probe: H, RZ(phi / segments) x segments, RZ(pi/2) bias, H."""
    qc = QuantumCircuit(1)
    qc.h(0)
    for _ in range(int(segments)):
        qc.rz(float(phi) / int(segments), 0)
    qc.rz(np.pi / 2, 0)
    qc.h(0)
    return qc


def ghz_block(n, phi):
    """GHZ-n probe read on q0: H(q0), CX ladder, RZ(phi) on all, RZ(pi/2) on q0, unwind, H(q0)."""
    n = int(n)
    qc = QuantumCircuit(n)
    qc.h(0)
    for i in range(1, n):
        qc.cx(0, i)
    for i in range(n):
        qc.rz(float(phi), i)
    qc.rz(np.pi / 2, 0)
    for i in reversed(range(1, n)):
        qc.cx(0, i)
    qc.h(0)
    return qc


def load_freeze(path=CIRCUIT_FREEZE):
    """The frozen circuit description (data/circuit_freeze.json)."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_packed_circuit(freeze=None):
    """The one packed circuit of a Run, built only from the freeze dict's layout and phases."""
    fz = DEFAULT_FREEZE if freeze is None else freeze
    lay, ph, seg = fz["layout"], fz["phases"], int(fz["segments"])
    width = 1 + max(q for qs in lay.values() for q in qs)
    qc = QuantumCircuit(width)
    for q, phi in zip(lay["fringe"], ph["fringe"], strict=True):
        qc.compose(ramsey_block(phi, seg), [q], inplace=True)
    qc.compose(ramsey_block(ph["cal"], 1), list(lay["cal"]), inplace=True)
    qc.compose(ghz_block(2, ph["ghz2"]), list(lay["ghz2"]), inplace=True)
    qc.compose(ghz_block(4, ph["ghz4"]), list(lay["ghz4"]), inplace=True)
    qc.h(list(lay["rng"]))
    qc.measure_all(add_bits=True)  # inserts the single barrier, then one `meas` register
    return qc


def circuit_qasm3(qc):
    from qiskit import qasm3  # local import: Pyodide pays only when used

    return qasm3.dumps(qc)


def circuit_sha256(qc):
    """sha256 of the qasm3 text of the logical (pre-transpile) circuit."""
    return hashlib.sha256(circuit_qasm3(qc).encode("utf-8")).hexdigest()


def decode_counts(counts, layout=None):
    """One pass over MSB-left counts: probe P1s, 64-bin RNG histogram, GHZ ancilla return.

    Normalises by sum(counts), never by the requested shots (noisy-sim counts are rounded).
    """
    lay = LAYOUT if layout is None else layout
    if not counts:
        raise ValueError("empty counts")
    tot = sum(int(n) for n in counts.values())
    if tot <= 0:
        raise ValueError("counts sum to zero")
    probes = list(lay["fringe"]) + list(lay["cal"]) + [lay["ghz2"][0], lay["ghz4"][0]]
    ones = dict.fromkeys(probes, 0)
    anc = {"ghz2": 0, "ghz4": 0}
    rr = len(lay["rng"])
    r0 = lay["rng"][0]
    mask = (1 << rr) - 1
    hist = [0] * (1 << rr)
    for key, n in counts.items():
        n = int(n)
        if n < 0:
            raise ValueError("negative count")
        v = int(str(key).replace(" ", ""), 2)
        for q in ones:
            ones[q] += ((v >> q) & 1) * n
        hist[(v >> r0) & mask] += n
        for b in ("ghz2", "ghz4"):
            if all(((v >> q) & 1) == 0 for q in lay[b][1:]):
                anc[b] += n
    return {
        "shots": tot,
        "p1": {q: ones[q] / tot for q in ones},
        "rng_hist": hist,
        "ancilla_return": {b: anc[b] / tot for b in anc},
    }


def rng_bits(hist):
    """Lossless 16-bit-per-bin encoding of the RNG histogram (1024 characters for 64 bins)."""
    return "".join(format(int(c), "016b") for c in hist)


def seed_hex_from_bits(bits):
    """First 64 bits of sha256(bits), as motor.motor_from_bits derives the motor seed."""
    return hashlib.sha256(bits.encode("ascii")).hexdigest()[:16]


def contrast_from_p1(p):
    """c_hat = clip(2p - 1, 0, 1) for a probe biased to the top of the fringe."""
    return float(min(1.0, max(0.0, 2.0 * float(p) - 1.0)))


def guarded_cn(c_hat, default):
    """(value, source): the measured contrast if usable, else the frozen model default."""
    if c_hat is None:
        return float(default), SRC_DEFAULT
    c = float(c_hat)
    if not math.isfinite(c) or c < C_FLOOR:
        return float(default), SRC_DEFAULT
    return c, SRC_MEASURED


def contrasts(dec, layout=None):
    """c1 (calibration probe), c2 (GHZ-2 q0) and c4 (GHZ-4 q0) from decode_counts output."""
    lay = LAYOUT if layout is None else layout
    return {
        "c1": contrast_from_p1(dec["p1"][lay["cal"][0]]),
        "c2": contrast_from_p1(dec["p1"][lay["ghz2"][0]]),
        "c4": contrast_from_p1(dec["p1"][lay["ghz4"][0]]),
    }


def fringe_expected(c1, phases=None):
    """Expected fringe-probe P1 = (1 + c1 sin phi) / 2 (emulator-validation readout)."""
    ph = PHASES if phases is None else phases
    return [(1.0 + float(c1) * math.sin(phi)) / 2.0 for phi in ph["fringe"]]


def freeze_payload(model_sha):
    """The data/circuit_freeze.json dict (D-C): layout, phases, qasm3 text and both hashes."""
    fz = {"layout": LAYOUT, "phases": PHASES, "segments": SEGMENTS}
    qc = build_packed_circuit(fz)
    text = circuit_qasm3(qc)
    return {
        "schema_version": 1,
        "kind": "circuit_freeze",
        "n_qubits": N_QUBITS,
        "layout": LAYOUT,
        "phases": PHASES,
        "segments": SEGMENTS,
        "gates": list(GATES),
        "transpile_optimization_level": 0,
        "job_shots_live": JOB_SHOTS_LIVE,
        "hw_shots": HW_SHOTS,
        "c_floor": C_FLOOR,
        "hash_method": HASH_METHOD,
        "qasm3": text,
        "circuit_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "model_file": MODEL_FILE,
        "model_sha256": str(model_sha),
    }
