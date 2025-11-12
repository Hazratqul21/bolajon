from fastapi import APIRouter

from app.api.routes import admin, auth, health, lessons, math, progress, realtime, sessions

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(math.router, prefix="/math", tags=["math"])
api_router.include_router(realtime.router, prefix="/realtime", tags=["realtime"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])


