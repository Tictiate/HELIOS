"""
Test Suite — Autonomous Strategy Planner

Runs four scenarios matching the prediction engine test suite:
  1. Normal Network
  2. Congestion
  3. Tower Failure
  4. Critical Network

Each scenario verifies:
  - Correct planning_goal
  - Non-empty candidate_strategies
  - Every strategy has all required fields
  - No duplicate strategy names
"""

import os
import sys
import json

# Ensure the project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_engine.decision.planner import helios_plan
from ai_engine.decision.strategy_library import REQUIRED_FIELDS

# ──────────────────────────────────────────────────────────────────────────────
# Test scenarios (prediction engine output format)
# ──────────────────────────────────────────────────────────────────────────────

SCENARIOS = {
    "Normal Network": {
        "tower_id": "T1",
        "prediction": {
            "congestion": {"probability": 12.0, "prediction": "Healthy", "confidence": 94.0},
            "failure": {"probability": 8.0, "prediction": "Healthy", "confidence": 96.0},
        },
        "network_health": 95,
        "health_status": "Excellent",
    },
    "Congestion": {
        "tower_id": "T2",
        "prediction": {
            "congestion": {"probability": 96.0, "prediction": "Congested", "confidence": 96.0},
            "failure": {"probability": 15.0, "prediction": "Healthy", "confidence": 85.0},
        },
        "network_health": 61,
        "health_status": "Warning",
    },
    "Tower Failure": {
        "tower_id": "T3",
        "prediction": {
            "congestion": {"probability": 25.0, "prediction": "Healthy", "confidence": 75.0},
            "failure": {"probability": 78.0, "prediction": "Failure Risk", "confidence": 78.0},
        },
        "network_health": 42,
        "health_status": "Warning",
    },
    "Critical Network": {
        "tower_id": "T4",
        "prediction": {
            "congestion": {"probability": 98.0, "prediction": "Congested", "confidence": 98.0},
            "failure": {"probability": 85.0, "prediction": "Failure Risk", "confidence": 85.0},
        },
        "network_health": 18,
        "health_status": "Critical",
    },
}

EXPECTED_GOALS = {
    "Normal Network": "Maintain Health",
    "Congestion": "Reduce Congestion",
    "Tower Failure": "Prevent Failure",
    "Critical Network": "Emergency Recovery",
}


# ──────────────────────────────────────────────────────────────────────────────
# Validation helpers
# ──────────────────────────────────────────────────────────────────────────────

def validate_strategy_schema(strategy: dict) -> list:
    """Returns a list of missing fields (empty list means valid)."""
    required = REQUIRED_FIELDS | {"strategy_id"}
    return sorted(required - set(strategy.keys()))


def check_no_duplicates(strategies: list) -> bool:
    """Returns True if no two strategies share the same name."""
    names = [s["name"] for s in strategies]
    return len(names) == len(set(names))


# ──────────────────────────────────────────────────────────────────────────────
# Runner
# ──────────────────────────────────────────────────────────────────────────────

def run_tests():
    passed = 0
    failed = 0

    for scenario_name, prediction_output in SCENARIOS.items():
        print(f"\n{'='*60}")
        print(f"Scenario: {scenario_name}")
        print(f"{'='*60}")

        result = helios_plan(prediction_output)
        strategies = result["candidate_strategies"]

        # ── Check 1: Planning goal ────────────────────────────────────────
        expected_goal = EXPECTED_GOALS[scenario_name]
        if result["planning_goal"] == expected_goal:
            print(f"  ✅ Planning Goal: {result['planning_goal']}")
            passed += 1
        else:
            print(f"  ❌ Planning Goal: expected '{expected_goal}', got '{result['planning_goal']}'")
            failed += 1

        # ── Check 2: Non-empty candidates ─────────────────────────────────
        if len(strategies) > 0:
            print(f"  ✅ Candidate Strategies: {len(strategies)}")
            passed += 1
        else:
            print(f"  ❌ Candidate Strategies: empty!")
            failed += 1

        # ── Check 3: Schema completeness ──────────────────────────────────
        all_valid = True
        for s in strategies:
            missing = validate_strategy_schema(s)
            if missing:
                print(f"  ❌ Strategy '{s.get('name', '?')}' missing fields: {missing}")
                all_valid = False
        if all_valid:
            print(f"  ✅ All strategies have complete schema")
            passed += 1
        else:
            failed += 1

        # ── Check 4: No duplicates ────────────────────────────────────────
        if check_no_duplicates(strategies):
            print(f"  ✅ No duplicate strategies")
            passed += 1
        else:
            print(f"  ❌ Duplicate strategies found!")
            failed += 1

        # ── Print strategies ──────────────────────────────────────────────
        print(f"\n  Strategies:")
        for s in strategies:
            print(f"    [{s['strategy_id']}] {s['name']} ({s['category']})")

    # ── Summary ───────────────────────────────────────────────────────────
    total = passed + failed
    print(f"\n{'='*60}")
    print(f"Results: {passed}/{total} checks passed")
    if failed:
        print(f"⚠️  {failed} check(s) FAILED")
    else:
        print("🎉 All checks passed!")
    print(f"{'='*60}")


if __name__ == "__main__":
    run_tests()
