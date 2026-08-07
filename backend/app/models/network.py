import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

class Tower(Base):
    __tablename__ = "towers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tower_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    utilizations = relationship("TowerUtilization", back_populates="tower")
    traffic = relationship("Traffic", back_populates="tower")
    failures = relationship("Failure", back_populates="tower")


class EdgeServer(Base):
    __tablename__ = "edge_servers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    edge_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    telemetry = relationship("EdgeTelemetry", back_populates="edge_server")


class TowerUtilization(Base):
    __tablename__ = "tower_utilization"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tower_id: Mapped[str] = mapped_column(String, ForeignKey("towers.tower_id"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    
    users: Mapped[int] = mapped_column(Integer, nullable=False)
    available_bandwidth_mbps: Mapped[float] = mapped_column(Float, nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False)
    packet_loss_pct: Mapped[float] = mapped_column(Float, nullable=False)
    power_usage_pct: Mapped[float] = mapped_column(Float, nullable=False)
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    utilization_score: Mapped[float] = mapped_column(Float, nullable=False)
    congested: Mapped[bool] = mapped_column(Boolean, nullable=False)

    tower = relationship("Tower", back_populates="utilizations")


class Traffic(Base):
    __tablename__ = "traffic"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tower_id: Mapped[str] = mapped_column(String, ForeignKey("towers.tower_id"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    
    video_users: Mapped[int] = mapped_column(Integer, nullable=False)
    voice_users: Mapped[int] = mapped_column(Integer, nullable=False)
    iot_devices: Mapped[int] = mapped_column(Integer, nullable=False)
    gaming_users: Mapped[int] = mapped_column(Integer, nullable=False)
    emergency_users: Mapped[int] = mapped_column(Integer, nullable=False)
    total_users: Mapped[int] = mapped_column(Integer, nullable=False)

    tower = relationship("Tower", back_populates="traffic")


class Failure(Base):
    __tablename__ = "failures"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tower_id: Mapped[str] = mapped_column(String, ForeignKey("towers.tower_id"), nullable=False, index=True)
    
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    power_usage_pct: Mapped[float] = mapped_column(Float, nullable=False)
    traffic_load: Mapped[float] = mapped_column(Float, nullable=False)
    weather: Mapped[str] = mapped_column(String, nullable=False)
    cpu_usage_pct: Mapped[float] = mapped_column(Float, nullable=False)
    failed: Mapped[bool] = mapped_column(Boolean, nullable=False)

    tower = relationship("Tower", back_populates="failures")


class EdgeTelemetry(Base):
    __tablename__ = "edge_telemetry"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    edge_id: Mapped[str] = mapped_column(String, ForeignKey("edge_servers.edge_id"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    
    cpu_pct: Mapped[float] = mapped_column(Float, nullable=False)
    gpu_pct: Mapped[float] = mapped_column(Float, nullable=False)
    memory_pct: Mapped[float] = mapped_column(Float, nullable=False)
    requests_per_min: Mapped[int] = mapped_column(Integer, nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False)
    edge_health: Mapped[str] = mapped_column(String, nullable=False)

    edge_server = relationship("EdgeServer", back_populates="telemetry")


class NetworkHealth(Base):
    __tablename__ = "network_health"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=True, index=True)
    
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False)
    packet_loss_pct: Mapped[float] = mapped_column(Float, nullable=False)
    availability_pct: Mapped[float] = mapped_column(Float, nullable=False)
    energy_usage_pct: Mapped[float] = mapped_column(Float, nullable=False)
    resource_utilization_pct: Mapped[float] = mapped_column(Float, nullable=False)
    overall_health_index: Mapped[float] = mapped_column(Float, nullable=False)
    health_category: Mapped[str] = mapped_column(String, nullable=False)
