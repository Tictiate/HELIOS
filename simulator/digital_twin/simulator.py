"""
simulator.py — Public API for the Digital Twin Simulator.

Orchestrates the entire simulation process.
Takes current network state, prediction output, and strategy planner output,
and returns predicted future network states (timelines).
"""

import time
import logging
import datetime
from typing import Dict, Any, List

from simulator.digital_twin.scenario_runner import run_scenarios

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

SIMULATOR_VERSION = "1.0.0"


class DigitalTwinSimulator:
    """
    Simulates the effects of candidate strategies on the network.
    It DOES NOT choose the best strategy; it only predicts outcomes.
    """

    def simulate(
        self,
        current_network_state: Dict[str, Any],
        prediction_output: Dict[str, Any],
        candidate_strategies: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Public API for running the Digital Twin simulation.

        Args:
            current_network_state: The baseline telemetry snapshot.
            prediction_output:     Output from Prediction Engine.
            candidate_strategies:  Output from Strategy Planner (list of strategies).

        Returns:
            A dict containing metadata and the simulated timelines.
        """
        start = time.perf_counter()
        logger.info("Digital Twin Simulator started")
        
        tower_id = prediction_output.get("tower_id", current_network_state.get("tower_id", "Unknown"))
        logger.info("Simulating for tower: %s", tower_id)

        if not candidate_strategies:
            logger.warning("No candidate strategies provided for simulation.")
            simulated_results = []
        else:
            logger.info("Received %d candidate strategies, simulating top %d...", 
                        len(candidate_strategies), min(3, len(candidate_strategies)))
            simulated_results = run_scenarios(current_network_state, candidate_strategies)

        for res in simulated_results:
            logger.info("  ✓ Simulated: %s", res["strategy"])

        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info("Digital Twin Simulator finished — simulation completed in %.2f ms", elapsed_ms)

        return {
            "tower_id": tower_id,
            "simulator_version": SIMULATOR_VERSION,
            "simulated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "simulation_time_ms": elapsed_ms,
            "simulated_strategies": simulated_results,
        }


# ──────────────────────────────────────────────────────────────────────────────
# Public convenience function
# ──────────────────────────────────────────────────────────────────────────────

def helios_simulate(
    current_network_state: Dict[str, Any],
    prediction_output: Dict[str, Any],
    candidate_strategies: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Public wrapper — instantiates the simulator and runs it."""
    simulator = DigitalTwinSimulator()
    return simulator.simulate(
        current_network_state,
        prediction_output,
        candidate_strategies,
    )
