import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def validate_turnstile(turnstile_token: str, remote_ip: str | None, expected_action: str | None = None) -> bool:
    """Verify a Cloudflare Turnstile token against the siteverify API.

    Returns True if the token is valid (or if Turnstile is not configured,
    in which case the check is skipped with a warning).
    """
    secret = getattr(settings, 'TURNSTILE_SECRET_KEY', '')
    verify_url = getattr(settings, 'TURNSTILE_VERIFY_URL', '')
    if not secret or not verify_url:
        logger.warning("Turnstile secret or verify URL not configured – skipping captcha check")
        return True
    payload = {'secret': secret, 'response': turnstile_token}
    if remote_ip:
        payload['remoteip'] = remote_ip
    try:
        resp = requests.post(verify_url, data=payload, timeout=5)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.exception("Turnstile verification request failed: %s", exc)
        return False
    if not data.get('success'):
        logger.info("Turnstile verification rejected: %s", data)
        return False
    if expected_action:
        action = data.get('action')
        if action != expected_action:
            logger.warning("Turnstile action mismatch: expected '%s', got '%s'", expected_action, action)
            return False
    return True


def require_turnstile(
    request,
    token: str | None,
    action: str,
    locale: str,
    error_messages,
    missing_key: str = 'captcha_required',
    invalid_key: str = 'captcha_invalid',
):
    """Gate a view on a valid Turnstile token.

    Returns None if the check passes (or Turnstile is not configured).
    Returns a 400 JsonResponse if the token is missing or invalid.
    Callers: ``if err := require_turnstile(...): return err``
    """
    from django.http import JsonResponse
    from steamkeyvault.utils.i18n import translate_message
    if not getattr(settings, 'TURNSTILE_SECRET_KEY', None):
        return None
    if not token:
        return JsonResponse({"error": translate_message(error_messages, missing_key, locale)}, status=400)
    if not validate_turnstile(token, request.META.get("REMOTE_ADDR"), expected_action=action):
        return JsonResponse({"error": translate_message(error_messages, invalid_key, locale)}, status=400)
    return None
