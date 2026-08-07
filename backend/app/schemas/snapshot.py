from pydantic import BaseModel, ConfigDict
from typing import Dict, Any
import uuid
from datetime import datetime

class NetworkSnapshotBase(BaseModel):
    telemetry: Dict[str, Any]
    prediction: Dict[str, Any]
    strategies: Dict[str, Any]
    simulation: Dict[str, Any]

class NetworkSnapshotCreate(NetworkSnapshotBase):
    pass

class NetworkSnapshotResponse(NetworkSnapshotBase):
    id: uuid.UUID
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
