from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.models.snapshot import NetworkSnapshot
from app.schemas.snapshot import NetworkSnapshotCreate

def create_snapshot(db: Session, snapshot: NetworkSnapshotCreate) -> NetworkSnapshot:
    db_snapshot = NetworkSnapshot(
        telemetry=snapshot.telemetry,
        prediction=snapshot.prediction,
        strategies=snapshot.strategies,
        simulation=snapshot.simulation
    )
    db.add(db_snapshot)
    db.commit()
    db.refresh(db_snapshot)
    return db_snapshot

def get_latest_snapshot(db: Session) -> Optional[NetworkSnapshot]:
    return db.query(NetworkSnapshot).order_by(NetworkSnapshot.timestamp.desc()).first()

def get_snapshot_history(db: Session, limit: int = 100) -> List[NetworkSnapshot]:
    return db.query(NetworkSnapshot).order_by(NetworkSnapshot.timestamp.desc()).limit(limit).all()

def get_snapshot_by_id(db: Session, snapshot_id: uuid.UUID) -> Optional[NetworkSnapshot]:
    return db.query(NetworkSnapshot).filter(NetworkSnapshot.id == snapshot_id).first()
