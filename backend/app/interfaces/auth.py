from fastapi import APIRouter, Depends, Response
from sqlmodel import Session
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.auth import AuthUseCase
from app.schemas import UserRead, Token
from app.domain.models import User
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/github", response_model=Token)
def github_login(data: dict, response: Response, session: Session = Depends(get_session)):
    uc = AuthUseCase(session)
    token = uc.github_login(data.get("code", ""))
    
    # Define cookie com o token
    response.set_cookie(
        key=settings.cookie_name,
        value=token.access_token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
    )
    return token

@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=settings.cookie_name)
    return {"ok": True}