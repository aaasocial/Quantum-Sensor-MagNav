"""Signal and position metrics (lifted from the sister project: two functions only)."""

import numpy as np

THRESHOLDS_M = (556.0, 1852.0, 3704.0)  # 0.3 nmi (RNP-style), 1 nmi, 2 nmi


def _check_start(n: int, start: int) -> None:
    if not 0 <= int(start) < int(n):
        raise ValueError(f"metric start {start} leaves no samples (line has {n}); line too short for the window")


def signal_metrics(cleaned, mag_1_c, start: int) -> dict:
    _check_start(len(cleaned), start)
    e = np.asarray(cleaned, dtype=np.float64)[start:] - np.asarray(mag_1_c, dtype=np.float64)[start:]
    return {
        "signal_err_std_nT": float(np.std(e - e.mean())),
        "signal_rmse_nT": float(np.sqrt(np.mean(e**2))),
    }


def position_metrics(est_x, est_y, true_x, true_y, start: int) -> dict:
    _check_start(len(est_x), start)
    p = np.hypot(
        np.asarray(est_x, dtype=np.float64)[start:] - np.asarray(true_x, dtype=np.float64)[start:],
        np.asarray(est_y, dtype=np.float64)[start:] - np.asarray(true_y, dtype=np.float64)[start:],
    )
    out = {
        "mean_err_m": float(p.mean()),
        "final_err_m": float(p[-1]),
        "cep50_m": float(np.percentile(p, 50)),
        "cep95_m": float(np.percentile(p, 95)),
    }
    for thr in THRESHOLDS_M:
        out[f"pct_under_{int(thr)}"] = float(100.0 * np.mean(p < thr))
    return out

