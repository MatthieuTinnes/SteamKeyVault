from django.db import models
from django.conf import settings

class Game(models.Model):
    name = models.CharField(max_length=255)
    steamappid = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name

class UserGame(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_games')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='user_games')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'game')
