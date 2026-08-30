import uuid
from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    github_access_token: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FolderBase(SQLModel):
    name: str = Field(index=True)
    parent_id: Optional[str] = Field(default=None, foreign_key="folder.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Folder(FolderBase, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    notes: List["Note"] = Relationship(back_populates="folder")
    parent: Optional["Folder"] = Relationship(
        back_populates="children", sa_relationship_kwargs={"remote_side": "Folder.id"}
    )
    children: List["Folder"] = Relationship(back_populates="parent")


class NoteBase(SQLModel):
    title: str = Field(index=True)
    content: str = Field(default="")
    folder_id: Optional[str] = Field(default=None, foreign_key="folder.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Note(NoteBase, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    folder: Optional[Folder] = Relationship(back_populates="notes")


# ========== COLEÇÕES ==========
class CollectionBase(SQLModel):
    name: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Collection(CollectionBase, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    items: List["CollectionItem"] = Relationship(back_populates="collection")


class CollectionItemBase(SQLModel):
    title: str = Field(index=True)
    url: str
    description: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CollectionItem(CollectionItemBase, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    collection_id: str = Field(foreign_key="collection.id", index=True)
    collection: Optional[Collection] = Relationship(back_populates="items")
