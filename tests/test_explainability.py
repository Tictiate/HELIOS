"""
Test script for HELIOS Explainability Engine.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.services.explainability_service import generate_explanations

def test_explainability():
    # Mock inputs
    current_state = {
        "tower_id": "T_METRO_02",
        "users": 980,
        "available_bandwidth_mbps": 8.0,
        "latency_ms": 64.0,
        "packet_loss_pct": 4.8,
        "power_usage_pct": 85.0,
        "temperature_c": 66.0,
        "cpu_usage_pct": 80.0,
        "traffic_load": 0.95,
        "network_health": 16.05
    }
    
    prediction_output = {
        "prediction": {
            "confidence": 96.3,
            "severity": "high",
            "contributing_factors": ["congestion", "latency"],
            "thresholds_exceeded": ["congestion > 90%", "latency > 50ms"]
        }
    }
    
    strategy_evaluation = {
        "recommended_strategy": {
            "strategy": "Traffic Redistribution",
            "score": 46.41,
            "final_metrics": {
                "latency": 55.0,
                "packet_loss": 3.2,
                "power_usage": 83.0,
                "tower_utilization": 75.0,
                "network_health": 29.5
            }
        },
        "ranking": [
            {"strategy": "Traffic Redistribution", "score": 46.41, "feasible": True},
            {"strategy": "Increase Bandwidth", "score": 45.07, "feasible": True},
            {"strategy": "Temporary Network Slice", "score": 43.97, "feasible": True},
            {"strategy": "Bad Strategy", "score": 0.0, "feasible": False}
        ]
    }
    
    digital_twin_simulation = {} # Usually we extract final_metrics from strategy_evaluation as designed in our service
    
    execution_report = {
        "status": "executed",
        "changed_metrics": {
            "latency_ms": {"before": 64.0, "after": 52.48, "delta": -11.52},
            "network_health": {"before": 16.05, "after": 28.95, "delta": 12.9}
        },
        "improvement_score": 12.9
    }
    
    # Generate explanations
    explanations = generate_explanations(
        current_state, prediction_output, strategy_evaluation, digital_twin_simulation, execution_report
    )
    
    print("=" * 80)
    print(" EXPLAINABILITY ENGINE TEST RESULTS".center(80))
    print("=" * 80)
    
    print("\\n[Prediction Explanation]")
    for k, v in explanations["prediction_explanation"].items():
        print(f"  {k}: {v}")
        
    print("\\n[Strategy Explanation]")
    for k, v in explanations["strategy_explanation"].items():
        if k == "rejected_alternatives":
            print(f"  {k}:")
            for alt in v:
                print(f"    - {alt['strategy']} ({alt['reason']}, score: {alt['score']})")
        else:
            print(f"  {k}: {v}")
            
    print("\\n[Simulation Explanation]")
    for k, v in explanations["simulation_explanation"].items():
        print(f"  {k}: {v}")
        
    print("\\n[Execution Explanation]")
    for k, v in explanations["execution_explanation"].items():
        if k == "actual_metric_changes":
            print(f"  {k}:")
            for mk, mv in v.items():
                print(f"    - {mk}: {mv['before']} -> {mv['after']} (delta {mv['delta']})")
        else:
            print(f"  {k}: {v}")
            
    print("\\n[HELIOS Insight]")
    print(f"  > {explanations['helios_insight']}")
    print("\\n" + "=" * 80)

if __name__ == "__main__":
    test_explainability()
