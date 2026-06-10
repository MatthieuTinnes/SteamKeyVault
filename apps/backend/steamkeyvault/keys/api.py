import logging
import secrets
from datetime import timedelta
from typing import List, Optional

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Exists, OuterRef
from ninja import Router, Schema
from ninja.security import django_auth
from pydantic import field_validator

from steamkeyvault.games.models import UserGame
from steamkeyvault.utils.mailer import Mailer
from steamkeyvault.utils.i18n import get_request_locale, translate_message, normalize_locale
from steamkeyvault.utils.turnstile import require_turnstile
from steamkeyvault.utils.i18n_messages import KEY_ERROR_MESSAGES
from .models import Key, ShareKeyToken
logger = logging.getLogger(__name__)

router = Router()

SHARE_MESSAGE_SUBJECTS = {
    'en': 'New message about your shared key - SteamKeyVault',
    'fr': 'Nouveau message concernant votre clé partagée - SteamKeyVault',
}



_CURRENT_USE_ALLOWED = {"KEEP", "TRADE", "GIVEAWAY", "SELL", "OTHER"}


class KeyIn(Schema):
    key: str
    user_game_id: int
    current_use: Optional[str] = None

    @field_validator('current_use')
    @classmethod
    def validate_current_use(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in _CURRENT_USE_ALLOWED:
            raise ValueError(f"current_use must be one of {_CURRENT_USE_ALLOWED} or null.")
        return v

class KeyOut(Schema):
    id: int
    key: str
    used: bool
    date_added: str
    date_used: Optional[str] = None
    current_use: Optional[str] = None
    share_in_progress: bool

class KeyUpdateIn(Schema):
    key: Optional[str] = None
    used: Optional[bool] = None
    current_use: Optional[str] = None

    @field_validator('current_use')
    @classmethod
    def validate_current_use(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in _CURRENT_USE_ALLOWED:
            raise ValueError(f"current_use must be one of {_CURRENT_USE_ALLOWED} or null.")
        return v


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
    message_sent: bool


class ShareRevealIn(Schema):
    turnstile_token: str
    message: Optional[str] = None


class ShareRevealOut(Schema):
    key: str
    game_name: str
    donor_username: str


class ShareMessageIn(Schema):
    message: str
    turnstile_token: str


class ShareMessageOut(Schema):
    success: bool


class ShareCancelOut(Schema):
    success: bool
    deleted: int


class DeleteUsedKeysOut(Schema):
    success: bool
    deleted: int


def _fetch_steam_app_preview(steamapp_id: int) -> dict:
    from steamkeyvault.steam.helpers import fetch_steam_app_data
    data = fetch_steam_app_data(steamapp_id)
    publishers = data.get('publishers') or []
    publisher = publishers[0] if publishers else None
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
    now = timezone.now()
    active_share_tokens = ShareKeyToken.objects.filter(
        key_id=OuterRef('pk'),
        revealed_at__isnull=True,
        expires_at__gt=now,
    )
    keys = (
        Key.objects.filter(userGame=user_game)
        .annotate(share_in_progress=Exists(active_share_tokens))
    )
    return [
        KeyOut(
            id=k.id,
            key=k.key,
            used=k.used,
            date_added=k.date_added.isoformat(),
            date_used=k.date_used.isoformat() if k.date_used else None,
            current_use=k.current_use,
            share_in_progress=bool(k.share_in_progress),
        ) for k in keys
    ]

@router.delete('/{user_game_id}/remove/{key_id}', response={200: None, 404: dict}, auth=django_auth)
def remove_key(request, user_game_id: int, key_id: int):
    locale = get_request_locale(request, request.user)
    user_game = get_object_or_404(UserGame, id=user_game_id, user=request.user)
    try:
        key_obj = Key.objects.get(userGame=user_game, id=key_id)
        key_obj.delete()
        return 200, None
    except Key.DoesNotExist:
        return 404, {"error": translate_message(KEY_ERROR_MESSAGES, 'key_not_found', locale)}

@router.delete('/bulk/remove-used', response={200: DeleteUsedKeysOut}, auth=django_auth)
def remove_all_used_keys(request):
    user_games = UserGame.objects.filter(user=request.user)
    deleted, _ = Key.objects.filter(userGame__in=user_games, used=True).delete()
    return 200, DeleteUsedKeysOut(success=True, deleted=deleted)

@router.patch('/{user_game_id}/update/{key_id}', response={200: None, 404: dict, 400: dict}, auth=django_auth)
def update_key(request, user_game_id: int, key_id: int, data: KeyUpdateIn):
    locale = get_request_locale(request, request.user)
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
        return 404, {"error": translate_message(KEY_ERROR_MESSAGES, 'key_not_found', locale)}


@router.post('/share/{key_id}/create', response={200: ShareCreateOut, 400: dict, 404: dict}, auth=django_auth)
def create_share_link(request, key_id: int, payload: ShareCreateIn):
    locale = get_request_locale(request, request.user)
    key_obj = get_object_or_404(Key, id=key_id, userGame__user=request.user)
    if key_obj.used:
        return 400, {"error": translate_message(KEY_ERROR_MESSAGES, 'key_already_used', locale)}
    shared_key = (payload.key or '').strip()
    if not shared_key:
        return 400, {"error": translate_message(KEY_ERROR_MESSAGES, 'key_required', locale)}

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
        return 400, {"error": translate_message(KEY_ERROR_MESSAGES, 'share_create_failed', locale)}

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


@router.delete('/share/{key_id}/cancel', response={200: ShareCancelOut, 404: dict}, auth=django_auth)
def cancel_share_link(request, key_id: int):
    key_obj = get_object_or_404(Key, id=key_id, userGame__user=request.user)
    now = timezone.now()
    deleted, _ = ShareKeyToken.objects.filter(
        key=key_obj,
        revealed_at__isnull=True,
        expires_at__gt=now,
    ).delete()
    return 200, ShareCancelOut(success=deleted > 0, deleted=deleted)


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
        message_sent=bool(share.message_sent_at),
    )


@router.post('/share/{token}/reveal', response={200: ShareRevealOut, 400: dict, 404: dict, 410: dict})
def reveal_share_key(request, token: str, payload: ShareRevealIn):
    locale = get_request_locale(request)
    share = get_object_or_404(ShareKeyToken, token=token)
    now = timezone.now()
    if share.expires_at <= now:
        return 410, {"error": translate_message(KEY_ERROR_MESSAGES, 'share_expired', locale)}
    if share.revealed_at:
        return 410, {"error": translate_message(KEY_ERROR_MESSAGES, 'share_already_used', locale)}
    if share.key.used:
        return 410, {"error": translate_message(KEY_ERROR_MESSAGES, 'key_already_used', locale)}

    if err := require_turnstile(request, payload.turnstile_token, "share_key_reveal", locale, KEY_ERROR_MESSAGES, invalid_key='captcha_failed'):
        return err

    share.revealed_at = now
    game = share.key.userGame
    donor = game.user

    # Optionally send a thank-you message to the donor in the same request
    msg = (payload.message or '').strip()
    if 3 <= len(msg) <= 100 and not share.message_sent_at:
        donor_locale = normalize_locale(getattr(donor, 'preferred_language', None))
        subject = SHARE_MESSAGE_SUBJECTS.get(donor_locale, SHARE_MESSAGE_SUBJECTS['en'])
        sent = Mailer.send_template_email(
            subject=subject,
            template_name='emails/share_key_message.html',
            context={
                'donor_username': donor.username,
                'game_name': game.name,
                'message': msg,
            },
            to_emails=[donor.email],
            locale=donor_locale,
        )
        if sent:
            share.message_sent_at = now
        else:
            logger.error("Failed to send share message email to donor user_id=%s for token=%s", donor.pk, token)

    share.save(update_fields=["revealed_at", "message_sent_at"])
    share.key.used = True
    share.key.save(update_fields=["used", "date_used"])

    return 200, ShareRevealOut(
        key=share.shared_key,
        game_name=share.game_name or game.name,
        donor_username=share.donor_username or donor.username,
    )


@router.post('/share/{token}/message', response={200: ShareMessageOut, 400: dict, 404: dict, 410: dict})
def send_share_message(request, token: str, payload: ShareMessageIn):
    locale = get_request_locale(request)
    share = get_object_or_404(ShareKeyToken, token=token)
    now = timezone.now()
    if share.expires_at <= now:
        return 410, {"error": translate_message(KEY_ERROR_MESSAGES, 'share_expired', locale)}
    if share.message_sent_at:
        return 410, {"error": translate_message(KEY_ERROR_MESSAGES, 'message_already_sent', locale)}

    if err := require_turnstile(request, payload.turnstile_token, "share_key_message", locale, KEY_ERROR_MESSAGES, invalid_key='captcha_failed'):
        return err

    message = (payload.message or '').strip()
    if len(message) < 3:
        return 400, {"error": translate_message(KEY_ERROR_MESSAGES, 'message_too_short', locale)}
    if len(message) > 100:
        return 400, {"error": translate_message(KEY_ERROR_MESSAGES, 'message_too_long', locale)}

    game = share.key.userGame
    donor = game.user
    locale = normalize_locale(getattr(donor, 'preferred_language', None))
    subject = SHARE_MESSAGE_SUBJECTS.get(locale, SHARE_MESSAGE_SUBJECTS['en'])
    sent = Mailer.send_template_email(
        subject=subject,
        template_name='emails/share_key_message.html',
        context={
            'donor_username': donor.username,
            'game_name': game.name,
            'message': message,
        },
        to_emails=[donor.email],
        locale=locale,
    )
    if not sent:
        logger.error("Failed to send share message email to donor user_id=%s for token=%s", donor.pk, token)
        return 400, {"error": translate_message(KEY_ERROR_MESSAGES, 'email_send_failed', locale)}

    share.message_sent_at = timezone.now()
    share.save(update_fields=["message_sent_at"])

    return 200, ShareMessageOut(success=True)
