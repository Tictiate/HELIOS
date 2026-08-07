"""
Planning Rules — Deterministic IF→THEN rules that map detected network
problems to strategy template names.

Each rule has:
  - condition:       a callable (problem_dict) -> bool
  - goal:            the planning goal string produced when the rule fires
  - strategy_names:  list of strategy template names to generate
  - priority:        lower number = higher priority (for goal selection)
"""

from dataclasses import dataclass, field
from typing import Callable, Dict, Any, List


@dataclass(frozen=True)
class PlanningRule:
    """A single deterministic planning rule."""
    name: str
    condition: Callable[[Dict[str, Any]], bool]
    goal: str
    strategy_names: List[str]
    priority: int = 50  # lower = more urgent


class TriggeredRule:
    """A rule that has been evaluated as True, bundled with its metadata."""

    def __init__(self, rule: PlanningRule):
        self.rule = rule

    @property
    def goal(self) -> str:
        return self.rule.goal

    @property
    def priority(self) -> int:
        return self.rule.priority

    @property
    def strategy_names(self) -> List[str]:
        return self.rule.strategy_names

    def __repr__(self) -> str:
        return f"TriggeredRule(name={self.rule.name!r}, goal={self.goal!r})"


# ──────────────────────────────────────────────────────────────────────────────
# Helpers for extracting values from prediction output
# ──────────────────────────────────────────────────────────────────────────────

def _cong(p: Dict[str, Any]) -> float:
    """Extract congestion probability."""
    return float(p.get("prediction", {}).get("congestion", {}).get("probability", 0))


def _fail(p: Dict[str, Any]) -> float:
    """Extract failure probability."""
    return float(p.get("prediction", {}).get("failure", {}).get("probability", 0))


def _health(p: Dict[str, Any]) -> float:
    """Extract network health score."""
    return float(p.get("network_health", 100))


# ──────────────────────────────────────────────────────────────────────────────
# Rule definitions
# ──────────────────────────────────────────────────────────────────────────────

RULES: List[PlanningRule] = [

    # ── Critical compound condition ───────────────────────────────────────
    PlanningRule(
        name="critical_compound",
        condition=lambda p: _cong(p) > 90 and _fail(p) > 70 and _health(p) < 30,
        goal="Emergency Recovery",
        strategy_names=[
            "Disaster Recovery Protocol",
            "Emergency Network Slice",
            "Activate Backup Tower",
            "Traffic Rerouting",
            "Edge Workload Migration",
            "Traffic Redistribution",
        ],
        priority=10,
    ),

    # ── Severe congestion ─────────────────────────────────────────────────
    PlanningRule(
        name="congestion_critical",
        condition=lambda p: _cong(p) > 90,
        goal="Reduce Congestion",
        strategy_names=[
            "Increase Bandwidth",
            "Traffic Redistribution",
            "Temporary Network Slice",
            "Edge Workload Migration",
            "QoS Traffic Shaping",
        ],
        priority=20,
    ),
    PlanningRule(
        name="congestion_high",
        condition=lambda p: _cong(p) > 70,
        goal="Reduce Congestion",
        strategy_names=[
            "Increase Bandwidth",
            "Traffic Redistribution",
            "QoS Traffic Shaping",
            "Inter-Tower Load Balancing",
        ],
        priority=30,
    ),
    PlanningRule(
        name="congestion_moderate",
        condition=lambda p: _cong(p) > 50,
        goal="Reduce Congestion",
        strategy_names=[
            "QoS Traffic Shaping",
            "Inter-Tower Load Balancing",
            "Dynamic Path Optimisation",
        ],
        priority=40,
    ),

    # ── Failure ───────────────────────────────────────────────────────────
    PlanningRule(
        name="failure_critical",
        condition=lambda p: _fail(p) > 70,
        goal="Prevent Failure",
        strategy_names=[
            "Activate Backup Tower",
            "Emergency Network Slice",
            "Traffic Rerouting",
            "Disaster Recovery Protocol",
        ],
        priority=15,
    ),
    PlanningRule(
        name="failure_high",
        condition=lambda p: _fail(p) > 50,
        goal="Prevent Failure",
        strategy_names=[
            "Activate Backup Tower",
            "Traffic Rerouting",
            "Predictive Component Replacement",
        ],
        priority=25,
    ),
    PlanningRule(
        name="failure_moderate",
        condition=lambda p: _fail(p) > 30,
        goal="Prevent Failure",
        strategy_names=[
            "Predictive Component Replacement",
            "Traffic Rerouting",
        ],
        priority=35,
    ),

    # ── Low health ────────────────────────────────────────────────────────
    PlanningRule(
        name="health_critical",
        condition=lambda p: _health(p) < 30,
        goal="Emergency Recovery",
        strategy_names=[
            "Disaster Recovery Protocol",
            "Emergency Network Slice",
            "Edge Workload Migration",
            "Traffic Rerouting",
        ],
        priority=12,
    ),
    PlanningRule(
        name="health_poor",
        condition=lambda p: _health(p) < 50,
        goal="Restore Network Health",
        strategy_names=[
            "Inter-Tower Load Balancing",
            "Power Scaling",
            "Edge Workload Migration",
            "Dynamic Path Optimisation",
        ],
        priority=30,
    ),
    PlanningRule(
        name="health_warning",
        condition=lambda p: _health(p) < 70,
        goal="Improve Network Health",
        strategy_names=[
            "Inter-Tower Load Balancing",
            "Power Scaling",
            "Edge Load Rebalancing",
            "Slice Reconfiguration",
        ],
        priority=45,
    ),

    # ── Compound: high congestion + degraded health ───────────────────────
    PlanningRule(
        name="congestion_plus_poor_health",
        condition=lambda p: _cong(p) > 70 and _health(p) < 50,
        goal="Reduce Congestion",
        strategy_names=[
            "Increase Bandwidth",
            "Traffic Redistribution",
            "Edge Workload Migration",
            "Power Scaling",
        ],
        priority=22,
    ),

    # ── Default: healthy network ──────────────────────────────────────────
    PlanningRule(
        name="healthy_network",
        condition=lambda p: _cong(p) <= 50 and _fail(p) <= 30 and _health(p) >= 70,
        goal="Maintain Health",
        strategy_names=[
            "Edge Cache Warming",
            "Sleep Mode Activation",
            "Dynamic Path Optimisation",
        ],
        priority=90,
    ),
]


# ──────────────────────────────────────────────────────────────────────────────
# Evaluation
# ──────────────────────────────────────────────────────────────────────────────

def evaluate_rules(prediction_output: Dict[str, Any]) -> List[TriggeredRule]:
    """
    Evaluates every rule against the prediction output and returns the list
    of triggered rules, sorted by priority (most urgent first).
    """
    triggered: List[TriggeredRule] = []
    for rule in RULES:
        try:
            if rule.condition(prediction_output):
                triggered.append(TriggeredRule(rule))
        except (KeyError, TypeError, ValueError):
            # Malformed input should not crash the planner; skip the rule.
            continue

    triggered.sort(key=lambda t: t.priority)
    return triggered
