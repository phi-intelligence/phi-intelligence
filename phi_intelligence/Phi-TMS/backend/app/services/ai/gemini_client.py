"""Gemini API client.

Wraps `google.generativeai` into a small, async-first helper the rest of the
TMS uses. The previous implementation tried to call
`generate_content_async` on a `ChatSession` returned by `start_chat()` —
that method only exists on the `GenerativeModel`, so every LLM call crashed
with::

    'ChatSession' object has no attribute 'generate_content_async'

This version uses the `system_instruction` parameter that the SDK supports
natively (>=0.7), so we keep a single `GenerativeModel` per system prompt and
call `generate_content_async` on it directly.
"""
from __future__ import annotations

import logging
import os
from typing import Dict, Optional

from google.generativeai import GenerativeModel
import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

# Cache one model per (model_name, system_instruction) so we don't rebuild it
# on every request.
_model_cache: Dict[str, GenerativeModel] = {}
_configured = False


def _resolve_api_key() -> str:
    """Accept both GEMINI_API_KEY and GOOGLE_API_KEY (the website uses the latter)."""
    key = (
        getattr(settings, "GEMINI_API_KEY", None)
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or ""
    )
    return key.strip()


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return
    key = _resolve_api_key()
    if not key:
        raise ValueError(
            "Gemini API key is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY in the TMS .env."
        )
    genai.configure(api_key=key)
    _configured = True


def _default_model_name() -> str:
    # Current stable fast tier. "gemini-1.5-flash" was retired and now
    # returns 404 from v1beta; use 2.5 by default. Override via GEMINI_MODEL.
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def get_model(system_prompt: Optional[str] = None, model_name: Optional[str] = None) -> GenerativeModel:
    """Return a cached GenerativeModel configured with the given system prompt."""
    _ensure_configured()
    name = model_name or _default_model_name()
    cache_key = f"{name}||{system_prompt or ''}"
    model = _model_cache.get(cache_key)
    if model is None:
        kwargs = {"model_name": name}
        if system_prompt:
            kwargs["system_instruction"] = system_prompt
        model = GenerativeModel(**kwargs)
        _model_cache[cache_key] = model
    return model


async def ask_gemini(
    prompt: str,
    system_prompt: Optional[str] = None,
    *,
    json_mode: bool = False,
    model_name: Optional[str] = None,
) -> str:
    """Send a prompt to Gemini and return the text response.

    - `system_prompt` becomes the model's system instruction.
    - `json_mode` asks the model to return `application/json` directly, which
      removes the need for most of our fence-stripping fallbacks.
    """
    try:
        model = get_model(system_prompt=system_prompt, model_name=model_name)
        generation_config = None
        if json_mode:
            generation_config = {"response_mime_type": "application/json"}
        response = await model.generate_content_async(
            prompt,
            generation_config=generation_config,
        )
        text = getattr(response, "text", None)
        if not text:
            # Fallback for some edge SDK responses where candidates are returned but .text is empty.
            candidates = getattr(response, "candidates", None) or []
            if candidates and candidates[0].content and candidates[0].content.parts:
                text = "".join(getattr(part, "text", "") for part in candidates[0].content.parts)
        return text or ""
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        raise


def is_configured() -> bool:
    """Cheap runtime check for whether Gemini can be used."""
    return bool(_resolve_api_key())
