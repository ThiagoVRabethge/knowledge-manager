from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.github_sync import GithubSyncUseCase
from app.infrastructure.github_auth import exchange_code_for_token
from app.domain.models import User

router = APIRouter(prefix="/sync", tags=["sync"])

@router.post("/github")
def sync_github(data: dict, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    access_token = data.get("access_token", "")
    code = data.get("code", "")

    if not access_token and not code:
        raise HTTPException(status_code=400, detail="GitHub access_token or code required")

    try:
        if not access_token and code:
            access_token = exchange_code_for_token(code)
        uc = GithubSyncUseCase(session, access_token)
        return uc.sync(user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/github/status")
def github_status(access_token: str = "", code: str = "", session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if not access_token and not code:
        raise HTTPException(status_code=400, detail="GitHub access_token or code required")
    try:
        if not access_token and code:
            access_token = exchange_code_for_token(code)
        uc = GithubSyncUseCase(session, access_token)
        return uc.get_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))