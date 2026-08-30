from datetime import datetime
from typing import List

from fastapi import HTTPException
from sqlmodel import Session

from app.domain.models import Collection, CollectionItem
from app.infrastructure.repositories_impl import (
    CollectionItemRepository,
    CollectionRepository,
)
from app.schemas import (
    CollectionCreate,
    CollectionItemCreate,
    CollectionItemUpdate,
    CollectionUpdate,
)
from app.use_cases.github_sync import GithubSyncUseCase


class CollectionUseCase:
    def __init__(self, session: Session):
        self.collection_repo = CollectionRepository(session)
        self.item_repo = CollectionItemRepository(session)
        self.github_sync = GithubSyncUseCase(session)

    def create_collection(self, data: CollectionCreate, user_id: str) -> Collection:
        collection = Collection(**data.model_dump(), user_id=user_id)
        created = self.collection_repo.create(collection)
        self._sync_github(user_id)
        return created

    def list_collections(self, user_id: str) -> List[Collection]:
        return self.collection_repo.list_by_user(user_id)

    def get_collection(self, collection_id: str, user_id: str) -> Collection:
        collection = self.collection_repo.get_by_id(collection_id)
        if not collection or collection.user_id != user_id:
            raise HTTPException(status_code=404, detail="Collection not found")
        return collection

    def update_collection(
        self, collection_id: str, data: CollectionUpdate, user_id: str
    ) -> Collection:
        collection = self.get_collection(collection_id, user_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(collection, key, value)
        collection.updated_at = datetime.utcnow()
        updated = self.collection_repo.update(collection)
        self._sync_github(user_id)
        return updated

    def delete_collection(self, collection_id: str, user_id: str) -> None:
        collection = self.get_collection(collection_id, user_id)
        self.collection_repo.delete(collection.id)
        self._sync_github(user_id)

    def create_item(
        self, data: CollectionItemCreate, collection_id: str, user_id: str
    ) -> CollectionItem:
        collection = self.get_collection(collection_id, user_id)
        item = CollectionItem(**data.model_dump(), collection_id=collection.id)
        created = self.item_repo.create(item)
        self._sync_github(user_id)
        return created

    def list_items(self, collection_id: str, user_id: str) -> List[CollectionItem]:
        collection = self.get_collection(collection_id, user_id)
        return self.item_repo.list_by_collection(collection.id)

    def get_item(self, item_id: str, user_id: str) -> CollectionItem:
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        collection = self.collection_repo.get_by_id(item.collection_id)
        if not collection or collection.user_id != user_id:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    def update_item(
        self, item_id: str, data: CollectionItemUpdate, user_id: str
    ) -> CollectionItem:
        item = self.get_item(item_id, user_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(item, key, value)
        item.updated_at = datetime.utcnow()
        updated = self.item_repo.update(item)
        self._sync_github(user_id)
        return updated

    def delete_item(self, item_id: str, user_id: str) -> None:
        item = self.get_item(item_id, user_id)
        self.item_repo.delete(item.id)
        self._sync_github(user_id)

    def _sync_github(self, user_id: str) -> None:
        try:
            self.github_sync.sync_user_data(user_id)
        except Exception:
            pass
