from ninja import Router
from django.http import JsonResponse
import requests
from .models import SteamApp
import logging

steam_router = Router()

logger = logging.getLogger(__name__)

@steam_router.get("/fetch-steam-apps/")
def fetch_and_store_steam_apps(request):
    url = "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
    logger.info("Fetching Steam apps from %s", url)
    resp = requests.get(url)
    if resp.status_code != 200:
        logger.error("Failed to fetch from Steam API, status code: %d", resp.status_code)
        return JsonResponse({"error": "Failed to fetch from Steam API"}, status=500)
    data = resp.json()
    apps = data.get("applist", {}).get("apps", [])
    logger.info("Fetched %d apps from Steam API", len(apps))

    chunk_size = 10000
    total_stored = 0

    for i in range(0, len(apps), chunk_size):
        chunk = apps[i:i+chunk_size]
        app_dict = {app["appid"]: app["name"] for app in chunk if app.get("appid") and app.get("name")}
        app_ids = list(app_dict.keys())

        existing_ids = set(SteamApp.objects.filter(id__in=app_ids).values_list("id", flat=True))
        logger.info("Chunk %d-%d: Found %d existing apps in database", i, i+len(chunk)-1, len(existing_ids))

        new_apps = [SteamApp(id=appid, name=name) for appid, name in app_dict.items() if appid not in existing_ids]
        update_apps = [SteamApp(id=appid, name=name) for appid, name in app_dict.items() if appid in existing_ids]

        if new_apps:
            SteamApp.objects.bulk_create(new_apps, ignore_conflicts=True)
            logger.info("Chunk %d-%d: Created %d new SteamApp entries", i, i+len(chunk)-1, len(new_apps))

        if update_apps:
            SteamApp.objects.bulk_update(update_apps, ["name"])
            logger.info("Chunk %d-%d: Updated %d existing SteamApp entries", i, i+len(chunk)-1, len(update_apps))

        total_stored += len(app_dict)

    logger.info("Steam app import completed. Total stored: %d", total_stored)
    return {"stored": total_stored}
