from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.folders import FolderUseCase
from app.schemas import FolderCreate, FolderRead, FolderTree, FolderUpdate
from app.domain.models import User

router = APIRouter(prefix="/folders", tags=["folders"])

@router.post("", response_model=FolderRead)
def create(data: FolderCreate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return FolderUseCase(session).create(data, user.id)

@router.get("", response_model=List[FolderRead])
def list(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return FolderUseCase(session).list(user.id)

@router.get("/tree", response_model=List[FolderTree])
def tree(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return FolderUseCase(session).tree(user.id)

@router.get("/{folder_id}", response_model=FolderRead)
def get(folder_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return FolderUseCase(session).get(folder_id, user.id)

@router.patch("/{folder_id}", response_model=FolderRead)
def update(folder_id: str, data: FolderUpdate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return FolderUseCase(session).update(folder_id, data, user.id)

@router.delete("/{folder_id}")
def delete(folder_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    FolderUseCase(session).delete(folder_id, user.id)
    return {"ok": True}
