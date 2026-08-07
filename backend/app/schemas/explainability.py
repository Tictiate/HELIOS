"""
Pydantic schemas for ExplainabilityHistory.
"""

from pydantic import BaseModel, ConfigDict
from typing import Dict, Any
import uuid
from datetime import datetime


class ExplainabilityHistoryBase(BaseModel):
    snapshot_id: uuid.UUID
    prediction_explanation: Dict[str, Any]
    strategy_explanation: Dict[str, Any]
    simulation_explanation: Dict[str, Any]
    execution_explanation: Dict[str, Any]
    helios_insight: str


class ExplainabilityHistoryCreate(ExplainabilityHistoryBase):
    pass


class ExplainabilityHistoryResponse(ExplainabilityHistoryBase):
    id: uuid.UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
