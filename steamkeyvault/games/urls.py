from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import UserGameViewSet

router = DefaultRouter()
router.register(r'usergames', UserGameViewSet, basename='usergame')

urlpatterns = router.urls
