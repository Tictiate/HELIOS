"""
objectives.py — Optimization objective weights and normalization.

Defines the configurable weights for the multi-objective scoring system.
All weights are centralized here so they can be tuned without touching
any other module.
"""

from typing import Dict

# ──────────────────────────────────────────────────────────────────────────────
# Objective Weights
#
# Positive weight → objective is MAXIMIZED
# Negative weight → objective is MINIMIZED
#
# |weights| should sum to 1.0 for interpretable scores on a 0–100 scale.
# ──────────────────────────────────────────────────────────────────────────────

OBJECTIVE_WEIGHTS: Dict[str, float] = {
    "network_health":       0.35,   # Maximize
    "latency":             -0.25,   # Minimize
    "packet_loss":         -0.20,   # Minimize
    "power_usage":         -0.10,   # Minimize
    "tower_utilization":   -0.10,   # Minimize (penalize imbalance)
}

# ──────────────────────────────────────────────────────────────────────────────
# Normalization Ranges
#
# Each KPI is min-max normalized to [0, 1] before weighting.
# These ranges represent the expected operational bounds of the network.
# ──────────────────────────────────────────────────────────────────────────────

NORMALIZATION_RANGES: Dict[str, Dict[str, float]] = {
    "network_health":     {"min": 0.0,  "max": 100.0},
    "latency":            {"min": 0.0,  "max": 150.0},   # ms
    "packet_loss":        {"min": 0.0,  "max": 10.0},    # %
    "power_usage":        {"min": 0.0,  "max": 100.0},   # %
    "tower_utilization":  {"min": 0.0,  "max": 100.0},   # %
}
