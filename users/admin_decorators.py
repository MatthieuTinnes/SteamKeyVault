"""Admin decorators and utilities for admin-only endpoints."""
from functools import wraps
from ninja.errors import HttpError
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)


def admin_required(view_func):
    """Decorator to require admin privileges for a view."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise HttpError(401, "Authentication required")
        
        if not getattr(request.user, 'is_admin', False):
            logger.warning(f"Non-admin user {request.user.email} attempted to access admin endpoint")
            raise HttpError(403, "Admin privileges required")
        
        return view_func(request, *args, **kwargs)
    
    return wrapper
