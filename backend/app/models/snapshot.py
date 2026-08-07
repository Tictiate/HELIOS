import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base

class NetworkSnapshot(Base):
    __tablename__ = "network_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True, default=datetime.utcnow)
    
    # Store raw telemetry details
    telemetry = mapped_column(JSONB, nullable=False)
    
    # Pipeline execution outputs
    prediction = mapped_column(JSONB, nullable=False)
    strategies = mapped_column(JSONB, nullable=False)
    simulation = mapped_column(JSONB, nullable=False)
