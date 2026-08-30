import secrets
from datetime import timedelta

from fastapi import HTTPException, status
from sqlmodel import Session

from app.config import settings
from app.domain.models import User
from app.infrastructure.github_auth import (
    exchange_code_for_token,
    get_github_user_email,
)
from app.infrastructure.repositories_impl import UserRepository
from app.infrastructure.security import create_access_token, get_password_hash
from app.schemas import Token


class AuthUseCase:
    def __init__(self, session: Session):
        self.repo = UserRepository(session)

    def github_login(self, code: str) -> Token:
        try:
            access_token = exchange_code_for_token(code)
            gh_user = get_github_user_email(access_token)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"GitHub authentication failed: {str(e)}"
            )

        email = gh_user.get("email")
        if not email:
            raise HTTPException(
                status_code=400, detail="Email not available from GitHub"
            )

        user = self.repo.get_by_email(email)
        if not user:
            # Gera um hash aleatório (não usado para login, mas para completude)
            hashed_password = get_password_hash(secrets.token_urlsafe(32))
            user = User(
                email=email,
                hashed_password=hashed_password,
                github_access_token=access_token,  # salva token
            )
            self.repo.create(user)
        else:
            # Atualiza token do GitHub
            user.github_access_token = access_token
            self.repo.update(user)

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
