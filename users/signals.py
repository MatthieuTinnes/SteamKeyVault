from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

from users.action_logging import log_user_action
from users.models import UserActionLog


@receiver(user_logged_in)
def log_login_action(sender, request, user, **kwargs):
    log_user_action(UserActionLog.ACTION_LOGIN, user, request)
