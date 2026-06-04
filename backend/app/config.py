"""
config.py — Application settings loaded from environment variables.
Uses pydantic-settings for type-safe configuration management.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    All configuration values are read from environment variables.
    Defaults are provided for development only.
    """

    # Supabase
    supabase_url: str
    supabase_key: str  # Use the service_role key for backend operations

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    # CORS
    frontend_url: str = "https://unibooks-frontend.vercel.app"

    # App
    app_name: str = "UniBooks Exchange"
    app_version: str = "1.0.0"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.
    lru_cache ensures the .env file is only read once.
    """
    return Settings()
