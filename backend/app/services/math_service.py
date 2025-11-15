from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Skill, SkillActivity, User
from app.schemas import MathAttemptRequest, MathAttemptResponse
from app.services.gamification_service import GamificationEngine, gamification_engine


class MathService:
  def __init__(self, gamification: GamificationEngine) -> None:
    self._gamification = gamification

  async def evaluate_attempt(
      self,
      session: AsyncSession,
      *,
      user_id: UUID,
      skill_key: str,
      request: MathAttemptRequest,
  ) -> MathAttemptResponse:
    user = await session.get(User, user_id)
    if user is None:
      raise ValueError(f"User {user_id} not found.")

    skill = await self._get_skill(session, skill_key)
    activity = await self._get_activity(session, skill, request.challenge_id)
    problems = (activity.content or {}).get("problems", [])
    answers_index = {problem["id"]: problem for problem in problems if "id" in problem}

    mistakes: list[str] = []
    correct_count = 0
    for answer in request.answers:
      problem_id = answer.get("problem_id")
      expected = answers_index.get(problem_id, {}).get("answer")
      if expected is None:
        mistakes.append(f"Topshiriq topilmadi: {problem_id}")
        continue
      if str(expected).strip() == str(answer.get("answer")).strip():
        correct_count += 1
      else:
        mistakes.append(f"'{problem_id}' uchun to'g'ri javob {expected}, sen {answer.get('answer')} deding.")

    total = len(problems)
    accuracy = correct_count / total if total else 0
    xp_awarded = int(activity.xp_reward * accuracy)
    user.xp += xp_awarded
    leveled_up = False
    new_level = self._gamification.calculate_level(user.xp)
    if new_level > user.level:
      user.level = new_level
      leveled_up = True
    session.add(user)

    unlocked_lessons: list[str] = []
    if accuracy >= 0.8:
      unlocked_lessons.append(f"next-{skill.key}")

    return MathAttemptResponse(
        correct_count=correct_count,
        total_questions=total,
        xp_awarded=xp_awarded,
        mistakes=mistakes,
        unlocked_lessons=unlocked_lessons,
    )

  async def _get_skill(self, session: AsyncSession, skill_key: str) -> Skill:
    result = await session.execute(select(Skill).where(Skill.key == skill_key))
    skill = result.scalar_one_or_none()
    if skill is None:
      raise ValueError(f"Skill '{skill_key}' not found.")
    return skill

  async def _get_activity(
      self,
      session: AsyncSession,
      skill: Skill,
      challenge_id: UUID | None,
  ) -> SkillActivity:
    query = select(SkillActivity).where(SkillActivity.skill_id == skill.id).order_by(SkillActivity.created_at)
    result = await session.execute(query)
    activities = result.scalars().all()
    if not activities:
      raise ValueError(f"Skill '{skill.key}' has no activities configured.")
    if challenge_id:
      for activity in activities:
        if activity.id == challenge_id:
          return activity
      raise ValueError(f"Skill activity '{challenge_id}' not found.")
    return activities[0]


math_service = MathService(gamification_engine)

