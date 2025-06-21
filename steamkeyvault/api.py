from ninja import NinjaAPI
from users.api import router as users_router
from ninja.security import HttpBearer
from ninja.errors import HttpError
from django.contrib.auth import authenticate

class GlobalAuth(HttpBearer):
    def authenticate(self, request, token):
        # Here you can implement token verification logic
        # For demo, accept a static token 'supersecrettoken'
        if token == "supersecrettoken":
            return token
        raise HttpError(401, "Invalid or missing token")

api = NinjaAPI(auth=GlobalAuth())
api.add_router("/users/", users_router)
