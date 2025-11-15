from rest_framework import serializers
from .models import UserGame


class UserGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGame
        fields = ['id', 'name', 'steamapp_id', 'added_at']
