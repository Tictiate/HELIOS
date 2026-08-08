"""
forecast_engine.py — Maps strategy names to deterministic effect profiles
and generates full simulation timelines.

Each effect profile is a dict of deltas / factors that the state_transition
module applies through the metrics functions. The profiles are intentionally
conservative so simulations produce plausible future states.

Effect keys:
    latency_factor      Fractional change  (e.g. -0.20 = 20% decrease)
    bandwidth_delta     Absolute change    (e.g. +25 Mbps)
    packet_loss_factor  Fractional change
    utilization_factor  Fractional change
    power_delta         Absolute change    (e.g. +8%)
    user_factor         Fractional change  (e.g. -0.10 = 10% fewer users)
    edge_cpu_factor     Fractional change
"""

from typing import Dict, Any, List

from simulator.digital_twin.state_transition import extract_base_kpis, apply_tick

# Total number of evolution ticks (tick 0 is baseline, ticks 1–10 evolve)
TOTAL_TICKS = 10

# ──────────────────────────────────────────────────────────────────────────────
# Strategy effect profiles
# ──────────────────────────────────────────────────────────────────────────────

STRATEGY_EFFECTS: Dict[str, Dict[str, float]] = {

    # ── Congestion strategies ─────────────────────────────────────────────
    "Increase Bandwidth": {
        "bandwidth_delta": 25.0,
        "latency_factor": -0.20,
        "power_delta": 8.0,
        "utilization_factor": -0.15,
        "packet_loss_factor": -0.10,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.0,
    },

    "QoS Traffic Shaping": {
        "bandwidth_delta": 0.0,
        "latency_factor": -0.15,
        "power_delta": 2.0,
        "utilization_factor": -0.05,
        "packet_loss_factor": -0.20,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.05,
    },

    # ── Routing strategies ────────────────────────────────────────────────
    "Traffic Redistribution": {
        "bandwidth_delta": 10.0,
        "latency_factor": -0.15,
        "power_delta": 3.0,
        "utilization_factor": -0.25,
        "packet_loss_factor": -0.15,
        "user_factor": -0.20,
        "edge_cpu_factor": -0.05,
    },

    "Traffic Rerouting": {
        "bandwidth_delta": 5.0,
        "latency_factor": -0.10,
        "power_delta": 2.0,
        "utilization_factor": -0.10,
        "packet_loss_factor": -0.12,
        "user_factor": -0.05,
        "edge_cpu_factor": 0.0,
    },

    "Dynamic Path Optimisation": {
        "bandwidth_delta": 5.0,
        "latency_factor": -0.18,
        "power_delta": 1.0,
        "utilization_factor": -0.08,
        "packet_loss_factor": -0.15,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.0,
    },

    # ── Network Slice Management ──────────────────────────────────────────
    "Dynamic Slice Reallocation": {
        "bandwidth_delta": 0.0, # Total BW doesn't change, just shifts between slices
        "latency_factor": -0.25, # Overall latency improves
        "power_delta": 2.0,
        "utilization_factor": -0.05,
        "packet_loss_factor": -0.20,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.0,
    },

    "Temporary Network Slice": {
        "bandwidth_delta": 20.0,
        "latency_factor": -0.18,
        "power_delta": 5.0,
        "utilization_factor": -0.12,
        "packet_loss_factor": -0.08,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.03,
    },

    "Emergency Network Slice": {
        "bandwidth_delta": 15.0,
        "latency_factor": -0.12,
        "power_delta": 6.0,
        "utilization_factor": -0.10,
        "packet_loss_factor": -0.10,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.05,
    },

    "Slice Reconfiguration": {
        "bandwidth_delta": 8.0,
        "latency_factor": -0.10,
        "power_delta": 2.0,
        "utilization_factor": -0.08,
        "packet_loss_factor": -0.05,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.0,
    },

    # ── Edge Computing ────────────────────────────────────────────────────
    "Edge Workload Migration": {
        "bandwidth_delta": 5.0,
        "latency_factor": -0.22,
        "power_delta": -5.0,
        "utilization_factor": -0.08,
        "packet_loss_factor": -0.05,
        "user_factor": 0.0,
        "edge_cpu_factor": -0.30,
    },

    "Edge Cache Warming": {
        "bandwidth_delta": 3.0,
        "latency_factor": -0.10,
        "power_delta": 2.0,
        "utilization_factor": -0.03,
        "packet_loss_factor": -0.02,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.10,
    },

    "Edge Load Rebalancing": {
        "bandwidth_delta": 3.0,
        "latency_factor": -0.12,
        "power_delta": -2.0,
        "utilization_factor": -0.05,
        "packet_loss_factor": -0.05,
        "user_factor": 0.0,
        "edge_cpu_factor": -0.20,
    },

    # ── Failure Recovery ──────────────────────────────────────────────────
    "Activate Backup Tower": {
        "bandwidth_delta": 15.0,
        "latency_factor": -0.10,
        "power_delta": 10.0,
        "utilization_factor": -0.30,
        "packet_loss_factor": -0.20,
        "user_factor": -0.15,
        "edge_cpu_factor": -0.05,
    },

    "Predictive Component Replacement": {
        "bandwidth_delta": 0.0,
        "latency_factor": -0.05,
        "power_delta": -3.0,
        "utilization_factor": -0.02,
        "packet_loss_factor": -0.08,
        "user_factor": 0.0,
        "edge_cpu_factor": -0.03,
    },

    # ── Emergency Response ────────────────────────────────────────────────
    "Disaster Recovery Protocol": {
        "bandwidth_delta": 10.0,
        "latency_factor": -0.08,
        "power_delta": 12.0,
        "utilization_factor": -0.20,
        "packet_loss_factor": -0.25,
        "user_factor": -0.10,
        "edge_cpu_factor": -0.10,
    },

    # ── Load Balancing ────────────────────────────────────────────────────
    "Inter-Tower Load Balancing": {
        "bandwidth_delta": 8.0,
        "latency_factor": -0.12,
        "power_delta": 2.0,
        "utilization_factor": -0.20,
        "packet_loss_factor": -0.10,
        "user_factor": -0.10,
        "edge_cpu_factor": -0.05,
    },

    # ── Power Optimization ────────────────────────────────────────────────
    "Power Scaling": {
        "bandwidth_delta": 0.0,
        "latency_factor": 0.02,
        "power_delta": -12.0,
        "utilization_factor": 0.0,
        "packet_loss_factor": 0.0,
        "user_factor": 0.0,
        "edge_cpu_factor": 0.0,
    },

    "Sleep Mode Activation": {
        "bandwidth_delta": -5.0,
        "latency_factor": 0.05,
        "power_delta": -20.0,
        "utilization_factor": 0.0,
        "packet_loss_factor": 0.02,
        "user_factor": 0.0,
        "edge_cpu_factor": -0.10,
    },
}

# Fallback profile for unknown strategies
_DEFAULT_EFFECT: Dict[str, float] = {
    "bandwidth_delta": 0.0,
    "latency_factor": 0.0,
    "power_delta": 0.0,
    "utilization_factor": 0.0,
    "packet_loss_factor": 0.0,
    "user_factor": 0.0,
    "edge_cpu_factor": 0.0,
}


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def get_effect_profile(strategy_name: str) -> Dict[str, float]:
    """
    Returns the effect profile for a given strategy name.
    Falls back to the default (zero-change) profile for unknown strategies.
    """
    return dict(STRATEGY_EFFECTS.get(strategy_name, _DEFAULT_EFFECT))


def forecast_strategy(
    network_state: Dict[str, Any],
    strategy: Dict[str, Any],
    ticks: int = 11,
) -> List[Dict[str, Any]]:
    """
    Generates a full timeline of *ticks* snapshots for one strategy.

    Args:
        network_state: The current (original) network state dict.
        strategy:      A candidate strategy dict from the Strategy Planner.
        ticks:         Total number of snapshots to produce (default 11: 0–10).

    Returns:
        A list of snapshot dicts, one per tick.
    """
    base_kpis = extract_base_kpis(network_state)
    effect = get_effect_profile(strategy.get("name", ""))
    strategy_id = strategy.get("strategy_id", "S?")
    strategy_name = strategy.get("name", "Unknown")

    timeline: List[Dict[str, Any]] = []
    for tick in range(ticks):
        snapshot = apply_tick(
            base_kpis=base_kpis,
            effect_profile=effect,
            tick=tick,
            total_ticks=ticks - 1,  # denominator: 10 for 11 ticks
            strategy_id=strategy_id,
            strategy_name=strategy_name,
        )
        timeline.append(snapshot)

    return timeline
