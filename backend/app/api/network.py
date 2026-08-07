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
