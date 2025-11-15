from fastapi import APIRouter

router = APIRouter()


@router.get("/ping", summary="Service healthcheck")
async def ping() -> dict[str, str]:
  return {"status": "ok"}

