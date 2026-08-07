"""
CRUD repository for ScenarioHistory.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.models.scenario import ScenarioHistory
from app.schemas.scenario import ScenarioHistoryCreate


def create_scenario_history(
    db: Session, history: ScenarioHistoryCreate,
) -> ScenarioHistory:
    db_record = ScenarioHistory(
        scenario_id=history.scenario_id,
        scenario_name=history.scenario_name,
        affected_towers=history.affected_towers,
        affected_edges=history.affected_edges,
        severity=history.severity,
        snapshot_before=history.snapshot_before,
        snapshot_after=history.snapshot_after,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


def get_scenario_history(
    db: Session, limit: int = 100,
) -> List[ScenarioHistory]:
    return (
        db.query(ScenarioHistory)
        .order_by(ScenarioHistory.timestamp.desc())
        .limit(limit)
        .all()
    )
