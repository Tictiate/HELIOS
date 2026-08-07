"""
Unit & Integration Tests — HELIOS Multi-objective Optimizer

Verifies:
    ✓ Three strategies evaluated
    ✓ Constraints validated
    ✓ Scores calculated
    ✓ Ranking sorted
    ✓ Winner selected
    ✓ Deterministic output
"""

import os
import sys

# Ensure project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_engine.optimizer.optimizer import MultiObjectiveOptimizer, helios_optimize
from ai_engine.optimizer.constraints import validate_strategy
from ai_engine.optimizer.scoring import calculate_score
from ai_engine.optimizer.ranking import rank_strategies


# ──────────────────────────────────────────────────────────────────────────────
# Test Fixtures — realistic simulation output matching the Digital Twin schema
# ──────────────────────────────────────────────────────────────────────────────

def _make_timeline(final_metrics: dict, ticks: int = 11) -> list:
    """Builds a minimal timeline where only the last tick matters."""
    baseline = {
        "tick": 0,
        "latency": 30.0,
        "packet_loss": 1.0,
        "power_usage": 50.0,
        "tower_utilization": 50.0,
        "network_health": 70.0,
    }
    timeline = [baseline] * (ticks - 1)
    final_tick = {"tick": ticks - 1, **final_metrics}
    timeline.append(final_tick)
    return timeline


MOCK_SIMULATION_RESULTS = {
    "tower_id": "T_TEST_01",
    "simulator_version": "1.0.0",
    "simulated_at": "2026-08-07T00:00:00Z",
    "simulation_time_ms": 1.0,
    "simulated_strategies": [
        {
            "strategy_id": "S1",
            "strategy": "Increase Bandwidth",
            "category": "congestion",
            "timeline": _make_timeline({
                "latency": 22.0,
                "packet_loss": 0.9,
                "power_usage": 84.0,
                "tower_utilization": 61.0,
                "network_health": 74.0,
            }),
        },
        {
            "strategy_id": "S2",
            "strategy": "Traffic Redistribution",
            "category": "routing",
            "timeline": _make_timeline({
                "latency": 17.0,
                "packet_loss": 0.5,
                "power_usage": 71.0,
                "tower_utilization": 58.0,
                "network_health": 88.0,
            }),
        },
        {
            "strategy_id": "S3",
            "strategy": "Edge Workload Migration",
            "category": "edge",
            "timeline": _make_timeline({
                "latency": 15.0,
                "packet_loss": 0.4,
                "power_usage": 68.0,
                "tower_utilization": 55.0,
                "network_health": 91.0,
            }),
        },
    ],
}


def test_optimizer():
    passed = 0
    failed = 0

    print("=" * 80)
    print(" HELIOS MULTI-OBJECTIVE OPTIMIZER TESTS".center(80))
    print("=" * 80)

    # ── Test 1: Three Strategies Evaluated ─────────────────────────────────
    optimizer = MultiObjectiveOptimizer()
    result = optimizer.optimize(MOCK_SIMULATION_RESULTS)

    ranking = result["ranking"]
    if len(ranking) == 3:
        print("  ✅ Test 1 — Three strategies evaluated")
        passed += 1
    else:
        print(f"  ❌ Test 1 — Expected 3 strategies, got {len(ranking)}")
        failed += 1

    # ── Test 2: Constraints Validated ──────────────────────────────────────
    summary = result["optimization_summary"]
    if summary["constraints_checked"] is True:
        print("  ✅ Test 2 — Constraints validated")
        passed += 1
    else:
        print("  ❌ Test 2 — Constraints not checked")
        failed += 1

    # ── Test 3: Scores Calculated ─────────────────────────────────────────
    all_scored = all(isinstance(s.get("score"), (int, float)) for s in ranking)
    if all_scored:
        print("  ✅ Test 3 — Scores calculated for all strategies")
        for s in ranking:
            print(f"     Rank {s['rank']}: {s['strategy']} — Score {s['score']}")
        passed += 1
    else:
        print("  ❌ Test 3 — Some strategies missing scores")
        failed += 1

    # ── Test 4: Ranking Sorted Descending ─────────────────────────────────
    scores = [s["score"] for s in ranking if s["feasible"]]
    if scores == sorted(scores, reverse=True):
        print("  ✅ Test 4 — Ranking correctly sorted descending by score")
        passed += 1
    else:
        print(f"  ❌ Test 4 — Ranking not sorted: {scores}")
        failed += 1

    # ── Test 5: Winner Selected ───────────────────────────────────────────
    recommended = result["recommended_strategy"]
    if recommended and recommended["strategy"] and recommended["score"] > 0:
        print(f"  ✅ Test 5 — Winner selected: '{recommended['strategy']}' (Score: {recommended['score']})")
        passed += 1
    else:
        print("  ❌ Test 5 — No winner selected")
        failed += 1

    # ── Test 6: Deterministic Output ──────────────────────────────────────
    result2 = optimizer.optimize(MOCK_SIMULATION_RESULTS)
    scores_1 = [s["score"] for s in result["ranking"]]
    scores_2 = [s["score"] for s in result2["ranking"]]
    winner_1 = result["recommended_strategy"]["strategy"]
    winner_2 = result2["recommended_strategy"]["strategy"]

    if scores_1 == scores_2 and winner_1 == winner_2:
        print("  ✅ Test 6 — Deterministic: identical scores and winner across runs")
        passed += 1
    else:
        print("  ❌ Test 6 — Non-deterministic output detected")
        failed += 1

    # ── Test 7: Constraint Rejection ──────────────────────────────────────
    bad_metrics = {"power_usage": 98.0, "network_health": 35.0, "latency": 10.0,
                   "packet_loss": 0.5, "tower_utilization": 50.0}
    is_valid, violations = validate_strategy(bad_metrics, "Bad Strategy")
    if not is_valid and len(violations) == 2:
        print(f"  ✅ Test 7 — Constraint rejection: {len(violations)} violations detected")
        for v in violations:
            print(f"     → {v}")
        passed += 1
    else:
        print(f"  ❌ Test 7 — Expected 2 violations, got {len(violations)}, valid={is_valid}")
        failed += 1

    # ── Test 8: Negative KPI Rejection ────────────────────────────────────
    neg_metrics = {"latency": -5.0, "packet_loss": 0.5, "power_usage": 50.0,
                   "tower_utilization": 50.0, "network_health": 80.0}
    is_valid_neg, neg_violations = validate_strategy(neg_metrics, "Negative Strategy")
    if not is_valid_neg and any("negative" in v for v in neg_violations):
        print(f"  ✅ Test 8 — Negative KPI rejected: {neg_violations}")
        passed += 1
    else:
        print(f"  ❌ Test 8 — Negative KPI not caught: valid={is_valid_neg}")
        failed += 1

    # ── Test 9: Empty Input Handling ──────────────────────────────────────
    empty_result = helios_optimize({"simulated_strategies": []})
    if empty_result["recommended_strategy"] is None and empty_result["ranking"] == []:
        print("  ✅ Test 9 — Empty input returns safe empty result")
        passed += 1
    else:
        print("  ❌ Test 9 — Empty input handling failed")
        failed += 1

    # ── Test 10: helios_optimize convenience function ─────────────────────
    conv_result = helios_optimize(MOCK_SIMULATION_RESULTS)
    if (conv_result["recommended_strategy"]["strategy"]
            == result["recommended_strategy"]["strategy"]):
        print("  ✅ Test 10 — helios_optimize() convenience function works")
        passed += 1
    else:
        print("  ❌ Test 10 — helios_optimize() returned different winner")
        failed += 1

    # ── Summary ───────────────────────────────────────────────────────────
    total = passed + failed
    print(f"\n{'='*80}")
    print(f"Optimizer Test Results: {passed}/{total} checks passed")
    if failed:
        print(f"⚠️  {failed} check(s) FAILED")
        sys.exit(1)
    else:
        print("🎉 All Optimizer Tests Passed!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    test_optimizer()
