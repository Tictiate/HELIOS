"""
constraints.py — Hard constraint validation for candidate strategies.

Strategies that violate any hard constraint are rejected before scoring.
All constraint thresholds are centralized here.
"""

import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Hard Constraint Thresholds
# ──────────────────────────────────────────────────────────────────────────────

CONSTRAINTS: Dict[str, Dict[str, Any]] = {
    "power_usage": {
        "max": 95.0,
        "description": "Power usage must not exceed 95%",
    },
    "network_health": {
        "min": 40.0,
        "description": "Network health must be at least 40",
    },
}

# KPIs that must never be negative
NON_NEGATIVE_KPIS: List[str] = [
    "latency",
    "packet_loss",
    "power_usage",
    "tower_utilization",
    "network_health",
]


def validate_strategy(
    final_metrics: Dict[str, float],
    strategy_name: str,
) -> Tuple[bool, List[str]]:
    """
    Validates a strategy's final metrics against all hard constraints.

    Args:
        final_metrics: The KPI values from the last simulation tick.
        strategy_name: Name of the strategy (for logging).

    Returns:
        A tuple of (is_valid, list_of_violations).
        If is_valid is False, the strategy should be rejected.
    """
    violations: List[str] = []

    # Check upper-bound constraints
    for kpi, rule in CONSTRAINTS.items():
        value = final_metrics.get(kpi)
        if value is None:
            continue

        if "max" in rule and value > rule["max"]:
            msg = f"{kpi} = {value:.2f} exceeds max {rule['max']} — {rule['description']}"
            violations.append(msg)
            logger.warning("Constraint violation [%s]: %s", strategy_name, msg)

        if "min" in rule and value < rule["min"]:
            msg = f"{kpi} = {value:.2f} below min {rule['min']} — {rule['description']}"
            violations.append(msg)
            logger.warning("Constraint violation [%s]: %s", strategy_name, msg)

    # Check non-negative KPIs
    for kpi in NON_NEGATIVE_KPIS:
        value = final_metrics.get(kpi)
        if value is not None and value < 0:
            msg = f"{kpi} = {value:.2f} is negative"
            violations.append(msg)
            logger.warning("Constraint violation [%s]: %s", strategy_name, msg)

    is_valid = len(violations) == 0
    return is_valid, violations
