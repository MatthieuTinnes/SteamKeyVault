from ninja import Router
from ninja.errors import HttpError
from ninja.security import django_auth
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.middleware.csrf import get_token
import logging
import requests
from django.conf import settings
from datetime import datetime
import re

from users import schemas
from users.models import User, UserActionLog
from users.action_logging import log_user_action
from users.models_verification import EmailVerificationToken, PasswordResetToken
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from ninja.responses import Response
from django.http import JsonResponse
from steamkeyvault.utils.mailer import Mailer
from steamkeyvault.games.models import UserGame
from steamkeyvault.keys.models import Key
from steamkeyvault.utils.i18n import get_request_locale, translate_message
from steamkeyvault.utils.i18n_messages import PASSWORD_ERROR_MESSAGES, USER_ERROR_MESSAGES
from steamkeyvault.utils.rate_limit import rate_limit

# Module logger
logger = logging.getLogger(__name__)

users_router = Router()

SUPPORTED_LOCALES = {User.LANGUAGE_EN, User.LANGUAGE_FR}

EMAIL_SUBJECTS = {
    'verify_email': {
        'en': 'Verify Your Email - SteamKeyVault',
        'fr': 'Vérifiez votre adresse email - SteamKeyVault',
    },
    'email_change_confirmation': {
        'en': 'Confirm Your Email Change - SteamKeyVault',
        'fr': "Confirmez le changement d'adresse email - SteamKeyVault",
    },
    'password_changed': {
        'en': 'Password Changed - SteamKeyVault',
        'fr': 'Mot de passe modifié - SteamKeyVault',
    },
    'welcome': {
        'en': 'Welcome to SteamKeyVault',
        'fr': 'Bienvenue sur SteamKeyVault',
    },
    'password_reset_request': {
        'en': 'Reset Your Password - SteamKeyVault',
        'fr': 'Réinitialiser votre mot de passe - SteamKeyVault',
    },
    'password_reset_success': {
        'en': 'Password Reset - SteamKeyVault',
        'fr': 'Mot de passe réinitialisé - SteamKeyVault',
    },
}



def _validate_turnstile(turnstile_token: str, remote_ip: str | None, expected_action: str | None = None) -> bool:
    """Verify a Cloudflare Turnstile token against the siteverify API."""
    secret = getattr(settings, 'TURNSTILE_SECRET_KEY')
    verify_url = getattr(settings, 'TURNSTILE_VERIFY_URL')
    if not secret or not verify_url:
        logger.warning("Turnstile secret or verify URL not configured – skipping captcha check")
        return True
    payload = {'secret': secret, 'response': turnstile_token}
    if remote_ip:
        payload['remoteip'] = remote_ip
    try:
        resp = requests.post(verify_url, data=payload, timeout=5)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.exception("Turnstile verification request failed: %s", exc)
        return False
    if not data.get('success'):
        logger.info("Turnstile verification rejected: %s", data)
        return False
    if expected_action:
        action = data.get('action')
        if action != expected_action:
            logger.warning("Turnstile action mismatch: expected '%s', got '%s'", expected_action, action)
            return False
    return True


def normalize_locale(value: str | None, fallback: str = User.LANGUAGE_EN) -> str:
    if value and value in SUPPORTED_LOCALES:
        return value
    return fallback


def get_user_locale(user: User) -> str:
    return normalize_locale(getattr(user, 'preferred_language', None))


def get_subject(key: str, locale: str) -> str:
    return EMAIL_SUBJECTS.get(key, {}).get(locale, EMAIL_SUBJECTS.get(key, {}).get('en', 'SteamKeyVault'))


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength requirements.
    Returns (is_valid, error_message)
    
    Requirements:
    - Minimum 12 characters
    - At least one lowercase letter
    - At least one uppercase letter
    - At least one digit
    - At least one special character from: #?!@$%^&*-'+()_[]
    """
    if len(password) < 12:
        return False, "password_min_length"
    
    if not re.search(r'[a-z]', password):
        return False, "password_lowercase"
    
    if not re.search(r'[A-Z]', password):
        return False, "password_uppercase"
    
    if not re.search(r'\d', password):
        return False, "password_digit"
    
    if not re.search(r'[#?!@$%^&*\-\'\+\(\)_\[\]]', password):
        return False, "password_special"
    
    return True, ""

@users_router.get("/set-csrf-token")
def get_csrf_token(request):
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"CSRF token requested from {addr}")
    return {"csrftoken": get_token(request)}

@users_router.post("/login")
@rate_limit(limit=10, window=60)
def login_view(request, payload: schemas.SignInSchema):
    locale = get_request_locale(request)
    logger.info(f"Login attempt for email={payload.email}")
    user = authenticate(request, username=payload.email, password=payload.password)
    if user is not None:
        login(request, user)
        if not user.wrapped_mk_password or not user.mk_salt:
            logger.warning(f"Login failed: encryption not initialized user={user.email}")
            locale = get_request_locale(request, user)
            raise HttpError(400, translate_message(USER_ERROR_MESSAGES, 'encryption_not_initialized', locale))
        response = JsonResponse({
            "success": True,
            "wrapped_mk_password": user.wrapped_mk_password,
            "mk_salt": user.mk_salt,
            "kdf_iterations": user.kdf_iterations,
            "kdf_hash": user.kdf_hash,
        })
        log_user_action(UserActionLog.ACTION_LOGIN, user, request)
        return response
    logger.warning(f"Failed login for email={payload.email}")
    locale = get_request_locale(request)
    raise HttpError(403, translate_message(USER_ERROR_MESSAGES, 'invalid_credentials', locale))

@users_router.post("/logout", auth=django_auth)
def logout_view(request):
    user_email = getattr(request.user, "email", None)
    logger.info(f"Logout requested by user={user_email}")
    logout(request)
    logger.info(f"User logged out user={user_email}")
    response = JsonResponse({"message": "Logged out"})
    return response

@users_router.get("/user", auth=django_auth)
def user(request):
    user_obj = request.user
    logger.debug(f"User info requested for user={getattr(user_obj, 'email', None)}")
    return {
        "username": user_obj.username,
        "email": user_obj.email,
        "email_verified": user_obj.email_verified,
        "is_admin": user_obj.is_admin,
        "preferred_language": user_obj.preferred_language,
    }

@users_router.post("/register")
@rate_limit(limit=5, window=300)
def register(request, payload: schemas.SignUpSchema):
    locale = get_request_locale(request)
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"Register attempt username={payload.username} email={payload.email} from {addr}")
    # Log headers for debugging CORS issues
    logger.debug("Request headers: %s", {k: v for k, v in request.headers.items() if k.lower().startswith(('origin', 'referer', 'host', 'x-', 'access-', 'sec-'))})
    
    # Validate Turnstile captcha
    turnstile_secret = getattr(settings, 'TURNSTILE_SECRET_KEY')
    if turnstile_secret:
        token = payload.turnstile_token
        if not token:
            logger.warning(f"Registration failed: missing captcha token username={payload.username}")
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'captcha_required', locale)}, status=400)
        if not _validate_turnstile(token, request.META.get("REMOTE_ADDR"), expected_action="register"):
            logger.warning(f"Registration failed: invalid captcha username={payload.username}")
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'captcha_invalid', locale)}, status=400)

    # Validate password strength
    is_valid, error_msg = validate_password_strength(payload.password)
    if not is_valid:
        logger.warning(f"Registration failed: weak password username={payload.username}")
        return JsonResponse({"error": translate_message(PASSWORD_ERROR_MESSAGES, error_msg, locale)}, status=400)
    
    email_taken = User.objects.filter(email=payload.email).exists()
    username_taken = User.objects.filter(username=payload.username).exists()
    if email_taken:
        logger.warning(f"Registration failed: email exists email={payload.email}")
    if username_taken:
        logger.warning(f"Registration failed: username exists username={payload.username}")
    if email_taken or username_taken:
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'registration_conflict', locale)}, status=400)
    try:
        user = User.objects.create_user(username=payload.username, email=payload.email, password=payload.password)
        preferred_language = normalize_locale(payload.preferred_language, fallback=locale)
        user.wrapped_mk_password = payload.wrapped_mk_password
        user.wrapped_mk_recovery = payload.wrapped_mk_recovery
        user.mk_salt = payload.mk_salt
        user.rk_salt = payload.rk_salt
        user.kdf_iterations = payload.kdf_iterations
        user.kdf_hash = payload.kdf_hash
        user.preferred_language = preferred_language
        user.save(update_fields=[
            "wrapped_mk_password",
            "wrapped_mk_recovery",
            "mk_salt",
            "rk_salt",
            "kdf_iterations",
            "kdf_hash",
            "preferred_language",
        ])
        logger.info(f"User registered username={payload.username} email={payload.email} user_id={user.id}")
        log_user_action(UserActionLog.ACTION_REGISTER, user, request)
        
        # Generate verification token
        token = EmailVerificationToken.generate_token(
            user=user,
            token_type=EmailVerificationToken.TOKEN_TYPE_REGISTRATION
        )
        frontend_url = getattr(settings, 'FRONTEND_URL')
        verification_url = f"{frontend_url}/verify-email?token={token.token}"
        
        # Send verification email
        Mailer.send_template_email(
            subject=get_subject('verify_email', preferred_language),
            template_name='emails/verify_email.html',
            context={
                'username': user.username,
                'verification_url': verification_url,
            },
            to_emails=[user.email],
            locale=preferred_language,
        )
        logger.info(f"Sent verification email to user_id={user.id} email={user.email}")
        return Response({"success": True, "message": "Registration successful. Please check your email to verify your account."}, status=201)
    except Exception as e:
        logger.exception(f"Error registering user username={payload.username} email={payload.email}: {e}")
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'internal_error', locale)}, status=400)


@users_router.put("/account", auth=django_auth)
def update_account(request, payload: schemas.UpdateEmailSchema):
    """
    Update the authenticated user's email. Ensures email uniqueness.
    """
    user_obj = request.user
    new_email = payload.email
    locale = get_request_locale(request, user_obj)
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
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'invalid_email_format', locale)}, status=400)

    # Check uniqueness
    if User.objects.filter(email=new_email).exclude(pk=user_obj.pk).exists():
        logger.warning(f"Account update failed: email already in use new_email={new_email}")
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'email_exists', locale)}, status=400)

    try:
        # Generate confirmation token for new email
        token = EmailVerificationToken.generate_token(
            user=user_obj,
            token_type=EmailVerificationToken.TOKEN_TYPE_EMAIL_CHANGE,
            new_email=new_email
        )
        frontend_url = getattr(settings, 'FRONTEND_URL')
        confirmation_url = f"{frontend_url}/confirm-email-change?token={token.token}"
        
        # Send confirmation email to NEW email address
        locale = get_user_locale(user_obj)
        Mailer.send_template_email(
            subject=get_subject('email_change_confirmation', locale),
            template_name='emails/email_change_confirmation.html',
            context={
                'username': user_obj.username,
                'new_email': new_email,
                'confirmation_url': confirmation_url,
            },
            to_emails=[new_email],
            locale=locale,
        )
        logger.info(f"Sent email change confirmation to new_email={new_email} for user_id={user_obj.pk}")
        return Response({"success": True, "message": "Please check your new email address to confirm the change."})
    except Exception as e:
        logger.exception(f"Error processing email change for user_id={user_obj.pk}: {e}")
        locale = get_request_locale(request, user_obj)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'internal_error', locale)}, status=400)


@users_router.put("/preferences", auth=django_auth)
def update_preferences(request, payload: schemas.UpdatePreferencesSchema):
    user_obj = request.user
    next_locale = normalize_locale(payload.preferred_language, fallback='')
    if not next_locale:
        locale = get_request_locale(request, user_obj)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'invalid_language', locale)}, status=400)

    user_obj.preferred_language = next_locale
    user_obj.save(update_fields=["preferred_language"])
    logger.info("Updated preferred language user_id=%s locale=%s", user_obj.pk, next_locale)
    return Response({"success": True, "preferred_language": next_locale})


@users_router.post("/change-password", auth=django_auth)
@rate_limit(limit=5, window=60)
def change_password_view(request, payload: schemas.ChangePasswordSchema):
    """
    Change password for the authenticated user. Requires current password verification.
    """
    user_obj = request.user
    addr = request.META.get("REMOTE_ADDR")
    logger.info(f"Password change requested by user={getattr(user_obj, 'email', None)} from {addr}")

    if not user_obj.check_password(payload.current_password):
        logger.warning(f"Password change failed: invalid current password user={getattr(user_obj, 'email', None)}")
        locale = get_request_locale(request, user_obj)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'current_password_incorrect', locale)}, status=400)

    # Validate password strength
    is_valid, error_msg = validate_password_strength(payload.new_password)
    if not is_valid:
        logger.warning(f"Password change failed: weak password user={getattr(user_obj, 'email', None)}")
        locale = get_request_locale(request, user_obj)
        return JsonResponse({"error": translate_message(PASSWORD_ERROR_MESSAGES, error_msg, locale)}, status=400)

    try:
        user_obj.set_password(payload.new_password)
        user_obj.wrapped_mk_password = payload.wrapped_mk_password
        user_obj.save()
        update_session_auth_hash(request, user_obj)
        logger.info(f"Password changed for user_id={user_obj.pk}")
        log_user_action(UserActionLog.ACTION_PASSWORD_CHANGE, user_obj, request)
        
        # Send notification email about password change
        locale = get_user_locale(user_obj)
        Mailer.send_template_email(
            subject=get_subject('password_changed', locale),
            template_name='emails/password_changed.html',
            context={
                'username': user_obj.username,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
            },
            to_emails=[user_obj.email],
            locale=locale,
        )
        logger.info(f"Sent password change notification to user_id={user_obj.pk}")
        return Response({"success": True})
    except Exception as e:
        logger.exception(f"Error changing password for user_id={user_obj.pk}: {e}")
        locale = get_request_locale(request, user_obj)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'internal_error', locale)}, status=400)


@users_router.post('/recovery-info')
@rate_limit(limit=5, window=60)
def recovery_info(request, payload: schemas.RecoveryInfoSchema):
    locale = get_request_locale(request)
    turnstile_secret = getattr(settings, 'TURNSTILE_SECRET_KEY')
    if turnstile_secret:
        if not payload.turnstile_token:
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'captcha_required', locale)}, status=400)
        if not _validate_turnstile(payload.turnstile_token, request.META.get("REMOTE_ADDR"), expected_action="recovery"):
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'captcha_invalid', locale)}, status=400)
    user = User.objects.filter(email=payload.email).first()
    if not user or not user.wrapped_mk_recovery or not user.rk_salt:
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'recovery_data_unavailable', locale)}, status=400)
    return Response({
        "wrapped_mk_recovery": user.wrapped_mk_recovery,
        "rk_salt": user.rk_salt,
        "kdf_iterations": user.kdf_iterations,
        "kdf_hash": user.kdf_hash,
    })


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
            locale = get_request_locale(request, verification_token.user)
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'verification_invalid_or_expired', locale)}, status=400)
        
        # Mark user as verified and token as used
        user = verification_token.user
        user.email_verified = True
        user.save(update_fields=['email_verified'])
        verification_token.mark_used()
        
        # Send welcome email after successful verification
        user = verification_token.user
        frontend_url = getattr(settings, 'FRONTEND_URL')
        locale = get_user_locale(user)
        Mailer.send_template_email(
            subject=get_subject('welcome', locale),
            template_name='emails/welcome.html',
            context={
                'username': user.username,
                'site_url': frontend_url,
            },
            to_emails=[user.email],
            locale=locale,
        )
        
        logger.info(f"Email verified successfully for user_id={user.id}")
        return Response({"success": True, "message": "Email verified successfully! You can now log in."})
        
    except EmailVerificationToken.DoesNotExist:
        logger.warning(f"Email verification failed: token not found token={token}")
        locale = get_request_locale(request)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'verification_invalid', locale)}, status=404)
    except Exception as e:
        logger.exception(f"Error during email verification: {e}")
        locale = get_request_locale(request)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'verification_error', locale)}, status=500)


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
            locale = get_request_locale(request, verification_token.user)
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'confirmation_invalid_or_expired', locale)}, status=400)
        
        # Update user email
        user = verification_token.user
        new_email = verification_token.new_email
        old_email = user.email
        
        user.email = new_email
        user.email_verified = True  # Email is verified since they clicked the link
        user.save(update_fields=['email', 'email_verified'])
        
        # Mark token as used
        verification_token.mark_used()

        log_user_action(
            UserActionLog.ACTION_EMAIL_CHANGE,
            user,
            request,
            metadata={"old_email": old_email, "new_email": new_email},
        )
        
        logger.info(f"Email changed successfully for user_id={user.id} from {old_email} to {new_email}")
        return Response({"success": True, "message": "Email address changed successfully!"})
        
    except EmailVerificationToken.DoesNotExist:
        logger.warning(f"Email change confirmation failed: token not found token={token}")
        locale = get_request_locale(request)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'confirmation_invalid', locale)}, status=404)
    except Exception as e:
        logger.exception(f"Error during email change confirmation: {e}")
        locale = get_request_locale(request)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'confirmation_error', locale)}, status=500)


@users_router.post("/resend-verification-email", auth=django_auth)
@rate_limit(limit=3, window=300)
def resend_verification_email(request):
    user = request.user
    locale = get_request_locale(request, user)
    if user.email_verified:
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'email_already_verified', locale)}, status=400)

    try:
        # Generate verification token
        token = EmailVerificationToken.generate_token(
            user=user,
            token_type=EmailVerificationToken.TOKEN_TYPE_REGISTRATION
        )
        frontend_url = getattr(settings, 'FRONTEND_URL')
        verification_url = f"{frontend_url}/verify-email?token={token.token}"

        # Send verification email
        locale = get_user_locale(user)
        Mailer.send_template_email(
            subject=get_subject('verify_email', locale),
            template_name='emails/verify_email.html',
            context={
                'username': user.username,
                'verification_url': verification_url,
            },
            to_emails=[user.email],
            locale=locale,
        )
        logger.info(f"Resent verification email to user_id={user.id} email={user.email}")
        return Response({"success": True, "message": "Verification email sent."})
    except Exception as e:
        logger.exception(f"Error resending verification email for user_id={user.id}: {e}")
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'internal_error', locale)}, status=500)


@users_router.post('/forgot-password')
@rate_limit(limit=5, window=300)
def forgot_password(request, payload: schemas.ForgotPasswordSchema):
    locale = get_request_locale(request)
    turnstile_secret = getattr(settings, 'TURNSTILE_SECRET_KEY')
    if turnstile_secret:
        if not payload.turnstile_token:
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'captcha_required', locale)}, status=400)
        if not _validate_turnstile(payload.turnstile_token, request.META.get("REMOTE_ADDR"), expected_action="forgot_password"):
            return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'captcha_invalid', locale)}, status=400)
    logger.info(f"Forgot password requested email={payload.email}")
    user = User.objects.filter(email=payload.email).first()
    if not user:
        return Response({"success": True})

    PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
    token = PasswordResetToken.generate_token(user=user, expiry_hours=1)
    frontend_url = getattr(settings, 'FRONTEND_URL')
    reset_url = f"{frontend_url}/reset-password?token={token.token}"

    locale = get_user_locale(user)
    Mailer.send_template_email(
        subject=get_subject('password_reset_request', locale),
        template_name='emails/password_reset_request.html',
        context={
            'username': user.username,
            'reset_url': reset_url,
        },
        to_emails=[user.email],
        locale=locale,
    )
    logger.info(f"Password reset email sent user_id={user.id}")
    return Response({"success": True})


@users_router.get('/reset-password-info')
def reset_password_info(request, token: str):
    reset_token = PasswordResetToken.objects.filter(token=token).first()
    if not reset_token or not reset_token.is_valid():
        locale = get_request_locale(request)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'reset_token_invalid_or_expired', locale)}, status=400)
    user = reset_token.user
    if not user.wrapped_mk_recovery or not user.rk_salt or not user.mk_salt:
        locale = get_request_locale(request, user)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'recovery_data_unavailable', locale)}, status=400)
    return Response({
        "wrapped_mk_recovery": user.wrapped_mk_recovery,
        "rk_salt": user.rk_salt,
        "mk_salt": user.mk_salt,
        "kdf_iterations": user.kdf_iterations,
        "kdf_hash": user.kdf_hash,
    })


@users_router.post('/reset-password')
@rate_limit(limit=5, window=60)
def reset_password(request, payload: schemas.ResetPasswordSchema):
    reset_token = PasswordResetToken.objects.filter(token=payload.token).first()
    if not reset_token or not reset_token.is_valid():
        locale = get_request_locale(request)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'reset_token_invalid_or_expired', locale)}, status=400)

    # Validate password strength
    is_valid, error_msg = validate_password_strength(payload.new_password)
    if not is_valid:
        locale = get_request_locale(request, reset_token.user if reset_token else None)
        return JsonResponse({"error": translate_message(PASSWORD_ERROR_MESSAGES, error_msg, locale)}, status=400)

    user = reset_token.user
    try:
        user.set_password(payload.new_password)
        user.wrapped_mk_password = payload.wrapped_mk_password
        user.save(update_fields=["password", "wrapped_mk_password"])
        reset_token.mark_used()
        log_user_action(UserActionLog.ACTION_PASSWORD_RESET, user, request)
        locale = get_user_locale(user)
        Mailer.send_template_email(
            subject=get_subject('password_reset_success', locale),
            template_name='emails/password_reset_success.html',
            context={
                'username': user.username,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
            },
            to_emails=[user.email],
            locale=locale,
        )
        logger.info(f"Password reset completed for user_id={user.id}")
        return Response({"success": True})
    except Exception as e:
        logger.exception(f"Error resetting password for user_id={user.id}: {e}")
        locale = get_request_locale(request)
        return JsonResponse({"error": translate_message(USER_ERROR_MESSAGES, 'internal_error', locale)}, status=400)
