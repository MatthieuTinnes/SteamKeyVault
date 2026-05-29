from django.test import TestCase, Client
from django.contrib.auth import get_user_model

from steamkeyvault.games.models import UserGame
from steamkeyvault.keys.models import Key

User = get_user_model()


class KeysAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='keyuser', email='keyuser@x.com', password='Pass123!@abc',
            wrapped_mk_password='w', mk_salt='s', kdf_iterations=310000, kdf_hash='SHA-256',
        )
        self.client.force_login(self.user)
        self.game = UserGame.objects.create(user=self.user, name='Portal', steamapp_id=400)

    def test_add_key(self):
        resp = self.client.post(
            '/api/keys/add',
            data={'key': 'ABC-DEF', 'user_game_id': self.game.id},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Key.objects.filter(userGame=self.game).exists())

    def test_add_key_with_current_use(self):
        resp = self.client.post(
            '/api/keys/add',
            data={'key': 'XYZ-123', 'user_game_id': self.game.id, 'current_use': 'TRADE'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        key = Key.objects.get(userGame=self.game)
        self.assertEqual(key.current_use, 'TRADE')

    def test_list_keys(self):
        Key.objects.create(key='K1', userGame=self.game)
        Key.objects.create(key='K2', userGame=self.game)

        resp = self.client.get(f'/api/keys/list/{self.game.id}')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 2)

    def test_list_keys_other_user(self):
        other = User.objects.create_user(username='other', email='other@x.com', password='Pass123!@abc')
        other_game = UserGame.objects.create(user=other, name='OtherGame', steamapp_id=999)
        Key.objects.create(key='SECRET', userGame=other_game)

        resp = self.client.get(f'/api/keys/list/{other_game.id}')
        self.assertIn(resp.status_code, [403, 404])

    def test_remove_key(self):
        key = Key.objects.create(key='DEL-KEY', userGame=self.game)
        resp = self.client.delete(f'/api/keys/{self.game.id}/remove/{key.id}')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Key.objects.filter(id=key.id).exists())

    def test_update_key(self):
        key = Key.objects.create(key='UPD-KEY', userGame=self.game)
        resp = self.client.patch(
            f'/api/keys/{self.game.id}/update/{key.id}',
            data={'used': True},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        key.refresh_from_db()
        self.assertTrue(key.used)

    def test_unauthenticated(self):
        self.client.logout()
        resp = self.client.get(f'/api/keys/list/{self.game.id}')
        self.assertIn(resp.status_code, [401, 403])
