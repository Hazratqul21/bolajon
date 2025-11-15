from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_gamification_engine, get_muxlisa_client, get_openai_adapter
from app.models import Lesson, LessonAttempt, User
from app.schemas import LessonAttemptRequest, LessonAttemptResponse, LessonAttemptFeedback
from app.services.gamification_service import GamificationEngine
from app.services.muxlisa_service import MuxlisaClient
from app.services.openai_service import OpenAIAdapter

router = APIRouter()


@router.post("/{lesson_id}/attempt", response_model=LessonAttemptResponse)
async def submit_attempt(
    lesson_id: UUID,
    request: LessonAttemptRequest,
    session: AsyncSession = Depends(get_db_session),
    gamification: GamificationEngine = Depends(get_gamification_engine),
    muxlisa: MuxlisaClient = Depends(get_muxlisa_client),
    openai_adapter: OpenAIAdapter = Depends(get_openai_adapter),
) -> LessonAttemptResponse:
  user = await session.get(User, request.user_id)
  if user is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
  lesson = await session.get(Lesson, lesson_id)
  if lesson is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

  transcript_info = {"transcript": request.transcript_hint}
  if request.transcript_hint:
    transcript = request.transcript_hint
  else:
    transcript = transcript_info.get("transcript") or ""

  evaluation = await openai_adapter.evaluate_pronunciation(
      transcript=transcript,
      target_letter=lesson.target_letter,
      example_words=lesson.example_words or [],
      user_age=user.age,
  )
  score = evaluation.get("score")
  is_correct = bool(score is not None and score >= 0.75)

  attempt = LessonAttempt(
      user_id=user.id,
      lesson_id=lesson.id,
      audio_url=request.audio_url,
      transcript=transcript,
      evaluation=evaluation,
      feedback=evaluation.get("encouragement"),
      score=score,
      is_correct=is_correct,
  )
  session.add(attempt)
  await session.flush()

  xp_awarded, leveled_up = await gamification.apply_attempt_outcome(session, user, lesson, attempt)
  unlocked = await gamification.unlock_next_lessons(session, lesson.module, user.id) if is_correct else []

  response_feedback = LessonAttemptFeedback(
      transcript=transcript,
      pronunciation_score=score,
      accuracy_score=evaluation.get("accuracy"),
      fluency_score=evaluation.get("fluency"),
      issues=evaluation.get("issues", []),
      suggested_repetition=not is_correct,
      encouragement=evaluation.get("encouragement"),
  )

  return LessonAttemptResponse(
      attempt_id=attempt.id,
      lesson_id=lesson.id,
      user_id=user.id,
      is_correct=is_correct,
      score=score,
      feedback=response_feedback,
      xp_awarded=xp_awarded,
      leveled_up=leveled_up,
      unlocked_lessons=unlocked,
  )

