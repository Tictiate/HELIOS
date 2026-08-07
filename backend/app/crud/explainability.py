"""
CRUD repository for ExplainabilityHistory.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.models.explainability import ExplainabilityHistory
from app.schemas.explainability import ExplainabilityHistoryCreate


def create_explainability(
    db: Session, explainability: ExplainabilityHistoryCreate,
) -> ExplainabilityHistory:
    db_record = ExplainabilityHistory(
        snapshot_id=explainability.snapshot_id,
        prediction_explanation=explainability.prediction_explanation,
        strategy_explanation=explainability.strategy_explanation,
        simulation_explanation=explainability.simulation_explanation,
        execution_explanation=explainability.execution_explanation,
        helios_insight=explainability.helios_insight,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


def get_latest_explainability(db: Session) -> Optional[ExplainabilityHistory]:
    return (
        db.query(ExplainabilityHistory)
        .order_by(ExplainabilityHistory.timestamp.desc())
        .first()
    )


def get_explainability_by_snapshot_id(
    db: Session, snapshot_id: uuid.UUID,
) -> Optional[ExplainabilityHistory]:
    return (
        db.query(ExplainabilityHistory)
        .filter(ExplainabilityHistory.snapshot_id == snapshot_id)
        .first()
    )
