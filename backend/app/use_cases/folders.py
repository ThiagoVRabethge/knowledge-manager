from datetime import datetime
from typing import List
from fastapi import HTTPException
from sqlmodel import Session
from app.domain.models import Folder, Note
from app.infrastructure.repositories_impl import FolderRepository, NoteRepository
from app.schemas import FolderCreate, FolderUpdate, FolderTree, NoteRead

class FolderUseCase:
    def __init__(self, session: Session):
        self.folder_repo = FolderRepository(session)
        self.note_repo = NoteRepository(session)

    def create(self, data: FolderCreate, user_id: str) -> Folder:
        folder = Folder(**data.model_dump(), user_id=user_id)
        return self.folder_repo.create(folder)

    def list(self, user_id: str) -> List[Folder]:
        return self.folder_repo.list_by_user(user_id)

    def tree(self, user_id: str) -> List[FolderTree]:
        folders = self.folder_repo.list_by_user(user_id)
        folder_map = {f.id: FolderTree(
            id=f.id, name=f.name, parent_id=f.parent_id,
            user_id=f.user_id, created_at=f.created_at, updated_at=f.updated_at,
            children=[], notes=[]
        ) for f in folders}

        roots = []
        for f in folders:
            node = folder_map[f.id]
            if f.parent_id and f.parent_id in folder_map:
                folder_map[f.parent_id].children.append(node)
            else:
                roots.append(node)

        notes = self.note_repo.list_by_user(user_id)
        for n in notes:
            if n.folder_id and n.folder_id in folder_map:
                folder_map[n.folder_id].notes.append(NoteRead(
                    id=n.id, title=n.title, content=n.content,
                    folder_id=n.folder_id, user_id=n.user_id,
                    created_at=n.created_at, updated_at=n.updated_at
                ))
        return roots

    def get(self, folder_id: str, user_id: str) -> Folder:
        folder = self.folder_repo.get_by_id(folder_id)
        if not folder or folder.user_id != user_id:
            raise HTTPException(status_code=404, detail="Folder not found")
        return folder

    def update(self, folder_id: str, data: FolderUpdate, user_id: str) -> Folder:
        folder = self.get(folder_id, user_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(folder, key, value)
        folder.updated_at = datetime.utcnow()
        return self.folder_repo.update(folder)

    def delete(self, folder_id: str, user_id: str) -> None:
        folder = self.get(folder_id, user_id)
        self.folder_repo.delete(folder.id)
