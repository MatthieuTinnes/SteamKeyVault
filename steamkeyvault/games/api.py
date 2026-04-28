from ninja import Router
from .models import UserGame
from ninja import Schema
from typing import Optional
from ninja.security import django_auth
from django.http import HttpResponse
import csv
import re
from django.utils import timezone
import json
from steamkeyvault.keys.models import Key
from steamkeyvault.utils.i18n import get_request_locale, translate_message
from steamkeyvault.utils.i18n_messages import GAME_ERROR_MESSAGES
from steamkeyvault.utils.request_utils import read_request_file

router = Router()

MAX_IMPORT_GAMES = 2000
MAX_IMPORT_KEYS_PER_GAME = 500


class GameIn(Schema):
    name: str
    steamapp_id: Optional[int] = None
    platform: Optional[str] = None


class GameUpdateIn(Schema):
    name: Optional[str] = None
    steamapp_id: Optional[int] = None
    platform: Optional[str] = None

class GameOut(Schema):
    id: int
    user_game_id: int
    name: str
    steamapp_id: Optional[int] = None
    platform: Optional[str] = None

class GameIdOut(Schema):
    id: int


class SteamKeyVaultKeyIn(Schema):
    key: str
    used: Optional[bool] = False
    current_use: Optional[str] = None


class SteamKeyVaultGameIn(Schema):
    name: str
    steamapp_id: Optional[int] = None
    platform: Optional[str] = None
    keys: Optional[list[SteamKeyVaultKeyIn]] = None


class SteamKeyVaultImportIn(Schema):
    format: str
    version: int
    games: list[SteamKeyVaultGameIn]


def _make_export_filename(user, suffix: str, ext: str) -> str:
    """Build a safe, timestamped export filename based on the user's email."""
    user_email = getattr(user, 'email', None) or 'user'
    safe_email = re.sub(r'[^\w@.\-]', '_', user_email)
    ts = timezone.localtime(timezone.now()).strftime('%Y-%m-%d_%H-%M-%S')
    return f"{safe_email}_{suffix}_{ts}.{ext}"


@router.post('/add', response={201: GameIdOut, 400: dict}, auth=django_auth)
def add_game(request, data: GameIn):
    locale = get_request_locale(request, request.user)
    name = data.name.strip()
    if not name:
        return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'name_required', locale)}
    if data.steamapp_id and UserGame.objects.filter(user=request.user, steamapp_id=data.steamapp_id).exists():
        return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'user_has_game', locale)}

    platform = (data.platform or '').strip()[:100] if not data.steamapp_id else ''
    game = UserGame.objects.create(
        user=request.user,
        name=name,
        steamapp_id=data.steamapp_id,
        platform=platform,
    )
    return 201, {"id": game.id}

@router.get('/list', response=list[GameOut],auth=django_auth)
def list_games(request):
    user_games = UserGame.objects.filter(user=request.user)
    return [
        GameOut(
            id=ug.id,
            user_game_id=ug.id,
            name=ug.name,
            steamapp_id=ug.steamapp_id,
            platform=ug.platform or None,
        )
        for ug in user_games
    ]

@router.delete('/remove/{user_game_id}', response={204: None, 404: dict}, auth=django_auth)
def remove_game(request, user_game_id: int):
    locale = get_request_locale(request, request.user)
    user_game_qs = UserGame.objects.filter(user=request.user, id=user_game_id)
    if not user_game_qs.exists():
        return 404, {"error": translate_message(GAME_ERROR_MESSAGES, 'game_not_found', locale)}
    user_game_qs.delete()
    return 204, None


@router.patch('/{user_game_id}/update', response={200: None, 400: dict, 404: dict}, auth=django_auth)
def update_user_game(request, user_game_id: int, data: GameUpdateIn):
    locale = get_request_locale(request, request.user)
    try:
        ug = UserGame.objects.get(id=user_game_id, user=request.user)
    except UserGame.DoesNotExist:
        return 404, {"error": translate_message(GAME_ERROR_MESSAGES, 'usergame_not_found', locale)}

    if data.steamapp_id is not None:
        # if setting a steamapp_id, ensure user doesn't already have another entry with same steamapp_id
        if UserGame.objects.filter(user=request.user, steamapp_id=data.steamapp_id).exclude(id=ug.id).exists():
            return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'duplicate_steam_app', locale)}
        ug.steamapp_id = data.steamapp_id

    if data.name is not None:
        name = data.name.strip()
        if not name:
            return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'name_empty', locale)}
        ug.name = name

    if data.platform is not None:
        ug.platform = data.platform.strip()[:100]

    # A Steam-linked game cannot have a custom platform
    if ug.steamapp_id:
        ug.platform = ''

    ug.save()
    return 200, None


@router.get('/export_csv', auth=django_auth)
def export_games_csv(request):
    # Build an in-memory CSV of the user's games and keys in format: gameName;key1;key2
    user_games = UserGame.objects.filter(user=request.user).prefetch_related('keys')
    # Create HttpResponse with CSV mimetype
    filename = _make_export_filename(request.user, 'games', 'csv')

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    # Provide a simple header for JS to read the filename directly
    response['X-Filename'] = filename
    # Allow browser JS to read the custom header
    response['Access-Control-Expose-Headers'] = 'X-Filename'

    writer = csv.writer(response, delimiter=';')
    for ug in user_games:
        keys_qs = ug.keys.all()
        row = [ug.name]
        for k in keys_qs:
            row.append(k.key)
        writer.writerow(row)

    return response


@router.get('/export_json', auth=django_auth)
def export_games_json(request):
    user_games = UserGame.objects.filter(user=request.user).prefetch_related('keys')
    payload = {
        "format": "SteamKeyVault",
        "version": 1,
        "games": [],
    }

    for ug in user_games:
        keys_payload = []
        for k in ug.keys.all():
            keys_payload.append({
                "key": k.key,
                "used": k.used,
                "current_use": k.current_use,
            })
        payload["games"].append({
            "name": ug.name,
            "steamapp_id": ug.steamapp_id,
            "platform": ug.platform or None,
            "keys": keys_payload,
        })

    filename = _make_export_filename(request.user, 'steamkeyvault', 'json')

    response = HttpResponse(
        json.dumps(payload),
        content_type='application/json; charset=utf-8'
    )
    response['X-Filename'] = filename
    response['Access-Control-Expose-Headers'] = 'X-Filename'
    return response


@router.post('/import_json', response={200: dict, 400: dict}, auth=django_auth)
def import_games_json(request):
    locale = get_request_locale(request, request.user)
    max_size = 10 * 1024 * 1024
    payload = None

    file_bytes = read_request_file(request, fallback_body=True)

    if not file_bytes:
        return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'no_json_payload', locale)}
    if len(file_bytes) > max_size:
        return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'file_too_large', locale)}

    try:
        raw = json.loads(file_bytes.decode('utf-8'))
        payload = SteamKeyVaultImportIn(**raw)
    except Exception:
        return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'invalid_json_payload', locale)}

    if payload.format != "SteamKeyVault" or payload.version != 1:
        return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'invalid_format_version', locale)}

    if len(payload.games) > MAX_IMPORT_GAMES:
        return 400, {"error": translate_message(GAME_ERROR_MESSAGES, 'import_too_many_games', locale)}

    summary = {
        "games_created": 0,
        "games_existing": 0,
        "keys_created": 0,
        "keys_skipped": 0,
        "errors": [],
    }

    for game in payload.games:
        name = (game.name or '').strip()
        if not name:
            summary["errors"].append({"game": game.name, "error": translate_message(GAME_ERROR_MESSAGES, 'name_required', locale)})
            continue

        platform_value = (game.platform or '').strip()[:100]

        if game.steamapp_id is not None:
            user_game, created = UserGame.objects.get_or_create(
                user=request.user,
                steamapp_id=game.steamapp_id,
                defaults={"name": name},
            )
            if not created and user_game.name != name:
                user_game.name = name
                user_game.save(update_fields=["name"])
        else:
            user_game, created = UserGame.objects.get_or_create(
                user=request.user,
                name=name,
                steamapp_id=None,
                defaults={"platform": platform_value},
            )
            if not created and platform_value and user_game.platform != platform_value:
                user_game.platform = platform_value
                user_game.save(update_fields=["platform"])

        if created:
            summary["games_created"] += 1
        else:
            summary["games_existing"] += 1

        keys_payload = game.keys or []
        if len(keys_payload) > MAX_IMPORT_KEYS_PER_GAME:
            keys_payload = keys_payload[:MAX_IMPORT_KEYS_PER_GAME]
        for k in keys_payload:
            key_value = (k.key or '').strip()
            if not key_value:
                summary["keys_skipped"] += 1
                continue
            if Key.objects.filter(userGame=user_game, key=key_value).exists():
                summary["keys_skipped"] += 1
                continue
            Key.objects.create(
                key=key_value,
                userGame=user_game,
                used=bool(k.used) if k.used is not None else False,
                current_use=k.current_use,
            )
            summary["keys_created"] += 1

    return 200, summary
