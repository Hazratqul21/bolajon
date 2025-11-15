from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class APIMessage(BaseModel):
  message: str


class UserBase(BaseModel):
  id: UUID
  first_name: str | None = None
  nickname: str | None = None
  age: int | None = None
  role: str
  locale: str
  xp: int
  level: int
  current_streak: int
  longest_streak: int
  avatar_url: str | None = None


class UserCreate(BaseModel):
  first_name: str
  nickname: str | None = None
  age: int | None = None
  locale: str = "uz-Latn"
  guardian_email: str | None = None


class UserProgressEntry(BaseModel):
  learning_path_id: UUID
  module_id: UUID | None
  lesson_id: UUID | None
  status: Literal["locked", "available", "in_progress", "completed"]
  xp_earned: int
  streak_count: int
  last_attempt_at: datetime | None


class LessonPromptSchema(BaseModel):
  id: UUID
  prompt_type: str
  locale: str
  template: str


class LessonSchema(BaseModel):
  id: UUID
  key: str
  title: str
  description: str | None
  lesson_type: str
  target_letter: str | None
  target_sound: str | None
  xp_reward: int
  example_words: list[str] = Field(default_factory=list)
  example_image_urls: list[str] = Field(default_factory=list)
  media_assets: dict[str, Any] = Field(default_factory=dict)
  prompts: list[LessonPromptSchema] = Field(default_factory=list)


class SessionStartRequest(BaseModel):
  user_id: UUID
  learning_path_key: str | None = None
  resume: bool = True


class SessionStartResponse(BaseModel):
  lesson: LessonSchema
  progress: UserProgressEntry
  next_unlocks: list[str] = Field(default_factory=list)


class LessonAttemptRequest(BaseModel):
  user_id: UUID
  audio_url: str | None = None
  audio_base64: str | None = None
  transcript_hint: str | None = None
  force_reprocess: bool = False


class LessonAttemptFeedback(BaseModel):
  transcript: str | None = None
  pronunciation_score: float | None = None
  accuracy_score: float | None = None
  fluency_score: float | None = None
  issues: list[str] = Field(default_factory=list)
  suggested_repetition: bool = False
  encouragement: str | None = None


class LessonAttemptResponse(BaseModel):
  attempt_id: UUID
  lesson_id: UUID
  user_id: UUID
  is_correct: bool
  score: float | None
  feedback: LessonAttemptFeedback
  xp_awarded: int
  leveled_up: bool
  unlocked_lessons: list[str] = Field(default_factory=list)


class LessonAttemptSummary(BaseModel):
  attempt_id: UUID
  lesson_id: UUID
  is_correct: bool
  score: float | None
  created_at: datetime


class ProgressOverview(BaseModel):
  user: UserBase
  total_xp: int
  level: int
  streak_days: int
  unlocked_paths: list[str]
  recent_attempts: list[LessonAttemptSummary] = []
  achievements: list[str]


class ProgressUpdateRequest(BaseModel):
  user_id: UUID
  lesson_id: UUID
  status: Literal["locked", "available", "in_progress", "completed"]


class MathAttemptRequest(BaseModel):
  user_id: UUID
  challenge_id: UUID | None = None
  answers: list[dict[str, Any]]


class MathAttemptResponse(BaseModel):
  correct_count: int
  total_questions: int
  xp_awarded: int
  mistakes: list[str]
  unlocked_lessons: list[str]


class AdminContentPayload(BaseModel):
  learning_path_key: str
  module_key: str
  lessons: list[dict[str, Any]] = Field(default_factory=list)
  overwrite: bool = False


class GamificationSnapshot(BaseModel):
  xp: int
  level: int
  next_level_xp: int
  badges: list[str]
  streak: int

