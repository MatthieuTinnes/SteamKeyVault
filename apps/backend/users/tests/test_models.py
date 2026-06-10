from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!@',
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertFalse(user.is_admin)
        self.assertFalse(user.email_verified)
        self.assertEqual(user.preferred_language, 'en')

    def test_email_is_unique(self):
        User.objects.create_user(username='user1', email='dup@example.com', password='Pass123!@abc')
        with self.assertRaises(Exception):
            User.objects.create_user(username='user2', email='dup@example.com', password='Pass123!@abc')

    def test_str_returns_email(self):
        user = User.objects.create_user(username='u', email='me@x.com', password='Pass123!@abc')
        self.assertEqual(str(user), 'me@x.com')

    def test_username_field_is_email(self):
        self.assertEqual(User.USERNAME_FIELD, 'email')

    def test_encryption_fields_default_null(self):
        user = User.objects.create_user(username='u2', email='u2@x.com', password='Pass123!@abc')
        self.assertIsNone(user.wrapped_mk_password)
        self.assertIsNone(user.wrapped_mk_recovery)
        self.assertIsNone(user.mk_salt)
        self.assertIsNone(user.rk_salt)

    def test_kdf_defaults(self):
        user = User.objects.create_user(username='u3', email='u3@x.com', password='Pass123!@abc')
        self.assertEqual(user.kdf_iterations, 310000)
        self.assertEqual(user.kdf_hash, 'SHA-256')

    def test_language_choices(self):
        user = User.objects.create_user(username='u4', email='u4@x.com', password='Pass123!@abc')
        user.preferred_language = 'fr'
        user.save()
        user.refresh_from_db()
        self.assertEqual(user.preferred_language, 'fr')
