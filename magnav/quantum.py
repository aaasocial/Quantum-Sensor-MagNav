"""Qiskit circuit builders for the sensor probes (the only magnav module importing qiskit).

Blocks are unmeasured and use only `h`, `rz` and `cx` (no X pulses: they would turn a
navigation probe into an AC echo sensor that cancels the crust). With RZ(a) = diag(e^{-ia/2},
e^{ia/2}), H RZ(phi) RZ(pi/2) H gives P(1) = (1 + sin phi) / 2, and the GHZ-n block gives
P(1 on q0) = (1 + sin(n phi)) / 2 (Statevector-verified in tests). Phase 2 adds the
block-agnostic packing helpers (one register, RNG block, measure_all) here.
"""

import numpy as np
from qiskit import QuantumCircuit


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
