# SteamKeyVault Backend - Django Logging Configuration
# Add this to your Django settings.py to enable JSON logging to Logstash

import os

# Logging configuration for production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
        'logstash': {
            'class': 'logging.handlers.SocketHandler',
            'host': os.environ.get('LOGSTASH_HOST', 'logstash'),
            'port': int(os.environ.get('LOGSTASH_PORT', 5000)),
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console', 'logstash'] if not DEBUG else ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'logstash'] if not DEBUG else ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'logstash'] if not DEBUG else ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console', 'logstash'] if not DEBUG else ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'steamkeyvault': {
            'handlers': ['console', 'logstash'] if not DEBUG else ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}

# Add this to your middleware for request logging
# MIDDLEWARE = [
#     ...
#     'django.middleware.common.CommonMiddleware',
#     'steamkeyvault.middleware.RequestLoggingMiddleware',  # Add this
#     ...
# ]
