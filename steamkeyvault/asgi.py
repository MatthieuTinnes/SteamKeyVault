"""
ASGI config for steamkeyvault project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from pathlib import Path

from django.core.asgi import get_asgi_application

# Load environment variables from .env file if it exists
env_file = Path(__file__).resolve().parent.parent / '.env'
if env_file.exists():
    from dotenv import load_dotenv
    load_dotenv(env_file)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'steamkeyvault.settings')

application = get_asgi_application()
