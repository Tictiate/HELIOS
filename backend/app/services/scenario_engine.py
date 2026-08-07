"""
scenario_engine.py — Core engine and state manager for the Scenario Injection Framework.

Loads and applies scenarios to snapshots.
Manages in-memory state (queues, random toggles) to bridge API requests
and the background simulator task.
"""

from typing import Dict, Any, Optional, List
import datetime
import uuid
import random
import logging

from app.scenarios.events import AVAILABLE_SCENARIOS

logger = logging.getLogger(__name__)

class ScenarioEngine:
    
    def apply_scenario(self, scenario_name: str, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        """Validates and applies a named scenario to the telemetry snapshot."""
        if scenario_name not in AVAILABLE_SCENARIOS:
            logger.warning(f"Unknown scenario: {scenario_name}. Returning original snapshot.")
            return snapshot
            
        scenario = AVAILABLE_SCENARIOS[scenario_name]
        return scenario.apply(snapshot)
        
    def generate_metadata(self, scenario_name: str, before: Dict[str, Any], after: Dict[str, Any]) -> Dict[str, Any]:
        """Generates metadata for the applied scenario event."""
        return {
            "scenario_id": str(uuid.uuid4()),
            "scenario_name": scenario_name,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "affected_towers": [before.get("tower_id", "Unknown")],
            "affected_edges": [], # Expandable in future if edges are explicitly targeted
            "severity": self._determine_severity(scenario_name)
        }
        
    def _determine_severity(self, scenario_name: str) -> str:
        high_severity = ["Tower Failure", "Fiber Cut", "DDoS Attack", "Power Failure"]
        if scenario_name in high_severity:
            return "high"
        return "medium"


class ScenarioManager:
    """
    In-memory state manager to coordinate between the FastAPI routes 
    and the background `live_simulator` task.
    """
    def __init__(self):
        self.manual_queue: List[str] = []
        self.scheduled_queue: List[Dict[str, Any]] = [] # list of {"scenario_name": str, "execute_at": datetime}
        self.random_enabled: bool = False
        
    def inject_manual(self, scenario_name: str):
        if scenario_name in AVAILABLE_SCENARIOS:
            self.manual_queue.append(scenario_name)
            return True
        return False
        
    def schedule(self, scenario_name: str, execute_at: datetime.datetime):
        if scenario_name in AVAILABLE_SCENARIOS:
            self.scheduled_queue.append({
                "scenario_name": scenario_name,
                "execute_at": execute_at
            })
            return True
        return False
        
    def enable_random(self):
        self.random_enabled = True
        
    def disable_random(self):
        self.random_enabled = False
        
    def pop_pending_scenario(self) -> Optional[str]:
        """
        Called by the simulator loop to get the next scenario to apply.
        Prioritizes manual injections, then scheduled, then random.
        """
        # 1. Check manual queue
        if self.manual_queue:
            return self.manual_queue.pop(0)
            
        # 2. Check scheduled queue
        now = datetime.datetime.utcnow()
        for idx, item in enumerate(self.scheduled_queue):
            if now >= item["execute_at"]:
                # Pop the scheduled event
                return self.scheduled_queue.pop(idx)["scenario_name"]
                
        # 3. Check random injection
        if self.random_enabled:
            # e.g., 5% chance per tick to inject a random scenario
            if random.random() < 0.05:
                return random.choice(list(AVAILABLE_SCENARIOS.keys()))
                
        return None

# Global singleton
manager = ScenarioManager()
engine = ScenarioEngine()
