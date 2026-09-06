from datetime import datetime
from typing import List  # noqa: UP035

from fastapi import HTTPException
from sqlmodel import Session

from app.domain.models import NoteTemplate
from app.infrastructure.repositories_impl import NoteTemplateRepository
from app.schemas import NoteTemplateCreate, NoteTemplateUpdate


class NoteTemplateUseCase:
    def __init__(self, session: Session):
        self.repo = NoteTemplateRepository(session)

    def create(self, data: NoteTemplateCreate, user_id: str) -> NoteTemplate:
        template = NoteTemplate(**data.model_dump(), user_id=user_id)

        return self.repo.create(template)

    def list(self, user_id: str) -> List[NoteTemplate]:  # noqa: UP006
        return self.repo.list_by_user(user_id)

    def get(self, template_id: str, user_id: str) -> NoteTemplate:
        template = self.repo.get_by_id(template_id)

        if not template or template.user_id != user_id:
            raise HTTPException(status_code=404, detail="Template not found")

        return template

    def update(
        self, template_id: str, data: NoteTemplateUpdate, user_id: str
    ) -> NoteTemplate:
        template = self.get(template_id, user_id)

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(template, key, value)

        template.updated_at = datetime.utcnow()  # noqa: DTZ003

        return self.repo.update(template)

    def delete(self, template_id: str, user_id: str) -> None:
        template = self.get(template_id, user_id)

        self.repo.delete(template.id)
