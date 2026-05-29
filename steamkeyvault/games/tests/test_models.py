from django.test import TestCase
from django.contrib.auth import get_user_model

from steamkeyvault.games.models import UserGame

User = get_user_model()


class UserGameModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='gamer', email='gamer@x.com', password='Pass123!@abc')

    def test_create_game(self):
        game = UserGame.objects.create(user=self.user, name='Half-Life 2', steamapp_id=220)
        self.assertEqual(game.name, 'Half-Life 2')
        self.assertEqual(game.steamapp_id, 220)
        self.assertEqual(game.platform, '')

    def test_create_custom_game_with_platform(self):
        game = UserGame.objects.create(user=self.user, name='My Game', platform='GOG')
        self.assertEqual(game.platform, 'GOG')
        self.assertIsNone(game.steamapp_id)

    def test_str_representation(self):
        game = UserGame.objects.create(user=self.user, name='Portal')
        self.assertIn('Portal', str(game))

    def test_unique_steamapp_per_user(self):
        UserGame.objects.create(user=self.user, name='HL2', steamapp_id=220)
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            UserGame.objects.create(user=self.user, name='HL2 dup', steamapp_id=220)

    def test_same_steamapp_different_users(self):
        user2 = User.objects.create_user(username='gamer2', email='g2@x.com', password='Pass123!@abc')
        UserGame.objects.create(user=self.user, name='HL2', steamapp_id=220)
        game2 = UserGame.objects.create(user=user2, name='HL2', steamapp_id=220)
        self.assertEqual(game2.steamapp_id, 220)

    def test_null_steamapp_not_unique(self):
        UserGame.objects.create(user=self.user, name='Custom 1')
        game2 = UserGame.objects.create(user=self.user, name='Custom 2')
        self.assertIsNotNone(game2.id)
