"""
ranking.py — Strategy ranking by composite score.

Sorts evaluated strategies in descending order by score.
The highest-scoring strategy is the recommended one.
"""

from typing import Dict, Any, List


def rank_strategies(
    scored_strategies: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Sorts strategies by score in descending order and assigns ranks.

    Args:
        scored_strategies: A list of dicts, each containing at minimum
            'strategy', 'score', and 'feasible'.

    Returns:
        A new list sorted descending by score, with a 'rank' field added.
        Infeasible strategies are placed at the bottom regardless of score.
    """
    # Partition: feasible first, infeasible last
    feasible = [s for s in scored_strategies if s.get("feasible", True)]
    infeasible = [s for s in scored_strategies if not s.get("feasible", True)]

    # Sort each group descending by score
    feasible.sort(key=lambda s: s["score"], reverse=True)
    infeasible.sort(key=lambda s: s["score"], reverse=True)

    ranked = feasible + infeasible

    for i, strategy in enumerate(ranked):
        strategy["rank"] = i + 1

    return ranked
