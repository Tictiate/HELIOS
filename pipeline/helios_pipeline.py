"""
helios_pipeline.py — HELIOS AI Pipeline Orchestrator.

Coordinates and executes the workflow:
Current Network State → Prediction Engine → Strategy Planner
→ Digital Twin Simulator → Multi-objective Optimizer.
"""

import time
import logging
import datetime
from typing import Dict, Any

from ai_engine.prediction.predict import helios_predict
from ai_engine.decision.planner import helios_plan
from simulator.digital_twin.simulator import helios_simulate
from ai_engine.optimizer.optimizer import helios_optimize

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

PIPELINE_VERSION = "2.0.0"


class HeliosPipeline:
    """
    Orchestrates the HELIOS AI Pipeline.
    Strictly coordinates finished modules without implementing domain logic.
    """

    def __init__(self) -> None:
        logger.info("Initializing HELIOS AI Pipeline Orchestrator v%s", PIPELINE_VERSION)

    def load_network_state(self, raw_state: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Normalises and validates the current network state inputs to guarantee
        compatibility with the Prediction Engine and Digital Twin Simulator.
        """
        if raw_state is None:
            # High-fidelity baseline defaults matching simulator/prediction tests
            raw_state = {
                "tower_id": "T_DEFAULT_01",
                "users": 500,
                "latency_ms": 30.0,
                "available_bandwidth_mbps": 50.0,
                "packet_loss_pct": 1.0,
                "power_usage_pct": 50.0,
                "temperature_c": 40.0,
                "cpu_usage_pct": 30.0,
                "traffic_load": 0.3,
                "weather": "clear",
            }

        # Normalize key names (user-facing API -> internal engine keys)
        normalized = raw_state.copy()
        
        mappings = {
            "latency": "latency_ms",
            "bandwidth": "available_bandwidth_mbps",
            "packet_loss": "packet_loss_pct",
            "power_usage": "power_usage_pct",
            "temperature": "temperature_c",
            "cpu_usage": "cpu_usage_pct",
        }
        
        for user_key, internal_key in mappings.items():
            if user_key in normalized and internal_key not in normalized:
                normalized[internal_key] = normalized[user_key]

        # Ensure required fields for the Prediction Engine are populated
        defaults = {
            "tower_id": "Unknown",
            "users": 200,
            "available_bandwidth_mbps": 50.0,
            "latency_ms": 15.0,
            "packet_loss_pct": 0.5,
            "power_usage_pct": 40.0,
            "temperature_c": 38.0,
            "cpu_usage_pct": 25.0,
            "traffic_load": 0.2,
            "weather": "clear",
        }

        for key, val in defaults.items():
            if key not in normalized or normalized[key] is None:
                normalized[key] = val

        return normalized

    def run_prediction(self, current_state: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the prediction engine pipeline for a given network state."""
        return helios_predict(current_state)

    def run_strategy_planner(
        self,
        prediction: Dict[str, Any],
        current_state: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Runs the Autonomous Strategy Planner using prediction outputs."""
        # The Strategy Planner's input matches the Prediction Engine output schema.
        # Add current state attributes to prediction context if missing (e.g. tower_id)
        context = prediction.copy()
        if "tower_id" not in context:
            context["tower_id"] = current_state.get("tower_id", "Unknown")
        return helios_plan(context)

    def run_simulator(
        self,
        current_state: Dict[str, Any],
        prediction: Dict[str, Any],
        strategies: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Runs the Digital Twin Simulator to generate timelines for planner candidate strategies."""
        candidate_strategies = strategies.get("candidate_strategies", [])
        return helios_simulate(
            current_network_state=current_state,
            prediction_output=prediction,
            candidate_strategies=candidate_strategies,
        )

    def run_optimizer(
        self,
        simulation: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Runs the Multi-objective Optimizer to select the best strategy."""
        return helios_optimize(simulation)

    def run(self, raw_state: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Executes the complete HELIOS AI pipeline flow.
        Measures individual stage execution times and returns compiled results.
        """
        print("=" * 80)
        print(" HELIOS AI PIPELINE RUN".center(80))
        print("=" * 80)

        # Step 1: Load Current Network State
        print("Loading Current Digital Twin...")
        current_state = self.load_network_state(raw_state)
        print("✓ Complete\n" + "-" * 44)

        # Step 2: Run Prediction Engine
        print("Running Prediction Engine...")
        start_pred = time.perf_counter()
        prediction = self.run_prediction(current_state)
        elapsed_pred_ms = round((time.perf_counter() - start_pred) * 1000, 2)
        print("✓ Complete\n" + "-" * 44)

        # Step 3: Run Strategy Planner
        print("Running Strategy Planner...")
        start_plan = time.perf_counter()
        strategies = self.run_strategy_planner(prediction, current_state)
        elapsed_plan_ms = round((time.perf_counter() - start_plan) * 1000, 2)
        print("✓ Complete\n" + "-" * 44)

        # Step 4: Run Digital Twin Simulator
        print("Running Digital Twin Simulator...")
        start_sim = time.perf_counter()
        simulation = self.run_simulator(current_state, prediction, strategies)
        elapsed_sim_ms = round((time.perf_counter() - start_sim) * 1000, 2)
        print("✓ Complete\n" + "-" * 44)

        # Step 5: Run Multi-objective Optimizer
        print("Running Multi-objective Optimizer...")
        start_opt = time.perf_counter()
        optimization = self.run_optimizer(simulation)
        elapsed_opt_ms = round((time.perf_counter() - start_opt) * 1000, 2)
        recommended = optimization.get("recommended_strategy", {})
        if recommended:
            print(f"✓ Complete — Recommended: {recommended.get('strategy', 'N/A')} "
                  f"(Score: {recommended.get('score', 'N/A')})")
        else:
            print("✓ Complete — No feasible strategy found")
        print("-" * 44)

        total_elapsed_ms = round(
            elapsed_pred_ms + elapsed_plan_ms + elapsed_sim_ms + elapsed_opt_ms, 2
        )

        print("Pipeline Finished")
        print(f"Total Execution Time: {total_elapsed_ms} ms")
        print("=" * 80)

        # Pack timings into result metadata
        metadata = {
            "pipeline_version": PIPELINE_VERSION,
            "executed_at": datetime.datetime.utcnow().isoformat() + "Z",
            "timings_ms": {
                "prediction": elapsed_pred_ms,
                "planning": elapsed_plan_ms,
                "simulation": elapsed_sim_ms,
                "optimization": elapsed_opt_ms,
                "total_pipeline": total_elapsed_ms,
            }
        }

        return {
            "metadata": metadata,
            "current_state": current_state,
            "prediction": prediction,
            "strategies": strategies,
            "simulation": simulation,
            "optimization": optimization,
        }
