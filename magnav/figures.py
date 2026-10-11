"""Evidence figures for the README (QS-04, METR-05; dev-only, never shipped, never imported in Pyodide).

`render_all(metrics, model, out_dir)` is called by `python -m magnav.regen` after every number is
built and writes, under `out_dir/results/`:

  fig_ladder.png           shots ladder: signal RMSE vs S with the analytic 1/sqrt(S) line, and
                           CEP50 / CEP95 / % under 556 m vs S (mean +/- std over the N draws)
  fig_amp_sweep.png        signal RMSE and CEP50 vs tone amplitude A1, both sensors
  fig_filter_function.png  Ramsey filter function (dB vs Hz) with nulls at k / tau, motor
                           harmonics, the crustal band and the baseline LS-notch response
  fig_ghz_scaling.png      GHZ-n signal RMSE vs n at equal qubit-shots against SQL and HL
  circuit.txt              qiskit text drawing of the frozen packed circuit

`filter_function_data(model)` is pure numpy (no matplotlib): regen always calls it so that
metrics.json and results/filter_function.csv do not depend on --no-figures.

Determinism: matplotlib is imported inside each function with the Agg backend, the default
style, a fixed figsize and dpi, no bbox_inches="tight", and PNG metadata {"Software": None};
no dates, paths or hostnames are drawn. Two runs give the same bytes.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

from magnav import baseline, motor, ramsey
from magnav import uav_pipeline as up

# Okabe-Ito colour-blind-safe palette, consistent with the page.
C_BASE = "#E69F00"
C_QUANT = "#0072B2"
C_GHZ = "#009E73"
C_Q1 = "#CC79A7"
C_GREY = "#555555"
DPI = 150
RC = {"font.size": 9, "axes.titlesize": 10, "legend.fontsize": 7.5, "path.simplify": False}
FF_S = 256  # baseline readouts per block for the filter-function overlay (S_REF)
FF_POINTS = 1001  # 0..5 f1 inclusive, harmonics land exactly on grid points
FF_PHASES = 4  # equally spaced phases: amplitude gain = sqrt(2) * RMS over phases (exact for >= 3)
FF_FLOOR = 1e-6  # -120 dB
CRUST_NOMINAL_HZ = (0.0, 1.0)
PCT_LINE_M = 556.0
EST_STYLE = {
    "baseline_ls": ("Baseline magnetometer + LS notch", C_BASE, "o"),
    "quantum_q1": ("Ramsey sensor, single qubit", C_Q1, "^"),
    "quantum_ghz4": ("Ramsey sensor, GHZ-4", C_QUANT, "s"),
}


def _plt():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    return plt


def _save(plt, fig, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, format="png", dpi=DPI, metadata={"Software": None})
    plt.close(fig)


def _crust_band(model: dict):
    band = model.get("crustal_band_hz") or (model.get("flight") or {}).get("crustal_band_hz")
    if band:
        lo, hi = float(band[0]), float(band[1])
        return (lo, hi), f"crustal band ({lo:g}-{hi:g} Hz)", "model"
    lo, hi = CRUST_NOMINAL_HZ
    return (lo, hi), f"crustal band (nominal {lo:g}-{hi:g} Hz)", "nominal"


# ---------- filter function data (numpy only) ----------


def filter_function_data(model: dict, K: int | None = None) -> dict:
    """Quantum |sinc(f tau)| and the measured baseline LS-notch gain on one block, in dB.

    tau = m * 60 / median RPM of the shipped motor over the flight (m from the frozen tau rule).
    Baseline: for each f, a unit sinusoid at FF_PHASES phases sampled at the S = FF_S readout
    times of one 0.5 s block (constant RPM within the block), passed through baseline.ls_notch
    with the known harmonics; the DC estimate is the leak, amplitude gain = sqrt(2) * RMS.
    """
    K = int(model["baseline"]["K"]) if K is None else int(K)
    m_rule = int(model["tau_rule"]["m"])
    p = up.shipped_motor(model)
    t = np.arange(int(model["flight"]["n"])) / float(model["fs_hz"])
    rpm = float(np.median(motor.rpm_at(p, t)))
    f1 = rpm / 60.0
    tau = float(ramsey.choose_tau(rpm, m_rule)[0])
    f = f1 * np.linspace(0.0, 5.0, FF_POINTS)
    q_db = 20.0 * np.log10(np.maximum(ramsey.filter_function(f, tau), FF_FLOOR))

    S, blk = FF_S, baseline.BLOCK_S
    t_read = -blk / 2 + (np.arange(S) + 0.5) * blk / S
    th = 2 * np.pi * np.arange(FF_PHASES) / FF_PHASES
    T = np.broadcast_to(t_read, (f.size * FF_PHASES, S))
    y = np.cos(2 * np.pi * np.repeat(f, FF_PHASES)[:, None] * t_read[None, :] + np.tile(th, f.size)[:, None])
    bhat, drops = baseline.ls_notch(T, y, f1 * T, np.full(T.shape[0], f1), S / blk, K=K,
                                    fs_nav=float(model["fs_hz"]))  # fmt: skip
    gain = np.sqrt(2.0) * np.sqrt(np.mean(bhat.reshape(f.size, FF_PHASES) ** 2, axis=1))
    b_db = 20.0 * np.log10(np.maximum(gain, FF_FLOOR))

    band, band_label, band_src = _crust_band(model)
    harm = [k * f1 for k in range(1, K + 1)]
    idx = [round(k * (FF_POINTS - 1) / 5) for k in range(1, K + 1)]
    summary = {
        "motor": "shipped",
        "rpm": rpm,
        "f1_hz": f1,
        "tau_s": tau,
        "m": m_rule,
        "null_hz": [k / tau for k in range(1, 6)],
        "harmonic_hz": harm,
        "K": K,
        "baseline": f"ls_notch, S = {S} readouts over one {blk:g} s block (read rate {S / blk:g} Hz), constant RPM",
        "baseline_ls_drops": int(drops),
        "baseline_db_at_harmonics": [float(b_db[i]) for i in idx],
        "quantum_db_at_harmonics": [float(q_db[i]) for i in idx],
        "floor_db": 20.0 * np.log10(FF_FLOOR),
        "crustal_band_hz": list(band),
        "crustal_band_source": band_src,
        "crustal_band_label": band_label,
        "csv": "results/filter_function.csv",
    }
    rows = [[float(f[i]), float(q_db[i]), float(b_db[i])] for i in range(f.size)]
    return {"summary": summary, "header": ["f_hz", "quantum_db", "baseline_ls_db"], "rows": rows}


# ---------- figures ----------


def fig_ladder(metrics: dict, path: Path) -> None:
    plt = _plt()
    b = metrics["benchmark"]
    Ss = sorted(int(s) for s in b["by_S"])
    an = metrics["ladder_analytic_rmse_nT"]
    le = metrics.get("ladder_eastern")
    with plt.style.context("default"), plt.rc_context(RC):
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.0, 4.2))
        for name, (label, col, mk) in EST_STYLE.items():
            mu = [b["by_S"][str(S)]["mean"][name]["signal_rmse_nT"] for S in Ss]
            sd = [b["by_S"][str(S)]["std"][name]["signal_rmse_nT"] for S in Ss]
            ax1.errorbar(Ss, mu, yerr=sd, color=col, marker=mk, ms=5, capsize=3, lw=1.4, label=label)
            ax1.plot(Ss, [an[name][str(S)] for S in Ss], color=col, ls="--", lw=1.0, alpha=0.8)
            if le:
                es = sorted(int(s) for s in le["by_S"])
                ax1.plot(es, [le["by_S"][str(S)]["estimators"][name]["signal_rmse_nT"] for S in es], ls="none",
                         marker=mk, ms=7, mfc="none", mec=col, mew=1.2)  # fmt: skip
        ax1.plot([], [], color=C_GREY, ls="--", lw=1.0, label="analytic 1/sqrt(S), anchored at S = 256")
        if le:
            ax1.plot([], [], ls="none", marker="o", mfc="none", mec=C_GREY, label="Eastern_395 400 m, shipped motor")
        ax1.set_xscale("log", base=2)
        ax1.set_yscale("log")
        ax1.set_xticks(Ss, [str(S) for S in Ss])
        ax1.set_xlabel("shots per navigation sample S")
        ax1.set_ylabel("signal RMSE (nT)")
        ax1.set_title(f"Signal error vs shots ({b['scenario']}, N = {b['N']} draws)")
        ax1.grid(True, which="both", alpha=0.3)
        ax1.legend(loc="upper right")

        for name in ("baseline_ls", "quantum_ghz4"):
            label, col, mk = EST_STYLE[name]
            for key, ls, tag in (("cep50_m", "-", "CEP50"), ("cep95_m", ":", "CEP95")):
                mu = [b["by_S"][str(S)]["mean"][name][key] for S in Ss]
                sd = [b["by_S"][str(S)]["std"][name][key] for S in Ss]
                ax2.errorbar(Ss, mu, yerr=sd, color=col, marker=mk, ms=5, capsize=3, lw=1.4, ls=ls,
                             label=f"{tag}, {label}")  # fmt: skip
            off = 1.06 if name == "baseline_ls" else 0.90
            for S in Ss:
                pct = b["by_S"][str(S)]["mean"][name]["pct_under_556"]
                y95 = b["by_S"][str(S)]["mean"][name]["cep95_m"]
                ax2.annotate(f"{pct:.0f}%", (S, y95 * off), color=col, fontsize=7, ha="center",
                             va="bottom" if off > 1 else "top")  # fmt: skip
            if le:
                es = sorted(int(s) for s in le["by_S"])
                ax2.plot(es, [le["by_S"][str(S)]["estimators"][name]["cep50_m"] for S in es], ls="none", marker=mk,
                         ms=7, mfc="none", mec=col, mew=1.2)  # fmt: skip
        ax2.axhline(PCT_LINE_M, color=C_GREY, ls="-.", lw=0.9, label="556 m (% of fixes under it annotated)")
        if le:
            ax2.plot([], [], ls="none", marker="o", mfc="none", mec=C_GREY, label="Eastern_395 400 m CEP50, shipped motor")
        ax2.set_xscale("log", base=2)
        ax2.set_xticks(Ss, [str(S) for S in Ss])
        ax2.set_xlabel("shots per navigation sample S")
        ax2.set_ylabel("position error (m)")
        ax2.set_title("Navigation error vs shots (mean +/- std)")
        ax2.grid(True, which="both", alpha=0.3)
        ax2.legend(loc="upper right")
        fig.subplots_adjust(left=0.07, right=0.98, bottom=0.12, top=0.92, wspace=0.22)
        _save(plt, fig, path)


def fig_amp_sweep(metrics: dict, path: Path) -> None:
    plt = _plt()
    a = metrics["amp_sweep"]
    pts = a["points"]
    A = [p["A1_nT"] for p in pts]
    with plt.style.context("default"), plt.rc_context(RC):
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.0, 4.0))
        for name, (label, col, mk) in EST_STYLE.items():
            ax1.plot(A, [p["estimators"][name]["signal_rmse_nT"] for p in pts], color=col, marker=mk, lw=1.4,
                     label=label)  # fmt: skip
            ms = {"baseline_ls": 11, "quantum_q1": 8, "quantum_ghz4": 5}[name]  # overlapping points stay visible
            ax2.plot(A, [p["estimators"][name]["cep50_m"] for p in pts], color=col, marker=mk, ms=ms, mfc="none",
                     mew=1.4, lw=1.4, label=label)  # fmt: skip
        for ax in (ax1, ax2):
            ax.axvline(a["frozen_A1_nT"], color=C_GREY, ls=":", lw=1.0, label=f"frozen A1 = {a['frozen_A1_nT']:g} nT")
            ax.set_xlabel("fundamental tone amplitude A1 (nT)")
            ax.grid(True, which="both", alpha=0.3)
            ax.legend(loc="best")
        ax1.set_yscale("log")
        ax1.set_ylabel("signal RMSE (nT)")
        ax1.set_title(f"Signal error vs motor tone amplitude (S = {a['S']})")
        ax2.set_ylabel("CEP50 (m)")
        ax2.set_title(f"Navigation CEP50 vs motor tone amplitude ({a['scenario']})")
        fig.subplots_adjust(left=0.07, right=0.98, bottom=0.12, top=0.92, wspace=0.22)
        _save(plt, fig, path)


def fig_filter_function(ff: dict, path: Path) -> None:
    plt = _plt()
    s = ff["summary"]
    f = np.array([r[0] for r in ff["rows"]])
    q = np.array([r[1] for r in ff["rows"]])
    bl = np.array([r[2] for r in ff["rows"]])
    with plt.style.context("default"), plt.rc_context(RC):
        fig, ax = plt.subplots(figsize=(9.0, 4.4))
        lo, hi = s["crustal_band_hz"]
        ax.axvspan(lo, hi, color=C_GHZ, alpha=0.6, lw=0, label=s["crustal_band_label"])
        ax.annotate(f"{s['crustal_band_label']}: passed at 0 dB by both", xy=(hi, -60), xytext=(f[-1] * 0.06, -100),
                    color=C_GHZ, fontsize=7.5, arrowprops={"arrowstyle": "->", "color": C_GHZ, "lw": 0.9})  # fmt: skip
        for i, fn in enumerate(s["null_hz"]):
            ax.axvline(fn, color=C_GREY, ls=":", lw=0.9, label="Ramsey nulls k / tau" if i == 0 else None)
        ax.plot(f, q, color=C_QUANT, lw=1.6, label=f"Ramsey sensor |sinc(f tau)|, tau = {s['tau_s'] * 1e3:.2f} ms")
        ax.plot(f, bl, color=C_BASE, lw=0.7, alpha=0.9,
                label=f"baseline LS notch (K = {s['K']}), measured on one 0.5 s block at {FF_S} readouts")  # fmt: skip
        ax.plot(s["harmonic_hz"], [0.0] * len(s["harmonic_hz"]), ls="none", marker="v", ms=8, color="#D55E00",
                label=f"motor harmonics k x {s['rpm']:.0f} RPM / 60")  # fmt: skip
        ax.set_xlim(0, f[-1])
        ax.set_ylim(s["floor_db"] - 5, 8)
        ax.set_xlabel("frequency (Hz)")
        ax.set_ylabel("amplitude response (dB)")
        ax.set_title("Filter function: the Ramsey window nulls every motor harmonic before readout")
        ax.grid(True, alpha=0.3)
        ax.legend(loc="lower right")
        fig.subplots_adjust(left=0.08, right=0.98, bottom=0.12, top=0.92)
        _save(plt, fig, path)


def fig_ghz_scaling(metrics: dict, path: Path) -> None:
    plt = _plt()
    g = metrics["ghz_scaling"]
    n = np.array(g["n"], dtype=float)
    nn = np.linspace(1.0, n.max(), 50)
    sql0, hl0 = g["sql_nT"][0], g["hl_nT"][0]
    with plt.style.context("default"), plt.rc_context(RC):
        fig, ax = plt.subplots(figsize=(6.8, 4.6))
        ax.plot(nn, sql0 / np.sqrt(nn), color=C_GREY, ls="--", lw=1.2, label="SQL 1/sqrt(n S)")
        ax.plot(nn, hl0 / nn, color=C_GREY, ls="-", lw=1.2, label="Heisenberg limit 1/(n sqrt(S))")
        ax.plot(n, g["unentangled_nT"], ls="none", marker="^", ms=7, color=C_BASE, label="n unentangled qubits (emulated)")
        ax.plot(n, g["ghz_ideal_nT"], ls="none", marker="o", ms=7, color=C_GHZ,
                label="GHZ emulated, model default c_n = c1^n")  # fmt: skip
        if g.get("ghz_measured_nT"):
            cm = g.get("c_measured") or {}
            job = (metrics.get("inputs") or {}).get("hardware_job_id") or ""
            cs = ", ".join(f"c{k} = {cm[k]:.3f}" for k in ("2", "4") if k in cm)
            ax.plot(n, g["ghz_measured_nT"], ls="none", marker="D", ms=7, mfc="none", mec=C_QUANT, mew=1.5,
                    label=f"GHZ emulated, QPU-measured c_n (job {job[:8]}; {cs})")  # fmt: skip
        ax.set_xscale("log", base=2)
        ax.set_yscale("log")
        ax.set_xticks(list(n), [str(int(v)) for v in n])
        ax.set_xlabel("qubits n (equal qubit-shots)")
        ax.set_ylabel("signal RMSE (nT)")
        ax.set_title(f"GHZ-n vs unentangled at S = {g['S']}, tau0 = {g['tau0_s'] * 1e3:g} ms")
        ax.grid(True, which="both", alpha=0.3)
        ax.legend(loc="lower left")
        fig.subplots_adjust(left=0.12, right=0.97, bottom=0.12, top=0.92)
        _save(plt, fig, path)


def circuit_text() -> str:
    """Text drawing of the frozen packed circuit (rebuilt from data/circuit_freeze.json, hash-checked)."""
    from qiskit.visualization import circuit_drawer

    from magnav import quantum

    fz = quantum.load_freeze()
    qc = quantum.build_packed_circuit(fz)
    sha = quantum.circuit_sha256(qc)
    if sha != fz["circuit_sha256"]:
        raise ValueError(f"rebuilt circuit sha256 {sha} != frozen {fz['circuit_sha256']}")
    drawing = str(circuit_drawer(qc, output="text", fold=-1))
    lay = ", ".join(f"{k} {v}" for k, v in fz["layout"].items())
    head = [
        "# Frozen packed circuit of one Run (data/circuit_freeze.json), logical, pre-transpile",
        f"# circuit_sha256 {fz['circuit_sha256']}",
        f"# {qc.num_qubits} qubits; gates used: {', '.join(fz['gates'])} (rz, h, cx, measure, barrier)",
        f"# layout: {lay}",
        f"# transpile optimization_level {fz['transpile_optimization_level']}; one backend.run per Run",
        "",
    ]
    return "\n".join(head) + "\n".join(line.rstrip() for line in drawing.splitlines()) + "\n"


def render_all(metrics: dict, model: dict, out_dir, ff: dict | None = None) -> list[str]:
    """Write every figure and the circuit drawing under out_dir/results; returns relative paths."""
    res = Path(out_dir) / "results"
    ff = filter_function_data(model) if ff is None else ff
    written = []
    for name, fn in (("fig_ladder.png", lambda p: fig_ladder(metrics, p)),
                     ("fig_amp_sweep.png", lambda p: fig_amp_sweep(metrics, p)),
                     ("fig_filter_function.png", lambda p: fig_filter_function(ff, p)),
                     ("fig_ghz_scaling.png", lambda p: fig_ghz_scaling(metrics, p))):  # fmt: skip
        fn(res / name)
        written.append(f"results/{name}")
    res.mkdir(parents=True, exist_ok=True)
    with open(res / "circuit.txt", "w", encoding="utf-8", newline="\n") as fh:
        fh.write(circuit_text())
    written.append("results/circuit.txt")
    return written
