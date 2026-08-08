#!/usr/bin/env python3
"""Reference implementation for the 6-vector preliminary experimental test platform.

No external dependencies are required.

The implementation intentionally exposes:
    DeltaV = V - U
    delta = D(DeltaV)
    theta* reference projection
    e = delta ⊙ theta*
    R0, R, E, G

The projection is a computational closure for testing. A small post-projection
R is not independent evidence of physical or navigation accuracy.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Iterable, Sequence
import argparse
import csv
import json
import math
from pathlib import Path


DEFAULT_SCALES = (1.0, 1.0, 1.0, 0.1, 0.1, 0.1)
DEFAULT_THETA0 = (1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
DEMO_V = (12.4, 0.8, -0.2, 0.03, 0.01, -0.05)
DEMO_U = (12.0, 0.0, 0.0, 0.0, 0.0, 0.0)


@dataclass(frozen=True)
class SixVectorResult:
    V: tuple[float, ...]
    U: tuple[float, ...]
    scales: tuple[float, ...]
    theta0: tuple[float, ...]
    deltaV: tuple[float, ...]
    delta: tuple[float, ...]
    theta: tuple[float, ...]
    e: tuple[float, ...]
    R0: float
    R: float
    E: float
    G: float
    correction: tuple[float, ...]
    Sresolved: tuple[float, ...]
    epsilon: float
    delta_threshold: float
    projection_applied: bool


def _six(values: Sequence[float], name: str) -> tuple[float, ...]:
    if len(values) != 6:
        raise ValueError(f"{name} must contain exactly six values")
    result = tuple(float(x) for x in values)
    if not all(math.isfinite(x) for x in result):
        raise ValueError(f"{name} contains a non-finite value")
    return result


def _dot(a: Sequence[float], b: Sequence[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def _norm(a: Sequence[float]) -> float:
    return math.sqrt(_dot(a, a))


def update_six_vector(
    V: Sequence[float],
    U: Sequence[float],
    scales: Sequence[float] = DEFAULT_SCALES,
    theta0: Sequence[float] = DEFAULT_THETA0,
    *,
    epsilon: float = 1e-12,
    delta_threshold: float = 1e-10,
    use_projection: bool = True,
    gains: Sequence[float] = (0, 0, 0, 0, 0, 0),
) -> SixVectorResult:
    V = _six(V, "V")
    U = _six(U, "U")
    scales = _six(scales, "scales")
    theta0 = _six(theta0, "theta0")
    gains = _six(gains, "gains")

    if any(s <= 0 for s in scales):
        raise ValueError("all normalization scales must be greater than zero")
    if epsilon < 0:
        raise ValueError("epsilon cannot be negative")
    if delta_threshold < 0:
        raise ValueError("delta_threshold cannot be negative")

    deltaV = tuple(v - u for v, u in zip(V, U))
    delta = tuple(dv / s for dv, s in zip(deltaV, scales))
    G = _norm(delta)
    R0 = _dot(delta, theta0)

    theta = theta0
    projection_applied = False

    if use_projection and G >= delta_threshold:
        denom = _dot(delta, delta) + epsilon
        factor = _dot(delta, theta0) / denom
        theta = tuple(t - d * factor for t, d in zip(theta0, delta))
        projection_applied = True

    e = tuple(d * t for d, t in zip(delta, theta))
    R = sum(e)
    E = _norm(e)

    correction = tuple(-k * ei for k, ei in zip(gains, e))
    Sresolved = tuple(u + s * c for u, s, c in zip(U, scales, correction))

    return SixVectorResult(
        V=V,
        U=U,
        scales=scales,
        theta0=theta0,
        deltaV=deltaV,
        delta=delta,
        theta=theta,
        e=e,
        R0=R0,
        R=R,
        E=E,
        G=G,
        correction=correction,
        Sresolved=Sresolved,
        epsilon=float(epsilon),
        delta_threshold=float(delta_threshold),
        projection_applied=projection_applied,
    )


ALIASES = {
    "time": ("time", "timestamp", "t", "sample"),
    "vx": ("vx", "v_x", "obs_vx", "observed_vx"),
    "vy": ("vy", "v_y", "obs_vy", "observed_vy"),
    "vz": ("vz", "v_z", "obs_vz", "observed_vz"),
    "wx": ("wx", "omega_x", "roll_rate", "rollrate"),
    "wy": ("wy", "omega_y", "pitch_rate", "pitchrate"),
    "wz": ("wz", "omega_z", "yaw_rate", "yawrate"),
    "ux": ("ux", "u_x", "cmd_vx", "command_vx"),
    "uy": ("uy", "u_y", "cmd_vy", "command_vy"),
    "uz": ("uz", "u_z", "cmd_vz", "command_vz"),
    "uwx": ("uwx", "u_wx", "cmd_wx", "cmd_roll", "cmd_roll_rate"),
    "uwy": ("uwy", "u_wy", "cmd_wy", "cmd_pitch", "cmd_pitch_rate"),
    "uwz": ("uwz", "u_wz", "cmd_wz", "cmd_yaw", "cmd_yaw_rate"),
}


def _normal_header(value: str) -> str:
    return value.strip().lower().replace("-", "_").replace(" ", "_")


def _resolve_headers(fieldnames: Sequence[str]) -> dict[str, str]:
    normalized = {_normal_header(name): name for name in fieldnames}
    resolved: dict[str, str] = {}
    for canonical, aliases in ALIASES.items():
        for alias in aliases:
            if alias in normalized:
                resolved[canonical] = normalized[alias]
                break
    required = ("vx","vy","vz","wx","wy","wz","ux","uy","uz","uwx","uwy","uwz")
    missing = [name for name in required if name not in resolved]
    if missing:
        raise ValueError("CSV missing required columns: " + ", ".join(missing))
    return resolved


def run_csv(
    path: Path,
    *,
    scales: Sequence[float],
    theta0: Sequence[float],
    epsilon: float,
    delta_threshold: float,
    use_projection: bool,
) -> list[tuple[str, SixVectorResult]]:
    output: list[tuple[str, SixVectorResult]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError("CSV has no header")
        h = _resolve_headers(reader.fieldnames)
        for index, row in enumerate(reader):
            V = tuple(float(row[h[k]]) for k in ("vx","vy","vz","wx","wy","wz"))
            U = tuple(float(row[h[k]]) for k in ("ux","uy","uz","uwx","uwy","uwz"))
            time = row[h["time"]] if "time" in h else str(index)
            output.append((
                time,
                update_six_vector(
                    V, U, scales, theta0,
                    epsilon=epsilon,
                    delta_threshold=delta_threshold,
                    use_projection=use_projection,
                ),
            ))
    return output


def write_csv(path: Path, rows: list[tuple[str, SixVectorResult]]) -> None:
    fieldnames = [
        "time", "R0", "R", "E", "G",
        *[f"deltaV_{x}" for x in ("vx","vy","vz","wx","wy","wz")],
        *[f"delta_{x}" for x in ("vx","vy","vz","wx","wy","wz")],
        *[f"theta_{x}" for x in ("vx","vy","vz","wx","wy","wz")],
        *[f"e_{x}" for x in ("vx","vy","vz","wx","wy","wz")],
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for time, result in rows:
            data = {
                "time": time,
                "R0": result.R0,
                "R": result.R,
                "E": result.E,
                "G": result.G,
            }
            for prefix, values in (
                ("deltaV", result.deltaV),
                ("delta", result.delta),
                ("theta", result.theta),
                ("e", result.e),
            ):
                for axis, value in zip(("vx","vy","vz","wx","wy","wz"), values):
                    data[f"{prefix}_{axis}"] = value
            writer.writerow(data)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", nargs="?", type=Path, help="optional telemetry CSV")
    parser.add_argument("--output", type=Path, help="optional output CSV")
    parser.add_argument("--scales", nargs=6, type=float, default=DEFAULT_SCALES)
    parser.add_argument("--theta0", nargs=6, type=float, default=DEFAULT_THETA0)
    parser.add_argument("--epsilon", type=float, default=1e-12)
    parser.add_argument("--delta-threshold", type=float, default=1e-10)
    parser.add_argument("--no-projection", action="store_true")
    args = parser.parse_args()

    if args.csv is None:
        result = update_six_vector(
            DEMO_V, DEMO_U, args.scales, args.theta0,
            epsilon=args.epsilon,
            delta_threshold=args.delta_threshold,
            use_projection=not args.no_projection,
        )
        print(json.dumps(asdict(result), indent=2))
        return

    rows = run_csv(
        args.csv,
        scales=args.scales,
        theta0=args.theta0,
        epsilon=args.epsilon,
        delta_threshold=args.delta_threshold,
        use_projection=not args.no_projection,
    )

    if args.output:
        write_csv(args.output, rows)
        print(f"Wrote {len(rows)} rows to {args.output}")
    else:
        for time, result in rows:
            print(
                f"time={time:>8}  "
                f"R0={result.R0: .8g}  R={result.R: .8g}  "
                f"E={result.E: .8g}  G={result.G: .8g}"
            )


if __name__ == "__main__":
    main()
