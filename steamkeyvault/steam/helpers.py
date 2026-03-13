"""Helper functions for Steam API operations."""
import logging
import requests
from django.http import JsonResponse
from .models import SteamApp
from steamkeyvault.utils.i18n import translate_message
from steamkeyvault.utils.i18n_messages import STEAM_ERROR_MESSAGES

logger = logging.getLogger(__name__)


def fetch_steam_app_data(appid: int) -> dict:
    """Fetch the ``data`` dict for a single app from the Steam Store appdetails API.

    Returns the parsed data dict on success, or an empty dict on any failure.
    """
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        payload = resp.json()
    except Exception as exc:
        logger.warning("Failed to fetch Steam app data for appid=%s: %s", appid, exc)
        return {}
    app_entry = payload.get(str(appid))
    if not app_entry or not app_entry.get('success'):
        return {}
    return app_entry.get('data', {})


def fetch_and_store_steam_apps(locale: str = 'en'):
    """Fetch Steam apps from Steam API and store/update them in the database.

    Returns:
        dict: Dictionary with 'stored' count on success
        JsonResponse: Error response on failure
    """
    from django.conf import settings
    api_key = getattr(settings, "STEAM_API_KEY", None)
    if not api_key:
        logger.error("STEAM_API_KEY not set in Django settings")
        return JsonResponse({"error": translate_message(STEAM_ERROR_MESSAGES, 'missing_api_key', locale)}, status=500)

    url = "https://api.steampowered.com/IStoreService/GetAppList/v1/"
    logger.info("Fetching Steam apps from %s", url)

    total_stored = 0
    last_appid = 0
    max_results = 25000
    more_results = True

    while more_results:
        request_params = {
            "include_games": True,
            "include_dlc": False,
            "include_software": False,
            "include_videos": False,
            "include_hardware": False,
            "last_appid": last_appid,
            "max_results": max_results
        }
        headers = {
            "x-webapi-key": api_key
        }

        try:
            resp = requests.get(url, params=request_params, headers=headers, timeout=30)
        except requests.RequestException as e:
            logger.error("Request failed: %s", e)
            return JsonResponse({"error": translate_message(STEAM_ERROR_MESSAGES, 'connect_failed', locale)}, status=502)

        if resp.status_code != 200:
            logger.error("Failed to fetch from Steam API, status code: %d, response: %s", resp.status_code, resp.text)
            return JsonResponse({"error": f"{translate_message(STEAM_ERROR_MESSAGES, 'fetch_failed_status', locale)}: {resp.status_code}"}, status=502)

        try:
            data = resp.json()
        except ValueError:
            logger.error("Invalid JSON response from Steam API")
            return JsonResponse({"error": translate_message(STEAM_ERROR_MESSAGES, 'invalid_json', locale)}, status=502)

        response_data = data.get("response", {})
        apps = response_data.get("apps", [])
        
        if not apps:
            logger.info("No more apps returned from Steam API")
            break

        # Process apps
        app_dict = {app["appid"]: app["name"] for app in apps if app.get("appid") and app.get("name")}
        app_ids = list(app_dict.keys())

        existing_ids = set(SteamApp.objects.filter(id__in=app_ids).values_list("id", flat=True))
        
        new_apps = [SteamApp(id=appid, name=name) for appid, name in app_dict.items() if appid not in existing_ids]
        update_apps = [SteamApp(id=appid, name=name) for appid, name in app_dict.items() if appid in existing_ids]

        if new_apps:
            SteamApp.objects.bulk_create(new_apps, batch_size=1000, ignore_conflicts=True)
            logger.info("Created %d new SteamApp entries", len(new_apps))

        if update_apps:
            SteamApp.objects.bulk_update(update_apps, ["name"], batch_size=1000)
            logger.info("Updated %d existing SteamApp entries", len(update_apps))

        total_stored += len(app_dict)
        
        last_appid = response_data.get("last_appid", 0)
        
        more_results = response_data.get("have_more_results", False)
        
        logger.info("Fetched %d apps from Steam API (last_appid=%d)", len(apps), last_appid)

    logger.info("Steam app import completed. Total stored: %d", total_stored)
    return {"stored": total_stored}
