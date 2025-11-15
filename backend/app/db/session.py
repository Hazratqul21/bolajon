from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import Engine, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings


def _ensure_async_url(url: str) -> str:
  normalized = url.replace("postgres://", "postgresql://", 1)
  if normalized.startswith("postgresql+asyncpg://"):
    return normalized
  if normalized.startswith("postgresql://"):
    return normalized.replace("postgresql://", "postgresql+asyncpg://", 1)
  return normalized


ASYNC_DATABASE_URL = _ensure_async_url(settings.database_url)

async_engine: AsyncEngine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

async_session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    async_engine,
    expire_on_commit=False,
)


def get_sync_engine() -> Engine:
  """Return a synchronous engine for offline operations (migrations, scripts)."""
  sync_url = ASYNC_DATABASE_URL.replace("+asyncpg", "")
  return create_engine(sync_url, future=True)


@asynccontextmanager
async def lifespan_session() -> AsyncGenerator[AsyncSession, None]:
  session = async_session_factory()
  try:
    yield session
    await session.commit()
  except Exception:
    await session.rollback()
    raise
  finally:
    await session.close()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
  async with lifespan_session() as session:
    yield session


async def dispose_engine() -> None:
  await async_engine.dispose()

