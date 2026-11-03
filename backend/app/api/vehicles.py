from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Vehicle, User, UserRole
from app.schemas.schemas import VehicleCreate, VehicleOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(
    data: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Vehicle).filter(
        Vehicle.registration_number == data.registration_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle already registered")

    vehicle = Vehicle(
        **data.model_dump(),
        user_id=current_user.id if current_user.role == UserRole.citizen else None,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("", response_model=list[VehicleOut])
def list_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Vehicle)
    if current_user.role == UserRole.citizen:
        q = q.filter(Vehicle.user_id == current_user.id)
    q = q.order_by(Vehicle.created_at.desc())
    vehicles = q.offset((page - 1) * page_size).limit(page_size).all()
    return vehicles


@router.get("/search/{registration_number}", response_model=VehicleOut)
def search_vehicle(
    registration_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.registration_number == registration_number.upper().strip()
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if current_user.role == UserRole.citizen and vehicle.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: str,
    data: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if current_user.role == UserRole.citizen and vehicle.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle
