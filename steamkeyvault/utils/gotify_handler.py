import logging

import requests
from django.conf import settings


class GotifyHandler(logging.Handler):
    """Logging handler that sends error notifications to a Gotify server."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.gotify_url = getattr(settings, 'GOTIFY_URL', None)
        self.gotify_token = getattr(settings, 'GOTIFY_TOKEN', None)

    def emit(self, record):
        if not self.gotify_url or not self.gotify_token:
            return

        try:
            message = self.format(record)
            requests.post(
                f"{self.gotify_url.rstrip('/')}/message",
                params={"token": self.gotify_token},
                json={
                    "title": f"[{record.levelname}] {record.name}",
                    "message": message,
                    "priority": 8 if record.levelno >= logging.CRITICAL else 5,
                },
                timeout=5,
            )
        except Exception:
            self.handleError(record)
