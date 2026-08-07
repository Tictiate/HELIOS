"""
metrics.py — Centralised KPI calculation helpers for the Digital Twin Simulator.

All functions are pure (no side effects, no mutation). They use a smooth
exponential ease-out curve so that KPIs converge gradually toward their
target value over the simulation timeline.

Convergence formula:
    progress = 1 - e^(-3 * tick / total_ticks)

At tick 0 progress ≈ 0 (no change yet).
At tick 10 (with total_ticks=10) progress ≈ 0.95 (nearly converged).
"""

import math
from typing import Dict, Any


def _progress(tick: int, total_ticks: int) -> float:
    """
    Smooth exponential ease-out progress in [0, 1).

    Returns 0.0 at tick 0 and approaches 1.0 as tick → total_ticks.
    """
    if total_ticks <= 0:
        return 0.0
    t = tick / total_ticks
    return 1.0 - math.exp(-3.0 * t)


def calculate_latency(
    base: float,
    latency_factor: float,
    tick: int,
    total_ticks: int,
) -> float:
    """
    Predict latency at a given tick.

    Args:
        base:           Current latency (ms).
        latency_factor: Fractional change target (e.g. -0.20 = 20% decrease).
        tick:           Current simulation tick.
        total_ticks:    Total ticks in the simulation (excluding tick 0).

    Returns:
        Predicted latency, clamped to ≥ 1.0 ms.
    """
    p = _progress(tick, total_ticks)
    result = base * (1.0 + latency_factor * p)
    return max(1.0, round(result, 2))


def calculate_bandwidth(
    base: float,
    bandwidth_delta: float,
    tick: int,
    total_ticks: int,
) -> float:
    """
    Predict available bandwidth at a given tick.

    Args:
        base:             Current available bandwidth (Mbps).
        bandwidth_delta:  Absolute change target (e.g. +25 Mbps).
        tick:             Current simulation tick.
        total_ticks:      Total ticks in the simulation.

    Returns:
        Predicted bandwidth, clamped to ≥ 0.
    """
    p = _progress(tick, total_ticks)
    result = base + bandwidth_delta * p
    return max(0.0, round(result, 2))


def calculate_packet_loss(
    base: float,
    packet_loss_factor: float,
    tick: int,
    total_ticks: int,
) -> float:
    """
    Predict packet loss at a given tick.

    Args:
        base:               Current packet loss (%).
        packet_loss_factor: Fractional change target (e.g. -0.10 = 10% decrease).
        tick:               Current simulation tick.
        total_ticks:        Total ticks in the simulation.

    Returns:
        Predicted packet loss, clamped to [0, 100].
    """
    p = _progress(tick, total_ticks)
    result = base * (1.0 + packet_loss_factor * p)
    return max(0.0, min(100.0, round(result, 2)))


def calculate_utilization(
    base: float,
    utilization_factor: float,
    tick: int,
    total_ticks: int,
) -> float:
    """
    Predict tower utilization at a given tick.

    Args:
        base:               Current utilization (%).
        utilization_factor: Fractional change target.
        tick:               Current simulation tick.
        total_ticks:        Total ticks in the simulation.

    Returns:
        Predicted utilization, clamped to [0, 100].
    """
    p = _progress(tick, total_ticks)
    result = base * (1.0 + utilization_factor * p)
    return max(0.0, min(100.0, round(result, 2)))


def calculate_power(
    base: float,
    power_delta: float,
    tick: int,
    total_ticks: int,
) -> float:
    """
    Predict power usage at a given tick.

    Args:
        base:        Current power usage (%).
        power_delta: Absolute change target (e.g. +8%).
        tick:        Current simulation tick.
        total_ticks: Total ticks in the simulation.

    Returns:
        Predicted power, clamped to [0, 100].
    """
    p = _progress(tick, total_ticks)
    result = base + power_delta * p
    return max(0.0, min(100.0, round(result, 2)))


def calculate_temperature(base: float, power_delta: float, tick: int, total_ticks: int) -> float:
    """
    Predict temperature based on power usage change.

    Temperature tracks power changes at ~40% coupling.
    """
    p = _progress(tick, total_ticks)
    temp_delta = power_delta * 0.4
    result = base + temp_delta * p
    return max(0.0, round(result, 2))


def calculate_edge_cpu(
    base: float,
    edge_cpu_factor: float,
    tick: int,
    total_ticks: int,
) -> float:
    """
    Predict edge server CPU usage at a given tick.

    Args:
        base:            Current edge CPU (%).
        edge_cpu_factor: Fractional change target (e.g. -0.25 = 25% decrease).
        tick:            Current simulation tick.
        total_ticks:     Total ticks in the simulation.

    Returns:
        Predicted edge CPU, clamped to [0, 100].
    """
    p = _progress(tick, total_ticks)
    result = base * (1.0 + edge_cpu_factor * p)
    return max(0.0, min(100.0, round(result, 2)))


def calculate_edge_memory(base: float, cpu_factor: float, tick: int, total_ticks: int) -> float:
    """
    Predict edge memory usage. Memory tracks CPU changes at ~30% coupling.
    """
    p = _progress(tick, total_ticks)
    mem_factor = cpu_factor * 0.3
    result = base * (1.0 + mem_factor * p)
    return max(0.0, min(100.0, round(result, 2)))


def calculate_active_users(
    base: float,
    user_factor: float,
    tick: int,
    total_ticks: int,
) -> int:
    """
    Predict active users at a given tick.

    Returns:
        Predicted user count, clamped to ≥ 0.
    """
    p = _progress(tick, total_ticks)
    result = base * (1.0 + user_factor * p)
    return max(0, int(round(result)))


def calculate_network_health(
    latency: float,
    bandwidth: float,
    packet_loss: float,
    power: float,
    utilization: float,
) -> int:
    """
    Compute an overall network health score (0-100) from component KPIs.

    Weights:
        latency     15%  (lower is better, normalised against 100 ms ceiling)
        bandwidth   20%  (higher is better, normalised against 100 Mbps ceiling)
        packet_loss 25%  (lower is better)
        power       10%  (lower is better)
        utilization 30%  (lower is better)
    """
    lat_n = max(0.0, 1.0 - latency / 100.0)
    bw_n = min(1.0, bandwidth / 100.0)
    pl_n = max(0.0, 1.0 - packet_loss / 100.0)
    pow_n = max(0.0, 1.0 - power / 100.0)
    util_n = max(0.0, 1.0 - utilization / 100.0)

    score = (lat_n * 0.15) + (bw_n * 0.20) + (pl_n * 0.25) + (pow_n * 0.10) + (util_n * 0.30)
    return max(0, min(100, int(round(score * 100))))
