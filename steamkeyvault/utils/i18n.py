from __future__ import annotations

from typing import Mapping

SUPPORTED_LOCALES = {"en", "fr"}


def get_request_locale(request, user=None, fallback: str = "en") -> str:
    if user is not None:
        preferred = getattr(user, "preferred_language", None)
        if preferred in SUPPORTED_LOCALES:
            return preferred

    header = request.headers.get("Accept-Language") if request else None
    if not header:
        return fallback

    first = header.split(",", 1)[0].split(";", 1)[0].strip()
    base = first.split("-", 1)[0].lower() if first else ""
    if base in SUPPORTED_LOCALES:
        return base
    return fallback


def translate_message(messages: Mapping[str, Mapping[str, str]], key: str, locale: str, fallback: str = "en") -> str:
    return messages.get(key, {}).get(locale) or messages.get(key, {}).get(fallback) or key


def normalize_locale(value: str | None, fallback: str = "en") -> str:
    """Return *value* if it is a supported locale, otherwise *fallback*."""
    if value in SUPPORTED_LOCALES:
        return value
    return fallback
