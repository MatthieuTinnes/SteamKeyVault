from ninja import Router
from ninja.errors import HttpError
from ninja.security import django_auth
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
import logging
from django.conf import settings
from datetime import datetime

from users import schemas
from users.models import User
from users.models_verification import EmailVerificationToken
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from ninja.responses import Response
from django.http import JsonResponse
from steamkeyvault.utils.mailer import Mailer
from steamkeyvault.games.models import UserGame
from steamkeyvault.keys.models import Key

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
        Mailer.send_template_email(
                subject='Welcome to SteamKeyVault',
                template_name='emails/welcome.html',
                context={
                    'username': user.username,
                    'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                },
                to_emails=[user.email]
            )
        logger.info(f"Triggered welcome email send to user_id={user.id} email={user.email}")
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
        "email": user_obj.email,
        "email_verified": user_obj.email_verified,
        "is_admin": user_obj.is_admin
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
        
        # Generate verification token
        token = EmailVerificationToken.generate_token(
            user=user,
            token_type=EmailVerificationToken.TOKEN_TYPE_REGISTRATION
        )
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{frontend_url}/verify-email?token={token.token}"
        
        # Send verification email
        Mailer.send_template_email(
            subject='Verify Your Email - SteamKeyVault',
            template_name='emails/verify_email.html',
            context={
                'username': user.username,
                'verification_url': verification_url,
            },
            to_emails=[user.email]
        )
        logger.info(f"Sent verification email to user_id={user.id} email={user.email}")
        return Response({"success": True, "message": "Registration successful. Please check your email to verify your account."}, status=201)
    except Exception as e:
        logger.exception(f"Error registering user username={payload.username} email={payload.email}: {e}")
        return JsonResponse({"error": str(e)}, status=400)


@users_router.put("/account", auth=django_auth)
def update_account(request, payload: schemas.UpdateEmailSchema):
    """
    Update the authenticated user's email. Ensures email uniqueness.
    """
    user_obj = request.user
    new_email = payload.email
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"Account update requested by user={getattr(user_obj, 'email', None)} -> new_email={new_email} from {addr}")

    # If the email is unchanged, return success
    if user_obj.email == new_email:
        return Response({"success": True})

    # Validate email format
    try:
        validate_email(new_email)
    except ValidationError:
        logger.warning(f"Account update failed: invalid email format new_email={new_email}")
        return JsonResponse({"error": "Invalid email format"}, status=400)

    # Check uniqueness
    if User.objects.filter(email=new_email).exclude(pk=user_obj.pk).exists():
        logger.warning(f"Account update failed: email already in use new_email={new_email}")
        return JsonResponse({"error": "Email already exists"}, status=400)

    try:
        # Generate confirmation token for new email
        token = EmailVerificationToken.generate_token(
            user=user_obj,
            token_type=EmailVerificationToken.TOKEN_TYPE_EMAIL_CHANGE,
            new_email=new_email
        )
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        confirmation_url = f"{frontend_url}/confirm-email-change?token={token.token}"
        
        # Send confirmation email to NEW email address
        Mailer.send_template_email(
            subject='Confirm Your Email Change - SteamKeyVault',
            template_name='emails/email_change_confirmation.html',
            context={
                'username': user_obj.username,
                'new_email': new_email,
                'confirmation_url': confirmation_url,
            },
            to_emails=[new_email]
        )
        logger.info(f"Sent email change confirmation to new_email={new_email} for user_id={user_obj.pk}")
        return Response({"success": True, "message": "Please check your new email address to confirm the change."})
    except Exception as e:
        logger.exception(f"Error processing email change for user_id={user_obj.pk}: {e}")
        return JsonResponse({"error": str(e)}, status=400)


@users_router.post("/change-password", auth=django_auth)
def change_password_view(request, payload: schemas.ChangePasswordSchema):
    """
    Change password for the authenticated user. Requires current password verification.
    """
    user_obj = request.user
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"Password change requested by user={getattr(user_obj, 'email', None)} from {addr}")

    if not user_obj.check_password(payload.current_password):
        logger.warning(f"Password change failed: invalid current password user={getattr(user_obj, 'email', None)}")
        return JsonResponse({"error": "Current password is incorrect"}, status=400)

    # Optional: enforce minimal password strength
    if not payload.new_password or len(payload.new_password) < 6:
        logger.warning(f"Password change failed: new password too short user={getattr(user_obj, 'email', None)}")
        return JsonResponse({"error": "New password must be at least 6 characters"}, status=400)

    try:
        user_obj.set_password(payload.new_password)
        user_obj.save()
        logger.info(f"Password changed for user_id={user_obj.pk}")
        
        # Send notification email about password change
        Mailer.send_template_email(
            subject='Password Changed - SteamKeyVault',
            template_name='emails/password_changed.html',
            context={
                'username': user_obj.username,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
            },
            to_emails=[user_obj.email]
        )
        logger.info(f"Sent password change notification to user_id={user_obj.pk}")
        return Response({"success": True})
    except Exception as e:
        logger.exception(f"Error changing password for user_id={user_obj.pk}: {e}")
        return JsonResponse({"error": str(e)}, status=400)


@users_router.get('/stats', auth=django_auth)
def user_stats(request):
    """Return simple stats for the authenticated user: total games and total keys."""
    user_obj = request.user
    try:
        games_count = UserGame.objects.filter(user=user_obj).count()
        # Keys are linked to UserGame via foreign key `userGame`
        keys_count = Key.objects.filter(userGame__user=user_obj).count()
        return Response({
            'games_count': games_count,
            'keys_count': keys_count,
        })
    except Exception as e:
        logger.exception(f"Error fetching stats for user_id={getattr(user_obj, 'pk', None)}: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@users_router.get('/verify-email')
def verify_email(request, token: str):
    """Verify email address using token sent during registration"""
    try:
        verification_token = EmailVerificationToken.objects.get(
            token=token,
            token_type=EmailVerificationToken.TOKEN_TYPE_REGISTRATION
        )
        
        if not verification_token.is_valid():
            logger.warning(f"Email verification failed: token expired or used token={token}")
            return JsonResponse({"error": "This verification link is invalid or has expired."}, status=400)
        
        # Mark user as verified and token as used
        user = verification_token.user
        user.email_verified = True
        user.save(update_fields=['email_verified'])
        verification_token.mark_used()
        
        # Send welcome email after successful verification
        user = verification_token.user
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        Mailer.send_template_email(
            subject='Welcome to SteamKeyVault',
            template_name='emails/welcome.html',
            context={
                'username': user.username,
                'site_url': frontend_url,
            },
            to_emails=[user.email]
        )
        
        logger.info(f"Email verified successfully for user_id={user.id}")
        return Response({"success": True, "message": "Email verified successfully! You can now log in."})
        
    except EmailVerificationToken.DoesNotExist:
        logger.warning(f"Email verification failed: token not found token={token}")
        return JsonResponse({"error": "Invalid verification link."}, status=404)
    except Exception as e:
        logger.exception(f"Error during email verification: {e}")
        return JsonResponse({"error": "An error occurred during verification."}, status=500)


@users_router.get('/confirm-email-change')
def confirm_email_change(request, token: str):
    """Confirm email change using token sent to new email address"""
    try:
        verification_token = EmailVerificationToken.objects.get(
            token=token,
            token_type=EmailVerificationToken.TOKEN_TYPE_EMAIL_CHANGE
        )
        
        if not verification_token.is_valid():
            logger.warning(f"Email change confirmation failed: token expired or used token={token}")
            return JsonResponse({"error": "This confirmation link is invalid or has expired."}, status=400)
        
        # Update user email
        user = verification_token.user
        new_email = verification_token.new_email
        old_email = user.email
        
        user.email = new_email
        user.email_verified = True  # Email is verified since they clicked the link
        user.save(update_fields=['email', 'email_verified'])
        
        # Mark token as used
        verification_token.mark_used()
        
        logger.info(f"Email changed successfully for user_id={user.id} from {old_email} to {new_email}")
        return Response({"success": True, "message": "Email address changed successfully!"})
        
    except EmailVerificationToken.DoesNotExist:
        logger.warning(f"Email change confirmation failed: token not found token={token}")
        return JsonResponse({"error": "Invalid confirmation link."}, status=404)
    except Exception as e:
        logger.exception(f"Error during email change confirmation: {e}")
        return JsonResponse({"error": "An error occurred during confirmation."}, status=500)
