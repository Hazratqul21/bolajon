from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.core.logging import logger
from app.models import Lesson, User

router = APIRouter()


class RealtimeConversationManager:
    """Real-time AI suhbat sessiyalarini boshqarish"""

    def __init__(self) -> None:
        self.active_connections: dict[UUID, WebSocket] = {}

    async def connect(self, session_id: UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info("WebSocket connected: session_id=%s", session_id)

    def disconnect(self, session_id: UUID) -> None:
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info("WebSocket disconnected: session_id=%s", session_id)

    async def send_message(self, session_id: UUID, message: dict) -> None:
        if session_id in self.active_connections:
            ws = self.active_connections[session_id]
            await ws.send_json(message)


realtime_manager = RealtimeConversationManager()


@router.websocket("/conversation/{session_id}")
async def realtime_conversation(
    websocket: WebSocket,
    session_id: UUID,
    user_id: UUID | None = Query(None),
    lesson_id: UUID | None = Query(None),
) -> None:
    """Real-time AI suhbat - ChatGPT Realtime kabi"""
    await realtime_manager.connect(session_id, websocket)

    try:
        await realtime_manager.send_message(
            session_id,
            {
                "type": "ai_message",
                "text": "Salom! Men sizga harflarni o'rgatishga yordam beraman. Keling, boshlaymiz!",
                "audio_url": None,
            },
        )

        while True:
            data = await websocket.receive_json()

            if data.get("type") == "audio_chunk":
                transcript = data.get("transcript_hint") or ""
                ai_response = {
                    "type": "ai_message",
                    "text": f"Siz '{transcript}' dedingiz. Ajoyib!",
                    "suggested_letter": "A",
                    "example_words": ["Anor", "Olma"],
                    "example_images": [],
                }
                await realtime_manager.send_message(session_id, ai_response)

            elif data.get("type") == "text_message":
                user_text = data.get("text", "")
                ai_response = {
                    "type": "ai_message",
                    "text": f"Sizning xabaringiz: {user_text}. Men sizga yordam beraman!",
                }
                await realtime_manager.send_message(session_id, ai_response)

            elif data.get("type") == "end_session":
                break

    except WebSocketDisconnect:
        realtime_manager.disconnect(session_id)
        logger.info("WebSocket client disconnected: session_id=%s", session_id)


@router.post("/conversation/{session_id}/start")
async def start_realtime_session(
    session_id: UUID,
    user_id: UUID = Query(...),
    lesson_id: UUID | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """Real-time sessiyani boshlash"""
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    lesson = None
    if lesson_id:
        lesson = await session.get(Lesson, lesson_id)

    return {
        "session_id": str(session_id),
        "user_id": str(user_id),
        "lesson_id": str(lesson_id) if lesson_id else None,
        "status": "ready",
        "message": "Real-time sessiya tayyor. WebSocket ga ulaning.",
    }

