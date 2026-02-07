"""Admin API endpoints for user and system management."""
from ninja import Router, Schema
from ninja.security import django_auth
from django.http import JsonResponse
from django.db.models import Count
from django.contrib.auth import get_user_model
import logging

from users.admin_decorators import admin_required
from steamkeyvault.games.models import UserGame
from steamkeyvault.keys.models import Key

logger = logging.getLogger(__name__)
User = get_user_model()

admin_router = Router()


class AdminUserSchema(Schema):
    id: int
    username: str
    email: str
    email_verified: bool
    is_admin: bool
    date_joined: str
    games_count: int
    keys_count: int


class UpdateUserEmailSchema(Schema):
    email: str


class UpdateUserPasswordSchema(Schema):
    password: str


class UpdateUserAdminSchema(Schema):
    is_admin: bool


@admin_router.get('/users', auth=django_auth)
@admin_required
def list_users(request):
    """List all users with their statistics."""
    logger.info(f"Admin {request.user.email} listing all users")
    
    users = User.objects.all().order_by('-date_joined')
    
    result = []
    for user in users:
        games_count = UserGame.objects.filter(user=user).count()
        keys_count = Key.objects.filter(userGame__user=user).count()
        
        result.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'email_verified': user.email_verified,
            'is_admin': user.is_admin,
            'date_joined': user.date_joined.isoformat(),
            'games_count': games_count,
            'keys_count': keys_count,
        })
    
    return {'users': result, 'total': len(result)}


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
    
    if len(payload.password) < 6:
        return JsonResponse({'error': 'Password must be at least 6 characters'}, status=400)
    
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
