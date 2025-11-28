"""
Request Logging Middleware for Django
Add this middleware to log all HTTP requests to Logstash
"""
import logging
import time
import json

logger = logging.getLogger('steamkeyvault')


class RequestLoggingMiddleware:
    """Middleware to log all HTTP requests with timing information"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Start timer
        start_time = time.time()

        # Process request
        response = self.get_response(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log request details
        log_data = {
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration_ms': round(duration * 1000, 2),
            'user': str(request.user) if request.user.is_authenticated else 'anonymous',
            'ip': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }

        # Log based on status code
        if response.status_code >= 500:
            logger.error('Server error', extra=log_data)
        elif response.status_code >= 400:
            logger.warning('Client error', extra=log_data)
        else:
            logger.info('Request completed', extra=log_data)

        return response

    @staticmethod
    def get_client_ip(request):
        """Get the client IP address from the request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
