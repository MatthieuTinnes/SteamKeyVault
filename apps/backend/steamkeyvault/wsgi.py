"""
WSGI config for steamkeyvault project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from pathlib import Path

from django.core.wsgi import get_wsgi_application

# Load environment variables from .env file if it exists
env_file = Path(__file__).resolve().parent.parent / '.env'
if env_file.exists():
    from dotenv import load_dotenv
    load_dotenv(env_file)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'steamkeyvault.settings')

application = get_wsgi_application()
