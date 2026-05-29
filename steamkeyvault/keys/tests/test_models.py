from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from steamkeyvault.games.models import UserGame
from steamkeyvault.keys.models import Key, ShareKeyToken

User = get_user_model()


class KeyModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='keyu', email='key@x.com', password='Pass123!@abc')
        self.game = UserGame.objects.create(user=self.user, name='Portal', steamapp_id=400)

    def test_create_key(self):
        key = Key.objects.create(key='ABC-DEF-GHI', userGame=self.game)
        self.assertEqual(key.key, 'ABC-DEF-GHI')
        self.assertFalse(key.used)
        self.assertIsNone(key.date_used)

    def test_mark_used_sets_date(self):
        key = Key.objects.create(key='KEY-001', userGame=self.game)
        key.used = True
        key.save()
        key.refresh_from_db()
        self.assertTrue(key.used)
        self.assertIsNotNone(key.date_used)

    def test_unmark_used_clears_date(self):
        key = Key.objects.create(key='KEY-002', userGame=self.game, used=True)
        key.refresh_from_db()
        key.used = False
        key.save()
        key.refresh_from_db()
        self.assertFalse(key.used)
        self.assertIsNone(key.date_used)

    def test_str_returns_key(self):
        key = Key.objects.create(key='XYZ-123', userGame=self.game)
        self.assertEqual(str(key), 'XYZ-123')

    def test_cascade_delete(self):
        key = Key.objects.create(key='DEL-KEY', userGame=self.game)
        key_id = key.id
        self.game.delete()
        self.assertFalse(Key.objects.filter(id=key_id).exists())


class ShareKeyTokenModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='sharer', email='share@x.com', password='Pass123!@abc')
        self.game = UserGame.objects.create(user=self.user, name='HL2', steamapp_id=220)
        self.key = Key.objects.create(key='SHARE-KEY', userGame=self.game)

    def test_create_share_token(self):
        token = ShareKeyToken.objects.create(
            key=self.key,
            token='tok123456',
            shared_key='SHARE-KEY',
            game_name='HL2',
            donor_username='sharer',
            expires_at=timezone.now() + timedelta(hours=24),
        )
        self.assertIn('tok12345', str(token))

    def test_token_unique(self):
        ShareKeyToken.objects.create(
            key=self.key,
            token='unique1',
            shared_key='K',
            game_name='G',
            donor_username='u',
            expires_at=timezone.now() + timedelta(hours=24),
        )
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            ShareKeyToken.objects.create(
                key=self.key,
                token='unique1',
                shared_key='K',
                game_name='G',
                donor_username='u',
                expires_at=timezone.now() + timedelta(hours=24),
            )
