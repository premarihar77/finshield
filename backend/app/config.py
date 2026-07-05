from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    database_name: str = "finshield_db"
    jwt_secret: str = "change_this_secret_in_production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    frontend_url: str = "http://localhost:5173"
    tesseract_cmd: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
