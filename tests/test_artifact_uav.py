"""RunArtifact v2 with scenarios (data/precomputed_uav.json): validity, size, tracks, bindings,
scenario fields, the fixed comparison rule, determinism and validator rejections."""

import copy
import hashlib
import json
from pathlib import Path

import pytest

from magnav.artifact import (
    ESTIMATORS,
    MAX_POINTS,
    UAV_ARTIFACT_PATH,
    VERDICTS,
    build_scenarios_artifact,
    comparison_summary,
    dumps_artifact,
    validate_uav_artifact,
)
from magnav.data import load_provenance
from magnav.synthmap import SYNTH_LABEL
from magnav.uav_pipeline import QSENSOR_MODEL, SCENARIO_ORDER, SCENARIOS, load_model

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / UAV_ARTIFACT_PATH
ROWS = ("dead_reckoning", *ESTIMATORS)


@pytest.fixture(scope="module")
def art():
    return json.loads(PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def model():
    return load_model(str(ROOT / QSENSOR_MODEL))


def _sha(rel):
    return hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()


def test_valid_and_small(art):
    assert validate_uav_artifact(art) == []
    assert PATH.stat().st_size < 2_000_000
    assert b"NaN" not in PATH.read_bytes()
    assert [s["id"] for s in art["scenarios"]] == ["synthetic_100m", "eastern_400m"]
    assert art["default_scenario"] == "synthetic_100m"


def test_tracks_present(art):
    for sc in art["scenarios"]:
        L = sc["line"]
        n = len(L["t"])
        assert 0 < n <= MAX_POINTS
        assert set(L["truth"]) == {"x", "y", "anomaly_nT"}
        assert set(L["dead_reckoning"]) == {"x", "y"}
        assert set(L["estimates"]) == set(ESTIMATORS)
        for v in (*L["truth"].values(), *L["dead_reckoning"].values()):
            assert len(v) == n
        for name, e in L["estimates"].items():
            for k in ("x", "y", "signal_nT", "window_t", "ncc", "accepted"):
                assert k in e, (sc["id"], name, k)
            for k in ("x", "y", "signal_nT"):
                assert len(e[k]) == n, (sc["id"], name, k)
            assert len(e["window_t"]) == len(e["ncc"]) == len(e["accepted"]) > 0
        for name in ROWS:
            assert "cep50_m" in L["metrics"][name] and "pct_under_556" in L["metrics"][name]


def test_motor_and_model_binding(art, model):
    mot = art["motor"]
    assert mot["seed"] == model["seeds"]["shipped_motor_seed"]
    assert mot["seed_str"] == str(model["seeds"]["shipped_motor_seed"])
    for k in ("t_knots", "rpm_knots", "amps_nT", "phases", "A1_nT"):
        assert k in mot
    assert mot["A1_nT"] == model["tone_amplitude_rule"]["A1_nT"]
    assert art["S"] == model["S_default"]
    assert art["model_sha256"] == _sha(QSENSOR_MODEL)
    for sc in art["scenarios"]:
        assert sc["model_file"] == "data/qsensor_model.json"
        assert sc["model_sha256"] == _sha(sc["model_file"])


def test_sensor_provenance(art):
    for sc in art["scenarios"]:
        L = sc["line"]
        n = len(L["t"])
        for k in ("rpm", "tau_ms", "m", "b_ref_nT", "fringe", "ghz_fallback"):
            assert len(L["sensor"][k]) == n, (sc["id"], k)
        P = sc["provenance"]
        assert P["quantum"]["slips"] == 0
        assert P["ghz"]["fine_slips"] == 0
        assert P["ghz"]["n"] == 4
        assert isinstance(P["ghz"]["n_fallback"], int)
        assert isinstance(P["quantum"]["n_fringe"], int)
        assert isinstance(P["baseline"]["ls_drops"], int)
        assert P["quantum"]["max_abs_phi"] <= 0.7854


def test_scenario_fields(art):
    files = load_provenance()["files"]
    keys = ("id", "label", "map_label", "map_caption", "synthetic", "alt_m", "model_file", "model_sha256",
            "map", "notes", "provenance", "line")  # fmt: skip
    for sc in art["scenarios"]:
        for k in keys:
            assert k in sc, (sc["id"], k)
        meta = SCENARIOS[sc["id"]]
        assert sc["line"]["map_file"] == meta["map_file"] == sc["map"]["file"]
        assert sc["map"]["sha256"] == files[meta["map_file"]]["output_sha256"] == _sha(meta["map_file"])
        assert sc["alt_m"] == meta["alt_m"]
        assert sc["synthetic"] is meta["synthetic"]
    syn = art["scenarios"][0]
    assert syn["synthetic"] is True
    assert syn["map"]["seed_str"] == str(syn["map"]["seed"])
    assert syn["map_label"] == SYNTH_LABEL and SYNTH_LABEL in syn["map_caption"]
    assert art["scenarios"][1]["synthetic"] is False


def test_comparison_block(art):
    comp = art["comparison"]
    got = {(r["scenario"], r["estimator"]) for r in comp["rows"]}
    assert got == {(s, e) for s in SCENARIO_ORDER for e in ROWS}
    for r in comp["rows"]:
        for k in ("signal_rmse_nT", "cep50_m", "cep95_m", "pct_under_556", "windows", "matches_lost"):
            assert k in r, (r["scenario"], r["estimator"], k)
        if r["estimator"] == "dead_reckoning":
            assert r["matches_lost"] is None
        else:
            assert r["matches_lost"] == r["windows"] - art["scenarios"][SCENARIO_ORDER.index(r["scenario"])][
                "line"]["metrics"][r["estimator"]]["accepted"]  # fmt: skip
    assert comp["verdict"] in VERDICTS
    assert comp["statement"].startswith("At 100 m on the synthetic map the quantum navigation advantage")
    rebuilt = comparison_summary(art["scenarios"])
    assert json.loads(dumps_artifact(rebuilt)) == comp


def _hand(c100_ls, c100_g, lost100_ls, lost100_g, c400_ls=150.0, c400_g=150.0, lost400_ls=0, lost400_g=0):
    def met(c_ls, c_g, l_ls, l_g):
        base = {"signal_rmse_nT": 12.0, "cep95_m": 400.0, "pct_under_556": 95.0, "windows": 62}
        out = {"dead_reckoning": {"signal_rmse_nT": None, "cep50_m": 900.0, "cep95_m": 2000.0,
                                  "pct_under_556": 30.0, "windows": None, "accepted": None}}  # fmt: skip
        for name, c, lost in (("baseline_ls", c_ls, l_ls), ("baseline_mean", c_ls, l_ls),
                              ("quantum_q1", c_g, l_g), ("quantum_ghz4", c_g, l_g)):  # fmt: skip
            out[name] = dict(base, cep50_m=c, accepted=62 - lost)
        out["quantum_ghz4"]["signal_rmse_nT"] = 0.2
        return out

    return [
        {"id": "synthetic_100m", "line": {"metrics": met(c100_ls, c100_g, lost100_ls, lost100_g)}},
        {"id": "eastern_400m", "line": {"metrics": met(c400_ls, c400_g, lost400_ls, lost400_g)}},
    ]


@pytest.mark.parametrize(
    "args,verdict",
    [
        ((110.0, 100.0, 0, 0), "stays about the same"),  # d_cep = +10.0: inside the tie band
        ((110.1, 100.0, 0, 0), "grows"),  # d_cep = +10.1
        ((90.0, 100.0, 0, 0), "stays about the same"),  # d_cep = -10.0
        ((89.9, 100.0, 0, 0), "shrinks"),  # d_cep = -10.1
        ((100.0, 100.0, 3, 0), "grows"),  # matches-lost advantage grows, CEP tie
        ((100.0, 100.0, 0, 2), "shrinks"),  # matches-lost advantage shrinks, CEP tie
        ((130.0, 100.0, 0, 1), "is mixed"),  # CEP grows, matches lost shrinks
        ((70.0, 100.0, 2, 0), "is mixed"),  # CEP shrinks, matches lost grows
        ((130.0, 100.0, 1, 0), "grows"),
        ((70.0, 100.0, 0, 1), "shrinks"),
    ],
)
def test_comparison_rule_hand_made(args, verdict):
    c = comparison_summary(_hand(*args))
    assert c["verdict"] == verdict, c
    assert c["statement"].startswith(f"At 100 m on the synthetic map the quantum navigation advantage {verdict} ")
    assert "62" in c["statement"] and "0.2 nT at 100 m" in c["statement"]


def test_deterministic_rebuild(scenario_runs):
    files = load_provenance()["files"]
    runs = [scenario_runs[s] for s in SCENARIO_ORDER]
    built = build_scenarios_artifact(runs, [SCENARIOS[s] for s in SCENARIO_ORDER],
                                     [files[SCENARIOS[s]["map_file"]] for s in SCENARIO_ORDER])  # fmt: skip
    assert dumps_artifact(built).encode("utf-8") == PATH.read_bytes()


def test_validator_rejects(art):
    a = copy.deepcopy(art)
    a["schema_version"] = 1
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    del a["scenarios"][0]["line"]["estimates"]["quantum_ghz4"]
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["scenarios"][0]["line"]["truth"]["x"][0] = float("nan")
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["scenarios"][0]["line"]["estimates"]["baseline_ls"]["x"].pop()
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["scenarios"][0]["map_label"] = ""
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["scenarios"][0]["map_caption"] = "Synthetic crustal anomaly map at 100 m."
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["scenarios"][1]["id"] = a["scenarios"][0]["id"]
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["default_scenario"] = "flight_200m"
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["scenarios"][1]["map_caption"] += " " + SYNTH_LABEL
    assert validate_uav_artifact(a)
    a = copy.deepcopy(art)
    a["comparison"]["verdict"] = "wins"
    assert validate_uav_artifact(a)
