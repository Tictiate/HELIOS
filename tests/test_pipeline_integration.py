"""
Integration Test — HELIOS Decision & Simulation Pipeline

Connects the Autonomous Strategy Planner and the Digital Twin Simulator:
1. Takes Current Network State + Prediction Engine Output.
2. Runs the Strategy Planner to generate and validate candidate strategies.
3. Automatically pipes those candidate strategies into the Digital Twin Simulator.
4. Simulates the top 3 strategies and prints the timeline transitions.
"""

import os
import sys
import json

# Ensure project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_engine.decision.planner import helios_plan
from simulator.digital_twin.simulator import helios_simulate


# ──────────────────────────────────────────────────────────────────────────────
# Test Scenario: Congestion
# ──────────────────────────────────────────────────────────────────────────────

MOCK_NETWORK_STATE = {
    "tower_id": "T_METRO_09",
    "latency_ms": 58.0,
    "available_bandwidth_mbps": 32.0,
    "packet_loss_pct": 3.8,
    "tower_utilization_pct": 92.0,
    "power_usage_pct": 78.0,
    "temperature_c": 62.0,
    "users": 940,
    "cpu_usage_pct": 75.0,
    "memory_usage_pct": 68.0,
}

MOCK_PREDICTION_OUTPUT = {
    "tower_id": "T_METRO_09",
    "prediction": {
        "congestion": {"probability": 96.0, "prediction": "Congested", "confidence": 95.0},
        "failure": {"probability": 12.0, "prediction": "Healthy", "confidence": 88.0},
    },
    "network_health": 55,
    "health_status": "Warning",
}


def run_pipeline():
    print("=" * 80)
    print(" HELIOS INTEGRATION PIPELINE RUNNER")
    print("=" * 80)
    
    print("\n[Step 1] Ingesting Current Network State & Prediction Output...")
    print(f"  Tower ID:         {MOCK_NETWORK_STATE['tower_id']}")
    print(f"  Current Health:   {MOCK_PREDICTION_OUTPUT['network_health']} ({MOCK_PREDICTION_OUTPUT['health_status']})")
    print(f"  Congestion Prob:  {MOCK_PREDICTION_OUTPUT['prediction']['congestion']['probability']}%")
    print(f"  Failure Prob:     {MOCK_PREDICTION_OUTPUT['prediction']['failure']['probability']}%")
    
    # ── 1. Strategy Planner ──
    print("\n[Step 2] Executing Autonomous Strategy Planner...")
    planner_result = helios_plan(MOCK_PREDICTION_OUTPUT)
    
    goal = planner_result["planning_goal"]
    rules = planner_result["rules_triggered"]
    candidates = planner_result["candidate_strategies"]
    
    print(f"  ✅ Planner Goal:     {goal}")
    print(f"  ✅ Rules Triggered:  {rules}")
    print(f"  ✅ Candidates Found: {len(candidates)}")
    for s in candidates:
        print(f"    - [{s['strategy_id']}] {s['name']} (Priority: {s['priority']})")
        
    # ── 2. Digital Twin Simulator ──
    print("\n[Step 3] Executing Digital Twin Simulator on Top 3 Candidates...")
    simulation_result = helios_simulate(
        current_network_state=MOCK_NETWORK_STATE,
        prediction_output=MOCK_PREDICTION_OUTPUT,
        candidate_strategies=candidates,
    )
    
    sim_strategies = simulation_result["simulated_strategies"]
    print(f"  ✅ Simulated Strategies: {len(sim_strategies)}")
    
    # Print comparison of timelines (Tick 0 -> Tick 10) for each simulated strategy
    for sim in sim_strategies:
        name = sim["strategy"]
        timeline = sim["timeline"]
        t0 = timeline[0]
        t10 = timeline[10]
        
        print(f"\n  Strategy: '{name}'")
        print(f"    Metric            | Baseline (Tick 0) -> Target (Tick 10) | Delta")
        print(f"    -----------------------------------------------------------------")
        
        metrics_to_show = [
            ("latency", "ms"),
            ("bandwidth", "Mbps"),
            ("packet_loss", "%"),
            ("tower_utilization", "%"),
            ("power_usage", "%"),
            ("temperature", "°C"),
            ("active_users", ""),
            ("network_health", "/100"),
        ]
        
        for key, unit in metrics_to_show:
            val0 = t0[key]
            val10 = t10[key]
            delta = val10 - val0
            sign = "+" if delta >= 0 else ""
            delta_str = f"({sign}{round(delta, 2)}{unit})" if delta != 0 else "(no change)"
            print(f"    {key:<17} | {val0:>7}{unit}       -> {val10:>7}{unit}       | {delta_str}")
            
    print("\n" + "=" * 80)
    print(" PIPELINE EXECUTION COMPLETED")
    print("=" * 80)


if __name__ == "__main__":
    run_pipeline()
