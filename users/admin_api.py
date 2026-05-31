"""Admin API endpoints for user and system management."""
from ninja import Router, Schema
from ninja.security import django_auth
from django.http import JsonResponse
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
import logging
import os

from users.admin_decorators import admin_required
from users.models import UserActionLog
from users.api import validate_password_strength
from steamkeyvault.games.models import UserGame
from steamkeyvault.keys.models import Key

logger = logging.getLogger(__name__)
User = get_user_model()

admin_router = Router()


def _parse_iso_datetime(value: str | None):
    if not value:
        return None
    try:
        if value.endswith('Z'):
            value = value.replace('Z', '+00:00')
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    if timezone.is_naive(parsed):
        return timezone.make_aware(parsed, timezone.get_current_timezone())
    return parsed


def _resolve_period(start: str | None, end: str | None, period_hours: int) -> tuple[datetime | None, datetime | None, str | None]:
    start_dt = _parse_iso_datetime(start)
    end_dt = _parse_iso_datetime(end)
    if start and not start_dt:
        return None, None, 'Invalid start datetime'
    if end and not end_dt:
        return None, None, 'Invalid end datetime'
    now = timezone.now()
    period = period_hours if period_hours and period_hours > 0 else 24
    if not end_dt:
        end_dt = now
    if not start_dt:
        start_dt = end_dt - timedelta(hours=period)
    if start_dt > end_dt:
        return None, None, 'Start datetime must be before end datetime'
    return start_dt, end_dt, None


class UpdateUserEmailSchema(Schema):
    email: str


class UpdateUserPasswordSchema(Schema):
    password: str


class UpdateUserAdminSchema(Schema):
    is_admin: bool


@admin_router.get('/users', auth=django_auth)
@admin_required
def list_users(request, limit: int = 25, offset: int = 0, search: str | None = None, sort_by: str = 'date_joined', sort_order: str = 'desc'):
    """List all users with their statistics, with pagination and optional search."""
    logger.info(f"Admin {request.user.email} listing all users (limit={limit}, offset={offset})")

    limit = min(max(limit, 1), 200)
    offset = max(offset, 0)

    allowed_sort_fields = {'id', 'username', 'email', 'email_verified', 'is_admin', 'date_joined', 'last_login', 'games_count', 'keys_count'}
    if sort_by not in allowed_sort_fields:
        sort_by = 'date_joined'
    if sort_order not in ('asc', 'desc'):
        sort_order = 'desc'

    users_qs = User.objects.all()

    if search:
        users_qs = users_qs.filter(
            Q(username__icontains=search) | Q(email__icontains=search)
        )

    users_qs = users_qs.annotate(
        games_count=Count('user_games', distinct=True),
        keys_count=Count('user_games__keys', distinct=True),
    )
    total = users_qs.count()
    order_field = sort_by if sort_order == 'asc' else f'-{sort_by}'
    users_page = users_qs.order_by(order_field)[offset:offset + limit]

    result = []
    for user in users_page:
        result.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'email_verified': user.email_verified,
            'is_admin': user.is_admin,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'games_count': user.games_count,
            'keys_count': user.keys_count,
        })

    return {'users': result, 'total': total}


@admin_router.get('/users/{user_id}', auth=django_auth)
@admin_required
def get_user_details(request, user_id: int):
    """Get detailed information about a specific user."""
    logger.info(f"Admin {request.user.email} getting details for user {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    games_count = UserGame.objects.filter(user=user).count()
    keys_count = Key.objects.filter(userGame__user=user).count()
    
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'email_verified': user.email_verified,
        'is_admin': user.is_admin,
        'date_joined': user.date_joined.isoformat(),
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'games_count': games_count,
        'keys_count': keys_count,
    }


@admin_router.put('/users/{user_id}/email', auth=django_auth)
@admin_required
def update_user_email(request, user_id: int, payload: UpdateUserEmailSchema):
    """Update a user's email address (admin only)."""
    logger.info(f"Admin {request.user.email} updating email for user {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    # Check if email already exists
    if User.objects.filter(email=payload.email).exclude(id=user_id).exists():
        return JsonResponse({'error': 'Email already in use'}, status=400)
    
    user.email = payload.email
    user.email_verified = False  # Reset verification when admin changes email
    user.save(update_fields=['email', 'email_verified'])
    
    logger.info(f"Admin {request.user.email} updated email for user {user_id} to {payload.email}")
    return {'success': True, 'message': 'Email updated successfully'}


@admin_router.put('/users/{user_id}/password', auth=django_auth)
@admin_required
def update_user_password(request, user_id: int, payload: UpdateUserPasswordSchema):
    """Update a user's password (admin only)."""
    logger.info(f"Admin {request.user.email} updating password for user {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    is_valid, _ = validate_password_strength(payload.password)
    if not is_valid:
        return JsonResponse({'error': 'Password does not meet security requirements (min 12 chars, uppercase, lowercase, digit, special character)'}, status=400)
    
    user.set_password(payload.password)
    user.save()
    
    logger.info(f"Admin {request.user.email} updated password for user {user_id}")
    return {'success': True, 'message': 'Password updated successfully'}


@admin_router.put('/users/{user_id}/admin', auth=django_auth)
@admin_required
def update_user_admin_status(request, user_id: int, payload: UpdateUserAdminSchema):
    """Toggle admin status for a user."""
    logger.info(f"Admin {request.user.email} updating admin status for user {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    # Prevent self-demotion
    if user.id == request.user.id and not payload.is_admin:
        return JsonResponse({'error': 'Cannot remove your own admin privileges'}, status=400)
    
    user.is_admin = payload.is_admin
    user.save(update_fields=['is_admin'])
    
    logger.info(f"Admin {request.user.email} set admin={payload.is_admin} for user {user_id}")
    return {'success': True, 'message': f"User {'promoted to' if payload.is_admin else 'demoted from'} admin"}


@admin_router.delete('/users/{user_id}', auth=django_auth)
@admin_required
def delete_user(request, user_id: int):
    """Delete a user account (admin only)."""
    logger.info(f"Admin {request.user.email} attempting to delete user {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    # Prevent self-deletion
    if user.id == request.user.id:
        return JsonResponse({'error': 'Cannot delete your own account'}, status=400)
    
    username = user.username
    user.delete()
    
    logger.info(f"Admin {request.user.email} deleted user {user_id} ({username})")
    return {'success': True, 'message': f'User {username} deleted successfully'}


@admin_router.delete('/users/{user_id}/games-keys', auth=django_auth)
@admin_required
def delete_user_games_and_keys(request, user_id: int):
    """Delete all games and keys for a specific user (admin only)."""
    logger.info(f"Admin {request.user.email} deleting games/keys for user {user_id}")

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    keys_count = Key.objects.filter(userGame__user=user).count()
    games_qs = UserGame.objects.filter(user=user)
    games_count = games_qs.count()

    games_qs.delete()

    logger.info(
        f"Admin {request.user.email} deleted {games_count} games and {keys_count} keys for user {user_id}"
    )
    return {
        'success': True,
        'message': 'User games and keys deleted successfully',
        'deleted_games': games_count,
        'deleted_keys': keys_count,
    }


@admin_router.get('/stats', auth=django_auth)
@admin_required
def get_admin_stats(request):
    """Get overall system statistics."""
    logger.info(f"Admin {request.user.email} requesting system stats")
    
    total_users = User.objects.count()
    total_games = UserGame.objects.count()
    total_keys = Key.objects.count()
    verified_users = User.objects.filter(email_verified=True).count()
    admin_users = User.objects.filter(is_admin=True).count()
    
    return {
        'total_users': total_users,
        'verified_users': verified_users,
        'admin_users': admin_users,
        'total_games': total_games,
        'total_keys': total_keys,
    }


@admin_router.get('/version', auth=django_auth)
@admin_required
def get_version_info(request):
    """Get backend version information (commit hash and deploy date)."""
    return {
        'commit_hash': os.environ.get('COMMIT_HASH', ''),
        'deploy_date': os.environ.get('DEPLOY_DATE', ''),
    }


@admin_router.get('/action-logs', auth=django_auth)
@admin_required
def list_action_logs(
    request,
    start: str | None = None,
    end: str | None = None,
    period_hours: int = 24,
    action_type: str | None = None,
    user_query: str | None = None,
    limit: int = 200,
    offset: int = 0,
):
    """List user action logs in a given time range (admin only)."""
    logger.info(f"Admin {request.user.email} listing action logs")

    start_dt, end_dt, error = _resolve_period(start, end, period_hours)
    if error:
        return JsonResponse({'error': error}, status=400)

    limit = min(max(limit, 1), 1000)
    offset = max(offset, 0)

    logs_qs = UserActionLog.objects.select_related('user').filter(
        created_at__gte=start_dt,
        created_at__lte=end_dt,
    )

    if action_type:
        logs_qs = logs_qs.filter(action_type=action_type)

    if user_query:
        logs_qs = logs_qs.filter(
            Q(user__email__icontains=user_query) | Q(user__username__icontains=user_query)
        )

    total = logs_qs.count()
    logs = logs_qs.order_by('-created_at')[offset:offset + limit]

    results = []
    for log in logs:
        results.append({
            'id': log.id,
            'user_id': log.user_id,
            'username': log.user.username,
            'email': log.user.email,
            'action_type': log.action_type,
            'created_at': log.created_at.isoformat(),
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'metadata': log.metadata,
        })

    return {
        'logs': results,
        'total': total,
        'start': start_dt.isoformat(),
        'end': end_dt.isoformat(),
    }


@admin_router.get('/action-logs/stats', auth=django_auth)
@admin_required
def get_action_log_stats(
    request,
    start: str | None = None,
    end: str | None = None,
    period_hours: int = 24,
):
    """Get action log statistics for a given time range (admin only)."""
    logger.info(f"Admin {request.user.email} requesting action log stats")

    start_dt, end_dt, error = _resolve_period(start, end, period_hours)
    if error:
        return JsonResponse({'error': error}, status=400)

    logs_qs = UserActionLog.objects.filter(
        created_at__gte=start_dt,
        created_at__lte=end_dt,
    )

    total_actions = logs_qs.count()
    unique_users = logs_qs.values('user_id').distinct().count()
    action_counts = {
        item['action_type']: item['count']
        for item in logs_qs.values('action_type').annotate(count=Count('id'))
    }

    return {
        'total_actions': total_actions,
        'logins': action_counts.get(UserActionLog.ACTION_LOGIN, 0),
        'registrations': action_counts.get(UserActionLog.ACTION_REGISTER, 0),
        'password_changes': action_counts.get(UserActionLog.ACTION_PASSWORD_CHANGE, 0),
        'email_changes': action_counts.get(UserActionLog.ACTION_EMAIL_CHANGE, 0),
        'unique_users': unique_users,
        'start': start_dt.isoformat(),
        'end': end_dt.isoformat(),
    }
