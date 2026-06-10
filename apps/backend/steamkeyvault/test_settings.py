"""Minimal Django settings for running tests without a real database or external services."""
import os

SECRET_KEY = 'test-secret-key-for-unit-tests'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'users',
    'ninja',
    'corsheaders',
    'steamkeyvault.steam',
    'steamkeyvault.games',
    'steamkeyvault.keys',
    'steamkeyvault.jobs',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'steamkeyvault.urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

AUTH_USER_MODEL = 'users.User'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(os.path.dirname(os.path.dirname(__file__)), 'steamkeyvault', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Disable email sending in tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
DEFAULT_FROM_EMAIL = 'test@steamkeyvault.local'

# Turnstile disabled for tests
TURNSTILE_SECRET_KEY = ''
TURNSTILE_VERIFY_URL = ''

# Gotify disabled
GOTIFY_URL = ''
GOTIFY_TOKEN = ''

# Frontend URL for tests
FRONTEND_URL = 'http://localhost:5173'

CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
CSRF_TRUSTED_ORIGINS = ['http://localhost:5173']

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'handlers': {},
    'root': {'level': 'CRITICAL'},
}
