from pydantic import BaseModel, ConfigDict, Field, IPvAnyAddress
from typing import Optional
import uuid
from datetime import datetime
from app.models.device import DeviceType, DeviceStatus

class DeviceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    ip_address: str
    device_type: DeviceType
    location: Optional[str] = None

class DeviceCreate(DeviceBase):
    status: Optional[DeviceStatus] = DeviceStatus.offline

class DeviceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    ip_address: Optional[str] = None
    device_type: Optional[DeviceType] = None
    location: Optional[str] = None

class DeviceStatusUpdate(BaseModel):
    status: DeviceStatus

class DeviceResponse(DeviceBase):
    id: uuid.UUID
    status: DeviceStatus
    cpu_usage: float
    memory_usage: float
    bandwidth_usage: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
