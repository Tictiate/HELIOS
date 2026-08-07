"""
Test Suite — Digital Twin Simulator

Verifies:
✓ Three strategies simulated
✓ Original network state unchanged
✓ Eleven timeline snapshots per strategy
✓ KPIs evolve smoothly
✓ Tick numbers sequential
✓ No negative metrics
✓ Timeline returned correctly
"""

import os
import sys
import copy

# Ensure the project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from simulator.digital_twin.simulator import helios_simulate


# ──────────────────────────────────────────────────────────────────────────────
# Mock Data
# ──────────────────────────────────────────────────────────────────────────────

MOCK_NETWORK_STATE = {
    "tower_id": "T5",
    "latency_ms": 45.0,
    "available_bandwidth_mbps": 40.0,
    "packet_loss_pct": 2.5,
    "tower_utilization_pct": 85.0,
    "power_usage_pct": 70.0,
    "temperature_c": 55.0,
    "users": 850,
    "cpu_usage_pct": 60.0,
    "memory_usage_pct": 50.0,
}

MOCK_PREDICTION_OUTPUT = {
    "tower_id": "T5",
    "prediction": {
        "congestion": {"probability": 96.0, "prediction": "Congested", "confidence": 96.0},
        "failure": {"probability": 15.0, "prediction": "Healthy", "confidence": 85.0},
    },
    "network_health": 61,
    "health_status": "Warning",
}

# 4 strategies provided, simulator should only process the first 3
MOCK_STRATEGIES = [
    {
        "strategy_id": "S1",
        "name": "Increase Bandwidth",
        "category": "Congestion",
        "priority": "MEDIUM",
    },
    {
        "strategy_id": "S2",
        "name": "Traffic Redistribution",
        "category": "Routing",
        "priority": "MEDIUM",
    },
    {
        "strategy_id": "S3",
        "name": "Edge Workload Migration",
        "category": "Edge Computing",
        "priority": "MEDIUM",
    },
    {
        "strategy_id": "S4",
        "name": "Power Scaling",
        "category": "Power Optimization",
        "priority": "LOW",
    },
]


# ──────────────────────────────────────────────────────────────────────────────
# Runner
# ──────────────────────────────────────────────────────────────────────────────

def run_tests():
    passed = 0
    failed = 0

    print(f"\n{'='*60}")
    print(f"Digital Twin Simulator Tests")
    print(f"{'='*60}")

    original_state_copy = copy.deepcopy(MOCK_NETWORK_STATE)

    result = helios_simulate(
        current_network_state=MOCK_NETWORK_STATE,
        prediction_output=MOCK_PREDICTION_OUTPUT,
        candidate_strategies=MOCK_STRATEGIES,
    )

    simulated_strategies = result.get("simulated_strategies", [])

    # ── Check 1: Three strategies simulated ───────────────────────────────
    if len(simulated_strategies) == 3:
        print(f"  ✅ Three strategies simulated (out of 4 candidates)")
        passed += 1
    else:
        print(f"  ❌ Expected 3 strategies, got {len(simulated_strategies)}")
        failed += 1

    # ── Check 2: Original state unchanged ─────────────────────────────────
    if MOCK_NETWORK_STATE == original_state_copy:
        print(f"  ✅ Original network state unchanged")
        passed += 1
    else:
        print(f"  ❌ Original network state was mutated!")
        failed += 1

    # Check properties of each simulated timeline
    for i, sim_res in enumerate(simulated_strategies):
        timeline = sim_res.get("timeline", [])
        strat_name = sim_res.get("strategy")
        
        # ── Check 3: Eleven timeline snapshots ────────────────────────────
        if len(timeline) == 11:
            print(f"  ✅ [{strat_name}] Eleven timeline snapshots generated")
            passed += 1
        else:
            print(f"  ❌ [{strat_name}] Expected 11 snapshots, got {len(timeline)}")
            failed += 1

        if len(timeline) > 0:
            # ── Check 4 & 5: Tick numbers sequential ──────────────────────
            ticks_sequential = all(timeline[j]["tick"] == j for j in range(len(timeline)))
            if ticks_sequential:
                print(f"  ✅ [{strat_name}] Tick numbers are sequential (0-10)")
                passed += 1
            else:
                print(f"  ❌ [{strat_name}] Tick numbers are NOT sequential")
                failed += 1

            # ── Check 6: No negative metrics ──────────────────────────────
            no_negatives = True
            numeric_fields = ["latency", "bandwidth", "packet_loss", "tower_utilization", 
                              "network_health", "power_usage", "temperature", "active_users",
                              "edge_cpu", "edge_memory"]
            
            for snap in timeline:
                for field in numeric_fields:
                    if snap.get(field, 0) < 0:
                        no_negatives = False
                        break
            
            if no_negatives:
                print(f"  ✅ [{strat_name}] No negative metrics found")
                passed += 1
            else:
                print(f"  ❌ [{strat_name}] Negative metrics found in timeline!")
                failed += 1

            # ── Check 7: Monotonic convergence (smooth evolution) ─────────
            # Ensure values are strictly converging to target or remaining flat
            smooth = True
            for field in numeric_fields:
                t0_val = timeline[0][field]
                t10_val = timeline[10][field]
                direction = 1 if t10_val >= t0_val else -1
                
                for j in range(1, 11):
                    # Check if each step moves in the expected direction (or stays flat)
                    step_delta = timeline[j][field] - timeline[j-1][field]
                    if step_delta * direction < 0:
                        smooth = False
                        break
            
            if smooth:
                print(f"  ✅ [{strat_name}] KPIs evolve smoothly")
                passed += 1
            else:
                print(f"  ❌ [{strat_name}] KPIs do not evolve smoothly (jitter detected)")
                failed += 1

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
