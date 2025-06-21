from ninja import Router
from ninja.errors import HttpError
from ninja.security import django_auth
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token

from users import schemas
from users.models import User
from ninja.responses import Response
from django.http import JsonResponse

users_router = Router()

@users_router.get("/set-csrf-token")
def get_csrf_token(request):
    return {"csrftoken": get_token(request)}

@users_router.post("/login")
def login_view(request, payload: schemas.SignInSchema):
    user = authenticate(request, username=payload.email, password=payload.password)
    if user is not None:
        login(request, user)
        return {"success": True}
    raise HttpError(403, "Invalid credentials")

@users_router.post("/logout", auth=django_auth)
def logout_view(request):
    logout(request)
    return {"message": "Logged out"}

@users_router.get("/user", auth=django_auth)
def user(request):
    return {
        "username": request.user.username,
        "email": request.user.email
    }

@users_router.post("/register")
def register(request, payload: schemas.SignUpSchema):
    if User.objects.filter(email=payload.email).exists():
        return JsonResponse({"error": "Email already exists"}, status=400)
    try:
        User.objects.create_user(username=payload.username, email=payload.email, password=payload.password)
        return Response({"success": True}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
