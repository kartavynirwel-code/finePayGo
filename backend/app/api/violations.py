from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import TrafficViolation
from app.schemas.schemas import ViolationCreate, ViolationUpdate, ViolationOut
from app.core.dependencies import get_current_user, require_admin
from app.models.models import User

router = APIRouter(prefix="/api/violations", tags=["violations"])


@router.get("", response_model=list[ViolationOut])
def list_violations(
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(TrafficViolation)
    if active_only:
        q = q.filter(TrafficViolation.is_active == True)
    return q.order_by(TrafficViolation.name).all()


@router.post("", response_model=ViolationOut, status_code=201)
def create_violation(
    data: ViolationCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    violation = TrafficViolation(**data.model_dump())
    db.add(violation)
    db.commit()
    db.refresh(violation)
    return violation


@router.put("/{violation_id}", response_model=ViolationOut)
def update_violation(
    violation_id: str,
    data: ViolationUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    violation = db.query(TrafficViolation).filter(TrafficViolation.id == violation_id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(violation, field, value)
    db.commit()
    db.refresh(violation)
    return violation


@router.delete("/{violation_id}")
def delete_violation(
    violation_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    violation = db.query(TrafficViolation).filter(TrafficViolation.id == violation_id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    violation.is_active = False
    db.commit()
    return {"message": "Violation deactivated"}
