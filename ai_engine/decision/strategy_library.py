"""
Strategy Library — Registry of reusable strategy templates for the HELIOS
Autonomous Strategy Planner.

Each template is a plain dict with a fixed schema. Templates are looked up by
name and assembled into full strategy objects by the strategy_generator module.
"""

from typing import Dict, List, Any

# ──────────────────────────────────────────────────────────────────────────────
# Categories
# ──────────────────────────────────────────────────────────────────────────────

CATEGORIES = [
    "Congestion",
    "Failure Recovery",
    "Power Optimization",
    "Load Balancing",
    "Emergency Response",
    "Network Slice Management",
    "Edge Computing",
    "Routing",
]


def list_categories() -> List[str]:
    """Returns the full list of strategy categories."""
    return list(CATEGORIES)


# ──────────────────────────────────────────────────────────────────────────────
# Template definitions
# ──────────────────────────────────────────────────────────────────────────────
# Every template MUST contain the keys listed in REQUIRED_FIELDS.

REQUIRED_FIELDS = {
    "name",
    "category",
    "description",
    "expected_effect",
    "prerequisites",
    "possible_risks",
    "estimated_execution_time",
    "priority",
}

# Deterministic category → priority mapping.
# The planner MUST NOT sort by priority; the optimizer will use it later.
CATEGORY_PRIORITY = {
    "Emergency Response": "CRITICAL",
    "Failure Recovery": "HIGH",
    "Congestion": "MEDIUM",
    "Routing": "MEDIUM",
    "Edge Computing": "MEDIUM",
    "Network Slice Management": "MEDIUM",
    "Load Balancing": "MEDIUM",
    "Power Optimization": "LOW",
}

_TEMPLATES: Dict[str, Dict[str, Any]] = {

    # ── Congestion ────────────────────────────────────────────────────────
    "Increase Bandwidth": {
        "name": "Increase Bandwidth",
        "category": "Congestion",
        "description": "Allocate additional spectrum or carrier aggregation to increase available bandwidth on the tower.",
        "expected_effect": {
            "latency": "Lower",
            "bandwidth": "Higher",
            "power": "Higher",
        },
        "prerequisites": ["available_spectrum"],
        "possible_risks": ["Increased power consumption", "Interference with adjacent cells"],
        "estimated_execution_time": "30 seconds",
        "priority": "MEDIUM",
    },

    "Traffic Redistribution": {
        "name": "Traffic Redistribution",
        "category": "Routing",
        "description": "Redistribute connected users to neighbouring towers with spare capacity.",
        "expected_effect": {
            "latency": "Lower",
            "tower_load": "Balanced",
        },
        "prerequisites": ["neighbouring_tower_available"],
        "possible_risks": ["Handover failures", "Temporary latency spike during migration"],
        "estimated_execution_time": "45 seconds",
        "priority": "MEDIUM",
    },

    "Temporary Network Slice": {
        "name": "Temporary Network Slice",
        "category": "Network Slice Management",
        "description": "Activate a temporary high-priority network slice to absorb excess traffic.",
        "expected_effect": {
            "latency": "Lower",
            "bandwidth": "Higher",
            "qos": "Improved",
        },
        "prerequisites": ["slice_orchestrator_available"],
        "possible_risks": ["Resource contention with existing slices"],
        "estimated_execution_time": "20 seconds",
        "priority": "MEDIUM",
    },

    "Edge Workload Migration": {
        "name": "Edge Workload Migration",
        "category": "Edge Computing",
        "description": "Migrate compute-intensive services to a nearby edge server with lower utilisation.",
        "expected_effect": {
            "latency": "Lower",
            "edge_load": "Balanced",
        },
        "prerequisites": ["edge_server_available"],
        "possible_risks": ["Service interruption during migration", "Increased WAN latency"],
        "estimated_execution_time": "60 seconds",
        "priority": "MEDIUM",
    },

    "QoS Traffic Shaping": {
        "name": "QoS Traffic Shaping",
        "category": "Congestion",
        "description": "Apply quality-of-service policies to throttle low-priority traffic and prioritise critical services.",
        "expected_effect": {
            "latency": "Lower for priority traffic",
            "bandwidth": "Redistributed",
        },
        "prerequisites": ["qos_policy_engine"],
        "possible_risks": ["Degraded experience for non-priority users"],
        "estimated_execution_time": "15 seconds",
        "priority": "MEDIUM",
    },

    # ── Failure Recovery ──────────────────────────────────────────────────
    "Activate Backup Tower": {
        "name": "Activate Backup Tower",
        "category": "Failure Recovery",
        "description": "Bring a standby or redundant tower online to absorb traffic from the at-risk tower.",
        "expected_effect": {
            "tower_load": "Redistributed",
            "availability": "Higher",
        },
        "prerequisites": ["backup_tower_available"],
        "possible_risks": ["Cold-start latency", "Configuration drift"],
        "estimated_execution_time": "90 seconds",
        "priority": "HIGH",
    },

    "Emergency Network Slice": {
        "name": "Emergency Network Slice",
        "category": "Emergency Response",
        "description": "Provision an emergency network slice to guarantee connectivity for critical services.",
        "expected_effect": {
            "availability": "Higher",
            "qos": "Guaranteed for critical",
        },
        "prerequisites": ["slice_orchestrator_available"],
        "possible_risks": ["Reduced capacity for non-emergency traffic"],
        "estimated_execution_time": "25 seconds",
        "priority": "CRITICAL",
    },

    "Traffic Rerouting": {
        "name": "Traffic Rerouting",
        "category": "Routing",
        "description": "Reroute traffic through alternative network paths to avoid the failing node.",
        "expected_effect": {
            "latency": "Potentially higher",
            "availability": "Higher",
        },
        "prerequisites": ["alternative_path_exists"],
        "possible_risks": ["Increased latency on alternate path", "Path congestion"],
        "estimated_execution_time": "30 seconds",
        "priority": "MEDIUM",
    },

    "Disaster Recovery Protocol": {
        "name": "Disaster Recovery Protocol",
        "category": "Emergency Response",
        "description": "Initiate full disaster recovery: failover to secondary site, activate backup links, alert NOC.",
        "expected_effect": {
            "availability": "Restored",
            "tower_load": "Redistributed",
        },
        "prerequisites": ["dr_site_available", "noc_reachable"],
        "possible_risks": ["Extended failover time", "Data synchronisation lag"],
        "estimated_execution_time": "180 seconds",
        "priority": "CRITICAL",
    },

    "Predictive Component Replacement": {
        "name": "Predictive Component Replacement",
        "category": "Failure Recovery",
        "description": "Schedule proactive replacement of hardware components showing early degradation signals.",
        "expected_effect": {
            "failure_probability": "Lower",
            "availability": "Higher",
        },
        "prerequisites": ["spare_components_available", "maintenance_window"],
        "possible_risks": ["Brief downtime during swap"],
        "estimated_execution_time": "300 seconds",
        "priority": "HIGH",
    },

    # ── Power Optimization ────────────────────────────────────────────────
    "Power Scaling": {
        "name": "Power Scaling",
        "category": "Power Optimization",
        "description": "Reduce transmit power on under-utilised sectors and channels to lower energy consumption.",
        "expected_effect": {
            "power": "Lower",
            "coverage": "Slightly reduced",
        },
        "prerequisites": ["power_control_supported"],
        "possible_risks": ["Coverage gap at cell edge"],
        "estimated_execution_time": "10 seconds",
        "priority": "LOW",
    },

    "Sleep Mode Activation": {
        "name": "Sleep Mode Activation",
        "category": "Power Optimization",
        "description": "Put idle radio units into low-power sleep mode during off-peak periods.",
        "expected_effect": {
            "power": "Significantly lower",
            "capacity": "Reduced",
        },
        "prerequisites": ["low_traffic_period"],
        "possible_risks": ["Delayed wake-up if traffic surges"],
        "estimated_execution_time": "5 seconds",
        "priority": "LOW",
    },

    # ── Load Balancing ────────────────────────────────────────────────────
    "Inter-Tower Load Balancing": {
        "name": "Inter-Tower Load Balancing",
        "category": "Load Balancing",
        "description": "Dynamically rebalance user connections across towers based on real-time load metrics.",
        "expected_effect": {
            "tower_load": "Balanced",
            "latency": "Lower",
        },
        "prerequisites": ["neighbouring_tower_available"],
        "possible_risks": ["Ping-pong handovers"],
        "estimated_execution_time": "40 seconds",
        "priority": "MEDIUM",
    },

    "Edge Load Rebalancing": {
        "name": "Edge Load Rebalancing",
        "category": "Load Balancing",
        "description": "Redistribute edge computing workloads across available edge nodes.",
        "expected_effect": {
            "edge_load": "Balanced",
            "latency": "Lower",
        },
        "prerequisites": ["edge_server_available"],
        "possible_risks": ["Temporary service disruption"],
        "estimated_execution_time": "50 seconds",
        "priority": "MEDIUM",
    },

    # ── Network Slice Management ──────────────────────────────────────────
    "Dynamic Slice Reallocation": {
        "name": "Dynamic Slice Reallocation",
        "category": "Network Slice Management",
        "description": "Dynamically reallocate bandwidth from lower-priority slices to higher-priority slices experiencing SLA violations.",
        "expected_effect": {
            "bandwidth": "Optimised across slices",
            "latency": "Lower for priority slices",
            "qos": "Guaranteed for critical slices",
        },
        "prerequisites": ["slice_orchestrator_available", "sla_violation_detected"],
        "possible_risks": ["Slight degradation in lower priority slices"],
        "estimated_execution_time": "10 seconds",
        "priority": "HIGH",
    },

    "Slice Reconfiguration": {
        "name": "Slice Reconfiguration",
        "category": "Network Slice Management",
        "description": "Resize or reconfigure existing network slices to better match current demand patterns.",
        "expected_effect": {
            "bandwidth": "Optimised",
            "qos": "Improved",
        },
        "prerequisites": ["slice_orchestrator_available"],
        "possible_risks": ["Brief QoS degradation during reconfiguration"],
        "estimated_execution_time": "35 seconds",
        "priority": "MEDIUM",
    },

    # ── Routing ───────────────────────────────────────────────────────────
    "Dynamic Path Optimisation": {
        "name": "Dynamic Path Optimisation",
        "category": "Routing",
        "description": "Recalculate optimal routing paths based on current latency and congestion metrics.",
        "expected_effect": {
            "latency": "Lower",
            "packet_loss": "Lower",
        },
        "prerequisites": ["sdn_controller_available"],
        "possible_risks": ["Route flapping if metrics oscillate"],
        "estimated_execution_time": "20 seconds",
        "priority": "MEDIUM",
    },

    # ── Edge Computing ────────────────────────────────────────────────────
    "Edge Cache Warming": {
        "name": "Edge Cache Warming",
        "category": "Edge Computing",
        "description": "Pre-populate edge caches with predicted high-demand content to reduce backhaul load.",
        "expected_effect": {
            "latency": "Lower",
            "backhaul_load": "Lower",
        },
        "prerequisites": ["edge_server_available", "content_prediction_model"],
        "possible_risks": ["Cache pollution if prediction is inaccurate"],
        "estimated_execution_time": "120 seconds",
        "priority": "LOW",
    },
}


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def get_strategy_template(name: str) -> Dict[str, Any]:
    """
    Returns a *copy* of the strategy template with the given name.

    Raises:
        KeyError: If no template with the given name exists.
    """
    if name not in _TEMPLATES:
        raise KeyError(f"Unknown strategy template: '{name}'")
    return dict(_TEMPLATES[name])


def list_template_names() -> List[str]:
    """Returns all registered template names."""
    return list(_TEMPLATES.keys())


def list_templates_by_category(category: str) -> List[Dict[str, Any]]:
    """Returns copies of all templates belonging to the given category."""
    return [
        dict(t) for t in _TEMPLATES.values()
        if t["category"] == category
    ]
