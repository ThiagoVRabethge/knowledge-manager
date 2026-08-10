import secrets
from datetime import timedelta
from fastapi import HTTPException, status
from sqlmodel import Session
from app.config import settings
from app.domain.models import User
from app.infrastructure.repositories_impl import UserRepository
from app.infrastructure.security import get_password_hash, verify_password, create_access_token
from app.infrastructure.github_auth import exchange_code_for_token, get_github_user_email
from app.schemas import UserCreate, Token

class AuthUseCase:
    def __init__(self, session: Session):
        self.repo = UserRepository(session)

    def register(self, data: UserCreate) -> User:
        existing = self.repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(
            email=data.email,
            hashed_password=get_password_hash(data.password)
        )
        return self.repo.create(user)

    def login(self, email: str, password: str) -> Token:
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = create_access_token(
            data={"sub": user.id},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        )
        return Token(access_token=token, token_type="bearer")

    def github_login(self, code: str) -> Token:
        try:
            access_token = exchange_code_for_token(code)
            gh_user = get_github_user_email(access_token)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"GitHub authentication failed: {str(e)}")

        email = gh_user.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not available from GitHub")

        user = self.repo.get_by_email(email)
        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash(secrets.token_urlsafe(32))
            )
            self.repo.create(user)

        token = create_access_token(
            data={"sub": user.id},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        )
        return Token(access_token=token, token_type="bearer")

    def me(self, user_id: str) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user