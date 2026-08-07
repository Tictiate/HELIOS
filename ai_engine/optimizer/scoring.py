"""
scoring.py — Deterministic weighted scoring for strategy evaluation.

Takes the final simulation metrics for a strategy and computes a single
composite score using the objective weights and normalization ranges
defined in objectives.py.
"""

import logging
from typing import Dict

from ai_engine.optimizer.objectives import OBJECTIVE_WEIGHTS, NORMALIZATION_RANGES

logger = logging.getLogger(__name__)


def _normalize(value: float, kpi: str) -> float:
    """
    Min-max normalizes a KPI value to the [0, 1] range.

    Values outside the configured range are clamped.
    """
    bounds = NORMALIZATION_RANGES.get(kpi)
    if bounds is None:
        return 0.0

    low = bounds["min"]
    high = bounds["max"]
    if high == low:
        return 0.0

    normalized = (value - low) / (high - low)
    return max(0.0, min(1.0, normalized))


def calculate_score(final_metrics: Dict[str, float]) -> float:
    """
    Computes a weighted composite score for a strategy.

    The score is on a 0–100 scale where higher is better.

    For objectives with negative weights (minimize), the normalized value
    is inverted (1 - normalized) so that lower raw values yield higher
    contributions to the score.

    Args:
        final_metrics: The KPI values from the final simulation tick.

    Returns:
        A float score in [0, 100].
    """
    score = 0.0

    for kpi, weight in OBJECTIVE_WEIGHTS.items():
        raw_value = final_metrics.get(kpi, 0.0)
        norm = _normalize(raw_value, kpi)

        if weight < 0:
            # For minimization objectives, invert so lower raw = higher contribution
            contribution = abs(weight) * (1.0 - norm) * 100.0
        else:
            # For maximization objectives, higher raw = higher contribution
            contribution = weight * norm * 100.0

        score += contribution
        logger.debug(
            "  %s: raw=%.2f norm=%.4f weight=%.2f contribution=%.2f",
            kpi, raw_value, norm, weight, contribution,
        )

    return round(score, 2)
