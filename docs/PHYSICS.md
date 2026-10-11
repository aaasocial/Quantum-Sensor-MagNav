# Physics: the Ramsey sensor, its filter function, the equal budget and the GHZ stage

This is the long-form companion to the README. It describes the sensor model behind every
number in [BENCHMARK.md](BENCHMARK.md): how one Ramsey shot turns a field into a bit, why
choosing the interrogation time from the known RPM nulls the motor tones, how the classical
baseline gets the same budget, and what the entangled (GHZ) fine stage does and does not
buy. Code references point to `magnav/ramsey.py`, `magnav/motor.py`, `magnav/baseline.py` and
the frozen model `data/qsensor_model.json` (sha256 `a10a6f62456eb49458dd42071384b5a51cf00ca388c71702dfce16e5b27ac891`).

The framing sentence that governs everything below:

> The quantum sensor's filter function is a physical fact about how such sensors work; the field it filters here is injected as gate angles rather than felt; the downstream benefit equals that of a classical notch filter, achieved earlier and without consuming dynamic range.

## 1. The Ramsey probe

A spin-1/2 (here the Cs-133 clock transition, gamma = 3.4986 Hz/nT) placed in an equal
superposition precesses in a field B and accumulates a relative phase

    phi = 2 * pi * gamma * integral_{t0}^{t0+tau} B(t) dt

over the interrogation time tau. The emulated sequence on one qubit is

    H  ->  RZ(phi_1) RZ(phi_2) ... RZ(phi_M)  ->  RZ(pi/2)  ->  H  ->  measure

with RZ(a) = diag(e^{-ia/2}, e^{ia/2}). Without the bias, P(1) = sin^2(phi/2), which is flat
at phi = 0. The RZ(pi/2) operating-point bias moves the probe to the steepest point of the
fringe:

    P(1) = (1 + c * sin(phi)) / 2

Here c <= 1 is the contrast. SPAM and gate error shrink the fringe, and the frozen model uses
c1 = 0.98. Given n1 ones in S shots, the estimate is

    phi_hat = arcsin( clip( (2 * n1 / S - 1) / c, -1, 1 ) ),   dB_hat = B_ref + phi_hat / (2 * pi * gamma * tau)

(`ramsey.phi_hat`, `ramsey.estimate_from_counts`). The circuit splits the phase into M
segments only so that the submitted job shows the time integral as a sequence of rotations.
The segments add exactly. The test suite checks the analytic `sin` formula against a qiskit
`Statevector` of each block to 1e-12.

**Projection noise.** Each shot is a Bernoulli trial, so near the bias point

    sigma_phi = 1 / (c * sqrt(S)),   sigma_B = 1 / (2 * pi * gamma * tau * c * sqrt(S)).

At tau = 10 ms, c = 0.98 and S = 256 this gives 0.290 nT, the n = 1 value in
`results/ghz_scaling.csv`. The single-readout noise sigma1 = 1 / (2 * pi * gamma * tau * c)
is what the classical baseline is matched to (section 4).

**Unambiguous range and the tracking reference.** arcsin inverts only phases in
[-pi/2, pi/2], so |dB| * tau <= 1 / (4 * gamma) = 0.0715 nT s, which is about +/-7 nT at
tau = 10 ms. The Eastern_395 tile spans roughly -941 to +2191 nT, so the sensor measures
relative to a tracking (servo) reference. That reference is an IGRF plane fitted offline,
seeded from the map value at the GPS-jam fix, and advanced on 20 ms servo cycles by the linear
predictor `2*Bhat(t-h) - Bhat(t-2h)`. The probe reads only the residual dB = B - B_ref. Servo
windows set the reference and nothing else. Their noise cancels in the output, and they are not
counted in S (this is frozen in the model). A coarse estimate is flagged fringe-risk when
|phi_hat| > pi/4 or when the count is 0 or S.

## 2. The window phase integral and the filter function

The probe sees the crust plus the motor tones. Along track the crust changes slowly
(< 1 Hz at 60 m/s for the map wavelengths that matter), so within one window it contributes
dB * tau. A motor tone A cos(2 pi f t + theta) contributes

    integral = A * [ sin(2 pi f (t0 + tau) + theta) - sin(2 pi f t0 + theta) ] / (2 pi f).

Compared with a DC field of the same amplitude, the size of this response, averaged over
theta, is

    H(f) = | sinc(f * tau) | = | sin(pi f tau) / (pi f tau) |,

with exact nulls at f = k / tau, k = 1, 2, 3, ... This is the Ramsey sensor's filter
function. It is a low-pass that passes the crustal band and is exactly blind at every multiple
of 1/tau. It comes from the way phase-accumulating sensors measure, not from any
post-processing.

**Choosing tau from the RPM.** A motor at R rpm produces tones at f_k = k * R / 60, k = 1..K
(K = 4, with weights 1, 0.5, 0.3, 0.2 of A1). Choosing

    tau = m * 60 / R        (frozen: m = 1, R at the window start)

places every harmonic on a null at once, because f_k * tau = k * m is an integer. The
cancellation happens inside the measurement. The tone phase never accumulates, so it never
appears in the counts, never has to be fitted out afterwards and never uses up the
+/-pi/2 phase range. This is what the README means by cancelling the tones "before the data
exists". It requires the RPM channel. Section 5 and the RPM-withheld row in BENCHMARK.md show
what happens without it.

**Swept RPM.** The motor's RPM follows a piecewise-linear profile (knots every 60 s, prior
4500-9000 RPM). The RPM still changes slightly within one window, so the null is not exact.
The emulator includes this leak. `motor.tone_window_integral` integrates the chirped tones
with 24-point Gauss-Legendre on the exact integrated shaft phase. The constant-RPM closed form,
evaluated at the RPM that picked tau, would be identically zero, so it is used only in tests.
Every number therefore includes the in-window ramp leak.

**The measured figure.** `results/fig_filter_function.png` (data in
`results/filter_function.csv`, summary in `metrics.json["filter_function"]`) plots H(f) in dB
at the shipped motor's median RPM of 6662.29. That gives tau = 9.006 ms, f1 = 111.04 Hz and
nulls at 111.04, 222.08, 333.12, 444.15 and 555.19 Hz. The figure also plots the classical
LS-notch response, measured numerically on one 0.5 s block at S = 256 (read rate 512 Hz).
What the figure shows:

- Both sensors reach the plotted -120 dB floor at all four harmonics.
- Between harmonics the classical baseline rejects more. Its 0.5 s block sits around -45 dB,
  while the sidelobes of the 9 ms Ramsey window reach -13 dB. A random broadband tone would
  leak more into the Ramsey sensor than into the baseline.
- The baseline's read-rate alias at 512 Hz is visible.
- The crustal band is drawn as a nominal 0-1 Hz band and labelled that way, because the frozen
  model has no crustal-band field.

The Ramsey advantage here is therefore specific: exact nulls at the motor harmonics, set by
timing before any readout. It is not a better general-purpose filter.

![Filter function: Ramsey |sinc| vs classical LS notch](../results/fig_filter_function.png)

## 3. What the hardware does, and the circuit

The phase integral is computed classically and written into the circuit as RZ angles. On
IonQ hardware an RZ is applied virtually, by phase tracking in software, so no interrogation
time passes on the ion and no field is sensed. The hardware does contribute real state
preparation and measurement (SPAM) error, single- and two-qubit gate error (from the H gates
and the CX ladders of the GHZ blocks) and projection (shot) noise. The emulator uses the same
binomial projection-noise model with contrast c, and the GHZ contrasts measured on hardware
go into the scaling figure (section 6).

The frozen packed circuit of one Run is in `data/circuit_freeze.json`. It has 16 qubits and is
transpiled at `optimization_level=0` so that the segmented RZ stays visible. Each Run makes one
`backend.run` with one bare circuit. The layout:

- q0-q2: fringe calibration probes at fixed phases.
- q3: a calibration qubit.
- q4-q5: GHZ-2.
- q6-q9: GHZ-4.
- q10-q15: the 6-qubit random-number block. Its 64-bin histogram is hashed (SHA-256) into the
  seed that picks this Run's motor.

Every probe phase is fixed and independent of the motor, because the bits that pick the motor
come from the same job. The drawing is `results/circuit.txt`, regenerated by
`python -m magnav.regen`:

```text
# Frozen packed circuit of one Run (data/circuit_freeze.json), logical, pre-transpile
# circuit_sha256 45215a38b2b17c206f657e897ede7e1311332c8996fbbbe232c950ea82212560
# 16 qubits; gates used: h, rz, cx, measure, barrier (rz, h, cx, measure, barrier)
# layout: cal [3], fringe [0, 1, 2], ghz2 [4, 5], ghz4 [6, 7, 8, 9], rng [10, 11, 12, 13, 14, 15]
# transpile optimization_level 0; one backend.run per Run
         ┌───┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌─────────┐   ┌───┐                        ░ ┌─┐
    q_0: ┤ H ├┤ Rz(-π/16) ├┤ Rz(-π/16) ├┤ Rz(-π/16) ├┤ Rz(-π/16) ├┤ Rz(π/2) ├───┤ H ├────────────────────────░─┤M├─────────────────────────────────────────────
         ├───┤└┬──────────┤└┬──────────┤└┬──────────┤└┬──────────┤├─────────┤   ├───┤                        ░ └╥┘┌─┐
    q_1: ┤ H ├─┤ Rz(π/32) ├─┤ Rz(π/32) ├─┤ Rz(π/32) ├─┤ Rz(π/32) ├┤ Rz(π/2) ├───┤ H ├────────────────────────░──╫─┤M├──────────────────────────────────────────
         ├───┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤├─────────┤   ├───┤                        ░  ║ └╥┘┌─┐
    q_2: ┤ H ├─┤ Rz(π/16) ├─┤ Rz(π/16) ├─┤ Rz(π/16) ├─┤ Rz(π/16) ├┤ Rz(π/2) ├───┤ H ├────────────────────────░──╫──╫─┤M├───────────────────────────────────────
         ├───┤ ├─────────┬┘ ├─────────┬┘ └──┬───┬───┘ └──────────┘└─────────┘   └───┘                        ░  ║  ║ └╥┘┌─┐
    q_3: ┤ H ├─┤ Rz(π/2) ├──┤ Rz(π/2) ├─────┤ H ├────────────────────────────────────────────────────────────░──╫──╫──╫─┤M├────────────────────────────────────
         ├───┤ └─────────┘  ├─────────┤  ┌──┴───┴──┐                 ┌───┐                                   ░  ║  ║  ║ └╥┘┌─┐
    q_4: ┤ H ├──────■───────┤ Rz(π/4) ├──┤ Rz(π/2) ├───────■─────────┤ H ├───────────────────────────────────░──╫──╫──╫──╫─┤M├─────────────────────────────────
         └───┘    ┌─┴─┐     ├─────────┤  └─────────┘     ┌─┴─┐       └───┘                                   ░  ║  ║  ║  ║ └╥┘┌─┐
    q_5: ─────────┤ X ├─────┤ Rz(π/4) ├──────────────────┤ X ├───────────────────────────────────────────────░──╫──╫──╫──╫──╫─┤M├──────────────────────────────
         ┌───┐    └───┘     └─────────┘                  └───┘    ┌─────────┐┌─────────┐               ┌───┐ ░  ║  ║  ║  ║  ║ └╥┘┌─┐
    q_6: ┤ H ├──────■────────────■─────────────────────────■──────┤ Rz(π/8) ├┤ Rz(π/2) ├──■────■────■──┤ H ├─░──╫──╫──╫──╫──╫──╫─┤M├───────────────────────────
         └───┘    ┌─┴─┐          │       ┌─────────┐       │      └─────────┘└─────────┘  │    │  ┌─┴─┐└───┘ ░  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
    q_7: ─────────┤ X ├──────────┼───────┤ Rz(π/8) ├───────┼──────────────────────────────┼────┼──┤ X ├──────░──╫──╫──╫──╫──╫──╫──╫─┤M├────────────────────────
                  └───┘        ┌─┴─┐     ├─────────┤       │                              │  ┌─┴─┐└───┘      ░  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
    q_8: ──────────────────────┤ X ├─────┤ Rz(π/8) ├───────┼──────────────────────────────┼──┤ X ├───────────░──╫──╫──╫──╫──╫──╫──╫──╫─┤M├─────────────────────
                               └───┘     └─────────┘     ┌─┴─┐    ┌─────────┐           ┌─┴─┐└───┘           ░  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
    q_9: ────────────────────────────────────────────────┤ X ├────┤ Rz(π/8) ├───────────┤ X ├────────────────░──╫──╫──╫──╫──╫──╫──╫──╫──╫─┤M├──────────────────
         ┌───┐                                           └───┘    └─────────┘           └───┘                ░  ║  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
   q_10: ┤ H ├───────────────────────────────────────────────────────────────────────────────────────────────░──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫─┤M├───────────────
         ├───┤                                                                                               ░  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
   q_11: ┤ H ├───────────────────────────────────────────────────────────────────────────────────────────────░──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫─┤M├────────────
         ├───┤                                                                                               ░  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
   q_12: ┤ H ├───────────────────────────────────────────────────────────────────────────────────────────────░──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫─┤M├─────────
         ├───┤                                                                                               ░  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
   q_13: ┤ H ├───────────────────────────────────────────────────────────────────────────────────────────────░──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫─┤M├──────
         ├───┤                                                                                               ░  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
   q_14: ┤ H ├───────────────────────────────────────────────────────────────────────────────────────────────░──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫─┤M├───
         ├───┤                                                                                               ░  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘┌─┐
   q_15: ┤ H ├───────────────────────────────────────────────────────────────────────────────────────────────░──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫──╫─┤M├
         └───┘                                                                                               ░  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║ └╥┘
meas: 16/═══════════════════════════════════════════════════════════════════════════════════════════════════════╩══╩══╩══╩══╩══╩══╩══╩══╩══╩══╩══╩══╩══╩══╩══╩═
                                                                                                                0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
```

The thousands of navigation windows in a flight are not separate circuits. They run through
the analytic emulator (the `P(1)` formula above plus `numpy` binomial sampling), whose
agreement with qiskit's `Statevector` is tested block by block. The one IonQ job supplies the
motor seed and the measured contrasts.

## 4. The equal-budget definition (frozen before any result)

A comparison means something only if both sensors spend the same budget. The definition is
frozen in `data/qsensor_model.json["equal_budget"]` and was fixed before any benchmark ran:

| Item | Quantum (Ramsey) | Classical baseline |
|---|---|---|
| Readouts per navigation sample (2 Hz) | S Ramsey shots | S magnetometer readouts, evenly spaced over the centred 0.5 s block (read rate 2S Hz) |
| Noise of one readout | one shot at tau_k | sigma1_k = 1 / (2 pi gamma tau_k c1), the noise of one Ramsey shot at the tau_k the quantum sensor uses for that sample (PD-5) |
| RPM channel | the same exact commanded RPM | the same exact commanded RPM |
| Simulation | analytic window integral + binomial counts | readouts simulated sample by sample (PD-6). With an exact RPM channel the closed form is identically zero, so only sample-level simulation exposes guard drops and dropped-harmonic leakage |
| Crust within a sample | frozen at crust(t_k) | frozen at crust(t_k) (same disclosed approximation) |

S is an ensemble size (parallel probes or repeated identical windows), not a number of
sequential shots in one window. On the quantum side the servo windows are excluded from S,
because their noise cancels in the output.

**Baseline filter (PD-4).** The primary baseline is a guarded per-block least-squares notch
(`baseline.ls_notch`). In each 0.5 s block it fits `[1, cos(2 pi k rev), sin(2 pi k rev)]`
for k = 1..4, where rev is the integrated shaft revolutions from the RPM channel, and keeps
the DC term. The fit is block-local with a disclosed 0.25 s look-ahead. It uses no zero-phase
two-pass filtering and no comb filter, because a comb notch also notches DC and removes the
crust. The guard handles harmonics that alias to within 3 Hz of DC at the read rate. Such a
harmonic is collinear with the DC column, so its cos/sin pair is dropped for that block and
counted as an `ls_drop`. At low S (low read rate) many harmonics alias near DC, so both the
drops and the leftover tone power they leave behind grow. BENCHMARK.md reports the drops next
to every baseline RMSE. It also reports a block-mean variant, which is a plain 0.5 s average.

**Tone amplitude (PD-3).** The tone amplitude was not tuned to make the quantum sensor look
good. A1 was calibrated on the baseline alone, at S_ref = 256. The rule sets A1 to the value
at which the guarded-LS baseline's leftover RMS after the jam equals 0.6 x the median
120-sample window std of the true anomaly, taking the median over 5 seeded draws and rounding
to 2 significant figures. The result was A1 = 3600 nT. No quantum estimator ran during the
freeze. The recorded alternative, S_ref = 64, would give A1 = 350 nT, and the model notes say
the live S = 256 demo would then be a tie. The amplitude sweep in BENCHMARK.md covers the
whole range.

**GHZ accounting.** GHZ-n at S shots is compared with n unentangled qubits at S shots each
(equal qubit-shots) and with the baseline magnetometer. The GHZ navigation track spends S
coarse (single-qubit) shots plus S fine (GHZ) shots per sample. The model and BENCHMARK.md
both disclose this, and it is one reason the single-qubit stage is reported separately.

## 5. Without the RPM the sensor fails

When the RPM is withheld, the quantum sensor cannot place its nulls. The emulator then uses
tau0 = 10 ms in every window (m = 0) while the tones are still present. At A1 = 3600 nT the
tone phase at tau0 is far outside the +/-pi/2 range. The probe slips cycles in every window
(1800 slips per flight), and navigation fails (CEP50 7676 m). Without RPM the baseline falls
back to the block mean and barely changes (CEP50 155.3 m vs 154.8 m). This limit of
timing-based cancellation is real, not a tuning artefact: the sensor's advantage depends
entirely on knowing the interference frequency.

## 6. GHZ entangled probes: the two-stage sensor

To run a GHZ-n probe:

1. Prepare n qubits in the GHZ state (|0...0> + |1...1>)/sqrt(2) with H and a CX ladder.
2. Apply RZ(phi) to each qubit.
3. Apply the bias to the first qubit.
4. Unwind the ladder and apply H.
5. Read only the first qubit:

        P(1) = (1 + c_n * sin(n * phi)) / 2.

The state accumulates n times the phase per shot, so at the bias point

    sigma_B(GHZ-n) = 1 / (2 pi gamma tau * n * c_n * sqrt(S))     (Heisenberg-limit scaling, 1/n)
    sigma_B(n unentangled, S shots each) = 1 / (2 pi gamma tau * c * sqrt(n S))   (standard quantum limit, 1/sqrt(n))

In words: entangled probes lower projection noise per shot by up to n at equal shot budget, until gate error and dephasing erode it.

**Why it must be a second stage.** The unambiguous range also shrinks by n, to about
+/-1.8 nT at n = 4 and tau = 10 ms. A GHZ probe on its own would slip on any residual the servo
did not remove. The sensor therefore has two stages. First the servo and a single-qubit coarse
stage (q1) bring the residual inside the range. Then the GHZ-n fine stage (GHZ-4 in the
benchmark) refines it. The switch is frozen in the model. The fine stage runs only when the
static rule pi * c1 * sqrt(S) / (2n) >= 4.5 holds and the coarse sample is not fringe-risk.
Otherwise the coarse estimate is used, and that fallback is counted. At S = 64 the static rule
switches GHZ-4 off (pi * 0.98 * 8 / 8 = 3.08 < 4.5). That is why GHZ-4 and q1 give identical
numbers at S = 64 in BENCHMARK.md.

**Measured scaling** (`results/fig_ghz_scaling.png`, `results/ghz_scaling.csv`, S = 256,
tau0 = 10 ms, 4000 trials):

| n | SQL (nT) | HL (nT) | n unentangled, emulated | GHZ-n, model c_n = 0.98^n | GHZ-n, QPU-measured c_n |
|---|---|---|---|---|---|
| 1 | 0.290 | 0.290 | 0.291 | 0.288 | 0.284 |
| 2 | 0.205 | 0.148 | 0.208 | 0.148 | 0.143 |
| 4 | 0.145 | 0.077 | 0.143 | 0.078 | 0.071 |

The QPU-measured contrasts came from job `01a12aee-d8a8-7e14-b9aa-b11329aca850` (500 shots
requested, 504 counted): c1 = 0.996, c2 = 0.996 and c4 = 1.000. These are higher than the
model default of 0.98^n, so that series sits on or slightly below the HL line. The SQL and HL
lines are drawn with c1 = 0.98. A point below HL therefore means the measured contrast beat
the model contrast, not that the Heisenberg limit was beaten. At about 500 shots the contrast
estimates carry a few tenths of a percent of binomial uncertainty, and IonQ applies its
default debiasing to QPU jobs of 500 or more shots. The IonQ Forte 1 remote simulator returned
contrast 1.000 for GHZ-2 and GHZ-4 on every Run recorded in
[QOLLAB_FINDINGS.md](QOLLAB_FINDINGS.md) (observation O-1), so the degradation shown in the
figure comes from the model defaults, not from the simulator.

![GHZ scaling: SQL vs HL](../results/fig_ghz_scaling.png)

**The qualifier.** The 1/n gain holds only in the ideal, noiseless case.

- Huelga et al. (1997) showed that under uncorrelated (Markovian) dephasing, once the
  interrogation time is optimised, GHZ states give no net gain over the same number of
  unentangled qubits. The reason is that GHZ coherence decays n times faster.
- Monz et al. (2011) measured on trapped ions that under correlated noise, GHZ coherence decays
  as n^2.

Real gains need short windows, low-noise gates and noise that is neither of these worst cases.
In this project the RPM sets the window, rather than an optimisation against dephasing, and the
emulator models only contrast loss (c_n), not time-dependent dephasing. Read the GHZ result as
what equal-shot projection noise looks like with entangled probes at the measured contrast. It
is not a claim that a deployed GHZ magnetometer would beat an unentangled one.

- S. F. Huelga, C. Macchiavello, T. Pellizzari, A. K. Ekert, M. B. Plenio and J. I. Cirac,
  "Improvement of frequency standards with quantum entanglement", Physical Review Letters 79,
  3865 (1997).
- T. Monz, P. Schindler, J. T. Barreiro, M. Chwalla, D. Nigg, W. A. Coish, M. Harlander,
  W. Haensel, M. Hennrich and R. Blatt, "14-qubit entanglement: creation and coherence",
  Physical Review Letters 106, 130506 (2011).

## 7. From signal error to position error

Every sensor feeds the same navigation stage: TERCOM over a 120-sample window, stride 20,
+/-1500 m search, 60 m step and correlation gate 0.85. Leftover tone power raises the
correlation noise floor and can let a wrong offset win. Lower signal error therefore shows up
as fewer lost matches and lower CEP50, but only while the leftover error is comparable to the
anomaly variation inside a window. Once every sensor is well below that level, they all sit on
the same floor set by the map and the INS (150.2 m CEP50 on the synthetic 100 m map in this
benchmark), and further signal gains do not move position error. For that reason BENCHMARK.md
reports signal RMSE and CEP50 separately.
