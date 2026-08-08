"""
state_transition.py — State cloning and per-tick state evolution.

Provides:
  - clone_state():  Deep-copies a network state dict so the original is never
                    mutated during simulation.
  - apply_tick():   Produces a single snapshot at a given tick by applying a
                    strategy's effect profile through the metrics module.
"""

import copy
import datetime
from typing import Dict, Any

from simulator.digital_twin.metrics import (
    calculate_latency,
    calculate_bandwidth,
    calculate_packet_loss,
    calculate_utilization,
    calculate_power,
    calculate_temperature,
    calculate_edge_cpu,
    calculate_edge_memory,
    calculate_active_users,
    calculate_network_health,
)


def clone_state(network_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns a deep copy of *network_state*.

    The original dict is never modified during simulation.
    """
    return copy.deepcopy(network_state)


def extract_base_kpis(network_state: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts baseline KPI values from the raw network state.

    Missing keys default to reasonable midpoints so the simulator never
    crashes on incomplete input.
    """
    return {
        "latency": float(network_state.get("latency_ms", 30)),
        "bandwidth": float(network_state.get("available_bandwidth_mbps", 50)),
        "packet_loss": float(network_state.get("packet_loss_pct", 1.0)),
        "tower_utilization": float(network_state.get("tower_utilization_pct",
                                   _estimate_utilization(network_state))),
        "power_usage": float(network_state.get("power_usage_pct", 50)),
        "temperature": float(network_state.get("temperature_c", 40)),
        "active_users": int(network_state.get("users", 500)),
        "edge_cpu": float(network_state.get("cpu_usage_pct", 50)),
        "edge_memory": float(network_state.get("memory_usage_pct", 45)),
        "slices": copy.deepcopy(network_state.get("slices", []))
    }


def _estimate_utilization(network_state: Dict[str, Any]) -> float:
    """
    Rough utilization estimate when the field is not directly available.

    Uses users / 1000 * 100 as a proxy.
    """
    users = float(network_state.get("users", 500))
    return min(100.0, (users / 1000.0) * 100.0)


def apply_tick(
    base_kpis: Dict[str, float],
    effect_profile: Dict[str, float],
    tick: int,
    total_ticks: int,
    strategy_id: str,
    strategy_name: str,
) -> Dict[str, Any]:
    """
    Produces a single timeline snapshot at *tick* by applying the strategy's
    *effect_profile* to *base_kpis*.

    Args:
        base_kpis:      Baseline KPIs extracted from the original network state.
        effect_profile:  Dict of deltas/factors produced by the forecast engine.
        tick:            Current tick (0 = baseline, 1–10 = evolution).
        total_ticks:     Number of evolution ticks (excludes tick 0).
        strategy_id:     The strategy ID (e.g. "S1").
        strategy_name:   The strategy name (e.g. "Increase Bandwidth").

    Returns:
        A snapshot dict containing all KPI values at this tick.
    """
    # At tick 0 we return the unmodified baseline
    sim_tick = tick  # tick 0 = no change, ticks 1-10 evolve
    t = total_ticks  # denominator for progress curve

    latency = calculate_latency(
        base_kpis["latency"],
        effect_profile.get("latency_factor", 0.0),
        sim_tick, t,
    )
    bandwidth = calculate_bandwidth(
        base_kpis["bandwidth"],
        effect_profile.get("bandwidth_delta", 0.0),
        sim_tick, t,
    )
    packet_loss = calculate_packet_loss(
        base_kpis["packet_loss"],
        effect_profile.get("packet_loss_factor", 0.0),
        sim_tick, t,
    )
    utilization = calculate_utilization(
        base_kpis["tower_utilization"],
        effect_profile.get("utilization_factor", 0.0),
        sim_tick, t,
    )
    power = calculate_power(
        base_kpis["power_usage"],
        effect_profile.get("power_delta", 0.0),
        sim_tick, t,
    )
    temperature = calculate_temperature(
        base_kpis["temperature"],
        effect_profile.get("power_delta", 0.0),
        sim_tick, t,
    )
    active_users = calculate_active_users(
        base_kpis["active_users"],
        effect_profile.get("user_factor", 0.0),
        sim_tick, t,
    )
    edge_cpu = calculate_edge_cpu(
        base_kpis["edge_cpu"],
        effect_profile.get("edge_cpu_factor", 0.0),
        sim_tick, t,
    )
    edge_memory = calculate_edge_memory(
        base_kpis["edge_memory"],
        effect_profile.get("edge_cpu_factor", 0.0),
        sim_tick, t,
    )

    health = calculate_network_health(latency, bandwidth, packet_loss, power, utilization)

    # ── Simulate Slice Evolution ──────────────────────────────────────────
    from simulator.digital_twin.metrics import _progress
    slices_sim = []
    p = _progress(sim_tick, t)
    for s in base_kpis.get("slices", []):
        s_clone = copy.deepcopy(s)
        if strategy_name == "Dynamic Slice Reallocation":
            # If in violation, latency and PL interpolate down to targets
            if s_clone["status"] in ["VIOLATION", "DEGRADED"]:
                lat_diff = s_clone["current_latency_ms"] - (s_clone["latency_target_ms"] * 0.8)
                pl_diff = s_clone["current_packet_loss_pct"] - (s_clone["packet_loss_target_pct"] * 0.5)
                s_clone["current_latency_ms"] -= (lat_diff * p)
                s_clone["current_packet_loss_pct"] -= (pl_diff * p)
                
                # Allocation increases
                demand = s_clone["current_demand_mbps"]
                alloc_diff = (demand * 1.2) - s_clone["allocated_bandwidth_mbps"]
                s_clone["allocated_bandwidth_mbps"] += (alloc_diff * p)
                
                # Update status at high progress
                if p > 0.8:
                    s_clone["status"] = "HEALTHY"
            
            # Lower priority slices might give up allocation
            elif s_clone["priority"] in ["NORMAL", "LOW"] and s_clone["allocated_bandwidth_mbps"] > s_clone["current_demand_mbps"]:
                surplus = s_clone["allocated_bandwidth_mbps"] - s_clone["current_demand_mbps"]
                s_clone["allocated_bandwidth_mbps"] -= (surplus * 0.5 * p)
                # They might slightly degrade but remain healthy
                s_clone["current_latency_ms"] += (s_clone["latency_target_ms"] * 0.2 * p)

        slices_sim.append(s_clone)

    return {
        "tick": tick,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "strategy_id": strategy_id,
        "strategy_name": strategy_name,
        "latency": latency,
        "bandwidth": bandwidth,
        "packet_loss": packet_loss,
        "tower_utilization": utilization,
        "network_health": health,
        "power_usage": power,
        "temperature": temperature,
        "active_users": active_users,
        "edge_cpu": edge_cpu,
        "edge_memory": edge_memory,
        "slices": slices_sim,
    }
