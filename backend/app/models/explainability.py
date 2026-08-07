"""
explainability.py — SQLAlchemy model for persisting HELIOS AI explanations.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class ExplainabilityHistory(Base):
    __tablename__ = "explainability_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, default=datetime.utcnow
    )
    
    snapshot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )

    prediction_explanation = mapped_column(JSONB, nullable=False)
    strategy_explanation = mapped_column(JSONB, nullable=False)
    simulation_explanation = mapped_column(JSONB, nullable=False)
    execution_explanation = mapped_column(JSONB, nullable=False)
    
    helios_insight: Mapped[str] = mapped_column(String, nullable=False)
