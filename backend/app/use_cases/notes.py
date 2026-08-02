from datetime import datetime
from typing import List
from fastapi import HTTPException
from sqlmodel import Session
from app.domain.models import Note
from app.domain.services import WikiLinkService
from app.infrastructure.repositories_impl import NoteRepository
from app.schemas import NoteCreate, NoteUpdate, NoteLink

class NoteUseCase:
    def __init__(self, session: Session):
        self.repo = NoteRepository(session)
        self.wiki_service = WikiLinkService()

    def create(self, data: NoteCreate, user_id: str) -> Note:
        note = Note(**data.model_dump(), user_id=user_id)
        return self.repo.create(note)

    def list(self, user_id: str, folder_id: str = None) -> List[Note]:
        notes = self.repo.list_by_user(user_id)
        if folder_id:
            notes = [n for n in notes if n.folder_id == folder_id]
        return notes

    def search(self, user_id: str, q: str) -> List[Note]:
        notes = self.repo.list_by_user(user_id)
        q_lower = q.lower()
        return [n for n in notes if q_lower in n.title.lower() or q_lower in n.content.lower()]

    def get(self, note_id: str, user_id: str) -> Note:
        note = self.repo.get_by_id(note_id)
        if not note or note.user_id != user_id:
            raise HTTPException(status_code=404, detail="Note not found")
        return note

    def update(self, note_id: str, data: NoteUpdate, user_id: str) -> Note:
        note = self.get(note_id, user_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(note, key, value)
        note.updated_at = datetime.utcnow()
        return self.repo.update(note)

    def delete(self, note_id: str, user_id: str) -> None:
        note = self.get(note_id, user_id)
        self.repo.delete(note.id)

    def get_links(self, note_id: str, user_id: str) -> List[NoteLink]:
        note = self.get(note_id, user_id)
        all_notes = self.repo.list_by_user(user_id)
        linked = self.wiki_service.find_linked_notes(note.content, all_notes)
        return [NoteLink(id=n.id, title=n.title) for n in linked]

    def get_backlinks(self, note_id: str, user_id: str) -> List[NoteLink]:
        note = self.get(note_id, user_id)
        all_notes = self.repo.list_by_user(user_id)
        backlinks = self.wiki_service.find_backlinks(note, all_notes)
        return [NoteLink(id=n.id, title=n.title) for n in backlinks]
