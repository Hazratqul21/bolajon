from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

UserRole = Enum("student", "mentor", "admin", "guardian", name="user_role")
ProgressStatus = Enum("locked", "available", "in_progress", "completed", name="progress_status")
LessonType = Enum("letter_practice", "word_pronunciation", "storytelling", "math_quiz", name="lesson_type")
PromptType = Enum("system", "evaluation", "feedback", name="prompt_type")
SkillType = Enum("alphabet", "phonics", "math", "logic", name="skill_type")


class User(TimestampMixin, Base):
  __tablename__ = "users"

  email: Mapped[str | None] = mapped_column(String(320), unique=True)
  phone: Mapped[str | None] = mapped_column(String(32), unique=True)
  first_name: Mapped[str | None] = mapped_column(String(100))
  last_name: Mapped[str | None] = mapped_column(String(100))
  nickname: Mapped[str | None] = mapped_column(String(50))
  age: Mapped[int | None] = mapped_column(Integer)
  locale: Mapped[str] = mapped_column(String(16), default="uz-Latn")
  role: Mapped[str] = mapped_column(UserRole, default="student")

  xp: Mapped[int] = mapped_column(Integer, default=0)
  level: Mapped[int] = mapped_column(Integer, default=1)
  current_streak: Mapped[int] = mapped_column(Integer, default=0)
  longest_streak: Mapped[int] = mapped_column(Integer, default=0)
  avatar_url: Mapped[str | None] = mapped_column(String(500))
  preferences: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

  progress_entries: Mapped[list["UserProgress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
  attempts: Mapped[list["LessonAttempt"]] = relationship(back_populates="user", cascade="all, delete-orphan")
  achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class LearningPath(TimestampMixin, Base):
  __tablename__ = "learning_paths"

  key: Mapped[str] = mapped_column(String(64), unique=True)
  title: Mapped[str] = mapped_column(String(255))
  description: Mapped[str | None] = mapped_column(Text)
  hero_image_url: Mapped[str | None] = mapped_column(String(500))
  difficulty: Mapped[str] = mapped_column(String(32), default="beginner")
  order_index: Mapped[int] = mapped_column(Integer, default=0)
  is_active: Mapped[bool] = mapped_column(Boolean, default=True)
  skills: Mapped[list["Skill"]] = relationship(back_populates="learning_path", cascade="all, delete-orphan")
  modules: Mapped[list["Module"]] = relationship(back_populates="learning_path", cascade="all, delete-orphan")


class Module(TimestampMixin, Base):
  __tablename__ = "modules"
  __table_args__ = (UniqueConstraint("learning_path_id", "order_index", name="uq_module_order"),)

  learning_path_id: Mapped[UUID] = mapped_column(ForeignKey("learning_paths.id", ondelete="CASCADE"))
  key: Mapped[str] = mapped_column(String(64))
  title: Mapped[str] = mapped_column(String(255))
  description: Mapped[str | None] = mapped_column(Text)
  module_type: Mapped[str] = mapped_column(SkillType, default="alphabet")
  order_index: Mapped[int] = mapped_column(Integer, default=0)
  meta_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, name="metadata")
  is_unlocked_by_default: Mapped[bool] = mapped_column(Boolean, default=False)

  learning_path: Mapped["LearningPath"] = relationship(back_populates="modules")
  lessons: Mapped[list["Lesson"]] = relationship(back_populates="module", cascade="all, delete-orphan")
  progresses: Mapped[list["UserProgress"]] = relationship(back_populates="module")


class Lesson(TimestampMixin, Base):
  __tablename__ = "lessons"
  __table_args__ = (UniqueConstraint("module_id", "order_index", name="uq_lesson_order"),)

  module_id: Mapped[UUID] = mapped_column(ForeignKey("modules.id", ondelete="CASCADE"))
  key: Mapped[str] = mapped_column(String(64))
  title: Mapped[str] = mapped_column(String(255))
  description: Mapped[str | None] = mapped_column(Text)
  lesson_type: Mapped[str] = mapped_column(LessonType, default="letter_practice")
  target_letter: Mapped[str | None] = mapped_column(String(4))
  target_sound: Mapped[str | None] = mapped_column(String(16))
  difficulty: Mapped[str] = mapped_column(String(32), default="beginner")
  order_index: Mapped[int] = mapped_column(Integer, default=0)
  xp_reward: Mapped[int] = mapped_column(Integer, default=10)
  media_assets: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
  example_words: Mapped[list[str]] = mapped_column(ARRAY(String(64)), default=list)
  example_image_urls: Mapped[list[str]] = mapped_column(ARRAY(String(500)), default=list)
  extra_metadata: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

  module: Mapped["Module"] = relationship(back_populates="lessons")
  prompts: Mapped[list["LessonPrompt"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
  attempts: Mapped[list["LessonAttempt"]] = relationship(back_populates="lesson")
  progresses: Mapped[list["UserProgress"]] = relationship(back_populates="lesson")


class LessonPrompt(TimestampMixin, Base):
  __tablename__ = "lesson_prompts"

  lesson_id: Mapped[UUID] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
  prompt_type: Mapped[str] = mapped_column(PromptType, default="evaluation")
  locale: Mapped[str] = mapped_column(String(16), default="uz-Latn")
  template: Mapped[str] = mapped_column(Text)
  meta_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, name="metadata")

  lesson: Mapped["Lesson"] = relationship(back_populates="prompts")


class Skill(TimestampMixin, Base):
  __tablename__ = "skills"

  learning_path_id: Mapped[UUID] = mapped_column(ForeignKey("learning_paths.id", ondelete="CASCADE"))
  key: Mapped[str] = mapped_column(String(64))
  title: Mapped[str] = mapped_column(String(255))
  description: Mapped[str | None] = mapped_column(Text)
  skill_type: Mapped[str] = mapped_column(SkillType, default="alphabet")
  order_index: Mapped[int] = mapped_column(Integer, default=0)

  learning_path: Mapped["LearningPath"] = relationship(back_populates="skills")
  activities: Mapped[list["SkillActivity"]] = relationship(back_populates="skill", cascade="all, delete-orphan")


class SkillActivity(TimestampMixin, Base):
  __tablename__ = "skill_activities"

  skill_id: Mapped[UUID] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
  activity_type: Mapped[str] = mapped_column(String(64))
  instructions: Mapped[str] = mapped_column(Text)
  content: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
  xp_reward: Mapped[int] = mapped_column(Integer, default=15)
  meta_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, name="metadata")

  skill: Mapped["Skill"] = relationship(back_populates="activities")


class LessonAttempt(TimestampMixin, Base):
  __tablename__ = "lesson_attempts"
  __table_args__ = (UniqueConstraint("user_id", "lesson_id", "created_at", name="uq_lesson_attempt_per_timestamp"),)

  user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
  lesson_id: Mapped[UUID] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
  audio_url: Mapped[str | None] = mapped_column(String(1024))
  transcript: Mapped[str | None] = mapped_column(Text)
  evaluation: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
  feedback: Mapped[str | None] = mapped_column(Text)
  ai_model: Mapped[str | None] = mapped_column(String(100))
  score: Mapped[float | None] = mapped_column(Float)
  is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
  latency_ms: Mapped[int | None] = mapped_column(Integer)

  user: Mapped["User"] = relationship(back_populates="attempts")
  lesson: Mapped["Lesson"] = relationship(back_populates="attempts")


class UserProgress(TimestampMixin, Base):
  __tablename__ = "user_progress"
  __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_progress_lesson_user"),)

  user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
  learning_path_id: Mapped[UUID] = mapped_column(ForeignKey("learning_paths.id", ondelete="CASCADE"))
  module_id: Mapped[UUID | None] = mapped_column(ForeignKey("modules.id", ondelete="SET NULL"))
  lesson_id: Mapped[UUID | None] = mapped_column(ForeignKey("lessons.id", ondelete="SET NULL"))
  status: Mapped[str] = mapped_column(ProgressStatus, default="available")
  xp_earned: Mapped[int] = mapped_column(Integer, default=0)
  streak_count: Mapped[int] = mapped_column(Integer, default=0)
  last_attempt_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
  meta_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, name="metadata")

  user: Mapped["User"] = relationship(back_populates="progress_entries")
  learning_path: Mapped["LearningPath"] = relationship()
  module: Mapped["Module"] = relationship(back_populates="progresses")
  lesson: Mapped["Lesson"] = relationship(back_populates="progresses")


class Achievement(TimestampMixin, Base):
  __tablename__ = "achievements"

  key: Mapped[str] = mapped_column(String(64), unique=True)
  title: Mapped[str] = mapped_column(String(255))
  description: Mapped[str | None] = mapped_column(Text)
  xp_reward: Mapped[int] = mapped_column(Integer, default=25)
  badge_icon: Mapped[str | None] = mapped_column(String(255))
  conditions: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

  user_achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="achievement", cascade="all, delete-orphan")


class UserAchievement(TimestampMixin, Base):
  __tablename__ = "user_achievements"
  __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement_once"),)

  user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
  achievement_id: Mapped[UUID] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"))
  awarded_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
  meta_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, name="metadata")

  user: Mapped["User"] = relationship(back_populates="achievements")
  achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")


__all__ = [
    "Achievement",
    "Lesson",
    "LessonAttempt",
    "LessonPrompt",
    "LearningPath",
    "Module",
    "Skill",
    "SkillActivity",
    "User",
    "UserAchievement",
    "UserProgress",
    "LessonType",
    "PromptType",
    "ProgressStatus",
    "SkillType",
]

