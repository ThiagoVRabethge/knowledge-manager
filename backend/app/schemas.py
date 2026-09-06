from datetime import datetime
from typing import List, Optional  # noqa: UP035

from sqlmodel import SQLModel


class UserCreate(SQLModel):
    email: str
    password: str


class UserRead(SQLModel):
    id: str
    email: str
    created_at: datetime


class Token(SQLModel):
    access_token: str
    token_type: str


class FolderCreate(SQLModel):
    name: str
    parent_id: Optional[str] = None  # noqa: UP045


class FolderRead(SQLModel):
    id: str
    name: str
    parent_id: Optional[str] = None  # noqa: UP045
    user_id: str
    created_at: datetime
    updated_at: datetime


class FolderTree(FolderRead):
    children: List["FolderTree"] = []  # noqa: UP006
    notes: List["NoteRead"] = []  # noqa: UP006


class FolderUpdate(SQLModel):
    name: Optional[str] = None  # noqa: UP045
    parent_id: Optional[str] = None  # noqa: UP045


class NoteCreate(SQLModel):
    title: str
    content: str = ""
    folder_id: Optional[str] = None  # noqa: UP045


class NoteRead(SQLModel):
    id: str
    title: str
    content: str
    folder_id: Optional[str] = None  # noqa: UP045
    user_id: str
    created_at: datetime
    updated_at: datetime


class NoteUpdate(SQLModel):
    title: Optional[str] = None  # noqa: UP045
    content: Optional[str] = None  # noqa: UP045
    folder_id: Optional[str] = None  # noqa: UP045


class NoteLink(SQLModel):
    id: str
    title: str


class AIGenerateRequest(SQLModel):
    prompt: str
    context: str = ""


class AIGenerateResponse(SQLModel):
    text: str


class CollectionCreate(SQLModel):
    name: str


class CollectionRead(SQLModel):
    id: str
    name: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class CollectionUpdate(SQLModel):
    name: Optional[str] = None  # noqa: UP045


class CollectionItemCreate(SQLModel):
    title: str
    url: str
    description: str = ""


class CollectionItemRead(SQLModel):
    id: str
    title: str
    url: str
    description: str
    collection_id: str
    created_at: datetime
    updated_at: datetime


class CollectionItemUpdate(SQLModel):
    title: Optional[str] = None  # noqa: UP045
    url: Optional[str] = None  # noqa: UP045
    description: Optional[str] = None  # noqa: UP045


class CollectionWithItems(CollectionRead):
    items: List[CollectionItemRead] = []  # noqa: UP006


class ShareCreate(SQLModel):
    title: str
    url: str = ""
    text: str = ""


class NoteTemplateCreate(SQLModel):
    name: str
    content: str = ""


class NoteTemplateRead(SQLModel):
    id: str
    name: str
    content: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class NoteTemplateUpdate(SQLModel):
    name: Optional[str] = None  # noqa: UP045
    content: Optional[str] = None  # noqa: UP045
