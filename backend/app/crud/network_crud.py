from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.models.network import (
    Tower, EdgeServer, TowerUtilization, Traffic, Failure, EdgeTelemetry, NetworkHealth
)

def get_towers(db: Session, skip: int = 0, limit: int = 100) -> List[Tower]:
    return db.query(Tower).offset(skip).limit(limit).all()

def get_tower_by_id(db: Session, tower_id: str) -> Optional[Tower]:
    return db.query(Tower).filter(Tower.tower_id == tower_id).first()

def get_tower_utilization(db: Session, tower_id: str, skip: int = 0, limit: int = 100) -> List[TowerUtilization]:
    return db.query(TowerUtilization).filter(TowerUtilization.tower_id == tower_id)\
             .order_by(TowerUtilization.timestamp.desc()).offset(skip).limit(limit).all()

def get_tower_traffic(db: Session, tower_id: str, skip: int = 0, limit: int = 100) -> List[Traffic]:
    return db.query(Traffic).filter(Traffic.tower_id == tower_id)\
             .order_by(Traffic.timestamp.desc()).offset(skip).limit(limit).all()

def get_tower_failures(db: Session, tower_id: str, skip: int = 0, limit: int = 100) -> List[Failure]:
    return db.query(Failure).filter(Failure.tower_id == tower_id)\
             .offset(skip).limit(limit).all()

def get_edge_servers(db: Session, skip: int = 0, limit: int = 100) -> List[EdgeServer]:
    return db.query(EdgeServer).offset(skip).limit(limit).all()

def get_edge_server_by_id(db: Session, edge_id: str) -> Optional[EdgeServer]:
    return db.query(EdgeServer).filter(EdgeServer.edge_id == edge_id).first()

def get_edge_telemetry(db: Session, edge_id: str, skip: int = 0, limit: int = 100) -> List[EdgeTelemetry]:
    return db.query(EdgeTelemetry).filter(EdgeTelemetry.edge_id == edge_id)\
             .order_by(EdgeTelemetry.timestamp.desc()).offset(skip).limit(limit).all()

def get_network_health(db: Session, skip: int = 0, limit: int = 100) -> List[NetworkHealth]:
    return db.query(NetworkHealth).order_by(NetworkHealth.timestamp.desc()).offset(skip).limit(limit).all()
