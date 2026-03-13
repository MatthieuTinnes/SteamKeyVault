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
