import requests
from app.config import settings

GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"

def exchange_code_for_token(code: str) -> str:
    """Troca o code OAuth do GitHub por um access_token."""
    if not settings.github_client_id or not settings.github_client_secret:
        raise ValueError("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured")

    resp = requests.post(
        GITHUB_TOKEN_URL,
        headers={"Accept": "application/json"},
        data={
            "client_id": settings.github_client_id,
            "client_secret": settings.github_client_secret,
            "code": code,
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise ValueError(f"GitHub OAuth error: {data.get('error_description', data['error'])}")
    return data.get("access_token", "")

def get_github_user_email(access_token: str) -> dict:
    """Busca dados do usuário autenticado no GitHub."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    # Dados do usuário
    resp = requests.get(f"{GITHUB_API_URL}/user", headers=headers, timeout=30)
    resp.raise_for_status()
    user_data = resp.json()

    # Emails (para pegar o primário)
    resp_emails = requests.get(f"{GITHUB_API_URL}/user/emails", headers=headers, timeout=30)
    resp_emails.raise_for_status()
    emails = resp_emails.json()

    primary_email = None
    for e in emails:
        if e.get("primary"):
            primary_email = e.get("email")
            break
    if not primary_email and emails:
        primary_email = emails[0].get("email")

    return {
        "id": str(user_data.get("id")),
        "login": user_data.get("login"),
        "email": primary_email or f"{user_data.get('login')}@github.com",
        "avatar_url": user_data.get("avatar_url"),
    }