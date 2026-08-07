from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database.connection import get_db
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceStatusUpdate, DeviceResponse
from app.services.device_service import DeviceService
from app.models.device import DeviceStatus, DeviceType

router = APIRouter(prefix="/devices", tags=["devices"])

@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    return DeviceService.create_device(db, device)

@router.get("/", response_model=List[DeviceResponse])
def get_all_devices(
    status: Optional[DeviceStatus] = None,
    device_type: Optional[DeviceType] = None,
    location: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at", pattern="^(name|status|cpu_usage|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    return DeviceService.get_all_devices(
        db, 
        status_filter=status, 
        device_type_filter=device_type, 
        location_filter=location, 
        page=page, 
        limit=limit, 
        sort_by=sort_by, 
        sort_order=sort_order
    )

@router.get("/{id}", response_model=DeviceResponse)
def get_device(id: uuid.UUID, db: Session = Depends(get_db)):
    return DeviceService.get_device(db, id)

@router.put("/{id}", response_model=DeviceResponse)
def update_device(id: uuid.UUID, device_update: DeviceUpdate, db: Session = Depends(get_db)):
    return DeviceService.update_device(db, id, device_update)

@router.patch("/{id}/status", response_model=DeviceResponse)
def change_status(id: uuid.UUID, status_update: DeviceStatusUpdate, db: Session = Depends(get_db)):
    return DeviceService.change_status(db, id, status_update)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(id: uuid.UUID, db: Session = Depends(get_db)):
    DeviceService.delete_device(db, id)
