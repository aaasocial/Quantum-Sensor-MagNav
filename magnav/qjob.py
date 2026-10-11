"""The one IonQ job of a Run (QS-03/QS-07): the only `backend.run` in magnav.

Qollab and the hackathon allow exactly one job holding exactly one circuit per Run. `submit_once`
sets a module latch BEFORE calling `backend.run`, so a failed or hung submission still uses up the
Run's job and nothing here ever retries. `quantum_run` caches the decoded result so a second
scenario (or a re-run) in the same process reuses this Run's job and motor.

Never imports qiskit_ionq (present on Qollab only when the IonQ backend is chosen); IonQ is
detected by provider module or backend name, and its version is read from sys.modules.
"""

import json
import sys
from datetime import datetime, timezone

from qiskit import QuantumCircuit, transpile

from magnav import quantum

ALLOWED_SHOTS = (quantum.HW_SHOTS, quantum.JOB_SHOTS_LIVE)
MAX_QUBITS = quantum.N_QUBITS
LABEL_QPU = "QPU-measured"
LABEL_SIM = "simulator-sampled"
DEBIASING = "IonQ default (on for >= 500 shots on QPU)"

_LATCH = {"used": False}
_CACHE = {}


class AlreadyUsed(RuntimeError):
    """This Run's single IonQ job has already been submitted (or attempted)."""


def _now_utc():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _backend_name(backend):
    name = getattr(backend, "name", None)
    if callable(name):
        name = name()
    return str(name or type(backend).__name__)


def is_ionq(backend):
    """IonQ detection by provider module first, backend name as a fallback."""
    module = getattr(type(backend), "__module__", "") or ""
    return module.startswith("qiskit_ionq") or _backend_name(backend).lower().startswith("ionq")


def is_qpu(backend):
    """True only for IonQ hardware (class IonQQPUBackend or a name starting ionq_qpu)."""
    return type(backend).__name__ == "IonQQPUBackend" or _backend_name(backend).lower().startswith("ionq_qpu")


def bits_label(backend):
    return LABEL_QPU if is_qpu(backend) else LABEL_SIM


def _noise_model(backend):
    opts = getattr(backend, "options", None)
    val = getattr(opts, "noise_model", None) if opts is not None else None
    return None if val is None else str(val)


def _version(name):
    mod = sys.modules.get(name)
    return str(getattr(mod, "__version__", "unknown")) if mod is not None else None


def latched():
    return bool(_LATCH["used"])


def cached():
    return dict(_CACHE) if _CACHE else None


def reset_for_tests():
    _LATCH["used"] = False
    _CACHE.clear()


def submit_once(backend, qc, shots):
    """Validate, set the latch, then make the Run's single backend.run with a bare circuit.

    Returns (job, meta). Raises AlreadyUsed on any second call, even after a failure.
    """
    if backend is None:
        raise ValueError("no backend")
    if not isinstance(qc, QuantumCircuit):
        raise ValueError("payload must be a single QuantumCircuit (never a list)")
    if qc.num_qubits > MAX_QUBITS:
        raise ValueError(f"circuit has {qc.num_qubits} qubits; the budget is {MAX_QUBITS}")
    if int(shots) not in ALLOWED_SHOTS or int(shots) != shots:
        raise ValueError(f"shots must be one of {ALLOWED_SHOTS}")
    if _LATCH["used"]:
        raise AlreadyUsed("this Run's IonQ job was already submitted; no retry")
    _LATCH["used"] = True  # before the call: a failed submit still uses up the Run's job
    tqc = transpile(qc, backend, optimization_level=0)
    job = backend.run(tqc, shots=int(shots))
    meta = {
        "job_id": str(job.job_id()),
        "submitted_utc": _now_utc(),
        "backend": _backend_name(backend),
        "backend_class": type(backend).__name__,
        "noise_model": _noise_model(backend),
        "is_qpu": is_qpu(backend),
        "bits_label": bits_label(backend),
        "shots": int(shots),
    }
    return job, meta


def collect(job):
    return {str(k): int(v) for k, v in dict(job.result().get_counts()).items()}


def _default_freeze():
    try:
        return quantum.load_freeze(quantum.CIRCUIT_FREEZE)
    except (OSError, ValueError):
        return quantum.DEFAULT_FREEZE


def quantum_run(backend, shots=quantum.JOB_SHOTS_LIVE, freeze=None):
    """Submit (once), collect and decode; later calls return the cached result with reused True."""
    if _CACHE:
        out = dict(_CACHE)
        out["reused"] = True
        return out
    fz = _default_freeze() if freeze is None else freeze
    qc = quantum.build_packed_circuit(fz)
    job, meta = submit_once(backend, qc, shots)
    counts = collect(job)
    lay = fz["layout"]
    dec = quantum.decode_counts(counts, lay)
    bits = quantum.rng_bits(dec["rng_hist"])
    seed_hex = quantum.seed_hex_from_bits(bits)
    res = {
        "job_id": meta["job_id"],
        "backend": meta["backend"],
        "backend_class": meta["backend_class"],
        "is_qpu": meta["is_qpu"],
        "bits_label": meta["bits_label"],
        "shots": meta["shots"],
        "counts_sum": dec["shots"],
        "submitted_utc": meta["submitted_utc"],
        "timestamp_utc": _now_utc(),
        "rng_hist": dec["rng_hist"],
        "rng_bits": bits,
        "seed_hex": seed_hex,
        "seed_str": str(int(seed_hex, 16)),
        "fringe_p1": [dec["p1"][q] for q in lay["fringe"]],
        "c_hat": quantum.contrasts(dec, lay),
        "ancilla_return": dec["ancilla_return"],
        "circuit_sha256": fz.get("circuit_sha256") or quantum.circuit_sha256(qc),
        "reused": False,
    }
    _CACHE.clear()
    _CACHE.update(res)
    return dict(res)


def capture_record(meta, counts, freeze):
    """The data/forte_hardware_run.json record (printed by capture/main.py, pasted by a human)."""
    lay = freeze["layout"]
    dec = quantum.decode_counts(counts, lay)
    c = quantum.contrasts(dec, lay)
    sha = freeze.get("circuit_sha256") or quantum.circuit_sha256(quantum.build_packed_circuit(freeze))
    rec = {
        "schema_version": 1,
        "label": LABEL_QPU if meta["is_qpu"] else "simulator-sampled proxy",
        "backend": meta["backend"],
        "backend_class": meta["backend_class"],
        "noise_model": meta.get("noise_model"),
        "job_id": meta["job_id"],
        "shots": meta["shots"],
        "counts_sum": dec["shots"],
        "submitted_utc": meta["submitted_utc"],
        "timestamp_utc": _now_utc(),
        "circuit_sha256": sha,
        "debiasing": DEBIASING,
        "ghz_measured": {"c1": c["c1"], "c2": c["c2"], "c4": c["c4"], "ancilla_return": dec["ancilla_return"]},
        "fringe_p1": [dec["p1"][q] for q in lay["fringe"]],
        "seed_hex": quantum.seed_hex_from_bits(quantum.rng_bits(dec["rng_hist"])),
        "versions": {"qiskit": _version("qiskit"), "qiskit_ionq": _version("qiskit_ionq")},
        "counts": {str(k): int(v) for k, v in sorted(counts.items())},
    }
    json.dumps(rec, allow_nan=False)  # fail loudly here rather than in the pasted file
    return rec
