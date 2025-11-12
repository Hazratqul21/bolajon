from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.db.session import dispose_engine
from app.services.gamification_service import gamification_engine


def create_application() -> FastAPI:
  application = FastAPI(
      title=settings.project_name,
      version=settings.version,
      docs_url="/docs",
      redoc_url="/redoc",
  )

  application.add_middleware(
      CORSMiddleware,
      allow_origins=settings.allowed_origins,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )

  @application.on_event("startup")
  async def on_startup() -> None:
    await gamification_engine.initialize()

  @application.on_event("shutdown")
  async def on_shutdown() -> None:
    await gamification_engine.close()
    await dispose_engine()

  application.include_router(api_router, prefix="/api")
  return application


app = create_application()

