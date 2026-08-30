from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.domain.models import User
from app.infrastructure.database import get_session
from app.infrastructure.github_auth import exchange_code_for_token
from app.infrastructure.security import get_current_user
from app.use_cases.github_sync import GithubSyncUseCase

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/github")
def sync_github(
    data: dict,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    access_token = data.get("access_token", "")
    code = data.get("code", "")

    if not access_token and not code:
        raise HTTPException(
            status_code=400, detail="GitHub access_token or code required"
        )

    try:
        if not access_token and code:
            access_token = exchange_code_for_token(code)

        # Salva o token no usuário para sincronizações futuras
        uc = GithubSyncUseCase(session)
        uc.set_github_token(user.id, access_token)

        return uc.sync_to_github(user.id, access_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/github/auto")
def sync_github_auto(
    session: Session = Depends(get_session), user: User = Depends(get_current_user)
):
    """Endpoint para sincronizar automaticamente usando token salvo."""
    try:
        uc = GithubSyncUseCase(session)
        return uc.sync_user_data(user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/github/status")
def github_status(
    access_token: str = "",
    code: str = "",
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if not access_token and not code:
        # Tenta usar token salvo
        uc = GithubSyncUseCase(session)
        user_data = uc.user_repo.get_by_id(user.id)
        if not user_data or not user_data.github_access_token:
            raise HTTPException(
                status_code=400, detail="GitHub access_token or code required"
            )
        access_token = user_data.github_access_token
    try:
        if not access_token and code:
            access_token = exchange_code_for_token(code)
        uc = GithubSyncUseCase(session)
        return uc.get_sync_status(user.id, access_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
