"""
generate_forecasts.py — Pipeline execution script that generates simulated strategy
timelines and saves them as a JSON file in the frontend public data directory.
"""

import os
import sys
import json

# Ensure project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_engine.decision.planner import helios_plan
from simulator.digital_twin.simulator import helios_simulate

# Current network state for the target tower (T2) experiencing high congestion
CURRENT_NETWORK_STATE = {
    "tower_id": "T2",
    "latency_ms": 65.0,
    "available_bandwidth_mbps": 15.0,
    "packet_loss_pct": 4.5,
    "tower_utilization_pct": 96.0,
    "power_usage_pct": 82.0,
    "temperature_c": 64.0,
    "users": 960,
    "cpu_usage_pct": 78.0,
    "memory_usage_pct": 70.0,
}

# Corresponding prediction output from the Prediction Engine
PREDICTION_OUTPUT = {
    "tower_id": "T2",
    "prediction": {
        "congestion": {"probability": 96.0, "prediction": "Congested", "confidence": 96.0},
        "failure": {"probability": 15.0, "prediction": "Healthy", "confidence": 85.0},
    },
    "network_health": 61,
    "health_status": "Warning",
}


def main():
    print("Executing planner...")
    planner_res = helios_plan(PREDICTION_OUTPUT)
    
    print("Executing simulator...")
    sim_res = helios_simulate(
        current_network_state=CURRENT_NETWORK_STATE,
        prediction_output=PREDICTION_OUTPUT,
        candidate_strategies=planner_res["candidate_strategies"],
    )

    output_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../frontend/public/data")
    )
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "simulated_forecasts.json")

    with open(output_path, "w") as f:
        json.dump(sim_res, f, indent=2)

    print(f"✅ Successfully wrote simulated forecasts to: {output_path}")


if __name__ == "__main__":
    main()
