from __future__ import annotations

from typing import Any

from openai import AsyncOpenAI, OpenAIError

from app.core.config import settings
from app.core.logging import logger


class OpenAIAdapter:
  """Wrapper over OpenAI responses API to evaluate pronunciation and generate feedback."""

  def __init__(self, api_key: str, model: str) -> None:
    self._model = model
    if api_key:
      self._client = AsyncOpenAI(api_key=api_key)
    else:
      self._client = None

  async def evaluate_pronunciation(
      self,
      *,
      transcript: str | None,
      target_letter: str | None,
      example_words: list[str],
      user_age: int | None,
  ) -> dict[str, Any]:
    if self._client is None:
      logger.warning("OpenAI API key missing; returning heuristic pronunciation feedback.")
      return self._fallback_feedback(transcript=transcript, target_letter=target_letter, example_words=example_words)

    instructions = self._build_prompt(
        transcript=transcript,
        target_letter=target_letter,
        example_words=example_words,
        user_age=user_age,
    )

    try:
      response = await self._client.responses.create(
          model=self._model,
          input=instructions,
          temperature=0.4,
      )
      content = self._extract_text(response)
      if not content:
        return self._fallback_feedback(transcript=transcript, target_letter=target_letter, example_words=example_words)
      feedback = self._parse_feedback(content)
      return feedback
    except OpenAIError as exc:
      logger.error("OpenAI pronunciation evaluation failed: %s", exc)
      return self._fallback_feedback(transcript=transcript, target_letter=target_letter, example_words=example_words)

  @staticmethod
  def _build_prompt(*, transcript: str | None, target_letter: str | None, example_words: list[str], user_age: int | None) -> str:
    words_snippet = ", ".join(example_words[:4])
    return (
        "Siz bolalar uchun talaffuz murabbiyi sifatida ishlaysiz.\n"
        "Berilgan transcriptdan kelib chiqib talaffuzni baholang va 0-1 oralig'ida to'liq son bo'lmagan baho bering.\n"
        "Natija JSON formatida bo'lsin: {\"score\": float, \"issues\": [str], \"encouragement\": str}.\n"
        f"Maqsadli harf: {target_letter or 'noma'lum'}.\n"
        f"Misol so'zlar: {words_snippet or 'yo'q'}.\n"
        f"Bola yoshi: {user_age or 'noma'lum'}.\n"
        f"Bolani talaffuzi: {transcript or 'audio tushunarsiz'}.\n"
    )

  @staticmethod
  def _extract_text(response: Any) -> str | None:
    if getattr(response, "output_text", None):
      return response.output_text
    chunks: list[str] = []
    for output in getattr(response, "output", []):
      for item in getattr(output, "content", []):
        text = getattr(item, "text", None)
        if text:
          chunks.append(text)
    return "\n".join(chunks) if chunks else None

  @staticmethod
  def _parse_feedback(content: str) -> dict[str, Any]:
    try:
      import json

      return json.loads(content)
    except Exception:  # noqa: BLE001
      logger.warning("OpenAI javobi JSON formatida emas, fallback ishlatiladi: %s", content)
      return {"score": None, "issues": ["Javobni tahlil qilib bo'lmadi"], "encouragement": content}

  @staticmethod
  def _fallback_feedback(*, transcript: str | None, target_letter: str | None, example_words: list[str]) -> dict[str, Any]:
    if not transcript:
      return {
          "score": 0.0,
          "issues": ["Ovoz aniqlanmadi. Keling, yana birga aytamiz!"],
          "encouragement": "Chunkini qayta aytib ko'r!",
      }
    lowered = transcript.lower()
    target = (target_letter or "").lower()
    issues: list[str] = []
    score = 0.6
    if target and target not in lowered:
      issues.append(f"'{target}' tovushi aniq eshitilmadi.")
      score = 0.3
    elif any(word.lower() in lowered for word in example_words):
      score = 0.9
    return {
        "score": score,
        "issues": issues,
        "encouragement": "Zo'r ishlading! Keling, rasmga qarab yana takrorlaymiz.",
    }


openai_adapter = OpenAIAdapter(api_key=settings.openai_api_key, model=settings.openai_model)

