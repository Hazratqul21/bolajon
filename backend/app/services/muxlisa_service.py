from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import logger


class MuxlisaClient:
  """Adapter for Muxlisa AI Speech services (STT / TTS)."""

  def __init__(self, base_url: str, api_key: str) -> None:
    self._base_url = base_url.rstrip("/")
    self._api_key = api_key
    self._timeout = httpx.Timeout(30.0)

  def _headers(self, content_type: str = "application/json") -> dict[str, str]:
    headers = {
        "x-api-key": self._api_key,
    }
    if content_type:
      headers["Content-Type"] = content_type
    return headers

  async def transcribe(
      self,
      *,
      audio_file: bytes | None = None,
      audio_url: str | None = None,
      language: str = "uz",
  ) -> dict[str, Any]:
    endpoint = f"{self._base_url}/v2/stt"
    
    try:
      async with httpx.AsyncClient(timeout=self._timeout) as client:
        if audio_file:
          # FormData orqali audio fayl yuborish (to'g'ri format)
          files = {"audio": ("audio.wav", audio_file, "audio/wav")}
          # FormData uchun Content-Type ni o'chirish (httpx o'zi qo'shadi)
          headers = {"x-api-key": self._api_key}
          response = await client.post(
              endpoint,
              files=files,
              headers=headers,
          )
        elif audio_url:
          # Audio URL orqali (agar API qo'llab-quvvatlasa)
          # Eslatma: Yangi API faqat FormData qabul qiladi, shuning uchun audio_url ishlamaydi
          logger.warning("audio_url parameter is not supported by v2 API, use audio_file instead")
          return {"transcript": None, "confidence": None, "duration": None, "error": "audio_url not supported"}
        else:
          raise ValueError("Either audio_file must be provided for transcription.")
        
        response.raise_for_status()
        data = response.json()
        return {
            "transcript": data.get("transcript") or data.get("text") or "",
            "confidence": data.get("confidence"),
            "duration": data.get("duration"),
        }
    except httpx.HTTPError as exc:
      logger.error("Muxlisa transcription failed: %s", exc)
      # Provide a graceful fallback so development can continue offline.
      return {"transcript": None, "confidence": None, "duration": None, "error": str(exc)}

  async def synthesize(self, *, text: str, voice: str = "child_female", language: str = "uz") -> dict[str, Any]:
    endpoint = f"{self._base_url}/v2/tts"
    payload = {"text": text, "voice": voice, "language": language}
    try:
      async with httpx.AsyncClient(timeout=self._timeout) as client:
        response = await client.post(endpoint, json=payload, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return {
            "audio_url": data.get("audio_url"),
            "audio_base64": data.get("audio_base64"),
            "text": data.get("text"),
        }
    except httpx.HTTPError as exc:
      logger.error("Muxlisa synthesis failed: %s", exc)
      return {"audio_url": None, "audio_base64": None, "error": str(exc)}


muxlisa_client = MuxlisaClient(base_url=str(settings.muxlisa_api_url), api_key=settings.muxlisa_api_key)


