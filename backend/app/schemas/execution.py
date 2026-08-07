"""
Pydantic schemas for ExecutionHistory.
"""

from pydantic import BaseModel, ConfigDict
from typing import Dict, Any
import uuid
from datetime import datetime


class ExecutionHistoryBase(BaseModel):
    strategy: str
    execution_status: str
    execution_time_ms: float
    snapshot_before: Dict[str, Any]
    snapshot_after: Dict[str, Any]
    improvement_score: float
    changed_metrics: Dict[str, Any]


class ExecutionHistoryCreate(ExecutionHistoryBase):
    pass


class ExecutionHistoryResponse(ExecutionHistoryBase):
    id: uuid.UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
