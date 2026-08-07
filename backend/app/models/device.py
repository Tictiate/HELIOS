import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Enum as SQLEnum, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base

class DeviceType(str, enum.Enum):
    router = "router"
    switch = "switch"
    server = "server"
    base_station = "base_station"

class DeviceStatus(str, enum.Enum):
    online = "online"
    offline = "offline"
    maintenance = "maintenance"

class Device(Base):
    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    ip_address: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    device_type: Mapped[DeviceType] = mapped_column(SQLEnum(DeviceType), nullable=False)
    status: Mapped[DeviceStatus] = mapped_column(SQLEnum(DeviceStatus), default=DeviceStatus.offline, nullable=False)
    
    cpu_usage: Mapped[float] = mapped_column(Float, default=0.0)
    memory_usage: Mapped[float] = mapped_column(Float, default=0.0)
    bandwidth_usage: Mapped[float] = mapped_column(Float, default=0.0)
    location: Mapped[str] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
