import os
import sys

# Ensure ai_engine is discoverable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai_engine.prediction.predict import helios_predict

def run_scenario(name, state):
    print(f"\n{'='*40}")
    print(f"Scenario: {name}")
    print(f"{'='*40}")
    result = helios_predict(state)
    
    print(f"Network Health: {result['network_health']} ({result['health_status']})")
    print(f"Congestion Prediction: {result['prediction']['congestion']['prediction']} ({result['prediction']['congestion']['confidence']}%)")
    print(f"Failure Prediction: {result['prediction']['failure']['prediction']} ({result['prediction']['failure']['confidence']}%)")
    print(f"Overall Confidence: {result['overall_confidence']}%")
    print(f"Prediction Time: {result['execution_time_ms']} ms")
    
if __name__ == "__main__":
    # Scenario 1: Normal Network
    normal_state = {
        "tower_id": "T1",
        "users": 200,
        "available_bandwidth_mbps": 80,
        "latency_ms": 10,
        "packet_loss_pct": 0.1,
        "power_usage_pct": 30,
        "temperature_c": 35,
        "cpu_usage_pct": 20,
        "weather": "clear",
        "traffic_load": 0.2
    }
    
    # Scenario 2: Congestion
    congestion_state = {
        "tower_id": "T2",
        "users": 950,
        "available_bandwidth_mbps": 10,
        "latency_ms": 60,
        "packet_loss_pct": 3.5,
        "power_usage_pct": 85,
        "temperature_c": 50,
        "cpu_usage_pct": 75,
        "weather": "rain",
        "traffic_load": 0.9
    }
    
    # Scenario 3: Tower Failure
    failure_state = {
        "tower_id": "T3",
        "users": 400,
        "available_bandwidth_mbps": 50,
        "latency_ms": 25,
        "packet_loss_pct": 1.0,
        "power_usage_pct": 98,
        "temperature_c": 85,  # High temp, high power
        "cpu_usage_pct": 95,
        "weather": "storm",
        "traffic_load": 0.5
    }
    
    # Scenario 4: Critical Network
    critical_state = {
        "tower_id": "T4",
        "users": 1000,
        "available_bandwidth_mbps": 2,
        "latency_ms": 150,
        "packet_loss_pct": 10.0,
        "power_usage_pct": 100,
        "temperature_c": 95,
        "cpu_usage_pct": 100,
        "weather": "storm",
        "traffic_load": 1.0
    }
    
    run_scenario("Normal Network", normal_state)
    run_scenario("Congestion", congestion_state)
    run_scenario("Tower Failure", failure_state)
    run_scenario("Critical Network", critical_state)