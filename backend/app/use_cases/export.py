import io
import os
import zipfile
from sqlmodel import Session
from app.infrastructure.repositories_impl import FolderRepository, NoteRepository

class ExportUseCase:
    def __init__(self, session: Session):
        self.folder_repo = FolderRepository(session)
        self.note_repo = NoteRepository(session)

    @staticmethod
    def _sanitize(name: str) -> str:
        return "".join(c for c in name if c.isalnum() or c in " -_").strip()

    def export_markdown(self, user_id: str) -> io.BytesIO:
        folders = self.folder_repo.list_by_user(user_id)
        notes = self.note_repo.list_by_user(user_id)
        folder_map = {f.id: f for f in folders}

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for note in notes:
                path_parts = []
                current = folder_map.get(note.folder_id) if note.folder_id else None
                while current:
                    path_parts.insert(0, self._sanitize(current.name))
                    current = folder_map.get(current.parent_id) if current.parent_id else None

                filename = self._sanitize(note.title) + ".md"
                filepath = os.path.join(*path_parts, filename) if path_parts else filename
                content = f"# {note.title}\n\n{note.content}"
                zf.writestr(filepath, content)

        buf.seek(0)
        return buf
