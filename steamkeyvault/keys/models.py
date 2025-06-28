from django.db import models
from django.conf import settings
from steamkeyvault.games.models import Game, UserGame

class Key(models.Model):
    key = models.CharField(max_length=255, primary_key=True)
    userGame = models.ForeignKey(UserGame, on_delete=models.CASCADE, related_name='keys')
    used = models.BooleanField(default=False)
    date_added = models.DateTimeField(auto_now_add=True)
    date_used = models.DateTimeField(null=True, blank=True)
    current_use = models.CharField(max_length=255, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.used and not self.date_used:
            from django.utils import timezone
            self.date_used = timezone.now()
        elif not self.used:
            self.date_used = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.key
