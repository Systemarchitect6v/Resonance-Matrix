```markdown
# Phase 2: Frequency Calibration and Navigation Unification

Phase 2 extends the six-vector framework from structural geometry into measurement geometry.

Rather than introducing a new model of propulsion or gravity, this phase investigates whether simultaneous frequency, phase, Doppler, and signal-arrival measurements from multiple onboard sensors can improve autonomous spacecraft navigation.

The objective is to unify several established navigation techniques within a single measurement framework while preserving compatibility with existing navigation systems.

---

## 2.1 Objective

The objective of Phase 2 is to determine whether six spatially separated sensors can continuously estimate a spacecraft's:

- Position
- Velocity
- Orientation
- Direction of travel
- Relative location with respect to multiple celestial or artificial reference sources

The framework is restricted to navigation.

It does not propose a new propulsion mechanism, redefine gravity, or describe the physical nature of space.

Instead, it focuses on improving navigation accuracy through the fusion of multiple independent radio-frequency observations.

---

## 2.2 Unified Navigation Framework

Modern navigation often treats ranging, Doppler tracking, interferometry, inertial navigation, and orbital prediction as separate analytical systems.

This framework treats them as complementary measurements describing the same navigation state.

Each observation provides a constraint rather than a complete solution.

### Frequency

Measured frequency changes provide information about relative radial motion through the Doppler effect.

Frequency measurements constrain velocity.

### Signal Arrival Time

Signals arriving at different sensors at slightly different times provide information about the direction of the incoming wavefront.

Arrival-time measurements constrain geometry.

### Phase

Carrier-phase differences measured across known sensor baselines refine angular measurements beyond timing measurements alone.

Phase measurements constrain direction.

### Multiple Reference Sources

Observations from multiple reference sources create intersecting geometric constraints.

The intersection of these constraints produces the estimated navigation solution.

### Continuous Measurement

Repeated observations continuously update the estimated state of the vehicle.

Navigation therefore becomes a continuous estimation process rather than a sequence of independent calculations.

---

## 2.3 Six-Sensor Navigation Geometry

The proposed navigation architecture distributes six directional sensors across the spacecraft.

Each sensor occupies a different physical location.

Consequently, every external signal reaches each sensor under slightly different geometric conditions.

The navigation computer compares measurements such as:

- Frequency
- Doppler shift
- Carrier phase
- Signal-arrival time
- Signal strength
- Direction of arrival

The known physical separation between sensors forms a set of onboard interferometric baselines.

Let the sensor locations be

$$
\mathbf{b}_1,\mathbf{b}_2,\mathbf{b}_3,\mathbf{b}_4,\mathbf{b}_5,\mathbf{b}_6.
$$

For any pair of sensors, the arrival-time difference is

$$
\Delta\tau_{ij}
=
\frac{(\mathbf{b}_i-\mathbf{b}_j)\cdot\hat{\mathbf{s}}}{c}
+
\epsilon_{\tau},
$$

where

- \(\Delta\tau_{ij}\) is the measured arrival-time difference,
- \(\mathbf{b}_i-\mathbf{b}_j\) is the baseline vector,
- \(\hat{\mathbf{s}}\) is the unit vector pointing toward the signal source,
- \(c\) is the propagation speed,
- \(\epsilon_{\tau}\) represents timing uncertainty.

Carrier-phase measurements may be expressed as

$$
\Delta\phi_{ij}
=
\frac{2\pi}{\lambda}
(\mathbf{b}_i-\mathbf{b}_j)\cdot\hat{\mathbf{s}}
+
2\pi N
+
\epsilon_{\phi},
$$

where

- \(\lambda\) is the signal wavelength,
- \(N\) is the integer phase ambiguity,
- \(\epsilon_{\phi}\) represents phase-measurement uncertainty.

Because numerous sensor pairs exist, the system produces redundant geometric observations.

Those redundant observations improve fault detection, calibration verification, and overall navigation robustness.

---

## 2.4 Navigation State Model

The navigation system estimates a single state vector

$$
\mathbf{x}
=
\begin{bmatrix}
\mathbf{r}\\
\mathbf{v}\\
\mathbf{q}\\
\mathbf{b}_c
\end{bmatrix},
$$

where

- \(\mathbf{r}\) is spacecraft position,
- \(\mathbf{v}\) is spacecraft velocity,
- \(\mathbf{q}\) is spacecraft orientation,
- \(\mathbf{b}_c\) represents clock and instrument biases.

The complete observation vector is

$$
\mathbf{y}
=
\begin{bmatrix}
\Delta f\\
\Delta\phi\\
\Delta\tau
\end{bmatrix},
$$

where

- \(\Delta f\) contains Doppler or frequency observations,
- \(\Delta\phi\) contains carrier-phase observations,
- \(\Delta\tau\) contains signal-arrival-time observations.

The navigation measurements are related to the unknown spacecraft state through

$$
\mathbf{y}
=
h(\mathbf{x},\mathbf{s})
+
\boldsymbol{\epsilon},
$$

where

- \(h(\cdot)\) is the measurement model,
- \(\mathbf{s}\) represents the known reference-source geometry,
- \(\boldsymbol{\epsilon}\) contains measurement uncertainty.

The navigation solution is obtained by minimizing the weighted residual between predicted and observed measurements:

$$
\hat{\mathbf{x}}
=
\arg\min_{\mathbf{x}}
\left(
\mathbf{y}
-
h(\mathbf{x})
\right)^T
\mathbf{R}^{-1}
\left(
\mathbf{y}
-
h(\mathbf{x})
\right),
$$

where \(\mathbf{R}\) is the measurement covariance matrix.

```markdown
---

## 2.5 Six-Vector Residual Calibration

### Purpose

The objective of six-vector residual calibration is to continuously compare predicted sensor observations with measured sensor observations.

Rather than treating each sensor independently, the framework evaluates the complete six-sensor measurement geometry as a single navigation system.

The purpose is to minimize disagreement between the predicted navigation state and the measured observations.

---

### Navigation Residual

For each sensor,

- \(V_i\) represents the measured observation.
- \(U_i\) represents the predicted observation generated by the navigation model.

The navigation residual is therefore

$$
V_i-U_i.
$$

A residual equal to zero indicates agreement between prediction and observation.

A non-zero residual indicates that the current navigation solution no longer completely explains the measured environment.

---

### Six-Vector Balance Equation

The six-vector balance equation is

$$
\sum_{i=1}^{6}(V_i-U_i)(\theta_i)=0.
$$

where

- \(V_i\) is the measured observation,
- \(U_i\) is the predicted observation,
- \(\theta_i\) is the directional weighting assigned to sensor \(i\).

The objective is not to force every sensor to report identical values.

Instead, the objective is to determine whether the complete pattern of measurements remains consistent with the estimated spacecraft state.

Whenever the weighted residual deviates from zero, the navigation solution is updated until the predicted measurements again agree with the observed measurements within the accepted uncertainty limits.

---

### Residual Interpretation

Residuals may originate from several sources, including

- Position error
- Velocity error
- Attitude error
- Clock drift
- Sensor calibration error
- Propagation effects
- Reference-source uncertainty

Because each sensor views the environment from a different physical location, the complete residual pattern contains more information than any individual measurement.

The navigation computer therefore evaluates the collective behavior of all six sensors simultaneously.

---

## 2.6 Reference Sources

The framework is compatible with multiple categories of navigation references.

### Artificial Reference Sources

Examples include

- Earth-based tracking stations
- Navigation satellites
- Dedicated spacecraft beacons
- Cooperative relay spacecraft

These sources provide calibrated timing and frequency references.

---

### Astronomical Radio Sources

Compact astronomical radio emitters with well-characterized positions may provide stable angular reference measurements.

These observations complement conventional ranging techniques by improving directional estimation.

---

### Pulsed Reference Sources

Highly periodic astronomical emitters may provide independent timing references.

Arrival-time measurements from these sources may supplement onboard clock calibration and long-duration autonomous navigation.

---

### Planetary Radio Emissions

Natural planetary emissions may also be evaluated as supplementary navigation references.

However, a detectable planetary emission does not automatically establish a usable navigation coordinate.

A planetary signal should satisfy the following conditions before it is incorporated into the navigation solution:

- Stable source characteristics
- Repeatable spectral behavior
- Sufficient signal strength
- Reliable geometric relationship to the observing spacecraft
- Demonstrated calibration repeatability

Only signals meeting these requirements should be treated as operational navigation references.

---

## 2.7 Integration with Phase 1

Phase 1 and Phase 2 operate together rather than replacing one another.

Phase 1 provides

- Historical trajectory
- Prior state estimates
- Orbital prediction
- Conventional navigation information

Phase 2 continuously compares those predictions against live observations collected by the six-sensor navigation system.

Historical prediction and live measurement therefore become complementary components of a single estimation process.

The navigation solution is continuously refined as additional observations become available.

---

## 2.8 Validation Requirements

The framework does not assume improved navigation accuracy.

Improved performance must be demonstrated through quantitative analysis and experimental validation.

The following investigations are required.

### Sensor Baseline Analysis

Determine whether the physical separation between sensors provides sufficient resolution for meaningful phase and timing measurements.

---

### Clock Stability

Determine the timing precision required to support the desired navigation accuracy.

---

### Phase Ambiguity Resolution

Develop methods for resolving integer phase ambiguity during continuous navigation.

---

### Source Stability

Evaluate the long-term frequency and positional stability of every proposed reference source.

---

### Propagation Modeling

Quantify the effects of plasma, atmosphere, multipath propagation, interference, and other signal distortions.

---

### Error Budget

Construct a complete uncertainty analysis identifying the contribution of every significant error source.

---

### Comparative Performance

Compare the six-vector navigation architecture against existing navigation methods, including

- Two-way ranging
- Doppler tracking
- Delta-DOR
- Very Long Baseline Interferometry (VLBI)
- Optical navigation
- Inertial navigation

The comparison should evaluate

- Position accuracy
- Velocity accuracy
- Orientation accuracy
- Update rate
- Autonomous operation
- Computational requirements
- Fault tolerance

---

### Repeatability

Repeated measurements obtained under identical conditions should produce statistically consistent navigation solutions within the established uncertainty limits.

---

## Summary

Phase 2 introduces a unified navigation architecture based on simultaneous frequency, phase, Doppler, and signal-arrival measurements collected by six spatially separated onboard sensors.

Rather than replacing existing navigation methods, the framework integrates multiple independent observations into a single continuously updated state-estimation process.

The central hypothesis is that the geometric diversity provided by the six-sensor configuration may improve autonomous navigation accuracy through enhanced measurement redundancy, cross-validation, and residual calibration.

Whether this architecture provides measurable advantages over existing navigation systems remains a question for analytical modeling and experimental validation.
```

The resulting estimate represents the navigation state that best explains the complete set of simultaneous observations.
```
