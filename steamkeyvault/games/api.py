from ninja import Router
from .models import UserGame
from ninja import Schema
from typing import Optional
from ninja.security import django_auth
from django.http import HttpResponse
import csv
import re
from django.utils import timezone

router = Router()

class GameIn(Schema):
    name: str
    steamapp_id: Optional[int] = None

class GameOut(Schema):
    id: int
    user_game_id: int
    name: str
    steamapp_id: Optional[int] = None

@router.post('/add', response={201: None, 400: dict}, auth=django_auth)
def add_game(request, data: GameIn):
    name = data.name.strip()
    if not name:
        return 400, {"error": "Name is required."}
    if data.steamapp_id and UserGame.objects.filter(user=request.user, steamapp_id=data.steamapp_id).exists():
        return 400, {"error": "User already has this game."}

    UserGame.objects.create(
        user=request.user,
        name=name,
        steamapp_id=data.steamapp_id,
    )
    return 201, None

@router.get('/list', response=list[GameOut],auth=django_auth)
def list_games(request):
    user_games = UserGame.objects.filter(user=request.user)
    return [
        GameOut(
            id=ug.id,
            user_game_id=ug.id,
            name=ug.name,
            steamapp_id=ug.steamapp_id,
        )
        for ug in user_games
    ]

@router.delete('/remove/{user_game_id}', response={204: None, 404: dict}, auth=django_auth)
def remove_game(request, user_game_id: int):
    user_game_qs = UserGame.objects.filter(user=request.user, id=user_game_id)
    if not user_game_qs.exists():
        return 404, {"error": "Game not found for this user."}
    user_game_qs.delete()
    return 204, None


@router.get('/export_csv', auth=django_auth)
def export_games_csv(request):
    # Build an in-memory CSV of the user's games and keys in format: gameName;key1;key2
    user_games = UserGame.objects.filter(user=request.user).prefetch_related('keys')
    # Create HttpResponse with CSV mimetype
    # Build a safe filename using user's email if available and append timestamp
    user_email = getattr(request.user, 'email', None) or 'user'
    # sanitize: keep letters, numbers, @, dot, dash and replace others with underscore
    safe_email = re.sub(r'[^\w@.\-]', '_', user_email)
    ts = timezone.localtime(timezone.now()).strftime('%Y-%m-%d_%H-%M-%S')
    filename = f"{safe_email}_games_{ts}.csv"

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
