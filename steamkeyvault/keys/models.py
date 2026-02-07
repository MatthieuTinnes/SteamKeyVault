from django.db import models
from steamkeyvault.games.models import UserGame

class Key(models.Model):
    key = models.CharField(max_length=255)
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


class ShareKeyToken(models.Model):
    key = models.ForeignKey(Key, on_delete=models.CASCADE, related_name='share_key_token')
    token = models.CharField(max_length=128, unique=True)
    shared_key = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revealed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'keys_share_key_token'
        ordering = ['-created_at']

    def __str__(self):
        return f"share:{self.key_id}:{self.token[:8]}"
