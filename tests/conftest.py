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
