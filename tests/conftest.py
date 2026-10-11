"""Shared session fixtures: the real Eastern_395 tile and the default UAV world on it, plus the
labelled synthetic 100 m map (data/map_synth_100m.npz) and the same racetrack flown at 100 m on it."""

import pytest

from magnav.data import MAP_EASTERN, load_map
from magnav.synthmap import SYNTH_MAP
from magnav.uav import FLIGHT_DEFAULT, build_world


@pytest.fixture(scope="session")
def tile():
    return load_map(MAP_EASTERN)


@pytest.fixture(scope="session")
def world(tile):
    return build_world(tile)


@pytest.fixture(scope="session")
def synth_tile():
    return load_map(SYNTH_MAP)


@pytest.fixture(scope="session")
def world_100m(synth_tile):
    return build_world(synth_tile, dict(FLIGHT_DEFAULT, alt_m=100.0))


@pytest.fixture(scope="session")
def worlds_100m(synth_tile):
    """Roots 0-2 on the synthetic tile, frozen flight copied with alt_m = 100 (never mutated),
    frozen map-error parameters (seed derived per root, as in tests/test_parity.py)."""
    from magnav.uav_pipeline import load_model

    model = load_model()
    flight = dict(model["flight"], alt_m=100.0)
    me = {k: v for k, v in model["map_error"].items() if k != "seed"}
    return {r: build_world(synth_tile, flight, me, r) for r in (0, 1, 2)}


@pytest.fixture(scope="session")
def shipped_runs(tile, synth_tile):
    """One run_uav per scenario with the model's shipped motor (no bits): the reference for the
    live-without-job and Phase 1 invariance tests now that the replay carries the QPU motor."""
    from magnav.uav_pipeline import SCENARIO_ORDER, run_uav

    tiles = {"synthetic_100m": synth_tile, "eastern_400m": tile}
    return {s: run_uav(tile=tiles[s], scenario=s) for s in SCENARIO_ORDER}


@pytest.fixture(scope="session")
def scenario_runs(tile, synth_tile):
    """One motor-on run_uav per scenario per session, shared by every artifact/scenario test
    (defined only after the plan 01.1-02 checkpoint; nothing earlier runs the 100 m comparison)."""
    from magnav.uav_pipeline import SCENARIO_ORDER, replay_bits, run_uav

    tiles = {"synthetic_100m": synth_tile, "eastern_400m": tile}
    bits = replay_bits()  # the replay artifact is seeded from the QPU record (plan 03-01, D-08)
    return {s: run_uav(tile=tiles[s], scenario=s, bits=bits) for s in SCENARIO_ORDER}
