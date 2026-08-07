from sqlalchemy.orm import Session
from typing import Dict, Any

import sys
import os

# Add root directory to path to allow importing pipeline if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from pipeline.helios_pipeline import HeliosPipeline
from app.crud.snapshot import create_snapshot
from app.schemas.snapshot import NetworkSnapshotCreate
from app.models.snapshot import NetworkSnapshot

pipeline = HeliosPipeline()

def process_and_store_snapshot(db: Session, telemetry_data: Dict[str, Any]) -> NetworkSnapshot:
    """
    Executes the HELIOS AI Pipeline on the given telemetry data and
    persists the output snapshot to the database.
    """
    pipeline_result = pipeline.run(telemetry_data)
    
    snapshot_create = NetworkSnapshotCreate(
        telemetry=pipeline_result.get("current_state", {}),
        prediction=pipeline_result.get("prediction", {}),
        strategies=pipeline_result.get("strategies", {}),
        simulation=pipeline_result.get("simulation", {})
    )
    
    db_snapshot = create_snapshot(db=db, snapshot=snapshot_create)
    return db_snapshot
