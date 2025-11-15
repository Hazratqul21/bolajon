from __future__ import annotations

from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.models import LearningPath, Lesson, Module, User, UserProgress
from app.schemas import LessonPromptSchema, LessonSchema, UserProgressEntry
from app.services.gamification_service import GamificationEngine, gamification_engine


class LearningService:
  def __init__(self, gamification: GamificationEngine) -> None:
    self._gamification = gamification

  async def ensure_user(self, session: AsyncSession, user_id: UUID) -> User:
    user = await session.get(User, user_id)
    if user is None:
      raise ValueError(f"User {user_id} not found.")
    return user

  async def get_learning_path(self, session: AsyncSession, path_key: str) -> LearningPath:
    result = await session.execute(select(LearningPath).where(LearningPath.key == path_key))
    path = result.scalar_one_or_none()
    if path is None:
      raise ValueError(f"Learning path '{path_key}' not found.")
    return path

  async def get_next_lesson(
      self,
      session: AsyncSession,
      *,
      user_id: UUID,
      learning_path_key: str,
      resume: bool,
  ) -> tuple[Lesson, UserProgress]:
    user = await self.ensure_user(session, user_id)
    learning_path = await self.get_learning_path(session, learning_path_key)
    modules_result = await session.execute(
        select(Module).where(Module.learning_path_id == learning_path.id).order_by(Module.order_index),
    )
    modules = modules_result.scalars().all()
    if not modules:
      raise ValueError(f"No modules configured for learning path '{learning_path_key}'.")

    for module in modules:
      lessons_result = await session.execute(
          select(Lesson)
          .options(selectinload(Lesson.prompts))
          .where(Lesson.module_id == module.id)
          .order_by(Lesson.order_index),
      )
      lessons = lessons_result.scalars().all()
      if not lessons:
        continue

      for index, lesson in enumerate(lessons):
        progress = await self._get_or_create_progress(
            session=session,
            user=user,
            learning_path_id=learning_path.id,
            module=module,
            lesson=lesson,
            auto_unlock=index == 0,
        )
        if resume and progress.status == "completed":
          continue
        logger.debug("Selected lesson %s for user %s", lesson.key, user.id)
        return lesson, progress

    # fallback to last lesson
    last_lesson_result = await session.execute(
        select(Lesson)
        .where(Lesson.module_id == modules[-1].id)
        .order_by(Lesson.order_index.desc())
        .limit(1),
    )
    last_lesson = last_lesson_result.scalar_one()
    progress = await self._get_or_create_progress(
        session=session,
        user=user,
        learning_path_id=learning_path.id,
        module=modules[-1],
        lesson=last_lesson,
        auto_unlock=True,
    )
    return last_lesson, progress

  async def _get_or_create_progress(
      self,
      *,
      session: AsyncSession,
      user: User,
      learning_path_id: UUID,
      module: Module,
      lesson: Lesson,
      auto_unlock: bool,
  ) -> UserProgress:
    result = await session.execute(
        select(UserProgress).where(
            and_(UserProgress.user_id == user.id, UserProgress.lesson_id == lesson.id),
        )
    )
    progress = result.scalar_one_or_none()
    if progress is None:
      progress = UserProgress(
          user_id=user.id,
          learning_path_id=learning_path_id,
          module_id=module.id,
          lesson_id=lesson.id,
          status="available" if auto_unlock else "locked",
      )
      session.add(progress)
      await session.flush()
    return progress

  def serialize_lesson(
      self, 
      lesson: Lesson, 
      user_preferences: dict | None = None
  ) -> LessonSchema:
    """Lesson ni serialize qilish, qiziqishlarga mos random so'zlarni qaytarish"""
    import random
    
    # Database dan so'zlarni olish (100 ta so'z)
    all_words = lesson.example_words or []
    
    # Agar so'zlar bo'lsa, qiziqishlarga mos filter qilish
    filtered_words = all_words.copy() if all_words else []
    
    if user_preferences and all_words:
      interests = user_preferences.get('interests', [])
      if interests and isinstance(interests, list):
        # Qiziqishlarga mos so'zlarni filter qilish
        # Har safar random aylantirish (har doim yangi so'zlar)
        random.shuffle(filtered_words)
        # Qiziqishlarga mos so'zlarni tanlash (agar mavjud bo'lsa)
        # Hozircha barcha so'zlarni random aylantirish
        pass
    
    # Random aylantirish va 3 tasini tanlash (frontend uchun)
    # Har safar yangi random so'zlar
    if filtered_words:
      random.shuffle(filtered_words)
      selected_words = filtered_words[:3]
    else:
      selected_words = []
    
    return LessonSchema(
        id=lesson.id,
        key=lesson.key,
        title=lesson.title,
        description=lesson.description,
        lesson_type=lesson.lesson_type,
        target_letter=lesson.target_letter,
        target_sound=lesson.target_sound,
        xp_reward=lesson.xp_reward,
        example_words=selected_words,  # Random 3 ta so'z (har safar yangi)
        example_image_urls=lesson.example_image_urls or [],
        media_assets=lesson.media_assets or {},
        prompts=[
            LessonPromptSchema(
                id=prompt.id,
                prompt_type=prompt.prompt_type,
                locale=prompt.locale,
                template=prompt.template,
            )
            for prompt in lesson.prompts
        ],
    )

  def serialize_progress(self, progress: UserProgress) -> UserProgressEntry:
    return UserProgressEntry(
        learning_path_id=progress.learning_path_id,
        module_id=progress.module_id,
        lesson_id=progress.lesson_id,
        status=progress.status,
        xp_earned=progress.xp_earned,
        streak_count=progress.streak_count,
        last_attempt_at=progress.last_attempt_at,
    )


learning_service = LearningService(gamification_engine)

