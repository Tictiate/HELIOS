"""
Pydantic schemas for ScenarioHistory.
"""

from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List
import uuid
from datetime import datetime


class ScenarioHistoryBase(BaseModel):
    scenario_id: str
    scenario_name: str
    affected_towers: List[str]
    affected_edges: List[str]
    severity: str
    snapshot_before: Dict[str, Any]
    snapshot_after: Dict[str, Any]


class ScenarioHistoryCreate(ScenarioHistoryBase):
    pass


class ScenarioHistoryResponse(ScenarioHistoryBase):
    id: uuid.UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
    
class ScenarioInjectRequest(BaseModel):
    scenario_name: str
    
class ScenarioScheduleRequest(BaseModel):
    scenario_name: str
    execute_in_seconds: int
