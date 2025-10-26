from ninja import Router
from ninja.errors import HttpError
from ninja.security import django_auth
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
import logging

from users import schemas
from users.models import User
from ninja.responses import Response
from django.http import JsonResponse

# Module logger
logger = logging.getLogger(__name__)

users_router = Router()

@users_router.get("/set-csrf-token")
def get_csrf_token(request):
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"CSRF token requested from {addr}")
    return {"csrftoken": get_token(request)}

@users_router.post("/login")
def login_view(request, payload: schemas.SignInSchema):
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"Login attempt for email={payload.email} from {addr}")
    user = authenticate(request, username=payload.email, password=payload.password)
    if user is not None:
        login(request, user)
        logger.info(f"Login successful for email={payload.email} user_id={user.id}")
        return {"success": True}
    logger.warning(f"Failed login for email={payload.email} from {addr}")
    raise HttpError(403, "Invalid credentials")

@users_router.post("/logout", auth=django_auth)
def logout_view(request):
    user_email = getattr(request.user, "email", None)
    logger.info(f"Logout requested by user={user_email}")
    logout(request)
    logger.info(f"User logged out user={user_email}")
    return {"message": "Logged out"}

@users_router.get("/user", auth=django_auth)
def user(request):
    user_obj = request.user
    logger.debug(f"User info requested for user={getattr(user_obj, 'email', None)}")
    return {
        "username": user_obj.username,
        "email": user_obj.email
    }

@users_router.post("/register")
def register(request, payload: schemas.SignUpSchema):
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"Register attempt username={payload.username} email={payload.email} from {addr}")
    # Log headers for debugging CORS issues
    logger.debug("Request headers: %s", {k: v for k, v in request.headers.items() if k.lower().startswith(('origin', 'referer', 'host', 'x-', 'access-', 'sec-'))})
    if User.objects.filter(email=payload.email).exists():
        logger.warning(f"Registration failed: email exists email={payload.email}")
        return JsonResponse({"error": "Email already exists"}, status=400)
    if User.objects.filter(username=payload.username).exists():
        logger.warning(f"Registration failed: username exists username={payload.username}")
        return JsonResponse({"error": "Username already exists"}, status=400)
    try:
        user = User.objects.create_user(username=payload.username, email=payload.email, password=payload.password)
        logger.info(f"User registered username={payload.username} email={payload.email} user_id={user.id}")
        return Response({"success": True}, status=201)
    except Exception as e:
        logger.exception(f"Error registering user username={payload.username} email={payload.email}: {e}")
        return JsonResponse({"error": str(e)}, status=400)
