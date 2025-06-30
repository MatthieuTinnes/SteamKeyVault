from ninja import Router, Schema
from typing import List, Optional
from .models import Key
from steamkeyvault.games.models import Game, UserGame
from django.shortcuts import get_object_or_404
from ninja.security import django_auth
from ninja.errors import ValidationError

router = Router()

class CurrentUseValidatorMixin:
    @classmethod
    def validate_current_use(cls, value):
        allowed = {None, "KEEP", "TRADE", "GIVEAWAY", "SELL", "OTHER"}
        if value.get("current_use") not in allowed:
            raise ValidationError(f"current_use must be one of {allowed - {None}} or null.")
        return value

class KeyIn(Schema, CurrentUseValidatorMixin):
    key: str
    user_game_id: int
    current_use: Optional[str] = None

    @classmethod
    def validate(cls, value):
        return cls.validate_current_use(value)

class KeyOut(Schema):
    id: int
    key: str
    used: bool
    date_added: str
    date_used: Optional[str] = None
    current_use: Optional[str] = None

class KeyUpdateIn(Schema, CurrentUseValidatorMixin):
    key: Optional[str] = None
    used: Optional[bool] = None
    current_use: Optional[str] = None

    @classmethod
    def validate(cls, value):
        return cls.validate_current_use(value)

@router.post('/add', response={200: None, 400: dict}, auth=django_auth)
def add_key(request, data: KeyIn):
    user_game = get_object_or_404(UserGame, id=data.user_game_id, user=request.user)
    key_obj = Key.objects.create(
        key=data.key,
        userGame=user_game,
        used=False,
        current_use=data.current_use
    )
    return 200, None

@router.get('/list/{user_game_id}', response=List[KeyOut], auth=django_auth)
def list_keys(request, user_game_id: int):
    user_game = get_object_or_404(UserGame, id=user_game_id, user=request.user)
    keys = Key.objects.filter(userGame=user_game)
    return [
        KeyOut(
            id=k.id,
            key=k.key,
            used=k.used,
            date_added=k.date_added.isoformat(),
            date_used=k.date_used.isoformat() if k.date_used else None,
            current_use=k.current_use
        ) for k in keys
    ]

@router.delete('/{user_game_id}/remove/{key_id}', response={200: dict, 404: dict}, auth=django_auth)
def remove_key(request, user_game_id: int, key_id: int):
    user_game = get_object_or_404(UserGame, id=user_game_id, user=request.user)
    try:
        key_obj = Key.objects.get(userGame=user_game, id=key_id)
        key_obj.delete()
        return 200, {"success": True}
    except Key.DoesNotExist:
        return 404, {"error": "Key not found for this user and game."}

@router.patch('/{user_game_id}/update/{key_id}', response={200: None, 404: dict, 400: dict}, auth=django_auth)
def update_key(request, user_game_id: int, key_id: int, data: KeyUpdateIn):
    user_game = get_object_or_404(UserGame, id=user_game_id, user=request.user)
    try:
        key_obj = Key.objects.get(userGame=user_game, id=key_id)
        if data.key is not None:
            key_obj.key = data.key
        if data.used is not None:
            key_obj.used = data.used
        if data.current_use is not None:
            key_obj.current_use = data.current_use
        key_obj.save()
        return 200, None
    except Key.DoesNotExist:
        return 404, {"error": "Key not found for this user and game."}
