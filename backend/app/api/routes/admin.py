from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, require_admin_token
from app.models import LearningPath, Lesson, LessonPrompt, Module
from app.schemas import APIMessage, AdminContentPayload

router = APIRouter(dependencies=[Depends(require_admin_token)])


@router.post("/content", response_model=APIMessage)
async def upsert_content(
    payload: AdminContentPayload,
    session: AsyncSession = Depends(get_db_session),
) -> APIMessage:
  learning_path = await _get_or_create_learning_path(session, payload.learning_path_key)
  module = await _get_or_create_module(session, learning_path, payload.module_key)

  if payload.overwrite:
    await session.execute(delete(Lesson).where(Lesson.module_id == module.id))

  for index, lesson_payload in enumerate(payload.lessons):
    lesson = await _upsert_lesson(session, module, lesson_payload, order_index=index)
    await _sync_prompts(session, lesson, lesson_payload.get("prompts", []))

  return APIMessage(message="Content synced successfully.")


async def _get_or_create_learning_path(session: AsyncSession, key: str) -> LearningPath:
  result = await session.execute(select(LearningPath).where(LearningPath.key == key))
  learning_path = result.scalar_one_or_none()
  if learning_path:
    return learning_path
  learning_path = LearningPath(key=key, title=key.title(), description="Automatically created")
  session.add(learning_path)
  await session.flush()
  return learning_path


async def _get_or_create_module(session: AsyncSession, learning_path: LearningPath, key: str) -> Module:
  result = await session.execute(
      select(Module).where(Module.learning_path_id == learning_path.id, Module.key == key),
  )
  module = result.scalar_one_or_none()
  if module:
    return module
  module = Module(
    learning_path_id=learning_path.id,
    key=key,
    title=key.title(),
    description="Auto generated module",
    order_index=0,
    is_unlocked_by_default=True,
  )
  session.add(module)
  await session.flush()
  return module


async def _upsert_lesson(
    session: AsyncSession,
    module: Module,
    payload: dict[str, Any],
    *,
    order_index: int,
) -> Lesson:
  key = payload.get("key")
  if not key:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lesson key missing.")
  result = await session.execute(
      select(Lesson).where(Lesson.module_id == module.id, Lesson.key == key),
  )
  lesson = result.scalar_one_or_none()
  fields = {
      "title": payload.get("title", key.title()),
      "description": payload.get("description"),
      "lesson_type": payload.get("lesson_type", "letter_practice"),
      "target_letter": payload.get("target_letter"),
      "target_sound": payload.get("target_sound"),
      "difficulty": payload.get("difficulty", "beginner"),
      "order_index": payload.get("order_index", order_index),
      "xp_reward": payload.get("xp_reward", 10),
      "media_assets": payload.get("media_assets", {}),
      "example_words": payload.get("example_words", []),
      "example_image_urls": payload.get("example_image_urls", []),
      "extra_metadata": payload.get("extra_metadata", {}),
  }
  if lesson is None:
    lesson = Lesson(module_id=module.id, key=key, **fields)
    session.add(lesson)
    await session.flush()
  else:
    for attr, value in fields.items():
      setattr(lesson, attr, value)
  return lesson


async def _sync_prompts(session: AsyncSession, lesson: Lesson, prompts: list[dict[str, Any]]) -> None:
  existing_result = await session.execute(select(LessonPrompt).where(LessonPrompt.lesson_id == lesson.id))
  existing = {prompt.prompt_type: prompt for prompt in existing_result.scalars().all()}
  for prompt_data in prompts:
    prompt_type = prompt_data.get("prompt_type", "evaluation")
    template = prompt_data.get("template")
    if not template:
      continue
    locale = prompt_data.get("locale", "uz-Latn")
    metadata = prompt_data.get("metadata", {})
    prompt = existing.get(prompt_type)
    if prompt:
      prompt.template = template
      prompt.locale = locale
      prompt.meta_data = metadata
      session.add(prompt)
    else:
      session.add(
          LessonPrompt(
              lesson_id=lesson.id,
              prompt_type=prompt_type,
              template=template,
              locale=locale,
              meta_data=metadata,
          )
      )

