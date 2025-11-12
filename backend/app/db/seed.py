from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models import Achievement, LearningPath, Lesson, LessonPrompt, Module, Skill, SkillActivity

ALPHABET_LESSONS = [
    {
        "key": "letter-a",
        "title": "A harfi bilan tanishamiz",
        "description": "Bolalar uchun A harfi va uning tovushi.",
        "target_letter": "A",
        "target_sound": "a",
        "example_words": ["Anor", "Olma", "Archa"],
        "example_image_urls": [
            "https://cdn.example.com/images/alphabet/anor.png",
            "https://cdn.example.com/images/alphabet/olma.png",
            "https://cdn.example.com/images/alphabet/archa.png",
        ],
    },
    {
        "key": "letter-o",
        "title": "O harfi bilan tanishamiz",
        "description": "O harfi va uning so'zlardagi o'rni.",
        "target_letter": "O",
        "target_sound": "o",
        "example_words": ["Ona", "Olma", "Oyi"],
        "example_image_urls": [
            "https://cdn.example.com/images/alphabet/ona.png",
            "https://cdn.example.com/images/alphabet/olma.png",
            "https://cdn.example.com/images/alphabet/oyi.png",
        ],
    },
    {
        "key": "letter-l",
        "title": "L harfi bilan tanishamiz",
        "description": "L harfi tovushini mashq qilamiz.",
        "target_letter": "L",
        "target_sound": "l",
        "example_words": ["Lola", "Limon", "Lampa"],
        "example_image_urls": [
            "https://cdn.example.com/images/alphabet/lola.png",
            "https://cdn.example.com/images/alphabet/limon.png",
            "https://cdn.example.com/images/alphabet/lampa.png",
        ],
    },
    {
        "key": "letter-b",
        "title": "B harfi bilan tanishamiz",
        "description": "B tovushi va so'zlarda qo'llanilishi.",
        "target_letter": "B",
        "target_sound": "b",
        "example_words": ["Bolta", "Bobo", "Baliq"],
        "example_image_urls": [
            "https://cdn.example.com/images/alphabet/bolta.png",
            "https://cdn.example.com/images/alphabet/bobo.png",
            "https://cdn.example.com/images/alphabet/baliq.png",
        ],
    },
]

ALPHABET_PROMPTS = [
    {
        "prompt_type": "evaluation",
        "locale": "uz-Latn",
        "template": (
            "Bola {target_letter} harfini qanday aytganini baholang. Agar talaffuzda xato bo'lsa, "
            "bolaga oddiy so'zlar bilan qayta tushuntiring."
        ),
    },
    {
        "prompt_type": "feedback",
        "locale": "uz-Latn",
        "template": (
            "Bolani rag'batlantiring va to'g'ri talaffuzni 3 ta qisqa jumla bilan misol qilib ko'rsating."
        ),
    },
]

MATH_SKILL = {
    "key": "math-addition-basics",
    "title": "Qo'shish asoslari",
    "description": "Ikki raqamni qo'shishni o'rganamiz.",
    "skill_type": "math",
    "activities": [
        {
            "activity_type": "multiple_choice",
            "instructions": "Rasmga qarab misollarni yech.",
            "xp_reward": 20,
            "content": {
                "problems": [
                    {"id": "p1", "prompt": "2 + 3 = ?", "answer": 5},
                    {"id": "p2", "prompt": "1 + 4 = ?", "answer": 5},
                    {"id": "p3", "prompt": "5 + 3 = ?", "answer": 8},
                ]
            },
        }
    ],
}

ACHIEVEMENTS = [
    {
        "key": "alphabet_master",
        "title": "Alifbo Ustasi",
        "description": "Alifbo bo'limidagi barcha harflarni muvaffaqiyatli o'rganing.",
        "xp_reward": 100,
    },
    {
        "key": "math_explorer",
        "title": "Matematika Tadqiqotchisi",
        "description": "Birinchi matematika chaqiriqlarini bajar!",
        "xp_reward": 70,
    },
]


async def seed_initial_data(session: AsyncSession) -> None:
  logger.info("Seeding baseline learning content...")
  alphabet_path = await _get_or_create_learning_path(session, "alphabet", "Lotin alifbosi")
  alphabet_module = await _get_or_create_module(session, alphabet_path, "alphabet-basics", "Alifbodan boshlaymiz")

  for index, lesson_data in enumerate(ALPHABET_LESSONS):
    lesson = await _get_or_create_lesson(session, alphabet_module, lesson_data, order_index=index)
    await _ensure_prompts(session, lesson, ALPHABET_PROMPTS)

  math_path = await _get_or_create_learning_path(session, "math", "Matematika")
  math_module = await _get_or_create_module(session, math_path, "math-foundations", "Qo'shish va ayirish")
  await _ensure_math_skill(session, math_path, math_module)
  await _ensure_achievements(session)
  logger.info("Seed complete.")


async def _get_or_create_learning_path(session: AsyncSession, key: str, title: str) -> LearningPath:
  result = await session.execute(select(LearningPath).where(LearningPath.key == key))
  learning_path = result.scalar_one_or_none()
  if learning_path:
    return learning_path
  learning_path = LearningPath(key=key, title=title, description=f"{title} uchun tayyorlangan modul.")
  session.add(learning_path)
  await session.flush()
  return learning_path


async def _get_or_create_module(session: AsyncSession, learning_path: LearningPath, key: str, title: str) -> Module:
  result = await session.execute(
      select(Module).where(Module.learning_path_id == learning_path.id, Module.key == key),
  )
  module = result.scalar_one_or_none()
  if module:
    return module
  module = Module(
      learning_path_id=learning_path.id,
      key=key,
      title=title,
      description=f"{title} uchun mashg'ulotlar.",
      order_index=0,
      is_unlocked_by_default=True,
  )
  session.add(module)
  await session.flush()
  return module


async def _get_or_create_lesson(
    session: AsyncSession,
    module: Module,
    payload: dict[str, object],
    *,
    order_index: int,
) -> Lesson:
  key = str(payload["key"])
  result = await session.execute(
      select(Lesson).where(Lesson.module_id == module.id, Lesson.key == key),
  )
  lesson = result.scalar_one_or_none()
  fields = {
      "title": payload.get("title"),
      "description": payload.get("description"),
      "target_letter": payload.get("target_letter"),
      "target_sound": payload.get("target_sound"),
      "example_words": payload.get("example_words"),
      "example_image_urls": payload.get("example_image_urls"),
      "order_index": order_index,
      "media_assets": {"illustrations": payload.get("example_image_urls", [])},
  }
  if lesson:
    for attr, value in fields.items():
      setattr(lesson, attr, value)
    return lesson
  lesson = Lesson(
      module_id=module.id,
      key=key,
      lesson_type="letter_practice",
      xp_reward=10,
      difficulty="beginner",
      **fields,
  )
  session.add(lesson)
  await session.flush()
  return lesson


async def _ensure_prompts(session: AsyncSession, lesson: Lesson, prompts: list[dict[str, str]]) -> None:
  for prompt in prompts:
    result = await session.execute(
        select(LessonPrompt).where(
            LessonPrompt.lesson_id == lesson.id,
            LessonPrompt.prompt_type == prompt["prompt_type"],
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
      existing.template = prompt["template"]
      existing.locale = prompt["locale"]
    else:
      session.add(
          LessonPrompt(
              lesson_id=lesson.id,
              prompt_type=prompt["prompt_type"],
              template=prompt["template"],
              locale=prompt["locale"],
          )
      )


async def _ensure_math_skill(session: AsyncSession, learning_path: LearningPath, module: Module) -> None:
  result = await session.execute(select(Skill).where(Skill.key == MATH_SKILL["key"]))
  skill = result.scalar_one_or_none()
  if skill is None:
    skill = Skill(
        learning_path_id=learning_path.id,
        key=MATH_SKILL["key"],
        title=MATH_SKILL["title"],
        description=MATH_SKILL["description"],
        skill_type=MATH_SKILL["skill_type"],
        order_index=1,
    )
    session.add(skill)
    await session.flush()
  for activity_payload in MATH_SKILL["activities"]:
    result = await session.execute(
        select(SkillActivity).where(
            SkillActivity.skill_id == skill.id,
            SkillActivity.activity_type == activity_payload["activity_type"],
        )
    )
    activity = result.scalar_one_or_none()
    if activity is None:
      activity = SkillActivity(
          skill_id=skill.id,
          activity_type=activity_payload["activity_type"],
          instructions=activity_payload["instructions"],
          xp_reward=activity_payload["xp_reward"],
          content=activity_payload["content"],
      )
      session.add(activity)
    else:
      activity.instructions = activity_payload["instructions"]
      activity.xp_reward = activity_payload["xp_reward"]
      activity.content = activity_payload["content"]


async def _ensure_achievements(session: AsyncSession) -> None:
  for achievement_payload in ACHIEVEMENTS:
    result = await session.execute(
        select(Achievement).where(Achievement.key == achievement_payload["key"]),
    )
    achievement = result.scalar_one_or_none()
    if achievement is None:
      session.add(Achievement(**achievement_payload))


