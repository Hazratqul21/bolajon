from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  project_name: str = "Bolajon Backend"
  version: str = "0.1.0"
  environment: str = "development"

  database_url: str = "postgresql+asyncpg://bolajon:bolajon@postgres:5432/bolajon"
  openai_api_key: str = ""
  openai_model: str = "gpt-4o-mini"
  muxlisa_api_url: AnyHttpUrl | str = "https://muxlisa.uz/api"
  muxlisa_api_key: str = ""
  redis_url: str | None = None
  admin_api_token: str | None = None

  max_audio_duration_seconds: int = 30
  allowed_origins: List[str] = ["*"]

  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

  @field_validator("allowed_origins", mode="before")
  @classmethod
  def split_origins(cls, value: List[str] | str) -> List[str]:
    if isinstance(value, list):
      return value
    return [origin.strip() for origin in value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
  return Settings()


settings = get_settings()

