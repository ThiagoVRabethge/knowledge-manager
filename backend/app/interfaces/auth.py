from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.auth import AuthUseCase
from app.schemas import UserCreate, UserRead, Token
from app.domain.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead)
def register(data: UserCreate, session: Session = Depends(get_session)):
    uc = AuthUseCase(session)
    return uc.register(data)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    uc = AuthUseCase(session)
    return uc.login(form_data.username, form_data.password)

@router.post("/github", response_model=Token)
def github_login(data: dict, session: Session = Depends(get_session)):
    uc = AuthUseCase(session)
    return uc.github_login(data.get("code", ""))

@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return user