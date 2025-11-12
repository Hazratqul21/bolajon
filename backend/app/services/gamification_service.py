from __future__ import annotations

from datetime import datetime
from typing import Iterable
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models import Lesson, LessonAttempt, Module, User, UserProgress
from app.schemas import GamificationSnapshot


class GamificationEngine:
  """Centralised XP, level, and reward calculations."""

  def __init__(self) -> None:
    self._xp_thresholds: list[int] = [0, 40, 120, 240, 400, 600, 840, 1120, 1440, 1800]
    self._initialized = False

  async def initialize(self) -> None:
    if self._initialized:
      return
    logger.info("Gamification engine initialised with %d XP tiers.", len(self._xp_thresholds))
    self._initialized = True

  async def close(self) -> None:
    if not self._initialized:
      return
    logger.info("Gamification engine shut down.")
    self._initialized = False

  def add_thresholds(self, thresholds: Iterable[int]) -> None:
    self._xp_thresholds = sorted(set(thresholds))

  def calculate_level(self, xp: int) -> int:
    for idx, threshold in enumerate(self._xp_thresholds, start=1):
      if xp < threshold:
        return max(1, idx - 1)
    return len(self._xp_thresholds)

  def next_level_xp(self, xp: int) -> int:
    for threshold in self._xp_thresholds:
      if xp < threshold:
        return threshold
    return self._xp_thresholds[-1]

  async def apply_attempt_outcome(
      self,
      session: AsyncSession,
      user: User,
      lesson: Lesson,
      attempt: LessonAttempt,
  ) -> tuple[int, bool]:
    xp_awarded = lesson.xp_reward if attempt.is_correct else max(lesson.xp_reward // 2, 1)
    user.xp += xp_awarded
    new_level = self.calculate_level(user.xp)
    leveled_up = new_level > user.level
    if leveled_up:
      user.level = new_level
    if attempt.is_correct:
      user.current_streak += 1
      user.longest_streak = max(user.longest_streak, user.current_streak)
    else:
      user.current_streak = 0
    session.add(user)
    await self._record_progress(session, user, lesson, attempt, xp_awarded)
    return xp_awarded, leveled_up

  async def _record_progress(
      self,
      session: AsyncSession,
      user: User,
      lesson: Lesson,
      attempt: LessonAttempt,
      xp_awarded: int,
  ) -> None:
    query = select(UserProgress).where(
        and_(UserProgress.user_id == user.id, UserProgress.lesson_id == lesson.id),
    )
    result = await session.execute(query)
    progress = result.scalar_one_or_none()
    if progress is None:
      progress = UserProgress(
          user_id=user.id,
          learning_path_id=lesson.module.learning_path_id,
          module_id=lesson.module_id,
          lesson_id=lesson.id,
          status="in_progress",
      )
    progress.status = "completed" if attempt.is_correct else "in_progress"
    progress.xp_earned += xp_awarded
    progress.streak_count = user.current_streak
    progress.last_attempt_at = datetime.utcnow()
    progress.metadata |= {
        "last_score": attempt.score,
        "is_correct": attempt.is_correct,
    }
    session.add(progress)

  async def unlock_next_lessons(self, session: AsyncSession, module: Module, user_id: UUID) -> list[str]:
    """Mark the next lesson as available once the current one is complete."""
    lessons = await session.execute(
        select(Lesson).where(Lesson.module_id == module.id).order_by(Lesson.order_index),
    )
    unlocked: list[str] = []
    lessons_ordered = lessons.scalars().all()
    completed_ids = set(
        row.lesson_id
        for row in (
            await session.execute(
                select(UserProgress.lesson_id).where(
                    and_(UserProgress.user_id == user_id, UserProgress.status == "completed"),
                )
            )
        ).scalars()
    )
    for idx, lesson in enumerate(lessons_ordered):
      if lesson.id in completed_ids:
        continue
      # unlock the very next available lesson
      if idx == 0 or lessons_ordered[idx - 1].id in completed_ids:
        progress_result = await session.execute(
            select(UserProgress).where(
                and_(UserProgress.user_id == user_id, UserProgress.lesson_id == lesson.id),
            )
        )
        progress = progress_result.scalar_one_or_none()
        if progress is None:
          progress = UserProgress(
              user_id=user_id,
              learning_path_id=module.learning_path_id,
              module_id=module.id,
              lesson_id=lesson.id,
              status="available",
          )
        else:
          progress.status = "available"
        session.add(progress)
        unlocked.append(lesson.key)
      break
    return unlocked

  async def snapshot(self, user: User) -> GamificationSnapshot:
    next_level_xp = self.next_level_xp(user.xp)
    return GamificationSnapshot(
        xp=user.xp,
        level=user.level,
        next_level_xp=next_level_xp,
        badges=[achievement.achievement.key for achievement in user.achievements],
        streak=user.current_streak,
    )


gamification_engine = GamificationEngine()


