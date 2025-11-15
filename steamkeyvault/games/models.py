from django.db import models
from django.conf import settings


class UserGame(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_games')
    name = models.CharField(max_length=255)
    steamapp_id = models.IntegerField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'steamapp_id'],
                condition=models.Q(steamapp_id__isnull=False),
                name='unique_user_steamapp',
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.user_id})"
