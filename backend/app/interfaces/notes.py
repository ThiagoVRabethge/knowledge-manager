from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.notes import NoteUseCase
from app.schemas import NoteCreate, NoteRead, NoteUpdate, NoteLink
from app.domain.models import User

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("", response_model=NoteRead)
def create(data: NoteCreate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return NoteUseCase(session).create(data, user.id)

@router.get("", response_model=List[NoteRead])
def list(folder_id: str = None, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return NoteUseCase(session).list(user.id, folder_id)

@router.get("/search", response_model=List[NoteRead])
def search(q: str = "", session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return NoteUseCase(session).search(user.id, q)

@router.get("/{note_id}", response_model=NoteRead)
def get(note_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return NoteUseCase(session).get(note_id, user.id)

@router.patch("/{note_id}", response_model=NoteRead)
def update(note_id: str, data: NoteUpdate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return NoteUseCase(session).update(note_id, data, user.id)

@router.delete("/{note_id}")
def delete(note_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    NoteUseCase(session).delete(note_id, user.id)
    return {"ok": True}

@router.get("/{note_id}/links", response_model=List[NoteLink])
def links(note_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return NoteUseCase(session).get_links(note_id, user.id)

@router.get("/{note_id}/backlinks", response_model=List[NoteLink])
def backlinks(note_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return NoteUseCase(session).get_backlinks(note_id, user.id)
