import enum
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey,
    Enum as SAEnum, Text, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    admin = "admin"
    police = "police"
    citizen = "citizen"


class PaymentStatus(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    pending = "pending"


class VehicleType(str, enum.Enum):
    two_wheeler = "two_wheeler"
    three_wheeler = "three_wheeler"
    four_wheeler = "four_wheeler"
    heavy_vehicle = "heavy_vehicle"
    other = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.citizen)
    phone = Column(String(20), nullable=True)
    badge_number = Column(String(50), nullable=True)  # For police officers
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicles = relationship("Vehicle", back_populates="owner")
    challans_issued = relationship("Challan", back_populates="police_officer", foreign_keys="Challan.police_officer_id")
    payments = relationship("Payment", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user")

    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_role", "role"),
    )


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    registration_number = Column(String(50), unique=True, nullable=False, index=True)
    vehicle_type = Column(SAEnum(VehicleType), nullable=False)
    owner_name = Column(String(255), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    make = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="vehicles")
    challans = relationship("Challan", back_populates="vehicle")

    __table_args__ = (
        Index("ix_vehicles_registration_number", "registration_number"),
        Index("ix_vehicles_user_id", "user_id"),
    )


class TrafficViolation(Base):
    __tablename__ = "traffic_violations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    fine_amount = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    challans = relationship("Challan", back_populates="violation")


class Challan(Base):
    __tablename__ = "challans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    challan_number = Column(String(50), unique=True, nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id"), nullable=False)
    violation_id = Column(String(36), ForeignKey("traffic_violations.id"), nullable=False)
    police_officer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    fine_amount = Column(Float, nullable=False)
    location = Column(String(500), nullable=False)
    violation_datetime = Column(DateTime, nullable=False)
    evidence_url = Column(String(1000), nullable=True)
    remarks = Column(Text, nullable=True)
    payment_status = Column(SAEnum(PaymentStatus), nullable=False, default=PaymentStatus.unpaid)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="challans")
    violation = relationship("TrafficViolation", back_populates="challans")
    police_officer = relationship("User", back_populates="challans_issued", foreign_keys=[police_officer_id])
    payment = relationship("Payment", back_populates="challan", uselist=False)

    __table_args__ = (
        Index("ix_challans_challan_number", "challan_number"),
        Index("ix_challans_vehicle_id", "vehicle_id"),
        Index("ix_challans_police_officer_id", "police_officer_id"),
        Index("ix_challans_payment_status", "payment_status"),
        Index("ix_challans_created_at", "created_at"),
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    challan_id = Column(String(36), ForeignKey("challans.id"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_provider = Column(String(50), default="razorpay")
    razorpay_order_id = Column(String(200), nullable=True)
    transaction_id = Column(String(200), nullable=True)
    payment_status = Column(String(50), default="created")
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    challan = relationship("Challan", back_populates="payment")
    user = relationship("User", back_populates="payments")

    __table_args__ = (
        Index("ix_payments_challan_id", "challan_id"),
        Index("ix_payments_user_id", "user_id"),
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")
