from functools import lru_cache
from typing import List, Optional

from pydantic import AnyUrl, EmailStr, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "CrossFit Avignon API"
    environment: str = "development"

    # FastAPI
    api_v1_prefix: str = "/v1"

    # CORS
    backend_cors_origins: List[AnyUrl] | List[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://crossfitavignon.fr",
        ]
    )

    # Database
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/crossfit_avignon"
    )

    # Rate limiting (very basic, in-memory)
    rate_limit_requests: int = 10
    rate_limit_window_seconds: int = 60

    # Optional notification email (for future use)
    notification_email: Optional[EmailStr] = None

    # Auth / JWT
    secret_key: str = Field(default="change-me-in-production-use-a-long-random-string")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480  # 8 heures

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()

