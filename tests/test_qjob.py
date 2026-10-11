"""qjob: the only backend.run (one job per process, latch set before the call, never retried)."""

import pytest
from qiskit import QuantumCircuit
from qiskit.providers.basic_provider import BasicSimulator

from magnav import qjob, quantum
from tests.fakes import BoomSim, FakeIonQSim, IonQNamedSim, SpySim


@pytest.fixture(autouse=True)
def _fresh_latch():
    qjob.reset_for_tests()
    yield
    qjob.reset_for_tests()


def test_one_run_one_circuit():
    spy = SpySim()
    res = qjob.quantum_run(spy, shots=1024)
    assert len(spy.calls) == 1
    payload = spy.calls[0]
    assert isinstance(payload, QuantumCircuit)
    assert payload.num_qubits <= 16
    assert res["shots"] == 1024 and res["counts_sum"] == 1024
    assert res["reused"] is False
    assert len(res["seed_hex"]) == 16
    assert res["seed_str"] == str(int(res["seed_hex"], 16))
    assert res["c_hat"] == {"c1": 1.0, "c2": 1.0, "c4": 1.0}
    assert res["circuit_sha256"] == quantum.circuit_sha256(quantum.build_packed_circuit())
    assert res["bits_label"] == "simulator-sampled"


def test_shots_kwarg_recorded(monkeypatch):
    seen = {}

    class KwSpy(SpySim):
        def run(self, run_input, **kw):
            seen.update(kw)
            return super().run(run_input, **kw)

    qjob.submit_once(KwSpy(), quantum.build_packed_circuit(), 1024)
    assert seen == {"shots": 1024}


def test_latch_never_retries():
    with pytest.raises(RuntimeError, match="boom"):
        qjob.submit_once(BoomSim(), quantum.build_packed_circuit(), 1024)
    spy = SpySim()
    with pytest.raises(qjob.AlreadyUsed):
        qjob.submit_once(spy, quantum.build_packed_circuit(), 1024)
    assert spy.calls == []


def test_latch_set_before_run():
    boom = BoomSim()
    with pytest.raises(RuntimeError):
        qjob.submit_once(boom, quantum.build_packed_circuit(), 1024)
    assert len(boom.calls) == 1
    assert qjob.latched() is True


def test_two_simulator_runs_differ():
    a = qjob.quantum_run(BasicSimulator(), shots=1024)
    qjob.reset_for_tests()
    b = qjob.quantum_run(BasicSimulator(), shots=1024)
    assert a["seed_hex"] != b["seed_hex"]


def test_cached_reuse():
    spy = SpySim()
    a = qjob.quantum_run(spy, shots=1024)
    b = qjob.quantum_run(spy, shots=1024)
    assert b["reused"] is True
    assert b["seed_hex"] == a["seed_hex"]
    assert len(spy.calls) == 1
    assert qjob.cached()["seed_hex"] == a["seed_hex"]


def test_bits_label():
    assert qjob.bits_label(FakeIonQSim(name="ionq_qpu.forte-1")) == "QPU-measured"
    assert qjob.is_qpu(FakeIonQSim(name="ionq_qpu.forte-1")) is True
    assert qjob.is_ionq(FakeIonQSim()) is True
    assert qjob.bits_label(IonQNamedSim()) == "simulator-sampled"
    assert qjob.is_ionq(IonQNamedSim()) is True
    assert qjob.bits_label(BasicSimulator()) == "simulator-sampled"
    assert qjob.is_ionq(BasicSimulator()) is False


def test_shots_allowlist():
    spy = SpySim()
    with pytest.raises(ValueError):
        qjob.submit_once(spy, quantum.build_packed_circuit(), 999)
    assert spy.calls == []
    assert qjob.latched() is False


def test_rejects_wide_or_non_circuit():
    spy = SpySim()
    with pytest.raises(ValueError):
        qjob.submit_once(spy, QuantumCircuit(17), 1024)
    with pytest.raises(ValueError):
        qjob.submit_once(spy, [quantum.build_packed_circuit()], 1024)
    with pytest.raises(ValueError):
        qjob.submit_once(None, quantum.build_packed_circuit(), 1024)
    assert spy.calls == []


def test_capture_record_schema():
    spy = SpySim()
    qc = quantum.build_packed_circuit()
    job, meta = qjob.submit_once(spy, qc, 500)
    counts = qjob.collect(job)
    rec = qjob.capture_record(meta, counts, quantum.DEFAULT_FREEZE)
    assert rec["schema_version"] == 1
    assert rec["label"] == "simulator-sampled proxy"
    assert rec["shots"] == 500 and rec["counts_sum"] == sum(rec["counts"].values()) == 500
    assert rec["circuit_sha256"] == quantum.circuit_sha256(qc)
    assert rec["job_id"] and isinstance(rec["job_id"], str)
    assert rec["ghz_measured"]["c4"] == 1.0
    assert rec["debiasing"] == "IonQ default (on for >= 500 shots on QPU)"
