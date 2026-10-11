"""Fake backends for the one-job tests (lifted from the sister test_api_smoke.py, list-form calls)."""

from qiskit.providers.basic_provider import BasicSimulator


class SpySim(BasicSimulator):
    """BasicSimulator that records every run() payload (keeps a real Target)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.calls = []

    def run(self, run_input, **kw):
        self.calls.append(run_input)
        return super().run(run_input, **kw)


class FakeIonQSim(SpySim):
    """Looks like a qiskit-ionq backend by provider module; the name is settable."""

    __module__ = "qiskit_ionq.fake"

    def __init__(self, name="ionq_simulator", *a, **kw):
        super().__init__(*a, **kw)
        self.name = name


class IonQNamedSim(SpySim):
    """Detected by name only (module is this test file)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.name = "ionq_simulator"


class BoomSim(BasicSimulator):
    """Records the payload, then fails like a rejected submission."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.calls = []

    def run(self, run_input, **kw):
        self.calls.append(run_input)
        raise RuntimeError("boom")
