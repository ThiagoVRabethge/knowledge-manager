from typing import List
from fastapi import HTTPException
from sqlmodel import Session
import base64
import requests

from app.infrastructure.repositories_impl import NoteRepository, FolderRepository, UserRepository, CollectionRepository, CollectionItemRepository
from app.domain.models import Note, Folder, Collection, CollectionItem


class GithubSyncUseCase:
    def __init__(self, session: Session):
        self.note_repo = NoteRepository(session)
        self.folder_repo = FolderRepository(session)
        self.user_repo = UserRepository(session)
        self.collection_repo = CollectionRepository(session)
        self.item_repo = CollectionItemRepository(session)

    def sync_to_github(self, user_id: str, access_token: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        notes: List[Note] = self.note_repo.list_by_user(user_id)
        folders: List[Folder] = self.folder_repo.list_by_user(user_id)
        collections: List[Collection] = self.collection_repo.list_by_user(user_id)

        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        user_response = requests.get("https://api.github.com/user", headers=headers)
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid GitHub token")
        github_user = user_response.json()

        repo_name = "knowledge-backup"
        repo_url = f"https://api.github.com/repos/{github_user['login']}/{repo_name}"

        repo_check = requests.get(repo_url, headers=headers)
        if repo_check.status_code == 404:
            create_repo = requests.post(
                "https://api.github.com/user/repos",
                headers=headers,
                json={"name": repo_name, "private": True, "auto_init": True},
            )
            if create_repo.status_code not in [201, 422]:
                raise HTTPException(status_code=400, detail="Failed to create repository")

        folder_map = {f.id: f for f in folders}
        folder_notes = {}
        for note in notes:
            fid = note.folder_id or "root"
            folder_notes.setdefault(fid, []).append(note)

        def get_folder_path(folder_id: str) -> str:
            if folder_id == "root" or not folder_id:
                return ""
            folder = folder_map.get(folder_id)
            if not folder:
                return ""
            parts = []
            current = folder
            while current:
                parts.append(current.name)
                if current.parent_id and current.parent_id in folder_map:
                    current = folder_map[current.parent_id]
                else:
                    break
            return "/".join(reversed(parts)) + "/" if parts else ""

        uploaded = 0
        errors = []

        for folder_id, note_list in folder_notes.items():
            folder_path = get_folder_path(folder_id)
            for note in note_list:
                safe_title = "".join(c for c in note.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
                safe_title = safe_title.replace(' ', '-')
                file_path = f"{folder_path}{safe_title}.md"
                content = note.content or ""

                existing = requests.get(
                    f"{repo_url}/contents/{file_path}",
                    headers=headers,
                )
                sha = None
                if existing.status_code == 200:
                    sha = existing.json().get("sha")

                payload = {
                    "message": f"Update note: {note.title}",
                    "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
                }
                if sha:
                    payload["sha"] = sha

                put_response = requests.put(
                    f"{repo_url}/contents/{file_path}",
                    headers=headers,
                    json=payload,
                )
                if put_response.status_code in [200, 201]:
                    uploaded += 1
                else:
                    errors.append(f"{file_path}: {put_response.status_code}")

        # ========== COLEÇÕES ==========
        if collections:
            for collection in collections:
                items: List[CollectionItem] = self.item_repo.list_by_collection(collection.id)
                safe_name = "".join(c for c in collection.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
                safe_name = safe_name.replace(' ', '-').lower()
                file_path = f"collections/{safe_name}.md"

                md_content = f"# {collection.name}\\n\\n"
                if items:
                    md_content += "## Links\\n\\n"
                    for item in items:
                        md_content += f"- [{item.title}]({item.url})"
                        if item.description:
                            md_content += f" — {item.description}"
                        md_content += "\\n"
                else:
                    md_content += "*Nenhum link nesta coleção.*\\n"

                existing = requests.get(
                    f"{repo_url}/contents/{file_path}",
                    headers=headers,
                )
                sha = None
                if existing.status_code == 200:
                    sha = existing.json().get("sha")

                payload = {
                    "message": f"Update collection: {collection.name}",
                    "content": base64.b64encode(md_content.encode("utf-8")).decode("utf-8"),
                }
                if sha:
                    payload["sha"] = sha

                put_response = requests.put(
                    f"{repo_url}/contents/{file_path}",
                    headers=headers,
                    json=payload,
                )
                if put_response.status_code in [200, 201]:
                    uploaded += 1
                else:
                    errors.append(f"{file_path}: {put_response.status_code}")

        return {
            "ok": True,
            "uploaded_files": uploaded,
            "errors": errors,
            "repo_url": f"https://github.com/{github_user['login']}/{repo_name}",
        }

    def get_sync_status(self, user_id: str, access_token: str) -> dict:
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }
        user_response = requests.get("https://api.github.com/user", headers=headers)
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid GitHub token")

        github_user = user_response.json()
        repo_name = "knowledge-backup"
        repo_url = f"https://api.github.com/repos/{github_user['login']}/{repo_name}"
        repo_check = requests.get(repo_url, headers=headers)

        if repo_check.status_code == 404:
            return {"synced": False, "repo_exists": False}

        contents = requests.get(f"{repo_url}/contents", headers=headers)
        files = []
        if contents.status_code == 200:
            files = [item["name"] for item in contents.json() if item["type"] == "file"]

        return {
            "synced": True,
            "repo_exists": True,
            "repo_url": f"https://github.com/{github_user['login']}/{repo_name}",
            "files": files,
        }