import logging
import secrets
from datetime import timedelta
from typing import List, Optional

import requests
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import ValidationError
from ninja.security import django_auth

from steamkeyvault.games.models import UserGame
from steamkeyvault.utils.mailer import Mailer
from .models import Key, ShareKeyToken
logger = logging.getLogger(__name__)

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


class ShareCreateIn(Schema):
    key: str


class ShareCreateOut(Schema):
    share_url: str
    token: str
    expires_at: str


class ShareInfoOut(Schema):
    token: str
    game_name: str
    steamapp_id: Optional[int] = None
    publisher: Optional[str] = None
    header_image: Optional[str] = None
    background_image: Optional[str] = None
    donor_username: str
    expires_at: str
    revealed: bool
    expired: bool
    used: bool


class ShareRevealIn(Schema):
    turnstile_token: str


class ShareRevealOut(Schema):
    key: str
    game_name: str
    donor_username: str


class ShareMessageIn(Schema):
    message: str


class ShareMessageOut(Schema):
    success: bool


def _validate_turnstile(turnstile_token: str, remote_ip: Optional[str], expected_action: Optional[str] = None) -> bool:
    secret = getattr(settings, 'TURNSTILE_SECRET_KEY', '')
    verify_url = getattr(settings, 'TURNSTILE_VERIFY_URL', '')
    if not secret or not verify_url:
        logger.error("Turnstile secret or verify URL not configured")
        return False
    payload = {
        'secret': secret,
        'response': turnstile_token,
    }
    if remote_ip:
        payload['remoteip'] = remote_ip
    try:
        resp = requests.post(verify_url, data=payload, timeout=5)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.exception("Turnstile verification failed: %s", exc)
        return False
    if not data.get('success'):
        logger.info("Turnstile verification rejected: %s", data)
        return False
    
    if expected_action:
        action = data.get('action')
        if action != expected_action:
            logger.warning("Turnstile action mismatch: expected '%s', got '%s'", expected_action, action)
            return False
            
    return True


def _fetch_steam_app_preview(steamapp_id: int) -> dict:
    url = f"https://store.steampowered.com/api/appdetails?appids={steamapp_id}"
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        payload = resp.json()
    except Exception as exc:
        logger.warning("Failed to fetch Steam app preview for appid=%s: %s", steamapp_id, exc)
        return {}

    app_entry = payload.get(str(steamapp_id))
    if not app_entry or not app_entry.get('success'):
        return {}

    data = app_entry.get('data', {})
    publisher = None
    publishers = data.get('publishers') or []
    if publishers:
        publisher = publishers[0]
    return {
        'publisher': publisher,
        'header_image': data.get('header_image'),
        'background_image': data.get('background'),
    }

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


@router.post('/share/{key_id}/create', response={200: ShareCreateOut, 400: dict, 404: dict}, auth=django_auth)
def create_share_link(request, key_id: int, payload: ShareCreateIn):
    key_obj = get_object_or_404(Key, id=key_id, userGame__user=request.user)
    if key_obj.used:
        return 400, {"error": "Key is already used."}
    shared_key = (payload.key or '').strip()
    if not shared_key:
        return 400, {"error": "Key is required to create a share link."}

    now = timezone.now()
    game = key_obj.userGame
    share_fields = {
        'game_name': game.name,
        'steamapp_id': game.steamapp_id,
        'donor_username': game.user.username,
        'publisher': None,
        'header_image': None,
        'background_image': None,
    }
    if game.steamapp_id:
        share_fields.update(_fetch_steam_app_preview(game.steamapp_id))
    existing = ShareKeyToken.objects.filter(
        key=key_obj,
        revealed_at__isnull=True,
        expires_at__gt=now,
    ).order_by('-created_at').first()

    if existing:
        if existing.shared_key != shared_key:
            existing.shared_key = shared_key
        for field_name, field_value in share_fields.items():
            if getattr(existing, field_name) != field_value:
                setattr(existing, field_name, field_value)
        existing.save(update_fields=["shared_key", *share_fields.keys()])
        share_url = f"{settings.FRONTEND_URL}/share/{existing.token}"
        return 200, ShareCreateOut(
            share_url=share_url,
            token=existing.token,
            expires_at=existing.expires_at.isoformat(),
        )

    expires_at = now + timedelta(days=7)
    token = None
    for _ in range(5):
        candidate = secrets.token_urlsafe(32)
        if not ShareKeyToken.objects.filter(token=candidate).exists():
            token = candidate
            break
    if not token:
        logger.error("Failed to generate unique share token for key_id=%s", key_id)
        return 400, {"error": "Unable to create share link. Please try again."}

    ShareKeyToken.objects.create(
        key=key_obj,
        token=token,
        shared_key=shared_key,
        game_name=share_fields['game_name'],
        steamapp_id=share_fields['steamapp_id'],
        donor_username=share_fields['donor_username'],
        publisher=share_fields['publisher'],
        header_image=share_fields['header_image'],
        background_image=share_fields['background_image'],
        expires_at=expires_at,
    )

    share_url = f"{settings.FRONTEND_URL}/share/{token}"
    return 200, ShareCreateOut(
        share_url=share_url,
        token=token,
        expires_at=expires_at.isoformat(),
    )


@router.get('/share/{token}', response={200: ShareInfoOut, 404: dict})
def get_share_info(request, token: str):
    share = get_object_or_404(ShareKeyToken, token=token)
    now = timezone.now()
    expired = share.expires_at <= now
    return 200, ShareInfoOut(
        token=share.token,
        game_name=share.game_name or '',
        steamapp_id=share.steamapp_id,
        publisher=share.publisher,
        header_image=share.header_image,
        background_image=share.background_image,
        donor_username=share.donor_username or 'User',
        expires_at=share.expires_at.isoformat(),
        revealed=bool(share.revealed_at),
        expired=expired,
        used=share.key.used,
    )


@router.post('/share/{token}/reveal', response={200: ShareRevealOut, 400: dict, 404: dict, 410: dict})
def reveal_share_key(request, token: str, payload: ShareRevealIn):
    share = get_object_or_404(ShareKeyToken, token=token)
    now = timezone.now()
    if share.expires_at <= now:
        return 410, {"error": "Share link has expired."}
    if share.revealed_at:
        return 410, {"error": "Share link has already been used."}
    if share.key.used:
        return 410, {"error": "Key has already been used."}

    if not payload.turnstile_token:
        return 400, {"error": "Captcha token is required."}
    if not _validate_turnstile(payload.turnstile_token, request.META.get("REMOTE_ADDR"), expected_action="share_key_page"):
        return 400, {"error": "Captcha validation failed."}

    share.revealed_at = now
    share.save(update_fields=["revealed_at"])
    share.key.used = True
    share.key.save(update_fields=["used", "date_used"])

    game = share.key.userGame
    donor = game.user
    return 200, ShareRevealOut(
        key=share.shared_key,
        game_name=share.game_name or game.name,
        donor_username=share.donor_username or donor.username,
    )


@router.post('/share/{token}/message', response={200: ShareMessageOut, 400: dict, 404: dict, 410: dict})
def send_share_message(request, token: str, payload: ShareMessageIn):
    share = get_object_or_404(ShareKeyToken, token=token)
    now = timezone.now()
    if share.expires_at <= now:
        return 410, {"error": "Share link has expired."}

    message = (payload.message or '').strip()
    if len(message) < 3:
        return 400, {"error": "Message is too short."}
    if len(message) > 2000:
        return 400, {"error": "Message is too long."}

    game = share.key.userGame
    donor = game.user
    subject = 'New message about your shared key - SteamKeyVault'
    sent = Mailer.send_template_email(
        subject=subject,
        template_name='emails/share_key_message.html',
        context={
            'donor_username': donor.username,
            'game_name': game.name,
            'message': message,
        },
        to_emails=[donor.email],
    )
    if not sent:
        return 400, {"error": "Failed to send email."}

    return 200, ShareMessageOut(success=True)
