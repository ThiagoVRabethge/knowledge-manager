from datetime import datetime, timedelta
from jose import JWTError, jwt
import argon2
from fastapi import Depends, HTTPException, status, Request
from sqlmodel import Session
from app.config import settings
from app.infrastructure.database import engine
from app.domain.models import User

# Argon2 hasher
password_hasher = argon2.PasswordHasher()

def _prepare_password(password: str) -> str:
    # Limita o comprimento para evitar DoS (Argon2 lida bem, mas por segurança)
    return password[:1024]

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return password_hasher.verify(hashed, _prepare_password(plain))
    except argon2.exceptions.VerifyMismatchError:
        return False
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return password_hasher.hash(_prepare_password(password))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def get_current_user(request: Request) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.cookies.get(settings.cookie_name) if request.cookies else None

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    with Session(engine) as session:
        user = session.get(User, user_id)
        if user is None:
            raise credentials_exception
        return user