"""initial schema

Revision ID: 20241112_0001
Revises:
Create Date: 2025-11-12 00:00:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20241112_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

  op.create_table(
      "users",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("email", sa.String(length=320), nullable=True),
      sa.Column("phone", sa.String(length=32), nullable=True),
      sa.Column("first_name", sa.String(length=100), nullable=True),
      sa.Column("last_name", sa.String(length=100), nullable=True),
      sa.Column("nickname", sa.String(length=50), nullable=True),
      sa.Column("age", sa.Integer(), nullable=True),
      sa.Column("locale", sa.String(length=16), nullable=False, server_default="uz-Latn"),
      sa.Column("role", sa.Enum("student", "mentor", "admin", "guardian", name="user_role"), nullable=False, server_default="student"),
      sa.Column("xp", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("level", sa.Integer(), nullable=False, server_default="1"),
      sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("avatar_url", sa.String(length=500), nullable=True),
      sa.Column("preferences", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
      sa.UniqueConstraint("email", name=op.f("uq_users_email")),
      sa.UniqueConstraint("phone", name=op.f("uq_users_phone")),
  )

  op.create_table(
      "achievements",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("key", sa.String(length=64), nullable=False),
      sa.Column("title", sa.String(length=255), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("xp_reward", sa.Integer(), nullable=False, server_default="25"),
      sa.Column("badge_icon", sa.String(length=255), nullable=True),
      sa.Column("conditions", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_achievements")),
      sa.UniqueConstraint("key", name=op.f("uq_achievements_key")),
  )

  op.create_table(
      "learning_paths",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("key", sa.String(length=64), nullable=False),
      sa.Column("title", sa.String(length=255), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("hero_image_url", sa.String(length=500), nullable=True),
      sa.Column("difficulty", sa.String(length=32), nullable=False, server_default="beginner"),
      sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_learning_paths")),
      sa.UniqueConstraint("key", name=op.f("uq_learning_paths_key")),
  )

  op.create_table(
      "modules",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("learning_path_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("key", sa.String(length=64), nullable=False),
      sa.Column("title", sa.String(length=255), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("module_type", sa.Enum("alphabet", "phonics", "math", "logic", name="skill_type"), nullable=False, server_default="alphabet"),
      sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.Column("is_unlocked_by_default", sa.Boolean(), nullable=False, server_default=sa.text("false")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_modules")),
      sa.ForeignKeyConstraint(["learning_path_id"], ["learning_paths.id"], name=op.f("fk_modules_learning_path_id_learning_paths")),
      sa.UniqueConstraint("learning_path_id", "order_index", name=op.f("uq_module_order")),
  )

  op.create_table(
      "skills",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("learning_path_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("key", sa.String(length=64), nullable=False),
      sa.Column("title", sa.String(length=255), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("skill_type", sa.Enum("alphabet", "phonics", "math", "logic", name="skill_type"), nullable=False, server_default="alphabet"),
      sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_skills")),
      sa.ForeignKeyConstraint(["learning_path_id"], ["learning_paths.id"], name=op.f("fk_skills_learning_path_id_learning_paths")),
  )

  op.create_table(
      "lessons",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("module_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("key", sa.String(length=64), nullable=False),
      sa.Column("title", sa.String(length=255), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("lesson_type", sa.Enum("letter_practice", "word_pronunciation", "storytelling", "math_quiz", name="lesson_type"), nullable=False, server_default="letter_practice"),
      sa.Column("target_letter", sa.String(length=4), nullable=True),
      sa.Column("target_sound", sa.String(length=16), nullable=True),
      sa.Column("difficulty", sa.String(length=32), nullable=False, server_default="beginner"),
      sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("xp_reward", sa.Integer(), nullable=False, server_default="10"),
      sa.Column("media_assets", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.Column("example_words", postgresql.ARRAY(sa.String(length=64)), nullable=False, server_default=sa.text("'{}'::text[]")),
      sa.Column("example_image_urls", postgresql.ARRAY(sa.String(length=500)), nullable=False, server_default=sa.text("'{}'::text[]")),
      sa.Column("extra_metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_lessons")),
      sa.ForeignKeyConstraint(["module_id"], ["modules.id"], name=op.f("fk_lessons_module_id_modules"), ondelete="CASCADE"),
      sa.UniqueConstraint("module_id", "order_index", name=op.f("uq_lesson_order")),
  )

  op.create_table(
      "lesson_prompts",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("prompt_type", sa.Enum("system", "evaluation", "feedback", name="prompt_type"), nullable=False, server_default="evaluation"),
      sa.Column("locale", sa.String(length=16), nullable=False, server_default="uz-Latn"),
      sa.Column("template", sa.Text(), nullable=False),
      sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_lesson_prompts")),
      sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], name=op.f("fk_lesson_prompts_lesson_id_lessons"), ondelete="CASCADE"),
  )

  op.create_table(
      "skill_activities",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("skill_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("activity_type", sa.String(length=64), nullable=False),
      sa.Column("instructions", sa.Text(), nullable=False),
      sa.Column("content", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.Column("xp_reward", sa.Integer(), nullable=False, server_default="15"),
      sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_skill_activities")),
      sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], name=op.f("fk_skill_activities_skill_id_skills"), ondelete="CASCADE"),
  )

  op.create_table(
      "lesson_attempts",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("audio_url", sa.String(length=1024), nullable=True),
      sa.Column("transcript", sa.Text(), nullable=True),
      sa.Column("evaluation", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.Column("feedback", sa.Text(), nullable=True),
      sa.Column("ai_model", sa.String(length=100), nullable=True),
      sa.Column("score", sa.Float(), nullable=True),
      sa.Column("is_correct", sa.Boolean(), nullable=False, server_default=sa.text("false")),
      sa.Column("latency_ms", sa.Integer(), nullable=True),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_lesson_attempts")),
      sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], name=op.f("fk_lesson_attempts_lesson_id_lessons"), ondelete="CASCADE"),
      sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_lesson_attempts_user_id_users"), ondelete="CASCADE"),
      sa.UniqueConstraint("user_id", "lesson_id", "created_at", name=op.f("uq_lesson_attempt_per_timestamp")),
  )

  op.create_table(
      "user_progress",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("learning_path_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("module_id", postgresql.UUID(as_uuid=True), nullable=True),
      sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=True),
      sa.Column("status", sa.Enum("locked", "available", "in_progress", "completed", name="progress_status"), nullable=False, server_default="available"),
      sa.Column("xp_earned", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("streak_count", sa.Integer(), nullable=False, server_default="0"),
      sa.Column("last_attempt_at", sa.DateTime(timezone=True), nullable=True),
      sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_user_progress")),
      sa.ForeignKeyConstraint(["learning_path_id"], ["learning_paths.id"], name=op.f("fk_user_progress_learning_path_id_learning_paths"), ondelete="CASCADE"),
      sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], name=op.f("fk_user_progress_lesson_id_lessons"), ondelete="SET NULL"),
      sa.ForeignKeyConstraint(["module_id"], ["modules.id"], name=op.f("fk_user_progress_module_id_modules"), ondelete="SET NULL"),
      sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_user_progress_user_id_users"), ondelete="CASCADE"),
      sa.UniqueConstraint("user_id", "lesson_id", name=op.f("uq_progress_lesson_user")),
  )

  op.create_table(
      "user_achievements",
      sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
      sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("achievement_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("awarded_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
      sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.PrimaryKeyConstraint("id", name=op.f("pk_user_achievements")),
      sa.ForeignKeyConstraint(["achievement_id"], ["achievements.id"], name=op.f("fk_user_achievements_achievement_id_achievements"), ondelete="CASCADE"),
      sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_user_achievements_user_id_users"), ondelete="CASCADE"),
      sa.UniqueConstraint("user_id", "achievement_id", name=op.f("uq_user_achievement_once")),
  )


def downgrade() -> None:
  op.drop_table("user_achievements")
  op.drop_table("user_progress")
  op.drop_table("lesson_attempts")
  op.drop_table("skill_activities")
  op.drop_table("lesson_prompts")
  op.drop_table("lessons")
  op.drop_table("skills")
  op.drop_table("modules")
  op.drop_table("learning_paths")
  op.drop_table("achievements")
  op.drop_table("users")
  op.execute("DROP TYPE IF EXISTS user_role")
  op.execute("DROP TYPE IF EXISTS progress_status")
  op.execute("DROP TYPE IF EXISTS lesson_type")
  op.execute("DROP TYPE IF EXISTS prompt_type")
  op.execute("DROP TYPE IF EXISTS skill_type")


