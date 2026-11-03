from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, RefreshToken
from app.schemas.schemas import UserRegister, UserLogin, Token, TokenRefresh, UserOut
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, hash_token
)
from app.core.config import settings
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        phone=data.phone,
        badge_number=data.badge_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.is_active == True).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.id})

    # Store refresh token hash
    token_hash = hash_token(refresh_token)
    expires_at = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.add(db_refresh)
    db.commit()

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh(data: TokenRefresh, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_hash = hash_token(data.refresh_token)
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked_at == None,
        RefreshToken.expires_at > datetime.utcnow(),
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Refresh token expired or revoked")

    user = db.query(User).filter(User.id == payload["sub"], User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Revoke old token (rotation)
    db_token.revoked_at = datetime.utcnow()

    # Issue new tokens
    new_access = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    new_refresh = create_refresh_token({"sub": user.id})
    new_hash = hash_token(new_refresh)
    expires_at = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    new_db_token = RefreshToken(user_id=user.id, token_hash=new_hash, expires_at=expires_at)
    db.add(new_db_token)
    db.commit()

    return Token(access_token=new_access, refresh_token=new_refresh)


@router.post("/logout")
def logout(data: TokenRefresh, db: Session = Depends(get_db)):
    token_hash = hash_token(data.refresh_token)
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked_at == None,
    ).first()
    if db_token:
        db_token.revoked_at = datetime.utcnow()
        db.commit()
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
