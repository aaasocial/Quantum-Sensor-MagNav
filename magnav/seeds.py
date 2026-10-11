"""Fixed random-stream keys for every stochastic draw in the project (pure numpy).

Each named stream is `SeedSequence(root, spawn_key=SPAWN_KEYS[name] + extra)`, which equals
the k-th child of `SeedSequence(root).spawn(...)` for a one-element key. The keys are fixed
forever, so adding a shot count S, a new estimator or reordering code never shifts another
draw (01-RESEARCH Pattern 4).

Extra key parts: S for "servo", "q1" and "baseline"; (n, S) for "ghz"; the draw index
(optionally followed by S) for "amp_cal". "motor" is replaced in Phase 2 by the SHA-256 of the
IonQ RNG-block histogram; "test_noise" is for tests only.

Spawn key (10,) is reserved for magnav.synthmap, which derives its map seed directly with SeedSequence(ROOT_SEED, spawn_key=(10,)); it is deliberately not in SPAWN_KEYS so the frozen model's spawn_keys stay equal.
"""

import numpy as np

ROOT_SEED = 0

SPAWN_KEYS = {
    "motor": (1,),
    "map_err": (2,),
    "dr": (3,),
    "servo": (4,),
    "q1": (5,),
    "ghz": (6,),
    "baseline": (7,),
    "amp_cal": (8,),
    "test_noise": (9,),
}


def _seq(root: int, name: str, extra) -> np.random.SeedSequence:
    if name not in SPAWN_KEYS:
        raise KeyError(f"unknown seed stream {name!r}; expected one of {sorted(SPAWN_KEYS)}")
    return np.random.SeedSequence(int(root), spawn_key=SPAWN_KEYS[name] + tuple(int(e) for e in extra))


def stream(root: int, name: str, *extra) -> np.random.Generator:
    """Independent generator for the named stream (plus optional integer key parts)."""
    return np.random.default_rng(_seq(root, name, extra))


def int_seed(root: int, name: str, *extra) -> int:
    """Non-negative 63-bit integer seed for APIs that take an int (e.g. nav.simulate_dr)."""
    return int(_seq(root, name, extra).generate_state(1, dtype=np.uint64)[0] >> np.uint64(1))
