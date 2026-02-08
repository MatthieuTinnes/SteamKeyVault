"""Admin decorators and utilities for admin-only endpoints."""
from functools import wraps
from ninja.errors import HttpError
import logging
from steamkeyvault.utils.i18n import get_request_locale, translate_message
from steamkeyvault.utils.i18n_messages import ADMIN_ERROR_MESSAGES

logger = logging.getLogger(__name__)



def admin_required(view_func):
    """Decorator to require admin privileges for a view."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            locale = get_request_locale(request)
            raise HttpError(401, translate_message(ADMIN_ERROR_MESSAGES, 'auth_required', locale))
        
        if not getattr(request.user, 'is_admin', False):
            logger.warning(f"Non-admin user {request.user.email} attempted to access admin endpoint")
            locale = get_request_locale(request, request.user)
            raise HttpError(403, translate_message(ADMIN_ERROR_MESSAGES, 'admin_required', locale))
        
        return view_func(request, *args, **kwargs)
    
    return wrapper
