from sqlmodel import Session
from app.domain.models import Note
from app.infrastructure.repositories_impl import NoteRepository
from app.schemas import ShareCreate


class ShareUseCase:
    def __init__(self, session: Session):
        self.note_repo = NoteRepository(session)

    def create_note(self, data: ShareCreate, user_id: str) -> Note:
        content_parts = []
        if data.url:
            content_parts.append(data.url)
        if data.text:
            content_parts.append(data.text)
        content = "\n\n".join(content_parts)

        note = Note(
            title=data.title or (data.url or "Conteúdo compartilhado"),
            content=content,
            user_id=user_id,
        )
        return self.note_repo.create(note)