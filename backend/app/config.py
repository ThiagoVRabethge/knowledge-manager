from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    database_url: str = Field(default="sqlite:///./knowledge.db")
    secret_key: str = Field(..., min_length=32, description="JWT secret key — must be set in production")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=10080)
    gemini_api_key: str = Field(default="")
    gemini_model: str = Field(default="gemini-1.5-flash-latest")
    cors_origins: str = Field(default="http://localhost:5173")
    github_client_id: str = Field(default="", description="GitHub OAuth Client ID")
    github_client_secret: str = Field(default="", description="GitHub OAuth Client Secret")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()