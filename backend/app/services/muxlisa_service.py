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
          files = {"audio": ("audio.wav", audio_file, "audio/wav")}
          headers = {"x-api-key": self._api_key}
          logger.info("Muxlisa STT Request: audio_size=%s bytes", len(audio_file))
          response = await client.post(
              endpoint,
              files=files,
              headers=headers,
          )
          logger.info("Muxlisa STT Response: status=%s", response.status_code)
        elif audio_url:
          logger.warning("audio_url parameter is not supported by v2 API, use audio_file instead")
          return {"transcript": None, "confidence": None, "duration": None, "error": "audio_url not supported"}
        else:
          raise ValueError("Either audio_file must be provided for transcription.")
        
        response.raise_for_status()
        data = response.json()
        logger.info("Muxlisa STT Response Data: %s", data)
        
        transcript = data.get("transcript") or data.get("text") or data.get("result") or data.get("data", {}).get("transcript") or data.get("data", {}).get("text") or ""
        confidence = data.get("confidence") or data.get("score") or data.get("data", {}).get("confidence")
        duration = data.get("duration") or data.get("data", {}).get("duration")
        
        logger.info("Muxlisa STT Result: transcript=%s, confidence=%s, duration=%s", transcript, confidence, duration)
        
        return {
            "transcript": transcript,
            "confidence": confidence,
            "duration": duration,
        }
    except httpx.HTTPError as exc:
      logger.error("Muxlisa transcription failed: %s", exc)
      return {"transcript": None, "confidence": None, "duration": None, "error": str(exc)}
    except Exception as exc:
      logger.error("Muxlisa transcription unexpected error: %s", exc)
      return {"transcript": None, "confidence": None, "duration": None, "error": str(exc)}

  async def synthesize(self, *, text: str, voice: str = "maftuna", language: str = "uz") -> dict[str, Any]:
    endpoint = f"{self._base_url}/v2/tts"
    payload = {"text": text, "voice": voice, "language": language}
    try:
      logger.info("Muxlisa TTS Request: text=%s, voice=%s, language=%s", text, voice, language)
      async with httpx.AsyncClient(timeout=self._timeout) as client:
        response = await client.post(endpoint, json=payload, headers=self._headers())
        logger.info("Muxlisa TTS Response: status=%s", response.status_code)
        
        content_type = response.headers.get("content-type", "")
        if "audio" in content_type:
          logger.info("Muxlisa TTS: Audio file response detected")
          import base64
          audio_bytes = response.content
          audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
          return {
              "audio_base64": audio_base64,
              "text": text,
          }
        
        response.raise_for_status()
        data = response.json()
        logger.info("Muxlisa TTS Response Data: %s", data)
        
        audio_url = data.get("audio_url") or data.get("url") or data.get("result", {}).get("audio_url") or data.get("data", {}).get("audio_url")
        audio_base64 = data.get("audio_base64") or data.get("audio") or data.get("result", {}).get("audio_base64") or data.get("data", {}).get("audio_base64")
        
        return {
            "audio_url": audio_url,
            "audio_base64": audio_base64,
            "text": data.get("text") or text,
        }
    except httpx.HTTPError as exc:
      logger.error("Muxlisa synthesis failed: %s", exc)
      return {"audio_url": None, "audio_base64": None, "error": str(exc)}
    except Exception as exc:
      logger.error("Muxlisa synthesis unexpected error: %s", exc)
      return {"audio_url": None, "audio_base64": None, "error": str(exc)}


muxlisa_client = MuxlisaClient(base_url=str(settings.muxlisa_api_url), api_key=settings.muxlisa_api_key)

