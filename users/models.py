from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    wrapped_mk_password = models.CharField(max_length=512, null=True, blank=True)
    wrapped_mk_recovery = models.CharField(max_length=512, null=True, blank=True)
    mk_salt = models.CharField(max_length=255, null=True, blank=True)
    rk_salt = models.CharField(max_length=255, null=True, blank=True)
    kdf_iterations = models.IntegerField(default=310000)
    kdf_hash = models.CharField(max_length=32, default='SHA-256')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class UserActionLog(models.Model):
    ACTION_LOGIN = 'login'
    ACTION_PASSWORD_CHANGE = 'password_change'
    ACTION_EMAIL_CHANGE = 'email_change'

    ACTION_CHOICES = [
        (ACTION_LOGIN, 'Login'),
        (ACTION_PASSWORD_CHANGE, 'Change password'),
        (ACTION_EMAIL_CHANGE, 'Change email'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=32, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'user_action_log'

    def __str__(self):
        return f"{self.user_id}:{self.action_type}@{self.created_at.isoformat()}"
