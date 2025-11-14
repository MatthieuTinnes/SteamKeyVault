from django.contrib import admin
from .models import ImportJob

@admin.register(ImportJob)
class ImportJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'progress', 'total', 'created_at', 'started_at', 'finished_at')
    readonly_fields = ('result', 'error')
