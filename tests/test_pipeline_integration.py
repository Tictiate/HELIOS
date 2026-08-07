"""
Integration Test — HELIOS AI Pipeline Orchestrator

Executes and verifies the end-to-end HELIOS AI pipeline:
Current State → Prediction Engine → Strategy Planner → Digital Twin Simulator.
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

        print("\n" + "-"*80)
        print(" PIPELINE STATE OUTPUT VERIFICATION")
        print("-"*80)

        # ── Check 1: Current State Loaded & Normalised ─────────────────────
        if current_state["tower_id"] == raw_state["tower_id"] and "latency_ms" in current_state:
            print("  ✅ Current State Loaded & Normalised Successfully")
            passed += 1
        else:
            print("  ❌ Current State Load Failure")
            failed += 1

        # ── Check 2: Prediction Successful ─────────────────────────────────
        if prediction and "prediction" in prediction and "network_health" in prediction:
            print(f"  ✅ Prediction Successful: Health Score = {prediction['network_health']} ({prediction['health_status']})")
            print(f"     Congestion: {prediction['prediction']['congestion']['prediction']} ({prediction['prediction']['congestion']['probability']}%)")
            print(f"     Failure:    {prediction['prediction']['failure']['prediction']} ({prediction['prediction']['failure']['probability']}%)")
            passed += 1
        else:
            print("  ❌ Prediction Engine Execution Failure")
            failed += 1

        # ── Check 3: Strategies Generated ──────────────────────────────────
        candidates = strategies.get("candidate_strategies", [])
        if "planning_goal" in strategies and isinstance(candidates, list):
            print(f"  ✅ Strategies Generated: Goal = '{strategies['planning_goal']}' ({len(candidates)} candidates)")
            passed += 1
        else:
            print("  ❌ Strategy Planner Execution Failure")
            failed += 1

        # ── Check 4: Three Simulations Produced (or up to len(candidates)) ─
        simulated = simulation.get("simulated_strategies", [])
        expected_sim_count = min(3, len(candidates))
        if len(simulated) == expected_sim_count:
            print(f"  ✅ Digital Twin Simulation: Correctly Simulated Top {len(simulated)} Strategies")
            for sim in simulated:
                timeline = sim["timeline"]
                print(f"     - '{sim['strategy']}' timeline generated ({len(timeline)} ticks)")
            passed += 1
        else:
            print(f"  ❌ Digital Twin Simulator Output Mismatch. Expected {expected_sim_count}, got {len(simulated)}")
            failed += 1

        # ── Check 5: Pipeline Timings Registered ──────────────────────────
        timings = metadata.get("timings_ms", {})
        if all(k in timings for k in ["prediction", "planning", "simulation", "total_pipeline"]):
            print(f"  ✅ Pipeline Execution Timings: {timings['total_pipeline']} ms total")
            print(f"     [Prediction: {timings['prediction']} ms | Planning: {timings['planning']} ms | Simulation: {timings['simulation']} ms]")
            passed += 1
        else:
            print("  ❌ Pipeline Timings Missing or Incomplete")
            failed += 1

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
