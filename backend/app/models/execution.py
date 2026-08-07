"""
execution.py — SQLAlchemy model for persisting autonomous execution history.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class ExecutionHistory(Base):
    __tablename__ = "execution_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, default=datetime.utcnow
    )

    # What was executed
    strategy: Mapped[str] = mapped_column(String, nullable=False, index=True)
    execution_status: Mapped[str] = mapped_column(String, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, nullable=False)

    # Snapshots before / after (full JSONB blobs)
    snapshot_before = mapped_column(JSONB, nullable=False)
    snapshot_after = mapped_column(JSONB, nullable=False)

    # Outcome metrics
    improvement_score: Mapped[float] = mapped_column(Float, nullable=False)
    changed_metrics = mapped_column(JSONB, nullable=False)
