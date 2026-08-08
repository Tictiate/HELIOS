from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime

class TowerBase(BaseModel):
    tower_id: str

class TowerCreate(TowerBase):
    pass

class TowerResponse(TowerBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


class EdgeServerBase(BaseModel):
    edge_id: str

class EdgeServerCreate(EdgeServerBase):
    pass

class EdgeServerResponse(EdgeServerBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


class TowerUtilizationBase(BaseModel):
    tower_id: str
    timestamp: datetime
    users: int
    available_bandwidth_mbps: float
    latency_ms: float
    packet_loss_pct: float
    power_usage_pct: float
    temperature_c: float
    utilization_score: float
    congested: bool

class TowerUtilizationCreate(TowerUtilizationBase):
    pass

class TowerUtilizationResponse(TowerUtilizationBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


class TrafficBase(BaseModel):
    tower_id: str
    timestamp: datetime
    video_users: int
    voice_users: int
    iot_devices: int
    gaming_users: int
    emergency_users: int
    total_users: int

class TrafficCreate(TrafficBase):
    pass

class TrafficResponse(TrafficBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


class FailureBase(BaseModel):
    tower_id: str
    temperature_c: float
    power_usage_pct: float
    traffic_load: float
    weather: str
    cpu_usage_pct: float
    failed: bool

class FailureCreate(FailureBase):
    pass

class FailureResponse(FailureBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


class EdgeTelemetryBase(BaseModel):
    edge_id: str
    timestamp: datetime
    cpu_pct: float
    gpu_pct: float
    memory_pct: float
    requests_per_min: int
    latency_ms: float
    edge_health: str

class EdgeTelemetryCreate(EdgeTelemetryBase):
    pass

class EdgeTelemetryResponse(EdgeTelemetryBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


class NetworkHealthBase(BaseModel):
    timestamp: Optional[datetime] = None
    latency_ms: float
    packet_loss_pct: float
    availability_pct: float
    energy_usage_pct: float
    resource_utilization_pct: float
    overall_health_index: float
    health_category: str

class NetworkHealthCreate(NetworkHealthBase):
    pass

class NetworkHealthResponse(NetworkHealthBase):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


class NetworkSliceBase(BaseModel):
    slice_id: str
    tower_id: str
    name: str
    slice_type: str
    priority: str
    allocated_bandwidth_mbps: float
    minimum_bandwidth_mbps: float
    maximum_bandwidth_mbps: float
    active_users: int
    current_demand_mbps: float
    current_latency_ms: float
    current_packet_loss_pct: float
    latency_target_ms: float
    packet_loss_target_pct: float
    status: str

class NetworkSliceCreate(NetworkSliceBase):
    pass

class NetworkSliceResponse(NetworkSliceBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
