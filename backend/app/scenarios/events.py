"""
events.py — Definitions of realistic networking events for the HELIOS Scenario Framework.

Each scenario implements an `apply` method that mutates a given network
snapshot (telemetry) to reflect the realistic effects of the event.
"""

from typing import Dict, Any
import copy
import random

class NetworkScenario:
    """Base class for all network scenarios."""
    name = "Generic Scenario"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        return snapshot

class TrafficSurge(NetworkScenario):
    name = "Traffic Surge"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        state["users"] = int(state.get("users", 100) * random.uniform(2.5, 3.5))
        state["available_bandwidth_mbps"] = max(1.0, state.get("available_bandwidth_mbps", 50.0) * random.uniform(0.1, 0.3))
        state["latency_ms"] = min(200.0, state.get("latency_ms", 30.0) * random.uniform(1.8, 3.0))
        state["packet_loss_pct"] = min(15.0, state.get("packet_loss_pct", 1.0) + random.uniform(2.0, 5.0))
        state["cpu_usage_pct"] = min(99.0, state.get("cpu_usage_pct", 50.0) + random.uniform(20.0, 40.0))
        state["traffic_load"] = min(1.0, state.get("traffic_load", 0.5) + random.uniform(0.3, 0.5))
        return state

class TowerFailure(NetworkScenario):
    name = "Tower Failure"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        state["users"] = 0
        state["available_bandwidth_mbps"] = 0.0
        state["latency_ms"] = 999.0
        state["packet_loss_pct"] = 100.0
        state["power_usage_pct"] = 0.0
        state["cpu_usage_pct"] = 0.0
        state["traffic_load"] = 0.0
        return state

class FiberCut(NetworkScenario):
    name = "Fiber Cut"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        state["available_bandwidth_mbps"] = max(1.0, state.get("available_bandwidth_mbps", 50.0) * 0.05)
        state["latency_ms"] = min(500.0, state.get("latency_ms", 30.0) * random.uniform(3.0, 6.0))
        state["packet_loss_pct"] = min(80.0, state.get("packet_loss_pct", 1.0) + random.uniform(30.0, 60.0))
        return state

class DDoSAttack(NetworkScenario):
    name = "DDoS Attack"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        state["latency_ms"] = min(1000.0, state.get("latency_ms", 30.0) * random.uniform(4.0, 8.0))
        state["packet_loss_pct"] = min(50.0, state.get("packet_loss_pct", 1.0) + random.uniform(15.0, 40.0))
        state["cpu_usage_pct"] = 99.9
        state["available_bandwidth_mbps"] = max(0.0, state.get("available_bandwidth_mbps", 50.0) * 0.01)
        state["traffic_load"] = 1.0
        return state

class PowerFailure(NetworkScenario):
    name = "Power Failure"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        # Assuming running on backup power with degraded performance
        state["power_usage_pct"] = min(20.0, state.get("power_usage_pct", 50.0))
        state["available_bandwidth_mbps"] = max(5.0, state.get("available_bandwidth_mbps", 50.0) * 0.5)
        state["latency_ms"] = min(150.0, state.get("latency_ms", 30.0) * 1.5)
        return state

class HeatWave(NetworkScenario):
    name = "Heat Wave"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        state["temperature_c"] = min(90.0, state.get("temperature_c", 40.0) + random.uniform(15.0, 25.0))
        # Heat throttling kicks in
        state["cpu_usage_pct"] = max(10.0, state.get("cpu_usage_pct", 50.0) * 0.6)
        state["available_bandwidth_mbps"] = max(10.0, state.get("available_bandwidth_mbps", 50.0) * 0.7)
        state["weather"] = "hot"
        return state

class HeavyRain(NetworkScenario):
    name = "Heavy Rain"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        state["packet_loss_pct"] = min(20.0, state.get("packet_loss_pct", 1.0) + random.uniform(5.0, 10.0))
        state["latency_ms"] = min(120.0, state.get("latency_ms", 30.0) * random.uniform(1.2, 1.8))
        state["weather"] = "rain"
        return state

class EdgeServerFailure(NetworkScenario):
    name = "Edge Server Failure"
    
    def apply(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        state = copy.deepcopy(snapshot)
        # Shift load back to core/tower, increasing latency and CPU
        state["latency_ms"] = min(100.0, state.get("latency_ms", 30.0) + random.uniform(20.0, 40.0))
        state["cpu_usage_pct"] = min(99.0, state.get("cpu_usage_pct", 50.0) + random.uniform(15.0, 30.0))
        return state


# Registry of all available scenarios
AVAILABLE_SCENARIOS = {
    "Traffic Surge": TrafficSurge(),
    "Tower Failure": TowerFailure(),
    "Fiber Cut": FiberCut(),
    "DDoS Attack": DDoSAttack(),
    "Power Failure": PowerFailure(),
    "Heat Wave": HeatWave(),
    "Heavy Rain": HeavyRain(),
    "Edge Server Failure": EdgeServerFailure(),
}
