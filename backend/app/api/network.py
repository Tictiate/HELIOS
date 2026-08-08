from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.crud import network_crud
from app.schemas.network import (
    TowerResponse, TowerUtilizationResponse, TrafficResponse, FailureResponse,
    EdgeServerResponse, EdgeTelemetryResponse, NetworkHealthResponse
)

router = APIRouter(tags=["network"])

@router.get("/towers", response_model=List[TowerResponse])
def get_towers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    return network_crud.get_towers(db, skip=skip, limit=limit)

@router.get("/towers/{tower_id}", response_model=TowerResponse)
def get_tower(tower_id: str, db: Session = Depends(get_db)):
    tower = network_crud.get_tower_by_id(db, tower_id=tower_id)
    if not tower:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tower not found")
    return tower

@router.get("/towers/{tower_id}/utilization", response_model=List[TowerUtilizationResponse])
def get_tower_utilization(
    tower_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    # Verify tower exists
    if not network_crud.get_tower_by_id(db, tower_id=tower_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tower not found")
    return network_crud.get_tower_utilization(db, tower_id=tower_id, skip=skip, limit=limit)

@router.get("/towers/{tower_id}/traffic", response_model=List[TrafficResponse])
def get_tower_traffic(
    tower_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    if not network_crud.get_tower_by_id(db, tower_id=tower_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tower not found")
    return network_crud.get_tower_traffic(db, tower_id=tower_id, skip=skip, limit=limit)

@router.get("/towers/{tower_id}/failures", response_model=List[FailureResponse])
def get_tower_failures(
    tower_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    if not network_crud.get_tower_by_id(db, tower_id=tower_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tower not found")
    return network_crud.get_tower_failures(db, tower_id=tower_id, skip=skip, limit=limit)

from app.schemas.network import NetworkSliceResponse
@router.get("/towers/{tower_id}/slices", response_model=List[NetworkSliceResponse])
def get_tower_slices(
    tower_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    if not network_crud.get_tower_by_id(db, tower_id=tower_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tower not found")
    return network_crud.get_network_slices(db, tower_id=tower_id, skip=skip, limit=limit)

@router.get("/edges", response_model=List[EdgeServerResponse])
def get_edges(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    return network_crud.get_edge_servers(db, skip=skip, limit=limit)

@router.get("/edges/{edge_id}", response_model=EdgeServerResponse)
def get_edge(edge_id: str, db: Session = Depends(get_db)):
    edge = network_crud.get_edge_server_by_id(db, edge_id=edge_id)
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge server not found")
    return edge

@router.get("/edges/{edge_id}/telemetry", response_model=List[EdgeTelemetryResponse])
def get_edge_telemetry(
    edge_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    if not network_crud.get_edge_server_by_id(db, edge_id=edge_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge server not found")
    return network_crud.get_edge_telemetry(db, edge_id=edge_id, skip=skip, limit=limit)

@router.get("/network-health", response_model=List[NetworkHealthResponse])
def get_network_health(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    return network_crud.get_network_health(db, skip=skip, limit=limit)

from app.crud import snapshot as crud_snapshot
from app.schemas.snapshot import NetworkSnapshotResponse
import uuid

@router.get("/latest", response_model=NetworkSnapshotResponse)
def get_latest_network_snapshot(db: Session = Depends(get_db)):
    snapshot = crud_snapshot.get_latest_snapshot(db)
    if not snapshot:
        raise HTTPException(status_code=404, detail="No network snapshots found.")
    return snapshot

@router.get("/history", response_model=List[NetworkSnapshotResponse])
def get_network_snapshot_history(limit: int = 100, db: Session = Depends(get_db)):
    snapshots = crud_snapshot.get_snapshot_history(db, limit=limit)
    return snapshots

@router.get("/snapshot/{snapshot_id}", response_model=NetworkSnapshotResponse)
def get_network_snapshot(snapshot_id: uuid.UUID, db: Session = Depends(get_db)):
    snapshot = crud_snapshot.get_snapshot_by_id(db, snapshot_id=snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found.")
    return snapshot

# ── Execution History ─────────────────────────────────────────────────────
from app.crud import execution as crud_execution
from app.schemas.execution import ExecutionHistoryResponse

@router.get("/executions/latest", response_model=ExecutionHistoryResponse)
def get_latest_execution(db: Session = Depends(get_db)):
    execution = crud_execution.get_latest_execution(db)
    if not execution:
        raise HTTPException(status_code=404, detail="No execution records found.")
    return execution

@router.get("/executions/history", response_model=List[ExecutionHistoryResponse])
def get_execution_history(limit: int = 100, db: Session = Depends(get_db)):
    return crud_execution.get_execution_history(db, limit=limit)

@router.get("/executions/{execution_id}", response_model=ExecutionHistoryResponse)
def get_execution(execution_id: uuid.UUID, db: Session = Depends(get_db)):
    execution = crud_execution.get_execution_by_id(db, execution_id=execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution record not found.")
    return execution

# ── Explainability ────────────────────────────────────────────────────────
from app.crud import explainability as crud_explainability
from app.schemas.explainability import ExplainabilityHistoryResponse

@router.get("/explain/latest", response_model=ExplainabilityHistoryResponse)
def get_latest_explainability(db: Session = Depends(get_db)):
    explainability = crud_explainability.get_latest_explainability(db)
    if not explainability:
        raise HTTPException(status_code=404, detail="No explanations found.")
    return explainability

@router.get("/explain/{snapshot_id}", response_model=ExplainabilityHistoryResponse)
def get_explainability(snapshot_id: uuid.UUID, db: Session = Depends(get_db)):
    explainability = crud_explainability.get_explainability_by_snapshot_id(db, snapshot_id=snapshot_id)
    if not explainability:
        raise HTTPException(status_code=404, detail="Explanation not found for the given snapshot.")
    return explainability
