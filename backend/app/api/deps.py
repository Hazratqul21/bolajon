from functools import lru_cache

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_session
from app.services import (
    GamificationEngine,
    LearningService,
    MathService,
    MuxlisaClient,
    OpenAIAdapter,
    gamification_engine,
    learning_service,
    math_service,
    muxlisa_client,
    openai_adapter,
)


async def get_db_session() -> AsyncSession:
  async for session in get_session():
    yield session


@lru_cache
def get_gamification_engine() -> GamificationEngine:
  return gamification_engine


@lru_cache
def get_learning_service() -> LearningService:
  return learning_service


@lru_cache
def get_math_service() -> MathService:
  return math_service


@lru_cache
def get_muxlisa_client() -> MuxlisaClient:
  return muxlisa_client


@lru_cache
def get_openai_adapter() -> OpenAIAdapter:
  return openai_adapter


def require_admin_token(x_admin_token: str = Header(..., alias="X-Admin-Token")) -> None:
  if not settings.admin_api_token or x_admin_token != settings.admin_api_token:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin token invalid.")

