"""
scenario.py — SQLAlchemy model for persisting HELIOS injected scenarios.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class ScenarioHistory(Base):
    __tablename__ = "scenario_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    scenario_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    scenario_name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, default=datetime.utcnow
    )
    
    affected_towers = mapped_column(ARRAY(String), nullable=False)
    affected_edges = mapped_column(ARRAY(String), nullable=False)
    severity: Mapped[str] = mapped_column(String, nullable=False)
    
    snapshot_before = mapped_column(JSONB, nullable=False)
    snapshot_after = mapped_column(JSONB, nullable=False)
