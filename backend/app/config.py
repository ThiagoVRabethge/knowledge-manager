from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Database: SQLite em dev, PostgreSQL (Neon) em produção
    database_url: str = Field(default="sqlite:///./knowledge.db")
    
    # JWT: SEM default — obrigatório definir em produção
    secret_key: str = Field(..., min_length=32, description="JWT secret key — must be set in production")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=10080)
    
    # AI: opcional — se vazio, a feature de IA fica desabilitada
    gemini_api_key: str = Field(default="")
    gemini_model: str = Field(default="gemini-1.5-flash-latest")
    
    # CORS: localhost em dev, domínio de produção em prod
    cors_origins: str = Field(default="http://localhost:5173")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()