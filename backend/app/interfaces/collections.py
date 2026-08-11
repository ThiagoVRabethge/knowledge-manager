from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from app.infrastructure.database import get_session
from app.infrastructure.security import get_current_user
from app.use_cases.collections import CollectionUseCase
from app.schemas import (
    CollectionCreate, CollectionRead, CollectionUpdate,
    CollectionItemCreate, CollectionItemRead, CollectionItemUpdate,
    CollectionWithItems,
)
from app.domain.models import User

router = APIRouter(prefix="/collections", tags=["collections"])

@router.post("", response_model=CollectionRead)
def create_collection(data: CollectionCreate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return CollectionUseCase(session).create_collection(data, user.id)

@router.get("", response_model=List[CollectionRead])
def list_collections(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return CollectionUseCase(session).list_collections(user.id)

@router.get("/{collection_id}", response_model=CollectionWithItems)
def get_collection(collection_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    uc = CollectionUseCase(session)
    collection = uc.get_collection(collection_id, user.id)
    items = uc.list_items(collection_id, user.id)
    return CollectionWithItems(
        id=collection.id,
        name=collection.name,
        user_id=collection.user_id,
        created_at=collection.created_at,
        updated_at=collection.updated_at,
        items=items,
    )

@router.patch("/{collection_id}", response_model=CollectionRead)
def update_collection(collection_id: str, data: CollectionUpdate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return CollectionUseCase(session).update_collection(collection_id, data, user.id)

@router.delete("/{collection_id}")
def delete_collection(collection_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    CollectionUseCase(session).delete_collection(collection_id, user.id)
    return {"ok": True}

@router.post("/{collection_id}/items", response_model=CollectionItemRead)
def create_item(collection_id: str, data: CollectionItemCreate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return CollectionUseCase(session).create_item(data, collection_id, user.id)

@router.get("/{collection_id}/items", response_model=List[CollectionItemRead])
def list_items(collection_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return CollectionUseCase(session).list_items(collection_id, user.id)

@router.patch("/items/{item_id}", response_model=CollectionItemRead)
def update_item(item_id: str, data: CollectionItemUpdate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return CollectionUseCase(session).update_item(item_id, data, user.id)

@router.delete("/items/{item_id}")
def delete_item(item_id: str, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    CollectionUseCase(session).delete_item(item_id, user.id)
    return {"ok": True}