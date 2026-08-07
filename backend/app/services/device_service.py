from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Optional
import uuid

from app.models.device import Device, DeviceStatus, DeviceType
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceStatusUpdate

class DeviceService:
    @staticmethod
    def _check_duplicate(db: Session, name: Optional[str] = None, ip_address: Optional[str] = None, exclude_id: Optional[uuid.UUID] = None):
        if name:
            query = db.query(Device).filter(Device.name == name)
            if exclude_id:
                query = query.filter(Device.id != exclude_id)
            if query.first():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Device with this name already exists")
        
        if ip_address:
            query = db.query(Device).filter(Device.ip_address == ip_address)
            if exclude_id:
                query = query.filter(Device.id != exclude_id)
            if query.first():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Device with this IP address already exists")

    @staticmethod
    def create_device(db: Session, device: DeviceCreate) -> Device:
        DeviceService._check_duplicate(db, name=device.name, ip_address=device.ip_address)
        
        db_device = Device(
            name=device.name,
            ip_address=device.ip_address,
            device_type=device.device_type,
            location=device.location,
            status=device.status if device.status else DeviceStatus.offline
        )
        db.add(db_device)
        db.commit()
        db.refresh(db_device)
        return db_device

    @staticmethod
    def get_device(db: Session, device_id: uuid.UUID) -> Device:
        device = db.query(Device).filter(Device.id == device_id).first()
        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
        return device

    @staticmethod
    def get_all_devices(
        db: Session, 
        status_filter: Optional[DeviceStatus] = None, 
        device_type_filter: Optional[DeviceType] = None,
        location_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 10,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[Device]:
        query = db.query(Device)

        if status_filter:
            query = query.filter(Device.status == status_filter)
        if device_type_filter:
            query = query.filter(Device.device_type == device_type_filter)
        if location_filter:
            query = query.filter(Device.location.ilike(f"%{location_filter}%"))
        
        # Sorting
        sort_column = getattr(Device, sort_by, Device.created_at)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Pagination
        skip = (page - 1) * limit
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_device(db: Session, device_id: uuid.UUID, device_update: DeviceUpdate) -> Device:
        db_device = DeviceService.get_device(db, device_id)

        DeviceService._check_duplicate(
            db, 
            name=device_update.name if device_update.name != db_device.name else None, 
            ip_address=device_update.ip_address if device_update.ip_address != db_device.ip_address else None, 
            exclude_id=device_id
        )

        update_data = device_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_device, key, value)

        db.commit()
        db.refresh(db_device)
        return db_device

    @staticmethod
    def delete_device(db: Session, device_id: uuid.UUID) -> None:
        db_device = DeviceService.get_device(db, device_id)
        db.delete(db_device)
        db.commit()

    @staticmethod
    def change_status(db: Session, device_id: uuid.UUID, status_update: DeviceStatusUpdate) -> Device:
        db_device = DeviceService.get_device(db, device_id)
        db_device.status = status_update.status
        db.commit()
        db.refresh(db_device)
        return db_device
