"""
optimizer.py — Multi-objective Optimizer for HELIOS.

Evaluates Digital Twin simulation results and recommends the best strategy.
This module ONLY evaluates — it does not simulate, predict, or execute.

Public API:
    helios_optimize(simulation_results) -> Dict[str, Any]
"""

import time
import logging
import datetime
from typing import Dict, Any, List

from ai_engine.optimizer.constraints import validate_strategy
from ai_engine.optimizer.scoring import calculate_score
from ai_engine.optimizer.ranking import rank_strategies

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

OPTIMIZER_VERSION = "1.0.0"


class MultiObjectiveOptimizer:
    """
    Compares simulated futures produced by the Digital Twin and recommends
    the best strategy based on configurable, deterministic multi-objective
    scoring.

    Pipeline position:
        Digital Twin Simulator → **Multi-objective Optimizer** → (Return)
    """

    def _extract_final_metrics(
        self, simulated_strategy: Dict[str, Any],
    ) -> Dict[str, float]:
        """
        Extracts the KPI values from the LAST tick of a strategy's timeline.

        The simulator produces a list of tick snapshots (tick 0 = baseline,
        tick 10 = fully evolved).  The final tick represents the projected
        steady-state outcome of the strategy.
        """
        timeline = simulated_strategy.get("timeline", [])
        if not timeline:
            logger.warning(
                "Empty timeline for strategy '%s'; using zeroed metrics.",
                simulated_strategy.get("strategy", "Unknown"),
            )
            return {
                "latency": 0.0,
                "packet_loss": 0.0,
                "power_usage": 0.0,
                "tower_utilization": 0.0,
                "network_health": 0.0,
            }

        final_tick = timeline[-1]
        return {
            "latency": float(final_tick.get("latency", 0.0)),
            "packet_loss": float(final_tick.get("packet_loss", 0.0)),
            "power_usage": float(final_tick.get("power_usage", 0.0)),
            "tower_utilization": float(final_tick.get("tower_utilization", 0.0)),
            "network_health": float(final_tick.get("network_health", 0.0)),
        }

    def validate(
        self, simulated_strategies: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Runs hard-constraint validation on each strategy's final metrics.

        Returns a list of dicts augmented with 'feasible' and 'violations'.
        """
        results: List[Dict[str, Any]] = []

        for sim in simulated_strategies:
            strategy_name = sim.get("strategy", "Unknown")
            final_metrics = self._extract_final_metrics(sim)
            is_valid, violations = validate_strategy(final_metrics, strategy_name)

            results.append({
                "strategy": strategy_name,
                "strategy_id": sim.get("strategy_id", "Unknown"),
                "category": sim.get("category", "Unknown"),
                "final_metrics": final_metrics,
                "feasible": is_valid,
                "violations": violations,
            })

            status = "✓ feasible" if is_valid else f"✗ REJECTED ({len(violations)} violation(s))"
            logger.info("  Constraint check [%s]: %s", strategy_name, status)

        return results

    def score(
        self, validated_strategies: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Calculates the weighted composite score for each validated strategy.
        """
        for entry in validated_strategies:
            entry["score"] = calculate_score(entry["final_metrics"])
            logger.info(
                "  Score [%s]: %.2f%s",
                entry["strategy"],
                entry["score"],
                "" if entry["feasible"] else " (infeasible)",
            )

        return validated_strategies

    def rank(
        self, scored_strategies: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Sorts strategies descending by score. Feasible strategies rank first.
        """
        return rank_strategies(scored_strategies)

    def optimize(
        self, simulation_results: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Public API — evaluates all simulated strategies and returns the
        recommended best strategy along with a full ranking.

        Args:
            simulation_results: The complete output dict from the Digital Twin
                                Simulator (contains 'simulated_strategies').

        Returns:
            {
                "recommended_strategy": {"strategy": ..., "score": ...},
                "ranking": [...],
                "optimization_summary": {
                    "strategies_evaluated": int,
                    "constraints_checked": bool,
                    "feasible_count": int,
                    "rejected_count": int,
                    "execution_time_ms": float,
                    "optimizer_version": str,
                    "optimized_at": str,
                },
            }
        """
        start = time.perf_counter()
        logger.info("Multi-objective Optimizer started")

        simulated_strategies = simulation_results.get("simulated_strategies", [])

        if not simulated_strategies:
            logger.warning("No simulated strategies to optimize.")
            return self._empty_result(start)

        # Step 1 — Validate constraints
        logger.info("Step 1/3: Validating constraints...")
        validated = self.validate(simulated_strategies)

        # Step 2 — Score
        logger.info("Step 2/3: Calculating scores...")
        scored = self.score(validated)

        # Step 3 — Rank
        logger.info("Step 3/3: Ranking strategies...")
        ranked = self.rank(scored)

        # Select winner (first feasible strategy in ranked list)
        feasible = [s for s in ranked if s["feasible"]]
        if feasible:
            winner = {
                "strategy": feasible[0]["strategy"],
                "score": feasible[0]["score"],
                "strategy_id": feasible[0]["strategy_id"],
                "final_metrics": feasible[0]["final_metrics"],
            }
        else:
            logger.warning("All strategies rejected by constraints. Selecting highest-scored.")
            winner = {
                "strategy": ranked[0]["strategy"],
                "score": ranked[0]["score"],
                "strategy_id": ranked[0]["strategy_id"],
                "final_metrics": ranked[0]["final_metrics"],
                "note": "All strategies violated constraints; this is the least-bad option.",
            }

        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            "Optimizer finished — recommended '%s' (score %.2f) in %.2f ms",
            winner["strategy"], winner["score"], elapsed_ms,
        )

        feasible_count = len([s for s in ranked if s["feasible"]])

        return {
            "recommended_strategy": winner,
            "ranking": ranked,
            "optimization_summary": {
                "strategies_evaluated": len(ranked),
                "constraints_checked": True,
                "feasible_count": feasible_count,
                "rejected_count": len(ranked) - feasible_count,
                "execution_time_ms": elapsed_ms,
                "optimizer_version": OPTIMIZER_VERSION,
                "optimized_at": datetime.datetime.utcnow().isoformat() + "Z",
            },
        }

    def _empty_result(self, start: float) -> Dict[str, Any]:
        """Returns a valid but empty optimization result."""
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        return {
            "recommended_strategy": None,
            "ranking": [],
            "optimization_summary": {
                "strategies_evaluated": 0,
                "constraints_checked": False,
                "feasible_count": 0,
                "rejected_count": 0,
                "execution_time_ms": elapsed_ms,
                "optimizer_version": OPTIMIZER_VERSION,
                "optimized_at": datetime.datetime.utcnow().isoformat() + "Z",
            },
        }


# ──────────────────────────────────────────────────────────────────────────────
# Public convenience function
# ──────────────────────────────────────────────────────────────────────────────

def helios_optimize(simulation_results: Dict[str, Any]) -> Dict[str, Any]:
    """Public wrapper — instantiates the optimizer and runs it."""
    optimizer = MultiObjectiveOptimizer()
    return optimizer.optimize(simulation_results)
