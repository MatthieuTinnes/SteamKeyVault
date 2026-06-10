import logging

from users.models import UserActionLog


logger = logging.getLogger(__name__)


def log_user_action(action_type: str, user, request, metadata: dict | None = None) -> None:
    try:
        forwarded_for = request.headers.get("X-Forwarded-For")
        ip_address = forwarded_for.split(",")[0].strip() if forwarded_for else None

        UserActionLog.objects.create(
            user=user,
            action_type=action_type,
            ip_address=ip_address,
            user_agent=request.headers.get("User-Agent", ""),
            metadata=metadata,
        )
    except Exception as exc:
        logger.warning(
            "Failed to log user action %s for user_id=%s: %s",
            action_type,
            getattr(user, "id", None),
            exc,
        )
