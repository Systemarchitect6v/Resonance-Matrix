# 6-Vector Ontological Framework
## Dynamic Equilibrium in a Continuous-Medium Navigation Model

---

## About the Architect & Methodology

This repository documents the development of a proposed computational framework for navigation, tracking, and state estimation.

The framework began with an ontological question:

**What assumptions are embedded in the way a navigation system represents the relationship between a moving body and its surrounding environment?**

Rather than beginning by modifying an existing estimator, the development process began by examining those underlying assumptions and then translating the resulting conceptual changes into mathematical and software structures.

The system ontology, navigational parameters, and six-component state logic were conceived and directed by the author. Artificial intelligence has been used as a development tool for mathematical notation, software structuring, technical organization, and iterative review.

This repository serves as a living proof-of-work record documenting the progression from conceptual model to an architecture capable of controlled numerical testing.

---

# 1. The Ontological Audit

Modern navigation systems are highly successful engineering systems. They use coordinate frames, sensor models, disturbance models, estimation algorithms, filtering, and correction processes to produce accurate state estimates from imperfect measurements.

This framework does **not** dispute that empirical success.

Instead, it asks whether some quantities conventionally represented as disturbance, residual error, drift, or external forcing can be represented more directly as part of the computational relationship between:

- the surrounding environment,
- the system's commanded or intentional state,
- and the resulting motion of the system.

The proposed adjustment is therefore primarily architectural.

Rather than treating the environment only as an external disturbance acting on an otherwise isolated state, the framework introduces an explicit **environmental state vector** and evaluates it simultaneously with the system's intentional state.

The question being tested is:

> **Can environmental and intentional states be represented within one normalized six-component computational state in a way that improves tracking, synchronization, or state estimation relative to a conventional estimator architecture?**

---

# 2. Proposed Contribution and Scope

This work does not propose six-degree-of-freedom mechanics as novel.

It proposes a computational architecture for representing environmental and intentional six-component states within a common normalized state space, resolving their differential during the same update cycle, and testing whether this reduces software-induced translational-rotational phase separation relative to conventional estimator architectures.

The proposed contribution is the combination of:

1. an explicit environmental state vector **V**,
2. an intentional or commanded state vector **U**,
3. a normalized six-component differential,
4. a resolving-coordinate state **θ**,
5. and common-cycle computational evaluation of translational and rotational interactions.

Standard 6-DOF kinematics, quaternion attitude propagation, rigid-body mechanics, Kalman filtering, and joint translational-rotational estimation are treated as established engineering practices rather than claimed innovations.

---

# 3. Structural Comparison

| Conventional Engineering Representation | Proposed 6-Vector Representation |
|---|---|
| Environmental effects may enter the navigation solution through disturbance models, sensor residuals, process noise, correction terms, or estimator updates. | Environmental influence is represented explicitly as a six-component state and compared directly with the system's six-component intentional state. |
| Translational and rotational quantities may be represented through different state variables and mathematical structures before being incorporated into a unified solution. | Three translational and three rotational components are evaluated within the same normalized computational update. |
| A state mismatch produces a residual that must be interpreted by the estimator or controller. | The state mismatch itself becomes a principal quantity evaluated by the proposed resolver architecture. |
| Performance depends on the estimator, disturbance model, sensor quality, timing, and propagation model. | Performance remains dependent on those factors, while the architecture tests whether additional translational-rotational phase separation can be reduced. |

---

# 4. The Foundational Observational Case: The Florida Current

## 4.1 Raw Volumetric Data

The original development of this framework used published NOAA Florida Current measurements as an observational starting point.

The Florida Current transports approximately **32.4 Sverdrups** through the Florida Strait, where:

$$
1\ \text{Sv} = 1{,}000{,}000\ \text{m}^3/\text{s}
$$

Farther north, Gulf Stream transport near Cape Hatteras has been reported at approximately **54.2 Sverdrups**.

These values were not used as proof of the proposed navigation architecture.

They were used because they provide a real-world example of a large, continuously moving three-dimensional environmental system whose state changes substantially with geography, boundary conditions, inflow, and surrounding circulation.

## 4.2 Why the Florida Current Was Useful

A current is not adequately described as a single line drawn across a two-dimensional map.

It possesses:

- velocity,
- direction,
- depth,
- density structure,
- pressure gradients,
- shear,
- circulation,
- and spatially varying boundary conditions.

The Florida Current therefore provided a useful physical example for asking:

> **What changes if a moving body's environment is represented as part of the state calculation rather than only as an external disturbance applied to the body?**

The change from approximately **32.4 Sv** to **54.2 Sv** demonstrates that the surrounding flow state cannot be represented by one fixed scalar quantity along the complete trajectory.

The environment itself changes spatially.

---

# 5. From Environmental Observation to the 6-Vector Architecture

The proposed framework represents the interaction using three principal six-component quantities:

- **V** — environmental state,
- **U** — intentional or commanded state,
- **θ** — resolving-coordinate state.

The basic state differential is:

$$
\Delta V = V - U
$$

Because translational and rotational quantities have different physical units, the current software formulation normalizes the differential before combining the six components:

$$
\delta = D(V-U)
$$

where **D** is a normalization operator.

The corresponding constraint residual is:

$$
R = \delta^T\theta
$$

or:

$$
R = \sum_{i=1}^{6}\delta_i\theta_i
$$

The target computational condition is:

$$
R \rightarrow 0
$$

A low value of **R** does not, by itself, demonstrate that the physical system is correctly modeled.

Individual positive and negative components can cancel.

For that reason, the current architecture also retains component-level diagnostics:

$$
e = \delta \odot \theta
$$

and:

$$
E = \|e\|_2
$$

The engineering question is therefore not simply whether the equation can be made to equal zero.

The important question is whether the six-component representation produces a **better external state estimate** when compared against independently measured ground truth and a conventional estimator.

---

# 6. The Submerged Body: Introducing the Vessel

The Florida Current example becomes relevant to navigation when a vessel is introduced into the flow.

A vessel moving through the current has both:

1. an internally generated or commanded state, and
2. an environmental state influencing its trajectory.

The proposed architecture represents those explicitly.

## 6.1 Environmental State — V

The environmental vector represents the mapped effect of the surrounding environment on the six-component dynamic state.

Raw quantities such as current velocity, pressure, density, or shear cannot simply be inserted into **V**.

They must first be transformed into quantities compatible with the system state being evaluated.

## 6.2 Intentional State — U

The intentional vector represents the commanded or internally generated state of the vessel.

Depending on implementation, this may include:

- commanded translational velocity,
- commanded angular rate,
- propulsion output mapped into state-rate quantities,
- or controller-defined target motion.

## 6.3 Resolving State — θ

The resolving-coordinate vector represents the computational relationship used to evaluate the environmental-intentional differential.

In the current engineering formulation, **θ_i is a resolver coefficient**.

It should not automatically be interpreted as a literal geometric angle on every axis.

---

# 7. Course Over Ground as an Observable Result

Consider a vessel commanded to maintain a particular heading while moving through a cross-current.

The vessel may have:

- a commanded heading,
- a heading through the water,
- and a course over ground.

The difference between commanded motion and observed motion provides an externally measurable quantity against which the architecture can be tested.

The framework does **not** assume that the calculated equilibrium residual proves the vessel's actual trajectory.

Instead:

> **The calculated state must ultimately be compared with independently observed position, velocity, heading, and course-over-ground data.**

A practical validation experiment therefore compares:

```text
Conventional Estimator Output
            vs.
6-Vector Architecture Output
            vs.
Independent Ground Truth
```

using the same sensor and environmental inputs.

---

# 8. Dynamic Environmental Change

One motivation for the architecture is the treatment of simultaneous environmental changes.

Suppose a vessel experiences:

- a change in current velocity,
- a directional shear,
- and a rotational moment

during the same measurement interval.

The architecture represents the resulting state difference as one normalized six-component differential:

$$
\delta = D(V-U)
$$

with components corresponding to three translational and three rotational state dimensions.

The proposed advantage is **not** that physical or computational latency disappears.

Sensor sampling, data buses, clock synchronization, numerical computation, actuator response, and estimator execution all require finite time.

The testable hypothesis is narrower:

> **If translational and rotational environmental effects are evaluated from the same timestamp and inside the same state cycle, the architecture may reduce additional software-induced phase separation between those quantities.**

That hypothesis can be measured.

---

# 9. Translational and Rotational State

The dynamic state is represented as:

$$
S =
\begin{bmatrix}
v_x \\
v_y \\
v_z \\
\omega_x \\
\omega_y \\
\omega_z
\end{bmatrix}
$$

where:

- **v_x, v_y, v_z** are translational velocity components,
- **ω_x, ω_y, ω_z** are body angular-rate components.

These rotational state variables should not be confused with **fluid vorticity**.

Fluid vorticity is a property of the environmental velocity field:

$$
\zeta = \nabla \times \mathbf{v}
$$

Environmental vorticity may influence the rotational state of a submerged or airborne vehicle, but an explicit physical mapping is required to convert that field quantity into vehicle angular acceleration or angular-rate response.

This distinction is maintained in the current architecture.

---

# 10. Why Six Components?

The six-component representation allows translational and rotational state differences to be evaluated together.

| Components | State |
|---|---|
| 1–3 | Translational motion |
| 4–6 | Rotational motion |

This is not itself novel. Six-degree-of-freedom representations are standard engineering practice.

The proposed distinction is the **environmental-intentional decomposition** applied across those six components.

Instead of defining only the vehicle state:

$$
S
$$

the architecture explicitly distinguishes:

$$
V = \text{environmental state}
$$

$$
U = \text{intentional state}
$$

and:

$$
\Delta V = V-U
$$

The normalized differential is then evaluated during the same computational cycle.

---

# 11. The Stationary-System Case

The framework can also be examined for a stationary sensor or tracking system.

For a stationary device:

$$
U \approx \text{commanded stationary state}
$$

The system may nevertheless experience changes in:

- temperature,
- vibration,
- atmospheric conditions,
- mechanical stress,
- electromagnetic environment,
- platform motion,
- or sensor bias.

The framework does **not** assume that all such variation represents motion of a universal physical medium.

Instead, the architectural question remains:

> **Can measurable environmental influences be represented explicitly as state variables rather than being handled exclusively as undifferentiated residual noise?**

Some observed variation will remain stochastic noise.

Some may arise from identifiable environmental causes.

The purpose of the architecture is to preserve the possibility of distinguishing those categories rather than assuming in advance that every residual belongs to either one.

---

# 12. From the NOAA Example to an Engineering Benchmark

The Florida Current measurements were an important **developmental test case**, but they are not a substitute for a navigation benchmark.

The NOAA values demonstrate that the environmental system has measurable, spatially changing physical structure.

They do not establish that the proposed six-vector resolver outperforms an existing estimator.

The next engineering test is therefore a controlled comparison.

## Proposed Benchmark

Use one common dataset containing:

- timestamped vehicle state data,
- environmental current or wind measurements,
- commanded motion,
- inertial measurements,
- position measurements,
- attitude measurements,
- and independently determined ground truth.

### Baseline

Run the data through a conventional estimator such as:

- EKF,
- UKF,
- production navigation estimator,
- or another documented state-estimation architecture.

### Proposed Architecture

Run the same input data through the normalized environmental-intentional six-state resolver.

### Compare

Measure:

- position RMSE,
- orientation RMSE,
- course-over-ground error,
- drift rate,
- translational-rotational phase offset,
- sensor-to-output latency,
- numerical stability,
- sensitivity to environmental transients,
- and computational cost.

---

# 13. What Would Constitute Evidence?

The architecture should not be considered successful merely because:

$$
R \approx 0
$$

The resolver is mathematically designed to reduce that residual.

Meaningful evidence requires an **independent observable result**.

Examples include:

- lower ground-truth position error,
- lower attitude error,
- reduced measured phase offset,
- lower drift rate,
- improved environmental-transient response,
- or equivalent accuracy at lower computational cost.

This distinction separates:

**internal mathematical consistency**

from:

**external engineering performance.**

---

# 14. Development Status

The project has progressed through the following stages:

```text
1. Ontological audit
        ↓
2. Continuous-environment interpretation
        ↓
3. NOAA Florida Current observational case
        ↓
4. Environmental / intentional state decomposition
        ↓
5. Six-component software architecture
        ↓
6. Dimensional normalization and resolver formulation
        ↓
7. Conventional-estimator benchmark
```

Stages **1–6** establish the conceptual and computational architecture.

Stage **7** is the critical engineering validation step.

The current claim is deliberately limited:

> **The framework has developed far enough to be implemented and benchmarked. Its performance advantage, if any, must now be established experimentally against an appropriate conventional estimator.**

---

# 15. Conclusion

The 6-Vector Ontological Framework began with a conceptual question about how navigation software represents the relationship between a system and its environment.

That inquiry produced a computational architecture in which environmental influence and system intent are represented explicitly as corresponding six-component states.

The current formulation:

- separates environmental state **V** from intentional state **U**,
- evaluates their differential **ΔV**,
- normalizes translational and rotational quantities before combining them,
- processes all six components during the same state cycle,
- preserves component-level residual information,
- and produces an architecture that can be compared directly with conventional navigation estimators.

The NOAA Florida Current example remains important because it provided the original real-world observational case that motivated the transition toward an explicitly represented environmental state.

It should be understood as the **starting empirical case, not the final proof**.

The next question is an engineering one:

> **When both architectures receive the same real-world telemetry, does the six-vector environmental-intentional representation produce a measurably better navigation solution?**

That question is testable.

And that is the present purpose of this repository.

---

*This repository is actively maintained as an open record of the framework's conceptual development, mathematical formulation, software architecture, and progression toward controlled engineering validation.*
