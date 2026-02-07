from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import User, UserActionLog

admin.site.register(User, UserAdmin)
admin.site.register(UserActionLog)
