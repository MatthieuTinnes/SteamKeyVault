from ninja import Router, Schema
from typing import List, Optional
from .models import Key
from steamkeyvault.games.models import Game, UserGame
from django.shortcuts import get_object_or_404
from ninja.security import django_auth

router = Router()

class KeyIn(Schema):
    key: str
    user_game_id: int
    current_use: Optional[str] = None

class KeyOut(Schema):
    key: str
    used: bool
    date_added: str
    date_used: Optional[str] = None
    current_use: Optional[str] = None

class KeyUpdateIn(Schema):
    key: Optional[str] = None
    used: Optional[bool] = None
    current_use: Optional[str] = None

@router.post('/add', response={200: KeyOut, 400: dict}, auth=django_auth)
def add_key(request, data: KeyIn):
    user_game = get_object_or_404(UserGame, id=data.user_game_id, user=request.user)
    if Key.objects.filter(key=data.key, userGame=user_game).exists():
        return 400, {"error": "Key already exists for this user and game."}
    key_obj = Key.objects.create(
        key=data.key,
        userGame=user_game,
        used=False,
        current_use=data.current_use
    )
    return 200, KeyOut(
        key=key_obj.key,
        used=key_obj.used,
        date_added=key_obj.date_added.isoformat(),
        date_used=key_obj.date_used.isoformat() if key_obj.date_used else None,
        current_use=key_obj.current_use
    )

@router.get('/list/{user_game_id}', response=List[KeyOut], auth=django_auth)
def list_keys(request, user_game_id: int):
    user_game = get_object_or_404(UserGame, id=user_game_id, user=request.user)
    keys = Key.objects.filter(userGame=user_game)
    return [
        KeyOut(
            key=k.key,
            used=k.used,
            date_added=k.date_added.isoformat(),
            date_used=k.date_used.isoformat() if k.date_used else None,
            current_use=k.current_use
        ) for k in keys
    ]

@router.delete('/{user_game_id}/remove/{key}', response={200: dict, 404: dict}, auth=django_auth)
def remove_key(request, user_game_id: int, key: str):
    user_game = get_object_or_404(UserGame, id=user_game_id, user=request.user)
    try:
        key_obj = Key.objects.get(userGame=user_game, key=key)
        key_obj.delete()
        return 200, {"success": True}
    except Key.DoesNotExist:
        return 404, {"error": "Key not found for this user and game."}

@router.put('/{user_game_id}/update/{key}', response={200: KeyOut, 404: dict, 400: dict}, auth=django_auth)
def update_key(request, user_game_id: int, key: str, data: KeyUpdateIn):
    user_game = get_object_or_404(UserGame, id=user_game_id, user=request.user)
    try:
        key_obj = Key.objects.get(userGame=user_game, key=key)
        if data.key is not None and data.key != key:
            if Key.objects.filter(userGame=user_game, key=data.key).exists():
                return 400, {"error": "A key with this value already exists for this user and game."}
            key_obj.key = data.key
        if data.used is not None:
            key_obj.used = data.used
        if data.current_use is not None:
            key_obj.current_use = data.current_use
        key_obj.save()
        return 200, KeyOut(
            key=key_obj.key,
            used=key_obj.used,
            date_added=key_obj.date_added.isoformat(),
            date_used=key_obj.date_used.isoformat() if key_obj.date_used else None,
            current_use=key_obj.current_use
        )
    except Key.DoesNotExist:
        return 404, {"error": "Key not found for this user and game."}
