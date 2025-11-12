from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_math_service
from app.schemas import MathAttemptRequest, MathAttemptResponse
from app.services.math_service import MathService

router = APIRouter()


@router.post("/{skill_key}/attempt", response_model=MathAttemptResponse)
async def attempt_math_challenge(
    skill_key: str,
    payload: MathAttemptRequest,
    session: AsyncSession = Depends(get_db_session),
    math_service: MathService = Depends(get_math_service),
) -> MathAttemptResponse:
  try:
    return await math_service.evaluate_attempt(
        session=session,
        user_id=payload.user_id,
        skill_key=skill_key,
        request=payload,
    )
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


