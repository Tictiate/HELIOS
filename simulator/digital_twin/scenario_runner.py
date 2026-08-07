"""
scenario_runner.py — Runs the digital twin simulation over candidate strategies.

Extracts the first 3 candidate strategies from the Strategy Planner output
and runs the forecast engine independently for each, returning their predicted timelines.
"""

import copy
from typing import Dict, Any, List

from simulator.digital_twin.forecast_engine import forecast_strategy


def run_scenarios(
    current_network_state: Dict[str, Any],
    candidate_strategies: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Simulates the effect of candidate strategies on the current network state.

    Args:
        current_network_state: The baseline network telemetry.
        candidate_strategies:  The list of strategies proposed by the Strategy Planner.

    Returns:
        A list of simulation results, where each result contains the strategy metadata
        and its predicted timeline of snapshots.
    """
    # Only simulate the FIRST THREE candidate strategies generated
    strategies_to_simulate = candidate_strategies[:3]

    simulated_results: List[Dict[str, Any]] = []

    for strategy in strategies_to_simulate:
        # Create an independent cloned network state
        # (Though forecast_strategy handles base extraction, cloning here reinforces isolation)
        cloned_state = copy.deepcopy(current_network_state)

        # Generate timeline (11 snapshots: tick 0 to 10)
        timeline = forecast_strategy(
            network_state=cloned_state,
            strategy=strategy,
            ticks=11
        )

        simulated_results.append({
            "strategy_id": strategy.get("strategy_id", "Unknown"),
            "strategy": strategy.get("name", "Unknown"),
            "category": strategy.get("category", "Unknown"),
            "timeline": timeline,
        })

    return simulated_results
