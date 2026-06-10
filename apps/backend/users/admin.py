from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import User, UserActionLog


class CustomUserAdmin(UserAdmin):
	list_display = UserAdmin.list_display + ('preferred_language',)
	fieldsets = UserAdmin.fieldsets + (
		('Preferences', {'fields': ('preferred_language',)}),
	)
	add_fieldsets = UserAdmin.add_fieldsets + (
		(None, {'fields': ('preferred_language',)}),
	)


admin.site.register(User, CustomUserAdmin)
admin.site.register(UserActionLog)
