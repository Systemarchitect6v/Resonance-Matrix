# Phase 2: Frequency Calibration and Navigation Unification

## 2.1 Objective
Phase 2 extends the six-vector framework from structural geometry into real-time measurement geometry. Rather than proposing a new propulsion mechanism or redefining gravity, this phase investigates whether simultaneous frequency, phase, Doppler, and signal-arrival measurements from six spatially separated onboard sensors can improve autonomous spacecraft state estimation.

The objective is to unify several established navigation techniques—ranging, interferometry, and Doppler tracking—within a single continuous measurement framework while preserving full compatibility with existing aerospace infrastructure.

---

## 2.2 Unified Navigation Architecture

In conventional deep-space operations, observables are divided across distinct processing domains: ground-based DSN tracking loops (Doppler, 2-way ranging, and $\Delta$-DOR interferometry) are evaluated over long batch windows in trajectory suites like NASA/JPL’s MONTE or GSFC’s GMAT, while onboard IMUs and Star Trackers run separate high-rate strapdown estimators.

The **6-Vector Framework** unifies these disparate observables—frequency, carrier-phase delay, arrival timing, and inertial response—into a single, continuous onboard measurement matrix $\mathbf{y} = h(\mathbf{x}, \mathbf{s}) + \boldsymbol{\epsilon}$. By evaluating all six spatial sensor nodes simultaneously, each observable imposes immediate geometric constraints on the unified state vector:

* **Frequency ($\Delta f$):** Measures relative radial velocity via the Doppler effect, constraining the state velocity vector $\mathbf{v}$.
* **Signal Arrival Time ($\Delta\tau$):** Measures spatial wavefront propagation across onboard baselines, constraining absolute position $\mathbf{r}$.
* **Carrier Phase ($\Delta\phi$):** Measures phase differences across known physical sensor baselines ($\mathbf{b}_i - \mathbf{b}_j$), refining orientation $\mathbf{q}$ beyond timing resolution limits.
* **Geometric Intersection:** Cross-correlates multi-source observations (beacons, ground stations, pulsars) to bound state uncertainty natively.

### Architectural Comparison: Standard Navigation vs. Phase 2 Unification

| Navigation Axis | Conventional Aerospace Systems | Phase 2 Multi-Sensor Array |
| :--- | :--- | :--- |
| **Observation Hardware** | Single high-gain antenna or centralized IMU/Star Tracker | Six spatially distributed sensors forming onboard interferometric baselines |
| **Data Processing** | Sequential, independent filter loops for Doppler, range, and star tracking | Simultaneous, unified state estimation matrix $\mathbf{y} = h(\mathbf{x}, \mathbf{s}) + \boldsymbol{\epsilon}$ |
| **Residual Management** | Statistical noise filtering ($Q$) applied to individual sensor channels | Collective 6-vector balance equation $\sum_{i=1}^{6}(V_i - U_i)(\theta_i) = 0$ |

---

## 2.3 Six-Sensor Navigation Geometry

By distributing six directional sensors across the physical structure of the spacecraft ($\mathbf{b}_1, \mathbf{b}_2, \mathbf{b}_3, \mathbf{b}_4, \mathbf{b}_5, \mathbf{b}_6$), every incoming external signal reaches each sensor under distinct geometric conditions. 

The physical separation between sensor pairs forms a set of onboard interferometric baselines. For any pair of sensors $i$ and $j$, the arrival-time difference is modeled as:

$$\Delta\tau_{ij} = \frac{(\mathbf{b}_i - \mathbf{b}_j) \cdot \hat{\mathbf{s}}}{c} + \epsilon_{\tau}$$

Where:
* $\Delta\tau_{ij}$ is the measured signal arrival-time difference between sensors.
* $(\mathbf{b}_i - \mathbf{b}_j)$ represents the baseline vector between sensor positions.
* $\hat{\mathbf{s}}$ is the unit vector pointing toward the reference source.
* $c$ is the signal propagation speed in the local medium.
* $\epsilon_{\tau}$ accounts for timing uncertainty and hardware jitter.

Similarly, carrier-phase measurements across baseline pairs are expressed as:

$$\Delta\phi_{ij} = \frac{2\pi}{\lambda} (\mathbf{b}_i - \mathbf{b}_j) \cdot \hat{\mathbf{s}} + 2\pi N + \epsilon_{\phi}$$

Where $\lambda$ is the signal wavelength, $N$ represents the integer phase ambiguity, and $\epsilon_{\phi}$ is the phase measurement uncertainty.

---

## 2.4 Navigation State Model

The system estimates a unified state vector $\mathbf{x}$ representing the complete physical state of the craft:

$$\mathbf{x} = \begin{bmatrix} \mathbf{r} \\ \mathbf{v} \\ \mathbf{q} \\ \mathbf{b}_c \end{bmatrix}$$

Where $\mathbf{r}$ is spacecraft position, $\mathbf{v}$ is velocity, $\mathbf{q}$ is orientation quaternion, and $\mathbf{b}_c$ contains clock drift and instrument bias terms.

The complete observation vector $\mathbf{y}$ combines all high-rate observables:

$$\mathbf{y} = \begin{bmatrix} \Delta f \\ \Delta\phi \\ \Delta\tau \end{bmatrix} = h(\mathbf{x}, \mathbf{s}) + \boldsymbol{\epsilon}$$

The optimal navigation solution $\hat{\mathbf{x}}$ is continuously derived by minimizing the weighted residual between predicted and observed measurements across the covariance matrix $\mathbf{R}$:

$$\hat{\mathbf{x}} = \arg\min_{\mathbf{x}} \left( \mathbf{y} - h(\mathbf{x}) \right)^T \mathbf{R}^{-1} \left( \mathbf{y} - h(\mathbf{x}) \right)$$

---

## 2.5 Six-Vector Residual Calibration

### Purpose & Residual Definition
Instead of filtering each sensor independently, the framework evaluates the six-sensor array as a closed structural system. For each sensor $i$:
* $V_i$ represents the live measured observation.
* $U_i$ represents the predicted observation generated by the navigation state model.

The local navigation residual is expressed as $(V_i - U_i)$. A residual of zero indicates perfect agreement between state prediction and physical observation.

### The Balance Equation
To evaluate whether the collective measurement pattern remains consistent with conservation, the system applies the six-vector balance equation:

$$\sum_{i=1}^{6} (V_i - U_i)(\theta_i) = 0$$

Where $\theta_i$ represents the directional weighting assigned to sensor $i$. Whenever the weighted residual sum deviates from zero, the system updates the estimated state vector $\hat{\mathbf{x}}$ until local observations reconcile with the overarching navigation model.

---

## 2.6 Reference Sources

The architecture dynamically integrates observables across multiple reference categories:

1. **Artificial Beacons:** Earth-based tracking stations (Deep Space Network), navigation satellites, and cooperative relay craft providing calibrated timing references.
2. **Astronomical Emitters:** Compact radio sources and pulsars providing highly stable, independent angular and timing references for long-duration autonomy.
3. **Planetary Emissions:** Natural planetary radio emissions, provided they meet strict calibration criteria (stable source geometry, repeatable spectral signatures, and verified signal-to-noise ratios).

---

## 2.7 Integration with Phase 1

Phase 1 and Phase 2 operate as complementary layers of a single navigation architecture:

* **Phase 1 (The Baseline Bridge):** Provides prior orbital trajectories, ephemerides, historical state baselines, and initial path predictions.
* **Phase 2 (Frequency Calibration):** Continuously compares Phase 1 predictions against live multi-sensor observations, using real-time residual balance ($\sum (V_i - U_i)(\theta_i) = 0$) to eliminate accumulated drift.

---

## 2.8 Validation Requirements

Demonstrating measurable advantages over conventional Delta-DOR, VLBI, or optical navigation requires rigorous empirical validation across seven key axes:

* **Baseline Separation Analysis:** Quantifying minimum physical sensor spacing required on standard bus frames.
* **Clock & Phase Ambiguity:** Resolving $N$-phase ambiguities during high-dynamic maneuvers and defining oscillator stability limits.
* **Propagation Modeling:** Accounting for ionospheric plasma, multipath interference, and solar wind phase delays.
* **Comparative Performance:** Benchmarking position/velocity accuracy, update rates, and fault tolerance against traditional two-way Doppler tracking.

---

## Summary

Phase 2 unifies simultaneous frequency, carrier phase, Doppler, and timing observables into a single, continuously updated state-estimation process using six spatially separated sensors. By shifting from isolated sensor filtering to a collective residual balance model, Phase 2 provides the real-time measurement layer necessary to continuously calibrate Phase 1 trajectory baselines.
