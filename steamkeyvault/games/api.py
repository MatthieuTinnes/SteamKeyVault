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
    steamapp_id: Optional[int] = None

class GameOut(Schema):
    id: int
    user_game_id: int
    name: str
    steamapp_id: Optional[int] = None

@router.post('/add', response={201: None, 400: dict}, auth=django_auth)
def add_game(request, data: GameIn):
    if not data.name:
        return 400, {"error": "Name is required."}
    # If a steamapp_id is provided, ensure uniqueness is checked by steamapp_id only
    if data.steamapp_id:
        # try to find existing Game by steamapp_id
        game = Game.objects.filter(steamapp_id=data.steamapp_id).first()
        if game:
            # If the user already has this game (by steamapp_id), return an error
            if UserGame.objects.filter(user=request.user, game=game).exists():
                return 400, {"error": "User already has this game."}
        else:
            # create the Game with steamapp_id
            game = Game.objects.create(name=data.name, steamapp_id=data.steamapp_id)
    else:
        # No steamapp_id provided: create or reuse by name but DO NOT enforce uniqueness on user's collection
        game, _ = Game.objects.get_or_create(name=data.name, defaults={"steamapp_id": None})

    UserGame.objects.create(user=request.user, game=game)
    return 201, None

@router.get('/list', response=list[GameOut],auth=django_auth)
def list_games(request):
    user_games = UserGame.objects.filter(user=request.user).select_related('game')
    return [GameOut(id=ug.game.id, user_game_id=ug.id , name=ug.game.name, steamapp_id=ug.game.steamapp_id) for ug in user_games]

@router.delete('/remove/{user_game_id}', response={204: None, 404: dict}, auth=django_auth)
def remove_game(request, user_game_id: int):
    user_game_qs = UserGame.objects.filter(user=request.user, user_game_id=user_game_id)
    if not user_game_qs.exists():
        return 404, {"error": "Game not found for this user."}
    user_game_qs.delete()
    return 204, None
