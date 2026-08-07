"""
planner.py — Autonomous Strategy Planner for HELIOS.

Orchestrates problem detection, goal identification, rule evaluation,
strategy generation, deduplication, and validation into a single
``plan()`` call that returns a JSON-serialisable result.
"""

import time
import logging
import datetime
from typing import Dict, Any, List

from ai_engine.decision.planning_rules import evaluate_rules, TriggeredRule
from ai_engine.decision.strategy_generator import (
    generate_from_rule,
    deduplicate,
    validate_strategy,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

PLANNER_VERSION = "1.0.0"
VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


class StrategyPlanner:
    """
    Autonomous planning module that generates candidate strategies.

    It does NOT score, simulate, or select strategies — those responsibilities
    belong to the Digital Twin Simulator and Multi-objective Optimizer.
    """

    # ──────────────────────────────────────────────────────────────────────
    # Step 1 — Detect problem
    # ──────────────────────────────────────────────────────────────────────

    @staticmethod
    def detect_problem(prediction_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts the numeric indicators from the prediction engine output
        and returns a concise problem summary.

        Raises:
            ValueError: If required keys are missing.
        """
        try:
            congestion_prob = float(
                prediction_output["prediction"]["congestion"]["probability"]
            )
            failure_prob = float(
                prediction_output["prediction"]["failure"]["probability"]
            )
            network_health = float(prediction_output["network_health"])
            health_status = str(prediction_output.get("health_status", "Unknown"))
        except (KeyError, TypeError) as exc:
            raise ValueError(
                f"Prediction output is missing required fields: {exc}"
            ) from exc

        return {
            "congestion_probability": congestion_prob,
            "failure_probability": failure_prob,
            "network_health": network_health,
            "health_status": health_status,
        }

    # ──────────────────────────────────────────────────────────────────────
    # Step 2 — Identify goal
    # ──────────────────────────────────────────────────────────────────────

    @staticmethod
    def identify_goal(triggered_rules: List[TriggeredRule]) -> str:
        """
        Returns the planning goal from the highest-priority triggered rule.
        Falls back to ``"Maintain Health"`` when no rule fires.
        """
        if not triggered_rules:
            return "Maintain Health"
        return triggered_rules[0].goal

    # ──────────────────────────────────────────────────────────────────────
    # Step 3 — Generate candidates
    # ──────────────────────────────────────────────────────────────────────

    @staticmethod
    def generate_candidates(
        triggered_rules: List[TriggeredRule],
    ) -> List[Dict[str, Any]]:
        """
        Fires every triggered rule through the strategy generator and
        collects all candidate strategies into a flat list.
        """
        all_candidates: List[Dict[str, Any]] = []
        offset = 0
        for rule in triggered_rules:
            batch = generate_from_rule(rule, id_offset=offset)
            all_candidates.extend(batch)
            offset += len(batch)
        return all_candidates

    # ──────────────────────────────────────────────────────────────────────
    # Step 4 — Remove duplicates
    # ──────────────────────────────────────────────────────────────────────

    @staticmethod
    def remove_duplicate_candidates(
        candidates: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """De-duplicates candidates by strategy name."""
        return deduplicate(candidates)

    # ──────────────────────────────────────────────────────────────────────
    # Step 5 — Validate
    # ──────────────────────────────────────────────────────────────────────

    @staticmethod
    def validate_candidates(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ensures every candidate has the full required schema including priority.

        Raises:
            ValueError: If any candidate is malformed or has an invalid priority.
        """
        for idx, c in enumerate(candidates):
            if not validate_strategy(c):
                raise ValueError(
                    f"Candidate strategy at index {idx} is missing required "
                    f"fields. Got keys: {set(c.keys())}"
                )
            if c.get("priority") not in VALID_PRIORITIES:
                raise ValueError(
                    f"Candidate strategy '{c.get('name')}' at index {idx} has "
                    f"invalid priority '{c.get('priority')}'. "
                    f"Must be one of {VALID_PRIORITIES}."
                )
        return candidates

    # ──────────────────────────────────────────────────────────────────────
    # Step 6 — Validate result metadata
    # ──────────────────────────────────────────────────────────────────────

    @staticmethod
    def validate_result(result: Dict[str, Any]) -> None:
        """
        Post-assembly validation of the complete planning result.

        Raises:
            ValueError: If any metadata field is missing or invalid.
        """
        if not result.get("planner_version"):
            raise ValueError("planner_version is missing from planning result.")
        if not result.get("generated_at"):
            raise ValueError("generated_at is missing from planning result.")

        planning_time = result.get("planning_time_ms")
        if planning_time is None or planning_time <= 0:
            raise ValueError(
                f"planning_time_ms must be positive, got {planning_time}."
            )

        strategies = result.get("candidate_strategies", [])
        rules_triggered = result.get("rules_triggered", [])

        if strategies and not rules_triggered:
            raise ValueError(
                "rules_triggered must not be empty when candidate_strategies exist."
            )

        for idx, s in enumerate(strategies):
            if "priority" not in s:
                raise ValueError(
                    f"Strategy at index {idx} ('{s.get('name')}') is missing "
                    f"'priority' field."
                )

    # ──────────────────────────────────────────────────────────────────────
    # Full pipeline
    # ──────────────────────────────────────────────────────────────────────

    def plan(self, prediction_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        End-to-end planning pipeline.

        1. Detect problem
        2. Evaluate planning rules
        3. Identify goal
        4. Generate candidate strategies
        5. Deduplicate
        6. Validate candidates
        7. Assemble result with metadata
        8. Validate result
        9. Return structured result

        Returns:
            A dict with ``tower_id``, ``planner_version``, ``generated_at``,
            ``planning_time_ms``, ``rules_triggered``, ``planning_goal``,
            and ``candidate_strategies``.
        """
        start = time.perf_counter()
        logger.info("Strategy Planner started")

        # 1. Detect problem
        problem = self.detect_problem(prediction_output)
        logger.info(
            "Problem detected — congestion=%.1f%%, failure=%.1f%%, health=%d",
            problem["congestion_probability"],
            problem["failure_probability"],
            problem["network_health"],
        )

        # 2. Evaluate rules
        triggered = evaluate_rules(prediction_output)
        rule_names = [t.rule.name for t in triggered]
        logger.info("%d planning rule(s) triggered:", len(triggered))
        for name in rule_names:
            logger.info("  ✓ %s", name)

        # 3. Identify goal
        goal = self.identify_goal(triggered)
        logger.info("Planning goal: %s", goal)

        # 4. Generate candidates
        candidates = self.generate_candidates(triggered)

        # 5. Deduplicate
        candidates = self.remove_duplicate_candidates(candidates)

        # 6. Validate candidates
        candidates = self.validate_candidates(candidates)
        logger.info("%d unique candidate strategies generated", len(candidates))

        # 7. Assemble result
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

        result = {
            "tower_id": prediction_output.get("tower_id", "Unknown"),
            "planner_version": PLANNER_VERSION,
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "planning_time_ms": elapsed_ms,
            "rules_triggered": rule_names,
            "planning_goal": goal,
            "candidate_strategies": candidates,
        }

        # 8. Validate result
        self.validate_result(result)

        logger.info(
            "Strategy Planner finished — planning completed in %.2f ms",
            elapsed_ms,
        )
        return result


# ──────────────────────────────────────────────────────────────────────────────
# Public convenience function
# ──────────────────────────────────────────────────────────────────────────────

def helios_plan(prediction_output: Dict[str, Any]) -> Dict[str, Any]:
    """Public wrapper — instantiates the planner and runs the pipeline."""
    planner = StrategyPlanner()
    return planner.plan(prediction_output)
