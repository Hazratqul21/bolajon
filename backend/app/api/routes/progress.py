from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db_session
from app.models import Achievement, Lesson, LessonAttempt, LearningPath, User, UserAchievement, UserProgress
from app.schemas import APIMessage, LessonAttemptSummary, ProgressOverview, ProgressUpdateRequest, UserBase

router = APIRouter()


@router.get("/{user_id}", response_model=ProgressOverview)
async def get_progress(
    user_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ProgressOverview:
  user = await session.get(User, user_id)
  if user is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

  unlocked_paths = await session.execute(
      select(LearningPath.key)
      .join(UserProgress, UserProgress.learning_path_id == LearningPath.id)
      .where(and_(UserProgress.user_id == user_id, UserProgress.status != "locked"))
      .distinct(),
  )

  attempts_result = await session.execute(
      select(LessonAttempt)
      .where(LessonAttempt.user_id == user_id)
      .order_by(desc(LessonAttempt.created_at))
      .limit(5),
  )

  achievements_result = await session.execute(
      select(Achievement.title)
      .join(UserAchievement, Achievement.id == UserAchievement.achievement_id)
      .where(UserAchievement.user_id == user_id),
  )

  recent_attempts = [
      LessonAttemptSummary(
          attempt_id=attempt.id,
          lesson_id=attempt.lesson_id,
          is_correct=attempt.is_correct,
          score=attempt.score,
          created_at=attempt.created_at,
      )
      for attempt in attempts_result.scalars().all()
  ]

  return ProgressOverview(
      user=UserBase(
          id=user.id,
          first_name=user.first_name,
          nickname=user.nickname,
          age=user.age,
          role=user.role,
          locale=user.locale,
          xp=user.xp,
          level=user.level,
          current_streak=user.current_streak,
          longest_streak=user.longest_streak,
          avatar_url=user.avatar_url,
      ),
      total_xp=user.xp,
      level=user.level,
      streak_days=user.current_streak,
      unlocked_paths=unlocked_paths.scalars().all(),
      recent_attempts=recent_attempts,
      achievements=achievements_result.scalars().all(),
  )


@router.post("/update", response_model=APIMessage)
async def update_progress_endpoint(
    payload: ProgressUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> APIMessage:
  lesson_result = await session.execute(
      select(Lesson)
      .options(selectinload(Lesson.module))
      .where(Lesson.id == payload.lesson_id),
  )
  lesson = lesson_result.scalar_one_or_none()
  if lesson is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

  result = await session.execute(
      select(UserProgress).where(
          and_(UserProgress.user_id == payload.user_id, UserProgress.lesson_id == payload.lesson_id),
      )
  )
  progress = result.scalar_one_or_none()
  module = lesson.module
  if module is None:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Lesson module not configured.")

  if progress is None:
    progress = UserProgress(
        user_id=payload.user_id,
        learning_path_id=module.learning_path_id,
        lesson_id=payload.lesson_id,
        status=payload.status,
        module_id=module.id,
    )
  else:
    progress.status = payload.status
  session.add(progress)
  return APIMessage(message="Progress updated.")

