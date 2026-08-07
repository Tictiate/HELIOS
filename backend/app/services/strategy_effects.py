"""
strategy_effects.py — Configurable strategy effect profiles for the
Autonomous Execution Engine.

Each strategy maps to a dict of metric deltas/factors that describe how
applying that strategy transforms the current network state.

Effect keys:
    users_factor              Fractional change (e.g. -0.10 = 10% fewer users)
    bandwidth_delta           Absolute change in Mbps
    latency_factor            Fractional change (e.g. -0.15 = 15% decrease)
    packet_loss_factor        Fractional change
    tower_utilization_factor  Fractional change
    power_delta               Absolute change in %
    temperature_delta         Absolute change in °C
    edge_cpu_factor           Fractional change
    edge_memory_factor        Fractional change

DO NOT put business logic here — this module is purely a data store.
"""

from typing import Dict


STRATEGY_EFFECTS: Dict[str, Dict[str, float]] = {

    # ── Congestion / Bandwidth ────────────────────────────────────────────
    "Increase Bandwidth": {
        "users_factor":             0.0,
        "bandwidth_delta":          25.0,
        "latency_factor":          -0.20,
        "packet_loss_factor":      -0.15,
        "tower_utilization_factor": -0.12,
        "power_delta":              8.0,
        "temperature_delta":        3.0,
        "edge_cpu_factor":          0.05,
        "edge_memory_factor":       0.03,
    },

    # ── Routing ───────────────────────────────────────────────────────────
    "Traffic Redistribution": {
        "users_factor":            -0.15,
        "bandwidth_delta":          10.0,
        "latency_factor":          -0.18,
        "packet_loss_factor":      -0.20,
        "tower_utilization_factor": -0.25,
        "power_delta":              3.0,
        "temperature_delta":        1.0,
        "edge_cpu_factor":         -0.08,
        "edge_memory_factor":      -0.05,
    },

    # ── Edge Computing ────────────────────────────────────────────────────
    "Edge Workload Migration": {
        "users_factor":             0.0,
        "bandwidth_delta":          5.0,
        "latency_factor":          -0.22,
        "packet_loss_factor":      -0.10,
        "tower_utilization_factor": -0.08,
        "power_delta":             -5.0,
        "temperature_delta":       -2.0,
        "edge_cpu_factor":         -0.30,
        "edge_memory_factor":      -0.20,
    },

    # ── Emergency Response ────────────────────────────────────────────────
    "Emergency Recovery": {
        "users_factor":            -0.10,
        "bandwidth_delta":          15.0,
        "latency_factor":          -0.12,
        "packet_loss_factor":      -0.25,
        "tower_utilization_factor": -0.20,
        "power_delta":              12.0,
        "temperature_delta":        5.0,
        "edge_cpu_factor":         -0.10,
        "edge_memory_factor":      -0.08,
    },

    # ── Power Optimization ────────────────────────────────────────────────
    "Power Optimization": {
        "users_factor":             0.0,
        "bandwidth_delta":          0.0,
        "latency_factor":           0.02,
        "packet_loss_factor":       0.01,
        "tower_utilization_factor":  0.0,
        "power_delta":             -15.0,
        "temperature_delta":        -4.0,
        "edge_cpu_factor":          -0.05,
        "edge_memory_factor":      -0.03,
    },

    # ── Load Balancing ────────────────────────────────────────────────────
    "Load Balancing": {
        "users_factor":            -0.10,
        "bandwidth_delta":          8.0,
        "latency_factor":          -0.12,
        "packet_loss_factor":      -0.10,
        "tower_utilization_factor": -0.20,
        "power_delta":              2.0,
        "temperature_delta":        1.0,
        "edge_cpu_factor":         -0.05,
        "edge_memory_factor":      -0.03,
    },
}

# Fallback for unknown strategy names
_DEFAULT_EFFECT: Dict[str, float] = {
    "users_factor":             0.0,
    "bandwidth_delta":          0.0,
    "latency_factor":           0.0,
    "packet_loss_factor":       0.0,
    "tower_utilization_factor":  0.0,
    "power_delta":              0.0,
    "temperature_delta":        0.0,
    "edge_cpu_factor":          0.0,
    "edge_memory_factor":       0.0,
}


def get_strategy_effect(strategy_name: str) -> Dict[str, float]:
    """
    Returns the effect profile for a strategy name.

    Falls back to the default zero-change profile for unknown strategies.
    """
    return dict(STRATEGY_EFFECTS.get(strategy_name, _DEFAULT_EFFECT))
