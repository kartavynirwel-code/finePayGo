from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
from app.models.models import UserRole, PaymentStatus, VehicleType


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.citizen
    phone: Optional[str] = None
    badge_number: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    badge_number: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    badge_number: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


# ─── Vehicle Schemas ───────────────────────────────────────────────────────────

class VehicleCreate(BaseModel):
    registration_number: str
    vehicle_type: VehicleType
    owner_name: str
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    year: Optional[int] = None

    @field_validator("registration_number")
    @classmethod
    def validate_reg(cls, v):
        return v.upper().strip()


class VehicleOut(BaseModel):
    id: str
    registration_number: str
    vehicle_type: VehicleType
    owner_name: str
    user_id: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    year: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Violation Schemas ─────────────────────────────────────────────────────────

class ViolationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    fine_amount: float


class ViolationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fine_amount: Optional[float] = None
    is_active: Optional[bool] = None


class ViolationOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    fine_amount: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Challan Schemas ───────────────────────────────────────────────────────────

class ChallanCreate(BaseModel):
    vehicle_registration: str
    violation_id: str
    location: str
    violation_datetime: datetime
    remarks: Optional[str] = None


class ChallanOut(BaseModel):
    id: str
    challan_number: str
    fine_amount: float
    location: str
    violation_datetime: datetime
    evidence_url: Optional[str] = None
    remarks: Optional[str] = None
    payment_status: PaymentStatus
    created_at: datetime
    vehicle: Optional[VehicleOut] = None
    violation: Optional[ViolationOut] = None
    police_officer: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ─── Payment Schemas ───────────────────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    challan_id: str


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    challan_id: str


class PaymentOut(BaseModel):
    id: str
    challan_id: str
    user_id: str
    amount: float
    payment_provider: str
    transaction_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    payment_status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ─────────────────────────────────────────────────────────

class AdminDashboard(BaseModel):
    total_challans: int
    paid_challans: int
    unpaid_challans: int
    pending_challans: int
    total_fine_amount: float
    total_collected: float
    total_citizens: int
    total_police: int
    recent_challans: List[ChallanOut]
    monthly_stats: List[dict]
    violation_stats: List[dict]


class PoliceDashboard(BaseModel):
    total_issued: int
    paid_count: int
    unpaid_count: int
    total_amount_issued: float
    recent_challans: List[ChallanOut]


class CitizenDashboard(BaseModel):
    total_vehicles: int
    total_challans: int
    unpaid_challans: int
    total_fines_paid: float
    total_fines_pending: float
    recent_challans: List[ChallanOut]


# ─── Pagination ────────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
