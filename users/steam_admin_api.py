"""Admin API for Steam synchronization tasks."""
from ninja import Router
from ninja.security import django_auth
from django.http import JsonResponse
import logging

from users.admin_decorators import admin_required
from steamkeyvault.utils.i18n import get_request_locale

logger = logging.getLogger(__name__)

steam_admin_router = Router()


@steam_admin_router.post('/refresh-steam-apps', auth=django_auth)
@admin_required
def refresh_steam_apps(request):
    """Refresh Steam apps database from Steam API (admin only)."""
    logger.info(f"Admin {request.user.email} triggered Steam apps refresh")
    
    from steamkeyvault.steam.helpers import fetch_and_store_steam_apps
    
    try:
        # Call the helper function
        locale = get_request_locale(request, request.user)
        result = fetch_and_store_steam_apps(locale=locale)
        
        # Check if result is a JsonResponse (error case)
        if isinstance(result, JsonResponse):
            return result
        
        # Result is a dict with 'stored' count
        return {
            'success': True,
            'message': f'Successfully refreshed {result["stored"]} Steam apps',
            'total_apps': result['stored']
        }
        
    except Exception as e:
        logger.exception(f"Error refreshing Steam apps: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@steam_admin_router.get('/steam-stats', auth=django_auth)
@admin_required
def get_steam_stats(request):
    """Get Steam database statistics (admin only)."""
    logger.info(f"Admin {request.user.email} requesting Steam stats")
    
    from steamkeyvault.steam.models import SteamApp
    from steamkeyvault.games.models import UserGame
    
    total_steam_apps = SteamApp.objects.count()
    total_user_games = UserGame.objects.count()
    unique_games_added = UserGame.objects.values('steamapp_id').distinct().count()
    
    return {
        'total_steam_apps': total_steam_apps,
        'total_user_games': total_user_games,
        'unique_games_added': unique_games_added,
    }
