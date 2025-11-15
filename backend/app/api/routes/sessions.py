from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_learning_service
from app.models import User
from app.schemas import SessionStartRequest, SessionStartResponse
from app.services.learning_service import LearningService

router = APIRouter()


@router.post("/start", response_model=SessionStartResponse, status_code=status.HTTP_200_OK)
async def start_session(
    request: SessionStartRequest,
    session: AsyncSession = Depends(get_db_session),
    learning_service: LearningService = Depends(get_learning_service),
) -> SessionStartResponse:
  try:
    # User ni olish va preferences ni olish
    user = await session.get(User, request.user_id)
    user_preferences = user.preferences if user else None
    
    lesson, progress = await learning_service.get_next_lesson(
        session=session,
        user_id=request.user_id,
        learning_path_key=request.learning_path_key or "alphabet",
        resume=request.resume,
    )
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

  return SessionStartResponse(
      lesson=learning_service.serialize_lesson(lesson, user_preferences=user_preferences),
      progress=learning_service.serialize_progress(progress),
      next_unlocks=[],
  )

