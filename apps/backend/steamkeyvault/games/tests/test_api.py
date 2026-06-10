from django.test import TestCase, Client
from django.contrib.auth import get_user_model

from steamkeyvault.games.models import UserGame

User = get_user_model()


class GamesAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='apigamer', email='apigamer@x.com', password='Pass123!@abc',
            wrapped_mk_password='w', mk_salt='s', kdf_iterations=310000, kdf_hash='SHA-256',
        )
        self.client.force_login(self.user)

    def test_add_game(self):
        resp = self.client.post(
            '/api/games/add',
            data={'name': 'Portal 2', 'steamapp_id': 620},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertIn('id', resp.json())
        self.assertTrue(UserGame.objects.filter(user=self.user, steamapp_id=620).exists())

    def test_add_game_empty_name(self):
        resp = self.client.post(
            '/api/games/add',
            data={'name': '   '},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_add_duplicate_steamapp(self):
        UserGame.objects.create(user=self.user, name='HL2', steamapp_id=220)
        resp = self.client.post(
            '/api/games/add',
            data={'name': 'HL2 again', 'steamapp_id': 220},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_list_games(self):
        UserGame.objects.create(user=self.user, name='Game1', steamapp_id=100)
        UserGame.objects.create(user=self.user, name='Game2', steamapp_id=200)

        resp = self.client.get('/api/games/list')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 2)

    def test_list_games_only_own(self):
        other = User.objects.create_user(username='other', email='other@x.com', password='Pass123!@abc')
        UserGame.objects.create(user=other, name='OtherGame', steamapp_id=999)
        UserGame.objects.create(user=self.user, name='MyGame', steamapp_id=100)

        resp = self.client.get('/api/games/list')
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'MyGame')

    def test_remove_game(self):
        game = UserGame.objects.create(user=self.user, name='ToDelete', steamapp_id=111)
        resp = self.client.delete(f'/api/games/remove/{game.id}')
        self.assertIn(resp.status_code, [200, 204])
        self.assertFalse(UserGame.objects.filter(id=game.id).exists())

    def test_remove_other_users_game(self):
        other = User.objects.create_user(username='other2', email='o2@x.com', password='Pass123!@abc')
        game = UserGame.objects.create(user=other, name='NotMine', steamapp_id=222)
        resp = self.client.delete(f'/api/games/remove/{game.id}')
        self.assertIn(resp.status_code, [403, 404])

    def test_unauthenticated(self):
        self.client.logout()
        resp = self.client.get('/api/games/list')
        self.assertIn(resp.status_code, [401, 403])
