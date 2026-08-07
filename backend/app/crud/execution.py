"""
CRUD repository for ExecutionHistory.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.models.execution import ExecutionHistory
from app.schemas.execution import ExecutionHistoryCreate


def create_execution(
    db: Session, execution: ExecutionHistoryCreate,
) -> ExecutionHistory:
    db_record = ExecutionHistory(
        strategy=execution.strategy,
        execution_status=execution.execution_status,
        execution_time_ms=execution.execution_time_ms,
        snapshot_before=execution.snapshot_before,
        snapshot_after=execution.snapshot_after,
        improvement_score=execution.improvement_score,
        changed_metrics=execution.changed_metrics,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


def get_latest_execution(db: Session) -> Optional[ExecutionHistory]:
    return (
        db.query(ExecutionHistory)
        .order_by(ExecutionHistory.timestamp.desc())
        .first()
    )


def get_execution_history(
    db: Session, limit: int = 100,
) -> List[ExecutionHistory]:
    return (
        db.query(ExecutionHistory)
        .order_by(ExecutionHistory.timestamp.desc())
        .limit(limit)
        .all()
    )


def get_execution_by_id(
    db: Session, execution_id: uuid.UUID,
) -> Optional[ExecutionHistory]:
    return (
        db.query(ExecutionHistory)
        .filter(ExecutionHistory.id == execution_id)
        .first()
    )
