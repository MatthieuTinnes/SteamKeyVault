from django.db import models

class SteamApp(models.Model):
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.name} ({self.id})"
