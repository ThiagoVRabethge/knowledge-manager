from typing import List, Optional
from sqlmodel import Session, select
from app.domain.models import User, Folder, Note
from app.domain.repositories import IUserRepository, IFolderRepository, INoteRepository

class UserRepository(IUserRepository):
    def __init__(self, session: Session):
        self.session = session

    def create(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.exec(select(User).where(User.email == email)).first()

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.session.get(User, user_id)

class FolderRepository(IFolderRepository):
    def __init__(self, session: Session):
        self.session = session

    def create(self, folder: Folder) -> Folder:
        self.session.add(folder)
        self.session.commit()
        self.session.refresh(folder)
        return folder

    def get_by_id(self, folder_id: str) -> Optional[Folder]:
        return self.session.get(Folder, folder_id)

    def list_by_user(self, user_id: str) -> List[Folder]:
        return self.session.exec(select(Folder).where(Folder.user_id == user_id)).all()

    def delete(self, folder_id: str) -> None:
        folder = self.session.get(Folder, folder_id)
        if folder:
            self.session.delete(folder)
            self.session.commit()

    def update(self, folder: Folder) -> Folder:
        self.session.add(folder)
        self.session.commit()
        self.session.refresh(folder)
        return folder

class NoteRepository(INoteRepository):
    def __init__(self, session: Session):
        self.session = session

    def create(self, note: Note) -> Note:
        self.session.add(note)
        self.session.commit()
        self.session.refresh(note)
        return note

    def get_by_id(self, note_id: str) -> Optional[Note]:
        return self.session.get(Note, note_id)

    def list_by_user(self, user_id: str) -> List[Note]:
        return self.session.exec(select(Note).where(Note.user_id == user_id)).all()

    def delete(self, note_id: str) -> None:
        note = self.session.get(Note, note_id)
        if note:
            self.session.delete(note)
            self.session.commit()

    def update(self, note: Note) -> Note:
        self.session.add(note)
        self.session.commit()
        self.session.refresh(note)
        return note
