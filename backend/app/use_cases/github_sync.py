import base64
import requests
from sqlmodel import Session
from app.use_cases.export import ExportUseCase
from app.infrastructure.repositories_impl import FolderRepository, NoteRepository

GITHUB_API_URL = "https://api.github.com"
REPO_NAME = "knowledge-backup"

class GithubSyncUseCase:
    def __init__(self, session: Session, access_token: str):
        self.session = session
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        self.export_uc = ExportUseCase(session)
        self.folder_repo = FolderRepository(session)
        self.note_repo = NoteRepository(session)

    def _get_user_login(self) -> str:
        resp = requests.get(f"{GITHUB_API_URL}/user", headers=self.headers, timeout=30)
        resp.raise_for_status()
        return resp.json()["login"]

    def _repo_exists(self, owner: str) -> bool:
        resp = requests.get(
            f"{GITHUB_API_URL}/repos/{owner}/{REPO_NAME}",
            headers=self.headers,
            timeout=30,
        )
        return resp.status_code == 200

    def _create_repo(self, owner: str) -> dict:
        resp = requests.post(
            f"{GITHUB_API_URL}/user/repos",
            headers=self.headers,
            json={
                "name": REPO_NAME,
                "description": "Knowledge Manager backup — auto-synced notes",
                "private": True,
                "auto_init": True,
                "gitignore_template": None,
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    def _ensure_repo(self, owner: str) -> str:
        if not self._repo_exists(owner):
            self._create_repo(owner)
        return f"{owner}/{REPO_NAME}"

    def _get_file_sha(self, repo: str, path: str) -> str | None:
        resp = requests.get(
            f"{GITHUB_API_URL}/repos/{repo}/contents/{path}",
            headers=self.headers,
            timeout=30,
        )
        if resp.status_code == 200:
            return resp.json().get("sha")
        return None

    def _upload_file(self, repo: str, path: str, content: str, message: str) -> dict:
        encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")
        sha = self._get_file_sha(repo, path)
        body = {
            "message": message,
            "content": encoded,
        }
        if sha:
            body["sha"] = sha

        resp = requests.put(
            f"{GITHUB_API_URL}/repos/{repo}/contents/{path}",
            headers=self.headers,
            json=body,
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    def sync(self, user_id: str) -> dict:
        owner = self._get_user_login()
        repo = self._ensure_repo(owner)

        folders = self.folder_repo.list_by_user(user_id)
        notes = self.note_repo.list_by_user(user_id)
        folder_map = {f.id: f for f in folders}

        uploaded = 0
        for note in notes:
            path_parts = []
            current = folder_map.get(note.folder_id) if note.folder_id else None
            while current:
                safe_name = "".join(c for c in current.name if c.isalnum() or c in " -_").strip()
                path_parts.insert(0, safe_name)
                current = folder_map.get(current.parent_id) if current.parent_id else None

            safe_title = "".join(c for c in note.title if c.isalnum() or c in " -_").strip()
            filepath = "/".join(path_parts + [f"{safe_title}.md"]) if path_parts else f"{safe_title}.md"
            content = f"# {note.title}\n\n{note.content}"

            self._upload_file(repo, filepath, content, f"Sync: {note.title}")
            uploaded += 1

        return {
            "ok": True,
            "repo": repo,
            "uploaded": uploaded,
            "url": f"https://github.com/{repo}",
        }

    def get_status(self) -> dict:
        owner = self._get_user_login()
        repo_full = f"{owner}/{REPO_NAME}"
        resp = requests.get(
            f"{GITHUB_API_URL}/repos/{repo_full}",
            headers=self.headers,
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "connected": True,
                "repo_exists": True,
                "repo": repo_full,
                "url": data.get("html_url"),
                "updated_at": data.get("updated_at"),
            }
        return {"connected": True, "repo_exists": False}