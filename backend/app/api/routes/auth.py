from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.models import User
from app.schemas import APIMessage, UserBase, UserCreate

router = APIRouter()


class GuardianRegisterRequest(BaseModel):
    email: str
    phone: str | None = None
    first_name: str
    last_name: str | None = None
    password: str | None = None  # Keyinchalik hash qilinadi


class GuardianRegisterResponse(BaseModel):
    guardian_id: UUID
    message: str


class ChildOnboardingRequest(BaseModel):
    first_name: str
    nickname: str | None = None
    age: int
    guardian_id: UUID
    preferences: dict[str, Any] | None = None  # Qiziqishlar, sevimli qahramon va h.k.


class ChildOnboardingResponse(BaseModel):
    child_id: UUID
    message: str


@router.post("/guardian/register", status_code=status.HTTP_201_CREATED)
async def register_guardian(
    request: GuardianRegisterRequest,
    session: AsyncSession = Depends(get_db_session),
) -> GuardianRegisterResponse:
    """Ota-ona ro'yxatdan o'tish"""
    existing = await session.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email allaqachon ro'yxatdan o'tgan.",
        )

    guardian = User(
        email=request.email,
        phone=request.phone,
        first_name=request.first_name,
        last_name=request.last_name,
        role="guardian",
        locale="uz-Latn",
    )
    session.add(guardian)
    await session.flush()
    await session.commit()

    return GuardianRegisterResponse(guardian_id=guardian.id, message="Guardian muvaffaqiyatli ro'yxatdan o'tdi.")


@router.post("/child/onboard", status_code=status.HTTP_201_CREATED)
async def onboard_child(
    request: ChildOnboardingRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ChildOnboardingResponse:
    """Bola onboarding - ism, yosh, qiziqishlar"""
    guardian = await session.get(User, request.guardian_id)
    if not guardian or guardian.role != "guardian":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guardian topilmadi.",
        )

    child = User(
        first_name=request.first_name,
        nickname=request.nickname or request.first_name,
        age=request.age,
        role="student",
        locale="uz-Latn",
        preferences=request.preferences or {},
    )
    session.add(child)
    await session.flush()
    await session.commit()

    return ChildOnboardingResponse(child_id=child.id, message="Bola muvaffaqiyatli qo'shildi.")


@router.get("/guardian/{guardian_id}/children", status_code=status.HTTP_200_OK)
async def list_guardian_children(
    guardian_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[UserBase]:
    """Guardian bolalarini ro'yxatini olish"""
    guardian = await session.get(User, guardian_id)
    if not guardian or guardian.role != "guardian":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian topilmadi.")

    # Hozircha barcha studentlarni qaytaramiz, keyinchalik guardian_id relationship qo'shamiz
    result = await session.execute(select(User).where(User.role == "student"))
    children = result.scalars().all()
    return [UserBase.model_validate(child) for child in children]

