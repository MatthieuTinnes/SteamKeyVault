from ninja import Router
from django.http import JsonResponse
import requests
from .models import SteamApp
import logging
from ninja.security import django_auth
from typing import Optional

steam_router = Router()

logger = logging.getLogger(__name__)

@steam_router.get("/search/", auth=django_auth)
def search_steam_apps(request, name: str):
    qs = SteamApp.objects.filter(name__istartswith=name).order_by('name')[:50]
    return [{"appid": app.id, "name": app.name} for app in qs]

@steam_router.get("/appdetails/{appid}/", auth=django_auth)
def get_app_details(request, appid: int, lang: Optional[str] = None):
    """Proxy to Steam Store appdetails API and return the `data` object for the given appid.

    Query params:
    - lang: optional language code passed to Steam Store (e.g., 'en', 'fr'). If omitted the store defaults are used.
    """
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
    if lang:
        url += f"&l={lang}"

    logger.info("Fetching appdetails for appid=%s from %s", appid, url)
    try:
        resp = requests.get(url, timeout=10)
    except requests.RequestException as exc:
        logger.exception("Error while fetching appdetails for %s: %s", appid, exc)
        return JsonResponse({"error": "Failed to fetch app details from Steam"}, status=502)

    if resp.status_code != 200:
        logger.error("Steam Store returned non-200 for appid=%s: %d", appid, resp.status_code)
        return JsonResponse({"error": "Steam Store returned error"}, status=502)

    try:
        payload = resp.json()
    except ValueError:
        logger.error("Invalid JSON returned for appid=%s", appid)
        return JsonResponse({"error": "Invalid response from Steam Store"}, status=502)

    app_entry = payload.get(str(appid))
    if not app_entry or not app_entry.get('success'):
        logger.info("No details available for appid=%s", appid)
        return JsonResponse({"error": "App details not available"}, status=404)

    # Return only the 'data' object to the client
    return app_entry.get('data', {})
