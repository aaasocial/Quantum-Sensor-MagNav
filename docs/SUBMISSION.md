# Submission draft (not submitted)

Status: DRAFT. Nothing in this file has been published or submitted. Publishing the Qollab
project and submitting the hackathon form are separate steps that need Eason's explicit
approval in the session where they happen (CLAUDE.md, submission approval gate). The
per-criterion paragraphs are synced with the final README (plan 03-07); the placeholders are
filled once the GitHub repo, the Qollab URL and the video exist.

## Fields

| Field | Value |
|---|---|
| Project title | Quantum MagNav: a Ramsey quantum magnetometer that cancels motor noise before the data exists |
| Theme | Quantum Impact |
| Licence | MIT |
| Repository | https://github.com/aaasocial/Quantum-Sensor-MagNav |
| Qollab project | https://qollab.xyz/u/eehhaa/quantum-magnav-uav-navigation |
| Demo video (2-3 min) | <VIDEO_URL> |
| Builder | Eason (solo) |
| Acknowledgement | This effort is supported by Qollab & IonQ. |

## One-paragraph description

When GPS is jammed, a fixed-wing UAV can still fix its position by matching the crustal
magnetic field it reads against a survey anomaly map (MagNav). Its own motor gets in the way,
adding tones at the RPM harmonics. This project models the magnetometer as a quantum Ramsey
sensor emulated on IonQ through Qollab. The sensor sets its interrogation time from the known
RPM, which places every motor harmonic on a null of its filter function, so the tones cancel
inside the measurement before any data exists. A classical magnetometer with a least-squares
notch, given the same shot budget, is the baseline. Each Run sends one 16-qubit circuit to
IonQ. That circuit holds fixed-phase Ramsey and GHZ calibration probes plus a random-number
block, and the measured random bits choose a motor the sensor has never seen. The page then
flies the UAV over a real anomaly map of eastern Ontario (MagNav.jl Eastern_395, 400 m) and
over a labelled synthetic 100 m map, and compares position error after the jam. The entangled
GHZ-4 fine stage lowers projection noise below what the same number of unentangled qubits
reaches, using contrasts measured on the IonQ Forte 1 QPU. The write-up states exactly what
the quantum hardware did and did not do.

## Per-criterion paragraphs (synced with the final README, plan 03-07)

**Novelty.** Most quantum-sensing demos stop at the sensor. This one puts an emulated Ramsey
magnetometer inside a working GPS-denied navigation pipeline and follows its physics through
to position error. The quantum subroutine is the sensor itself: interrogation timing cancels
interference inside the measurement. Choosing tau = 60/RPM puts every motor harmonic on a null
of the sensor's filter function, so the interference never builds up as phase. The sensor has
two stages. A single-qubit coarse stage keeps the phase in range, and a GHZ-4 fine stage lowers
projection noise per shot by up to n at equal shot budget, until gate error and dephasing erode
it. On every Run, quantum random bits measured in the same single IonQ circuit pick a motor the
sensor has never seen. The limits are listed in the README section "Where it ties or loses".

**Technical execution.** One frozen 16-qubit circuit per Run, using only `h`, `rz`, `cx` and
`measure`, transpiled at `optimization_level=0` so the segmented RZ integral survives in the
submitted job, and decoded from `get_counts()`. It holds three Ramsey fringe probes, a
calibration probe, a GHZ-2 and a GHZ-4 block whose contrast feeds the emulator, and six
random-number qubits whose histogram seeds the Run's motor. The live path ran on the IonQ
Forte 1 remote simulator, and a precomputed replay with identical visuals serves as the
fallback. One QPU job ran on IonQ Forte 1 (`01a12aee-d8a8-7e14-b9aa-b11329aca850`, 500 shots
requested, 504 counted), and its bits seed the replay. The closed-form Ramsey emulator is
cross-checked against Qiskit's `Statevector`. The equal-budget baseline (same S readouts per
sample, the baseline's single-readout noise matched to one Ramsey shot, the same RPM channel)
and the tone amplitude (A1 = 3600 nT, calibrated on the baseline alone at S_ref = 256) were
frozen before any comparison. One deterministic command, `python -m magnav.regen`, regenerates
every number and figure, and two full runs give byte-identical outputs. The project has about
300 automated tests. Negative results are reported alongside the positive ones.

**Impact.** Small drones lose GPS to jamming, and their own motors are the main obstacle to
magnetic navigation. The demo shows the measurement-side fix and how much of it survives. At
S = 256 shots per sample on the synthetic 100 m map (sensitivity study, not survey data; mean
over 8 seeded motors), the signal error is 0.195 nT for GHZ-4 and 0.339 nT for the single
qubit, against 42.7 nT for the baseline, and CEP50 is 150.2 m against 154.8 +/- 5.1 m. With the
motor drawn on IonQ hardware over the real Eastern_395 map at 400 m, GHZ-4 holds 154.7 m CEP50
against 182.2 m for the baseline, and the baseline loses 10 of 62 map matches where GHZ-4 loses
none. The results also mark where the advantage ends. At S = 1024 and 4096 every estimator sits
on the same 150.2 m floor, and at S = 4096 the baseline's signal error (0.085 nT) beats GHZ-4
(0.172 nT). GHZ-4 adds nothing at S = 64. At 100 m on the replay the baseline is 0.9 m better
(149.3 m against 150.2 m). With the RPM withheld, the quantum sensor fails outright (CEP50
7676 m) while the baseline barely changes (155.3 m). The practical lesson is that timing-based
cancellation saves dynamic range and post-processing when the interference frequency is known,
and needs that channel to work. No quantum advantage is claimed: a classical notch applied after
the fact reaches the same downstream benefit.

**Documentation.** The README gives a short demo-first path ("Run Project, then Run" on
Qollab), the results tables, a "Where it ties or loses" section, a what-is-quantum table and the
honest framing sentence. Every claim is tied to a regenerated file (`results/metrics.json`):

- `docs/PHYSICS.md`: filter-function derivation, frozen circuit drawing, equal-budget
  definition, and the GHZ two-stage sensor with the Huelga 1997 / Monz 2011 qualifier.
- `docs/BENCHMARK.md`: every table, including the negative results.
- `docs/QOLLAB_FINDINGS.md`: the in-browser verification and the hardware record.
- `docs/A11Y.md`: the accessibility audit.

The page is keyboard-operable, announces status through aria-live, uses a colour-blind-safe
palette and respects reduced motion. An axe audit of six page states reports zero violations.

## Honesty note

The random bits are physically random only in the QPU job (`01a12aee-d8a8-7e14-b9aa-b11329aca850`,
labelled "QPU-measured"). On the IonQ Forte 1 remote simulator and on Qollab's built-in
simulator they are pseudo-random, and they are labelled "simulator-sampled" everywhere. The
quantum hardware never senses a magnetic field. The phase each probe would accumulate is
computed classically and applied as a virtual RZ gate angle, so the hardware contributes only
projection noise, SPAM and gate error. The quantum computer picks the problem (random bits) and
plays the sensor (emulation). It does not solve the navigation problem better than a classical
computer could.

> The quantum sensor's filter function is a physical fact about how such sensors work; the field it filters here is injected as gate angles rather than felt; the downstream benefit equals that of a classical notch filter, achieved earlier and without consuming dynamic range.

## Before submitting (checklist for plan 03-07 / 03-08)

- [ ] Replace https://github.com/aaasocial/Quantum-Sensor-MagNav, https://qollab.xyz/u/eehhaa/quantum-magnav-uav-navigation and <VIDEO_URL>.
- [x] Bring the four per-criterion paragraphs in line with the final README wording and numbers.
- [ ] Eason approves the Qollab Publish action in-session (checkpoint:human-action).
- [ ] Eason approves the hackathon form submission in-session (checkpoint:human-action).
