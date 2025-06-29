from ninja import Router
from .models import Game, UserGame
from django.contrib.auth import get_user_model
from ninja import Schema
from typing import Optional
from django.shortcuts import get_object_or_404
from ninja.security import django_auth

router = Router()

class GameIn(Schema):
    name: str
    steamappid: Optional[int] = None

class GameOut(Schema):
    id: int
    name: str
    steamappid: Optional[int] = None

@router.post('/add', response={200: GameOut, 400: dict}, auth=django_auth)
def add_game(request, data: GameIn):
    if not data.name:
        return 400, {"error": "Name is required."}
    game, _ = Game.objects.get_or_create(name=data.name, defaults={"steamappid": data.steamappid})
    UserGame.objects.get_or_create(user=request.user, game=game)
    return 200, GameOut(id=game.id, name=game.name, steamappid=game.steamappid)

@router.get('/list', response=list[GameOut])
def list_games(request):
    user_games = UserGame.objects.filter(user=request.user).select_related('game')
    return [GameOut(id=ug.game.id, name=ug.game.name, steamappid=ug.game.steamappid) for ug in user_games]

@router.delete('/remove/{user_game_id}', response={200: dict, 404: dict}, auth=django_auth)
def remove_game(request, user_game_id: int):
    user_game_qs = UserGame.objects.filter(user=request.user, user_game_id=user_game_id)
    if not user_game_qs.exists():
        return 404, {"error": "Game not found for this user."}
    user_game_qs.delete()
    return 200, {"success": True}
