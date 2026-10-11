# Submission draft (not submitted)

Status: DRAFT. Nothing in this file has been published or submitted. Publishing the Qollab
project and submitting the hackathon form are separate steps that need Eason's explicit
approval in the session where they happen (CLAUDE.md, submission approval gate). Before
either step, plan 03-07 replaces the placeholders and brings the per-criterion paragraphs in
line with the final README wording.

## Fields

| Field | Value |
|---|---|
| Project title | Quantum MagNav: a Ramsey quantum magnetometer that cancels motor noise before the data exists |
| Theme | Quantum Impact |
| Licence | MIT |
| Repository | <GITHUB_URL> |
| Qollab project | <QOLLAB_URL> |
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

## Per-criterion paragraphs (draft; 03-07 syncs these with the final README)

**Novelty.** Most quantum-sensing demos stop at the sensor. This one puts an emulated Ramsey
magnetometer inside a working GPS-denied navigation pipeline and follows its physics through
to position error. The quantum subroutine is the sensor's filter function: choosing
tau = 60/RPM nulls every motor harmonic by timing, so the interference never builds up as
phase. The sensor has two stages. A single-qubit coarse stage keeps the phase in range, and a
GHZ-4 fine stage cuts projection noise toward the Heisenberg limit. The motor for each Run
comes from random bits measured in the same single IonQ circuit, so the sensor has to deal
with interference it was not tuned on.

**Technical execution.** Each Run sends exactly one circuit of 16 qubits or fewer to IonQ. It
is transpiled at `optimization_level=0` so the segmented RZ integral survives in the submitted
job, uses QIS gates only, and is decoded from `get_counts()`. The live path ran on the IonQ
Forte 1 simulator, and a precomputed replay with identical visuals serves as the fallback. One
500-shot job ran on the Forte 1 QPU (`01a12aee-d8a8-7e14-b9aa-b11329aca850`), and its bits
seed the replay. The equal-budget definition (same S readouts per sample, the baseline's
single-readout noise matched to one Ramsey shot, the same RPM channel) and the tone amplitude
(calibrated on the baseline alone at S_ref = 256) were frozen before any result. One command,
`python -m magnav.regen`, regenerates every number and figure byte-identically. The analytic
emulator is checked against qiskit `Statevector` to 1e-12, and the test suite has about 300
pytest tests.

**Impact.** GPS jamming is a real operational problem, and magnetic-anomaly navigation is one
of the few passive fallbacks. On the real Eastern_395 map at 400 m, with the QPU-measured
motor, the quantum sensor holds a CEP50 of 154.7 m. The notch baseline holds 182.2 m and loses
10 of 62 map matches, where the quantum sensor loses none. At the live budget (S = 256,
8 seeded motors on the synthetic 100 m map) the signal error is 0.195 nT against 42.7 nT, and
CEP50 is 150.2 m against 154.8 +/- 5.1 m. The results also mark where the advantage ends. The
position gain appears only at S of 256 or below. At S = 1024 and 4096 every estimator sits on
the same 150.2 m floor and the baseline's signal error is lower than GHZ-4's. With the RPM
withheld, the quantum sensor fails outright while the baseline barely changes. The practical
lesson is that timing-based cancellation saves dynamic range and post-processing when the
interference frequency is known, and needs that channel to work.

**Documentation.** The README gives a short demo-first path ("Run Project, then Run" on
Qollab), a what-is-quantum table and the honest framing sentence. The long-form docs follow
every number back to the regenerated `results/metrics.json`:

- `docs/PHYSICS.md`: filter-function derivation, frozen circuit drawing, equal-budget
  definition, and the GHZ two-stage sensor with the Huelga 1997 / Monz 2011 qualifier.
- `docs/BENCHMARK.md`: every table, including the negative results.
- `docs/QOLLAB_FINDINGS.md`: the in-browser verification and the hardware record.

The page is keyboard-operable, announces status through aria-live, uses a colour-blind-safe
palette and respects reduced motion.

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

- [ ] Replace <GITHUB_URL>, <QOLLAB_URL> and <VIDEO_URL>.
- [ ] Bring the four per-criterion paragraphs in line with the final README wording and numbers.
- [ ] Eason approves the Qollab Publish action in-session (checkpoint:human-action).
- [ ] Eason approves the hackathon form submission in-session (checkpoint:human-action).
