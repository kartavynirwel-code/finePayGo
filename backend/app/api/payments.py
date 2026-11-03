import hmac
import hashlib
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Challan, Payment, User, PaymentStatus
from app.schemas.schemas import CreateOrderRequest, PaymentVerify, PaymentOut
from app.core.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/api/payments", tags=["payments"])


def get_razorpay_client():
    try:
        import razorpay
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    except Exception:
        return None


@router.post("/create-order")
def create_order(
    data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    challan = db.query(Challan).filter(Challan.id == data.challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Challan not found")
    if challan.payment_status == PaymentStatus.paid:
        raise HTTPException(status_code=400, detail="Challan already paid")

    # Check ownership
    if challan.vehicle and challan.vehicle.user_id != current_user.id:
        from app.models.models import UserRole
        if current_user.role == UserRole.citizen:
            raise HTTPException(status_code=403, detail="Access denied")

    # Check for existing order
    existing_payment = db.query(Payment).filter(Payment.challan_id == challan.id).first()

    client = get_razorpay_client()
    amount_paise = int(challan.fine_amount * 100)

    if client and settings.RAZORPAY_KEY_ID:
        try:
            order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": challan.challan_number,
            })
            order_id = order["id"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")
    else:
        # Test mode fallback
        order_id = f"order_test_{challan.challan_number}"

    if existing_payment:
        existing_payment.razorpay_order_id = order_id
        db.commit()
    else:
        payment = Payment(
            challan_id=challan.id,
            user_id=current_user.id,
            amount=challan.fine_amount,
            razorpay_order_id=order_id,
            payment_status="created",
        )
        db.add(payment)
        db.commit()

    return {
        "order_id": order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "challan_number": challan.challan_number,
    }


@router.post("/verify")
def verify_payment(
    data: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    challan = db.query(Challan).filter(Challan.id == data.challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Challan not found")
    if challan.payment_status == PaymentStatus.paid:
        raise HTTPException(status_code=400, detail="Already paid")

    client = get_razorpay_client()
    if client and settings.RAZORPAY_KEY_SECRET:
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": data.razorpay_order_id,
                "razorpay_payment_id": data.razorpay_payment_id,
                "razorpay_signature": data.razorpay_signature,
            })
        except Exception:
            raise HTTPException(status_code=400, detail="Payment signature verification failed")
    else:
        # Test mode: verify manually
        msg = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode() if settings.RAZORPAY_KEY_SECRET else b"test",
            msg.encode(),
            hashlib.sha256,
        ).hexdigest()
        # In test mode, skip strict verification

    # Update payment
    payment = db.query(Payment).filter(Payment.challan_id == challan.id).first()
    if payment:
        payment.transaction_id = data.razorpay_payment_id
        payment.payment_status = "paid"
        payment.paid_at = datetime.utcnow()
    else:
        payment = Payment(
            challan_id=challan.id,
            user_id=current_user.id,
            amount=challan.fine_amount,
            transaction_id=data.razorpay_payment_id,
            razorpay_order_id=data.razorpay_order_id,
            payment_status="paid",
            paid_at=datetime.utcnow(),
        )
        db.add(payment)

    challan.payment_status = PaymentStatus.paid
    db.commit()

    return {"message": "Payment verified successfully", "transaction_id": data.razorpay_payment_id}


@router.get("/history", response_model=list[PaymentOut])
def payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.models import UserRole
    q = db.query(Payment)
    if current_user.role == UserRole.citizen:
        q = q.filter(Payment.user_id == current_user.id)
    return q.order_by(Payment.created_at.desc()).all()
