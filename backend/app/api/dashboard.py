from datetime import datetime
from sqlalchemy import func, extract
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import (
    Challan, Vehicle, User, Payment, TrafficViolation,
    PaymentStatus, UserRole
)
from app.schemas.schemas import AdminDashboard, PoliceDashboard, CitizenDashboard
from app.core.dependencies import get_current_user, require_admin, require_police

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/admin", response_model=AdminDashboard)
def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_challans = db.query(func.count(Challan.id)).scalar()
    paid = db.query(func.count(Challan.id)).filter(Challan.payment_status == PaymentStatus.paid).scalar()
    unpaid = db.query(func.count(Challan.id)).filter(Challan.payment_status == PaymentStatus.unpaid).scalar()
    pending = db.query(func.count(Challan.id)).filter(Challan.payment_status == PaymentStatus.pending).scalar()

    total_fine = db.query(func.sum(Challan.fine_amount)).scalar() or 0
    total_collected = db.query(func.sum(Payment.amount)).filter(Payment.payment_status == "paid").scalar() or 0
    total_citizens = db.query(func.count(User.id)).filter(User.role == UserRole.citizen).scalar()
    total_police = db.query(func.count(User.id)).filter(User.role == UserRole.police).scalar()

    recent_challans = db.query(Challan).order_by(Challan.created_at.desc()).limit(10).all()

    # Monthly stats (last 12 months)
    monthly_stats = db.query(
        extract("year", Challan.created_at).label("year"),
        extract("month", Challan.created_at).label("month"),
        func.count(Challan.id).label("count"),
        func.sum(Challan.fine_amount).label("amount"),
    ).group_by("year", "month").order_by("year", "month").limit(12).all()

    monthly_data = [
        {
            "year": int(r.year),
            "month": int(r.month),
            "count": r.count,
            "amount": float(r.amount or 0),
        }
        for r in monthly_stats
    ]

    # Violation stats
    violation_stats = db.query(
        TrafficViolation.name,
        func.count(Challan.id).label("count"),
    ).join(Challan, Challan.violation_id == TrafficViolation.id).group_by(
        TrafficViolation.name
    ).all()

    viol_data = [{"name": r.name, "count": r.count} for r in violation_stats]

    return AdminDashboard(
        total_challans=total_challans,
        paid_challans=paid,
        unpaid_challans=unpaid,
        pending_challans=pending,
        total_fine_amount=float(total_fine),
        total_collected=float(total_collected),
        total_citizens=total_citizens,
        total_police=total_police,
        recent_challans=recent_challans,
        monthly_stats=monthly_data,
        violation_stats=viol_data,
    )


@router.get("/police", response_model=PoliceDashboard)
def police_dashboard(
    current_user: User = Depends(require_police),
    db: Session = Depends(get_db),
):
    q = db.query(Challan).filter(Challan.police_officer_id == current_user.id)
    total_issued = q.count()
    paid_count = q.filter(Challan.payment_status == PaymentStatus.paid).count()
    unpaid_count = q.filter(Challan.payment_status == PaymentStatus.unpaid).count()
    total_amount = db.query(func.sum(Challan.fine_amount)).filter(
        Challan.police_officer_id == current_user.id
    ).scalar() or 0

    recent = db.query(Challan).filter(
        Challan.police_officer_id == current_user.id
    ).order_by(Challan.created_at.desc()).limit(10).all()

    return PoliceDashboard(
        total_issued=total_issued,
        paid_count=paid_count,
        unpaid_count=unpaid_count,
        total_amount_issued=float(total_amount),
        recent_challans=recent,
    )


@router.get("/citizen", response_model=CitizenDashboard)
def citizen_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vehicles = db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()
    vehicle_ids = [v.id for v in vehicles]

    total_challans = db.query(func.count(Challan.id)).filter(
        Challan.vehicle_id.in_(vehicle_ids)
    ).scalar() if vehicle_ids else 0

    unpaid_challans = db.query(func.count(Challan.id)).filter(
        Challan.vehicle_id.in_(vehicle_ids),
        Challan.payment_status == PaymentStatus.unpaid,
    ).scalar() if vehicle_ids else 0

    paid_amount = db.query(func.sum(Payment.amount)).filter(
        Payment.user_id == current_user.id,
        Payment.payment_status == "paid",
    ).scalar() or 0

    pending_amount = db.query(func.sum(Challan.fine_amount)).filter(
        Challan.vehicle_id.in_(vehicle_ids),
        Challan.payment_status == PaymentStatus.unpaid,
    ).scalar() or 0 if vehicle_ids else 0

    recent = db.query(Challan).filter(
        Challan.vehicle_id.in_(vehicle_ids)
    ).order_by(Challan.created_at.desc()).limit(5).all() if vehicle_ids else []

    return CitizenDashboard(
        total_vehicles=len(vehicles),
        total_challans=total_challans,
        unpaid_challans=unpaid_challans,
        total_fines_paid=float(paid_amount),
        total_fines_pending=float(pending_amount),
        recent_challans=recent,
    )
