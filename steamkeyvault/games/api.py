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
    user_game_id: int
    name: str
    steamappid: Optional[int] = None

@router.post('/add', response={201: None, 400: dict}, auth=django_auth)
def add_game(request, data: GameIn):
    if not data.name:
        return 400, {"error": "Name is required."}
    game, _ = Game.objects.get_or_create(name=data.name, defaults={"steamappid": data.steamappid})
    # If the user already has this game, return an error
    if UserGame.objects.filter(user=request.user, game=game).exists():
        return 400, {"error": "User already has this game."}

    UserGame.objects.create(user=request.user, game=game)
    return 201, None

@router.get('/list', response=list[GameOut],auth=django_auth)
def list_games(request):
    user_games = UserGame.objects.filter(user=request.user).select_related('game')
    return [GameOut(id=ug.game.id, user_game_id=ug.id , name=ug.game.name, steamappid=ug.game.steamappid) for ug in user_games]

@router.delete('/remove/{user_game_id}', response={204: None, 404: dict}, auth=django_auth)
def remove_game(request, user_game_id: int):
    user_game_qs = UserGame.objects.filter(user=request.user, user_game_id=user_game_id)
    if not user_game_qs.exists():
        return 404, {"error": "Game not found for this user."}
    user_game_qs.delete()
    return 204, None
