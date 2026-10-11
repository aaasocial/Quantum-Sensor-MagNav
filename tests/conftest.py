"""Shared session fixtures: the real Eastern_395 tile and the default UAV world on it."""

import pytest

from magnav.data import MAP_EASTERN, load_map
from magnav.uav import build_world


@pytest.fixture(scope="session")
def tile():
    return load_map(MAP_EASTERN)


@pytest.fixture(scope="session")
def world(tile):
    return build_world(tile)
