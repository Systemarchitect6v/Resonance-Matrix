# 6-Vector Ontological Framework
## Dynamic Equilibrium in a Continuous-Medium Navigation Model

---

## About the Architect & Methodology

This repository documents the development of a proposed computational framework for navigation, tracking, and state estimation.

The framework began with an ontological question:

> [!NOTE]
> **What assumptions are embedded in the way a navigation system represents the relationship between a moving body and its surrounding environment?**

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

The core hypothesis being tested is:

> **Can environmental and intentional states be represented within one normalized six-component computational state in a way that improves tracking, synchronization, or state estimation relative to a conventional estimator architecture?**

---

# 2. Proposed Contribution and Scope

This work does not propose six-degree-of-freedom mechanics as novel.

It proposes a computational architecture for representing environmental and intentional six-component states within a common normalized state space, resolving their differential during the same update cycle, and testing whether this reduces software-induced translational-rotational phase separation relative to conventional estimator architectures.

The proposed contribution is the combination of:

1. An explicit environmental state vector $\mathbf{V}$,
2. An intentional or commanded state vector $\mathbf{U}$,
3. A normalized six-component differential,
4. A resolving-coordinate state $\boldsymbol{\theta}$, and
5. Common-cycle computational evaluation of translational and rotational interactions.

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

- $\mathbf{V}$ — environmental state,
- $\mathbf{U}$ — intentional or commanded state,
- $\boldsymbol{\theta}$ — resolving-coordinate state.

The basic state differential is:

$$
\Delta \mathbf{V} = \mathbf{V} - \mathbf{U}
$$

Because translational and rotational quantities have different physical units, the current software formulation normalizes the differential before combining the six components:

$$
\boldsymbol{\delta} = D(\mathbf{V} - \mathbf{U})
$$

where $D$ is a normalization operator.

The corresponding constraint residual is:

$$
R = \boldsymbol{\delta}^T \boldsymbol{\theta}
$$

or:

$$
R = \sum_{i=1}^{6} \delta_i \theta_i
$$

The target computational condition is:

$$
R \rightarrow 0
$$

A low value of $R$ does not, by itself, demonstrate that the physical system is correctly modeled, as individual positive and negative components can cancel.

For that reason, the current architecture also retains component-level diagnostics:

$$
\mathbf{e} = \boldsymbol{\delta} \odot \boldsymbol{\theta}
$$

and:

$$
E = \|\mathbf{e}\|_2
$$

The engineering question is therefore not simply whether the equation can be made to equal zero, but whether the six-component representation produces a **better external state estimate** when compared against independently measured ground truth and a conventional estimator.

---

# 6. The Submerged Body: Introducing the Vessel

The Florida Current example becomes relevant to navigation when a vessel is introduced into the flow.

A vessel moving through the current has both:

1. An internally generated or commanded state, and
2. An environmental state influencing its trajectory.

The proposed architecture represents those explicitly.

## 6.1 Environmental State — $\mathbf{V}$

The environmental vector represents the mapped effect of the surrounding environment on the six-component dynamic state.

Raw quantities such as current velocity, pressure, density, or shear cannot simply be inserted into $\mathbf{V}$. They must first be transformed into quantities compatible with the system state being evaluated.

## 6.2 Intentional State — $\mathbf{U}$

The intentional vector represents the commanded or internally generated state of the vessel.

Depending on implementation, this may include:

- commanded translational velocity,
- commanded angular rate,
- propulsion output mapped into state-rate quantities, or
- controller-defined target motion.

## 6.3 Resolving State — $\boldsymbol{\theta}$

The resolving-coordinate vector represents the computational relationship used to evaluate the environmental-intentional differential.

In the current engineering formulation, $\theta_i$ is a **resolver coefficient**. It should not automatically be interpreted as a literal geometric angle on every axis.

---

# 7. Course Over Ground as an Observable Result

Consider a vessel commanded to maintain a particular heading while moving through a cross-current.

The vessel may have:

- a commanded heading,
- a heading through the water, and
- a course over ground.

The difference between commanded motion and observed motion provides an externally measurable quantity against which the architecture can be tested.

The framework does **not** assume that the calculated equilibrium residual proves the vessel's actual trajectory.

Instead:

> **The calculated state must ultimately be compared with independently observed position, velocity, heading, and course-over-ground data.**

A practical validation experiment compares three parallel state outputs:

```mermaid
graph TD
    A[Telemetry & Sensor Inputs] --> B[Conventional Estimator Output]
    A --> C[6-Vector Architecture Output]
    A --> D[Independent Ground Truth]
    
    B --> E{Comparative Evaluation}
    C --> E
    D --> E

---

# Phase 3: Computational Execution & Empirical Benchmarking

## 3.1 Objective
Phase 3 translates the theoretical 6-Vector framework from mathematical formulation into a fully operational computational harness. 

While Phases 1 and 2 define the system ontology and sensor geometry, Phase 3 documents the algorithmic execution of the Python simulation environment. The objective is to evaluate the 6-vector resolver ($\mathbf{V}$, $\mathbf{U}$, $\boldsymbol{\theta}$) against simulated and empirical flow data (e.g., NOAA hydrodynamic telemetry), benchmarking its state-estimation accuracy and software-induced phase delay directly against a conventional Extended Kalman Filter (EKF).

---

## 3.2 Simulation Pipeline Architecture

The executable simulation harness follows a modular computational pipeline. Rather than processing environmental forces as unmodeled process noise ($Q$), the software ingests flow field data and vessel control commands simultaneously within a single update loop.

```mermaid
flowchart LR
    A[Telemetry / Flow Data] -->|Transform| B[Environmental Vector V]
    C[Control Commands] -->|Map State| D[Intentional Vector U]
    
    B --> E[Normalized Differential δ = D V-U]
    D --> E
    
    E --> F[Resolver Array θ]
    F --> G[Equilibrium Evaluation R = δᵀ θ]
    
    G -->|State Feedback| H[Continuous Trajectory & Diagnostics e]
