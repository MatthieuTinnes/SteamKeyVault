"""Rate limiting decorator for NinjaAPI endpoints.

Uses Django's cache framework (LocMemCache by default, or whatever backend
is configured via CACHES in settings). The cache key is namespaced by the
function name and the client's REMOTE_ADDR so every endpoint + IP pair has
its own independent counter.

Usage:
    @router.post("/login")
    @rate_limit(limit=10, window=60)
    def login_view(request, payload: ...):
        ...

Parameters:
    limit  – maximum number of requests allowed in the window.
    window – sliding window size in seconds.
"""

import functools
import logging
from django.core.cache import cache
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def rate_limit(limit: int, window: int):
    """Return a decorator that enforces ``limit`` requests per ``window`` seconds per IP."""

    def decorator(func):
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            ip = request.META.get("REMOTE_ADDR", "unknown")
            cache_key = f"rl:{func.__name__}:{ip}"

            current = cache.get(cache_key, 0)
            if current >= limit:
                logger.warning(
                    "Rate limit exceeded endpoint=%s ip=%s limit=%d window=%ds",
                    func.__name__,
                    ip,
                    limit,
                    window,
                )
                return JsonResponse(
                    {"error": "Too many requests. Please try again later."},
                    status=429,
                )

            # Increment counter; set TTL only on first request in the window.
            if current == 0:
                cache.set(cache_key, 1, timeout=window)
            else:
                cache.incr(cache_key)

            return func(request, *args, **kwargs)

        return wrapper

    return decorator
