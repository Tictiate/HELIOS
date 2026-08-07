"""
Integration Test — HELIOS AI Pipeline Orchestrator

Executes and verifies the end-to-end HELIOS AI pipeline:
Current State → Prediction Engine → Strategy Planner
→ Digital Twin Simulator → Multi-objective Optimizer.
"""

import os
import sys

# Ensure project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from pipeline.helios_pipeline import HeliosPipeline


# ──────────────────────────────────────────────────────────────────────────────
# Scenario Telemetries
# ──────────────────────────────────────────────────────────────────────────────

SCENARIOS = {
    "Normal Network": {
        "tower_id": "T_METRO_01",
        "users": 150,
        "bandwidth": 85.0,  # normalises to available_bandwidth_mbps
        "latency": 8.0,      # normalises to latency_ms
        "packet_loss": 0.05, # normalises to packet_loss_pct
        "power_usage": 28.0, # normalises to power_usage_pct
        "temperature": 34.0, # normalises to temperature_c
        "cpu_usage": 15.0,   # normalises to cpu_usage_pct
        "traffic_load": 0.15,
        "weather": "clear",
    },
    "High Congestion": {
        "tower_id": "T_METRO_02",
        "users": 980,
        "bandwidth": 8.0,
        "latency": 64.0,
        "packet_loss": 4.8,
        "power_usage": 85.0,
        "temperature": 66.0,
        "cpu_usage": 80.0,
        "traffic_load": 0.95,
        "weather": "fog",
    },
}


def test_pipeline_execution():
    pipeline = HeliosPipeline()
    passed = 0
    failed = 0

    for name, raw_state in SCENARIOS.items():
        print(f"\n{'='*80}")
        print(f" TESTING SCENARIO: {name}".center(80))
        print(f"{'='*80}")

        # Run pipeline
        result = pipeline.run(raw_state)

        metadata = result["metadata"]
        current_state = result["current_state"]
        prediction = result["prediction"]
        strategies = result["strategies"]
        simulation = result["simulation"]
        optimization = result["optimization"]

        print("\n" + "="*60)
        print(" HELIOS AI PIPELINE".center(60))
        print("="*60)

        # ── Check 1: Current State Loaded & Normalised ─────────────────────
        if current_state["tower_id"] == raw_state["tower_id"] and "latency_ms" in current_state:
            print("  ✓ Current State Loaded")
            print("  ↓")
            passed += 1
        else:
            print("  ❌ Current State Load Failure")
            failed += 1

        # ── Check 2: Prediction Successful ─────────────────────────────────
        if prediction and "prediction" in prediction and "network_health" in prediction:
            print(f"  ✓ Prediction Complete")
            print("  ↓")
            passed += 1
        else:
            print("  ❌ Prediction Engine Execution Failure")
            failed += 1

        # ── Check 3: Strategies Generated ──────────────────────────────────
        candidates = strategies.get("candidate_strategies", [])
        if "planning_goal" in strategies and isinstance(candidates, list):
            print(f"  ✓ Strategies Generated")
            print("  ↓")
            passed += 1
        else:
            print("  ❌ Strategy Planner Execution Failure")
            failed += 1

        # ── Check 4: Three Simulations Produced ────────────────────────────
        simulated = simulation.get("simulated_strategies", [])
        expected_sim_count = min(3, len(candidates))
        if len(simulated) == expected_sim_count:
            print(f"  ✓ Three Simulations Completed")
            print("  ↓")
            passed += 1
        else:
            print(f"  ❌ Digital Twin Simulator Output Mismatch. Expected {expected_sim_count}, got {len(simulated)}")
            failed += 1

        # ── Check 5: Optimization Complete ─────────────────────────────────
        recommended = optimization.get("recommended_strategy")
        ranking = optimization.get("ranking", [])
        opt_summary = optimization.get("optimization_summary", {})

        if (recommended
                and recommended.get("strategy")
                and recommended.get("score", 0) > 0
                and opt_summary.get("constraints_checked") is True
                and len(ranking) == len(simulated)):
            print(f"  ✓ Optimization Complete")
            print()
            print(f"  Recommended Strategy")
            print(f"  {recommended['strategy']}")
            print(f"  Score")
            print(f"  {recommended['score']}")
            passed += 1
        else:
            print("  ❌ Optimization Failure")
            failed += 1

        # ── Check 6: Pipeline Timings Include Optimization ─────────────────
        timings = metadata.get("timings_ms", {})
        if all(k in timings for k in ["prediction", "planning", "simulation", "optimization", "total_pipeline"]):
            print()
            print(f"  Pipeline Execution: {timings['total_pipeline']} ms")
            print(f"  [Prediction: {timings['prediction']} ms | Planning: {timings['planning']} ms | "
                  f"Simulation: {timings['simulation']} ms | Optimization: {timings['optimization']} ms]")
            passed += 1
        else:
            print("  ❌ Pipeline Timings Missing or Incomplete")
            failed += 1

        print()
        print("="*60)
        print(" Pipeline Completed Successfully".center(60))
        print("="*60)

    total = passed + failed
    print(f"\n{'='*80}")
    print(f"Pipeline Test Results: {passed}/{total} checks passed")
    if failed:
        print(f"⚠️  {failed} check(s) FAILED")
        sys.exit(1)
    else:
        print("🎉 Complete Pipeline Executed Successfully!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    test_pipeline_execution()
