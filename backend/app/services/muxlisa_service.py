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

  def _headers(self) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {self._api_key}",
        "Content-Type": "application/json",
    }

  async def transcribe(
      self,
      *,
      audio_url: str | None = None,
      audio_base64: str | None = None,
      language: str = "uz",
  ) -> dict[str, Any]:
    payload: dict[str, Any] = {"language": language}
    if audio_url:
      payload["audio_url"] = audio_url
    elif audio_base64:
      payload["audio_base64"] = audio_base64
    else:
      raise ValueError("Either audio_url or audio_base64 must be provided for transcription.")

    endpoint = f"{self._base_url}/v1/stt/transcribe"
    try:
      async with httpx.AsyncClient(timeout=self._timeout) as client:
        response = await client.post(endpoint, json=payload, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return {
            "transcript": data.get("transcript"),
            "confidence": data.get("confidence"),
            "duration": data.get("duration"),
        }
    except httpx.HTTPError as exc:
      logger.error("Muxlisa transcription failed: %s", exc)
      # Provide a graceful fallback so development can continue offline.
      return {"transcript": None, "confidence": None, "duration": None, "error": str(exc)}

  async def synthesize(self, *, text: str, voice: str = "child_female") -> dict[str, Any]:
    endpoint = f"{self._base_url}/v1/tts/synthesize"
    payload = {"text": text, "voice": voice}
    try:
      async with httpx.AsyncClient(timeout=self._timeout) as client:
        response = await client.post(endpoint, json=payload, headers=self._headers())
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as exc:
      logger.error("Muxlisa synthesis failed: %s", exc)
      return {"audio_url": None, "error": str(exc)}


muxlisa_client = MuxlisaClient(base_url=str(settings.muxlisa_api_url), api_key=settings.muxlisa_api_key)


