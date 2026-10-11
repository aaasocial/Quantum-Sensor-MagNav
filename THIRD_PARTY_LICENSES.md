# Third-party licences and data attribution

This project is released under the MIT License (see `LICENSE`).
This effort is supported by Qollab & IonQ.

## Python dependencies

| Package | Role | Licence |
|---|---|---|
| qiskit | runtime (quantum circuits, Statevector checks) | Apache-2.0 |
| numpy | runtime | BSD-3-Clause |
| scipy | runtime | BSD-3-Clause |
| qiskit-ionq 1.0.2 | development only (offline serialization tests) | Apache-2.0 |
| pytest | development only | MIT |
| ruff | development only | MIT |

## Data

- **Eastern_395 magnetic anomaly map** (`data/map_eastern_395.npz`, a block-mean crop): from MagNav.jl (`ottawa_area_maps`), MIT License, Copyright (c) MIT Lincoln Laboratory. Flown and compiled near Ottawa, Ontario, Canada by Sander Geophysics Ltd. (SGL); upward continued to 395 m and processed with MagNav.jl v1.2.0.
- **SGL 2020 MagNav Challenge data**: provided by the United States Air Force pursuant to Cooperative Agreement Number FA8750-19-2-1000. Reference: A. Gnadt et al., "Signal Enhancement for Magnetic Navigation Challenge Problem", arXiv:2007.12158. Use is subject to the data-sharing terms of that release.

## Web bundle

The licences of the JavaScript packages bundled into `main.js` / `main.css` are appended here in Phase 2, when the web player is added.
