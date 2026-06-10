from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from users.models_verification import EmailVerificationToken, PasswordResetToken

User = get_user_model()


class EmailVerificationTokenTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='vuser', email='v@x.com', password='Pass123!@abc')

    def test_create_token(self):
        token = EmailVerificationToken.objects.create(
            user=self.user,
            token='abc123',
            token_type=EmailVerificationToken.TOKEN_TYPE_REGISTRATION,
            expires_at=timezone.now() + timedelta(hours=24),
        )
        self.assertFalse(token.used)
        self.assertTrue(token.is_valid())

    def test_expired_token_is_invalid(self):
        token = EmailVerificationToken.objects.create(
            user=self.user,
            token='expired1',
            token_type=EmailVerificationToken.TOKEN_TYPE_REGISTRATION,
            expires_at=timezone.now() - timedelta(hours=1),
        )
        self.assertFalse(token.is_valid())

    def test_used_token_is_invalid(self):
        token = EmailVerificationToken.objects.create(
            user=self.user,
            token='used1',
            token_type=EmailVerificationToken.TOKEN_TYPE_REGISTRATION,
            expires_at=timezone.now() + timedelta(hours=24),
        )
        token.mark_used()
        self.assertTrue(token.used)
        self.assertFalse(token.is_valid())

    def test_str_representation(self):
        token = EmailVerificationToken.objects.create(
            user=self.user,
            token='strtest',
            token_type=EmailVerificationToken.TOKEN_TYPE_EMAIL_CHANGE,
            expires_at=timezone.now() + timedelta(hours=24),
        )
        self.assertIn('email_change', str(token))


class PasswordResetTokenTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='ruser', email='r@x.com', password='Pass123!@abc')

    def test_create_and_validate(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            token='reset1',
            expires_at=timezone.now() + timedelta(hours=1),
        )
        self.assertTrue(token.is_valid())

    def test_expired_reset_token(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            token='reset_exp',
            expires_at=timezone.now() - timedelta(hours=1),
        )
        self.assertFalse(token.is_valid())

    def test_mark_used(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            token='reset_used',
            expires_at=timezone.now() + timedelta(hours=1),
        )
        token.mark_used()
        self.assertFalse(token.is_valid())
