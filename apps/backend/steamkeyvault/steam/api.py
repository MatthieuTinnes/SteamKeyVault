import logging
from typing import Optional

import requests
from django.http import JsonResponse
from ninja import Router
from ninja.security import django_auth

from .models import SteamApp
from steamkeyvault.utils.i18n import get_request_locale, translate_message
from steamkeyvault.utils.i18n_messages import STEAM_ERROR_MESSAGES

steam_router = Router()

logger = logging.getLogger(__name__)


@steam_router.get("/search/", auth=django_auth)
def search_steam_apps(request, name: str):
    qs = SteamApp.objects.filter(name__istartswith=name).order_by('name')[:50]
    return [{"appid": app.id, "name": app.name} for app in qs]

def _fetch_app_details(appid: int, lang: Optional[str], locale: str) -> JsonResponse | dict:
    """Proxy to Steam Store appdetails API and return the `data` object for the given appid."""
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
    if lang:
        url += f"&l={lang}"

    logger.info("Fetching appdetails for appid=%s from %s", appid, url)
    try:
        resp = requests.get(url, timeout=10)
    except requests.RequestException as exc:
        logger.exception("Error while fetching appdetails for %s: %s", appid, exc)
        return JsonResponse({"error": translate_message(STEAM_ERROR_MESSAGES, 'fetch_failed', locale)}, status=502)

    if resp.status_code != 200:
        logger.error("Steam Store returned non-200 for appid=%s: %d", appid, resp.status_code)
        return JsonResponse({"error": translate_message(STEAM_ERROR_MESSAGES, 'steam_error', locale)}, status=502)

    try:
        payload = resp.json()
    except ValueError:
        logger.error("Invalid JSON returned for appid=%s", appid)
        return JsonResponse({"error": translate_message(STEAM_ERROR_MESSAGES, 'invalid_response', locale)}, status=502)

    app_entry = payload.get(str(appid))
    if not app_entry or not app_entry.get('success'):
        logger.info("No details available for appid=%s", appid)
        return JsonResponse({"error": translate_message(STEAM_ERROR_MESSAGES, 'details_unavailable', locale)}, status=404)

    return app_entry.get('data', {})


@steam_router.get("/appdetails/{appid}/", auth=django_auth)
def get_app_details(request, appid: int, lang: Optional[str] = None):
    """Authenticated proxy to Steam Store appdetails API."""
    locale = get_request_locale(request, request.user)
    return _fetch_app_details(appid, lang, locale)
