import uuid
import io
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Challan, Vehicle, TrafficViolation, User, UserRole, PaymentStatus
from app.schemas.schemas import ChallanOut
from app.core.dependencies import get_current_user, require_police
from app.services.cloudinary_service import upload_image
from app.services.pdf_service import generate_challan_pdf

router = APIRouter(prefix="/api/challans", tags=["challans"])


def generate_challan_number() -> str:
    now = datetime.utcnow()
    return f"CHN{now.strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"


@router.post("", response_model=ChallanOut, status_code=201)
async def create_challan(
    vehicle_registration: str = Form(...),
    violation_id: str = Form(...),
    location: str = Form(...),
    violation_datetime: str = Form(...),
    remarks: Optional[str] = Form(None),
    evidence: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_police),
    db: Session = Depends(get_db),
):
    # Find or create vehicle
    vehicle = db.query(Vehicle).filter(
        Vehicle.registration_number == vehicle_registration.upper().strip()
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not registered in system")

    violation = db.query(TrafficViolation).filter(
        TrafficViolation.id == violation_id,
        TrafficViolation.is_active == True
    ).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")

    # Upload evidence
    evidence_url = None
    if evidence:
        if evidence.content_type not in ["image/jpeg", "image/jpg", "image/png"]:
            raise HTTPException(status_code=400, detail="Only JPG/JPEG/PNG files allowed")
        content = await evidence.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        evidence_url = upload_image(content, evidence.filename)

    vdt = datetime.fromisoformat(violation_datetime)

    challan = Challan(
        challan_number=generate_challan_number(),
        vehicle_id=vehicle.id,
        violation_id=violation_id,
        police_officer_id=current_user.id,
        fine_amount=violation.fine_amount,
        location=location,
        violation_datetime=vdt,
        evidence_url=evidence_url,
        remarks=remarks,
        payment_status=PaymentStatus.unpaid,
    )
    db.add(challan)
    db.commit()
    db.refresh(challan)
    return challan


@router.get("", response_model=list[ChallanOut])
def list_challans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[PaymentStatus] = None,
    violation_type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Challan).join(Challan.vehicle).join(Challan.violation).join(
        Challan.police_officer
    )

    if current_user.role == UserRole.police:
        q = q.filter(Challan.police_officer_id == current_user.id)
    elif current_user.role == UserRole.citizen:
        q = q.filter(Vehicle.user_id == current_user.id)

    if status:
        q = q.filter(Challan.payment_status == status)
    if violation_type:
        q = q.filter(TrafficViolation.id == violation_type)
    if search:
        q = q.filter(
            (Challan.challan_number.ilike(f"%{search}%")) |
            (Vehicle.registration_number.ilike(f"%{search}%"))
        )
    if start_date:
        q = q.filter(Challan.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        q = q.filter(Challan.created_at <= datetime.fromisoformat(end_date))

    q = q.order_by(Challan.created_at.desc())
    challans = q.offset((page - 1) * page_size).limit(page_size).all()
    return challans


@router.get("/my-challans", response_model=list[ChallanOut])
def my_challans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Challan).join(Challan.vehicle).filter(
        Vehicle.user_id == current_user.id
    ).order_by(Challan.created_at.desc())
    return q.offset((page - 1) * page_size).limit(page_size).all()


@router.get("/vehicle/{registration_number}", response_model=list[ChallanOut])
def challans_by_vehicle(
    registration_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.registration_number == registration_number.upper().strip()
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if current_user.role == UserRole.citizen and vehicle.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return db.query(Challan).filter(Challan.vehicle_id == vehicle.id).order_by(
        Challan.created_at.desc()
    ).all()


@router.get("/{challan_id}", response_model=ChallanOut)
def get_challan(
    challan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    challan = db.query(Challan).filter(Challan.id == challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Challan not found")
    if current_user.role == UserRole.citizen:
        if not challan.vehicle or challan.vehicle.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.police:
        if challan.police_officer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    return challan


@router.get("/{challan_id}/pdf")
def download_challan_pdf(
    challan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    challan = db.query(Challan).filter(Challan.id == challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Challan not found")
    if current_user.role == UserRole.citizen:
        if not challan.vehicle or challan.vehicle.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    pdf_buffer = generate_challan_pdf(challan)
    return StreamingResponse(
        io.BytesIO(pdf_buffer),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=challan_{challan.challan_number}.pdf"}
    )
