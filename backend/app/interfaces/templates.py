from typing import List  # noqa: UP035

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.domain.models import User
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.schemas import NoteTemplateCreate, NoteTemplateRead, NoteTemplateUpdate
from app.use_cases.note_templates import NoteTemplateUseCase

router = APIRouter(prefix="/templates", tags=["templates"])


@router.post("", response_model=NoteTemplateRead)
def create_template(
    data: NoteTemplateCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    return NoteTemplateUseCase(session).create(data, user.id)


@router.get("", response_model=List[NoteTemplateRead])  # noqa: UP006
def list_templates(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    return NoteTemplateUseCase(session).list(user.id)


@router.get("/{template_id}", response_model=NoteTemplateRead)
def get_template(
    template_id: str,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    return NoteTemplateUseCase(session).get(template_id, user.id)


@router.patch("/{template_id}", response_model=NoteTemplateRead)
def update_template(
    template_id: str,
    data: NoteTemplateUpdate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    return NoteTemplateUseCase(session).update(template_id, data, user.id)


@router.delete("/{template_id}")
def delete_template(
    template_id: str,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    NoteTemplateUseCase(session).delete(template_id, user.id)

    return {"ok": True}
