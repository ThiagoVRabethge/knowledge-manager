import httpx
from app.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate_text(self, prompt: str) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not configured in .env")
        
        url = f"{self.base_url}/models/{self.model}:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": self.api_key}
        body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048,
            }
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, params=params, json=body, timeout=60)
            if resp.status_code == 404:
                raise ValueError(f"Model '{self.model}' not found. Check GEMINI_MODEL in .env")
            if resp.status_code == 401:
                raise ValueError("Invalid GEMINI_API_KEY")
            resp.raise_for_status()
            data = resp.json()
        
        candidates = data.get("candidates", [])
        if not candidates:
            return ""
        parts = candidates[0].get("content", {}).get("parts", [])
        return "".join(p.get("text", "") for p in parts)

ai_service_instance = AIService()