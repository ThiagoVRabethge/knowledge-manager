from sqlmodel import SQLModel
from typing import Optional, List
from datetime import datetime

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
    parent_id: Optional[str] = None

class FolderRead(SQLModel):
    id: str
    name: str
    parent_id: Optional[str] = None
    user_id: str
    created_at: datetime
    updated_at: datetime

class FolderTree(FolderRead):
    children: List["FolderTree"] = []
    notes: List["NoteRead"] = []

class FolderUpdate(SQLModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None

class NoteCreate(SQLModel):
    title: str
    content: str = ""
    folder_id: Optional[str] = None

class NoteRead(SQLModel):
    id: str
    title: str
    content: str
    folder_id: Optional[str] = None
    user_id: str
    created_at: datetime
    updated_at: datetime

class NoteUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    folder_id: Optional[str] = None

class NoteLink(SQLModel):
    id: str
    title: str

class AIGenerateRequest(SQLModel):
    prompt: str
    context: str = ""

class AIGenerateResponse(SQLModel):
    text: str
