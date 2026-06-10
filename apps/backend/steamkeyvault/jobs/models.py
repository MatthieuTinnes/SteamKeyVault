from django.db import models
from django.conf import settings
from django.db.models import JSONField
from django.utils import timezone


class ImportJob(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    progress = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    result = JSONField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)

    def start(self):
        self.status = "running"
        self.started_at = timezone.now()
        self.save()

    def finish(self, success=True):
        self.finished_at = timezone.now()
        self.status = "completed" if success else "failed"
        self.save()
