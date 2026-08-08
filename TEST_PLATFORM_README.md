# 6-Vector Preliminary Experimental Test Platform

A GitHub-native, deterministic proof-of-work implementation for the proposed
**6-Vector Environmental–Intentional State Architecture**.

This package is designed to be dropped into the existing
`Systemarchitect6v/Resonance-Matrix` repository and published with GitHub Pages.

## Why this version exists

The earlier interactive portal depended on a server-side API and an AI model.
That made the public interface dependent on a separate deployment path.

This implementation deliberately removes that dependency.

- No Vercel runtime
- No Gemini/OpenAI/other AI API
- No API key
- No server
- No external JavaScript libraries
- No telemetry upload
- Deterministic equations visible in source
- Manual six-vector input
- CSV telemetry replay
- JSON/CSV result export
- Pure-Python reference implementation
- Standard-library unit tests

The browser implementation and the Python reference implementation use the same
core equations.

## Status

**Preliminary / Experimental**

This repository does not claim that six-degree-of-freedom mechanics are new.
The item under evaluation is the computational architecture that:

1. represents environmental/observed and intentional/commanded six-component
   rate states in a common representation;
2. time-aligns and frame-aligns them before comparison;
3. normalizes translational and rotational quantities into a dimensionless
   metric;
4. evaluates the six normalized components during the same update cycle;
5. retains component-level diagnostics instead of relying only on a scalar
   residual;
6. exposes the calculation for controlled comparison against conventional
   estimators and independent ground truth.

## Core input contract

The platform accepts:

```text
V = [vx, vy, vz, wx, wy, wz]
U = [ux, uy, uz, uwx, uwy, uwz]
```

where the first three values are translational rates and the last three are
angular rates.

The public interface assumes:

- V and U describe the same timestamp/sample;
- V and U are expressed in the same coordinate frame;
- corresponding channels use compatible units;
- translational channels are in m/s;
- angular channels are in rad/s;
- raw pressure, force, field, voltage, sensor-count, or other heterogeneous
  inputs have already been mapped through a physical model into comparable
  rate-state quantities.

The test platform does **not** perform those physical mappings automatically.

## Core equations

### 1. Unnormalized differential

```text
DeltaV = V - U
```

### 2. Normalization

```text
D = diag(1/s1, 1/s2, 1/s3, 1/s4, 1/s5, 1/s6)

delta = D(V - U)
```

The normalization scales `s1...s6` are explicit inputs. This is intentional:
normalization materially affects the relative weighting of the six channels and
must therefore remain inspectable.

Default demonstration scales are:

```text
[1, 1, 1, 0.1, 0.1, 0.1]
```

These are demonstration values only. A serious experiment should select scales
from mission limits, expected operating ranges, sensor statistics, or a defined
covariance/whitening model.

### 3. Reference resolver closure

The scalar condition

```text
delta^T theta = 0
```

does not uniquely determine six resolver components. The platform therefore
implements the documented reference projection:

```text
theta* = theta0 - delta * (delta^T theta0) / (delta^T delta + epsilon)
```

This is a computational closure for testing.

It is **not** evidence that a physical system naturally uses the same projection.

### 4. Companion diagnostics

```text
e = delta ⊙ theta*

R0 = delta^T theta0
R  = sum(e)
E  = ||e||2
G  = ||delta||2
```

- `R0` shows the signed residual before projection.
- `R` shows the signed residual after the selected resolver step.
- `E` measures the magnitude of the six weighted component interactions.
- `G` measures the magnitude of the normalized environmental–intent mismatch.

### Critical interpretation rule

When projection is enabled, `R` is driven toward zero by construction.

Therefore:

> A small post-projection `R` demonstrates satisfaction of the implemented
> algebraic constraint. It does not independently demonstrate navigation
> accuracy, physical equilibrium, reduced drift, or superiority to another
> estimator.

External validation requires independent ground truth and a defined baseline.

## Optional correction interface

The browser also contains a disabled-by-default reference correction harness:

```text
c_i = -K_i * e_i

S*_i = U_i + s_i * c_i
```

This is provided so alternative controller/estimator experiments can be wired
to the residual layer without changing the core diagnostic calculation.

It is **not a validated control law**.

## Directory structure

```text
Resonance-Matrix/
|
|-- docs/
|   |-- index.html
|   |-- styles.css
|   |-- app.js
|   `-- .nojekyll
|
|-- reference/
|   `-- six_vector_reference.py
|
|-- examples/
|   `-- sample_telemetry.csv
|
|-- tests/
|   `-- test_reference.py
|
`-- TEST_PLATFORM_README.md   <- this file
```

## Launch locally

No installation is required for the browser version.

Open:

```text
docs/index.html
```

in a browser.

For the most faithful local web behavior, run a simple static server from the
repository root:

```bash
python -m http.server 8000
```

then browse to:

```text
http://localhost:8000/docs/
```

## Publish with GitHub Pages

This package is intentionally placed in `/docs` so the existing repository can
publish it directly from the `main` branch.

In GitHub:

1. Upload/merge the supplied files into the repository.
2. Open **Settings**.
3. Open **Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select branch **main**.
6. Select folder **/docs**.
7. Save.

The `docs/index.html` file is the page entry point.

GitHub documentation:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Manual test mode

The manual mode exposes all six channels in a table:

| Component | V | U | Scale s | theta0 |
|---|---:|---:|---:|---:|
| X translation | | | | |
| Y translation | | | | |
| Z translation | | | | |
| X angular / roll rate | | | | |
| Y angular / pitch rate | | | | |
| Z angular / yaw rate | | | | |

After execution it exposes the full trace:

```text
DeltaV
delta
theta0
theta*
e
R0
R
E
G
c
S*
```

Nothing is hidden behind an AI-generated interpretation.

## Batch telemetry mode

CSV can be uploaded or pasted.

Canonical schema:

```csv
time,vx,vy,vz,wx,wy,wz,ux,uy,uz,uwx,uwy,uwz
```

Accepted aliases also include common names such as:

```text
omega_x, omega_y, omega_z
roll_rate, pitch_rate, yaw_rate
cmd_vx, cmd_vy, cmd_vz
cmd_roll, cmd_pitch, cmd_yaw
```

The batch runner applies the same normalization scales and `theta0` to each
sample and reports:

- sample count;
- mean G;
- maximum G;
- mean E;
- R0/R per sample;
- E/G per sample;
- a browser-local diagnostic plot;
- downloadable result CSV.

## Python reference implementation

The reference code uses only the Python standard library.

Single built-in demonstration:

```bash
python reference/six_vector_reference.py
```

CSV replay:

```bash
python reference/six_vector_reference.py examples/sample_telemetry.csv
```

Write result CSV:

```bash
python reference/six_vector_reference.py examples/sample_telemetry.csv \
  --output six_vector_results.csv
```

Custom scales:

```bash
python reference/six_vector_reference.py examples/sample_telemetry.csv \
  --scales 1 1 1 0.1 0.1 0.1
```

## Tests

Run:

```bash
python -m unittest tests/test_reference.py
```

The tests verify, among other things:

- a near-zero differential retains `theta0`;
- the reference projection reduces the signed constraint residual;
- component diagnostics remain nonzero even when the post-projection scalar
  residual is near zero;
- the known demonstration vector produces the expected mismatch norm.

## Recommended engineering validation

The public tool is a computation and inspection harness, not the final
validation program.

A controlled evaluation should use the same sensors, propagation assumptions,
and ground truth for both the proposed layer and a selected baseline such as an
EKF, UKF, complementary filter, or production estimator.

Measure at minimum:

- position RMSE and drift rate;
- orientation RMSE;
- translational–rotational phase behavior;
- R, E, and G distributions;
- sensor-to-output latency;
- worst-case execution time;
- normalization sensitivity;
- epsilon sensitivity;
- noise and bias response;
- float32 vs float64 behavior;
- hardware-in-the-loop or recorded telemetry replay.

## Failure modes / limits

Do not interpret internal consistency as external accuracy.

Known limits include:

- scalar residual cancellation;
- normalization dependence;
- resolver underdetermination;
- incorrect frame transformation;
- timestamp misalignment;
- input-domain mismatch;
- sensor/actuator latency;
- environmental model mismatch;
- numerical conditioning;
- unvalidated correction gains.

## Privacy and security

The browser test has no network calls. Its Content Security Policy blocks
outbound connections.

Telemetry pasted into the interface remains in the user's browser unless the
user explicitly downloads and shares the resulting file.

No API key or credential is required.

## Proof-of-work purpose

This platform is intentionally inspectable.

An engineer can:

1. read the paper;
2. inspect the source;
3. enter a six-component state manually;
4. paste sanitized or synthetic telemetry;
5. see every intermediate calculation;
6. reproduce the same operation in Python;
7. export the result;
8. compare it with independent ground truth or an existing estimator.

That is the intended standard for this stage: not "trust the result," but
**inspect it, reproduce it, challenge it, and benchmark it.**
