from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.share import ShareUseCase
from app.schemas import ShareCreate, NoteRead
from app.domain.models import User

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/note", response_model=NoteRead)
def share_note(
    data: ShareCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return ShareUseCase(session).create_note(data, user.id)