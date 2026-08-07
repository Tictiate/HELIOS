"""
Strategy Generator — Assembles fully-formed strategy objects from the
strategy library based on triggered planning rules.
"""

from typing import Dict, List, Any

from ai_engine.decision.strategy_library import get_strategy_template, REQUIRED_FIELDS
from ai_engine.decision.planning_rules import TriggeredRule


def generate_from_rule(rule: TriggeredRule, id_offset: int = 0) -> List[Dict[str, Any]]:
    """
    Looks up each strategy name referenced by *rule* in the strategy library,
    stamps a unique ``strategy_id``, and returns a list of assembled strategy
    dicts ready for inclusion in the planner output.

    Args:
        rule:       A TriggeredRule whose ``strategy_names`` will be resolved.
        id_offset:  Starting number for strategy IDs (allows the caller to
                    keep IDs unique across multiple rules).

    Returns:
        A list of strategy dicts, each containing all REQUIRED_FIELDS plus
        ``strategy_id``.
    """
    strategies: List[Dict[str, Any]] = []
    for idx, name in enumerate(rule.strategy_names, start=id_offset + 1):
        try:
            template = get_strategy_template(name)
        except KeyError:
            # Unknown template — skip silently so one bad rule entry does
            # not bring down the entire planning cycle.
            continue

        template["strategy_id"] = f"S{idx}"
        strategies.append(template)

    return strategies


def deduplicate(strategies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Removes duplicate strategies (identified by ``name``), keeping the first
    occurrence and re-numbering ``strategy_id`` sequentially.
    """
    seen_names: set = set()
    unique: List[Dict[str, Any]] = []

    for s in strategies:
        if s["name"] not in seen_names:
            seen_names.add(s["name"])
            unique.append(s)

    # Re-stamp IDs so they are contiguous
    for idx, s in enumerate(unique, start=1):
        s["strategy_id"] = f"S{idx}"

    return unique


def validate_strategy(strategy: Dict[str, Any]) -> bool:
    """
    Returns True if *strategy* contains every field in REQUIRED_FIELDS
    plus ``strategy_id``.
    """
    required = REQUIRED_FIELDS | {"strategy_id"}
    return required.issubset(strategy.keys())
