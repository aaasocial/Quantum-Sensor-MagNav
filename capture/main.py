"""Forte 1 capture script (Qollab Python project; shipped as the root main.py of
dist/qollab-capture-py.zip, never inside the JS upload).

Builds the frozen 16-qubit packed circuit from data/circuit_freeze.json and submits exactly one
job through magnav.qjob.submit_once (latched, never retried). It prints the job ID as soon as the
submission returns, then the decoded record for data/forte_hardware_run.json between BEGIN/END
markers, which a human copies into the repo. The label comes mechanically from the backend:
"QPU-measured" only on IonQ hardware, otherwise "simulator-sampled proxy".

On Qollab the platform injects a pre-created `backend` global; locally we fall back to Qiskit's
BasicSimulator. Deliberately no main() function: Qollab auto-calls one.
"""

import json
import sys

try:  # locally `python capture/main.py` puts capture/ first on sys.path; add the repo root
    from pathlib import Path

    _root = str(Path(__file__).resolve().parents[1])
    if Path(_root, "magnav").is_dir() and _root not in sys.path:
        sys.path.insert(0, _root)
except NameError:  # no __file__ (e.g. an injected script); magnav/ sits next to main.py
    pass

from magnav import qjob, quantum

FREEZE_PATH = "data/circuit_freeze.json"

if "backend" not in globals():  # local only; on Qollab `backend` is injected
    from qiskit.providers.basic_provider import BasicSimulator

    backend = BasicSimulator()

_job_id = None
try:
    with open(FREEZE_PATH, encoding="utf-8") as f:
        freeze = json.load(f)
    qc = quantum.build_packed_circuit(freeze)
    try:
        sha = quantum.circuit_sha256(qc)
    except Exception as e:  # noqa: BLE001 - qasm3 export unavailable: warn, do not block
        print(f"WARNING: could not recompute circuit_sha256 ({type(e).__name__}: {e})", flush=True)
    else:  # a real check, not an assert: python -O must not be able to disable the provenance guard
        if sha != freeze["circuit_sha256"]:
            raise RuntimeError("built circuit does not match data/circuit_freeze.json; refusing to submit")
    print(f"Circuit {qc.num_qubits} qubits, circuit_sha256 {freeze['circuit_sha256']}", flush=True)

    job, meta = qjob.submit_once(backend, qc, freeze["hw_shots"])
    _job_id = meta["job_id"]
    print(f"JOB_ID {meta['job_id']} BACKEND {meta['backend']} LABEL {meta['bits_label']}", flush=True)

    counts = qjob.collect(job)
    record = qjob.capture_record(meta, counts, freeze)
    print("=== BEGIN forte_hardware_run.json ===")
    print(json.dumps(record, indent=1, sort_keys=True, allow_nan=False))
    print("=== END forte_hardware_run.json ===")
    g = record["ghz_measured"]
    print(f"c1 {g['c1']:.4f}  c2 (GHZ-2) {g['c2']:.4f}  c4 (GHZ-4) {g['c4']:.4f}  "
          f"ancilla_return {g['ancilla_return']}")  # fmt: skip
    print(f"RNG seed (hex) {record['seed_hex']}  label {record['label']}", flush=True)
except Exception as e:  # noqa: BLE001 - report and stop; never resubmit
    print(f"CAPTURE FAILED: {type(e).__name__}: {e}", flush=True)
    if _job_id is not None:
        print(f"JOB_ID {_job_id} (submitted; do not resubmit, fetch its result instead)", flush=True)
